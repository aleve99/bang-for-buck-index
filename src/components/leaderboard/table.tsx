"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Input, Select } from "@/components/ui";
import { clpaUnitLabel, formatCurrency, formatPack, resolveClpa, venueLabel } from "@/lib/format";
import { useCurrencyToggle } from "@/hooks/use-currency-toggle";
import type { LeaderboardRow } from "@/types";

export function LeaderboardTable({
  rows,
  styles,
}: {
  rows: LeaderboardRow[];
  styles: string[];
}) {
  const { unit, ppp } = useCurrencyToggle();
  const [venue, setVenue] = useState<string>("all");
  const [style, setStyle] = useState<string>("all");

  const abvCeiling = useMemo(() => {
    let max = 12;
    for (const r of rows) if (r.abv > max) max = r.abv;
    return max;
  }, [rows]);

  const [abvMin, setAbvMin] = useState(0);
  const [abvMax, setAbvMax] = useState(abvCeiling);

  const filtered = useMemo(() => {
    const list = rows.filter((r) => {
      if (venue !== "all" && r.venueType !== venue) return false;
      if (style !== "all" && r.style !== style) return false;
      if (r.abv < abvMin || r.abv > abvMax) return false;
      return true;
    });
    if (unit === "LOCAL") return list;
    return [...list].sort((a, b) => {
      return resolveClpa(a, unit, ppp).value - resolveClpa(b, unit, ppp).value;
    });
  }, [rows, venue, style, unit, ppp, abvMin, abvMax]);

  const unitLabel = clpaUnitLabel(unit, ppp);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-44">
          <label className="mb-1 block text-xs font-medium text-muted">Venue</label>
          <Select value={venue} onChange={(e) => setVenue(e.target.value)} aria-label="Venue">
            <option value="all">All venues</option>
            <option value="supermarket">Supermarket</option>
            <option value="convenience_store">Convenience</option>
            <option value="bar_pub">Bar / Pub</option>
            <option value="restaurant">Restaurant</option>
          </Select>
        </div>
        <div className="w-44">
          <label className="mb-1 block text-xs font-medium text-muted">Style</label>
          <Select value={style} onChange={(e) => setStyle(e.target.value)} aria-label="Style">
            <option value="all">All styles</option>
            {styles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex w-56 items-end gap-2">
          <div className="flex-1">
            <label htmlFor="abv-min" className="mb-1 block text-xs font-medium text-muted">
              ABV min
            </label>
            <Input
              id="abv-min"
              data-testid="abv-min"
              type="number"
              min={0}
              max={abvCeiling}
              step={0.1}
              value={abvMin}
              aria-label="ABV min"
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isNaN(v)) return;
                setAbvMin(Math.min(Math.max(0, v), abvMax));
              }}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="abv-max" className="mb-1 block text-xs font-medium text-muted">
              ABV max
            </label>
            <Input
              id="abv-max"
              data-testid="abv-max"
              type="number"
              min={0}
              max={abvCeiling}
              step={0.1}
              value={abvMax}
              aria-label="ABV max"
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isNaN(v)) return;
                setAbvMax(Math.max(Math.min(v, abvCeiling), abvMin));
              }}
            />
          </div>
        </div>
        <div className="ml-auto self-center text-sm text-muted">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm" data-testid="leaderboard-table">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">Beer</th>
              <th className="px-3 py-3">Country</th>
              <th className="px-3 py-3">ABV</th>
              <th className="px-3 py-3">Package</th>
              <th className="px-3 py-3">Venue</th>
              <th className="px-3 py-3">Price</th>
              <th className="px-3 py-3 text-right">
                CLPA <span className="text-muted">({unitLabel})</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const clpa = resolveClpa(r, unit, ppp);
              return (
                <tr
                  key={r.entryId}
                  className="border-b border-border last:border-0 hover:bg-surface-2"
                  data-testid="leaderboard-row"
                >
                  <td className="px-3 py-3 font-mono text-muted">{i + 1}</td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-foreground">{r.beerName}</div>
                    <div className="text-xs text-muted">{r.brewery ?? "—"}</div>
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/country/${r.countryCode}`}
                      className="font-medium hover:text-accent"
                    >
                      {r.countryName}
                    </Link>
                    {r.city ? <span className="text-muted"> · {r.city}</span> : null}
                  </td>
                  <td className="px-3 py-3">{r.abv.toFixed(1)}%</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {formatPack(r.packSize, r.volumeMl)}
                  </td>
                  <td className="px-3 py-3">
                    <Badge>{venueLabel(r.venueType)}</Badge>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {formatCurrency(r.priceLocal, r.currencyCode)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-semibold text-accent">
                    {formatCurrency(clpa.value, clpa.currency)}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-muted">
                  No entries match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {unit === "LOCAL" && (
        <p className="mt-2 text-xs text-muted">
          Local-currency values are shown as submitted and are not ranked across currencies.
          Switch to USD or EUR for a global ranking.
        </p>
      )}
    </div>
  );
}
