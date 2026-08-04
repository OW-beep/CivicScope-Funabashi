// 船橋市オープンデータカタログ「出生統計:合計特殊出生率の年次推移」より。
// 厚生労働省人口動態調査の調査票情報を利用した、船橋市・千葉県・全国の合計特殊出生率の比較。
// 元データは「区分×年度」のワイド形式（年度が列）で提供されているため、年度ごとの配列に
// 変換して静的データ化した。全国の値が総務省・厚労省公表の既知の全国TFR
// （例: 平成30年1.42、令和2年1.33）と一致することを確認済み。
//
// 出典: 船橋市オープンデータカタログ「出生統計:合計特殊出生率の年次推移」（作成：保健総務課）
// https://data.bodik.jp/dataset/122041_goukeitokusyusyusseiritu
export const fertilityRateData = [
  { label: "平成19年", funabashi: 1.28, chiba: 1.25, national: 1.34 },
  { label: "平成20年", funabashi: 1.31, chiba: 1.29, national: 1.37 },
  { label: "平成21年", funabashi: 1.35, chiba: 1.31, national: 1.37 },
  { label: "平成22年", funabashi: 1.36, chiba: 1.34, national: 1.39 },
  { label: "平成23年", funabashi: 1.38, chiba: 1.31, national: 1.39 },
  { label: "平成24年", funabashi: 1.37, chiba: 1.31, national: 1.41 },
  { label: "平成25年", funabashi: 1.39, chiba: 1.33, national: 1.43 },
  { label: "平成26年", funabashi: 1.36, chiba: 1.32, national: 1.42 },
  { label: "平成27年", funabashi: 1.39, chiba: 1.38, national: 1.45 },
  { label: "平成28年", funabashi: 1.37, chiba: 1.35, national: 1.44 },
  { label: "平成29年", funabashi: 1.32, chiba: 1.34, national: 1.43 },
  { label: "平成30年", funabashi: 1.34, chiba: 1.34, national: 1.42 },
  { label: "令和元年", funabashi: 1.25, chiba: 1.28, national: 1.36 },
  { label: "令和2年", funabashi: 1.26, chiba: 1.27, national: 1.33 }
];

export function getFertilityRateSeries() {
  return fertilityRateData.map((row) => ({ label: row.label, total: row.funabashi }));
}

export function buildFertilityRateInsights() {
  const rows = fertilityRateData;
  const latest = rows[rows.length - 1];
  const first = rows[0];
  const peak = rows.reduce((max, row) => (row.funabashi > max.funabashi ? row : max), rows[0]);
  return {
    latest,
    first,
    peak,
    diffFromChiba: +(latest.funabashi - latest.chiba).toFixed(2),
    diffFromNational: +(latest.funabashi - latest.national).toFixed(2)
  };
}
