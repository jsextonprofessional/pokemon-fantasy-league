## QA review

- Medium: initial verification commands used shell angle-bracket placeholders,
  which are not copy-pastable. Fixed the README commands to select the current
  branch and latest workflow run.
- High: the first hosted run failed because Turbo's strict environment mode
  filtered out `TEST_DATABASE_URL`. Updated the CI test command to use
  `--env-mode=loose` so the dedicated service database is passed through.
- Low: GitHub warns that the current action versions target Node 20 and are
  being forced to Node 24. Follow up separately; dependency upgrades are out of
  scope for this story.
- No other high- or medium-severity findings in the workflow or documentation.

## Acceptance criteria

- PR and main triggers, dependency cache, Node pin, frozen install, concurrency:
  implemented; the PR run passed. The main push trigger and concurrency
  cancellation were not separately exercised.
- PostgreSQL 16, migration, seed, drift detection, and all four turbo gates:
  passed in [hosted CI](https://github.com/jsextonprofessional/pokemon-fantasy-league/actions/runs/44131361297).
- Intentional lint error failed at `Lint` in
  [CI](https://github.com/jsextonprofessional/pokemon-fantasy-league/actions/runs/44132138936).
  After reverting it, [CI passed](https://github.com/jsextonprofessional/pokemon-fantasy-league/actions/runs/44132374512)
  in 1 minute 34 seconds with a pnpm cache hit.
- Schema-only change failed at `Check migration drift` in
  [CI](https://github.com/jsextonprofessional/pokemon-fantasy-league/actions/runs/44132792194).
  That change was reverted; consult the PR check for the final commit.
- Branch-protection requirements documented; actual repository settings must be
  applied by an administrator.
- GitHub's branch-protection API returned 403: this private repository needs
  an eligible GitHub plan or visibility change before that protection can be
  enabled.

## Local test results

- Node 22: `pnpm turbo run lint`, `typecheck`, `test`, `build` passed.
- Tests: API 20, shared 15, MCP 1; web has no tests.
- Clean PostgreSQL 16: drift check, migration deployment, seed and
  `pnpm turbo run test --env-mode=loose` passed against a dedicated temporary
  container. The initial local test had instead used the local `.env` because
  Turbo filtered the supplied environment.

Merge readiness depends on the final PR check and branch protection
configuration.
