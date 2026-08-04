// 船橋市統計書「O 市民生活」O-1 市民相談状況（資料：市民の声を聞く課）より。
// BODIK ODCSではなく船橋市公式サイトが公開するPDFから作成した静的データです。
// 内訳合計が総数と一致することを検算済み（法律+生活=市民相談一般、
// 市政電子ポスト+郵便+その他=市民の要望等、両者の合計=総数）。
// 出典: 船橋市統計書「O 市民生活」
// https://www.city.funabashi.lg.jp/shisei/toukei/002/p146613_d/fil/24O.pdf
// 船橋市統計書 一覧: https://www.city.funabashi.lg.jp/shisei/toukei/002/index.html
export const consultationData = [
  {
    label: "令和2年度",
    total: 14862,
    general: { 法律: 1153, 生活: 1399 },
    requests: { 市政電子ポスト: 1181, 郵便: 81, その他: 11048 }
  },
  {
    label: "令和3年度",
    total: 14957,
    general: { 法律: 1241, 生活: 1570 },
    requests: { 市政電子ポスト: 889, 郵便: 183, その他: 11074 }
  },
  {
    label: "令和4年度",
    total: 13748,
    general: { 法律: 1257, 生活: 1547 },
    requests: { 市政電子ポスト: 2237, 郵便: 164, その他: 8543 }
  },
  {
    label: "令和5年度",
    total: 12462,
    general: { 法律: 1248, 生活: 1424 },
    requests: { 市政電子ポスト: 1793, 郵便: 111, その他: 7886 }
  },
  {
    label: "令和6年度",
    total: 11992,
    general: { 法律: 1255, 生活: 1252 },
    requests: { 市政電子ポスト: 1833, 郵便: 93, その他: 7559 }
  }
];

export function getTotalSeries() {
  return consultationData.map((row) => ({ label: row.label, total: row.total }));
}

export function getComposition() {
  const latest = consultationData[consultationData.length - 1];
  return {
    period: latest.label,
    data: [
      ...Object.entries(latest.general).map(([label, count]) => ({ label: `${label}相談`, count })),
      ...Object.entries(latest.requests).map(([label, count]) => ({ label, count }))
    ]
  };
}

export function buildInsights() {
  const rows = consultationData;
  if (rows.length < 2) return null;
  const latest = rows[rows.length - 1];
  const previous = rows[rows.length - 2];
  const first = rows[0];
  const diff = latest.total - previous.total;
  const rate = previous.total ? (diff / previous.total) * 100 : null;
  const longTermRate = first.total ? ((latest.total - first.total) / first.total) * 100 : null;
  return { latest, previous, first, diff, rate, longTermRate };
}
