import Seo from "../components/Seo";
import Link from "next/link";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig } from "../data/siteConfig";
import {
  getExpenditureTotalSeries,
  getExpenditureComposition,
  getRevenueTotalSeries,
  getDebtTotalSeries,
  buildExpenditureInsights,
  buildRevenueInsights,
  buildDebtInsights,
  getHouseholdExpenditureBreakdown,
  getHouseholdRevenueBreakdown,
  getHouseholdDebtRatio,
  peerComparison2024
} from "../data/finance";

const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

const MONTHLY_BUDGET = 300000;

export async function getStaticProps() {
  return {
    props: {
      expenditureSeries: getExpenditureTotalSeries(),
      expenditureComposition: getExpenditureComposition(),
      revenueSeries: getRevenueTotalSeries(),
      debtSeries: getDebtTotalSeries(),
      expenditureInsights: buildExpenditureInsights(),
      revenueInsights: buildRevenueInsights(),
      debtInsights: buildDebtInsights(),
      householdExpenditure: getHouseholdExpenditureBreakdown(MONTHLY_BUDGET),
      householdRevenue: getHouseholdRevenueBreakdown(MONTHLY_BUDGET),
      debtRatio: getHouseholdDebtRatio()
    }
  };
}

function yen(n) {
  return `${n.toLocaleString("ja-JP")}円`;
}
function oku(senEn) {
  // 千円単位の値を「◯◯億円」表記に変換（小数点1桁）
  return `${(senEn / 100000).toFixed(1)}億円`;
}

