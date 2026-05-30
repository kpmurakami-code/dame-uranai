export const LIFE_PATH_COLORS: Record<number, { name: string; hex: string; keyword: string }> = {
  1:  { name: "コーラルレッド",      hex: "#FF8A80", keyword: "情熱と独創性" },
  2:  { name: "ピーチ",              hex: "#FFCCBC", keyword: "調和と優しさ" },
  3:  { name: "サンシャインイエロー", hex: "#FFF176", keyword: "創造性と喜び" },
  4:  { name: "ミントグリーン",      hex: "#A5D6A7", keyword: "安定と誠実さ" },
  5:  { name: "スカイブルー",        hex: "#81D4FA", keyword: "自由と冒険" },
  6:  { name: "ラベンダー",          hex: "#CE93D8", keyword: "愛情と責任" },
  7:  { name: "ディープバイオレット", hex: "#9575CD", keyword: "神秘と洞察" },
  8:  { name: "ゴールデン",          hex: "#FFCA28", keyword: "豊かさと実力" },
  9:  { name: "ローズピンク",        hex: "#F48FB1", keyword: "博愛と知恵" },
  11: { name: "シルバーホワイト",    hex: "#E8EAF6", keyword: "直感と霊感" },
  22: { name: "ティールグリーン",    hex: "#4DB6AC", keyword: "夢を現実に" },
  33: { name: "ローズゴールド",      hex: "#FFAB91", keyword: "慈悲と奉仕" },
};

export function getLifePathColor(n: number) {
  return LIFE_PATH_COLORS[n] ?? { name: "パールホワイト", hex: "#F1F5F9", keyword: "個性と可能性" };
}
