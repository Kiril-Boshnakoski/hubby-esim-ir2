import { Activity, getRating, getRatingCount, getPhone, getCategory, getCoords, getOpenNow, getAddress } from "@/lib/api";
import { X, Star, Phone, MapPin, Clock, Globe, ExternalLink } from "lucide-react";
import { useEffect } from "react";

interface Props {
  activity: Activity | null;
  onClose: () => void;
}

export function ActivityDetailModal({ activity, onClose }: Props) {
  useEffect(() => {
    if (!activity) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [activity, onClose]);

  if (!activity) return null;

  const rating = getRating(activity);
  const count = getRatingCount(activity);
  const phone = getPhone(activity);
  const cat = getCategory(activity);
  const coords = getCoords(activity);
  const open = getOpenNow(activity);
  const address = getAddress(activity);
  const website = activity.website as string | undefined;
  const mapsUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 animate-in fade-in bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl animate-in fade-in zoom-in-95 overflow-hidden rounded-3xl border border-border bg-card shadow-hover">
        <div className="relative h-40 bg-gradient-hero">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-smooth hover:bg-background"
          >
            <X className="h-4 w-4" />
          </button>
          {cat && (
            <span className="absolute bottom-4 left-6 rounded-full bg-background/90 px-3 py-1 text-xs font-medium capitalize backdrop-blur">
              {cat.replace(/_/g, " ")}
            </span>
          )}
        </div>

        <div className="max-h-[calc(90vh-10rem)] space-y-5 overflow-y-auto p-6 sm:p-8">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                {activity.name}
              </h2>
              {rating != null && (
                <div className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  {count != null && (
                    <span className="text-sm text-muted-foreground">({count.toLocaleString()})</span>
                  )}
                </div>
              )}
            </div>
            {open != null && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-sm">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    open ? "animate-pulse bg-success" : "bg-muted-foreground"
                  }`}
                />
                <span className={open ? "font-medium text-success" : "text-muted-foreground"}>
                  {open ? "Open now" : "Currently closed"}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-5">
            {address && <Row icon={<MapPin />}>{address}</Row>}
            {coords && (
              <Row icon={<MapPin />}>
                <span className="font-mono text-sm">
                  {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                </span>
              </Row>
            )}
            {phone && (
              <Row icon={<Phone />}>
                <a href={`tel:${phone}`} className="hover:text-primary">{phone}</a>
              </Row>
            )}
            {website && (
              <Row icon={<Globe />}>
                <a href={website} target="_blank" rel="noreferrer" className="break-all hover:text-primary">
                  {website}
                </a>
              </Row>
            )}
            {open == null && activity.business_status && (
              <Row icon={<Clock />}>{String(activity.business_status)}</Row>
            )}
          </div>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-hero px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-smooth hover:shadow-hover"
            >
              Open in Maps <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-foreground">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </span>
      <div className="pt-1 text-sm">{children}</div>
    </div>
  );
}
