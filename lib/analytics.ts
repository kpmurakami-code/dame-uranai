import { track } from "@vercel/analytics";

// Vercel Analytics カスタムイベントの許容プロパティ型
type EventProps = Record<string, string | number | boolean | null>;

// 計測はアプリ動作に影響させない（失敗は握りつぶす）。
function emit(name: string, props?: EventProps) {
  try {
    track(name, props);
  } catch {
    // 計測失敗は無視
  }
}

/**
 * ファネル計測イベント。
 * LP閲覧（ページビュー＝自動計測）→ 占い開始 → 占い完了 → シェア / ログイン、
 * およびペイウォール表示を計測する。すべてクライアント側から呼ぶ。
 */
export const analytics = {
  // タロット
  fortuneStart: (mode: string, theme: string) =>
    emit("fortune_start", { service: "tarot", mode, theme }),
  fortuneComplete: (mode: string, theme: string) =>
    emit("fortune_complete", { service: "tarot", mode, theme }),
  fortuneError: (mode: string, theme: string) =>
    emit("fortune_error", { service: "tarot", mode, theme }),

  // 数秘術
  numerologyStart: () => emit("numerology_start", { service: "numerology" }),
  numerologyComplete: () => emit("numerology_complete", { service: "numerology" }),
  numerologyError: () => emit("numerology_error", { service: "numerology" }),

  // 相性占い（無料スコア版・AI呼び出しなし）
  compatStart: () => emit("compat_start", { service: "compatibility" }),
  compatComplete: (score: number) =>
    emit("compat_complete", { service: "compatibility", score }),
  compatShare: (method: "image" | "x") =>
    emit("compat_share", { service: "compatibility", method }),

  // シェア（source: "tarot" | "numerology" | "aishou" / method: ネイティブ共有/画像保存/X/LINE）
  shareClick: (source: string, method: "native" | "image" | "x" | "line") =>
    emit("share_click", { source, method }),

  // ログイン開始（Google OAuth へ遷移する直前）
  loginStart: (from: string) => emit("login_start", { from }),

  // ペイウォール表示（source: 占い種別 / 未ログインかログイン済みか）
  paywallShown: (source: string, isLoggedIn: boolean) =>
    emit("paywall_shown", { source, state: isLoggedIn ? "logged_in" : "guest" }),

  // プレミアム先行登録（F-16・需要検証）
  premiumInterestOpen: (source: string) =>
    emit("premium_interest_open", { source }),
  premiumInterestRegistered: (source: string, feature: string) =>
    emit("premium_interest_registered", { source, feature }),
};
