// 子どもの医療的支援に関する2つの給付事業の実績。
//
// 出典: 船橋市オープンデータカタログ
// 自立支援医療（育成医療）給付事業実績: https://data.bodik.jp/dataset/122041_jirituiryouikuseikyuufu
// 結核児童療育給付事業実績: https://data.bodik.jp/dataset/122041_kekkakujidouryouikukyuufu
//
// いずれもCKANのDataStoreに対応しておらず、生CSVファイルのみでの公開のため、
// 他のダッシュボードのようにAPI経由で自動取得できない。件数もごく少ない（7行）ため、
// 原典CSVを直接確認したうえで、ここに手動で転記している。
// データが更新されたら、原典を再確認してこの配列を更新すること。

// 自立支援医療（育成医療）: 先天性疾患等で手術等の治療を受ける児童への医療費助成の
// 給付者実績件数。
export const supportiveMedicalCareSeries = [
  { label: "2019年度", total: 73 },
  { label: "2020年度", total: 39 },
  { label: "2021年度", total: 52 },
  { label: "2022年度", total: 43 },
  { label: "2023年度", total: 32 },
  { label: "2024年度", total: 24 },
  { label: "2025年度", total: 30 }
];

export const supportiveMedicalCareSource = {
  label: "自立支援医療（育成医療）給付事業実績",
  url: "https://data.bodik.jp/dataset/122041_jirituiryouikuseikyuufu",
  description: "自立支援医療（育成医療）給付事業の給付者実績件数"
};

// 結核児童療育給付事業: 結核にかかった児童の療育給付。新規承認者数は、原典データが
// 存在する2019年度から2025年度まで、7年連続でゼロ件。
export const tuberculosisChildApprovals = {
  yearsLabel: "2019〜2025年度",
  allZero: true,
  source: {
    label: "結核児童療育給付事業実績",
    url: "https://data.bodik.jp/dataset/122041_kekkakujidouryouikukyuufu",
    description: "結核児童療育給付事業の新規承認者数"
  }
};
