import Seo from "../components/Seo";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig } from "../data/siteConfig";
import { getTotalRidersSeries, getLatestOperatorRanking, getLatestVehicleRanking, buildTotalInsights } from "../data/busRidership";

const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

export async function getStaticProps() {
  return {
    props: {
      totalSeries: getTotalRidersSeries(),
      ranking: getLatestOperatorRanking(),
      vehicleRanking: getLatestVehicleRanking(),
      insights: buildTotalInsights()
    }
  };
}

function fmt(n) {
  return n.toLocaleString("ja-JP");
}

export default function BusRidership({ totalSeries, ranking, vehicleRanking, insights }) {
  return (
    <>
      <Seo title={`市内バス運輸状況 ダッシュボード｜${siteConfig.name}`} description="船橋市内を走るバス事業者別の乗車人員・運行台数の推移を可視化したダッシュボードです（船橋市統計書「I 都市基盤」より）。" path="/bus-ridership" />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">市内バス運輸状況 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市統計書「I 都市基盤」（資料：道路計画課）をもとに、市内を走る7つのバス事業者について、
          1日平均乗車人員・運行台数の推移を可視化しています。
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          出典：船橋市統計書「I 都市基盤」（
          <a
            href="https://www.city.funabashi.lg.jp/shisei/toukei/002/index.html"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-brass-dark"
          >
            船橋市統計書 一覧
          </a>
          ）。本データはBODIK ODCSではなく船橋市公式サイトが公開するPDFから作成した静的データです。
          <strong className="font-semibold text-ink">
            平和交通・鎌ヶ谷観光バスは1日平均乗車人員が非公表のため、下記の合計・グラフには含まれていません。
          </strong>
        </p>

        {insights ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="バス乗車人員 合計（公表分）"
              value={fmt(insights.latest.total)}
              unit="人/日"
              delta={insights.latest.label}
              deltaLabel="時点"
            />
            <StatCard
              label="前年度比"
              value={`${insights.rate > 0 ? "+" : ""}${insights.rate.toFixed(1)}%`}
              delta={`5年で${insights.longTermRate > 0 ? "+" : ""}${insights.longTermRate.toFixed(1)}%`}
              deltaLabel="長期推移"
              tone={insights.diff > 0 ? "up" : insights.diff < 0 ? "down" : "neutral"}
            />
            <StatCard
              label="最多乗車人員の事業者"
              value={fmt(ranking[0].count)}
              unit="人/日"
              delta={ranking[0].label}
              deltaLabel="令和6年度"
            />
            <StatCard
              label="最多運行台数の事業者"
              value={`${vehicleRanking[0].count}台`}
              delta={vehicleRanking[0].label}
              deltaLabel="令和6年度"
            />
          </div>
        ) : null}

        <div className="mt-10 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.1">{"バス乗車人員 合計の推移（公表事業者のみ）"}</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={totalSeries} seriesLabel="合計乗車人員" unit="人/日" periodLabel="年度" />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.2">{"事業者別 1日平均乗車人員（令和6年度）"}</SectionLabel>
          <ChartErrorBoundary>
            <CategoryBarChart data={ranking} unit="人/日" topN={5} />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.3">{"事業者別 運行台数（令和6年度）"}</SectionLabel>
          <ChartErrorBoundary>
            <CategoryBarChart data={vehicleRanking} unit="台" topN={6} />
          </ChartErrorBoundary>
        </div>

        {insights ? (
          <div className="mt-10 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
            <p className="font-display text-base text-ink">読み解きメモ</p>
            <p className="mt-2">
              乗車人員が公表されている5事業者のうち、船橋新京成バス（{fmt(ranking[0].count)}人/日）と
              京成バス（{fmt(ranking[1].count)}人/日）の2社で全体の9割近くを占めています。
              一方、運行台数を見ると船橋新京成バスは令和2年度の141台から令和6年度には114台へと
              減少しており、乗車人員はそれほど落ちていない一方で、運行の効率化が進んでいる可能性があります。
            </p>
            <p className="mt-3">
              公表されている事業者だけの合計乗車人員は、令和2年度の{fmt(insights.first.total)}人から
              令和6年度の{fmt(insights.latest.total)}人へと、5年間で約{insights.longTermRate.toFixed(1)}%の
              増加です。ただし平和交通・鎌ヶ谷観光バスの乗車人員は非公表のため、この数字は
              市内バス利用の全体像を完全には反映していません。鎌ヶ谷観光バスは令和6年度に運行を
              終了しています。
            </p>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-ink-soft">
          ※ 各年3月31日現在のデータです。路線や運行本数の詳細は各バス事業者の公式サイトをご確認ください。
        </p>

        <div className="mt-10">
          <DashboardFooterLinks
            articleHref="/articles/bus-ridership-guide"
            articleLabel="船橋市内のバス、どの会社が一番使われている？"
          />
        </div>

        <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BUS} className="h-24" />
        </div>
      </section>
    </>
  );
}
