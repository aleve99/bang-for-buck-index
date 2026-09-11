import { rejectPrice, verifyPrice } from "@/actions/admin";
import { Badge, Button } from "@/components/ui";
import { formatCurrency, formatPack, venueLabel } from "@/lib/format";
import type { PendingPriceRow } from "@/types";

export function PendingTable({ rows }: { rows: PendingPriceRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted">
        No pending submissions.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm" data-testid="pending-table">
        <thead>
          <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-3 py-3">Beer</th>
            <th className="px-3 py-3">Receipt</th>
            <th className="px-3 py-3">Where</th>
            <th className="px-3 py-3">Package</th>
            <th className="px-3 py-3">Price</th>
            <th className="px-3 py-3 text-right">CLPA</th>
            <th className="px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.entryId}
              className="border-b border-border last:border-0"
              data-testid="pending-row"
            >
              <td className="px-3 py-3">
                <div className="font-semibold">{r.beerName}</div>
                <div className="text-xs text-muted">
                  {r.brewery ?? "—"} · {r.style} · {r.abv.toFixed(1)}%
                </div>
              </td>
              <td className="px-3 py-3">
                {r.receiptDisplayUrl ? (
                  <a
                    href={r.receiptDisplayUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-16"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.receiptDisplayUrl}
                      alt={`Receipt for ${r.beerName}`}
                      className="h-16 w-16 rounded-md border border-border bg-white object-contain"
                      data-testid="receipt-thumb"
                    />
                  </a>
                ) : (
                  <span className="text-xs text-muted">—</span>
                )}
              </td>
              <td className="px-3 py-3">
                <div>
                  {r.countryName}
                  {r.city ? ` · ${r.city}` : ""}
                </div>
                <Badge>{venueLabel(r.venueType)}</Badge>
              </td>
              <td className="px-3 py-3 whitespace-nowrap">{formatPack(r.packSize, r.volumeMl)}</td>
              <td className="px-3 py-3 whitespace-nowrap">
                {formatCurrency(r.priceLocal, r.currencyCode)}
              </td>
              <td className="px-3 py-3 text-right font-mono font-semibold text-accent">
                {formatCurrency(r.clpaUsd, "USD")}
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-end gap-2">
                  <form action={verifyPrice}>
                    <input type="hidden" name="id" value={r.entryId} />
                    <Button type="submit" className="h-8 px-3 text-xs">
                      Verify
                    </Button>
                  </form>
                  <form action={rejectPrice}>
                    <input type="hidden" name="id" value={r.entryId} />
                    <Button type="submit" variant="outline" className="h-8 px-3 text-xs">
                      Reject
                    </Button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
