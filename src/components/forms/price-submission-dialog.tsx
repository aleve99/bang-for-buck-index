"use client";

import { Button, Dialog } from "@/components/ui";
import { PriceSubmissionForm } from "@/components/forms/price-submission-form";
import type { CountryOption } from "@/components/forms/price-submission-fields";

export function PriceSubmissionDialog({
  open,
  onOpenChange,
  countries,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countries: CountryOption[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-testid="submit-dialog">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Submit a price</h2>
          <p className="mt-1 text-xs text-muted">
            Three steps. CLPA is calculated before you submit.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-8 px-2"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          ×
        </Button>
      </div>
      <PriceSubmissionForm countries={countries} embedded />
    </Dialog>
  );
}
