# Changelog: Story 1.6, Backend module skeleton and persistence baseline

| | |
|---|---|
| Story | 1.6, issue #31 |
| Epic | 1, Local environment and project skeleton |
| Branch | feature/epic-01-issue-31-backend-module-skeleton |
| Commits | see the Story 1.6 commit on the branch (baseline f66e007) |
| Date | 2026-11-06 |
| Security report | [story-1-6-backend-module-skeleton-and-persistence-baseline.md](../security-reports/story-1-6-backend-module-skeleton-and-persistence-baseline.md) |

## Summary

Every feature now has a module to land in, and the build fails when a module crosses a boundary. The backend has one package per AD-1 module, Spring Modulith verification, a Flyway migration layout, the JPA event publication registry, environment-only configuration with `local`, `test` and `prod` profiles, and an `IntegrationTest` base that runs against a real PostgreSQL in Testcontainers.

## Added

- 16 module packages under `app.littlesteps` (`shared`; `family`, `child`, `careteam`, `goals`, `library`, `practice`, `planning`, `progress`, `summary`, `importer`; `ai`, `notifications`, `audit`, `privacy`, `metrics`), each with `package-info.java` declaring its allowed dependencies per AD-1 and empty `api`, `web`, `domain`, `persistence` packages. The `import` module is `importer` because `import` is a Java keyword.
- Spring Modulith 2.1.2 (BOM), Spring Data JPA, Flyway with PostgreSQL, PostgreSQL driver, Testcontainers 2.x (`testcontainers-postgresql`).
- `db/migration/shared/V20261106_1000__event_publication_registry.sql`: the only baseline table (the Modulith event publication registry).
- `application-local.properties`, `application-prod.properties`, test `application-test.properties`; no credentials in any file.
- `backend/GLOBAL_TABLES.md` (lists no tables yet).
- Tests: `IntegrationTest`, `ModularityTests` (verify, module documentation in `backend/target/spring-modulith-docs/`, a fixture with a forbidden dependency that must fail), `ModuleSkeletonTests`, `PersistenceBaselineTests`.

## Changed

- The backend needs a database: it refuses to start without a profile that supplies one. Existing web tests extend `IntegrationTest` and need Docker.
- `deploy/compose.yaml`: the `app` service gets the database settings from `local.env` and waits for PostgreSQL to be healthy.
- `@EnableAsync` on the application class (needed by `@ApplicationModuleListener`).
- README (Development, Layout) and `docs/architecture.md` updated.

## Fixed

None.

## Removed or deprecated

None.

## Security

No blocking finding, no new exception, no new warning of note. See the [security report](../security-reports/story-1-6-backend-module-skeleton-and-persistence-baseline.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | No change | Setup (reviewed) |
| Development | Run the backend with `SPRING_PROFILES_ACTIVE=local` and the `deploy/local.env` variables exported; tests need Docker and the `dhi.io` login | Development (updated) |
| Release | No change | Release (reviewed, no change) |
| Deployment | `prod` profile takes `SPRING_DATASOURCE_URL`, `_USERNAME`, `_PASSWORD` | Development, Layout (updated); Prerequisites, Versions reviewed, no change |

## After you pull

Export the `deploy/local.env` variables and set `SPRING_PROFILES_ACTIVE=local` in your IDE run configuration, after `deploy/dev-up.sh`. Run backend tests with JDK 25 and Docker running.

## Tests

New: 4 `ModuleSkeletonTests`, 4 `ModularityTests` (one negative: forbidden dependency fails), 3 `PersistenceBaselineTests` (real PostgreSQL, baseline tables only, incomplete publication resubmitted). Non-regression: the 11 existing backend tests now run on the real database. `cd backend && ./mvnw verify`: 22 passed, 0 failed. `deploy/tests/*.test.sh`: all pass (security-scan 67/67), `deploy/check-images.sh` OK, `docker compose ... --profile full config -q` valid. Manual: the jar started with profile `local` against PostgreSQL, Flyway applied 1 migration, health UP; without a profile it refuses to start.

## Deferred and known issues

- [#83](https://github.com/yebbah/little-steps/issues/83): test the startup resubmission and the `local`/`prod` profiles for real (2027-01-05).
- [#92](https://github.com/yebbah/little-steps/issues/92): production profiles from env files and a least-privilege database role
- [#84](https://github.com/yebbah/little-steps/issues/84): async listener executor and context propagation; clear prod datasource error (2027-02-04).
- Not run: the full `dev-up.sh --full` image build with the database wiring (only compose config validation and a jar run).
