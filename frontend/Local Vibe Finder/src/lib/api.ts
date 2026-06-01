// Centralized API configuration
// Normalize base URL (remove trailing slash) and fall back to localhost
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

// Log resolved API base to help debug runtime environment (prints in browser console and Vite SSR logs)
console.log("API_BASE_URL resolved ->", API_BASE_URL);

// --- ИНТЕРФЕЈСИ ЗА ПРЕПОРАКИ (Според твојот FastAPI бекенд) ---
export interface RankedRecommendation {
  rank: number;
  name: string;
  type: string | null;
  distance_km: number;
  recommendation_score: number;
  context: string | null;
  category_relevance: number | null;
  is_open: boolean | null;
  latitude: number;
  longitude: number;
}

export interface RecommendationsResponse {
  response_timestamp: string;
  recommendations: RankedRecommendation[];
}

export interface RecommendationFilters {
  lat: number;
  lon: number;
  limit?: number;
  offset?: number;
  radius?: number;
  context?: string;
}

// Нов интерфејс за филтри кога бараме преку User ID
export interface UserRecommendationFilters {
  userId: number;
  limit?: number;
  offset?: number;
  radius?: number;
  context?: string;
}

// --- СТАРИ ИНТЕРФЕЈСИ ---
export interface Activity {
  id?: string | number;
  name: string;
  category?: string;
  type?: string;
  types?: string[];
  rating?: number;
  user_rating_count?: number;
  user_ratings_total?: number;
  reviews?: number;
  phone?: string;
  phone_number?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  address?: string;
  formatted_address?: string;
  vicinity?: string;
  location?: { lat: number; lng: number } | { latitude: number; longitude: number };
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  open_now?: boolean;
  opening_hours?: { open_now?: boolean };
  business_status?: string;
  website?: string;
  photo?: string;
  photo_url?: string;
  icon?: string;
  price_level?: number;
  distance_km?: number;
  [key: string]: unknown;
}

export interface ActivityFilters {
  limit?: number;
  category?: string;
  min_rating?: number;
  min_rating_count?: number;
  open_now?: boolean;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}

function buildQuery(filters: ActivityFilters): string {
  const params = new URLSearchParams();
  if (filters.limit != null) params.set("limit", String(filters.limit));
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  if (filters.min_rating != null && filters.min_rating > 0) params.set("min_rating", String(filters.min_rating));
  if (filters.min_rating_count != null && filters.min_rating_count > 0)
    params.set("min_rating_count", String(filters.min_rating_count));
  if (filters.open_now) params.set("open_now", "true");
  if (filters.latitude != null && filters.longitude != null) {
    params.set("latitude", String(filters.latitude));
    params.set("longitude", String(filters.longitude));
    if (filters.radius_km != null) {
      params.set("radius_km", String(filters.radius_km));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

// --- ФУНКЦИЈА 1: Повикување преку User ID (Тоа што се бара за задачата) ---
export async function fetchRecommendationsByUserId(filters: UserRecommendationFilters, signal?: AbortSignal): Promise<RecommendationsResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(filters.limit ?? 10));
  params.set("offset", String(filters.offset ?? 0));
  
  if (filters.radius != null) params.set("radius", String(filters.radius));
  if (filters.context && filters.context !== "all") params.set("context", filters.context);

  const url = `${API_BASE_URL}/recommendations/${filters.userId}?${params.toString()}`;
  console.log("fetchRecommendationsByUserId ->", url);

  const res = await fetch(url, { signal, headers: { Accept: "application/json" }, mode: "cors" });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Неуспешно вчитување препораки за корисник ${filters.userId}: ${res.status} ${errorText}`);
  }

  return res.json();
}

// --- ФУНКЦИЈА 2: Повикување на твојот FastAPI за препораки преку Координати (Пагинирано) ---
export async function fetchRecommendations(filters: RecommendationFilters, signal?: AbortSignal): Promise<RecommendationsResponse> {
  const params = new URLSearchParams();
  params.set("lat", String(filters.lat));
  params.set("lon", String(filters.lon));
  params.set("limit", String(filters.limit ?? 10));
  params.set("offset", String(filters.offset ?? 0));
  
  if (filters.radius != null) params.set("radius", String(filters.radius));
  if (filters.context && filters.context !== "all") params.set("context", filters.context);

  const url = `${API_BASE_URL}/recommendations?${params.toString()}`;
  console.log("fetchRecommendations ->", url);

  const res = await fetch(url, { signal, headers: { Accept: "application/json" }, mode: "cors" });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Неуспешно вчитување препораки: ${res.status} ${errorText}`);
  }

  return res.json();
}

