// ダッシュボードの分野（カテゴリ）ごとの表示名・色・簡易アイコン（絵文字）定義。
// Header（ナビゲーション）とトップページのカテゴリ帯・ダッシュボード一覧で共通して使う。
// 色は tailwind.config.js の theme.extend.colors.category に対応させている。
export const CATEGORIES = {
  life: { label: "人口・くらし", color: "life", emoji: "🏠" },
  kids: { label: "子育て・教育", color: "kids", emoji: "👨‍👩‍👧" },
  town: { label: "まち・環境", color: "town", emoji: "🌳" },
  transit: { label: "交通", color: "transit", emoji: "🚃" },
  safety: { label: "安全・衛生", color: "safety", emoji: "🛟" },
  social: { label: "社会参画", color: "social", emoji: "🤝" }
};

export const CATEGORY_LIST = Object.entries(CATEGORIES).map(([key, value]) => ({ key, ...value }));

// TailwindはJIT時にソースコード中の「リテラルなクラス名」しか検出できないため、
// `text-category-${key}-dark` のような動的な文字列組み立てはビルドされない。
// そのため、使用する組み合わせをここに文字列として書き出しておく。
// hoverText等は「hover:text-category-life-dark」のように、variant込みの完全な文字列を
// そのままここに書いている。テンプレートリテラルで組み立てた文字列はTailwindのJITが
// クラス名として検出できないため、必ずこの形（完全な1トークン）で用意する必要がある。
export const CATEGORY_CLASSES = {
  life: {
    dot: "bg-category-life",
    text: "text-category-life-dark",
    hoverText: "hover:text-category-life-dark",
    groupHoverText: "group-hover:text-category-life-dark",
    bgSoft: "bg-category-life-light",
    hoverBorder: "hover:border-category-life"
  },
  kids: {
    dot: "bg-category-kids",
    text: "text-category-kids-dark",
    hoverText: "hover:text-category-kids-dark",
    groupHoverText: "group-hover:text-category-kids-dark",
    bgSoft: "bg-category-kids-light",
    hoverBorder: "hover:border-category-kids"
  },
  town: {
    dot: "bg-category-town",
    text: "text-category-town-dark",
    hoverText: "hover:text-category-town-dark",
    groupHoverText: "group-hover:text-category-town-dark",
    bgSoft: "bg-category-town-light",
    hoverBorder: "hover:border-category-town"
  },
  transit: {
    dot: "bg-category-transit",
    text: "text-category-transit-dark",
    hoverText: "hover:text-category-transit-dark",
    groupHoverText: "group-hover:text-category-transit-dark",
    bgSoft: "bg-category-transit-light",
    hoverBorder: "hover:border-category-transit"
  },
  safety: {
    dot: "bg-category-safety",
    text: "text-category-safety-dark",
    hoverText: "hover:text-category-safety-dark",
    groupHoverText: "group-hover:text-category-safety-dark",
    bgSoft: "bg-category-safety-light",
    hoverBorder: "hover:border-category-safety"
  },
  social: {
    dot: "bg-category-social",
    text: "text-category-social-dark",
    hoverText: "hover:text-category-social-dark",
    groupHoverText: "group-hover:text-category-social-dark",
    bgSoft: "bg-category-social-light",
    hoverBorder: "hover:border-category-social"
  }
};
