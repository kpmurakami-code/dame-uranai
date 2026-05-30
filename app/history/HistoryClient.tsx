"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import { getLifePathColor } from "@/lib/numerologyColors";

interface CardData {
  nameJa: string;
  filename: string;
  isReversed: boolean;
  position: string | null;
  keyword: string;
}

interface Fortune {
  id: string;
  fortune_type: "tarot" | "numerology";
  theme: string | null;
  angel_text: string;
  devil_text: string;
  summary_text: string;
  card_names: string[] | null;
  card_data: CardData[] | null;
  lucky_color_name: string | null;
  lucky_color_hex: string | null;
  life_path_number: number | null;
  life_path_meaning: string | null;
  created_at: string;
}

interface Props {
  fortunes: Fortune[];
}

const THEME_LABELS: Record<string, string> = {
  love: "恋愛",
  work: "仕事",
  money: "お金",
  health: "健康",
  overall: "全体運",
  any: "おまかせ",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${hh}:${mm}`;
}

function calcDigitSum(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  const sum = String(n).split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  return calcDigitSum(sum);
}

function getTodayNumberFromISO(isoString: string): number {
  const date = new Date(isoString);
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = jst.toISOString().slice(0, 10).replace(/-/g, "");
  const total = dateStr.split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  return calcDigitSum(total);
}

function FortuneItem({ fortune }: { fortune: Fortune }) {
  const [open, setOpen] = useState(false);
  const themeLabel = fortune.theme ? (THEME_LABELS[fortune.theme] ?? fortune.theme) : null;
  const myColor = fortune.life_path_number !== null ? getLifePathColor(fortune.life_path_number) : null;
  const todayNumber = getTodayNumberFromISO(fortune.created_at);

  return (
    <div
      className="rounded-2xl mb-4 overflow-hidden shadow-md"
      style={{ border: "1.5px solid #fce4ec" }}
    >
      {/* ヘッダー行（タップで展開） */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-pink-50"
        style={{ background: open ? "#fff8fb" : "#ffffff" }}
      >
        <span className="text-2xl flex-shrink-0">
          {fortune.fortune_type === "tarot" ? "🃏" : "🔢"}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold" style={{ color: "#3d2c2c" }}>
              {fortune.fortune_type === "tarot" ? "タロット占い" : "数秘術占い"}
            </span>
            {themeLabel && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: "#fce4ec", color: "#c2185b" }}
              >
                {themeLabel}
              </span>
            )}
            {fortune.fortune_type === "numerology" && fortune.life_path_number !== null && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: "#e8d5ff", color: "#6a1b9a" }}
              >
                No.{fortune.life_path_number}
              </span>
            )}
            {fortune.lucky_color_hex && (
              <span
                className="inline-block w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ background: fortune.lucky_color_hex }}
              />
            )}
          </div>
          <p className="text-xs mt-1 truncate" style={{ color: "#7a6060" }}>
            {fortune.summary_text}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#b08090" }}>
            {formatDate(fortune.created_at)}
          </p>
        </div>

        <span
          className="flex-shrink-0 text-lg transition-transform duration-200"
          style={{
            color: "#e91e8c",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>

      {/* 展開コンテンツ */}
      {open && (
        <div className="px-4 pb-5 pt-2" style={{ background: "#fffbfd" }}>

          {/* ===== タロット：カード表示 ===== */}
          {fortune.fortune_type === "tarot" && fortune.card_data && fortune.card_data.length > 0 && (
            <div className="mb-5">
              {fortune.card_data.length === 1 ? (
                /* 1枚引き */
                <div className="text-center">
                  <div className="inline-block relative">
                    <span className="absolute -top-2 -right-2 text-sm" style={{ color: "#ffb7c5" }}>✦</span>
                    <span className="absolute -bottom-2 -left-2 text-xs" style={{ color: "#ce93d8" }}>✦</span>
                    <div
                      className="p-1.5 rounded-2xl"
                      style={{
                        background: "linear-gradient(135deg, #ffd6e7, #e8d5ff, #d6f0ff)",
                        boxShadow: "0 8px 24px rgba(255,107,157,0.3)",
                      }}
                    >
                      <div
                        className="relative rounded-xl overflow-hidden bg-white"
                        style={{ width: "120px", aspectRatio: "2/3" }}
                      >
                        <Image
                          src={`/images/characters/${fortune.card_data[0].filename}`}
                          alt={fortune.card_data[0].nameJa}
                          fill
                          sizes="140px"
                          className="object-contain"
                          style={{ transform: fortune.card_data[0].isReversed ? "rotate(180deg)" : "none" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-base font-bold" style={{ color: "#3d2c2c" }}>
                      {fortune.card_data[0].nameJa}
                      {fortune.card_data[0].isReversed && (
                        <span
                          className="text-xs ml-2 px-2 py-0.5 rounded-full align-middle"
                          style={{ background: "#e8d5ff", color: "#6a1b9a" }}
                        >
                          逆位置
                        </span>
                      )}
                    </p>
                    <div
                      className="inline-block mt-1 px-3 py-1 rounded-full text-xs"
                      style={{ background: "linear-gradient(135deg, #fff0f5, #f0e8ff)", color: "#e91e8c", border: "1px solid #fce4ec" }}
                    >
                      ✦ {fortune.card_data[0].keyword}
                    </div>
                  </div>
                </div>
              ) : (
                /* 3枚展開 */
                <div className="grid grid-cols-3 gap-2">
                  {fortune.card_data.map((card, i) => (
                    <div key={i} className="text-center">
                      {card.position && (
                        <div
                          className="text-xs font-bold mb-1 px-2 py-0.5 rounded-full inline-block"
                          style={{ background: "#fce4ec", color: "#c2185b" }}
                        >
                          {card.position}
                        </div>
                      )}
                      <div
                        className="p-1 rounded-xl mx-auto"
                        style={{
                          background: "linear-gradient(135deg, #ffd6e7, #e8d5ff, #d6f0ff)",
                          boxShadow: "0 4px 12px rgba(255,107,157,0.25)",
                        }}
                      >
                        <div
                          className="relative rounded-lg overflow-hidden bg-white"
                          style={{ aspectRatio: "2/3" }}
                        >
                          <Image
                            src={`/images/characters/${card.filename}`}
                            alt={card.nameJa}
                            fill
                            sizes="100px"
                            className="object-contain"
                            style={{ transform: card.isReversed ? "rotate(180deg)" : "none" }}
                          />
                        </div>
                      </div>
                      <p className="text-xs font-bold mt-1" style={{ color: "#3d2c2c", fontSize: "11px" }}>
                        {card.nameJa}
                      </p>
                      {card.isReversed && (
                        <span
                          className="inline-block mt-0.5 px-1 py-0.5 rounded-full"
                          style={{ background: "#e8d5ff", color: "#6a1b9a", fontSize: "9px" }}
                        >
                          逆位置
                        </span>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: "#e91e8c", fontSize: "10px" }}>
                        {card.keyword}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* カード名のみ保存（旧データ用フォールバック） */}
          {fortune.fortune_type === "tarot" && !fortune.card_data && fortune.card_names && fortune.card_names.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {fortune.card_names.map((name, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "#e8d5ff", color: "#6a1b9a" }}
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* ===== 数秘術：ライフパスナンバー + 今日の数字 ===== */}
          {fortune.fortune_type === "numerology" && fortune.life_path_number !== null && (
            <div
              className="rounded-2xl p-4 mb-4 text-center"
              style={{ background: "linear-gradient(145deg, #fff9f0, #fce4ec)" }}
            >
              <p className="text-xs font-bold mb-2" style={{ color: "#b08090" }}>
                ✦ ライフパスナンバー ✦
              </p>
              <div className="text-5xl font-bold mb-2" style={{ color: "#e91e8c" }}>
                {fortune.life_path_number}
              </div>
              {fortune.life_path_meaning && (
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs mb-2"
                  style={{ background: "#fff0f5", color: "#e91e8c" }}
                >
                  {fortune.life_path_meaning}
                </div>
              )}
              <div className="flex justify-center">
                <div
                  className="px-3 py-1 rounded-full text-xs"
                  style={{ background: "#e8d5ff", color: "#6a1b9a" }}
                >
                  この日の数字：{todayNumber}
                </div>
              </div>
            </div>
          )}

          {/* ===== 数秘術：マイカラー ===== */}
          {fortune.fortune_type === "numerology" && myColor && (
            <div
              className="rounded-2xl p-4 mb-4 text-center"
              style={{
                background: `linear-gradient(145deg, ${myColor.hex}55, ${myColor.hex}99)`,
                border: `2px solid ${myColor.hex}`,
              }}
            >
              <p className="text-xs font-bold mb-2" style={{ color: "#5a4a5a" }}>
                🎨 あなたのマイカラー
              </p>
              <div
                className="w-14 h-14 rounded-full mx-auto mb-2 shadow-lg border-4 border-white"
                style={{ background: myColor.hex }}
              />
              <p className="text-lg font-bold mb-1" style={{ color: "#3d2c2c" }}>
                {myColor.name}
              </p>
              <div
                className="inline-block px-3 py-1 rounded-full text-xs"
                style={{ background: "rgba(255,255,255,0.7)", color: "#5a4a5a" }}
              >
                {myColor.keyword}
              </div>
            </div>
          )}

          {/* ===== ダメ天使のセリフ ===== */}
          <div className="mb-3">
            <div className="flex items-start gap-2">
              <div className="relative w-9 h-9 flex-shrink-0 mt-0.5">
                <Image src="/images/characters/24_ANGEL.png" alt="ダメ天使" fill sizes="48px" className="object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold mb-1" style={{ color: "#c2185b" }}>ダメ天使</p>
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
                  style={{ background: "#fce4ec", color: "#3d2c2c" }}
                >
                  {fortune.angel_text}
                </div>
              </div>
            </div>
          </div>

          {/* ===== ダメ悪魔のセリフ ===== */}
          <div className="mb-3">
            <div className="flex items-start gap-2 flex-row-reverse">
              <div className="relative w-9 h-9 flex-shrink-0 mt-0.5">
                <Image src="/images/characters/25_DEVIL.png" alt="ダメ悪魔" fill sizes="48px" className="object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold mb-1 text-right" style={{ color: "#6a1b9a" }}>ダメ悪魔</p>
                <div
                  className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed"
                  style={{ background: "#e8d5ff", color: "#3d2c2c" }}
                >
                  {fortune.devil_text}
                </div>
              </div>
            </div>
          </div>

          {/* ===== まとめ ===== */}
          <div
            className="rounded-2xl px-4 py-3 text-center"
            style={{ background: "linear-gradient(135deg, #fff0f5, #f0e8ff)" }}
          >
            <p className="text-xs font-bold mb-1" style={{ color: "#888" }}>✦ 2人のまとめ ✦</p>
            <p className="text-sm leading-relaxed" style={{ color: "#3d2c2c" }}>
              {fortune.summary_text}
            </p>
          </div>

          {/* ===== タロット：ラッキーカラー ===== */}
          {fortune.fortune_type === "tarot" && fortune.lucky_color_name && fortune.lucky_color_hex && (
            <div
              className="rounded-2xl px-4 py-3 mt-3 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, #fff9f0, #fce4ec)" }}
            >
              <span className="text-xs font-bold flex-shrink-0" style={{ color: "#b08090" }}>
                🍀 今日のラッキーカラー
              </span>
              <span
                className="inline-block w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                style={{ background: fortune.lucky_color_hex }}
              />
              <span className="text-sm font-bold" style={{ color: "#3d2c2c" }}>
                {fortune.lucky_color_name}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryClient({ fortunes }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #fff0f5 0%, #f0f8ff 50%, #fff9e6 100%)",
      }}
    >
      <Header />
      <div
        className="w-full py-3 px-6 flex items-center justify-between"
        style={{ borderBottom: "1px solid #fce4ec" }}
      >
        <Link href="/" className="text-sm font-medium flex items-center gap-1" style={{ color: "#c2185b" }}>
          ← もどる
        </Link>
        <h1 className="text-base font-bold" style={{ color: "#3d2c2c" }}>📖 占い履歴</h1>
        <div style={{ width: "60px" }} />
      </div>

      <main className="flex-1 flex flex-col items-center px-5 py-8">
        <div className="w-full max-w-md">
          {fortunes.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <Image src="/images/characters/24_ANGEL.png" alt="ダメ天使" fill sizes="200px" className="object-contain" />
              </div>
              <div className="rounded-2xl p-4 mb-4 text-sm" style={{ background: "#fce4ec", color: "#c2185b" }}>
                えっと〜、まだ占い履歴がないよ〜？✨<br />
                早速占いに行ってみようよ〜！
              </div>
              <div className="rounded-2xl p-4 text-sm mb-8" style={{ background: "#e8d5ff", color: "#6a1b9a" }}>
                まあ…最初は誰でも0件なんだから。<br />
                さっさと占ってきなさいよ。
              </div>
              <div className="space-y-3">
                <Link
                  href="/uranai"
                  className="block w-full py-4 px-8 rounded-full text-white text-base font-bold text-center shadow-lg transition-all duration-200 hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #ff6b9d, #c64dd1)" }}
                >
                  タロット占いへ
                </Link>
                <Link
                  href="/sujimei"
                  className="block w-full py-3 px-8 rounded-full text-center text-sm font-medium border-2 transition-all duration-200"
                  style={{ borderColor: "#fce4ec", color: "#c2185b", background: "#ffffff" }}
                >
                  数秘術占いへ
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-center mb-5" style={{ color: "#b08090" }}>
                最新{fortunes.length}件の占い履歴
              </p>
              {fortunes.map((f) => (
                <FortuneItem key={f.id} fortune={f} />
              ))}
              <div className="mt-6 space-y-3">
                <Link
                  href="/uranai"
                  className="block w-full py-4 px-8 rounded-full text-white text-base font-bold text-center shadow-lg transition-all duration-200 hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #ff6b9d, #c64dd1)" }}
                >
                  新しく占う
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
