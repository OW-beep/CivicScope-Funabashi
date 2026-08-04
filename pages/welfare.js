import Seo from "../components/Seo";
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
import { getProtectionRateSeries, buildProtectionRateInsights } from "../data/protectionRate";
import { getConsultationSeries, getStartEndComposition, buildConsultationInsights } from "../data/welfareFlow";

const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

export async function getStaticProps() {
  const series = getTotalHouseholdsSeries();
  const composition = getLatestComposition();
  const shareSeries = getSingleHouseholdShareSeries();
  const insights = buildWelfareInsights();
  const protectionRateSeries = getProtectionRateSeries();
  const protectionRateInsights = buildProtectionRateInsights();
  const consultationSeries = getConsultationSeries();
  const startEndComposition = getStartEndComposition();
  const consultationInsights = buildConsultationInsights();

  return {
    props: {
      series,
      composition,
      shareSeries,
      insights,
      protectionRateSeries,
      protectionRateInsights,
      consultationSeries,
      startEndComposition,
      consultationInsights
    }
  };
}

export default function Welfare({
  series,
  composition,
  shareSeries,
  insights,
  protectionRateSeries,
  protectionRateInsights,
  consultationSeries,
  startEndComposition,
  consultationInsights
}) {
  return (
    <>
      <Seo title={`生活保護（被保護世帯） ダッシュボード｜${siteConfig.name}`} description="船橋市の生活保護（被保護世帯）の世帯数推移と、世帯人員別の内訳を可視化したダッシュボードです。" path="/welfare" />

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

        {/* --- 保護率（船橋市・千葉県・全国の比較） --------------------------- */}
        {protectionRateInsights ? (
          <div className="mt-14 border-t border-ink/10 pt-10">
            <SectionLabel code="FIG.RATE">保護率の比較（船橋市・千葉県・全国）</SectionLabel>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
              保護率（人口1,000人あたりの被保護人員数）は、人口規模の異なる地域同士でも比較しやすい
              指標です。船橋市・千葉県（千葉市除く）・全国の保護率を比較します。
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="船橋市の保護率（最新）"
                value={protectionRateInsights.latest.funabashi.toFixed(2)}
                unit="‰"
                delta={protectionRateInsights.latest.label}
                deltaLabel="時点"
              />
              <StatCard
                label="千葉県平均との差"
                value={`${protectionRateInsights.diffFromChiba > 0 ? "+" : ""}${protectionRateInsights.diffFromChiba.toFixed(2)}`}
                delta={protectionRateInsights.diffFromChiba >= 0 ? "県平均より高い" : "県平均より低い"}
                deltaLabel={protectionRateInsights.latest.label}
                tone={protectionRateInsights.diffFromChiba >= 0 ? "down" : "up"}
              />
              <StatCard
                label="全国平均との差"
                value={`${protectionRateInsights.diffFromNational > 0 ? "+" : ""}${protectionRateInsights.diffFromNational.toFixed(2)}`}
                delta={protectionRateInsights.diffFromNational >= 0 ? "全国平均より高い" : "全国平均より低い"}
                deltaLabel={protectionRateInsights.latest.label}
                tone={protectionRateInsights.diffFromNational >= 0 ? "down" : "up"}
              />
            </div>
            <div className="mt-6 border border-ink/10 bg-white/60 p-5">
              <ChartErrorBoundary>
                <PopulationChart data={protectionRateSeries} seriesLabel="保護率（船橋市）" unit="‰" periodLabel="年度" />
              </ChartErrorBoundary>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
              船橋市の保護率は{protectionRateInsights.latest.label}時点で
              {protectionRateInsights.latest.funabashi.toFixed(2)}‰と、千葉県平均（
              {protectionRateInsights.latest.chiba.toFixed(2)}‰）をやや上回る一方、全国平均（
              {protectionRateInsights.latest.national.toFixed(1)}‰）を下回る水準です。11年間で見ると
              {protectionRateInsights.longTermDiff >= 0 ? "微増" : "微減"}
              （{protectionRateInsights.longTermDiff > 0 ? "+" : ""}
              {protectionRateInsights.longTermDiff.toFixed(2)}ポイント）にとどまっており、
              被保護世帯数そのものは増加傾向にあるものの、人口増加とほぼ歩調を合わせているため、
              人口あたりの割合としては大きくは変化していないことが分かります。
            </p>
            <p className="mt-3 max-w-2xl text-xs text-ink-soft">
              出典：船橋市オープンデータカタログ「
              <a
                href="https://data.bodik.jp/dataset/122041_hihogosetaijininhogoritu"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-brass-dark"
              >
                被保護世帯、人員及び保護率の推移
              </a>
              」（作成：生活支援課）
            </p>
          </div>
        ) : null}

        {/* --- 相談・開始・廃止の推移 --------------------------------------- */}
        {consultationInsights ? (
          <div className="mt-14 border-t border-ink/10 pt-10">
            <SectionLabel code="FIG.FLOW">相談・開始・廃止の推移</SectionLabel>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
              被保護世帯数は「開始（新たに保護を受け始めた世帯）」と「廃止（保護を受けなくなった
              世帯）」の差し引きで増減します。この"入り口と出口"の動きを見てみます。
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="相談件数（最新）"
                value={consultationInsights.latest.consultations.toLocaleString("ja-JP")}
                unit="件"
                delta={consultationInsights.latest.label}
                deltaLabel="時点"
              />
              <StatCard
                label="開始世帯 − 廃止世帯"
                value={`${consultationInsights.netHouseholdChange > 0 ? "+" : ""}${consultationInsights.netHouseholdChange}`}
                unit="世帯"
                delta={consultationInsights.netHouseholdChange >= 0 ? "純増" : "純減"}
                deltaLabel={consultationInsights.latest.label}
                tone={consultationInsights.netHouseholdChange >= 0 ? "down" : "up"}
              />
              <StatCard
                label="相談件数の長期変化"
                value={`${consultationInsights.consultationLongTermRate > 0 ? "+" : ""}${consultationInsights.consultationLongTermRate.toFixed(1)}%`}
                delta={`${consultationInsights.first.label}比`}
                deltaLabel="長期推移"
              />
            </div>
            <div className="mt-6 border border-ink/10 bg-white/60 p-5">
              <ChartErrorBoundary>
                <PopulationChart data={consultationSeries} seriesLabel="相談件数" unit="件" periodLabel="年度" />
              </ChartErrorBoundary>
            </div>
            <div className="mt-6 border border-ink/10 bg-white/60 p-5">
              <SectionLabel code="FIG.FLOW2">{`開始世帯数 と 廃止世帯数（${startEndComposition.period}）`}</SectionLabel>
              <ChartErrorBoundary>
                <CategoryBarChart data={startEndComposition.data} unit="世帯" topN={2} />
              </ChartErrorBoundary>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {consultationInsights.latest.label}は、廃止世帯数（{consultationInsights.latest.endHouseholds}世帯）が
              開始世帯数（{consultationInsights.latest.startHouseholds}世帯）を上回り、
              差し引き{Math.abs(consultationInsights.netHouseholdChange)}世帯の純減となりました。
              相談件数は{consultationInsights.first.label}の{consultationInsights.first.consultations.toLocaleString("ja-JP")}件から
              {consultationInsights.latest.label}の{consultationInsights.latest.consultations.toLocaleString("ja-JP")}件へと、
              長期的にはやや減少傾向にあります。
            </p>
            <p className="mt-3 max-w-2xl text-xs text-ink-soft">
              出典：船橋市オープンデータカタログ「
              <a
                href="https://data.bodik.jp/dataset/122041_seihosoudankaisihaisi"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-brass-dark"
              >
                生活保護の相談・開始・廃止の年度別推移
              </a>
              」（作成：生活支援課）
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
