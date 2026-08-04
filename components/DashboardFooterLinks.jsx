import Link from "next/link";

// ダッシュボードページの末尾に置く、回遊導線用のCTAブロック。
// articleHref/articleLabel を渡すと「この数字の読み方」記事への導線を表示し、
// 常に「ほかのダッシュボードも見る」への導線を表示する。
export default function DashboardFooterLinks({ articleHref, articleLabel }) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {articleHref ? (
        <Link
          href={articleHref}
          className="group flex items-center justify-between border border-brass/40 bg-brass/10 px-5 py-4 text-sm text-brass-dark transition-colors hover:bg-brass/20"
        >
          <span>
            <span className="block font-mono text-[11px] uppercase tracking-widest text-brass-dark/80">
              解説記事
            </span>
            <span className="mt-0.5 block font-display text-base text-ink">
              {articleLabel || "この数字の読み方を解説"}
            </span>
          </span>
          <span aria-hidden className="ml-3 transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      ) : null}
      <Link
        href="/#dashboards"
        className="group flex items-center justify-between border border-ink/10 bg-white/60 px-5 py-4 text-sm text-ink transition-colors hover:border-brass"
      >
        <span>
          <span className="block font-mono text-[11px] uppercase tracking-widest text-ink-soft">
            もっと見る
          </span>
          <span className="mt-0.5 block font-display text-base text-ink">ほかのダッシュボード一覧</span>
        </span>
        <span aria-hidden className="ml-3 transition-transform group-hover:translate-x-1">
          →
        </span>
      </Link>
    </div>
  );
}
