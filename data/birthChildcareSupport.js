// 出産・子育て応援ギフト（国の出産・子育て応援交付金にもとづく、船橋市の給付事業）の
// 給付実績件数（件数であり、給付人数ではない）。
//
// 出典: 船橋市オープンデータカタログ「出産・子育て応援事業給付実績」
// https://data.bodik.jp/dataset/122041_syusankosodateouennkyuufu
//
// このデータセットはCKANのDataStoreに対応しておらず、生CSVファイルのみでの公開のため、
// 他のダッシュボードのようにAPI経由で自動取得できない。件数もごく少ない（4行）ため、
// 原典CSVを直接確認したうえで、ここに手動で転記している。
// データが更新されたら、原典を再確認してこの配列を更新すること。
//
// 注意（正直な前提）: 2025年度の件数（758件）は、原典データセットの最終更新日
// （2026年8月3日）から見て年度の途中である可能性が高く、他の年度と単純比較して
// 「大きく減った」と解釈するのは早計。原典に「年度途中」である旨の明記は無いため、
// 断定はしていない。
export const birthChildcareSupportGiftSeries = [
  { label: "2022年度", total: 7014 },
  { label: "2023年度", total: 8506 },
  { label: "2024年度", total: 8299 },
  { label: "2025年度", total: 758 }
];

export const birthChildcareSupportSource = {
  label: "出産・子育て応援事業給付実績",
  url: "https://data.bodik.jp/dataset/122041_syusankosodateouennkyuufu",
  description: "出産・子育て応援ギフトの給付実績件数（給付実績人数ではない）"
};
