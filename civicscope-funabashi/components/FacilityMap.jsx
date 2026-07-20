import { useMemo, useState } from "react";

const WIDTH = 640;
const HEIGHT = 460;
const PADDING = 20;

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

// 複数のレイヤー（避難所・避難場所・AEDなど）を、それぞれ表示/非表示を切り替えながら
// 同じ地図の上に重ねて表示できる地点マップ。
// layers: [{ key, label, color, points: [{label, lat, lng}, ...] }, ...]
export default function FacilityMap({ layers, boundary }) {
  const [visible, setVisible] = useState(() => Object.fromEntries(layers.map((l) => [l.key, true])));
  const [selected, setSelected] = useState(null);

  const hasBoundary = Array.isArray(boundary) && boundary.length > 0;
  const allPoints = useMemo(() => layers.flatMap((l) => l.points), [layers]);

  const transform = useMemo(() => {
    const bounds = hasBoundary ? boundsFromRings(boundary) : boundsFromPoints(allPoints);
    return bounds ? computeTransform(bounds) : null;
  }, [boundary, allPoints, hasBoundary]);

  const projectedRings = useMemo(() => {
    if (!hasBoundary || !transform) return [];
    return boundary.map((ring) => ring.map(([lng, lat]) => toXY(lat, lng, transform)));
  }, [boundary, transform, hasBoundary]);

  const projectedLayers = useMemo(() => {
    if (!transform) return [];
    return layers.map((l) => ({
      ...l,
      points: l.points.map((p) => ({ ...p, ...toXY(p.lat, p.lng, transform) }))
    }));
  }, [layers, transform]);

  if (!transform) {
    return <p className="text-sm text-ink-soft">表示できる位置情報がありません。</p>;
  }

  const toggle = (key) => setVisible((v) => ({ ...v, [key]: !v[key] }));

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {layers.map((l) => (
          <label key={l.key} className="flex cursor-pointer items-center gap-1.5 text-ink-soft">
            <input
              type="checkbox"
              checked={visible[l.key]}
              onChange={() => toggle(l.key)}
              className="accent-brass"
            />
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            {l.label}
            <span className="font-mono text-ink-soft/70">（{l.points.length}件）</span>
          </label>
        ))}
      </div>

      <div className="border border-ink/10 bg-white/60">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="船橋市の行政境界に複数のレイヤーの施設位置を重ねた地図"
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

          {projectedLayers.map((l) =>
            visible[l.key]
              ? l.points.map((p, i) => {
                  const isActive = selected && selected.label === p.label && selected.layerKey === l.key;
                  return (
                    <circle
                      key={`${l.key}-${i}`}
                      cx={p.x}
                      cy={p.y}
                      r={isActive ? 6.5 : 4.5}
                      fill={l.color}
                      fillOpacity={isActive ? 0.95 : 0.75}
                      stroke="#1B2430"
                      strokeOpacity={isActive ? 0.6 : 0.2}
                      strokeWidth={isActive ? 1.2 : 0.6}
                      className="cursor-pointer"
                      onClick={() => setSelected({ ...p, layerKey: l.key, layerLabel: l.label })}
                    >
                      <title>{`${p.label}（${l.label}）`}</title>
                    </circle>
                  );
                })
              : null
          )}
        </svg>
      </div>

      {selected ? (
        <div className="mt-3 flex items-center justify-between border-b border-ink/10 pb-3 text-sm">
          <span className="font-display text-ink">{selected.label}</span>
          <span className="font-mono text-xs text-ink-soft">{selected.layerLabel}</span>
        </div>
      ) : (
        <p className="mt-3 text-xs text-ink-soft">円をクリック（タップ）すると施設名を表示します。</p>
      )}

      <p className="mt-2 text-xs text-ink-soft">
        背景の輪郭は国土数値情報（国土交通省）をもとにした船橋市の実際の行政境界です。チェックボックスでレイヤーの表示・非表示を切り替えられます。
      </p>
    </div>
  );
}
