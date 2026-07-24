import Head from "next/head";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig, datasets } from "../data/siteConfig";
import {
  getDatasetRecords,
  normalizePopulationSeries,
  buildAnnualSeriesInsights,
  normalizeAgeDistribution,
  buildAgeDistributionInsights,
  buildLifeStageBreakdown
} from "../lib/bodik";

const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

export async function getStaticProps() {
  let infantSeries = [];
  let infantInsights = null;
  let infantError = null;

  let ageDistribution = [];
  let ageInsights = null;
  let ageLatestPeriod = null;
  let ageYearlyTotals = [];
  let lifeStageBreakdown = [];
  let ageError = null;

  try {
    const infantData = await getDatasetRecords(datasets.infantCount.id);
    const normalized = normalizePopulationSeries(infantData);
    if (normalized) {
      infantSeries = normalized.series;
      infantInsights = buildAnnualSeriesInsights(infantSeries, "total");
    } else {
      infantError = "データの列構成を自動認識できませんでした。原典データセットをご確認ください。";
    }
  } catch (e) {
    infantError = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  try {
    const ageData = await getDatasetRecords(datasets.childrenByAge.id);
    const normalized = normalizeAgeDistribution(ageData);
    if (normalized) {
      ageDistribution = normalized.distribution;
      ageLatestPeriod = normalized.latestPeriodLabel;
      ageYearlyTotals = normalized.yearlyTotals || [];
      ageInsights = buildAgeDistributionInsights(normalized);
      lifeStageBreakdown = buildLifeStageBreakdown(ageDistribution);
    } else {
      ageError = "データの列構成を自動認識できませんでした。原典データセットをご確認ください。";
    }
  } catch (e) {
    ageError = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  return {
    props: {
      infantSeries,
      infantInsights,
      infantError,
      ageDistribution,
      ageInsights,
      ageLatestPeriod,
      ageYearlyTotals,
      lifeStageBreakdown,
      ageError
    },
    revalidate: 60 * 60 * 24
  };
}

export default function Children({
  infantSeries,
  infantInsights,
  infantError,
  ageDistribution,
  ageInsights,
  ageLatestPeriod,
  ageYearlyTotals,
  lifeStageBreakdown,
  ageError
}) {
  const ageChartData = ageDistribution.map((d) => ({ label: `${d.label}歳`, count: d.value }));
  const yearlyTotalsChartData = ageYearlyTotals.map((d) => ({ label: d.label, count: d.total }));

  return (
    <>
      <Head>
        <title>{`子ども・子育て ダッシュボード｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市の乳児数の年度別推移と、児童の年齢別人口・ライフステージ別の内訳を可視化したダッシュボードです。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">子ども・子育て ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの「{datasets.infantCount.label}」と「{datasets.childrenByAge.label}」をもとに、
          乳児数の推移と児童の年齢別人口を可視化しています。
        </p>

        {/* --- 年度別乳児数 --------------------------------------------- */}
        <div className="mt-10">
          <SectionLabel code="FIG.1">年度別乳児数の推移</SectionLabel>
          {infantError ? (
            <div className="border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
              <p>{infantError}</p>
              <a
                href={datasets.infantCount.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block underline"
              >
                原典データセットを見る →
              </a>
            </div>
          ) : (
            <>
              {infantInsights ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard
                    label="最新年度の乳児数"
                    value={infantInsights.latest.total.toLocaleString("ja-JP")}
                    unit="人"
                    delta={infantInsights.latest.label}
                    deltaLabel="時点"
                  />
                  <StatCard
                    label="前年度比"
                    value={`${infantInsights.diff > 0 ? "+" : ""}${infantInsights.diff.toLocaleString("ja-JP")}`}
                    unit="人"
                    delta={
                      infantInsights.rate !== null
                        ? `${infantInsights.rate > 0 ? "+" : ""}${infantInsights.rate.toFixed(2)}%`
                        : null
                    }
                    deltaLabel="増減率"
                    tone={infantInsights.diff > 0 ? "up" : infantInsights.diff < 0 ? "down" : "neutral"}
                  />
                </div>
              ) : null}

              <div className="mt-6 border border-ink/10 bg-white/60 p-5">
                <ChartErrorBoundary>
                  <PopulationChart data={infantSeries} seriesLabel="乳児数" unit="人" periodLabel="年度" />
                </ChartErrorBoundary>
              </div>

              {infantInsights ? (
                <div className="mt-6 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                  <p className="font-display text-base text-ink">読み解きメモ</p>
                  <p className="mt-2">
                    {infantInsights.latest.label}の乳児数は{infantInsights.latest.total.toLocaleString("ja-JP")}人で、
                    前年度から
                    {infantInsights.diff >= 0 ? "増加" : "減少"}
                    （{infantInsights.diff > 0 ? "+" : ""}{infantInsights.diff.toLocaleString("ja-JP")}人）しました。
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* --- 児童の年齢別人口 ------------------------------------------ */}
        <div className="mt-14">
          <SectionLabel code="FIG.2">児童の年齢別人口</SectionLabel>
          {ageError ? (
            <div className="border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
              <p>{ageError}</p>
              <a
                href={datasets.childrenByAge.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block underline"
              >
                原典データセットを見る →
              </a>
            </div>
          ) : (
            <>
              {ageLatestPeriod ? (
                <p className="mb-4 text-xs text-ink-soft">対象年度・時点：{ageLatestPeriod}</p>
              ) : null}

              {ageInsights ? (
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  <StatCard label="児童の合計人口" value={ageInsights.total.toLocaleString("ja-JP")} unit="人" />
                  <StatCard
                    label="最も人数が多い年齢"
                    value={`${ageInsights.top.label}歳`}
                    delta={`${ageInsights.top.value.toLocaleString("ja-JP")}人`}
                    deltaLabel={`全体の${ageInsights.topShare.toFixed(1)}%`}
                  />
                  <StatCard label="集計している年齢の数" value={ageInsights.count.toLocaleString("ja-JP")} unit="歳分" />
                </div>
              ) : null}

              <div className="border border-ink/10 bg-white/60 p-5">
                <p className="mb-3 text-xs text-ink-soft">年齢1歳ごとの人口（{ageLatestPeriod || "最新年度"}）</p>
                <ChartErrorBoundary>
                  <CategoryBarChart data={ageChartData} unit="人" topN={20} />
                </ChartErrorBoundary>
              </div>

              {lifeStageBreakdown.length ? (
                <div className="mt-8 border border-ink/10 bg-white/60 p-5">
                  <SectionLabel code="FIG.3">ライフステージ別の内訳</SectionLabel>
                  <p className="mb-3 text-xs text-ink-soft">
                    未就学児・小学生・中学生といった生活・就学段階でまとめ直した内訳です（{ageLatestPeriod || "最新年度"}）。
                  </p>
                  <ChartErrorBoundary>
                    <CategoryBarChart data={lifeStageBreakdown} unit="人" topN={10} />
                  </ChartErrorBoundary>
                </div>
              ) : null}

              {yearlyTotalsChartData.length > 1 ? (
                <div className="mt-8 border border-ink/10 bg-white/60 p-5">
                  <SectionLabel code="FIG.4">児童人口（合計）の年度推移</SectionLabel>
                  <ChartErrorBoundary>
                    <PopulationChart data={yearlyTotalsChartData} seriesLabel="児童人口" unit="人" periodLabel="年度" />
                  </ChartErrorBoundary>
                </div>
              ) : null}

              {ageInsights ? (
                <div className="mt-8 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                  <p className="font-display text-base text-ink">読み解きメモ</p>
                  <p className="mt-2">
                    {ageLatestPeriod ? `${ageLatestPeriod}時点で、` : ""}
                    児童の年齢別人口を見ると、最も人数が多いのは{ageInsights.top.label}歳で
                    {ageInsights.top.value.toLocaleString("ja-JP")}人（全体の{ageInsights.topShare.toFixed(1)}%）でした。
                    {lifeStageBreakdown.length
                      ? "ライフステージ別に見ることで、保育・小学校・中学校それぞれの定員計画を考える際の参考になります。"
                      : ""}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="mt-10">
          <DashboardFooterLinks />
          </div>

          <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CHILDREN} className="h-24" />
          </div>
      </section>
    </>
  );
}
