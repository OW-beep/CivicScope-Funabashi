import Link from "next/link";
import { useRef, useState } from "react";
import ScopeMark from "./ScopeMark";
import { siteConfig } from "../data/siteConfig";
import { CATEGORY_CLASSES } from "../data/categories";

// ダッシュボードが増えてきたため、トップレベルには出さずドロップダウンにまとめている。
// カテゴリごとにグループ化し、複数列で表示することで、縦に長くなりすぎないようにしている。
// category は data/categories.js のカラー定義に対応するキー（カテゴリカラーのドットに使用）。
const DASHBOARD_GROUPS = [
  {
    label: "人口・くらし",
    category: "life",
    items: [
      { href: "/dashboard", label: "人口" },
      { href: "/senior-housing", label: "高齢者向け住宅" },
      { href: "/welfare", label: "生活保護" },
      { href: "/finance", label: "財政" },
      { href: "/citizen-consultation", label: "市民相談" }
    ]
  },
  {
    label: "子育て・教育",
    category: "kids",
    items: [
      { href: "/children", label: "子ども・子育て" },
      { href: "/schools", label: "学校" },
      { href: "/childcare", label: "保育園" }
    ]
  },
  {
    label: "まち・環境",
    category: "town",
    items: [
      { href: "/parks", label: "公園・広場" },
      { href: "/area-map", label: "エリアマップ" },
      { href: "/district-explorer", label: "地区マップ" },
      { href: "/chokai", label: "町会・自治会" },
      { href: "/dog-registration", label: "犬の登録" }
    ]
  },
  {
    label: "交通",
    category: "transit",
    items: [
      { href: "/rail-ridership", label: "鉄道駅別乗車人員" },
      { href: "/bus-ridership", label: "バス運輸状況" }
    ]
  },
  {
    label: "安全・衛生",
    category: "safety",
    items: [
      { href: "/public-safety", label: "治安・救急" },
      { href: "/disaster-prevention", label: "防災" },
      { href: "/food-businesses", label: "食品営業施設" },
      { href: "/life-sanitation", label: "生活衛生施設" }
    ]
  },
  {
    label: "社会参画",
    category: "social",
    items: [
      { href: "/gender-participation", label: "女性参画" },
      { href: "/employment", label: "雇用・求人" }
    ]
  }
];

const NAV_SECONDARY = [
  { href: "/articles", label: "解説記事" },
  { href: "/collections", label: "目的別ガイド" },
  { href: "/about", label: "About" }
];

function ChevronIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brass text-white shadow-pop-brass">
            <ScopeMark className="h-5 w-5" strokeWidth={3.5} />
          </span>
          <span className="font-display text-lg font-bold tracking-wide">
            Civic<span className="text-brass">Scope</span>
            <span className="ml-1.5 align-middle rounded-full bg-bay/15 px-2 py-0.5 font-body text-xs font-bold text-bay-dark">
              船橋
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <details ref={detailsRef} className="group relative">
            <summary className="flex cursor-pointer items-center gap-1 text-sm font-bold text-ink-soft transition-colors hover:text-brass-dark">
              ダッシュボード
              <ChevronIcon className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-3 max-h-[75vh] w-[640px] overflow-y-auto rounded-2xl border border-ink/10 bg-white p-5 shadow-pop">
              <div className="grid grid-cols-3 gap-x-6 gap-y-5">
              {DASHBOARD_GROUPS.map((group) => {
                const cls = CATEGORY_CLASSES[group.category];
                return (
                  <div key={group.label}>
                    <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-soft">
                      <span className={`h-2 w-2 rounded-full ${cls.dot}`} aria-hidden="true" />
                      {group.label}
                    </p>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={closeDropdown}
                            className={`block rounded-lg py-1 text-sm text-ink-soft transition-colors ${cls.hoverText}`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              </div>
            </div>
          </details>

          {NAV_SECONDARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-bold text-ink-soft transition-colors hover:text-brass-dark"
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
          <span className="h-0.5 w-6 rounded-full bg-ink" />
          <span className="h-0.5 w-6 rounded-full bg-ink" />
          <span className="h-0.5 w-6 rounded-full bg-ink" />
        </button>
      </div>

      {open ? (
        <nav className="flex max-h-[75vh] flex-col gap-1 overflow-y-auto border-t border-ink/10 px-5 py-3 md:hidden">
          {DASHBOARD_GROUPS.map((group) => {
            const cls = CATEGORY_CLASSES[group.category];
            return (
              <div key={group.label}>
                <p className="mt-3 flex items-center gap-1.5 px-2 font-mono text-xs font-bold uppercase tracking-widest text-ink-soft/70">
                  <span className={`h-2 w-2 rounded-full ${cls.dot}`} aria-hidden="true" />
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-lg px-2 py-2 text-sm text-ink-soft hover:bg-ink/5"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            );
          })}
          <p className="mt-3 px-2 font-mono text-xs font-bold uppercase tracking-widest text-ink-soft/70">サイト</p>
          {NAV_SECONDARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2 py-2 text-sm text-ink-soft hover:bg-ink/5"
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
