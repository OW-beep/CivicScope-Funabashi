import Head from "next/head";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig, datasets } from "../data/siteConfig";
import {
  getTotalHouseholdsSeries,
  getLatestComposition,
  getSingleHouseholdShareSeries,
  buildWelfareInsights
} from "../data/welfareHouseholds";

const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

export async function getStaticProps() {
  const series = getTotalHouseholdsSeries();
  const composition = getLatestComposition();
  const shareSeries = getSingleHouseholdShareSeries();
  const insights = buildWelfareInsights();

  return {
    props: { series, composition, shareSeries, insights }
  };
}

export default function Welfare({ series, composition, shareSeries, insights }) {
  return (
    <>
      <Head>
        <title>{`生活保護（被保護世帯） ダッシュボード｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市の生活保護（被保護世帯）の世帯数推移と、世帯人員別の内訳を可視化したダッシュボードです。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">生活保護（被保護世帯） ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市の生活保護（被保護世帯）データをもとに、世帯数の推移と世帯人員別の内訳を可視化しています。
          平成26年度から令和6年度までの年度別データです。
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          出典：船橋市オープンデータカタログ「
          <a href={datasets.welfareHouseholds.sourceUrl} target="_blank" rel="noreferrer" className="underline hover:text-brass-dark">
            {datasets.welfareHouseholds.label}
          </a>
          」（{siteConfig.bodik.license}）
        </p>

        {insights ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="最新年度の被保護世帯数"
              value={insights.latest.total.toLocaleString("ja-JP")}
              unit="世帯"
              delta={insights.latest.label}
              deltaLabel="時点"
            />
            <StatCard
              label="前年度比"
              value={`${insights.diff > 0 ? "+" : ""}${insights.diff.toLocaleString("ja-JP")}`}
              unit="世帯"
              delta={insights.rate !== null ? `${insights.rate > 0 ? "+" : ""}${insights.rate.toFixed(2)}%` : null}
              deltaLabel="増減率"
              tone={insights.diff > 0 ? "up" : insights.diff < 0 ? "down" : "neutral"}
            />
            <StatCard
              label="1人世帯が占める割合"
              value={insights.latestShare.total !== null ? insights.latestShare.total.toFixed(1) : "―"}
              unit="%"
              delta={
                insights.firstShare.total !== null && insights.latestShare.total !== null
                  ? `${(insights.latestShare.total - insights.firstShare.total > 0 ? "+" : "")}${(
                      insights.latestShare.total - insights.firstShare.total
                    ).toFixed(1)}pt`
                  : null
              }
              deltaLabel={`${insights.first.label}比`}
            />
          </div>
        ) : null}

        <div className="mt-10 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.1">被保護世帯数の推移</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={series} seriesLabel="被保護世帯数" unit="世帯" periodLabel="年度" />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.2">{`世帯人員別の内訳（${composition.period}）`}</SectionLabel>
          <ChartErrorBoundary>
            <CategoryBarChart data={composition.data} unit="世帯" topN={10} />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.3">1人世帯が占める割合の推移</SectionLabel>
          <p className="mb-3 text-xs text-ink-soft">
            被保護世帯のうち、単身（1人）世帯が占める割合の変化です。全国的に指摘される高齢単身世帯の増加傾向と
            照らし合わせて見ることができます。
          </p>
          <ChartErrorBoundary>
            <PopulationChart data={shareSeries} seriesLabel="1人世帯の割合" unit="%" periodLabel="年度" />
          </ChartErrorBoundary>
        </div>

        {insights ? (
          <div className="mt-8 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
            <p className="font-display text-base text-ink">読み解きメモ</p>
            <p className="mt-2">
              {insights.latest.label}の被保護世帯数は{insights.latest.total.toLocaleString("ja-JP")}世帯で、
              前年度から{insights.diff >= 0 ? "増加" : "減少"}
              （{insights.diff > 0 ? "+" : ""}{insights.diff.toLocaleString("ja-JP")}世帯）しました。
              {insights.first.label}からの11年間では
              {insights.longTermDiff > 0 ? "+" : ""}
              {insights.longTermDiff.toLocaleString("ja-JP")}世帯
              （{insights.longTermRate > 0 ? "+" : ""}{insights.longTermRate.toFixed(1)}%）の変化です。
              世帯人員別に見ると、一貫して1人世帯が最も多く、その割合は{insights.firstShare.label}時点の
              {insights.firstShare.total?.toFixed(1)}%から{insights.latestShare.label}時点の
              {insights.latestShare.total?.toFixed(1)}%へと変化しています。単身世帯の増加は、
              全国的にも高齢化・単身化の進行と関連づけて語られることが多い傾向です。
            </p>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-ink-soft">
          ※ 生活保護制度の詳細な要件・手続きについては、必ず船橋市の福祉事務所など公式窓口にご確認ください。本ダッシュボードは統計データの可視化であり、制度の案内や相談窓口ではありません。お困りごとがある場合は、お一人で抱え込まず、船橋市の福祉事務所や地域の相談窓口にご相談ください。
        </p>

        <div className="mt-10">
          <DashboardFooterLinks articleHref="/articles/welfare-households-guide" articleLabel="生活保護世帯データから見える、単身世帯という変化" />
          </div>

          <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_WELFARE} className="h-24" />
          </div>
      </section>
    </>
  );
}
