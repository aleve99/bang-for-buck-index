import { LeaderboardTable } from "@/components/leaderboard/table";
import { getLeaderboard, getStyles } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [rows, styles] = await Promise.all([getLeaderboard({ limit: 50 }), getStyles()]);

  return (
    <div>
      <section className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Global Bang-for-Buck Index</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          The world&apos;s cheapest pure ethanol, ranked. CLPA is the cost of one liter of pure
          alcohol — normalized across pack sizes, ABV, and currencies. Lower is better.
        </p>
      </section>
      <LeaderboardTable rows={rows} styles={styles} />
    </div>
  );
}
