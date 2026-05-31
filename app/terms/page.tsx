import Link from "next/link";
import Header from "@/components/Header";

export const metadata = {
  title: "利用規約｜ダメ占い",
  description: "ダメ占いの利用規約です。",
};

export default function TermsPage() {
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
        <h1 className="text-base font-bold" style={{ color: "#3d2c2c" }}>📜 利用規約</h1>
        <div style={{ width: "60px" }} />
      </div>

      <main className="flex-1 flex flex-col items-center px-5 py-8">
        <div
          className="w-full max-w-2xl rounded-3xl shadow-sm p-6 sm:p-8"
          style={{ background: "#ffffff" }}
        >
          <p className="text-xs mb-6" style={{ color: "#b08090" }}>
            最終更新日：2026年5月31日
          </p>

          <div
            className="rounded-2xl p-4 mb-8 text-sm leading-relaxed"
            style={{ background: "linear-gradient(135deg, #fff9f0, #fce4ec)", color: "#5d4037" }}
          >
            この利用規約（以下「本規約」）は、「ダメ占い」（以下「本サービス」）の利用条件を定めるものです。
            本サービスをご利用いただくことで、本規約に同意したものとみなします。
          </div>

          <Section title="第1条（本サービスの性質）">
            本サービスは、AIが生成するキャラクター「ダメ天使」「ダメ悪魔」による占いコンテンツを提供する、
            エンターテインメントを目的としたWebサービスです。占い結果は娯楽の範囲でお楽しみください。
          </Section>

          <Section title="第2条（AI生成コンテンツについて）">
            本サービスの占い結果・キャラクターのセリフは、AI（人工知能）によって自動生成されます。
            内容の正確性・有用性・特定目的への適合性を保証するものではありません。
          </Section>

          <Section title="第3条（占い結果の取り扱い）">
            占い結果は、医療・健康・法律・投資・その他の専門的な助言を提供するものではありません。
            健康・お金などのテーマを含め、重要な判断にあたっては必ず専門家にご相談ください。
            占い結果に基づくいかなる行動も、利用者ご自身の判断と責任において行うものとします。
          </Section>

          <Section title="第4条（利用条件・年齢）">
            未成年者が本サービスを利用する場合は、保護者の同意を得たうえでご利用ください。
            本サービスは予告なく内容の追加・変更・提供の停止を行うことがあります。
          </Section>

          <Section title="第5条（禁止事項）">
            利用者は、本サービスの利用にあたり、法令または公序良俗に違反する行為、
            本サービスの運営を妨害する行為、他の利用者・第三者・運営者の権利を侵害する行為、
            不正アクセスやリバースエンジニアリング、コンテンツの無断転載・商用利用を行ってはなりません。
          </Section>

          <Section title="第6条（知的財産権・キャラクターの著作権）">
            本サービスのキャラクター「ダメ天使」および「ダメ悪魔」のイラスト・デザイン・名称、
            ならびに本サービスに含まれるテキスト・ロゴ・画像等の著作権その他一切の知的財産権は、
            運営者に帰属します。これらを運営者の許可なく複製・改変・転載・配布・販売・商用利用する行為、
            およびキャラクター画像を単体で切り出して利用する行為（イラスト・スタンプ等としての二次利用を含む）を禁じます。
          </Section>

          <Section title="第7条（占い結果のシェアについて）">
            占い結果として表示・生成されるシェアカード画像は、利用者ご自身が非営利の範囲で
            SNS等に投稿・共有する目的に限り、画像をそのままの形でご利用いただけます。
            この場合も、画像の改変、キャラクター部分のみの切り出し、商用利用、再配布、
            第三者サービスへの組み込みは認められません。運営者は、本サービスやキャラクターの
            ブランド・信用を損なうと判断した利用について、利用の停止を求めることがあります。
          </Section>

          <Section title="第8条（免責事項）">
            運営者は、本サービスの利用または利用不能によって利用者に生じた一切の損害について、
            法令で認められる範囲において責任を負いません。
            本サービスは現状有姿で提供され、中断・エラー・不具合がないことを保証しません。
          </Section>

          <Section title="第9条（サービスの変更・終了）">
            運営者は、利用者への事前通知なく、本サービスの内容を変更し、または提供を終了することができます。
          </Section>

          <Section title="第10条（本規約の変更）">
            運営者は、必要に応じて本規約を変更することがあります。
            変更後の規約は、本ページに掲載した時点から効力を生じるものとします。
          </Section>

          <Section title="第11条（準拠法・管轄）">
            本規約は日本法に準拠し、本サービスに関して紛争が生じた場合は、
            運営者の所在地を管轄する裁判所を専属的合意管轄裁判所とします。
          </Section>

          <Section title="第12条（運営者・お問い合わせ）">
            運営者：ダメ占い管理人
            <br />
            お問い合わせ：dameuranai@gmail.com
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
      <p className="text-sm leading-relaxed" style={{ color: "#5d4037" }}>
        {children}
      </p>
    </section>
  );
}
