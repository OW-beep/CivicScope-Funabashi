import Link from "next/link";

// パンくずリスト。items は [{ label, href }]。最後の1件（現在のページ）は href を省略する。
// 構造化データ（BreadcrumbList）は buildBreadcrumbJsonLd で別に作り、Seo の jsonLd に渡す。
export function buildBreadcrumbJsonLd(items, baseUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {})
    }))
  };
}

export default function Breadcrumbs({ items, className = "" }) {
  return (
    <nav aria-label="パンくずリスト" className={`text-xs text-ink-soft ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden="true" className="text-ink-soft/50">›</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-brass-dark hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="line-clamp-1">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
