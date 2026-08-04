// 船橋市統計書「I 都市基盤」I-2 市内バス運輸状況（各年3月31日現在）より。
// BODIK ODCSではなく船橋市公式サイトが公開するPDFから作成した静的データです。
// I-3（鉄道駅別乗車人員）と同様、テキスト抽出だけでは事業者ごとのブロック区切りが
// 判別できなかったため、ユーザーが提供した表のスクリーンショットを目視で確認し、
// 事業者ごとに数値を突き合わせて作成しました。
//
// 出典: 船橋市統計書「I 都市基盤」（資料：道路計画課）
// https://www.city.funabashi.lg.jp/shisei/toukei/002/index.html

const YEARS = ["令和2年度", "令和3年度", "令和4年度", "令和5年度", "令和6年度"];

// values: [営業キロ程, 停留所数, 運行台数, 運行台数のうち低床スロープ付, 走行キロ数, 1日平均乗車人員]
// null は元データが「…」「－」で非公表・未実施だったことを示す
export const busOperators = [
  {
    name: "京成バス",
    values: [
      [53, 53, 57, 57, 1611644, 15824],
      [53, 55, 59, 59, 1586997, 16750],
      [53, 55, 61, 58, 1586356, 18079],
      [53, 55, 61, 58, 1592710, 19303],
      [53, 55, 61, 58, 1519980, 19817]
    ]
  },
  {
    name: "船橋新京成バス",
    values: [
      [94, 262, 141, 141, 4089816, 35353],
      [94, 262, 145, 145, 4293096, 31129],
      [96, 266, 131, 131, 3812299, 34239],
      [97, 266, 122, 122, 3730780, 33118],
      [61, 262, 114, 114, 3398998, 31802]
    ]
  },
  {
    name: "ちばレインボーバス",
    values: [
      [16, 51, 20, 20, 992300, 2512],
      [16, 51, 20, 20, 883537, 2470],
      [16, 51, 22, 22, 773042, 2734],
      [16, 51, 21, 19, 530504, 2310],
      [16, 51, 20, 19, 764533, 2951]
    ]
  },
  {
    name: "京成トランジットバス",
    values: [
      [4, 24, 3, 3, 50166, 186],
      [4, 24, 3, 3, 47258, 185],
      [6, 28, 9, 9, 210770, 1824],
      [6, 28, 9, 9, 139557, 1100],
      [6, 28, 11, 11, 120123, 1122]
    ]
  },
  {
    name: "京成バスシステム",
    values: [
      [27, 59, 21, 21, 265520, 1787],
      [27, 59, 21, 21, 265333, 1747],
      [27, 59, 22, 22, 265626, 1831],
      [27, 59, 22, 22, 344305, 1868],
      [27, 59, 23, 23, 344326, 1830]
    ]
  },
  {
    name: "平和交通",
    // 走行キロ数・1日平均乗車人員は元データが「…」（非公表）のためnull
    values: [
      [2, 2, 5, 5, null, null],
      [2, 2, 5, 5, null, null],
      [3, 3, 7, 7, null, null],
      [3, 3, 7, 7, null, null],
      [2, 2, 7, 7, null, null]
    ]
  },
  {
    name: "鎌ヶ谷観光バス",
    // 低床スロープ付の内訳列は元データに存在しない（他社と列構成が異なる）
    // 令和6年度は「－」＝運行終了
    hasNoLowFloorColumn: true,
    values: [
      [1, 1, null, null, null, null],
      [1, 1, null, null, null, null],
      [3, 4, null, null, null, null],
      [3, 4, null, null, null, null],
      [null, null, null, null, null, null]
    ]
  }
];

export function getYears() {
  return YEARS;
}

// 1日平均乗車人員が公表されている事業者だけを対象にした、市内バス利用者数の推移
// （平和交通・鎌ヶ谷観光バスは非公表のため含まれない＝過小評価である点に注意）
export function getTotalRidersSeries() {
  return YEARS.map((label, i) => {
    const total = busOperators.reduce((sum, op) => {
      const riders = op.values[i][5];
      return sum + (riders || 0);
    }, 0);
    return { label, total };
  });
}

// 最新年度（令和6年度）の事業者別乗車人員ランキング（公表されている事業者のみ）
export function getLatestOperatorRanking() {
  const i = YEARS.length - 1;
  return busOperators
    .filter((op) => op.values[i][5] !== null)
    .map((op) => ({ label: op.name, count: op.values[i][5] }))
    .sort((a, b) => b.count - a.count);
}

// 最新年度の運行台数ランキング（全事業者、乗車人員非公表の事業者も含む）
export function getLatestVehicleRanking() {
  const i = YEARS.length - 1;
  return busOperators
    .filter((op) => op.values[i][2] !== null)
    .map((op) => ({ label: op.name, count: op.values[i][2] }))
    .sort((a, b) => b.count - a.count);
}

export function buildTotalInsights() {
  const series = getTotalRidersSeries();
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const first = series[0];
  const diff = latest.total - previous.total;
  const rate = previous.total ? (diff / previous.total) * 100 : null;
  const longTermRate = first.total ? ((latest.total - first.total) / first.total) * 100 : null;
  return { latest, previous, first, diff, rate, longTermRate };
}
