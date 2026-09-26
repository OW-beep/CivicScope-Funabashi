// 楽天市場商品検索APIで取得した商品1件をカード表示する。
// lib/rakuten.js の searchRakutenItems() が返す形（name/price/url/imageUrl/shopName）を前提とする。
// item が null（キー未設定 or 検索結果0件）の場合は何も表示しない呼び出し側の実装を想定。
export default function RakutenProductCard({ item }) {
  if (!item) return null;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer sponsored"
      className="mt-4 flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-4 shadow-pop transition-transform hover:-translate-y-0.5"
    >
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          width={72}
          height={72}
          className="h-[72px] w-[72px] flex-shrink-0 rounded-xl object-contain bg-ink/5"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-ink">{item.name}</p>
        <p className="mt-1 text-xs text-ink-soft">{item.shopName}</p>
        <p className="mt-1 font-mono text-base font-bold text-brass-dark">¥{item.price.toLocaleString()}</p>
      </div>
      <span
        aria-hidden="true"
        className="flex-shrink-0 rounded-full bg-[#bf0000] px-3 py-1.5 text-xs font-bold text-white"
      >
        楽天市場で見る ↗
      </span>
    </a>
  );
}
