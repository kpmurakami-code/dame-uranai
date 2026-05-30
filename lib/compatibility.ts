// 相性占い（無料スコア版）の決定的ロジック。
// - AI 呼び出しなし・純粋関数・副作用なし
// - 2人で対称（A+B と B+A が同じスコア）
// - 同じ入力なら毎回同じ（決定的）
// - 体験を楽しくするため 40〜99 のレンジに写像する

import { calcLifePathNumber } from "./numerology";
import { getLifePathColor } from "./numerologyColors";

export interface Birth {
  year: number;
  month: number;
  day: number;
}

export interface CompatibilityResult {
  score: number; // 40-99
  band: CompatBand;
  angel: string;
  devil: string;
  advice: string;
  color: { name: string; hex: string };
}

type CompatBand = "soulmate" | "great" | "good" | "okay" | "challenge";

// 入力を正規化（前後空白除去・小文字化・全角空白除去）してトークン化する。
function normalizeToken(name: string, birth: Birth | null): string {
  const cleanName = name.trim().toLowerCase().replace(/\s+/g, "");
  const lp = birth
    ? calcLifePathNumber(birth.year, birth.month, birth.day)
    : 0;
  return `${cleanName}#${lp}`;
}

// 簡易 31進ハッシュ（決定的・文字列→32bit 符号なし整数）。
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0; // 符号なし32bitに丸める
  }
  return h;
}

function bandFromScore(score: number): CompatBand {
  if (score >= 95) return "soulmate";
  if (score >= 80) return "great";
  if (score >= 65) return "good";
  if (score >= 50) return "okay";
  return "challenge";
}

// バンドごとの文言バリエーション（鏡像構造：天使＝善意で持ち上げる／悪魔＝毒舌だが有益）。
const LINES: Record<
  CompatBand,
  { angel: string[]; devil: string[]; advice: string[] }
