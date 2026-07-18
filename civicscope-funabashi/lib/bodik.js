// BODIK ODCS（船橋市のオープンデータカタログ、CKANベース）からデータを取得するための
// 薄いクライアント。CSVの列名が将来変わっても壊れにくいよう、CKANの構造化データAPI
// （DataStore）をJSON経由で読み、列名はヒューリスティックに推測する設計にしています。

import { siteConfig } from "../data/siteConfig";

const API_BASE = siteConfig.bodik.apiBase;

async function ckanAction(action, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/api/3/action/${action}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    // Vercel/Next.jsのISR。オープンデータは頻繁には変わらないため1日キャッシュ。
    next: { revalidate: 60 * 60 * 24 }
  });

  if (!res.ok) {
    throw new Error(`BODIK API request failed: ${action} (${res.status})`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(`BODIK API returned an error for action: ${action}`);
  }
  return json.result;
}

// パッケージ（データセット）のメタ情報とリソース一覧を取得
export async function getPackage(packageId) {
  return ckanAction("package_show", { id: packageId });
}

// DataStoreが有効なリソースから構造化レコードを取得
export async function getDatastoreRecords(resourceId, { limit = 2000 } = {}) {
  const result = await ckanAction("datastore_search", {
    resource_id: resourceId,
    limit
  });
  return {
    fields: (result.fields || []).map((f) => f.id).filter((id) => id !== "_id"),
    records: result.records || []
  };
}

// パッケージIDから「DataStoreが有効な最初のリソース」を見つけてレコードを取得する
// 高レベルのヘルパー。個別データセットのresource_idを直書きしなくて済むようにする。
export async function getDatasetRecords(packageId, opts = {}) {
  const pkg = await getPackage(packageId);
  const resource = (pkg.resources || []).find((r) => r.datastore_active) || pkg.resources?.[0];

  if (!resource) {
    throw new Error(`No resource found for package: ${packageId}`);
  }

  if (!resource.datastore_active) {
    // DataStoreが無い場合はCSVへの直リンクのみ返す（フロントでの生パースはしない）
    return {
      fields: [],
      records: [],
      resourceUrl: resource.url,
      datastoreActive: false,
      metadata: pkg
    };
  }

  const { fields, records } = await getDatastoreRecords(resource.id, opts);
  return {
    fields,
    records,
    resourceUrl: resource.url,
    datastoreActive: true,
    metadata: pkg
  };
}

// 組織（船橋市）が公開しているデータセットの総数を取得
export async function getOrgDatasetCount(orgId) {
  const result = await ckanAction("package_search", {
    fq: `organization:${orgId}`,
    rows: 0
  });
  return result.count ?? null;
}

// --- 人口データの正規化 -----------------------------------------------
// 「毎月常住人口情報」のような列名は自治体・年度によって微妙に揺れることがあるため、
// 候補パターンにマッチする列を探して吸収する。

const DATE_FIELD_PATTERNS = [/年月日/, /年月/, /^date$/i, /調査日/, /基準日/];
const TOTAL_FIELD_PATTERNS = [/総数/, /合計/, /人口総数/, /計$/, /^total$/i];
const MALE_FIELD_PATTERNS = [/男/, /^male$/i];
const FEMALE_FIELD_PATTERNS = [/女/, /^female$/i];

function findField(fields, patterns) {
  for (const pattern of patterns) {
    const hit = fields.find((f) => pattern.test(f));
    if (hit) return hit;
  }
  return null;
}

function toNumber(value) {
  if (value === null || value === undefined) return null;
  const cleaned = String(value).replace(/[,，\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function normalizePopulationSeries({ fields, records }) {
  if (!fields.length || !records.length) return null;

  const dateField = findField(fields, DATE_FIELD_PATTERNS) || fields[0];
  const totalField = findField(fields, TOTAL_FIELD_PATTERNS);
  const maleField = findField(fields, MALE_FIELD_PATTERNS);
  const femaleField = findField(fields, FEMALE_FIELD_PATTERNS);

  // 総数列が見つからない場合、数値として解釈できる列のうち最大値のものを人口とみなす
  let resolvedTotalField = totalField;
  if (!resolvedTotalField) {
    const numericFields = fields.filter((f) => f !== dateField);
    let best = null;
    let bestMax = -Infinity;
    for (const f of numericFields) {
      const max = Math.max(...records.map((r) => toNumber(r[f]) ?? -Infinity));
      if (max > bestMax) {
        bestMax = max;
        best = f;
      }
    }
    resolvedTotalField = best;
  }

  const series = records
    .map((r) => ({
      label: String(r[dateField] ?? ""),
      total: toNumber(r[resolvedTotalField]),
      male: maleField ? toNumber(r[maleField]) : null,
      female: femaleField ? toNumber(r[femaleField]) : null
    }))
    .filter((row) => row.total !== null && row.label);

  // 日付らしき文字列でソート（YYYY-MM-DDやYYYY年M月などを緩く比較）
  series.sort((a, b) => (a.label > b.label ? 1 : a.label < b.label ? -1 : 0));

  if (!series.length) return null;

  return { series, dateField, totalField: resolvedTotalField, maleField, femaleField };
}

// 直近データから簡単な統計・コメントを自動生成する（独自性のある付加価値部分）
export function buildPopulationInsights(normalized) {
  if (!normalized || normalized.series.length < 2) return null;
  const { series } = normalized;
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const yearAgoIndex = series.length - 13; // 月次データを想定し、約12ヶ月前と比較
  const yearAgo = yearAgoIndex >= 0 ? series[yearAgoIndex] : series[0];

  const momDiff = latest.total - previous.total;
  const yoyDiff = latest.total - yearAgo.total;
  const yoyRate = yearAgo.total ? (yoyDiff / yearAgo.total) * 100 : null;

  const peak = series.reduce((max, row) => (row.total > max.total ? row : max), series[0]);
  const trough = series.reduce((min, row) => (row.total < min.total ? row : min), series[0]);

  return {
    latest,
    previous,
    momDiff,
    yoyDiff,
    yoyRate,
    peak,
    trough,
    rangeStart: series[0],
    rangeEnd: latest
  };
}
