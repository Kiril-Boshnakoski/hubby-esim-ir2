import { Phone, MapPin, Star, Clock } from "lucide-react";
import {
  Activity,
  getRating,
  getRatingCount,
  getPhone,
  getCategory,
  getCoords,
  getOpenNow,
  getAddress,
} from "@/lib/api";

interface Props {
  activity: Activity;
  onClick?: () => void;
}

const categoryColors: Record<string, string> = {
  restaurant: "from-rose-500/20 to-orange-400/20 text-rose-700 dark:text-rose-300",
  cafe: "from-amber-500/20 to-yellow-400/20 text-amber-700 dark:text-amber-300",
  bar: "from-purple-500/20 to-fuchsia-400/20 text-purple-700 dark:text-purple-300",
  museum: "from-blue-500/20 to-indigo-400/20 text-blue-700 dark:text-blue-300",
  park: "from-emerald-500/20 to-green-400/20 text-emerald-700 dark:text-emerald-300",
  hotel: "from-cyan-500/20 to-sky-400/20 text-cyan-700 dark:text-cyan-300",
};

export function ActivityCard({ activity, onClick }: Props) {
  const rating = getRating(activity);
  const count = getRatingCount(activity);
  const phone = getPhone(activity);
  const cat = getCategory(activity);
  const coords = getCoords(activity);
  const open = getOpenNow(activity);
  const address = getAddress(activity);

  const catKey = cat?.toLowerCase() ?? "";
  const catStyle = categoryColors[catKey] ?? "from-muted to-muted text-muted-foreground";
  const distanceLabel =
    typeof activity.distance_km === "number"
      ? `${activity.distance_km.toFixed(1)} km away`
      : null;

  return (
    <button
      onClick={onClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-card transition-smooth hover:-translate-y-1 hover:shadow-hover focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${catStyle}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <div className="absolute right-3 top-3 flex gap-1.5">
          {open === true && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/95 px-2.5 py-1 text-xs font-medium text-success-foreground shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-foreground" />
              Open now
            </span>
          )}
          {open === false && (
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground/80 px-2.5 py-1 text-xs font-medium text-background">
              <Clock className="h-3 w-3" /> Closed
            </span>
          )}
        </div>
        {cat && (
          <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium capitalize text-foreground backdrop-blur">
            {cat.replace(/_/g, " ")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-foreground">
              {activity.name ?? "Untitled"}
            </h3>
            {distanceLabel && (
              <p className="mt-1 text-xs text-muted-foreground">{distanceLabel}</p>
            )}
          </div>
          {rating != null && (
            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-accent px-2 py-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-sm font-semibold text-accent-foreground">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {count != null && (
          <p className="text-xs text-muted-foreground">
            {count.toLocaleString()} review{count === 1 ? "" : "s"}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-1.5 pt-3 text-xs text-muted-foreground">
          {address && (
            <div className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{address}</span>
            </div>
          )}
          {!address && coords && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono text-[11px]">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{phone}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
