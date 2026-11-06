# Security report: Story 1.6, Backend module skeleton and persistence baseline

| | |
|---|---|
| Story | 1.6, issue #31 |
| Branch | feature/epic-01-issue-31-backend-module-skeleton |
| Commit scanned | working tree on baseline f66e007 (not committed yet) |
| Date | 2026-11-06 |
| Verdict | PASS WITH WARNINGS (no new exception) |

## 1. Summary

The story adds backend dependencies (JPA, Flyway, PostgreSQL driver, Spring Modulith, Testcontainers) and database configuration read only from the environment. The full scan passes (`RESULT: PASS`): no blocking finding, no new exception. The scan was run once, after all review fixes (the review fixes were test-only and documentation changes).

## 2. Scan result

Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 169 | PASS | 0 | 0 new |
| Frontend dependencies | 439 | PASS | 0 | 3 (unchanged) |
| Container images (8 scanned, 2 deferred Presidio) | see build/security | PASS | 0 | busybox CVE-2025-60876 (6.5, no fix) and others, unchanged |

### Warnings (below 7.0, not in KEV)

The three frontend warnings are unchanged from Story 1.5 (deepmerge CVE-2026-93753, glob CVE-2026-118773, minimatch CVE-2026-118764). This story adds no backend warning.

## 3. Exceptions

The existing exceptions in `security/exceptions.yaml` (Keycloak image #56, JDK build image #68) are unchanged and expire 2026-12-04. None added.

## 4. Container images

No image added or changed. The Testcontainers PostgreSQL test image is `dhi.io/postgres:18-alpine`, read at test time from `deploy/images.yaml`, so it is the digest-pinned image the stack uses. Images from outside DHI: unchanged (Mailpit, deferred Presidio).

## 5. Supply chain

New Maven dependencies, all resolved through Maven Central: Spring Modulith 2.1.2 (BOM), PostgreSQL driver, Flyway PostgreSQL, Testcontainers 2.x (versions from the Spring Boot BOM). They are in the CycloneDX SBOM and scanned as part of the 169 backend components. No new tool or action.

## 6. Secrets and data handling

Secret scan clean. No credentials in any properties file: the `local` profile reads `LS_POSTGRES_*` from the environment, `prod` reads `SPRING_DATASOURCE_*`, and without a profile the app has no datasource and does not start. Compose passes the database password to the `app` service by environment. The event publication registry stores serialized events; AD-1 requires payloads to carry IDs and `family_id` only, which later stories must follow. `flyway.clean-disabled=true` in all profiles. The new `event_publication` table is not Family-owned (documented in `backend/GLOBAL_TABLES.md`).

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `cd backend && ./mvnw test` | 11 passed (module graph, skeleton, Flyway baseline, real PostgreSQL, resubmission) |
| New negative tests | same | forbidden dependency fails verify (fixture); no H2; only baseline tables |
| Non-regression suite | `./mvnw test`; `deploy/tests/*.test.sh` | 22 passed, 0 failed; shell tests all pass |

## 8. Review findings with security impact

Review triage log in `.specs/implementation-artifacts/spec-1-6-backend-module-skeleton-and-persistence-baseline.md`. Security-relevant: async listeners run without request or tenant context (defer [#84](https://github.com/yebbah/little-steps/issues/84)); a missing prod datasource fails late (same issue).

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Startup resubmission and profiles not booted by a test, [#83](https://github.com/yebbah/little-steps/issues/83) | a config regression goes unseen | first story with a listener, or 1.8 |
| Async context propagation, [#84](https://github.com/yebbah/little-steps/issues/84) | a listener could act without tenant scope | first cross-module listener story |
| Database user is the compose owner role | broad privileges for the app | accepted for local; least-privilege role and prod profiles from env files tracked in #92 |

## 10. Sign-off

Signed off by the maintainer on 2026-11-06. Accepted: the `importer` package name, the `local` profile requirement for IDE runs, the hand-written event-registry migration, and the owner database role for local use (production profiles from env files and a least-privilege role are tracked in #92).
