import Link from "next/link";

// 「運営者より」の一行リンク集。
// - tone="dark"  : フッター（濃紺背景）用
// - tone="light" : 記事ページ（明るい背景）用
// リンク文言は、運営者の経歴（元自治体職員／データ分析・可視化のコンサルティング）と
// サイトの方針（出典・加工方法の公開）に沿った、事実に基づく内容だけにしている。
const OPERATOR_LINKS = [
  {
    href: "/about#operator",
    label: "元自治体職員が、行政データを「市民に届く形」にするために始めたサイト"
  },
  {
    href: "/data-methodology",
    label: "行政データを、どう取得し、どう加工しているのか"
  }
];

export default function OperatorNote({ tone = "dark", className = "" }) {
  const isDark = tone === "dark";
  const labelCls = isDark ? "text-paper/50" : "text-ink-soft";
  const linkCls = isDark
    ? "text-paper/85 underline decoration-paper/40 underline-offset-4 hover:text-brass-light"
    : "text-ink underline decoration-ink/30 underline-offset-4 hover:text-brass-dark";
  const sepCls = isDark ? "text-paper/40" : "text-ink-soft/60";

  return (
    <p className={`text-sm leading-relaxed ${className}`}>
      <span className={labelCls}>運営者より: </span>
      {OPERATOR_LINKS.map((link, i) => (
        <span key={link.href}>
          {i > 0 ? <span className={`mx-1.5 ${sepCls}`} aria-hidden="true">·</span> : null}
          <Link href={link.href} className={linkCls}>
            {link.label}
          </Link>
        </span>
      ))}
    </p>
  );
}
