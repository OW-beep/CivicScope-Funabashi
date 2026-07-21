import Head from "next/head";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig, datasets } from "../data/siteConfig";
import { getDatasetRecords, normalizeDogSeries, buildDogInsights } from "../lib/bodik";

const DualBarChart = dynamic(() => import("../components/DualBarChart"), { ssr: false });

export async function getStaticProps() {
  let series = [];
  let insights = null;
  let error = null;

  try {
    const data = await getDatasetRecords(datasets.dogRegistration.id);
    const normalized = normalizeDogSeries(data);
    if (normalized) {
      series = normalized.series;
      insights = buildDogInsights(normalized);
    } else {
      error = "データの列構成を自動認識できませんでした。原典データセットをご確認ください。";
    }
  } catch (e) {
    error = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  return {
    props: { series, insights, error },
    revalidate: 60 * 60 * 24
  };
}

export default function DogRegistration({ series, insights, error }) {
  return (
    <>
      <Head>
        <title>{`犬の登録・予防注射 ダッシュボード｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市の犬の登録頭数と狂犬病予防注射実施頭数の推移、および接種率を可視化したダッシュボードです。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">犬の登録・予防注射 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの「{datasets.dogRegistration.label}」をもとに、登録頭数と予防注射実施頭数の推移、
          およびその比率（接種率の目安）を可視化しています。{datasets.dogRegistration.description}
        </p>

        {error ? (
          <p className="mt-8 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">{error}</p>
        ) : (
          <>
            {insights ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="最新の登録頭数"
                  value={insights.latest.registered.toLocaleString("ja-JP")}
                  unit="頭"
                  delta={insights.latest.label}
                  deltaLabel="時点"
                />
                <StatCard
                  label="最新の予防注射実施頭数"
                  value={insights.latest.vaccinated.toLocaleString("ja-JP")}
                  unit="頭"
                />
                <StatCard
                  label="登録頭数に対する接種割合"
                  value={insights.latest.rate !== null ? insights.latest.rate.toFixed(1) : "―"}
                  unit="%"
                  delta={
                    insights.rateDiff !== null
                      ? `${insights.rateDiff > 0 ? "+" : ""}${insights.rateDiff.toFixed(1)}pt`
                      : null
                  }
                  deltaLabel="前期間比"
                  tone={insights.rateDiff > 0 ? "up" : insights.rateDiff < 0 ? "down" : "neutral"}
                />
              </div>
            ) : null}

            <div className="mt-10 border border-ink/10 bg-white/60 p-5">
              <SectionLabel code="FIG.1">登録頭数と予防注射実施頭数の推移</SectionLabel>
              <ChartErrorBoundary>
                <DualBarChart data={series} />
              </ChartErrorBoundary>
            </div>

            {insights ? (
              <div className="mt-8 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                <p className="font-display text-base text-ink">読み解きメモ</p>
                <p className="mt-2">
                  {insights.latest.label}時点の登録頭数は{insights.latest.registered.toLocaleString("ja-JP")}頭、
                  うち予防注射を実施したのは{insights.latest.vaccinated.toLocaleString("ja-JP")}頭で、
                  登録頭数に対する割合は{insights.latest.rate !== null ? insights.latest.rate.toFixed(1) : "―"}%でした。
                  この割合は実際の接種率そのものではなく、登録済みの頭数のうち届出ベースで注射が確認できた割合の目安である点にご留意ください。
                  詳しい読み方は
                  <a href="/articles/dog-registration-guide" className="underline hover:text-brass-dark">解説記事</a>
                  もご参照ください。
                </p>
              </div>
            ) : null}
          </>
        )}

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DOG} className="h-24" />
        </div>
      </section>
    </>
  );
}
