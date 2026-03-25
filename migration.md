---
description: Reference summary of the TypeScript 6, #/* subpath import, and Node runtime migration from ts-v6 for reuse in another project.
---

# Migration Reference

This document summarizes the last 3 commits in this repository so another project can repeat the same migration cleanly.

## Source Repository

- Repo path: `/home/nikola/files/work/frmlabz/ekomerc/ts-v6`
- User shorthand: `~/files/work/frmlabz/ekomerc/ts-v6`

## Relevant Commits

All 3 commits were made on March 25, 2026:

1. `3ef0cf50` `feat: migrate monorepo to TypeScript 6`
2. `397039c0` `feat: move to #/ subpath imports`
3. `5a3c8602` `feat: node version update`

These were stacked changes, not unrelated cleanup. The sequence was:

1. Upgrade TypeScript and simplify config.
2. Rename subpath imports from `#*` to `#/*`.
3. Pin Node and pnpm versions consistently across local dev, CI, and Docker.

## 1. TypeScript 6 Migration

### What changed

- Workspace TypeScript moved from `^5.9.2` to `6.0.2` in `pnpm-workspace.yaml`.
- Shared tsconfig presets were simplified in `packages/shared/config/`.
- `lib` baselines moved from `ES2023` to `ES2025`.
- Old `baseUrl` usage was removed where still present.
- Packages that run `tsc` directly were given local `devDependencies` entries for `typescript: "catalog:"`.

### Important config changes

The shared base config stopped explicitly setting several old baseline options:

- `target`
- `module`
- `lib`
- `strict`
- `esModuleInterop`

The project kept only the settings it still considered project-specific, such as:

- `moduleDetection: "force"`
- `allowImportingTsExtensions: true`
- `isolatedModules: true`
- `verbatimModuleSyntax: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`

Node-oriented configs now use:

```json
{
  "module": "NodeNext",
  "moduleResolution": "NodeNext",
  "lib": ["ES2025"],
  "rewriteRelativeImportExtensions": true,
  "types": ["node"]
}
```

React app configs now use:

```json
{
  "lib": ["ES2025", "DOM"],
  "jsx": "react-jsx"
}
```

React node/tooling configs now use:

```json
{
  "lib": ["ES2025"],
  "types": ["node"]
}
```

### Why this mattered

- TypeScript 6 deprecates the old `baseUrl`-centric alias style used in many repos.
- The migration reduced redundant compiler options and made shared presets smaller.
- It established a single workspace compiler version instead of letting packages drift.
- It prepared the repo for the next alias migration by making `paths` explicitly relative.

### Practical guidance for another project

If another project has a shared config layer, do this first:

1. Upgrade the workspace TypeScript version.
2. Normalize shared tsconfig presets.
3. Remove `baseUrl` if aliases can be expressed with explicit relative `paths`.
4. Add local `typescript` dev dependencies for packages that run `tsc` from package-local scripts.

## 2. `#*` to `#/*` Subpath Import Migration

This was the large mechanical rename commit. It touched hundreds of files, but it was mostly a systematic resolution change, not a behavior change.

### What changed

Source imports changed from:

```ts
import { createApp } from "#app";
import "#main.css";
```

to:

```ts
import { createApp } from "#/app";
import "#/main.css";
```

Tsconfig path mappings changed from:

```json
{
  "compilerOptions": {
    "paths": {
      "#*": ["./src/*"]
    }
  }
}
```

to:

```json
{
  "compilerOptions": {
    "paths": {
      "#/*": ["./src/*"]
    }
  }
}
```

`package.json#imports` changed from `"#*"` to `"#/*"`.

Backend and shared packages use:

```json
{
  "imports": {
    "#/*": "./src/*.ts"
  }
}
```

Frontend packages that contain both `.ts` and `.tsx` use:

```json
{
  "imports": {
    "#/*": ["./src/*", "./src/*.ts", "./src/*.tsx"]
  }
}
```

Vitest alias resolution was updated to match `#/...` only. The shared resolver logic changed from “anything starting with `#`” to “only imports starting with `#/`”.

Biome rules, project instructions, and docs were all updated to use `#/*` consistently.

### Why this mattered

