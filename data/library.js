// 船橋市図書館「図書館要覧」（船橋市西図書館発行、毎年9月頃発行）に基づく静的データ。
// BODIKのオープンデータカタログには図書館の統計データセットがないため、
// 要覧PDF（令和4年度版＝令和3年度実績）から手動で転記している。
// 令和2年度は北図書館が大規模改修工事のため長期休館（8月〜翌3月）しており、
// 貸出点数が大きく落ち込んでいる点に注意。また令和2年度から、各館の共同書庫の
// 保存資料がすべて北図書館の所蔵として集約されたため、北図書館の蔵書点数（資料点数）は
// 令和2年度以降、他の3館と単純比較できない（＝他館の保存分も含む合算値）。
//
// 「latestHoldings」は図書館公式サイト「各図書館案内・開館時間」ページに掲載の
// 最新蔵書数（点）。令和7年3月末日現在。貸出点数の最新値は同ページに掲載がないため含めない。
// 出典:
// - 図書館要覧（令和4年度）: https://www.lib.city.funabashi.lg.jp/manage/contents/upload/6358c28139543.pdf
// - 各図書館案内・開館時間: https://www.lib.city.funabashi.lg.jp/viewer/info.html?id=49&idSubTop=0

export const libraryBranches = [
  {
    name: "西図書館",
    address: "船橋市西船1-20-50",
    opened: "昭和46年1月（現施設は平成28年10月リニューアル）",
    holdingsByYear: [347669, 278722, 287829],
    loansByYear: [423249, 353594, 461491],
    latestHoldings: 304611
  },
  {
    name: "中央図書館",
    address: "船橋市本町4-38-28 ライブ2000",
    opened: "昭和58年10月（現施設は平成12年7月移設）",
    holdingsByYear: [315306, 292727, 299163],
    loansByYear: [553121, 435853, 591999],
    latestHoldings: 316381
  },
  {
    name: "東図書館",
    address: "船橋市習志野台5-1-1（習志野台公民館併設）",
    opened: "昭和56年6月",
    holdingsByYear: [275785, 175577, 176237],
    loansByYear: [456607, 385910, 498129],
    latestHoldings: 228311
  },
  {
    name: "北図書館",
    address: "船橋市二和東5-26-1（二和公民館・二和出張所併設）",
    opened: "平成3年10月",
    holdingsByYear: [347097, 640759, 637086],
    loansByYear: [328181, 104641, 325722],
    latestHoldings: 626614,
    note: "令和2年度から、共同書庫（他館の保存資料）の所蔵がすべて北図書館に集約されたため、蔵書点数が大きく増えている。令和2年度は大規模改修工事のため長期休館し、貸出点数が一時的に落ち込んだ。"
  }
];

// 要覧に記載の年度ラベル（このデータでは3年分のみ収録）
export const libraryYears = ["令和元年度", "令和2年度", "令和3年度"];

export function getLibraryTotals() {
  const years = libraryYears.map((label, i) => {
    const holdings = libraryBranches.reduce((sum, b) => sum + b.holdingsByYear[i], 0);
    const loans = libraryBranches.reduce((sum, b) => sum + b.loansByYear[i], 0);
    return { label, holdings, loans };
  });
  const latestHoldingsTotal = libraryBranches.reduce((sum, b) => sum + b.latestHoldings, 0);
  return { years, latestHoldingsTotal, latestHoldingsLabel: "令和7年3月末" };
}
