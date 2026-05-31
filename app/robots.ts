import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dame-uranai.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 認証・APIはクロール不要
      disallow: ["/auth/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
