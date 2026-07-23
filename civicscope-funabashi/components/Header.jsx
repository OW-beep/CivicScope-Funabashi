import Link from "next/link";
import { useRef, useState } from "react";
import ScopeMark from "./ScopeMark";
import { siteConfig } from "../data/siteConfig";

// ダッシュボードが増えてきたため、トップレベルには出さずドロップダウンにまとめている。
// 新しいダッシュボードを追加したときは、このリストに1行足すだけでよい。
const DASHBOARDS = [
  { href: "/dashboard", label: "人口" },
  { href: "/children", label: "子ども・子育て" },
  { href: "/schools", label: "学校" },
  { href: "/senior-housing", label: "高齢者向け住宅" },
  { href: "/welfare", label: "生活保護" },
  { href: "/chokai", label: "町会・自治会" },
  { href: "/food-businesses", label: "食品営業施設" },
  { href: "/life-sanitation", label: "生活衛生施設" },
  { href: "/disaster-prevention", label: "防災" },
  { href: "/dog-registration", label: "犬の登録" }
];

const NAV_SECONDARY = [
  { href: "/articles", label: "解説記事" },
  { href: "/about", label: "About" }
];

function ChevronIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const detailsRef = useRef(null);

  function closeDropdown() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-ink" aria-label={siteConfig.name}>
          <ScopeMark className="h-7 w-7 text-brass" />
          <span className="font-display text-lg tracking-wide">
            Civic<span className="text-brass">Scope</span>
            <span className="ml-1.5 align-middle font-body text-xs text-ink-soft">船橋</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <details ref={detailsRef} className="group relative">
            <summary className="flex cursor-pointer items-center gap-1 text-sm text-ink-soft transition-colors hover:text-brass-dark">
              ダッシュボード
              <ChevronIcon className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-56 border border-ink/10 bg-paper py-2 shadow-lg">
              {DASHBOARDS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeDropdown}
                  className="block px-4 py-2 text-sm text-ink-soft hover:bg-ink/5 hover:text-brass-dark"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>

          {NAV_SECONDARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-soft transition-colors hover:text-brass-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="メニューを開く"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="h-0.5 w-6 bg-ink" />
          <span className="h-0.5 w-6 bg-ink" />
          <span className="h-0.5 w-6 bg-ink" />
        </button>
      </div>

      {open ? (
        <nav className="flex flex-col gap-1 border-t border-ink/10 px-5 py-3 md:hidden">
          <p className="mt-1 px-2 text-xs uppercase tracking-widest text-ink-soft/60">ダッシュボード</p>
          {DASHBOARDS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2 py-2 text-sm text-ink-soft hover:bg-ink/5"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <p className="mt-3 px-2 text-xs uppercase tracking-widest text-ink-soft/60">サイト</p>
          {NAV_SECONDARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2 py-2 text-sm text-ink-soft hover:bg-ink/5"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
