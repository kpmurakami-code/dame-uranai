# ダメ占い デプロイ手順（Vercel）

> 運用コストの試算は [COST.md](COST.md) を参照（Anthropic API / Vercel / Supabase / ドメイン）。

## 0. 公開前チェックリスト

- [ ] `public/images/og.png`（1200×630）を配置した
- [ ] `app/terms/page.tsx` と `app/privacy/page.tsx` の【運営者名】【問い合わせ先メール】を記入した
- [ ] 利用規約・プライバシーポリシーの内容を確認した（必要なら専門家に相談）

## 1. 必要な環境変数

| 変数名 | 用途 | 取得元 |
|---|---|---|
| `ANTHROPIC_API_KEY` | AI占いの生成 | https://console.anthropic.com |
| `NEXT_PUBLIC_SUPABASE_URL` | 認証・占い履歴 | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 認証・占い履歴 | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SITE_URL` | OGP画像の絶対URL | デプロイ後の本番ドメイン（例 `https://dame-uranai.vercel.app`） |

## 2. デプロイ（GitHub + Vercel 連携・推奨）

1. **GitHubリポジトリを作成**し、このプロジェクトを push する
   - `.gitignore` に `.env.local` `node_modules` `.next` が含まれていることを確認（機密情報を上げない）
2. **Vercel** （https://vercel.com）でアカウント作成 → 「Add New Project」→ 該当リポジトリを Import
3. **Environment Variables** に上記4つを登録
   - `NEXT_PUBLIC_SITE_URL` は初回は仮（後で確定値に更新）
4. **Deploy** を実行
5. 発行された本番URL（例 `https://dame-uranai.vercel.app`）を確認

## 3. 本番URL確定後の追加設定

1. Vercel の環境変数 `NEXT_PUBLIC_SITE_URL` を**本番URLに更新** → 再デプロイ
2. **Supabase** → Authentication → URL Configuration
   - **Site URL**: 本番URL（例 `https://dame-uranai.vercel.app`）
   - **Redirect URLs** に追加: `https://（本番ドメイン）/auth/callback`
   - ※ ローカル開発用の `http://localhost:3000/auth/callback` も残しておくと両方で動作
3. **Google Cloud Console** の OAuth リダイレクトURIは Supabase の
   `https://（プロジェクト）.supabase.co/auth/v1/callback` のままで変更不要
   （アプリの redirectTo は各環境の origin を使うため、Supabase 側の許可リスト追加だけでOK）

## 4. Vercel Web Analytics の有効化

- Vercel ダッシュボード → プロジェクト → **Analytics** タブから有効化
- コード側は `<Analytics />`（`app/layout.tsx`）導入済み。本番でのみ計測が動作する

## 5. 公開後の動作確認

- [ ] トップ・タロット・数秘術が表示される
- [ ] Googleログイン → 履歴保存 → 履歴ページ表示が動く
- [ ] 占い結果のシェア（画像DL・Xシェア）が動く
- [ ] SNSにURLを貼ってOGP画像（og.png）が表示される（X/各SNSのカードバリデータで確認）
