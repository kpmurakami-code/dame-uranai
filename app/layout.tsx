import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// 本番URL。Vercelの環境変数 NEXT_PUBLIC_SITE_URL を本番ドメインに設定する（未設定時は下記を使用）。
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dame-uranai.com";
const siteName = "ダメ占い";
const title = "ダメ占い｜ダメ天使＆ダメ悪魔の本音占い";
const description =
  "“ダメ”なのは、かわいさのこと。ダメ天使＆ダメ悪魔のゆるかわコンビが、AIであなたを本音占い。甘い天使は褒めて、毒舌悪魔はズバッと。くすっと笑えて、でも本気で当たる。タロット・数秘術が登録なしで無料。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/images/og.png",
        width: 1731,
        height: 909,
        alt: "ダメ占い - ダメ天使＆ダメ悪魔の本音占い",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=M+PLUS+Rounded+1c:wght@400;500;700;800&family=Fredoka:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
