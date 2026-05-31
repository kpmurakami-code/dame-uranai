-- ============================================================
-- プレミアム先行登録（需要検証）F-16 / SPEC v2.8
-- premium_interest テーブルのセットアップ（冪等）
-- Supabase → SQL Editor で実行してください。
-- ============================================================

create table if not exists premium_interest (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  source          text,        -- どのteaserから（'aishou' | 'tarot_result' 等）
  desired_feature text,        -- 'compat_full' | 'advanced_spread' | 'other'
  free_text       text,        -- 「その他」自由記入（ユーザーが欲しい機能の声）
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id)             -- 1人1件（再登録は upsert で更新）
);

-- 既存テーブルがある場合の差分適用（free_text 後付け）
alter table premium_interest add column if not exists free_text text;

create index if not exists idx_premium_interest_feature on premium_interest (desired_feature);
create index if not exists idx_premium_interest_source  on premium_interest (source);

-- RLS：読み書きはサーバーの service_role のみ（service_role は RLS をバイパス）。
alter table premium_interest enable row level security;

-- ============================================================
-- 需要の集計例（Pro不要・SQL Editorで実行）：
--   SELECT count(*) FROM premium_interest;                          -- 総登録数（ユニーク）
--   SELECT desired_feature, count(*) FROM premium_interest GROUP BY 1 ORDER BY 2 DESC;  -- 欲しい機能の人気
--   SELECT source, count(*) FROM premium_interest GROUP BY 1 ORDER BY 2 DESC;           -- どのteaser経由か
--   SELECT free_text FROM premium_interest WHERE free_text IS NOT NULL ORDER BY updated_at DESC;  -- 自由記入の声
-- ============================================================
