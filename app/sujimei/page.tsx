import SujimeiClient from "./SujimeiClient";
import { SITE_URL } from "@/lib/site";

const title = "数秘術占い｜ダメ占い";
const description =
  "生年月日と名前で占う数秘術🔢 ライフパスナンバーからあなたの本質を、ダメ天使＆ダメ悪魔が本音で読み解くよ。登録なし・無料。#ダメ占い";

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/sujimei`,
    images: ["/images/og-card.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/og-card.jpg"],
  },
};

export default function SujimeiPage() {
  return <SujimeiClient />;
}
