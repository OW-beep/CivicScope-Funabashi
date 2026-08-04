// 国土地理院（GSI）の住所検索API（APIキー不要・利用回数無制限・無料）を使って、
// 施設の住所文字列から緯度経度を引き当てるためのユーティリティ。
//
// 出典: 国土地理院 地図・空中写真閲覧サービス 住所検索API
// https://msearch.gsi.go.jp/address-search/AddressSearch?q=住所
//
// 設計方針:
// ・fetchのnext.revalidateキャッシュに任せる（bodik.js/geo.jsと同じパターン）ため、
//   このファイル自体は状態を持たない。ビルド/ISR再生成のたびに再取得はされるが、
//   住所と座標の対応はほぼ変わらないため長め（30日）にキャッシュする。
// ・見つからない住所は憶測で座標を作らず、必ずnull/未掲載として扱う。
// ・船橋市の想定範囲から明らかに外れる結果（住所の取り違えなど）は除外する。

const GSI_ADDRESS_SEARCH_URL = "https://msearch.gsi.go.jp/address-search/AddressSearch";

// データセット側の住所が「本町一丁目3-5」のように市区町村名を省略している場合に備えた接頭辞。
const PREFECTURE_CITY_PREFIX = "千葉県船橋市";

// 船橋市＋隣接市を含む、やや広めのバウンディングボックス。
// これより外側の結果は、住所の誤解釈（同名地名の別市など）とみなして採用しない。
const BOUNDS = { latMin: 35.55, latMax: 35.82, lngMin: 139.85, lngMax: 140.15 };

function isWithinExpectedBounds(lat, lng) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= BOUNDS.latMin &&
    lat <= BOUNDS.latMax &&
    lng >= BOUNDS.lngMin &&
    lng <= BOUNDS.lngMax
  );
}

function buildCandidateAddresses(rawAddress) {
  const address = String(rawAddress || "").trim();
  if (!address) return [];

  const candidates = [address];
  if (!address.includes("船橋市") && !address.includes("千葉県")) {
    candidates.push(`${PREFECTURE_CITY_PREFIX}${address}`);
  }
  return candidates;
}

async function fetchGsiCandidates(address) {
  const url = `${GSI_ADDRESS_SEARCH_URL}?q=${encodeURIComponent(address)}`;

  let res;
  try {
    res = await fetch(url, {
      next: { revalidate: 60 * 60 * 24 * 30 }
    });
  } catch (e) {
    return [];
  }

  if (!res.ok) return [];

  try {
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch (e) {
    return [];
  }
}

// 1件の住所文字列を緯度経度に変換する。見つからない場合はnull（フォールバックの推測値は作らない）。
export async function geocodeAddress(rawAddress) {
  for (const candidate of buildCandidateAddresses(rawAddress)) {
    const results = await fetchGsiCandidates(candidate);

    for (const item of results) {
      const coords = item?.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) continue;

      const lng = Number(coords[0]);
      const lat = Number(coords[1]);
      if (!isWithinExpectedBounds(lat, lng)) continue;

      return { lat, lng };
    }
  }
  return null;
}

// 住所の重複を除いたうえで、少数ずつ並行してジオコーディングする
// （GSI側への配慮のため、同時実行数は控えめにする）。
export async function geocodeUniqueAddresses(addresses, { concurrency = 4 } = {}) {
  const unique = [...new Set((addresses || []).map((a) => String(a || "").trim()).filter(Boolean))];
  const resultMap = new Map();
  if (!unique.length) return resultMap;

  let cursor = 0;
  async function worker() {
    while (cursor < unique.length) {
      const current = unique[cursor];
      cursor += 1;
      try {
        resultMap.set(current, await geocodeAddress(current));
      } catch (e) {
        resultMap.set(current, null);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, unique.length) }, worker));
  return resultMap;
}

/**
 * レコード配列と、住所・名称・カテゴリの列名から、地図表示用の地点データを作る。
 * addressField/nameField/categoryField はlib/geo.jsのguessAddressField・guessNameField・
 * guessCategoryFieldで推測したものを渡す想定。
 *
 * addressFieldが無いデータセット（施設名に地名が埋め込まれているだけ、など）向けに、
 * deriveAddress(record) => 住所らしき文字列 というコールバックも指定できる。
 * addressFieldとderiveAddressの両方が指定された場合はderiveAddressを優先する。
 *
 * @returns { points, matched, total, unmatchedAddresses }
 *   points: [{ label, category, lat, lng }]（座標が見つかった分のみ）
 *   unmatchedAddresses: 座標化できなかった住所（デバッグ・透明性のため）
 */
