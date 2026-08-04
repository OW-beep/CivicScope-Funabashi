// 船橋市統計書「I 都市基盤」I-3 市内鉄道駅別1日平均乗車人員（各年3月31日現在）より。
// BODIK ODCSではなく船橋市公式サイトが公開するPDFから作成した静的データです。
// このデータはテキスト抽出だけでは駅名と数値の対応を確実に判定できなかったため、
// ユーザーが提供した表のスクリーンショット（画像）を目視で確認し、事業者・駅名・数値を
// 1つずつ突き合わせて作成しました。
//
// 【重要】西船橋・船橋・北習志野は複数の鉄道事業者が同じ駅名で乗り入れている
// （乗換駅の）ため、事業者ごとに別々のレコードとして扱っています。
// 「西船橋駅全体で何人か」を見たい場合は combineByStationName() を使ってください。
//
// 出典: 船橋市統計書「I 都市基盤」（資料：道路計画課）
// https://www.city.funabashi.lg.jp/shisei/toukei/002/p146613_d/fil/18I.pdf
// 船橋市統計書 一覧: https://www.city.funabashi.lg.jp/shisei/toukei/002/index.html

const YEARS = ["令和2年度", "令和3年度", "令和4年度", "令和5年度", "令和6年度"];

// [total, teiki(定期)] のペアを年度分（5年）並べたもの
export const railStations = [
  { operator: "JR東日本", station: "下総中山", values: [[18898,12985],[19659,12845],[20847,13269],[21724,13804],[22149,14038]] },
  { operator: "JR東日本", station: "西船橋", values: [[103947,68321],[110680,68418],[119941,71215],[125955,73784],[129904,75596]] },
  { operator: "JR東日本", station: "船橋", values: [[103879,72261],[109860,72359],[119230,75382],[125534,78106],[129427,80168]] },
  { operator: "JR東日本", station: "東船橋", values: [[16901,12345],[17723,12521],[18745,12948],[19585,13540],[20038,13881]] },
  { operator: "JR東日本", station: "津田沼", values: [[76886,56653],[79799,56126],[85072,57992],[87820,59869],[89445,61110]] },
  { operator: "JR東日本", station: "船橋法典", values: [[18815,9900],[14599,9999],[16244,10509],[17306,10949],[17685,11167]] },
  { operator: "JR東日本", station: "南船橋", values: [[18027,9964],[19586,10155],[21123,10992],[21678,11394],[23798,11685]] },
  { operator: "京成電鉄", station: "京成中山", values: [[1486,843],[1592,869],[1728,910],[1802,945],[1849,970]] },
  { operator: "京成電鉄", station: "東中山", values: [[2485,1461],[2748,1526],[3150,1661],[3357,1708],[3472,1729]] },
  { operator: "京成電鉄", station: "京成西船", values: [[4221,2308],[4653,2470],[4998,2576],[5294,2654],[5367,2631]] },
  { operator: "京成電鉄", station: "海神", values: [[2290,1232],[2460,1283],[2692,1396],[2924,1532],[3023,1574]] },
  { operator: "京成電鉄", station: "京成船橋", values: [[33858,21038],[36887,21987],[41353,23945],[43984,24874],[45366,25437]] },
  { operator: "京成電鉄", station: "大神宮下", values: [[2078,1009],[2308,1056],[2526,1160],[2684,1227],[2829,1258]] },
  { operator: "京成電鉄", station: "船橋競馬場", values: [[7939,3446],[8642,3527],[9139,3656],[9311,3714],[9551,3774]] },
  { operator: "東武鉄道", station: "馬込沢", values: [[10524,7252],[11195,7377],[12110,7805],[12695,8179],[12939,8317]] },
  { operator: "東武鉄道", station: "塚田", values: [[6819,4775],[7718,5220],[8450,5588],[8793,5732],[9173,5973]] },
  { operator: "東武鉄道", station: "新船橋", values: [[5607,3312],[6070,3364],[6482,3472],[6684,3541],[6882,3622]] },
  { operator: "東武鉄道", station: "船橋", values: [[44664,31724],[49126,33771],[53694,35825],[56226,36900],[58006,37808]] },
  { operator: "東京地下鉄（東京メトロ）", station: "原木中山", values: [[10949,6947],[11559,6998],[12392,7384],[13036,7774],[13441,7994]] },
  { operator: "東京地下鉄（東京メトロ）", station: "西船橋", values: [[106071,76640],[110265,74705],[121757,80281],[128582,83505],[131947,85581]] },
  { operator: "北総鉄道", station: "小室", values: [[1590,1082],[1647,1068],[1833,1170],[2046,1318],[2200,1454]] },
  { operator: "新京成電鉄", station: "前原", values: [[3985,2240],[4334,2334],[4707,2554],[5033,2755],[5283,2886]] },
  { operator: "新京成電鉄", station: "薬園台", values: [[6106,3724],[6434,3762],[6888,3965],[7178,4117],[7402,4213]] },
  { operator: "新京成電鉄", station: "習志野", values: [[5449,3645],[5746,3710],[6080,3800],[6456,4030],[6685,4178]] },
  { operator: "新京成電鉄", station: "北習志野", values: [[17144,11855],[18091,12017],[20043,13288],[20868,13727],[21114,13881]] },
  { operator: "新京成電鉄", station: "高根木戸", values: [[3373,1879],[3654,1978],[3967,2105],[4057,2139],[4087,2140]] },
  { operator: "新京成電鉄", station: "高根公団", values: [[6077,3846],[6474,3934],[6909,4126],[7208,4253],[7455,4387]] },
  { operator: "新京成電鉄", station: "滝不動", values: [[3052,2026],[3208,2056],[3577,2277],[3745,2375],[3902,2448]] },
  { operator: "新京成電鉄", station: "三咲", values: [[5698,3810],[6056,3892],[6542,4117],[6760,4210],[6962,4333]] },
  { operator: "新京成電鉄", station: "二和向台", values: [[6902,5015],[7167,5002],[7769,5347],[8088,5522],[8206,5553]] },
  { operator: "東葉高速鉄道", station: "西船橋", values: [[44551,34265],[45803,33045],[52315,37200],[56122,39455],[58301,41150]] },
  { operator: "東葉高速鉄道", station: "東海神", values: [[3492,2094],[3713,2073],[4150,2268],[4459,2403],[4790,2588]] },
  { operator: "東葉高速鉄道", station: "飯山満", values: [[8009,5939],[8303,5881],[9143,6352],[9764,6712],[10238,7058]] },
  { operator: "東葉高速鉄道", station: "北習志野", values: [[15574,10576],[16491,10575],[18643,11869],[19827,12528],[20480,12980]] },
  { operator: "東葉高速鉄道", station: "船橋日大前", values: [[5839,4018],[6926,4549],[9901,7033],[10593,7429],[10861,7791]] }
];

