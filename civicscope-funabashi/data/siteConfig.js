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
  // AED設置施設データ：以前は「BODIK ODCSには無く、G空間情報センターに掲載されているが
  // ロボット除け設定で確認できない」としていましたが、実際には船橋市のBODIK ODCS上に
  // 「AED設置施設一覧」として存在することが確認できたため、正しいIDに差し替えました。
  aed: {
    id: "122041_aed_sikoukyousisetsu",
    label: "AED設置施設一覧",
    description: "船橋市が設置しているAED（自動体外式除細動器）の設置施設一覧。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_aed_sikoukyousisetsu"
  },
  publicWirelessLan: {
    id: "122041_public_wireless_lan",
    label: "公衆無線LANアクセスポイント一覧",
    description:
      "市が設置している公衆無線LAN（Wi-Fi）のアクセスポイント一覧。施設名称・住所・設置箇所（緯度経度）・SSIDを収録。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_public_wireless_lan"
  },
  schoolStudents: {
    // 旧ID「122041_h300501_chugakkouseitosu」は現在のカタログには存在せず、
    // package_show APIが404を返してダッシュボードがエラー表示になっていました。
    // 現在の正しいデータセットID「122041_chugakkouseitosuu」に修正済みです。
    // なお、このデータセットは学校別の内訳ではなく、市内の中学校生徒数の合計を
    // 年度ごとに集計した時系列データ（1980年度〜2019年度）です。
    id: "122041_chugakkouseitosuu",
    label: "中学校生徒数",
    description: "船橋市立中学校の生徒数（市内合計）の年度別推移。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_chugakkouseitosuu"
  },
  lifeSanitationFacilities: {
    id: "122041_seikatsueisei0407",
    label: "生活衛生関係営業施設一覧",
    description: "美容所・理容所・クリーニング所・旅館・ホテル・簡易宿所・公衆浴場・興行場など、生活衛生関係の営業許可施設の一覧。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_seikatsueisei0407"
  },
  seniorHousingStats: {
    id: "122041_koureijuutakutoukei",
    label: "サービス付き高齢者向け住宅入居者別統計データ",
    description: "サービス付き高齢者向け住宅の毎年（平成25年～）10月1日時点の入居者別統計データ。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_koureijuutakutoukei"
  },
  seniorHousingList: {
    id: "122041_koureijuutakuichiran",
    label: "サービス付き高齢者向け住宅一覧",
    description: "船橋市内のサービス付き高齢者向け住宅の一覧（平成30年7月1日時点）。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_koureijuutakuichiran"
  },
  welfareHouseholds: {
    id: "122041_hihogoseitaijinin",
    label: "被保護世帯人員",
    description: "船橋市の生活保護（被保護世帯）の世帯人員別データ（平成26年度～令和6年度）。",
    sourceUrl:
      "https://data.bodik.jp/dataset/122041_hihogoseitaijinin/resource/461afacf-4128-4bbe-8999-31cfa8873d72"
  },

  // --- 以下、追加調査で見つかった未実装の候補データセット ---------------------
  // 「サービス付き高齢者向け住宅」記事執筆時点では「高齢化率データは見当たらなかった」
  // としていましたが、実際には人口・世帯グループに単独のデータセットとして存在します。
  // 次のダッシュボード/記事を作る際はこのIDをそのまま使えます。
  agingRatio: {
    id: "122041_65saiijyoujinkousuii",
    label: "65歳以上人口推移",
    description:
      "65歳以上人口の年度別推移（年度、総人口、65歳以上人口、総人口比率＝高齢化率）。各年度4月1日現在の住民基本台帳人口を基に作成。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_65saiijyoujinkousuii"
  },
  seniorPopulationByAge: {
    id: "122041_60saiijojinkonenreibetsu",
    label: "60歳以上人口年齢別推移",
    description: "60歳以上人口の年齢区分別の年度推移。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_60saiijojinkonenreibetsu"
  },
  totalFertilityRate: {
    id: "122041_goukeitokusyusyusseiritu",
    label: "出生統計:合計特殊出生率の年次推移",
    description:
      "厚生労働省人口動態調査の調査票情報を利用した平成19年から令和2年までの合計特殊出生率の推移。全国・千葉県との比較も含む。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_goukeitokusyusyusseiritu"
  },
  futurePopulation: {
    id: "122041_shoraijinkou",
    label: "将来人口推計（市全体）",
    description:
      "第3次総合計画策定にあたり、平成30年4月時点の住民基本台帳を基準に作成した将来人口推計（市全体）。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_shoraijinkou"
  },
  censusHouseholdComposition: {
    // 【船橋市統計書より】B-2国勢調査（20リソース収録）のうち、世帯構成に関するもの。
    // 1データセット内に複数リソースがまとまっているため、getDatasetRecordsではなく
    // getPackage()でresources一覧を取得し、用途に応じたresource_idを指定して使うのが良い。
    id: "122041_stats_b-2",
    label: "国勢調査（船橋市統計書 B-2）",
    description:
      "年齢別人口、世帯人員別世帯数、高齢単身者数、母子・父子世帯数、昼間人口、産業別就業者数など、国勢調査を集計した20種類のリソースをまとめたデータセット。",
    sourceUrl: "https://data.bodik.jp/dataset/122041_stats_b-2"
  }
};