export default function Finance({
  expenditureSeries,
  expenditureComposition,
  revenueSeries,
  debtSeries,
  expenditureInsights,
  revenueInsights,
  debtInsights,
  householdExpenditure,
  householdRevenue,
  debtRatio
}) {
  return (
    <>
      <Seo
        title={`船橋市の財政ダッシュボード｜歳入・歳出・市債残高｜${siteConfig.name}`}
        description="船橋市の財政（歳入・歳出・市債残高）の推移を可視化し、月30万円の家計に例えて解説するダッシュボードです（船橋市統計書「R 財政」より）。"
        path="/finance"
      />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">船橋市 財政ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市統計書「R 財政」（資料：財政課）をもとに、一般会計の歳入・歳出・市債残高の推移を可視化しています。
          後半では、令和6年度決算を「月30万円の家計」に例えるとどうなるかも紹介します。
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          出典：船橋市統計書「R 財政」（
          <a
            href="https://www.city.funabashi.lg.jp/shisei/toukei/002/index.html"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-brass-dark"
          >
            船橋市統計書 一覧
          </a>
          ）。本データはBODIK ODCSではなく船橋市公式サイトが公開するPDFから作成した静的データです。
          令和7年度のみ決算が確定していないため「予算額」です。単位：千円（元データのまま）。
        </p>

        {expenditureInsights && revenueInsights && debtInsights ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="歳出総額（一般会計・最新）"
              value={oku(expenditureInsights.latest.total)}
              delta={expenditureInsights.latest.label}
              deltaLabel="時点"
            />
            <StatCard
              label="歳入総額（一般会計・最新）"
              value={oku(revenueInsights.latest.total)}
              delta={revenueInsights.latest.label}
              deltaLabel="時点"
            />
            <StatCard
              label="市債残高（一般会計・最新）"
              value={oku(debtInsights.latest.total)}
              delta={`${debtInsights.rate > 0 ? "+" : ""}${debtInsights.rate.toFixed(1)}%`}
              deltaLabel="前年度比"
              tone={debtInsights.diff > 0 ? "down" : debtInsights.diff < 0 ? "up" : "neutral"}
            />
            <StatCard
              label="市債残高 ÷ 歳出総額"
              value={`${(debtRatio.ratio * 100).toFixed(1)}%`}
              delta={`年間支出の約${debtRatio.monthsOfSpending.toFixed(1)}ヶ月分`}
              deltaLabel={debtRatio.period}
            />
          </div>
        ) : null}

        <div className="mt-10 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.1">歳出総額の推移（一般会計）</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={expenditureSeries} seriesLabel="歳出総額" unit="千円" periodLabel="年度" />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.2">{`歳出内訳（目的別、${expenditureComposition.period}決算）`}</SectionLabel>
          <ChartErrorBoundary>
            <CategoryBarChart data={expenditureComposition.data} unit="千円" topN={13} />
          </ChartErrorBoundary>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.3">市債残高の推移（一般会計、年度末時点）</SectionLabel>
          <ChartErrorBoundary>
            <PopulationChart data={debtSeries} seriesLabel="市債残高" unit="千円" periodLabel="年度" />
          </ChartErrorBoundary>
        </div>

        {/* --- 家計への換算 --------------------------------------------- */}
        <div className="mt-12 border-t border-ink/10 pt-10">
          <SectionLabel code="FIG.4">{`もし「月30万円の家計」だったら？（${householdExpenditure.period}決算ベース）`}</SectionLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            歳出総額に占める割合をそのままに、仮に「手取り月30万円の家庭」の支出に例えて計算し直したものです。
            実際の1人あたり負担額ではなく、あくまで内訳の"比率"を体感しやすくするための換算です。
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/20 text-left text-xs uppercase tracking-wider text-ink-soft">
                  <th className="py-2 pr-4">費目</th>
                  <th className="py-2 pr-4 text-right">実際の割合</th>
                  <th className="py-2 text-right">月30万円換算</th>
                </tr>
              </thead>
              <tbody>
                {householdExpenditure.items.map((item) => (
                  <tr key={item.label} className="border-b border-ink/10">
                    <td className="py-2 pr-4 text-ink">{item.label}</td>
                    <td className="py-2 pr-4 text-right font-mono text-ink-soft">
                      {(item.share * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 text-right font-mono text-ink">{yen(item.scaledYen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink-soft">
            収入側（歳入）も同じように換算すると、次のようになります。
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/20 text-left text-xs uppercase tracking-wider text-ink-soft">
                  <th className="py-2 pr-4">収入源</th>
                  <th className="py-2 pr-4 text-right">実際の割合</th>
                  <th className="py-2 text-right">月30万円換算</th>
                </tr>
              </thead>
              <tbody>
                {householdRevenue.items.map((item) => (
                  <tr key={item.label} className="border-b border-ink/10">
                    <td className="py-2 pr-4 text-ink">{item.label}</td>
                    <td className="py-2 pr-4 text-right font-mono text-ink-soft">
                      {(item.share * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 text-right font-mono text-ink">{yen(item.scaledYen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 max-w-2xl text-xs text-ink-soft">
            ※ 実際の船橋市の予算規模（歳出総額約{oku(expenditureComposition.total)}）を、比率をそのままに
            30万円まで縮尺しただけの換算です。市民1人あたり・1世帯あたりの実際の負担額を示すものではありません。
          </p>
        </div>

        {/* --- 類似団体（全国の同規模自治体）との比較 ------------------------ */}
        <div className="mt-12 border-t border-ink/10 pt-10">
          <SectionLabel code="FIG.5">全国の同規模自治体（類似団体）と比べると</SectionLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            総務省「財政状況資料集」（令和6年度）では、人口・産業構造等が近い全国62の自治体を
            「類似団体」として比較する仕組みがあります。近隣市に限らず全国が対象ですが、
            このグループには柏市も含まれています。船橋市の主要指標を、この類似団体内での
            順位とあわせて見てみます。
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/20 text-left text-xs uppercase tracking-wider text-ink-soft">
                  <th className="py-2 pr-4">指標</th>
                  <th className="py-2 pr-4">船橋市の状況</th>
                  <th className="py-2 text-right">類似団体内順位</th>
                </tr>
              </thead>
              <tbody>
                {peerComparison2024.map((row) => (
                  <tr key={row.label} className="border-b border-ink/10">
                    <td className="py-3 pr-4 text-ink">{row.label}</td>
                    <td className="py-3 pr-4 text-ink-soft">
                      {row.funabashiValue !== undefined
                        ? `${row.funabashiValue}${row.unit || ""}${row.peerAverage !== undefined ? `（類似団体平均 ${row.peerAverage}${row.unit}）` : ""}`
                        : row.funabashiNote}
                      {row.note ? <span className="mt-0.5 block text-xs">{row.note}</span> : null}
                    </td>
                    <td className="py-3 text-right font-mono text-ink">
                      {row.rank}位 / {row.outOf}団体
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
            特に目を引くのは「将来負担比率」で、62団体中1位（実質的に将来負担なし）という結果です。
            一方で「経常収支比率」は53位と、類似団体の中では下位に位置しています。これは人件費・
            物件費の増加が主な要因で、財政課の分析でも「引き続き適正化に努める」とされている項目です。
            良い面と、これから改善が必要な面の両方がある、というのが実際のところのようです。
          </p>
          <p className="mt-3 max-w-2xl text-xs text-ink-soft">
            出典：総務省「財政状況資料集」（令和6年度）。
            <a
              href="https://www.city.funabashi.lg.jp/shisei/zaisei/005/index.html"
              target="_blank"
              rel="noreferrer"
              className="ml-1 underline hover:text-brass-dark"
            >
              船橋市公式サイトの財政状況資料集
            </a>
            でも同じ内容を確認できます。
          </p>
        </div>

        {/* --- ふるさと納税による影響 ------------------------------------ */}
        <div className="mt-12 border-t border-ink/10 pt-10">
          <SectionLabel code="FIG.6">ふるさと納税による影響（令和6年度）</SectionLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            船橋市公式サイトによると、令和6年度に船橋市が受け取ったふるさと納税の寄附額と、
            船橋市民が他の自治体に寄附したことによる市民税控除額（減収額）は、次のようになっています。
          </p>
          <div className="mt-6 border border-ink/10 bg-white/60 p-5">
            <CategoryBarChart
              data={[
                { label: "受入額", count: 9.41 },
                { label: "控除額（減収分）", count: 30.76 }
              ]}
              unit="億円"
              topN={2}
            />
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
            差し引きすると、船橋市は令和6年度だけで約21.35億円の減収となった計算です。累計（平成26〜令和6年度）では
            約72.5億円にのぼります。ただし、この減収額の75%は地方交付税の算定基礎に算入される仕組みがあるため、
            単純に「まるごと失われた」わけではありません。詳しい仕組みや全国的な位置づけは
            <Link href="/articles/furusato-nozei-outflow-guide" className="underline hover:text-brass-dark">
              「船橋市はふるさと納税でいくら『損』している？」の記事
            </Link>
            で解説しています。
          </p>
          <p className="mt-3 max-w-2xl text-xs text-ink-soft">
            出典：船橋市公式サイト「ふるさと納税額と市民税控除額の推移」。
          </p>
        </div>

        {expenditureInsights && debtInsights ? (
          <div className="mt-10 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
            <p className="font-display text-base text-ink">読み解きメモ</p>
            <p className="mt-2">
              令和6年度決算の歳出内訳では、民生費（社会保障・福祉）が全体の約48%と半分近くを占めています。
              家計に例えるなら、月30万円のうち14万円以上が社会保障関連の支出にあたる計算です。次いで教育費が
              約12%、総務費が約10%と続きます。
            </p>
            <p className="mt-3">
              市債残高（借金）は令和2年度末の約{oku(186384478)}から令和6年度末の約{oku(debtInsights.latest.total)}
              へと、5年間で約{Math.abs(debtInsights.longTermRate).toFixed(1)}%減少しています。家計で言えば、
              住宅ローンの残高を着実に返し続けている状態と言えそうです。とはいえ残高は年間支出の
              約{debtRatio.monthsOfSpending.toFixed(1)}ヶ月分に相当し、ゼロになったわけではありません。
            </p>
            <p className="mt-3">
              収入面では、自主財源である市税が歳入総額の約43%にとどまり、残り約57%は地方交付税や国庫支出金など、
              国・県からの交付金や補助金に頼っています。家計で言えば、月収30万円のうち自分の給料は13万円ほどで、
              残り17万円ほどは仕送りに頼っている状態に近い構図です。
            </p>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-ink-soft">
          ※ 本ダッシュボードの「家計換算」はあくまで内訳比率を直感的に理解するための例えであり、
          実際の家計とは前提条件（税制・社会保障制度など）が大きく異なります。正確な財政状況の分析には、
          船橋市が公表する予算書・決算書・財政状況資料集などをご確認ください。
        </p>

        <div className="mt-10">
          <DashboardFooterLinks
            articleHref="/articles/finance-household-budget-guide"
            articleLabel="船橋市の財政を「家計」に例えると"
            relatedLinks={[
              { href: "/dashboard", label: "人口ダッシュボード" },
              { href: "/rail-ridership", label: "鉄道駅別乗車人員ダッシュボード" }
            ]}
          />
        </div>

        <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FINANCE} className="h-24" />
        </div>
      </section>
    </>
  );
}
