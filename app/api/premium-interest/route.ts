import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// プレミアム先行登録（需要検証 / フェイクドア）F-16
// - POST：ログイン必須。premium_interest に upsert（1人1件・user_id一致で更新）。
// - GET ：ログイン状態と登録済みかを返す（表示用）。
//
// ⚠️ service role キーはサーバー専用（このルートは Route Handler＝サーバー実行）。
//    クライアントコンポーネントから lib/supabase-admin を import しないこと。

const ALLOWED_FEATURES = ["compat_full", "advanced_spread", "other"];

// POST：先行登録（upsert）
export async function POST(req: Request) {
  // 1. ログイン確認（権威はサーバーの getUser）
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: "login_required" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  // 2. admin クライアント（service role）。キー未設定なら 503。
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json(
      { error: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  // 3. body を緩く受ける（壊れていても落とさない）
  let source: string | null = null;
  let desiredFeature: string | null = null;
  let freeText: string | null = null;
  try {
    const body = (await req.json()) as {
      source?: unknown;
      desiredFeature?: unknown;
      freeText?: unknown;
    };
    if (typeof body.source === "string") source = body.source.slice(0, 64);
    if (
      typeof body.desiredFeature === "string" &&
      ALLOWED_FEATURES.includes(body.desiredFeature)
    ) {
      desiredFeature = body.desiredFeature;
    }
    if (typeof body.freeText === "string") {
      const t = body.freeText.trim().slice(0, 200);
      if (t) freeText = t;
    }
  } catch {
    // body 無し/壊れ → null のまま登録（登録自体は意味があるので続行）
  }

  // 4. upsert（user_id 一致で更新。updated_at を必ず更新）
  const { error } = await admin
    .from("premium_interest")
    .upsert(
      {
        user_id: user.id,
        source,
        desired_feature: desiredFeature,
        free_text: freeText,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    return Response.json(
      { error: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// GET：ログイン状態＋登録済みか（表示用）
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { loggedIn: false, registered: false },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    // キー未設定：ログインはしているが登録状態は判定不可
    return Response.json(
      { loggedIn: true, registered: false },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const { data, error } = await admin
    .from("premium_interest")
    .select("desired_feature")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return Response.json(
      { loggedIn: true, registered: false },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return Response.json(
    {
      loggedIn: true,
      registered: true,
      desiredFeature: data.desired_feature ?? undefined,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
