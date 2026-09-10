import { describe, expect, it } from "vitest";
import { clpaToEur, clpaToPpp, clpaToUsd, computeCLPA } from "@/lib/calculations";

describe("computeCLPA", () => {
  it("matches the PRD Oettinger example (0.5L, 4.7% ABV, €0.49 -> 20.85)", () => {
    const { pureAlcoholLiters, clpaLocal } = computeCLPA({
      packSize: 1,
      volumeMl: 500,
      abv: 4.7,
      priceLocal: 0.49,
    });
    expect(pureAlcoholLiters).toBeCloseTo(0.0235, 5);
    expect(clpaLocal).toBeCloseTo(20.85, 2);
  });

  it("matches the PRD Pilsner Urquell pub example (0.5L, 4.4%, 60 CZK -> 2727.27)", () => {
    const { pureAlcoholLiters, clpaLocal } = computeCLPA({
      packSize: 1,
      volumeMl: 500,
      abv: 4.4,
      priceLocal: 60,
    });
    expect(pureAlcoholLiters).toBeCloseTo(0.022, 5);
    expect(clpaLocal).toBeCloseTo(2727.27, 2);
  });

  it("handles multipacks (12 x 355ml, 4.2%, $12.99 -> 72.60)", () => {
    const { pureAlcoholLiters, clpaLocal } = computeCLPA({
      packSize: 12,
      volumeMl: 355,
      abv: 4.2,
      priceLocal: 12.99,
    });
    expect(pureAlcoholLiters).toBeCloseTo(0.17892, 5);
    expect(clpaLocal).toBeCloseTo(72.6, 2);
  });

  it("throws when there is no alcohol", () => {
    expect(() => computeCLPA({ packSize: 1, volumeMl: 0, abv: 5, priceLocal: 1 })).toThrow();
  });
});

describe("currency normalization", () => {
  it("converts local CLPA to USD via rate", () => {
    // 2727.27 CZK/L * 0.043 USD/CZK ≈ 117.27 USD/L
    expect(clpaToUsd(2727.27, 0.043)).toBeCloseTo(117.27, 2);
  });

  it("applies PPP normalization", () => {
    expect(clpaToPpp(100, 0.55)).toBeCloseTo(181.82, 2);
  });

  it("leaves USD unchanged at rate 1", () => {
    expect(clpaToUsd(72.6, 1)).toBe(72.6);
  });

  it("converts Oettinger USD CLPA to EUR (22.62 / 1.085 ≈ 20.85)", () => {
    expect(clpaToEur(22.62, 1.085)).toBeCloseTo(20.85, 2);
  });

  it("treats a non-positive EUR rate as 1", () => {
    expect(clpaToEur(100, 0)).toBe(100);
  });
});
