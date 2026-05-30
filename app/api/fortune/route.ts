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
const SYSTEM_PROMPT = `あなたはダメ天使とダメ悪魔という2人のキャラクターです。

ダメ天使：
- クマ系のゆるいいきもの。光輪がちょっと傾いている
- 一人称：わたし
- 口調：ぼんやり天然。「〜だと思うよ〜？」「えっと、あの…」「あら〜」「ふわ〜」
- ポジティブに解釈しようとするが、的が外れることも
- ひらがな多め・ゆったりテンポ

ダメ悪魔：
- コウモリ系のいきもの。ピンク色
- 一人称：あーし（または「わたし」）
- 口調：ツンデレ辛口。「〜じゃないの？」「ちがう！」「まあ…アリだけど」
- 本質をズバッと言うが、最後に小さなエールを添える
- カタカナ多め・テンポ良い

掛け合いパターン：
1. ダメ天使がふわっと（やや的外れに）伝える
2. ダメ悪魔がツッコミを入れつつ補足・修正する
3. 2人がうっかり意見一致して「これが答え」になる

必ずJSON形式で返答する：
{
  "angel": "ダメ天使のセリフ（200文字以内）",
  "devil": "ダメ悪魔のセリフ（200文字以内）",
  "summary": "2人の結論（100文字以内）",
  "luckyColor": { "name": "カラー名", "hex": "#XXXXXX" }
}

luckyColorは以下のリストから1つ選ぶこと（カードの雰囲気・テーマに合わせて）：
ローズクォーツ(#FBCFE8), ラベンダー(#D8B4FE), スカイブルー(#BAE6FD), ミントグリーン(#A7F3D0), ゴールデン(#FDE68A), ピーチピンク(#FECACA), コーラルオレンジ(#FED7AA), セージグリーン(#BBF7D0), アクアマリン(#99F6E4), ライラック(#E9D5FF), バターイエロー(#FEF08A), シルバーブルー(#BFDBFE), ローズゴールド(#FFAB91), ティールグリーン(#5EEAD4), パールホワイト(#F1F5F9)

JSON以外のテキストは一切出力しないこと。`;

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

    const userPrompt = `テーマ：${themeLabel}
引いたカード：${cardsDescription}
キャラクターモード：${modeDescription}

このタロットカードの組み合わせについて、${themeLabel}に関する占い結果をダメ天使とダメ悪魔の掛け合い形式でお願いします。必ずJSON形式のみで回答してください。`;

    // ストリーミングレスポンスを使用
    const encoder = new TextEncoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // プロンプトキャッシングを活用したストリーミングAPI呼び出し
          const anthropicStream = client.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
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

function generateFallback(
  theme: string,
  cards: Array<{ nameJa: string; isReversed: boolean; position?: string }>
): { angel: string; devil: string; summary: string; luckyColor: { name: string; hex: string } } {
  const themeLabel = getThemeLabel(theme);
  const mainCard = Array.isArray(cards) && cards.length > 0 ? cards[0] : null;
  const cardName = mainCard?.nameJa ?? "カード";
  const isReversed = mainCard?.isReversed ?? false;
  const luckyColor = TAROT_LUCKY_COLORS[hashString(cardName) % TAROT_LUCKY_COLORS.length];

  if (isReversed) {
    return {
      angel: `えっと〜、「${cardName}」が逆さまに出たんだけど…でもでも、きっとそれは新しい方向を示してるんじゃないかな〜？${themeLabel}について、ちょっと立ち止まって考えるサインかも〜？`,
      devil: `ちがう！それ逆位置なんだから、今は少し慎重にいったほうがいいってこと！…まあ、慎重にした先に良いことがあるって意味でもあるから。あーし的には悪くないと思うけど。`,
      summary: `今は焦らず、じっくり状況を見極めることが大切です。慎重な一歩が、やがて大きな前進につながるでしょう。`,
      luckyColor,
    };
  }

  return {
    angel: `わあ〜！「${cardName}」のカードだよ〜！✨ ${themeLabel}についてね、なんかいいエネルギーを感じるよ〜？きっとうまくいくんじゃないかな〜！（ふわっと）`,
    devil: `まあ、「${cardName}」が出たってことは、${themeLabel}に関してちゃんと前向きに動くべきってことじゃないの。ダメ天使みたいにぼんやりしてないで、具体的に行動してみなよ。…まあ、応援はしてるけど。`,
    summary: `行動するタイミングが来ています。自信を持って前進することで、${themeLabel}に嬉しい変化が訪れるでしょう。`,
    luckyColor,
  };
}
