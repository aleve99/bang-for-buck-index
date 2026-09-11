#!/usr/bin/env bash
# Destroy local DB, re-apply supabase/migrations + seed.sql.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"
cd "$ROOT"

bash "$DIR/db-start.sh"

echo "[db-reset] supabase db reset"
pnpm exec supabase db reset --yes

bash "$DIR/sync-supabase-env.sh"
echo "[db-reset] Done"
