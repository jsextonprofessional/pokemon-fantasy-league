# Story <phase>.<number> - <Title>

## Objective
Describe the outcome and why this change matters to the league, the quote-to-cash flow, or the AI agent.

## Context
- Relevant current behavior
- Workspaces involved (`apps/api`, `apps/web`, `apps/mcp`, `packages/shared`)
- NestJS modules, endpoints, Prisma models, and MCP tools involved
- Stories this depends on
- Known technical constraints

## Acceptance Criteria
### Functional
1. Clear, testable behavior outcome 1
2. Clear, testable behavior outcome 2
3. Error handling and edge behavior are defined (problem+json `code`, status codes)

### Testing
1. Unit tests (Vitest) and API e2e tests (Supertest) to add or update are specified
2. MCP tool tests are specified, if tools change
3. At least one failure-path test for any transaction or credit movement
4. Manual verification flow is defined with copy-pastable commands and expected output

## Task
Describe what must be implemented in this story.

## Requirements
- Shared contract updates in `packages/shared` (if any)
- API contract updates under `/v1` (if any)
- Prisma schema/migration updates (if any)
- MCP tool updates and their tier: read / draft-write / gated (if any)
- Web updates in `apps/web` (if any)
- Season/scheduled job updates via `@nestjs/schedule` (if any)

## Constraints
- Only modify files needed for this story.
- Keep changes minimal and modular.
- Follow `.github/copilot-instructions.md` and existing repository patterns.
- Business logic stays in `apps/api`; web and MCP call the API only.
- No unrelated refactors or dependency upgrades.

## Final Requirements
- Run QA review prompt after implementation.
- Provide grouped commit message recommendations.
- Provide manual testing checklist with expected outcomes.
- Provide PR title and PR description ready to paste into GitHub.