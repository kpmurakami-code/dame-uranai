"use client";

import { createSupabaseBrowserClient } from "./supabase-browser";

const GUEST_COUNT_KEY = "fortune_count";
const GUEST_LIMIT = 3;
const USER_DAILY_LIMIT = 3;

/** 未ログインユーザーの残り無料回数を取得 */
export function getGuestRemainingCount(): number {
  try {
    const raw = localStorage.getItem(GUEST_COUNT_KEY);
    const used = raw ? parseInt(raw, 10) : 0;
    return Math.max(0, GUEST_LIMIT - used);
  } catch {
    return GUEST_LIMIT;
  }
}

/** 未ログインユーザーの使用済み回数を取得 */
export function getGuestUsedCount(): number {
  try {
    const raw = localStorage.getItem(GUEST_COUNT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

/** 未ログインユーザーの使用回数をインクリメント */
export function incrementGuestCount(): void {
  try {
    const used = getGuestUsedCount();
    localStorage.setItem(GUEST_COUNT_KEY, String(used + 1));
  } catch {
    // localStorage が使えない環境では無視
  }
}

/** 未ログインユーザーが制限に達しているか */
export function isGuestLimitReached(): boolean {
  return getGuestUsedCount() >= GUEST_LIMIT;
}

/** 今日の日付文字列（JST）を返す */
function getTodayJSTString(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

/** ログイン済みユーザーの当日使用回数を Supabase から取得 */
export async function getUserDailyUsedCount(userId: string): Promise<number> {
  const supabase = createSupabaseBrowserClient();
  const today = getTodayJSTString();

  const { count, error } = await supabase
    .from("usage_counts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("used_at", `${today}T00:00:00+09:00`)
    .lt("used_at", `${today}T23:59:59+09:00`);

  if (error) {
    console.error("usage count fetch error:", error);
    return 0;
  }
  return count ?? 0;
}

/** ログイン済みユーザーが当日制限に達しているか確認 */
export async function isUserDailyLimitReached(userId: string): Promise<boolean> {
  const used = await getUserDailyUsedCount(userId);
  return used >= USER_DAILY_LIMIT;
}

/** ログイン済みユーザーの使用を記録 */
export async function recordUserUsage(
  userId: string,
  fortuneType: "tarot" | "numerology"
): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.from("usage_counts").insert({
    user_id: userId,
    fortune_type: fortuneType,
    used_at: new Date().toISOString(),
  });

  if (error) {
    console.error("usage record error:", error);
  }
}

/** 占い実行前チェック：制限に達していれば true */
export async function checkFreemiumLimit(): Promise<{
  limited: boolean;
  isLoggedIn: boolean;
  isPremium: boolean;
  remaining: number;
}> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // 未ログイン：localStorage チェック
    const limited = isGuestLimitReached();
    const remaining = getGuestRemainingCount();
    return { limited, isLoggedIn: false, isPremium: false, remaining };
  }

  // ログイン済み：制限なし
  return { limited: false, isLoggedIn: true, isPremium: false, remaining: 9999 };
}

/** 占い完了後に使用を記録 */
export async function recordFortuneUsage(
  fortuneType: "tarot" | "numerology"
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ゲストのみカウント
    incrementGuestCount();
  }
  // ログイン済みは制限なしのため記録不要
}
