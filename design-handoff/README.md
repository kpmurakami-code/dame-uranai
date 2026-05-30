# LP デザイン引き継ぎ（Claude Design 用）

`app/page.tsx`（ダメ占いのランディングページ・v2.1 リデザイン版）を、単体で開いて
編集できるように静的HTML化したものです。

## ファイル
- **`lp-current.html`** … 現状LPの自己完結スナップショット。これを Claude Design に渡してください。

## 使い方
1. `lp-current.html` をそのまま Claude Design（またはブラウザ／任意のデザインツール）で開く。
   - Tailwind は CDN、フォントは Google Fonts、画像は本番CDN
     （`https://dame-uranai.vercel.app/images/...`）を参照するため、**ネット接続があれば
     追加ファイル不要でそのまま正しく表示**されます。
2. 見た目・コピー・レイアウトを自由に編集してもらう。
3. 編集後のHTMLを受け取り、`app/page.tsx` に反映する（下記）。

## 守ってほしい制約（HTML冒頭コメントにも記載）
1. キャラ選択は提供しない（「天使メイン／悪魔メイン」など “選べる” 表現を置かない。
   2人は常にセット。役割表現「ふわっと担当／ズバッと担当」までは可）。
2. 虚偽の利用者数・口コミ・★評価などは出さない（実データが無いため）。
3. レスポンシブ必須。特に「PCで中央に細い帯＋左右が広大な余白」状態に戻さない
   （コンテナは `max-w-5xl`〜`max-w-6xl` を活用）。
4. ゆるかわトーン・既存カラートークン・キャラ画像を踏襲する。

## 実装へ戻す時（開発者向け）
- class はすべて Tailwind、インライン style もそのまま `app/page.tsx` に対応します。
- `<img src="https://dame-uranai.vercel.app/images/...">` → next/image の
  `<Image src="/images/...">`（`fill`+`sizes` または `width`/`height` を付与）。
- `<a href="https://dame-uranai.vercel.app/...">` → next/link の `<Link href="/...">`。
- 「今日のひとこと」の中身は実装では `<DailyMessage />`（`/api/daily` 連動）。
  HTML内の吹き出しは見た目確認用のサンプルなので、変更対象はガワ（枠・配色・余白）。
- カスタムアニメ（float / floatReverse / sparkle）は `app/globals.css` に定義済み。

## カラートークン早見
| 用途 | 値 |
|------|----|
| ページ背景 | `linear-gradient(135deg,#fff0f5,#f0f8ff,#fff9e6)` |
| メインピンク | `#e91e8c` |
| 主CTAグラデ | `linear-gradient(135deg,#ff6b9d,#c64dd1)` |
| 副/数秘術グラデ | `linear-gradient(135deg,#a78bfa,#7c3aed)` |
| 本文(濃/中/淡) | `#3d2c2c` / `#7a6060` / `#b08090` |
| 天使アクセント | `#c2185b` |
| 悪魔アクセント | `#6a1b9a` / `#7c3aed` |
