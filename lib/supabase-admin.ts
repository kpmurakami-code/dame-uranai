import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// サーバー専用クライアント。Service Roleキーで RLS をバイパスし、
// 使用回数（usage_counts）の読み書きを行う。
// ⚠️ クライアントコンポーネントから絶対に import しないこと（キーが露出する）。
// ⚠️ SUPABASE_SERVICE_ROLE_KEY に NEXT_PUBLIC_ を付けないこと。
export function createSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // キー未設定時は null を返し、呼び出し側はフェイルオープン（占いを止めない）。
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
