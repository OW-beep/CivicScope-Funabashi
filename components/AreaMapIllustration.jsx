import { useMemo } from "react";

// 緯度経度をSVG座標に変換するヘルパー（FacilityMap.jsxと同じ考え方の投影）。
// アイソメトリック（疑似3D）表現はやめて、実際の位置関係が正しく伝わる
// フラットな地図として描画する。
const WIDTH = 920;
const HEIGHT = 620;
const PADDING = 40;

function isValidLatLng(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// boundaryは [ [ [lng,lat], [lng,lat], ... ], ... ]（リングの配列）を想定するが、
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

function boundsFromStations(stations) {
  if (!stations.length) return null;
  const lats = stations.map((s) => s.lat);
  const lngs = stations.map((s) => s.lng);
  return {
    latMin: Math.min(...lats),
    latMax: Math.max(...lats),
    lngMin: Math.min(...lngs),
    lngMax: Math.max(...lngs)
  };
}

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

// 3エリアの色とラベル。あくまで駅を中心にした「目安の丸」であり、
// 行政上の正式な区割りではない（船橋市には公式な3分割の地区界はないため）。
const AREA_STYLES = {
  北習志野: { fill: "#DCEAE8", stroke: "#4C8E8C", title: "北習志野・習志野台エリア", sublabel: "新京成沿線 × 住宅地" },
  西船橋: { fill: "#EAD9B8", stroke: "#B8862F", title: "船橋駅・西船橋駅エリア", sublabel: "都心近接 × 商業集積" },
  南船橋: { fill: "#CFE3E2", stroke: "#2F6F6E", title: "南船橋・湾岸エリア", sublabel: "商業施設 × 三番瀬" }
};
const AREA_RX = 150;
const AREA_RY = 92;

export default function AreaMapIllustration({ stations = [], boundary = [] }) {
  const safeStations = useMemo(
    () => (Array.isArray(stations) ? stations : []).filter((s) => isValidLatLng(s.lat, s.lng)),
    [stations]
  );
  const safeBoundary = useMemo(() => sanitizeBoundary(boundary), [boundary]);
  const hasBoundary = safeBoundary.length > 0;

  // 駅の乗車人員（実データ）でマーカーの大きさを決める
  const maxCount = useMemo(() => Math.max(...safeStations.map((s) => s.count), 1), [safeStations]);

  const transform = useMemo(() => {
    const bounds = hasBoundary ? boundsFromRings(safeBoundary) : boundsFromStations(safeStations);
    return bounds ? computeTransform(bounds) : null;
  }, [safeBoundary, safeStations, hasBoundary]);

  const projectedRings = useMemo(() => {
    if (!hasBoundary || !transform) return [];
    return safeBoundary.map((ring) => ring.map(([lng, lat]) => toXY(Number(lat), Number(lng), transform)));
  }, [safeBoundary, transform, hasBoundary]);

  const projectedStations = useMemo(() => {
    if (!transform) return [];
    return safeStations.map((s) => ({ ...s, ...toXY(s.lat, s.lng, transform) }));
  }, [safeStations, transform]);

  const railPath = useMemo(() => {
    if (!projectedStations.length) return "";
    return projectedStations.reduce((acc, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`), "");
  }, [projectedStations]);

  if (!safeStations.length || !transform) {
    return <p className="text-sm text-ink-soft">表示できる位置情報がありません。</p>;
  }

  const minamiFunabashi = projectedStations.find((p) => p.name === "南船橋");
  const kitaNarashino = projectedStations.find((p) => p.name === "北習志野");

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="船橋市の実際の行政境界をもとにしたエリアマップ">
      <defs>
        <pattern id="blueprint-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#1B2430" strokeOpacity="0.05" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#EDEBE4" />
      <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#blueprint-grid)" />

      {/* 実際の行政境界（国土数値情報／国土交通省をもとにしたデータ） */}
      {projectedRings.map((ring, i) => (
        <polygon
          key={i}
          points={ring.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="#FFFFFF"
          fillOpacity="0.55"
          stroke="#1B2430"
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />
      ))}

      {/* 3エリアの目安（駅を中心にした円。行政区域ではなく便宜的な区分） */}
      {projectedStations.map((s) => {
        const style = AREA_STYLES[s.name];
        if (!style) return null;
        return (
          <ellipse
            key={`area-${s.name}`}
            cx={s.x}
            cy={s.y}
            rx={AREA_RX}
            ry={AREA_RY}
            fill={style.fill}
            fillOpacity="0.55"
            stroke={style.stroke}
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />
        );
      })}

      {/* 波の模様（南船橋・湾岸エリアの目印） */}
      {minamiFunabashi
        ? [0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M ${minamiFunabashi.x - 60 + i * 46} ${minamiFunabashi.y + 68 + i * 6} q 9 -6 18 0 q 9 6 18 0`}
              fill="none"
              stroke="#2F6F6E"
              strokeOpacity="0.5"
              strokeWidth="2"
            />
          ))
        : null}

      {/* 梨の木（船橋の名産、北習志野・習志野台エリアの目印） */}
      {kitaNarashino
        ? [
            { dx: -70, dy: -40, scale: 1 },
            { dx: 42, dy: -58, scale: 0.85 },
            { dx: -18, dy: -72, scale: 0.75 }
          ].map((t, i) => {
            const bx = kitaNarashino.x + t.dx;
            const by = kitaNarashino.y + t.dy;
            return (
              <g key={i}>
                <line x1={bx} y1={by} x2={bx} y2={by - 16 * t.scale} stroke="#8F6A22" strokeWidth={3 * t.scale} />
                <circle cx={bx} cy={by - 22 * t.scale} r={11 * t.scale} fill="#B8862F" opacity="0.9" />
                <circle cx={bx - 5 * t.scale} cy={by - 18 * t.scale} r={7 * t.scale} fill="#D4A94F" opacity="0.85" />
              </g>
            );
          })
        : null}

      {/* 鉄道路線（実データに基づく駅を結ぶ簡易ライン） */}
      <path d={railPath} fill="none" stroke="#1B2430" strokeWidth="3" strokeOpacity="0.3" strokeDasharray="1 7" strokeLinecap="round" />
      <path d={railPath} fill="none" stroke="#1B2430" strokeWidth="1" strokeOpacity="0.55" />

      {/* エリアラベル */}
      {projectedStations.map((s) => {
        const style = AREA_STYLES[s.name];
        if (!style) return null;
        const labelY = s.y - AREA_RY + 22;
        return (
          <g key={`label-${s.name}`}>
            <text x={s.x} y={labelY} textAnchor="middle" className="font-display" fontSize="16" fill="#1B2430">
              {style.title}
            </text>
            <text x={s.x} y={labelY + 18} textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#3E4B5C">
              {style.sublabel}
            </text>
          </g>
        );
      })}

      {/* 駅マーカー（円の大きさは実際の乗車人員データに基づく） */}
      {projectedStations.map((s) => {
        const r = 4 + (s.count / maxCount) * 12;
        return (
          <g key={`station-${s.name}`}>
            <circle cx={s.x} cy={s.y} r={r} fill="#EDEBE4" stroke="#1B2430" strokeWidth="1.5" />
            <circle cx={s.x} cy={s.y} r={Math.max(r - 4, 2)} fill="#B8862F" />
            <text x={s.x} y={s.y + r + 16} textAnchor="middle" fontFamily="monospace" fontSize="11" fill="#1B2430">
              {s.name}駅
            </text>
          </g>
        );
      })}
    </svg>
  );
}
