// 施設データの座標化を「ビルド時」ではなく「ローカルで一度だけ、事前に」実行するための
// スタンドアロンスクリプト。
//
// なぜこれが必要か（正直な経緯）:
// 以前はGSI/Nominatimへの座標化リクエストをNext.jsのgetStaticProps内（＝Vercelの
// ビルド時）で直接呼んでいたが、Vercelの静的ページ生成には1ページあたり60秒という
// タイムアウトがあり、Nominatimの「1件ずつ・間隔を空けて」という利用規約上の制約と、
// 米国リージョンから日本のAPIへ都度アクセスする通信時間が積み重なって、この60秒を
// 超えてしまい、ビルド全体が失敗する事態になった。
//
// そこで、座標化そのものは「データがほぼ変わらない」という前提のもと、このスクリプトを
// 手元のPCで実行して data/geocoded/*.json に結果を保存し、それをgitにコミットする方式に
// 変更した。Next.js側（pages/*.js）は、ビルド時にこのJSONファイルを読むだけになるため、
// 通信が発生せず、瞬時に終わる。
//
// 使い方:
//   node scripts/geocode-facilities.js
//   （施設が増えた・変わったときに、再度手元で実行してJSONを更新し、コミットし直す）

const fs = require("fs");
const path = require("path");

const BODIK_API_BASE = "https://data.bodik.jp";
const OUTPUT_DIR = path.join(__dirname, "..", "data", "geocoded");

// --- CKAN(BODIK)からのデータ取得 -------------------------------------------------

async function ckanAction(action, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${BODIK_API_BASE}/api/3/action/${action}${query ? `?${query}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CKAN API request failed: ${action} (${res.status})`);
  const json = await res.json();
  if (!json.success) throw new Error(`CKAN API returned an error for action: ${action}`);
  return json.result;
}

async function getDatasetRecords(packageId) {
  const pkg = await ckanAction("package_show", { id: packageId });
  const resource = (pkg.resources || []).find((r) => r.datastore_active) || pkg.resources?.[0];
  if (!resource || !resource.datastore_active) return { fields: [], records: [] };

  const result = await ckanAction("datastore_search", { resource_id: resource.id, limit: 2000 });
  return {
    fields: (result.fields || []).map((f) => f.id).filter((id) => id !== "_id"),
    records: result.records || []
  };
}

// --- lib/geo.js の簡易ヒューリスティックを、このスクリプト用に複製 -------------------
// (lib/*.js はES Modules構文でNext.js経由でしか読み込めないため、ここでは同じロジックを
//  そのまま複製している。ロジックを変えたときは両方に反映すること)

const CODE_LIKE_RE = /コード|code|番号|^id$|id$/i;
const ADDRESS_FIELD_PATTERNS = [/所在地/, /住所/, /^address$/i, /町丁目/, /町名/, /地区名/, /地区/];
const NAME_FIELD_PATTERNS = [/施設名称/, /施設名/, /名称/, /^name$/i];

function excludeCodeLikeFields(fields) {
  return fields.filter((f) => !CODE_LIKE_RE.test(f));
}

function guessAddressField(fields, records) {
  const nameFields = excludeCodeLikeFields(fields);
  for (const pattern of ADDRESS_FIELD_PATTERNS) {
    const hit = nameFields.find((f) => pattern.test(f));
    if (hit) return hit;
  }
  const sample = records?.[0] || {};
  const candidate = nameFields.find((f) => typeof sample[f] === "string" && sample[f].includes("船橋市"));
  return candidate || null;
}

function guessNameField(fields) {
  const nameFields = excludeCodeLikeFields(fields);
  for (const pattern of NAME_FIELD_PATTERNS) {
    const hit = nameFields.find((f) => pattern.test(f));
    if (hit) return hit;
  }
  return nameFields[0] || fields[0] || null;
}

function extractTownName(address) {
  if (!address) return null;
  let s = String(address).trim();
  s = s.replace(/^.*?船橋市/, "");
  const chomeMatch = s.match(/^([^\d0-9０-９\-−ー]+?[0-9０-９一二三四五六七八九十]+丁目)/);
  if (chomeMatch) return chomeMatch[1];
  const plainMatch = s.match(/^([^\d0-9０-９\-−ー]+)/);
  return plainMatch ? plainMatch[1].trim() : null;
}

