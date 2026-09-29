import Seo from "../components/Seo";
import SectionLabel from "../components/SectionLabel";
import { siteConfig } from "../data/siteConfig";

// スポンサー広告・記事広告のご案内ページ。数値（月間PV・料金）はダミーのプレースホルダーで、
// 運営者が実際のSearch Console/アクセス解析の数字に置き換えて使うことを前提にしている。
export default function Advertise() {
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent("【CivicScope船橋】広告掲載について")}`;

  return (
    <>
      <Seo
        title={`広告掲載・スポンサーのご案内｜${siteConfig.name}`}
        description="CivicScope船橋への広告掲載・スポンサー枠のご案内。船橋市の暮らし・行政データに関心のある読者に、地域の店舗・事業者様の情報をお届けします。"
        path="/advertise"
      />

      <section className="mx-auto max-w-2xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Advertise</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">広告掲載・スポンサーのご案内</h1>

        <p className="mt-6 text-[15px] leading-[1.9] text-ink-soft">
          {siteConfig.name}は、船橋市のオープンデータをもとに、人口・子育て・防災・行政などのテーマを
          解説する市民向けメディアです。船橋市での暮らしや、行政データそのものに関心のある方に
          読んでいただいています。地域の店舗・事業者様の広告掲載や、記事内でのご紹介を承っています。
        </p>

        <div className="mt-10">
          <SectionLabel code="§1">読者層</SectionLabel>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-[1.8] text-ink-soft">
            <li>船橋市に在住・転入予定の方（人口・子育て・住まい関連の記事が中心的な入口です）</li>
            <li>行政データ・オープンデータそのものに関心のある方</li>
            <li>子育て世帯、シニア世帯など、テーマ別ダッシュボードに応じた読者層</li>
          </ul>
          <p className="mt-3 text-sm text-ink-soft">
            月間ページビュー・訪問者数などの実績データは、お問い合わせいただいた方に個別にご案内しています。
          </p>
        </div>

        <div className="mt-10">
          <SectionLabel code="§2">掲載メニュー</SectionLabel>
          <div className="mt-3 space-y-4">
            <div className="border border-ink/10 bg-white/60 p-5">
              <p className="font-display text-base font-bold text-ink">バナー広告</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                記事下部・ダッシュボード内の広告枠に、画像バナーとリンク先を掲載します。
                テーマに関連するダッシュボード・記事を指定しての掲載も可能です（例：子育て関連ダッシュボードへの掲載）。
              </p>
            </div>
            <div className="border border-ink/10 bg-white/60 p-5">
              <p className="font-display text-base font-bold text-ink">記事内でのご紹介・PR記事</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                関連するテーマの解説記事内で、事業者様の情報をご紹介します。既存記事への追記、または新規の記事としての制作も相談可能です。
                PR・広告であることが分かる表示を行います。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <SectionLabel code="§3">料金・お申し込み</SectionLabel>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            掲載期間・掲載場所に応じてご案内します。まずは下記よりお気軽にお問い合わせください。
            内容を確認の上、折り返しご連絡いたします。
          </p>
          <a
            href={mailto}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brass px-6 py-3 text-sm font-bold text-white shadow-pop-brass transition-transform hover:-translate-y-0.5"
          >
            広告掲載についてお問い合わせ
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <p className="mt-10 text-xs text-ink-soft">
          ※ {siteConfig.name}は船橋市および関連機関が運営する公式サイトではありません。広告掲載は本サイト運営者による独自の取り組みです。
        </p>
      </section>
    </>
  );
}
