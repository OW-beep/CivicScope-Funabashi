import Link from "next/link";

// 記事タイトル下の「公開日・更新日・運営者」表示。
// 誰が、いつ書き、いつ見直したかを、記事ごとに分かるようにする（運営者の透明性）。
export default function ArticleByline({ date, updated, className = "" }) {
  const showUpdated = updated && updated !== date;
  return (
    <div className={`text-xs leading-relaxed text-ink-soft ${className}`}>
      <p className="font-mono">
        <span>公開 {date}</span>
        {showUpdated ? <span className="ml-3 text-brass-dark">更新 {updated}</span> : null}
      </p>
      <p className="mt-1">
        運営者：元自治体職員・データサイエンティスト（
        <Link href="/about#operator" className="underline hover:text-brass-dark">運営者について</Link>
        ）／
        <Link href="/editorial-policy" className="underline hover:text-brass-dark">編集方針</Link>
      </p>
    </div>
  );
}
