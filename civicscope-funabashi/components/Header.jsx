import Link from "next/link";
import { useState } from "react";
import ScopeMark from "./ScopeMark";
import { siteConfig } from "../data/siteConfig";

const NAV = [
  { href: "/dashboard", label: "人口" },
  { href: "/children", label: "子ども・子育て" },
  { href: "/schools", label: "学校" },
  { href: "/chokai", label: "町会・自治会" },
  { href: "/food-businesses", label: "食品営業施設" },
  { href: "/disaster-prevention", label: "防災" },
  { href: "/dog-registration", label: "犬の登録" },
  { href: "/articles", label: "解説記事" },
  { href: "/about", label: "About" }
];

export default function Header() {
  const [open, setOpen] = useState(false);

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

        <nav className="hidden flex-wrap items-center gap-x-5 gap-y-1 md:flex">
          {NAV.map((item) => (
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
          {NAV.map((item) => (
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
