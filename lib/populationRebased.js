// 船橋市「毎月常住人口情報」（BODIKのデータセット）は、令和7年9月分で更新が止まっている。
// 令和7年10月分からは、基準が「令和7年国勢調査」に切り替わり、
// 市のホームページ「常住人口（人口の推移）」でのみ公開されているため、
// BODIKから取得できない期間の数字を、ここで補っている。
//
// 出典: 船橋市「常住人口（人口の推移）」（毎月1日現在、令和8年10月15日更新）
//   https://www.city.funabashi.lg.jp/shisei/toukei/003/p147157.html
//
// 補足:
// - 2026年8月は、市の表の人口が653,199人となっているが、同じ表の前月差（+72人）と
//   男女別の人数（男323,149人＋女331,050人＝654,199人）に合わないため、654,199人としている。
// - 新しい月が公表されたら、このリストの末尾に1行足す（日付が新しい行だけが追加される）。
export const populationRebasedSource = {
  label: "船橋市「常住人口（人口の推移）」",
  url: "https://www.city.funabashi.lg.jp/shisei/toukei/003/p147157.html"
};

export const populationRebased = [
  { y: 2025, m: 10, total: 651663, male: 322124, female: 329539 },
  { y: 2025, m: 11, total: 651687, male: 322118, female: 329569 },
  { y: 2025, m: 12, total: 651533, male: 321963, female: 329570 },
  { y: 2026, m: 1, total: 651409, male: 321849, female: 329560 },
  { y: 2026, m: 2, total: 651201, male: 321697, female: 329504 },
  { y: 2026, m: 3, total: 651304, male: 321736, female: 329568 },
  { y: 2026, m: 4, total: 652669, male: 322365, female: 330304 },
  { y: 2026, m: 5, total: 653828, male: 322982, female: 330846 },
  { y: 2026, m: 6, total: 653917, male: 322997, female: 330920 },
  { y: 2026, m: 7, total: 654127, male: 323111, female: 331016 },
  { y: 2026, m: 8, total: 654199, male: 323149, female: 331050 },
  { y: 2026, m: 9, total: 654175, male: 323065, female: 331110 },
  { y: 2026, m: 10, total: 654131, male: 323025, female: 331106 }
];

// ラベル（「令和7年9月」「2025年9月」「2025-09-01」など）から、年月を比較用の数値にする
function parseYearMonth(label) {
  const s = String(label ?? "");
  const era = s.match(/(令和|平成)\s*(元|\d+)年\s*(\d{1,2})月/);
  if (era) {
    const base = era[1] === "令和" ? 2018 : 1988;
    const n = era[2] === "元" ? 1 : parseInt(era[2], 10);
    return (base + n) * 12 + parseInt(era[3], 10);
  }
  const west = s.match(/(\d{4})\s*[年\-\/.]\s*(\d{1,2})/);
  if (west) return parseInt(west[1], 10) * 12 + parseInt(west[2], 10);
  return null;
}

function formatLabel(y, m, style) {
  if (style === "reiwa") return `令和${y - 2018}年${m}月`;
  return `${y}年${m}月`;
}

// 取得した月次系列の最後が、補う期間より前のときだけ、続きの月を足す。
// 最後のラベルの年月が読み取れないときは、何も足さない（誤った数字を混ぜないため）。
export function mergeRebasedPopulation(normalized) {
  if (!normalized || !Array.isArray(normalized.series) || normalized.series.length === 0) {
    return { normalized, rebasedFrom: null };
  }
  const series = normalized.series;
  const lastLabel = series[series.length - 1].label;
  const lastYm = parseYearMonth(lastLabel);
  if (lastYm === null) return { normalized, rebasedFrom: null };

  const style = /令和|平成/.test(String(lastLabel)) ? "reiwa" : "western";
  const extra = populationRebased
    .filter((row) => row.y * 12 + row.m > lastYm)
    .map((row) => ({
      label: formatLabel(row.y, row.m, style),
      total: row.total,
      male: row.male,
      female: row.female
    }));
  if (extra.length === 0) return { normalized, rebasedFrom: null };

  const first = populationRebased[0];
  return {
    normalized: { ...normalized, series: [...series, ...extra] },
    rebasedFrom: formatLabel(first.y, first.m, style)
  };
}
