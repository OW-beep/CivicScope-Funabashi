import Link from "next/link";
import dynamic from "next/dynamic";

const CategoryBarChart = dynamic(() => import("./CategoryBarChart"), { ssr: false });
const ArticleLineChart = dynamic(() => import("./ArticleLineChart"), { ssr: false });
const InteractiveMap = dynamic(() => import("./InteractiveMap"), { ssr: false });

// 記事本文（簡易Markdown）の描画。記事ページと、ダッシュボード下の解説欄で共有する。
function renderInline(text, keyPrefix) {
  // **text** の太字と [text](url) のリンクのみサポートする軽量インラインレンダラー
  const pattern = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${key++}`} className="font-semibold text-ink">
          {match[1]}
        </strong>
      );
    } else {
      nodes.push(
        <Link key={`${keyPrefix}-l-${key++}`} href={match[3]} className="underline hover:text-brass-dark">
          {match[2]}
        </Link>
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

export function renderBody(body, charts, maps) {
  // シンプルな段落・太字（**text**）・箇条書き（- item）記法に加えて、
  // 独立した行の [[CHART:id]] は article.charts[id] に対応するグラフに、
  // [[MAP:id]] は article.maps[id] に対応するインタラクティブ地図に置き換える。
  // charts・maps が無い記事には一切影響しない、後方互換な拡張。
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      const chartMatch = block.match(/^\[\[CHART:([\w-]+)\]\]$/);
      if (chartMatch && charts && charts[chartMatch[1]]) {
        const chart = charts[chartMatch[1]];
        const chartData = (chart.data || []).map((d) => ({ label: d.label, count: d.value }));
        return (
          <div key={i} className="mb-6 border border-ink/10 bg-white/60 p-5">
            {chart.title ? <p className="mb-3 text-xs text-ink-soft">{chart.title}</p> : null}
            {chart.type === "line" ? (
              <ArticleLineChart data={chart.data || []} unit={chart.unit || ""} yMin={chart.yMin} />
            ) : (
              <CategoryBarChart data={chartData} unit={chart.unit || ""} topN={chartData.length} />
            )}
            {chart.source ? <p className="mt-3 text-[11px] text-ink-soft">出典：{chart.source}</p> : null}
          </div>
        );
      }

      const mapMatch = block.match(/^\[\[MAP:([\w-]+)\]\]$/);
      if (mapMatch && maps && maps[mapMatch[1]]) {
        const map = maps[mapMatch[1]];
        return (
          <div key={i} className="mb-6 border border-ink/10 bg-white/60 p-5">
            {map.title ? <p className="mb-3 text-xs text-ink-soft">{map.title}</p> : null}
            <InteractiveMap points={map.points || []} categoryColors={map.categoryColors} height={map.height || 360} />
            <p className="mt-3 text-[11px] text-ink-soft">
              地図データ：© OpenStreetMap contributors（OpenFreeMap経由で配信）
              {map.source ? `／${map.source}` : ""}
            </p>
          </div>
        );
      }

      const lines = block.split("\n").map((l) => l.trim());
      const isList = lines.length > 0 && lines.every((l) => l.startsWith("- "));

      // Markdownテーブル記法（| 見出し | 見出し |\n|---|---|\n| 値 | 値 |）を、
      // 生のパイプ文字のまま表示せず、きちんとしたHTMLテーブルとして描画する。
      const isTable =
        lines.length >= 2 &&
        lines.every((l) => l.startsWith("|") && l.endsWith("|")) &&
        lines[1]
          .slice(1, -1)
          .split("|")
          .every((cell) => /^:?-+:?$/.test(cell.trim()));

      if (isTable) {
        const parseRow = (line) =>
          line
            .slice(1, -1)
            .split("|")
            .map((cell) => cell.trim());
        const headerCells = parseRow(lines[0]);
        const bodyRows = lines.slice(2).map(parseRow);

        return (
          <div key={i} className="mb-6 overflow-x-auto border border-ink/10">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-ink text-paper">
                  {headerCells.map((cell, ci) => (
                    <th key={ci} className="whitespace-nowrap px-3 py-2 font-normal">
                      {renderInline(cell, `${i}-th-${ci}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? "bg-white/70" : "bg-paper-dark/40"}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="whitespace-nowrap px-3 py-2 text-ink-soft">
                        {renderInline(cell, `${i}-td-${ri}-${ci}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      if (isList) {
        return (
          <ul key={i} className="mb-5 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.9] text-ink-soft">
            {lines.map((line, j) => (
              <li key={j}>{renderInline(line.slice(2), `${i}-${j}`)}</li>
            ))}
          </ul>
        );
      }

      return (
        <p key={i} className="mb-5 text-[15px] leading-[1.9] text-ink-soft">
          {renderInline(block, `${i}`)}
        </p>
      );
    });
}


export default function ArticleBody({ body, charts, maps }) {
  return <>{renderBody(body, charts, maps)}</>;
}
