import { cookies } from "next/headers";
import { createSupabaseServerClient } from "./supabase-server";
import { createSupabaseAdminClient } from "./supabase-admin";

// ⚠️ サーバー専用。クライアントコンポーネントから import しないこと。

export const GUEST_LIMIT = 3; // 匿名：累計（デバイス単位・日次リセットなし）
export const USER_DAILY_SAFETY_LIMIT = 50; // ログイン：1日の安全上限（実質無制限のコスト暴走防止）
const DEVICE_COOKIE = "du_did";

export type FortuneType = "tarot" | "numerology";

type Subject =
  | { kind: "user"; id: string }
  | { kind: "device"; id: string };

function todayJstStartISO(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `${jst.toISOString().slice(0, 10)}T00:00:00+09:00`;
}

// ログインユーザー or 匿名デバイスを特定。匿名で Cookie が無ければ発行（Set-Cookie）。
async function resolveSubject(): Promise<Subject> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return { kind: "user", id: user.id };

  const jar = await cookies();
  let did = jar.get(DEVICE_COOKIE)?.value;
  if (!did) {
    did = crypto.randomUUID();
    jar.set(DEVICE_COOKIE, did, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 400, // 約400日
    });
  }
  return { kind: "device", id: did };
}

// 使用回数を集計。admin が無い/エラー時は null（＝フェイルオープン）。
async function countUsage(subject: Subject): Promise<number | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  let query = admin
    .from("usage_counts")
    .select("*", { count: "exact", head: true });
  if (subject.kind === "user") {
    query = query.eq("user_id", subject.id).gte("used_at", todayJstStartISO());
  } else {
    query = query.eq("device_id", subject.id);
  }
  const { count, error } = await query;
  if (error) {
    console.error("usage count error:", error.message);
    return null;
  }
  return count ?? 0;
}

export type UsageStatus = {
  isLoggedIn: boolean;
  remaining: number; // 表示用。ログインは無制限扱いの番兵（9999）
  limited: boolean;
  reason: "guest" | "daily" | null;
};

// 表示用ステータス（GET /api/usage）。ログインは番兵9999で「無制限」を表す。
export async function getUsageStatus(): Promise<UsageStatus> {
  const subject = await resolveSubject();
  if (subject.kind === "user") {
    return { isLoggedIn: true, remaining: 9999, limited: false, reason: null };
  }
  const used = await countUsage(subject);
  if (used === null) {
    // フェイルオープン：上限ぶん残っている扱い
    return { isLoggedIn: false, remaining: GUEST_LIMIT, limited: false, reason: null };
  }
  const remaining = Math.max(0, GUEST_LIMIT - used);
  return {
    isLoggedIn: false,
    remaining,
    limited: remaining <= 0,
    reason: remaining <= 0 ? "guest" : null,
  };
}

// 占い実行時の消費。超過なら limited:true（記録しない）。OKなら1件記録して通す。
export async function consumeUsage(
  fortuneType: FortuneType
): Promise<{ limited: boolean; reason: "guest" | "daily" | null; isLoggedIn: boolean }> {
  const subject = await resolveSubject();
  const isLoggedIn = subject.kind === "user";
  const limit = isLoggedIn ? USER_DAILY_SAFETY_LIMIT : GUEST_LIMIT;

  const used = await countUsage(subject);
  if (used === null) {
    // フェイルオープン：設定漏れ時はアプリを止めない（記録もしない）
    return { limited: false, reason: null, isLoggedIn };
  }
  if (used >= limit) {
    return { limited: true, reason: isLoggedIn ? "daily" : "guest", isLoggedIn };
  }

  const admin = createSupabaseAdminClient();
  if (admin) {
    const row: { fortune_type: FortuneType; user_id?: string; device_id?: string } = {
      fortune_type: fortuneType,
    };
    if (subject.kind === "user") row.user_id = subject.id;
    else row.device_id = subject.id;
    const { error } = await admin.from("usage_counts").insert(row);
    if (error) console.error("usage insert error:", error.message);
  }
  return { limited: false, reason: null, isLoggedIn };
}
