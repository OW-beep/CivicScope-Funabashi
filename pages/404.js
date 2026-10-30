import Link from "next/link";
import Seo from "../components/Seo";
import { siteConfig } from "../data/siteConfig";
import { getArticlesSortedByDate } from "../data/articles";

export async function getStaticProps() {
  const latest = getArticlesSortedByDate()
    .slice(0, 5)
    .map((a) => ({ slug: a.slug, title: a.title }));
  return { props: { latest } };
}

export default function NotFound({ latest }) {
  return (
    <>
      <Seo title={`ページが見つかりません｜${siteConfig.name}`} description="お探しのページは見つかりませんでした。" path="/404" noindex />
      <section className="mx-auto max-w-2xl px-5 py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">404 Not Found</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">ページが見つかりませんでした</h1>
        <p className="mt-6 text-[15px] leading-[1.9] text-ink-soft">
          URLが違っているか、ページが移動・非公開になった可能性があります。
          次のページから、お探しの情報をたどってみてください。
        </p>
        <ul className="mt-6 space-y-2 text-sm text-ink">
          <li><Link href="/" className="underline hover:text-brass-dark">トップページ</Link></li>
          <li><Link href="/search" className="underline hover:text-brass-dark">サイト内検索</Link></li>
          <li><Link href="/articles" className="underline hover:text-brass-dark">解説記事の一覧</Link></li>
          <li><Link href="/sitemap" className="underline hover:text-brass-dark">サイトマップ</Link></li>
        </ul>
        <p className="mb-3 mt-10 font-mono text-xs uppercase tracking-widest text-ink-soft">新しい記事</p>
        <ul className="space-y-2 text-sm text-ink-soft">
          {latest.map((a) => (
            <li key={a.slug}>
              <Link href={`/articles/${a.slug}`} className="hover:text-brass-dark hover:underline">{a.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
