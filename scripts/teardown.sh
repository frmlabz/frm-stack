#!/usr/bin/env bash
# Kill all processes listening on ports defined in .env.ports

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env.ports"

if [ ! -f "$ENV_FILE" ]; then
  echo "No .env.ports file found"
  exit 1
fi

ports=$(grep -E '_PORT=' "$ENV_FILE" | grep -v '^#' | sed 's/.*=//' | sort -un)

killed=0
for port in $ports; do
  pids=$(lsof -t -i :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    for pid in $pids; do
      echo "Killing PID $pid on port $port"
      kill "$pid" 2>/dev/null || true
      killed=$((killed + 1))
    done
  fi
done

if [ "$killed" -eq 0 ]; then
  echo "No processes found on any .env.ports ports"
else
  echo "Killed $killed process(es)"
fi

# Stop docker containers
if docker compose ps -q 2>/dev/null | grep -q .; then
  echo "Stopping docker containers..."
  docker compose down --remove-orphans
else
  echo "No docker containers running"
fi
