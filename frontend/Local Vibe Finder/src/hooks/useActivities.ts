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
  context: string = "auto"
) {
  return useInfiniteQuery({
    queryKey: [
      "recommendations-by-user-v3",
      userId,
      category,
      radius,
      context,
    ],

    queryFn: ({ pageParam = 0, signal }) => {
      return fetchRecommendationsByUserId(
        {
          userId,
          limit: 10,
          offset: pageParam,
          radius,

          // auto = don't send context
          ...(context !== "auto" ? { context } : {}),
        },
        signal
      );
    },

    initialPageParam: 0,

    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.recommendations || lastPage.recommendations.length < 10) {
        return undefined;
      }
    
      return allPages.length * 10;
    },

    staleTime: 0,
    gcTime: 0,
  });
}
// --- СТАРИОТ ХУК: Infinite Scroll преку КООРДИНАТИ ---
export function useInfiniteRecommendations(lat: number, lon: number, category: string) {
  return useInfiniteQuery({
    queryKey: ["recommendations", lat, lon, category],
    queryFn: ({ pageParam = 0, signal }) => {
      return fetchRecommendations(
        {
          lat,
          lon,
          limit: 3, // <--- И овде ставено 3 за конзистентност при тест со координати
          offset: pageParam,
          context: category,
        },
        signal
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.recommendations || lastPage.recommendations.length < 3) {
        return undefined;
      }
      return allPages.length * 3;
    },
  });
}