import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { DiscoverSection } from "@/components/DiscoverSection";

interface ActivitiesSearch {
  category?: string;
  open_now?: boolean;
}

export const Route = createFileRoute("/activities")({
  validateSearch: (s: Record<string, unknown>): ActivitiesSearch => ({
    category: typeof s.category === "string" ? s.category : undefined,
    open_now: s.open_now === true || s.open_now === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Activities — Roam" },
      { name: "description", content: "Browse and filter every local activity available nearby." },
      { property: "og:title", content: "Activities — Roam" },
      { property: "og:description", content: "Browse and filter every local activity available nearby." },
    ],
  }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  const search = Route.useSearch();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">All places</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Every spot, your way.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Filter by category, rating, popularity, and availability to find exactly what you're in
            the mood for.
          </p>
        </div>
        <DiscoverSection
          key={`${search.category ?? "all"}-${search.open_now ? "open" : "any"}`}
          initialFilters={{
            limit: 24,
            category: search.category ?? "all",
            open_now: search.open_now,
          }}
        />
      </main>
    </div>
  );
}
