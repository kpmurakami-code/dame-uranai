"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { analytics } from "@/lib/analytics";

// プレミアム先行登録ボタン（F-16・需要検証 / フェイクドア）
// - ログイン必須。未ログインで送信すると 401 → ログイン誘導。
// - ログイン時は「一番ほしい機能」を1タップ選択し POST（upsert）。
// ⚠️ クライアント部品。lib/supabase-admin・lib/usageGate を import しないこと。

interface PremiumInterestButtonProps {
  source: string;
}

type Feature = "compat_full" | "advanced_spread" | "other";

const FEATURES: { key: Feature; label: string; emoji: string }[] = [
  { key: "compat_full", label: "相性のフル読み解き", emoji: "💞" },
  { key: "advanced_spread", label: "もっと本格的なタロット占い", emoji: "🔮" },
];

type Status = "idle" | "submitting" | "registered" | "need_login" | "error";

export default function PremiumInterestButton({ source }: PremiumInterestButtonProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  // マウント時の登録済みチェックが終わるまでボタンを出さない（チラつき防止）
  const [checked, setChecked] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [freeText, setFreeText] = useState("");

  // マウント時：登録済みかを確認
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/premium-interest", { cache: "no-store" });
        const data = (await res.json()) as { registered?: boolean };
        if (active && data.registered) setRegistered(true);
      } catch {
        // 取得失敗時は通常CTAを出す（登録は後で試せる）
      } finally {
        if (active) setChecked(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function handleOpen() {
    setOpen(true);
    setStatus("idle");
    analytics.premiumInterestOpen(source);
  }

  async function handlePick(feature: Feature, text?: string) {
    if (status === "submitting") return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/premium-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, desiredFeature: feature, freeText: text }),
      });
      if (res.status === 200) {
        setStatus("registered");
        setRegistered(true);
        analytics.premiumInterestRegistered(source, feature);
      } else if (res.status === 401) {
        setStatus("need_login");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  // 登録済み（マウント時 or 送信完了後）
  if (registered && !open) {
    return (
      <div
        className="rounded-2xl p-3 mb-6 text-center text-sm font-bold"
        style={{ background: "rgba(255,255,255,0.7)", color: "#7c3aed", border: "1px dashed #ddc9ff" }}
      >
        ✓ 先行登録ありがとう！公開したらお知らせするね〜
      </div>
    );
  }

  // 初期チェック中は何も出さない（誤って未登録CTAを見せない）
  if (!checked) return null;

  return (
    <div className="mb-6">
      {/* 初期CTA */}
      <button
        onClick={handleOpen}
        className="w-full py-3 px-6 rounded-full font-bold text-sm shadow-md transition-all hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #ff9ec4, #c64dd1)",
          color: "#fff",
        }}
      >
        ✨ プレミアムを先行登録
      </button>

      {/* パネル（モーダル） */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-5"
            style={{
              background: "linear-gradient(135deg, #fff0f5 0%, #f0f8ff 60%, #fff9e6 100%)",
            }}
          >
            {status === "registered" ? (
              /* 送信完了 */
              <div className="space-y-3 text-center">
                <p className="text-base font-bold" style={{ color: "#7c3aed" }}>
                  ありがとう！💕
                </p>
                <div
                  className="rounded-2xl p-3 text-sm leading-relaxed text-left"
                  style={{ background: "#fff9f0", borderLeft: "3px solid #ffb7c5" }}
                >
                  <span className="text-xs font-bold block mb-1" style={{ color: "#c2185b" }}>
                    ダメ天使
                  </span>
                  <p style={{ color: "#5d4037" }}>
                    公開したらお知らせするね〜！楽しみにしててね〜？（ふわっと）
                  </p>
                </div>
                <div
                  className="rounded-2xl p-3 text-sm leading-relaxed text-left"
                  style={{ background: "#f5f0ff", borderLeft: "3px solid #ce93d8" }}
                >
                  <span className="text-xs font-bold block mb-1" style={{ color: "#6a1b9a" }}>
                    ダメ悪魔
                  </span>
                  <p style={{ color: "#4a148c" }}>
                    ふん、楽しみにしてなさい。準備できたら呼んであげるわ。
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-3 rounded-full font-bold text-sm shadow-md transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #ff6b9d, #c64dd1)", color: "#fff" }}
                >
                  とじる
                </button>
              </div>
            ) : status === "need_login" ? (
              /* 未ログイン → ログイン誘導 */
              <div className="space-y-3 text-center">
                <p className="text-base font-bold" style={{ color: "#7c3aed" }}>
                  あとちょっと！
                </p>
                <p className="text-sm" style={{ color: "#5d4037" }}>
                  お知らせを受け取るにはログインしてね。Googleで1秒だよ〜。
                </p>
                <Link
                  href="/auth/login"
                  className="block w-full py-3 rounded-full text-center font-bold text-sm shadow-md transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #ff6b9d, #c64dd1)", color: "#fff" }}
                  onClick={() => analytics.loginStart("premium_interest")}
                >
                  Googleでログイン
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-2 text-sm"
                  style={{ color: "#b08090" }}
                >
                  閉じる
                </button>
              </div>
            ) : status === "error" ? (
              /* 失敗・混雑 */
              <div className="space-y-3 text-center">
                <p className="text-sm" style={{ color: "#5d4037" }}>
                  ちょっと混んでるみたい…🙏 あとでもう一度試してね。
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="w-full py-3 rounded-full font-bold text-sm shadow-md transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #ff6b9d, #c64dd1)", color: "#fff" }}
                >
                  もう一度えらぶ
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-2 text-sm"
                  style={{ color: "#b08090" }}
                >
                  閉じる
                </button>
              </div>
            ) : (
              /* 機能選択 */
              <div className="space-y-3">
                <p className="text-base font-bold text-center" style={{ color: "#7c3aed" }}>
                  プレミアム、ほしい？
                </p>
                <p className="text-xs text-center leading-relaxed" style={{ color: "#b08090" }}>
                  相性のフル読み解きや、もっと本格的なタロット占いが使えるようになるよ。近日公開予定！
                </p>
                <p className="text-sm font-bold text-center pt-1" style={{ color: "#5d4037" }}>
                  どんな機能がほしい？
                </p>
                <div className="space-y-2">
                  {FEATURES.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => handlePick(f.key)}
                      disabled={status === "submitting"}
                      className="w-full py-3 px-4 rounded-2xl text-sm font-bold text-left transition-all hover:scale-[1.02] disabled:opacity-60"
                      style={{ background: "#ffffff", color: "#6a1b9a", border: "2px solid #f0d9ff" }}
                    >
                      {f.emoji} {f.label}
                    </button>
                  ))}
                  {/* その他・自由記入 */}
                  <div
                    className="rounded-2xl p-3"
                    style={{ background: "#ffffff", border: "2px solid #f0d9ff" }}
                  >
                    <p className="text-xs font-bold mb-2" style={{ color: "#6a1b9a" }}>
                      📝 その他・こんな機能がほしい！
                    </p>
                    <textarea
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                      maxLength={200}
                      rows={2}
                      placeholder="例：毎月の運勢、ラッキーアイテム、着せ替え…"
                      className="w-full rounded-xl p-2 text-sm resize-none"
                      style={{ border: "1.5px solid #f0d9ff", color: "#3d2c2c", background: "#fffdfe" }}
                    />
                    <button
                      onClick={() => handlePick("other", freeText)}
                      disabled={status === "submitting" || !freeText.trim()}
                      className="w-full mt-2 py-2.5 px-4 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", color: "#fff" }}
                    >
                      これで登録する
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-2 text-sm"
                  style={{ color: "#b08090" }}
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
