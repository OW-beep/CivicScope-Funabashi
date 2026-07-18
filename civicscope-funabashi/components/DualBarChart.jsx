import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DualBarChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-ink-soft">表示できるデータがありません。</p>;
  }

  const tickInterval = Math.max(0, Math.floor(data.length / 8) - 1);

  return (
    <div className="h-72 w-full md:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1B2430" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="label"
            interval={tickInterval}
            tick={{ fontSize: 11, fill: "#3E4B5C" }}
            axisLine={{ stroke: "#1B2430", strokeOpacity: 0.15 }}
            tickLine={false}
          />
          <YAxis
            width={56}
            tick={{ fontSize: 11, fill: "#3E4B5C" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.toLocaleString("ja-JP")}
          />
          <Tooltip
            formatter={(value, name) => [`${Number(value).toLocaleString("ja-JP")} 頭`, name]}
            contentStyle={{ border: "1px solid rgba(27,36,48,0.15)", fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="registered" name="登録頭数" fill="#2F6F6E" radius={[3, 3, 0, 0]} />
          <Bar dataKey="vaccinated" name="予防注射実施頭数" fill="#B8862F" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
