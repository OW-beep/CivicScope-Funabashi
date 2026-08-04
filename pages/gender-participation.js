import Seo from "../components/Seo";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig } from "../data/siteConfig";
import {
  getCouncilRatioSeries,
  getCommitteeRatioSeries,
  getGenderCenterUserSeries,
  getGenderCenterConsultationComposition,
  buildCouncilInsights,
  buildCommitteeInsights,
  buildGenderCenterInsights
} from "../data/genderParticipation";

const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

export async function getStaticProps() {
  return {
    props: {
      councilSeries: getCouncilRatioSeries(),
      committeeSeries: getCommitteeRatioSeries(),
      centerUserSeries: getGenderCenterUserSeries(),
      centerComposition: getGenderCenterConsultationComposition(),
      councilInsights: buildCouncilInsights(),
      committeeInsights: buildCommitteeInsights(),
      centerInsights: buildGenderCenterInsights()
    }
  };
}

function fmt(n) {
  return n.toLocaleString("ja-JP");
}

export default function GenderParticipation({
  councilSeries,
  committeeSeries,
  centerUserSeries,
  centerComposition,
  councilInsights,
  committeeInsights,
  centerInsights
}) {
  return (
    <>
      <Seo title={`女性参画 ダッシュボード｜${siteConfig.name}`} description="船橋市議会・審議会等における女性の参画比率と、男女共同参画センターの利用状況の推移を可視化したダッシュボードです（船橋市統計書「O 市民生活」より）。" path="/gender-participation" />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">女性参画 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市統計書「O 市民生活」（資料：市民協働課）をもとに、市議会・審議会等における
          女性の参画比率と、男女共同参画センターの利用状況の推移を可視化しています。
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
          市議会・審議会等委員は各年4月1日現在の数値です。
        </p>

        {councilInsights && committeeInsights && centerInsights ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="市議会 女性議員比率"
              value={`${councilInsights.latest.ratio}%`}
              delta={`${councilInsights.diff > 0 ? "+" : ""}${councilInsights.diff}pt`}
              deltaLabel={`前回（${councilInsights.previous.label}）比`}
              tone={councilInsights.diff > 0 ? "up" : councilInsights.diff < 0 ? "down" : "neutral"}
            />
            <StatCard
              label="審議会等 女性委員比率"
              value={`${committeeInsights.latest.ratio}%`}
              delta={`${committeeInsights.diff > 0 ? "+" : ""}${committeeInsights.diff}pt`}
              deltaLabel={`前回（${committeeInsights.previous.label}）比`}
              tone={committeeInsights.diff > 0 ? "up" : committeeInsights.diff < 0 ? "down" : "neutral"}
            />
            <StatCard
              label="女性議員数"
              value={`${councilInsights.latest.women}人`}
              delta={`定数${councilInsights.latest.capacity}人中`}
              deltaLabel={councilInsights.latest.label}
            />
            <StatCard
              label="男女共同参画センター利用者数"
              value={fmt(centerInsights.latest.users)}
              unit="人"
              delta={`${centerInsights.rate > 0 ? "+" : ""}${centerInsights.rate.toFixed(1)}%`}
              deltaLabel="前年度比"
              tone={centerInsights.diff > 0 ? "up" : centerInsights.diff < 0 ? "down" : "neutral"}
            />
          </div>
        ) : null}

        <div className="mt-10 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.1">市議会 女性議員比率の推移</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={councilSeries} seriesLabel="女性議員比率" unit="%" periodLabel="年" />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.2">審議会等委員 女性比率の推移</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={committeeSeries} seriesLabel="女性委員比率" unit="%" periodLabel="年" />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.3">男女共同参画センター利用者数の推移</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={centerUserSeries} seriesLabel="利用者数" unit="人" periodLabel="年度" />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.4">{`相談業務の内訳（${centerComposition.period}）`}</SectionLabel>
          <ChartErrorBoundary>
            <CategoryBarChart data={centerComposition.data} unit="件" topN={5} />
          </ChartErrorBoundary>
        </div>

        {councilInsights && committeeInsights && centerInsights ? (
          <div className="mt-10 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
            <p className="font-display text-base text-ink">読み解きメモ</p>
            <p className="mt-2">
              市議会の女性議員比率は{councilInsights.first.label}の{councilInsights.first.ratio}%から
              {councilInsights.latest.label}の{councilInsights.latest.ratio}%へと、5年弱で
              {(councilInsights.latest.ratio - councilInsights.first.ratio).toFixed(1)}ポイント上昇しました。
              令和5年に定数48人中17人（35.4%）まで上昇した後、定数50人に戻った令和6・7年も17人を維持しており、
              人数としては増加が定着しつつあります。
            </p>
            <p className="mt-3">
              一方、審議会等委員の女性比率は{committeeInsights.first.label}の{committeeInsights.first.ratio}%から
              {committeeInsights.latest.label}の{committeeInsights.latest.ratio}%と、5年間ほぼ30%前後で
              横ばいが続いています。国が目標に掲げる水準（分野によりますが40%前後が目安とされることが多い）
              と比べると、まだ伸びしろがある領域と言えそうです。
            </p>
            <p className="mt-3">
              男女共同参画センターの利用者数は{centerInsights.first.label}の{fmt(centerInsights.first.users)}人から
              {centerInsights.latest.label}の{fmt(centerInsights.latest.users)}人へと、5年間で約4.5倍に増加しました
              （令和2・3年度はコロナ禍の影響で利用が落ち込んでいた可能性があります）。相談業務では
              「女性の生き方」に関する相談が一貫して最も多くなっています。
            </p>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-ink-soft">
          ※ 議員数・委員数は制度や選挙結果など、単純な「意識の変化」以外の要因でも変動します。
          数字の背景まで正確に知りたい場合は、船橋市市民協働課にご確認ください。
        </p>

        <div className="mt-10">
          <DashboardFooterLinks
            articleHref="/articles/gender-participation-guide"
            articleLabel="船橋市の女性参画、この5年の変化"
          />
        </div>

        <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GENDER} className="h-24" />
        </div>
      </section>
    </>
  );
}
