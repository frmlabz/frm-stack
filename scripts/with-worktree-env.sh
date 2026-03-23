#!/usr/bin/env bash
# Load .env.worktree and run a command
# Usage: with-worktree-env.sh <command...>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <command...>" >&2
  exit 2
fi

# Auto-generate .env.worktree if missing
if [[ ! -f "$REPO_ROOT/.env.worktree" ]]; then
  "$REPO_ROOT/scripts/generate-worktree-env.sh" >/dev/null 2>&1 || true
fi

# Source .env first, then .env.worktree (worktree env overrides base)
set -a
if [[ -f "$REPO_ROOT/.env" ]]; then
  source "$REPO_ROOT/.env"
fi
if [[ -f "$REPO_ROOT/.env.worktree" ]]; then
  source "$REPO_ROOT/.env.worktree"
fi
set +a

exec "$@"
