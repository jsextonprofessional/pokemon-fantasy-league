## Objective

Scaffold a pnpm + Turborepo monorepo (web, api, mcp, shared, config) compiling against one zod contract.
Non-goals: database/Prisma, CI, deployment, real UI, auth, Pokémon assets.

## File Impact Map

| File                                                  | Action | Reason                                          |
| ----------------------------------------------------- | ------ | ----------------------------------------------- |
| package.json, pnpm-workspace.yaml, turbo.json, .nvmrc | create | workspace, pipeline, Node 22 pin                |
| packages/config/\*                                    | create | shared tsconfig, ESLint, Prettier               |
| packages/shared/\*                                    | create | `CatalogUnitSchema` + type + unit tests         |
| apps/api/\*                                           | create | Nest app, `/v1/health`, Swagger `/docs`, e2e    |
| apps/mcp/\*                                           | create | streamable HTTP server with `ping`, SDK client test |
| apps/web/\*                                           | create | Next App Router placeholder page using shared type |
| .env.example                                          | create | document ports                                  |

## Schema & Data Changes

none

## API & Contract Changes

- `GET /v1/health` -> `200 {status:"ok"}`; Swagger UI at `/docs`.
- `CatalogUnitSchema` in `packages/shared`, consumed by web and api.
- MCP tool `ping` -> `pong` at `POST /mcp` (stateless streamable HTTP).

## Edge Cases & Error Paths

- Schema rejects missing/negative/non-integer fields (unit tests).
- Shared compiled to CJS `dist`; turbo `^build` dependency ensures it exists before typecheck/dev/test.

## Test Plan

- Vitest unit: CatalogUnitSchema success/failure.
- Supertest e2e: health. MCP SDK client: `ping`.
- Manual: `pnpm dev`, curl health, open `/docs`, open `localhost:3000`.

## Risks

- Local Node is v20; repo pins 22 (`engines` warn only). Validate on 20 locally.

## Implementation Order

config -> shared -> api -> mcp -> web -> root scripts -> gates.
