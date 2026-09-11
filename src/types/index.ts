/** Shared contracts between DB / Backend / Frontend agents. */

export type CurrencyUnit = "USD" | "EUR" | "LOCAL";

export interface CurrencyPrefs {
  unit: CurrencyUnit;
  /** When true, CLPA is PPP-normalized (CLPA_USD / ppp_factor). Ignored for LOCAL. */
  ppp: boolean;
}

export interface LeaderboardRow {
  entryId: string;
  beerId: string;
  beerName: string;
  brewery: string | null;
  countryCode: string;
  countryName: string;
  style: string;
  abv: number;
  venueType: string;
  city: string | null;
  packSize: number;
  volumeMl: number;
  priceLocal: number;
  currencyCode: string;
  clpaLocal: number;
  clpaUsd: number;
  clpaEur: number;
  clpaPpp: number;
}

export interface SearchBeer {
  id: string;
  name: string;
  brewery: string | null;
  countryCode: string;
  style: string;
}

export interface SearchCountry {
  code: string;
  name: string;
}

export interface SearchCatalog {
  beers: SearchBeer[];
  countries: SearchCountry[];
  styles: string[];
}

export interface PendingPriceRow extends LeaderboardRow {
  createdAt: string;
  receiptImageUrl: string | null;
}
