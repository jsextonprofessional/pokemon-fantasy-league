You are planning a single scoped story. Produce a minimal, executable plan in one pass.

Write the plan to `.github/story-runs/<run-id>/plan.md` and output it.

Output exactly these sections:

## Objective

One sentence restatement. List explicit non-goals.

## File Impact Map

| File | Workspace (api / web / mcp / shared / config / root) | Action (create/modify) | Reason (one line) |
| ---- | ---------------------------------------------------- | ---------------------- | ----------------- |

Only include files the story requires. If a file is not touched, omit it.

## Schema & Data Changes

- Prisma model/field changes in `apps/api/prisma/schema.prisma` (if none, write "none")
- Migration name and backward-compatibility notes
- Seed changes (`pnpm db:seed` must stay idempotent)
- Ledger impact: confirm no update/delete of `LedgerEntry` rows and no direct budget edits

## Shared Contract Changes

- zod schemas and types added or changed in `packages/shared` (if none, write "none")
- Every consumer of a changed schema (api / web / mcp) and how it is updated

## API & Contract Changes

- NestJS module(s), controller(s), and service(s) touched; confirm one module per bounded context
- Routes under `/v1`: method, path, request/response shape, status codes
- problem+json error `code` values introduced
- Idempotency-Key, quote `version` (409), and pagination handling where relevant
- Auth/guard implications and audit logging (`actorType` USER / AGENT)
- Swagger decorators updated

## MCP Tool Changes

- Tools added or changed in `apps/mcp` (if none, write "none")
- Tier for each: read / draft-write / gated
- API endpoint each tool calls; confirm no business logic in the MCP layer
- Tool description text (when to call, what to call first, what goes wrong if misused)

## Web Changes

- Next.js routes/components touched in `apps/web` (if none, write "none")
- Data fetching via the API only; no Prisma or business logic in web

## Edge Cases & Error Paths

- Invalid inputs, auth failures, budget/roster/rule violations, stale prices
- Race conditions, double submits, idempotency, transaction rollback
- Agent misuse paths for any MCP tool

## Test Plan

- Automated, mapped to acceptance criteria:
  - Vitest unit tests (pure services: pricing, validation, state transitions)
  - Supertest e2e tests in `apps/api` (need `docker compose up -d db`)
  - MCP tool tests through the SDK client, where tools change
  - At least one failure-path test for any transaction
- Manual: copy-pastable commands (`curl`, `pnpm --filter api prisma studio`, `npx @modelcontextprotocol/inspector`) with expected outputs

## Risks

- One-line risk + mitigation per item. Omit if none.

## Implementation Order

Ordered list of files to change and what to do in each. Order: `packages/shared` → Prisma schema + migration → API services → API controllers → MCP tools → web → tests.

Rules:

- Minimal surface area. If a file is not required by an acceptance criterion, exclude it.
- No speculative improvements.
- Follow existing patterns in `apps/api`, `apps/web`, `apps/mcp`, and `packages/shared`, and the rules in `.github/copilot-instructions.md`.
- If the repo does not yet contain the workspace or script a step depends on (e.g. Story 0.1), plan to create it rather than assuming it exists.