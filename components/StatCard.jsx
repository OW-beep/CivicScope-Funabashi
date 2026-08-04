export default function StatCard({ label, value, unit, delta, deltaLabel, tone = "neutral" }) {
  const deltaColor =
    tone === "up" ? "text-bay-dark" : tone === "down" ? "text-brass-dark" : "text-ink-soft";

  return (
    <div className="border border-ink/10 bg-white/60 p-5">
      <p className="text-xs uppercase tracking-widest text-ink-soft">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-ink">
        {value}
        {unit ? <span className="ml-1 text-base font-normal text-ink-soft">{unit}</span> : null}
      </p>
      {delta ? (
        <p className={`mt-1.5 font-mono text-sm tabular-nums ${deltaColor}`}>
          {delta} <span className="font-body text-ink-soft">{deltaLabel}</span>
        </p>
      ) : null}
    </div>
  );
}
