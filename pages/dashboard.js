import Seo from "../components/Seo";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import DataUnavailableNotice from "../components/DataUnavailableNotice";
import { siteConfig, datasets } from "../data/siteConfig";
import { getDatasetRecords, normalizePopulationSeries, buildPopulationInsights } from "../lib/bodik";
import { populationGrowthRankHistory, populationDensityComparison2020 } from "../data/populationComparison";
import { getFuturePopulationSeries, buildFuturePopulationInsights, futurePopulationByAgeGroup } from "../data/futurePopulation";

// Rechartsはブラウザ専用APIに依存するためSSRを無効化して読み込む
const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

export async function getStaticProps() {
  let normalized = null;
  let insights = null;
  let error = null;

  try {
    const popData = await getDatasetRecords(datasets.population.id);
    normalized = normalizePopulationSeries(popData);
    insights = buildPopulationInsights(normalized);
  } catch (e) {
    error = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  return {
    props: {
      series: normalized?.series || [],
      insights: insights || null,
      error,
      futureSeries: getFuturePopulationSeries(),
      futureInsights: buildFuturePopulationInsights()
    },
    revalidate: 60 * 60 * 12
  };
}

export default function Dashboard({ series, insights, error, futureSeries, futureInsights }) {
  // タイトルに実際のデータ年を含めるため、最新データの年（例: 2026）を動的に抽出する
  const latestYear = insights?.latest?.label?.match(/\d{4}/)?.[0];

  return (
    <>
      <Seo
        title={`船橋市 人口ダッシュボード${latestYear ? `｜${latestYear}年最新データ` : ""}｜${siteConfig.name}`}
        description={`船橋市の常住人口データ${latestYear ? `（${latestYear}年最新）` : ""}をもとに、月次推移・前月比・前年同月比を自動集計して可視化したダッシュボードです。`}
        path="/dashboard"
      />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">船橋市 人口ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログが公開する「{datasets.population.label}」を自動取得し、
          推移のグラフ化と、前月比・前年同月比などの指標を算出しています。
          データの定義については
          <a href={datasets.population.sourceUrl} target="_blank" rel="noreferrer" className="underline hover:text-brass-dark">
            原典データセット
          </a>
          をご確認ください。
        </p>

        {error ? (
          <DataUnavailableNotice
            message={error}
            sourceUrl={datasets.population.sourceUrl}
            sourceLabel={datasets.population.label}
          />
        ) : (
          <>
            {insights ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="最新月の常住人口"
                  value={insights.latest.total.toLocaleString("ja-JP")}
                  unit="人"
                  delta={insights.latest.label}
                  deltaLabel="時点"
                />
                <StatCard
                  label="前月比"
                  value={`${insights.momDiff > 0 ? "+" : ""}${insights.momDiff.toLocaleString("ja-JP")}`}
                  unit="人"
                  tone={insights.momDiff > 0 ? "up" : insights.momDiff < 0 ? "down" : "neutral"}
                />
                <StatCard
                  label="前年同月比"
                  value={`${insights.yoyDiff > 0 ? "+" : ""}${insights.yoyDiff.toLocaleString("ja-JP")}`}
                  unit="人"
                  delta={insights.yoyRate !== null ? `${insights.yoyRate > 0 ? "+" : ""}${insights.yoyRate.toFixed(2)}%` : null}
                  deltaLabel="増減率"
                  tone={insights.yoyDiff > 0 ? "up" : insights.yoyDiff < 0 ? "down" : "neutral"}
                />
                <StatCard
                  label="集計期間内のピーク"
                  value={insights.peak.total.toLocaleString("ja-JP")}
                  unit="人"
                  delta={insights.peak.label}
                  deltaLabel="時点"
                />
              </div>
            ) : null}

            <div className="mt-10 border border-ink/10 bg-white/60 p-5">
              <SectionLabel code="FIG.1">常住人口の推移</SectionLabel>
              <ChartErrorBoundary>
                <PopulationChart data={series} />
              </ChartErrorBoundary>
            </div>

            {insights ? (
              <div className="mt-8 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                <p className="font-display text-base text-ink">読み解きメモ</p>
                <p className="mt-2">
                  {insights.rangeStart.label}から{insights.rangeEnd.label}までのデータでは、
                  最新値は{insights.latest.total.toLocaleString("ja-JP")}人で、前月から
                  {insights.momDiff >= 0 ? "増加" : "減少"}
                  （{insights.momDiff >= 0 ? "+" : ""}{insights.momDiff.toLocaleString("ja-JP")}人）しました。
                  前年同月との比較では
                  {insights.yoyDiff >= 0 ? "増加" : "減少"}
                  傾向
                  {insights.yoyRate !== null ? `（${insights.yoyRate > 0 ? "+" : ""}${insights.yoyRate.toFixed(2)}%）` : ""}
                  にあります。詳しい読み方は
                  <a href="/articles/population-data-guide" className="underline hover:text-brass-dark">解説記事</a>
                  もご参照ください。
                </p>
              </div>
            ) : null}
          </>
        )}

        {/* --- 近隣市との比較（千葉県・国勢調査） -------------------------- */}
        <div className="mt-14 border-t border-ink/10 pt-10">
          <SectionLabel code="FIG.C">人口増加数は、近隣市と比べてどうか</SectionLabel>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            千葉県「令和2年国勢調査－人口等基本集計結果の概要（千葉県版）」をもとに、
            国勢調査（5年に1度）ごとの人口増加数（実数）で、船橋市が県内何位だったかをたどりました。
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {populationGrowthRankHistory.map((row) => (
              <div key={row.label} className="border border-ink/10 bg-white/60 p-4 text-center">
                <p className="text-xs text-ink-soft">{row.label}</p>
                <p className="mt-2 font-mono text-2xl font-semibold text-brass-dark">{row.rank}位</p>
                <p className="mt-1 text-xs text-ink-soft">
                  +{row.increase.toLocaleString("ja-JP")}人
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
            平成17年（2005年）から令和2年（2020年）までの4回の国勢調査で、船橋市の人口増加数（実数）は
            3位・1位・1位・2位。千葉県内で一貫して上位に入り続けています。ただし、これは人口規模がもともと
            大きいことも影響しており、人口に対する「増加率」で見ると、流山市や印西市のような比率上位の常連
            とは並びません。「大きな都市でありながら、増え続けている」という点が船橋市の特徴といえそうです。
          </p>

          <div className="mt-8 border border-ink/10 bg-white/60 p-5">
            <SectionLabel code="FIG.D">{"人口密度の比較（令和2年、上位5市）"}</SectionLabel>
            <ChartErrorBoundary>
              <CategoryBarChart
                data={populationDensityComparison2020.map((r) => ({ label: r.label, count: Math.round(r.value) }))}
                unit="人/km²"
                topN={5}
              />
            </ChartErrorBoundary>
            <p className="mt-3 text-xs text-ink-soft">
              船橋市は人口規模で県内2位ながら、人口密度では浦安市・市川市・習志野市・松戸市に次ぐ5位です。
              近隣の都市に比べると、まちに少しゆとりがあるとも読み取れます。
            </p>
          </div>
        </div>

        {/* --- 将来人口推計 ------------------------------------------------ */}
        {futureInsights ? (
          <div className="mt-12 border-t border-ink/10 pt-10">
            <SectionLabel code="FIG.E">船橋市の人口はいつピークを迎えるのか</SectionLabel>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
              船橋市オープンデータカタログ「将来人口推計（市全体）」（第3次総合計画策定時、
              平成30年4月時点の住民基本台帳を基準に作成）をもとにした、2008年から2063年まで
              5年おきの人口推計です。年齢階級別の内訳合計が総数と一致することを検算済みです。
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="人口のピーク（推計）"
                value={futureInsights.peak.label}
                unit="時点"
                delta={`${futureInsights.peak.total.toLocaleString("ja-JP")}人`}
                deltaLabel="推計人口"
              />
              <StatCard
                label="ピーク後の減少幅（2063年まで）"
                value={futureInsights.declineFromPeak.toLocaleString("ja-JP")}
                unit="人"
                delta={`${futureInsights.declineRateFromPeak.toFixed(1)}%`}
                deltaLabel="ピーク比"
                tone="down"
              />
              <StatCard
                label="2063年の推計人口"
                value={futureInsights.last.total.toLocaleString("ja-JP")}
                unit="人"
                delta="2023年比"
                deltaLabel={`${(((futureInsights.last.total - futureInsights.latest2023.total) / futureInsights.latest2023.total) * 100).toFixed(1)}%`}
              />
            </div>
            <div className="mt-6 border border-ink/10 bg-white/60 p-5">
              <ChartErrorBoundary>
                <PopulationChart data={futureSeries} seriesLabel="推計人口" unit="人" periodLabel="" />
              </ChartErrorBoundary>
              <p className="mt-3 text-xs text-ink-soft">
                2008年〜2018年は実績値、2023年以降は推計値（作成元によれば2023年以降は参考値）。
              </p>
            </div>

            <div className="mt-8 border border-ink/10 bg-white/60 p-5">
              <SectionLabel code="FIG.F">年齢3区分別人口の推移（推計）</SectionLabel>
              <ChartErrorBoundary>
                <CategoryBarChart
                  data={futurePopulationByAgeGroup
                    .filter((r) => r.label === "2008年" || r.label === "2033年" || r.label === "2063年")
                    .flatMap((r) => [
                      { label: `${r.label}・年少(0-14)`, count: r.young },
                      { label: `${r.label}・生産年齢(15-64)`, count: r.working },
                      { label: `${r.label}・老年(65+)`, count: r.elderly }
                    ])}
                  unit="人"
                  topN={9}
                />
              </ChartErrorBoundary>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
              船橋市の人口は{futureInsights.peak.label}頃にピーク（約
              {Math.round(futureInsights.peak.total / 1000)}千人）を迎え、その後は緩やかな減少に
              転じると推計されています。2063年時点でも{futureInsights.last.total.toLocaleString("ja-JP")}人と、
              現在（2018年実績 63.7万人）を上回る水準は維持される見通しですが、年齢構成は
              大きく変化します。生産年齢人口（15〜64歳）は2008年の約40.7万人から2063年には
              約35.2万人へと減少する一方、老年人口（65歳以上）は約10.7万人から約20.5万人へと
              倍増する見込みです。
            </p>
            <p className="mt-3 max-w-2xl text-xs text-ink-soft">
              出典：船橋市オープンデータカタログ「
              <a
                href="https://data.bodik.jp/dataset/122041_shoraijinkou"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-brass-dark"
              >
                将来人口推計（市全体）
              </a>
              」（作成：政策企画課）。あくまで平成30年時点の推計であり、その後の社会情勢の変化は
              反映されていません。
            </p>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-ink-soft">
          出典：千葉県「令和2年国勢調査－人口等基本集計結果の概要（千葉県版）」（千葉県総合企画部統計課）
        </p>

        <div className="mt-10">
          <DashboardFooterLinks
            articleHref="/articles/population-data-guide"
            articleLabel="船橋市の常住人口、実は減っている？増えている？"
            relatedLinks={[
              { href: "/finance", label: "財政ダッシュボード" },
              { href: "/rail-ridership", label: "鉄道駅別乗車人員ダッシュボード" }
            ]}
          />
          </div>

          <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD} className="h-24" />
          </div>
      </section>
    </>
  );
}