// --- GSI（国土地理院）住所検索API：住所文字列 → 座標 -------------------------------

const GSI_ADDRESS_SEARCH_URL = "https://msearch.gsi.go.jp/address-search/AddressSearch";
const PREFECTURE_CITY_PREFIX = "千葉県船橋市";
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

async function geocodeAddressGSI(rawAddress) {
  for (const candidate of buildCandidateAddresses(rawAddress)) {
    const url = `${GSI_ADDRESS_SEARCH_URL}?q=${encodeURIComponent(candidate)}`;
    let res;
    try {
      res = await fetch(url);
    } catch (e) {
      continue;
    }
    if (!res.ok) continue;
    const results = await res.json().catch(() => []);
    for (const item of Array.isArray(results) ? results : []) {
      const coords = item?.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) continue;
      const lng = Number(coords[0]);
      const lat = Number(coords[1]);
      if (isWithinExpectedBounds(lat, lng)) return { lat, lng };
    }
  }
  return null;
}

async function geocodeUniqueAddressesGSI(addresses, { concurrency = 4 } = {}) {
  const unique = [...new Set(addresses.map((a) => String(a || "").trim()).filter(Boolean))];
  const result = new Map();
  let cursor = 0;
  async function worker() {
    while (cursor < unique.length) {
      const current = unique[cursor];
      cursor += 1;
      result.set(current, await geocodeAddressGSI(current));
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, unique.length) }, worker));
  return result;
}

// --- Nominatim（OpenStreetMap）：施設名 → 座標（住所欄が無いデータセット向け） -------
// 利用規約により、同時実行せず1件ずつ・間隔を空けてリクエストする。

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_USER_AGENT = "civic-scope-funabashi/1.0 (+https://civic-scope-funabashi.vercel.app)";

async function searchPlaceByNameNominatim(name) {
  const query = `${name} 船橋市 千葉県`;
  const url = `${NOMINATIM_SEARCH_URL}?format=jsonv2&limit=1&countrycodes=jp&q=${encodeURIComponent(query)}`;
  let res;
  try {
    res = await fetch(url, { headers: { "User-Agent": NOMINATIM_USER_AGENT } });
  } catch (e) {
    return null;
  }
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  const first = Array.isArray(json) ? json[0] : null;
  if (!first) return null;
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  return isWithinExpectedBounds(lat, lng) ? { lat, lng } : null;
}

async function geocodeByNameNominatim(records, nameField, delayMs = 1100) {
  const uniqueNames = [...new Set(records.map((r) => String(r[nameField] || "").trim()).filter(Boolean))];
  const coordIndex = new Map();
  for (let i = 0; i < uniqueNames.length; i += 1) {
    const name = uniqueNames[i];
    coordIndex.set(name, await searchPlaceByNameNominatim(name));
    process.stdout.write(`  Nominatim ${i + 1}/${uniqueNames.length}: ${name}\r`);
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  console.log("");
  return coordIndex;
}

// --- メイン処理 -------------------------------------------------------------------

function buildPoints(records, coordIndex, getKey, nameField, category) {
  const points = [];
  for (const r of records) {
    const key = String(getKey(r) || "").trim();
    const coords = key ? coordIndex.get(key) : null;
    if (!coords) continue;
    points.push({
      label: nameField ? String(r[nameField] ?? "").trim() : "",
      category,
      lat: coords.lat,
      lng: coords.lng
    });
  }
  return points;
}

function writeOutput(name, points) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(points, null, 2), "utf-8");
  console.log(`✓ ${name}: ${points.length}件を ${path.relative(process.cwd(), outPath)} に保存しました`);
}

