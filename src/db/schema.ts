import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const venueCategory = pgEnum("venue_category", [
  "supermarket",
  "convenience_store",
  "bar_pub",
  "restaurant",
]);

export const countries = pgTable("countries", {
  code: varchar("code", { length: 2 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  currencyCode: varchar("currency_code", { length: 3 }).notNull(),
  pppFactor: numeric("ppp_factor", { precision: 8, scale: 4 }).default("1.0000"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const exchangeRates = pgTable("exchange_rates", {
  currencyCode: varchar("currency_code", { length: 3 }).primaryKey(),
  rateToUsd: numeric("rate_to_usd", { precision: 14, scale: 6 }).notNull(),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow().notNull(),
});

export const beers = pgTable("beers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull(),
  brewery: varchar("brewery", { length: 150 }),
  countryCode: varchar("country_code", { length: 2 }).references(() => countries.code, {
    onDelete: "restrict",
  }),
  abv: numeric("abv", { precision: 4, scale: 2 }).notNull(),
  style: varchar("style", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const priceEntries = pgTable(
  "price_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    beerId: uuid("beer_id")
      .notNull()
      .references(() => beers.id, { onDelete: "cascade" }),
    countryCode: varchar("country_code", { length: 2 })
      .notNull()
      .references(() => countries.code),
    city: varchar("city", { length: 100 }),
    venueType: venueCategory("venue_type").notNull(),
    packSize: integer("pack_size").default(1).notNull(),
    volumeMl: integer("volume_ml").notNull(),
    priceLocal: numeric("price_local", { precision: 10, scale: 2 }).notNull(),
    currencyCode: varchar("currency_code", { length: 3 })
      .notNull()
      .references(() => exchangeRates.currencyCode),
    pureAlcoholLiters: numeric("pure_alcohol_liters", { precision: 8, scale: 5 }).notNull(),
    clpaLocal: numeric("clpa_local", { precision: 10, scale: 2 }).notNull(),
    verified: boolean("verified").default(false).notNull(),
    receiptImageUrl: text("receipt_image_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_price_entries_beer_id").on(table.beerId),
    index("idx_price_entries_country").on(table.countryCode),
    index("idx_price_entries_clpa").on(table.clpaLocal),
  ],
);

export type Country = typeof countries.$inferSelect;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type Beer = typeof beers.$inferSelect;
export type PriceEntry = typeof priceEntries.$inferSelect;
export type NewPriceEntry = typeof priceEntries.$inferInsert;
