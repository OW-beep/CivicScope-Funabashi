// 住所文字列（例：「千葉県船橋市本町一丁目2-3」）から町丁目名を取り出し、
// Geolonia提供の住所データ（無料・CC BY 4.0）で緯度経度を引き当てて、
// 「町丁目ごとの件数」を地図上のバブルとして描画できる形に集計するためのユーティリティ。
//
// 出典: Geolonia 住所データ (https://github.com/geolonia/japanese-addresses)

const GEO_PREF = "千葉県";
const GEO_CITY = "船橋市";
const GEO_API_URL = `https://geolonia.github.io/japanese-addresses/api/ja/${encodeURIComponent(
  GEO_PREF
)}/${encodeURIComponent(GEO_CITY)}.json`;

const CHOME_SUFFIX_RE = /([0-9０-９]+|[一二三四五六七八九十]+)丁目$/;

function stripChome(town) {
  return town.replace(CHOME_SUFFIX_RE, "").trim();
}

// Geolonia APIから船橋市内の町丁目と緯度経度の対応表を取得する。
// 「exact」は丁目まで含めた完全一致、「base」は丁目を除いた町名の平均座標（フォールバック用）。
export async function getFunabashiTownIndex() {
  const res = await fetch(GEO_API_URL, {
    next: { revalidate: 60 * 60 * 24 * 30 } // 住所データはほぼ変わらないため30日キャッシュ
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch town coordinate index (${res.status})`);
  }

  const list = await res.json();
  const exact = new Map();
  const baseGroups = new Map();

  for (const item of list) {
    if (!item?.town || typeof item.lat !== "number" || typeof item.lng !== "number") continue;
    const town = item.town.trim();

    if (!exact.has(town)) {
      exact.set(town, { lat: item.lat, lng: item.lng });
    }

    const base = stripChome(town);
    if (!baseGroups.has(base)) baseGroups.set(base, []);
    baseGroups.get(base).push({ lat: item.lat, lng: item.lng });
  }

  const base = new Map();
  for (const [key, points] of baseGroups.entries()) {
    const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
    const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
    base.set(key, { lat, lng });
  }

  return { exact, base };
}

// 住所文字列から「船橋市」より後ろの、数字が出てくる直前までの町丁目名を抜き出す。
export function extractTownName(address) {
  if (!address) return null;
  let s = String(address).trim();
  s = s.replace(/^.*?船橋市/, "");

  const chomeMatch = s.match(/^([^\d0-9０-９\-−ー]+?[0-9０-９一二三四五六七八九十]+丁目)/);
  if (chomeMatch) return chomeMatch[1];

  const plainMatch = s.match(/^([^\d0-9０-９\-−ー]+)/);
  return plainMatch ? plainMatch[1].trim() : null;
}

export function lookupTownCoordinates(townName, index) {
  if (!townName || !index) return null;
  if (index.exact.has(townName)) return index.exact.get(townName);
  const base = stripChome(townName);
  if (index.base.has(base)) return index.base.get(base);
  return null;
}

// 住所らしき列をフィールド一覧からヒューリスティックに推測する
const ADDRESS_FIELD_PATTERNS = [/所在地/, /住所/, /^address$/i];

export function guessAddressField(fields, records) {
  for (const pattern of ADDRESS_FIELD_PATTERNS) {
    const hit = fields.find((f) => pattern.test(f));
    if (hit) return hit;
  }
  const sample = records?.[0] || {};
  const candidate = fields.find((f) => typeof sample[f] === "string" && sample[f].includes("船橋市"));
  return candidate || null;
}

// レコード配列を町丁目ごとに集計し、地図描画・ランキング表示に使える形にする
export function aggregateByTown(records, addressField, index) {
  const counts = new Map();
  let matched = 0;

  for (const r of records) {
    const town = extractTownName(r[addressField]);
    const coords = lookupTownCoordinates(town, index);
    if (!town || !coords) continue;

    matched += 1;
    if (!counts.has(town)) counts.set(town, { label: town, count: 0, ...coords });
    counts.get(town).count += 1;
  }

  return {
    points: Array.from(counts.values()).sort((a, b) => b.count - a.count),
    matched,
    total: records.length
  };
}

// 任意のカテゴリ列（業種・地区など）で単純集計する
export function aggregateByField(records, field) {
  const counts = new Map();
  for (const r of records) {
    const key = String(r[field] ?? "").trim() || "不明";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

// カテゴリ列をフィールド一覧からヒューリスティックに推測する（業種・種別など）
export function guessCategoryField(fields, patterns) {
  for (const pattern of patterns) {
    const hit = fields.find((f) => pattern.test(f));
    if (hit) return hit;
  }
  return null;
}

// 分布の自動コメント生成（独自性のある付加価値部分）
export function buildDistributionInsights(points, total) {
  if (!points?.length || !total) return null;
  const top = points[0];
  const top3 = points.slice(0, 3);
  const top3Sum = top3.reduce((s, p) => s + p.count, 0);

  return {
    top,
    topShare: (top.count / total) * 100,
    top3,
    top3Share: (top3Sum / total) * 100,
    areaCount: points.length
  };
}
