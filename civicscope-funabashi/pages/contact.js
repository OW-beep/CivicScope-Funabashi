import Head from "next/head";
import { siteConfig } from "../data/siteConfig";

export default function Contact() {
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent("【CivicScope船橋】お問い合わせ")}`;

  return (
    <>
      <Head>
        <title>{`お問い合わせ｜${siteConfig.name}`}</title>
        <meta name="description" content="CivicScope船橋へのお問い合わせ方法。データの誤りのご指摘、掲載してほしいデータのご要望など。" />
      </Head>

      <section className="mx-auto max-w-2xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Contact</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">お問い合わせ</h1>

        <p className="mt-6 text-[15px] leading-[1.9] text-ink-soft">
          データの誤りのご指摘、掲載してほしいデータセットのご要望、その他お気づきの点がありましたら、
          下記のメールアドレスまでご連絡ください。内容を確認の上、順次対応いたします。
        </p>

        <div className="mt-8 border border-ink/10 bg-white/60 p-6">
          <p className="text-xs uppercase tracking-widest text-ink-soft">Email</p>
          <a href={mailto} className="mt-2 block font-mono text-lg text-brass-dark hover:underline">
            {siteConfig.contactEmail}
          </a>
        </div>

        <p className="mt-6 text-xs text-ink-soft">
          ※ 船橋市の行政手続きに関するお問い合わせには対応できません。船橋市の公式窓口へ直接ご連絡ください。
        </p>
      </section>
    </>
  );
}
