#!/usr/bin/env bash
# Shared configuration for the local PureHop Postgres cluster.
# A user-owned cluster (no root/systemd) keeps the dev DB reproducible and
# snapshot-friendly inside Cloud Agent VMs.
set -euo pipefail

PG_VERSION="${PG_VERSION:-16}"
PG_BIN="/usr/lib/postgresql/${PG_VERSION}/bin"
if [ -d "$PG_BIN" ]; then
  export PATH="$PG_BIN:$PATH"
fi

export PGDATA="${PGDATA:-$HOME/.purehop/pgdata}"
export PGPORT="${PGPORT:-5432}"
export PGHOST="${PGHOST:-127.0.0.1}"
export PGUSER="${PGUSER:-postgres}"
export PG_SOCKET_DIR="${PG_SOCKET_DIR:-/tmp}"
export PG_DB="${PG_DB:-purehop}"
export PG_LOG="${PG_LOG:-$HOME/.purehop/pg.log}"
