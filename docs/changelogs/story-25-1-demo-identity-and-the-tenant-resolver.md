# Changelog: Story 25.1, Demo identity and the tenant resolver

| | |
|---|---|
| Story | 25.1, issue #179 |
| Epic | 25, Demo Family and domain foundations |
| Branch | feature/epic-25-issue-179-demo-identity-and-tenant-resolver |
| Commits | the Story 25.1 commit on the branch (baseline c76c97b); the commit hash is in the pull request |
| Date | 2026-11-09 |
| Security report | [story-25-1-demo-identity-and-the-tenant-resolver.md](../security-reports/story-25-1-demo-identity-and-the-tenant-resolver.md) |

## Summary

Every `/api/v1` request can now run as a Caregiver in a Family, with the Family taken only from the Caregiver's active membership and applied to Hibernate through a tenant resolver. Until sign-in exists, only a demo flag (profiles `local` and `test` only) supplies a Caregiver; otherwise the API answers 401.

## Added

- Migration `db/migration/family/V20261109_1000__families_caregivers_membership.sql`: `families`, `caregivers`, `caregiver_membership` (one active membership per Caregiver), and their entities and repositories in `family.persistence`.
- Port `family.api.CurrentCaregiver` (Caregiver ID, `sub`, Family ID) and `CaregiverContext`; `family.web.CaregiverFilter` resolves it for every `/api/v1` request except `/api/v1/ping` and sets the tenant.
- `shared.persistence`: `TenantContext` (holder), `FamilyTenantResolver` (Hibernate `CurrentTenantIdentifierResolver`, never the root tenant), `shared.domain.Uuids.v7()`, `shared.web.UnauthenticatedException` (problem type `unauthenticated`).
- Demo resolver (`X-Demo-Caregiver` header, default earliest Caregiver), `GET /api/v1/session` (in `openapi.json` and the generated frontend types), `littlesteps.demo.enabled` / `LS_DEMO`, and a startup guard that fails the start with the flag on outside `local` and `test`.
- `backend/GLOBAL_TABLES.md` lists the three tables; `GlobalTablesTests` fails for an unlisted entity without `@TenantId` and for a native query without `family_id`.
- Test-only: `tenant_probe` table (Flyway location `db/test-migration`, `test` profile only) and endpoints under `src/test`, used by the two-Family isolation test.

## Changed

- Every `/api/v1` path except `/api/v1/ping` now answers `401` without a Caregiver, including unknown paths.
- Test-only endpoints of the logging tests moved from `/api/v1/test/...` to `/test-support/...`; 404 tests use `/api/v2/...`.

## Fixed

None.

## Removed or deprecated

None. Story 3.1 replaces the demo source and the temporary filter with Keycloak and Spring Security.

## Security

PASS, no new blocking findings or exceptions. See [the security report](../security-reports/story-25-1-demo-identity-and-the-tenant-resolver.md).

## Operations impact

| Area | What changes (README is reviewed every story; write "reviewed, no change" if untouched) | README section |
|---|---|---|
| Setup | Reviewed, no change | Prerequisites, Setup |
| Development | New `LS_DEMO` flag and `GET /api/v1/session`; the API is 401 without it | Development |
| Release | Reviewed, no change | Release |
| Deployment | Reviewed, no change (the flag must stay off in `prod`; the app refuses to start otherwise) | Deployment |

## After you pull

Set `LS_DEMO=true` in the environment of a `local` run to call `/api/v1` endpoints. Flyway applies the new migration on the next start. There is no seed data yet, so insert a Family, a Caregiver and a membership by hand, or wait for Story 25.5.

## Tests

New: `DemoIdentityTests` (default, switch, unknown, no membership), `DemoFlagOffTests` (401 everywhere, header ignored), `TenantIsolationTests` (two Families: read, by-ID, cross-write, no tenant), `DemoGuardTests` (`ApplicationContextRunner`) and `DemoStartupGuardTests` (the real application: prod and no profile with the flag on fail at start), `GlobalTablesTests`, `TenantContextTests`, `UuidsTests`, `FamilyTests`; `DemoFlagOffTests` also sends encoded, `;`, dot-segment and double-slash paths through a raw HTTP client. Non-regression: `cd backend && ./mvnw verify` passes, 96 tests, 0 failures, 0 skipped (after the walkthrough fixes).

## Deferred and known issues

- The independent three-reviewer pass was run (blind, edge and verification-gap subagents). 21 findings: 11 fixed, 10 rejected with evidence, none deferred. The triage log is in the story spec.
- Demo seed data, the frontend session port and switcher: Stories 25.2 and 25.5.
- #184: a listener or job with no tenant reads nothing, silently. Decided in Story 3.7 (target 2027-01-08).
- Deferred index refreshed at story finish: closed #88 and #102 removed, open #175 added.
- Walkthrough follow-ups fixed in this story: a `DEMO IDENTITY ON` warning at start with the flag on (tested), and a default-deny criterion added to Story 3.1 (issue #44).
