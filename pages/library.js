import Seo from "../components/Seo";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import AdSlot from "../components/AdSlot";
import { siteConfig } from "../data/siteConfig";
import { buildDatasetJsonLd } from "../lib/datasetSchema";
import { libraryBranches, getLibraryTotals } from "../data/library";

const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

export async function getStaticProps() {
  return {
    props: {
      branches: libraryBranches,
      totals: getLibraryTotals()
    }
  };
}

function fmt(n) {
  return n.toLocaleString("ja-JP");
}

export default function Library({ branches, totals }) {
  const latestHoldingsData = branches.map((b) => ({ label: b.name, count: b.latestHoldings }));
  const latestYearIdx = totals.years.length - 1;
  const loansData = branches.map((b) => ({ label: b.name, count: b.loansByYear[latestYearIdx] }));

  return (
    <>
      <Seo
        title={`船橋市 図書館ダッシュボード｜西・中央・東・北の蔵書数・貸出冊数｜${siteConfig.name}`}
        description="船橋市立図書館（西・中央・東・北）の蔵書数・貸出冊数を館別に比較。船橋市図書館「図書館要覧」のデータをもとにしています。"
        path="/library"
        jsonLd={buildDatasetJsonLd({
          name: "船橋市立図書館 館別蔵書数・貸出冊数",
          description: "船橋市図書館「図書館要覧」に掲載の、西・中央・東・北4館の蔵書数・貸出冊数データ。",
          path: "/library",
          sourceUrl: "https://www.lib.city.funabashi.lg.jp/viewer/info.html?id=49&idSubTop=0",
          keywords: ["図書館", "蔵書数", "貸出冊数"]
        })}
      />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">
          船橋市 図書館ダッシュボード（西・中央・東・北）
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市には西・中央・東・北の4つの市立図書館があります。図書館が毎年発行する「図書館要覧」をもとに、
          館別の蔵書数・貸出冊数を比較します。
        </p>
        <p className="mt-2 max-w-2xl text-sm font-bold text-ink">
          市内4館の最新の蔵書数（{totals.latestHoldingsLabel}現在）の合計は{fmt(totals.latestHoldingsTotal)}点です。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-pop">
          <div className="border-b border-ink/10 bg-brass/10 px-5 py-3">
            <p className="font-display text-base font-bold text-ink">早見表：館別の最新蔵書数（{totals.latestHoldingsLabel}現在）</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 font-bold">図書館</th>
                  <th className="px-5 py-3 font-bold">所在地</th>
                  <th className="px-5 py-3 font-bold text-right">蔵書数</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.name} className="border-b border-ink/5">
                    <td className="px-5 py-3 font-bold text-ink">{b.name}</td>
                    <td className="px-5 py-3 text-ink-soft">{b.address}</td>
                    <td className="px-5 py-3 text-right font-mono font-bold tabular-nums text-ink">{fmt(b.latestHoldings)}点</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-xs text-ink-soft">
            北図書館は令和2年度以降、他館の保存資料（共同書庫）の所蔵を集約しているため、蔵書数が他館より多くなっています。単純に「本の種類が一番豊富」という意味ではありません。
          </p>
        </div>

        <div className="mt-10 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.1">館別 蔵書数ランキング（{totals.latestHoldingsLabel}現在）</SectionLabel>
          <ChartErrorBoundary>
            <CategoryBarChart data={latestHoldingsData} unit="点" topN={4} />
          </ChartErrorBoundary>
        </div>

        <div className="mt-10 border border-ink/10 bg-white/60 p-5">
          <SectionLabel code="FIG.2">館別 貸出冊数（{totals.years[latestYearIdx].label}）</SectionLabel>
          <ChartErrorBoundary>
            <CategoryBarChart data={loansData} unit="冊" topN={4} />
          </ChartErrorBoundary>
        </div>

        <div className="mt-10">
          <SectionLabel code="FIG.3">市内4館合計の推移（蔵書数・貸出冊数）</SectionLabel>
          <div className="overflow-x-auto">
            <table className="mt-3 w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink-soft">
                  <th className="py-2 font-bold">年度</th>
                  <th className="py-2 text-right font-bold">蔵書数（4館合計）</th>
                  <th className="py-2 text-right font-bold">貸出冊数（4館合計）</th>
                </tr>
              </thead>
              <tbody>
                {totals.years.map((y) => (
                  <tr key={y.label} className="border-b border-ink/5">
                    <td className="py-2 font-bold text-ink">{y.label}</td>
                    <td className="py-2 text-right font-mono tabular-nums text-ink">{fmt(y.holdings)}点</td>
                    <td className="py-2 text-right font-mono tabular-nums text-ink">{fmt(y.loans)}冊</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-2xl text-xs text-ink-soft">
            ※ 令和2年度は北図書館が大規模改修工事のため長期休館しており、貸出冊数が一時的に落ち込んでいます。また同年度から共同書庫の資料が北図書館に集約されたため、蔵書数の増加幅が他館と単純比較できません。
          </p>
        </div>

        <p className="mt-6 text-xs text-ink-soft">
          出典：船橋市図書館「図書館要覧」（令和4年度版、令和3年度実績）、船橋市図書館公式サイト「各図書館案内・開館時間」（
          {totals.latestHoldingsLabel}現在の蔵書数）。
        </p>

        <div className="mt-10">
          <DashboardFooterLinks
            articleHref="/articles/library-branches-guide"
            articleLabel="船橋市の図書館、蔵書数が一番多いのはどこ？4館を比べてみる"
            relatedLinks={[
              { href: "/articles/library-collection-usage-guide", label: "図書館の蔵書・利用状況の記事" },
              { href: "/dashboard", label: "人口ダッシュボード" }
            ]}
          />
        </div>

        <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LIBRARY} className="h-24" />
        </div>
      </section>
    </>
  );
}
