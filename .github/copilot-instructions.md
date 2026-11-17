# Copilot Agent Instructions

## Stack

- Monorepo: pnpm workspaces + Turborepo
- Runtime: Node.js 22 LTS + TypeScript (strict)
- API: NestJS + Prisma (`apps/api`), OpenAPI via `@nestjs/swagger`, global prefix `/v1`
- Frontend: Next.js App Router + Tailwind + TanStack Query (`apps/web`)
- MCP server: `@modelcontextprotocol/sdk`, streamable HTTP (`apps/mcp`)
- Shared contract: zod schemas and inferred types (`packages/shared`)
- Shared tooling: tsconfig, ESLint, Prettier (`packages/config`)
- Database: PostgreSQL (Docker locally, Neon in production)
- Domain data: `@pkmn/dex` (catalog seed), `@pkmn/sim` (scoring, Phase 5)
- Tests: Vitest (unit), Supertest (API e2e), Playwright (web e2e)
- Hosting: Vercel (web), Fly.io (API, MCP), Neon (database)

## Architecture Rules

- The API owns all data access and business logic. `apps/web` and `apps/mcp` are clients of the public `/v1` API; neither imports Prisma or queries the database.
- The MCP server is a thin client: no pricing, validation, or state-machine logic. Tools call API endpoints and return their results.
- One NestJS module per bounded context (Auth, Leagues, Catalog, Pricing, Validation, Rosters, Rfqs, Quotes, Approvals, Ledger, Draft, Matchups, Season, Audit). Do not reach into another module's repository; call its exported service.
- Pricing and Validation are pure services: no database writes, no side effects, deterministic for the same inputs.
- Request/response shapes are defined once as zod schemas in `packages/shared` and reused by API, web, and MCP. Never redefine a shape locally.
- Keep the domain generic (`CatalogUnit`, not `Pokemon`) in models, services, and routes. Pokémon is seed data only.

## API Conventions

- Errors are RFC 7807 problem+json with a machine-readable `code` and a human-readable `detail` (agents read `detail`).
- Every state-changing POST accepts an `Idempotency-Key` header.
- Quotes carry a `version`; a stale version returns `409`.
- List endpoints use cursor pagination (`cursor`, `limit`) and typed filters.
- Prices and validation failures always include an `explanation` string.
- Credits move only when a quote executes. Execution runs in a single Prisma transaction and writes append-only `LedgerEntry` rows. Never update or delete ledger rows, and never edit a team's budget directly.
- Every mutation is recorded by the audit interceptor with `actorType` (`USER` or `AGENT`).

## MCP Rules

- Tools are tiered: read (free), draft-write (saved as DRAFT, invisible to other managers), gated (returns `pending_human_approval`; nothing executes without a human).
- An MCP tool must never execute a quote, move credits, or bypass the approval flow.
- Tool descriptions state when to call the tool, what to call first, and what goes wrong if misused. Treat them as part of the API contract.
- Agent tokens are scoped to one team; reject requests without a valid bearer token with `401`.

## Engineering Rules

- Modify only files required for the current story.
- Keep changes minimal, modular, and reviewable.
- Follow existing patterns: naming, module layout, DTO/zod usage, tests, services, Prisma usage.
- No unrelated refactors, renames, formatting-only edits, or dependency upgrades.
- Every `schema.prisma` change ships with a migration; CI fails on drift.
- When passing Prisma model fields between operations, use the original `InputJsonValue`-typed
  variable — not a field re-read from a returned record (typed `JsonValue | null`).
  This prevents TS2322 errors.
- No Pokémon sprites, official artwork, or logos in the repo, seed data, or UI.
- Never commit secrets. Use `.env` locally (with `.env.example` updated), Fly secrets, GitHub secrets, and Vercel env vars.

## Delivery Standards

- Every change must trace to an acceptance criterion.
- Include tests where the story requires or existing patterns expect them: unit tests for pure services and rules, Supertest e2e for endpoints, a failure-path test for any transaction.
- If a requirement cannot be completed, state the blocker and smallest safe fallback.
- Manual testing steps must be copy-pastable shell commands (`curl`, `pnpm --filter api prisma studio`, `npx @modelcontextprotocol/inspector`, etc.) with expected output.

## Trigger: run-story

If the user says "run-story [content]", execute this sequence without stopping for confirmation:

1. plan → plan.md
2. implement → branch + code changes + tests
3. qa-fix → review + apply fixes in one pass
4. finalize → commits + push + PR

Branch naming: `story/<number>-<short-slug>` (e.g. `story/0.2-catalog-seed`).

**A story is NOT complete until a PR URL has been output to the user.**
Passing tests and a clean typecheck are necessary but not sufficient — the story is still in progress until `gh pr create` exits 0 and the URL is shown.
Do not summarise the story as "done", "complete", or "delivered" without a PR URL in the output.

If `gh` is not authenticated, run `gh auth status` and surface the error — do not silently skip PR creation.
Prefer execution over explanation. Stop only on hard blockers (missing auth, failed tests).
Run artifacts are written to `.github/story-runs/<run-id>/`.

## PR creation rule — ALWAYS push before `gh pr create`

When creating a pull request as part of any story delivery gate, **always run `git push -u origin <branch>` first** and verify it exits 0 before running `gh pr create`. `gh pr create` will fail with exit 1 if the branch does not exist on the remote.

Mandatory sequence for every story gate:

```
git add -A
git commit -m "..."
git push -u origin <branch>          # ← must succeed before next line
gh pr create --base main --head <branch> --title "..." --body "..."
```

If `git push` fails, stop and report the error. Do not attempt `gh pr create`.

## Finalize prompt compliance

The finalize phase (`finalize.md`) is the canonical gate. Follow it step-by-step:

1. Resume guard — check for an existing PR
2. Gate check — run from the repo root, all must exit 0:
   - `pnpm turbo run typecheck`
   - `pnpm turbo run lint`
   - `pnpm turbo run test` (API e2e tests need Postgres: `docker compose up -d db`)
   - `pnpm turbo run build`
   - Prisma drift check, if the story touched `schema.prisma`:
     `pnpm --filter api prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --shadow-database-url "$SHADOW_DATABASE_URL" --exit-code`
3. Commit
4. Push
5. PR creation
6. Output the PR URL

Never skip or reorder these steps.

**Definition of done:** a story run is complete ONLY when a PR URL is visible in the conversation. "Tests pass" and "typecheck clean" are intermediate gates, not the finish line. Never describe a story as complete, done, or delivered without a PR URL.
