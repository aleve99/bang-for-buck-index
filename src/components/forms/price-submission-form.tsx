"use client";

import { useActionState, useState } from "react";
import { submitPrice, type SubmitPriceState } from "@/actions/submit-price";
import { computeCLPA } from "@/lib/calculations";
import { Button, Card, Input, Label, Select } from "@/components/ui";

const initial: SubmitPriceState | null = null;

export function PriceSubmissionForm({
  countries,
}: {
  countries: { code: string; name: string; currencyCode: string }[];
}) {
  const [state, formAction, pending] = useActionState(submitPrice, initial);

  const [abv, setAbv] = useState(4.7);
  const [packSize, setPackSize] = useState(1);
  const [volumeMl, setVolumeMl] = useState(500);
  const [priceLocal, setPriceLocal] = useState(0.49);

  let preview: { clpaLocal: number; pureAlcoholLiters: number } | null = null;
  try {
    if (abv > 0 && packSize > 0 && volumeMl > 0 && priceLocal > 0) {
      preview = computeCLPA({ packSize, volumeMl, abv, priceLocal });
    }
  } catch {
    preview = null;
  }

  const err = (f: string) => state?.fieldErrors?.[f]?.[0];

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <Card>
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="beerName">Beer name</Label>
            <Input id="beerName" name="beerName" placeholder="Oettinger Pils" required />
            {err("beerName") && <p className="mt-1 text-xs text-red-400">{err("beerName")}</p>}
          </div>
          <div>
            <Label htmlFor="brewery">Brewery (optional)</Label>
            <Input id="brewery" name="brewery" placeholder="Oettinger Brauerei" />
          </div>
          <div>
            <Label htmlFor="style">Style</Label>
            <Input id="style" name="style" placeholder="Pilsner" required />
            {err("style") && <p className="mt-1 text-xs text-red-400">{err("style")}</p>}
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
          <div>
            <Label htmlFor="city">City (optional)</Label>
            <Input id="city" name="city" placeholder="Berlin" />
          </div>
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
            <Label htmlFor="abv">ABV %</Label>
            <Input
              id="abv"
              name="abv"
              type="number"
              step="0.1"
              value={abv}
              onChange={(e) => setAbv(Number(e.target.value))}
              required
            />
            {err("abv") && <p className="mt-1 text-xs text-red-400">{err("abv")}</p>}
          </div>
          <div>
            <Label htmlFor="packSize">Pack size</Label>
            <Input
              id="packSize"
              name="packSize"
              type="number"
              min={1}
              value={packSize}
              onChange={(e) => setPackSize(Number(e.target.value))}
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
              onChange={(e) => setVolumeMl(Number(e.target.value))}
              required
            />
            {err("volumeMl") && <p className="mt-1 text-xs text-red-400">{err("volumeMl")}</p>}
          </div>
          <div>
            <Label htmlFor="priceLocal">Price (local)</Label>
            <Input
              id="priceLocal"
              name="priceLocal"
              type="number"
              step="0.01"
              value={priceLocal}
              onChange={(e) => setPriceLocal(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <Label htmlFor="currencyCode">Currency</Label>
            <Select id="currencyCode" name="currencyCode" defaultValue="EUR" required>
              {[...new Set(countries.map((c) => c.currencyCode))].map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Submitting…" : "Submit price"}
            </Button>
          </div>

          {state && (
            <div
              className={`sm:col-span-2 rounded-lg border px-3 py-2 text-sm ${
                state.ok
                  ? "border-green-700 bg-green-950/40 text-green-300"
                  : "border-red-800 bg-red-950/40 text-red-300"
              }`}
              data-testid="submit-result"
            >
              {state.message}
            </div>
          )}
        </form>
      </Card>

      <Card className="h-fit">
        <h3 className="text-sm font-semibold text-muted">Live CLPA preview</h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted">Pure alcohol</span>
            <span className="font-mono text-sm">
              {preview ? `${preview.pureAlcoholLiters.toFixed(5)} L` : "—"}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted">CLPA (local)</span>
            <span
              className="font-mono text-2xl font-bold text-accent"
              data-testid="clpa-preview"
            >
              {preview ? preview.clpaLocal.toFixed(2) : "—"}
            </span>
          </div>
          <p className="pt-2 text-xs text-muted">
            CLPA = price ÷ (pack × volume × ABV). Lower means more alcohol per unit of money.
          </p>
        </div>
      </Card>
    </div>
  );
}
