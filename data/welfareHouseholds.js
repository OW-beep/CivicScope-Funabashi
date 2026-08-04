// 生活保護（被保護世帯）の世帯人員別データ。
// CKAN(BODIK)のAPIからではなく、CSVファイルとして提供いただいたものを
// ビルド時に読み込む形ではなく、値を確認の上で静的なJSデータとして埋め込んでいます
// （行数が少なく、頻繁に更新されるデータでもないため）。
//
// 出典: 船橋市オープンデータカタログ「被保護世帯人員」
// https://data.bodik.jp/dataset/122041_hihogoseitaijinin/resource/461afacf-4128-4bbe-8999-31cfa8873d72
// （CC BY 4.0）

export const HOUSEHOLD_SIZE_LABELS = [
  "1人世帯",
  "2人世帯",
  "3人世帯",
  "4人世帯",
  "5人世帯",
  "6人世帯",
  "7人以上世帯"
];

// 年度表記は「平成26～30年度」「令和元～6年度」。CSV上は元号を省略した数字のみ
// （26, 27, ..., 30, 元, 2, ..., 6）だったため、読み間違いを避けてここでは
// 正式な年度表記に変換した上で保持している。
export const welfareHouseholdsData = [
  { label: "平成26年度", counts: [5169, 969, 305, 118, 32, 14, 10], total: 6617 },
  { label: "平成27年度", counts: [5273, 973, 300, 111, 33, 14, 9], total: 6713 },
  { label: "平成28年度", counts: [5397, 960, 286, 99, 34, 15, 11], total: 6802 },
  { label: "平成29年度", counts: [5576, 940, 295, 88, 30, 12, 12], total: 6953 },
  { label: "平成30年度", counts: [5677, 921, 288, 85, 25, 11, 12], total: 7019 },
  { label: "令和元年度", counts: [5810, 923, 285, 81, 23, 12, 11], total: 7145 },
  { label: "令和2年度", counts: [5915, 903, 269, 67, 26, 11, 14], total: 7205 },
  { label: "令和3年度", counts: [6103, 902, 255, 68, 24, 9, 13], total: 7374 },
  { label: "令和4年度", counts: [6207, 906, 243, 64, 28, 8, 15], total: 7471 },
  { label: "令和5年度", counts: [6267, 891, 240, 59, 27, 9, 17], total: 7510 },
  { label: "令和6年度", counts: [6324, 878, 223, 55, 32, 10, 15], total: 7537 }
];

// 年度ごとの合計世帯数の推移（折れ線グラフ用）
export function getTotalHouseholdsSeries() {
  return welfareHouseholdsData.map((row) => ({ label: row.label, total: row.total }));
}

// 最新年度の世帯人員別の内訳（棒グラフ用）
export function getLatestComposition() {
  const latest = welfareHouseholdsData[welfareHouseholdsData.length - 1];
  return {
    period: latest.label,
    data: HOUSEHOLD_SIZE_LABELS.map((label, i) => ({ label, count: latest.counts[i] }))
  };
}

// 「1人世帯」が全体に占める割合の推移（単身世帯の増加傾向を見るための切り口）
export function getSingleHouseholdShareSeries() {
  return welfareHouseholdsData.map((row) => ({
    label: row.label,
    total: row.total ? Number(((row.counts[0] / row.total) * 100).toFixed(1)) : null
  }));
}

export function buildWelfareInsights() {
  const series = getTotalHouseholdsSeries();
  if (series.length < 2) return null;
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const first = series[0];
  const diff = latest.total - previous.total;
  const rate = previous.total ? (diff / previous.total) * 100 : null;
  const longTermDiff = latest.total - first.total;
  const longTermRate = first.total ? (longTermDiff / first.total) * 100 : null;

  const shareSeries = getSingleHouseholdShareSeries();
  const latestShare = shareSeries[shareSeries.length - 1];
  const firstShare = shareSeries[0];

  return {
    latest,
    previous,
    diff,
    rate,
    first,
    longTermDiff,
    longTermRate,
    latestShare,
    firstShare
  };
}
