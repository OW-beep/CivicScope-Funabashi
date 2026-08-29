import Seo from "../components/Seo";
import Link from "next/link";
import dynamic from "next/dynamic";
import SectionLabel from "../components/SectionLabel";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import DashboardFooterLinks from "../components/DashboardFooterLinks";
import ChartErrorBoundary from "../components/ChartErrorBoundary";
import DataUnavailableNotice from "../components/DataUnavailableNotice";
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
const InteractiveMap = dynamic(() => import("../components/InteractiveMap"), { ssr: false });
const CategoryBarChart = dynamic(() => import("../components/CategoryBarChart"), { ssr: false });

const CATEGORY_FIELD_PATTERNS = [/区分/, /種別/, /分類/, /type/i];

const LAYER_COLORS = {
  evacuationPlaces: "#2AA7A2",
  evacuationShelters: "#E0932A",
  strandedCommuterSupport: "#B8721A",
  aed: "#C0392B",
  publicWirelessLan: "#3B6FA0"
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
    ? extractPointsFromLatLng(records, { ...latLng, nameField, categoryField, fields }).map((p) => ({
        label: p.label,
        lat: p.lat,
        lng: p.lng,
        hazards: p.hazards
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
  let boundary = [];
  let error = null;

  try {
    const [places, shelters, stranded, aed, wifi] = await Promise.all([
      loadFacilityDataset(datasets.evacuationPlaces, "evacuationPlaces"),
      loadFacilityDataset(datasets.evacuationShelters, "evacuationShelters"),
      loadFacilityDataset(datasets.strandedCommuterSupport, "strandedCommuterSupport"),
      loadFacilityDataset(datasets.aed, "aed"),
      loadFacilityDataset(datasets.publicWirelessLan, "publicWirelessLan")
    ]);

    const layerDefs = [
      { key: "evacuationPlaces", label: datasets.evacuationPlaces.label, result: places },
      { key: "evacuationShelters", label: datasets.evacuationShelters.label, result: shelters },
      { key: "strandedCommuterSupport", label: datasets.strandedCommuterSupport.label, result: stranded },
      { key: "aed", label: datasets.aed.label, result: aed },
      { key: "publicWirelessLan", label: datasets.publicWirelessLan.label, result: wifi }
    ];

    layers = layerDefs
      .filter((l) => l.result.available)
      .map((l) => ({
        key: l.key,
        label: l.label,
        color: LAYER_COLORS[l.key] || "#56636F",
        points: l.result.points
      }));

    hazardBreakdown = mergeBreakdowns([places.hazardBreakdown, shelters.hazardBreakdown]);
    totalCount = places.count + shelters.count + stranded.count;

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
    props: { layers, hazardBreakdown, hazardInsights, totalCount, boundary, error },
    revalidate: 60 * 60 * 24
  };
}

export default function DisasterPrevention({
  layers,
  hazardBreakdown,
  hazardInsights,
  totalCount,
  boundary,
  error
}) {
  return (
    <>
      <Seo title={`防災 ダッシュボード｜${siteConfig.name}`} description="船橋市内の避難場所・避難所・帰宅困難者支援施設・AED設置施設・公衆無線LANの位置を地図で重ねて可視化した防災ダッシュボードです。" path="/disaster-prevention" />

      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">防災 ダッシュボード</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          船橋市オープンデータカタログの避難場所・避難所・帰宅困難者支援施設・AED設置施設・公衆無線LANのデータを、
          1つの地図にレイヤーとして重ねて可視化しています。チェックボックスで表示するレイヤーを切り替えられます。
        </p>
        <p className="mt-3 max-w-2xl text-xs text-ink-soft">
          ※ 公衆無線LANは平時の利便性だけでなく、災害時に携帯電話回線が混雑・停波した際の通信手段としても役立ちます。
          あわせて確認しておくと安心です。
        </p>

        {error ? <DataUnavailableNotice message={error} /> : (
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
                <SectionLabel code="FIG.1">防災・生活インフラマップ</SectionLabel>
                <ChartErrorBoundary>
                  <FacilityMap
                    layers={layers}
                    boundary={boundary}
                    hazardOptions={hazardBreakdown.map((d) => d.label)}
                  />
                </ChartErrorBoundary>
              </div>
            ) : (
              <p className="mt-8 text-sm text-ink-soft">
                このデータセットには地図表示に十分な位置情報が含まれていなかったため、地図は表示していません。
              </p>
            )}

            {layers.length ? (
              <div className="mt-10 border border-ink/10 bg-white/60 p-5">
                <SectionLabel code="FIG.1B">実際の地図で見る（試験提供）</SectionLabel>
                <p className="mb-3 text-xs text-ink-soft">
                  OpenStreetMapの実際の地図の上に、施設の位置を表示しています。ドラッグで移動、スクロールで拡大・縮小、
                  地点をクリックするとその場所に近づきます。
                </p>
                <ChartErrorBoundary>
                  <InteractiveMap
                    points={layers.flatMap((l) => l.points.map((p) => ({ ...p, category: l.label })))}
                    categoryColors={Object.fromEntries(layers.map((l) => [l.label, l.color]))}
                    showSidebar
                    height={480}
                  />
                </ChartErrorBoundary>
                <p className="mt-3 text-[11px] text-ink-soft">
                  地図データ：© OpenStreetMap contributors（OpenFreeMap経由で配信）
                </p>
              </div>
            ) : null}

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

            {/* --- AEDの効果（総務省消防庁データ） -------------------------- */}
            <div className="mt-10 border-t border-ink/10 pt-8">
              <SectionLabel code="FIG.3">AEDが使われた場合の生存率・社会復帰率（全国データ）</SectionLabel>
              <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
                上の地図に含まれるAED設置施設は、実際に使われた場合どれくらい効果があるのでしょうか。
                総務省消防庁「令和6年版 消防白書」（令和5年中の全国データ）によると、一般市民が目撃した
                心原性心肺機能停止傷病者について、応急手当の有無・AED使用の有無で生存率に大きな差が出ています。
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="border border-ink/10 bg-white/60 p-5">
                  <p className="mb-3 text-xs text-ink-soft">1か月後生存率</p>
                  <ChartErrorBoundary>
                    <CategoryBarChart
                      data={[
                        { label: "応急手当なし", count: 7.3 },
                        { label: "応急手当あり（AEDなし）", count: 14.8 },
                        { label: "AEDで除細動を実施", count: 54.2 }
                      ]}
                      unit="%"
                      topN={3}
                    />
                  </ChartErrorBoundary>
                </div>
                <div className="border border-ink/10 bg-white/60 p-5">
                  <p className="mb-3 text-xs text-ink-soft">1か月後社会復帰率</p>
                  <ChartErrorBoundary>
                    <CategoryBarChart
                      data={[
                        { label: "応急手当なし", count: 3.4 },
                        { label: "応急手当あり（AEDなし）", count: 10.0 },
                        { label: "AEDで除細動を実施", count: 44.9 }
                      ]}
                      unit="%"
                      topN={3}
                    />
                  </ChartErrorBoundary>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
                AEDで除細動が行われたケースは、行われなかったケースと比べて生存率で約7倍、社会復帰率で約13倍という
                差になっています。いざという時に落ち着いて使えるよう、よく行く場所の最寄りのAEDを事前に確認しておくと
                安心です。詳しくは
                <Link href="/articles/aed-locations-guide" className="underline hover:text-brass-dark">
                  「船橋市のAEDはどこにある？」の記事
                </Link>
                で解説しています。
              </p>
              <p className="mt-3 text-xs text-ink-soft">
                出典：総務省消防庁「令和6年版 消防白書」（船橋市固有のデータではなく全国集計値です）。
              </p>
            </div>
          </>
        )}

        <p className="mt-6 text-xs text-ink-soft">
          ※ 災害時に実際に開設される避難所・避難場所は災害の種類や規模により異なります。最新かつ正確な情報は、必ず船橋市の公式サイト・防災行政無線・広報などでご確認ください。本ページの情報だけで避難行動を判断しないでください。
        </p>

        <div className="mt-10">
          <DashboardFooterLinks articleHref="/articles/evacuation-map-guide" articleLabel="避難場所・避難所マップの正しい使い方" />
          </div>

          <div className="mt-8">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISASTER} className="h-24" />
          </div>
      </section>
    </>
  );
}
