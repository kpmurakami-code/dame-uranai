// 数秘術の共通ロジック（SujimeiClient のローカル実装と同じ計算）。
// 各桁を足して1桁にする。ただしマスターナンバー 11 / 22 / 33 は保持する。

function calcDigitSum(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  const sum = String(n)
    .split("")
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
  return calcDigitSum(sum);
}

/**
 * 生年月日からライフパスナンバーを算出する。
 * 例：1990-12-25 → "19901225" の各桁の和 → 1桁（または 11/22/33）
 */
export function calcLifePathNumber(
  year: number,
  month: number,
  day: number
): number {
  const digits = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
  const total = digits.split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  return calcDigitSum(total);
}
