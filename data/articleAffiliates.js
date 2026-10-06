// 各記事の末尾に表示する「関連グッズ（PR）」枠のキーワード対応表。
// 記事のテーマに素直に関連するものだけを選ぶ（無関係な商品は載せない）。
// keyword は楽天市場・Amazonの検索キーワードとして使う（楽天は1件、Amazonは検索結果へのリンク）。
// 記事を追加したら、ここにも1行足す。未登録のslugはタグ別のデフォルトが使われる。

const STATS_BOOK = { heading: "データの読み方を学べる本", keyword: "統計学 入門 データ分析" };
const PASS_CASE = { heading: "毎日の通勤・通学に", keyword: "パスケース 定期入れ" };
const PICNIC = { heading: "お出かけのお供に", keyword: "レジャーシート ピクニック" };
const SENIOR = { heading: "シニア世代の暮らしに", keyword: "高齢者 見守り" };
const BOUSAI = { heading: "いざという時の備えに", keyword: "防災セット 避難リュック" };
const KAKEIBO = { heading: "家計の見直しに", keyword: "家計簿" };
const LOCAL_GIFT = { heading: "船橋・千葉のご当地もの", keyword: "千葉 ご当地 お土産" };

const bySlug = {
  "funassyi-profile-guide": { heading: "船橋といえば", keyword: "ふなっしー グッズ" },
  "funabashi-3min-primer": LOCAL_GIFT,
  "population-data-guide": STATS_BOOK,
  "population-growth-comparison-guide": STATS_BOOK,
  "population-650k-milestone-guide": STATS_BOOK,
  "population-dynamics-2026-guide": STATS_BOOK,
  "future-child-population-guide": { heading: "子育て・学びに", keyword: "育児 便利グッズ" },
  "future-population-peak-guide": STATS_BOOK,
  "funabashi-faq-guide": STATS_BOOK,
  "what-is-open-data-funabashi": { heading: "データ活用を始めたい方に", keyword: "データ分析 入門 Excel" },
  "how-to-use-estat-guide": { heading: "データ活用を始めたい方に", keyword: "データ分析 入門 Excel" },
  "chokai-halls-guide": { heading: "地域の集まりに", keyword: "町内会 回覧板" },
  "chokai-membership-guide": { heading: "地域の防犯・防災の備えに", keyword: "防犯 グッズ 家庭用" },
  "chokai-directory-guide": { heading: "地域の集まりに", keyword: "町内会 回覧板" },
  "food-business-directory-guide": { heading: "船橋のおいしいものをお取り寄せ", keyword: "千葉 グルメ お取り寄せ" },
  "dog-registration-guide": { heading: "愛犬の迷子対策に", keyword: "犬 迷子札" },
  "evacuation-map-guide": BOUSAI,
  "public-safety-dashboard-guide": BOUSAI,
  "aed-locations-guide": { heading: "ご家庭の備えに", keyword: "救急セット 家庭用" },
  "fire-statistics-guide": { heading: "火災への備えに", keyword: "住宅用火災警報器" },
  "phone-fraud-damage-guide": { heading: "電話詐欺の対策に", keyword: "迷惑電話防止 電話機" },
  "traffic-accident-trend-guide": { heading: "安全運転の備えに", keyword: "ドライブレコーダー" },
  "junior-high-school-students-guide": { heading: "中学生の学習に", keyword: "中学生 参考書" },
  "school-basic-survey-guide": { heading: "学びのお供に", keyword: "中学生 参考書" },
  "school-lunch-fee-free-guide": { heading: "お弁当の日に", keyword: "お弁当箱 子供" },
  "childcare-guide": { heading: "保育園の準備に", keyword: "保育園 入園 グッズ" },
  "is-funabashi-good-for-child-rearing": { heading: "子育てのお助けグッズ", keyword: "育児 便利グッズ" },
  "senior-housing-guide": SENIOR,
  "under-65-population-guide": STATS_BOOK,
  "district-aging-rate-guide": SENIOR,
  "fertility-and-aging-guide": SENIOR,
  "fertility-rate-comparison-guide": { heading: "子育て・学びに", keyword: "育児 便利グッズ" },
  "centenarians-guide": { heading: "敬老の日の贈り物に", keyword: "敬老の日 プレゼント" },
  "welfare-households-guide": KAKEIBO,
  "welfare-application-flow-guide": KAKEIBO,
  "protection-rate-comparison-guide": KAKEIBO,
  "aging-protection-rate-cross-guide": KAKEIBO,
  "three-indicator-cross-analysis-guide": KAKEIBO,
  "finance-household-budget-guide": KAKEIBO,
  "expenditure-category-shift-guide": KAKEIBO,
  "average-income-guide": KAKEIBO,
  "furusato-nozei-outflow-guide": { heading: "ふるさと納税の基本を知る", keyword: "ふるさと納税 本" },
  "employment-guide": { heading: "働き方・キャリアを考える", keyword: "キャリア 仕事 本" },
  "economic-census-guide": { heading: "地域経済を学ぶ", keyword: "地域経済 入門 本" },
  "e-post-requests-guide": { heading: "暮らしの法律を知る", keyword: "暮らしの法律 入門" },
  "citizen-consultation-guide": { heading: "暮らしの法律を知る", keyword: "暮らしの法律 入門" },
  "gender-participation-guide": { heading: "共働き・家事分担を考える", keyword: "共働き 家事 本" },
  "gender-center-usage-guide": { heading: "自分の時間・学びに", keyword: "自己啓発 講座 本" },
  "voter-turnout-guide": { heading: "政治・選挙を知る", keyword: "政治 入門 選挙" },
  "rail-ridership-guide": PASS_CASE,
  "bus-ridership-guide": PASS_CASE,
  "teiki-commuter-ratio-guide": PASS_CASE,
  "funabashi-keiba-record-guide": LOCAL_GIFT,
  "teiki-recovery-guide": PASS_CASE,
  "job-offers-vs-placements-guide": { heading: "仕事探し・転職の準備に", keyword: "転職 面接 本" },
  "finance-peer-comparison-guide": { heading: "お金の基本を学ぶ", keyword: "家計 資産形成 入門 本" },
  "birth-childcare-support-guide": { heading: "出産・育児の準備に", keyword: "出産準備 ベビー用品 セット" },
  "ambulance-dispatch-guide": { heading: "家庭の備えに", keyword: "救急箱 家庭用" },
  "bus-efficiency-guide": { heading: "バス通勤・通学のお供に", keyword: "ICカード ケース パスケース" },
  "daytime-population-ratio-guide": { heading: "通勤の相棒に", keyword: "通勤 リュック ビジネス" },
  "land-price-by-railway-line-guide": { heading: "住まい選びの参考に", keyword: "マイホーム 購入 本" },
  "vacant-homes-guide": { heading: "空き家・実家じまいの参考に", keyword: "空き家 実家 片付け 本" },
  "migration-breakdown-guide": { heading: "引っ越しの準備に", keyword: "引越し 梱包 資材" },
  "foreign-residents-nationality-guide": { heading: "多文化共生を考える", keyword: "やさしい日本語 本" },
  "waste-recycling-guide": { heading: "分別しやすい暮らしに", keyword: "分別 ゴミ箱" },
  "library-branches-guide": { heading: "読書のお供に", keyword: "ブックカバー 文庫" },
  "library-collection-usage-guide": { heading: "読書のお供に", keyword: "ブックカバー 文庫" },
  "parks-guide": PICNIC,
  "area-guide-minamifunabashi-coast": PICNIC,
  "area-guide-central-funabashi": { heading: "街歩きのお供に", keyword: "街歩き ガイドブック 千葉" },
  "area-guide-north-narashinodai": { heading: "街歩きのお供に", keyword: "街歩き ガイドブック 千葉" },
  "why-funabashi-charm-guide": LOCAL_GIFT,
  "funabashi-trivia-quiz": LOCAL_GIFT,
  "funabashi-daijingu-hatsumode-guide": { heading: "初詣・お正月の装いに", keyword: "巾着 御朱印帳" },
  "funabashi-daijingu-lighthouse-guide": { heading: "初詣・参拝のお供に", keyword: "御朱印帳" },
  "citizens-festival-station-data-guide": { heading: "船橋といえば", keyword: "ふなっしー グッズ" },
  "funabashi-nashi-pears-guide": { heading: "船橋の梨をお取り寄せ", keyword: "船橋 梨" },
  "funabashi-agriculture-output-guide": { heading: "千葉の野菜をお取り寄せ", keyword: "千葉 野菜 お取り寄せ" },
  "funabashi-fishery-guide": { heading: "東京湾の恵みをお取り寄せ", keyword: "千葉 あさり 海苔" },
  "sanbanze-tidal-flat-guide": { heading: "潮干狩り・干潟観察に", keyword: "潮干狩り 道具" },
  "funabashi-firefly-viewing-guide": { heading: "夏の夜のお出かけに", keyword: "虫よけ アウトドア" }
};

const byTag = {
  "人口・世帯": STATS_BOOK,
  "地域・コミュニティ": LOCAL_GIFT,
  "暮らし・安全": BOUSAI,
  "教育・子育て": { heading: "子育て・学びに", keyword: "育児 便利グッズ" },
  "行政・財政": KAKEIBO,
  "防災・安全": BOUSAI,
  "サイト案内": { heading: "データ活用を始めたい方に", keyword: "データ分析 入門 Excel" }
};

export function getArticleAffiliate(slug, tag) {
  return bySlug[slug] || byTag[tag] || LOCAL_GIFT;
}
