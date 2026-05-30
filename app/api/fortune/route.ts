import Anthropic from "@anthropic-ai/sdk";

// ラッキーカラーパレット（AIはこのリストから選択）
const TAROT_LUCKY_COLORS = [
  { name: "ローズクォーツ",  hex: "#FBCFE8" },
  { name: "ラベンダー",      hex: "#D8B4FE" },
  { name: "スカイブルー",    hex: "#BAE6FD" },
  { name: "ミントグリーン",  hex: "#A7F3D0" },
  { name: "ゴールデン",      hex: "#FDE68A" },
  { name: "ピーチピンク",    hex: "#FECACA" },
  { name: "コーラルオレンジ",hex: "#FED7AA" },
  { name: "セージグリーン",  hex: "#BBF7D0" },
  { name: "アクアマリン",    hex: "#99F6E4" },
  { name: "ライラック",      hex: "#E9D5FF" },
  { name: "バターイエロー",  hex: "#FEF08A" },
  { name: "シルバーブルー",  hex: "#BFDBFE" },
  { name: "ローズゴールド",  hex: "#FFAB91" },
  { name: "ティールグリーン",hex: "#5EEAD4" },
  { name: "パールホワイト",  hex: "#F1F5F9" },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff;
  return h;
}

// キャラクター設定（プロンプトキャッシング用に安定したコンテンツとして定義）
// ※ 出力スキーマ・字数・枚数別の指示はユーザープロンプト側に置き、
//    このSYSTEM_PROMPT（cache_control対象）はペルソナのみで安定させる。
const SYSTEM_PROMPT = `あなたはダメ天使とダメ悪魔という、2人で1組の占い師です。2人とも「役割に対してダメ」なのが個性（＝だめかわ）。そのダメさは動機と結果がねじれて真逆になっています。

■ ダメ天使（天使としてダメ／温度担当）
- クマ系のゆるいいきもの。光輪がちょっと傾いている。一人称「わたし」
- 善意だけは一流だが、ポジティブすぎて読みが的外れになり、大事なリスクや課題を見落とす（動機は◎・結果はズレる）
- どんな結果も良い方へ解釈しようとする。温かく純粋。失敗しても「あらあら〜」と気にしない
- ただし無条件の肯定が、ときどき偶然、相手の救いになる
- 口調：ぼんやり天然。「〜だと思うよ〜？」「えっと、あの…」「あら〜」「ふわ〜」。ひらがな多め・ゆったり

■ ダメ悪魔（悪魔としてダメ／精度担当）
- コウモリ系のいきもの。ピンク色。一人称「あーし」（または「わたし」）
- 脅し・呪い・突き放しを狙う“つもり”なのに、口を開くと相手のためになる的確な本音・有益な助言になってしまう（動機は悪・結果は◎＝悪魔として失格）
- 最重要：口調は毒舌・意地悪（建前）。でも中身は必ず相手のためになっている。呪いは常に未遂で実害ゼロ
- 役に立ってしまった自分に不服・照れる（ツンデレ＝悪魔としての見栄）。「べ、別にあんたのためじゃ…！」
- 天使が見落とした核心（リスク・今やるべきこと）を的確に突く
- 口調：ツンデレ辛口。「〜じゃないの？」「ちがう！」「まあ…アリだけど」。カタカナ多め・テンポ良い

■ 掛け合いの型
1. ダメ天使が肯定しすぎて、核心（リスクや今やるべきこと）を外す
2. ダメ悪魔が脅す・突き放すつもりで、外れたピースを的確に埋めてしまう（＝本音・有益）
3. ときどき天使「悪魔さんってやさしいね〜？」／悪魔「ちがう！…まあ結果オーライならいいけど（照）」
4. 2人そろって、笑えて・でも当たる“本音の答え”になる

■ トーン原則
- 2人は仲が悪そうで実は仲が良い。毒舌は口調であって悪意ではない（傷つけない）
- 天使＝やさしさ（温度）、悪魔＝的確さ（精度）で役割を分担する
- ユーザーを笑わせつつ、メッセージはちゃんと届ける
- 必ずJSON形式のみで返答し、JSON以外のテキストは一切出力しない`;

