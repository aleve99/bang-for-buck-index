#!/usr/bin/env bash
# Shared configuration for the local PureHop Postgres cluster.
# A user-owned cluster (no root/systemd) keeps the dev DB reproducible and
# snapshot-friendly inside Cloud Agent VMs.
set -euo pipefail

# Locate Postgres binaries. Prefer an explicit PG_VERSION, otherwise pick the
# highest version installed under /usr/lib/postgresql (Debian/Ubuntu layout).
if [ -n "${PG_VERSION:-}" ] && [ -d "/usr/lib/postgresql/${PG_VERSION}/bin" ]; then
  PG_BIN="/usr/lib/postgresql/${PG_VERSION}/bin"
else
  PG_BIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -n 1 || true)"
fi
if [ -n "${PG_BIN:-}" ] && [ -d "$PG_BIN" ]; then
  export PATH="$PG_BIN:$PATH"
fi

export PGDATA="${PGDATA:-$HOME/.purehop/pgdata}"
export PGPORT="${PGPORT:-5432}"
export PGHOST="${PGHOST:-127.0.0.1}"
export PGUSER="${PGUSER:-postgres}"
export PG_SOCKET_DIR="${PG_SOCKET_DIR:-/tmp}"
export PG_DB="${PG_DB:-purehop}"
export PG_LOG="${PG_LOG:-$HOME/.purehop/pg.log}"
