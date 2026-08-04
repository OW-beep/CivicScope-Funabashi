// 千葉県「令和2年国勢調査－人口等基本集計結果の概要（千葉県版）」（千葉県総合企画部統計課）より。
// 船橋市の人口増加数・人口密度を、県内の他市と比較するための静的データです。
// BODIK ODCSでも船橋市統計書でもなく、千葉県公式サイトが公表するPDFレポートから作成しています。
// 出典: 千葉県「令和2年国勢調査－人口等基本集計結果の概要（千葉県版）」（令和4年3月、千葉県総合企画部統計課）
// https://www.pref.chiba.lg.jp/toukei/toukeidata/kokuseichousa/r02/documents/r2-kokutyou-gaiyou.pdf

// 表1-2「千葉県の人口増加数上位5市町村の推移」より、船橋市の推移を抜粋。
// 国勢調査は5年に1度（各年10月1日時点）。値は「前回調査からの5年間の人口増加数（実数）」。
export const populationGrowthRankHistory = [
  { label: "平成17年（2005年）", rank: 3, increase: 19761, top: { name: "千葉市", increase: 37155 } },
  { label: "平成22年（2010年）", rank: 1, increase: 39205, top: { name: "船橋市", increase: 39205 } },
  { label: "平成27年（2015年）", rank: 1, increase: 13850, top: { name: "船橋市", increase: 13850 } },
  { label: "令和2年（2020年）", rank: 2, increase: 20017, top: { name: "流山市", increase: 25476 } }
];

// 表1-6「人口密度の高い上位5市町村の推移」より（令和2年、人/km2）
export const populationDensityComparison2020 = [
  { label: "浦安市", value: 9905.3 },
  { label: "市川市", value: 8645.4 },
  { label: "習志野市", value: 8402.3 },
  { label: "松戸市", value: 8117.2 },
  { label: "船橋市", value: 7508.8 }
];

// 参考1（市町村別・男女別人口、世帯数、人口密度等一覧）より、近隣市の基礎データ（令和2年）
export const neighborCityBasics2020 = [
  { label: "船橋市", population: 642907, increase: 20017, increaseRate: 3.2, density: 7508.8 },
  { label: "松戸市", population: 498232, increase: 14752, increaseRate: 3.1, density: 8117.2 },
  { label: "市川市", population: 496676, increase: 14944, increaseRate: 3.1, density: 8645.4 },
  { label: "柏市", population: 426468, increase: 12514, increaseRate: 3.0, density: 3716.8 },
  { label: "習志野市", population: 176197, increase: 8288, increaseRate: 4.9, density: 8402.3 },
  { label: "浦安市", population: 171362, increase: 7338, increaseRate: 4.5, density: 9905.3 }
];

export function buildGrowthRankInsights() {
  const rows = populationGrowthRankHistory;
  const latest = rows[rows.length - 1];
  const timesInTop2 = rows.filter((r) => r.rank <= 2).length;
  return { latest, timesInTop2, totalPeriods: rows.length };
}
