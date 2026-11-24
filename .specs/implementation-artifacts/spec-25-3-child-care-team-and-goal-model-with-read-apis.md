---
title: 'Story 25.3: Child, Care Team and Goal model with read APIs'
type: 'feature'
created: '2026-11-24'
status: 'done'
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

- Review fixes (2026-11-24): every cross-table reference is a composite foreign key with `family_id`; references to history refuse the delete (NO ACTION), only owned child rows cascade; a trigger makes `goal.original_text` write-once; new checks on origin and source, self-reference, `revised` and blank text; one `current` period per member. Verification after review: backend 138 tests, frontend 388 unit and 89 e2e tests, scan PASS.

- Migrations `child/V20261124_1000`, `careteam/V20261124_1010`, `goals/V20261124_1020`; entities are read-only (getters, protected constructor), each with `@TenantId`. Sensitivities are rows of `child_sensitivity`; the Criterion is flat columns on `goal` and the API returns them flat, all null for a narrative Goal. `criterion_out_of` is checked for trials only. `goal_period_id` is nullable (a parent-proposed Goal need not sit in a period); `source_kind` is limited to `care_team_member` or `caregiver` (AD-10).
- Ordering: members and Goals by `created_at`, Prompt Levels and vocabulary by `ordinal`, Goal Periods by `starts_on`, all then by `id`. A retired Prompt Level or word gives its ordinal to a new one (partial unique index).
- No Child Profile is a bare `ResponseStatusException(404)`, rendered as the `not-found` problem. `./mvnw verify`: 122 tests, 0 failures. The three-reviewer pass was not run.

## Spec Change Log

## Review Triage Log

Reviewers: BH blind, EC edge, VG verification gap (three separate subagents). The review diff left out the spec, sprint status, the Epic 25 context and the two generated API files.

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Cross-Family references are not enforced by the database: a row in Family A can name a member, level, period or goal of Family B, because the foreign keys check `id` only [BH, EC, VG] | high | patch, fixed | composite `(id, family_id)` keys and composite foreign keys on every cross-table reference; a test that a cross-Family reference is refused |
| 2 | `ON DELETE CASCADE` from member to period and period to goal deletes history, and `SET NULL` drops a Goal's Prompt Level or proposed member silently [BH] | high | patch, fixed | those references refuse the delete (no cascade), the Family purge still cascades from `families`; tests |
| 3 | `original_text` is write-once only through the JPA mapping, and the test reads the annotation by reflection [BH, EC, VG] | medium | patch, fixed | a database trigger refuses any change of `original_text`; a JDBC test |
| 4 | The 401 test sends an unknown demo ID with the flag on, not the matrix case of no Caregiver [BH, EC, VG] | medium | patch, fixed | a flag-off test over the five paths |
| 5 | Migration rules are not exercised: the active-ordinal unique indexes and reuse of a retired ordinal, `ends_on >= starts_on`, positive target, trials `out_of >= target`, the member-level unique pair [VG, BH] | medium | patch, fixed | tests that insert the colliding and the accepted rows |
| 6 | Two `current` Goal Periods for one member are accepted, so "the member's current period" is ambiguous [BH, EC] | medium | patch, fixed | a partial unique index on `(care_team_member_id) WHERE status = 'current'`; test |
| 7 | `origin` and `source_kind` can contradict (a prescribed Goal sourced from a Caregiver); a Goal can be its own parent or revision, and `revised` can have no `revised_from`; `original_text` can be blank [EC] | medium | patch, fixed | CHECKs for each; tests |
| 8 | `PersistenceBaselineTests` compares table names in the database's sort order [EC] | low | patch, fixed | compared in any order |
| 9 | No test returns `caregiverText` or `lineage` through the API [BH] | low | patch, fixed | assertions added |
| 10 | Unused `java.time.Instant` import in `MemberPromptLevel` [BH] | low | patch, fixed | removed |
| 11 | CONTRIBUTING omits retired Goals; the README does not list the endpoints [BH] | low | patch, fixed | one line each, README links to CONTRIBUTING for the rule |
| 12 | Records incomplete (commit placeholder, "each database check" overstated, review pass not recorded) [BH] | low | patch, fixed | finished after the fixes, in the finishing step |
| 13 | `openapi.json` and the frontend types are missing from the diff [BH, EC] | false | rejected | they changed (`api:check` passes, `OpenApiContractTests` passes); the review diff left them out |
| 14 | A `kind` without a target, or an `out_of` with a null target, is possible [EC] | false | rejected | `goal_structured_has_criterion` and `goal_narrative_has_no_criterion` already forbid both |
| 15 | A current period must have no `ends_on`, a closed one must [EC] | false | rejected | UX-DR61 gives every period an end date (start plus 3 months), so a current period has one |
| 16 | Entity mappings are uneven (`created_at` getters, `getFamilyId`), `DemoFixtures` style, a magic number, a Javadoc wording [BH] | low | rejected | cosmetic; the fields are not read by any API |
| 17 | Lists are unbounded and include retired rows; the effective Goal text is left to the client; `Cache-Control` and read audit are not discussed [BH, EC] | low | rejected | Family-scale data; filters and pagination arrive with their first consumer; browsers do not heuristically cache a response without validators; read audit is Epic 17 |
| 18 | `CareTeamService` loads vocabulary for the whole tenant and drops orphans silently [EC] | low | rejected | tenant-scoped and small; the foreign key prevents orphans |
| 19 | `goal.source_id` has no foreign key and is not checked against `source_kind` [EC, BH] | low | rejected | a Source is a typed reference to either a member or a Caregiver (AD-10); the kind check and the new origin check bound it |
| 20 | Missing index on the status vocabulary, mapping and period foreign keys; `child_sensitivity.ordinal` is not unique [BH] | low | rejected | read volume is tiny; ordering falls back to the id |

## Design Notes

Choices the sources leave open, decided here and recorded so Epics 4 and 5 can refine them by migration: `age_band` is free text (no list exists); the Care Setting codes are `clinic`, `school`, `home_visit`, `online`; Goal Period `status` is `current` or `closed`; the per-member Prompt Level mapping holds the member's own label for a Family level; the Criterion is columns on `goal`, with `criterion_out_of` used only by `trials`.

## Verification

**Commands:**
- `cd backend && JAVA_HOME=<openjdk@25 home> ./mvnw verify` -- expected: all tests pass, `ModularityTests` and `ModuleSkeletonTests` green
- `cd frontend && npm run api:check && npm run lint && npm run typecheck && npm run test:coverage` -- expected: all pass
- `deploy/security-scan.sh` -- expected: PASS