// --- СТАРИ ФУНКЦИИ ---
export async function fetchActivities(filters: ActivityFilters = {}, signal?: AbortSignal): Promise<Activity[]> {
  const url = `${API_BASE_URL}/activities/${buildQuery(filters)}`;
  console.log("fetchActivities ->", url);

  const maxAttempts = 3;
  let attempt = 0;
  let lastErr: unknown = null;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const res = await fetch(url, { signal, headers: { Accept: "application/json" }, mode: "cors" });
      console.log(`fetchActivities attempt ${attempt}: response status ${res.status}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
        try {
          const payload = JSON.parse(errorText);
          errorMessage = (payload.detail as string) || payload.message || errorMessage;
        } catch {
          if (errorText) errorMessage = errorText;
        }
        console.error(`fetchActivities error (${res.status}):`, errorMessage, "Response:", errorText);
        throw new Error(errorMessage);
      }
      const data = await res.json();
      console.log("fetchActivities response data:", data);
      
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.activities)) return data.activities;
      if (Array.isArray(data?.results)) return data.results;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch (err) {
      lastErr = err;
      if ((err as { name?: string })?.name === "AbortError") throw err;
      if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Failed to fetch activities");
}

export async function fetchUsers(signal?: AbortSignal): Promise<unknown[]> {
  const url = `${API_BASE_URL}/users/`;
  console.log("fetchUsers ->", url);

  try {
    const res = await fetch(url, { signal, headers: { Accept: "application/json" }, mode: "cors" });
    if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.users)) return data.users;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (err) {
    console.error("fetchUsers error:", err);
    throw err;
  }
}

// Helpers to normalize messy API shapes
export function getRating(a: Activity): number | null {
  return typeof a.rating === "number" ? a.rating : null;
}
export function getRatingCount(a: Activity): number | null {
  return (a.user_rating_count ?? a.user_ratings_total ?? a.reviews ?? null) as number | null;
}
export function getPhone(a: Activity): string | null {
  return (a.phone ?? a.phone_number ?? a.formatted_phone_number ?? a.international_phone_number ?? null) as string | null;
}
export function getAddress(a: Activity): string | null {
  return (a.address ?? a.formatted_address ?? a.vicinity ?? null) as string | null;
}
export function getCategory(a: Activity): string | null {
  if (a.category) return a.category;
  if (a.type) return a.type;
  if (Array.isArray(a.types) && a.types.length) return a.types[0];
  return null;
}
export function getCoords(a: Activity): { lat: number; lng: number } | null {
  if (a.location && typeof a.location === "object") {
    const loc = a.location as Record<string, number>;
    if ("lat" in loc && "lng" in loc) return { lat: loc.lat, lng: loc.lng };
    if ("latitude" in loc && "longitude" in loc) return { lat: loc.latitude, lng: loc.longitude };
  }
  if (typeof a.latitude === "number" && typeof a.longitude === "number")
    return { lat: a.latitude, lng: a.longitude };
  if (typeof a.lat === "number" && typeof a.lng === "number") return { lat: a.lat, lng: a.lng };
  return null;
}
export function getOpenNow(a: Activity): boolean | null {
  if (typeof a.open_now === "boolean") return a.open_now;
  if (typeof a.opening_hours?.open_now === "boolean") return a.opening_hours.open_now;
  return null;
}