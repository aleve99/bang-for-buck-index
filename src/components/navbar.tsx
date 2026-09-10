"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CommandMenu } from "@/components/command-menu";
import { PriceSubmissionDialog } from "@/components/forms/price-submission-dialog";
import { Button, NavLink, Select, Switch } from "@/components/ui";
import { useCurrencyToggle, type CurrencyUnit } from "@/hooks/use-currency-toggle";
import type { SearchCatalog } from "@/types";

type CountryOption = { code: string; name: string; currencyCode: string };

export function Navbar({
  catalog,
  countries,
}: {
  catalog: SearchCatalog;
  countries: CountryOption[];
}) {
  const { unit, setUnit, ppp, setPpp } = useCurrencyToggle();
  const [searchOpen, setSearchOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🍺</span>
            <span className="text-lg font-bold tracking-tight">
              Pure<span className="text-accent">Hop</span>
            </span>
            <span className="hidden text-xs text-muted sm:inline">
              Bang-for-Buck Alcohol Index
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 px-3"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              Search
              <kbd className="ml-2 hidden rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted sm:inline">
                ⌘K
              </kbd>
            </Button>
            <Select
              aria-label="Currency unit"
              data-testid="currency-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as CurrencyUnit)}
              className="h-9 w-[9.5rem]"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="LOCAL">Local currency</option>
            </Select>
            <div className="flex items-center gap-2 px-1 text-sm text-muted">
              <span>PPP</span>
              <Switch
                checked={ppp}
                onCheckedChange={setPpp}
                aria-label="PPP mode"
                data-testid="ppp-switch"
              />
            </div>
            <nav className="flex items-center gap-1">
              <NavLink href="/">Leaderboard</NavLink>
              <NavLink href="/submit">Submit Price</NavLink>
              <Button
                type="button"
                className="ml-1 h-9 px-3"
                onClick={() => setSubmitOpen(true)}
              >
                + Add
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} catalog={catalog} />
      <PriceSubmissionDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        countries={countries}
      />
    </>
  );
}
