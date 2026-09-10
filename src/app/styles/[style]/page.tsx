import { LeaderboardTable } from "@/components/leaderboard/table";
import { getLeaderboard, getStyles } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function StylePage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style } = await params;
  const decoded = decodeURIComponent(style);

  const [rows, styles] = await Promise.all([
    getLeaderboard({ style: decoded, limit: 50 }),
    getStyles(),
  ]);

  return (
    <div>
      <section className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight capitalize">{decoded} Leaderboard</h1>
        <p className="mt-1 text-sm text-muted">
          Cheapest pure alcohol among {decoded} beers worldwide.
        </p>
      </section>
      <LeaderboardTable rows={rows} styles={styles} />
    </div>
  );
}
