import { useMemo, useState } from "react";

const WIDTH = 640;
const HEIGHT = 460;
const PADDING = 20;

const PALETTE = ["#B8862F", "#2F6F6E", "#8F6A22", "#4C8E8C", "#3E4B5C", "#1F4D4C", "#D4A94F"];

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

// 施設1件=地図上の1点として、カテゴリ（種別）ごとに色分けしてプロットする地図。
// 町丁目集計のバブルマップとは異なり、件数ではなく個々の施設の位置をそのまま示す。
export default function FacilityMap({ points, boundary, categoryLabel = "種別" }) {
  const [selected, setSelected] = useState(null);

  const hasBoundary = Array.isArray(boundary) && boundary.length > 0;

  const categories = useMemo(() => {
    const set = Array.from(new Set(points.map((p) => p.category || "その他")));
    return set.map((cat, i) => ({ key: cat, color: PALETTE[i % PALETTE.length] }));
  }, [points]);

  const colorFor = (cat) => {
    const found = categories.find((c) => c.key === (cat || "その他"));
    return found ? found.color : PALETTE[0];
  };

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
          aria-label="船橋市の行政境界に施設の位置を重ねた地図"
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

          {projectedPoints.map((p, i) => {
            const isActive = selected && selected.label === p.label && selected.lat === p.lat;
            return (
              <circle
                key={`${p.label}-${i}`}
                cx={p.x}
                cy={p.y}
                r={isActive ? 6.5 : 4.5}
                fill={colorFor(p.category)}
                fillOpacity={isActive ? 0.95 : 0.75}
                stroke="#1B2430"
                strokeOpacity={isActive ? 0.6 : 0.2}
                strokeWidth={isActive ? 1.2 : 0.6}
                className="cursor-pointer"
                onClick={() => setSelected(p)}
              >
                <title>{`${p.label}${p.category ? `（${p.category}）` : ""}`}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-b border-ink/10 pb-3 text-xs text-ink-soft">
        {categories.map((c) => (
          <span key={c.key} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
            {c.key}
          </span>
        ))}
      </div>

      {selected ? (
        <div className="mt-3 flex items-center justify-between border-b border-ink/10 pb-3 text-sm">
          <span className="font-display text-ink">{selected.label}</span>
          {selected.category ? <span className="font-mono text-xs text-ink-soft">{selected.category}</span> : null}
        </div>
      ) : (
        <p className="mt-3 text-xs text-ink-soft">円をクリック（タップ）すると施設名を表示します。</p>
      )}

      <p className="mt-2 text-xs text-ink-soft">
        背景の輪郭は国土数値情報（国土交通省）をもとにした船橋市の実際の行政境界です。各点は施設ごとの緯度経度をそのままプロットしています。
      </p>
    </div>
  );
}
