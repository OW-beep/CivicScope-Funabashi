import Head from "next/head";
import Link from "next/link";
import AdSlot from "../../components/AdSlot";
import { siteConfig } from "../../data/siteConfig";
import { getArticlesSortedByDate } from "../../data/articles";

export default function ArticlesIndex() {
  const articles = getArticlesSortedByDate();

  return (
    <>
      <Head>
        <title>{`解説記事一覧｜${siteConfig.name}`}</title>
        <meta name="description" content="船橋市のオープンデータをもとにした解説記事の一覧です。" />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Articles</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">解説記事</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          データの読み方・使い方をテーマに、CivicScope船橋編集部が独自にまとめた記事です。
        </p>

        <div className="mt-10 divide-y divide-ink/10 border-t border-ink/10">
          {articles.map((a) => (
            <Link key={a.slug} href={`/articles/${a.slug}`} className="group flex flex-col gap-2 py-6 md:flex-row md:items-baseline md:justify-between">
              <div>
                <span className="font-mono text-xs text-brass-dark">{a.tag}</span>
                <h2 className="mt-1 font-display text-xl text-ink group-hover:text-brass-dark">{a.title}</h2>
                <p className="mt-2 max-w-2xl text-sm text-ink-soft">{a.excerpt}</p>
              </div>
              <span className="whitespace-nowrap font-mono text-xs text-ink-soft">{a.date}</span>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLES} className="h-24" />
        </div>
      </section>
    </>
  );
}
