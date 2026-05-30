import Image from "next/image";
import Link from "next/link";
import DailyMessage from "./DailyMessage";
import Header from "@/components/Header";

const CTA = "linear-gradient(135deg, #ff6b9d, #c64dd1)";
const GRAPE = "linear-gradient(135deg, #a78bfa, #7c3aed)";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #fff0f5 0%, #f3f1ff 42%, #eef7ff 70%, #fff9e6 100%)",
      }}
    >
      {/* ① ヘッダー */}
      <Header />

      <div className="flex-1 w-full">
        {/* ② ヒーロー：バナー主役（A案） */}
        <section className="relative px-5 sm:px-6 pt-8 pb-10 sm:pt-10 sm:pb-12">
          <span
            className="twinkle sparkle-animation"
            style={{ top: "8%", left: "7%", fontSize: 26, color: "#ffb7c5" }}
          >
            ✦
          </span>
          <span
            className="twinkle sparkle-animation"
            style={{
              top: "18%",
              right: "9%",
              fontSize: 20,
              color: "#b8e4f7",
              animationDelay: ".5s",
            }}
          >
            ★
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/lp/deco/heart_md.png"
            alt=""
            className="deco drift-animation"
            style={{ bottom: "16%", left: "5%", width: 42, opacity: 0.9 }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/lp/deco/moon.png"
            alt=""
            className="deco float-animation"
            style={{ top: "10%", right: "4%", width: 50 }}
          />

          <div className="mx-auto max-w-5xl">
            <div
              className="relative rounded-[2.2rem] overflow-hidden shadow-[0_22px_60px_-20px_rgba(200,77,209,.45)]"
              style={{ border: "3px solid #fff" }}
            >
              <Image
                src="/images/lp/hero/og.png"
                alt="ダメ占い — 甘い天使と毒舌悪魔の本音占い"
                width={1731}
                height={909}
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="w-full h-auto block"
              />
            </div>

            <div className="mt-7 text-center max-w-xl mx-auto">
              <p
                className="text-sm sm:text-base font-bold mb-4"
                style={{ color: "#7a6060" }}
              >
                ほめ上手な天使と、毒舌な悪魔。ぬけてる2人の掛け合いで、くすっと笑えて、でも本気で当たる占いを。
              </p>
              <Link
                href="/uranai"
                className="block w-full sm:w-auto sm:inline-block py-4 px-10 rounded-full text-white text-lg sm:text-xl font-extrabold text-center shadow-lg puni"
                style={{ background: CTA }}
              >
                無料でタロットを占う
              </Link>
              <p
                className="text-xs sm:text-sm mt-3 font-bold"
                style={{ color: "#b08090" }}
              >
                ✦ 登録なし・無料で3回 占えるよ ✦
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center mt-5 max-w-sm sm:max-w-none mx-auto">
                <Link
                  href="/sujimei"
                  className="py-2.5 px-6 rounded-full text-center text-sm font-bold border-2 puni"
                  style={{
                    borderColor: "#a78bfa",
                    color: "#7c3aed",
                    background: "rgba(255,255,255,.7)",
                  }}
                >
                  数秘術を試す
                </Link>
                <a
                  href="#daily"
                  className="py-2.5 px-6 rounded-full text-center text-sm font-bold border-2 puni"
                  style={{
                    borderColor: "#ffb7c5",
                    color: "#c2185b",
                    background: "rgba(255,255,255,.7)",
                  }}
                >
                  今日のひとこと
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ③ 占いメニュー */}
        <section className="relative px-5 sm:px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-9">
              <h2
                className="display text-2xl sm:text-3xl font-black mb-2"
                style={{ color: "#3d2c2c" }}
              >
                占いメニュー
              </h2>
              <p className="text-sm font-medium" style={{ color: "#7a6060" }}>
                気分に合わせて、占い方を選んでね。
              </p>
            </div>

            {/* タロット（主役）：1枚 / 3枚 */}
            <div
              className="rounded-[2rem] p-6 sm:p-8 shadow-lg mb-6"
              style={{
                background: "linear-gradient(150deg,#fff0f6,#ffe6f0)",
                border: "2px solid #ffb7c5",
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full text-white whitespace-nowrap"
                  style={{ background: CTA }}
                >
                  人気No.1
                </span>
                <h3
                  className="display text-xl sm:text-2xl font-black"
                  style={{ color: "#e91e8c" }}
                >
                  タロット占い
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <Link
                  href="/uranai"
                  className="puni block rounded-3xl p-4 shadow-md text-center"
                  style={{
                    background: "rgba(255,255,255,.65)",
                    border: "2px solid #ffd0e2",
                  }}
                >
                  <Image
                    src="/images/lp/menu/tarot_1mai.png"
                    alt="タロット1枚引き"
                    width={844}
                    height={771}
                    sizes="(max-width: 640px) 90vw, 420px"
                    className="w-full h-auto object-contain mb-3"
                  />
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#7a6060" }}
                  >
                    1枚でサクッと、今のあなたを占う。迷ったらまずはコレ。
                  </p>
                </Link>
                <Link
                  href="/uranai"
                  className="puni block rounded-3xl p-4 shadow-md text-center"
                  style={{
                    background: "rgba(255,255,255,.65)",
                    border: "2px solid #c9d4ff",
                  }}
                >
                  <Image
                    src="/images/lp/menu/tarot_3mai.png"
                    alt="タロット3枚引き"
                    width={862}
                    height={781}
                    sizes="(max-width: 640px) 90vw, 420px"
                    className="w-full h-auto object-contain mb-3"
                  />
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#7a6060" }}
                  >
                    3枚で過去・現在・未来までじっくり深く読み解く。
                  </p>
                </Link>
              </div>
            </div>

            {/* 数秘術 */}
            <div
              className="rounded-[2rem] p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center gap-5"
              style={{
                background: "linear-gradient(150deg,#f5f0ff,#ece1ff)",
                border: "2px solid #d8c4ff",
              }}
            >
              <Image
                src="/images/lp/scene/angel_wand.png"
                alt=""
                width={1024}
                height={1536}
                sizes="112px"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto sm:mx-0 float-animation"
              />
              <div className="flex-1 text-center sm:text-left">
                <h3
                  className="display text-xl font-black mb-2"
                  style={{ color: "#7c3aed" }}
                >
                  数秘術占い
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "#7a6060" }}
                >
                  生年月日と名前から「ライフパスナンバー」を計算。性格診断と今日の運勢、あなただけのマイカラーがわかるよ。一度入力すれば、次からはすぐ占える。
                </p>
                <Link
                  href="/sujimei"
                  className="inline-block py-3 px-8 rounded-full text-base font-extrabold text-center shadow-md puni"
                  style={{ background: GRAPE, color: "#fff" }}
                >
                  数秘術を占う
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ⑤ 3つのいいところ */}
        <section className="relative px-5 sm:px-6 py-12">
          <span
            className="twinkle sparkle-animation"
            style={{ top: "8%", left: "10%", fontSize: 20, color: "#ffd06b" }}
          >
            ✦
          </span>
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-9">
              <h2
                className="display text-2xl sm:text-3xl font-black mb-2"
                style={{ color: "#3d2c2c" }}
              >
                ダメ占いの3つのいいところ
              </h2>
              <p className="text-sm font-medium" style={{ color: "#7a6060" }}>
                ふつうの占いじゃ物足りない、あなたへ。
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div
                className="puni rounded-[1.8rem] p-6 shadow-md flex flex-col items-center text-center"
                style={{
                  background: "linear-gradient(150deg,#ffffff,#fdf2f8)",
                  border: "2px solid #ffe0ec",
                }}
              >
                <Image
                  src="/images/lp/scene/bears_crystal.png"
                  alt=""
                  width={1024}
                  height={1536}
                  sizes="96px"
                  className="w-24 h-24 object-contain mb-3 drift-animation"
                />
                <h3
                  className="display font-extrabold text-base sm:text-lg mb-2"
                  style={{ color: "#c2185b" }}
                >
                  掛け合いが面白い
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#7a6060" }}
                >
                  ほめ上手なダメ天使と、毒舌なダメ悪魔。2人のぬけてるやりとりで、占い結果がくすっと笑えるエンタメになるよ。
                </p>
              </div>

              <div
                className="puni rounded-[1.8rem] p-6 shadow-md flex flex-col items-center text-center"
                style={{
                  background: "linear-gradient(150deg,#ffffff,#f3f1ff)",
                  border: "2px solid #e3dcff",
                }}
              >
                <Image
                  src="/images/lp/scene/laptop.png"
                  alt=""
                  width={1024}
                  height={1536}
                  sizes="96px"
                  className="w-24 h-24 object-contain mb-3 drift-animation"
                  style={{ animationDelay: ".4s" }}
                />
                <h3
                  className="display font-extrabold text-base sm:text-lg mb-2"
                  style={{ color: "#7c3aed" }}
                >
                  AIが毎回ちがう読み解き
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#7a6060" }}
                >
                  引いたカードとテーマに合わせて、AIがその場で読み解き。テンプレじゃないから、何度占っても新しい発見がある。
                </p>
              </div>

              <div
                className="puni rounded-[1.8rem] p-6 shadow-md flex flex-col items-center text-center"
                style={{
                  background: "linear-gradient(150deg,#ffffff,#fff6ec)",
                  border: "2px solid #ffe6c9",
                }}
              >
                <Image
                  src="/images/lp/scene/coins.png"
                  alt=""
                  width={262}
                  height={262}
                  sizes="96px"
                  className="w-24 h-24 object-contain mb-3 drift-animation"
                  style={{ animationDelay: ".8s" }}
                />
                <h3
                  className="display font-extrabold text-base sm:text-lg mb-2"
                  style={{ color: "#d98a1f" }}
                >
                  登録なし・無料3回ですぐ
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#7a6060" }}
                >
                  アカウント登録はいらないよ。ページを開いたら、そのまま無料で3回まで占える。気軽に試してみてね。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ⑥ 今日のひとこと（実装は <DailyMessage /> = /api/daily） */}
        <section
          id="daily"
          className="relative px-5 sm:px-6 py-12 scroll-mt-24"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/lp/deco/star_purple.png"
            alt=""
            className="deco drift-animation"
            style={{ top: "6%", right: "8%", width: 34 }}
          />
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-7">
              <h2
                className="display text-2xl sm:text-3xl font-black mb-2"
                style={{ color: "#3d2c2c" }}
              >
                今日のひとこと
              </h2>
              <p className="text-sm font-medium" style={{ color: "#7a6060" }}>
                1タップで、今日の2人からのメッセージとラッキーカラーをチェック。
              </p>
            </div>

            <DailyMessage />
          </div>
        </section>

        {/* ⑦ 占い結果サンプル */}
        <section className="relative px-5 sm:px-6 py-12">
          <span
            className="twinkle sparkle-animation"
            style={{ top: "7%", left: "12%", fontSize: 22, color: "#ffb7c5" }}
          >
            ✦
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/lp/deco/heart_md.png"
            alt=""
            className="deco drift-animation"
            style={{ bottom: "10%", right: "7%", width: 38 }}
          />

          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2
                className="display text-2xl sm:text-3xl font-black mb-2"
                style={{ color: "#3d2c2c" }}
              >
                こんな結果が届くよ
              </h2>
              <p className="text-sm font-medium" style={{ color: "#7a6060" }}>
                カードの意味を、2人の掛け合いでやさしく＆ズバッと読み解き。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              <div className="relative mx-auto max-w-sm w-full">
                <span
                  className="twinkle sparkle-animation"
                  style={{
                    top: "-3%",
                    right: "4%",
                    fontSize: 20,
                    color: "#ffd06b",
                    animationDelay: ".4s",
                  }}
                >
                  ✦
                </span>
                <Image
                  src="/images/lp/result/tarot_love.png"
                  alt="タロット占い・恋愛の結果サンプル（過去・現在・未来）"
                  width={720}
                  height={1102}
                  sizes="(max-width: 1024px) 90vw, 384px"
                  className="w-full h-auto object-contain drop-shadow-[0_18px_30px_rgba(200,77,209,.25)]"
                />
              </div>

              <div className="space-y-4">
                <div
                  className="rounded-2xl p-4 shadow-sm flex items-start gap-3"
                  style={{ background: "linear-gradient(150deg,#fff9f0,#fce4ec)" }}
                >
                  <Image
                    src="/images/lp/deco/angel_bear.png"
                    alt=""
                    width={262}
                    height={262}
                    sizes="44px"
                    className="w-11 h-11 flex-shrink-0 object-contain"
                  />
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#7a6060" }}
                  >
                    <b style={{ color: "#c2185b" }}>ふわっと天使は、</b>
                    どんなカードも良い方へ。今のあなたを、まるごとやさしく肯定してくれる。
                  </p>
                </div>
                <div
                  className="rounded-2xl p-4 shadow-sm flex items-start gap-3 flex-row-reverse text-right"
                  style={{ background: "linear-gradient(150deg,#f5f0ff,#e8d5ff)" }}
                >
                  <Image
                    src="/images/lp/deco/devil_bear.png"
                    alt=""
                    width={262}
                    height={262}
                    sizes="44px"
                    className="w-11 h-11 flex-shrink-0 object-contain"
                  />
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#7a6060" }}
                  >
                    <b style={{ color: "#6a1b9a" }}>ズバッと悪魔は、</b>
                    本音で核心をひとつき。でも最後には、ちゃんと小さなエールを添えてくれる。
                  </p>
                </div>
                <div
                  className="rounded-2xl p-4 text-center"
                  style={{ background: "linear-gradient(135deg,#ffe3ef,#ece1ff)" }}
                >
                  <p className="text-sm font-bold" style={{ color: "#c2185b" }}>
                    2人の本音がそろうから、
                    <br className="sm:hidden" />
                    くすっと笑えて、ちょっと前向きになれる。
                  </p>
                </div>
                <Link
                  href="/uranai"
                  className="block w-full py-3.5 px-8 rounded-full text-white text-base font-extrabold text-center shadow-md puni"
                  style={{ background: CTA }}
                >
                  自分の結果を占ってみる
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ⑧ 占い師紹介 */}
        <section className="relative px-5 sm:px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-9">
              <h2
                className="display text-2xl sm:text-3xl font-black mb-2"
                style={{ color: "#3d2c2c" }}
              >
                占い師は、ぬけてる相棒2人組
              </h2>
              <p className="text-sm font-medium" style={{ color: "#7a6060" }}>
                ダメ天使とダメ悪魔がいつも2人セットで、あなたの占いをお届け。
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                className="puni rounded-[1.8rem] p-6 shadow-md flex flex-col items-center text-center"
                style={{
                  background: "linear-gradient(150deg,#fff9f0,#fce4ec)",
                  border: "2px solid #ffe0ec",
                }}
              >
                <Image
                  src="/images/lp/char/angel.png"
                  alt="ダメ天使"
                  width={148}
                  height={169}
                  sizes="112px"
                  className="w-28 h-28 object-contain mb-4 float-animation"
                />
                <h3
                  className="display font-extrabold text-lg mb-1"
                  style={{ color: "#c2185b" }}
                >
                  ダメ天使
                </h3>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block"
                  style={{ background: "#fce4ec", color: "#c2185b" }}
                >
                  ふわっと担当
                </span>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#7a6060" }}
                >
                  ポジティブ寄りの占い師。どんな結果も良い方へ読もうとする、ふわっと優しい天然さん。ときどき的外れだけど、いつも本気で応援してくれるよ。
                </p>
              </div>

              <div
                className="puni rounded-[1.8rem] p-6 shadow-md flex flex-col items-center text-center"
                style={{
                  background: "linear-gradient(150deg,#f5f0ff,#e8d5ff)",
                  border: "2px solid #ddc9ff",
                }}
              >
                <Image
                  src="/images/lp/char/devil.png"
                  alt="ダメ悪魔"
                  width={149}
                  height={169}
                  sizes="112px"
                  className="w-28 h-28 object-contain mb-4 float-animation-reverse"
                />
                <h3
                  className="display font-extrabold text-lg mb-1"
                  style={{ color: "#6a1b9a" }}
                >
                  ダメ悪魔
                </h3>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block"
                  style={{ background: "#e8d5ff", color: "#6a1b9a" }}
                >
                  ズバッと担当
                </span>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#7a6060" }}
                >
                  辛口リアリストの占い師。本音でズバッと課題を指摘するけど、最後にはちゃんと小さなエールを添えてくれる。実はかなり面倒見がいいよ。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ⑨ シェアしよう */}
        <section className="relative px-5 sm:px-6 py-12">
          <div className="mx-auto max-w-3xl">
            <div
              className="relative rounded-[2rem] p-8 sm:p-10 shadow-md text-center overflow-hidden"
              style={{
                background: "linear-gradient(150deg,#fffdf5,#fff0f6)",
                border: "2px solid #ffe0ec",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/lp/deco/heart_sm.png"
                alt=""
                className="deco drift-animation"
                style={{ top: "12%", left: "8%", width: 26 }}
              />
              <span
                className="twinkle sparkle-animation"
                style={{
                  top: "18%",
                  right: "12%",
                  fontSize: 20,
                  color: "#c9a8ff",
                }}
              >
                ✦
              </span>
              <Image
                src="/images/lp/deco/devil_bear.png"
                alt=""
                width={262}
                height={262}
                sizes="64px"
                className="w-16 h-16 object-contain mx-auto mb-3 wiggle-animation"
              />
              <h2
                className="display text-2xl sm:text-3xl font-black mb-3"
                style={{ color: "#3d2c2c" }}
              >
                占い結果をシェアしよう
              </h2>
              <p
                className="text-sm sm:text-base leading-relaxed mb-5 max-w-xl mx-auto"
                style={{ color: "#7a6060" }}
              >
                おもしろい結果が出たら、SNSでシェアして友達と盛り上がろう。ダメ天使とダメ悪魔のセリフ入りカードで、思わず誰かに見せたくなるよ。
              </p>
              <span
                className="display inline-block text-base sm:text-lg font-extrabold px-6 py-2.5 rounded-full"
                style={{
                  background: "linear-gradient(135deg,#ffe3ef,#ece1ff)",
                  color: "#c2185b",
                }}
              >
                #ダメ占い
              </span>
            </div>
          </div>
        </section>

        {/* ⑩ 最終CTA */}
        <section className="relative px-5 sm:px-6 py-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/lp/deco/moon.png"
            alt=""
            className="deco float-animation"
            style={{ top: "8%", left: "8%", width: 42 }}
          />
          <span
            className="twinkle sparkle-animation"
            style={{ top: "14%", right: "10%", fontSize: 24, color: "#ffb7c5" }}
          >
            ✦
          </span>
          <div className="mx-auto max-w-2xl text-center">
            <Image
              src="/images/lp/scene/couple.png"
              alt="ダメ天使とダメ悪魔"
              width={1254}
              height={1254}
              sizes="(max-width: 640px) 176px, 224px"
              className="w-44 sm:w-56 h-auto object-contain mx-auto mb-4 float-animation"
            />
            <h2
              className="display text-2xl sm:text-4xl font-black mb-3"
              style={{ color: "#e91e8c" }}
            >
              さっそく占ってみる？
            </h2>
            <p
              className="text-sm sm:text-base mb-7 font-medium"
              style={{ color: "#7a6060" }}
            >
              登録なし・無料で3回。まずは気軽にタロットから。
            </p>
            <div className="max-w-sm mx-auto space-y-3">
              <Link
                href="/uranai"
                className="block w-full py-4 px-8 rounded-full text-white text-lg sm:text-xl font-extrabold text-center shadow-lg puni"
                style={{ background: CTA }}
              >
                無料でタロットを占う
              </Link>
              <Link
                href="/sujimei"
                className="block w-full py-3 px-8 rounded-full text-base font-extrabold text-center shadow-md puni"
                style={{ background: GRAPE, color: "#fff" }}
              >
                数秘術を占う
              </Link>
            </div>
            <p
              className="text-xs sm:text-sm mt-5 font-bold"
              style={{ color: "#b08090" }}
            >
              ✦ ログインすると、占い履歴が残るよ ✦
            </p>
          </div>
        </section>
      </div>

      {/* ⑪ フッター */}
      <footer
        className="py-7 px-6 text-center text-xs"
        style={{
          color: "#b08090",
          borderTop: "1px solid #fce4ec",
          background: "rgba(255,250,253,.5)",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Image
            src="/images/lp/deco/angel_bear.png"
            alt=""
            width={262}
            height={262}
            sizes="24px"
            className="w-6 h-6 object-contain"
          />
          <span className="display font-bold" style={{ color: "#e91e8c" }}>
            ダメ占い
          </span>
          <Image
            src="/images/lp/deco/devil_bear.png"
            alt=""
            width={262}
            height={262}
            sizes="24px"
            className="w-6 h-6 object-contain"
          />
        </div>
        <div className="flex items-center justify-center gap-4 mb-3">
          <Link href="/terms" className="underline" style={{ color: "#b08090" }}>
            利用規約
          </Link>
          <Link
            href="/privacy"
            className="underline"
            style={{ color: "#b08090" }}
          >
            プライバシーポリシー
          </Link>
        </div>
        <p>© 2026 ダメ占い</p>
        <p className="mt-1">Dame Uranai — ダメ天使＆ダメ悪魔の本音占い</p>
      </footer>
    </main>
  );
}
