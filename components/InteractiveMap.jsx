import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
// maplibre-gl.css は pages/_app.js でグローバル読み込みしています
// （Next.js Pages Routerの制約上、グローバルCSSはこのファイル単体からは読み込めないため）。

// OpenFreeMap（https://openfreemap.org）は、OpenStreetMapのデータを
// APIキー不要・利用回数制限なしで無料配信しているタイルサービス。
// Mapboxのような有償プランへの依存を避けるため、ベースマップにはこれを利用する。
const BASE_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

const DEFAULT_COLORS = [
  "#2F6F6E",
  "#B8862F",
  "#8F6A22",
  "#C0392B",
  "#3B6FA0",
  "#7B4B94",
  "#4C8E8C"
];

function colorForCategory(category, categoryColors, categoryOrder) {
  if (!category) return "#1B2430";
  if (categoryColors && categoryColors[category]) return categoryColors[category];
  const idx = categoryOrder.indexOf(category);
  return DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
}

/**
 * points: [{ lat, lng, label, category }]
 * categoryColors: { カテゴリ名: "#rrggbb" }（省略可、自動で色割り当て）
 * height: 地図の高さ（px指定。デフォルト420）
 * enable3dBuildings: OpenStreetMapの建物ポリゴンを3D押し出し表示するか（実験的機能）
 * showSidebar: 地図の左に施設リストを表示し、クリックでその施設へflyTo＋ポップアップを開く
 * enableHeatmap: 密集度を色の濃淡で示すヒートマップ表示に切り替えるボタンを追加するか
 */
