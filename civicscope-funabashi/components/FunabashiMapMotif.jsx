// 正確な行政境界データではなく、「湾岸の海岸線」「川」「観測点をつなぐ測量網」を
// イメージした抽象的な装飾モチーフ。ヒーローセクションの背景にごく薄く敷く想定。
export default function FunabashiMapMotif({ className = "" }) {
  return (
    <svg
      viewBox="0 0 800 500"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* 海岸線（東京湾沿岸をイメージした抽象曲線） */}
      <path
        d="M0 360 C 90 330, 150 380, 230 350 S 380 300, 460 340 S 620 400, 720 360 S 800 330, 800 340 L 800 500 L 0 500 Z"
        fill="currentColor"
        opacity="0.5"
      />
      {/* 川（海老川をイメージした曲線） */}
      <path
        d="M420 0 C 400 90, 440 150, 410 230 S 360 340, 380 420"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.6"
      />
      {/* 観測点をつなぐ測量網 */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.5">
        <line x1="120" y1="120" x2="300" y2="200" />
        <line x1="300" y1="200" x2="500" y2="140" />
        <line x1="500" y1="140" x2="660" y2="230" />
        <line x1="300" y1="200" x2="360" y2="330" />
        <line x1="500" y1="140" x2="470" y2="60" />
      </g>
      <g fill="currentColor" opacity="0.7">
        <circle cx="120" cy="120" r="4" />
        <circle cx="300" cy="200" r="5" />
        <circle cx="500" cy="140" r="4" />
        <circle cx="660" cy="230" r="4" />
        <circle cx="360" cy="330" r="4" />
        <circle cx="470" cy="60" r="3" />
      </g>
    </svg>
  );
}
