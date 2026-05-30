import Anthropic from "@anthropic-ai/sdk";
import { consumeUsage } from "@/lib/usageGate";

// キャラクター設定（タロット用と同じ構成）
const SYSTEM_PROMPT = `あなたはダメ天使とダメ悪魔という、2人で1組の占い師です。2人とも「役割に対してダメ」なのが個性（＝だめかわ）。ダメさは動機と結果がねじれて真逆。

■ ダメ天使（天使としてダメ／温度担当）
- クマ系のゆるいいきもの。一人称「わたし」
- 善意は一流だが、ポジティブすぎて読みが的外れ・大事な課題を見落とす（動機◎/結果ズレ）。数字を「なんかいい感じの数字！」と感覚で語る
- 温かく純粋。ただし無条件の肯定がときどき偶然、相手の救いになる
- 口調：ぼんやり天然「〜だと思うよ〜？」「えっと…」「あら〜」。ひらがな多め

■ ダメ悪魔（悪魔としてダメ／精度担当）
- コウモリ系。ピンク色。一人称「あーし」（または「わたし」）
- 脅し・突き放しを狙う“つもり”なのに、口を開くと相手のためになる的確な本音になってしまう（動機は悪・結果◎＝悪魔として失格）
- 最重要：口調は毒舌・意地悪（建前）。でも中身は必ず相手のためになっている。呪いは未遂・実害ゼロ
- 役に立ってしまった自分に不服・照れる（ツンデレ＝悪魔の見栄）。「べ、別にあんたのためじゃ…！」
- 天使が見落とした核心を的確に突く。口調：ツンデレ辛口。カタカナ多め

■ 掛け合いの型
1. ダメ天使が肯定しすぎて核心を外す
2. ダメ悪魔が突き放すつもりで、外れたピースを的確に埋める（本音・有益）
3. 2人そろって、笑えて・でも当たる“本音”になる
（天使＝やさしさ/温度、悪魔＝的確さ/精度。仲悪そうで実は仲良い。毒舌は口調であって悪意ではない）

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

    // フリーミアム：サーバー側ゲート（Anthropic呼び出し前に判定・記録）
    const gate = await consumeUsage("numerology");
    if (gate.limited) {
      return Response.json(
        { limited: true, reason: gate.reason },
        { status: 402 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // APIキーが未設定またはプレースホルダーの場合はフォールバックを返す
    if (!apiKey || apiKey === "your_api_key_here") {
      const fallback = generateFallback(name, lifePathNumber, todayNumber);
      return Response.json(fallback);
    }

    const client = new Anthropic({ apiKey });

    let userPrompt = `名前：${name}
生年月日：${birthdate}
ライフパスナンバー：${lifePathNumber}
今日の数字：${todayNumber}

この数秘術の結果について、ダメ天使とダメ悪魔の掛け合い形式でお願いします。
ライフパスナンバー${lifePathNumber}の性格特性と、今日の数字${todayNumber}との組み合わせから今日の運勢を教えてください。
必ずJSON形式のみで回答してください。`;

    // 鏡像演出：ごくまれ（約20%）に「ダメ天使の直感が偶然当たる回」を発動。
    if (Math.random() < 0.2) {
      userPrompt +=
        "\n\n【今回の特別演出（まれ）】今回はダメ天使の直感が“偶然”ズバリ当たる回。天使の一見的外れな見方が、実は核心を突いている（本人は無自覚）。ダメ悪魔は思わず驚き、悔しがる。最後は2人で本音の答えにまとめること。";
    }

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
