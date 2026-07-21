import Head from "next/head";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig, datasets } from "../data/siteConfig";
import { getDatasetRecords, normalizePopulationSeries, buildPopulationInsights } from "../lib/bodik";

// Rechartsはブラウザ専用APIに依存するためSSRを無効化して読み込む
const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });

export async function getStaticProps() {
  let normalized = null;
  let insights = null;
  let error = null;

  try {
    const popData = await getDatasetRecords(datasets.population.id);
    normalized = normalizePopulationSeries(popData);
    insights = buildPopulationInsights(normalized);
  } catch (e) {
    error = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  return {
    props: {
      series: normalized?.series || [],
      insights: insights || null,
      error
    },
    revalidate: 60 * 60 * 12
  };
}

export default function Dashboard({ series, insights, error }) {
  return (
    <>
      <Head>
        <title>{`人口ダッシュボード｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市の常住人口データをもとに、月次推移・前月比・前年同月比を自動集計して可視化したダッシュボードです。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">船橋市 人口ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログが公開する「{datasets.population.label}」を自動取得し、
          推移のグラフ化と、前月比・前年同月比などの指標を算出しています。
          データの定義については
          <a href={datasets.population.sourceUrl} target="_blank" rel="noreferrer" className="underline hover:text-brass-dark">
            原典データセット
          </a>
          をご確認ください。
        </p>

        {error ? (
          <p className="mt-8 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">{error}</p>
        ) : (
          <>
            {insights ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="最新月の常住人口"
                  value={insights.latest.total.toLocaleString("ja-JP")}
                  unit="人"
                  delta={insights.latest.label}
                  deltaLabel="時点"
                />
                <StatCard
                  label="前月比"
                  value={`${insights.momDiff > 0 ? "+" : ""}${insights.momDiff.toLocaleString("ja-JP")}`}
                  unit="人"
                  tone={insights.momDiff > 0 ? "up" : insights.momDiff < 0 ? "down" : "neutral"}
                />
                <StatCard
                  label="前年同月比"
                  value={`${insights.yoyDiff > 0 ? "+" : ""}${insights.yoyDiff.toLocaleString("ja-JP")}`}
                  unit="人"
                  delta={insights.yoyRate !== null ? `${insights.yoyRate > 0 ? "+" : ""}${insights.yoyRate.toFixed(2)}%` : null}
                  deltaLabel="増減率"
                  tone={insights.yoyDiff > 0 ? "up" : insights.yoyDiff < 0 ? "down" : "neutral"}
                />
                <StatCard
                  label="集計期間内のピーク"
                  value={insights.peak.total.toLocaleString("ja-JP")}
                  unit="人"
                  delta={insights.peak.label}
                  deltaLabel="時点"
                />
              </div>
            ) : null}

            <div className="mt-10 border border-ink/10 bg-white/60 p-5">
              <SectionLabel code="FIG.1">常住人口の推移</SectionLabel>
              <ChartErrorBoundary>
                <PopulationChart data={series} />
              </ChartErrorBoundary>
            </div>

            {insights ? (
              <div className="mt-8 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                <p className="font-display text-base text-ink">読み解きメモ</p>
                <p className="mt-2">
                  {insights.rangeStart.label}から{insights.rangeEnd.label}までのデータでは、
                  最新値は{insights.latest.total.toLocaleString("ja-JP")}人で、前月から
                  {insights.momDiff >= 0 ? "増加" : "減少"}
                  （{insights.momDiff >= 0 ? "+" : ""}{insights.momDiff.toLocaleString("ja-JP")}人）しました。
                  前年同月との比較では
                  {insights.yoyDiff >= 0 ? "増加" : "減少"}
                  傾向
                  {insights.yoyRate !== null ? `（${insights.yoyRate > 0 ? "+" : ""}${insights.yoyRate.toFixed(2)}%）` : ""}
                  にあります。詳しい読み方は
                  <a href="/articles/population-data-guide" className="underline hover:text-brass-dark">解説記事</a>
                  もご参照ください。
                </p>
              </div>
            ) : null}
          </>
        )}

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD} className="h-24" />
        </div>
      </section>
    </>
  );
}
