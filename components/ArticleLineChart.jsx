import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// 記事内の時系列グラフ用の折れ線グラフ。
// data: [{ label, value }]、unit: 単位、yMin: Y軸の下限（省略時は自動）
export default function ArticleLineChart({ data, unit = "", yMin, seriesLabel = "値" }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-ink-soft">表示できるデータがありません。</p>;
  }

  // 点が多いときは、ラベルを5つおきに表示する
  const tickInterval = data.length > 12 ? 4 : 0;
  const showDots = data.length <= 12;

  return (
    <div className="h-64 w-full md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: 4, bottom: 8 }}>
          <CartesianGrid stroke="#26313B" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="label"
            interval={tickInterval}
            tick={{ fontSize: 11, fill: "#56636F" }}
            axisLine={{ stroke: "#26313B", strokeOpacity: 0.15 }}
            tickLine={false}
          />
          <YAxis
            width={56}
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#56636F" }}
            axisLine={false}
            tickLine={false}
            domain={[typeof yMin === "number" ? yMin : "auto", "auto"]}
            tickFormatter={(v) => Number(v).toLocaleString("ja-JP")}
            label={{
              value: unit ? `（${unit}）` : "",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fontSize: 10,
              fill: "#56636F"
            }}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString("ja-JP")} ${unit}`, seriesLabel]}
            labelStyle={{ color: "#26313B" }}
            contentStyle={{ border: "1px solid rgba(27,36,48,0.15)", fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#E0932A"
            strokeWidth={2}
            dot={showDots ? { r: 3, fill: "#E0932A" } : false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
