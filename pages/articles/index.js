import { useMemo, useState } from "react";
import Seo from "../../components/Seo";
import Link from "next/link";
import AdSlot from "../../components/AdSlot";
import ArticleThumbnail from "../../components/ArticleThumbnail";
import { siteConfig } from "../../data/siteConfig";
import { getArticlesSortedByDate } from "../../data/articles";

export default function ArticlesIndex() {
  const articles = getArticlesSortedByDate();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState(null);

  // タグの一覧は記事数の多い順（同数なら記事内の出現順）にして、主要なテーマから
  // 見つけやすくする。
  const tags = useMemo(() => {
    const counts = new Map();
    for (const a of articles) counts.set(a.tag, (counts.get(a.tag) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
  }, [articles]);

  const filtered = useMemo(() => {
    let rows = articles;
    if (activeTag) rows = rows.filter((a) => a.tag === activeTag);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [articles, query, activeTag]);

  return (
    <>
      <Seo
        title={`解説記事一覧｜${siteConfig.name}`}
        description="船橋市のオープンデータをもとにした解説記事の一覧です。"
        path="/articles"
      />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Articles</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">解説記事</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          データの読み方・使い方をテーマに、CivicScope船橋編集部が独自にまとめた記事です。
          引っ越し先を検討している方、今お住まいの地域の変化を知りたい方、船橋のデータを調べ物に
          使いたい方など、それぞれの目的に合わせて活用してください。目的別にまとめた
          <Link href="/collections" className="underline hover:text-brass-dark">読み方ガイド</Link>
          もあわせてご覧いただけます。
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="キーワードで記事を検索（例：保育園、人口、防災）"
            className="w-full max-w-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brass"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`border px-3 py-1 text-xs ${
                activeTag === null ? "border-brass bg-brass text-white" : "border-ink/20 text-ink-soft hover:border-brass-dark"
              }`}
            >
              すべて（{articles.length}）
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`border px-3 py-1 text-xs ${
                  activeTag === tag ? "border-brass bg-brass text-white" : "border-ink/20 text-ink-soft hover:border-brass-dark"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 font-mono text-xs text-ink-soft">{filtered.length}件の記事</p>

        <div className="mt-2 divide-y divide-ink/10 border-t border-ink/10">
          {filtered.map((a) => (
            <Link
              key={a.slug}
              href={`/articles/${a.slug}`}
              className="group flex flex-col gap-4 py-6 sm:flex-row sm:items-center"
            >
              <ArticleThumbnail tag={a.tag} slug={a.slug} title={a.title} className="h-20 w-32 flex-shrink-0 rounded-xl" />
              <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                <div>
                  <span className="font-mono text-xs text-brass-dark">{a.tag}</span>
                  <h2 className="mt-1 font-display text-xl text-ink group-hover:text-brass-dark">{a.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm text-ink-soft">{a.excerpt}</p>
                </div>
                <span className="whitespace-nowrap font-mono text-xs text-ink-soft">{a.date}</span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-ink-soft">該当する記事が見つかりませんでした。</p>
          )}
        </div>

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLES} className="h-24" />
        </div>
      </section>
    </>
  );
}
