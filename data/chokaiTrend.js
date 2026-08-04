// 船橋市統計書「O 市民生活」O-11 町会・自治会の状況（各年4月1日現在）。
// /chokai ダッシュボードのメインデータ（BODIK ODCS）は現時点のスナップショットのみのため、
// 経年推移を補足する目的で、船橋市統計書PDFから作成した静的データを追加している。
// 出典: 船橋市統計書「O 市民生活」（資料：自治振興課）
// https://www.city.funabashi.lg.jp/shisei/toukei/002/p146613_d/fil/24O.pdf
export const chokaiTrendData = [
  { label: "令和3年", count: 885, households: 208356, halls: 298 },
  { label: "令和4年", count: 886, households: 207873, halls: 296 },
  { label: "令和5年", count: 888, households: 206854, halls: 297 },
  { label: "令和6年", count: 893, households: 206069, halls: 294 },
  { label: "令和7年", count: 905, households: 203717, halls: 292 }
];

export function getChokaiHouseholdSeries() {
  return chokaiTrendData.map((row) => ({ label: row.label, total: row.households }));
}

export function getChokaiCountSeries() {
  return chokaiTrendData.map((row) => ({ label: row.label, total: row.count }));
}

export function buildChokaiTrendInsights() {
  if (chokaiTrendData.length < 2) return null;
  const latest = chokaiTrendData[chokaiTrendData.length - 1];
  const first = chokaiTrendData[0];
  const previous = chokaiTrendData[chokaiTrendData.length - 2];
  return {
    latest,
    previous,
    first,
    householdDiff: latest.households - previous.households,
    householdLongTermDiff: latest.households - first.households,
    householdLongTermRate: first.households ? ((latest.households - first.households) / first.households) * 100 : null,
    countDiff: latest.count - previous.count
  };
}
