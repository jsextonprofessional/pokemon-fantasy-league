## Objective

Persist and expose a Gen 9 National Dex catalog. No other domain models, UI features, CI, or deployment.

## File Impact Map

| File | Action | Reason |
| ---- | ------ | ------ |
| `docker-compose.yml`, `.env.example`, root `package.json` | Create/modify | Local PostgreSQL and database commands |
| `apps/api/prisma/**`, `apps/api/package.json` | Create/modify | Schema, migration, seed and dependencies |
| `apps/api/src/database/**`, `apps/api/src/catalog/**` | Create | Database provider and catalog endpoint |
| `apps/api/src/app.module.ts`, `apps/api/src/app.setup.ts`, `apps/api/src/**filter*` | Modify/create | Register modules and problem response filter |
| `packages/shared/src/**` | Modify/create | Shared catalog, filters, pricing schemas and unit tests |
| `apps/api/test/**`, `apps/api/src/sample-unit.ts`, `apps/web/app/page.tsx` | Modify/create | Integration tests and existing contract consumers |
| `pnpm-lock.yaml`, `turbo.json` | Modify if required | Dependencies and database-aware task caching |
| `README.md` | Create | Setup, seed policy, pricing, and manual verification |

## Schema & Data Changes

- One `CatalogUnit` model and initial migration; no other models.
- Seed upserts by unique species key; existing identifiers and timestamps are preserved when data is unchanged.

## API & Contract Changes

- Read-only `GET /v1/catalog`: type, tier, maxPrice, cursor and limit; shared schemas define response and query.
- Invalid queries and unknown cursors return RFC 7807 problem+json; no authentication is added.

## Edge Cases & Error Paths

- Reject invalid, repeated, unknown, out-of-range and non-integer query parameters.
- Stable cursor pagination and filters; deterministic seed and pricing; surface database errors.

## Test Plan

- Unit tests for prices and tier boundaries; seed twice against isolated test database and compare rows.
- Supertest against isolated database covers schema, filtering, pagination and malformed inputs.
- Manual compose, migrate, seed twice and curl checks documented in README.

## Risks

- Docker must be running for integration tests and migration drift; use isolated test databases.
- Contract fields change from the placeholder and require keeping the two existing consumers compilable without changing UI output.

## Implementation Order

1. Establish shared contract and pricing; adapt existing consumers.
2. Add PostgreSQL, Prisma migration and seed.
3. Implement database module, catalog endpoint and global exception handling.
4. Add tests and documentation; run QA and final delivery gates.
