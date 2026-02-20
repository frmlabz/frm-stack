#!/usr/bin/env bash
#
# Ralph setup script - runs before testing
# Resets database and seeds test data

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

cd "$ROOT_DIR"

echo "[ralph:$PRD_NAME] Running setup..."

# Generate ports for this PRD
"$ROOT_DIR/scripts/generate-ports.sh" --name "$PRD_NAME"

"$ROOT_DIR/scripts/with-ports.sh" just setup

echo "[ralph:$PRD_NAME] Setup complete"
