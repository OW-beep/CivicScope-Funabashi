export default function SectionLabel({ code, children }) {
  return (
    <div className="mb-5 flex items-baseline gap-3 border-b border-ink/15 pb-3">
      {code ? (
        <span className="font-mono text-xs tracking-widest text-brass-dark">{code}</span>
      ) : null}
      <h2 className="font-display text-xl text-ink md:text-2xl">{children}</h2>
    </div>
  );
}
