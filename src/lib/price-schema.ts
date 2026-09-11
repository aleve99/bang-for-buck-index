import { z } from "zod";

export const PriceSubmissionSchema = z.object({
  beerName: z.string().min(2).max(150),
  brewery: z.string().max(150).optional(),
  countryCode: z.string().length(2),
  abv: z.coerce.number().min(0.5).max(80.0),
  style: z.string().min(2).max(50),
  venueType: z.enum(["supermarket", "convenience_store", "bar_pub", "restaurant"]),
  packSize: z.coerce.number().int().min(1).default(1),
  volumeMl: z.coerce.number().int().min(50).max(5000),
  priceLocal: z.coerce.number().positive(),
  currencyCode: z.string().length(3),
  city: z.string().max(100).optional(),
  /** Legacy URL fallback; new submissions store a Storage object path instead. */
  receiptImageUrl: z.string().url().optional().or(z.literal("")),
});

export type PriceSubmissionInput = z.infer<typeof PriceSubmissionSchema>;
