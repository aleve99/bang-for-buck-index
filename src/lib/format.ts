import type { CurrencyUnit, LeaderboardRow } from "@/types";

const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US",
  EUR: "de-DE",
  CZK: "cs-CZ",
  GBP: "en-GB",
  JPY: "ja-JP",
};

export function resolveClpa(
  row: Pick<LeaderboardRow, "clpaLocal" | "clpaUsd" | "clpaEur" | "clpaPpp" | "currencyCode">,
  unit: CurrencyUnit,
  ppp: boolean,
): { value: number; currency: string } {
  if (unit === "LOCAL") {
    return { value: row.clpaLocal, currency: row.currencyCode };
  }
  if (unit === "EUR") {
    if (!ppp) return { value: row.clpaEur, currency: "EUR" };
    const value =
      row.clpaUsd > 0
        ? Number((row.clpaPpp * (row.clpaEur / row.clpaUsd)).toFixed(2))
        : row.clpaEur;
    return { value, currency: "EUR" };
  }
  if (ppp) return { value: row.clpaPpp, currency: "USD" };
  return { value: row.clpaUsd, currency: "USD" };
}

export function clpaUnitLabel(unit: CurrencyUnit, ppp: boolean): string {
  if (unit === "LOCAL") return "Local currency";
  if (unit === "EUR") return ppp ? "PPP EUR" : "EUR";
  return ppp ? "PPP USD" : "USD";
}

export function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency] ?? "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function formatPack(packSize: number, volumeMl: number): string {
  return packSize > 1 ? `${packSize} × ${volumeMl}ml` : `${volumeMl}ml`;
}

const VENUE_LABELS: Record<string, string> = {
  supermarket: "Supermarket",
  convenience_store: "Convenience",
  bar_pub: "Bar / Pub",
  restaurant: "Restaurant",
};

export function venueLabel(venue: string): string {
  return VENUE_LABELS[venue] ?? venue;
}
