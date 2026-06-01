import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { RecommendationsMap } from "@/components/RecommendationsMap";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Map — Roam" },
      {
        name: "description",
        content:
          "Explore recommended activities on an interactive map. See nearby restaurants, cafes, bars, museums, parks and hotels.",
      },
      { property: "og:title", content: "Map — Roam" },
      {
        property: "og:description",
        content: "Explore recommended activities on an interactive map.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <RecommendationsMap />
    </div>
  );
}