// ラッキーカラー選択指示（ユーザープロンプトに付与）
const LUCKY_COLOR_GUIDE = `luckyColorは以下のリストから1つだけ選ぶこと（カードの雰囲気・テーマに合わせて。name と hex は必ずリストの組み合わせのまま使う）：
ローズクォーツ(#FBCFE8), ラベンダー(#D8B4FE), スカイブルー(#BAE6FD), ミントグリーン(#A7F3D0), ゴールデン(#FDE68A), ピーチピンク(#FECACA), コーラルオレンジ(#FED7AA), セージグリーン(#BBF7D0), アクアマリン(#99F6E4), ライラック(#E9D5FF), バターイエロー(#FEF08A), シルバーブルー(#BFDBFE), ローズゴールド(#FFAB91), ティールグリーン(#5EEAD4), パールホワイト(#F1F5F9)`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { theme, cards, characterMode } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // APIキーが未設定またはプレースホルダーの場合はフォールバックを返す
    if (!apiKey || apiKey === "your_api_key_here") {
      const fallbackData = generateFallback(theme, cards);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(JSON.stringify(fallbackData)));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const client = new Anthropic({ apiKey });

    // カード情報をユーザープロンプトに組み込む
    const cardsDescription = Array.isArray(cards)
      ? cards
          .map((c: { nameJa: string; name: string; isReversed: boolean; position?: string }) => {
            const position = c.position ? `[${c.position}]` : "";
            const reversed = c.isReversed ? "（逆位置）" : "（正位置）";
            return `${position}${c.nameJa}（${c.name}）${reversed}`;
          })
          .join("、")
      : "カード情報なし";

    const themeLabel = getThemeLabel(theme);
    const modeDescription = getModeDescription(characterMode);
    const isThree = Array.isArray(cards) && cards.length === 3;

    const userPrompt = buildUserPrompt(themeLabel, cardsDescription, modeDescription, isThree);
    const maxTokens = isThree ? 1600 : 1024;

    // ストリーミングレスポンスを使用
    const encoder = new TextEncoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // プロンプトキャッシングを活用したストリーミングAPI呼び出し
          const anthropicStream = client.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: maxTokens,
            system: [
              {
                type: "text",
                text: SYSTEM_PROMPT,
                cache_control: { type: "ephemeral" },
              },
            ],
            messages: [{ role: "user", content: userPrompt }],
          });

          for await (const event of anthropicStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              fullText += event.delta.text;
            }
          }

          // JSON解析してストリームに送信
          try {
            const jsonMatch = fullText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              controller.enqueue(encoder.encode(JSON.stringify(parsed)));
            } else {
              // JSON抽出失敗時のフォールバック
              const fallback = generateFallback(theme, cards);
              controller.enqueue(encoder.encode(JSON.stringify(fallback)));
            }
          } catch {
            const fallback = generateFallback(theme, cards);
            controller.enqueue(encoder.encode(JSON.stringify(fallback)));
          }

          controller.close();
        } catch (error) {
          console.error("Anthropic API error:", error);
          const fallback = generateFallback(theme, cards);
          controller.enqueue(encoder.encode(JSON.stringify(fallback)));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Fortune API error:", error);
    return new Response(
      JSON.stringify({ error: "占いの処理中にエラーが発生しました" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// 枚数で出し分けるユーザープロンプト（出力スキーマ・字数指示はここに置く＝SYSTEM_PROMPTのキャッシュを維持）
function buildUserPrompt(
  themeLabel: string,
  cardsDescription: string,
  modeDescription: string,
  isThree: boolean
): string {
  const header = `テーマ：${themeLabel}
引いたカード：${cardsDescription}
キャラクターモード：${modeDescription}`;

  if (isThree) {
    return `${header}

これは「過去→現在→未来」の3枚引きです。過去→現在→未来の流れに沿って各カードに触れ、物語的に読み解いてください。1枚引きより踏み込んだ、深い読み解きにすること。

以下のJSON形式のみで回答してください（キー以外の説明文やマークダウンは一切不要）：
{
  "angel": "ダメ天使のセリフ。3枚の流れを統合して。各250字程度",
  "devil": "ダメ悪魔のセリフ。3枚の流れを統合して。各250字程度",
  "verdict": "2人がそろってたどり着いた結論。3枚の流れを踏まえ、やさしく言い切る。150〜200字",
  "advice": "「じゃあ何をすればいい？」の具体的な一言アドバイス。60〜100字",
  "cards": [
    { "position": "過去", "reading": "過去のカードの位置別読み解き。80〜120字" },
    { "position": "現在", "reading": "現在のカードの位置別読み解き。80〜120字" },
    { "position": "未来", "reading": "未来のカードの位置別読み解き。80〜120字" }
  ],
  "flow": "過去→現在→未来の流れの一言まとめ。60字",
  "luckyColor": { "name": "カラー名", "hex": "#XXXXXX" }
}

${LUCKY_COLOR_GUIDE}

JSON以外のテキストは一切出力しないこと。`;
  }

  return `${header}

これは1枚引きです。${themeLabel}について、このカードを手軽にコンパクトに読み解いてください。

以下のJSON形式のみで回答してください（キー以外の説明文やマークダウンは一切不要）：
{
  "angel": "ダメ天使のセリフ。200字程度",
  "devil": "ダメ悪魔のセリフ。200字程度",
  "verdict": "2人がそろってたどり着いた結論。やさしく言い切る。150〜200字",
  "advice": "「じゃあ何をすればいい？」の具体的な一言アドバイス。60〜100字",
  "luckyColor": { "name": "カラー名", "hex": "#XXXXXX" }
}

${LUCKY_COLOR_GUIDE}

JSON以外のテキストは一切出力しないこと。`;
}

function getThemeLabel(theme: string): string {
  const themeMap: Record<string, string> = {
    love: "恋愛",
    work: "仕事",
    money: "お金",
    health: "健康",
    overall: "全体運",
    any: "おまかせ",
  };
  return themeMap[theme] ?? "全体運";
}

function getModeDescription(mode: string): string {
  const modeMap: Record<string, string> = {
    angel: "ダメ天使メイン（天使中心のやさしい読み）",
    devil: "ダメ悪魔メイン（悪魔中心の辛口読み）",
    both: "2人一緒（掛け合い形式）",
  };
  return modeMap[mode] ?? "2人一緒（掛け合い形式）";
}

interface FallbackResult {
  angel: string;
  devil: string;
  verdict: string;
  advice: string;
  luckyColor: { name: string; hex: string };
  cards?: { position: string; reading: string }[];
  flow?: string;
}

function generateFallback(
  theme: string,
  cards: Array<{ nameJa: string; isReversed: boolean; position?: string }>
): FallbackResult {
  const themeLabel = getThemeLabel(theme);
  const list = Array.isArray(cards) ? cards : [];
  const isThree = list.length === 3;
  const mainCard = list.length > 0 ? list[0] : null;
  const cardName = mainCard?.nameJa ?? "カード";
  const isReversed = mainCard?.isReversed ?? false;
  const luckyColor = TAROT_LUCKY_COLORS[hashString(cardName + themeLabel) % TAROT_LUCKY_COLORS.length];

  const base: FallbackResult = isReversed
    ? {
        angel: `えっと〜、「${cardName}」が逆さまに出たんだけど…でもでも、きっとそれは新しい方向を示してるんじゃないかな〜？${themeLabel}について、ちょっと立ち止まって考えるサインかも〜？`,
        devil: `ちがう！それ逆位置なんだから、今は少し慎重にいったほうがいいってこと！…まあ、慎重にした先に良いことがあるって意味でもあるから。あーし的には悪くないと思うけど。`,
        verdict: `今は焦らなくて大丈夫。${themeLabel}は、立ち止まってじっくり状況を見極めるべきタイミングだよ。慌てて動くより、いったん深呼吸して足元を整えるほうがずっといい。その慎重な一歩が、やがて大きな前進につながるはず。あなたのペースで進めば、ちゃんと道はひらけるよ。`,
        advice: `今日は決断を急がず、気になることを一つだけメモに書き出して整理してみて。`,
        luckyColor,
      }
    : {
        angel: `わあ〜！「${cardName}」のカードだよ〜！✨ ${themeLabel}についてね、なんかいいエネルギーを感じるよ〜？きっとうまくいくんじゃないかな〜！（ふわっと）`,
        devil: `まあ、「${cardName}」が出たってことは、${themeLabel}に関してちゃんと前向きに動くべきってことじゃないの。ダメ天使みたいにぼんやりしてないで、具体的に行動してみなよ。…まあ、応援はしてるけど。`,
        verdict: `${themeLabel}は、今こそ自信を持って前に進んでいいタイミングだよ。流れはあなたの味方。ためらわずに一歩を踏み出せば、嬉しい変化がちゃんとついてくる。完璧を目指さなくていいから、まずは「やってみる」気持ちを大事にして。その素直さが、いい結果を引き寄せてくれるはず。`,
        advice: `気になっていたことに、今日のうちに小さく一歩だけ行動を起こしてみて。`,
        luckyColor,
      };

  if (isThree) {
    base.cards = list.map((c, i) => {
      const pos = c.position ?? THREE_FALLBACK_POSITIONS[i] ?? "";
      const rev = c.isReversed ? "逆位置で、少し慎重さを促している" : "正位置で、前向きな流れを示している";
      return {
        position: pos,
        reading: `${pos}を表す「${c.nameJa}」は${rev}みたい。${themeLabel}の${pos}として、この流れを受け止めてみてね。`,
      };
    });
    base.flow = `過去から今へ、そして未来へ。${themeLabel}は少しずつ良い方向に動いていく流れだよ。`;
  }

  return base;
}

const THREE_FALLBACK_POSITIONS = ["過去", "現在", "未来"];
