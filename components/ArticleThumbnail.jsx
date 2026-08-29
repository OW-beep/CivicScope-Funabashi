// 記事一覧・トップページの記事カードに使う、自動生成のサムネイル画像。
// 53本の記事すべてに個別の描き下ろしイラストを用意するのは現実的ではないため、
// 記事の tag（テーマ）に応じた配色＋アイコンで、SVGを都度自動生成している。
// アイコンは単純な図形1つだけにせず、複数のパーツを組み合わせて「らしさ」が
// 伝わるように描き込んでいる（例：人＝親子2人＋吹き出し、家＝屋根・窓・煙突など）。
// 同じtagの記事内でも見た目に変化が出るよう、slugから簡単なハッシュ値を作り、
// アイコンの種類・背景模様の位置を少しずつ変えている。

const TAG_TO_CATEGORY = {
  "人口・世帯": "life",
  "行政・財政": "life",
  "暮らし・安全": "life",
  "教育・子育て": "kids",
  "地域・コミュニティ": "town",
  "防災・安全": "safety",
  "サイト案内": "meta"
};

const CATEGORY_COLORS = {
  life: { bg: "#8C3A42", bgLight: "#A85159", bgDark: "#6E2B33" },
  kids: { bg: "#EFAE1C", bgLight: "#F2BF4C", bgDark: "#C98E12" },
  town: { bg: "#5B9A4F", bgLight: "#75AE6B", bgDark: "#457A3B" },
  safety: { bg: "#D9435C", bgLight: "#E06A7E", bgDark: "#B22F46" },
  transit: { bg: "#2E74B5", bgLight: "#5490C4", bgDark: "#215A8E" },
  social: { bg: "#9C3B7A", bgLight: "#B15C93", bgDark: "#78295E" },
  meta: { bg: "#26313B", bgLight: "#3E4B57", bgDark: "#141B21" }
};

function hashSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

