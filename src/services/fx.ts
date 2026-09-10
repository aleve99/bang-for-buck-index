import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { exchangeRates } from "@/db/schema";

const FX_API_BASE = process.env.FX_API_BASE ?? "https://api.frankfurter.dev/v1";

interface FrankfurterResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

/**
 * Fetch latest FX rates (base USD) and upsert them into exchange_rates.
 * Frankfurter returns "1 USD = X local", so rate_to_usd = 1 / X.
 */
export async function syncExchangeRates(): Promise<{ updated: number; date: string }> {
  const currencies = await db
    .select({ code: exchangeRates.currencyCode })
    .from(exchangeRates);

  const symbols = currencies
    .map((c) => c.code)
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

  for (const row of rows) {
    await db
      .insert(exchangeRates)
      .values({ ...row, lastUpdated: new Date() })
      .onConflictDoUpdate({
        target: exchangeRates.currencyCode,
        set: { rateToUsd: row.rateToUsd, lastUpdated: sql`NOW()` },
      });
  }

  return { updated: rows.length, date: data.date };
}