async function processPlazas() {
  console.log("\n[広場] データ取得中...");
  const { fields, records } = await getDatasetRecords("122041_hiroba");
  if (!records.length) return writeOutput("plazas", []);

  const nameField = guessNameField(fields);
  console.log(`[広場] ${records.length}件。施設名から町丁目名を抽出してGSIで座標化します（並行4件）...`);
  const coordIndex = await geocodeUniqueAddressesGSI(records.map((r) => extractTownName(r[nameField])));
  const points = buildPoints(records, coordIndex, (r) => extractTownName(r[nameField]), nameField, "広場");
  writeOutput("plazas", points);
}

async function processFeaturedParks() {
  console.log("\n[特色のある公園] データ取得中...");
  const { fields, records } = await getDatasetRecords("122041_tokusyoku");
  if (!records.length) return writeOutput("featuredParks", []);

  const nameField = guessNameField(fields);
  console.log(`[特色のある公園] ${records.length}件。施設名でNominatim検索します（1件ずつ、時間がかかります）...`);
  const coordIndex = await geocodeByNameNominatim(records, nameField);
  const points = buildPoints(records, coordIndex, (r) => r[nameField], nameField, "公園");
  writeOutput("featuredParks", points);
}

async function processNursery() {
  console.log("\n[公立保育所] データ取得中...");
  const { fields, records } = await getDatasetRecords("122041_kourituhoikuseibijoukyou");
  if (!records.length) return writeOutput("publicNurseryFacilities", []);

  const nameField = guessNameField(fields);
  console.log(`[公立保育所] ${records.length}件。施設名でNominatim検索します（1件ずつ、時間がかかります）...`);
  const coordIndex = await geocodeByNameNominatim(records, nameField);
  const points = buildPoints(records, coordIndex, (r) => r[nameField], nameField, "公立保育所");
  writeOutput("publicNurseryFacilities", points);
}

async function processSeniorHousing() {
  console.log("\n[サービス付き高齢者向け住宅] データ取得中...");
  const { fields, records } = await getDatasetRecords("122041_koureijuutakuichiran");
  if (!records.length) return writeOutput("seniorHousingList", []);

  const addressField = guessAddressField(fields, records);
  const nameField = guessNameField(fields);
  if (!addressField) return writeOutput("seniorHousingList", []);

  console.log(`[サービス付き高齢者向け住宅] ${records.length}件。住所からGSIで座標化します（並行4件）...`);
  const coordIndex = await geocodeUniqueAddressesGSI(records.map((r) => r[addressField]));
  const points = buildPoints(records, coordIndex, (r) => r[addressField], nameField, "サ高住");
  writeOutput("seniorHousingList", points);
}

// --- 図書館 -------------------------------------------------------------------
// 船橋市立図書館はBODIKのデータセットが見当たらないため、市公式サイト
// （https://www.city.funabashi.lg.jp/shisetsu/toshokankominkan/）で確認した
// 施設名・住所を、ここに直接書いている（4館のみで変更が少ないため）。
const LIBRARIES = [
  { name: "中央図書館", address: "千葉県船橋市本町4丁目38番28号" },
  { name: "東図書館", address: "千葉県船橋市習志野台5丁目1番1号" },
  { name: "西図書館", address: "千葉県船橋市西船1-20-50" },
  { name: "北図書館", address: "千葉県船橋市二和東5丁目26番1号" }
];

async function processLibraries() {
  console.log("\n[図書館] 市公式サイトで確認した4館の住所をGSIで座標化します...");
  const coordIndex = await geocodeUniqueAddressesGSI(LIBRARIES.map((l) => l.address));
  const points = LIBRARIES.map((l) => {
    const coords = coordIndex.get(l.address.trim());
    return coords ? { label: l.name, category: "図書館", lat: coords.lat, lng: coords.lng } : null;
  }).filter(Boolean);
  writeOutput("libraries", points);
}

async function main() {
  console.log("施設の座標化を開始します（このスクリプトは手元のPCで実行してください。数分かかります）。\n");
  await processPlazas();
  await processFeaturedParks();
  await processNursery();
  await processSeniorHousing();
  await processLibraries();
  console.log("\n完了しました。data/geocoded/ 以下の変更をgitにコミットしてください。");
}

main().catch((e) => {
  console.error("エラーが発生しました:", e);
  process.exit(1);
});
