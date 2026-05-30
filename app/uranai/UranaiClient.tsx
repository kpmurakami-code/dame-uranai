"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import {
  drawRandomCard,
  type TarotCard,
} from "./tarotData";
import type { CardData } from "@/lib/saveFortune";
import { checkFreemiumLimit, recordFortuneUsage } from "@/lib/freemium";
import { saveFortune } from "@/lib/saveFortune";
import PaywallModal from "@/components/PaywallModal";
import Header from "@/components/Header";
import ShareButtons from "@/components/ShareButtons";

type Step = "select" | "drawing" | "result";
type SpreadMode = "single" | "three";

interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position?: string;
}

interface FortuneResult {
  angel: string;
  devil: string;
  summary: string;
  luckyColor?: { name: string; hex: string };
}


// 画像ボード board.png（1536x1024）の各セル座標（%）。
// 配置: 恋愛/仕事/健康（上段）, お金/全体運/おまかせ（下段）
const themes = [
  { id: "love", label: "恋愛", icon: "💕", desc: "恋愛・パートナー・出会い", cell: { left: "4%", top: "21%", width: "28%", height: "35%" } },
  { id: "work", label: "仕事", icon: "💼", desc: "仕事・キャリア・成功", cell: { left: "35%", top: "21%", width: "28%", height: "35%" } },
  { id: "health", label: "健康", icon: "🌿", desc: "健康・体調・メンタル", cell: { left: "67%", top: "21%", width: "28%", height: "35%" } },
  { id: "money", label: "お金", icon: "💰", desc: "お金・財運・収入", cell: { left: "4%", top: "57%", width: "28%", height: "38%" } },
  { id: "overall", label: "全体運", icon: "🌟", desc: "今日の全体的な運勢", cell: { left: "35%", top: "57%", width: "28%", height: "38%" } },
  { id: "any", label: "おまかせ", icon: "🔮", desc: "なんでも占ってみて！", cell: { left: "67%", top: "57%", width: "28%", height: "38%" } },
];

const THREE_CARD_POSITIONS = ["過去", "現在", "未来"];

