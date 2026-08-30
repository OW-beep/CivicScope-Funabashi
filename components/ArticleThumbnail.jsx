// 記事一覧・トップページの記事カードに使う記事サムネイル。
// MITライセンスのunDraw（undraw.co）イラストを、記事のtag（カテゴリ）に応じた
// 配色へ塗り替えて使っている（public/illustrations/ 以下に格納済み）。
//
// 単なるカテゴリ分けだけでなく、タイトルに含まれるキーワードから記事の内容に
// 近いイラストを直接指定する CONTENT_OVERRIDES を先にチェックし、該当がなければ
// カテゴリごとのプールからslugのハッシュで選ぶ、という2段構えにしている
// （例：「犬」を含む記事は必ず犬のイラスト、「地価」を含む記事は必ず住宅のイラスト）。

const TAG_TO_CATEGORY = {
  "人口・世帯": "life",
  "行政・財政": "life",
  "暮らし・安全": "life",
  "教育・子育て": "kids",
  "地域・コミュニティ": "town",
  "防災・安全": "safety",
  "サイト案内": "meta"
};

const CATEGORY_BG = {
  life: ["#D98891", "#8C3A42"],
  kids: ["#F7D888", "#EFAE1C"],
  town: ["#9ECB92", "#5B9A4F"],
  transit: ["#7FB2DA", "#2E74B5"],
  safety: ["#EC96A5", "#D9435C"],
  social: ["#CB8AB2", "#9C3B7A"],
  meta: ["#5A6975", "#26313B"]
};

// カテゴリごとのイラストのプール（キーワード一致がない場合、この中からslugのハッシュで選ぶ）
const CATEGORY_ILLUSTRATIONS = {
  life: ["life-family", "life-houses", "life-budgeting", "life-dog", "life-reading-book", "life-voting", "life-apartment-rent", "life-chef"],
  kids: ["kids-children", "kids-graduation", "kids-eating-together"],
  town: ["town-neighbors", "town-at-the-park", "town-farming", "town-fishing", "town-beach-day", "town-moving", "town-celebrating"],
  transit: ["transit-subway", "transit-bus-stop"],
  safety: ["safety-security", "safety-safe", "safety-weather-forecast", "safety-medical-care", "safety-warning"],
  social: ["social-team", "social-teamwork", "social-handshake-deal"],
  meta: ["meta-welcome", "meta-explore", "meta-statistics"]
};

// タイトルに含まれるキーワードから、内容にぴったりのイラストを直接指定する。
// 上から順に判定し、最初に一致したものを採用する。
const CONTENT_OVERRIDES = [
  { test: /犬|狂犬病/, illustration: "life-dog" },
  { test: /AED|救急|心肺/, illustration: "safety-medical-care" },
  { test: /詐欺|フィッシング|不審/, illustration: "safety-warning" },
  { test: /図書館|蔵書/, illustration: "life-reading-book" },
  { test: /投票率|市議選|市長選/, illustration: "life-voting" },
  { test: /農業|野菜|梨/, illustration: "town-farming" },
  { test: /漁業|漁師|漁船|魚種/, illustration: "town-fishing" },
  { test: /三番瀬|干潟/, illustration: "town-beach-day" },
  { test: /転入|転出|社会動態/, illustration: "town-moving" },
  { test: /市民まつり|祭り/, illustration: "town-celebrating" },
  { test: /地価/, illustration: "life-apartment-rent" },
  { test: /給食/, illustration: "kids-eating-together" },
  { test: /食品営業|飲食店/, illustration: "life-chef" },
  { test: /e-Stat|オープンデータ|統計とは|学校基本調査/, illustration: "meta-statistics" }
];

function hashSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

export default function ArticleThumbnail({ tag, slug, title, className = "" }) {
  const categoryKey = TAG_TO_CATEGORY[tag] || "meta";
  const [bgLight, bgDark] = CATEGORY_BG[categoryKey] || CATEGORY_BG.meta;

  const matched = title ? CONTENT_OVERRIDES.find((rule) => rule.test.test(title)) : null;
  const illustrations = CATEGORY_ILLUSTRATIONS[categoryKey] || CATEGORY_ILLUSTRATIONS.meta;
  const hash = hashSlug(slug || tag || "");
  const illustration = matched ? matched.illustration : illustrations[hash % illustrations.length];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, ${bgLight}, ${bgDark})` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/illustrations/${illustration}.svg`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-contain object-bottom p-1"
      />
      {title ? (
        <div className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-2.5 py-1.5 text-xs font-bold text-white">
          {title}
        </div>
      ) : null}
    </div>
  );
}
