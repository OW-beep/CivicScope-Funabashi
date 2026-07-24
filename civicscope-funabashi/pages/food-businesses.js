import Head from "next/head";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import SearchableTable from "../components/SearchableTable";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
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
const CATEGORY_FIELD_PATTERNS = [/業種/, /種別/, /区分/];

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
    const data = await getDatasetRecords(datasets.foodBusiness.id);
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

export default function FoodBusinesses({
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
        <title>{`食品営業施設 ダッシュボード｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市内の食品営業施設の許可件数を、町丁目別の分布マップと業種別ランキングで可視化したダッシュボードです。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">食品営業施設 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの「{datasets.foodBusiness.label}」をもとに、町丁目別の分布と業種別の内訳を可視化しています。
          {datasets.foodBusiness.description}
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          ※ 令和3年6月1日以降に新たに許可・届出された施設は含まれません。最新情報は
          <a
            href="https://ifas.mhlw.go.jp/faspub/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-brass-dark"
          >
            厚生労働省 食品衛生申請等システム
          </a>
          をご確認ください。
        </p>

        {error ? (
          <div className="mt-8 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
            <p>{error}</p>
            <a href={datasets.foodBusiness.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block underline">
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
                    label="最も件数が多い町丁目"
                    value={insights.top.label}
                    delta={`${insights.top.count.toLocaleString("ja-JP")}件`}
                    deltaLabel={`全体の${insights.topShare.toFixed(1)}%`}
                  />
                  <StatCard
                    label="分布している町丁目数"
                    value={insights.areaCount.toLocaleString("ja-JP")}
                    unit="町丁目"
                  />
                </>
              ) : null}
            </div>

            {mapAvailable ? (
              <>
                <div className="mt-10 border border-ink/10 bg-white/60 p-5">
                  <SectionLabel code="FIG.1">町丁目別分布マップ</SectionLabel>
                  <ChartErrorBoundary>
                    <TownBubbleMap points={points} boundary={boundary} unit="件" />
                  </ChartErrorBoundary>
                </div>

                <div className="mt-8 border border-ink/10 bg-white/60 p-5">
                  <SectionLabel code="FIG.2">町丁目別 件数ランキング</SectionLabel>
                  <ChartErrorBoundary>
                    <CategoryBarChart data={points} unit="件" />
                  </ChartErrorBoundary>
                </div>
              </>
            ) : (
              <p className="mt-8 text-sm text-ink-soft">
                このデータセットには地図表示に十分な住所情報が含まれていなかったため、下記の一覧からご確認ください。
              </p>
            )}

            {categoryData.length ? (
              <div className="mt-8 border border-ink/10 bg-white/60 p-5">
                <SectionLabel code="FIG.3">{`業種別 件数ランキング（${categoryFieldLabel}）`}</SectionLabel>
                <ChartErrorBoundary>
                  <CategoryBarChart data={categoryData} unit="件" />
                </ChartErrorBoundary>
              </div>
            ) : null}

            {insights ? (
              <div className="mt-8 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                <p className="font-display text-base text-ink">読み解きメモ</p>
                <p className="mt-2">
                  食品営業施設は市内{insights.areaCount}の町丁目に分布しており、最も多いのは
                  「{insights.top.label}」で{insights.top.count.toLocaleString("ja-JP")}件（全体の
                  {insights.topShare.toFixed(1)}%）でした。上位3町丁目で全体の
                  {insights.top3Share.toFixed(1)}%を占めています。
                </p>
              </div>
            ) : null}

            <div className="mt-10">
              <SectionLabel code="TABLE">詳細一覧（補助・全件検索）</SectionLabel>
              <SearchableTable fields={fields} records={records} searchPlaceholder="施設名・住所・業種で検索" />
            </div>
          </>
        )}

        <p className="mt-6 text-xs text-ink-soft">
          ※ 営業許可は更新・廃業により変動します。正確な現況は船橋市保健所（生活衛生課）にご確認ください。
        </p>

        <div className="mt-10">
          <DashboardFooterLinks articleHref="/articles/food-business-directory-guide" articleLabel="船橋市の食品営業施設データの読み方" />
          </div>

          <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOD} className="h-24" />
          </div>
      </section>
    </>
  );
}
