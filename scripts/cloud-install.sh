#!/usr/bin/env bash
# Cloud Agent install: JS deps + Docker + local Supabase stack + seed.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"
cd "$ROOT"

echo "[install] Installing JS dependencies with pnpm"
pnpm install --frozen-lockfile

if ! command -v docker >/dev/null 2>&1; then
  echo "[install] Installing Docker"
  export DEBIAN_FRONTEND=noninteractive
  sudo apt-get update -qq
  sudo apt-get install -y -qq docker.io docker-cli docker-compose-v2 iptables
  sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
fi

echo "[install] Starting local Supabase"
bash "$DIR/db-start.sh"

echo "[install] Resetting database (migrations + seed)"
bash "$DIR/db-reset.sh"

echo "[install] Done"
