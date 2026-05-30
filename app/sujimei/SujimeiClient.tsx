"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { checkFreemiumLimit } from "@/lib/freemium";
import { saveFortune } from "@/lib/saveFortune";
import { getLifePathColor } from "@/lib/numerologyColors";
import PaywallModal from "@/components/PaywallModal";
import Header from "@/components/Header";
import ShareButtons from "@/components/ShareButtons";
import { analytics } from "@/lib/analytics";

interface NumerologyResult {
  angel: string;
  devil: string;
  summary: string;
  lifePathMeaning: string;
}


// 数秘術計算：各桁を足して1桁（または11/22/33）にする
function calcDigitSum(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  const sum = String(n)
    .split("")
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
  return calcDigitSum(sum);
}

function calcLifePathNumber(year: number, month: number, day: number): number {
  const digits = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
  const total = digits.split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  return calcDigitSum(total);
}

function calcTodayNumber(dateStr: string): number {
  // YYYY-MM-DD → 各桁の和
  const digits = dateStr.replace(/-/g, "");
  const total = digits.split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  return calcDigitSum(total);
}

function getTodayJST(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const STORAGE_KEY = "sujimei_user_data";

interface StoredData {
  name: string;
  year: string;
  month: string;
  day: string;
}

export default function SujimeiClient() {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [lifePathNumber, setLifePathNumber] = useState<number | null>(null);
  const [todayNumber, setTodayNumber] = useState<number | null>(null);
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [remainingCount, setRemainingCount] = useState<number | null>(null);

  // localStorageから復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: StoredData = JSON.parse(raw);
        if (stored.name) setName(stored.name);
        if (stored.year) setYear(stored.year);
        if (stored.month) setMonth(stored.month);
        if (stored.day) setDay(stored.day);
      }
    } catch {
      // 無視
    }
  }, []);

  // 残り回数を初期表示
  useEffect(() => {
    checkFreemiumLimit().then(({ remaining, isLoggedIn: loggedIn }) => {
      setRemainingCount(remaining);
      setIsLoggedIn(loggedIn);
    });
  }, []);


  const handleFortune = useCallback(async () => {
    if (!name || !year || !month || !day) return;

    // フリーミアム制限チェック
    const { limited, isLoggedIn: loggedIn } = await checkFreemiumLimit();
    setIsLoggedIn(loggedIn);
    if (limited) {
      setShowPaywall(true);
      return;
    }

    analytics.numerologyStart();

    const lpn = calcLifePathNumber(
      parseInt(year, 10),
      parseInt(month, 10),
      parseInt(day, 10)
    );
    const today = getTodayJST();
    const tn = calcTodayNumber(today);

    setLifePathNumber(lpn);
    setTodayNumber(tn);
    setIsLoading(true);
    setHasError(false);
    setResult(null);

    // localStorageに保存
    try {
      const stored: StoredData = { name, year, month, day };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // 無視
    }

    // 使用回数の記録・残回数更新はサーバー権威（成功後に更新）

    try {
      const response = await fetch("/api/numerology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          birthdate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          lifePathNumber: lpn,
          todayNumber: tn,
        }),
      });

      // フリーミアム制限（サーバー権威）：結果を出さずペイウォール
      if (response.status === 402) {
        setShowPaywall(true);
        setLifePathNumber(null);
        setTodayNumber(null);
        return;
      }

      if (!response.ok) throw new Error("API error");

      const data: NumerologyResult = await response.json();
      setResult(data);
      analytics.numerologyComplete();
      // 残り回数をサーバーから再取得して更新
      checkFreemiumLimit().then(({ remaining }) => setRemainingCount(remaining));
      // 履歴保存（ログイン済みのみ）
      const lpnColor = getLifePathColor(lpn);
      saveFortune({
        fortune_type: "numerology",
        angel_text: data.angel,
        devil_text: data.devil,
        summary_text: data.summary,
        life_path_number: lpn,
        life_path_meaning: data.lifePathMeaning,
        lucky_color_name: lpnColor.name,
        lucky_color_hex: lpnColor.hex,
      }).catch(console.error);
    } catch (error) {
      console.error("Numerology error:", error);
      setHasError(true);
      analytics.numerologyError();
      const fallback: NumerologyResult = {
        angel: `えっと〜、${name}さんのライフパスナンバーは${lpn}なんだよ〜！✨ なんかいいエネルギーを感じるよ〜？今日もきっとうまくいくんじゃないかな〜！（ふわっと）`,
        devil: `ライフパスナンバー${lpn}ね。まあ今日の数字${tn}との組み合わせは…悪くないんじゃないの。ちゃんと行動すれば、あーし的には問題ないと思うけど。`,
        summary: `${name}さんの数字のエネルギーが今日も輝いています。自分らしく前向きに！`,
        lifePathMeaning: "個性と可能性",
      };
      setResult(fallback);
      // フォールバックでも履歴保存
      const lpnColorFallback = getLifePathColor(lpn);
      saveFortune({
        fortune_type: "numerology",
        angel_text: fallback.angel,
        devil_text: fallback.devil,
        summary_text: fallback.summary,
        life_path_number: lpn,
        life_path_meaning: fallback.lifePathMeaning,
        lucky_color_name: lpnColorFallback.name,
        lucky_color_hex: lpnColorFallback.hex,
      }).catch(console.error);
    } finally {
      setIsLoading(false);
    }
  }, [name, year, month, day]);

  const handleReset = () => {
    setLifePathNumber(null);
    setTodayNumber(null);
    setResult(null);
    setHasError(false);
    setIsLoading(false);
  };

  const isFormValid = name.trim() !== "" && year !== "" && month !== "" && day !== "";
  const showResult = lifePathNumber !== null && !isLoading && result !== null;

  // X シェア用テキスト
  const tweetText = result
    ? `【数秘術占い】ライフパスナンバー${lifePathNumber}｜${result.summary.slice(0, 40)}… #ダメ占い`
    : "";

  // マイカラー（result があるとき）
  const myColor = lifePathNumber !== null ? getLifePathColor(lifePathNumber) : null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #fff0f5 0%, #f0f8ff 50%, #fff9e6 100%)",
      }}
    >
      {/* ペイウォールモーダル */}
      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          isLoggedIn={isLoggedIn}
          source="numerology"
        />
      )}

      {/* ヘッダー */}
      <Header />
      <div
        className="w-full py-3 px-6 flex items-center justify-between"
        style={{ borderBottom: "1px solid #fce4ec" }}
      >
        <Link
          href="/"
          className="text-sm font-medium flex items-center gap-1"
          style={{ color: "#c2185b" }}
        >
          ← もどる
        </Link>
        <h1 className="text-base font-bold" style={{ color: "#3d2c2c" }}>
          🔢 数秘術占い
        </h1>
        <div className="text-xs" style={{ color: "#b08090" }}>
          {remainingCount !== null && remainingCount < 9999 && (
            <span>残り{remainingCount}回</span>
          )}
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center px-6 py-8">
        {/* 入力フォーム */}
        {!isLoading && !showResult && (
          <div className="w-full max-w-md">
            {/* イラスト */}
            <div className="text-center mb-6">
              <div
                className="relative w-40 h-40 mx-auto mb-4"
              >
                <Image
                  src="/images/characters/28_ANGEL_DEVIL_TEA.png"
                  alt="ダメ天使とダメ悪魔"
                  fill
                  sizes="200px"
                  className="object-contain float-animation"
                  priority
                />
              </div>
              <div
                className="rounded-2xl p-3 mb-2 text-sm"
                style={{ background: "#fce4ec", color: "#c2185b" }}
              >
                えっと〜、生年月日と名前を教えてね〜？✨
              </div>
              <div
                className="rounded-2xl p-3 text-sm"
                style={{ background: "#e8d5ff", color: "#6a1b9a" }}
              >
                数字は嘘をつかないから。さっさと入力して。
              </div>
            </div>

            {/* 名前入力 */}
            <div className="mb-5">
              <label
                className="block text-sm font-bold mb-2"
                style={{ color: "#3d2c2c" }}
              >
                お名前（ひらがな・漢字）
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：山田はな"
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                style={{
                  border: "2px solid #fce4ec",
                  background: "#ffffff",
                  color: "#3d2c2c",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#ff6b9d";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#fce4ec";
                }}
              />
            </div>

            {/* 生年月日セレクト */}
            <div className="mb-8">
              <label
                className="block text-sm font-bold mb-2"
                style={{ color: "#3d2c2c" }}
              >
                生年月日
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* 年 */}
                <div>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-2xl px-3 py-3 text-sm outline-none appearance-none text-center"
                    style={{
                      border: "2px solid #fce4ec",
                      background: "#ffffff",
                      color: year ? "#3d2c2c" : "#b08090",
                    }}
                  >
                    <option value="">年</option>
                    {YEARS.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}年
                      </option>
                    ))}
                  </select>
                </div>
                {/* 月 */}
                <div>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full rounded-2xl px-3 py-3 text-sm outline-none appearance-none text-center"
                    style={{
                      border: "2px solid #fce4ec",
                      background: "#ffffff",
                      color: month ? "#3d2c2c" : "#b08090",
                    }}
                  >
                    <option value="">月</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={String(m)}>
                        {m}月
                      </option>
                    ))}
                  </select>
                </div>
                {/* 日 */}
                <div>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full rounded-2xl px-3 py-3 text-sm outline-none appearance-none text-center"
                    style={{
                      border: "2px solid #fce4ec",
                      background: "#ffffff",
                      color: day ? "#3d2c2c" : "#b08090",
                    }}
                  >
                    <option value="">日</option>
                    {DAYS.map((d) => (
                      <option key={d} value={String(d)}>
                        {d}日
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleFortune}
              disabled={!isFormValid}
              className="w-full py-4 px-8 rounded-full text-white text-lg font-bold text-center shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:scale-105 active:scale-95"
              style={{
                background: isFormValid
                  ? "linear-gradient(135deg, #ff6b9d, #c64dd1)"
                  : "#ccc",
              }}
            >
              数秘術で占う！
            </button>
          </div>
        )}

        {/* 待機画面 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center flex-1 gap-8">
            <div className="flex items-end justify-center gap-4">
              <div className="relative w-28 h-28">
                <Image
                  src="/images/characters/24_ANGEL.png"
                  alt="ダメ天使"
                  fill
                  sizes="200px"
                  className="object-contain float-animation"
                />
              </div>
              <div className="relative w-20 h-20 mb-2">
                <Image
                  src="/images/characters/23_DAMEKAWA_TENKAI.png"
                  alt=""
                  fill
                  sizes="200px"
                  className="object-contain sway-animation"
                />
              </div>
              <div className="relative w-28 h-28">
                <Image
                  src="/images/characters/25_DEVIL.png"
                  alt="ダメ悪魔"
                  fill
                  sizes="200px"
                  className="object-contain float-animation-reverse"
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-base font-medium" style={{ color: "#3d2c2c" }}>
                数字を読み解いてるよ〜...
              </p>
              <p className="text-sm mt-1" style={{ color: "#7a6060" }}>
                えっと、{name}さんの数字は…（ふわふわ）
              </p>
            </div>
          </div>
        )}

        {/* 結果表示 */}
        {showResult && (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <div
                className="inline-block px-4 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: "#fce4ec", color: "#c2185b" }}
              >
                {name}さんの数秘術結果
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#3d2c2c" }}>
                数字が語りかけてるよ〜！
              </h2>
            </div>

            {/* ===== シェア用カード（html2canvas 用・画面外に配置） ===== */}
            <div
              id="share-card"
              className="rounded-3xl p-5 shadow-lg"
              style={{
                background: myColor
                  ? `linear-gradient(145deg, ${myColor.hex}44, ${myColor.hex}88)`
                  : "linear-gradient(145deg, #fff9f0, #fce4ec)",
                position: "absolute",
                left: "-9999px",
                top: 0,
                width: "360px",
                border: myColor ? `2px solid ${myColor.hex}` : "2px solid #fce4ec",
              }}
            >
              {/* サービス名 */}
              <div className="text-center mb-3">
                <span className="text-xs font-bold tracking-widest" style={{ color: "#ffb7c5" }}>
                  ✦ ダメ占い ✦
                </span>
                <div
                  className="inline-block ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: "#fce4ec", color: "#c2185b" }}
                >
                  数秘術占い
                </div>
              </div>

              {/* ライフパスナンバー */}
              <div className="text-center mb-3">
                <p className="text-xs font-bold mb-1" style={{ color: "#b08090" }}>
                  ✦ ライフパスナンバー ✦
                </p>
                <div className="text-5xl font-bold" style={{ color: "#e91e8c" }}>
                  {lifePathNumber}
                </div>
                {result?.lifePathMeaning && (
                  <div
                    className="inline-block px-3 py-0.5 rounded-full text-xs mt-1"
                    style={{ background: "rgba(255,255,255,0.6)", color: "#e91e8c" }}
                  >
                    {result.lifePathMeaning}
                  </div>
                )}
              </div>

              {/* マイカラー（シェアカード内） */}
              {myColor && (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                    style={{ background: myColor.hex }}
                  />
                  <div>
                    <p className="text-xs font-bold" style={{ color: "#3d2c2c" }}>{myColor.name}</p>
                    <p className="text-xs" style={{ color: "#7a6060" }}>{myColor.keyword}</p>
                  </div>
                </div>
              )}

              {/* セリフ（シェアカード内） */}
              {result && !isLoading && (
                <>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image src="/images/characters/24_ANGEL.png" alt="ダメ天使" fill className="object-contain" />
                    </div>
                    <div
                      className="flex-1 rounded-2xl rounded-tl-sm px-3 py-2 text-xs leading-relaxed"
                      style={{ background: "#fce4ec", color: "#3d2c2c" }}
                    >
                      {result.angel.length > 60 ? result.angel.slice(0, 60) + "…" : result.angel}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 flex-row-reverse mb-2">
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image src="/images/characters/25_DEVIL.png" alt="ダメ悪魔" fill className="object-contain" />
                    </div>
                    <div
                      className="flex-1 rounded-2xl rounded-tr-sm px-3 py-2 text-xs leading-relaxed"
                      style={{ background: "#e8d5ff", color: "#3d2c2c" }}
                    >
                      {result.devil.length > 60 ? result.devil.slice(0, 60) + "…" : result.devil}
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ background: "rgba(255,255,255,0.6)" }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: "#3d2c2c" }}>
                      {result.summary}
                    </p>
                  </div>
                </>
              )}
            </div>
            {/* ===== /シェア用カード ===== */}

            {/* ライフパスナンバー全体表示（シェアカード外） */}
            <div
              className="rounded-3xl p-6 mb-4 text-center shadow-lg"
              style={{
                background: "linear-gradient(145deg, #fff9f0, #fce4ec)",
              }}
            >
              <p className="text-xs font-bold mb-3" style={{ color: "#b08090" }}>
                ✦ ライフパスナンバー ✦
              </p>
              <div
                className="text-6xl font-bold mb-3"
                style={{ color: "#e91e8c" }}
              >
                {lifePathNumber}
              </div>
              {result?.lifePathMeaning && (
                <div
                  className="inline-block px-4 py-1 rounded-full text-sm"
                  style={{ background: "#fff0f5", color: "#e91e8c" }}
                >
                  {result.lifePathMeaning}
                </div>
              )}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div
                  className="px-3 py-1 rounded-full text-xs"
                  style={{ background: "#e8d5ff", color: "#6a1b9a" }}
                >
                  今日の数字：{todayNumber}
                </div>
              </div>
            </div>

            {/* マイカラー表示 */}
            {myColor && (
              <div
                className="rounded-3xl p-6 mb-6 text-center shadow-lg"
                style={{
                  background: `linear-gradient(145deg, ${myColor.hex}55, ${myColor.hex}99)`,
                  border: `2px solid ${myColor.hex}`,
                }}
              >
                <p className="text-xs font-bold mb-3" style={{ color: "#5a4a5a" }}>
                  🎨 あなたのマイカラー
                </p>
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-3 shadow-xl border-4 border-white"
                  style={{ background: myColor.hex }}
                />
                <p className="text-2xl font-bold mb-2" style={{ color: "#3d2c2c" }}>
                  {myColor.name}
                </p>
                <div
                  className="inline-block px-4 py-1 rounded-full text-sm font-medium"
                  style={{ background: "rgba(255,255,255,0.7)", color: "#5a4a5a" }}
                >
                  {myColor.keyword}
                </div>
              </div>
            )}

            {/* セリフ表示（全文） */}
            {result && (
              <div className="mb-8">
                {/* ダメ天使のセリフ */}
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0 mt-1">
                      <Image
                        src="/images/characters/24_ANGEL.png"
                        alt="ダメ天使"
                        fill
                        sizes="200px"
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-xs font-bold mb-1"
                        style={{ color: "#c2185b" }}
                      >
                        ダメ天使
                      </p>
                      <div
                        className="rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed"
                        style={{ background: "#fce4ec", color: "#3d2c2c" }}
                      >
                        {result.angel}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ダメ悪魔のセリフ */}
                <div className="mb-4">
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="relative w-12 h-12 flex-shrink-0 mt-1">
                      <Image
                        src="/images/characters/25_DEVIL.png"
                        alt="ダメ悪魔"
                        fill
                        sizes="200px"
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-xs font-bold mb-1 text-right"
                        style={{ color: "#6a1b9a" }}
                      >
                        ダメ悪魔
                      </p>
                      <div
                        className="rounded-2xl rounded-tr-sm p-4 text-sm leading-relaxed"
                        style={{ background: "#e8d5ff", color: "#3d2c2c" }}
                      >
                        {result.devil}
                      </div>
                    </div>
                  </div>
                </div>

                {/* まとめ */}
                <div
                  className="rounded-2xl p-4 text-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #fff0f5, #f0e8ff)",
                  }}
                >
                  <p
                    className="text-xs font-bold mb-2"
                    style={{ color: "#888" }}
                  >
                    ✦ 2人のまとめ ✦
                  </p>
                  <p
                    className="text-sm leading-relaxed font-medium"
                    style={{ color: "#3d2c2c" }}
                  >
                    {result.summary}
                  </p>
                </div>

                {hasError && (
                  <p
                    className="text-xs text-center mt-2"
                    style={{ color: "#999" }}
                  >
                    ※ APIキーが未設定のためサンプルセリフを表示しています
                  </p>
                )}

                {/* シェアボタン */}
                <ShareButtons
                  shareCardId="share-card"
                  tweetText={tweetText}
                  filename="numerology-result.png"
                  source="numerology"
                />
              </div>
            )}

            {/* アクションボタン */}
            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full py-4 px-8 rounded-full text-white text-base font-bold text-center shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #ff6b9d, #c64dd1)",
                }}
              >
                もう一度占う
              </button>
              <Link
                href="/uranai"
                className="block w-full py-3 px-8 rounded-full text-center text-sm font-medium border-2 transition-all duration-200"
                style={{
                  borderColor: "#fce4ec",
                  color: "#c2185b",
                  background: "#ffffff",
                }}
              >
                タロット占いもやってみる
              </Link>
              <Link
                href="/"
                className="block w-full py-3 px-8 rounded-full text-center text-sm font-medium border-2 transition-all duration-200"
                style={{
                  borderColor: "#e8d5ff",
                  color: "#6a1b9a",
                  background: "#ffffff",
                }}
              >
                トップに戻る
              </Link>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
