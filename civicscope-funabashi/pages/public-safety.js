import Head from "next/head";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig } from "../data/siteConfig";
import {
  getCrimeTotalSeries,
  getCrimeComposition,
  buildCrimeInsights,
  getAmbulanceTotalSeries,
  getAmbulanceComposition,
  buildAmbulanceInsights
} from "../data/publicSafety";

const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

export async function getStaticProps() {
  return {
    props: {
      crimeSeries: getCrimeTotalSeries(),
      crimeComposition: getCrimeComposition(),
      crimeInsights: buildCrimeInsights(),
      ambulanceSeries: getAmbulanceTotalSeries(),
      ambulanceComposition: getAmbulanceComposition(),
      ambulanceInsights: buildAmbulanceInsights()
    }
  };
}

function fmt(n) {
  return n.toLocaleString("ja-JP");
}

export default function PublicSafety({
  crimeSeries,
  crimeComposition,
  crimeInsights,
  ambulanceSeries,
  ambulanceComposition,
  ambulanceInsights
}) {
  return (
    <>
      <Head>
        <title>{`治安・救急 ダッシュボード｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市の刑法犯認知件数と救急出動件数の推移を可視化したダッシュボードです（船橋市統計書「Q 警察及び消防」より）。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">治安・救急 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市統計書「Q 警察及び消防」に収録されている刑法犯認知件数（資料：千葉県警察本部）と
          救急出動件数（資料：消防局）の、令和2年から令和6年までの推移を可視化しています。
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          出典：船橋市統計書「Q 警察及び消防」（
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

        {crimeInsights && ambulanceInsights ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="刑法犯認知件数（最新）"
              value={fmt(crimeInsights.latest.total)}
              unit="件"
              delta={crimeInsights.latest.label}
              deltaLabel="時点"
            />
            <StatCard
              label="刑法犯 前年比"
              value={`${crimeInsights.diff > 0 ? "+" : ""}${fmt(crimeInsights.diff)}`}
              unit="件"
              delta={crimeInsights.rate !== null ? `${crimeInsights.rate > 0 ? "+" : ""}${crimeInsights.rate.toFixed(1)}%` : null}
              deltaLabel="増減率"
              tone={crimeInsights.diff > 0 ? "down" : crimeInsights.diff < 0 ? "up" : "neutral"}
            />
            <StatCard
              label="救急出動件数（最新）"
              value={fmt(ambulanceInsights.latest.total)}
              unit="件"
              delta={ambulanceInsights.latest.label}
              deltaLabel="時点"
            />
            <StatCard
              label="救急出動 前年比"
              value={`${ambulanceInsights.diff > 0 ? "+" : ""}${fmt(ambulanceInsights.diff)}`}
              unit="件"
              delta={
                ambulanceInsights.rate !== null
                  ? `${ambulanceInsights.rate > 0 ? "+" : ""}${ambulanceInsights.rate.toFixed(1)}%`
                  : null
              }
              deltaLabel="増減率"
              tone={ambulanceInsights.diff > 0 ? "down" : ambulanceInsights.diff < 0 ? "up" : "neutral"}
            />
          </div>
        ) : null}

        <div className="mt-10 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.1">刑法犯認知件数の推移</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={crimeSeries} seriesLabel="刑法犯認知件数" unit="件" periodLabel="年" />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.2">{`罪種大分類別の内訳（${crimeComposition.period}）`}</SectionLabel>
          <ChartErrorBoundary>
            <CategoryBarChart data={crimeComposition.data} unit="件" topN={10} />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.3">救急出動件数の推移</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={ambulanceSeries} seriesLabel="救急出動件数" unit="件" periodLabel="年" />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.4">{`救急出動 事故種別の内訳（${ambulanceComposition.period}）`}</SectionLabel>
          <ChartErrorBoundary>
            <CategoryBarChart data={ambulanceComposition.data} unit="件" topN={11} />
          </ChartErrorBoundary>
        </div>

        {crimeInsights && ambulanceInsights ? (
          <div className="mt-8 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
            <p className="font-display text-base text-ink">読み解きメモ</p>
            <p className="mt-2">
              刑法犯認知件数は{crimeInsights.first.label}の{fmt(crimeInsights.first.total)}件から
              {crimeInsights.longTermDiff >= 0 ? "増加" : "減少"}し、
              {crimeInsights.latest.label}時点で{fmt(crimeInsights.latest.total)}件となっています
              （{crimeInsights.longTermRate > 0 ? "+" : ""}
              {crimeInsights.longTermRate.toFixed(1)}%）。内訳では窃盗犯が一貫して最も多くを占めており、
              自転車盗などの街頭犯罪が全体の水準を左右しやすい構図がうかがえます。
            </p>
            <p className="mt-3">
              救急出動件数は{ambulanceInsights.first.label}の{fmt(ambulanceInsights.first.total)}件から
              {ambulanceInsights.longTermDiff >= 0 ? "増加" : "減少"}し、
              {ambulanceInsights.latest.label}時点で{fmt(ambulanceInsights.latest.total)}件となりました
              （{ambulanceInsights.longTermRate > 0 ? "+" : ""}
              {ambulanceInsights.longTermRate.toFixed(1)}%）。内訳では「急病」が一貫して6割前後を占めており、
              高齢化の進行とあわせて、救急体制の需要増加を示す数字として読むことができます。
            </p>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-ink-soft">
          ※ 犯罪や事故の発生状況は年ごとの偶発的な変動も大きく、単年の増減だけで治安の良し悪しを断定することはできません。あくまで公開統計の可視化であり、防犯・救急に関する具体的な相談は船橋市または千葉県警察・消防局の窓口にご確認ください。
        </p>

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_PUBLIC_SAFETY} className="h-24" />
        </div>
      </section>
    </>
  );
}
