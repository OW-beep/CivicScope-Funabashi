import Head from "next/head";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import SearchableTable from "../components/SearchableTable";
import AdSlot from "../components/AdSlot";
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
const CATEGORY_FIELD_PATTERNS = [/地区/, /町丁目/, /町名/, /エリア/];

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
    const data = await getDatasetRecords(datasets.chokai.id);
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

      // 地図表示に十分な精度で位置が特定できなかった場合、
      // 「地区」など、より粗いカテゴリ列での集計・ランキング表示にフォールバックする。
      if (!mapAvailable) {
        const categoryField = guessCategoryField(fields, CATEGORY_FIELD_PATTERNS);
        if (categoryField) {
          categoryData = aggregateByField(records, categoryField);
          categoryFieldLabel = categoryField;
          insights = buildDistributionInsights(categoryData, records.length);
        }
      }
    }
  } catch (e) {
    error = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  return {
    props: {
      fields,
      records,
      error,
      points,
      boundary,
      insights,
      mapAvailable,
      categoryData,
      categoryFieldLabel
    },
    revalidate: 60 * 60 * 24
  };
}

export default function Chokai({
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
  const hasCategoryFallback = !mapAvailable && categoryData.length > 0;

  return (
    <>
      <Head>
        <title>{`町会・自治会 ダッシュボード｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市内の町会・自治会一覧を、町丁目別の分布マップとランキングで可視化したダッシュボードです。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">町会・自治会 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの「{datasets.chokai.label}」をもとに、地域ごとの分布を地図とランキングで可視化しています。
          {datasets.chokai.description}
        </p>

        {error ? (
          <div className="mt-8 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">
            <p>{error}</p>
            <a href={datasets.chokai.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block underline">
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
                    label={mapAvailable ? "最も件数が多い町丁目" : "最も件数が多いエリア"}
                    value={insights.top.label}
                    delta={`${insights.top.count.toLocaleString("ja-JP")}件`}
                    deltaLabel={`全体の${insights.topShare.toFixed(1)}%`}
                  />
                  <StatCard
                    label={mapAvailable ? "分布している町丁目数" : "分布しているエリア数"}
                    value={insights.areaCount.toLocaleString("ja-JP")}
                    unit={mapAvailable ? "町丁目" : "エリア"}
                  />
                </>
              ) : null}
            </div>

            {mapAvailable ? (
              <>
                <div className="mt-10 border border-ink/10 bg-white/60 p-5">
                  <SectionLabel code="FIG.1">町丁目別分布マップ</SectionLabel>
                  <TownBubbleMap points={points} boundary={boundary} unit="件" />
                </div>

                <div className="mt-8 border border-ink/10 bg-white/60 p-5">
                  <SectionLabel code="FIG.2">町丁目別 件数ランキング</SectionLabel>
                  <CategoryBarChart data={points} unit="件" />
                </div>
              </>
            ) : hasCategoryFallback ? (
              <div className="mt-10 border border-ink/10 bg-white/60 p-5">
                <SectionLabel code="FIG.1">{`エリア別 件数ランキング（${categoryFieldLabel}）`}</SectionLabel>
                <CategoryBarChart data={categoryData} unit="件" />
              </div>
            ) : (
              <p className="mt-8 text-sm text-ink-soft">
                このデータセットには可視化に十分な位置・地区情報が含まれていなかったため、下記の一覧からご確認ください。
              </p>
            )}

            {insights ? (
              <div className="mt-8 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                <p className="font-display text-base text-ink">読み解きメモ</p>
                <p className="mt-2">
                  町会・自治会は市内{insights.areaCount}
                  {mapAvailable ? "の町丁目" : "のエリア"}
                  に分布しており、最も多いのは「{insights.top.label}」で
                  {insights.top.count.toLocaleString("ja-JP")}件（全体の{insights.topShare.toFixed(1)}%）でした。
                  上位3{mapAvailable ? "町丁目" : "エリア"}で全体の{insights.top3Share.toFixed(1)}%を占めています。
                </p>
              </div>
            ) : null}

            <div className="mt-10">
              <SectionLabel code="TABLE">詳細一覧（補助・全件検索）</SectionLabel>
              <SearchableTable fields={fields} records={records} searchPlaceholder="町会名・地区名で検索" />
            </div>
          </>
        )}

        <p className="mt-6 text-xs text-ink-soft">
          ※ 加入方法や活動内容など詳細については、必ず船橋市の公式窓口にご確認ください。
        </p>

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CHOKAI} className="h-24" />
        </div>
      </section>
    </>
  );
}
