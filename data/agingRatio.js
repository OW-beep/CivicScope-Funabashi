// 船橋市オープンデータカタログ「65歳以上人口推移」より。
// 元データの年度表記が「12」「30」「元」「2」のように和暦の数字のみ（平成/令和のプレフィックスなし）
// で提供されており、CKANの汎用パーサーでは年度として正しく解釈できないため、
// ファイル内の並び順（古い年度→新しい年度）をそのまま信頼し、位置ベースで
// 「平成」「令和」のプレフィックスを補って静的データ化した。
// 総人口比率（高齢化率）が総人口・65歳以上人口から算出した値と一致することを検算済み。
//
// 出典: 船橋市オープンデータカタログ「65歳以上人口推移」（作成：高齢者福祉課）
// https://data.bodik.jp/dataset/122041_65saiijyoujinkousuii
export const agingRatioData = [
  { label: "平成12年度", total: 544910, over65: 66801, ratio: 12.3 },
  { label: "平成13年度", total: 546049, over65: 71561, ratio: 13.1 },
  { label: "平成14年度", total: 551916, over65: 76286, ratio: 13.8 },
  { label: "平成15年度", total: 556986, over65: 81157, ratio: 14.6 },
  { label: "平成16年度", total: 561126, over65: 85394, ratio: 15.2 },
  { label: "平成17年度", total: 563737, over65: 89902, ratio: 15.9 },
  { label: "平成18年度", total: 569750, over65: 95231, ratio: 16.7 },
  { label: "平成19年度", total: 576384, over65: 101106, ratio: 17.5 },
  { label: "平成20年度", total: 584152, over65: 106651, ratio: 18.3 },
  { label: "平成21年度", total: 590943, over65: 112449, ratio: 19.0 },
  { label: "平成22年度", total: 598213, over65: 116636, ratio: 19.5 },
  { label: "平成23年度", total: 601321, over65: 119131, ratio: 19.8 },
  { label: "平成24年度", total: 602996, over65: 123777, ratio: 20.5 },
  { label: "平成25年度", total: 615876, over65: 130367, ratio: 21.2 },
  { label: "平成26年度", total: 620389, over65: 135867, ratio: 21.9 },
  { label: "平成27年度", total: 624396, over65: 141207, ratio: 22.6 },
  { label: "平成28年度", total: 627816, over65: 145201, ratio: 23.1 },
  { label: "平成29年度", total: 632341, over65: 148203, ratio: 23.4 },
  { label: "平成30年度", total: 636539, over65: 150822, ratio: 23.7 },
  { label: "令和元年度", total: 640012, over65: 152661, ratio: 23.9 },
  { label: "令和2年度", total: 643971, over65: 154125, ratio: 23.9 },
  { label: "令和3年度", total: 645450, over65: 154947, ratio: 24.0 },
  { label: "令和4年度", total: 645972, over65: 155345, ratio: 24.0 }
];

export function getAgingRatioSeries() {
  return agingRatioData.map((row) => ({ label: row.label, total: row.ratio }));
}

export function buildAgingRatioInsights() {
  const rows = agingRatioData;
  const latest = rows[rows.length - 1];
  const previous = rows[rows.length - 2];
  const first = rows[0];
  return {
    latest,
    previous,
    first,
    diff: +(latest.ratio - previous.ratio).toFixed(1),
    longTermDiff: +(latest.ratio - first.ratio).toFixed(1)
  };
}
