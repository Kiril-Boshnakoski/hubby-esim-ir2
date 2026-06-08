import { Link } from "@tanstack/react-router";
import { UtensilsCrossed, Coffee, Wine, Landmark, Trees, Hotel } from "lucide-react";

const CATS = [
  { value: "restaurant", label: "Restaurants", icon: UtensilsCrossed, tint: "from-orange-500/20 to-rose-500/10" },
  { value: "cafe", label: "Cafés", icon: Coffee, tint: "from-amber-500/20 to-yellow-500/10" },
  { value: "bar", label: "Bars", icon: Wine, tint: "from-fuchsia-500/20 to-purple-500/10" },
  { value: "museum", label: "Museums", icon: Landmark, tint: "from-sky-500/20 to-indigo-500/10" },
  { value: "park", label: "Parks", icon: Trees, tint: "from-emerald-500/20 to-teal-500/10" },
  { value: "hotel", label: "Hotels", icon: Hotel, tint: "from-blue-500/20 to-cyan-500/10" },
];

export function CategoryCards() {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Browse by category
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Pick a vibe — we'll find the best of it.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATS.map(({ value, label, icon: Icon, tint }) => (
          <Link
            key={value}
            to="/"
            search={{ category: value }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-smooth hover:-translate-y-0.5 hover:shadow-hover"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tint} opacity-60 transition-opacity group-hover:opacity-100`} />
            <div className="relative flex flex-col items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 text-foreground backdrop-blur">
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="text-sm font-semibold">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