export default function UranaiClient() {
  const [step, setStep] = useState<Step>("select");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [spreadMode, setSpreadMode] = useState<SpreadMode>("single");
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [isLoadingFortune, setIsLoadingFortune] = useState(false);
  const [fortuneError, setFortuneError] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [remainingCount, setRemainingCount] = useState<number | null>(null);

  // 残り回数を初期表示
  useEffect(() => {
    checkFreemiumLimit().then(({ remaining, isLoggedIn: loggedIn }) => {
      setRemainingCount(remaining);
      setIsLoggedIn(loggedIn);
    });
  }, []);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const fetchFortune = useCallback(async (cards: DrawnCard[], theme: string) => {
    setIsLoadingFortune(true);
    setFortuneError(false);
    let result: FortuneResult;
    try {
      const response = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          cards: cards.map((c) => ({
            name: c.card.name,
            nameJa: c.card.nameJa,
            isReversed: c.isReversed,
            position: c.position,
          })),
          characterMode: "both",
        }),
      });

      if (!response.ok) throw new Error("API error");

      const text = await response.text();
      result = JSON.parse(text);
      setFortune(result);
    } catch (error) {
      console.error("Fortune fetch error:", error);
      setFortuneError(true);
      const mainCard = cards[0];
      result = {
        angel: `えっと〜、「${mainCard.card.nameJa}」のカードが出たよ〜！✨ なんかいいエネルギーを感じるよ〜？きっとうまくいくんじゃないかな〜！`,
        devil: `まあ、「${mainCard.card.nameJa}」が出たってことは、ちゃんと前向きに動くべきってことじゃないの。…まあ、応援はしてるけど。`,
        summary: `行動するタイミングが来ています。自信を持って前進することで嬉しい変化が訪れるでしょう。`,
      };
      setFortune(result);
    } finally {
      setIsLoadingFortune(false);
      setStep("result");
      // ログイン済みの場合のみ履歴保存（result は上で確定済み）
      saveFortune({
        fortune_type: "tarot",
        theme,
        angel_text: result!.angel,
        devil_text: result!.devil,
        summary_text: result!.summary,
        card_names: cards.map((c) => c.card.nameJa),
        card_data: cards.map((c): CardData => ({
          nameJa: c.card.nameJa,
          filename: c.card.filename,
          isReversed: c.isReversed,
          position: c.position ?? null,
          keyword: c.isReversed ? c.card.keywordReversed : c.card.keywordUpright,
        })),
        lucky_color_name: result!.luckyColor?.name,
        lucky_color_hex: result!.luckyColor?.hex,
      }).catch(console.error);
    }
  }, []);

  const handleDraw = async () => {
    if (!selectedTheme) return;

    // フリーミアム制限チェック
    const { limited, isLoggedIn: loggedIn } = await checkFreemiumLimit();
    setIsLoggedIn(loggedIn);
    if (limited) {
      setShowPaywall(true);
      return;
    }

    setStep("drawing");

    setTimeout(async () => {
      let cards: DrawnCard[];
      if (spreadMode === "three") {
        const usedIds = new Set<number>();
        cards = THREE_CARD_POSITIONS.map((position) => {
          let drawn = drawRandomCard();
          while (usedIds.has(drawn.card.id)) {
            drawn = drawRandomCard();
          }
          usedIds.add(drawn.card.id);
          return { ...drawn, position };
        });
      } else {
        const drawn = drawRandomCard();
        cards = [{ ...drawn }];
      }

      setDrawnCards(cards);
      // 使用回数を記録
      await recordFortuneUsage("tarot");
      // 残り回数を更新
      checkFreemiumLimit().then(({ remaining }) => setRemainingCount(remaining));
      // step は fetchFortune 完了後に "result" へ切り替わる
      fetchFortune(cards, selectedTheme);
    }, 1800);
  };

  const handleReset = () => {
    setStep("select");
    setSelectedTheme("");
    setDrawnCards([]);
    setFortune(null);
    setFortuneError(false);
    setIsLoadingFortune(false);
  };

  const selectedThemeLabel =
    themes.find((t) => t.id === selectedTheme)?.label ?? "";

  // X シェア用テキスト
  const tweetText = fortune
    ? `【タロット占い】${selectedThemeLabel}｜${fortune.summary.slice(0, 40)}… #ダメ占い`
    : "";

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
          🃏 タロット占い
        </h1>
        <div className="text-xs" style={{ color: "#b08090" }}>
          {remainingCount !== null && remainingCount < 9999 && (
            <span>残り{remainingCount}回</span>
          )}
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center px-6 py-8">

        {/* ===== テーマ選択ステップ ===== */}
        {step === "select" && (
          <div className="w-full max-w-md">
            {/* janle.png ジャンル選択イラスト */}
            <div className="text-center mb-6">
              <div className="relative w-full max-w-xs mx-auto mb-4"
                style={{ aspectRatio: "1/1" }}
              >
                <Image
                  src="/images/characters/janle.png"
                  alt="ジャンル選択"
                  fill
                  sizes="200px"
                  className="object-contain"
                  priority
                />
              </div>
              <div
                className="rounded-2xl p-3 mb-2 text-sm"
                style={{ background: "#fce4ec", color: "#c2185b" }}
              >
                えっと〜、何を占いたいのかな〜？✨
              </div>
              <div
                className="rounded-2xl p-3 text-sm"
                style={{ background: "#e8d5ff", color: "#6a1b9a" }}
              >
                テーマ、早く選んで。まあ…どれでも占ってあげるけど。
              </div>
            </div>

            {/* 展開モード選択 */}
            <div className="mb-5">
              <h2 className="text-sm font-bold mb-3" style={{ color: "#3d2c2c" }}>
                カードの引き方
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSpreadMode("single")}
                  className="py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-200"
                  style={{
                    background: spreadMode === "single"
                      ? "linear-gradient(135deg, #ff6b9d22, #c64dd122)"
                      : "#ffffff",
                    border: spreadMode === "single"
                      ? "2px solid #ff6b9d"
                      : "2px solid #fce4ec",
                    color: spreadMode === "single" ? "#e91e8c" : "#3d2c2c",
                  }}
                >
                  1枚引き
                  <p className="text-xs font-normal mt-1" style={{ color: "#7a6060" }}>
                    今この瞬間を占う
                  </p>
                </button>
                <button
                  onClick={() => setSpreadMode("three")}
                  className="py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-200"
                  style={{
                    background: spreadMode === "three"
                      ? "linear-gradient(135deg, #ff6b9d22, #c64dd122)"
                      : "#ffffff",
                    border: spreadMode === "three"
                      ? "2px solid #ff6b9d"
                      : "2px solid #fce4ec",
                    color: spreadMode === "three" ? "#e91e8c" : "#3d2c2c",
                  }}
                >
                  3枚展開
                  <p className="text-xs font-normal mt-1" style={{ color: "#7a6060" }}>
                    過去・現在・未来
                  </p>
                </button>
              </div>
            </div>

            {/* テーマ選択（画像ボード＋オーバーレイボタン） */}
            <h2 className="sr-only">占いたいテーマを選んでね</h2>
            <div
              className="relative w-full mb-8 rounded-3xl overflow-hidden shadow-sm"
              style={{ aspectRatio: "1536 / 1024" }}
            >
              <Image
                src="/images/themes/board.png"
                alt="占いたいテーマを選んでね"
                fill
                sizes="(max-width: 768px) 100vw, 448px"
                className="object-contain"
                priority
              />
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  aria-label={theme.label}
                  aria-pressed={selectedTheme === theme.id}
                  className="absolute rounded-2xl transition-all duration-200 cursor-pointer"
                  style={{
                    left: theme.cell.left,
                    top: theme.cell.top,
                    width: theme.cell.width,
                    height: theme.cell.height,
                    border:
                      selectedTheme === theme.id
                        ? "3px solid #ff6b9d"
                        : "3px solid transparent",
                    boxShadow:
                      selectedTheme === theme.id
                        ? "0 0 0 3px rgba(255,107,157,0.3)"
                        : "none",
                    background:
                      selectedTheme === theme.id
                        ? "rgba(255,107,157,0.12)"
                        : "transparent",
                  }}
                >
                  {selectedTheme === theme.id && (
                    <span
                      className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
                      style={{ background: "#ff6b9d" }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleDraw}
              disabled={!selectedTheme}
              className="w-full py-4 px-8 rounded-full text-white text-lg font-bold text-center shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: selectedTheme
                  ? "linear-gradient(135deg, #ff6b9d, #c64dd1)"
                  : "#ccc",
              }}
            >
              カードを引く！
            </button>
          </div>
        )}

        {/* ===== カードを引くアニメーション ===== */}
        {step === "drawing" && (
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
                {spreadMode === "three" ? "3枚のカードを引いてるよ〜..." : "カードを引いてるよ〜..."}
              </p>
              <p className="text-sm mt-1" style={{ color: "#7a6060" }}>
                えっと、どのカードかな〜？（ふわふわ）
              </p>
            </div>
          </div>
        )}

        {/* ===== 結果表示 ===== */}
        {step === "result" && drawnCards.length > 0 && (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <div
                className="inline-block px-4 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: "#fce4ec", color: "#c2185b" }}
              >
                {selectedThemeLabel}の占い結果
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#3d2c2c" }}>
                {spreadMode === "three" ? "3枚のカードが出たよ〜！" : "カードが出たよ〜！"}
              </h2>
            </div>

            {/* ===== シェア用カード（html2canvas 用・画面外に配置） ===== */}
            <div
              id="share-card"
              className="rounded-3xl p-5 shadow-lg"
              style={{
                background: "linear-gradient(145deg, #fff0f5, #f0e8ff)",
                border: "2px solid #fce4ec",
                position: "absolute",
                left: "-9999px",
                top: 0,
                width: "360px",
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
                  タロット占い・{selectedThemeLabel}
                </div>
              </div>

              {/* === 1枚引きのカード表示 === */}
              {spreadMode === "single" && drawnCards[0] && (
                <div className="text-center mb-4">
                  <div className="relative w-36 h-36 mx-auto mb-3">
                    <Image
                      src={`/images/characters/${drawnCards[0].card.filename}`}
                      alt={drawnCards[0].card.nameJa}
                      fill
                      sizes="144px"
                      className="object-contain"
                      style={{
                        transform: drawnCards[0].isReversed ? "rotate(180deg)" : "none",
                      }}
                    />
                  </div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: "#3d2c2c" }}>
                    {drawnCards[0].card.nameJa}
                    {drawnCards[0].isReversed && (
                      <span
                        className="text-xs ml-2 px-2 py-0.5 rounded-full"
                        style={{ background: "#e8d5ff", color: "#6a1b9a" }}
                      >
                        逆位置
                      </span>
                    )}
                  </h3>
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs mt-1"
                    style={{ background: "#fff0f5", color: "#e91e8c" }}
                  >
                    {drawnCards[0].isReversed
                      ? drawnCards[0].card.keywordReversed
                      : drawnCards[0].card.keywordUpright}
                  </div>
                </div>
              )}

              {/* === 3枚展開のカード表示（シェアカード内） === */}
              {spreadMode === "three" && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {drawnCards.map((drawn, index) => (
                    <div key={index} className="text-center">
                      <div
                        className="text-xs font-bold mb-1 px-1 py-0.5 rounded-full inline-block"
                        style={{ background: "#fce4ec", color: "#c2185b", fontSize: "10px" }}
                      >
                        {drawn.position}
                      </div>
                      <div className="relative w-full mx-auto mb-1" style={{ aspectRatio: "2/3" }}>
                        <Image
                          src={`/images/characters/${drawn.card.filename}`}
                          alt={drawn.card.nameJa}
                          fill
                          sizes="120px"
                          className="object-contain"
                          style={{ transform: drawn.isReversed ? "rotate(180deg)" : "none" }}
                        />
                      </div>
                      <p className="text-xs font-bold" style={{ color: "#3d2c2c", fontSize: "10px" }}>
                        {drawn.card.nameJa}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* AIセリフ（シェアカード内） */}
              {fortune && !isLoadingFortune && (
                <>
                  <div className="flex items-start gap-2 mb-3">
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image src="/images/characters/24_ANGEL.png" alt="ダメ天使" fill sizes="32px" className="object-contain" />
                    </div>
                    <div
                      className="flex-1 rounded-2xl rounded-tl-sm px-3 py-2 text-xs leading-relaxed"
                      style={{ background: "#fce4ec", color: "#3d2c2c" }}
                    >
                      {fortune.angel.length > 60 ? fortune.angel.slice(0, 60) + "…" : fortune.angel}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 flex-row-reverse mb-3">
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image src="/images/characters/25_DEVIL.png" alt="ダメ悪魔" fill sizes="32px" className="object-contain" />
                    </div>
                    <div
                      className="flex-1 rounded-2xl rounded-tr-sm px-3 py-2 text-xs leading-relaxed"
                      style={{ background: "#e8d5ff", color: "#3d2c2c" }}
                    >
                      {fortune.devil.length > 60 ? fortune.devil.slice(0, 60) + "…" : fortune.devil}
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ background: "rgba(255,255,255,0.6)" }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: "#3d2c2c" }}>
                      {fortune.summary}
                    </p>
                  </div>
                  {fortune.luckyColor && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-xs" style={{ color: "#b08090" }}>🍀 ラッキーカラー:</span>
                      <span
                        className="inline-block w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ background: fortune.luckyColor.hex }}
                      />
                      <span className="text-xs font-bold" style={{ color: "#3d2c2c" }}>
                        {fortune.luckyColor.name}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            {/* ===== /シェア用カード ===== */}

            {/* === カード表示（可視エリア） === */}
            {spreadMode === "single" && drawnCards[0] && (
              <div className="text-center mb-8">
                <div className="inline-block relative">
                  {/* 装飾スパークル */}
                  <span className="absolute -top-3 -right-3 text-lg" style={{ color: "#ffb7c5" }}>✦</span>
                  <span className="absolute -bottom-3 -left-3 text-sm" style={{ color: "#ce93d8" }}>✦</span>
                  <span className="absolute top-1/2 -left-4 text-xs" style={{ color: "#ffd6e7" }}>✧</span>
                  <span className="absolute top-1/2 -right-4 text-xs" style={{ color: "#d6f0ff" }}>✧</span>
                  {/* グラデーションフレーム */}
                  <div
                    className="p-2 rounded-3xl"
                    style={{
                      background: "linear-gradient(135deg, #ffd6e7, #e8d5ff, #d6f0ff)",
                      boxShadow: "0 12px 40px rgba(255,107,157,0.35), 0 4px 16px rgba(198,77,209,0.2)",
                    }}
                  >
                    <div
                      className="relative rounded-2xl overflow-hidden bg-white"
                      style={{ width: "160px", aspectRatio: "2/3" }}
                    >
                      <Image
                        src={`/images/characters/${drawnCards[0].card.filename}`}
                        alt={drawnCards[0].card.nameJa}
                        fill
                        sizes="200px"
                        className="object-contain"
                        style={{
                          transform: drawnCards[0].isReversed ? "rotate(180deg)" : "none",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* カード名・キーワード */}
                <div className="mt-5">
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#3d2c2c" }}>
                    {drawnCards[0].card.nameJa}
                    {drawnCards[0].isReversed && (
                      <span
                        className="text-xs ml-2 px-2 py-0.5 rounded-full align-middle"
                        style={{ background: "#e8d5ff", color: "#6a1b9a" }}
                      >
                        逆位置
                      </span>
                    )}
                  </h3>
                  <div
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: "linear-gradient(135deg, #fff0f5, #f0e8ff)",
                      color: "#e91e8c",
                      border: "1px solid #fce4ec",
                    }}
                  >
                    ✦ {drawnCards[0].isReversed
                      ? drawnCards[0].card.keywordReversed
                      : drawnCards[0].card.keywordUpright}
                  </div>
                </div>
              </div>
            )}

            {spreadMode === "three" && drawnCards.length === 3 && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {drawnCards.map((drawn, index) => (
                  <div key={index} className="text-center">
                    <div
                      className="text-xs font-bold mb-2 px-2 py-0.5 rounded-full inline-block"
                      style={{ background: "#fce4ec", color: "#c2185b" }}
                    >
                      {drawn.position}
                    </div>
                    {/* フレーム */}
                    <div
                      className="p-1.5 rounded-2xl mx-auto"
                      style={{
                        background: "linear-gradient(135deg, #ffd6e7, #e8d5ff, #d6f0ff)",
                        boxShadow: "0 6px 20px rgba(255,107,157,0.3)",
                      }}
                    >
                      <div
                        className="relative rounded-xl overflow-hidden bg-white"
                        style={{ aspectRatio: "2/3" }}
                      >
                        <Image
                          src={`/images/characters/${drawn.card.filename}`}
                          alt={drawn.card.nameJa}
                          fill
                          sizes="120px"
                          className="object-contain"
                          style={{ transform: drawn.isReversed ? "rotate(180deg)" : "none" }}
                        />
                      </div>
                    </div>
                    <p className="text-xs font-bold mt-2" style={{ color: "#3d2c2c" }}>
                      {drawn.card.nameJa}
                    </p>
                    {drawn.isReversed && (
                      <span
                        className="inline-block mt-0.5 px-1.5 py-0.5 rounded-full"
                        style={{ background: "#e8d5ff", color: "#6a1b9a", fontSize: "10px" }}
                      >
                        逆位置
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* === AIセリフ全文表示エリア === */}
            {fortune && !isLoadingFortune && (
              <div className="mb-6">
                {/* ダメ天使のセリフ */}
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0 mt-1">
                      <Image
                        src="/images/characters/24_ANGEL.png"
                        alt="ダメ天使"
                        fill
                        sizes="48px"
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
                        {fortune.angel}
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
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold mb-1 text-right" style={{ color: "#6a1b9a" }}>
                        ダメ悪魔
                      </p>
                      <div
                        className="rounded-2xl rounded-tr-sm p-4 text-sm leading-relaxed"
                        style={{ background: "#e8d5ff", color: "#3d2c2c" }}
                      >
                        {fortune.devil}
                      </div>
                    </div>
                  </div>
                </div>

                {/* まとめ */}
                <div
                  className="rounded-2xl p-4 text-center"
                  style={{ background: "linear-gradient(135deg, #fff0f5, #f0e8ff)" }}
                >
                  <p className="text-xs font-bold mb-2" style={{ color: "#888" }}>
                    ✦ 2人のまとめ ✦
                  </p>
                  <p className="text-sm leading-relaxed font-medium" style={{ color: "#3d2c2c" }}>
                    {fortune.summary}
                  </p>
                </div>

                {/* 今日のラッキーカラー */}
                {fortune.luckyColor && (
                  <div
                    className="rounded-2xl p-4 mt-3 flex items-center gap-3"
                    style={{ background: "linear-gradient(135deg, #fff9f0, #fce4ec)" }}
                  >
                    <span className="text-xs font-bold flex-shrink-0" style={{ color: "#b08090" }}>
                      🍀 今日のラッキーカラー
                    </span>
                    <span
                      className="inline-block w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                      style={{ background: fortune.luckyColor.hex }}
                    />
                    <span className="text-sm font-bold" style={{ color: "#3d2c2c" }}>
                      {fortune.luckyColor.name}
                    </span>
                  </div>
                )}

                {fortuneError && (
                  <p className="text-xs text-center mt-2" style={{ color: "#999" }}>
                    ※ APIキーが未設定のためサンプルセリフを表示しています
                  </p>
                )}

                {/* シェアボタン */}
                <ShareButtons
                  shareCardId="share-card"
                  tweetText={tweetText}
                  filename={`tarot-${selectedTheme}.png`}
                />
              </div>
            )}

            {/* アクションボタン */}
            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full py-4 px-8 rounded-full text-white text-base font-bold text-center shadow-lg transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #ff6b9d, #c64dd1)",
                }}
              >
                もう一度占う
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

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
