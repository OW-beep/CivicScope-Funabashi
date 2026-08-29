// ヒーローセクションの背景に敷く、船橋らしいモチーフのイラスト。
// 旧デザインは「測量網」を思わせる無彩色の細い線画だったが、
// 東京湾の波・梨・鉄道路線・太陽をモチーフにした、色付きのポップなイラストに刷新。
// currentColorではなく専用の色を使うため、呼び出し側では opacity のみ調整する想定。
export default function FunabashiMapMotif({ className = "" }) {
  return (
    <svg
      viewBox="0 0 800 500"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* 太陽 */}
      <circle cx="690" cy="90" r="60" fill="#F5A623" />

      {/* 東京湾・三番瀬をイメージした波（複数レイヤーのティール） */}
      <path
        d="M0 380 C 90 350, 150 400, 230 370 S 380 320, 460 360 S 620 420, 720 380 S 800 350, 800 360 L 800 500 L 0 500 Z"
        fill="#2AA7A2"
        opacity="0.9"
      />
      <path
        d="M0 420 C 100 400, 180 440, 260 420 S 420 380, 520 410 S 660 450, 800 420 L 800 500 L 0 500 Z"
        fill="#1D7A76"
        opacity="0.85"
      />

      {/* 海老川（湾へ注ぐ川） */}
      <path
        d="M430 0 C 410 90, 450 150, 420 230 S 370 340, 390 400"
        stroke="#6FC4C0"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* 鉄道路線と駅（点をつなぐドット路線） */}
      <g stroke="#2E74B5" strokeWidth="3" strokeDasharray="1 10" strokeLinecap="round" opacity="0.8">
        <line x1="90" y1="150" x2="620" y2="230" />
      </g>
      <g fill="#2E74B5" opacity="0.9">
        <circle cx="90" cy="150" r="7" />
        <circle cx="260" cy="175" r="7" />
        <circle cx="430" cy="200" r="9" />
        <circle cx="620" cy="230" r="7" />
      </g>

      {/* 梨（船橋の特産品） */}
      <g transform="translate(150 300)">
        <path
          d="M20 20c22 3 40 24 40 49 0 28-21 54-45 54s-45-26-45-54c0-19 9-35 23-44-5-8-8-17-5-27 3-10 11-18 20-20-2 6-1 13 3 18 4 5 8 8 9 24z"
          fill="#F3BE6B"
        />
        <path d="M16 4c4-6 10-10 17-12" stroke="#B8721A" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}
