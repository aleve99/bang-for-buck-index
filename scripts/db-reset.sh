#!/usr/bin/env bash
# Drop and rebuild the public schema, apply all migrations, then seed.
# Mirrors `supabase db reset` for our native Postgres dev cluster.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"
# shellcheck source=/dev/null
source "$DIR/db-env.sh"

bash "$DIR/db-start.sh"

PSQL=(psql -v ON_ERROR_STOP=1 -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PG_DB")

echo "[db-reset] Dropping public schema"
"${PSQL[@]}" -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;" >/dev/null

for migration in "$ROOT"/supabase/migrations/*.sql; do
  echo "[db-reset] Applying $(basename "$migration")"
  "${PSQL[@]}" -f "$migration" >/dev/null
done

if [ -f "$ROOT/supabase/seed.sql" ]; then
  echo "[db-reset] Seeding data"
  "${PSQL[@]}" -f "$ROOT/supabase/seed.sql" >/dev/null
fi

COUNT="$("${PSQL[@]}" -tAc "SELECT COUNT(*) FROM public.price_entries WHERE verified = true")"
echo "[db-reset] Done. Verified price entries: $COUNT"
