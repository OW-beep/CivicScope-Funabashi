import Link from "next/link";
import Seo from "../components/Seo";
import Breadcrumbs, { buildBreadcrumbJsonLd } from "../components/Breadcrumbs";
import { siteConfig } from "../data/siteConfig";
import { articles, getAllTags, tagToSlug } from "../data/articles";

// 人が読むためのサイトマップ（検索エンジン用の /sitemap.xml とは別）。
// どのページにも、サイト内の主なページから2〜3クリックで着けるようにするための一覧。
const DASHBOARDS = [
  { href: "/dashboard", label: "人口ダッシュボード" },
  { href: "/children", label: "子ども・子育て" },
  { href: "/childcare", label: "保育園" },
  { href: "/schools", label: "学校" },
  { href: "/senior-housing", label: "高齢者向け住宅" },
  { href: "/welfare", label: "生活保護" },
  { href: "/public-safety", label: "治安・救急" },
  { href: "/finance", label: "財政" },
  { href: "/gender-participation", label: "女性参画" },
  { href: "/employment", label: "雇用・求人" },
  { href: "/citizen-consultation", label: "市民相談" },
  { href: "/parks", label: "公園・広場" },
  { href: "/library", label: "図書館" },
  { href: "/rail-ridership", label: "鉄道駅別乗車人員" },
  { href: "/bus-ridership", label: "市内バス運輸状況" },
  { href: "/chokai", label: "町会・自治会" },
  { href: "/food-businesses", label: "食品営業施設" },
  { href: "/life-sanitation", label: "生活衛生施設" },
  { href: "/disaster-prevention", label: "防災" },
  { href: "/dog-registration", label: "犬の登録" },
  { href: "/area-map", label: "エリアマップ" },
  { href: "/district-explorer", label: "地区マップ" }
];

const ABOUT = [
  { href: "/about", label: "運営者について" },
  { href: "/editorial-policy", label: "編集方針" },
  { href: "/data-methodology", label: "データの扱い方" },
  { href: "/guide", label: "ダッシュボードの使い方" },
  { href: "/contact", label: "お問い合わせ" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/terms", label: "利用規約" }
];

export async function getStaticProps() {
  const groups = getAllTags().map(({ tag }) => ({
    tag,
    tagSlug: tagToSlug(tag),
    items: articles
      .filter((a) => a.tag === tag)
      .map((a) => ({ slug: a.slug, title: a.title }))
  }));
  return { props: { groups } };
}

export default function SitemapPage({ groups }) {
  const crumbs = [{ label: "ホーム", href: "/" }, { label: "サイトマップ" }];
  return (
    <>
      <Seo
        title={`サイトマップ｜${siteConfig.name}`}
        description="シビックスコープ船橋の全ページ一覧。ダッシュボード、解説記事（テーマ別）、運営情報にすぐ移動できます。"
        path="/sitemap"
        jsonLd={buildBreadcrumbJsonLd(crumbs, siteConfig.url)}
      />
      <section className="mx-auto max-w-3xl px-5 py-14">
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-6 font-display text-3xl text-ink md:text-4xl">サイトマップ</h1>

        <h2 className="mb-3 mt-10 border-l-4 border-brass pl-3 font-display text-xl text-ink">ダッシュボード</h2>
        <ul className="columns-2 gap-x-6 text-sm text-ink-soft sm:columns-3">
          {DASHBOARDS.map((l) => (
            <li key={l.href} className="mb-2 break-inside-avoid">
              <Link href={l.href} className="underline decoration-ink/20 underline-offset-4 hover:text-brass-dark">{l.label}</Link>
            </li>
          ))}
        </ul>

        <h2 className="mb-3 mt-10 border-l-4 border-brass pl-3 font-display text-xl text-ink">解説記事（テーマ別）</h2>
        {groups.map((g) => (
          <div key={g.tag} className="mb-6">
            <h3 className="text-sm font-bold text-ink">
              <Link href={`/articles/tag/${g.tagSlug}`} className="hover:text-brass-dark">{g.tag}（{g.items.length}本）</Link>
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
              {g.items.map((a) => (
                <li key={a.slug}>
                  <Link href={`/articles/${a.slug}`} className="hover:text-brass-dark hover:underline">{a.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <h2 className="mb-3 mt-10 border-l-4 border-brass pl-3 font-display text-xl text-ink">運営情報</h2>
        <ul className="columns-2 gap-x-6 text-sm text-ink-soft sm:columns-3">
          {ABOUT.map((l) => (
            <li key={l.href} className="mb-2 break-inside-avoid">
              <Link href={l.href} className="underline decoration-ink/20 underline-offset-4 hover:text-brass-dark">{l.label}</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
