import { useState } from "react";
import { Activity, ActivityFilters } from "@/lib/api";
import { useActivities } from "@/hooks/useActivities";
import { ActivityCard } from "./ActivityCard";
import { ActivityCardSkeleton } from "./ActivityCardSkeleton";
import { ActivityDetailModal } from "./ActivityDetailModal";
import { FilterBar } from "./FilterBar";
import { AlertCircle, RefreshCw, MapPinOff } from "lucide-react";

interface Props {
  initialFilters?: ActivityFilters;
}

export function DiscoverSection({ initialFilters = { limit: 24, category: "all" } }: Props) {
  const [filters, setFilters] = useState<ActivityFilters>(initialFilters);
  const [selected, setSelected] = useState<Activity | null>(null);
  const { data, loading, error, refresh } = useActivities(filters);

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Explore nearby
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? "Searching the neighborhood…"
              : data
                ? `${data.length} place${data.length === 1 ? "" : "s"} found`
                : "Discover places worth your time"}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium transition-smooth hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {error && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold">Couldn't reach the server</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{error}</p>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-smooth hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ActivityCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && data && data.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <MapPinOff className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold">No places match these filters</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try widening your search or clearing some filters.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && data && data.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((a, i) => (
            <ActivityCard
              key={(a.id as string) ?? `${a.name}-${i}`}
              activity={a}
              onClick={() => setSelected(a)}
            />
          ))}
        </div>
      )}

      <ActivityDetailModal activity={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
