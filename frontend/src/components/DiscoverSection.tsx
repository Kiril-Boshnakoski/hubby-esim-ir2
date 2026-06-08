import { useState, useEffect, useMemo } from "react";
import {
  useInfiniteRecommendations,
  useInfiniteRecommendationsByUserId,
} from "@/hooks/useActivities";
import { ActivityCard } from "./ActivityCard";
import { ActivityDetailModal } from "./ActivityDetailModal";
import { FilterBar } from "./FilterBar";
import { DiscoverMap } from "./DiscoverMap";
import { AlertCircle, Loader2, MapPinOff, RefreshCw } from "lucide-react";
import { fetchUserById, UserProfile } from "@/lib/api";

interface ActivityFilters {
  limit?: number;
  category?: string;
  user_id?: number;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  open_now?: boolean;
  min_rating?: number;
  min_rating_count?: number;
}

interface Props {
  initialFilters?: ActivityFilters;
}

const CONTEXTS = ["auto", "breakfast", "lunch", "dinner", "nightlife"];

export function DiscoverSection({ initialFilters = { limit: 10, category: "all" } }: Props) {
  const [filters, setFilters] = useState<ActivityFilters>(initialFilters);
  const [context, setContext] = useState("auto");
  const [selected, setSelected] = useState<any | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const userId = filters.user_id ?? 8;
  const hasCoordinateFilters =
    typeof filters.latitude === "number" && typeof filters.longitude === "number";

  useEffect(() => {
    if (hasCoordinateFilters || !filters.user_id) {
      setSelectedUser(null);
      return;
    }
    const controller = new AbortController();
    fetchUserById(filters.user_id, controller.signal)
      .then((user) => {
        setSelectedUser(user);
      })
      .catch(() => {
        setSelectedUser(null);
      });
    return () => controller.abort();
  }, [hasCoordinateFilters, filters.user_id]);

  const centerCoords = useMemo(() => {
    if (hasCoordinateFilters) {
      return { lat: filters.latitude!, lng: filters.longitude! };
    }
    if (selectedUser?.latitude != null && selectedUser?.longitude != null) {
      return { lat: selectedUser.latitude, lng: selectedUser.longitude };
    }
    return undefined;
  }, [hasCoordinateFilters, filters.latitude, filters.longitude, selectedUser]);

  const centerLabel = useMemo(() => {
    if (hasCoordinateFilters) {
      return "Selected Coordinates";
    }
    if (selectedUser) {
      return `${selectedUser.name} ${selectedUser.surname ?? ""}`.trim();
    }
    return "You are here";
  }, [hasCoordinateFilters, selectedUser]);

  const coordinateRecommendations = useInfiniteRecommendations(
    filters.latitude ?? 41.9981,
    filters.longitude ?? 21.4254,
    filters.category ?? "all",
    filters.radius_km,
    context,
    filters.open_now === true,
    hasCoordinateFilters,
  );

  const userRecommendations = useInfiniteRecommendationsByUserId(
    userId,
    filters.category ?? "all",
    filters.radius_km,
    context,
    filters.open_now === true,
    !hasCoordinateFilters,
  );

  const activeQuery = hasCoordinateFilters ? coordinateRecommendations : userRecommendations;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loading,
    isError: error,
    refetch: refresh,
  } = activeQuery;

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const rawItems = data
    ? data.pages.flatMap((page: any) => page.recommendations || page.activities || [])
    : [];

  const items = rawItems.map((item: any) => ({
    ...item,
    rating: item.rating ?? item.user_rating ?? null,
    user_rating_count: item.user_rating_count ?? item.reviews ?? null,
    formatted_address: item.formatted_address ?? item.address ?? null,
    phone_number: item.phone_number ?? item.phone ?? null,
    category: item.category ?? item.type ?? filters.category,
  }));

  const mapPoints = useMemo(
    () =>
      items
        .map((i: any) => ({
          id: String(i.id ?? `${i.latitude},${i.longitude},${i.name}`),
          name: i.name,
          type: i.type ?? i.category ?? null,
          lat: typeof i.latitude === "number" ? i.latitude : null,
          lng: typeof i.longitude === "number" ? i.longitude : null,
          score: typeof i.recommendation_score === "number" ? i.recommendation_score : null,
          isOpen: typeof i.is_open === "boolean" ? i.is_open : null,
          distance: typeof i.distance_km === "number" ? i.distance_km : null,
        }))
        .filter((p) => p.lat != null && p.lng != null),
    [items],
  );

  const showLoadingState = loading && !error;
  const showErrorState = error;
  const showEmptyState = !loading && !error && items.length === 0;
  const showCards = !loading && !error && items.length > 0;
  const emptyReason = getEmptyReason(filters);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Explore nearby
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? "Searching the neighborhood…"
              : items.length > 0
                ? `${items.length} place${items.length === 1 ? "" : "s"} found`
                : "Discover places worth your time"}
          </p>
        </div>
        <button
          onClick={() => refresh()}
          disabled={loading || isFetchingNextPage}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium transition-smooth hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading || isFetchingNextPage ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} validationError={undefined} />

      {/* Context selector — compact */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          When
        </span>
        {CONTEXTS.map((ctx) => (
          <button
            key={ctx}
            onClick={() => setContext(ctx)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-smooth ${
              context === ctx
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-accent"
            }`}
          >
            {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
          </button>
        ))}
      </div>

      {showLoadingState && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading recommendations...</span>
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
              We couldn't load recommendations right now. Please try again or check your backend.
            </p>
          </div>
          <button
            onClick={() => refresh()}
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

      {/* Cards + Map split layout */}
      {showCards && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          {/* Cards */}
          <div className="grid auto-rows-fr gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))] order-2 lg:order-1">
            {items.map((a, i) => (
              <div
                key={`${a.id ?? i}-${i}`}
                onClick={() => setSelected(a)}
                className="cursor-pointer"
              >
                <ActivityCard activity={a} />
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="lg:sticky lg:top-20 lg:self-start order-1 lg:order-2">
            <DiscoverMap
              points={mapPoints}
              center={centerCoords}
              centerLabel={centerLabel}
            />
          </div>
        </div>
      )}

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 border-t border-dashed py-6">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Loading more locations...
          </span>
        </div>
      )}

      {!hasNextPage && items.length > 0 && (
        <p className="border-t border-dashed py-6 text-center text-xs text-muted-foreground">
          You've seen all recommendations for this selection.
        </p>
      )}

      <ActivityDetailModal activity={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function getEmptyReason(filters: ActivityFilters): string {
  if (filters.open_now) return "All matching places are closed right now.";
  if (filters.radius_km != null)
    return `Nothing matched within your selected ${filters.radius_km} km radius.`;
  if (filters.category && filters.category !== "all")
    return `No ${filters.category.replace(/_/g, " ")} activities matched your filters.`;
  if (filters.min_rating != null) return "No activities matched your quality filters.";
  return "Try widening your search or clearing some filters.";
}
