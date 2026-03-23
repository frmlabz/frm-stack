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

### 2026-03-23 — ed517ad — fix: add COMPOSE_PROJECT_NAME to prevent Docker network collisions

- Summary:
  - Emit `COMPOSE_PROJECT_NAME=template_<branch>` in `generate-ports.sh` so each worktree/branch gets a unique Docker Compose project name and network (`template_<branch>_default`).
- Why:
  - Different projects sharing the same branch name (e.g. `main`) produced identical `<branch>_default` networks, causing Docker network collisions.
- LLM Notes:
  - Key files: `scripts/generate-ports.sh`.
  - `with-ports.sh` sources `.env.ports` into the shell before `exec`, so `COMPOSE_PROJECT_NAME` is automatically available to Docker Compose without any compose.yml changes.
- Impact:
  - Minor. Existing worktrees should regenerate `.env.ports` via `scripts/generate-ports.sh`.

### 2026-02-20 — 4860c1f — fix: changelog pre-push hook failing with multiple commits

- Summary:
  - Fix `scripts/check-changelog.sh` — `git diff-tree` with multiple SHAs treated extras as path filters, producing empty output.
  - Replace single-pipeline `xargs` approach with a per-commit for-loop.
- Why:
  - The hook silently passed pushes without changelog entries, defeating its purpose.
- LLM Notes:
  - Key files: `scripts/check-changelog.sh`.
  - `git diff-tree -r sha1 sha2 sha3` interprets `sha2 sha3` as path filters, not additional commits.
- Impact:
  - None.

### 2026-02-20 — fca0cf6 — fix: derive ports and URLs from .env.ports instead of hardcoding

- Summary:
  - Remove hardcoded ports and URLs from all `.env.example` files — apps now compute them from port env vars at startup.
  - Update `config.ts` (API), `vite.config.ts` (Web), and `astro.config.mjs` (Landing) to resolve ports from `API_PORT`, `WEB_PORT`, `LANDING_PORT` env vars with sensible defaults.
  - Add `globalPassThroughEnv` to `turbo.json` so port vars reach child processes.
  - Update `justfile` to auto-generate `.env.ports` and export port vars via backtick expressions.
  - Wrap `pnpm dev` with `with-ports.sh` so ports propagate through turbo to all apps.
  - Add `strictPort: true` to Vite and Astro configs — prevents silent port bumping that breaks CORS.
  - Fix `with-ports.sh` to auto-generate `.env.ports` if missing.
  - Fix `db_isready.sh` to use `docker compose exec` instead of fragile container name lookup.
- Why:
  - Previous commit added port infrastructure but apps still had hardcoded ports in `.env` files, defeating port isolation. Now `.env.ports` is the single source of truth.
- LLM Notes:
  - Key files: `apps/backend/api/src/config.ts`, `apps/frontend/web/vite.config.ts`, `apps/frontend/landing/astro.config.mjs`, `turbo.json`, `justfile`, `package.json`, `scripts/with-ports.sh`, `scripts/db_isready.sh`.
  - Port resolution order: env var (from `.env.ports` via `with-ports.sh` or justfile) > `.env` file > built-in default.
  - Expo mobile is an exception: `EXPO_PUBLIC_API_URL` is baked at build time and must stay in `.env`.
  - `turbo.json` `globalPassThroughEnv` is critical — without it, turbo strips env vars from child processes.
  - `strictPort: true` is critical — without it, Vite/Astro silently pick another port, causing CORS mismatches with the API.
- Impact:
  - Minor. `.env.example` files changed; downstream projects should regenerate `.env` from examples and run `scripts/generate-ports.sh`.

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
