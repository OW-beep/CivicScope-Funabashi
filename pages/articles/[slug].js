import Seo from "../../components/Seo";
import Link from "next/link";
import dynamic from "next/dynamic";
import AdSlot from "../../components/AdSlot";
import DashboardFooterLinks from "../../components/DashboardFooterLinks";
import ShareButtons from "../../components/ShareButtons";
import ArticleThumbnail from "../../components/ArticleThumbnail";
import { siteConfig } from "../../data/siteConfig";
import { articles, getArticleBySlug, getRelatedArticles } from "../../data/articles";

const CategoryBarChart = dynamic(() => import("../../components/CategoryBarChart"), { ssr: false });
const InteractiveMap = dynamic(() => import("../../components/InteractiveMap"), { ssr: false });

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

function renderInline(text, keyPrefix) {
  // **text** の太字と [text](url) のリンクのみサポートする軽量インラインレンダラー
  const pattern = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${key++}`} className="font-semibold text-ink">
          {match[1]}
        </strong>
      );
    } else {
      nodes.push(
        <Link key={`${keyPrefix}-l-${key++}`} href={match[3]} className="underline hover:text-brass-dark">
          {match[2]}
        </Link>
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function renderBody(body, charts, maps) {
  // シンプルな段落・太字（**text**）・箇条書き（- item）記法に加えて、
  // 独立した行の [[CHART:id]] は article.charts[id] に対応するグラフに、
  // [[MAP:id]] は article.maps[id] に対応するインタラクティブ地図に置き換える。
  // charts・maps が無い記事には一切影響しない、後方互換な拡張。
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      const chartMatch = block.match(/^\[\[CHART:([\w-]+)\]\]$/);
      if (chartMatch && charts && charts[chartMatch[1]]) {
        const chart = charts[chartMatch[1]];
        const chartData = (chart.data || []).map((d) => ({ label: d.label, count: d.value }));
        return (
          <div key={i} className="mb-6 border border-ink/10 bg-white/60 p-5">
            {chart.title ? <p className="mb-3 text-xs text-ink-soft">{chart.title}</p> : null}
            <CategoryBarChart data={chartData} unit={chart.unit || ""} topN={chartData.length} />
            {chart.source ? <p className="mt-3 text-[11px] text-ink-soft">出典：{chart.source}</p> : null}
          </div>
        );
      }

      const mapMatch = block.match(/^\[\[MAP:([\w-]+)\]\]$/);
      if (mapMatch && maps && maps[mapMatch[1]]) {
        const map = maps[mapMatch[1]];
        return (
          <div key={i} className="mb-6 border border-ink/10 bg-white/60 p-5">
            {map.title ? <p className="mb-3 text-xs text-ink-soft">{map.title}</p> : null}
            <InteractiveMap points={map.points || []} categoryColors={map.categoryColors} height={map.height || 360} />
            <p className="mt-3 text-[11px] text-ink-soft">
              地図データ：© OpenStreetMap contributors（OpenFreeMap経由で配信）
              {map.source ? `／${map.source}` : ""}
            </p>
          </div>
        );
      }

      const lines = block.split("\n").map((l) => l.trim());
      const isList = lines.length > 0 && lines.every((l) => l.startsWith("- "));

      // Markdownテーブル記法（| 見出し | 見出し |\n|---|---|\n| 値 | 値 |）を、
      // 生のパイプ文字のまま表示せず、きちんとしたHTMLテーブルとして描画する。
      const isTable =
        lines.length >= 2 &&
        lines.every((l) => l.startsWith("|") && l.endsWith("|")) &&
        lines[1]
          .slice(1, -1)
          .split("|")
          .every((cell) => /^:?-+:?$/.test(cell.trim()));

      if (isTable) {
        const parseRow = (line) =>
          line
            .slice(1, -1)
            .split("|")
            .map((cell) => cell.trim());
        const headerCells = parseRow(lines[0]);
        const bodyRows = lines.slice(2).map(parseRow);

        return (
          <div key={i} className="mb-6 overflow-x-auto border border-ink/10">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-ink text-paper">
                  {headerCells.map((cell, ci) => (
                    <th key={ci} className="whitespace-nowrap px-3 py-2 font-normal">
                      {renderInline(cell, `${i}-th-${ci}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? "bg-white/70" : "bg-paper-dark/40"}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="whitespace-nowrap px-3 py-2 text-ink-soft">
                        {renderInline(cell, `${i}-td-${ri}-${ci}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      if (isList) {
        return (
          <ul key={i} className="mb-5 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.9] text-ink-soft">
            {lines.map((line, j) => (
              <li key={j}>{renderInline(line.slice(2), `${i}-${j}`)}</li>
            ))}
          </ul>
        );
      }

      return (
        <p key={i} className="mb-5 text-[15px] leading-[1.9] text-ink-soft">
          {renderInline(block, `${i}`)}
        </p>
      );
    });
}

export default function ArticlePage({ article, relatedArticles }) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: `${siteConfig.url}/articles/${article.slug}`
  };

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
        title={`${article.title}｜${siteConfig.name}`}
        description={article.excerpt}
        path={`/articles/${article.slug}`}
        type="article"
        jsonLd={faqJsonLd ? [articleJsonLd, faqJsonLd] : articleJsonLd}
      />

      <article className="mx-auto max-w-2xl px-5 py-14">
        <Link href="/articles" className="font-mono text-xs text-ink-soft hover:text-brass-dark">
          ← 解説記事一覧へ
        </Link>

        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-brass-dark">{article.tag}</p>
        <h1 className="mt-2 font-display text-3xl leading-snug text-ink md:text-4xl">{article.title}</h1>
        <p className="mt-3 font-mono text-xs text-ink-soft">{article.date}</p>

        <ArticleThumbnail tag={article.tag} slug={article.slug} className="mt-6 h-48 w-full rounded-2xl shadow-pop" />

        <ShareButtons title={article.title} url={`${siteConfig.url}/articles/${article.slug}`} className="mt-5" />

        <div className="mt-10">{renderBody(article.body, article.charts, article.maps)}</div>

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
                  <ArticleThumbnail tag={a.tag} slug={a.slug} className="h-14 w-20 flex-shrink-0 rounded-lg" />
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
