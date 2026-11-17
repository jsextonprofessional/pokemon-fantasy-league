You are planning a single scoped story. Produce a minimal, executable plan in one pass.

Output exactly these sections:

## Objective

One sentence restatement. List explicit non-goals.

## File Impact Map

| File | Action (create/modify) | Reason (one line) |
| ---- | ---------------------- | ----------------- |

Only include files the story requires. If a file is not touched, omit it.

## Schema & Data Changes

- Prisma model/field changes (if none, write "none")
- Migration strategy and backward-compatibility notes
- Backfill or cleanup needs

## API & Contract Changes

- Route/handler updates
- Request/response shape changes
- Validation and auth implications

## Edge Cases & Error Paths

- Invalid inputs, auth failures, data integrity risks
- Race conditions or idempotency concerns

## Test Plan

- Automated: unit/integration tests to add or update, mapped to acceptance criteria
- Manual: copy-pastable commands with expected outputs

## Risks

- One-line risk + mitigation per item. Omit if none.

## Implementation Order

Ordered list of files to change and what to do in each.

Rules:

- Minimal surface area. If a file is not required by an acceptance criterion, exclude it.
- No speculative improvements.
- Follow existing patterns in apps/api and apps/dashboard.
