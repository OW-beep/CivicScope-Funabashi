import Link from "next/link";
import { siteConfig } from "../data/siteConfig";

const SITE_LINKS = [
  { href: "/dashboard", label: "人口ダッシュボード" },
  { href: "/children", label: "子ども・子育てダッシュボード" },
  { href: "/schools", label: "学校ダッシュボード" },
  { href: "/senior-housing", label: "高齢者向け住宅ダッシュボード" },
  { href: "/welfare", label: "生活保護ダッシュボード" },
  { href: "/public-safety", label: "治安・救急ダッシュボード" },
  { href: "/finance", label: "財政ダッシュボード" },
  { href: "/gender-participation", label: "女性参画ダッシュボード" },
  { href: "/employment", label: "雇用・求人ダッシュボード" },
  { href: "/citizen-consultation", label: "市民相談ダッシュボード" },
  { href: "/parks", label: "公園・広場ダッシュボード" },
  { href: "/area-map", label: "エリアマップ" },
  { href: "/district-explorer", label: "地区マップ" },
  { href: "/rail-ridership", label: "鉄道駅別乗車人員ダッシュボード" },
  { href: "/bus-ridership", label: "市内バス運輸状況ダッシュボード" },
  { href: "/childcare", label: "保育園ダッシュボード" },
  { href: "/chokai", label: "町会・自治会ダッシュボード" },
  { href: "/food-businesses", label: "食品営業施設ダッシュボード" },
  { href: "/life-sanitation", label: "生活衛生施設ダッシュボード" },
  { href: "/disaster-prevention", label: "防災ダッシュボード" },
  { href: "/dog-registration", label: "犬の登録ダッシュボード" },
  { href: "/articles", label: "解説記事" },
  { href: "/about", label: "About / データについて" }
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-1">
            <p className="font-display text-lg">
              Civic<span className="text-brass-light">Scope</span> 船橋
            </p>
            <p className="mt-3 text-sm leading-relaxed text-paper/70">
              {siteConfig.description}
            </p>
          </div>

          {/* サイト内リンク：項目数が多いため、縦一列ではなく複数列に折り返して
              フッター全体の高さを抑える（columns-*でCSS段組みにしている） */}
          <div className="md:col-span-2">
            <p className="mb-3 text-xs uppercase tracking-widest text-paper/50">サイト内</p>
            <ul className="columns-2 gap-x-6 text-sm text-paper/80 sm:columns-3">
              {SITE_LINKS.map((link) => (
                <li key={link.href} className="mb-2 break-inside-avoid">
                  <Link href={link.href} className="hover:text-brass-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid gap-6 border-t border-paper/10 pt-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-xs uppercase tracking-widest text-paper/50">運営情報</p>
            <ul className="space-y-2 text-sm text-paper/80">
              <li><Link href="/contact" className="hover:text-brass-light">お問い合わせ</Link></li>
              <li><Link href="/privacy" className="hover:text-brass-light">プライバシーポリシー</Link></li>
              <li><Link href="/terms" className="hover:text-brass-light">利用規約・データの出典</Link></li>
              <li>
                <a href={siteConfig.bodik.orgCatalogUrl} target="_blank" rel="noreferrer" className="hover:text-brass-light">
                  船橋市オープンデータカタログ（原典）
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-end gap-2 text-xs text-paper/50 sm:items-end sm:text-right">
            <p>© {year} {siteConfig.name}. 本サイトは船橋市の公式サイトではありません。</p>
            <p>データ出典：船橋市オープンデータカタログ（{siteConfig.bodik.license}）</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
