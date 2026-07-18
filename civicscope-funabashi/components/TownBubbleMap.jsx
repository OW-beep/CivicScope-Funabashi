import { useMemo, useState } from "react";
import FunabashiMapMotif from "./FunabashiMapMotif";

const WIDTH = 640;
const HEIGHT = 460;
const PADDING = 28;

// 緯度経度を、実際のキロメートル距離の比率をできるだけ保ったままSVG座標へ投影する。
// 正確な行政境界地図ではなく、あくまで「相対的な位置関係」を示す簡易プロットです。
function project(points) {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const latMin = Math.min(...lats);
  const latMax = Math.max(...lats);
  const lngMin = Math.min(...lngs);
  const lngMax = Math.max(...lngs);

  const midLatRad = ((latMin + latMax) / 2) * (Math.PI / 180);
  const kmPerLatDeg = 111;
  const kmPerLngDeg = 111 * Math.cos(midLatRad);

  const xRangeKm = Math.max((lngMax - lngMin) * kmPerLngDeg, 0.6);
  const yRangeKm = Math.max((latMax - latMin) * kmPerLatDeg, 0.6);

  const availW = WIDTH - PADDING * 2;
  const availH = HEIGHT - PADDING * 2;
  const scale = Math.min(availW / xRangeKm, availH / yRangeKm);

  const drawW = xRangeKm * scale;
  const drawH = yRangeKm * scale;
  const offsetX = PADDING + (availW - drawW) / 2;
  const offsetY = PADDING + (availH - drawH) / 2;

  return points.map((p) => {
    const xKm = (p.lng - lngMin) * kmPerLngDeg;
    const yKm = (p.lat - latMin) * kmPerLatDeg;
    return {
      ...p,
      x: offsetX + xKm * scale,
      y: offsetY + (drawH - yKm * scale)
    };
  });
}

export default function TownBubbleMap({ points, unit = "件" }) {
  const [selected, setSelected] = useState(null);
  const projected = useMemo(() => project(points), [points]);
  const maxCount = Math.max(...points.map((p) => p.count), 1);

  function radiusFor(count) {
    const min = 5;
    const max = 32;
    return min + (max - min) * Math.sqrt(count / maxCount);
  }

  const active = selected || projected[0];

  return (
    <div>
      <div className="relative border border-ink/10 bg-white/60">
        <FunabashiMapMotif className="pointer-events-none absolute inset-0 h-full w-full text-ink opacity-[0.05]" />
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="relative w-full"
          role="img"
          aria-label="町丁目ごとの件数を示すバブルマップ（相対位置の簡易プロット）"
        >
          {projected.map((p) => {
            const isActive = active && active.label === p.label;
            return (
              <circle
                key={p.label}
                cx={p.x}
                cy={p.y}
                r={radiusFor(p.count)}
                fill="#B8862F"
                fillOpacity={isActive ? 0.85 : 0.4}
                stroke="#8F6A22"
                strokeWidth={isActive ? 1.5 : 0.5}
                className="cursor-pointer transition-opacity"
                onClick={() => setSelected(p)}
              >
                <title>{`${p.label}：${p.count.toLocaleString("ja-JP")}${unit}`}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      {active ? (
        <div className="mt-3 flex items-center justify-between border-b border-ink/10 pb-3 text-sm">
          <span className="font-display text-ink">{active.label}</span>
          <span className="font-mono text-brass-dark">
            {active.count.toLocaleString("ja-JP")} {unit}
          </span>
        </div>
      ) : null}
      <p className="mt-2 text-xs text-ink-soft">
        円の大きさは件数に比例します。円をクリック（タップ）すると詳細を表示します。緯度経度をもとにした簡易的な位置関係の図であり、正確な行政境界図ではありません。
      </p>
    </div>
  );
}
