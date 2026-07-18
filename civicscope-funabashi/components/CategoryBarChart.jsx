import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function CategoryBarChart({ data, unit = "件", topN = 12 }) {
  const top = (data || []).slice(0, topN);

  if (!top.length) {
    return <p className="text-sm text-ink-soft">表示できるデータがありません。</p>;
  }

  return (
    <div style={{ height: Math.max(240, top.length * 34) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
          <CartesianGrid stroke="#1B2430" strokeOpacity={0.08} horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#3E4B5C" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={150}
            tick={{ fontSize: 11, fill: "#3E4B5C" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => [`${Number(v).toLocaleString("ja-JP")} ${unit}`, "件数"]}
            contentStyle={{ fontSize: 12, border: "1px solid rgba(27,36,48,0.15)" }}
          />
          <Bar dataKey="count" fill="#B8862F" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
