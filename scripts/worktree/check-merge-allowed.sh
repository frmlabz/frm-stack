#!/usr/bin/env bash
# Pre-merge safety check
# Prevents merging from main/master branch (nothing to merge into)

set -euo pipefail

RED='\033[0;31m'
NC='\033[0m'

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"

if [[ "$BRANCH" == "main" ]] || [[ "$BRANCH" == "master" ]]; then
    echo -e "${RED}[ERROR]${NC} Cannot merge from $BRANCH branch - nothing to merge into" >&2
    echo -e "${RED}[ERROR]${NC} Switch to a feature branch first" >&2
    exit 1
fi

exit 0
