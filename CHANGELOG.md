# Changelog

All template changes must be logged here. See `capabilities/general/skills/template-changelog` for the rules and entry format.

## Template

### YYYY-MM-DD — <prev-ref> — <commit-subject>

- Summary:
  - ...
- Why:
  - ...
- LLM Notes:
  - To apply elsewhere: see <path>
  - Key files: ...
- Impact:
  - None | Minor | Breaking (include steps)

## Entries

### 2026-02-20 — 9440f17 — feat: add worktree port isolation and merge safety

- Summary:
  - Add `generate_ports()` to worktree setup for automatic per-worktree port generation.
  - Update cleanup script to require worktree path and refuse to clean main/master.
  - Add `check-merge-allowed.sh` pre-merge guard and update `wt.toml` hooks.
  - Update worktree docs to reflect port isolation and new scripts.
- Why:
  - Worktrees previously shared ports, preventing simultaneous service execution across branches.
- LLM Notes:
  - Key files: `scripts/worktree/setup.sh`, `scripts/worktree/cleanup.sh`, `scripts/worktree/check-merge-allowed.sh`, `.config/wt.toml`, `docs/worktree.md`.
- Impact:
  - Minor. Cleanup script now requires a second `<worktree-path>` argument.

### 2026-01-24 — 03f6b5d — feat: add expo capabilities
- Summary:
  - Add Expo capabilities and a grouped `expo` capability set to the default OmniDev profile.
  - Register Expo capability sources and regenerate the Omni lockfile.
- Why:
  - Include common Expo design, deployment, and upgrade workflows in the template defaults.
- LLM Notes:
  - To apply elsewhere: update `omni.toml`, then run OmniDev to regenerate `omni.lock.toml`.
  - Key files: `omni.toml`, `omni.lock.toml`.
- Impact:
  - Minor.

### 2026-01-23 — feat: add omnidev

- Summary:
  - Add OmniDev config and capability layout for frontend/backend/general.
  - Move existing skills into OmniDev capabilities and ignore provider-generated files.
  - Add commitlint with a Husky commit-msg hook for conventional commits.
  - Document OmniDev in the README.
- Why:
  - Standardize AI capability management and enforce consistent commit messages.
- LLM Notes:
  - OmniDev config lives in `OMNI.md`, `omni.toml`, and `capabilities/*`.
  - Commitlint is configured in `commitlint.config.cjs` and `.husky/commit-msg`.
  - README section is under “OmniDev”.
- Impact:
  - None.

### 2026-01-23 — cd06485

- Summary:
  - Add CHANGELOG.md with required entry format.
  - Add pre-push enforcement for changelog updates.
  - Add a template-changelog skill for LLM guidance.
- Why:
  - Track template changes with dates, commits, rationale, and downstream update notes.
- LLM Notes:
  - Entry format is in this file and `capabilities/general/skills/template-changelog`.
  - Hook logic lives in `.husky/pre-push` and `scripts/check-changelog.sh`.
- Impact:
  - None.
