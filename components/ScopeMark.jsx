// CivicScopeのロゴ/装飾に使う、測量機の照準（スコープ）をイメージしたマーク。
// 「船橋の街を観測する」という本サイトのコンセプトを、丸みのある太めの線で
// ポップに表現している（旧デザインより線を太く・角を丸くして親しみやすさを出した）。
export default function ScopeMark({ className = "h-6 w-6", strokeWidth = 3 }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="24" cy="24" r="9.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="24" y1="2.5" x2="24" y2="10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="24" y1="38" x2="24" y2="45.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="2.5" y1="24" x2="10" y2="24" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="38" y1="24" x2="45.5" y2="24" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="24" cy="24" r="3" fill="currentColor" />
    </svg>
  );
}
