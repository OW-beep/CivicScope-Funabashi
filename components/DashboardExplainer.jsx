import { useRouter } from "next/router";
import ArticleBody from "./ArticleBody";
import explainers from "../data/dashboardExplainers.json";

// ダッシュボードの下に置く「解説」欄。
// 内容が短く、単独の記事としては薄かったため、非公開にした記事（data/draftArticles.json）の本文を、
// 対応するダッシュボードのページの解説として、そのまま表示する。
// 元データは data/dashboardExplainers.json（記事本文から生成）。
export default function DashboardExplainer() {
  const { pathname } = useRouter();
  const items = explainers[pathname] || [];
  if (items.length === 0) return null;

  return (
    <section className="mt-10 border-t border-ink/10 pt-8" aria-label="このデータの読み方">
      <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Guide</p>
      <h2 className="mt-1 font-display text-xl text-ink">このデータの読み方・解説</h2>
      <div className="mt-6 space-y-10">
        {items.map((item) => (
          <article key={item.slug}>
            {items.length > 1 ? <h3 className="mb-3 font-display text-base font-bold text-ink">{item.title}</h3> : null}
            <ArticleBody body={item.body} charts={item.charts} maps={item.maps} />
          </article>
        ))}
      </div>
    </section>
  );
}
