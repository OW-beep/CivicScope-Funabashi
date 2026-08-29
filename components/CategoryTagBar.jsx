import Link from "next/link";
import { CATEGORY_LIST } from "../data/categories";

// 全ページ共通のタグナビゲーションバー（Fukuoka Factsの「タグで見る」帯を参考にした構成）。
// 「タグで見る」ラベル＋分野ごとに色分けされたタグを横一列に並べ、どのページからでも
// トップページの該当カテゴリ（#cat-xxx）へ1タップで移動できるようにしている。
// 背景色は各カテゴリのDEFAULT（濃い実色）を直接使用するため、
// tailwind.config.jsのcategoryカラーをそのままクラス名で参照している。
const BAR_ITEMS = [
  { key: "life", bg: "bg-category-life", text: "text-white" },
  { key: "kids", bg: "bg-category-kids", text: "text-ink" },
  { key: "town", bg: "bg-category-town", text: "text-white" },
  { key: "transit", bg: "bg-category-transit", text: "text-white" },
  { key: "safety", bg: "bg-category-safety", text: "text-white" },
  { key: "social", bg: "bg-category-social", text: "text-white" }
];

export default function CategoryTagBar() {
  return (
    <nav aria-label="カテゴリで見る" className="w-full overflow-x-auto border-b border-ink/10 bg-brass">
      <div className="flex min-w-max items-stretch text-xs font-bold sm:text-sm">
        <span className="flex items-center gap-1 whitespace-nowrap px-4 py-2.5 text-white">
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
            <path d="M2 9.5V4a2 2 0 0 1 2-2h5.5a2 2 0 0 1 1.41.59l6.5 6.5a2 2 0 0 1 0 2.82l-5.5 5.5a2 2 0 0 1-2.82 0l-6.5-6.5A2 2 0 0 1 2 9.5zM6 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
          </svg>
          タグで見る
          <span aria-hidden="true">▶</span>
        </span>
        {BAR_ITEMS.map((item) => {
          const cat = CATEGORY_LIST.find((c) => c.key === item.key);
          return (
            <Link
              key={item.key}
              href={`/#cat-${item.key}`}
              className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 ${item.bg} ${item.text} transition-opacity hover:opacity-90`}
            >
              <span aria-hidden="true">{cat.emoji}</span>
              {cat.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
