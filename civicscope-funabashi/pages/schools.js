import Head from "next/head";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig, datasets } from "../data/siteConfig";
import { getDatasetRecords, normalizeNameValueList, buildNameValueInsights } from "../lib/bodik";

const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

const NAME_PATTERNS = [/学校名/, /校名/, /名称/, /^name$/i];
const VALUE_PATTERNS = [/生徒数/, /人数/, /^count$/i];

export async function getStaticProps() {
  let list = [];
  let insights = null;
  let error = null;

  try {
    const data = await getDatasetRecords(datasets.schoolStudents.id);
    const normalized = normalizeNameValueList(data, {
      namePatterns: NAME_PATTERNS,
      valuePatterns: VALUE_PATTERNS
    });
    if (normalized) {
      list = normalized.list;
      insights = buildNameValueInsights(normalized);
    } else {
      error = "データの列構成を自動認識できませんでした。原典データセットをご確認ください。";
    }
  } catch (e) {
    error = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  return {
    props: { list, insights, error },
    revalidate: 60 * 60 * 24
  };
}

export default function Schools({ list, insights, error }) {
  const chartData = list.map((d) => ({ label: d.label, count: d.value }));

  return (
    <>
      <Head>
        <title>{`学校（中学校生徒数） ダッシュボード｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市立中学校の学校別生徒数をランキングで可視化したダッシュボードです。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">学校 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの「{datasets.schoolStudents.label}」をもとに、
          市立中学校ごとの生徒数をランキングで可視化しています。{datasets.schoolStudents.description}
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          ※ このデータセットは特定時点のスナップショットです。最新の学校別生徒数は船橋市教育委員会にご確認ください。
        </p>

        {error ? (
          <p className="mt-8 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">{error}</p>
        ) : (
          <>
            {insights ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <StatCard label="生徒数の合計" value={insights.total.toLocaleString("ja-JP")} unit="人" />
                <StatCard
                  label="最も生徒数が多い学校"
                  value={insights.top.label}
                  delta={`${insights.top.value.toLocaleString("ja-JP")}人`}
                  deltaLabel={`全体の${insights.topShare.toFixed(1)}%`}
                />
                <StatCard label="集計している学校数" value={insights.count.toLocaleString("ja-JP")} unit="校" />
              </div>
            ) : null}

            <div className="mt-10 border border-ink/10 bg-white/60 p-5">
              <SectionLabel code="FIG.1">学校別 生徒数ランキング</SectionLabel>
              <ChartErrorBoundary>
                <CategoryBarChart data={chartData} unit="人" topN={30} />
              </ChartErrorBoundary>
            </div>

            {insights ? (
              <div className="mt-8 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                <p className="font-display text-base text-ink">読み解きメモ</p>
                <p className="mt-2">
                  船橋市立中学校{insights.count}校の生徒数の合計は{insights.total.toLocaleString("ja-JP")}人で、
                  最も生徒数が多いのは{insights.top.label}（{insights.top.value.toLocaleString("ja-JP")}人、
                  全体の{insights.topShare.toFixed(1)}%）でした。学校規模は学級数や部活動の選択肢にも
                  関わってくるため、進学先を考える際の参考情報のひとつになります。
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
