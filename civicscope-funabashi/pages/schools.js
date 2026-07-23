import Head from "next/head";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig, datasets } from "../data/siteConfig";
import { getDatasetRecords, normalizePopulationSeries, buildAnnualSeriesInsights } from "../lib/bodik";

// Rechartsはブラウザ専用APIに依存するためSSRを無効化して読み込む
const PopulationChart = dynamic(() => import("../components/PopulationChart"), { ssr: false });

export async function getStaticProps() {
  let series = [];
  let insights = null;
  let peak = null;
  let trough = null;
  let error = null;

  try {
    // 注：このデータセットは「学校別の生徒数一覧」ではなく、船橋市立中学校生徒数の
    // 市内合計を年度ごとに集計した時系列データです（1行=1年度）。以前は「学校ごとの
    // ランキング」として扱おうとしていましたが、データセットの列構成（年度・総数のみで、
    // 学校名にあたる列が存在しない）と合わず、常にエラー表示になっていました。
    // 人口ダッシュボードと同じ時系列の正規化関数で扱うのが実態に合っています。
    const data = await getDatasetRecords(datasets.schoolStudents.id);
    const normalized = normalizePopulationSeries(data);

    if (normalized) {
      series = normalized.series;
      insights = buildAnnualSeriesInsights(series, "total");
      if (series.length) {
        peak = series.reduce((max, row) => (row.total > max.total ? row : max), series[0]);
        trough = series.reduce((min, row) => (row.total < min.total ? row : min), series[0]);
      }
    } else {
      error = "データの列構成を自動認識できませんでした。原典データセットをご確認ください。";
    }
  } catch (e) {
    error = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  return {
    props: { series, insights, peak, trough, error },
    revalidate: 60 * 60 * 24
  };
}

export default function Schools({ series, insights, peak, trough, error }) {
  return (
    <>
      <Head>
        <title>{`学校（中学校生徒数） ダッシュボード｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市立中学校の生徒数（市内合計）の年度推移を可視化したダッシュボードです。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">学校 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの「{datasets.schoolStudents.label}」をもとに、
          船橋市立中学校の生徒数（市内合計）の年度推移を可視化しています。{datasets.schoolStudents.description}
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          ※ このデータセットは学校ごとの内訳ではなく、市内の中学校生徒数の合計を年度ごとに集計したものです。
          学校別の生徒数データは、本記事執筆時点で船橋市のオープンデータカタログには公開されていません。
        </p>

        {error ? (
          <p className="mt-8 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">{error}</p>
        ) : (
          <>
            {insights ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="最新年度の生徒数"
                  value={insights.latest.total.toLocaleString("ja-JP")}
                  unit="人"
                  delta={insights.latest.label}
                  deltaLabel="時点"
                />
                <StatCard
                  label="前年度比"
                  value={`${insights.diff > 0 ? "+" : ""}${insights.diff.toLocaleString("ja-JP")}`}
                  unit="人"
                  delta={insights.rate !== null ? `${insights.rate > 0 ? "+" : ""}${insights.rate.toFixed(2)}%` : null}
                  deltaLabel="増減率"
                  tone={insights.diff > 0 ? "up" : insights.diff < 0 ? "down" : "neutral"}
                />
                {peak ? (
                  <StatCard
                    label="集計期間内のピーク"
                    value={peak.total.toLocaleString("ja-JP")}
                    unit="人"
                    delta={peak.label}
                    deltaLabel="時点"
                  />
                ) : null}
                {trough ? (
                  <StatCard
                    label="集計期間内の最少"
                    value={trough.total.toLocaleString("ja-JP")}
                    unit="人"
                    delta={trough.label}
                    deltaLabel="時点"
                  />
                ) : null}
              </div>
            ) : null}

            <div className="mt-10 border border-ink/10 bg-white/60 p-5">
              <SectionLabel code="FIG.1">中学校生徒数（市内合計）の推移</SectionLabel>
              <ChartErrorBoundary>
                <PopulationChart data={series} seriesLabel="中学校生徒数（市内合計）" periodLabel="年度" />
              </ChartErrorBoundary>
            </div>

            {insights && peak && trough ? (
              <div className="mt-8 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                <p className="font-display text-base text-ink">読み解きメモ</p>
                <p className="mt-2">
                  最新年度（{insights.latest.label}）の船橋市立中学校の生徒数は
                  {insights.latest.total.toLocaleString("ja-JP")}人で、前年度から
                  {insights.diff >= 0 ? "増加" : "減少"}
                  （{insights.diff >= 0 ? "+" : ""}{insights.diff.toLocaleString("ja-JP")}人）しました。
                  集計期間中の最多は{peak.label}の{peak.total.toLocaleString("ja-JP")}人、
                  最少は{trough.label}の{trough.total.toLocaleString("ja-JP")}人で、
                  少子化や宅地開発など、まちの人口動態を映す長期的な波が見て取れます。詳しい読み方は
                  <a href="/articles/junior-high-school-students-guide" className="underline hover:text-brass-dark">解説記事</a>
                  もご参照ください。
                </p>
              </div>
            ) : null}
          </>
        )}

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SCHOOLS} className="h-24" />
        </div>
      </section>
    </>
  );
}
