import Seo from "../components/Seo";
import { siteConfig } from "../data/siteConfig";

export default function Contact() {
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent("【CivicScope船橋】お問い合わせ")}`;
  const formId = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;
  const formAction = formId ? `https://formspree.io/f/${formId}` : null;

  return (
    <>
      <Seo title={`お問い合わせ｜${siteConfig.name}`} description="CivicScope船橋へのお問い合わせ方法。データの誤りのご指摘、掲載してほしいデータのご要望など。" path="/contact" />

      <section className="mx-auto max-w-2xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Contact</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">お問い合わせ</h1>

        <p className="mt-6 text-[15px] leading-[1.9] text-ink-soft">
          データの誤りのご指摘、掲載してほしいデータセットのご要望、その他お気づきの点がありましたら、
          下記のメールアドレスまでご連絡ください。内容を確認の上、順次対応いたします。
        </p>

        {formAction ? (
          <form action={formAction} method="POST" className="mt-8 space-y-5 border border-ink/10 bg-white/60 p-6">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-bold text-ink">お名前</label>
              <input id="contact-name" name="name" type="text" required autoComplete="name" className="mt-1 w-full border border-ink/20 bg-white px-3 py-2 text-[15px]" />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-bold text-ink">メールアドレス</label>
              <input id="contact-email" name="email" type="email" required autoComplete="email" className="mt-1 w-full border border-ink/20 bg-white px-3 py-2 text-[15px]" />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-bold text-ink">お問い合わせ内容</label>
              <textarea id="contact-message" name="message" required rows={6} className="mt-1 w-full border border-ink/20 bg-white px-3 py-2 text-[15px]" />
            </div>
            <button type="submit" className="bg-brass-dark px-6 py-2.5 text-sm font-bold text-white hover:opacity-90">送信する</button>
            <p className="text-xs text-ink-soft">送信すると、Formspree経由で運営者に届きます。</p>
          </form>
        ) : (
          <p className="mt-8 border border-ink/10 bg-white/60 p-6 text-sm text-ink-soft">
            フォームは現在準備中です。下記のメールアドレスまでご連絡ください。
          </p>
        )}

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
