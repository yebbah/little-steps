---
title: 'Story 25.4: Strategies, Restrictions and Guardrail'
type: 'feature'
created: '2026-11-24'
status: 'in-progress'
baseline_commit: '001673b7878fb5696dcb25f3ae499abbf19cba1d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-25-demo-family-foundations.md'
  - '{project-root}/.specs/implementation-artifacts/epic-25-context.md'
  - '{project-root}/.specs/implementation-artifacts/spec-25-3-child-care-team-and-goal-model-with-read-apis.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** Nothing yet stops an Activity, Plan item or tip that conflicts with a Care Team Restriction or an "avoid" sensitivity from reaching Today, and there are no Strategy or Restriction records to check against. The Restriction forms are far off (Epic 6), but the core loop (Epics 7 to 9) must be checked from its first screen.

**Approach:** Add the `strategy` and `restriction` tables with read endpoints (`goals`), a `RestrictionLookup` port (`ai`, implemented by `goals`) that returns the Family's Restriction set and a `restriction_set_version`, and a deterministic `Guardrail.check(items, scope)` (`ai`) that drops or flags items. Fail closed. No write endpoints.

## Boundaries & Constraints

**Always:**
- Tables in `goals`, built with the rules Story 25.3 settled: `family_id` with `@TenantId`; composite `(id, family_id)` keys and composite foreign keys for every reference; references to a Goal refuse the delete (NO ACTION) and never cascade; `original_text` write-once through a database trigger, with `caregiver_text` for edits (AD-10); checks that `origin` and `source_kind` agree (`prescribed` with `care_team_member`, `parent_proposed` with `caregiver`) and that text is not blank. A Strategy belongs to a Goal. A Restriction belongs to a Goal or, with no Goal, to the Family. Both have `retired_at`; a retired Restriction no longer applies. A Restriction also has optional `avoid_terms` (zero or more phrases, one row each in a child table). Read endpoints `GET /api/v1/strategies` and `/restrictions`, ordered, retired included with a `retired` flag, in `openapi.json` and the frontend types.
- `ai.api` defines `RestrictionLookup`, `Guardrail`, `GuardrailItem` (id, kind of Activity, Plan item, Prep card or Coach Tip, origin of `curated`, `prescribed` or `ai_suggested`, searchable text), a scope (a Goal ID or none), the outcomes, and a `ScopeClassifier` port. `goals` implements `RestrictionLookup`. `child.api` gains a query returning the Family's "avoid" sensitivities, read live (no copy). `ModuleSkeletonTests` edges stay exactly as they are.
- `RestrictionLookup` returns the Restrictions for the Goal and the Family (not retired) plus the "avoid" sensitivities, and a `restriction_set_version`: a hash of the live set that changes when any Restriction, avoid term, retirement or sensitivity changes, and is stable otherwise.
- Matching (deterministic): normalise text by lowercasing, turning punctuation into spaces and ignoring a plural ending. A Restriction or sensitivity matches an item when the item's normalised text contains, on whole-word boundaries, the target phrase or any avoid term. The target phrase is the Restriction's text with leading avoid words removed (`no`, `not`, `never`, `avoid`, `don't`, `do not`, `without`, `stop`). Example: "No hand-over-hand prompting" targets "hand over hand prompting".
- Outcomes: a match drops a `curated` or `ai_suggested` item. A `prescribed` item is never dropped: on a match it is kept with the code `restriction-conflict` (the app shows "conflicts with a recorded Restriction — check with your therapist"). If the check cannot run (lookup or classifier throws or is unavailable) a `curated` or `ai_suggested` item is dropped, and a `prescribed` one is kept flagged.
- The `ScopeClassifier` default answers clear for non-AI items and unavailable for `ai_suggested`, so AI items are dropped until Epic 13 supplies one. A classifier answer "check with your therapist" adds that flag.
- Results are cached against the Family and `restriction_set_version`; the cache entry is invalid as soon as the version differs.
- Cases in `eval/guardrails/*.yaml`, tagged `guardrail-eval`, for: a Restriction match, an "avoid" sensitivity match, a prescribed flag, a version change and an unavailable check. They also run in the default `./mvnw verify` (the exclusion of `guardrail-eval` in `pom.xml` stays), through an untagged test over the same files for the cases that need no model.

