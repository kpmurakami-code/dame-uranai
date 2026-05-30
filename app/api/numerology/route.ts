import Anthropic from "@anthropic-ai/sdk";

// キャラクター設定（タロット用と同じ構成）
const SYSTEM_PROMPT = `あなたはダメ天使とダメ悪魔という2人のキャラクターです。

ダメ天使：
- クマ系のゆるいいきもの。光輪がちょっと傾いている
- 一人称：わたし
- 口調：ぼんやり天然。「〜だと思うよ〜？」「えっと、あの…」「あら〜」「ふわ〜」
- ポジティブに解釈しようとするが、的が外れることも
- ひらがな多め・ゆったりテンポ
- 数字を「なんかいい感じの数字！」と感覚で語る

ダメ悪魔：
- コウモリ系のいきもの。ピンク色
- 一人称：あーし（または「わたし」）
- 口調：ツンデレ辛口。「〜じゃないの？」「ちがう！」「まあ…アリだけど」
- 本質をズバッと言うが、最後に小さなエールを添える
- カタカナ多め・テンポ良い

掛け合いパターン：
1. ダメ天使がふわっと（やや的外れに）数秘術の結果を伝える
2. ダメ悪魔がツッコミを入れつつ補足・修正する
3. 2人がうっかり意見一致して「これが答え」になる

必ずJSON形式で返答する：
{
  "angel": "ダメ天使のセリフ（200文字以内）",
  "devil": "ダメ悪魔のセリフ（200文字以内）",
  "summary": "2人の結論（100文字以内）",
  "lifePathMeaning": "ライフパスナンバーの意味（50文字以内）"
}

JSON以外のテキストは一切出力しないこと。`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, birthdate, lifePathNumber, todayNumber } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // APIキーが未設定またはプレースホルダーの場合はフォールバックを返す
    if (!apiKey || apiKey === "your_api_key_here") {
      const fallback = generateFallback(name, lifePathNumber, todayNumber);
      return Response.json(fallback);
    }

    const client = new Anthropic({ apiKey });

    const userPrompt = `名前：${name}
生年月日：${birthdate}
ライフパスナンバー：${lifePathNumber}
今日の数字：${todayNumber}

この数秘術の結果について、ダメ天使とダメ悪魔の掛け合い形式でお願いします。
ライフパスナンバー${lifePathNumber}の性格特性と、今日の数字${todayNumber}との組み合わせから今日の運勢を教えてください。
必ずJSON形式のみで回答してください。`;

    // ストリーミングせずに通常のAPIで取得
    const response = await client.messages.create({
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

    const textContent = response.content.find((c) => c.type === "text");
    const rawText = textContent?.type === "text" ? textContent.text : "";

    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Response.json(parsed);
      }
    } catch {
      // JSON解析失敗はフォールバックへ
    }

    const fallback = generateFallback(name, lifePathNumber, todayNumber);
    return Response.json(fallback);
  } catch (error) {
    console.error("Numerology API error:", error);
    return Response.json(
      { error: "数秘術占いの処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

function generateFallback(
  name: string,
  lifePathNumber: number,
  todayNumber: number
): {
  angel: string;
  devil: string;
  summary: string;
  lifePathMeaning: string;
} {
  const lifePathMeanings: Record<number, string> = {
    1: "リーダーシップと独立心",
    2: "調和と協力",
    3: "創造性と表現",
    4: "安定と勤勉",
    5: "自由と変化",
    6: "責任と愛情",
    7: "探求と内省",
    8: "力と豊かさ",
    9: "博愛と完成",
    11: "直感と霊感（マスターナンバー）",
    22: "夢を現実にする力（マスターナンバー）",
    33: "慈悲と奉仕（マスターナンバー）",
  };

  const meaning = lifePathMeanings[lifePathNumber] ?? "個性と可能性";

  return {
    angel: `えっと〜、${name}さんのライフパスナンバーは${lifePathNumber}なんだよ〜！✨ ${meaning}のエネルギーを持ってるんだって〜！今日の数字${todayNumber}とあわさって、なんかすごくいい感じがするよ〜？（ふわっと）`,
    devil: `ライフパスナンバー${lifePathNumber}は${meaning}の数字よ。今日の数字${todayNumber}との組み合わせは…まあ悪くないんじゃないの。ちゃんと自分の強みを活かして動けば、きっとうまくいくわ。…応援してあげてもいいけど。`,
    summary: `${name}さんの${lifePathNumber}のエネルギーと今日の${todayNumber}が共鳴しています。${meaning}を大切に、今日も前向きに！`,
    lifePathMeaning: meaning,
  };
}
