# LeadFlow Implementation Plan

## Scope Decision (Explicit)
Prototype target is:
- Channels: WhatsApp, Instagram, Voice Calls
- Next channel after prototype hardening: Email

This intentionally differs from `docs/product.md` MVP wording (which includes Email). Track this as an ADR before execution.

## Product Coverage Map (Required)

| Product Feature | Prototype Plan Status | Phase |
|---|---|---|
| Dashboard (metrics, action items, charts) | Included | 6 |
| Unified Inbox (omnichannel) | Included | 5 |
| Contact/CRM Lite (list, bulk, saved views, deal-lite) | Included | 3A + 5 |
| Contact custom fields | Included | 3A |
| AI Agent Builder (all key tabs incl. Call Handling + Testing/Preview) | Included | 4 + 6 |
| Knowledge Base manager + Website crawler | Included | 4 + 6 |
| Workflow templates (not full visual builder) | Included | 3C |
| Call Center UI (active calls, history, phone numbers) | Included | 5 |
| Granular notification config per team member | Included | 5 |
| WhatsApp template management + approval state | Included | 2 + 5 |
| Call recording ingestion + playback | Included | 2 + 5 |
| Cost ledger + monthly breakdown export | Included | 3A + 6 |
| Analytics & Reports (conversation, lead, agent, call) | Included | 6 |
| Billing plans/included volumes/overage counters | Included (prototype billing core) | 3A + 6 |
| Google Calendar + Webhooks/API keys | Deferred, but extension points required | ADR + 6 |

## Technology Baseline (Ironclad)
These are fixed for this implementation unless changed by ADR.

| Area | Options Considered | Selected |
|---|---|---|
| Backend runtime/framework | Node.js + TS + Hono, Fastify, NestJS | **Node.js + TypeScript + Hono** |
| API transport | oRPC/NoRPC, REST-only | **oRPC/NoRPC (type-safe HTTP)** |
| Frontend app | React + Vite, Next.js, Remix | **React + Vite** |
| UI system | Base-cn + Tailwind, shadcn/ui, MUI | **Base-cn + Tailwind (default primitives)** |
| DB | PostgreSQL, MySQL, MongoDB | **PostgreSQL** |
| Vector store | pgvector, external vector DB | **pgvector (Postgres-native)** |
| Vector scale path | pgvector only, pgvector + pgvectorscale | **pgvector now, pgvectorscale when benchmark threshold is hit** |
| Query layer | Kysely, Drizzle, Prisma | **Kysely** |
| Object storage | Cloudflare R2, S3, MinIO | **Cloudflare R2** |
| Full-text/search | Postgres FTS, OpenSearch, Meilisearch | **Postgres FTS + trigram** |
| Authentication | Better Auth, Auth0, Clerk, custom auth | **Better Auth** |
| AI model integration | single provider hardcoded, provider abstraction | **Provider-abstracted AI interface** |
| Embeddings integration | single provider hardcoded, provider abstraction | **Provider-abstracted embeddings interface** |
| Observability | OTel + hosted vendor, OTel + self-hosted | **OpenTelemetry + self-hosted observability stack** |
| Product analytics | none, PostHog | **PostHog (landing now, product events as needed)** |
| Monorepo/tooling | pnpm + Turborepo, Nx | **pnpm + Turborepo** |
| CI | GitHub Actions, GitLab CI | **GitHub Actions** |
| Infrastructure | managed cloud PaaS, self-hosted Kubernetes | **Kubernetes on Hetzner-hosted servers** |
| Billing in prototype | full payment integration, invoice-first | **Invoice-first (manual billing), payment provider later** |

## Finalized Infra Decisions
These are locked for the prototype and cannot change without ADR.

### Jobs/Queues
- Chosen: **Postgres queue** (`pg-boss`), no Redis/Valkey dependency in prototype.
- Alternative considered: Valkey + BullMQ.

### Internal Event Fanout
- Chosen: **Postgres outbox + Postgres LISTEN/NOTIFY** for prototype.
- Alternative considered: Kafka fanout.
- Scale trigger: move to Kafka only when throughput/backlog SLOs are breached.

### Realtime Transport
- Chosen: **SSE-first realtime** for prototype inbox/alerts.
- Alternative considered: typed WebSockets from day one.
- Rule: WebSocket transport can be added behind the same realtime interface after prototype.

## Non-Negotiable Engineering Rules
1. Bounded contexts only; no direct cross-context table access.
2. External I/O and AI calls are queue-driven, idempotent, replay-safe.
3. Every billable/costly action writes immutable `usage_ledger` rows.
4. Tenant isolation enforced in API auth and DB RLS.
5. Logs + metrics + traces required from Phase 1.
6. Event contracts and HTTP APIs are versioned.
7. CI gates are mandatory; failing gate blocks merge.

## Architecture Boundaries

