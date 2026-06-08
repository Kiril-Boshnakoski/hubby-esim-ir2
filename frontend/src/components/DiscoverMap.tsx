import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface DiscoverMapPoint {
  id: string;
  name: string;
  type: string | null;
  lat: number;
  lng: number;
  score: number | null;
  isOpen: boolean | null;
  distance: number | null;
}

interface Props {
  points: DiscoverMapPoint[];
  center?: { lat: number; lng: number };
  centerLabel?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; dot: string }> = {
  restaurant: { bg: "#fff1f2", border: "#f43f5e", dot: "#e11d48" },
  cafe: { bg: "#fffbeb", border: "#f59e0b", dot: "#d97706" },
  bar: { bg: "#faf5ff", border: "#a855f7", dot: "#9333ea" },
  museum: { bg: "#eff6ff", border: "#3b82f6", dot: "#2563eb" },
  park: { bg: "#ecfdf5", border: "#10b981", dot: "#059669" },
  hotel: { bg: "#ecfeff", border: "#06b6d4", dot: "#0891b2" },
};
const DEFAULT_COLOR = { bg: "#fff6e6", border: "#a78863", dot: "#7d5a3a" };

function pinIcon(type: string | null): L.DivIcon {
  const c = CATEGORY_COLORS[(type ?? "").toLowerCase()] ?? DEFAULT_COLOR;
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
    html: `<svg viewBox="0 0 24 36" width="28" height="28" fill="none"
        xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.25));">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
              fill="${c.border}"/>
        <circle cx="12" cy="12" r="4.5" fill="${c.bg}" stroke="${c.dot}" stroke-width="1.5"/>
      </svg>`,
  });
}

function popupHTML(p: DiscoverMapPoint): string {
  const c = CATEGORY_COLORS[(p.type ?? "").toLowerCase()] ?? DEFAULT_COLOR;
  const score10 = p.score != null ? (p.score <= 1 ? p.score * 10 : p.score).toFixed(1) : null;
  return `
    <div style="font-family:'Inter',system-ui,sans-serif;min-width:200px;max-width:260px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <span style="display:inline-block;padding:2px 8px;border-radius:999px;
          background:${c.bg};color:${c.dot};font-size:10px;font-weight:600;
          border:1px solid ${c.border}30;text-transform:capitalize;">
          ${(p.type ?? "place").replace(/_/g, " ")}
        </span>
        ${
          p.isOpen === true
            ? `<span style="padding:2px 8px;border-radius:999px;background:#dcfce7;color:#166534;font-size:10px;font-weight:600;">Open</span>`
            : p.isOpen === false
              ? `<span style="padding:2px 8px;border-radius:999px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:600;">Closed</span>`
              : ""
        }
      </div>
      <h3 style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:#1e293b;line-height:1.3;">
        ${p.name}
      </h3>
      <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:11px;color:#64748b;">
        ${p.distance != null ? `<span>📍 ${p.distance.toFixed(1)} km</span>` : ""}
        ${score10 != null ? `<span>✨ Score ${score10}/10</span>` : ""}
      </div>
      <a href="https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}"
         target="_blank" rel="noreferrer"
         style="display:inline-block;margin-top:10px;padding:5px 12px;border-radius:8px;
           background:linear-gradient(135deg,${c.border},${c.dot});
           color:#fff;font-size:11px;font-weight:600;text-decoration:none;">
        Open in Maps ↗
      </a>
    </div>`;
}

export function DiscoverMap({ points, center, centerLabel }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // init
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [center?.lat ?? 41.9981, center?.lng ?? 21.4254],
      zoom: 13,
      zoomControl: false,
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // points
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (points.length === 0) return;
    const bounds = L.latLngBounds([]);
    points.forEach((p) => {
      L.marker([p.lat, p.lng], { icon: pinIcon(p.type) })
        .bindPopup(popupHTML(p), { maxWidth: 280, className: "roam-popup" })
        .addTo(layer);
      bounds.extend([p.lat, p.lng]);
    });
    // add a blue point for the user's entered coordinates / current center
    if (center) {
      L.circleMarker([center.lat, center.lng], {
        radius: 8,
        color: "#1e40af",
        weight: 2,
        fillColor: "#3b82f6",
        fillOpacity: 1,
      })
        .bindPopup(centerLabel ?? "You are here")
        .addTo(layer);
      bounds.extend([center.lat, center.lng]);
    }
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [points, center, centerLabel]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div
        ref={containerRef}
        className="h-[420px] w-full lg:h-[calc(100vh-9rem)]"
        aria-label="Map of recommended activities"
      />
    </div>
  );
}
