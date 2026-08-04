// 船橋市オープンデータカタログ「広場 詳細情報」（"いきいきふれあいマップ"掲載データ、
// 令和7年度末時点、作成：公園緑地課）から集計した要約統計。
// このデータセット自体（施設一覧）はダッシュボード側で getDatasetRecords() により
// 毎回最新版を自動取得・検索可能テーブルとして表示するが、集計値（合計面積・遊具の有無の
// 内訳・開設年代の分布など）はビルド時に都度計算するより、Pythonで一度検算した固定値を
// 記載する方が確実なため、静的データとして保持している。
// 出典: https://data.bodik.jp/dataset/122041_hiroba
export const plazaSummary = {
  count: 122,
  totalAreaM2: 32637.5,
  withToilet: 2,
  withEquipment: 56,
  withoutEquipment: 66,
  // 開設年（西暦）不明瞭な1件（データ上「明治33年1月0日」という入力エラーとみられる記載）を
  // 除いた実質的な最古・最新の広場
  oldest: { name: "藤原パンダ広場", year: 1956 },
  newest: { name: "高根町２号広場", year: 2025 },
  byDecade: [
    { label: "〜1959年", count: 2 },
    { label: "1960年代", count: 13 },
    { label: "1970年代", count: 14 },
    { label: "1980年代", count: 33 },
    { label: "1990年代", count: 13 },
    { label: "2000年代", count: 20 },
    { label: "2010年代", count: 20 },
    { label: "2020年代", count: 6 }
  ]
};
