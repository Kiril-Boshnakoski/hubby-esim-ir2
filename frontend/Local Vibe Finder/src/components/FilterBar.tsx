import { ActivityFilters } from "@/lib/api";
import { Crosshair, X } from "lucide-react";
import { useState } from "react";

interface Props {
  filters: ActivityFilters;
  onChange: (f: ActivityFilters) => void;
  validationError?: string | null;
}

export const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "restaurant", label: "Restaurants" },
  { value: "cafe", label: "Cafes" },
  { value: "bar", label: "Bars" },
  { value: "museum", label: "Museums" },
  { value: "park", label: "Parks" },
  { value: "hotel", label: "Hotels" },
];

export function FilterBar({ filters, onChange, validationError }: Props) {
  const activeCat = filters.category ?? "all";
  const update = (patch: Partial<ActivityFilters>) => onChange({ ...filters, ...patch });

  const [geoError, setGeoError] = useState<string | null>(null);

  const hasExtras =
    !!filters.open_now ||
    filters.radius_km != null ||
    filters.latitude != null ||
    filters.longitude != null ||
    filters.user_id != null;

  const useCurrentLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => update({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setGeoError("Unable to read your location."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-3">
      {/* Category pills */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => {
          const active = activeCat === c.value;
          return (
            <button
              key={c.value}
              onClick={() => update({ category: c.value })}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-smooth ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-card"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Essential quick filters: open now, radius, locate */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => update({ open_now: filters.open_now ? undefined : true })}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-smooth ${
            filters.open_now
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:bg-accent"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              filters.open_now ? "bg-primary-foreground" : "bg-success"
            }`}
          />
          Open now
        </button>

        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs">
          <label className="font-medium text-muted-foreground">Radius</label>
          <select
            value={filters.radius_km ?? ""}
            onChange={(e) =>
              update({ radius_km: e.target.value ? Number(e.target.value) : undefined })
            }
            className="bg-transparent text-xs font-semibold text-foreground outline-none"
          >
            <option value="">Any</option>
            <option value="0.5">0.5 km</option>
            <option value="1">1 km</option>
            <option value="2">2 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
          </select>
        </div>

        <button
          type="button"
          onClick={useCurrentLocation}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-smooth hover:bg-accent"
        >
          <Crosshair className="h-3.5 w-3.5" />
          {filters.latitude != null && filters.longitude != null
            ? "Using my location"
            : "Use my location"}
        </button>

        {/* Lat / Lon inputs */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs">
          <label className="font-medium text-muted-foreground">Lat</label>
          <input
            value={filters.latitude ?? ""}
            onChange={(e) => update({ latitude: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="41.9981"
            className="w-20 bg-transparent text-xs font-semibold text-foreground outline-none"
            type="number"
            step="any"
          />
          <label className="font-medium text-muted-foreground">Lon</label>
          <input
            value={filters.longitude ?? ""}
            onChange={(e) => update({ longitude: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="21.4254"
            className="w-20 bg-transparent text-xs font-semibold text-foreground outline-none"
            type="number"
            step="any"
          />
        </div>

        {/* User ID input */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs">
          <label className="font-medium text-muted-foreground">User</label>
          <input
            value={filters.user_id ?? ""}
            onChange={(e) => update({ user_id: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="8"
            className="w-20 bg-transparent text-xs font-semibold text-foreground outline-none"
            type="number"
          />
        </div>

        {hasExtras && (
          <button
            onClick={() =>
              onChange({
                // Keep persistent choices but clear transient filters
                category: filters.category,
                limit: filters.limit,
              })
            }
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {geoError && <p className="text-xs text-destructive">{geoError}</p>}
      {validationError && <p className="text-xs text-destructive">{validationError}</p>}
    </div>
  );
}
