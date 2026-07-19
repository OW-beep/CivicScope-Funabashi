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

// 和暦（令和・平成・昭和など）と西暦が混在していても正しい時系列順に並べ替えるための変換。
// 令和8年 = 2026年（2018 + 8）のように、各元号の「1年」が西暦何年にあたるかを起点として保持する。
const ERA_OFFSETS = [
  ["令和", 2018],
  ["平成", 1988],
  ["昭和", 1925],
  ["大正", 1911],
  ["明治", 1867]
];

// ラベル文字列（例:「令和8年度」「2026年5月」など）から比較可能な西暦年を取り出す
function parseEraYear(label) {
  if (!label) return null;
  const s = String(label);

  for (const [era, offset] of ERA_OFFSETS) {
    const idx = s.indexOf(era);
    if (idx === -1) continue;
    const rest = s.slice(idx + era.length);
    if (/^元/.test(rest)) return offset + 1;
    const numMatch = rest.match(/^([0-9０-９]+)/);
    if (numMatch) return offset + parseInt(numMatch[1].replace(/[０-９]/g, (c) => "０１２３４５６７８９".indexOf(c)), 10);
  }

  // 元号を含まない場合は西暦4桁を探す（例:「2026年5月」「2026-05-01」）
  const westernMatch = s.match(/(\d{4})/);
  if (westernMatch) return parseInt(westernMatch[1], 10);

  return null;
}

// 年度・年月などのラベル同士を時系列順に比較する（和暦・西暦どちらでも対応）
function compareTimeLabels(a, b) {
  const ya = parseEraYear(a);
  const yb = parseEraYear(b);
  if (ya !== null && yb !== null && ya !== yb) return ya - yb;
  // 年が同じ場合（または年が判定できない場合）は文字列としての自然順で比較する
  return String(a).localeCompare(String(b), "ja", { numeric: true });
}

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
  series.sort((a, b) => compareTimeLabels(a.label, b.label));

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

// --- 犬の登録・狂犬病予防注射データの正規化 ----------------------------
const REG_FIELD_PATTERNS = [/登録頭数/, /登録.*数/, /登録/];
const VAX_FIELD_PATTERNS = [/予防注射.*頭数/, /予防注射/, /接種.*数/, /注射/];

export function normalizeDogSeries({ fields, records }) {
  if (!fields.length || !records.length) return null;

  const dateField = findField(fields, DATE_FIELD_PATTERNS) || fields[0];
  const regField = findField(fields, REG_FIELD_PATTERNS);
  const vaxField = findField(fields, VAX_FIELD_PATTERNS);

  if (!regField || !vaxField || regField === vaxField) return null;

  const series = records
    .map((r) => ({
      label: String(r[dateField] ?? ""),
      registered: toNumber(r[regField]),
      vaccinated: toNumber(r[vaxField])
    }))
    .filter((row) => row.registered !== null && row.vaccinated !== null && row.label);

  series.sort((a, b) => compareTimeLabels(a.label, b.label));

  if (!series.length) return null;

  const withRate = series.map((row) => ({
    ...row,
    rate: row.registered ? (row.vaccinated / row.registered) * 100 : null
  }));

  return { series: withRate, dateField, regField, vaxField };
}

export function buildDogInsights(normalized) {
  if (!normalized || normalized.series.length === 0) return null;
  const { series } = normalized;
  const latest = series[series.length - 1];
  const previous = series.length > 1 ? series[series.length - 2] : null;

  return {
    latest,
    previous,
    rateDiff: previous && previous.rate !== null ? latest.rate - previous.rate : null,
    seriesLength: series.length
  };
}

// --- 年次データ向けの汎用インサイト（年度別乳児数など、1行=1年のデータ用） -------
// normalizePopulationSeriesは月次データを前提に「13行前」を前年同月として比較するため、
// 年次データ（1行=1年度）には使えない。こちらは単純に「直前の行」を前期間として比較する。
export function buildAnnualSeriesInsights(series, valueKey = "total") {
  if (!series || series.length < 2) return null;
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const diff = latest[valueKey] - previous[valueKey];
  const rate = previous[valueKey] ? (diff / previous[valueKey]) * 100 : null;
  return { latest, previous, diff, rate };
}

