"use client";

// フリーミアム判定の権威はサーバー（/api/usage と各占いAPIの 402）。
// このモジュールは「残り回数の表示」用の薄いクライアントヘルパー。
// 実際の回数記録・制限はサーバー側（lib/usageGate.ts）が行う。

/** 残り回数・ログイン状態をサーバー（/api/usage）から取得 */
export async function checkFreemiumLimit(): Promise<{
  limited: boolean;
  isLoggedIn: boolean;
  isPremium: boolean;
  remaining: number;
}> {
  try {
    const res = await fetch("/api/usage", { cache: "no-store" });
    if (!res.ok) {
      // 取得失敗時は楽観的に通す（最終的な制限はサーバーの 402 が担保）
      return { limited: false, isLoggedIn: false, isPremium: false, remaining: 3 };
    }
    const { isLoggedIn, remaining } = (await res.json()) as {
      isLoggedIn: boolean;
      remaining: number;
    };
    return { limited: remaining <= 0, isLoggedIn, isPremium: false, remaining };
  } catch {
    return { limited: false, isLoggedIn: false, isPremium: false, remaining: 3 };
  }
}
