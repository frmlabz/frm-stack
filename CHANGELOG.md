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

### 2026-02-20 — a5ea6da — docs: add harness guide and ralph documentation

- Summary:
  - Add `docs/harness.md` — agent harness guide covering skills, subagents, hooks, OMNI.md, model routing, and prompting best practices.
  - Add `docs/ralph.md` — port offset model, Ralph scripts reference, and usage examples.
- Why:
  - Provide reference documentation for writing harness components and using the port isolation / Ralph system.
- LLM Notes:
  - Key files: `docs/harness.md`, `docs/ralph.md`.
  - `harness.md` is a generic guide (not project-specific). `ralph.md` has this repo's base port table.
- Impact:
  - None.

### 2026-02-20 — 63af5cd — feat: add Ralph scripts and port infrastructure

- Summary:
  - Add `generate-ports.sh`, `with-ports.sh`, and `teardown.sh` for port offset management.
  - Add Ralph orchestration scripts (`setup.sh`, `start.sh`, `health-check.sh`, `teardown.sh`).
  - Update `compose.yml` to use `$PG_PORT` and `justfile` to use `$PG_PORT` in all Atlas/psql commands.
  - Add `.env.ports` to `.gitignore`.
- Why:
  - Enable running multiple copies of the stack in parallel via port offsets, and provide Ralph scripts for automated environment lifecycle.
- LLM Notes:
  - Key files: `scripts/generate-ports.sh`, `scripts/with-ports.sh`, `scripts/ralph/*`, `compose.yml`, `justfile`.
  - Base ports: PG=5432, API=8080, WEB=4000, LANDING=4321. Offsets computed from branch name hash.
  - `.env` provides default `PG_PORT=5432` for direct `just` usage; `with-ports.sh` overrides from `.env.ports`.
- Impact:
  - Minor. `compose.yml` and `justfile` now require `PG_PORT` env var (provided by `.env` default).

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
