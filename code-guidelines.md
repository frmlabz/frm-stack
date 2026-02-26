# Code guidelines (template)

This repo is a **demo**. Patterns here are suggestions to keep the example coherent; you should choose what fits your team.

## Dependency injection (prefer it)

- Prefer **constructor/function injection** for anything with side effects (DB, logger, auth, clock, external clients).
- Keep “wiring” at the edges (app startup / router factories). Avoid importing global singletons from deep inside services.
- Tests should be able to supply **fakes** or **in-memory** implementations without patching globals.

## Logging

- Use **structured logging** (pino): `logger.info("message", { ...context })`.
- Log at boundaries (request → router → service), not inside hot loops.
- Never log secrets (tokens, passwords, raw cookies). Be careful with request/body logging.

## Errors (proper handling + custom errors)

- Treat errors as part of the API: model **expected failures** with **custom errors** (e.g. `NotFoundError`, `UnauthorizedError`) rather than opaque `Error`.
- Prefer explicit flows (e.g. `neverthrow` `Result`) over throwing for control flow.
- When catching unknown values, normalize them (e.g. `typedError(...)`) before returning/logging.
- Map internal errors to transport errors (HTTP/oRPC) intentionally; don’t leak internals to clients.

## Documentation writing

- Keep docs **short and actionable**: what/why/where + copy/paste commands.
- When changing workflows (dev, DB, testing, CI), update `README.md` and the relevant `docs/*.md`.
- Prefer linking to concrete files/paths over vague descriptions.

## Testing

- Prefer unit/service tests that use DI (real DB when valuable; fakes when faster/clearer).
- If a test can fail due to timing, randomness, or shared state, fix the design or make the test deterministic.
- This repo’s shared testcontainers Postgres singleton is an **experiment**; we’ll keep evaluating whether it’s the right default.

## LLM usage (be deliberate)

LLMs are fine, but treat their output as **untrusted input**:
- Verify correctness and security; run `pnpm typecheck` and `pnpm test`.
- Don’t accept generated code that you don’t understand or can’t validate.
- Watch for subtle issues (validation gaps, error handling, logging secrets, SQL mistakes, license/provenance).

