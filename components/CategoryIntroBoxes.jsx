import Link from "next/link";
import { CATEGORY_LIST, CATEGORY_CLASSES } from "../data/categories";

// カテゴリごとの紹介ボックス。アイコンがふわっと上下に浮かぶアニメーション付きで、
// トップページのタグ一覧（ヒーロー内のカテゴリピル）のすぐ下にセクションとして表示する。
// 各カテゴリの説明文はここに直書きしている（description.jsのような別ファイルに
// 分けるほどの分量ではないため）。
const DESCRIPTIONS = {
  life: "人口・財政・福祉など、暮らしの土台になる数字を集めました。",
  kids: "子育て・保育・学校など、子どもにまつわる船橋市のデータです。",
  town: "公園や町会・自治会など、まちと環境に関する数字です。",
  transit: "駅別の乗車人員やバスの利用状況など、船橋の交通データです。",
  safety: "防災・食品衛生など、安心・安全に関わる数字をまとめました。",
  social: "雇用や女性参画など、社会とのつながりに関するデータです。"
};

export default function CategoryIntroBoxes() {
  return (
    <section className="border-t border-ink/10 bg-white/60">
      <div className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">Category</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink">カテゴリで探す</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {CATEGORY_LIST.map((cat, i) => {
            const cls = CATEGORY_CLASSES[cat.key];
            return (
              <Link
                key={cat.key}
                href={`#cat-${cat.key}`}
                className="group flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-pop transition-transform hover:-translate-y-1"
              >
                <span
                  className={`animate-float-icon flex h-14 w-14 items-center justify-center rounded-full ${cls.dot} text-2xl shadow-pop`}
                  style={{ animationDelay: `${i * 0.25}s` }}
                  aria-hidden="true"
                >
                  {cat.emoji}
                </span>
                <h3 className={`mt-4 font-display text-base font-bold ${cls.text}`}>{cat.label}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">{DESCRIPTIONS[cat.key]}</p>
                <span className="mt-3 text-xs font-bold text-ink-soft transition-colors group-hover:text-brass-dark">
                  見てみる →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
