import { PriceSubmissionForm } from "@/components/forms/price-submission-form";
import { getCountries } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const countries = await getCountries();

  return (
    <div>
      <section className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Submit a price</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Crowdsource a beer price. We compute the CLPA instantly. Submissions are stored as
          unverified until a moderator approves them.
        </p>
      </section>
      <PriceSubmissionForm
        countries={countries.map((c) => ({
          code: c.code,
          name: c.name,
          currencyCode: c.currencyCode,
        }))}
      />
    </div>
  );
}
