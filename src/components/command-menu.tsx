"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui";
import type { SearchCatalog } from "@/types";

export function CommandMenu({
  open,
  onOpenChange,
  catalog,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: SearchCatalog;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const q = query.trim().toLowerCase();
  const beers = useMemo(
    () => catalog.beers.filter((b) => b.name.toLowerCase().includes(q)),
    [catalog.beers, q],
  );
  const countries = useMemo(
    () => catalog.countries.filter((c) => c.name.toLowerCase().includes(q)),
    [catalog.countries, q],
  );
  const styles = useMemo(
    () => catalog.styles.filter((s) => s.toLowerCase().includes(q)),
    [catalog.styles, q],
  );

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  if (!open) return null;

  const empty = beers.length === 0 && countries.length === 0 && styles.length === 0;

  return (
    <div className="fixed inset-0 z-50" data-testid="command-menu">
      <div
        className="absolute inset-0 bg-black/70"
        aria-hidden
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative mx-auto mt-[12vh] w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
      >
        <div className="border-b border-border p-3">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search beers, countries, styles…"
            aria-label="Search catalog"
            autoComplete="off"
          />
        </div>
        <div className="max-h-[min(70vh,560px)] overflow-y-auto p-2">
          {beers.length > 0 && (
            <CommandGroup label="Beers">
              {beers.map((b) => (
                <CommandItem
                  key={b.id}
                  onSelect={() => go(b.countryCode ? `/country/${b.countryCode}` : "/")}
                >
                  <span className="font-medium">{b.name}</span>
                  {b.brewery ? <span className="text-muted"> · {b.brewery}</span> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {countries.length > 0 && (
            <CommandGroup label="Countries">
              {countries.map((c) => (
                <CommandItem key={c.code} onSelect={() => go(`/country/${c.code}`)}>
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted"> · {c.code}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {styles.length > 0 && (
            <CommandGroup label="Styles">
              {styles.map((s) => (
                <CommandItem
                  key={s}
                  onSelect={() => go(`/styles/${encodeURIComponent(s)}`)}
                >
                  <span className="font-medium">{s}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {empty && (
            <p className="px-3 py-6 text-center text-sm text-muted">No matches.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CommandGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-2">
      <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function CommandItem({
  onSelect,
  children,
}: {
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="rounded-lg px-2 py-2 text-left text-sm text-foreground transition hover:bg-surface-2"
    >
      {children}
    </button>
  );
}
