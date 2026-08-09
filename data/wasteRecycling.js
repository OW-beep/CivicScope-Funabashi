// 船橋市一般廃棄物処理基本計画の数値目標項目（総排出量・1人1日あたり家庭系ごみ排出量・
// リサイクル率・最終処分量）の実績・目標値。
//
// 出典: 船橋市公式サイト「船橋市一般廃棄物処理基本計画の数値目標項目における推移と目標
// （令和3年度末時点）」
// https://www.city.funabashi.lg.jp/kurashi/gomi/012/p054910.html
// （2026年8月時点で確認できた最新のテキスト形式のページ。ページ自体の最終更新は
//  2022年6月2日で、令和3年度の実績が最新。基準年度は令和元年度、中間目標年度は
//  令和8年度、目標年度は令和13年度）
//
// 正直な前提: このページはグラフ画像で経年推移を示しており、テキストで確認できる
// 実績値は令和3年度・令和2年度の2年分のみ。より新しい年度の実績は、原典サイトの
// 更新を確認のうえ追記すること。

export const wasteReductionTargets = {
  baseYear: "令和元年度",
  midtermYear: "令和8年度",
  finalYear: "令和13年度",
  metrics: [
    {
      key: "totalEmission",
      label: "総排出量",
      unit: "トン",
      description: "家庭から出るごみ・事業活動に伴うごみ・有価物の合計量",
      r3: 199384,
      r2: 204314,
      yoyChange: "4,930トン（2.4%）少ない"
    },
    {
      key: "perCapitaHousehold",
      label: "1人1日あたり家庭系ごみ排出量",
      unit: "グラム",
      description: "家庭から出る可燃ごみ・不燃ごみ・粗大ごみの合計量を1人1日あたりに換算した量",
      r3: 528,
      midtermTarget: 490,
      vsMidtermTarget: "38グラム（7.8%）多い"
    },
    {
      key: "recyclingRate",
      label: "リサイクル率",
      unit: "%",
      description: "資源化量 ÷ 総排出量",
      r3: 22.8,
      vsMidtermTarget: "3.2ポイント低い"
    },
    {
      key: "finalDisposal",
      label: "最終処分量",
      unit: "トン",
      description: "焼却灰等を最終処分場で埋め立てた量（船橋市内に最終処分場は無く、他自治体の処分場へ運搬）",
      r3: 7829,
      r2: 7545,
      yoyChange: "284トン（3.8%）多い"
    }
  ],
  source: {
    label: "船橋市一般廃棄物処理基本計画の数値目標項目における推移と目標（令和3年度末時点）",
    url: "https://www.city.funabashi.lg.jp/kurashi/gomi/012/p054910.html"
  }
};
