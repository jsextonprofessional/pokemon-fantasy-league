# Story 2.4 - Persist Submission Field Metadata in Public Submission Endpoint

## Objective
Ensure every accepted public form submission stores normalized field metadata so downstream processing, analytics, and spam checks can rely on a consistent structure.

## Context
- Public submissions are handled in `apps/api/src/routes/publicSubmission.ts`.
- Field persistence logic is centralized in `apps/api/src/services/submissionFieldService.ts`.
- Submission records and related field entities are defined in Prisma schema and migrations.
- Existing tests cover public submission happy path and basic validation.

## Acceptance Criteria

### Functional
1. When a valid public submission is received, each field is persisted with:
   - stable field key,
   - original label (if provided),
   - normalized value,
   - inferred value type (`text`, `email`, `number`, `boolean`, `json`).
2. Empty or whitespace-only field values are excluded from persisted metadata.
3. Duplicate keys in a payload are resolved deterministically (last value wins).
4. Unknown nested objects are persisted as `json` when valid JSON-serializable.
5. Submission creation remains atomic: if field persistence fails, submission is not partially stored.

### Testing
1. Add/update route-level tests for mixed field types and empty-value filtering.
2. Add/update service tests for normalization and type inference behavior.
3. Add at least one failure-path test for transaction rollback on field persistence error.
4. Provide manual verification steps using a sample POST to the public submission endpoint.

## Task
Implement field metadata normalization and persistence updates for the public submission flow without altering unrelated routes or billing/auth logic.

## Requirements
- Follow existing Fastify route/service layering.
- Keep changes scoped to submission flow files and related tests.
- Reuse existing Prisma transaction pattern in this codebase.
- Maintain current API response contract unless acceptance criteria explicitly requires changes.

## Constraints
- No unrelated refactors.
- No dependency upgrades.
- No dashboard UI changes.
- Keep migration changes backward compatible with existing local data where possible.

## Final Requirements
- Run QA review prompt after implementation.
- Provide grouped commit message recommendations.
- Provide manual testing checklist with expected outcomes.
- Provide PR title and PR description ready to paste into GitHub.
