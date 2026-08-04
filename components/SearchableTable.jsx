import { useMemo, useState } from "react";

// BODIKのデータをそのまま貼るのではなく、検索・並び替えができる形にすることで
// 「独自性のある使いやすいツール」として提供するためのコンポーネント。
//
// lazyDatasetKey を指定すると、初期表示では records（少数のプレビュー）だけを使い、
// 検索ボックスが実際に使われた時点で /api/dataset-records から全件を取得する。
// これは、食品営業施設一覧のような大きなデータセットで、訪問者全員に重いページデータを
// 送らないようにするための仕組み（詳しくは pages/api/dataset-records.js のコメント参照）。
export default function SearchableTable({
  fields,
  records,
  searchPlaceholder = "キーワードで検索",
  lazyDatasetKey = null,
  lazyTotal = null
}) {
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState(1);

  const [fullData, setFullData] = useState(null); // { fields, records } | null
  const [loadingFull, setLoadingFull] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const effectiveFields = fullData?.fields || fields;
  const effectiveRecords = fullData?.records || records;
  const isPreviewOnly = Boolean(lazyDatasetKey) && !fullData;

  function ensureFullDataLoaded() {
    if (!lazyDatasetKey || fullData || loadingFull) return;
    setLoadingFull(true);
    setLoadError(null);
    fetch(`/api/dataset-records?key=${encodeURIComponent(lazyDatasetKey)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json();
      })
      .then((data) => setFullData({ fields: data.fields, records: data.records }))
      .catch(() => setLoadError("全件データの取得に失敗しました。表示中のプレビューのみでの検索になります。"))
      .finally(() => setLoadingFull(false));
  }

  const filtered = useMemo(() => {
    let rows = effectiveRecords;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((row) => effectiveFields.some((f) => String(row[f] ?? "").toLowerCase().includes(q)));
    }
    if (sortField) {
      rows = [...rows].sort((a, b) => {
        const av = String(a[sortField] ?? "");
        const bv = String(b[sortField] ?? "");
        return av.localeCompare(bv, "ja") * sortDir;
      });
    }
    return rows;
  }, [effectiveRecords, effectiveFields, query, sortField, sortDir]);

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir((d) => d * -1);
    } else {
      setSortField(field);
      setSortDir(1);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={query}
          onFocus={ensureFullDataLoaded}
          onChange={(e) => {
            ensureFullDataLoaded();
            setQuery(e.target.value);
          }}
          placeholder={searchPlaceholder}
          className="w-full max-w-xs border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brass"
        />
        <p className="font-mono text-xs text-ink-soft">
          {filtered.length} 件 / 全{fullData ? effectiveRecords.length : lazyTotal ?? effectiveRecords.length}件
          {loadingFull ? "（全件読み込み中…）" : null}
        </p>
      </div>

      {isPreviewOnly && !loadingFull && !loadError && (
        <p className="mb-3 text-xs text-ink-soft">
          最初は一部のみ表示しています。検索ボックスを使うと全件から検索できます。
        </p>
      )}
      {loadError ? <p className="mb-3 text-xs text-brass-dark">{loadError}</p> : null}

      <div className="overflow-x-auto border border-ink/10">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-ink text-paper">
              {effectiveFields.map((f) => (
                <th key={f} className="whitespace-nowrap px-3 py-2 font-normal">
                  <button
                    type="button"
                    onClick={() => toggleSort(f)}
                    className="flex items-center gap-1 hover:text-brass-light"
                  >
                    {f}
                    {sortField === f ? <span className="font-mono text-xs">{sortDir === 1 ? "▲" : "▼"}</span> : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 500).map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white/70" : "bg-paper-dark/40"}>
                {effectiveFields.map((f) => (
                  <td key={f} className="whitespace-nowrap px-3 py-2 text-ink-soft">
                    {String(row[f] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 500 ? (
        <p className="mt-2 text-xs text-ink-soft">
          表示件数が多いため、先頭500件のみ表示しています。絞り込み検索をご利用ください。
        </p>
      ) : null}
    </div>
  );
}
