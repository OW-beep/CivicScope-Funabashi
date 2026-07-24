// 船橋市統計書「Q 警察及び消防」より、刑法犯認知件数・救急出動件数のデータ。
// このデータはBODIK ODCS（CKAN）ではなく、船橋市公式サイトが公開するPDF
// （船橋市統計書）から取得しています。PDFはボット対策により自動取得（fetch）が
// できないため、CKAN経由のダッシュボードとは異なり、値を確認の上で静的な
// JSデータとしてビルド時に埋め込んでいます。表内の内訳合計が総数と一致することを
// 確認済みです。
//
// 出典: 船橋市統計書「Q 警察及び消防」
// - Q-1 刑法犯の罪種（手口）別認知件数（資料：千葉県警察本部）
//   https://www.city.funabashi.lg.jp/shisei/toukei/002/p146613_d/fil/26Q.pdf
// - Q-11 救急出動件数（資料：消防局）
//   https://www.city.funabashi.lg.jp/shisei/toukei/002/p146613_d/fil/26Q.pdf
// 船橋市統計書 一覧: https://www.city.funabashi.lg.jp/shisei/toukei/002/index.html
// （船橋市サイトの著作権・リンク・免責事項に準じます。CC BY 4.0の明記はないため、
//   本サイトでは統計書由来である旨・出典を明記した上で、数値の引用にとどめています）

// --- Q-1 刑法犯の罪種別認知件数 -------------------------------------------
// 大分類の内訳（凶悪犯・粗暴犯・窃盗犯・知能犯・風俗犯・その他の刑法犯）は、
// 統計書に記載された細目（殺人・強盗…等）を合算して算出（合算後の値が
// 総数と一致することを確認済み）。
export const crimeData = [
  {
    label: "令和2年",
    total: 3505,
    categories: { 凶悪犯: 16, 粗暴犯: 194, 窃盗犯: 2469, 知能犯: 178, 風俗犯: 38, その他の刑法犯: 610 }
  },
  {
    label: "令和3年",
    total: 3040,
    categories: { 凶悪犯: 22, 粗暴犯: 196, 窃盗犯: 2187, 知能犯: 148, 風俗犯: 21, その他の刑法犯: 466 }
  },
  {
    label: "令和4年",
    total: 3118,
    categories: { 凶悪犯: 18, 粗暴犯: 207, 窃盗犯: 2266, 知能犯: 190, 風俗犯: 31, その他の刑法犯: 406 }
  },
  {
    label: "令和5年",
    total: 3253,
    categories: { 凶悪犯: 21, 粗暴犯: 155, 窃盗犯: 2407, 知能犯: 233, 風俗犯: 58, その他の刑法犯: 379 }
  },
  {
    label: "令和6年",
    total: 3735,
    categories: { 凶悪犯: 43, 粗暴犯: 206, 窃盗犯: 2703, 知能犯: 227, 風俗犯: 114, その他の刑法犯: 442 }
  }
];

// --- Q-11 救急出動件数 ------------------------------------------------------
export const ambulanceData = [
  {
    label: "令和2年",
    total: 32788,
    categories: {
      火災: 83,
      自然災害事故: 0,
      水難事故: 12,
      交通事故: 1624,
      労働災害事故: 207,
      運動競技事故: 67,
      一般負傷: 5251,
      加害: 185,
      自損行為: 283,
      急病: 21914,
      その他: 3162
    }
  },
  {
    label: "令和3年",
    total: 33578,
    categories: {
      火災: 60,
      自然災害事故: 3,
      水難事故: 1,
      交通事故: 1689,
      労働災害事故: 230,
      運動競技事故: 111,
      一般負傷: 5365,
      加害: 157,
      自損行為: 304,
      急病: 22075,
      その他: 3583
    }
  },
  {
    label: "令和4年",
    total: 39343,
    categories: {
      火災: 83,
      自然災害事故: 0,
      水難事故: 6,
      交通事故: 1656,
      労働災害事故: 233,
      運動競技事故: 123,
      一般負傷: 6069,
      加害: 178,
      自損行為: 271,
      急病: 27055,
      その他: 3669
    }
  },
  {
    label: "令和5年",
    total: 40860,
    categories: {
      火災: 95,
      自然災害事故: 0,
      水難事故: 6,
      交通事故: 1681,
      労働災害事故: 271,
      運動競技事故: 115,
      一般負傷: 6526,
      加害: 170,
      自損行為: 326,
      急病: 27998,
      その他: 3672
    }
  },
  {
    label: "令和6年",
    total: 41111,
    categories: {
      火災: 101,
      自然災害事故: 0,
      水難事故: 7,
      交通事故: 1804,
      労働災害事故: 292,
      運動競技事故: 163,
      一般負傷: 6735,
      加害: 200,
      自損行為: 332,
      急病: 27825,
      その他: 3652
    }
  }
];

function toSeries(rows) {
  return rows.map((row) => ({ label: row.label, total: row.total }));
}

function toComposition(rows) {
  const latest = rows[rows.length - 1];
  return {
    period: latest.label,
    data: Object.entries(latest.categories).map(([label, count]) => ({ label, count }))
  };
}

function buildInsights(rows) {
  const series = toSeries(rows);
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

export function getCrimeTotalSeries() {
  return toSeries(crimeData);
}
export function getCrimeComposition() {
  return toComposition(crimeData);
}
export function buildCrimeInsights() {
  return buildInsights(crimeData);
}

export function getAmbulanceTotalSeries() {
  return toSeries(ambulanceData);
}
export function getAmbulanceComposition() {
  return toComposition(ambulanceData);
}
export function buildAmbulanceInsights() {
  return buildInsights(ambulanceData);
}
