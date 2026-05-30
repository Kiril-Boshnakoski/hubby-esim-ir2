import { useState } from "react";
import { Activity, ActivityFilters } from "@/lib/api";
import { useActivities } from "@/hooks/useActivities";
import { ActivityCard } from "./ActivityCard";
import { ActivityDetailModal } from "./ActivityDetailModal";
import { FilterBar } from "./FilterBar";
import { AlertCircle, Loader2, MapPinOff, RefreshCw } from "lucide-react";

interface Props {
  initialFilters?: ActivityFilters;
}

export function DiscoverSection({ initialFilters = { limit: 24, category: "all" } }: Props) {
  const [filters, setFilters] = useState<ActivityFilters>(initialFilters);
  const [selected, setSelected] = useState<Activity | null>(null);
  const { data, loading, error, validationError, refresh } = useActivities(filters);

  const emptyReason = getEmptyReason(filters);
  const showLoadingState = loading && !error && !validationError;
  const showErrorState = !loading && !validationError && !!error;
  const showValidationState = !!validationError;
  const showEmptyState = !loading && !error && !validationError && data != null && data.length === 0;
  const showCards = !loading && !error && !validationError && !!data && data.length > 0;

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

      <FilterBar filters={filters} onChange={setFilters} validationError={validationError} />

      {showLoadingState && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading recommendations...</span>
        </div>
      )}

      {showValidationState && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-foreground">
          <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-4 w-4" />
            Check your coordinates
          </div>
          <p className="text-muted-foreground">{validationError}</p>
        </div>
      )}

      {showErrorState && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold">Couldn't load recommendations</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              We couldn’t load recommendations right now. Please try again.
            </p>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-smooth hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        </div>
      )}

      {showEmptyState && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <MapPinOff className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold">No nearby activities found</h3>
            <p className="mt-1 text-sm text-muted-foreground">{emptyReason}</p>
          </div>
        </div>
      )}

      {showCards && (
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

function getEmptyReason(filters: ActivityFilters): string {
  if (filters.latitude != null && filters.longitude != null && filters.open_now) {
    return "All matching places are closed right now.";
  }

  if (filters.latitude != null && filters.longitude != null && filters.radius_km != null) {
    return `Nothing matched within your selected ${filters.radius_km} km radius.`;
  }

  if (filters.latitude != null && filters.longitude != null) {
    return "No nearby activities were found for this location.";
  }

  if (filters.category && filters.category !== "all") {
    return `No ${filters.category.replace(/_/g, " ")} activities matched your filters.`;
  }

  if (filters.min_rating != null || filters.min_rating_count != null) {
    return "No activities matched your quality filters.";
  }

  return "Try widening your search or clearing some filters.";
}
