"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { beers, countries, exchangeRates, priceEntries } from "@/db/schema";
import { computeCLPA } from "@/lib/calculations";
import { PriceSubmissionSchema } from "@/lib/price-schema";

export interface SubmitPriceState {
  ok: boolean;
  message: string;
  clpaLocal?: number;
  pureAlcoholLiters?: number;
  fieldErrors?: Record<string, string[]>;
}

export async function submitPrice(
  _prev: SubmitPriceState | null,
  formData: FormData,
): Promise<SubmitPriceState> {
  const parsed = PriceSubmissionSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;

  const [countryRow] = await db
    .select()
    .from(countries)
    .where(eq(countries.code, input.countryCode.toUpperCase()))
    .limit(1);
  if (!countryRow) {
    return { ok: false, message: `Unknown country code: ${input.countryCode}` };
  }

  const [fxRow] = await db
    .select()
    .from(exchangeRates)
    .where(eq(exchangeRates.currencyCode, input.currencyCode.toUpperCase()))
    .limit(1);
  if (!fxRow) {
    return { ok: false, message: `Unsupported currency: ${input.currencyCode}` };
  }

  const { pureAlcoholLiters, clpaLocal } = computeCLPA({
    packSize: input.packSize,
    volumeMl: input.volumeMl,
    abv: input.abv,
    priceLocal: input.priceLocal,
  });

  // Reuse an existing canonical beer if name + country match, otherwise create.
  const existing = await db
    .select({ id: beers.id })
    .from(beers)
    .where(
      and(
        eq(beers.name, input.beerName),
        eq(beers.countryCode, input.countryCode.toUpperCase()),
      ),
    )
    .limit(1);

  let beerId = existing[0]?.id;
  if (!beerId) {
    const [inserted] = await db
      .insert(beers)
      .values({
        name: input.beerName,
        brewery: input.brewery || null,
        countryCode: input.countryCode.toUpperCase(),
        abv: input.abv.toFixed(2),
        style: input.style,
      })
      .returning({ id: beers.id });
    beerId = inserted.id;
  }

  await db.insert(priceEntries).values({
    beerId,
    countryCode: input.countryCode.toUpperCase(),
    city: input.city || null,
    venueType: input.venueType,
    packSize: input.packSize,
    volumeMl: input.volumeMl,
    priceLocal: input.priceLocal.toFixed(2),
    currencyCode: input.currencyCode.toUpperCase(),
    pureAlcoholLiters: pureAlcoholLiters.toFixed(5),
    clpaLocal: clpaLocal.toFixed(2),
    receiptImageUrl: input.receiptImageUrl || null,
    // Crowdsourced entries default to unverified pending moderation.
    verified: false,
  });

  const countryCode = input.countryCode.toUpperCase();
  revalidatePath("/");
  revalidatePath("/submit");
  revalidatePath(`/country/${countryCode}`);
  revalidatePath(`/styles/${encodeURIComponent(input.style)}`);

  return {
    ok: true,
    message: `Submitted ${input.beerName}. CLPA ≈ ${clpaLocal.toFixed(2)} ${input.currencyCode.toUpperCase()}/L pure alcohol (pending verification).`,
    clpaLocal,
    pureAlcoholLiters,
  };
}
