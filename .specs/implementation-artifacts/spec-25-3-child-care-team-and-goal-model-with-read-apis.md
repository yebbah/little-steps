---
title: 'Story 25.3: Child, Care Team and Goal model with read APIs'
type: 'feature'
created: '2026-11-24'
status: 'in-progress'
baseline_commit: '3c0fca57e294aa80606cbbcc5af6d10d7feb1be8'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-25-demo-family-foundations.md'
  - '{project-root}/.specs/implementation-artifacts/epic-25-context.md'
  - '{project-root}/.specs/implementation-artifacts/spec-25-1-demo-identity-and-the-tenant-resolver.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** The core loop (Plan, Prep, Practice, Progress) must read the Child Profile, Care Team and Goals, but none of these tables or read endpoints exist, and the setup screens that will write them come much later (Epics 4 and 5).

**Approach:** Add the tenant-scoped tables and read-only endpoints for the Child Profile, Care Team Members (with Status Vocabulary and Prompt Levels), Goal Periods and Goals, each in the module that owns it (AD-9). No write endpoints. Tests insert rows directly, and Story 25.5 seeds them.

## Boundaries & Constraints

**Always:**
- Ownership (AD-9): `child` owns `child_profile` (one per Family, nickname required, no real name or date of birth); `careteam` owns `care_team_member`, `prompt_level` (the Family's ordered list), `status_vocabulary_item` (per member, ordinal, label) and an optional per-member Prompt Level mapping; `goals` owns `goal_period` and `goal`. A Prompt Level or Status Vocabulary item is retired (`retired_at`), never deleted.
- Every table has `family_id uuid NOT NULL REFERENCES families ON DELETE CASCADE`, `@TenantId`, a UUIDv7 `id` from `Uuids.v7()`, and a Flyway migration under `db/migration/<module>/` with a version after `V20261109_1020`. Cross-module references are plain ID columns (database foreign keys allowed) and never JPA associations (AD-1). `ModuleSkeletonTests` edges stay exactly as they are.
- Fields: Child Profile has `nickname`, `age_band` (free text), `interests`, `materials`, `engagement_notes`, and sensitivities (text and an `avoid` flag per row). Care Team Member has `role`, `discipline`, `care_setting` (`clinic`, `school`, `home_visit`, `online`). Goal Period belongs to one Care Team Member, with `starts_on`, `ends_on` and `status` (`current`, `closed`). Goal has `domain`, `description`, `source_kind` and `source_id`, `origin` (`prescribed`, `parent_proposed`), `original_text` (write-once, `updatable = false`) and `caregiver_text`, `goal_type` (`structured`, `narrative`), `parent_goal_id`, `context`, `baseline`, `review_status` (`proposed`, `discussed`, `confirmed`), `proposed_to`, `revised_from`, `lineage` (`new`, `carried_over`, `revised`), `retired_at`, and a Criterion (`criterion_kind` of `trials`, `duration_minutes`, `count`, `frequency_per_session`; `criterion_target`; `criterion_out_of` for trials; `criterion_prompt_level_id`; `criterion_context`).
- Database checks: a structured Goal has a Criterion and a narrative one has none; a `prescribed` Goal is `confirmed`; a `parent_proposed` Goal has `proposed_to`.
- Read endpoints, JSON under `/api/v1`, no write method: `GET /child-profile` (one Family record, problem `not-found` when none), `/care-team-members` (each with its Status Vocabulary and mapping), `/prompt-levels`, `/goal-periods`, `/goals`. Lists are ordered, stable, and include retired items with a `retired` flag. Each is documented in `backend/openapi.json`, and the frontend types are refreshed. The server sends codes and enums, never UI sentences.
- Test helpers: extend `DemoFixtures.reset()` to delete the new tables first, with insert helpers for rows.

**Never:**
- No write endpoint, form, seed or sensitivities-to-Restriction logic (Stories 25.4 and 25.5, Epics 4 to 6). No Strategy or Restriction table. No new module edge, no `isRoot()`, no native SQL.
- No Activity, Plan or Observation tables.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Read own Family | Family A has rows | each endpoint lists only A's rows, in order | n/a |
| Other Family | Family B's rows exist | never in A's lists | n/a |
| No profile | Family has no Child Profile | n/a | `404` `not-found` problem |
| No Caregiver | no demo header and flag off | n/a | `401` (existing gate) |
| Care Team Goal | `prescribed` row | `reviewStatus` `confirmed` | row with another status refused by the database |
| Parent-proposed Goal | `parent_proposed` row | `proposed`, names `proposed_to` | missing `proposed_to` refused |
| Retired level | `retired_at` set | still listed, `retired: true` | n/a |
| Structured Goal | criterion present | kind, target, out-of and Prompt Level shown | structured with no criterion refused |
| Narrative Goal | no criterion | criterion fields null | narrative with a criterion refused |
| Write attempt | `POST`, `PUT` or `DELETE` on any of these paths | n/a | `405` problem |

</frozen-after-approval>

## Code Map

- `backend/src/main/java/app/littlesteps/{child,careteam,goals}/{domain,persistence,web}/` -- skeleton packages exist; `family/persistence/CaregiverMembership.java` is the entity pattern, `family/web/SessionController.java` the controller and OpenAPI pattern (package-private `@RestController`, nested record DTOs, problem `@ApiResponse`).
- `backend/src/test/java/app/littlesteps/tenantprobe/TenantProbe.java` -- the `@TenantId` mapping (`@TenantId @Column(name = "family_id", nullable = false) UUID`).
- `backend/src/main/resources/db/migration/family/V20261109_1000__families_caregivers_membership.sql` -- SQL style: `uuid PRIMARY KEY`, `text` with `CHECK (... IN (...))`, `timestamptz`, partial unique indexes.
- `backend/src/test/java/app/littlesteps/{DemoFixtures,DemoIdentityTests,TenantIsolationTests}.java` -- fixtures, demo header, isolation test shape; `PersistenceBaselineTests` and `GlobalTablesTests` expectations on the table list.
- `backend/openapi.json`, `frontend/src/api/schema.d.ts` -- refresh with `./mvnw test -Dopenapi.update=true`, then `npm run api:types`.
- `shared/web/ProblemTypes.java` -- reuse `NOT_FOUND`, `METHOD_NOT_ALLOWED`.

## Tasks & Acceptance

**Execution:**
- [ ] Migrations and entities: `child_profile`, `care_team_member`, `prompt_level`, `status_vocabulary_item`, member Prompt Level mapping, `goal_period`, `goal`, with the checks
- [ ] Read services and controllers in `child.web`, `careteam.web`, `goals.web`
- [ ] Tests for every matrix row, a two-Family isolation test per endpoint, `ModularityTests`, `GlobalTablesTests` and `PersistenceBaselineTests` updates
- [ ] Refresh `openapi.json` and frontend types
- [ ] README and CONTRIBUTING lines; changelog, security report, sprint status

**Acceptance Criteria:** the Story 25.3 acceptance criteria in the epic file.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

Choices the sources leave open, decided here and recorded so Epics 4 and 5 can refine them by migration: `age_band` is free text (no list exists); the Care Setting codes are `clinic`, `school`, `home_visit`, `online`; Goal Period `status` is `current` or `closed`; the per-member Prompt Level mapping holds the member's own label for a Family level; the Criterion is columns on `goal`, with `criterion_out_of` used only by `trials`.

## Verification

**Commands:**
- `cd backend && JAVA_HOME=<openjdk@25 home> ./mvnw verify` -- expected: all tests pass, `ModularityTests` and `ModuleSkeletonTests` green
- `cd frontend && npm run api:check && npm run lint && npm run typecheck && npm run test:coverage` -- expected: all pass
- `deploy/security-scan.sh` -- expected: PASS