export async function geocodeRecordsToPoints(
  records,
  { addressField, deriveAddress, nameField, categoryField, category } = {}
) {
  if ((!addressField && !deriveAddress) || !records?.length) {
    return { points: [], matched: 0, total: records?.length || 0, unmatchedAddresses: [] };
  }

  const getAddress = deriveAddress || ((r) => r[addressField]);
  const addresses = records.map(getAddress);
  const coordIndex = await geocodeUniqueAddresses(addresses);

  const points = [];
  const unmatchedAddresses = [];

  for (const r of records) {
    const address = String(getAddress(r) || "").trim();
    const coords = address ? coordIndex.get(address) : null;

    if (!coords) {
      if (address) unmatchedAddresses.push(address);
      continue;
    }

    points.push({
      label: nameField ? String(r[nameField] ?? "").trim() : "",
      category: category || (categoryField ? String(r[categoryField] ?? "").trim() : null),
      lat: coords.lat,
      lng: coords.lng
    });
  }

  return { points, matched: points.length, total: records.length, unmatchedAddresses };
}

// --- 施設名だけを頼りにした座標検索（Nominatim / OpenStreetMap） -------------------
//
// 住所欄が無く、施設名にも地名の手がかりが無いデータセット（例:「宮本第一保育園」）向け。
// GSIの住所検索APIは「住所」専用で施設名の検索には向かないため、OpenStreetMapの
// POI（施設）データも検索できるNominatimを使う。
//
// 出典・利用規約: Nominatim Usage Policy
// https://operations.osmfoundation.org/policies/nominatim/
// ・APIキー不要・無料。ただし「同時実行はせず、1リクエストずつ、間隔を空けて呼ぶ」
//   「利用者が特定できるUser-Agentを付ける」ことが利用規約で求められているため、
//   このサイト名を明記したUser-Agentを付け、リクエストを直列（1件ずつ）で送っている。
// ・OSM側のPOIデータ整備状況に左右されるため、GSIの住所検索より一致率は下がりうる。
const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_USER_AGENT = "civic-scope-funabashi/1.0 (+https://civic-scope-funabashi.vercel.app)";

async function searchPlaceByName(name, debugCollector) {
  const query = `${name} 船橋市 千葉県`;
  const url = `${NOMINATIM_SEARCH_URL}?format=jsonv2&limit=1&countrycodes=jp&q=${encodeURIComponent(query)}`;

  if (debugCollector) debugCollector.url = url;

  let res;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": NOMINATIM_USER_AGENT },
      next: { revalidate: 60 * 60 * 24 * 30 }
    });
  } catch (e) {
    if (debugCollector) debugCollector.fetchError = String(e);
    return null;
  }

  if (debugCollector) debugCollector.status = res.status;
  if (!res.ok) return null;

  try {
    const json = await res.json();
    if (debugCollector) debugCollector.rawResult = json;

    const first = Array.isArray(json) ? json[0] : null;
    if (!first) return null;

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!isWithinExpectedBounds(lat, lng)) {
      if (debugCollector) debugCollector.rejectedByBounds = { lat, lng };
      return null;
    }

    return { lat, lng };
  } catch (e) {
    if (debugCollector) debugCollector.parseError = String(e);
    return null;
  }
}

/**
 * 施設名だけを頼りに座標化し、地図表示用の地点データを作る。
 * Nominatimの利用規約に従い、リクエストは1件ずつ直列で送る（delayMsで間隔を調整）。
 * ビルド時（ISR再生成時）に一度だけ走る想定のため、多少時間がかかっても実用上の支障はない。
 *
 * @returns { points, matched, total, unmatchedAddresses, debugSample }
 *   debugSample: 最初の1件について、実際に投げたURL・HTTPステータス・生レスポンスを記録
 *   （0件マッチ時の原因切り分け用。原因が分かったら呼び出し側での表示は削除してよい）
 */
export async function geocodeRecordsByNameOnly(records, { nameField, categoryField, category, delayMs = 1100 } = {}) {
  if (!nameField || !records?.length) {
    return { points: [], matched: 0, total: records?.length || 0, unmatchedAddresses: [], debugSample: null };
  }

  const uniqueNames = [...new Set(records.map((r) => String(r[nameField] || "").trim()).filter(Boolean))];
  const coordIndex = new Map();
  let debugSample = null;

  for (let i = 0; i < uniqueNames.length; i += 1) {
    const name = uniqueNames[i];
    const collector = i === 0 ? { name } : null;
    try {
      coordIndex.set(name, await searchPlaceByName(name, collector));
    } catch (e) {
      coordIndex.set(name, null);
      if (collector) collector.unexpectedError = String(e);
    }
    if (collector) debugSample = collector;
    // Nominatimの利用規約（同時実行しない・間隔を空ける）を守るための意図的なウェイト。
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  const points = [];
  const unmatchedAddresses = [];

  for (const r of records) {
    const name = String(r[nameField] || "").trim();
    const coords = name ? coordIndex.get(name) : null;

    if (!coords) {
      if (name) unmatchedAddresses.push(name);
      continue;
    }

    points.push({
      label: name,
      category: category || (categoryField ? String(r[categoryField] ?? "").trim() : null),
      lat: coords.lat,
      lng: coords.lng
    });
  }

  return { points, matched: points.length, total: records.length, unmatchedAddresses, debugSample };
}
