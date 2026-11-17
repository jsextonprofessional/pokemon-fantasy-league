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

Run these commands. Stop and output BLOCKED: <command> + error output if any fail.

pnpm typecheck
pnpm check
pnpm test --filter=affected
pnpm lint

All four must exit 0. `pnpm typecheck` catches CI-only TypeScript errors (e.g. `.stories.ts` type mismatches) invisible to Vitest. `pnpm check` (svelte-check) catches Svelte a11y warnings and component type errors — it must also pass before creating a PR.

## Step 2 — Commit

Group changes by logical unit (schema, service, route, tests).
Format: <type>(<scope>): <what and why>

Run each commit:
git add <files>
git commit -m "<message>"

## Step 3 — Push (REQUIRED before PR)

Run this first. A PR cannot be created for a branch that does not exist on the remote.

git push -u origin <branch-name>

Verify the push succeeded (exit 0) before proceeding. If push fails, output the error and stop.
Do NOT run `gh pr create` until this step has completed successfully.

## Step 4 — Open PR (required)

Run:

gh pr create \
 --title "<type>(<scope>): <concise summary>" \
 --body "$(cat .github/pull_request_template.md)" \
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

Write this into the PR body before creating:

---

## Summary

<!-- What this PR does and why -->

## Changes

<!-- Per-file or per-group summary -->

## Acceptance Criteria

| Criterion | Status |
| --------- | ------ |
| ...       | ✅/❌  |

## Testing

### Automated

<!-- Test files and results -->

### Manual

<!-- Copy-pastable steps with expected output -->

## Risks & Rollback

## <!-- Migration safety, feature flags, rollback steps -->
