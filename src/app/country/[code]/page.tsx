import { notFound } from "next/navigation";
import { LeaderboardTable } from "@/components/leaderboard/table";
import { getCountry, getLeaderboard, getStyles } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function CountryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const upper = code.toUpperCase();
  const country = await getCountry(upper);
  if (!country) notFound();

  const [rows, styles] = await Promise.all([
    getLeaderboard({ countryCode: upper, limit: 50 }),
    getStyles(),
  ]);

  return (
    <div>
      <section className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{country.name} Leaderboard</h1>
        <p className="mt-1 text-sm text-muted">
          Cheapest pure alcohol in {country.name} ({country.currencyCode}).
        </p>
      </section>
      <LeaderboardTable rows={rows} styles={styles} />
    </div>
  );
}
