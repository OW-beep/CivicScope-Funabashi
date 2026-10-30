// 記事冒頭の「この記事の要点」。articleExtras.js に tldr を書いた記事だけに表示される。
// 検索から来た人が、最初の数秒で「知りたかった答え」に辿り着けるようにするための枠。
export default function KeyPoints({ points, className = "" }) {
  if (!Array.isArray(points) || points.length === 0) return null;
  return (
    <aside className={`rounded-2xl border border-brass/40 bg-brass/5 px-5 py-4 ${className}`}>
      <p className="font-mono text-xs uppercase tracking-widest text-brass-dark">この記事の要点</p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.8] text-ink">
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </aside>
  );
}
