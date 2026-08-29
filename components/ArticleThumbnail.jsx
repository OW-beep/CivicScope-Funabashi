// 記事一覧・トップページの記事カードに使う、自動生成のサムネイル画像。
// 53本の記事すべてに個別の描き下ろしイラストを用意するのは現実的ではないため、
// 記事の tag（テーマ）に応じた配色＋アイコンで、SVGを都度自動生成している。
// 同じtagの記事内でも見た目に変化が出るよう、slugから簡単なハッシュ値を作り、
// アイコンの向き・背景の模様を少しずつ変えている。

// data/articles.js の tag 文字列 → カテゴリカラーの対応表
const TAG_TO_CATEGORY = {
  "人口・世帯": "life",
  "行政・財政": "life",
  "暮らし・安全": "life",
  "教育・子育て": "kids",
  "地域・コミュニティ": "town",
  "防災・安全": "safety",
  "サイト案内": "meta"
};

// カテゴリごとの塗り色（tailwind.config.jsのcategoryカラーと合わせた実際の16進値）
const CATEGORY_COLORS = {
  life: { bg: "#8C3A42", bgLight: "#A85159" },
  kids: { bg: "#EFAE1C", bgLight: "#F2BF4C" },
  town: { bg: "#5B9A4F", bgLight: "#75AE6B" },
  safety: { bg: "#D9435C", bgLight: "#E06A7E" },
  transit: { bg: "#2E74B5", bgLight: "#5490C4" },
  social: { bg: "#9C3B7A", bgLight: "#B15C93" },
  meta: { bg: "#26313B", bgLight: "#3E4B57" }
};

function hashSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

// アイコンは白抜きのシンプルな線画。カテゴリごとに2種類ずつ用意し、
// slugのハッシュで割り振ることで単調にならないようにしている。
const ICONS = {
  life: [
    // 人（人口・世帯むけ）
    <g key="people">
      <circle cx="0" cy="-14" r="9" />
      <path d="M -18 20 C -18 2 -8 -6 0 -6 C 8 -6 18 2 18 20 Z" />
    </g>,
    // コイン（財政むけ）
    <g key="coin">
      <circle cx="0" cy="0" r="24" fill="none" stroke="white" strokeWidth="4" />
      <text x="0" y="9" textAnchor="middle" fontSize="26" fontWeight="800" fill="white">¥</text>
    </g>
  ],
  kids: [
    // 卒業帽（教育むけ）
    <g key="cap">
      <path d="M -26 -6 L 0 -18 L 26 -6 L 0 6 Z" />
      <path d="M -14 0 L -14 14 C -14 20 14 20 14 14 L 14 0 L 0 8 Z" opacity="0.85" />
    </g>,
    // 鉛筆（学び・子育てむけ）
    <g key="pencil">
      <rect x="-6" y="-24" width="12" height="38" rx="2" />
      <path d="M -6 14 L 6 14 L 0 26 Z" />
    </g>
  ],
  town: [
    // 家（地域・コミュニティむけ）
    <g key="house">
      <path d="M -24 4 L 0 -20 L 24 4 L 24 26 L -24 26 Z" />
      <rect x="-8" y="8" width="16" height="18" fill="currentColor" className="text-category-town" opacity="0" />
    </g>,
    // 木（自然・里山むけ）
    <g key="tree">
      <circle cx="0" cy="-10" r="18" />
      <rect x="-4" y="8" width="8" height="18" />
    </g>
  ],
  safety: [
    // 盾（防災・安全むけ）
    <g key="shield">
      <path d="M 0 -24 L 22 -14 L 22 6 C 22 20 12 28 0 32 C -12 28 -22 20 -22 6 L -22 -14 Z" />
    </g>,
    // 警報（防災むけ）
    <g key="siren">
      <path d="M -16 20 L -16 4 C -16 -10 -6 -20 0 -20 C 6 -20 16 -10 16 4 L 16 20 Z" />
      <rect x="-20" y="20" width="40" height="6" rx="2" />
    </g>
  ],
  transit: [
    <g key="train">
      <rect x="-18" y="-20" width="36" height="34" rx="8" />
      <circle cx="-9" cy="18" r="4" fill="#26313B" />
      <circle cx="9" cy="18" r="4" fill="#26313B" />
    </g>
  ],
  social: [
    <g key="handshake">
      <circle cx="-14" cy="-14" r="9" />
      <circle cx="14" cy="-14" r="9" />
      <path d="M -26 18 C -26 4 -16 -2 -14 -2 C -6 -2 -2 6 0 6 C 2 6 6 -2 14 -2 C 16 -2 26 4 26 18 Z" />
    </g>
  ],
  meta: [
    <g key="scope">
      <circle cx="0" cy="0" r="20" fill="none" stroke="white" strokeWidth="5" />
      <circle cx="0" cy="0" r="8" fill="none" stroke="white" strokeWidth="5" />
      <line x1="0" y1="-30" x2="0" y2="-24" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <line x1="0" y1="24" x2="0" y2="30" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <line x1="-30" y1="0" x2="-24" y2="0" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <line x1="24" y1="0" x2="30" y2="0" stroke="white" strokeWidth="5" strokeLinecap="round" />
    </g>
  ]
};

export default function ArticleThumbnail({ tag, slug, className = "" }) {
  const categoryKey = TAG_TO_CATEGORY[tag] || "meta";
  const colors = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.meta;
  const icons = ICONS[categoryKey] || ICONS.meta;
  const hash = hashSlug(slug || tag || "");
  const icon = icons[hash % icons.length];
  // 背景の水玉模様の位置を少しずらして、同カテゴリでも単調にならないようにする
  const dotOffsetX = (hash % 40) - 20;
  const dotOffsetY = ((hash >> 4) % 30) - 15;

  return (
    <svg
      viewBox="0 0 320 180"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="320" height="180" fill={colors.bg} />
      {/* 装飾用の水玉パターン */}
      <g fill={colors.bgLight} opacity="0.5">
        <circle cx={40 + dotOffsetX} cy={30 + dotOffsetY} r="26" />
        <circle cx={280 + dotOffsetX} cy={150 + dotOffsetY} r="34" />
        <circle cx={260 - dotOffsetX} cy={20} r="14" />
      </g>
      <g transform="translate(160 90) scale(1.5)" fill="white">
        {icon}
      </g>
    </svg>
  );
}
