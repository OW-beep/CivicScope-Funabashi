// 船橋市の行政区域境界を、国土数値情報（国土交通省）をもとにGeoloniaが公開している
// GeoJSONエンドポイントから取得する。バブルマップの背景として、実際の市域の輪郭を
// 正確に描画するために使用する。
//
// 出典: 国土数値情報（行政区域データ）（国土交通省）を加工して作成
//       https://github.com/geolonia/japanese-admins （MIT License）
// 船橋市の全国地方公共団体コード: 12204（千葉県）

const FUNABASHI_PREF_CODE = "12";
const FUNABASHI_ADMIN_CODE = "12204";
const BOUNDARY_URL = `https://geolonia.github.io/japanese-admins/${FUNABASHI_PREF_CODE}/${FUNABASHI_ADMIN_CODE}.json`;

function extractExteriorRing(polygonCoordinates) {
  // GeoJSON Polygon の coordinates は [外周リング, 穴1, 穴2, ...] の配列。
  // 描画には外周（先頭）のリングのみを使う。
  if (!Array.isArray(polygonCoordinates) || !polygonCoordinates.length) return null;
  const exterior = polygonCoordinates[0];
  return Array.isArray(exterior) ? exterior : null;
}

function collectRingsFromGeometry(geometry, rings) {
  if (!geometry) return;
  if (geometry.type === "Polygon") {
    const ring = extractExteriorRing(geometry.coordinates);
    if (ring) rings.push(ring);
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates || []) {
      const ring = extractExteriorRing(polygon);
      if (ring) rings.push(ring);
    }
  }
}

// 船橋市の境界を [[ [lng,lat], [lng,lat], ... ], ... ] という
// リング（外周）の配列として取得する。
export async function getFunabashiBoundaryRings() {
  const res = await fetch(BOUNDARY_URL, {
    next: { revalidate: 60 * 60 * 24 * 30 } // 行政境界はほぼ変わらないため30日キャッシュ
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Funabashi boundary (${res.status})`);
  }

  const geo = await res.json();
  const rings = [];

  if (geo.type === "FeatureCollection") {
    for (const feature of geo.features || []) collectRingsFromGeometry(feature.geometry, rings);
  } else if (geo.type === "Feature") {
    collectRingsFromGeometry(geo.geometry, rings);
  } else {
    collectRingsFromGeometry(geo, rings);
  }

  return rings;
}

export function boundaryBounds(rings) {
  let latMin = Infinity;
  let latMax = -Infinity;
  let lngMin = Infinity;
  let lngMax = -Infinity;

  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      if (lat < latMin) latMin = lat;
      if (lat > latMax) latMax = lat;
      if (lng < lngMin) lngMin = lng;
      if (lng > lngMax) lngMax = lng;
    }
  }

  if (!Number.isFinite(latMin)) return null;
  return { latMin, latMax, lngMin, lngMax };
}
