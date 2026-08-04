// 複数のオープンデータセット（住所はあるが個別の緯度経度は持たない施設一覧）を
// 町丁目単位で集計し、地区ごとの「暮らしの手がかり」を1つのパネルにまとめるためのユーティリティ。
// 「町丁目をクリックすると、その地区の施設内訳が分かる」地区モードの土台。
//
// 注意（正直な前提）：
// ・人口・世帯数・高齢化率などは、本サイトが参照している統計が市全体の集計のみのため、
//   現時点では町丁目単位のデータが無い。そのため、ここでは「施設の分布」のみを扱う。
// ・住所の表記ゆれ（丁目の有無、通称地名など）により、実際より少なく数えられる施設がある。

import { getDatasetRecords } from "./bodik";
import { getFunabashiTownIndex, guessAddressField, aggregateByTown } from "./geo";

// 集計対象のデータセットと、パネル表示用のラベル・色。
export const DISTRICT_METRICS = [
  { key: "plazas", datasetKey: "plazas", label: "広場", color: "#2F6F6E" },
  { key: "featuredParks", datasetKey: "featuredParks", label: "特色のある公園", color: "#B8862F" },
  { key: "nursery", datasetKey: "publicNurseryFacilities", label: "公立保育所", color: "#8F6A22" },
  { key: "lifeSanitation", datasetKey: "lifeSanitationFacilities", label: "生活衛生施設", color: "#3B6FA0" },
  { key: "foodBusiness", datasetKey: "foodBusiness", label: "食品営業施設", color: "#7B4B94" }
];

// 1つのデータセットを町丁目ごとに集計する。取得・集計に失敗した場合は空扱いにして、
// 他のデータセットの集計には影響させない（サイト全体の「取得失敗しても続行する」方針に合わせる）。
async function aggregateOneDataset(datasetConfig, index) {
  if (!datasetConfig?.id) return new Map();

  try {
    const data = await getDatasetRecords(datasetConfig.id);
    if (!data.datastoreActive || !data.records.length) return new Map();

    const addressField = guessAddressField(data.fields, data.records);
    if (!addressField) return new Map();

    const agg = aggregateByTown(data.records, addressField, index);
    return new Map(agg.points.map((p) => [p.label, p]));
  } catch (e) {
    return new Map();
  }
}

/**
 * datasets: data/siteConfig.js の datasets オブジェクト
 * 戻り値: [{ label, lat, lng, count, breakdown: [{ key, label, color, count }] }]
 *   count は施設種別の合計（バブルの大きさに使う）。座標が1件も見つからない町丁目は含めない。
 */
export async function buildDistrictStats(datasets) {
  const index = await getFunabashiTownIndex();

  const perMetric = {};
  await Promise.all(
    DISTRICT_METRICS.map(async (metric) => {
      perMetric[metric.key] = await aggregateOneDataset(datasets[metric.datasetKey], index);
    })
  );

  const townNames = new Set();
  for (const metric of DISTRICT_METRICS) {
    for (const town of perMetric[metric.key].keys()) townNames.add(town);
  }

  const districts = [];
  for (const town of townNames) {
    let coords = null;
    let total = 0;

    const breakdown = DISTRICT_METRICS.map((metric) => {
      const entry = perMetric[metric.key].get(town);
      const count = entry?.count || 0;
      if (entry && !coords) coords = { lat: entry.lat, lng: entry.lng };
      total += count;
      return { key: metric.key, label: metric.label, color: metric.color, count };
    });

    if (!coords || total <= 0) continue;
    districts.push({ label: town, lat: coords.lat, lng: coords.lng, count: total, breakdown });
  }

  return districts.sort((a, b) => b.count - a.count);
}
