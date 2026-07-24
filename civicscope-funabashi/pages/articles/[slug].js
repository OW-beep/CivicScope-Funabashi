import Head from "next/head";
import Link from "next/link";
import AdSlot from "../../components/AdSlot";
import DashboardFooterLinks from "../../components/DashboardFooterLinks";
import { siteConfig } from "../../data/siteConfig";
import { articles, getArticleBySlug, getRelatedArticles } from "../../data/articles";

export async function getStaticPaths() {
  return {
    paths: articles.map((a) => ({ params: { slug: a.slug } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const article = getArticleBySlug(params.slug);
  if (!article) return { notFound: true };
  const relatedArticles = getRelatedArticles(params.slug, 2);
  return { props: { article, relatedArticles } };
}

function renderBody(body) {
  // シンプルな段落・太字（**text**）記法のみサポートする軽量レンダラー
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      const parts = block.split(/\*\*(.+?)\*\*/g);
      return (
        <p key={i} className="mb-5 text-[15px] leading-[1.9] text-ink-soft">
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold text-ink">
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    });
}

export default function ArticlePage({ article, relatedArticles }) {
  return (
    <>
      <Head>
        <title>{`${article.title}｜${siteConfig.name}`}</title>
        <meta name="description" content={article.excerpt} />
      </Head>

      <article className="mx-auto max-w-2xl px-5 py-14">
        <Link href="/articles" className="font-mono text-xs text-ink-soft hover:text-brass-dark">
          ← 解説記事一覧へ
        </Link>

        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-brass-dark">{article.tag}</p>
        <h1 className="mt-2 font-display text-3xl leading-snug text-ink md:text-4xl">{article.title}</h1>
        <p className="mt-3 font-mono text-xs text-ink-soft">{article.date}</p>

        <div className="mt-10">{renderBody(article.body)}</div>

        {article.relatedDashboard ? (
          <div className="mt-10">
            <DashboardFooterLinks
              articleHref={article.relatedDashboard.href}
              articleLabel={`${article.relatedDashboard.label}を見る`}
            />
          </div>
        ) : (
          <div className="mt-10">
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
                  className="group flex flex-col border border-ink/10 bg-white/50 p-4 transition-colors hover:border-brass"
                >
                  <span className="font-mono text-[11px] text-brass-dark">{a.tag}</span>
                  <span className="mt-1.5 font-display text-sm leading-snug text-ink group-hover:text-brass-dark">
                    {a.title}
                  </span>
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