### Core Services
- Channel Gateway (WhatsApp, Instagram, Voice; Email-ready contract)
- Conversation Core (identity resolution, merge/split, state machine)
- CRM Service (contacts, custom fields, lead stages, saved views)
- AI Orchestrator (intent/reply/escalation)
- Knowledge Service (docs/Q&A/crawler/indexes)
- Workflow Runtime (template-based triggers/actions)
- Metering & Billing Core (usage ledger, entitlements, overages)
- Cost Reconciliation Service (estimated vs reconciled provider costs)
- Config & Policy Service (hours, routing, team settings, notification preferences)
- Realtime & Notification Service (SSE fanout, push/email, WebSocket-ready interface)
- Reporting Read Models (dashboard + analytics materializations)

### Required Adapter Contract (All Channels)
- `receiveWebhook(payload): NormalizedEvent[]`
- `sendMessage(command): ProviderMessageId`
- `getDeliveryStatus(providerMessageId): DeliveryStatus`
- `validateTenantConfig(config): ValidationResult`
- `estimateCost(event): CostEstimate`

## Phase Plan

## Phase 0: Foundation + Design Track (Week 1)
### Deliverables
- Monorepo scaffold by bounded context.
- ADR set:
  - tenancy + RLS
  - eventing/outbox
  - queue/idempotency (`pg-boss`)
  - API versioning
  - observability (OpenTelemetry)
  - encryption key model
  - vector strategy (pgvector/chunking)
  - frontend stack decision (React + Vite + UI architecture)
  - deployment target
  - prototype scope (Email deferral)
- CI baseline: lint, typecheck, tests, migration validation.
- Provider replay harness for WhatsApp/Instagram/Telnyx webhooks.
- UI design foundations started now (information architecture + core wireframes for Inbox, Dashboard, Call Center, Agent Builder).

### Exit Gate
- Contract package consumed by backend + frontend.
- Wireframes approved for all MVP UI surfaces.

## Phase 1: Platform Core (Weeks 2-3)
### Deliverables
- Auth + RBAC (Owner/Admin/Agent/Viewer).
- Postgres schema + RLS + migration framework.
- Postgres outbox/inbox processing + `pg-boss` workers.
- Object storage integration for docs/recordings.
- SSE service with tenant auth + LISTEN/NOTIFY fanout.
- Rate limiting (per tenant, endpoint).
- Trace/log/metric correlation (`tenant_id`, `trace_id`, `event_id`).
- Config service with business hours + Serbian holiday seed.
- Team management primitives: availability, working hours, notification preferences.

### Exit Gate
- Tenant isolation tests pass (API + DB).
- Multi-instance realtime fanout validated over LISTEN/NOTIFY + SSE.

## Phase 2: Channel Integrations + Telephony Media (Weeks 3-5)
### Deliverables
- WhatsApp adapter including template catalog sync and approval status tracking.
- Instagram adapter.
- Telnyx voice adapter (incoming/missed/ended/forward chain events).
- Call recording ingestion pipeline (provider callback -> object storage metadata -> secure playback token).
- Canonical event normalization and adapter conformance tests.
- DLQ + replay tooling + channel health metrics.

### Exit Gate
- Duplicate webhooks do not duplicate domain effects.
- Recording is stored, indexed, and playable in signed URL flow.

## Phase 3A: Conversation Core + CRM + Ledger + Billing Core (Weeks 5-6)
### Deliverables
- Contact identity schema: `contact`, `channel_identity`, merge/split audit.
- Contact custom fields schema + APIs.
- CRM Lite backend:
  - list/filter/search
  - bulk actions
  - saved views
  - lead stage + deal-lite fields
- Conversation state machine and omnichannel timeline.
- `usage_ledger` append-only ingest.
- Plan/entitlement model:
  - pricing tiers
  - included volumes
  - overage counters
- Price-card versioning and monthly breakdown export API/CSV.

### Exit Gate
- Monthly rollups rebuild from raw ledger with no drift.
- AI and channel events can be cost-attributed to conversation and tenant.

## Phase 3B: AI + KB Core (Weeks 6-7)
### Deliverables
- KB document ingestion: parse/chunk/embed/index.
- Manual Q&A retrieval integration.
- Single AI agent runtime: intent, grounded reply, escalation.
- AI writes usage/cost events to ledger (explicit dependency on 3A).
- Audit trail for decisions and source evidence.

### Exit Gate
- Low-confidence or ungrounded response always escalates.
- Retrieval quality/latency metrics published.

## Phase 3C: Workflow Templates (Week 7)
### Scope Clarification
Template runtime only (parameterized pre-built flows). No generic visual builder in prototype.

### Deliverables
- Deterministic trigger-action executor + execution logs.
- Prebuilt templates:
  - missed call recovery
  - Instagram lead capture
  - after-hours auto-reply
  - VIP route

### Exit Gate
- All template flows pass replay-based e2e tests.

