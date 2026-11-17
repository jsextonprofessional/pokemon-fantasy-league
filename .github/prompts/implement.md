Implement the approved plan exactly.

Steps:

1. Create and switch to branch: story/<story-number>-<kebab-case-name>
2. Initialise a todo list with ALL steps below so progress survives session compaction:
   - [ ] Create branch
   - [ ] Implement changes
   - [ ] Add/update tests
   - [ ] Run typecheck + tests
   - [ ] qa-fix.md pass
   - [ ] finalize.md — commit, push, open PR  ← MUST NOT BE OMITTED
3. Implement changes in the order specified by the plan.
4. Add/update tests per the test plan.
5. Run: pnpm typecheck && pnpm check && pnpm test --filter=affected
   All must exit 0. `pnpm typecheck` catches TypeScript errors in non-test files; `pnpm check` (svelte-check) catches Svelte a11y and component type errors — both are required even when tests pass, as CI will reject either failure.
6. Proceed to qa-fix.md — review output and apply fixes.
7. After qa-fix.md completes, proceed to finalize.md — this step is mandatory and must not be skipped.

Resuming a session:
If this prompt is loaded mid-story (e.g. after a context-limit compaction), first run:
  gh pr list --head <branch-name>
If a PR already exists, output its URL and stop. Otherwise continue from the first incomplete todo item.

Output:

- Branch name
- Files changed (one line each: file → what changed)
- Test results (pass/fail + count)
- PR URL (from finalize.md) — required; story is not complete without it
- Any deviation from plan with justification

Rules:

- Only modify files in the approved plan.
- No unrelated refactors.
- If a planned change cannot be implemented safely, state the blocker and stop.
- After tests pass, always proceed to qa-fix.md then finalize.md. A story is not complete until a PR exists.
