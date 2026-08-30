import Seo from "../components/Seo";
import Link from "next/link";
import { siteConfig } from "../data/siteConfig";
import { getArticleBySlug } from "../data/articles";
import ArticleThumbnail from "../components/ArticleThumbnail";

// 目的別の読み方コレクション。既存記事を組み合わせているだけで、新しいコンテンツの
// 作成は発生しない。読者が「自分の目的に近いページ」をすぐ見つけられるようにするための、
// タグ別一覧とは別の切り口。
const COLLECTIONS = [
  {
    key: "moving",
    title: "引っ越し・住まい探しの方へ",
    description: "船橋市内のどのエリアが自分に合っているか、駅・地価・まちの雰囲気から検討したい方向けの記事です。",
    slugs: [
      "why-funabashi-charm-guide",
      "area-guide-central-funabashi",
      "area-guide-north-narashinodai",
      "area-guide-minamifunabashi-coast",
      "land-price-by-railway-line-guide",
      "population-650k-milestone-guide"
    ]
  },
  {
    key: "childrearing",
    title: "子育て中・これから子育てする方へ",
    description: "保育・教育・公園・図書館など、子育て環境を横断的に確認したい方向けの記事です。",
    slugs: [
      "is-funabashi-good-for-child-rearing",
      "childcare-guide",
      "fertility-and-aging-guide",
      "school-lunch-fee-free-guide",
      "parks-guide",
      "library-collection-usage-guide"
    ]
  },
  {
    key: "safety",
    title: "防災・安全が気になる方へ",
    description: "避難場所・治安・特殊詐欺・火災など、暮らしの安全に関わるデータをまとめました。",
    slugs: ["evacuation-map-guide", "public-safety-dashboard-guide", "phone-fraud-damage-guide", "fire-statistics-guide"]
  },
  {
    key: "culture",
    title: "船橋の暮らし・文化を知りたい方へ",
    description: "梨・漁業・三番瀬・ホタル・町会など、船橋市の地域色が出るテーマの記事です。",
    slugs: [
      "funabashi-nashi-pears-guide",
      "funabashi-agriculture-output-guide",
      "funabashi-fishery-guide",
      "sanbanze-tidal-flat-guide",
      "funabashi-firefly-viewing-guide",
      "chokai-directory-guide"
    ]
  }
];

export default function Collections() {
  return (
    <>
      <Seo
        title={`目的別の読み方ガイド｜${siteConfig.name}`}
        description="引っ越し検討中、子育て中、防災が気になる方など、目的別にCivicScope船橋の記事をまとめました。"
        path="/collections"
      />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Collections</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">目的別の読み方ガイド</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          52本の記事の中から、目的に応じて読むと理解が深まる組み合わせをまとめました。
          タグ別の一覧は<Link href="/articles" className="underline hover:text-brass-dark">解説記事一覧</Link>からもご覧いただけます。
        </p>

        <div className="mt-10 space-y-14">
          {COLLECTIONS.map((c) => {
            const articles = c.slugs.map((s) => getArticleBySlug(s)).filter(Boolean);
            return (
              <div key={c.key}>
                <h2 className="font-display text-xl text-ink">{c.title}</h2>
                <p className="mt-2 max-w-2xl text-sm text-ink-soft">{c.description}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {articles.map((a) => (
                    <Link
                      key={a.slug}
                      href={`/articles/${a.slug}`}
                      className="group flex items-center gap-3 overflow-hidden rounded-xl border border-ink/10 bg-white/60 p-3 transition-colors hover:border-brass"
                    >
                      <ArticleThumbnail tag={a.tag} slug={a.slug} title={a.title} className="h-16 w-24 flex-shrink-0 rounded-lg" />
                      <div>
                        <span className="font-mono text-[11px] text-brass-dark">{a.tag}</span>
                        <p className="mt-1 font-display text-base text-ink group-hover:text-brass-dark">{a.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