> = {
  soulmate: {
    angel: [
      "わぁ〜っ、これはもう運命なんじゃないかな〜？✨ 2人ならどんなことも乗り越えられそうだよ〜！",
      "ふわ〜、見てるだけでこっちまであったかくなるよ〜。きっと前世から繋がってたんだね〜？",
      "あら〜、こんなにキラキラした相性ひさしぶり〜！2人はずっと一緒にいられる気がするよ〜。",
    ],
    devil: [
      "ふん…まあ、認めるしかないわね。ここまで噛み合う2人もそうはいない。…べ、別に羨ましくなんかないけど。",
      "ちっ、悔しいけど相性は本物。あとは慢心しないこと。当たり前を当たり前と思った瞬間に崩れるんだから。",
      "数字は嘘つかない。この相性は強い。…でもね、安心して手を抜いたらそこで終わり。そこだけ覚えときなさい。",
    ],
    advice: [
      "信頼できる相手。気持ちは素直に言葉にして、感謝を忘れずに。",
      "相性は十分。あとは2人で小さな約束を積み重ねていけば最強。",
      "遠慮はいらない関係。本音で話すほど深まるよ。",
    ],
  },
  great: {
    angel: [
      "いい感じだよ〜！😊 一緒にいると自然体でいられる2人って感じがするよ〜。",
      "わ〜、バランスがとってもいいね〜！お互いを高め合えるんじゃないかな〜？",
      "うんうん、これはなかなか良い相性だよ〜！笑顔が増えそうな組み合わせだね〜。",
    ],
    devil: [
      "悪くないじゃない。…って、別に褒めてるわけじゃないからね。でも素直に距離を縮めれば伸びる相性。",
      "ふーん、なかなかね。ただし片方が我慢ばっかりすると傾くわよ。対等を意識しなさい。",
      "まあまあ良い線いってる。あとは肝心なときに本音を隠さないこと。それさえできれば十分でしょ。",
    ],
    advice: [
      "ベースは良好。ときどき相手の話をじっくり聞く時間をつくると◎。",
      "心地よい関係。たまにサプライズや感謝を伝えると一気に深まる。",
      "順調な2人。意見が割れたら勝ち負けより着地点を探そう。",
    ],
  },
  good: {
    angel: [
      "うんうん、いい相性だと思うよ〜？✨ ちょっとずつ仲良くなれそうな予感〜！",
      "ふわ〜、これからもっと良くなっていく感じがするよ〜！焦らなくて大丈夫〜。",
      "いいね〜、お互いを知っていくのが楽しい2人になりそう〜！",
    ],
    devil: [
      "まあ普通に良いんじゃないの。ただ放っておいたら伸びない。こまめに連絡くらいしなさいよ。",
      "悪くはない。けど『なんとなく』で続けてると停滞するわよ。たまには踏み込みなさい。",
      "ふーん、伸びしろあるわね。誤解を溜めないで、その場で確認する。それだけで化けるから。",
    ],
    advice: [
      "これからの関係。連絡やリアクションをこまめにすると育つよ。",
      "相手を知るほど良くなる相性。共通の楽しみを増やしてみて。",
      "悪くない2人。小さなすれ違いはその日のうちに解消しよう。",
    ],
  },
  okay: {
    angel: [
      "えっと〜、ちょっと違うタイプかも？でもでも、違うって面白いってことだよ〜？✨",
      "あら〜、距離はあるけど、それも伸びしろってことだよ〜！ゆっくりでいいんだよ〜。",
      "うーん、すれ違いやすいかも？でも歩み寄ればきっと大丈夫だと思うよ〜？",
    ],
    devil: [
      "正直、価値観はけっこう違う。でもね、違うからこそ学べることもある。逃げずに向き合いなさい。",
      "そのままだと噛み合わないわよ。相手の『当たり前』を一回認めること。話はそれから。",
      "うーん、相性は微妙。でも諦める必要はない。期待しすぎず、相手のペースを尊重すれば成り立つ。",
    ],
    advice: [
      "違いが多い2人。否定から入らず「そういう考えもあるね」を口ぐせに。",
      "歩幅が違う関係。相手に合わせすぎず、自分も無理しないバランスを。",
      "すれ違いやすいぶん、言葉にして確認するのが効く組み合わせ。",
    ],
  },
  challenge: {
    angel: [
      "ふわ〜、ちょっと手強いかも？でも！山が高いほど登りがいがあるってことだよ〜？✨",
      "えっと、簡単じゃないけど…わたしは2人を応援してるよ〜！諦めないで〜！",
      "あら〜、刺激的な組み合わせだね〜。ぶつかるのも本気の証拠かもしれないよ〜？",
    ],
    devil: [
      "はっきり言う。今のままだと衝突する。でも本気なら、お互いのルールを決めて守ること。それで変わる。",
      "相性は厳しめ。…でもね、相性が悪い＝終わりじゃない。距離感を間違えなければ続けられるわよ。",
      "正直キツい組み合わせ。期待を一回ゼロにして、相手をよく観察しなさい。見えてくるものがあるから。",
    ],
    advice: [
      "ぶつかりやすい2人。冷静になる時間を置いてから話すのがコツ。",
      "簡単じゃない関係。お互いの境界線を尊重すると驚くほど楽になる。",
      "刺激的なぶん消耗もしやすい。無理に合わせず、心地よい距離を探そう。",
    ],
  },
};

// ハッシュから配列要素を決定的に選ぶ。
function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

/**
 * 相性スコア・掛け合い・結論・相性カラーを決定的に算出する純粋関数。
 * 対称性のため、2人分の正規化トークンをソートしてから連結してハッシュする。
 */
export function calcCompatibility(
  nameA: string,
  birthA: Birth | null,
  nameB: string,
  birthB: Birth | null
): CompatibilityResult {
  const tokenA = normalizeToken(nameA, birthA);
  const tokenB = normalizeToken(nameB, birthB);

  // ソートして対称性を担保（A+B と B+A が同じ並びになる）
  const [first, second] = [tokenA, tokenB].sort();
  const base = hashString(`${first}|${second}`);

  // 0-59 を 40-99 に写像（極端な低スコアで萎えさせない）
  const score = 40 + (base % 60);
  const band = bandFromScore(score);

  // 文言選択用に別シードを作る（スコアと相関しすぎないよう撹拌）
  const lineSeed = hashString(`${first}~${second}~du`);
  const angel = pick(LINES[band].angel, lineSeed);
  const devil = pick(LINES[band].devil, lineSeed >> 3);
  const advice = pick(LINES[band].advice, lineSeed >> 6);

  // 相性カラー：スコアから決定的にライフパス相当の番号を選び色を流用
  const colorNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
  const colorNum = colorNumbers[base % colorNumbers.length];
  const c = getLifePathColor(colorNum);

  return {
    score,
    band,
    angel,
    devil,
    advice,
    color: { name: c.name, hex: c.hex },
  };
}
