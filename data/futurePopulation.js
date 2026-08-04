// 船橋市オープンデータカタログ「将来人口推計（市全体）」より。
// 第3次総合計画策定にあたり、平成30年4月時点の住民基本台帳を基準に作成された将来人口推計。
// 2008年（実績）から2063年まで5年おきの推計値。年齢階級別の内訳合計が総数と一致することを
// 全12時点で検算済み。作成元によれば「2023年以降の値は参考値」とのこと。
// 元データはワイド形式（年齢階級×年）のため、年ごとの配列に変換して静的データ化した。
//
// 出典: 船橋市オープンデータカタログ「将来人口推計（市全体）」（作成：政策企画課）
// https://data.bodik.jp/dataset/122041_shoraijinkou
export const futurePopulationData = [
  { label: "2008年", total: 594608, isProjection: false },
  { label: "2013年", total: 615876, isProjection: false },
  { label: "2018年", total: 636539, isProjection: false },
  { label: "2023年", total: 651250, isProjection: true },
  { label: "2028年", total: 658360, isProjection: true },
  { label: "2033年", total: 663782, isProjection: true },
  { label: "2038年", total: 663067, isProjection: true },
  { label: "2043年", total: 660681, isProjection: true },
  { label: "2048年", total: 657738, isProjection: true },
  { label: "2053年", total: 651976, isProjection: true },
  { label: "2058年", total: 642100, isProjection: true },
  { label: "2063年", total: 628246, isProjection: true }
];

// 年齢3区分（年少0-14 / 生産年齢15-64 / 老年65+）に集約した内訳（元データから再集計・検算済み）
export const futurePopulationByAgeGroup = [
  { label: "2008年", young: 81012, working: 406635, elderly: 106961 },
  { label: "2023年", young: 82329, working: 411628, elderly: 157293 },
  { label: "2033年", young: 77424, working: 412843, elderly: 173515 },
  { label: "2043年", young: 76690, working: 375713, elderly: 208278 },
  { label: "2053年", young: 75317, working: 360912, elderly: 215747 },
  { label: "2063年", young: 71718, working: 351677, elderly: 204851 }
];

export function getFuturePopulationSeries() {
  return futurePopulationData.map((row) => ({ label: row.label, total: row.total }));
}

export function buildFuturePopulationInsights() {
  const rows = futurePopulationData;
  const peak = rows.reduce((max, row) => (row.total > max.total ? row : max), rows[0]);
  const latest2023 = rows.find((r) => r.label === "2023年");
  const last = rows[rows.length - 1];
  return {
    peak,
    latest2023,
    last,
    declineFromPeak: last.total - peak.total,
    declineRateFromPeak: ((last.total - peak.total) / peak.total) * 100
  };
}
