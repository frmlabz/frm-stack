#!/usr/bin/env bash
#
# Ralph teardown script - cleanup after testing

set -e

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
PID_FILE="$PID_DIR/${PRD_NAME}.pid"
LOG_FILE="$LOG_DIR/${PRD_NAME}.log"

cd "$ROOT_DIR"

echo "[ralph:$PRD_NAME] Starting teardown..."

# Load ports (generate if not exists)
if [[ ! -f "$ROOT_DIR/.env.worktree" ]]; then
  "$ROOT_DIR/scripts/generate-worktree-env.sh" --name "$PRD_NAME"
fi
set -a
source "$ROOT_DIR/.env.worktree"
set +a

# Kill dev server and all child processes
if [ -f "$PID_FILE" ]; then
    DEV_PID=$(cat "$PID_FILE")
    echo "[ralph:$PRD_NAME] Stopping dev server (PID: $DEV_PID)..."

    # Kill the process group to get all child processes
    pkill -P $DEV_PID 2>/dev/null || true
    kill $DEV_PID 2>/dev/null || true

    # Wait a moment for graceful shutdown
    sleep 2

    # Force kill if still running
    kill -9 $DEV_PID 2>/dev/null || true
    pkill -9 -P $DEV_PID 2>/dev/null || true

    rm -f "$PID_FILE"
    echo "[ralph:$PRD_NAME] Stopped dev server"
fi

# Kill any remaining processes on our ports
fuser -k "$API_PORT/tcp" 2>/dev/null || true
fuser -k "$WEB_PORT/tcp" 2>/dev/null || true
fuser -k "$LANDING_PORT/tcp" 2>/dev/null || true

# Stop docker containers
if docker compose ps -q 2>/dev/null | grep -q .; then
    echo "[ralph:$PRD_NAME] Stopping docker containers..."
    docker compose down --remove-orphans
fi

# Clean up log file
if [ -f "$LOG_FILE" ]; then
    rm -f "$LOG_FILE"
fi

echo "[ralph:$PRD_NAME] Teardown complete!"
