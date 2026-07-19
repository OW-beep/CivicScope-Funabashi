import Head from "next/head";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import { siteConfig, datasets } from "../data/siteConfig";
import { getDatasetRecords } from "../lib/bodik";
import {
  guessLatLngFields,
  guessNameField,
  guessCategoryField,
  extractPointsFromLatLng,
  guessAddressField,
  getFunabashiTownIndex,
  aggregateByTown,
  aggregateByField,
  buildDistributionInsights
} from "../lib/geo";
import { getFunabashiBoundaryRings } from "../lib/geoBoundary";

const FacilityMap = dynamic(() => import("../components/FacilityMap"), { ssr: false });
const TownBubbleMap = dynamic(() => import("../components/TownBubbleMap"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

const CATEGORY_FIELD_PATTERNS = [/区分/, /種別/, /分類/, /type/i];
const MIN_MATCH_RATIO = 0.2;

// 1つのデータセットから「地点データ（緯度経度が使えれば最優先）」を抽出する。
// 緯度経度が無い場合は住所から町丁目単位の集計にフォールバックする。
async function extractFacilityPoints(datasetConfig, fallbackCategoryLabel) {
  const data = await getDatasetRecords(datasetConfig.id);
  const { fields, records } = data;

  if (!data.datastoreActive || !records.length) {
    return { points: [], categoryData: [], usedLatLng: false, count: 0 };
  }

  const latLng = guessLatLngFields(fields);
  const nameField = guessNameField(fields);
  const categoryField = guessCategoryField(fields, CATEGORY_FIELD_PATTERNS);

  if (latLng) {
    const points = extractPointsFromLatLng(records, {
      ...latLng,
      nameField,
      categoryField
    }).map((p) => ({ ...p, category: p.category || fallbackCategoryLabel }));

    const categoryData = categoryField ? aggregateByField(records, categoryField) : [];

    return { points, categoryData, usedLatLng: true, count: records.length };
  }

  // 緯度経度が使えない場合は住所ベースの町丁目集計にフォールバックする
  const addressField = guessAddressField(fields, records);
  if (addressField) {
    const index = await getFunabashiTownIndex();
    const agg = aggregateByTown(records, addressField, index);
    if (agg.points.length && agg.matched / agg.total >= MIN_MATCH_RATIO) {
      return { townPoints: agg.points, points: [], categoryData: [], usedLatLng: false, count: records.length };
    }
  }

  const categoryData = categoryField ? aggregateByField(records, categoryField) : [];
  return { points: [], categoryData, usedLatLng: false, count: records.length };
}

export async function getStaticProps() {
  let facilityPoints = [];
  let townPoints = [];
  let categoryData = [];
  let boundary = [];
  let totalCount = 0;
  let usedLatLng = false;
  let error = null;

  try {
    const [places, shelters] = await Promise.all([
      extractFacilityPoints(datasets.evacuationPlaces, "避難場所"),
      extractFacilityPoints(datasets.evacuationShelters, "避難所")
    ]);

    facilityPoints = [...(places.points || []), ...(shelters.points || [])];
    townPoints = [...(places.townPoints || []), ...(shelters.townPoints || [])];
    categoryData = [...(places.categoryData || []), ...(shelters.categoryData || [])].sort(
      (a, b) => b.count - a.count
    );
    totalCount = (places.count || 0) + (shelters.count || 0);
    usedLatLng = places.usedLatLng || shelters.usedLatLng;

    if (facilityPoints.length || townPoints.length) {
      boundary = await getFunabashiBoundaryRings();
    }
  } catch (e) {
    error = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  const insights = totalCount ? buildDistributionInsights(categoryData, totalCount) : null;

  return {
    props: { facilityPoints, townPoints, categoryData, boundary, totalCount, usedLatLng, insights, error },
    revalidate: 60 * 60 * 24
  };
}

export default function DisasterPrevention({
  facilityPoints,
  townPoints,
  categoryData,
  boundary,
  totalCount,
  usedLatLng,
  insights,
  error
}) {
  const hasFacilityMap = facilityPoints.length > 0;
  const hasTownMap = !hasFacilityMap && townPoints.length > 0;
  const hasCategoryChart = categoryData.length > 0;

  return (
    <>
      <Head>
        <title>{`防災 ダッシュボード｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市内の避難場所・避難所の位置を地図で可視化した防災ダッシュボードです。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">防災 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの「{datasets.evacuationPlaces.label}」と「{datasets.evacuationShelters.label}」をもとに、
          避難場所・避難所の位置を地図とランキングで可視化しています。
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          {datasets.evacuationPlaces.description} {datasets.evacuationShelters.description}
        </p>

        {error ? (
          <p className="mt-8 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">{error}</p>
        ) : (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <StatCard label="避難場所・避難所の合計件数" value={totalCount.toLocaleString("ja-JP")} unit="件" />
              {insights ? (
                <>
                  <StatCard
                    label="最も件数が多い種別"
                    value={insights.top.label}
                    delta={`${insights.top.count.toLocaleString("ja-JP")}件`}
                    deltaLabel={`全体の${insights.topShare.toFixed(1)}%`}
                  />
                  <StatCard label="種別の数" value={insights.areaCount.toLocaleString("ja-JP")} unit="種別" />
                </>
              ) : null}
            </div>

            {hasFacilityMap ? (
              <div className="mt-10 border border-ink/10 bg-white/60 p-5">
                <SectionLabel code="FIG.1">避難場所・避難所マップ</SectionLabel>
                <FacilityMap points={facilityPoints} boundary={boundary} />
              </div>
            ) : hasTownMap ? (
              <div className="mt-10 border border-ink/10 bg-white/60 p-5">
                <SectionLabel code="FIG.1">町丁目別 分布マップ</SectionLabel>
                <p className="mb-3 text-xs text-ink-soft">
                  施設ごとの緯度経度が確認できなかったため、住所から町丁目単位に集計した分布を表示しています。
                </p>
                <TownBubbleMap points={townPoints} boundary={boundary} unit="件" />
              </div>
            ) : (
              <p className="mt-8 text-sm text-ink-soft">
                このデータセットには地図表示に十分な位置情報が含まれていなかったため、種別ごとのランキングのみ表示しています。
              </p>
            )}

            {hasCategoryChart ? (
              <div className="mt-8 border border-ink/10 bg-white/60 p-5">
                <SectionLabel code="FIG.2">種別ごとの件数</SectionLabel>
                <CategoryBarChart data={categoryData} unit="件" topN={10} />
              </div>
            ) : null}

            {insights ? (
              <div className="mt-8 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                <p className="font-display text-base text-ink">読み解きメモ</p>
                <p className="mt-2">
                  避難場所・避難所は合計{totalCount.toLocaleString("ja-JP")}件登録されており、
                  最も多い種別は「{insights.top.label}」で{insights.top.count.toLocaleString("ja-JP")}件
                  （全体の{insights.topShare.toFixed(1)}%）でした。
                  {usedLatLng
                    ? "地図上の各点は施設ごとの緯度経度をそのまま表示しています。"
                    : ""}
                  お住まいの地域に最も近い施設は、災害時に実際に使えるかどうかも含めて、事前に船橋市の公式情報でご確認ください。
                </p>
              </div>
            ) : null}
          </>
        )}

        <p className="mt-6 text-xs text-ink-soft">
          ※ 災害時に実際に開設される避難所・避難場所は災害の種類や規模により異なります。最新かつ正確な情報は、必ず船橋市の公式サイト・防災行政無線・広報などでご確認ください。本ページの情報だけで避難行動を判断しないでください。
        </p>

        <div className="mt-10">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISASTER} className="h-24" />
        </div>
      </section>
    </>
  );
}
