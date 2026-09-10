#!/usr/bin/env bash
# Cloud Agent install phase: idempotent dependency + database bootstrap.
# Safe to re-run; safe against cached/partial state.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"
cd "$ROOT"

echo "[install] Installing JS dependencies with pnpm"
pnpm install --frozen-lockfile

echo "[install] Ensuring PostgreSQL is installed"
bash "$DIR/db-install-postgres.sh"

echo "[install] Initializing and starting local Postgres"
bash "$DIR/db-start.sh"

echo "[install] Applying migrations and seed data"
bash "$DIR/db-reset.sh"

echo "[install] Done"
