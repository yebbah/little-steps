---
title: 'Story 25.1: Demo identity and the tenant resolver'
type: 'feature'
created: '2026-11-09'
status: 'ready-for-dev'
baseline_commit: 'c76c97bc52a35977b689c2f62c2ad53af7e56223'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-25-demo-family-foundations.md'
  - '{project-root}/.specs/implementation-artifacts/epic-25-context.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** No request runs as a Caregiver in a Family, so no Family-owned feature can be built on the tenancy it will have in production, and sign-in (Epic 3) is far off.

**Approach:** Add the Family identity tables, a `CurrentCaregiver` port, the AD-2 tenant resolver and a demo resolver. The demo resolver is enabled only by a flag, only in profiles `local` and `test`, and never in `prod`. Without it, every Family endpoint returns `401`.

## Boundaries & Constraints

**Always:**
- The Family comes only from the Caregiver's active membership, never from a request value. No request path, and no seed, resolves to the root tenant.
- Tables: `families` (`timezone` IANA, `week_start` default Monday, `created_at`), `caregivers` (`id`, `sub` unique, `display_name`, `email`, `created_at`), `caregiver_membership` (Caregiver, Family, `role` = caregiver, `joined_at`, `ended_at`, `end_reason`); at most one active membership per Caregiver. IDs are UUIDv7. Flyway under `db/migration/family/`.
- `families`, `caregivers` and `caregiver_membership` are read before a tenant exists, so they are listed in `backend/GLOBAL_TABLES.md` (the membership table keeps its `family_id` column and is always queried with it). Every later Family-owned table uses `@TenantId`.
- The port is `family.api.CurrentCaregiver` (Caregiver ID, `sub`, Family ID). The tenant resolver for Hibernate lives in `shared` and reads a holder that `family.web` fills, so `shared` stays dependency-free and the AD-1 edges are unchanged.
- No `CurrentCaregiver`: every `/api/v1` request except `/api/v1/ping` gets `401` problem type `unauthenticated` (existing `ProblemTypes`), through the existing problem handler. Health and `/v3/api-docs` are unaffected.
- Demo: property `littlesteps.demo.enabled` (env `LS_DEMO`, default off). On in profile `local` or `test`: the demo resolver reads header `X-Demo-Caregiver` (a Caregiver ID), defaulting to the earliest-created Caregiver, and an unknown ID or a Caregiver with no active membership gets `401`. Demo Caregivers keep fixed `sub` values.
- `GET /api/v1/session`: Caregiver ID, `sub`, display name, Family ID, `demo: true`, and all Caregivers (ID and display name); `401` without the flag. It is documented in `backend/openapi.json`, and the generated frontend types are refreshed.
- The demo resolver and the header are not beans in `prod`. Startup fails when the flag is on in `prod` or with no profile.
- Test-only: a `tenant_probe` table and endpoints under `src/test` (Flyway location added for the `test` profile only), to prove `@TenantId` isolation until real Family tables exist.

**Never:**
- No Spring Security, Keycloak, invites, consent, Family creation, or seed data (Stories 3.x and 25.5).
- No new module edge, and no `isRoot()` outside a scheduled job.
- No log or response carries a Caregiver's email or display name beyond `/api/v1/session`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Demo default | flag on, no header | session of the earliest Caregiver, Family scoped | n/a |
| Demo switch | header = second Caregiver | that Caregiver's `sub` and Family | n/a |
| Unknown header | flag on, bad or unknown ID | n/a | `401` `unauthenticated` |
| No membership | Caregiver without active membership | n/a | `401` |
| Flag off | `local`, no flag | n/a | `401` on every `/api/v1` except ping, and on `/session` |
| Header, flag off | header sent | header ignored | `401` |
| Prod, flag on | profile `prod`, `LS_DEMO=true` | n/a | startup fails |
| Two Families | A reads B's probe row by ID | not found; list shows only A's | cross-write rejected |

</frozen-after-approval>

## Code Map

- `backend/src/main/java/app/littlesteps/family/{api,domain,persistence,web}/` -- the new code; `family` declares no edge beyond `shared` and the platform `api`s (see `ModuleSkeletonTests`).
- `backend/src/main/java/app/littlesteps/shared/web/{ProblemTypes,ProblemExceptionHandler}.java` -- reuse `UNAUTHENTICATED`; add a shared exception mapped to it. `RequestIdFilter` is the model for a servlet filter (order, MDC).
- `backend/src/main/java/app/littlesteps/shared/` -- new tenant holder and Hibernate `CurrentTenantIdentifierResolver` (Hibernate 7, Boot 4.1: check how Boot registers the bean).
- `backend/src/main/resources/db/migration/shared/` -- existing layout; add `family/` with a dated `V2026...__families_caregivers_membership.sql`. Update the `flywayCreatesOnlyTheRegistryAndItsHistory` assertion in `PersistenceBaselineTests`.
- `backend/src/test/java/app/littlesteps/IntegrationTest.java` -- shared Testcontainers base; new tests extend it.
- `backend/src/test/java/app/littlesteps/OpenApiContractTests.java` and `backend/openapi.json`, `frontend/src/api/schema.d.ts` -- refresh with `./mvnw test -Dopenapi.update=true` then `npm run api:types`.
- `backend/GLOBAL_TABLES.md` -- list the three tables.

## Tasks & Acceptance

**Execution:**
- [ ] Migration, entities, repositories -- `families`, `caregivers`, `caregiver_membership`
- [ ] `CurrentCaregiver` port, request filter, `401` path, tenant holder and Hibernate resolver
- [ ] Demo resolver, flag, startup guard, `GET /api/v1/session`
- [ ] `GLOBAL_TABLES.md`, architecture test (an entity without `@TenantId` must be listed) and a native-query test (every native query filters on `family_id`)
- [ ] Test-only `tenant_probe` and the two-Family isolation test; tests for the matrix, including the `prod` guard with `ApplicationContextRunner`
- [ ] Refresh `openapi.json` and frontend types; README and CONTRIBUTING lines for the flag; changelog, security report, sprint status

**Acceptance Criteria:** the Story 25.1 acceptance criteria in the epic file.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

"First Caregiver" is the earliest `created_at`, then smallest `id`: Story 25.5 inserts the seed in order, and nothing here seeds data. Story 3.1 replaces the demo source of `CurrentCaregiver` with the Keycloak one and removes the temporary `401` filter in favour of Spring Security.

## Verification

**Commands:**
- `cd backend && ./mvnw verify` -- expected: all tests pass, `ModularityTests` and `ModuleSkeletonTests` green, JaCoCo gate met
- `deploy/security-scan.sh` -- expected: PASS
