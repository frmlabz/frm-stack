#!/usr/bin/env bash
#
# Ralph health check script - verifies services are ready
# Exit 0 when ready, non-zero otherwise

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

# Load ports (generate if not exists)
if [[ ! -f "$ROOT_DIR/.env.ports" ]]; then
  "$ROOT_DIR/scripts/generate-ports.sh" --name "$PRD_NAME"
fi
set -a
source "$ROOT_DIR/.env.ports"
set +a

errors=()

# Check Postgres
if ! docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    errors+=("Postgres: not ready")
fi

# Check Backend API
if ! curl -sf "http://localhost:$API_PORT/health" > /dev/null 2>&1; then
    errors+=("Backend API (http://localhost:$API_PORT/health): not responding")
fi

if [ ${#errors[@]} -gt 0 ]; then
    echo "Health check failed:"
    for err in "${errors[@]}"; do
        echo "  - $err"
    done
    exit 1
fi

exit 0
