import { useActivities } from "@/hooks/useActivities";
import { ActivityCard } from "./ActivityCard";
import { ActivityCardSkeleton } from "./ActivityCardSkeleton";
import { ActivityDetailModal } from "./ActivityDetailModal";
import { Activity } from "@/lib/api";
import { Trophy } from "lucide-react";
import { useState } from "react";

export function TopRatedSection() {
  const { data, isLoading, error } = useActivities({ limit: 8, min_rating: 4.5, min_rating_count: 50 });
  const [selected, setSelected] = useState<Activity | null>(null);

  if (error) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-amber-500" /> Top rated
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Loved by locals
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The highest-rated places near you, hand-picked from real reviews.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <ActivityCardSkeleton key={i} />)
          : (data ?? []).slice(0, 8).map((a, i) => (
              <ActivityCard
                key={(a.id as string) ?? `${a.name}-${i}`}
                activity={a}
                onClick={() => setSelected(a)}
              />
            ))}
      </div>

      <ActivityDetailModal activity={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
