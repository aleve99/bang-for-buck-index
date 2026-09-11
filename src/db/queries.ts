import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { beers, countries, exchangeRates, priceEntries } from "@/db/schema";
import { clpaToEur, clpaToPpp, clpaToUsd } from "@/lib/calculations";
import { signedReceiptUrl } from "@/lib/storage";
import type { LeaderboardRow, PendingPriceRow, SearchCatalog } from "@/types";

const EUR_RATE_FALLBACK = 1.085;

const leaderboardSelect = {
  entryId: priceEntries.id,
  beerId: beers.id,
  beerName: beers.name,
  brewery: beers.brewery,
  countryCode: priceEntries.countryCode,
  countryName: countries.name,
  style: beers.style,
  abv: beers.abv,
  venueType: priceEntries.venueType,
  city: priceEntries.city,
  packSize: priceEntries.packSize,
  volumeMl: priceEntries.volumeMl,
  priceLocal: priceEntries.priceLocal,
  currencyCode: priceEntries.currencyCode,
  clpaLocal: priceEntries.clpaLocal,
  rateToUsd: exchangeRates.rateToUsd,
  pppFactor: countries.pppFactor,
  createdAt: priceEntries.createdAt,
  receiptImageUrl: priceEntries.receiptImageUrl,
};

type RawLeaderboardRow = {
  entryId: string;
  beerId: string;
  beerName: string;
  brewery: string | null;
  countryCode: string;
  countryName: string;
  style: string;
  abv: string;
  venueType: string;
  city: string | null;
  packSize: number;
  volumeMl: number;
  priceLocal: string;
  currencyCode: string;
  clpaLocal: string;
  rateToUsd: string;
  pppFactor: string | null;
  createdAt: Date;
  receiptImageUrl: string | null;
};

function toLeaderboardRow(r: RawLeaderboardRow, eurRateToUsd: number): LeaderboardRow {
  const clpaLocal = Number(r.clpaLocal);
  const clpaUsd = clpaToUsd(clpaLocal, Number(r.rateToUsd));
  const clpaEur = clpaToEur(clpaUsd, eurRateToUsd);
  const clpaPpp = clpaToPpp(clpaUsd, Number(r.pppFactor ?? 1));
  return {
    entryId: r.entryId,
    beerId: r.beerId,
    beerName: r.beerName,
    brewery: r.brewery,
    countryCode: r.countryCode,
    countryName: r.countryName,
    style: r.style,
    abv: Number(r.abv),
    venueType: r.venueType,
    city: r.city,
    packSize: r.packSize,
    volumeMl: r.volumeMl,
    priceLocal: Number(r.priceLocal),
    currencyCode: r.currencyCode,
    clpaLocal,
    clpaUsd,
    clpaEur,
    clpaPpp,
  };
}

async function eurRate(): Promise<number> {
  const [eurRateRow] = await db
    .select({ rateToUsd: exchangeRates.rateToUsd })
    .from(exchangeRates)
    .where(eq(exchangeRates.currencyCode, "EUR"))
    .limit(1);
  const eurRateRaw = Number(eurRateRow?.rateToUsd);
  return eurRateRaw > 0 ? eurRateRaw : EUR_RATE_FALLBACK;
}

interface LeaderboardFilters {
  countryCode?: string;
  style?: string;
  limit?: number;
}

export async function getLeaderboard(
  filters: LeaderboardFilters = {},
): Promise<LeaderboardRow[]> {
  const { countryCode, style, limit = 50 } = filters;

  const conditions = [eq(priceEntries.verified, true)];
  if (countryCode) conditions.push(eq(priceEntries.countryCode, countryCode));
  if (style) conditions.push(eq(beers.style, style));

  const [rows, eurRateToUsd] = await Promise.all([
    db
      .select(leaderboardSelect)
      .from(priceEntries)
      .innerJoin(beers, eq(priceEntries.beerId, beers.id))
      .innerJoin(countries, eq(priceEntries.countryCode, countries.code))
      .innerJoin(exchangeRates, eq(priceEntries.currencyCode, exchangeRates.currencyCode))
      .where(and(...conditions))
      .orderBy(asc(priceEntries.clpaLocal))
      .limit(limit),
    eurRate(),
  ]);

  return rows
    .map((r) => toLeaderboardRow(r as RawLeaderboardRow, eurRateToUsd))
    .sort((a, b) => a.clpaUsd - b.clpaUsd);
}

export async function getPendingPrices(): Promise<PendingPriceRow[]> {
  const [rows, eurRateToUsd] = await Promise.all([
    db
      .select(leaderboardSelect)
      .from(priceEntries)
      .innerJoin(beers, eq(priceEntries.beerId, beers.id))
      .innerJoin(countries, eq(priceEntries.countryCode, countries.code))
      .innerJoin(exchangeRates, eq(priceEntries.currencyCode, exchangeRates.currencyCode))
      .where(eq(priceEntries.verified, false))
      .orderBy(desc(priceEntries.createdAt)),
    eurRate(),
  ]);

  return Promise.all(
    rows.map(async (r) => {
      const raw = r as RawLeaderboardRow;
      return {
        ...toLeaderboardRow(raw, eurRateToUsd),
        createdAt: raw.createdAt.toISOString(),
        receiptImageUrl: raw.receiptImageUrl,
        receiptDisplayUrl: await signedReceiptUrl(raw.receiptImageUrl),
      };
    }),
  );
}

export async function getCountries() {
  return db.select().from(countries).orderBy(asc(countries.name));
}

export async function getStyles(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ style: beers.style })
    .from(beers)
    .orderBy(asc(beers.style));
  return rows.map((r) => r.style);
}

export async function getSearchCatalog(): Promise<SearchCatalog> {
  const [beerRows, countryRows, styles] = await Promise.all([
    db
      .select({
        id: beers.id,
        name: beers.name,
        brewery: beers.brewery,
        countryCode: beers.countryCode,
        style: beers.style,
      })
      .from(beers)
      .orderBy(asc(beers.name)),
    db
      .select({
        code: countries.code,
        name: countries.name,
      })
      .from(countries)
      .orderBy(asc(countries.name)),
    getStyles(),
  ]);

  return {
    beers: beerRows.map((b) => ({
      id: b.id,
      name: b.name,
      brewery: b.brewery,
      countryCode: b.countryCode ?? "",
      style: b.style,
    })),
    countries: countryRows,
    styles,
  };
}

export async function getCountry(code: string) {
  const [row] = await db.select().from(countries).where(eq(countries.code, code)).limit(1);
  return row ?? null;
}
