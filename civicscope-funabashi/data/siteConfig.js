// サイト全体の設定。ここを編集するだけで表示内容を差し替えられます。

export const siteConfig = {
  name: "CivicScope Funabashi",
  nameJa: "シビックスコープ船橋",
  shortName: "CivicScope",
  tagline: "船橋市のオープンデータを、暮らしの解像度に変える。",
  description:
    "船橋市が公開するオープンデータ（BODIK ODCS）をもとに、人口動向や地域情報を独自に整理・分析して発信する非公式の市民向けデータメディアです。",
  url: "https://civicscope-funabashi.vercel.app", // Vercelにデプロイ後、実際のドメインに書き換えてください
  contactEmail: "civicscope.funabashi@gmail.com",
  locale: "ja_JP",
  twitter: "", // 運用するなら @xxxx を入れる
  city: "船橋市",
  prefecture: "千葉県",
  // BODIK ODCS（船橋市のオープンデータカタログ）関連
  bodik: {
    orgId: "122041",
    orgCatalogUrl: "https://odcs.bodik.jp/122041/",
    orgDatasetListUrl: "https://data.bodik.jp/organization/122041",
    apiBase: "https://data.bodik.jp",
    license: "CC BY 4.0（クリエイティブ・コモンズ 表示4.0国際）",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/deed.ja"
  }
};

// ダッシュボードや記事で参照するデータセット（BODIK ODCSのデータセットID = URLの末尾）
// package_show APIで resource を自動取得するので、IDさえ合っていればCSVの列構成が
// 多少変わっても壊れにくい設計にしています。
export const datasets = {
  population: {
    id: "122041_maitukijoujyu",
    label: "毎月常住人口情報",
    description:
      "国勢調査人口をもとに、住民基本台帳法・戸籍法上の届出（出生・死亡・転入・転出）を加減して毎月1日時点で推計した人口。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_maitukijoujyu"
  },
  chokai: {
    id: "122041_chokaijitikai",
    label: "町会・自治会一覧",
    description: "船橋市内の町会・自治会の名称や地区に関する一覧データ。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_chokaijitikai"
  },
  foodBusiness: {
    id: "122041_shokuhineigyoukyokasisetu",
    label: "食品営業施設一覧",
    description:
      "食品衛生法に基づき船橋市内で営業許可を取得している飲食店・食品取扱施設の一覧（令和3年5月31日までに許可を取得し、公開時点で営業中の施設）。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_shokuhineigyoukyokasisetu"
  }
};
