import Link from "next/link";
import { NavLink } from "@/components/ui";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🍺</span>
          <span className="text-lg font-bold tracking-tight">
            Pure<span className="text-accent">Hop</span>
          </span>
          <span className="hidden text-xs text-muted sm:inline">
            Bang-for-Buck Alcohol Index
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/">Leaderboard</NavLink>
          <NavLink href="/submit">Submit Price</NavLink>
          <Link
            href="/submit"
            className="ml-2 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground transition hover:brightness-95"
          >
            + Add
          </Link>
        </nav>
      </div>
    </header>
  );
}
