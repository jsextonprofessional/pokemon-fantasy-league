Review the implementation, then immediately apply all fixes. One pass, no back-and-forth.

Review checklist:

- Correctness: logic bugs, wrong field references, off-by-one errors, wrong status codes
- Validation: missing zod validation on inputs, missing guards/auth checks, missing bearer-token check on MCP
- Edge cases: empty inputs, nulls, concurrency, partial failures, stale quote `version`, expired quotes
- Transactions & money: credits moved outside a single Prisma transaction; any update/delete of `LedgerEntry`; direct edits to a team budget; missing rollback test
- Idempotency: state-changing POSTs that ignore `Idempotency-Key`; double-submit paths
- Architecture: business logic in `apps/web` or `apps/mcp`; Prisma imported outside `apps/api`; one module reaching into another's data; side effects in Pricing or Validation
- Contract: shapes redefined locally instead of imported from `packages/shared`; responses not matching their schema; errors not RFC 7807 problem+json with `code` and `detail`; Swagger out of date
- MCP: a tool that can execute a quote, move credits, or skip approval; wrong tier; vague tool description
- Audit: mutations missing an audit entry or the correct `actorType`
- Prisma typing: JSON fields re-read from returned records (`JsonValue | null`) instead of the original `InputJsonValue` variable
- Tests: missing coverage for acceptance criteria, weak assertions, e2e tests that depend on test order
- Performance: N+1 queries, unbounded `findMany` without pagination, missing indexes on filtered/foreign-key columns
- Security & IP: secrets or `.env` committed; sprites, official artwork, or logos added

For each finding:

- Severity: high / medium / low
- File + line range
- Problem and why it matters
- Fix to apply

Then:

1. Apply all high and medium fixes immediately.
2. Note any low-severity findings as follow-up items (do not apply).
3. Re-run:
   ```
   pnpm turbo run typecheck lint
   pnpm turbo run test --affected
   ```
4. Save the review to `.github/story-runs/<run-id>/qa.md`.

Output:

- Findings (severity / location / problem / fix applied or deferred)
- Acceptance criteria: list each criterion with pass/fail
- Test results after fixes
- Merge-ready: yes / blocked (with reason)

Rules:

- Focus on story-scoped files first.
- Flag only actionable issues — no style noise.
- Do not expand story scope.
- Do not apply low-severity fixes unless zero risk and zero scope expansion.