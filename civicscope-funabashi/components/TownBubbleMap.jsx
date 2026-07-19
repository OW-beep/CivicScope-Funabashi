import { useMemo, useState } from "react";

const WIDTH = 640;
const HEIGHT = 460;
const PADDING = 20;

// 緯度経度を、実際のキロメートル距離の比率を保ったままSVG座標へ投影する変換行列を作る。
// 船橋市の行政境界全体（boundary）を基準にすることで、バブルの位置が
// 市域のどのあたりにあるかを正確な縮尺で示せるようにしている。
function computeTransform(bounds) {
  const { latMin, latMax, lngMin, lngMax } = bounds;
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

  return { latMin, lngMin, kmPerLatDeg, kmPerLngDeg, scale, offsetX, offsetY, drawH };
}

function toXY(lat, lng, t) {
  const xKm = (lng - t.lngMin) * t.kmPerLngDeg;
  const yKm = (lat - t.latMin) * t.kmPerLatDeg;
  return { x: t.offsetX + xKm * t.scale, y: t.offsetY + (t.drawH - yKm * t.scale) };
}

function boundsFromRings(rings) {
  let latMin = Infinity;
  let latMax = -Infinity;
  let lngMin = Infinity;
  let lngMax = -Infinity;
  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      if (lat < latMin) latMin = lat;
      if (lat > latMax) latMax = lat;
      if (lng < lngMin) lngMin = lng;
      if (lng > lngMax) lngMax = lng;
    }
  }
  return Number.isFinite(latMin) ? { latMin, latMax, lngMin, lngMax } : null;
}

function boundsFromPoints(points) {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return {
    latMin: Math.min(...lats),
    latMax: Math.max(...lats),
    lngMin: Math.min(...lngs),
    lngMax: Math.max(...lngs)
  };
}

export default function TownBubbleMap({ points, boundary, unit = "件" }) {
  const [selected, setSelected] = useState(null);

  const hasBoundary = Array.isArray(boundary) && boundary.length > 0;

  const transform = useMemo(() => {
    const bounds = hasBoundary ? boundsFromRings(boundary) : boundsFromPoints(points);
    return bounds ? computeTransform(bounds) : null;
  }, [boundary, points, hasBoundary]);

  const projectedRings = useMemo(() => {
    if (!hasBoundary || !transform) return [];
    return boundary.map((ring) => ring.map(([lng, lat]) => toXY(lat, lng, transform)));
  }, [boundary, transform, hasBoundary]);

  const projectedPoints = useMemo(() => {
    if (!transform) return [];
    return points.map((p) => ({ ...p, ...toXY(p.lat, p.lng, transform) }));
  }, [points, transform]);

  const maxCount = Math.max(...points.map((p) => p.count), 1);

  function radiusFor(count) {
    const min = 5;
    const max = 30;
    return min + (max - min) * Math.sqrt(count / maxCount);
  }

  const active = selected || projectedPoints[0];

  if (!transform) {
    return <p className="text-sm text-ink-soft">表示できる位置情報がありません。</p>;
  }

  return (
    <div>
      <div className="border border-ink/10 bg-white/60">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="船橋市の行政境界に町丁目ごとの件数をバブルで重ねた地図"
        >
          {projectedRings.map((ring, i) => (
            <polygon
              key={i}
              points={ring.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="#1B2430"
              fillOpacity="0.05"
              stroke="#1B2430"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
          ))}

          {projectedPoints.map((p) => {
            const isActive = active && active.label === p.label;
            return (
              <circle
                key={p.label}
                cx={p.x}
                cy={p.y}
                r={radiusFor(p.count)}
                fill="#B8862F"
                fillOpacity={isActive ? 0.85 : 0.45}
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
        {hasBoundary
          ? "背景の輪郭は国土数値情報（国土交通省）をもとにした船橋市の実際の行政境界です。円の大きさは件数に比例します。"
          : "円の大きさは件数に比例します。緯度経度をもとにした簡易的な位置関係の図です。"}
        円をクリック（タップ）すると詳細を表示します。
      </p>
    </div>
  );
}
