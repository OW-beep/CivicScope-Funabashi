import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ArticleThumbnail from "./ArticleThumbnail";

// トップページの「ピックアップ記事」枠。数秒おきに自動で切り替わるカルーセル。
// ホバー中・キーボード操作中は自動送りを止め、矢印ボタンと下部のドットでも操作できる。
// prefers-reduced-motion（globals.cssの共通ルール）が有効な環境では自動送りも止める。
export default function PickupCarousel({ articles }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = articles.length;
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused || count <= 1) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [paused, count]);

  if (!count) return null;

  const go = (delta) => setIndex((i) => (i + delta + count) % count);
  const current = articles[index];

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-pop"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Link href={`/articles/${current.slug}`} className="group block">
        <div className="relative h-56 w-full sm:h-72">
          <ArticleThumbnail tag={current.tag} slug={current.slug} className="h-full w-full" />
          {/* 下部にタイトルを重ねるグラデーション帯 */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent p-5 pt-14">
            <span className="rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] font-bold text-ink">
              {current.tag}
            </span>
            <h3 className="mt-2 max-w-lg font-display text-lg font-bold leading-snug text-white drop-shadow sm:text-xl">
              {current.title}
            </h3>
          </div>
        </div>
      </Link>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="前のピックアップ記事"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink shadow-pop transition-colors hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="次のピックアップ記事"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink shadow-pop transition-colors hover:bg-white"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {articles.map((a, i) => (
              <button
                key={a.slug}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}枚目のピックアップ記事を表示`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
