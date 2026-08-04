import Seo from "../components/Seo";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig } from "../data/siteConfig";
import { getRatioSeries, getNewOffersSeries, getNewSeekersSeries, buildEmploymentInsights } from "../data/employment";

const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });

export async function getStaticProps() {
  return {
    props: {
      ratioSeries: getRatioSeries(),
      offersSeries: getNewOffersSeries(),
      seekersSeries: getNewSeekersSeries(),
      insights: buildEmploymentInsights()
    }
  };
}

function fmt(n) {
  return n.toLocaleString("ja-JP");
}

export default function Employment({ ratioSeries, offersSeries, seekersSeries, insights }) {
  return (
    <>
      <Seo title={`雇用・求人 ダッシュボード｜${siteConfig.name}`} description="船橋公共職業安定所管内の有効求人倍率・新規求人数・新規求職申込件数の推移を可視化したダッシュボードです（船橋市統計書「L 労働」より）。" path="/employment" />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">雇用・求人 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市統計書「L 労働」（資料：千葉労働局）をもとに、有効求人倍率・新規求人数・新規求職申込件数の
          推移を可視化しています。
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          出典：船橋市統計書「L 労働」（
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
            船橋市単独ではなく、船橋公共職業安定所管内（船橋市・習志野市・八千代市・鎌ケ谷市・白井市）の数値
          </strong>
          である点にご注意ください。
        </p>

        {insights ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="有効求人倍率（最新）"
              value={insights.latest.ratio.toFixed(2)}
              unit="倍"
              delta={insights.latest.label}
              deltaLabel="年度平均"
            />
            <StatCard
              label="有効求人倍率 前年度比"
              value={`${insights.ratioDiff > 0 ? "+" : ""}${insights.ratioDiff.toFixed(2)}`}
              unit="pt"
              delta={`5年で${insights.ratioLongTermDiff > 0 ? "+" : ""}${insights.ratioLongTermDiff.toFixed(2)}`}
              deltaLabel="長期変化"
              tone={insights.ratioDiff > 0 ? "up" : insights.ratioDiff < 0 ? "down" : "neutral"}
            />
            <StatCard
              label="新規求人数（最新）"
              value={fmt(insights.latest.newOffers)}
              unit="件"
              delta={`5年で${insights.offersLongTermRate > 0 ? "+" : ""}${insights.offersLongTermRate.toFixed(1)}%`}
              deltaLabel="長期変化"
            />
            <StatCard
              label="新規求職申込件数（最新）"
              value={fmt(insights.latest.newSeekers)}
              unit="件"
              delta={`5年で${insights.seekersLongTermRate > 0 ? "+" : ""}${insights.seekersLongTermRate.toFixed(1)}%`}
              deltaLabel="長期変化"
            />
          </div>
        ) : null}

        <div className="mt-10 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.1">有効求人倍率の推移（年度平均）</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={ratioSeries} seriesLabel="有効求人倍率" unit="倍" periodLabel="年度" />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.2">新規求人数の推移</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={offersSeries} seriesLabel="新規求人数" unit="件" periodLabel="年度" />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.3">新規求職申込件数の推移</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={seekersSeries} seriesLabel="新規求職申込件数" unit="件" periodLabel="年度" />
          </ChartErrorBoundary>
        </div>

        {insights ? (
          <div className="mt-10 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
            <p className="font-display text-base text-ink">読み解きメモ</p>
            <p className="mt-2">
              有効求人倍率は{insights.first.label}の{insights.first.ratio.toFixed(2)}倍から
              {insights.latest.label}の{insights.latest.ratio.toFixed(2)}倍へと、5年間で緩やかに上昇しています。
              一方で新規求職申込件数は{fmt(insights.first.newSeekers)}件から{fmt(insights.latest.newSeekers)}件へと
              減少しており（{insights.seekersLongTermRate.toFixed(1)}%）、求人数の増加と求職者数の減少の両方が
              倍率上昇の背景にあると考えられます。
            </p>
            <p className="mt-3">
              有効求人倍率が1倍を下回っている状態が続いており、これは全国的な平均と比べても低めの水準です。
              求人数自体は増えているため、必ずしも「仕事が少ない」わけではなく、業種や勤務条件のミスマッチ、
              管内エリアの産業構成なども影響している可能性があります。
            </p>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-ink-soft">
          ※ このデータは新規学卒を除き、パートタイマーを含む全数です。個別の求人・転職相談については
          ハローワーク船橋にご確認ください。
        </p>

        <div className="mt-10">
          <DashboardFooterLinks
            articleHref="/articles/employment-guide"
            articleLabel="船橋市の有効求人倍率、この5年の変化"
          />
        </div>

        <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EMPLOYMENT} className="h-24" />
        </div>
      </section>
    </>
  );
}
