import Seo from "../components/Seo";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig } from "../data/siteConfig";
import { getTotalSeries, getComposition, buildInsights } from "../data/citizenConsultation";

const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

export async function getStaticProps() {
  return {
    props: {
      totalSeries: getTotalSeries(),
      composition: getComposition(),
      insights: buildInsights()
    }
  };
}

function fmt(n) {
  return n.toLocaleString("ja-JP");
}

export default function CitizenConsultation({ totalSeries, composition, insights }) {
  return (
    <>
      <Seo title={`市民相談 ダッシュボード｜${siteConfig.name}`} description="船橋市に寄せられる市民相談（法律・生活）と市民の要望等の件数の推移を可視化したダッシュボードです（船橋市統計書「O 市民生活」より）。" path="/citizen-consultation" />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">市民相談 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市統計書「O 市民生活」（資料：市民の声を聞く課）をもとに、市民相談（法律・生活）と
          市民の要望等（市政電子ポスト・郵便・その他）の件数の推移を可視化しています。
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          出典：船橋市統計書「O 市民生活」（
          <a
            href="https://www.city.funabashi.lg.jp/shisei/toukei/002/index.html"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-brass-dark"
          >
            船橋市統計書 一覧
          </a>
          ）。本データはBODIK ODCSではなく船橋市公式サイトが公開するPDFから作成した静的データです。
        </p>

        {insights ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="市民相談・要望 総数（最新）"
              value={fmt(insights.latest.total)}
              unit="件"
              delta={insights.latest.label}
              deltaLabel="時点"
            />
            <StatCard
              label="前年度比"
              value={`${insights.diff > 0 ? "+" : ""}${fmt(insights.diff)}`}
              unit="件"
              delta={`${insights.rate > 0 ? "+" : ""}${insights.rate.toFixed(1)}%`}
              deltaLabel="増減率"
              tone={insights.diff > 0 ? "up" : insights.diff < 0 ? "down" : "neutral"}
            />
            <StatCard
              label="5年間の変化"
              value={`${insights.longTermRate > 0 ? "+" : ""}${insights.longTermRate.toFixed(1)}%`}
              delta={`${insights.first.label}→${insights.latest.label}`}
              deltaLabel="長期推移"
              tone={insights.longTermRate < 0 ? "down" : "up"}
            />
            <StatCard
              label="法律相談（最新）"
              value={fmt(insights.latest.general.法律)}
              unit="件"
              delta={insights.latest.label}
              deltaLabel="時点"
            />
          </div>
        ) : null}

        <div className="mt-10 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.1">市民相談・要望 総数の推移</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={totalSeries} seriesLabel="総数" unit="件" periodLabel="年度" />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.2">{`内訳（${composition.period}）`}</SectionLabel>
          <ChartErrorBoundary>
            <CategoryBarChart data={composition.data} unit="件" topN={5} />
          </ChartErrorBoundary>
        </div>

        {insights ? (
          <div className="mt-10 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
            <p className="font-display text-base text-ink">読み解きメモ</p>
            <p className="mt-2">
              市民相談・要望の総数は{insights.first.label}の{fmt(insights.first.total)}件から
              {insights.latest.label}の{fmt(insights.latest.total)}件へと、5年間で約
              {Math.abs(insights.longTermRate).toFixed(1)}%減少しています。件数の多くを占める
              「市民の要望等（その他）」が大きく減少している一方、法律相談・生活相談は大きくは
              変わっておらず、相談窓口としての需要自体が消えたわけではなさそうです。
            </p>
            <p className="mt-3">
              件数の減少要因はデータだけでは特定できません。行政手続きのオンライン化が進み、
              電話や窓口での「要望」という形を取らずに済むケースが増えた可能性や、コロナ禍を経て
              市民の行動様式が変化した可能性などが考えられますが、いずれも推測の域を出ません。
            </p>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-ink-soft">
          ※ 実際に相談・要望を伝えたい場合は、船橋市「市民の声を聞く課」または該当窓口に直接ご連絡ください。
        </p>

        <div className="mt-10">
          <DashboardFooterLinks
            articleHref="/articles/citizen-consultation-guide"
            articleLabel="船橋市への市民相談・要望、5年で2割減った理由を考える"
          />
        </div>

        <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONSULTATION} className="h-24" />
        </div>
      </section>
    </>
  );
}
