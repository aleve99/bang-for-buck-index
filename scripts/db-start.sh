#!/usr/bin/env bash
# Start the local Supabase stack (Postgres, Auth, REST, Studio, Mailpit).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"
cd "$ROOT"

ensure_docker() {
  if docker info >/dev/null 2>&1; then
    :
  else
    echo "[db-start] Starting dockerd"
    sudo dockerd >/tmp/dockerd.log 2>&1 &
    for _ in $(seq 1 40); do
      if docker info >/dev/null 2>&1; then
        break
      fi
      sleep 1
    done
    if ! docker info >/dev/null 2>&1; then
      echo "[db-start] Docker failed to start. See /tmp/dockerd.log" >&2
      exit 1
    fi
  fi

  # Docker 29 + nft + bridge netfilter times out container-to-container
  # traffic on the supabase bridge (Auth/REST cannot reach Postgres).
  if [ "$(cat /proc/sys/net/bridge/bridge-nf-call-iptables 2>/dev/null || echo 1)" != "0" ]; then
    echo "[db-start] Disabling bridge-nf-call-iptables for container networking"
    sudo sysctl -w net.bridge.bridge-nf-call-iptables=0 >/dev/null
    sudo sysctl -w net.bridge.bridge-nf-call-ip6tables=0 >/dev/null
  fi
}

ensure_docker

if [ ! -f "$ROOT/supabase/config.toml" ]; then
  echo "[db-start] supabase/config.toml missing — run: pnpm supabase init"
  exit 1
fi

# Analytics extras are optional. Storage is required for receipt uploads.
EXCLUDES="${SUPABASE_EXCLUDES:-realtime,imgproxy,logflare,vector,edge-runtime,supavisor}"

echo "[db-start] supabase start"
pnpm exec supabase start -x "$EXCLUDES"

bash "$DIR/sync-supabase-env.sh"
echo "[db-start] Ready"
