import { useEffect, useRef, useState, useCallback } from "react";
import {
  useInfiniteRecommendations,
  useInfiniteRecommendationsByUserId,
} from "@/hooks/useActivities";
import { fetchUserById, RankedRecommendation } from "@/lib/api";
import { Loader2, MapPinOff, RefreshCw, Locate } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ── Category colours (same palette as ActivityCard) ────────────────────── */
const CATEGORY_COLORS: Record<string, { bg: string; border: string; dot: string }> = {
  restaurant: { bg: "#fff1f2", border: "#f43f5e", dot: "#e11d48" },
  cafe: { bg: "#fffbeb", border: "#f59e0b", dot: "#d97706" },
  bar: { bg: "#faf5ff", border: "#a855f7", dot: "#9333ea" },
  museum: { bg: "#eff6ff", border: "#3b82f6", dot: "#2563eb" },
  park: { bg: "#ecfdf5", border: "#10b981", dot: "#059669" },
  hotel: { bg: "#ecfeff", border: "#06b6d4", dot: "#0891b2" },
};

const DEFAULT_COLOR = { bg: "#f8fafc", border: "#94a3b8", dot: "#64748b" };

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "restaurant", label: "Restaurants" },
  { value: "cafe", label: "Cafes" },
  { value: "bar", label: "Bars" },
  { value: "museum", label: "Museums" },
  { value: "park", label: "Parks" },
  { value: "hotel", label: "Hotels" },
];

/* ── Custom marker icon builder ─────────────────────────────────────────── */
function buildMarkerIcon(type: string | null): L.DivIcon {
  const key = type?.toLowerCase() ?? "";
  const c = CATEGORY_COLORS[key] ?? DEFAULT_COLOR;

  return L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
    html: `
      <div style="
        width:32px;height:32px;display:flex;align-items:flex-end;justify-content:center;
        filter:drop-shadow(0 2px 4px rgba(0,0,0,.25));
      ">
        <svg viewBox="0 0 24 36" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
                fill="${c.border}"/>
          <circle cx="12" cy="12" r="5" fill="${c.bg}" stroke="${c.dot}" stroke-width="1.5"/>
        </svg>
      </div>`,
  });
}

/* ── User location marker (pulsing blue dot) ────────────────────────────── */
function buildUserIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `
      <div style="position:relative;width:24px;height:24px;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:rgba(59,130,246,.2);
          animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
        <div style="
          position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          width:14px;height:14px;border-radius:50%;
          background:#3b82f6;border:3px solid #fff;
          box-shadow:0 1px 4px rgba(0,0,0,.3);
        "></div>
      </div>
      <style>@keyframes ping{75%,100%{transform:scale(2.2);opacity:0}}</style>`,
  });
}

/* ── Popup HTML builder ─────────────────────────────────────────────────── */
function buildPopupHTML(r: RankedRecommendation): string {
  const key = r.type?.toLowerCase() ?? "";
  const c = CATEGORY_COLORS[key] ?? DEFAULT_COLOR;
  const openBadge = r.is_open
    ? `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:999px;background:#dcfce7;color:#166534;font-size:11px;font-weight:600;">
         <span style="width:6px;height:6px;border-radius:50%;background:#16a34a;"></span>Open
       </span>`
    : `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:999px;background:#f1f5f9;color:#475569;font-size:11px;font-weight:600;">Closed</span>`;

  return `
    <div style="font-family:'Inter',system-ui,sans-serif;min-width:220px;max-width:280px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="
          display:inline-block;padding:2px 10px;border-radius:999px;
          background:${c.bg};color:${c.dot};font-size:11px;font-weight:600;
          border:1px solid ${c.border}30;text-transform:capitalize;
        ">${(r.type ?? "other").replace(/_/g, " ")}</span>
        ${openBadge}
      </div>
      <h3 style="margin:0 0 6px 0;font-size:15px;font-weight:700;color:#1e293b;line-height:1.3;">
        ${r.name}
      </h3>
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;font-size:12px;color:#64748b;">
        <span title="Distance">📍 ${r.distance_km.toFixed(1)} km</span>
        <span title="Score">⭐ ${(r.recommendation_score * 100).toFixed(0)}%</span>
        <span title="Rank">#${r.rank}</span>
      </div>
      <a href="https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}"
         target="_blank" rel="noreferrer"
         style="
           display:inline-flex;align-items:center;gap:6px;margin-top:12px;
           padding:6px 14px;border-radius:8px;
           background:linear-gradient(135deg,${c.border},${c.dot});
           color:#fff;font-size:12px;font-weight:600;text-decoration:none;
           transition:opacity .2s;
         "
         onmouseover="this.style.opacity='0.85'"
         onmouseout="this.style.opacity='1'"
      >
        Open in Maps ↗
      </a>
    </div>`;
}

