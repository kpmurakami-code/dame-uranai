"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { analytics } from "@/lib/analytics";

export default function LoginClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    analytics.loginStart("login_page");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Googleログインに失敗しました。もう一度お試しください。");
      setIsLoading(false);
    }
    // 成功時はGoogleの認証画面にリダイレクトされるためここには戻ってこない
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{
        background: "linear-gradient(135deg, #fff0f5 0%, #f0f8ff 50%, #fff9e6 100%)",
      }}
    >
      {/* ヘッダーリンク */}
      <div className="w-full max-w-sm mb-6 flex items-center justify-between">
        <Link href="/" className="text-xs" style={{ color: "#b08090" }}>
          ← トップへ戻る
        </Link>
        <span className="text-xs tracking-widest" style={{ color: "#ffb7c5" }}>
          ✦ ダメ占い ✦
        </span>
      </div>

      {/* キャラクター */}
      <div className="flex justify-center gap-4 mb-6">
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

      <div
        className="w-full max-w-sm rounded-3xl shadow-xl overflow-hidden"
        style={{ background: "#ffffff" }}
      >
        <div className="p-7 space-y-5">
          {/* タイトル */}
          <div className="text-center space-y-1">
            <h1 className="text-lg font-bold" style={{ color: "#e91e8c" }}>
              ログイン
            </h1>
            <p className="text-xs" style={{ color: "#b08090" }}>
              Googleアカウントで続ける
            </p>
          </div>

          {/* キャラクターセリフ */}
          <div
            className="rounded-2xl p-3 text-xs leading-relaxed"
            style={{ background: "linear-gradient(135deg, #fff9f0, #fce4ec)" }}
          >
            <p style={{ color: "#7a6060" }}>
              <span className="font-bold" style={{ color: "#c2185b" }}>
                ダメ天使：
              </span>
              ログインすると占い放題になるよ〜！✨ Googleで1秒でできるよ〜？（ふわっと）
            </p>
            <p className="mt-1" style={{ color: "#4a148c" }}>
              <span className="font-bold" style={{ color: "#6a1b9a" }}>
                ダメ悪魔：
              </span>
              登録すれば回数制限なしよ。パスワードもなし。やらない理由、ある？
            </p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div
              className="rounded-2xl px-4 py-3 text-xs"
              style={{
                background: "#fff0f0",
                color: "#c62828",
                border: "1px solid #ef9a9a",
              }}
            >
              {error}
            </div>
          )}

          {/* Googleログインボタン */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 rounded-full text-sm font-bold shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3"
            style={{
              background: "#ffffff",
              color: "#3c4043",
              border: "1.5px solid #dadce0",
            }}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="spin-animation">✦</span>
                接続中...
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Googleでログイン
              </>
            )}
          </button>

          {/* 区切り */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "#fce4ec" }} />
            <span className="text-xs" style={{ color: "#b08090" }}>
              または
            </span>
            <div className="flex-1 h-px" style={{ background: "#fce4ec" }} />
          </div>

          {/* ゲスト利用の案内 */}
          <p className="text-center text-xs" style={{ color: "#b08090" }}>
            登録なしでも無料3回まで使えるよ ✦
            <br />
            <Link href="/" className="underline" style={{ color: "#ff6b9d" }}>
              ゲストとして占う
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
