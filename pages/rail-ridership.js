import Seo from "../components/Seo";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig } from "../data/siteConfig";
import {
  getLatestRanking,
  combineByStationName,
  getGrowthRanking,
  getTotalSeries,
  buildTotalInsights
} from "../data/railRidership";

const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

export async function getStaticProps() {
  return {
    props: {
      ranking: getLatestRanking(15),
      combined: combineByStationName(10),
      growth: getGrowthRanking(10),
      totalSeries: getTotalSeries(),
      insights: buildTotalInsights()
    }
  };
}

function fmt(n) {
  return n.toLocaleString("ja-JP");
}

export default function RailRidership({ ranking, combined, growth, totalSeries, insights }) {
  const rankingChartData = ranking.map((r) => ({ label: r.label, count: r.count }));
  const combinedChartData = combined.map((r) => ({ label: r.label, count: r.count }));

  return (
    <>
      <Seo title={`鉄道駅別乗車人員 ダッシュボード｜${siteConfig.name}`} description="船橋市内の鉄道駅別1日平均乗車人員のランキングと推移を可視化したダッシュボードです（船橋市統計書「I 都市基盤」より）。" path="/rail-ridership" />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">鉄道駅別乗車人員 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市統計書「I 都市基盤」（資料：道路計画課）をもとに、市内35の駅×事業者について、
          1日平均乗車人員の推移とランキングを可視化しています。
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
            西船橋・船橋・北習志野は複数の鉄道事業者が同じ駅名で乗り入れている（乗換駅の）ため、
            事業者ごとに別々の数値として集計されています。
          </strong>
        </p>

        {insights ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="全駅×事業者 合計乗車人員"
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
              label="最多乗車人員（駅名合算）"
              value={fmt(combined[0].count)}
              unit="人/日"
              delta={combined[0].label}
              deltaLabel={`${combined[0].operators.length}社が乗り入れ`}
            />
            <StatCard
              label="伸び率No.1"
              value={`+${growth[0].rate.toFixed(1)}%`}
              delta={growth[0].label}
              deltaLabel="令和2→6年度"
              tone="up"
            />
          </div>
        ) : null}

        <div className="mt-10 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.1">全駅×事業者 合計乗車人員の推移</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={totalSeries} seriesLabel="合計乗車人員" unit="人/日" periodLabel="年度" />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.2">{"駅別ランキング（駅名で合算、令和6年度）"}</SectionLabel>
          <p className="mb-3 text-xs text-ink-soft">
            西船橋・船橋・北習志野は複数事業者を合算した数値です。
          </p>
          <ChartErrorBoundary>
            <CategoryBarChart data={combinedChartData} unit="人/日" topN={10} />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.3">{"駅×事業者別ランキング（令和6年度、上位15）"}</SectionLabel>
          <ChartErrorBoundary>
            <CategoryBarChart data={rankingChartData} unit="人/日" topN={15} />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.4">{"伸び率ランキング（令和2→6年度、上位10）"}</SectionLabel>
          <ChartErrorBoundary>
            <CategoryBarChart
              data={growth.map((g) => ({ label: g.label, count: +g.rate.toFixed(1) }))}
              unit="%"
              topN={10}
            />
          </ChartErrorBoundary>
        </div>

        {insights ? (
          <div className="mt-10 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
            <p className="font-display text-base text-ink">読み解きメモ</p>
            <p className="mt-2">
              単独の駅×事業者では東京メトロ西船橋（{fmt(ranking[0].count)}人/日）がトップですが、
              JR・東京メトロ・東葉高速鉄道の3社が乗り入れる西船橋駅を合算すると、1日あたり
              {fmt(combined[0].count)}人と、市内で圧倒的に多い乗換駅であることが分かります。
              船橋駅（JR＋東武）も合算すると{fmt(combined[1].count)}人で、この2駅が市内の鉄道利用の中心です。
            </p>
            <p className="mt-3">
              伸び率で見ると、東葉高速鉄道の船橋日大前駅が令和2年度の{fmt(growth[0].first)}人から
              令和6年度の{fmt(growth[0].last)}人へと、5年間で約{growth[0].rate.toFixed(0)}%という
              突出した伸びを見せています。この期間、日本大学理工学部船橋キャンパス周辺の再開発や
              学生数の動向などが影響している可能性がありますが、正確な要因はデータからは特定できません。
            </p>
            <p className="mt-3">
              全駅×事業者を単純合計した乗車人員は、令和2年度の{fmt(insights.first.total)}人から
              令和6年度の{fmt(insights.latest.total)}人へと、5年間で約{insights.longTermRate.toFixed(1)}%
              増加しています。令和2年度はコロナ禍の影響で利用が落ち込んでいた時期にあたるため、
              その後の回復・増加という側面も含まれている点にご留意ください。
            </p>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-ink-soft">
          ※ このデータは各年3月31日現在の1日平均乗車人員（定期・定期外の合計）です。
          乗換人員は含まれない可能性があり、駅の実際の利用者数（駅から出入りする人数）とは
          必ずしも一致しません。
        </p>

        <div className="mt-10">
          <DashboardFooterLinks
            articleHref="/articles/rail-ridership-guide"
            articleLabel="船橋市内、一番利用者が多い駅はどこ？鉄道駅別乗車人員を徹底比較"
          />
        </div>

        <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RAIL} className="h-24" />
        </div>
      </section>
    </>
  );
}
