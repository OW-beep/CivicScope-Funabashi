// 船橋市統計書「R 財政」より、歳入・歳出・市債残高のデータ。
// public-safety（Q章）と同様、BODIK ODCSではなく船橋市公式サイトが公開するPDFから
// 作成した静的データです。値を目視で確認し、内訳の合計が統計書記載の総額・小計と
// 一致することをPythonで検算済みです（内訳合計＝一般会計、普通債＋その他債＝一般会計 等）。
//
// 出典: 船橋市統計書「R 財政」（資料：財政課）
// https://www.city.funabashi.lg.jp/shisei/toukei/002/p146613_d/fil/27R.pdf
// 船橋市統計書 一覧: https://www.city.funabashi.lg.jp/shisei/toukei/002/index.html
// 単位：千円（元データのまま）。令和7年度のみ「予算額」で、他は「決算額」。

// --- R-1 歳入決算及び予算（会計別） -----------------------------------
// total: 全会計合計の歳入総額 / general: 一般会計の歳入総額 / tax: 市税（一般会計）
export const revenueData = [
  { label: "令和3年度", isBudget: false, total: 410131809, general: 254108868, tax: 101822189 },
  { label: "令和4年度", isBudget: false, total: 402808785, general: 247708836, tax: 105489851 },
  { label: "令和5年度", isBudget: false, total: 406426692, general: 237925445, tax: 107475819 },
  { label: "令和6年度", isBudget: false, total: 413622843, general: 249314444, tax: 107706662 },
  { label: "令和7年度", isBudget: true, total: 428967974, general: 256800000, tax: 113712900 }
];

// --- R-2 歳出決算及び予算（会計別・目的別） -----------------------------
// total: 全会計合計の歳出総額 / general: 一般会計の歳出総額
// categories: 一般会計の目的別内訳（合計するとgeneralと一致することを検算済み）
export const expenditureData = [
  {
    label: "令和3年度",
    isBudget: false,
    total: 404265744,
    general: 243457137,
    categories: {
      議会費: 937469,
      総務費: 18832997,
      民生費: 110936937,
      衛生費: 33989014,
      労働費: 194451,
      農林水産業費: 488650,
      商工費: 5943864,
      土木費: 18918441,
      消防費: 6235514,
      教育費: 26823368,
      災害復旧費: 0,
      公債費: 20156432,
      予備費: 0
    }
  },
  {
    label: "令和4年度",
    isBudget: false,
    total: 402178023,
    general: 240469702,
    categories: {
      議会費: 940446,
      総務費: 22069534,
      民生費: 104832718,
      衛生費: 34133195,
      労働費: 263596,
      農林水産業費: 762508,
      商工費: 5086587,
      土木費: 20509621,
      消防費: 6445423,
      教育費: 25703449,
      災害復旧費: 0,
      公債費: 19722625,
      予備費: 0
    }
  },
  {
    label: "令和5年度",
    isBudget: false,
    total: 409203291,
    general: 234085740,
    categories: {
      議会費: 941789,
      総務費: 22544316,
      民生費: 112777840,
      衛生費: 18949344,
      労働費: 167440,
      農林水産業費: 616123,
      商工費: 5547411,
      土木費: 21956671,
      消防費: 7230036,
      教育費: 25270773,
      災害復旧費: 0,
      公債費: 18083997,
      予備費: 0
    }
  },
  {
    label: "令和6年度",
    isBudget: false,
    total: 414135368,
    general: 243229426,
    categories: {
      議会費: 952085,
      総務費: 24801859,
      民生費: 116498591,
      衛生費: 18718807,
      労働費: 182141,
      農林水産業費: 529084,
      商工費: 4672309,
      土木費: 21335766,
      消防費: 7215883,
      教育費: 30095106,
      災害復旧費: 0,
      公債費: 18227795,
      予備費: 0
    }
  },
  {
    label: "令和7年度",
    isBudget: true,
    total: 438157601,
    general: 256800000,
    categories: {
      議会費: 1030900,
      総務費: 22858800,
      民生費: 124277200,
      衛生費: 18552400,
      労働費: 199500,
      農林水産業費: 524200,
      商工費: 4426900,
      土木費: 26672500,
      消防費: 7359800,
      教育費: 30657000,
      災害復旧費: 0,
      公債費: 19940800,
      予備費: 300000
    }
  }
];

// --- R-3 市債の現在高（年度末） -----------------------------------------
// total: 全会計合計 / general: 一般会計（普通債＋その他債）
export const debtData = [
  { label: "令和2年度", total: 324362447, general: 186384478 },
  { label: "令和3年度", total: 318278046, general: 184599001 },
  { label: "令和4年度", total: 303951299, general: 176977897 },
  { label: "令和5年度", total: 298474091, general: 168985966 },
  { label: "令和6年度", total: 287197496, general: 163198863 }
];

function toSeries(rows, key = "general") {
  return rows.map((row) => ({ label: row.label, total: row[key] }));
}

