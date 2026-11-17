Prepare and execute final delivery for the completed story.

> **STOP — do not skip this file.**
> The story is NOT delivered until Step 4 produces a PR URL.
> Tests passing and typecheck clean are gates, not the finish line.
> If you are about to summarise the story as complete, run this file first.

PR creation is mandatory. Do not end this prompt without a PR URL or an explicit auth blocker.

## Step 0 — Resume guard

Before doing anything else, check whether a PR already exists for this branch:

```
gh pr list --head $(git branch --show-current) --json url --jq '.[0].url'
```

If a URL is returned, output it and stop — the story is already delivered.
If the command fails because `gh` is not found, skip to Step 1.

## Step 1 — Gate check

Start Postgres if the story touches the API or database (`docker compose up -d db`), then run from the repo root. Stop and output BLOCKED: <command> + error output if any fail.

```
pnpm turbo run typecheck
pnpm turbo run lint
pnpm turbo run test --affected
pnpm turbo run build --affected
```

If the story changed `apps/api/prisma/schema.prisma`, also run the drift check:

```
pnpm --filter api prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --shadow-database-url "$SHADOW_DATABASE_URL" \
  --exit-code
```

All must exit 0. `typecheck` catches TypeScript errors Vitest never compiles. `build` catches Next.js (`apps/web`) and NestJS (`apps/api`) build failures that CI rejects. The drift check fails if the schema changed without a migration — CI runs the same check.

## Step 2 — Commit

Group changes by logical unit, in this order when present: shared contract, schema + migration, API service, API controller, MCP tools, web, tests, docs.
Format: `<type>(<scope>): <what and why>`
Types: feat, fix, refactor, test, docs, chore, ci.
Scopes: `shared`, `db`, `api`, `mcp`, `web`, `ci`, `deploy`, `docs`, or an API module name (e.g. `quotes`, `ledger`).

Run each commit:
git add <files>
git commit -m "<message>"

Never commit `.env` files, secrets, or `.github/story-runs/` scratch files unless the repo already tracks them.

## Step 3 — Push (REQUIRED before PR)

Run this first. A PR cannot be created for a branch that does not exist on the remote.

git push -u origin <branch-name>

Verify the push succeeded (exit 0) before proceeding. If push fails, output the error and stop.
Do NOT run `gh pr create` until this step has completed successfully.

## Step 4 — Open PR (required)

Write the filled-in PR body (template below) to `.github/story-runs/<run-id>/pr-body.md`, then run:

gh pr create \
 --title "<type>(<scope>): <concise summary>" \
 --body-file .github/story-runs/<run-id>/pr-body.md \
 --base main \
 --head <branch-name>

If `gh` is not found: output BLOCKED: gh CLI not installed. Install with: brew install gh
If `gh` is not authenticated: output BLOCKED: run gh auth login then re-run finalize.
If the PR already exists: run gh pr view --web to open it.

Do not skip this step for any other reason.

## Step 5 — Output

- Gate check: pass or BLOCKED
- Commits: list of hashes + messages
- Push: success or BLOCKED
- PR URL (from gh pr create output) or explicit BLOCKED reason

## PR body template

Fill in every section. Do not submit the template with placeholder comments.

---

## Summary

<!-- What this PR does and why. Story number and title. -->

## Changes

<!-- Per-workspace summary: shared / db / api / mcp / web / ci -->

## Acceptance Criteria

| Criterion | Status |
| --------- | ------ |
| ...       | ✅/❌  |

## API & Contract

<!-- New or changed /v1 endpoints, zod schemas in packages/shared, problem+json codes. "None" if not applicable. -->

## MCP Impact

<!-- Tools added or changed and their tier (read / draft-write / gated). "None" if not applicable. -->

## Testing

### Automated

<!-- Test files and results per workspace -->

### Manual

<!-- Copy-pastable steps (curl, prisma studio, MCP inspector) with expected output -->

## Risks & Rollback

<!-- Migration safety (backward compatible?), ledger/credit impact, feature flags, rollback steps -->