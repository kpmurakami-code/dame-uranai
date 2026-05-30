import UranaiClient from "./UranaiClient";

export const metadata = {
  title: "タロット占い｜ダメ占い",
  description:
    "タロットカードを引いて、ダメ天使とダメ悪魔があなたの運勢を占います！",
};

export default function UranaiPage() {
  return <UranaiClient />;
}
