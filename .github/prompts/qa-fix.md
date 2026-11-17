Review the implementation, then immediately apply all fixes. One pass, no back-and-forth.

Review checklist:

- Correctness: logic bugs, wrong field references, off-by-one errors
- Validation: missing input validation, missing auth checks
- Edge cases: empty inputs, nulls, concurrency, partial failures
- Tests: missing coverage for acceptance criteria, weak assertions
- Performance: N+1 queries, unbounded loops, missing indexes

For each finding:

- Severity: high / medium / low
- File + line range
- Problem and why it matters
- Fix to apply

Then:

1. Apply all high and medium fixes immediately.
2. Note any low-severity findings as follow-up items (do not apply).
3. Re-run: pnpm typecheck && pnpm test --filter=affected

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