/* ── Main component ─────────────────────────────────────────────────────── */
export function RecommendationsMap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const selectedCoordsMarkerRef = useRef<L.CircleMarker | null>(null);

  const [category, setCategory] = useState("all");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");
  const [userIdInput, setUserIdInput] = useState("8");
  const [selectedUserCoords, setSelectedUserCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const parsedLatitude = parseOptionalNumber(latitudeInput);
  const parsedLongitude = parseOptionalNumber(longitudeInput);
  const hasCoordinateFilters = parsedLatitude != null && parsedLongitude != null;
  const parsedUserId = parseOptionalInteger(userIdInput);
  const userId = parsedUserId ?? 8;
  const selectedPoint = hasCoordinateFilters
    ? {
        lat: parsedLatitude as number,
        lng: parsedLongitude as number,
        label: "Selected Coordinates",
      }
    : selectedUserCoords
      ? {
          lat: selectedUserCoords.lat,
          lng: selectedUserCoords.lng,
          label: `User ${userId} Coordinates`,
        }
      : null;

  const coordinateRecommendations = useInfiniteRecommendations(
    parsedLatitude ?? 41.9981,
    parsedLongitude ?? 21.4254,
    category,
    undefined,
    "auto",
    filters.open_now === true,
    hasCoordinateFilters,
  );

  const userRecommendations = useInfiniteRecommendationsByUserId(
    userId,
    category,
    undefined,
    "auto",
    filters.open_now === true,
    !hasCoordinateFilters,
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    hasCoordinateFilters ? coordinateRecommendations : userRecommendations;

  // Flatten all pages
  const recommendations: RankedRecommendation[] = data
    ? data.pages.flatMap((p) => p.recommendations ?? [])
    : [];

  /* ── Fetch all pages on mount / category change ───────────────────────── */
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, data]);

  /* ── Get user location ────────────────────────────────────────────────── */
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        /* silently fail */
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, []);

  useEffect(() => {
    locateUser();
  }, [locateUser]);

  /* ── Resolve selected user coordinates (ID mode) ────────────────────── */
  useEffect(() => {
    if (hasCoordinateFilters) {
      setSelectedUserCoords(null);
      return;
    }

    const controller = new AbortController();

    fetchUserById(userId, controller.signal)
      .then((user) => {
        if (typeof user.latitude === "number" && typeof user.longitude === "number") {
          setSelectedUserCoords({ lat: user.latitude, lng: user.longitude });
          return;
        }
        setSelectedUserCoords(null);
      })
      .catch(() => {
        setSelectedUserCoords(null);
      });

    return () => controller.abort();
  }, [hasCoordinateFilters, userId]);

  /* ── Initialize map ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [41.9981, 21.4254], // Skopje default
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* ── User marker ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userPos) {
      userMarkerRef.current = L.marker([userPos.lat, userPos.lng], { icon: buildUserIcon() })
        .addTo(mapRef.current)
        .bindPopup(
          `<div style="font-family:'Inter',system-ui,sans-serif;text-align:center;padding:4px;">
             <strong style="font-size:13px;">📍 Your Location</strong>
             <p style="margin:4px 0 0;font-size:11px;color:#64748b;">
               ${userPos.lat.toFixed(5)}, ${userPos.lng.toFixed(5)}
             </p>
           </div>`,
        );
    }
  }, [userPos]);

  /* ── Selected coordinate marker (from inputs) ───────────────────────── */
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedCoordsMarkerRef.current) {
      selectedCoordsMarkerRef.current.remove();
      selectedCoordsMarkerRef.current = null;
    }

    if (!selectedPoint) return;

    selectedCoordsMarkerRef.current = L.circleMarker([selectedPoint.lat, selectedPoint.lng], {
      radius: 9,
      color: "#1d4ed8",
      weight: 3,
      fillColor: "#3b82f6",
      fillOpacity: 0.9,
    })
      .addTo(mapRef.current)
      .bindPopup(
        `<div style="font-family:'Inter',system-ui,sans-serif;text-align:center;padding:4px;">
           <strong style="font-size:13px;">${selectedPoint.label}</strong>
           <p style="margin:4px 0 0;font-size:11px;color:#64748b;">
             ${selectedPoint.lat.toFixed(5)}, ${selectedPoint.lng.toFixed(5)}
           </p>
         </div>`,
      );

    mapRef.current.flyTo([selectedPoint.lat, selectedPoint.lng], 14, { duration: 0.8 });
  }, [selectedPoint]);

  /* ── Recommendation markers ───────────────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    if (recommendations.length === 0) return;

    const bounds = L.latLngBounds([]);

    recommendations.forEach((r) => {
      if (r.latitude == null || r.longitude == null) return;

      // Local filter: only show markers matching the selected category
      if (category !== "all") {
        const typeMatch = r.type?.toLowerCase() === category.toLowerCase();
        // Fallback for types that might contain the category name (e.g. "italian_restaurant" matches "restaurant")
        const typeIncludes = r.type?.toLowerCase().includes(category.toLowerCase());
        if (!typeMatch && !typeIncludes) return;
      }

      const marker = L.marker([r.latitude, r.longitude], {
        icon: buildMarkerIcon(r.type),
      }).bindPopup(buildPopupHTML(r), {
        maxWidth: 300,
        className: "roam-popup",
      });

      markersRef.current!.addLayer(marker);
      bounds.extend([r.latitude, r.longitude]);
    });

    if (userPos) {
      bounds.extend([userPos.lat, userPos.lng]);
    }

    if (selectedPoint) {
      bounds.extend([selectedPoint.lat, selectedPoint.lng]);
    }

    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [recommendations, userPos, category, selectedPoint]);

  /* ── Fly-to-user helper ───────────────────────────────────────────────── */
  const flyToUser = () => {
    if (mapRef.current && userPos) {
      mapRef.current.flyTo([userPos.lat, userPos.lng], 15, { duration: 1 });
    } else {
      locateUser();
    }
  };

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="relative flex flex-1 flex-col" style={{ minHeight: "calc(100vh - 4rem)" }}>
      {/* ── Floating controls ──────────────────────────────────────────── */}
      <div
        className="absolute left-0 right-0 top-0 z-[1000] mx-auto max-w-5xl px-4 pt-4"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card/90 p-2.5 shadow-hover backdrop-blur-xl"
          style={{ pointerEvents: "auto" }}
        >
          {CATEGORIES.map((c) => {
            const active = category === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-smooth ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-card"
                    : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent"
                }`}
              >
                {c.label}
              </button>
            );
          })}

          <input
            type="number"
            min={1}
            placeholder="User ID"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            className="h-8 w-24 rounded-lg border border-input bg-background px-2 text-xs outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-ring/30"
            title="User ID (used when coordinates are empty)"
          />

          <input
            type="number"
            min={-90}
            max={90}
            step={0.000001}
            placeholder="Lat"
            value={latitudeInput}
            onChange={(e) => setLatitudeInput(e.target.value)}
            className="h-8 w-24 rounded-lg border border-input bg-background px-2 text-xs outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-ring/30"
            title="Latitude"
          />

          <input
            type="number"
            min={-180}
            max={180}
            step={0.000001}
            placeholder="Lon"
            value={longitudeInput}
            onChange={(e) => setLongitudeInput(e.target.value)}
            className="h-8 w-24 rounded-lg border border-input bg-background px-2 text-xs outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-ring/30"
            title="Longitude"
          />

          <div className="ml-auto flex items-center gap-1.5">
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              {isLoading
                ? "Loading…"
                : `${recommendations.length} place${recommendations.length !== 1 ? "s" : ""}`}
            </span>

            <span className="hidden text-[11px] font-medium text-muted-foreground md:inline">
              {hasCoordinateFilters ? "Source: coordinates" : `Source: user ${userId}`}
            </span>

            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={flyToUser}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground"
              title="Go to my location"
            >
              <Locate className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading overlay ────────────────────────────────────────────── */}
      {isLoading && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-card px-6 py-4 shadow-hover">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading recommendations…</span>
          </div>
        </div>
      )}

      {/* ── Error overlay ──────────────────────────────────────────────── */}
      {isError && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-hover">
            <MapPinOff className="h-8 w-8 text-destructive" />
            <h3 className="font-display text-lg font-semibold">Couldn't load recommendations</h3>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-smooth hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Map container ──────────────────────────────────────────────── */}
      <div ref={mapContainerRef} className="flex-1" id="recommendations-map" />
    </div>
  );
}

function parseOptionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalInteger(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const intValue = Math.trunc(parsed);
  return intValue > 0 ? intValue : null;
}
