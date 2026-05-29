import { useCallback, useEffect, useState } from "react";
import { Activity, ActivityFilters, fetchActivities } from "@/lib/api";

export function useActivities(filters: ActivityFilters) {
  const [data, setData] = useState<Activity[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    console.log("useActivities: fetching with filters:", filters);
    fetchActivities(filters, ctrl.signal)
      .then((d) => {
        console.log("useActivities: successfully fetched", d.length, "activities");
        setData(d);
      })
      .catch((e: unknown) => {
        if ((e as { name?: string })?.name === "AbortError") return;
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error("useActivities error:", errorMessage, "Details:", e);
        setError(errorMessage);
        setData(null);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.category,
    filters.limit,
    filters.min_rating,
    filters.min_rating_count,
    filters.open_now,
    filters.latitude,
    filters.longitude,
    filters.radius_km,
    reloadKey,
  ]);

  return { data, loading, error, refresh };
}