export function getYears() {
  return YEARS;
}

// 令和6年度（最新）の駅×事業者ランキング
export function getLatestRanking(count = 15) {
  return railStations
    .map((s) => ({
      label: `${s.station}（${s.operator}）`,
      station: s.station,
      operator: s.operator,
      count: s.values[YEARS.length - 1][0]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, count);
}

// 同じ駅名（乗換駅）を事業者横断で合算したランキング
export function combineByStationName(count = 10) {
  const map = new Map();
  railStations.forEach((s) => {
    const first = s.values[0][0];
    const last = s.values[YEARS.length - 1][0];
    if (!map.has(s.station)) {
      map.set(s.station, { label: s.station, first: 0, last: 0, operators: [] });
    }
    const entry = map.get(s.station);
    entry.first += first;
    entry.last += last;
    entry.operators.push(s.operator);
  });
  return [...map.values()]
    .map((e) => ({
      ...e,
      count: e.last,
      rate: e.first ? ((e.last - e.first) / e.first) * 100 : null
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, count);
}

// 令和2→6年度の伸び率ランキング（事業者単位）
export function getGrowthRanking(count = 10) {
  return railStations
    .map((s) => {
      const first = s.values[0][0];
      const last = s.values[YEARS.length - 1][0];
      return {
        label: `${s.station}（${s.operator}）`,
        station: s.station,
        operator: s.operator,
        first,
        last,
        rate: first ? ((last - first) / first) * 100 : null
      };
    })
    .sort((a, b) => b.rate - a.rate)
    .slice(0, count);
}

// 全駅×事業者の単純合計の年度推移（市内の鉄道利用の全体トレンドの目安）
export function getTotalSeries() {
  return YEARS.map((label, i) => ({
    label,
    total: railStations.reduce((sum, s) => sum + s.values[i][0], 0)
  }));
}

export function buildTotalInsights() {
  const series = getTotalSeries();
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const first = series[0];
  const diff = latest.total - previous.total;
  const rate = previous.total ? (diff / previous.total) * 100 : null;
  const longTermRate = first.total ? ((latest.total - first.total) / first.total) * 100 : null;
  return { latest, previous, first, diff, rate, longTermRate };
}
