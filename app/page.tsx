import Image from "next/image";
import Link from "next/link";
import DailyMessage from "./DailyMessage";
import Header from "@/components/Header";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #fff0f5 0%, #f0f8ff 50%, #fff9e6 100%)",
      }}
    >
      {/* ヘッダー */}
      <Header />

      {/* ヒーローセクション */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
        {/* タイトル */}
        <div className="mb-6">
          <p className="text-sm sm:text-base font-medium mb-1" style={{ color: "#b08090" }}>
            ダメ天使＆ダメ悪魔の
          </p>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-3"
            style={{ color: "#e91e8c" }}
          >
            ダメ占い
          </h1>
          <p className="text-sm sm:text-base" style={{ color: "#7a6060" }}>
            甘い天使と毒舌悪魔の本音占い。
            <br className="sm:hidden" />
            くすっと笑えて、でも本気で当たる ✨
          </p>
        </div>

        {/* キャラクター画像エリア */}
        <div className="relative w-full max-w-sm mx-auto mb-8">
          <div
            className="absolute -top-4 left-4 text-2xl sparkle-animation"
            style={{ color: "#ffb7c5" }}
          >
            ✦
          </div>
          <div
            className="absolute -top-2 right-8 text-xl sparkle-animation"
            style={{ animationDelay: "0.5s", color: "#b8e4f7" }}
          >
            ★
          </div>
          <div
            className="absolute bottom-4 left-2 text-lg sparkle-animation"
            style={{ animationDelay: "1s", color: "#ffd6e7" }}
          >
            ✧
          </div>

          {/* キャラクターペア画像 */}
          <div
            className="relative rounded-3xl overflow-hidden shadow-xl"
            style={{
              background: "linear-gradient(145deg, #fce4ec, #e3f4fd)",
            }}
          >
            <div className="p-4">
              <Image
                src="/images/characters/26_ANGEL_DEVIL_PAIR.png"
                alt="ダメ天使とダメ悪魔"
                width={400}
                height={400}
                className="w-full object-contain float-animation"
                priority
              />
            </div>
          </div>
        </div>

        {/* CTAボタン */}
        <div className="w-full max-w-xs mx-auto mb-6">
          <Link
            href="/uranai"
            className="block w-full py-4 px-8 rounded-full text-white text-lg font-bold text-center shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #ff6b9d, #c64dd1)",
            }}
          >
            タロット占いをする
          </Link>
          <Link
            href="/sujimei"
            className="block w-full py-3 px-8 rounded-full text-center text-sm font-bold mt-3 shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
              color: "#ffffff",
            }}
          >
            数秘術占いも試してみる
          </Link>
          <p className="text-xs mt-3" style={{ color: "#b08090" }}>
            ✦ 無料で3回体験できるよ ✦
          </p>
        </div>

        {/* 今日のひとこと */}
        <div className="w-full max-w-md mx-auto mb-10">
          <h2
            className="text-base font-bold mb-4 text-center"
            style={{ color: "#3d2c2c" }}
          >
            今日のひとこと
          </h2>
          <DailyMessage />
        </div>

        {/* キャラクター紹介 */}
        <div className="w-full max-w-md mx-auto mb-10">
          <h2
            className="text-base font-bold mb-4"
            style={{ color: "#3d2c2c" }}
          >
            占い師紹介
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* ダメ天使 */}
            <div
              className="rounded-2xl p-4 text-center shadow-md"
              style={{
                background: "linear-gradient(145deg, #fff9f0, #fce4ec)",
              }}
            >
              <div className="relative w-20 h-20 mx-auto mb-3">
                <Image
                  src="/images/characters/24_ANGEL.png"
                  alt="ダメ天使"
                  fill
                  sizes="200px"
                  className="object-contain float-animation"
                />
              </div>
              <h3
                className="font-bold text-sm mb-1"
                style={{ color: "#c2185b" }}
              >
                ダメ天使
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#7a6060" }}
              >
                ポジティブ寄り占い師。
                <br />
                ふわっとした
                <br />
                アドバイスをくれるよ〜
              </p>
              <div
                className="mt-2 text-xs px-2 py-1 rounded-full inline-block"
                style={{ background: "#fce4ec", color: "#c2185b" }}
              >
                天使メイン
              </div>
            </div>

            {/* ダメ悪魔 */}
            <div
              className="rounded-2xl p-4 text-center shadow-md"
              style={{
                background: "linear-gradient(145deg, #f0f0ff, #e8d5ff)",
              }}
            >
              <div className="relative w-20 h-20 mx-auto mb-3">
                <Image
                  src="/images/characters/25_DEVIL.png"
                  alt="ダメ悪魔"
                  fill
                  sizes="200px"
                  className="object-contain float-animation-reverse"
                />
              </div>
              <h3
                className="font-bold text-sm mb-1"
                style={{ color: "#6a1b9a" }}
              >
                ダメ悪魔
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#7a6060" }}
              >
                辛口リアリスト占い師。
                <br />
                本音でズバッと
                <br />
                言ってくれるよ
              </p>
              <div
                className="mt-2 text-xs px-2 py-1 rounded-full inline-block"
                style={{ background: "#e8d5ff", color: "#6a1b9a" }}
              >
                悪魔メイン
              </div>
            </div>
          </div>
        </div>

        {/* サービス特徴 */}
        <div className="w-full max-w-md mx-auto mb-10">
          <h2
            className="text-base font-bold mb-4"
            style={{ color: "#3d2c2c" }}
          >
            このサービスの特徴
          </h2>
          <div className="space-y-3">
            {[
              {
                src: "/images/features/tarot.png",
                alt: "タロット占い：1枚〜3枚のカードで今の運勢を見てみよう",
                ratio: "1774 / 887",
              },
              {
                src: "/images/features/numerology.png",
                alt: "数秘術占い：生年月日からライフパスナンバーと今日の運勢を診断",
                ratio: "1774 / 887",
              },
              {
                src: "/images/features/fun.png",
                alt: "くすっと笑える：2人のぬけてる掛け合いが楽しい",
                ratio: "1774 / 887",
              },
              {
                src: "/images/features/free1.png",
                alt: "無料で体験：登録なしで3回まで無料で占えるよ",
                ratio: "1672 / 941",
              },
            ].map((item) => (
              <div
                key={item.src}
                className="relative w-full rounded-2xl overflow-hidden shadow-sm"
                style={{ aspectRatio: item.ratio }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 448px"
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 下部CTA */}
        <div className="w-full max-w-xs mx-auto mb-12 space-y-3">
          <Link
            href="/uranai"
            className="block w-full py-4 px-8 rounded-full text-white text-lg font-bold text-center shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #ff6b9d, #c64dd1)",
            }}
          >
            タロット占いをする！
          </Link>
          <Link
            href="/sujimei"
            className="block w-full py-3 px-8 rounded-full text-white text-base font-bold text-center shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
            }}
          >
            数秘術占いをする！
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer
        className="py-6 px-6 text-center text-xs"
        style={{ color: "#b08090", borderTop: "1px solid #fce4ec" }}
      >
        <div className="flex items-center justify-center gap-4 mb-3">
          <Link href="/terms" className="underline" style={{ color: "#b08090" }}>
            利用規約
          </Link>
          <Link href="/privacy" className="underline" style={{ color: "#b08090" }}>
            プライバシーポリシー
          </Link>
        </div>
        <p>© 2026 ダメ占い</p>
        <p className="mt-1">Dame Uranai - ダメ天使＆ダメ悪魔の本音占い</p>
      </footer>
    </main>
  );
}
