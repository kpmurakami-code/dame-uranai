export type TarotCard = {
  id: number;
  name: string;
  nameJa: string;
  filename: string;
  keywordUpright: string;
  keywordReversed: string;
};

export const tarotCards: TarotCard[] = [
  {
    id: 0,
    name: "THE FOOL",
    nameJa: "愚者",
    filename: "01_THE_FOOL.png",
    keywordUpright: "新しい始まり・自由・冒険",
    keywordReversed: "無謀・軽率・準備不足",
  },
  {
    id: 1,
    name: "THE MAGICIAN",
    nameJa: "魔術師",
    filename: "02_THE_MAGICIAN.png",
    keywordUpright: "意志力・スキル・集中",
    keywordReversed: "詐欺・能力の無駄遣い",
  },
  {
    id: 2,
    name: "THE HIGH PRIESTESS",
    nameJa: "女教皇",
    filename: "03_THE_HIGH_PRIESTESS.png",
    keywordUpright: "直感・神秘・内なる知恵",
    keywordReversed: "秘密・隠れた事実",
  },
  {
    id: 3,
    name: "THE EMPRESS",
    nameJa: "女帝",
    filename: "04_THE_EMPRESS.png",
    keywordUpright: "豊かさ・母性・創造",
    keywordReversed: "依存・停滞",
  },
  {
    id: 4,
    name: "THE EMPEROR",
    nameJa: "皇帝",
    filename: "05_THE_EMPEROR.png",
    keywordUpright: "権威・安定・リーダーシップ",
    keywordReversed: "独裁・硬直",
  },
  {
    id: 5,
    name: "THE HIEROPHANT",
    nameJa: "教皇",
    filename: "06_THE_HIEROPHANT.png",
    keywordUpright: "伝統・信仰・教え",
    keywordReversed: "因習・反抗",
  },
  {
    id: 6,
    name: "THE LOVERS",
    nameJa: "恋人",
    filename: "07_THE_LOVERS.png",
    keywordUpright: "愛・選択・調和",
    keywordReversed: "不和・優柔不断",
  },
  {
    id: 7,
    name: "THE CHARIOT",
    nameJa: "戦車",
    filename: "08_THE_CHARIOT.png",
    keywordUpright: "勝利・意志・前進",
    keywordReversed: "方向喪失・制御不能",
  },
  {
    id: 8,
    name: "STRENGTH",
    nameJa: "力",
    filename: "09_STRENGTH.png",
    keywordUpright: "勇気・忍耐・内なる強さ",
    keywordReversed: "自信不足・弱さ",
  },
  {
    id: 9,
    name: "THE HERMIT",
    nameJa: "隠者",
    filename: "10_THE_HERMIT.png",
    keywordUpright: "内省・孤独・探求",
    keywordReversed: "孤立・引きこもり",
  },
  {
    id: 10,
    name: "WHEEL OF FORTUNE",
    nameJa: "運命の輪",
    filename: "11_WHEEL_OF_FORTUNE.png",
    keywordUpright: "運命・転換・チャンス",
    keywordReversed: "不運・抵抗",
  },
  {
    id: 11,
    name: "JUSTICE",
    nameJa: "正義",
    filename: "12_JUSTICE.png",
    keywordUpright: "公正・真実・バランス",
    keywordReversed: "不公平・不誠実",
  },
  {
    id: 12,
    name: "THE HANGED MAN",
    nameJa: "吊られた男",
    filename: "13_THE_HANGED_MAN.png",
    keywordUpright: "犠牲・待機・新視点",
    keywordReversed: "無駄な犠牲・遅延",
  },
  {
    id: 13,
    name: "DEATH",
    nameJa: "死神",
    filename: "14_DEATH.png",
    keywordUpright: "変容・終わりと始まり",
    keywordReversed: "変化への抵抗",
  },
  {
    id: 14,
    name: "TEMPERANCE",
    nameJa: "節制",
    filename: "15_TEMPERANCE.png",
    keywordUpright: "調和・バランス・忍耐",
    keywordReversed: "過剰・不均衡",
  },
  {
    id: 15,
    name: "THE DEVIL",
    nameJa: "悪魔",
    filename: "16_THE_DEVIL.png",
    keywordUpright: "束縛・誘惑・物質主義",
    keywordReversed: "解放・自由への一歩",
  },
  {
    id: 16,
    name: "THE TOWER",
    nameJa: "塔",
    filename: "17_THE_TOWER.png",
    keywordUpright: "激変・崩壊・啓示",
    keywordReversed: "災難の回避・遅延",
  },
  {
    id: 17,
    name: "THE STAR",
    nameJa: "星",
    filename: "18_THE_STAR.png",
    keywordUpright: "希望・癒し・インスピレーション",
    keywordReversed: "失望・自信喪失",
  },
  {
    id: 18,
    name: "THE MOON",
    nameJa: "月",
    filename: "19_THE_MOON.png",
    keywordUpright: "幻想・不安・潜在意識",
    keywordReversed: "混乱の解消・明確化",
  },
  {
    id: 19,
    name: "THE SUN",
    nameJa: "太陽",
    filename: "20_THE_SUN.png",
    keywordUpright: "成功・喜び・活力",
    keywordReversed: "一時的な曇り・過信",
  },
  {
    id: 20,
    name: "JUDGEMENT",
    nameJa: "審判",
    filename: "21_JUDGEMENT.png",
    keywordUpright: "復活・覚醒・解放",
    keywordReversed: "自己批判・後悔",
  },
  {
    id: 21,
    name: "THE WORLD",
    nameJa: "世界",
    filename: "22_THE_WORLD.png",
    keywordUpright: "完成・達成・統合",
    keywordReversed: "未完成・停滞",
  },
];

export type ReadingResult = {
  card: TarotCard;
  isReversed: boolean;
  angelDialog: string;
  devilDialog: string;
};

export function drawRandomCard(): { card: TarotCard; isReversed: boolean } {
  const card = tarotCards[Math.floor(Math.random() * tarotCards.length)];
  const isReversed = Math.random() < 0.3;
  return { card, isReversed };
}

export function generateDummyReading(
  card: TarotCard,
  isReversed: boolean
): { angelDialog: string; devilDialog: string } {
  const keyword = isReversed ? card.keywordReversed : card.keywordUpright;

  if (isReversed) {
    return {
      angelDialog: `えっと〜、このカード「${card.nameJa}」が出たんだけど…逆向きでも、きっとなにかいいことのサインだよ〜？（自信なさげ）きっとね！「${keyword}」ってことで、うまくいくかもしれないよ〜！`,
      devilDialog: `ちがう！それ逆位置だから！「${keyword}」って意味なの！……でもまあ、それを乗り越えたら強くなれるってことだから。あーし的にはそんなに悪くないと思うけど。`,
    };
  }

  return {
    angelDialog: `わあ〜！「${card.nameJa}」のカードだよ〜！きれいなカード！✨ これはね、「${keyword}」ってエネルギーを表してるんだって。つまり…きっといいことがあるってことかな〜？（ふわっと）`,
    devilDialog: `まあ、「${card.nameJa}」が出たってことは「${keyword}」ってことじゃないの。素直に受け取れば？……ていうかダメ天使、カードの見た目で判断するのやめなって。ちゃんと意味があるんだから。`,
  };
}