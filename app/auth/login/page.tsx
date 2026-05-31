import LoginClient from "./LoginClient";

export const metadata = {
  title: "ログイン｜ダメ占い",
  description:
    "Googleアカウントでダメ占いにログイン。登録すると占い放題・占い履歴が使えるよ。",
};

export default function LoginPage() {
  return <LoginClient />;
}
