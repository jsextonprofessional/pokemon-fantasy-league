## QA review

- Medium: initial verification commands used shell angle-bracket placeholders,
  which are not copy-pastable. Fixed the README commands to select the current
  branch and latest workflow run.
- No other high- or medium-severity findings in the workflow or documentation.

## Acceptance criteria

- PR and main triggers, dependency cache, Node pin, frozen install, concurrency:
  implemented; hosted verification pending.
- PostgreSQL 16, migration, seed, drift detection, and all four turbo gates:
  local clean-container simulation passed; hosted verification pending.
- Intentional lint and migration-drift failures and warm-cache timing: pending
  execution on the story PR.
- Branch-protection requirements documented; actual repository settings must be
  applied by an administrator.
- GitHub's branch-protection API returned 403: this private repository needs
  an eligible GitHub plan or visibility change before that protection can be
  enabled.

## Local test results

- Node 22: `pnpm turbo run lint`, `typecheck`, `test`, `build` passed.
- Tests: API 20, shared 15, MCP 1; web has no tests.
- Clean PostgreSQL 16: drift check, migration deployment, seed and tests passed.

Merge readiness is pending the actual hosted CI verification and branch
protection configuration.
