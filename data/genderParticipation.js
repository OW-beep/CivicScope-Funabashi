// 船橋市統計書「O 市民生活」より、女性の政策決定機関への参加状況（O-7）と
// 男女共同参画センター利用状況（O-8）のデータ。public-safety・financeと同様、
// BODIK ODCSではなく船橋市公式サイトが公開するPDFから作成した静的データです。
// 議員数・委員数から算出した比率が統計書記載の比率(%)と一致すること、
// 男女共同参画センターの相談業務内訳の合計が総数と一致することを検算済みです。
//
// 出典: 船橋市統計書「O 市民生活」（資料：市民協働課）
// https://www.city.funabashi.lg.jp/shisei/toukei/002/p146613_d/fil/24O.pdf
// 船橋市統計書 一覧: https://www.city.funabashi.lg.jp/shisei/toukei/002/index.html

// --- O-7 女性の政策決定機関への参加状況（各年4月1日現在） -----------------
export const councilData = [
  { label: "令和3年", capacity: 50, current: 49, women: 12, ratio: 24.5 },
  { label: "令和4年", capacity: 50, current: 50, women: 13, ratio: 26.0 },
  { label: "令和5年", capacity: 50, current: 48, women: 17, ratio: 35.4 },
  { label: "令和6年", capacity: 50, current: 50, women: 17, ratio: 34.0 },
  { label: "令和7年", capacity: 50, current: 49, women: 17, ratio: 34.7 }
];

export const committeeData = [
  { label: "令和3年", total: 1367, women: 402, ratio: 29.4 },
  { label: "令和4年", total: 1245, women: 393, ratio: 31.6 },
  { label: "令和5年", total: 1281, women: 393, ratio: 30.7 },
  { label: "令和6年", total: 1246, women: 384, ratio: 30.8 },
  { label: "令和7年", total: 1327, women: 398, ratio: 30.0 }
];

// --- O-8 男女共同参画センター利用状況 ------------------------------------
export const genderCenterData = [
  {
    label: "令和2年度",
    groups: 21,
    users: 987,
    consultations: { 総数: 478, 女性の生き方: 226, 男性の生き方: 165, 女性のための法律: 87 }
  },
  {
    label: "令和3年度",
    groups: 14,
    users: 1856,
    consultations: { 総数: 473, 女性の生き方: 239, 男性の生き方: 149, 女性のための法律: 85 }
  },
  {
    label: "令和4年度",
    groups: 46,
    users: 3554,
    consultations: { 総数: 493, 女性の生き方: 243, 男性の生き方: 143, 女性のための法律: 107 }
  },
  {
    label: "令和5年度",
    groups: 39,
    users: 4472,
    consultations: { 総数: 604, 女性の生き方: 311, 男性の生き方: 173, 女性のための法律: 120 }
  },
  {
    label: "令和6年度",
    groups: 46,
    users: 4471,
    consultations: { 総数: 628, 女性の生き方: 352, 男性の生き方: 144, 女性のための法律: 132 }
  }
];

function toRatioSeries(rows) {
  return rows.map((row) => ({ label: row.label, total: row.ratio }));
}

export function getCouncilRatioSeries() {
  return toRatioSeries(councilData);
}
export function getCommitteeRatioSeries() {
  return toRatioSeries(committeeData);
}
export function getGenderCenterUserSeries() {
  return genderCenterData.map((row) => ({ label: row.label, total: row.users }));
}
export function getGenderCenterConsultationComposition() {
  const latest = genderCenterData[genderCenterData.length - 1];
  const { 総数, ...rest } = latest.consultations;
  return {
    period: latest.label,
    total: 総数,
    data: Object.entries(rest).map(([label, count]) => ({ label, count }))
  };
}

function buildRatioInsights(rows) {
  if (rows.length < 2) return null;
  const latest = rows[rows.length - 1];
  const previous = rows[rows.length - 2];
  const first = rows[0];
  return {
    latest,
    previous,
    diff: +(latest.ratio - previous.ratio).toFixed(1),
    longTermDiff: +(latest.ratio - first.ratio).toFixed(1),
    first
  };
}

export function buildCouncilInsights() {
  return buildRatioInsights(councilData);
}
export function buildCommitteeInsights() {
  return buildRatioInsights(committeeData);
}

export function buildGenderCenterInsights() {
  if (genderCenterData.length < 2) return null;
  const latest = genderCenterData[genderCenterData.length - 1];
  const previous = genderCenterData[genderCenterData.length - 2];
  const first = genderCenterData[0];
  const diff = latest.users - previous.users;
  const rate = previous.users ? (diff / previous.users) * 100 : null;
  const longTermRate = first.users ? ((latest.users - first.users) / first.users) * 100 : null;
  return { latest, previous, diff, rate, first, longTermRate };
}
