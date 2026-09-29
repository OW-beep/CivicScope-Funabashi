// サイト内検索（/search）用のインデックス。記事はdata/articles.jsから、
// ダッシュボードはこの一覧から集める（Header.jsxのDASHBOARD_GROUPSと同じ内容を
// 二重管理しないよう、本来はHeader側もここを参照するのが望ましいが、
// Headerのレイアウト都合上いまは手動で同期している。ダッシュボードを追加・変更したら
// 両方に反映すること）。
import { getArticlesSortedByDate } from "./articles";

export const DASHBOARDS = [
  { href: "/dashboard", label: "人口ダッシュボード", keywords: "人口 常住人口 世帯" },
  { href: "/senior-housing", label: "高齢者向け住宅ダッシュボード", keywords: "サ高住 高齢化率 高齢者" },
  { href: "/welfare", label: "生活保護ダッシュボード", keywords: "生活保護 被保護世帯" },
  { href: "/finance", label: "財政ダッシュボード", keywords: "財政 歳出 歳入 市債 予算 決算" },
  { href: "/citizen-consultation", label: "市民相談ダッシュボード", keywords: "市民相談 要望 電子ポスト" },
  { href: "/children", label: "子ども・子育てダッシュボード", keywords: "子育て 出生数 児童" },
  { href: "/schools", label: "学校ダッシュボード", keywords: "学校 中学校 生徒数" },
  { href: "/childcare", label: "保育園ダッシュボード", keywords: "保育園 保育施設 待機児童" },
  { href: "/parks", label: "公園・広場ダッシュボード", keywords: "公園 広場 いきいきふれあいマップ" },
  { href: "/area-map", label: "エリアマップ", keywords: "エリア 地域 地図" },
  { href: "/district-explorer", label: "地区マップ", keywords: "町丁 地区 人口 世帯数" },
  { href: "/chokai", label: "町会・自治会ダッシュボード", keywords: "町会 自治会 一覧 マップ" },
  { href: "/dog-registration", label: "犬の登録ダッシュボード", keywords: "犬 登録 狂犬病予防注射" },
  { href: "/rail-ridership", label: "鉄道駅別乗車人員ダッシュボード", keywords: "駅 乗降客数 乗車人員 定期券" },
  { href: "/bus-ridership", label: "バス運輸状況ダッシュボード", keywords: "バス 運輸 走行キロ" },
  { href: "/public-safety", label: "治安・救急ダッシュボード", keywords: "治安 救急 刑法犯 出動件数" },
  { href: "/disaster-prevention", label: "防災ダッシュボード", keywords: "防災 避難所 避難場所 AED" },
  { href: "/food-businesses", label: "食品営業施設ダッシュボード", keywords: "飲食店 食品営業 施設" },
  { href: "/life-sanitation", label: "生活衛生施設ダッシュボード", keywords: "生活衛生 理美容 クリーニング" },
  { href: "/gender-participation", label: "女性参画ダッシュボード", keywords: "女性参画 男女共同参画 審議会" },
  { href: "/employment", label: "雇用・求人ダッシュボード", keywords: "雇用 求人 求職 就職" }
];

function normalize(s) {
  return (s || "").toLowerCase();
}

export function searchSite(query) {
  const q = normalize(query).trim();
  if (!q) return { articles: [], dashboards: [] };

  const articles = getArticlesSortedByDate()
    .map((a) => {
      const hay = normalize(`${a.title} ${a.excerpt} ${a.tag}`);
      const score = hay.includes(q) ? (normalize(a.title).includes(q) ? 2 : 1) : 0;
      return { ...a, score };
    })
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score);

  const dashboards = DASHBOARDS.map((d) => {
    const hay = normalize(`${d.label} ${d.keywords}`);
    const score = hay.includes(q) ? (normalize(d.label).includes(q) ? 2 : 1) : 0;
    return { ...d, score };
  })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score);

  return { articles, dashboards };
}
