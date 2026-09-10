/**
 * Core CLPA (Cost per Liter of Pure Alcohol) math.
 *
 * Pure Ethanol (L) = packSize * (volumeMl / 1000) * (abv / 100)
 * CLPA_local        = priceLocal / pureAlcoholLiters
 */
export interface ClpaInput {
  packSize: number;
  volumeMl: number;
  abv: number;
  priceLocal: number;
}

export interface ClpaResult {
  pureAlcoholLiters: number;
  clpaLocal: number;
}

export function computeCLPA(input: ClpaInput): ClpaResult {
  const totalVolumeLiters = (input.packSize * input.volumeMl) / 1000;
  const pureAlcoholLiters = totalVolumeLiters * (input.abv / 100);

  if (pureAlcoholLiters <= 0) {
    throw new Error("Pure alcohol volume must be greater than zero");
  }

  const clpaLocal = input.priceLocal / pureAlcoholLiters;

  return {
    pureAlcoholLiters: Number(pureAlcoholLiters.toFixed(5)),
    clpaLocal: Number(clpaLocal.toFixed(2)),
  };
}

/** Convert a local-currency CLPA into normalized USD. */
export function clpaToUsd(clpaLocal: number, rateToUsd: number): number {
  return Number((clpaLocal * rateToUsd).toFixed(2));
}

/**
 * Convert a USD CLPA into EUR.
 * CLPA_EUR = CLPA_USD / EUR_rate_to_usd
 */
export function clpaToEur(clpaUsd: number, eurRateToUsd: number): number {
  if (eurRateToUsd <= 0) eurRateToUsd = 1;
  return Number((clpaUsd / eurRateToUsd).toFixed(2));
}

/** Apply Purchasing Power Parity normalization to a USD CLPA. */
export function clpaToPpp(clpaUsd: number, pppFactor: number): number {
  if (pppFactor <= 0) return clpaUsd;
  return Number((clpaUsd / pppFactor).toFixed(2));
}
