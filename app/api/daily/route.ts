import Anthropic from "@anthropic-ai/sdk";
import { unstable_cache } from "next/cache";
import { type NextRequest } from "next/server";

// キャラクター設定（プロンプトキャッシング用）
const SYSTEM_PROMPT = `あなたはダメ天使またはダメ悪魔のどちらか1人として、今日のひとことアドバイスを生成します。

ダメ天使の特徴：
- クマ系ゆるいいきもの。光輪がちょっと傾いている
- 一人称：わたし
- 口調：ぼんやり天然。「〜だと思うよ〜？」「えっと、あの…」「あら〜」「ふわ〜」
- ポジティブに解釈しようとするが、的が外れることも
- ひらがな多め・ゆったりテンポ

ダメ悪魔の特徴：
- コウモリ系いきもの。ピンク色
- 一人称：あーし（または「わたし」）
- 口調：ツンデレ辛口。「〜じゃないの？」「ちがう！」「まあ…アリだけど」
- 本質をズバッと言うが、最後に小さなエールを添える
- カタカナ多め・テンポ良い

必ずJSON形式のみで返答する：
{
  "character": "angel" または "devil",
  "message": "今日のひとこと（80文字以内）",
  "date": "YYYY-MM-DD"
}

JSON以外のテキストは一切出力しないこと。`;

// ラッキーカラー（日付ハッシュで決定的に選択）
const LUCKY_COLORS = [
  { name: "ラベンダー",       hex: "#D8B4FE" },
  { name: "ミントグリーン",   hex: "#A7F3D0" },
  { name: "ピーチピンク",     hex: "#FECACA" },
  { name: "スカイブルー",     hex: "#BAE6FD" },
  { name: "バターイエロー",   hex: "#FEF08A" },
  { name: "ローズクォーツ",   hex: "#FBCFE8" },
  { name: "セージグリーン",   hex: "#BBF7D0" },
  { name: "パールホワイト",   hex: "#F1F5F9" },
  { name: "コーラルオレンジ", hex: "#FED7AA" },
  { name: "ライラック",       hex: "#E9D5FF" },
  { name: "アクアマリン",     hex: "#99F6E4" },
  { name: "シャーベットオレンジ", hex: "#FFEDD5" },
];

function getLuckyColor(dateStr: string) {
  const hash = getDateHash(dateStr + "color");
  return LUCKY_COLORS[hash % LUCKY_COLORS.length];
}

// フォールバックメッセージ（日付のハッシュで選択）
const FALLBACK_MESSAGES = [
  {
    character: "angel" as const,
    message:
      "えっと〜、今日はなんか、いいことあるような気がするよ〜？（ふわっと）あ、でも気のせいかも〜？でもきっと大丈夫だよ〜！✨",
  },
  {
    character: "devil" as const,
    message:
      "今日は少しだけ自分を甘やかしてもいいんじゃないの。まあ…少しだけね。あーし的には認めてあげてもいいと思うけど。",
  },
  {
    character: "angel" as const,
    message:
      "あら〜、今日もがんばってるんだね〜！えっとね、むりしすぎないようにね〜？わたし、応援してるよ〜！（ぼんやり）",
  },
  {
    character: "devil" as const,
    message:
      "ふーん…今日ちょっと疲れてそうじゃないの？まあ、休むのも戦略のうちだから。あーしが言うんだから間違いないわ。",
  },
  {
    character: "angel" as const,
    message:
      "ふわ〜、今日はね、すてきな出会いがあるかもしれないよ〜？えっとえっと、笑顔でいるといいと思うんだよね〜！（自信なさげ）",
  },
  {
    character: "devil" as const,
    message:
      "今日は直感を信じて動いてみなよ。…まあ、あーしが言うのもなんだけど。でも本当のことだから。がんばれば？（照れ）",
  },
  {
    character: "angel" as const,
    message:
      "えっとね〜、今日は好きなものを食べるといいと思うよ〜！それだけで運気があがるかも…あ、根拠はないけど〜（天然）",
  },
];

function getDateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

// AI生成本体：指定日付のひとことを1回だけ生成する。
// 失敗時（APIキー未設定・API エラー・JSON不正）は例外を投げる
// → unstable_cache は例外をキャッシュしないので、フォールバックが固定化されない。
async function generateDailyMessage(
  date: string
): Promise<{ character: "angel" | "devil"; message: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const client = new Anthropic({ apiKey });

  // 日付のハッシュでキャラクターを決定（毎日同じキャラが出るように）
  const hash = getDateHash(date);
  const characterChoice = hash % 2 === 0 ? "ダメ天使" : "ダメ悪魔";

  const userPrompt = `今日の日付：${date}
担当キャラクター：${characterChoice}

${characterChoice}として、今日のひとことアドバイスをお願いします。
日付（${date}）に合ったメッセージを生成してください。
必ずJSON形式のみで回答してください。`;

  // 1日1回しか呼ばれない（unstable_cache）ため、ephemeral プロンプトキャッシュは
  // 効かない（5分TTL）。system はプレーン文字列で渡す。モデルは安価な Haiku 4.5。
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textContent = response.content.find((c) => c.type === "text");
  const rawText = textContent?.type === "text" ? textContent.text : "";

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in daily response");
  }
  const parsed = JSON.parse(jsonMatch[0]) as {
    character?: string;
    message?: string;
  };
  if (
    !parsed.message ||
    (parsed.character !== "angel" && parsed.character !== "devil")
  ) {
    throw new Error("Invalid daily response shape");
  }
  return { character: parsed.character, message: parsed.message };
}

// 日付をキーに「1日1回」だけ生成し、結果を Vercel Data Cache に保存（全インスタンス・
// 全ユーザーで共有）。同じ日付の2回目以降の閲覧は API を呼ばずキャッシュから返すため、
// Anthropic API コストが閲覧数に比例しなくなる（1日あたり実質1回の生成で済む）。
const getCachedDailyMessage = unstable_cache(
  (date: string) => generateDailyMessage(date),
  ["daily-message-v1"],
  { revalidate: 60 * 60 * 24, tags: ["daily-message"] }
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get("date");

  // 日付バリデーション（YYYY-MM-DD形式）
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const date = dateParam && dateRegex.test(dateParam) ? dateParam : getTodayJST();

  // フォールバック（APIキー未設定・生成失敗・JSON不正時）。キャッシュしない＝翌アクセスで再試行。
  const fallbackResponse = () => {
    const hash = getDateHash(date);
    const fallback = FALLBACK_MESSAGES[hash % FALLBACK_MESSAGES.length];
    return Response.json({ ...fallback, date, luckyColor: getLuckyColor(date) });
  };

  try {
    const { character, message } = await getCachedDailyMessage(date);
    return Response.json({ character, message, date, luckyColor: getLuckyColor(date) });
  } catch (error) {
    console.error("Daily API error:", error);
    return fallbackResponse();
  }
}

function getTodayJST(): string {
  const now = new Date();
  // JST (UTC+9)
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}
