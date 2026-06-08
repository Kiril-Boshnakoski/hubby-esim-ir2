import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchActivities, fetchRecommendations, fetchRecommendationsByUserId } from "../lib/api";

// --- СТАРИОТ ХУК ШТО ГО БАРА TopRatedSection ---
export function useActivities(filters: any = {}) {
  return useQuery({
    queryKey: ["activities", filters],
    queryFn: ({ signal }) => fetchActivities(filters, signal),
  });
}

// --- НОВ ХУК 1: Infinite Scroll преку USER ID (Тоа што се бара во задачата) ---
export function useInfiniteRecommendationsByUserId(
  userId: number,
  category: string,
  radius?: number,
  context: string = "auto",
  openNow?: boolean,
  enabled: boolean = true,
) {
  const pageSize = 10;

  return useInfiniteQuery({
    queryKey: ["recommendations-by-user-v3", userId, category, radius, context, openNow],

    queryFn: ({ pageParam = 0, signal }) => {
      return fetchRecommendationsByUserId(
        {
          userId,
          limit: pageSize,
          offset: pageParam,
          radius,
          category,
          ...(openNow !== undefined ? { open_now: openNow } : {}),

          // auto = don't send context
          ...(context !== "auto" ? { context } : {}),
        },
        signal,
      );
    },

    initialPageParam: 0,

    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.recommendations || lastPage.recommendations.length < pageSize) {
        return undefined;
      }

      return allPages.length * pageSize;
    },

    enabled,
    staleTime: 0,
    gcTime: 0,
  });
}
// --- СТАРИОТ ХУК: Infinite Scroll преку КООРДИНАТИ ---
export function useInfiniteRecommendations(
  lat: number,
  lon: number,
  category: string,
  radius?: number,
  context: string = "auto",
  openNow?: boolean,
  enabled: boolean = true,
) {
  const pageSize = 10;

  return useInfiniteQuery({
    queryKey: ["recommendations", lat, lon, category, radius, context, openNow],
    queryFn: ({ pageParam = 0, signal }) => {
      return fetchRecommendations(
        {
          lat,
          lon,
          limit: pageSize,
          offset: pageParam,
          radius,
          category,
          ...(openNow !== undefined ? { open_now: openNow } : {}),
          ...(context !== "auto" ? { context } : {}),
        },
        signal,
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.recommendations || lastPage.recommendations.length < pageSize) {
        return undefined;
      }
      return allPages.length * pageSize;
    },
    enabled,
  });
}
