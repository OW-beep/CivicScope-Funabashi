import { useMemo, useState } from "react";

// BODIKのデータをそのまま貼るのではなく、検索・並び替えができる形にすることで
// 「独自性のある使いやすいツール」として提供するためのコンポーネント。
export default function SearchableTable({ fields, records, searchPlaceholder = "キーワードで検索" }) {
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState(1);

  const filtered = useMemo(() => {
    let rows = records;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((row) =>
        fields.some((f) => String(row[f] ?? "").toLowerCase().includes(q))
      );
    }
    if (sortField) {
      rows = [...rows].sort((a, b) => {
        const av = String(a[sortField] ?? "");
        const bv = String(b[sortField] ?? "");
        return av.localeCompare(bv, "ja") * sortDir;
      });
    }
    return rows;
  }, [records, fields, query, sortField, sortDir]);

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
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full max-w-xs border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brass"
        />
        <p className="font-mono text-xs text-ink-soft">{filtered.length} 件 / 全{records.length}件</p>
      </div>

      <div className="overflow-x-auto border border-ink/10">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-ink text-paper">
              {fields.map((f) => (
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
                {fields.map((f) => (
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
