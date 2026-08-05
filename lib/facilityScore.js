// 保育所などの「基準地点」から、半径○km以内にある施設（公園・避難所など）の件数を数える
// ユーティリティ。地区モード（lib/districtStats.js）と同じ考え方（最寄り判定に緯度経度の
// 直線距離を使う簡易計算）を、施設単位に応用したもの。
//
// 正直な前提: 徒歩ルート（道なり）ではなく直線距離での概算。踏切や河川で実際の徒歩時間が
// 直線距離より長くなる区間もありうる。

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * originからradiusKm以内にあるpointsの件数を数える。
 * @param {{lat:number, lng:number}} origin
 * @param {Array<{lat:number, lng:number}>} points
 * @param {number} radiusKm
 */
export function countWithinRadius(origin, points, radiusKm) {
  if (!origin || !Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) return 0;
  let count = 0;
  for (const p of points) {
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) continue;
    if (haversineKm(origin.lat, origin.lng, p.lat, p.lng) <= radiusKm) count += 1;
  }
  return count;
}

/**
 * 各拠点（例: 保育所）について、周辺の施設カテゴリごとの件数を計算する。
 * @param {Array<{label, lat, lng}>} originPoints 基準となる拠点（保育所など）
 * @param {Array<{key, label, points: Array<{lat,lng}>}>} categories 数える対象のカテゴリ群
 * @param {number} radiusKm 徒歩10分想定で概ね0.8km
 * @returns [{ label, lat, lng, counts: { [categoryKey]: number } }]
 */
export function buildNearbyFacilityCounts(originPoints, categories, radiusKm = 0.8) {
  return originPoints
    .filter((o) => Number.isFinite(o.lat) && Number.isFinite(o.lng))
    .map((origin) => {
      const counts = {};
      for (const cat of categories) {
        counts[cat.key] = countWithinRadius(origin, cat.points, radiusKm);
      }
      return { label: origin.label, lat: origin.lat, lng: origin.lng, counts };
    });
}
