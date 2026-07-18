import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function PopulationChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-ink-soft">表示できるデータがありません。</p>;
  }

  // ラベルが多すぎる場合は目盛りを間引く
  const tickInterval = Math.max(0, Math.floor(data.length / 8) - 1);

  return (
    <div className="h-72 w-full md:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1B2430" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="label"
            interval={tickInterval}
            tick={{ fontSize: 11, fill: "#3E4B5C" }}
            axisLine={{ stroke: "#1B2430", strokeOpacity: 0.15 }}
            tickLine={false}
          />
          <YAxis
            width={64}
            tick={{ fontSize: 11, fill: "#3E4B5C" }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
            tickFormatter={(v) => v.toLocaleString("ja-JP")}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString("ja-JP")} 人`, "常住人口"]}
            labelStyle={{ color: "#1B2430" }}
            contentStyle={{ border: "1px solid rgba(27,36,48,0.15)", fontSize: 12 }}
          />
          <Line type="monotone" dataKey="total" stroke="#B8862F" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
