import AishouClient from "./AishouClient";

export const metadata = {
  title: "相性占い｜ダメ占い",
  description:
    "あなたと気になるあの人の相性を、ダメ天使＆ダメ悪魔が無料で占うよ。相性スコアをチェックして #ダメ占い でシェアしよう！",
};

export default function AishouPage() {
  return <AishouClient />;
}
