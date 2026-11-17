# Phase 2 Private Beta
## Epic 3 Dashboard Frontend

### Story 3.1 Setup Dashboard App
- [ ] Completed

### Story 3.2 Auth Pages
- [ ] Completed

## What changed
- 

## Manual test instructions
1. Start API:
   - `cd apps/api && pnpm dev`
2. Start dashboard:
   - `cd apps/dashboard && pnpm dev --host 127.0.0.1 --port 4173`
3. Register flow:
   - Visit `http://127.0.0.1:4173/register`
   - Create an account and confirm redirect to `/forms`
4. Login flow:
   - Visit `http://127.0.0.1:4173/login`
   - Sign in and confirm redirect to `/forms`
5. Cookie persistence:
   - Refresh `/forms`
   - Run `curl -b <browser-cookie-export> http://localhost:3001/auth/me` or verify authenticated API calls from dashboard

## Test evidence
- [ ] `cd apps/dashboard && pnpm test`
- [ ] `cd apps/dashboard && pnpm check`
- [ ] `cd apps/api && pnpm test`
- [ ] `cd apps/api && pnpm exec tsc --noEmit`

## Notes
- Mutating tests should use `TEST_DATABASE_URL` and call `pnpm test:db:cleanup` in `apps/api` to avoid polluting development data.
