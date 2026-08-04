// 船橋市の特産品「梨」をモチーフにした小さなアイコン。
// 装飾のしすぎを避けるため、豆知識セクションなど限定的な箇所でのみ使用する。
export default function PearIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12.6 8.2c2.6.3 4.6 2.7 4.6 5.6 0 3.2-2.4 6.2-5.2 6.2S6.8 17 6.8 13.8c0-2.2 1.1-4 2.7-5-.6-.9-.9-2-.6-3.1.3-1.1 1.2-2 2.3-2.3-.2.7-.1 1.5.3 2.1.4.6 1 1 1.7 1.2z"
        fill="currentColor"
      />
      <path
        d="M12.2 4c.4-.7 1.1-1.2 1.9-1.4"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
