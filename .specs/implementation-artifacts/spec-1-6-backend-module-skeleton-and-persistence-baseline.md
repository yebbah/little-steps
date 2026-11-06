---
title: 'Story 1.6: Backend module skeleton and persistence baseline'
type: 'feature'
created: '2026-11-06'
status: 'in-review'
baseline_commit: 'f66e007'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/little-steps/.specs/implementation-artifacts/epic-1-context.md'
  - '{project-root}/little-steps/.specs/planning-artifacts/epics/epic-01-local-environment.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The backend is one package. Features have no module to land in, nothing fails CI when a module crosses a boundary, and there is no database, migration layout or real-database test base.

**Approach:** One package per AD-1 module under `app.littlesteps`, each with a `package-info.java` declaring its allowed dependencies and empty `api`, `web`, `domain`, `persistence` packages. Spring Modulith verifies the graph. Flyway (one history, `db/migration/<module>/`), the JPA event publication registry and a Testcontainers PostgreSQL `IntegrationTest` base form the persistence baseline. Source: GitHub issue #31.

## Boundaries & Constraints

**Always:**
- Modules: `shared`; features `family`, `child`, `careteam`, `goals`, `library`, `practice`, `planning`, `progress`, `summary`, `importer`; platform `ai`, `notifications`, `audit`, `privacy`, `metrics`. The `import` module's package is `importer`: `import` is a Java keyword and cannot be a package name.
- Allowed dependencies are the AD-1 graph: the solid edges, `shared` for all, platform modules on `shared` only, features also on the platform `api` packages (dotted edges), `goals` on `ai`. Cross-module access goes to `<module>::api` only.
- `ModularityTests` runs `ApplicationModules.verify()`, writes the module documentation, and a fixture with a forbidden dependency fails.
- Cross-module events use `@ApplicationModuleListener` and the JPA registry with `republish-outstanding-events-on-restart=true`.
- Flyway locations `classpath:db/migration` (recursive), versions `V<yyyyMMdd>_<HHmm>__name.sql`. The only baseline table is the Modulith registry.
- `IntegrationTest` starts Testcontainers PostgreSQL (2.x artifact `testcontainers-postgresql`) from the digest in `deploy/images.yaml`. No H2.
- Profiles `local`, `test`, `prod`; credentials only from the environment. `backend/GLOBAL_TABLES.md` lists no tables.

**Never:** no feature tables, entities, endpoints or authentication; no credentials in files; no change to the security gate.

</frozen-after-approval>

## Code Map

- `backend/src/main/java/app/littlesteps/<module>/` -- `package-info.java` and the four layer packages.
- `backend/pom.xml` -- Modulith BOM 2.1.2, JPA, Flyway, PostgreSQL, Testcontainers.
- `backend/src/main/resources/` -- `application*.properties`, `db/migration/shared/`.
- `backend/src/test/java/` -- `IntegrationTest`, `ModularityTests`, `ModuleSkeletonTests`, `PersistenceBaselineTests`, fixture under `modulith/fixture/`.
- `deploy/compose.yaml` -- `app` service gets the database settings and waits for PostgreSQL.

## Tasks & Acceptance

**Execution:**
- [x] Module packages, `package-info.java`, layer packages
- [x] pom, properties, Flyway baseline, `GLOBAL_TABLES.md`
- [x] `IntegrationTest`, existing tests moved onto it
- [x] `ModularityTests` with fixture, `ModuleSkeletonTests`, `PersistenceBaselineTests`
- [x] compose `app` service environment; README, architecture note, changelog, security report, deferred issues

**Acceptance Criteria:**
- Given the backend, when `./mvnw verify` runs, then all 22 tests pass against a real PostgreSQL.
- Given a module that depends on another without declaring it, when `ModularityTests` runs, then it fails.
- Given the built jar and a PostgreSQL, when started with profile `local`, then Flyway migrates and `/actuator/health` is UP; without a profile it refuses to start.

## Spec Change Log

## Review Triage Log

Layers run: blind-hunter, edge-case-hunter, verification-gap (independent subagents, iteration 1).

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Declared edges never compared with AD-1; `verify()` passes vacuously on an empty skeleton (VG, EC) | medium | patch, fixed | `ModuleSkeletonTests.everyModuleDeclaresExactlyItsAd1Edges` |
| 2 | Layer packages and migration layout/naming unproven (VG) | medium | patch, fixed | `ModuleSkeletonTests.everyModuleHasTheFourLayerPackages`, `flywayMigrationsLiveInModuleFoldersWithTimestampedVersions` |
| 3 | No-H2 and GLOBAL_TABLES.md unchecked (VG) | low | patch, fixed | `ModuleSkeletonTests.noH2AndGlobalTablesListsNoTablesYet` |
| 4 | `images.yaml` path breaks when tests run from the repo root (BH, EC) | medium | patch, fixed | `IntegrationTest.postgresReference` tries both locations |
| 5 | README repeated a sentence after the edit (BH) | low | patch, fixed | README Development |
| 6 | Resubmission at startup and `local`/`prod` profiles not booted by a test (VG, EC) | medium | defer #83 | manual jar run showed local UP and no-profile refusal |
| 7 | `@EnableAsync` default executor, no context propagation; late prod datasource error (BH, EC) | low | defer #84 | no listener or tenant exists yet |
| 8 | Compose and tests could use different digests (VG) | medium | rejected | `deploy/check-images.sh` already fails when compose and `images.yaml` disagree; the test reads `images.yaml` |
| 9 | Hand-copied `event_publication` DDL might drift from Modulith (BH) | low | rejected | `ddl-auto=validate` plus the registry test run against it; the jar ships no SQL for JPA |
| 10 | Timestamp versions sort against later `V1.x` (EC) | low | rejected | AD-20 mandates timestamped versions |
| 11 | `dhi.io` pull needs `docker login` for tests (BH, EC) | low | rejected | same prerequisite as the stack itself; README prerequisites list Docker and the DHI login |
| 12 | `shared` is OPEN, internals not checked (BH) | low | rejected | AD-1: shared is the kernel every module may use |
| 13 | Two Spring contexts (MOCK vs RANDOM_PORT), thin `contextLoads` (BH, EC) | low | rejected | cost is seconds; `contextLoads` runs Flyway and schema validation |

## Verification

**Commands:**
- `cd backend && JAVA_HOME=<jdk 25> ./mvnw verify` -- expected: 22 tests pass
- `for t in deploy/tests/*.test.sh; do $t; done && deploy/check-images.sh` -- expected: all pass
- `docker compose --env-file deploy/local.env -f deploy/compose.yaml --profile full config -q` -- expected: valid
