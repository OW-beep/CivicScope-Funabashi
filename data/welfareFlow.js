// BODIK ODCS「(生活保護)生活保護の相談・開始・廃止の年度別推移」より（作成：生活支援課）。
// 元データの年度表記が他の生活保護系データセットと同様、和暦プレフィックスなしの数字のみ
// （例:「26」「30」「元」「2」）のため、agingRatio.js・protectionRate.jsと同様に
// 位置ベースで年度を補い、静的データとして保持している。
//
// 出典: https://data.bodik.jp/dataset/122041_seihosoudankaisihaisi
export const consultationFlowData = [
  { label: "平成26年度", consultations: 2266, applications: 1094, rejected: 249, startHouseholds: 845, startPersons: 1123, endHouseholds: 743, endPersons: 950 },
  { label: "平成27年度", consultations: 2092, applications: 1062, rejected: 210, startHouseholds: 852, startPersons: 1165, endHouseholds: 803, endPersons: 1014 },
  { label: "平成28年度", consultations: 2058, applications: 1190, rejected: 279, startHouseholds: 911, startPersons: 1199, endHouseholds: 769, endPersons: 960 },
  { label: "平成29年度", consultations: 1958, applications: 1155, rejected: 254, startHouseholds: 901, startPersons: 1154, endHouseholds: 781, endPersons: 966 },
  { label: "平成30年度", consultations: 1902, applications: 1179, rejected: 313, startHouseholds: 866, startPersons: 1128, endHouseholds: 766, endPersons: 920 },
  { label: "令和元年度", consultations: 1995, applications: 1261, rejected: 370, startHouseholds: 891, startPersons: 1174, endHouseholds: 786, endPersons: 986 },
  { label: "令和2年度", consultations: 2032, applications: 1162, rejected: 301, startHouseholds: 861, startPersons: 1066, endHouseholds: 777, endPersons: 918 },
  { label: "令和3年度", consultations: 2056, applications: 1261, rejected: 308, startHouseholds: 953, startPersons: 1193, endHouseholds: 769, endPersons: 903 },
  { label: "令和4年度", consultations: 1968, applications: 1170, rejected: 302, startHouseholds: 868, startPersons: 1134, endHouseholds: 847, endPersons: 978 },
  { label: "令和5年度", consultations: 1959, applications: 1200, rejected: 322, startHouseholds: 878, startPersons: 1098, endHouseholds: 820, endPersons: 964 },
  { label: "令和6年度", consultations: 1948, applications: 1191, rejected: 333, startHouseholds: 858, startPersons: 1085, endHouseholds: 886, endPersons: 1066 }
];

export function getConsultationSeries() {
  return consultationFlowData.map((row) => ({ label: row.label, total: row.consultations }));
}

export function getStartEndComposition() {
  const latest = consultationFlowData[consultationFlowData.length - 1];
  return {
    period: latest.label,
    data: [
      { label: "開始世帯数", count: latest.startHouseholds },
      { label: "廃止世帯数", count: latest.endHouseholds }
    ]
  };
}

export function buildConsultationInsights() {
  const rows = consultationFlowData;
  const latest = rows[rows.length - 1];
  const first = rows[0];
  const netHouseholdChange = latest.startHouseholds - latest.endHouseholds;
  return {
    latest,
    first,
    netHouseholdChange,
    consultationLongTermRate: ((latest.consultations - first.consultations) / first.consultations) * 100
  };
}