**Never:**
- No write endpoint, form, seed, Activity, Plan or Observation table, model or AI call, and no change to the Epic 25 module edges. No derived copy of sensitivities or Restrictions. No native SQL.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Restriction match | "No hand-over-hand prompting"; curated item with "hand-over-hand" | item dropped | n/a |
| Avoid term | Restriction with avoid term "sticky"; item "sticky dough" | dropped | n/a |
| Sensitivity | sensitivity "sticky textures", avoid on; item mentions "sticky texture" | dropped (plural ignored) | n/a |
| Not avoided | sensitivity with avoid off | item kept | n/a |
| Prescribed | prescribed item matching a Restriction | kept with `restriction-conflict` | n/a |
| Retired | retired Restriction | does not apply | n/a |
| Other Goal | Restriction on Goal A, item scoped to Goal B | does not apply; a Family-level one does | n/a |
| No false hit | item "handing out cards" and a target "hand over hand" | kept | n/a |
| Version | add, retire or edit a Restriction or sensitivity | `restriction_set_version` changes; unchanged data keeps it | n/a |
| Cache | same items twice, then a change | second call uses the cache; after the change it recomputes | n/a |
| Unavailable | lookup throws; AI item | dropped | fails closed |
| Unavailable prescribed | lookup throws; prescribed item | kept, flagged | fails closed |
| Other Family | Family B's Restriction | never applies to Family A | n/a |

</frozen-after-approval>

## Code Map

- `backend/src/main/java/app/littlesteps/ai/{api,domain}/`, `goals/{persistence,domain,web}/`, `child/api/` -- new code. `ai` allows only `shared`; `goals` allows `ai::api`, `child::api` and `careteam::api`.
- `backend/src/main/resources/db/migration/goals/V20261124_1020__goal_periods_and_goals.sql` -- the 25.3 SQL pattern (composite keys, no-action deletes, write-once trigger, origin check); new migration after `V20261124_1020`.
- `backend/src/main/java/app/littlesteps/goals/web/` and `persistence/Goal.java` -- controller and entity patterns; `shared/persistence/TenantContext.java` for the current Family.
- `backend/src/test/java/app/littlesteps/{ReadApiTests,DemoFixtures,ModuleSkeletonTests}.java` -- fixtures and edge test.
- `eval/guardrails/` (only a `.gitkeep` or README today) and `backend/pom.xml` (surefire excludes `guardrail-eval`; `deploy/tests/ci-workflow.test.sh` checks that line).

## Tasks & Acceptance

**Execution:**
- [ ] Migration, entities and read endpoints for `strategy`, `restriction` and avoid terms
- [ ] `ai.api` types, `Guardrail`, matching, outcomes, cache, `ScopeClassifier` default
- [ ] `RestrictionLookup` in `goals`, the `child.api` sensitivities query, `restriction_set_version`
- [ ] Cases under `eval/guardrails/` and the two runners
- [ ] Tests for every matrix row, refusals for each database rule, two-Family isolation, `ModularityTests`; refresh `openapi.json` and frontend types
- [ ] README and CONTRIBUTING lines; changelog, security report, sprint status

**Acceptance Criteria:** the Story 25.4 acceptance criteria in the epic file.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

The specs name the check but not how a free-text Restriction matches an item. The maintainer chose phrases plus optional avoid terms (2026-11-24). Stripping the leading avoid word is needed because a Restriction reads "no X" while an item that conflicts says "X". A false match hides a safe item; a missed match would show an unsafe one, so ties go to dropping.

## Verification

**Commands:**
- `cd backend && JAVA_HOME=<openjdk@25 home> ./mvnw verify` -- expected: all tests pass, `ModularityTests` and `ModuleSkeletonTests` green, the guardrail cases run
- `cd frontend && npm run api:check && npm run lint && npm run typecheck && npm run test:coverage && npx playwright test --project=chromium` -- expected: all pass
- `deploy/security-scan.sh` -- expected: PASS
