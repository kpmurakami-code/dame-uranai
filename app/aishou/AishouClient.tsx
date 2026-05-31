"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import ShareButtons from "@/components/ShareButtons";
import PremiumInterestButton from "@/components/PremiumInterestButton";
import { analytics } from "@/lib/analytics";
import {
  calcCompatibility,
  type Birth,
  type CompatibilityResult,
} from "@/lib/compatibility";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const CTA = "linear-gradient(135deg, #ff6b9d, #c64dd1)";

// 自分の情報のみ保存（次回プリフィル）。sujimei とは別キー。
const STORAGE_KEY = "aishou_self_data";

interface SelfData {
  name: string;
  year: string;
  month: string;
  day: string;
}

function toBirth(year: string, month: string, day: string): Birth | null {
  if (!year || !month || !day) return null;
  return {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    day: parseInt(day, 10),
  };
}

const INPUT_STYLE = {
  border: "2px solid #fce4ec",
  background: "#ffffff",
  color: "#3d2c2c",
} as const;

export default function AishouClient() {
  // 自分
  const [nameA, setNameA] = useState("");
  const [yearA, setYearA] = useState("");
  const [monthA, setMonthA] = useState("");
  const [dayA, setDayA] = useState("");
  // 相手
  const [nameB, setNameB] = useState("");
  const [yearB, setYearB] = useState("");
  const [monthB, setMonthB] = useState("");
  const [dayB, setDayB] = useState("");

  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [displayNames, setDisplayNames] = useState<{ a: string; b: string }>({
    a: "",
    b: "",
  });
  const [animatedScore, setAnimatedScore] = useState(0);

  // 自分の情報を localStorage から復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s: SelfData = JSON.parse(raw);
        if (s.name) setNameA(s.name);
        if (s.year) setYearA(s.year);
        if (s.month) setMonthA(s.month);
        if (s.day) setDayA(s.day);
      }
    } catch {
      // 無視
    }
  }, []);

  // スコアのカウントアップ演出
  useEffect(() => {
    if (!result) {
      setAnimatedScore(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const target = result.score;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOut
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [result]);

  const handleDivine = useCallback(() => {
    if (!nameA.trim() || !nameB.trim()) return;

    analytics.compatStart();

    const birthA = toBirth(yearA, monthA, dayA);
    const birthB = toBirth(yearB, monthB, dayB);

    const r = calcCompatibility(nameA, birthA, nameB, birthB);
    setResult(r);
    setDisplayNames({ a: nameA.trim(), b: nameB.trim() });

    analytics.compatComplete(r.score);

    // 自分の情報のみ保存
    try {
      const s: SelfData = {
        name: nameA,
        year: yearA,
        month: monthA,
        day: dayA,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      // 無視
    }

    // 結果へスクロール
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [nameA, yearA, monthA, dayA, nameB, yearB, monthB, dayB]);

  // 別の人と占う：相手だけリセット
  const handleAnotherPartner = () => {
    setResult(null);
    setNameB("");
    setYearB("");
    setMonthB("");
    setDayB("");
  };

  // 自分を変える：すべてリセット
  const handleChangeSelf = () => {
    setResult(null);
    setNameA("");
    setYearA("");
    setMonthA("");
    setDayA("");
    setNameB("");
    setYearB("");
    setMonthB("");
    setDayB("");
  };

  const isFormValid = nameA.trim() !== "" && nameB.trim() !== "";
  const showResult = result !== null;

  const tweetText = result
    ? `わたしと${displayNames.b || "あの人"}の相性は${result.score}%でした💞 ダメ天使＆ダメ悪魔が占う相性占い、あなたもやってみて！ #ダメ占い`
    : "";

  // 円ゲージ用
  const RADIUS = 70;
  const CIRC = 2 * Math.PI * RADIUS;
  const dash = result ? (animatedScore / 100) * CIRC : 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #fff0f5 0%, #f3f1ff 42%, #eef7ff 70%, #fff9e6 100%)",
      }}
    >
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
          💞 相性占い
        </h1>
        <div className="w-12" />
      </div>

      <main className="flex-1 flex flex-col items-center px-6 py-8">
        {/* ========== 入力フォーム ========== */}
        {!showResult && (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <div className="flex items-end justify-center gap-2 mb-4">
                <div className="relative w-24 h-24">
                  <Image
                    src="/images/characters/24_ANGEL.png"
                    alt="ダメ天使"
                    fill
                    sizes="120px"
                    className="object-contain float-animation"
                  />
                </div>
                <div className="relative w-24 h-24">
                  <Image
                    src="/images/characters/25_DEVIL.png"
                    alt="ダメ悪魔"
                    fill
                    sizes="120px"
                    className="object-contain float-animation-reverse"
                  />
                </div>
              </div>
              <h2
                className="display text-2xl font-black mb-2"
                style={{ color: "#e91e8c" }}
              >
                2人の相性、占ってみる？
              </h2>
              <p className="text-sm font-medium" style={{ color: "#7a6060" }}>
                気になるあの人と・友達と。名前だけで気軽に、誕生日を入れるともっと深く。
              </p>
              <div
                className="rounded-2xl p-3 mt-4 text-sm"
                style={{ background: "#fce4ec", color: "#c2185b" }}
              >
                どんな2人か教えてね〜？相性、見てあげる〜！✨
              </div>
              <div
                className="rounded-2xl p-3 mt-2 text-sm"
                style={{ background: "#e8d5ff", color: "#6a1b9a" }}
              >
                ふん、名前だけでもいいわよ。…まあ、占ってあげる。
              </div>
            </div>

            {/* あなた */}
            <div
              className="rounded-3xl p-5 mb-4 shadow-md"
              style={{
                background: "linear-gradient(150deg,#fff9f0,#fce4ec)",
                border: "2px solid #ffe0ec",
              }}
            >
              <p
                className="display text-sm font-extrabold mb-3"
                style={{ color: "#c2185b" }}
              >
                💗 あなた
              </p>
              <input
                type="text"
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
                placeholder="あなたの名前（必須）"
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none mb-3"
                style={INPUT_STYLE}
              />
              <p className="text-xs mb-2" style={{ color: "#b08090" }}>
                生年月日（任意・入れるとより深く占えるよ）
              </p>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={yearA}
                  onChange={(e) => setYearA(e.target.value)}
                  className="w-full rounded-2xl px-2 py-3 text-sm outline-none appearance-none text-center"
                  style={{ ...INPUT_STYLE, color: yearA ? "#3d2c2c" : "#b08090" }}
                >
                  <option value="">年</option>
                  {YEARS.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  value={monthA}
                  onChange={(e) => setMonthA(e.target.value)}
                  className="w-full rounded-2xl px-2 py-3 text-sm outline-none appearance-none text-center"
                  style={{ ...INPUT_STYLE, color: monthA ? "#3d2c2c" : "#b08090" }}
                >
                  <option value="">月</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={String(m)}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={dayA}
                  onChange={(e) => setDayA(e.target.value)}
                  className="w-full rounded-2xl px-2 py-3 text-sm outline-none appearance-none text-center"
                  style={{ ...INPUT_STYLE, color: dayA ? "#3d2c2c" : "#b08090" }}
                >
                  <option value="">日</option>
                  {DAYS.map((d) => (
                    <option key={d} value={String(d)}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* お相手 */}
            <div
              className="rounded-3xl p-5 mb-6 shadow-md"
              style={{
                background: "linear-gradient(150deg,#f5f0ff,#e8d5ff)",
                border: "2px solid #ddc9ff",
              }}
            >
              <p
                className="display text-sm font-extrabold mb-3"
                style={{ color: "#6a1b9a" }}
              >
                💜 お相手
              </p>
              <input
                type="text"
                value={nameB}
                onChange={(e) => setNameB(e.target.value)}
                placeholder="お相手の名前（必須）"
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none mb-3"
                style={INPUT_STYLE}
              />
              <p className="text-xs mb-2" style={{ color: "#b08090" }}>
                生年月日（任意）
              </p>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={yearB}
                  onChange={(e) => setYearB(e.target.value)}
                  className="w-full rounded-2xl px-2 py-3 text-sm outline-none appearance-none text-center"
                  style={{ ...INPUT_STYLE, color: yearB ? "#3d2c2c" : "#b08090" }}
                >
                  <option value="">年</option>
                  {YEARS.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  value={monthB}
                  onChange={(e) => setMonthB(e.target.value)}
                  className="w-full rounded-2xl px-2 py-3 text-sm outline-none appearance-none text-center"
                  style={{ ...INPUT_STYLE, color: monthB ? "#3d2c2c" : "#b08090" }}
                >
                  <option value="">月</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={String(m)}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={dayB}
                  onChange={(e) => setDayB(e.target.value)}
                  className="w-full rounded-2xl px-2 py-3 text-sm outline-none appearance-none text-center"
                  style={{ ...INPUT_STYLE, color: dayB ? "#3d2c2c" : "#b08090" }}
                >
                  <option value="">日</option>
                  {DAYS.map((d) => (
                    <option key={d} value={String(d)}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleDivine}
              disabled={!isFormValid}
              className="w-full py-4 px-8 rounded-full text-white text-lg font-bold text-center shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:scale-105 active:scale-95"
              style={{ background: isFormValid ? CTA : "#ccc" }}
            >
              相性を占う！
            </button>
            <p className="text-xs text-center mt-3" style={{ color: "#b08090" }}>
              ✦ 登録なし・無料・何回でも占えるよ ✦
            </p>
          </div>
        )}

        {/* ========== 結果表示 ========== */}
        {showResult && result && (
          <div className="w-full max-w-md">
            <div className="text-center mb-5">
              <div
                className="inline-block px-4 py-1 rounded-full text-xs font-bold mb-2"
                style={{ background: "#fce4ec", color: "#c2185b" }}
              >
                {displayNames.a} & {displayNames.b} の相性
              </div>
              <h2 className="display text-xl font-black" style={{ color: "#3d2c2c" }}>
                2人の相性は…？
              </h2>
            </div>

            {/* ===== シェア用カード（画面外・html2canvas用） ===== */}
            <div
              id="aishou-share-card"
              className="rounded-3xl p-6 shadow-lg"
              style={{
                background: `linear-gradient(145deg, ${result.color.hex}33, ${result.color.hex}77)`,
                position: "absolute",
                left: "-9999px",
                top: 0,
                width: "360px",
                border: `2px solid ${result.color.hex}`,
              }}
            >
              <div className="text-center mb-2">
                <span
                  className="text-xs font-bold tracking-widest"
                  style={{ color: "#e91e8c" }}
                >
                  ✦ ダメ占い ✦
                </span>
                <div
                  className="inline-block ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: "#fce4ec", color: "#c2185b" }}
                >
                  相性占い
                </div>
              </div>
              <p
                className="text-center text-xs font-bold mb-2"
                style={{ color: "#7a6060" }}
              >
                {displayNames.a} & {displayNames.b}
              </p>
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="relative w-12 h-12">
                  <Image
                    src="/images/characters/24_ANGEL.png"
                    alt="ダメ天使"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <div
                    className="text-5xl font-black leading-none"
                    style={{ color: "#e91e8c" }}
                  >
                    {result.score}
                    <span className="text-2xl">%</span>
                  </div>
                </div>
                <div className="relative w-12 h-12">
                  <Image
                    src="/images/characters/25_DEVIL.png"
                    alt="ダメ悪魔"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <p
                className="text-center text-sm font-bold mb-2"
                style={{ color: "#3d2c2c" }}
              >
                {BAND_LABEL[result.band]}
              </p>
              <div
                className="rounded-xl p-2 text-center"
                style={{ background: "rgba(255,255,255,0.6)" }}
              >
                <p className="text-xs" style={{ color: "#3d2c2c" }}>
                  {result.advice}
                </p>
              </div>
              <p
                className="text-center text-xs font-bold mt-2"
                style={{ color: "#c2185b" }}
              >
                #ダメ占い
              </p>
            </div>
            {/* ===== /シェア用カード ===== */}

            {/* スコア円ゲージ */}
            <div
              className="rounded-3xl p-6 mb-5 text-center shadow-lg"
              style={{
                background: `linear-gradient(145deg, ${result.color.hex}33, #ffffff)`,
                border: `2px solid ${result.color.hex}`,
              }}
            >
              <div className="relative w-44 h-44 mx-auto mb-2">
                <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
                  <circle
                    cx="90"
                    cy="90"
                    r={RADIUS}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="14"
                  />
                  <circle
                    cx="90"
                    cy="90"
                    r={RADIUS}
                    fill="none"
                    stroke={result.color.hex}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${CIRC}`}
                    style={{ transition: "stroke-dasharray 0.1s linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-5xl font-black leading-none"
                    style={{ color: "#e91e8c" }}
                  >
                    {animatedScore}
                    <span className="text-2xl">%</span>
                  </span>
                  <span className="text-xl mt-1">💞</span>
                </div>
              </div>
              <p
                className="display text-lg font-extrabold"
                style={{ color: "#3d2c2c" }}
              >
                {BAND_LABEL[result.band]}
              </p>
            </div>

            {/* 掛け合い */}
            <div className="mb-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="relative w-12 h-12 flex-shrink-0 mt-1">
                  <Image
                    src="/images/characters/24_ANGEL.png"
                    alt="ダメ天使"
                    fill
                    sizes="120px"
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold mb-1" style={{ color: "#c2185b" }}>
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

              <div className="mb-4 flex items-start gap-3 flex-row-reverse">
                <div className="relative w-12 h-12 flex-shrink-0 mt-1">
                  <Image
                    src="/images/characters/25_DEVIL.png"
                    alt="ダメ悪魔"
                    fill
                    sizes="120px"
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

              {/* 結論 */}
              <div
                className="rounded-2xl p-4 text-center"
                style={{ background: "linear-gradient(135deg, #fff0f5, #f0e8ff)" }}
              >
                <p className="text-xs font-bold mb-2" style={{ color: "#888" }}>
                  💡 2人への結論
                </p>
                <p
                  className="text-sm leading-relaxed font-medium"
                  style={{ color: "#3d2c2c" }}
                >
                  {result.advice}
                </p>
              </div>
            </div>

            {/* 相性カラー */}
            <div
              className="rounded-3xl p-5 mb-5 text-center shadow-md"
              style={{
                background: `linear-gradient(145deg, ${result.color.hex}44, ${result.color.hex}88)`,
                border: `2px solid ${result.color.hex}`,
              }}
            >
              <p className="text-xs font-bold mb-3" style={{ color: "#5a4a5a" }}>
                🎨 2人の相性カラー
              </p>
              <div
                className="w-16 h-16 rounded-full mx-auto mb-2 shadow-xl border-4 border-white"
                style={{ background: result.color.hex }}
              />
              <p className="text-lg font-bold" style={{ color: "#3d2c2c" }}>
                {result.color.name}
              </p>
            </div>

            {/* プレミアム誘導（ソフト予告） */}
            <div
              className="rounded-2xl p-4 mb-4 text-center"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px dashed #ddc9ff",
              }}
            >
              <p className="text-sm font-bold mb-1" style={{ color: "#7c3aed" }}>
                ✨ もっと詳しい2人の読み解きは近日プレミアムで
              </p>
              <p className="text-xs" style={{ color: "#b08090" }}>
                恋の進め方・相手の本音まで、ダメ天使＆ダメ悪魔がじっくり占うフル版を準備中だよ。
              </p>
            </div>

            {/* プレミアム先行登録（F-16・需要検証） */}
            <PremiumInterestButton source="aishou" />

            {/* シェア */}
            <ShareButtons
              shareCardId="aishou-share-card"
              tweetText={tweetText}
              filename="aishou-result.png"
              source="aishou"
            />

            {/* 再操作 */}
            <div className="space-y-3 mt-6">
              <button
                onClick={handleAnotherPartner}
                className="w-full py-4 px-8 rounded-full text-white text-base font-bold text-center shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
                style={{ background: CTA }}
              >
                別の人と占う
              </button>
              <button
                onClick={handleChangeSelf}
                className="w-full py-3 px-8 rounded-full text-center text-sm font-medium border-2 transition-all duration-200"
                style={{
                  borderColor: "#e8d5ff",
                  color: "#6a1b9a",
                  background: "#ffffff",
                }}
              >
                自分を変える
              </button>
              <Link
                href="/"
                className="block w-full py-3 px-8 rounded-full text-center text-sm font-medium border-2 transition-all duration-200"
                style={{
                  borderColor: "#fce4ec",
                  color: "#c2185b",
                  background: "#ffffff",
                }}
              >
                トップに戻る
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer
        className="py-7 px-6 text-center text-xs"
        style={{
          color: "#b08090",
          borderTop: "1px solid #fce4ec",
          background: "rgba(255,250,253,.5)",
        }}
      >
        <div className="flex items-center justify-center gap-4 mb-3">
          <Link href="/terms" className="underline" style={{ color: "#b08090" }}>
            利用規約
          </Link>
          <Link href="/privacy" className="underline" style={{ color: "#b08090" }}>
            プライバシーポリシー
          </Link>
        </div>
        <p>© 2026 ダメ占い</p>
      </footer>
    </div>
  );
}

const BAND_LABEL: Record<CompatibilityResult["band"], string> = {
  soulmate: "運命級の相性！💞",
  great: "とっても良い相性！😊",
  good: "良い相性だよ〜✨",
  okay: "これからの相性🌱",
  challenge: "手強いけど伸びしろ◎🔥",
};
