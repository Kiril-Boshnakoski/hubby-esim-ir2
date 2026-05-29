import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { DiscoverSection } from "@/components/DiscoverSection";
import { CategoryCards } from "@/components/CategoryCards";
import { TopRatedSection } from "@/components/TopRatedSection";
import { ArrowRight, Clock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roam — Discover local activities nearby" },
      { name: "description", content: "Find restaurants, cafes, bars, museums, parks and hotels near you. Curated, real, open now." },
      { property: "og:title", content: "Roam — Discover local activities nearby" },
      { property: "og:description", content: "Find restaurants, cafes, bars, museums, parks and hotels near you." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <main className="mx-auto max-w-7xl space-y-20 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <CategoryCards />
        <TopRatedSection />
        <div id="discover" className="space-y-2">
          <DiscoverSection initialFilters={{ limit: 12, category: "all" }} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(1_0_0_/_0.2),_transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Real places. Real ratings. Right now.
          </div>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Find the <em className="font-display italic">good</em> places
            <br />
            around you.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/85">
            From corner cafés to overlooked museums — Roam surfaces the spots locals actually visit,
            filtered by what matters to you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/activities"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-card transition-smooth hover:shadow-hover"
            >
              Start exploring <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/activities"
              search={{ open_now: true }}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-smooth hover:bg-white/20"
            >
              <Clock className="h-4 w-4" /> Open now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Roam — Discover local activities</p>
        <p>Made for explorers.</p>
      </div>
    </footer>
  );
}
