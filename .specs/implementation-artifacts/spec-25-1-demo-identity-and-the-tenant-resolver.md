---
title: 'Story 25.1: Demo identity and the tenant resolver'
type: 'feature'
created: '2026-11-09'
status: 'in-review'
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
- [x] Migration, entities, repositories -- `families`, `caregivers`, `caregiver_membership`
- [x] `CurrentCaregiver` port, request filter, `401` path, tenant holder and Hibernate resolver
- [x] Demo resolver, flag, startup guard, `GET /api/v1/session`
- [x] `GLOBAL_TABLES.md`, architecture test (an entity without `@TenantId` must be listed) and a native-query test (every native query filters on `family_id`)
- [x] Test-only `tenant_probe` and the two-Family isolation test; tests for the matrix, including the `prod` guard with `ApplicationContextRunner`
- [x] Refresh `openapi.json` and frontend types; README and CONTRIBUTING lines for the flag; changelog, security report, sprint status

**Acceptance Criteria:** the Story 25.1 acceptance criteria in the epic file.

## Implementation Notes

- Added `family` tables, `CurrentCaregiver` port, a temporary servlet filter, the demo resolver and guard, `GET /api/v1/session`, and the `shared.persistence` tenant holder and Hibernate resolver. The 401 gate matches the container's decoded, normalised path after review finding 1.
- The membership table is read by `caregiver_id` and `ended_at is null`, because the Family is not known yet; its `family_id` column is indexed.
- `caregivers.email` is NOT NULL (the spec lists the column but not its nullability).
- Existing tests changed: logging test endpoints moved to `/test-support/...`; the 404 tests use `/api/v2/...` (unknown `/api/v1` paths are 401 without a Caregiver, covered by new tests with one); `PersistenceBaselineTests` and `ModuleSkeletonTests` expect the new tables.
- Maven needs `JAVA_HOME` set to the Homebrew `openjdk@25` (the default JDK is 17). No JaCoCo gate exists in `pom.xml`.
- Verification after review: `./mvnw verify` 94 tests, 0 failures, 0 skipped; `deploy/security-scan.sh` PASS; `npm run api:check` up to date.

## Spec Change Log

## Review Triage Log

Reviewers: BH blind, EC edge, VG verification gap (three separate subagents). The review diff left out the spec, sprint status and the two generated files (`openapi.json`, `schema.d.ts`).

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | `CaregiverFilter.shouldNotFilter` matches the raw request URI: encoded (`/api/%76%31/..`), `;` path parameter and dot-segment forms skip the filter while Spring MVC still routes them, so the 401 gate fails open [BH, EC, VG] | high | patch, fixed | `CaregiverFilter.java` matches on the container's decoded, normalised path; new variant cases in `DemoFlagOffTests` |
| 2 | The 404 and no-leak-in-logs tests moved to `/api/v2`, so the not-found contract and log redaction for unknown `/api/v1` paths are no longer tested [BH, EC] | medium | patch, fixed | demo-on test for a `not-found` problem without detail, and a no-leak log case for `/api/v1` |
| 3 | A 401 from the filter may lack `X-Request-Id` and the access log line [BH] | false | rejected | `RequestIdFilter` is `HIGHEST_PRECEDENCE`, so it runs before `CaregiverFilter` (+10); the verify log shows `GET UNMATCHED -> 401` with a `requestId` |
| 4 | `GET /api/v1/session` lists every Caregiver, across Families [BH] | low | patch, fixed | by spec (demo only); docs state it plainly in CONTRIBUTING |
| 5 | `TenantContext` is a ThreadLocal: not carried into async, listener or job threads, and no tenant silently reads nothing [BH, EC] | low | patch, fixed | fail-closed by design (reads empty, writes fail on the FK); CONTRIBUTING states that a listener or job opens `TenantContext` from the payload's `family_id` |
| 6 | The `OncePerRequestFilter` skips async and error dispatch [EC] | low | rejected | no async endpoint exists; the filtered request already set its tenant |
| 7 | `Uuids.v7()` is not monotonic within a millisecond [BH, EC] | low | rejected | AD-4 asks for UUIDv7, and RFC 9562 does not require monotonic order within a millisecond |
| 8 | Nothing asserts `Uuids.v7()` version, variant, timestamp or ordering across calls [VG, BH] | medium | patch, fixed | new `UuidsTests` |
| 9 | `DemoGuard` is tested only on a hand-built context, so removing `@Component` or the `LS_DEMO` mapping would pass [BH, VG] | medium | patch, fixed | a test boots the real application with `prod` and `LS_DEMO=true` and expects the guard's failure |
| 10 | "Tenant is cleared after the request" asserts on the test thread, not the request thread [VG] | medium | patch, fixed | direct `TenantContextTests` (close, nested restore, close after an exception) |
| 11 | Weak isolation tests: the cross-write accepts any 4xx, and the "naming another Family" test passes if nothing is stored [BH] | medium | patch, fixed | assert the exact status and outcome |
| 12 | The spec requires `openapi.json`, frontend types and sprint status, and the diff shows none [BH, EC] | false | rejected | they changed (types 64 lines, `OpenApiContractTests` passes); the review diff excluded them |
| 13 | Changelog "80+ tests", placeholder commit field, reviewer pass "not run", deferred wording without issue links [BH, EC] | low | patch, fixed | records updated after review, in the finishing step |
| 14 | `ZoneId.of` accepts offsets such as `+02:00`, which are not IANA IDs [EC] | low | patch, fixed | `Family` requires `ZoneId.getAvailableZoneIds()`; test |
| 15 | `GlobalTablesTests` reads only an entity's own fields, not a `@MappedSuperclass` [EC] | low | patch, fixed | walk the class hierarchy |
| 16 | The native-query check is a substring test and misses other routes [EC] | low | rejected | no native query exists; main code bans `createNativeQuery`, `JdbcTemplate` and `JdbcClient` outright; a stronger check is a design choice for the first native query |
| 17 | No default Caregiver when the earliest has no membership [EC] | low | rejected | spec: the earliest-created Caregiver, and no membership is 401 |
| 18 | A repeated or lenient-form `X-Demo-Caregiver` is accepted [EC] | low | rejected | the parsed value must equal an existing Caregiver ID, so no wrong match is possible |
| 19 | A resolver exception (database failure) is a generic problem, untested [VG] | low | rejected | fails closed as an unexpected-error problem; no known trigger |
| 20 | Migration and entity nitpicks: `week_start` checked twice, `role` limited to one value, `email` NOT NULL, no `@Version`, no code path to end a membership [BH] | low | rejected | defence in depth, and the spec's own model; membership ending is Story 3.9 |
| 21 | Test import order, `GlobalTablesTests` scanning test classes, `DemoFixtures` assuming the probe table [BH] | low | rejected | cosmetic or test-only; `DemoFixtures` is used only where the probe migration runs |

## Design Notes

"First Caregiver" is the earliest `created_at`, then smallest `id`: Story 25.5 inserts the seed in order, and nothing here seeds data. Story 3.1 replaces the demo source of `CurrentCaregiver` with the Keycloak one and removes the temporary `401` filter in favour of Spring Security.

## Verification

**Commands:**
- `cd backend && ./mvnw verify` -- expected: all tests pass, `ModularityTests` and `ModuleSkeletonTests` green, JaCoCo gate met
- `deploy/security-scan.sh` -- expected: PASS
