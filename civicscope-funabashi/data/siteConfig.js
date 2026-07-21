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
  },
  strandedCommuterSupport: {
    id: "122041_kitakukonnannsya",
    label: "帰宅困難者支援施設データ",
    description: "災害時に帰宅困難者へ水やトイレ、休憩場所、情報提供を行う帰宅困難者支援施設のデータ（令和5年10月26日時点）。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_kitakukonnannsya"
  },
  // AED設置施設データは船橋市の場合、BODIK ODCS（data.bodik.jp）ではなく
  // 別カタログ「G空間情報センター（geospatial.jp）」に「AED設置施設一覧（市の公共施設等）」
  // 「AED設置施設一覧（コンビニエンスストア）」として掲載されています。
  // このカタログはロボット除け（robots.txt）で自動巡回できず、正確なデータセットID（URLの末尾）を
  // 確認できなかったため、id は空にしてあります。
  // 船橋市AEDマップ（案内ページ）: https://www.city.funabashi.lg.jp/kurashi/shoubou/010/p053170.html
  // 上記ページや https://www.geospatial.jp/ckan/organization/chiba-122041 から
  // データセットのURL末尾（例: chiba-122041_aed_xxxx）を確認し、id と apiBase を設定してください。
  aed: {
    id: "", // 例: "chiba-122041_aed_koukyoushisetsu"（要確認・要設定）
    apiBase: "https://www.geospatial.jp/ckan", // G空間情報センターのCKAN API（要確認）
    label: "AED設置施設一覧",
    description: "船橋市内の公共施設・コンビニエンスストア等に設置されているAEDの位置情報。",
    sourceUrl: "https://www.city.funabashi.lg.jp/kurashi/shoubou/010/p053170.html"
  },
  schoolStudents: {
    id: "122041_h300501_chugakkouseitosu",
    label: "市立中学校生徒数一覧",
    description: "船橋市立中学校の学校別生徒数一覧（平成30年5月1日時点）。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_h300501_chugakkouseitosu"
  }
};
