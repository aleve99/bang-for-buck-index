export type CurrencyUnit = "USD" | "LOCAL";

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
  clpaPpp: number;
}
