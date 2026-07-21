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

// 「〜自治会」「〜町会」「〜地区」のような接尾辞を除去してから再照合するための候補
const ORG_SUFFIX_RE = /(自治会|町会|地区|睦会|町内会)$/;

export function lookupTownCoordinates(townName, index) {
  if (!townName || !index) return null;
  if (index.exact.has(townName)) return index.exact.get(townName);

  const base = stripChome(townName);
  if (index.base.has(base)) return index.base.get(base);

  // 「◯◯町会」「◯◯自治会」のような組織名から接尾辞を外して再挑戦する
  if (ORG_SUFFIX_RE.test(townName)) {
    const stripped = townName.replace(ORG_SUFFIX_RE, "").trim();
    if (stripped) {
      if (index.exact.has(stripped)) return index.exact.get(stripped);
      const strippedBase = stripChome(stripped);
      if (index.base.has(strippedBase)) return index.base.get(strippedBase);
    }
  }

  return null;
}

// 「〜コード」「〜番号」「ID」のような識別子列は、名称ではなく符号なので
// 住所・カテゴリ列の推測候補からは除外する。
const CODE_LIKE_RE = /コード|code|番号|^id$|id$/i;

function excludeCodeLikeFields(fields) {
  return fields.filter((f) => !CODE_LIKE_RE.test(f));
}

// 住所らしき列をフィールド一覧からヒューリスティックに推測する。
// 「地区名」のような名称列を、「地区コード」のような識別子列より優先する。
const ADDRESS_FIELD_PATTERNS = [/所在地/, /住所/, /^address$/i, /町丁目/, /町名/, /地区名/, /地区/];

