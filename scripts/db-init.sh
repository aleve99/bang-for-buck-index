#!/usr/bin/env bash
# Ensure supabase/config.toml exists. Migrations/seed already live under supabase/.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"
cd "$ROOT"

if [ -f "$ROOT/supabase/config.toml" ]; then
  echo "[db-init] supabase/config.toml already present"
  exit 0
fi

pnpm exec supabase init --yes
echo "[db-init] Created supabase/config.toml"
