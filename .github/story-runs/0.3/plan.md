## Objective

Add PR and main-branch CI using PostgreSQL, migration drift checking and all workspace gates. Non-goals: deployment, application features, dependency upgrades, and changing GitHub branch settings.

## File Impact Map

| File | Workspace | Action | Reason |
| ---- | --------- | ------ | ------ |
| `.github/workflows/ci.yml` | root | create | Run cached pnpm, PostgreSQL, migration checks and turbo gates |
| `README.md` | root | modify | Document required branch protection and CI verification |
| `.github/story-runs/0.3/plan.md` | root | create | Record the story plan |
| `.github/story-runs/0.3/qa.md` | root | create | Record QA findings and gate results |

Temporary lint and schema changes will be reverted after testing the actual PR workflow.

## Schema & Data Changes

- None. No migration or seed changes; no ledger or budget changes.

## Shared Contract Changes

- None.

## API & Contract Changes

- None. Existing database integration tests run against an isolated ephemeral PostgreSQL service.

## MCP Tool Changes

- None.

## Web Changes

- None.

## Edge Cases & Error Paths

- Ensure test and shadow databases are distinct, migration drift fails the job, and secrets are unnecessary.
- Concurrency groups must not cancel runs for different branches or events.

## Test Plan

- Run the existing full turbo lint, typecheck, test and build gates locally under Node 22.
- Check migration drift locally with an isolated shadow database.
- On the story PR, push temporary lint and schema-only errors separately, observe the corresponding failed CI steps, revert each, then confirm a passing warm-cache run and record its duration.
- Document verification commands and expected outcomes in the README and PR.

## Risks

- Hosted Actions availability or billing can prevent remote verification; report any blocker without claiming success.
- Branch protection is configured separately in GitHub settings and cannot be enforced by a workflow file alone.

## Implementation Order

1. Add `.github/workflows/ci.yml` with an ephemeral PostgreSQL service, setup, drift/migrate/seed and gates.
2. Update README branch-protection and verification guidance.
3. Run local validation and QA; commit, push and open the story PR.
4. Exercise failure paths on the PR, revert temporary changes, and verify a passing warm-cache run.
