// 検索結果に出さない記事（<meta name="robots" content="noindex,follow">、sitemap.xml からも除外）。
//
// 記事そのものは消していません。ダッシュボードや記事一覧からは、これまでどおり読めます。
// 理由：公開データの要約や、数字の掛け合わせが中心で、体験や手続きの説明など、このサイトならではの
// 付加価値が薄いため。サイト全体の「有用性」を、質の高い記事の割合で見てもらうための整理です。
//
// 内容を充実させて戻したい記事は、このリストから消してください（次のビルドで、検索対象に戻ります）。
// 表示回数・クリックがあった5本（population-growth-comparison-guide、centenarians-guide、
// fertility-and-aging-guide、library-collection-usage-guide、protection-rate-comparison-guide）は、
// 外さずに、内容の改善（体験コメント・手続きの説明の追加）で残す方針です。
export const noindexArticles = {
  "aging-protection-rate-cross-guide": "高齢化率と保護率の掛け合わせ。分析のための分析",
  "three-indicator-cross-analysis-guide": "3指標の掛け合わせ。分析のための分析",
  "establishment-size-daytime-cross-guide": "事業所規模と昼間人口の掛け合わせ。分析のための分析",
  "finance-peer-comparison-guide": "財政指標の他市比較。数字の要約が中心",
  "fertility-rate-comparison-guide": "出生率の他市比較。数字の要約が中心",
  "expenditure-category-shift-guide": "歳出区分の推移。数字の要約が中心",
  "under-65-population-guide": "65歳未満人口。計算で出した数字の紹介",
  "future-child-population-guide": "将来の子ども人口。推計値の要約",
  "job-offers-vs-placements-guide": "求人と就職の件数。数字の要約が中心",
  "bus-efficiency-guide": "バスの効率の数字。要約が中心",
  "teiki-commuter-ratio-guide": "定期券利用率。駅別データの要約",
  "teiki-recovery-guide": "乗車人員の回復。駅別データの要約",
  "gender-center-usage-guide": "施設の利用者数。数字の要約が中心",
  "e-post-requests-guide": "市民相談の件数。数字の要約が中心",
  "economic-census-guide": "経済センサスの数字の要約",
  "finance-household-budget-guide": "財政を家計に例えた説明。数字の要約が中心",
  "population-650k-milestone-guide": "人口65万人の節目。人口の最新記事と内容が重なる",
  "elementary-school-students-guide": "小学生の人数。数字の要約が中心",
  "school-basic-survey-guide": "学校基本調査の数字の要約",
  "funabashi-trivia-quiz": "クイズ。記事としての情報量が少ない"
};
