-- ============================================================
-- ダメ占い 計測クエリ集（公開後の運用・課金設計用）
-- すべて読み取り専用。Supabase → SQL Editor に貼って実行。
-- ★ Vercel Pro / Supabase Pro いずれも不要（無料枠のSQL Editorで読める）。
-- 対象テーブル：premium_interest（F-16 需要検証）/ usage_counts（F-07 利用ログ）
-- 作成：2026-05-31
-- 注：used_at / created_at は timestamptz（UTC格納）。日次はJST変換して集計。
-- ============================================================


-- ============================================================
-- 1. 需要検証：プレミアム先行登録（premium_interest）
-- ============================================================

-- 1-1. 総登録数（ユニーク＝1人1件）
SELECT count(*) AS total_registrations FROM premium_interest;

-- 1-2. 欲しい機能の人気（相性フル / 本格タロット / その他）
SELECT desired_feature, count(*) AS n
FROM premium_interest
GROUP BY desired_feature
ORDER BY n DESC;

-- 1-3. どのteaser経由で登録したか（aishou / tarot_result 等）
SELECT source, count(*) AS n
FROM premium_interest
GROUP BY source
ORDER BY n DESC;

-- 1-4. 「その他」自由記入の生の声（新しい順）
SELECT updated_at, source, free_text
FROM premium_interest
WHERE free_text IS NOT NULL AND btrim(free_text) <> ''
ORDER BY updated_at DESC;

-- 1-5. 直近の登録一覧（ファネル確認用・50件）
SELECT created_at, source, desired_feature, free_text
FROM premium_interest
ORDER BY created_at DESC
LIMIT 50;


-- ============================================================
-- 2. 利用状況：フリーミアム利用ログ（usage_counts）
--    課金設計に直結する指標
-- ============================================================

-- 2-1. 総利用回数
SELECT count(*) AS total_uses FROM usage_counts;

-- 2-2. タロット vs 数秘術の人気比率
SELECT fortune_type, count(*) AS n
FROM usage_counts
GROUP BY fortune_type
ORDER BY n DESC;

-- 2-3. 匿名 vs ログインの内訳
SELECT
  CASE WHEN user_id IS NULL THEN '匿名' ELSE 'ログイン' END AS kind,
  count(*) AS uses,
  count(DISTINCT coalesce(device_id, user_id::text)) AS people
FROM usage_counts
GROUP BY 1
ORDER BY uses DESC;

-- 2-4. 1人（デバイス or ユーザー）あたり平均利用回数
SELECT round(
  count(*)::numeric
  / nullif(count(DISTINCT coalesce(device_id, user_id::text)), 0)
, 2) AS avg_uses_per_person
FROM usage_counts;

-- 2-5. 匿名3回制限の到達率（無料枠を使い切った人の割合）
--      ＝ 課金圧の指標。高いほど「無制限」の有料価値が効く。
SELECT
  count(*) FILTER (WHERE c >= 3)                       AS reached_limit,
  count(*)                                             AS total_devices,
  round(count(*) FILTER (WHERE c >= 3)::numeric / nullif(count(*), 0), 3) AS reach_rate
FROM (
  SELECT device_id, count(*) AS c
  FROM usage_counts
  WHERE device_id IS NOT NULL
  GROUP BY device_id
) t;

-- 2-6. 日次の利用推移（JST）
SELECT (used_at AT TIME ZONE 'Asia/Tokyo')::date AS day, count(*) AS uses
FROM usage_counts
GROUP BY 1
ORDER BY 1;

-- 2-7. ユニーク利用者数の推移（JST・デバイス/ユーザー単位）
SELECT
  (used_at AT TIME ZONE 'Asia/Tokyo')::date AS day,
  count(DISTINCT coalesce(device_id, user_id::text)) AS unique_people
FROM usage_counts
GROUP BY 1
ORDER BY 1;


-- ============================================================
-- 3. ファネル：利用 → 会員 → 先行登録 の転換
-- ============================================================

-- 3-1. ログインユーザー数（usage_countsに記録のある実利用者）
SELECT count(DISTINCT user_id) AS logged_in_users
FROM usage_counts
WHERE user_id IS NOT NULL;

-- 3-2. 先行登録の転換率（先行登録数 ÷ ログイン実利用者数）
--      ※ premium_interest はログイン必須なので分母はログイン利用者
SELECT
  (SELECT count(*) FROM premium_interest)                                          AS registrations,
  (SELECT count(DISTINCT user_id) FROM usage_counts WHERE user_id IS NOT NULL)      AS logged_in_users,
  round(
    (SELECT count(*) FROM premium_interest)::numeric
    / nullif((SELECT count(DISTINCT user_id) FROM usage_counts WHERE user_id IS NOT NULL), 0)
  , 3) AS interest_conversion_rate;
