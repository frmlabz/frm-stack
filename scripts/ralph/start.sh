#!/usr/bin/env bash
#
# Ralph start script - starts dev servers in background
# Tracks PIDs for cleanup in teardown.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Auto-detect branch if no argument provided
if [[ -n "${1:-}" ]]; then
  PRD_NAME="$1"
elif git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  PRD_NAME="$(git -C "$ROOT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null)"
  if [[ -z "$PRD_NAME" ]]; then
    echo "Error: could not detect branch name" >&2
    exit 1
  fi
else
  echo "Error: not in a git repository and no PRD name provided" >&2
  exit 1
fi
PID_DIR="/tmp/ralph"
LOG_DIR="/tmp/ralph/logs"

mkdir -p "$PID_DIR" "$LOG_DIR"

cd "$ROOT_DIR"

# Generate and load ports
"$ROOT_DIR/scripts/generate-ports.sh" --name "$PRD_NAME"
set -a
source "$ROOT_DIR/.env.ports"
set +a

echo "[ralph:$PRD_NAME] Starting dev servers..."
echo "[ralph:$PRD_NAME] api=$API_PORT web=$WEB_PORT pg=$PG_PORT landing=$LANDING_PORT"

# Start turbo dev without TUI
nohup "$ROOT_DIR/scripts/with-ports.sh" pnpm turbo run --ui stream --concurrency=15 dev > "$LOG_DIR/${PRD_NAME}.log" 2>&1 &
DEV_PID=$!
echo $DEV_PID > "$PID_DIR/${PRD_NAME}.pid"

echo "[ralph:$PRD_NAME] Started dev server (PID: $DEV_PID)"
echo "[ralph:$PRD_NAME] Logs at: $LOG_DIR/${PRD_NAME}.log"

# Give it a moment to spawn child processes
sleep 2

echo "[ralph:$PRD_NAME] Dev servers starting in background..."
