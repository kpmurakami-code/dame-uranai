"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

interface PaywallModalProps {
  onClose: () => void;
  isLoggedIn: boolean;
  source?: string; // どの占いから表示されたか（"tarot" | "numerology"）
}

export default function PaywallModal({ onClose, isLoggedIn, source = "unknown" }: PaywallModalProps) {
  useEffect(() => {
    analytics.paywallShown(source, isLoggedIn);
  }, [source, isLoggedIn]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #fff0f5 0%, #f0f8ff 60%, #fff9e6 100%)",
        }}
      >
        {/* キャラクター */}
        <div
          className="flex justify-center gap-4 pt-6 pb-2 px-6"
          style={{ background: "linear-gradient(135deg, #fce4ec, #e8d5ff)" }}
        >
          <div className="relative w-16 h-16">
            <Image
              src="/images/characters/24_ANGEL.png"
              alt="ダメ天使"
              fill
              sizes="200px"
              className="object-contain float-animation"
            />
          </div>
          <div className="relative w-16 h-16">
            <Image
              src="/images/characters/25_DEVIL.png"
              alt="ダメ悪魔"
              fill
              sizes="200px"
              className="object-contain float-animation-reverse"
            />
          </div>
        </div>

        <div className="px-5 pb-6 pt-4 space-y-3">
          {isLoggedIn ? (
            /* ログイン済み：1日の安全上限に達した（実質無制限のため通常は出ない） */
            <>
              <div
                className="rounded-2xl p-3 text-sm leading-relaxed"
                style={{ background: "#fff9f0", borderLeft: "3px solid #ffb7c5" }}
              >
                <span className="text-xs font-bold block mb-1" style={{ color: "#c2185b" }}>
                  ダメ天使
                </span>
                <p style={{ color: "#5d4037" }}>
                  えっと〜、今日はもうたくさん占ったね〜！✨
                  またあした、いっぱい占おうね〜？（ふわっと）
                </p>
              </div>
              <div
                className="rounded-2xl p-3 text-sm leading-relaxed"
                style={{ background: "#f5f0ff", borderLeft: "3px solid #ce93d8" }}
              >
                <span className="text-xs font-bold block mb-1" style={{ color: "#6a1b9a" }}>
                  ダメ悪魔
                </span>
                <p style={{ color: "#4a148c" }}>
                  今日の分は使い切ったわ。まあ、こんなに占ったんだから十分でしょ。
                  明日また来なさいよ。待ってあげるから。
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-full font-bold text-sm shadow-md transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #ff6b9d, #c64dd1)",
                  color: "#fff",
                }}
              >
                また明日来るね
              </button>
            </>
          ) : (
            /* 未ログイン：ゲスト3回制限に達した */
            <>
              <div
                className="rounded-2xl p-3 text-sm leading-relaxed"
                style={{ background: "#fff9f0", borderLeft: "3px solid #ffb7c5" }}
              >
                <span className="text-xs font-bold block mb-1" style={{ color: "#c2185b" }}>
                  ダメ天使
                </span>
                <p style={{ color: "#5d4037" }}>
                  3回も占ってくれてありがとう〜！✨
                  登録すると占い放題になるよ〜！無料だよ〜？（ふわっと）
                </p>
              </div>
              <div
                className="rounded-2xl p-3 text-sm leading-relaxed"
                style={{ background: "#f5f0ff", borderLeft: "3px solid #ce93d8" }}
              >
                <span className="text-xs font-bold block mb-1" style={{ color: "#6a1b9a" }}>
                  ダメ悪魔
                </span>
                <p style={{ color: "#4a148c" }}>
                  Googleアカウントで1秒で登録できるわ。
                  登録すれば回数制限なしで使えるんだから、やらない理由ないでしょ。
                </p>
              </div>
              <Link
                href="/auth/login"
                className="block w-full py-3 rounded-full text-center font-bold text-sm shadow-md transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #ff6b9d, #c64dd1)",
                  color: "#fff",
                }}
                onClick={onClose}
              >
                Googleで登録して占い放題
              </Link>
              <button
                onClick={onClose}
                className="w-full py-2 text-sm"
                style={{ color: "#b08090" }}
              >
                閉じる
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