// アイコンはカテゴリごとに2種類。パーツを組み合わせて描き込み、単純な1図形で
// 終わらないようにしている。すべて translate(160 90) の中心基準で配置。
const ICONS = {
  life: [
    // 親子（人口・世帯）：大人＋子ども＋足元の小さな線影
    <g key="family">
      <circle cx="-10" cy="-18" r="10" />
      <path d="M -24 22 C -24 2 -16 -6 -10 -6 C -4 -6 4 2 4 22 Z" />
      <circle cx="16" cy="-6" r="7" />
      <path d="M 5 22 C 5 8 10 2 16 2 C 22 2 27 8 27 22 Z" />
      <ellipse cx="0" cy="27" rx="30" ry="3" opacity="0.25" />
    </g>,
    // コイン（財政）：重なった2枚のコイン＋キラリ
    <g key="coin">
      <circle cx="-8" cy="6" r="20" opacity="0.55" />
      <circle cx="8" cy="-6" r="22" />
      <text x="8" y="2" textAnchor="middle" fontSize="20" fontWeight="800" fill="currentColor">¥</text>
      <path d="M -30 -14 L -26 -10 M -30 -6 L -25 -6" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    </g>
  ],
  kids: [
    // 卒業帽＋リボン＋星
    <g key="cap">
      <path d="M -30 -8 L 0 -22 L 30 -8 L 0 6 Z" />
      <path d="M -16 -1 L -16 15 C -16 22 16 22 16 15 L 16 -1 L 0 7 Z" opacity="0.85" />
      <circle cx="24" cy="-6" r="2.5" fill="white" />
      <path d="M 24 -3 L 24 12" stroke="currentColor" strokeWidth="2.5" />
      <path d="M 24 12 L 20 17 L 28 17 Z" />
      <circle cx="-20" cy="-24" r="2" fill="white" opacity="0.9" />
      <circle cx="14" cy="-28" r="1.5" fill="white" opacity="0.7" />
    </g>,
    // 鉛筆＋ノート＋ハート
    <g key="pencil">
      <rect x="-28" y="4" width="34" height="24" rx="3" opacity="0.5" />
      <path d="M -22 12 L -4 12 M -22 18 L -10 18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <g transform="translate(14 0) rotate(18)">
        <rect x="-6" y="-28" width="12" height="40" rx="2" />
        <path d="M -6 12 L 6 12 L 0 26 Z" />
        <rect x="-6" y="-28" width="12" height="7" opacity="0.6" />
      </g>
      <path d="M 20 -20 C 22 -24 28 -24 28 -19 C 28 -15 22 -11 20 -9 C 18 -11 12 -15 12 -19 C 12 -24 18 -24 20 -20 Z" opacity="0.9" />
    </g>
  ],
  town: [
    // 家：屋根・壁・ドア・窓・煙突
    <g key="house">
      <path d="M -28 6 L 0 -22 L 28 6 L 28 28 L -28 28 Z" />
      <rect x="-8" y="10" width="16" height="18" opacity="0.55" />
      <rect x="-20" y="12" width="9" height="9" opacity="0.5" />
      <rect x="11" y="12" width="9" height="9" opacity="0.5" />
      <rect x="14" y="-24" width="6" height="12" opacity="0.7" />
      <path d="M 20 -30 C 22 -33 19 -35 20 -38" stroke="white" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />
    </g>,
    // 木：幹＋葉のかたまり＋落ち葉
    <g key="tree">
      <rect x="-4" y="6" width="8" height="22" opacity="0.6" />
      <circle cx="-14" cy="-8" r="14" opacity="0.75" />
      <circle cx="12" cy="-6" r="15" opacity="0.85" />
      <circle cx="0" cy="-20" r="15" />
      <ellipse cx="24" cy="24" rx="5" ry="3" opacity="0.5" transform="rotate(20 24 24)" />
    </g>
  ],
  safety: [
    // 盾＋チェックマーク
    <g key="shield">
      <path d="M 0 -26 L 24 -15 L 24 6 C 24 22 12 30 0 34 C -12 30 -24 22 -24 6 L -24 -15 Z" />
      <path d="M -10 2 L -2 12 L 14 -8" stroke="white" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
    </g>,
    // 警報灯：光が広がる表現つき
    <g key="siren">
      <path d="M -14 4 L -14 22 L 14 22 L 14 4 C 14 -8 6 -16 0 -16 C -6 -16 -14 -8 -14 4 Z" />
      <rect x="-18" y="22" width="36" height="6" rx="2" />
      <circle cx="0" cy="-4" r="4" fill="white" opacity="0.9" />
      <path d="M -6 -22 L -10 -28 M 6 -22 L 10 -28 M 0 -24 L 0 -31" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    </g>
  ],
  transit: [
    <g key="train">
      <rect x="-20" y="-22" width="40" height="38" rx="9" />
      <rect x="-14" y="-14" width="12" height="12" rx="2" opacity="0.6" />
      <rect x="2" y="-14" width="12" height="12" rx="2" opacity="0.6" />
      <circle cx="-10" cy="19" r="5" fill="#26313B" />
      <circle cx="10" cy="19" r="5" fill="#26313B" />
      <circle cx="-10" cy="19" r="2" fill="white" />
      <circle cx="10" cy="19" r="2" fill="white" />
      <path d="M -26 -22 L -20 -22 M 20 -22 L 26 -22" stroke="white" strokeWidth="2.5" opacity="0.6" strokeLinecap="round" />
    </g>
  ],
  social: [
    <g key="handshake">
      <circle cx="-16" cy="-16" r="10" />
      <circle cx="16" cy="-16" r="10" />
      <path d="M -30 20 C -30 4 -18 -3 -15 -3 C -6 -3 -2 6 0 6 C 2 6 6 -3 15 -3 C 18 -3 30 4 30 20 Z" />
      <path d="M -2 -30 C 0 -34 6 -34 6 -29 C 6 -25 0 -21 -2 -19 C -4 -21 -10 -25 -10 -29 C -10 -34 -4 -34 -2 -30 Z" opacity="0.9" />
    </g>
  ],
  meta: [
    <g key="scope">
      <circle cx="0" cy="0" r="22" fill="none" stroke="white" strokeWidth="5" />
      <circle cx="0" cy="0" r="9" fill="none" stroke="white" strokeWidth="5" />
      <circle cx="0" cy="0" r="2.5" fill="white" />
      <line x1="0" y1="-32" x2="0" y2="-25" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <line x1="0" y1="25" x2="0" y2="32" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <line x1="-32" y1="0" x2="-25" y2="0" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <line x1="25" y1="0" x2="32" y2="0" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <circle cx="26" cy="-20" r="3" fill="white" opacity="0.7" />
    </g>
  ]
};

export default function ArticleThumbnail({ tag, slug, className = "" }) {
  const categoryKey = TAG_TO_CATEGORY[tag] || "meta";
  const colors = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.meta;
  const icons = ICONS[categoryKey] || ICONS.meta;
  const hash = hashSlug(slug || tag || "");
  const icon = icons[hash % icons.length];
  const dotOffsetX = (hash % 40) - 20;
  const dotOffsetY = ((hash >> 4) % 30) - 15;
  const gradId = `thumb-grad-${categoryKey}-${hash % 997}`;

  return (
    <svg
      viewBox="0 0 320 180"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ color: colors.bgDark }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={colors.bg} />
          <stop offset="1" stopColor={colors.bgDark} />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#${gradId})`} />

      {/* 装飾：水玉＋薄い点線の弧で、単なる単色背景より少し賑やかに */}
      <g fill={colors.bgLight} opacity="0.45">
        <circle cx={44 + dotOffsetX} cy={34 + dotOffsetY} r="28" />
        <circle cx={276 + dotOffsetX} cy={148 + dotOffsetY} r="36" />
        <circle cx={252 - dotOffsetX} cy={24} r="12" />
      </g>
      <path
        d="M -10 150 C 60 120, 120 170, 200 140 S 320 110, 340 130"
        stroke="white"
        strokeWidth="2"
        strokeDasharray="2 8"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
      />

      <g transform="translate(160 88) scale(1.35)" fill="white">
        {icon}
      </g>
    </svg>
  );
}
