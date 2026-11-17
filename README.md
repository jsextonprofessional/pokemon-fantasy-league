# Fantasy League

## Local catalog

Requirements: Node 22, pnpm 9, and Docker Compose.

```sh
pnpm install
cp apps/api/.env.example apps/api/.env
docker compose up -d --wait db
pnpm db:migrate
pnpm db:seed
pnpm db:seed
pnpm dev
```

PostgreSQL 16 listens on `127.0.0.1:55432`; the example credentials are for local
development only. Both seed runs report `Seeded 1365 catalog units` with the
locked dex version. Existing units are upserted by `speciesKey`; unchanged rows,
including their timestamps, are not modified. The seed does not delete extra rows.

The seed includes Gen 9 National Dex species and forms from `@pkmn/dex` with
National Dex numbers 1–1025 and `isNonstandard` either `null` or `Past`; it
excludes future, custom, CAP, and LGPE-only entries. This is a catalog selection,
not a competitive-format legality check. Tier and price are provisional,
deterministic baseline values, not competitive usage tiers:

| Base stat total | Tier | Base price  |
| --------------- | ---- | ----------- |
| 0–399           | C    | total       |
| 400–499         | B    | total + 100 |
| 500–599         | A    | total + 200 |
| 600+            | S    | total + 400 |

With the API running on port 4000:

```sh
curl -s 'http://localhost:4000/v1/catalog?limit=2'
curl -s 'http://localhost:4000/v1/catalog?type=Fire&tier=A&maxPrice=800&limit=5'
curl -i 'http://localhost:4000/v1/catalog?limit=101'
```

The first request returns two items and a `nextCursor`; supply that value as
`cursor` with the same filters to obtain the next page. The second returns at
most five Fire units in tier A costing at most 800. The last returns HTTP 400,
`Content-Type: application/problem+json`, `code: BAD_REQUEST`, and a `detail`.
Prices are integer credits. Type names are case-sensitive; the limit defaults
to 25 and is capped at 100. Swagger UI is at `http://localhost:4000/docs`.

## Integration tests

Tests seed and modify their database. Use a separate database whose name ends
in `_test`; never point `TEST_DATABASE_URL` at real data. The example `.env`
sets it to `pfl_test` on the local container. Create it once and apply the same
migrations:

```sh
docker compose exec -T db createdb -U pfl pfl_test
DATABASE_URL='postgresql://pfl:pfl@127.0.0.1:55432/pfl_test?schema=public' pnpm db:migrate
pnpm turbo run typecheck lint test build
```

The `createdb` command reports an error if the database already exists; skip it
on subsequent runs. The API tests require this database and do not silently
skip when it is unavailable. Test results are not cached for the API because
they depend on its database.

## GitHub CI and branch protection

The `CI` workflow runs on pull requests and pushes to `main`. It uses an
ephemeral PostgreSQL 16 service, applies migrations and seeds the dedicated
test database, checks migration drift using a separate shadow database, and
runs lint, typecheck, test and build. No repository secrets are required.

Repository administrators must configure protection separately in **Settings →
Rules → Rulesets** (or **Settings → Branches**):

1. Target `main` and require a pull request before merging.
2. Require status checks to pass, and select the `quality` check from the `CI`
   workflow. The check becomes selectable after a workflow run.
3. Do not grant bypass privileges; apply the rule to administrators as well.
   This prevents direct pushes to `main`.

Verify the workflow on a disposable PR: introduce an unused TypeScript variable
and confirm the `Lint` step fails, then revert it. Add a nullable field to
`apps/api/prisma/schema.prisma` without a migration and confirm `Check migration
drift` fails, then revert it. The restored PR should pass. To rerun a completed
workflow with the pnpm cache populated and inspect its duration:

```sh
BRANCH="$(git branch --show-current)"
gh run list --workflow ci.yml --branch "$BRANCH"
RUN_ID="$(gh run list --workflow ci.yml --branch "$BRANCH" --limit 1 --json databaseId --jq '.[0].databaseId')"
test -n "$RUN_ID"
gh run rerun "$RUN_ID"
gh run watch "$RUN_ID" --exit-status
gh run view "$RUN_ID"
```

The target for a warm-cache run is under five minutes; duration depends on
runner availability. These settings are documented here but must be configured
in GitHub; the workflow alone does not enforce branch protection.
