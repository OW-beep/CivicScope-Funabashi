import Seo from "../../../components/Seo";
import Link from "next/link";
import ArticleThumbnail from "../../../components/ArticleThumbnail";
import { siteConfig } from "../../../data/siteConfig";
import { getAllTags, tagToSlug, getArticlesByTagSlug } from "../../../data/articles";

// タグごとに固有のURL（/articles/tag/xxx）を持たせたアーカイブページ。
// 記事一覧ページ（/articles）のタグ絞り込みはクライアント側のstateのみで、
// 検索エンジンがタグ単位のページとしてインデックスできなかったため、
// SSGで生成する静的ページとして切り出した。
export async function getStaticPaths() {
  const tags = getAllTags();
  return {
    paths: tags.map(({ tag }) => ({ params: { tag: tagToSlug(tag) } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const { tag, articles } = getArticlesByTagSlug(params.tag);
  if (articles.length === 0) return { notFound: true };
  return { props: { tag, articles } };
}

export default function ArticlesByTag({ tag, articles }) {
  const allTags = getAllTags();

  return (
    <>
      <Seo
        title={`「${tag}」の解説記事一覧｜${siteConfig.name}`}
        description={`船橋市のオープンデータをもとにした「${tag}」に関する解説記事${articles.length}本の一覧です。`}
        path={`/articles/tag/${tagToSlug(tag)}`}
      />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Articles</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">「{tag}」の解説記事</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市のオープンデータをもとにした「{tag}」に関する解説記事、全{articles.length}本の一覧です。
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/articles"
            className="border border-ink/20 px-3 py-1 text-xs text-ink-soft hover:border-brass-dark"
          >
            すべての記事へ
          </Link>
          {allTags.map(({ tag: t, count }) => (
            <Link
              key={t}
              href={`/articles/tag/${tagToSlug(t)}`}
              className={`border px-3 py-1 text-xs ${
                t === tag ? "border-brass bg-brass text-white" : "border-ink/20 text-ink-soft hover:border-brass-dark"
              }`}
            >
              {t}（{count}）
            </Link>
          ))}
        </div>

        <div className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/articles/${a.slug}`}
              className="group flex flex-col gap-4 py-6 sm:flex-row sm:items-center"
            >
              <ArticleThumbnail tag={a.tag} slug={a.slug} title={a.title} className="h-20 w-32 flex-shrink-0 rounded-xl" />
              <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                <div>
                  <h2 className="font-display text-xl text-ink group-hover:text-brass-dark">{a.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm text-ink-soft">{a.excerpt}</p>
                </div>
                <span className="whitespace-nowrap font-mono text-xs text-ink-soft">{a.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
