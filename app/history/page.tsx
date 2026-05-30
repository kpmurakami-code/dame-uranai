import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import HistoryClient from "./HistoryClient";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未ログインはログインページにリダイレクト
  if (!user) {
    redirect("/auth/login");
  }

  const { data: fortunes, error } = await supabase
    .from("fortunes")
    .select("id, fortune_type, theme, angel_text, devil_text, summary_text, card_names, card_data, lucky_color_name, lucky_color_hex, life_path_number, life_path_meaning, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("fortunes fetch error:", error);
  }

  const normalized = (fortunes ?? []).map((f) => ({
    ...f,
    card_names: typeof f.card_names === "string" ? JSON.parse(f.card_names) : (f.card_names as string[] | null),
    // card_data は旧データ＝配列／新データ(v2.4)＝{cards,advice,flow} オブジェクト。
    // 解析だけ行い、形状の正規化はクライアント側 normalizeCardData が両対応する。
    card_data: typeof f.card_data === "string" ? JSON.parse(f.card_data) : f.card_data,
  }));

  // 型は HistoryClient 側の Fortune に委ねる（card_data は両形状あり得るため）
  return <HistoryClient fortunes={normalized as never} />;
}
