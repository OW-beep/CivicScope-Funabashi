import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Seo from "../components/Seo";
import ArticleThumbnail from "../components/ArticleThumbnail";
import { siteConfig } from "../data/siteConfig";
import { searchSite } from "../data/searchIndex";

// サイト内検索ページ。記事はタイトル・要約・タグを、ダッシュボードは名称・キーワードを
// 対象に単純な部分一致で検索する（外部の検索サービスは使わず、ビルド時に持っている
// データだけで完結させている）。ヘッダーの検索窓や /search?q=... へのリンクから遷移する。
export async function getServerSideProps({ query }) {
  const q = typeof query.q === "string" ? query.q : "";
  const results = searchSite(q);
  return { props: { q, ...results } };
}

export default function SearchPage({ q, articles, dashboards }) {
  const router = useRouter();
  const [value, setValue] = useState(q || "");

  function handleSubmit(e) {
    e.preventDefault();
    if (value.trim()) router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  }

  const hasQuery = q && q.trim().length > 0;
  const total = (articles?.length || 0) + (dashboards?.length || 0);

  return (
    <>
      <Seo
        title={hasQuery ? `「${q}」の検索結果｜${siteConfig.name}` : `サイト内検索｜${siteConfig.name}`}
        description={`${siteConfig.name}内の記事・ダッシュボードを検索します。`}
        path="/search"
        noindex
      />

      <section className="mx-auto max-w-3xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Search</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">サイト内検索</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="例：人口、財政、町会、駅の乗降客数..."
            className="w-full rounded-full border border-ink/20 bg-white px-5 py-3 text-sm text-ink focus:border-brass-dark focus:outline-none"
          />
          <button
            type="submit"
            className="flex-shrink-0 rounded-full bg-brass px-6 py-3 text-sm font-bold text-white shadow-pop-brass"
          >
            検索
          </button>
        </form>

        {hasQuery ? (
          <p className="mt-6 text-sm text-ink-soft">
            「{q}」の検索結果：{total}件
          </p>
        ) : null}

        {hasQuery && total === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            該当する記事・ダッシュボードが見つかりませんでした。別のキーワードでお試しください。
          </p>
        ) : null}

        {dashboards && dashboards.length > 0 ? (
          <div className="mt-8">
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-ink-soft">ダッシュボード</p>
            <div className="flex flex-wrap gap-2">
              {dashboards.map((d) => (
                <Link
                  key={d.href}
                  href={d.href}
                  className="rounded-full border border-ink/20 px-4 py-2 text-sm text-ink-soft hover:border-brass-dark hover:text-brass-dark"
                >
                  {d.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {articles && articles.length > 0 ? (
          <div className="mt-8">
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-ink-soft">解説記事</p>
            <div className="divide-y divide-ink/10 border-t border-ink/10">
              {articles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  className="group flex flex-col gap-4 py-6 sm:flex-row sm:items-center"
                >
                  <ArticleThumbnail
                    tag={a.tag}
                    slug={a.slug}
                    title={a.title}
                    className="h-20 w-32 flex-shrink-0 rounded-xl"
                  />
                  <div>
                    <h2 className="font-display text-lg text-ink group-hover:text-brass-dark">{a.title}</h2>
                    <p className="mt-1 max-w-2xl text-sm text-ink-soft">{a.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
