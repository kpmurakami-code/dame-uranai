import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dame-uranai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/uranai", priority: 0.8 },
    { path: "/sujimei", priority: 0.8 },
    { path: "/aishou", priority: 0.8 },
    { path: "/terms", priority: 0.3 },
    { path: "/privacy", priority: 0.3 },
  ];
  return routes.map((r) => ({
    url: `${base}${r.path}`,
    changeFrequency: "weekly",
    priority: r.priority,
  }));
}
