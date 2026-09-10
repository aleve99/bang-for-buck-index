"use client";

import { useActionState, useState } from "react";
import { submitPrice, type SubmitPriceState } from "@/actions/submit-price";
import { computeCLPA } from "@/lib/calculations";
import { Button, Card } from "@/components/ui";
import {
  BeerStepFields,
  ClpaPreview,
  PurchaseStepFields,
  type CountryOption,
} from "@/components/forms/price-submission-fields";

const initial: SubmitPriceState | null = null;

const STEP_LABELS = ["Beer", "Purchase", "Review"] as const;
const BEER_FIELDS = new Set(["beerName", "style", "abv", "countryCode"]);

export function PriceSubmissionForm({
  countries,
  embedded = false,
}: {
  countries: CountryOption[];
  embedded?: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitPrice, initial);
  const [step, setStep] = useState(1);

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

  function firstInvalidStep(form: HTMLFormElement): 1 | 2 | null {
    const invalid = Array.from(form.elements).find((el) => {
      return (
        (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) &&
        !el.checkValidity()
      );
    }) as HTMLInputElement | HTMLSelectElement | undefined;
    if (!invalid) return null;
    return BEER_FIELDS.has(invalid.id) ? 1 : 2;
  }

  const body = (
    <form
      action={formAction}
      className="grid gap-4"
      onSubmit={(e) => {
        if (step !== 3) e.preventDefault();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "TEXTAREA" || tag === "BUTTON" || tag === "A") return;
        if (step < 3) {
          e.preventDefault();
          setStep((s) => Math.min(3, s + 1));
        }
      }}
    >
      <p className="text-sm text-muted" data-testid="submit-step">
        Step {step} of 3 · {STEP_LABELS[step - 1]}
      </p>

      <div hidden={step !== 1}>
        <BeerStepFields countries={countries} abv={abv} onAbvChange={setAbv} error={err} />
      </div>
      <div hidden={step !== 2}>
        <PurchaseStepFields
          countries={countries}
          packSize={packSize}
          volumeMl={volumeMl}
          priceLocal={priceLocal}
          onPackSizeChange={setPackSize}
          onVolumeMlChange={setVolumeMl}
          onPriceLocalChange={setPriceLocal}
          error={err}
        />
      </div>
      <div hidden={step !== 3}>
        <ClpaPreview preview={preview} />
      </div>

      <div className="flex gap-2">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {step < 3 && (
          <Button type="button" className="ml-auto" onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        )}
        {step === 3 && (
          <Button
            type="submit"
            disabled={pending}
            className="ml-auto"
            onClick={(e) => {
              const form = e.currentTarget.form;
              if (!form || form.checkValidity()) return;
              e.preventDefault();
              const next = firstInvalidStep(form);
              if (next) setStep(next);
            }}
          >
            {pending ? "Submitting…" : "Submit price"}
          </Button>
        )}
      </div>

      {state && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
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
  );

  if (embedded) return body;
  return <Card>{body}</Card>;
}
