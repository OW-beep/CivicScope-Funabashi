import Head from "next/head";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import SearchableTable from "../components/SearchableTable";
import AdSlot from "../components/AdSlot";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig, datasets } from "../data/siteConfig";
import { getDatasetRecords } from "../lib/bodik";
import {
  getFunabashiTownIndex,
  guessAddressField,
  guessCategoryField,
  aggregateByTown,
  aggregateByField,
  buildDistributionInsights
} from "../lib/geo";
import { getFunabashiBoundaryRings } from "../lib/geoBoundary";

const TownBubbleMap = dynamic(() => import("../components/TownBubbleMap"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

const MIN_MATCH_RATIO = 0.2;
const CATEGORY_FIELD_PATTERNS = [/業種/, /種別/, /区分/, /施設区分/];

export async function getStaticProps() {
  let fields = [];
  let records = [];
  let error = null;
  let points = [];
  let boundary = [];
  let insights = null;
  let mapAvailable = false;
  let categoryData = [];
  let categoryFieldLabel = null;

  try {
    const data = await getDatasetRecords(datasets.lifeSanitationFacilities.id);
    fields = data.fields;
    records = data.records;

    if (!data.datastoreActive) {
      error = "このデータセットは検索可能な形式（DataStore）が未設定のため、原典サイトをご覧ください。";
    } else {
      const addressField = guessAddressField(fields, records);
      if (addressField) {
        const index = await getFunabashiTownIndex();
        const agg = aggregateByTown(records, addressField, index);
        if (agg.points.length && agg.matched / agg.total >= MIN_MATCH_RATIO) {
          points = agg.points;
          mapAvailable = true;
          insights = buildDistributionInsights(points, records.length);
          try {
            boundary = await getFunabashiBoundaryRings();
          } catch (e) {
            boundary = [];
          }
        }
      }

      const categoryField = guessCategoryField(fields, CATEGORY_FIELD_PATTERNS, records);
      if (categoryField) {
        categoryData = aggregateByField(records, categoryField);
        categoryFieldLabel = categoryField;
        if (!insights) insights = buildDistributionInsights(categoryData, records.length);
      }
    }
  } catch (e) {
    error = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  return {
    props: { fields, records, error, points, boundary, insights, mapAvailable, categoryData, categoryFieldLabel },
    revalidate: 60 * 60 * 24
  };
}

export default function LifeSanitation({
  fields,
  records,
  error,
  points,
  boundary,
  insights,
  mapAvailable,
  categoryData,
  categoryFieldLabel
}) {
  return (
    <>
      <Head>
        <title>{`生活衛生施設 ダッシュボード｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市内の美容所・理容所・クリーニング所・旅館・ホテル・公衆浴場などの分布を地図と業種別ランキングで可視化したダッシュボードです。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">生活衛生施設 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの「{datasets.lifeSanitationFacilities.label}」をもとに、
          町丁目別の分布と業種別の内訳を可視化しています。{datasets.lifeSanitationFacilities.description}
        </p>

        {error ? (
          <div className="mt-8 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
            <p>{error}</p>
            <a
              href={datasets.lifeSanitationFacilities.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block underline"
            >
              原典データセットを見る →
            </a>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <StatCard label="登録件数" value={records.length.toLocaleString("ja-JP")} unit="件" />
              {insights ? (
                <>
                  <StatCard
                    label={mapAvailable ? "最も件数が多い町丁目" : "最も件数が多い業種"}
                    value={insights.top.label}
                    delta={`${insights.top.count.toLocaleString("ja-JP")}件`}
                    deltaLabel={`全体の${insights.topShare.toFixed(1)}%`}
                  />
                  <StatCard
                    label={mapAvailable ? "分布している町丁目数" : "業種の数"}
                    value={insights.areaCount.toLocaleString("ja-JP")}
                    unit={mapAvailable ? "町丁目" : "業種"}
                  />
                </>
              ) : null}
            </div>

            {mapAvailable ? (
              <div className="mt-10 border border-ink/10 bg-white/60 p-5">
                <SectionLabel code="FIG.1">町丁目別分布マップ</SectionLabel>
                <ChartErrorBoundary>
                  <TownBubbleMap points={points} boundary={boundary} unit="件" />
                </ChartErrorBoundary>
              </div>
            ) : (
              <p className="mt-8 text-sm text-ink-soft">
                このデータセットには地図表示に十分な住所情報が含まれていなかったため、下記のランキング・一覧からご確認ください。
              </p>
            )}

            {categoryData.length ? (
              <div className="mt-8 border border-ink/10 bg-white/60 p-5">
                <SectionLabel code="FIG.2">{`業種別 件数ランキング（${categoryFieldLabel}）`}</SectionLabel>
                <ChartErrorBoundary>
                  <CategoryBarChart data={categoryData} unit="件" />
                </ChartErrorBoundary>
              </div>
            ) : null}

            <div className="mt-10">
              <SectionLabel code="TABLE">詳細一覧（補助・全件検索）</SectionLabel>
              <SearchableTable fields={fields} records={records} searchPlaceholder="施設名・住所・業種で検索" />
            </div>
          </>
        )}

        <p className="mt-6 text-xs text-ink-soft">
          ※ 営業許可・届出内容は更新・廃業により変動します。正確な現況は船橋市保健所（生活衛生課）にご確認ください。
        </p>

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LIFE_SANITATION} className="h-24" />
        </div>
      </section>
    </>
  );
}
