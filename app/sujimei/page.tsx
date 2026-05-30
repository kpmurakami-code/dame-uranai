import SujimeiClient from "./SujimeiClient";

export const metadata = {
  title: "数秘術占い｜ダメ占い",
  description:
    "生年月日と名前を入力して、数秘術のライフパスナンバーに基づいた性格診断・今日の運勢を知ろう！",
};

export default function SujimeiPage() {
  return <SujimeiClient />;
}
