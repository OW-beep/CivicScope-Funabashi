import Link from "next/link";

// データ取得に失敗した／検索可能な形式が無い時の案内。
// 単に「取得できませんでした」で終わらせず、原典データセットへの直接リンクと、
// サイト内の別の使い道（記事・他のダッシュボード）への案内を添えることで、
// 訪問者が手詰まりにならないようにしている。
export default function DataUnavailableNotice({ message, sourceUrl, sourceLabel }) {
  return (
    <div className="mt-8 border border-brass/40 bg-brass/10 p-5 text-sm text-brass-dark">
      <p>{message}</p>
      <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {sourceUrl ? (
          <a href={sourceUrl} target="_blank" rel="noreferrer" className="underline hover:text-ink">
            原典データセットを直接見る{sourceLabel ? `（${sourceLabel}）` : ""}
          </a>
        ) : null}
        <Link href="/articles" className="underline hover:text-ink">
          解説記事を探す
        </Link>
        <Link href="/dashboard" className="underline hover:text-ink">
          人口ダッシュボードを見る
        </Link>
      </p>
    </div>
  );
}
