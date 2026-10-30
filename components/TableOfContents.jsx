// 記事の目次。見出し（h2）が4つ以上ある記事にだけ表示する。
export default function TableOfContents({ headings, className = "" }) {
  if (!Array.isArray(headings) || headings.length < 4) return null;
  return (
    <nav aria-label="目次" className={`rounded-2xl border border-ink/10 bg-white/60 px-5 py-4 ${className}`}>
      <details open>
        <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-ink-soft">
          目次
        </summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink">
          {headings.map((h) => (
            <li key={h.id}>
              <a href={`#${h.id}`} className="underline decoration-ink/20 underline-offset-4 hover:text-brass-dark">
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
