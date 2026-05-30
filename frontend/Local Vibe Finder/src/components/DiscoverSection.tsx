import { useState, useEffect } from "react";
// Го увезуваме новиот хук за User ID пагинација
import { useInfiniteRecommendationsByUserId } from "@/hooks/useActivities";
import { ActivityCard } from "./ActivityCard";
import { ActivityDetailModal } from "./ActivityDetailModal";
import { FilterBar } from "./FilterBar";
import { AlertCircle, Loader2, MapPinOff, RefreshCw } from "lucide-react";

interface ActivityFilters {
  limit?: number;
  category?: string;
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

export function DiscoverSection({ initialFilters = { limit: 10, category: "all" } }: Props) {
  // Локална состојба за филтрите кои ги контролира FilterBar
  const [filters, setFilters] = useState<ActivityFilters>(initialFilters);
  const [selected, setSelected] = useState<any | null>(null);

  // Статично ID за корисникот (кое одговара на Swagger тестот со id=5)
  // Понатаму, ова можеш да го земеш динамички од AuthContext/Локал Сториџ
  const userId = 8;

  // СЕГА КОРИСТИМЕ ПАГИНАЦИЈА ПРЕКУ USER ID (Барањето од задачата)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loading,
    isError: error,
    refetch: refresh,
  } = useInfiniteRecommendationsByUserId(userId, filters.category ?? "all", filters.radius_km);

  // Скрол набљудувач кој автоматски вчитува следна страница кога корисникот е при дното
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 1. Спојување на сите страници од React Query во една рамна низа
  const rawItems = data
    ? data.pages.flatMap((page) => page.recommendations || page.activities || [])
    : [];

  // 2. Трансформација на податоците БЕЗ СУРОВО ЛОКАЛНО ФИЛТРИРАЊЕ
  const items = rawItems.map((item: any) => ({
    ...item,
    rating: item.rating ?? item.user_rating ?? 4.5,
    user_rating_count: item.user_rating_count ?? item.reviews ?? 120,
    formatted_address: item.distance_km
      ? `${item.distance_km.toFixed(1)} km away`
      : (item.formatted_address ?? item.address ?? "Nearby"),
    phone_number: item.phone_number ?? item.phone ?? "+389 70 399 957",
    category: item.category ?? item.type ?? filters.category,
  }));

  // Состојби за приказ на интерфејсот
  const showLoadingState = loading && !error;
  const showErrorState = error;
  const showEmptyState = !loading && !error && items.length === 0;
  const showCards = !loading && !error && items.length > 0;
  const emptyReason = getEmptyReason(filters);

  return (
    <section className="space-y-6">
      {/* Горна секција со динамичен број на пронајдени места */}
      <div className="flex items-end justify-between gap-4">
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

      {/* Лентата со филтри (Restaurants, Cafes, Bars...) */}
      <FilterBar filters={filters} onChange={setFilters} validationError={undefined} />

      {/* Лоадер состојба при иницијално вчитавање */}
      {showLoadingState && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading recommendations...</span>
        </div>
      )}

      {/* Состојба на грешка */}
      {showErrorState && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold">Couldn't load recommendations</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              We couldn’t load recommendations right now. Please try again or check your backend.
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

      {/* Состојба кога нема пронајдени локации за филтерот */}
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

      {/* Приказ на картичките */}
      {showCards && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((a, i) => (
            <div
              key={`${a.id}-${i}`}
              onClick={() => setSelected(a)}
              className="cursor-pointer group h-full"
            >
              <ActivityCard activity={a} />
            </div>
          ))}
        </div>
      )}

      {/* Лоадер на дното при скролање */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-6 border-t border-dashed mt-4">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Loading more locations...
          </span>
        </div>
      )}

      {/* Порака за крај на листата */}
      {!hasNextPage && items.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-6 border-t border-dashed mt-4">
          | You've seen all recommendations for this selection.
        </p>
      )}

      {/* Модален приказ за детали */}
      <ActivityDetailModal activity={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

// Помошна функција за динамични пораки при празна состојба
function getEmptyReason(filters: ActivityFilters): string {
  if (filters.open_now) {
    return "All matching places are closed right now.";
  }
  if (filters.radius_km != null) {
    return `Nothing matched within your selected ${filters.radius_km} km radius.`;
  }
  if (filters.category && filters.category !== "all") {
    return `No ${filters.category.replace(/_/g, " ")} activities matched your filters.`;
  }
  if (filters.min_rating != null) {
    return "No activities matched your quality filters.";
  }
  return "Try widening your search or clearing some filters.";
}
