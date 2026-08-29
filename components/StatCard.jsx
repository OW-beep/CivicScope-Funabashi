// 数値カード。旧デザインは角ばった罫線カードだったが、角丸＋やわらかい影のポップな
// カードに刷新。up/down/neutralのtoneで増減の色を分け、単に「良い/悪い」を意味しない
// ニュートラルな色（bay=増加、brass=減少）を維持しつつ、明るい配色に更新している。
export default function StatCard({ label, value, unit, delta, deltaLabel, tone = "neutral" }) {
  const deltaColor =
    tone === "up" ? "text-bay-dark" : tone === "down" ? "text-brass-dark" : "text-ink-soft";
  const accent = tone === "up" ? "bg-bay" : tone === "down" ? "bg-brass" : "bg-ink/20";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-pop">
      <span className={`absolute inset-x-0 top-0 h-1.5 ${accent}`} aria-hidden="true" />
      <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-ink">
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
