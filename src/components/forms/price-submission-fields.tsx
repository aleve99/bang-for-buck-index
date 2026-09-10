"use client";

import { Input, Label, Select } from "@/components/ui";

export type CountryOption = { code: string; name: string; currencyCode: string };

export function BeerStepFields({
  countries,
  abv,
  onAbvChange,
  error,
}: {
  countries: CountryOption[];
  abv: number;
  onAbvChange: (v: number) => void;
  error: (field: string) => string | undefined;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="beerName">Beer name</Label>
        <Input id="beerName" name="beerName" placeholder="Oettinger Pils" required />
        {error("beerName") && <p className="mt-1 text-xs text-red-400">{error("beerName")}</p>}
      </div>
      <div>
        <Label htmlFor="brewery">Brewery (optional)</Label>
        <Input id="brewery" name="brewery" placeholder="Oettinger Brauerei" />
      </div>
      <div>
        <Label htmlFor="style">Style</Label>
        <Input id="style" name="style" placeholder="Pilsner" required />
        {error("style") && <p className="mt-1 text-xs text-red-400">{error("style")}</p>}
      </div>
      <div>
        <Label htmlFor="abv">ABV %</Label>
        <Input
          id="abv"
          name="abv"
          type="number"
          step="0.1"
          value={abv}
          onChange={(e) => onAbvChange(Number(e.target.value))}
          required
        />
        {error("abv") && <p className="mt-1 text-xs text-red-400">{error("abv")}</p>}
      </div>
      <div>
        <Label htmlFor="countryCode">Country</Label>
        <Select id="countryCode" name="countryCode" defaultValue="DE" required>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.code})
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

export function PurchaseStepFields({
  countries,
  packSize,
  volumeMl,
  priceLocal,
  onPackSizeChange,
  onVolumeMlChange,
  onPriceLocalChange,
  error,
}: {
  countries: CountryOption[];
  packSize: number;
  volumeMl: number;
  priceLocal: number;
  onPackSizeChange: (v: number) => void;
  onVolumeMlChange: (v: number) => void;
  onPriceLocalChange: (v: number) => void;
  error: (field: string) => string | undefined;
}) {
  const currencies = [...new Set(countries.map((c) => c.currencyCode))];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="venueType">Venue type</Label>
        <Select id="venueType" name="venueType" defaultValue="supermarket" required>
          <option value="supermarket">Supermarket</option>
          <option value="convenience_store">Convenience store</option>
          <option value="bar_pub">Bar / Pub</option>
          <option value="restaurant">Restaurant</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="city">City (optional)</Label>
        <Input id="city" name="city" placeholder="Berlin" />
      </div>
      <div>
        <Label htmlFor="packSize">Pack size</Label>
        <Input
          id="packSize"
          name="packSize"
          type="number"
          min={1}
          value={packSize}
          onChange={(e) => onPackSizeChange(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <Label htmlFor="volumeMl">Volume per unit (ml)</Label>
        <Input
          id="volumeMl"
          name="volumeMl"
          type="number"
          value={volumeMl}
          onChange={(e) => onVolumeMlChange(Number(e.target.value))}
          required
        />
        {error("volumeMl") && <p className="mt-1 text-xs text-red-400">{error("volumeMl")}</p>}
      </div>
      <div>
        <Label htmlFor="priceLocal">Price (local)</Label>
        <Input
          id="priceLocal"
          name="priceLocal"
          type="number"
          step="0.01"
          value={priceLocal}
          onChange={(e) => onPriceLocalChange(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <Label htmlFor="currencyCode">Currency</Label>
        <Select id="currencyCode" name="currencyCode" defaultValue="EUR" required>
          {currencies.map((cur) => (
            <option key={cur} value={cur}>
              {cur}
            </option>
          ))}
        </Select>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="receiptImageUrl">Receipt image URL (optional)</Label>
        <Input
          id="receiptImageUrl"
          name="receiptImageUrl"
          type="url"
          placeholder="https://"
        />
        {error("receiptImageUrl") && (
          <p className="mt-1 text-xs text-red-400">{error("receiptImageUrl")}</p>
        )}
      </div>
    </div>
  );
}

export function ClpaPreview({
  preview,
}: {
  preview: { clpaLocal: number; pureAlcoholLiters: number } | null;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted">Live CLPA preview</h3>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted">Pure alcohol</span>
        <span className="font-mono text-sm">
          {preview ? `${preview.pureAlcoholLiters.toFixed(5)} L` : "—"}
        </span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted">CLPA (local)</span>
        <span className="font-mono text-2xl font-bold text-accent" data-testid="clpa-preview">
          {preview ? preview.clpaLocal.toFixed(2) : "—"}
        </span>
      </div>
      <p className="pt-2 text-xs text-muted">
        CLPA = price ÷ (pack × volume × ABV). Lower means more alcohol per unit of money.
      </p>
    </div>
  );
}
