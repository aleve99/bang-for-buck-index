"use client";

import { useMemo, useState } from "react";
import { Badge, Select } from "@/components/ui";
import { formatCurrency, formatPack, venueLabel } from "@/lib/format";
import type { LeaderboardRow } from "@/types";

type Unit = "USD" | "LOCAL" | "PPP";

const UNIT_LABELS: Record<Unit, string> = {
  USD: "USD",
  LOCAL: "Local currency",
  PPP: "PPP-adjusted USD",
};

export function LeaderboardTable({
  rows,
  styles,
}: {
  rows: LeaderboardRow[];
  styles: string[];
}) {
  const [unit, setUnit] = useState<Unit>("USD");
  const [venue, setVenue] = useState<string>("all");
  const [style, setStyle] = useState<string>("all");

  const filtered = useMemo(() => {
    const list = rows.filter((r) => {
      if (venue !== "all" && r.venueType !== venue) return false;
      if (style !== "all" && r.style !== style) return false;
      return true;
    });
    const value = (r: LeaderboardRow) =>
      unit === "LOCAL" ? r.clpaLocal : unit === "PPP" ? r.clpaPpp : r.clpaUsd;
    return [...list].sort((a, b) => {
      if (unit === "LOCAL") return 0; // local values are not comparable across currencies
      return value(a) - value(b);
    });
  }, [rows, venue, style, unit]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-44">
          <label className="mb-1 block text-xs font-medium text-muted">Currency unit</label>
          <Select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            aria-label="Currency unit"
          >
            {(Object.keys(UNIT_LABELS) as Unit[]).map((u) => (
              <option key={u} value={u}>
                {UNIT_LABELS[u]}
              </option>
            ))}
          </Select>
        </div>
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
                CLPA <span className="text-muted">({UNIT_LABELS[unit]})</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const clpa =
                unit === "LOCAL"
                  ? formatCurrency(r.clpaLocal, r.currencyCode)
                  : unit === "PPP"
                    ? formatCurrency(r.clpaPpp, "USD")
                    : formatCurrency(r.clpaUsd, "USD");
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
                    <span className="font-medium">{r.countryName}</span>
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
                    {clpa}
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
          Switch to USD or PPP for a global ranking.
        </p>
      )}
    </div>
  );
}
