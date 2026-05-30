import { ActivityFilters } from "@/lib/api";
import { SlidersHorizontal, X, MapPin, Crosshair } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const activeCat = filters.category ?? "all";

  const update = (patch: Partial<ActivityFilters>) => onChange({ ...filters, ...patch });

  const [geoError, setGeoError] = useState<string | null>(null);

  const advancedCount =
    (filters.min_rating ? 1 : 0) +
    (filters.min_rating_count ? 1 : 0) +
    (filters.open_now ? 1 : 0) +
    (filters.limit && filters.limit !== 24 ? 1 : 0) +
    (filters.latitude != null ? 1 : 0) +
    (filters.longitude != null ? 1 : 0) +
    (filters.radius_km != null && filters.radius_km !== 1 ? 1 : 0);

  const useCurrentLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        update({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setGeoError("Unable to read your location. Please allow location access and try again.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Category chips */}
      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((c) => {
          const active = activeCat === c.value;
          return (
            <button
              key={c.value}
              onClick={() => update({ category: c.value })}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-smooth ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-card"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent"
              }`}
            >
              {c.label}
            </button>
          );
        })}

        <div className="ml-auto shrink-0">
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-accent"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {advancedCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                {advancedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label={`Min rating: ${filters.min_rating ?? 0}`}>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={filters.min_rating ?? 0}
                onChange={(e) => update({ min_rating: Number(e.target.value) })}
                className="w-full accent-(--color-primary)"
              />
            </Field>

            <Field label="Min reviews">
              <input
                type="number"
                min={0}
                placeholder="0"
                value={filters.min_rating_count ?? ""}
                onChange={(e) =>
                  update({ min_rating_count: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </Field>

            <Field label="Limit">
              <select
                value={filters.limit ?? 24}
                onChange={(e) => update({ limit: Number(e.target.value) })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-ring/30"
              >
                {[12, 24, 48, 100].map((n) => (
                  <option key={n} value={n}>{n} results</option>
                ))}
              </select>
            </Field>

            <Field label="Latitude">
              <input
                type="number"
                min={-90}
                max={90}
                step={0.000001}
                placeholder="41.123"
                value={filters.latitude ?? ""}
                onChange={(e) => update({ latitude: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </Field>

            <Field label="Longitude">
              <input
                type="number"
                min={-180}
                max={180}
                step={0.000001}
                placeholder="20.801"
                value={filters.longitude ?? ""}
                onChange={(e) => update({ longitude: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </Field>

            <Field label="Radius (km)">
              <input
                type="number"
                min={0.1}
                step={0.1}
                placeholder="1"
                value={filters.radius_km ?? 1}
                onChange={(e) => update({ radius_km: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </Field>

            <Field label="Availability">
              <label className="flex h-9.5 cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm">
                <input
                  type="checkbox"
                  checked={!!filters.open_now}
                  onChange={(e) => update({ open_now: e.target.checked || undefined })}
                  className="h-4 w-4 accent-(--color-primary)"
                />
                Open now only
              </label>
            </Field>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-muted p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <p>Use your current location to fill latitude and longitude.</p>
            </div>
            <button
              type="button"
              onClick={useCurrentLocation}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-accent"
            >
              <Crosshair className="h-4 w-4" />
              Use my location
            </button>
          </div>
          {geoError && <p className="text-sm text-destructive">{geoError}</p>}
          {validationError && <p className="text-sm text-destructive">{validationError}</p>}

          {advancedCount > 0 && (
            <button
              onClick={() =>
                onChange({ category: filters.category, limit: filters.limit })
              }
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