export default function InteractiveMap({
  points = [],
  categoryColors,
  height = 420,
  enable3dBuildings = false,
  showSidebar = false,
  enableHeatmap = false
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const openMarkerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [heatmapOn, setHeatmapOn] = useState(false);

  // サイドバー・地図の両方で同じ並び順を使うため、有効な地点だけを先に確定しておく。
  const safePoints = useMemo(
    () =>
      (points || []).filter(
        (p) =>
          Number.isFinite(p.lat) && Number.isFinite(p.lng) && p.lat >= -90 && p.lat <= 90 && p.lng >= -180 && p.lng <= 180
      ),
    [points]
  );

  const categoryOrder = useMemo(
    () => [...new Set(safePoints.map((p) => p.category).filter(Boolean))],
    [safePoints]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center = safePoints.length
      ? [
          safePoints.reduce((s, p) => s + p.lng, 0) / safePoints.length,
          safePoints.reduce((s, p) => s + p.lat, 0) / safePoints.length
        ]
      : [139.9847, 35.6947]; // フォールバック：船橋市役所付近

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE_URL,
      center,
      zoom: safePoints.length ? 12.5 : 11,
      pitch: enable3dBuildings ? 45 : 0,
      attributionControl: true
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    mapRef.current = map;

    const markers = [];

    map.on("error", (e) => {
      // タイル取得失敗など、致命的でないエラーはコンソールにだけ出して地図表示は続ける
      console.warn("MapLibre error:", e?.error || e);
    });

    // コンテナのサイズ計算タイミングがずれて、地図が真っ白のまま止まって見える
    // ケースへの対策。読み込み完了時とウィンドウリサイズ時に明示的にリサイズを指示する。
    const handleResize = () => map.resize();
    window.addEventListener("resize", handleResize);

    map.on("load", () => {
      map.resize();
      // OSMの建物データに高さ属性がある場合のみ、簡易的な3D押し出しを試みる。
      // 日本の郊外エリアはOSM上の建物高さ情報が乏しいことが多く、
      // 平坦に近い表示になる場合がある点はご留意ください。
      // ここで何か例外が起きても、下のピン描画には絶対に影響させない（try/catchで完全に分離）。
      if (enable3dBuildings) {
        try {
          const layers = map.getStyle()?.layers || [];
          const labelLayerId = layers.find((l) => l.type === "symbol" && l.layout && l.layout["text-field"])?.id;
          const sourceId = map.getSource("openmaptiles") ? "openmaptiles" : map.getSource("openfreemap") ? "openfreemap" : null;

          if (sourceId) {
            map.addLayer(
              {
                id: "3d-buildings",
                source: sourceId,
                "source-layer": "building",
                type: "fill-extrusion",
                minzoom: 14,
                paint: {
                  "fill-extrusion-color": "#8a8f98",
                  "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["*", ["coalesce", ["get", "levels"], 2], 3]],
                  "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
                  "fill-extrusion-opacity": 0.75
                }
              },
              labelLayerId
            );
          }
        } catch (e) {
          // スタイル構造がOpenFreeMapのバージョンで変わる場合があるため、
          // レイヤー追加に失敗しても地図・ピン表示は続ける。
          console.warn("3D building layer unavailable:", e);
        }
      }

      // ヒートマップ用レイヤー（enableHeatmapがtrueの時だけ）。マーカー描画とは
      // 完全に独立させ、ここで何か失敗してもピン表示には影響させない。
      if (enableHeatmap && safePoints.length) {
        try {
          map.addSource("heat-points", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: safePoints.map((p) => ({
                type: "Feature",
                properties: {},
                geometry: { type: "Point", coordinates: [p.lng, p.lat] }
              }))
            }
          });
          map.addLayer({
            id: "heat-layer",
            type: "heatmap",
            source: "heat-points",
            layout: { visibility: "none" },
            paint: {
              "heatmap-weight": 1,
              "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 15, 3],
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(0,0,0,0)",
                0.2,
                "#2F6F6E",
                0.4,
                "#B8862F",
                0.7,
                "#C0392B",
                1,
                "#7B4B94"
              ],
              "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 8, 15, 34],
              "heatmap-opacity": 0.8
            }
          });
        } catch (e) {
          console.warn("Heatmap layer unavailable:", e);
        }
      }

      safePoints.forEach((p, i) => {
        const el = document.createElement("div");
        el.style.width = "14px";
        el.style.height = "14px";
        el.style.borderRadius = "50%";
        el.style.border = "2px solid #EDEBE4";
        el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.4)";
        el.style.backgroundColor = colorForCategory(p.category, categoryColors, categoryOrder);
        el.style.cursor = "pointer";

        const popup = new maplibregl.Popup({ offset: 12, closeButton: true }).setHTML(
          `<div style="font-family:inherit;font-size:13px;line-height:1.5;">
             <strong>${escapeHtml(p.label || "地点")}</strong>
             ${p.category ? `<br/><span style="color:#666">${escapeHtml(p.category)}</span>` : ""}
           </div>`
        );

        const marker = new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map);

        el.addEventListener("click", () => {
          map.flyTo({ center: [p.lng, p.lat], zoom: 15.5, duration: 900 });
          openMarkerRef.current = marker;
          setActiveIndex(i);
        });

        markers.push({ marker, point: p });
      });

      markersRef.current = markers;
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      markers.forEach((m) => m.marker.remove());
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ヒートマップ／ピン表示の切り替え。レイヤーの表示・非表示と、
  // HTMLマーカー（ピン）の表示・非表示の両方を切り替える。
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !enableHeatmap) return;

    function apply() {
      if (map.getLayer("heat-layer")) {
        map.setLayoutProperty("heat-layer", "visibility", heatmapOn ? "visible" : "none");
      }
      markersRef.current.forEach((m) => {
        m.marker.getElement().style.display = heatmapOn ? "none" : "";
      });
    }

    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [heatmapOn, enableHeatmap]);

  function flyToIndex(i) {
    const entry = markersRef.current[i];
    if (!entry || !mapRef.current) return;

    mapRef.current.flyTo({ center: [entry.point.lng, entry.point.lat], zoom: 15.5, duration: 900 });

    // 既に開いている別のポップアップがあれば閉じてから、選んだ地点のポップアップを開く。
    if (openMarkerRef.current && openMarkerRef.current !== entry.marker && openMarkerRef.current.getPopup()?.isOpen()) {
      openMarkerRef.current.togglePopup();
    }
    if (!entry.marker.getPopup()?.isOpen()) {
      entry.marker.togglePopup();
    }
    openMarkerRef.current = entry.marker;
    setActiveIndex(i);
  }

  return (
    <div style={{ display: "flex", gap: showSidebar ? 10 : 0, height }}>
      {showSidebar && (
        <div
          style={{
            width: 220,
            flexShrink: 0,
            overflowY: "auto",
            border: "1px solid rgba(27,36,48,0.12)",
            borderRadius: 2,
            background: "rgba(255,255,255,0.7)"
          }}
        >
          {safePoints.map((p, i) => (
            <button
              key={`${p.label}-${p.lat}-${p.lng}-${i}`}
              onClick={() => flyToIndex(i)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                fontSize: 12,
                lineHeight: 1.4,
                border: "none",
                borderBottom: "1px solid rgba(27,36,48,0.08)",
                background: activeIndex === i ? "rgba(27,36,48,0.08)" : "transparent",
                cursor: "pointer"
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  marginRight: 6,
                  backgroundColor: colorForCategory(p.category, categoryColors, categoryOrder)
                }}
              />
              <strong>{p.label || "地点"}</strong>
              {p.category ? <div style={{ marginLeft: 14, color: "#666" }}>{p.category}</div> : null}
            </button>
          ))}
        </div>
      )}
      <div style={{ position: "relative", flex: 1, minWidth: 0, height: "100%" }}>
        {enableHeatmap && (
          <button
            type="button"
            onClick={() => setHeatmapOn((v) => !v)}
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 1,
              padding: "6px 10px",
              fontSize: 12,
              border: "1px solid rgba(27,36,48,0.2)",
              borderRadius: 2,
              background: "rgba(255,255,255,0.9)",
              cursor: "pointer"
            }}
          >
            {heatmapOn ? "📍 ピン表示に切り替え" : "🔥 ヒートマップ表示に切り替え"}
          </button>
        )}
        <div
          ref={containerRef}
          style={{ height: "100%", width: "100%", borderRadius: "2px" }}
          role="img"
          aria-label="船橋市内の施設を示すインタラクティブ地図"
        />
      </div>
    </div>
  );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
