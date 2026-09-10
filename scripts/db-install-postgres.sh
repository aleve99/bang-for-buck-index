#!/usr/bin/env bash
# Ensure PostgreSQL server + client binaries are available.
# Idempotent: no-op when a cluster tool (initdb) is already on PATH or installed.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$DIR/db-env.sh"

if command -v initdb >/dev/null 2>&1 || ls /usr/lib/postgresql/*/bin/initdb >/dev/null 2>&1; then
  echo "[db-install] PostgreSQL already installed"
  exit 0
fi

echo "[db-install] Installing PostgreSQL via apt"
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    echo "[db-install] ERROR: root privileges required to install PostgreSQL" >&2
    exit 1
  fi
fi

export DEBIAN_FRONTEND=noninteractive
$SUDO apt-get update -qq
$SUDO apt-get install -y -qq postgresql postgresql-contrib
echo "[db-install] PostgreSQL installed"
