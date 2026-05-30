"use client";

import { createSupabaseBrowserClient } from "./supabase-browser";

export interface CardData {
  nameJa: string;
  filename: string;
  isReversed: boolean;
  position: string | null;
  keyword: string;
}

interface SaveFortuneParams {
  fortune_type: "tarot" | "numerology";
  theme?: string;
  angel_text: string;
  devil_text: string;
  summary_text: string;
  card_names?: string[];
  card_data?: CardData[];
  lucky_color_name?: string;
  lucky_color_hex?: string;
  life_path_number?: number;
  life_path_meaning?: string;
}

/** ログイン済みユーザーの占い結果を fortunes テーブルに保存する */
export async function saveFortune(params: SaveFortuneParams): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未ログインは保存しない（エラーにしない）
  if (!user) return;

  const { error } = await supabase.from("fortunes").insert({
    user_id: user.id,
    fortune_type: params.fortune_type,
    theme: params.theme ?? null,
    angel_text: params.angel_text,
    devil_text: params.devil_text,
    summary_text: params.summary_text,
    card_names: params.card_names ? JSON.stringify(params.card_names) : null,
    card_data: params.card_data ? JSON.stringify(params.card_data) : null,
    lucky_color_name: params.lucky_color_name ?? null,
    lucky_color_hex: params.lucky_color_hex ?? null,
    life_path_number: params.life_path_number ?? null,
    life_path_meaning: params.life_path_meaning ?? null,
  });

  if (error) {
    console.error("fortune save error:", error);
  }
}
