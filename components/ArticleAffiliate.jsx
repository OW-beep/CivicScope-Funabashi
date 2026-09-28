import RakutenProductCard from "./RakutenProductCard";
import { amazonSearchUrl } from "../lib/affiliate";

// 記事末尾の「関連グッズ（PR）」枠。楽天の商品カード（APIキー設定時のみ）と、
// Amazonの検索結果リンクを表示する。広告であることを明示する。
export default function ArticleAffiliate({ heading, keyword, rakutenItem }) {
  return (
    <aside className="mt-10 rounded-2xl border border-ink/10 bg-white/60 p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">PR ・ 関連グッズ</p>
      <p className="mt-1 font-display text-base font-bold text-ink">{heading}</p>
      <RakutenProductCard item={rakutenItem} />
      <a
        href={amazonSearchUrl(keyword)}
        target="_blank"
        rel="noreferrer sponsored"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-brass px-4 py-2 text-xs font-bold text-white shadow-pop-brass transition-transform hover:-translate-y-0.5"
      >
        Amazonで「{keyword}」を探す
        <span aria-hidden="true">↗</span>
      </a>
      <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
        ※ 本ページはアフィリエイト広告を含みます。Amazonのアソシエイトとして、{`当サイト`}は適格販売により収入を得ています。
        楽天市場のリンクは楽天アフィリエイトを利用しており、購入時に紹介料を得ることがあります。
      </p>
    </aside>
  );
}