export function guessAddressField(fields, records) {
  const nameFields = excludeCodeLikeFields(fields);

  for (const pattern of ADDRESS_FIELD_PATTERNS) {
    const hit = nameFields.find((f) => pattern.test(f));
    if (hit) return hit;
  }
  const sample = records?.[0] || {};
  const candidate = nameFields.find((f) => typeof sample[f] === "string" && sample[f].includes("船橋市"));
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

// カテゴリ列をフィールド一覧からヒューリスティックに推測する（業種・地区など）。
// 「〜コード」列は名称ではないため避け、さらに実際の値を見て、
// 値が単純な数字（1, 2, 不明 など）ばかりの列は「コードらしき列」とみなして後回しにする。
// records を渡すと値の検証を行い、渡さない場合は列名だけで判定する。
function isMostlyNumericOrEmpty(records, field) {
  const samples = records
    .slice(0, 50)
    .map((r) => String(r[field] ?? "").trim())
    .filter(Boolean);
  if (!samples.length) return true;
  const numericCount = samples.filter((v) => /^[0-9０-９]+$/.test(v) || v === "不明").length;
  return numericCount / samples.length > 0.5;
}

export function guessCategoryField(fields, patterns, records = []) {
  const nameFields = excludeCodeLikeFields(fields);
  const orderedCandidates = [];
  for (const pattern of patterns) {
    for (const f of nameFields) {
      if (pattern.test(f) && !orderedCandidates.includes(f)) orderedCandidates.push(f);
    }
  }
  for (const pattern of patterns) {
    for (const f of fields) {
      if (pattern.test(f) && !orderedCandidates.includes(f)) orderedCandidates.push(f);
    }
  }

  if (!orderedCandidates.length) return null;
  if (!records.length) return orderedCandidates[0];

  // 値が実際にテキストらしい（数字コードだけではない）列を優先する。
  // 名称らしき列が一つも無く、コード列しか見つからない場合は、
  // 「1」「2」のような読めない値を表示するくらいならグラフ自体を出さない方がよいため null を返す。
  const textualField = orderedCandidates.find((f) => !isMostlyNumericOrEmpty(records, f));
  return textualField || null;
}

// 「洪水」「地震」「津波」のような、災害種別ごとの対応可否フラグ列を持つデータ
// （避難場所・避難所などでよく使われる標準的な形式）から、種別ごとの該当件数を集計する。
// 単一の「区分」列がコード化されていて読み取りにくい場合の、より有用な代替の切り口。
const HAZARD_KEYWORDS = [
  "洪水",
  "崖崩れ",
  "土石流",
  "地滑り",
  "高潮",
  "地震",
  "津波",
  "大規模な火事",
  "内水氾濫",
  "火山現象"
];

function isTruthyFlag(value) {
  const v = String(value ?? "").trim();
  return v === "1" || v === "○" || v === "◯" || v === "該当" || v === "有" || v.toLowerCase() === "true";
}

// 列名から、実際にマッチした災害種別キーワードだけを取り出す
// （例：「災害種別_津波」「対応_津波フラグ」→「津波」）。列名をそのまま表示すると
// 「災害種別_津波」のように読みにくくなるため、キーワード部分だけに整形する。
function extractHazardLabel(fieldName) {
  return HAZARD_KEYWORDS.find((h) => fieldName.includes(h)) || fieldName;
}

export function buildHazardBreakdown(fields, records) {
  const hazardFields = fields.filter((f) => HAZARD_KEYWORDS.some((h) => f.includes(h)));
  if (!hazardFields.length || !records.length) return [];

  return hazardFields
    .map((f) => ({ label: extractHazardLabel(f), count: records.filter((r) => isTruthyFlag(r[f])).length }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);
}

// 施設（1レコード）ごとに、対応している災害種別キーワードの一覧を取り出す。
// 地図上で「この災害種別に対応している施設だけを表示する」ような絞り込みに使う。
export function extractHazardTags(record, fields) {
  const hazardFields = fields.filter((f) => HAZARD_KEYWORDS.some((h) => f.includes(h)));
  return hazardFields.filter((f) => isTruthyFlag(record[f])).map((f) => extractHazardLabel(f));
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

// --- 緯度経度を直接持つ施設データ（避難所・避難場所など）向けのユーティリティ ------
// 町丁目単位の集計（aggregateByTown）よりも、施設が個別に緯度経度を持っている場合は
// そちらを使ったほうが正確な位置を示せるため、優先して利用する。

const LAT_FIELD_PATTERNS = [/緯度/, /^lat(itude)?$/i];
const LNG_FIELD_PATTERNS = [/経度/, /^lng$/i, /^lon(gitude)?$/i];
const NAME_FIELD_PATTERNS = [/施設名称/, /施設名/, /名称/, /^name$/i];

export function guessLatLngFields(fields) {
  const latField = fields.find((f) => LAT_FIELD_PATTERNS.some((p) => p.test(f)));
  const lngField = fields.find((f) => LNG_FIELD_PATTERNS.some((p) => p.test(f)));
  return latField && lngField ? { latField, lngField } : null;
}

export function guessNameField(fields) {
  const nameFields = excludeCodeLikeFields(fields);
  for (const pattern of NAME_FIELD_PATTERNS) {
    const hit = nameFields.find((f) => pattern.test(f));
    if (hit) return hit;
  }
  return nameFields[0] || fields[0] || null;
}

// レコードから緯度経度つきの地点データを作る（施設1件=地図上の1点）
export function extractPointsFromLatLng(records, { latField, lngField, nameField, categoryField, fields }) {
  const points = [];
  for (const r of records) {
    const lat = parseFloat(r[latField]);
    const lng = parseFloat(r[lngField]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    // 船橋市の大まかな範囲から外れる明らかな異常値（単位間違いなど）は除外する
    if (lat < 30 || lat > 40 || lng < 135 || lng > 145) continue;

    points.push({
      label: nameField ? String(r[nameField] ?? "").trim() : "",
      category: categoryField ? String(r[categoryField] ?? "").trim() : null,
      hazards: fields ? extractHazardTags(r, fields) : [],
      lat,
      lng
    });
  }
  return points;
}
