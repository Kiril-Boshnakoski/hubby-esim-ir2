import { Link, useLocation } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const loc = useLocation();
  const link = (to: string, label: string) => {
    const active = loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-smooth hover:text-foreground ${
          active ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-card">
            <Compass className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Roam</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {link("/", "Discover")}
          {link("/activities", "Activities")}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
