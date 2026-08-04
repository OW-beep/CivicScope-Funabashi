// CivicScopeのロゴ/装飾に使う、測量機の照準（スコープ）をイメージしたマーク。
// 「船橋の街を観測する」という本サイトのコンセプトを視覚化するシグネチャー要素。
export default function ScopeMark({ className = "h-6 w-6", strokeWidth = 1.6 }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="24" cy="24" r="10.5" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="24" y1="1" x2="24" y2="10" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="24" y1="38" x2="24" y2="47" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="1" y1="24" x2="10" y2="24" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="38" y1="24" x2="47" y2="24" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="24" cy="24" r="2" fill="currentColor" />
    </svg>
  );
}
