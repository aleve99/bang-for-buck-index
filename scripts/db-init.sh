#!/usr/bin/env bash
# Idempotently initialize the user-owned Postgres cluster.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$DIR/db-env.sh"

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  echo "[db-init] Creating cluster at $PGDATA"
  mkdir -p "$PGDATA"
  initdb -D "$PGDATA" -U "$PGUSER" \
    --auth=trust --auth-host=trust --auth-local=trust >/dev/null
else
  echo "[db-init] Cluster already exists at $PGDATA"
fi
