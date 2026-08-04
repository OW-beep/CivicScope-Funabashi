// BODIK ODCS「(生活保護)被保護世帯、人員及び保護率の推移」より（作成：生活支援課）。
// datastore未対応（datastore active: False）のCSVアップロードのため、
// welfareHouseholds.jsと同様、値を確認の上で静的データとして保持している。
// 保護率（人口1,000人あたりの被保護人員）が人口・被保護人員から算出した値と
// 一致することを平成26年度〜令和6年度の全11年度で検算済み。
//
// 出典: https://data.bodik.jp/dataset/122041_hihogosetaijininhogoritu
export const protectionRateData = [
  { label: "平成26年度", population: 618929, households: 6617, persons: 8809, funabashi: 14.23, chiba: 11.8, national: 17.1 },
  { label: "平成27年度", population: 622987, households: 6713, persons: 8881, funabashi: 14.26, chiba: 12.0, national: 17.1 },
  { label: "平成28年度", population: 627112, households: 6802, persons: 8905, funabashi: 14.2, chiba: 12.1, national: 16.9 },
  { label: "平成29年度", population: 631883, households: 6953, persons: 8995, funabashi: 14.23, chiba: 12.2, national: 16.8 },
  { label: "平成30年度", population: 635993, households: 7019, persons: 9004, funabashi: 14.16, chiba: 12.3, national: 16.6 },
  { label: "令和元年度", population: 639267, households: 7145, persons: 9108, funabashi: 14.25, chiba: 12.4, national: 16.4 },
  { label: "令和2年度", population: 641367, households: 7205, persons: 9094, funabashi: 14.18, chiba: 12.52, national: 16.3 },
  { label: "令和3年度", population: 644263, households: 7374, persons: 9211, funabashi: 14.3, chiba: 12.73, national: 16.3 },
  { label: "令和4年度", population: 645728, households: 7471, persons: 9303, funabashi: 14.41, chiba: 12.85, national: 16.2 },
  { label: "令和5年度", population: 647056, households: 7510, persons: 9322, funabashi: 14.41, chiba: 12.98, national: 16.3 },
  { label: "令和6年度", population: 648375, households: 7537, persons: 9297, funabashi: 14.34, chiba: 13.02, national: 16.2 }
];

export function getProtectionRateSeries() {
  return protectionRateData.map((row) => ({ label: row.label, total: row.funabashi }));
}

export function buildProtectionRateInsights() {
  const rows = protectionRateData;
  const latest = rows[rows.length - 1];
  const first = rows[0];
  return {
    latest,
    first,
    diffFromChiba: +(latest.funabashi - latest.chiba).toFixed(2),
    diffFromNational: +(latest.funabashi - latest.national).toFixed(2),
    longTermDiff: +(latest.funabashi - first.funabashi).toFixed(2)
  };
}
