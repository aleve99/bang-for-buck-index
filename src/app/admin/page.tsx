import { logoutAdmin } from "@/actions/admin";
import { PendingTable } from "@/components/admin/pending-table";
import { Button } from "@/components/ui";
import { getPendingPrices } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const pending = await getPendingPrices();

  return (
    <div>
      <section className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moderation queue</h1>
          <p className="mt-1 text-sm text-muted">
            Crowdsourced prices stay off the leaderboard until you verify them.
          </p>
        </div>
        <form action={logoutAdmin}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </section>
      <p className="mb-3 text-sm text-muted" data-testid="pending-count">
        {pending.length} pending
      </p>
      <PendingTable rows={pending} />
    </div>
  );
}
