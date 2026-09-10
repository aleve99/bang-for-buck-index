const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US",
  EUR: "de-DE",
  CZK: "cs-CZ",
  GBP: "en-GB",
  JPY: "ja-JP",
};

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
