// サイトの本番URL。シェアリンクは常に本番ドメインを指す必要があるため、
// ローカル/プレビューでも NEXT_PUBLIC_SITE_URL（未設定時は本番）を使う。
// NEXT_PUBLIC_ なのでクライアントコンポーネントからも参照可（ビルド時にインライン化）。
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dame-uranai.com";