## Phase 4: AI/KB Advanced Features (Week 8)
### Deliverables
- AI Agent Builder backend support for:
  - call-handling policy (routing chain, hours behavior, IVR config model)
  - testing/preview data model (simulator sessions, response grading events)
- Website crawler service:
  - crawl jobs
  - include/exclude rules
  - recrawl scheduling
- Integration extension points:
  - webhook registry and API key issuance
  - appointment provider interface (Google Calendar adapter deferred)

### Exit Gate
- Crawler outputs indexed KB artifacts.
- Agent testing sessions are stored and auditable.

## Phase 5: Operations UI A (Weeks 8-10)
### Deliverables
- Unified Inbox (three-column).
- Contact profile + CRM list view with bulk actions and saved views.
- Channel settings UIs:
  - WhatsApp templates + approval state
  - Instagram routing/handoff
  - Voice routing/number behavior
- Call Center UI:
  - active calls panel
  - call history list
  - recording playback in thread/history
  - phone numbers management
- Team management UI:
  - availability status
  - working hours
  - per-member notification preferences

### Exit Gate
- Agent can manage all prototype channels with no external admin console dependency.

## Phase 6: Operations UI B + Analytics + Billing Views (Weeks 10-11)
### Deliverables
- Dashboard home:
  - key metric cards
  - attention/action list
  - channel mix, volume trend, busiest hours charts
- Analytics sections:
  - conversation analytics
  - lead analytics
  - agent performance
  - call analytics
- AI Agent Builder UI tabs:
  - identity/personality
  - knowledge base
  - behavior rules
  - call handling
  - testing/preview
- Knowledge Base manager UI:
  - doc library
  - Q&A editor
  - crawler management
- Billing/cost UI:
  - plan usage vs included limits
  - overage counters
  - monthly export and invoice-line preview

### Exit Gate
- Dashboard and analytics views reconcile with read models and ledger sources.
- Monthly export usable for customer billing and finance review.

## Phase 7: Hardening + Release Readiness (Weeks 11-12)
### Deliverables
- SLOs/alerting for queue lag, webhook failures, provider/API errors.
- Load + soak tests across omnichannel traffic.
- DR runbook + restore drill.
- Security validation (retention controls, key handling, access audits).

### Exit Gate
- SLO targets met under target load.
- Restore drill passes recovery objectives.

## Phase 8: Email Channel Add-On (Weeks 13-14)
### Deliverables
- `EmailAdapter` (Gmail first, IMAP/SMTP second).
- Email config UI + inbox integration.
- Email usage and cost units integrated into ledger/billing views.

### Exit Gate
- Email added with no Conversation Core refactor.

## API/Event Freeze Gates
- Freeze canonical event schema before end of Phase 2.
- Freeze conversation/CRM/cost APIs at end of Phase 3A for UI work.
- Contract-breaking change requires ADR + migration plan.

## Quality Gates
- Branch protection, no direct push to `main`.
- Architecture changes require ADR and reviewer approval policy.
- Minimum tests:
  - unit (domain logic)
  - adapter contract tests
  - integration (`event -> workflow -> ledger`)
  - e2e (inbox triage, missed-call recovery, billing export)
- Static controls:
  - TS strict mode
  - no implicit `any`
  - forbidden cross-context imports

## Cost, Metering, and Billing Blueprint
Every ledger row includes:
- `tenant_id`, `workspace_id`, `timestamp_utc`, `billing_month`
- `channel`, `feature_module`, `provider`
- `usage_unit`, `usage_quantity`, `unit_cost`, `total_cost`, `currency`
- `source_event_id`, `trace_id`, `status` (`estimated|reconciled`)

Prototype-required outputs:
- Tenant P&L by month.
- Cost breakdown by channel/provider/feature.
- Included-vs-used counters by plan.
- Overage line items.
- Monthly breakdown export (CSV + API).

## Risks and Controls
- Provider API drift.
  - Control: adapter isolation + replay harness + contract tests.
- Identity merge mistakes.
  - Control: conservative auto-linking + manual merge workflow + audit trail.
- AI hallucinations.
  - Control: grounded-response policy + hard escalation threshold.
- Billing disputes.
  - Control: immutable ledger, reconciled status, exportable line-item trace.

## Prototype Done Criteria
1. WhatsApp, Instagram, and Voice operate in one inbox.
2. Rule templates recover missed leads automatically.
3. Call recordings are ingestible and playable in product UI.
4. Dashboard + analytics + call center views are operational.
5. AI agent is configurable (including call handling + testing/preview).
6. Metering, overage counters, and monthly export are auditable.

## Immediate Next Steps
1. Approve ADR for scope and deferrals.
2. Create ADR set and contract package in Phase 0.
3. Build replay harness + ledger schema before live provider rollout.
4. Start UI design artifacts in parallel with Platform Phase 1.
