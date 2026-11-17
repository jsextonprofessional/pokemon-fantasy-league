Implement the approved plan exactly.

Steps:

1. Create and switch to branch: `story/<story-number>-<kebab-case-name>` (e.g. `story/0.2-catalog-seed`)
2. Initialise a todo list with ALL steps below so progress survives session compaction:
   - [ ] Create branch
   - [ ] Start Postgres (`docker compose up -d db`) if the story touches the API or database
   - [ ] Implement changes
   - [ ] Add/update tests
   - [ ] Run gate commands
   - [ ] qa-fix.md pass
   - [ ] finalize.md — commit, push, open PR  ← MUST NOT BE OMITTED
3. Implement changes in the order specified by the plan.
4. If the plan changes `schema.prisma`, create a named migration:
   `pnpm --filter api prisma migrate dev --name <snake_case_name>`
5. Add/update tests per the test plan.
6. Run from the repo root:
   ```
   pnpm turbo run typecheck lint
   pnpm turbo run test --affected
   pnpm turbo run build --affected
   ```
   All must exit 0. `typecheck` catches errors Vitest does not compile; `build` catches Next.js and Nest build failures CI will reject. Both are required even when tests pass.
   Story 0.1 only: if these scripts do not exist yet, creating them is part of the story; run the equivalent per-workspace commands until they do.
7. Proceed to qa-fix.md — review output and apply fixes.
8. After qa-fix.md completes, proceed to finalize.md — this step is mandatory and must not be skipped.

Resuming a session:
If this prompt is loaded mid-story (e.g. after a context-limit compaction), first run:
  `gh pr list --head <branch-name>`
If a PR already exists, output its URL and stop. Otherwise continue from the first incomplete todo item.

Output:

- Branch name
- Files changed (one line each: file → what changed)
- Migrations created (name) or "none"
- Test results (pass/fail + count per workspace)
- PR URL (from finalize.md) — required; story is not complete without it
- Any deviation from plan with justification

Rules:

- Only modify files in the approved plan.
- No unrelated refactors.
- Follow `.github/copilot-instructions.md`, especially: business logic stays in `apps/api`; `apps/web` and `apps/mcp` call the API only; shapes come from `packages/shared`.
- Never commit `.env` files or secrets; update `.env.example` when adding a variable.
- If a planned change cannot be implemented safely, state the blocker and stop.
- After tests pass, always proceed to qa-fix.md then finalize.md. A story is not complete until a PR exists.