// --- 年齢別人口データの正規化 -------------------------------------------
// 「児童の年齢別人口」のような、1行=1年齢のカテゴリ別データを扱う。
// 年度のような日付列がある場合は、最新年度のデータだけを抜き出してスナップショットにする。
const AGE_FIELD_PATTERNS = [/年齢/, /^age$/i];
const AGE_VALUE_PATTERNS = [/人数/, /人口/, /数$/, /^count$/i];
// 「合計」「総数」など、個別の年齢ではなく集計行を示すラベルは年齢分布から除外する
const AGGREGATE_LABEL_RE = /^(合計|総数|計|小計|不詳|総計)$/;

export function normalizeAgeDistribution({ fields, records }) {
  if (!fields.length || !records.length) return null;

  const ageField = findField(fields, AGE_FIELD_PATTERNS);
  if (!ageField) return null;

  const dateField = findField(
    fields.filter((f) => f !== ageField),
    DATE_FIELD_PATTERNS
  );

  const candidateValueFields = fields.filter((f) => f !== ageField && f !== dateField);
  const valueField = findField(candidateValueFields, AGE_VALUE_PATTERNS) || candidateValueFields[0];
  if (!valueField) return null;

  // 年齢の「合計」行を除いた実レコードのみを対象にする
  const cleanedRecords = records.filter((r) => !AGGREGATE_LABEL_RE.test(String(r[ageField] ?? "").trim()));

  let rows = cleanedRecords;
  let latestPeriodLabel = null;
  let yearlyTotals = [];

  if (dateField) {
    const periodLabels = Array.from(new Set(cleanedRecords.map((r) => String(r[dateField] ?? "")).filter(Boolean)));
    periodLabels.sort(compareTimeLabels);
    latestPeriodLabel = periodLabels.length ? periodLabels[periodLabels.length - 1] : null;

    if (latestPeriodLabel) {
      rows = cleanedRecords.filter((r) => String(r[dateField] ?? "") === latestPeriodLabel);
    }

    // 複数年度分のデータがある場合は、年度ごとの合計人数の推移も算出する（多角的な分析用）
    if (periodLabels.length > 1) {
      yearlyTotals = periodLabels.map((label) => {
        const total = cleanedRecords
          .filter((r) => String(r[dateField] ?? "") === label)
          .reduce((s, r) => s + (toNumber(r[valueField]) || 0), 0);
        return { label, total };
      });
    }
  }

  const distribution = rows
    .map((r) => ({
      label: String(r[ageField] ?? "").trim(),
      value: toNumber(r[valueField])
    }))
    .filter((row) => row.value !== null && row.label);

  distribution.sort((a, b) => {
    const an = parseInt(a.label, 10);
    const bn = parseInt(b.label, 10);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
    return a.label.localeCompare(b.label, "ja");
  });

  if (!distribution.length) return null;

  return { distribution, ageField, valueField, dateField, latestPeriodLabel, yearlyTotals };
}

export function buildAgeDistributionInsights(normalized) {
  if (!normalized || !normalized.distribution.length) return null;
  const { distribution } = normalized;
  const total = distribution.reduce((s, r) => s + r.value, 0);
  const top = distribution.reduce((max, r) => (r.value > max.value ? r : max), distribution[0]);
  return {
    total,
    top,
    topShare: total ? (top.value / total) * 100 : null,
    count: distribution.length
  };
}

// 年齢を「未就学児」「小学生」など、生活・就学ステージ単位でまとめ直す。
// 単純な年齢別の棒グラフに加えて、保育・教育計画などの文脈で読みやすい切り口を提供する。
const LIFE_STAGES = [
  { label: "未就学児（0〜5歳）", min: 0, max: 5 },
  { label: "小学生（6〜11歳）", min: 6, max: 11 },
  { label: "中学生（12〜14歳）", min: 12, max: 14 },
  { label: "高校生世代（15〜17歳）", min: 15, max: 17 },
  { label: "18歳以上", min: 18, max: 120 }
];

export function buildLifeStageBreakdown(distribution) {
  if (!distribution?.length) return [];

  const numericRows = distribution
    .map((r) => ({ age: parseInt(r.label, 10), value: r.value }))
    .filter((r) => !Number.isNaN(r.age));

  if (!numericRows.length) return [];

  return LIFE_STAGES.map((stage) => {
    const count = numericRows
      .filter((r) => r.age >= stage.min && r.age <= stage.max)
      .reduce((s, r) => s + r.value, 0);
    return { label: stage.label, count };
  }).filter((stage) => stage.count > 0);
}

