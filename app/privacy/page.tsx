import Link from "next/link";
import Header from "@/components/Header";

export const metadata = {
  title: "プライバシーポリシー｜ダメ占い",
  description: "ダメ占いのプライバシーポリシーです。",
};

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #fff0f5 0%, #f0f8ff 50%, #fff9e6 100%)",
      }}
    >
      <Header />
      <div
        className="w-full py-3 px-6 flex items-center justify-between"
        style={{ borderBottom: "1px solid #fce4ec" }}
      >
        <Link href="/" className="text-sm font-medium flex items-center gap-1" style={{ color: "#c2185b" }}>
          ← もどる
        </Link>
        <h1 className="text-base font-bold" style={{ color: "#3d2c2c" }}>🔒 プライバシーポリシー</h1>
        <div style={{ width: "60px" }} />
      </div>

      <main className="flex-1 flex flex-col items-center px-5 py-8">
        <div
          className="w-full max-w-2xl rounded-3xl shadow-sm p-6 sm:p-8"
          style={{ background: "#ffffff" }}
        >
          <p className="text-xs mb-6" style={{ color: "#b08090" }}>
            最終更新日：2026年5月30日
          </p>

          <div
            className="rounded-2xl p-4 mb-8 text-sm leading-relaxed"
            style={{ background: "linear-gradient(135deg, #fff9f0, #fce4ec)", color: "#5d4037" }}
          >
            「ダメ占い」（以下「本サービス」）は、利用者の個人情報を以下の方針に基づき適切に取り扱います。
          </div>

          <Section title="1. 取得する情報">
            本サービスは、以下の情報を取得します。
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Googleアカウントでのログイン時：メールアドレス、表示名、プロフィール画像（Google経由）</li>
              <li>占い利用時：占いの種類・テーマ・結果、数秘術で入力された名前・生年月日</li>
              <li>アクセス情報：閲覧ページ、利用状況などの統計データ（Cookie・解析ツール経由）</li>
            </ul>
          </Section>

          <Section title="2. 利用目的">
            取得した情報は、占い機能の提供、占い履歴の表示、サービスの改善・分析、
            不正利用の防止のために利用します。
          </Section>

          <Section title="3. Cookie・アクセス解析">
            本サービスは、利用状況の把握とサービス改善のためにCookieおよびアクセス解析ツール（Vercel Analytics 等）を
            使用する場合があります。これらは個人を特定しない形で統計的に利用されます。
            ブラウザ設定によりCookieを無効化できますが、一部機能が利用できなくなる場合があります。
          </Section>

          <Section title="4. 第三者提供">
            運営者は、法令に基づく場合を除き、取得した個人情報を本人の同意なく第三者に提供しません。
            なお、認証（Google）・データ保管（Supabase）・解析等のために外部サービスを利用しており、
            これらの提供事業者のポリシーが適用されます。
          </Section>

          <Section title="5. データの保管">
            占い履歴等のデータは、データベースサービス（Supabase）に保管されます。
            運営者は、情報の漏えい・滅失・毀損の防止に努めます。
          </Section>

          <Section title="6. データの削除・開示請求">
            利用者は、自己の個人情報の開示・訂正・削除を請求できます。
            アカウントおよび占い履歴の削除をご希望の場合は、下記お問い合わせ先までご連絡ください。
          </Section>

          <Section title="7. 本ポリシーの改定">
            運営者は、必要に応じて本ポリシーを改定することがあります。
            変更後のポリシーは、本ページに掲載した時点から効力を生じます。
          </Section>

          <Section title="8. お問い合わせ">
            運営者：【運営者名を記載してください】
            <br />
            お問い合わせ：【問い合わせ先メールアドレスを記載してください】
          </Section>
        </div>

        <div className="mt-6">
          <Link href="/" className="text-sm underline" style={{ color: "#c2185b" }}>
            トップに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-sm font-bold mb-2" style={{ color: "#c2185b" }}>
        {title}
      </h2>
      <div className="text-sm leading-relaxed" style={{ color: "#5d4037" }}>
        {children}
      </div>
    </section>
  );
}
