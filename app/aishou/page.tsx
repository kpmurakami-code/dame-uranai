import AishouClient from "./AishouClient";
import { SITE_URL } from "@/lib/site";

const title = "相性占い｜ダメ占い";
const description =
  "気になるあの人との相性、ダメ天使＆ダメ悪魔が本音で占うよ💞 名前だけでOK・登録なし・無料。相性スコアをチェックして #ダメ占い でシェアしよう！";

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/aishou`,
    images: ["/images/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/og.png"],
  },
};

export default function AishouPage() {
  return <AishouClient />;
}
