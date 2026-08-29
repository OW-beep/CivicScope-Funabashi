import Link from "next/link";
import { CATEGORY_LIST, CATEGORY_CLASSES } from "../data/categories";

// 全ページ共通のカテゴリナビゲーション。
// Fukuoka Factsの「タグで見る」帯（隙間なく並んだ単色の長方形）と機能は近いが、
// 見た目がほぼ同じにならないよう、あえて別のデザイン言語にしている：
//   ・隙間なく並ぶ「帯」ではなく、1つ1つ独立した丸ピル（チップ）
//   ・単色の背景ではなく、白背景＋カテゴリカラーのアイコン丸バッジ＋下線アクセント
//   ・帯の下端は東京湾の波を思わせる、ゆるい波形の縁取り
// ラベルも「タグで見る」ではなく、ブランドのScopeMark（測量スコープ）モチーフを使った
// 「カテゴリでさがす」にして、独自の見た目にしている。
export default function CategoryTagBar() {
  return (
    <nav aria-label="カテゴリでさがす" className="relative border-b border-ink/10 bg-paper-dark/60">
      <div className="mx-auto flex max-w-5xl items-center gap-2 overflow-x-auto px-4 py-2.5 sm:gap-2.5">
        <span className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap pr-2 text-xs font-bold text-ink-soft sm:text-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-brass" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            <line x1="12" y1="1.5" x2="12" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="12" y1="20" x2="12" y2="22.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          カテゴリでさがす
        </span>
        <span className="h-5 w-px flex-shrink-0 bg-ink/10" aria-hidden="true" />
        {CATEGORY_LIST.map((cat) => {
          const cls = CATEGORY_CLASSES[cat.key];
          return (
            <Link
              key={cat.key}
              href={`/#cat-${cat.key}`}
              className="group flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-ink/10 bg-white py-1.5 pl-1.5 pr-3 text-xs font-bold text-ink-soft shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-pop sm:text-sm"
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${cls.dot} text-sm`}>
                {cat.emoji}
              </span>
              <span className={`transition-colors ${cls.groupHoverText}`}>{cat.label}</span>
            </Link>
          );
        })}
      </div>
      {/* 帯の下端に、東京湾の波をイメージしたゆるい波線 */}
      <svg
        viewBox="0 0 400 8"
        preserveAspectRatio="none"
        className="block h-2 w-full text-bay/40"
        aria-hidden="true"
      >
        <path d="M0 4 C 25 0, 75 8, 100 4 S 175 0, 200 4 S 275 8, 300 4 S 375 0, 400 4" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </nav>
  );
}