- `#/*` is more explicit and path-like than `#*`.
- It aligns better with Node `package.json#imports` patterns.
- It makes resolver code less ambiguous.
- It gives one consistent alias style across backend, frontend, tests, docs, and lint rules.

### Important rule

Alias imports stay extensionless at the import site:

```ts
import { logger } from "#/log";
```

Not:

```ts
import { logger } from "#/log.ts";
```

The extension belongs in the `imports` target, not in the import statement. If both places include `.ts`, resolution can become `policy.ts.ts`.

### Runtime vs type resolution

This project relies on two different mechanisms:

- `package.json#imports` handles runtime resolution.
- `tsconfig.paths` handles TypeScript/editor resolution.

Both must be updated together.

### Practical guidance for another project

If you repeat this elsewhere, update all of these in one pass:

1. Source imports.
2. `tsconfig` `paths`.
3. `package.json#imports`.
4. Test resolver aliases.
5. Lint rules.
6. Internal docs and team conventions.

If only some layers change, the common failure modes are:

- editor resolves imports but runtime fails
- runtime works but tests fail
- some packages still accept old aliases and others do not

## 3. Node Runtime Update

This commit pinned the runtime more aggressively after the TS and alias migrations were complete.

### What changed

- Added `.nvmrc` with `24.14.0`.
- Fixed root `package.json` from `engine` to `engines`.
- Set the root engine range to `>=24.14.0 <25`.
- GitHub Actions changed from `node-version: 24` to `node-version: 24.14.0`.
- GitHub Actions also pinned `pnpm/action-setup` to `10.32.1`.
- Dockerfiles moved from floating `node:24-*` images to `node:24.14.0-*`.
- Docker `corepack prepare pnpm@...` was aligned to `10.32.1`.
- `devbox.json` stopped using floating `nodejs@latest` and `pnpm@latest` and pinned both.
- `devbox.lock` was regenerated.

### Why this mattered

- Patch-level Node drift between local, CI, and containers is a common source of subtle failures after toolchain changes.
- Pinning pnpm matters as much as pinning Node in a workspace monorepo.
- This commit turned the repo from “Node 24-ish” into “specifically Node 24.14.0 and pnpm 10.32.1 everywhere”.

### Notes about source changes

The only non-config source diffs in this commit were formatting-only changes. There was no intended application behavior change in this step.

## Migration Order To Reuse Elsewhere

Use this order in another project:

1. Upgrade TypeScript and simplify shared tsconfig presets.
2. Remove `baseUrl` and move aliases to explicit relative `paths`.
3. Rename `#*` imports to `#/*`.
4. Update `package.json#imports` and test resolvers at the same time.
5. Pin Node and pnpm in root config, dev shell, CI, and Docker.
6. Update docs and lint rules so the new setup is enforced.

## Minimal Checklist

- Upgrade workspace TypeScript version.
- Regenerate lockfile.
- Simplify shared tsconfigs.
- Remove `baseUrl`.
- Change `paths` from `#*` to `#/*`.
- Change `imports` from `#*` to `#/*`.
- Rewrite source imports from `#foo` to `#/foo`.
- Update Vitest or Jest alias handling.
- Update lint messages and restricted import rules.
- Add or update `.nvmrc`.
- Pin Node in CI.
- Pin Node base images in Dockerfiles.
- Pin pnpm version in CI and `corepack`.

## Key Gotchas

- Backend `NodeNext` packages still require explicit `.ts` on relative imports.
- Frontend packages can stay extensionless for relative imports, but in aliased source trees this repo bans relative imports entirely and requires `#/*`.
- `tsconfig.paths` does not replace `package.json#imports`; both are needed.
- Do not add `.ts` or `.tsx` to `#/*` import statements.
- Do not leave Node or pnpm floating after a compiler migration.

## Reference Files In This Repo

- `docs/package-setup-tsconfig.md`
- `packages/shared/config/tsconfig.base.json`
- `packages/shared/config/tsconfig.node.json`
- `packages/shared/config/tsconfig.react.app.json`
- `packages/shared/config/tsconfig.react.node.json`
- `package.json`
- `.nvmrc`
- `biome.json`

## Verification Note

This document is based on the actual diffs of the 3 commits listed above. It is a migration summary/reference, not a claim that the full repository was re-tested as part of writing this document.
