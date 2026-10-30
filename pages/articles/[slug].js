import Seo from "../../components/Seo";
import Link from "next/link";
import dynamic from "next/dynamic";
import AdSlot from "../../components/AdSlot";
import DashboardFooterLinks from "../../components/DashboardFooterLinks";
import ShareButtons from "../../components/ShareButtons";
import ArticleThumbnail from "../../components/ArticleThumbnail";
import { siteConfig } from "../../data/siteConfig";
import ArticleAffiliate from "../../components/ArticleAffiliate";
import { articles, getArticleBySlug, getRelatedArticles } from "../../data/articles";
import { getArticleAffiliate } from "../../data/articleAffiliates";
import { searchRakutenItems } from "../../lib/rakuten";

import OperatorNote from "../../components/OperatorNote";
import ArticleBody, { extractHeadings } from "../../components/ArticleBody";
import Breadcrumbs, { buildBreadcrumbJsonLd } from "../../components/Breadcrumbs";
import ArticleByline from "../../components/ArticleByline";
import KeyPoints from "../../components/KeyPoints";
import TableOfContents from "../../components/TableOfContents";

export async function getStaticPaths() {
  return {
    paths: articles.map((a) => ({ params: { slug: a.slug } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const article = getArticleBySlug(params.slug);
  if (!article) return { notFound: true };
  const relatedArticles = getRelatedArticles(params.slug, 4);
  // 記事末尾の関連グッズ枠。楽天キー未設定・0件のときは rakutenItem が null になり、Amazonリンクのみ表示される。
  const affiliate = getArticleAffiliate(article.slug, article.tag);
  // 商品が記事の話題と自然につながる記事だけに表示する（data/articleAffiliates.js）。該当しなければ null。
  const rakutenItems = affiliate ? await searchRakutenItems(affiliate.keyword, 1) : null;
  return {
    props: {
      article,
      relatedArticles,
      affiliate: affiliate ? { ...affiliate, rakutenItem: rakutenItems?.[0] ?? null } : null
    },
    revalidate: 60 * 60 * 24
  };
}

export default function ArticlePage({ article, relatedArticles, affiliate }) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.updated || article.date,
    inLanguage: "ja",
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: `${siteConfig.url}/articles/${article.slug}`
  };

  const crumbs = [
    { label: "ホーム", href: "/" },
    { label: "解説記事", href: "/articles" },
    { label: article.tag, href: `/articles/tag/${encodeURIComponent(article.tag)}` },
    { label: article.title }
  ];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(crumbs, siteConfig.url);
  const headings = extractHeadings(article.body);
  // 検索結果ではタイトルが約30文字で切れる。長いタイトルには、サイト名を付けず、キーワードを優先して見せる。
  const seoTitle = article.title.length >= 30 ? article.title : `${article.title}｜${siteConfig.name}`;

  // 記事がQ&A形式のfaqItemsを持つ場合、検索結果でのリッチリザルト（よくある質問）表示を
  // 狙ってFAQPageの構造化データも併せて出力する。持たない記事には影響しない。
  const faqJsonLd =
    Array.isArray(article.faqItems) && article.faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer }
          }))
        }
      : null;

  return (
    <>
      <Seo
        title={seoTitle}
        description={article.excerpt}
        path={`/articles/${article.slug}`}
        type="article"
        jsonLd={faqJsonLd ? [articleJsonLd, breadcrumbJsonLd, faqJsonLd] : [articleJsonLd, breadcrumbJsonLd]}
      />

      <article className="mx-auto max-w-2xl px-5 py-14">
        <Breadcrumbs items={crumbs} />

        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-brass-dark">{article.tag}</p>
        <h1 className="mt-2 font-display text-3xl leading-snug text-ink md:text-4xl">{article.title}</h1>
        <ArticleByline date={article.date} updated={article.updated} className="mt-3" />

        <ArticleThumbnail tag={article.tag} slug={article.slug} title={article.title} className="mt-6 h-48 w-full rounded-2xl shadow-pop" />

        <ShareButtons title={article.title} url={`${siteConfig.url}/articles/${article.slug}`} className="mt-5" />

        <KeyPoints points={article.tldr} className="mt-8" />
        <TableOfContents headings={headings} className="mt-6" />

        <div className="mt-10"><ArticleBody body={article.body} charts={article.charts} maps={article.maps} /></div>

        {article.operatorComment ? (
          <aside className="mt-10 rounded-2xl border border-ink/10 bg-white/60 px-5 py-4">
            <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">運営者のひとこと</p>
            <p className="mt-2 text-[15px] leading-[1.9] text-ink">{article.operatorComment}</p>
          </aside>
        ) : null}

        {affiliate ? (
          <ArticleAffiliate
            heading={affiliate.heading}
            keyword={affiliate.keyword}
            rakutenItem={affiliate.rakutenItem}
          />
        ) : null}

        <div className="mt-10 rounded-xl border border-ink/10 bg-white/60 px-5 py-4">
          <OperatorNote tone="light" />
        </div>

        {article.relatedDashboard ? (
          <div className="mt-10 border-t border-ink/10 pt-8">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-brass-dark">次にできること</p>
            <p className="mb-4 text-sm text-ink-soft">
              この記事で紹介した数字は、実際のダッシュボードでもっと詳しく、最新の状態で確認できます。
            </p>
            <DashboardFooterLinks
              articleHref={article.relatedDashboard.href}
              articleLabel={`${article.relatedDashboard.label}を見る`}
            />
          </div>
        ) : (
          <div className="mt-10 border-t border-ink/10 pt-8">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-brass-dark">次にできること</p>
            <p className="mb-4 text-sm text-ink-soft">
              船橋市の他のテーマも、ダッシュボードで実際のデータを確認できます。
            </p>
            <Link
              href="/#dashboards"
              className="group flex items-center justify-between border border-ink/10 bg-white/60 px-5 py-4 text-sm text-ink transition-colors hover:border-brass"
            >
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                  もっと見る
                </span>
                <span className="mt-0.5 block font-display text-base text-ink">ダッシュボード一覧を見る</span>
              </span>
              <span aria-hidden className="ml-3 transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        )}

        {relatedArticles && relatedArticles.length ? (
          <div className="mt-12 border-t border-ink/10 pt-8">
            <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">あわせて読みたい</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {relatedArticles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  className="group flex items-center gap-3 overflow-hidden rounded-xl border border-ink/10 bg-white/50 p-3 transition-colors hover:border-brass"
                >
                  <ArticleThumbnail tag={a.tag} slug={a.slug} title={a.title} className="h-14 w-20 flex-shrink-0 rounded-lg" />
                  <div>
                    <span className="font-mono text-[11px] text-brass-dark">{a.tag}</span>
                    <span className="mt-1 block font-display text-sm leading-snug text-ink group-hover:text-brass-dark">
                      {a.title}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE} className="h-24" />
        </div>
      </article>
    </>
  );
}
