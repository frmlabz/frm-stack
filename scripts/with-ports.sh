#!/usr/bin/env bash
# Load .env.ports and run a command
# Usage: with-ports.sh <command...>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <command...>" >&2
  exit 2
fi

# Auto-generate .env.ports if missing
if [[ ! -f "$REPO_ROOT/.env.ports" ]]; then
  "$REPO_ROOT/scripts/generate-ports.sh" >/dev/null 2>&1 || true
fi

# Source .env first, then .env.ports (ports override base)
set -a
if [[ -f "$REPO_ROOT/.env" ]]; then
  source "$REPO_ROOT/.env"
fi
if [[ -f "$REPO_ROOT/.env.ports" ]]; then
  source "$REPO_ROOT/.env.ports"
fi
set +a

exec "$@"
