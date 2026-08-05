// BODIK ODCS（船橋市のオープンデータカタログ、CKANベース）からデータを取得するための
// 薄いクライアント。CSVの列名が将来変わっても壊れにくいよう、CKANの構造化データAPI
// （DataStore）をJSON経由で読み、列名はヒューリスティックに推測する設計にしています。
//
// BODIK以外のCKANサイト（例：AEDデータが載っている別カタログ）にも対応できるよう、
// 各関数は第2引数で apiBase を上書きできます。省略時は船橋市のBODIK ODCSを使います。

import { siteConfig } from "../data/siteConfig";

const DEFAULT_API_BASE = siteConfig.bodik.apiBase;

async function ckanAction(action, params = {}, apiBase = DEFAULT_API_BASE) {
  const query = new URLSearchParams(params).toString();
  const url = `${apiBase}/api/3/action/${action}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    // Vercel/Next.jsのISR。オープンデータは頻繁には変わらないため1日キャッシュ。
    next: { revalidate: 60 * 60 * 24 }
  });

  if (!res.ok) {
    throw new Error(`CKAN API request failed: ${action} (${res.status})`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(`CKAN API returned an error for action: ${action}`);
  }
  return json.result;
}

// パッケージ（データセット）のメタ情報とリソース一覧を取得
export async function getPackage(packageId, apiBase = DEFAULT_API_BASE) {
  return ckanAction("package_show", { id: packageId }, apiBase);
}

// DataStoreが有効なリソースから構造化レコードを取得
export async function getDatastoreRecords(resourceId, { limit = 2000, apiBase = DEFAULT_API_BASE } = {}) {
  const result = await ckanAction("datastore_search", { resource_id: resourceId, limit }, apiBase);
  return {
    fields: (result.fields || []).map((f) => f.id).filter((id) => id !== "_id"),
    records: result.records || []
  };
}

// パッケージIDから「DataStoreが有効な最初のリソース」を見つけてレコードを取得する
// 高レベルのヘルパー。個別データセットのresource_idを直書きしなくて済むようにする。
export async function getDatasetRecords(packageId, opts = {}) {
  const apiBase = opts.apiBase || DEFAULT_API_BASE;
  const pkg = await getPackage(packageId, apiBase);
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

  const { fields, records } = await getDatastoreRecords(resource.id, { ...opts, apiBase });
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

// 「病児保育利用者数」など一部のデータセットで、元データ（船橋市/BODIK側）の文字コード
// 変換ミスと見られる文字化け（ハングルなど、日本語の年度表記に本来出るはずのない文字）が
// 混ざっているケースがある。こちら側では元データを直せないため、せめて読める形に
// 自動修復する：日本語として想定外の文字（ハングル等）が混ざっていたら、
// ラベルから数字だけを抽出し「27年度」のように組み直す（和暦の元号までは復元できないため、
// 何年生まれの元号かは断定しない）。
const UNEXPECTED_SCRIPT_RE = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/; // ハングル(音節・字母・互換字母)

const KANJI_DIGITS = { 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };

// 「元」「七」「十二」のような和暦でよく使う漢数字表記を、数値に変換する
// （西暦4桁のような複雑な数字は対象外。和暦の年数（だいたい1〜40程度）だけを想定）
function kanjiNumeralToNumber(kanji) {
  if (!kanji) return null;
  if (kanji === "元") return 1;
  if (KANJI_DIGITS[kanji] !== undefined) return KANJI_DIGITS[kanji];
  if (kanji.includes("十")) {
    const [tensPart, onesPart] = kanji.split("十");
    const tens = tensPart ? KANJI_DIGITS[tensPart] ?? 1 : 1;
    const ones = onesPart ? KANJI_DIGITS[onesPart] ?? 0 : 0;
    return tens * 10 + ones;
  }
  return null;
}

// rawLabelを読める形に直す。lastNumberは直前の行から復元できた数値（無ければnull）で、
// 数字も漢数字も一切復元できない場合の最終手段として「直前+1」を使う
// （このデータセットは年度ごとの連続した行のため、妥当な推定になる）。
function sanitizeLabel(rawLabel, lastNumber) {
  const label = String(rawLabel ?? "");
  if (!UNEXPECTED_SCRIPT_RE.test(label)) return { label, number: null };

  const digits = label.match(/[0-9０-９]+/g);
  if (digits && digits.length) {
    const num = Number(digits.join("").replace(/[０-９]/g, (c) => "０１２３４５６７８９".indexOf(c)));
    return { label: `${digits.join("")}年度`, number: Number.isFinite(num) ? num : null };
  }

  const kanjiMatch = label.match(/[零一二三四五六七八九十元]+/);
  const kanjiNum = kanjiMatch ? kanjiNumeralToNumber(kanjiMatch[0]) : null;
  if (kanjiNum != null) return { label: `${kanjiNum}年度`, number: kanjiNum };

  if (lastNumber != null) return { label: `${lastNumber + 1}年度`, number: lastNumber + 1 };

  return { label: "年度不明", number: null };
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

  const series = [];
  let lastNumber = null;
  for (const r of records) {
    const { label, number } = sanitizeLabel(r[dateField], lastNumber);
    if (number != null) lastNumber = number;
    const total = toNumber(r[resolvedTotalField]);
    if (total === null || !label) continue;
    series.push({
      label,
      total,
      male: maleField ? toNumber(r[maleField]) : null,
      female: femaleField ? toNumber(r[femaleField]) : null
    });
  }

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
const AGGREGATE_LABEL_RE = /(合計|総数|総計|小計|不詳|全体|全市)/;

// 「◯◯計」（例：「学校計」「中学校計」）のように、末尾が「計」で終わる行は
// 個別の名称ではなく集計行であることが多いため、部分一致ではなく
// 「末尾が計で終わるか」で広めに判定する。空欄の行も集計・見出し行とみなして除外する。
function isAggregateLabel(label) {
  const trimmed = String(label ?? "").trim();
  if (!trimmed) return true;
  if (trimmed.endsWith("計")) return true;
  return AGGREGATE_LABEL_RE.test(trimmed);
}

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
  const cleanedRecords = records.filter((r) => !isAggregateLabel(r[ageField]));

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

// --- 「名称＋数値」の一覧データ向けの汎用正規化 ---------------------------
// 「市立中学校生徒数一覧」のように、1行=1施設・1カテゴリの名称と数値のペアになっている
// データセットを、ランキング表示できる {label, value} の配列に変換する。
export function normalizeNameValueList({ fields, records }, { namePatterns, valuePatterns }) {
  if (!fields.length || !records.length) return null;

  const nameField = findField(fields, namePatterns);
  if (!nameField) return null;

  const candidateValueFields = fields.filter((f) => f !== nameField);
  const valueField = findField(candidateValueFields, valuePatterns) || candidateValueFields[0];
  if (!valueField) return null;

  let list = records
    .map((r) => ({
      label: String(r[nameField] ?? "").trim(),
      value: toNumber(r[valueField])
    }))
    .filter((row) => row.value !== null && row.label && !isAggregateLabel(row.label));

  list.sort((a, b) => b.value - a.value);

  // 名称だけでは合計行かどうか判別できないケースへの保険。
  // 最大値の行が、それ以外の全行の合計とほぼ一致する（＝内訳の総和になっている）場合は、
  // 個別の項目ではなく合計行とみなして取り除く。
  if (list.length > 2) {
    const restSum = list.slice(1).reduce((s, r) => s + r.value, 0);
    if (restSum > 0 && list[0].value >= restSum * 0.9 && list[0].value <= restSum * 1.1) {
      list = list.slice(1);
    }
  }

  if (!list.length) return null;

  return { list, nameField, valueField };
}

export function buildNameValueInsights(normalized) {
  if (!normalized || !normalized.list.length) return null;
  const { list } = normalized;
  const total = list.reduce((s, r) => s + r.value, 0);
  const top = list[0];
  return {
    total,
    top,
    topShare: total ? (top.value / total) * 100 : null,
    count: list.length
  };
}

// --- 保育施設数及び定員数の推移の正規化 ----------------------------------
// 「年度、[施設数,定員数,入所児童数,待機数]×5カテゴリ、[施設数,定員数,入所児童数,待機数]（合計）」
// という25列の固定レイアウト。カテゴリ名はShift_JIS由来の文字化けで自動判定が難しいため、
// 列の「位置」で機械的に区切る方式にしている（内訳合計＝合計列であることをPythonで検算済み）。
const CHILDCARE_CATEGORY_LABELS = [
  "保育所（公立）",
  "保育所（民間）",
  "認定こども園",
  "小規模保育事業",
  "事業所内保育事業"
];
const CHILDCARE_METRICS = ["facilities", "capacity", "enrolled", "waiting"];

export function normalizeChildcareCapacity({ fields, records }) {
  if (fields.length < 25 || !records.length) return null;

  const dateField = fields[0];

  const readBlock = (row, startIdx) => {
    const block = {};
    CHILDCARE_METRICS.forEach((metric, i) => {
      block[metric] = toNumber(row[fields[startIdx + i]]);
    });
    return block;
  };

  const series = records
    .map((row) => {
      const categories = {};
      CHILDCARE_CATEGORY_LABELS.forEach((label, i) => {
        categories[label] = readBlock(row, 1 + i * 4);
      });
      return {
        label: String(row[dateField] ?? ""),
        categories,
        total: readBlock(row, 1 + CHILDCARE_CATEGORY_LABELS.length * 4)
      };
    })
    .filter((row) => row.label && row.total.facilities !== null);

  series.sort((a, b) => compareTimeLabels(a.label, b.label));

  if (!series.length) return null;
  return { series };
}

export function buildChildcareInsights(normalized) {
  if (!normalized || normalized.series.length < 2) return null;
  const { series } = normalized;
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const first = series[0];

  const diff = (key) => latest.total[key] - previous.total[key];
  const longTermDiff = (key) => latest.total[key] - first.total[key];
  const longTermRate = (key) =>
    first.total[key] ? ((latest.total[key] - first.total[key]) / first.total[key]) * 100 : null;

  return {
    latest,
    previous,
    first,
    capacityDiff: diff("capacity"),
    enrolledDiff: diff("enrolled"),
    waitingDiff: diff("waiting"),
    capacityLongTermRate: longTermRate("capacity"),
    facilitiesLongTermDiff: longTermDiff("facilities"),
    waitingLongTermDiff: longTermDiff("waiting")
  };
}

