import Head from "next/head";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import { siteConfig, datasets } from "../data/siteConfig";
import { getDatasetRecords } from "../lib/bodik";
import {
  guessLatLngFields,
  guessNameField,
  guessCategoryField,
  extractPointsFromLatLng,
  buildHazardBreakdown,
  buildDistributionInsights
} from "../lib/geo";
import { getFunabashiBoundaryRings } from "../lib/geoBoundary";

const FacilityMap = dynamic(() => import("../components/FacilityMap"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

const CATEGORY_FIELD_PATTERNS = [/区分/, /種別/, /分類/, /type/i];

const LAYER_COLORS = {
  evacuationPlaces: "#2F6F6E",
  evacuationShelters: "#B8862F",
  strandedCommuterSupport: "#8F6A22",
  aed: "#C0392B"
};

// 1つのデータセットから、地図用の地点データ・災害種別フラグの内訳・件数を取り出す
async function loadFacilityDataset(datasetConfig, layerKey) {
  if (!datasetConfig?.id) {
    return { points: [], hazardBreakdown: [], count: 0, available: false };
  }

  const data = await getDatasetRecords(datasetConfig.id, { apiBase: datasetConfig.apiBase });
  const { fields, records } = data;

  if (!data.datastoreActive || !records.length) {
    return { points: [], hazardBreakdown: [], count: records?.length || 0, available: false };
  }

  const latLng = guessLatLngFields(fields);
  const nameField = guessNameField(fields);
  const categoryField = guessCategoryField(fields, CATEGORY_FIELD_PATTERNS, records);

  const points = latLng
    ? extractPointsFromLatLng(records, { ...latLng, nameField, categoryField }).map((p) => ({
        label: p.label,
        lat: p.lat,
        lng: p.lng
      }))
    : [];

  const hazardBreakdown = buildHazardBreakdown(fields, records);

  return {
    points,
    hazardBreakdown,
    count: records.length,
    available: points.length > 0,
    layerKey
  };
}

function mergeBreakdowns(breakdowns) {
  const totals = new Map();
  for (const breakdown of breakdowns) {
    for (const item of breakdown) {
      totals.set(item.label, (totals.get(item.label) || 0) + item.count);
    }
  }
  return Array.from(totals.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getStaticProps() {
  let layers = [];
  let hazardBreakdown = [];
  let totalCount = 0;
  let aedAvailable = false;
  let boundary = [];
  let error = null;

  try {
    const [places, shelters, stranded, aed] = await Promise.all([
      loadFacilityDataset(datasets.evacuationPlaces, "evacuationPlaces"),
      loadFacilityDataset(datasets.evacuationShelters, "evacuationShelters"),
      loadFacilityDataset(datasets.strandedCommuterSupport, "strandedCommuterSupport"),
      loadFacilityDataset(datasets.aed, "aed")
    ]);

    const layerDefs = [
      { key: "evacuationPlaces", label: datasets.evacuationPlaces.label, result: places },
      { key: "evacuationShelters", label: datasets.evacuationShelters.label, result: shelters },
      { key: "strandedCommuterSupport", label: datasets.strandedCommuterSupport.label, result: stranded },
      { key: "aed", label: datasets.aed.label, result: aed }
    ];

    layers = layerDefs
      .filter((l) => l.result.available)
      .map((l) => ({
        key: l.key,
        label: l.label,
        color: LAYER_COLORS[l.key] || "#3E4B5C",
        points: l.result.points
      }));

    hazardBreakdown = mergeBreakdowns([places.hazardBreakdown, shelters.hazardBreakdown]);
    totalCount = places.count + shelters.count + stranded.count;
    aedAvailable = aed.available;

    if (layers.length) {
      boundary = await getFunabashiBoundaryRings();
    }
  } catch (e) {
    error = "データの取得に失敗しました。しばらくしてから再度お試しください。";
  }

  const hazardInsights = hazardBreakdown.length
    ? buildDistributionInsights(hazardBreakdown, hazardBreakdown.reduce((s, d) => s + d.count, 0))
    : null;

  return {
    props: { layers, hazardBreakdown, hazardInsights, totalCount, aedAvailable, boundary, error },
    revalidate: 60 * 60 * 24
  };
}

export default function DisasterPrevention({
  layers,
  hazardBreakdown,
  hazardInsights,
  totalCount,
  aedAvailable,
  boundary,
  error
}) {
  return (
    <>
      <Head>
        <title>{`防災 ダッシュボード｜${siteConfig.name}`}</title>
        <meta
          name="description"
          content="船橋市内の避難場所・避難所・帰宅困難者支援施設の位置を地図で重ねて可視化した防災ダッシュボードです。"
        />
      </Head>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">防災 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの避難場所・避難所・帰宅困難者支援施設のデータを、
          1つの地図にレイヤーとして重ねて可視化しています。チェックボックスで表示するレイヤーを切り替えられます。
        </p>

        {!aedAvailable ? (
          <div className="mt-4 max-w-2xl border border-brass/40 bg-brass/10 p-4 text-xs text-brass-dark">
            <p>
              AEDのデータは、船橋市の場合BODIK ODCSとは別のカタログ（G空間情報センター）に掲載されており、
              データセットIDを確認できなかったため、このダッシュボードには未反映です。
              <a
                href="https://www.city.funabashi.lg.jp/kurashi/shoubou/010/p053170.html"
                target="_blank"
                rel="noreferrer"
                className="ml-1 underline"
              >
                船橋市AEDマップ（公式）
              </a>
              をご利用いただくか、データセットのURLが分かればお知らせください。反映します。
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="mt-8 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-dark">{error}</p>
        ) : (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <StatCard label="登録件数（合計）" value={totalCount.toLocaleString("ja-JP")} unit="件" />
              {hazardInsights ? (
                <>
                  <StatCard
                    label="最も対応件数が多い災害種別"
                    value={hazardInsights.top.label}
                    delta={`${hazardInsights.top.count.toLocaleString("ja-JP")}件`}
                    deltaLabel={`全体の${hazardInsights.topShare.toFixed(1)}%`}
                  />
                  <StatCard label="集計している災害種別の数" value={hazardInsights.areaCount.toLocaleString("ja-JP")} unit="種別" />
                </>
              ) : null}
            </div>

            {layers.length ? (
              <div className="mt-10 border border-ink/10 bg-white/60 p-5">
                <SectionLabel code="FIG.1">避難場所・避難所マップ</SectionLabel>
                <ChartErrorBoundary>
                  <FacilityMap layers={layers} boundary={boundary} />
                </ChartErrorBoundary>
              </div>
            ) : (
              <p className="mt-8 text-sm text-ink-soft">
                このデータセットには地図表示に十分な位置情報が含まれていなかったため、地図は表示していません。
              </p>
            )}

            {hazardBreakdown.length ? (
              <div className="mt-8 border border-ink/10 bg-white/60 p-5">
                <SectionLabel code="FIG.2">対応している災害種別ごとの件数</SectionLabel>
                <p className="mb-3 text-xs text-ink-soft">
                  避難場所・避難所のデータに含まれる、災害種別ごとの「対応可否」フラグを集計したものです。
                </p>
                <ChartErrorBoundary>
                  <CategoryBarChart data={hazardBreakdown} unit="件" topN={10} />
                </ChartErrorBoundary>
              </div>
            ) : null}

            {hazardInsights ? (
              <div className="mt-8 border-l-2 border-brass/60 bg-white/40 p-5 text-sm leading-relaxed text-ink-soft">
                <p className="font-display text-base text-ink">読み解きメモ</p>
                <p className="mt-2">
                  避難場所・避難所のうち、最も対応件数が多い災害種別は「{hazardInsights.top.label}」で
                  {hazardInsights.top.count.toLocaleString("ja-JP")}件（全体の{hazardInsights.topShare.toFixed(1)}%）でした。
                  お住まいの地域に最も近い施設が、想定する災害に対応しているかどうかも含めて、事前に船橋市の公式情報でご確認ください。
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