// 一般会計歳出の内訳（最新の決算年度＝予算のみの年度は除く）を歳出構成として返す
export function getExpenditureComposition() {
  const settled = expenditureData.filter((row) => !row.isBudget);
  const latest = settled[settled.length - 1];
  return {
    period: latest.label,
    total: latest.general,
    data: Object.entries(latest.categories).map(([label, amount]) => ({ label, count: amount }))
  };
}

export function getExpenditureTotalSeries() {
  return toSeries(expenditureData);
}

export function getRevenueTotalSeries() {
  return toSeries(revenueData);
}

export function getDebtTotalSeries() {
  return toSeries(debtData);
}

function buildInsights(rows, key = "general") {
  const series = toSeries(rows, key);
  if (series.length < 2) return null;
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const first = series[0];
  const diff = latest.total - previous.total;
  const rate = previous.total ? (diff / previous.total) * 100 : null;
  const longTermDiff = latest.total - first.total;
  const longTermRate = first.total ? (longTermDiff / first.total) * 100 : null;
  return { latest, previous, diff, rate, first, longTermDiff, longTermRate };
}

export function buildExpenditureInsights() {
  return buildInsights(expenditureData);
}
export function buildRevenueInsights() {
  return buildInsights(revenueData);
}
export function buildDebtInsights() {
  return buildInsights(debtData);
}

// --- 「家計」への換算 -----------------------------------------------------
// 千円単位の実額を、任意の「月の家計予算」に比例縮尺して円単位で返す。
// 換算の考え方（前提）を必ず記事側で明記すること。
export function toHouseholdScale(items, totalYen, monthlyBudgetYen = 300000) {
  return items.map(({ label, amount }) => ({
    label,
    amount,
    share: totalYen ? amount / totalYen : 0,
    scaledYen: totalYen ? Math.round((amount / totalYen) * monthlyBudgetYen) : 0
  }));
}

export function getHouseholdExpenditureBreakdown(monthlyBudgetYen = 300000) {
  const composition = getExpenditureComposition();
  const items = composition.data.map((d) => ({ label: d.label, amount: d.count }));
  return {
    period: composition.period,
    monthlyBudgetYen,
    items: toHouseholdScale(items, composition.total, monthlyBudgetYen).sort((a, b) => b.amount - a.amount)
  };
}

export function getHouseholdRevenueBreakdown(monthlyBudgetYen = 300000) {
  const settled = revenueData.filter((row) => !row.isBudget);
  const latest = settled[settled.length - 1];
  const other = latest.general - latest.tax;
  const items = [
    { label: "市税（自分の給料にあたる自主財源）", amount: latest.tax },
    { label: "地方交付税・国庫支出金・市債など（仕送り・借入にあたる財源）", amount: other }
  ];
  return {
    period: latest.label,
    monthlyBudgetYen,
    items: toHouseholdScale(items, latest.general, monthlyBudgetYen)
  };
}

// 「借金残高は年間支出の何ヶ月分・何年分か」という家計向けの換算
export function getHouseholdDebtRatio() {
  const settledExpenditure = expenditureData.filter((row) => !row.isBudget);
  const latestExpenditure = settledExpenditure[settledExpenditure.length - 1];
  const latestDebt = debtData[debtData.length - 1];
  const ratio = latestDebt.general / latestExpenditure.general;
  return {
    period: latestDebt.label,
    debt: latestDebt.general,
    annualExpenditure: latestExpenditure.general,
    ratio, // 例: 0.67 なら「年間支出の0.67年分＝約8ヶ月分」
    monthsOfSpending: ratio * 12
  };
}

// --- 類似団体（全国の同規模自治体62団体）との比較 --------------------------
// 出典: 総務省「財政状況資料集」（令和6年度）。船橋市公式サイトの「財政状況資料集」でも
// 同内容を確認できる。類似団体とは、人口・産業構造等により全国の市町村を35グループに
// 分類した際、船橋市と同じグループに属する62団体を指す（近隣市に限らず全国が対象）。
// 参考までに、このうち柏市が同じ類似団体グループに含まれている。
export const peerComparison2024 = [
  {
    label: "財政力指数",
    funabashiNote: "類似団体平均より高い水準（低下傾向が続いている）",
    rank: 9,
    outOf: 62,
    goodDirection: "high"
  },
  {
    label: "実質公債費比率",
    funabashiValue: 3.6,
    peerAverage: 5.2,
    unit: "%",
    rank: 19,
    outOf: 62,
    goodDirection: "low"
  },
  {
    label: "経常収支比率",
    funabashiValue: 97.3,
    unit: "%",
    rank: 53,
    outOf: 62,
    goodDirection: "low",
    note: "前年度より2.5ポイント上昇（人件費・物件費の増加が主因）"
  },
  {
    label: "将来負担比率",
    funabashiNote: "マイナス（将来負担なし、充当可能財源等が上回る）",
    rank: 1,
    outOf: 62,
    goodDirection: "low"
  },
  {
    label: "人口1,000人当たり職員数",
    funabashiValue: 6.08,
    unit: "人",
    rank: 17,
    outOf: 62,
    goodDirection: "low",
    note: "類似団体平均を下回る（効率的な人員配置）"
  }
];
