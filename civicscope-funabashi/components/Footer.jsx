import Link from "next/link";
import { siteConfig } from "../data/siteConfig";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-lg">
              Civic<span className="text-brass-light">Scope</span> 船橋
            </p>
            <p className="mt-3 text-sm leading-relaxed text-paper/70">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-widest text-paper/50">サイト内</p>
            <ul className="space-y-2 text-sm text-paper/80">
              <li><Link href="/dashboard" className="hover:text-brass-light">人口ダッシュボード</Link></li>
              <li><Link href="/children" className="hover:text-brass-light">子ども・子育てダッシュボード</Link></li>
              <li><Link href="/schools" className="hover:text-brass-light">学校ダッシュボード</Link></li>
              <li><Link href="/chokai" className="hover:text-brass-light">町会・自治会ダッシュボード</Link></li>
              <li><Link href="/food-businesses" className="hover:text-brass-light">食品営業施設ダッシュボード</Link></li>
              <li><Link href="/life-sanitation" className="hover:text-brass-light">生活衛生施設ダッシュボード</Link></li>
              <li><Link href="/disaster-prevention" className="hover:text-brass-light">防災ダッシュボード</Link></li>
              <li><Link href="/dog-registration" className="hover:text-brass-light">犬の登録ダッシュボード</Link></li>
              <li><Link href="/articles" className="hover:text-brass-light">解説記事</Link></li>
              <li><Link href="/about" className="hover:text-brass-light">About / データについて</Link></li>
            </ul>
          </div>

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
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-paper/10 pt-6 text-xs text-paper/50 md:flex-row md:items-center md:justify-between">
          <p>© {year} {siteConfig.name}. 本サイトは船橋市の公式サイトではありません。</p>
          <p>
            データ出典：船橋市オープンデータカタログ（{siteConfig.bodik.license}）
          </p>
        </div>
      </div>
    </footer>
  );
}
