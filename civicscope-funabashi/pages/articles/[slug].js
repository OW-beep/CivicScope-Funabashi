import Head from "next/head";
import Link from "next/link";
import AdSlot from "../../components/AdSlot";
import { siteConfig } from "../../data/siteConfig";
import { articles, getArticleBySlug } from "../../data/articles";

export async function getStaticPaths() {
  return {
    paths: articles.map((a) => ({ params: { slug: a.slug } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const article = getArticleBySlug(params.slug);
  if (!article) return { notFound: true };
  return { props: { article } };
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

export default function ArticlePage({ article }) {
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

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE} className="h-24" />
        </div>
      </article>
    </>
  );
}
