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

function isValidLatLng(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// boundaryは [ [ [lng,lat], [lng,lat], ... ], ... ] という形を想定するが、
// 出典データの形が想定と異なる場合に備えて、不正な点・リングは取り除く。
function sanitizeBoundary(boundary) {
  if (!Array.isArray(boundary)) return [];
  return boundary
    .filter((ring) => Array.isArray(ring))
    .map((ring) =>
      ring.filter(
        (point) => Array.isArray(point) && point.length >= 2 && isValidLatLng(Number(point[1]), Number(point[0]))
      )
    )
    .filter((ring) => ring.length >= 3);
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
  return Number.isFinite(latMin) && Number.isFinite(lngMin) ? { latMin, latMax, lngMin, lngMax } : null;
}

function boundsFromPoints(points) {
  if (!points.length) return null;
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
// 同じ地図の上に重ねて表示できる地点マップ。災害種別（洪水・地震・津波など）で
// 絞り込むと、対応している施設だけがはっきり表示され、それ以外は淡く表示される。
// layers: [{ key, label, color, points: [{label, lat, lng, hazards?: string[]}, ...] }, ...]
// hazardOptions: ["洪水", "地震", "津波", ...]（絞り込みボタンに使う）
export default function FacilityMap({ layers = [], boundary = [], hazardOptions = [] }) {
  const safeLayers = useMemo(
    () =>
      (Array.isArray(layers) ? layers : []).map((l) => ({
        ...l,
        points: (Array.isArray(l.points) ? l.points : []).filter((p) => isValidLatLng(p?.lat, p?.lng))
      })),
    [layers]
  );

  const [visible, setVisible] = useState(() => Object.fromEntries(safeLayers.map((l) => [l.key, true])));
  const [selected, setSelected] = useState(null);
  const [hazardFilter, setHazardFilter] = useState("all");

  const safeBoundary = useMemo(() => sanitizeBoundary(boundary), [boundary]);
  const hasBoundary = safeBoundary.length > 0;
  const allPoints = useMemo(() => safeLayers.flatMap((l) => l.points), [safeLayers]);

  const transform = useMemo(() => {
    const bounds = hasBoundary ? boundsFromRings(safeBoundary) : boundsFromPoints(allPoints);
    return bounds ? computeTransform(bounds) : null;
  }, [safeBoundary, allPoints, hasBoundary]);

  const projectedRings = useMemo(() => {
    if (!hasBoundary || !transform) return [];
    return safeBoundary.map((ring) => ring.map(([lng, lat]) => toXY(Number(lat), Number(lng), transform)));
  }, [safeBoundary, transform, hasBoundary]);

  const projectedLayers = useMemo(() => {
    if (!transform) return [];
    return safeLayers.map((l) => ({
      ...l,
      points: l.points.map((p) => ({ ...p, ...toXY(p.lat, p.lng, transform) }))
    }));
  }, [safeLayers, transform]);

  if (!safeLayers.length || !transform) {
    return <p className="text-sm text-ink-soft">表示できる位置情報がありません。</p>;
  }

  const toggleLayer = (key) => setVisible((v) => ({ ...v, [key]: !v[key] }));

  function matchesHazard(point) {
    if (hazardFilter === "all") return true;
    return Array.isArray(point.hazards) && point.hazards.includes(hazardFilter);
  }

  return (
    <div>
      {hazardOptions.length ? (
        <div className="mb-3">
          <p className="mb-1.5 text-xs text-ink-soft">災害種別で絞り込む：</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setHazardFilter("all")}
              className={`border px-2.5 py-1 text-xs transition-colors ${
                hazardFilter === "all"
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/20 text-ink-soft hover:border-brass"
              }`}
            >
              すべて
            </button>
            {hazardOptions.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHazardFilter(h)}
                className={`border px-2.5 py-1 text-xs transition-colors ${
                  hazardFilter === h
                    ? "border-brass-dark bg-brass text-paper"
                    : "border-ink/20 text-ink-soft hover:border-brass"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {safeLayers.map((l) => (
          <label key={l.key} className="flex cursor-pointer items-center gap-1.5 text-ink-soft">
            <input
              type="checkbox"
              checked={!!visible[l.key]}
              onChange={() => toggleLayer(l.key)}
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
                  const matches = matchesHazard(p);
                  return (
                    <circle
                      key={`${l.key}-${i}`}
                      cx={p.x}
                      cy={p.y}
                      r={isActive ? 6.5 : matches ? 4.5 : 3}
                      fill={matches ? l.color : "#3E4B5C"}
                      fillOpacity={isActive ? 0.95 : matches ? 0.75 : 0.15}
                      stroke="#1B2430"
                      strokeOpacity={isActive ? 0.6 : matches ? 0.2 : 0.1}
                      strokeWidth={isActive ? 1.2 : 0.6}
                      className="cursor-pointer"
                      onClick={() => setSelected({ label: p.label, layerKey: l.key, layerLabel: l.label, hazards: p.hazards })}
                    >
                      <title>{`${p.label}（${l.label}）${p.hazards?.length ? ` - 対応: ${p.hazards.join("・")}` : ""}`}</title>
                    </circle>
                  );
                })
              : null
          )}
        </svg>
      </div>

      {selected ? (
        <div className="mt-3 border-b border-ink/10 pb-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-display text-ink">{selected.label}</span>
            <span className="font-mono text-xs text-ink-soft">{selected.layerLabel}</span>
          </div>
          {selected.hazards?.length ? (
            <p className="mt-1 text-xs text-ink-soft">対応災害種別：{selected.hazards.join("・")}</p>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-xs text-ink-soft">円をクリック（タップ）すると施設名を表示します。</p>
      )}

      <p className="mt-2 text-xs text-ink-soft">
        {hasBoundary
          ? "背景の輪郭は国土数値情報（国土交通省）をもとにした船橋市の実際の行政境界です。"
          : "行政境界データを取得できなかったため、地点の相対位置のみで表示しています。"}
        チェックボックスでレイヤー、ボタンで対応災害種別を絞り込めます。
      </p>
    </div>
  );
}
