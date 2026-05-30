-- ============================================================
-- フリーミアム サーバー権威化（F-07 / SPEC v2.6）
-- usage_counts テーブルのセットアップ（冪等：何度実行してもOK）
-- Supabase → SQL Editor で実行してください。
-- ============================================================

-- テーブル（無ければ作成）
create table if not exists usage_counts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade, -- ログインユーザー（匿名はnull）
  device_id    text,                                             -- 匿名デバイス識別子（du_did Cookie）
  fortune_type text not null,                                    -- 'tarot' | 'numerology'
  used_at      timestamptz not null default now()
);

-- 既存テーブルがある場合の差分適用
alter table usage_counts add column if not exists device_id text;
alter table usage_counts alter column user_id drop not null;

-- 集計用インデックス
create index if not exists idx_usage_device on usage_counts (device_id, used_at);
create index if not exists idx_usage_user   on usage_counts (user_id, used_at);

-- RLS：読み書きはサーバーの service_role のみ（service_role は RLS をバイパスする）。
-- クライアント（anon / authenticated）からの直接アクセスは許可しない＝ポリシーを作らない。
alter table usage_counts enable row level security;

-- ※ もし旧実装で usage_counts に「ユーザー自身が insert/select できる」ポリシーが
--    残っている場合、本実装では不要（サーバーが service_role で書き込むため）。
--    残しても害はないが、整理したい場合は該当ポリシーを drop policy で削除してよい。
