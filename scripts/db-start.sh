#!/usr/bin/env bash
# Idempotently start the local Postgres cluster and ensure the app DB exists.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$DIR/db-env.sh"

bash "$DIR/db-init.sh"

if pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
  echo "[db-start] Postgres already running"
else
  echo "[db-start] Starting Postgres on port $PGPORT"
  mkdir -p "$(dirname "$PG_LOG")"
  pg_ctl -D "$PGDATA" \
    -o "-p $PGPORT -k $PG_SOCKET_DIR" \
    -l "$PG_LOG" -w start
fi

# Wait for readiness.
for _ in $(seq 1 30); do
  if pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -tAc \
  "SELECT 1 FROM pg_database WHERE datname='$PG_DB'" | grep -q 1; then
  echo "[db-start] Creating database $PG_DB"
  createdb -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PG_DB"
fi

echo "[db-start] Ready: postgresql://$PGUSER@$PGHOST:$PGPORT/$PG_DB"
