import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { exchangeRates } from "@/db/schema";

const FX_API_BASE = process.env.FX_API_BASE ?? "https://api.frankfurter.dev/v1";

interface FrankfurterResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface RateDelta {
  currencyCode: string;
  previous: number | null;
  next: number;
}

/**
 * Fetch latest FX rates (base USD) and upsert them into exchange_rates.
 * Frankfurter returns "1 USD = X local", so rate_to_usd = 1 / X.
 */
export async function syncExchangeRates(): Promise<{
  updated: number;
  date: string;
  deltas: RateDelta[];
}> {
  const existing = await db
    .select({
      currencyCode: exchangeRates.currencyCode,
      rateToUsd: exchangeRates.rateToUsd,
    })
    .from(exchangeRates);

  const previousByCode = new Map(
    existing.map((row) => [row.currencyCode, parseFloat(row.rateToUsd)]),
  );

  const symbols = existing
    .map((c) => c.currencyCode)
    .filter((c) => c !== "USD")
    .join(",");

  const url = `${FX_API_BASE}/latest?base=USD${symbols ? `&symbols=${symbols}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`FX provider responded ${res.status}`);
  }

  const data = (await res.json()) as FrankfurterResponse;

  const rows: { currencyCode: string; rateToUsd: string }[] = [
    { currencyCode: "USD", rateToUsd: "1.000000" },
  ];
  for (const [currency, perUsd] of Object.entries(data.rates)) {
    if (perUsd > 0) {
      rows.push({ currencyCode: currency, rateToUsd: (1 / perUsd).toFixed(6) });
    }
  }

  const deltas: RateDelta[] = [];
  for (const row of rows) {
    const next = parseFloat(row.rateToUsd);
    const previous = previousByCode.has(row.currencyCode)
      ? previousByCode.get(row.currencyCode)!
      : null;
    if (previous !== next) {
      deltas.push({ currencyCode: row.currencyCode, previous, next });
    }
  }

  for (const row of rows) {
    await db
      .insert(exchangeRates)
      .values({ ...row, lastUpdated: new Date() })
      .onConflictDoUpdate({
        target: exchangeRates.currencyCode,
        set: { rateToUsd: row.rateToUsd, lastUpdated: sql`NOW()` },
      });
  }

  console.log(
    `[fx] deltas ${deltas.length}:`,
    deltas.length
      ? deltas.map((d) => `${d.currencyCode} ${d.previous}→${d.next}`).join(" ")
      : "none",
  );

  return { updated: rows.length, date: data.date, deltas };
}
