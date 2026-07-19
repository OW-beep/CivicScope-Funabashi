// サイト全体の設定。ここを編集するだけで表示内容を差し替えられます。

export const siteConfig = {
  name: "CivicScope Funabashi",
  nameJa: "シビックスコープ船橋",
  shortName: "CivicScope",
  tagline: "船橋市のオープンデータを、暮らしの解像度に変える。",
  description:
    "船橋市が公開するオープンデータ（BODIK ODCS）をもとに人口動向や地域情報を独自に整理・分析しつつ、まちの魅力も合わせて発信する非公式の市民向けメディアです。",
  url: "https://civic-scope-funabashi.vercel.app", // 独自ドメイン取得時はここを書き換えてください
  adsensePublisherId: "pub-4630812027939211",
  // AdSenseの審査に通るまでは広告枠自体を非表示にする。審査通過後にtrueへ。
  adsEnabled: false,
  googleSiteVerification: "KYZp6leIoJkmXQipodIUtUhXTopgEfgqFiQ7eJZuRZA",
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
  },
  dogRegistration: {
    id: "122041_inutourokukyoukenbyou",
    label: "犬の登録・狂犬病予防注射実施数",
    description: "船橋市内における犬の登録頭数と狂犬病予防注射の実施頭数の統計。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_inutourokukyoukenbyou"
  },
  infantCount: {
    id: "122041_nendobetunyuujisuu",
    label: "年度別乳児数",
    description: "船橋市内における乳児（0歳児）数の年度別推移。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_nendobetunyuujisuu"
  },
  childrenByAge: {
    id: "122041_jidounenreibetujinkou",
    label: "児童の年齢別人口",
    description: "船橋市内における児童（子ども）の年齢別人口の内訳。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_jidounenreibetujinkou"
  },
  evacuationPlaces: {
    id: "122041_hinanbasyo",
    label: "避難場所データ",
    description:
      "一時的な避難が可能な一時・広域避難場所と、津波警報発表時などに緊急で身の安全を確保するための津波一時避難施設のデータ。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_hinanbasyo"
  },
  evacuationShelters: {
    id: "122041_hinanjyo",
    label: "避難所データ",
    description: "被災者が一時的に宿泊滞在できる宿泊可能避難所と、要配慮者を受け入れる福祉避難所のデータ。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_hinanjyo"
  }
};
