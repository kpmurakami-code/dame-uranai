import UranaiClient from "./UranaiClient";
import { SITE_URL } from "@/lib/site";

const title = "タロット占い｜ダメ占い";
const description =
  "ダメ天使＆ダメ悪魔がタロットであなたを本音占い🔮 ほめ上手な天使と毒舌悪魔の掛け合いで、くすっと笑えて当たる。登録なし・無料。#ダメ占い";

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/uranai`,
    images: ["/images/og-card.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/og-card.jpg"],
  },
};

export default function UranaiPage() {
  return <UranaiClient />;
}
