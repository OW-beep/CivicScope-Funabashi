// 船橋市統計書「L 労働」L-1 一般職業紹介状況（船橋公共職業安定所管内：
// 船橋市・習志野市・八千代市・鎌ケ谷市・白井市）より。資料：千葉労働局。
// BODIK ODCSではなく船橋市公式サイトが公開するPDFから作成した静的データです。
// 出典: 船橋市統計書「L 労働」
// https://www.city.funabashi.lg.jp/shisei/toukei/002/p146613_d/fil/21L.pdf
// 船橋市統計書 一覧: https://www.city.funabashi.lg.jp/shisei/toukei/002/index.html
// 注：船橋市単独ではなく、船橋公共職業安定所管内（5市）の値である点に注意。
export const employmentData = [
  { label: "令和2年度", newSeekers: 28299, placements: 4747, newOffers: 37253, ratio: 0.69 },
  { label: "令和3年度", newSeekers: 28171, placements: 4903, newOffers: 39320, ratio: 0.66 },
  { label: "令和4年度", newSeekers: 27848, placements: 4596, newOffers: 41434, ratio: 0.73 },
  { label: "令和5年度", newSeekers: 27306, placements: 4709, newOffers: 41745, ratio: 0.75 },
  { label: "令和6年度", newSeekers: 26948, placements: 4692, newOffers: 41430, ratio: 0.78 }
];

export function getRatioSeries() {
  return employmentData.map((row) => ({ label: row.label, total: row.ratio }));
}
export function getNewOffersSeries() {
  return employmentData.map((row) => ({ label: row.label, total: row.newOffers }));
}
export function getNewSeekersSeries() {
  return employmentData.map((row) => ({ label: row.label, total: row.newSeekers }));
}

export function buildEmploymentInsights() {
  const rows = employmentData;
  if (rows.length < 2) return null;
  const latest = rows[rows.length - 1];
  const previous = rows[rows.length - 2];
  const first = rows[0];
  return {
    latest,
    previous,
    first,
    ratioDiff: +(latest.ratio - previous.ratio).toFixed(2),
    ratioLongTermDiff: +(latest.ratio - first.ratio).toFixed(2),
    seekersLongTermRate: first.newSeekers ? ((latest.newSeekers - first.newSeekers) / first.newSeekers) * 100 : null,
    offersLongTermRate: first.newOffers ? ((latest.newOffers - first.newOffers) / first.newOffers) * 100 : null
  };
}
