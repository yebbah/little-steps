---
title: 'Story 25.4: Strategies, Restrictions and Guardrail'
type: 'feature'
created: '2026-11-24'
status: 'in-review'
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
- Matching (deterministic): normalise text by lowercasing, turning punctuation into spaces and ignoring a plural ending. A Restriction or sensitivity matches an item when the item's normalised text contains, on whole-word boundaries, the target phrase or any avoid term. The target phrases of a Restriction's text are found by removing leading avoid words (`no`, `not`, `never`, `avoid`, `don't`, `do not`, `can't`, `cannot`, `shouldn't`, `mustn't`, `without`, `stop`, `please`), then any lead-in verb after them (`use`, `using`, `let`, `allow`, `give`, `giving`), then splitting what is left on `or`, `and`, `and/or` and commas into separate phrases. Example: "No hand-over-hand prompting" targets "hand over hand prompting"; "Don't use flashcards" targets "flashcard"; "No bubbles or whistles" targets "bubble" and "whistle". For an "avoid" sensitivity the same applies, with these descriptive lead-ins removed first: `dislikes`, `hates`, `avoids`, `sensitive to`, `sensitivity to`, `afraid of`, `scared of`, `allergic to`, `intolerant of`. If nothing is left after removing lead-ins, the whole normalised text is the target, so a recorded Restriction is never silently ignored. A Goal in scope that does not belong to the Family makes the check unavailable.
- Outcomes: a match drops a `curated` or `ai_suggested` item. A `prescribed` item is never dropped: on a match it is kept with the code `restriction-conflict` (the app shows "conflicts with a recorded Restriction — check with your therapist"). Two more codes say what happened: `check-with-therapist` when the scope classifier says so, and `check-unavailable` when a prescribed item could not be checked. If the check cannot run (lookup or classifier throws or is unavailable) a `curated` or `ai_suggested` item is dropped, and a `prescribed` one is kept flagged.
- The `ScopeClassifier` default answers clear for non-AI items and unavailable for `ai_suggested`, so AI items are dropped until Epic 13 supplies one. A classifier answer "check with your therapist" adds that flag.
- Results are cached against the Family and `restriction_set_version`; the cache entry is invalid as soon as the version differs.
- Cases in `eval/guardrails/*.yaml`, tagged `guardrail-eval`, for: a Restriction match, an "avoid" sensitivity match, a prescribed flag, a version change and an unavailable check. They also run in the default `./mvnw verify` (the exclusion of `guardrail-eval` in `pom.xml` stays), through an untagged test over the same files for the cases that need no model.

**Never:**
- No write endpoint, form, seed, Activity, Plan or Observation table, model or AI call, and no change to the Epic 25 module edges. No derived copy of sensitivities or Restrictions. No native SQL.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Restriction match | "No hand-over-hand prompting"; curated item with "hand-over-hand prompting" | item dropped | n/a |
| Short form | same Restriction; curated item with only "hand-over-hand" | kept, unless the Restriction has the avoid term "hand over hand" | n/a |
| Avoid term | Restriction with avoid term "sticky"; item "sticky dough" | dropped | n/a |
| Sensitivity | sensitivity "sticky textures", avoid on; item mentions "sticky texture" | dropped (plural ignored) | n/a |
| Not avoided | sensitivity with avoid off | item kept | n/a |
| Prescribed | prescribed item matching a Restriction | kept with `restriction-conflict` | n/a |
| Lead-in verb | "Don't use flashcards"; curated item "Flashcards of animals" | dropped | n/a |
| List | "No bubbles or whistles"; items "Blowing bubbles" and "Toy whistle" | both dropped | n/a |
| Descriptive sensitivity | "dislikes sticky textures", avoid on; item "sticky texture play" | dropped | n/a |
| Only avoid words | Restriction text "No" | its whole text is the target; never silently ignored | n/a |
| Retired | retired Restriction | does not apply | n/a |
| Other Goal | Restriction on Goal A, item scoped to Goal B | does not apply; a Family-level one does | n/a |
| No false hit | item "handing out cards" and a target "hand over hand" | kept | n/a |
| Version | add, retire or edit a Restriction or sensitivity | `restriction_set_version` changes; unchanged data keeps it | n/a |
| Cache | same items twice, then a change | second call uses the cache; after the change it recomputes | n/a |
| Unavailable | lookup throws; AI item | dropped | fails closed |
| Unavailable prescribed | lookup throws; prescribed item | kept, flagged | fails closed |
| Other Family | Family B's Restriction | never applies to Family A | n/a |
| Unknown Goal | scope names a Goal that is not in the Family | check unavailable | fails closed |
| Caregiver edit | `caregiver_text` rewords a Restriction | the new wording also matches | n/a |

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

- Review fixes (2026-11-24): the matcher now strips leading avoid words and lead-in verbs, splits lists, strips descriptive sensitivity lead-ins and falls back to the whole text; `ie` and `y` endings agree; the lookup is `noRollbackFor` and refuses an unknown Goal; `check` tolerates null. Eval cases: 18 in `eval/guardrails/`. Verification after review: backend 233 tests, frontend 388 unit and 89 e2e tests, scan PASS.

- Migration `goals/V20261124_1030`; `Strategy`, `Restriction`, `RestrictionAvoidTerm` entities; `GET /strategies` and `/restrictions`. `ai.api` holds the port types, `ai.domain.DefaultGuardrail` the check. `restriction_set_version` is a SHA-256 over the Family's whole live set (non-retired Restrictions with both wordings and avoid terms, plus "avoid" sensitivities), so it is the same for every scope; the cache key adds the Goal scope.
- Choices the spec leaves open: flags are `restriction-conflict`, `check-with-therapist` (classifier answer) and `check-unavailable` (a prescribed item that could not be checked); a Caregiver's `caregiver_text` is matched as well as `original_text`; the matrix row "item with hand-over-hand" needs an item that contains the whole target ("hand over hand prompting") or an avoid term, as the matching rule says.
- `./mvnw verify`: 192 tests, 0 failures. The tagged runner cannot run in the default build (the pom excludes `guardrail-eval`); the untagged `GuardrailEvalFilesTest` runs the same files. The three-reviewer pass was not run; the Playwright e2e suite was not run (no UI change).

## Spec Change Log

- 2026-11-24, maintainer decision after review: the approved matching rule missed ordinary wordings ("Don't use flashcards", "No bubbles or whistles", a sensitivity written "dislikes sticky textures"), which is the unsafe direction. The target phrases now also skip lead-in verbs, split lists on or/and/commas, strip descriptive lead-ins from sensitivities, and fall back to the whole text when nothing is left. An unknown Goal in scope makes the check unavailable. Matrix rows added for each.

- 2026-11-24, maintainer decision after implementation: the first matrix example said a curated item with only "hand-over-hand" is dropped, but the matching rule needs the whole target phrase. The rule stands; the example now says "hand-over-hand prompting", and a new row shows that the short form is kept unless it is an avoid term. The implementer's two extra flag codes (`check-with-therapist`, `check-unavailable`) are kept and now named in the Outcomes rule.

## Review Triage Log

Reviewers: BH blind, EC edge, VG verification gap (three separate subagents). The review diff left out the spec, sprint status, the Epic 25 context and the two generated API files.

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | The matching rule misses ordinary wordings: lead-in verbs ("Don't use flashcards"), lists ("No bubbles or whistles"), contractions, and a sensitivity written descriptively ("dislikes sticky textures"); a miss shows an unsafe item [EC, BH] | high | intent_gap, resolved | maintainer chose "extend the lead-ins and split lists" on 2026-11-24; the frozen rule and matrix now say so; `PhraseMatcher` and its tests |
| 2 | A Restriction made only of avoid words ("No") has an empty target and is silently ignored; a test locks it in [EC, BH] | high | patch, fixed | the whole normalised text becomes the target; test changed |
| 3 | `lookup` is `@Transactional` and the Guardrail swallows its exception, so a failed lookup marks the caller's transaction rollback-only and the caller's commit fails [EC] | medium | patch, fixed | `noRollbackFor` on the lookup; a test with an outer transaction |
| 4 | A caregiver-edited Restriction wording is matched by the Guardrail but no test proves it [VG] | medium | patch, fixed | Guardrail and end-to-end tests |
| 5 | The "Short form" matrix row (only "hand-over-hand") is not tested [EC] | medium | patch, fixed | tests: kept without the avoid term, dropped with it |
| 6 | An unknown Goal in scope silently applies only the Family-level rules [EC] | medium | patch, fixed | the lookup refuses a Goal that is not the Family's, so the check is unavailable; test |
| 7 | `cookies` becomes `cooky` but `cookie` stays `cookie`, so plural and singular do not match [BH, EC] | medium | patch, fixed | `ie` and `y` endings normalise the same way; tests |
| 8 | `check` throws on a null list or a null element, against its "never throws" contract [BH, EC] | low | patch, fixed | null list gives an empty result, a null element is skipped; tests |
| 9 | The provider-failure path (more than one classifier bean) is untested [VG] | low | patch, fixed | a test with a throwing provider |
| 10 | The eval runner accepts malformed cases (unknown scope, missing keys) [BH] | low | patch, fixed | strict validation with clear errors |
| 11 | `DemoFixtures.reset()` repeats three deletes [BH, VG] | low | patch, fixed | removed |
| 12 | Docs say every reference is a composite foreign key, but `source_id` is a typed reference with no key; CONTRIBUTING omits that AI items are dropped until Epic 13 and the three flag codes; the README repeats a pointer [BH] | low | patch, fixed | wording narrowed and added |
| 13 | Records incomplete (verdict wording, test count, commit placeholder, review pass not recorded) [BH] | low | patch, fixed | finished after the fixes, in the finishing step |
| 14 | `openapi.json` and the frontend types are missing from the diff [BH, EC, VG] | false | rejected | they changed (`api:check` passes, `OpenApiContractTests` passes); the review diff left them out |
| 15 | "Module edges unchanged" is wrong because `goals` now depends on `ai.api` and `child.api` [BH] | false | rejected | `goals` already declared those edges (AD-1); `ModuleSkeletonTests` is unchanged and green |
| 16 | An `Error` (stack overflow, linkage) escapes the fail-closed handling [EC] | low | rejected | JVM errors are not part of the contract and should propagate |
| 17 | A sensitivity with null text breaks the lookup [EC] | low | rejected | `child_sensitivity.text` is `NOT NULL` |
| 18 | The `versionChanged` YAML cases test the test's own lookup version [VG] | low | rejected | the production version is covered by `StrategyRestrictionTests`; the YAML case checks cache invalidation |
| 19 | Cache bounds, the eviction clearing every Family, and re-reading the whole set on every check; the lists are unbounded [BH] | low | rejected | Family-scale data and one instance (AD-17); revisit if measured |
| 20 | The tagged runner is awkward to run, the model path has no case, a few extra test gaps (null classifier answer, curly apostrophes, `allowed()` with a flag) [BH] | low | rejected | documented; the model path arrives with Epic 13 |

## Design Notes

The specs name the check but not how a free-text Restriction matches an item. The maintainer chose phrases plus optional avoid terms (2026-11-24). Stripping the leading avoid word is needed because a Restriction reads "no X" while an item that conflicts says "X". A false match hides a safe item; a missed match would show an unsafe one, so ties go to dropping.

## Verification

**Commands:**
- `cd backend && JAVA_HOME=<openjdk@25 home> ./mvnw verify` -- expected: all tests pass, `ModularityTests` and `ModuleSkeletonTests` green, the guardrail cases run
- `cd frontend && npm run api:check && npm run lint && npm run typecheck && npm run test:coverage && npx playwright test --project=chromium` -- expected: all pass
- `deploy/security-scan.sh` -- expected: PASS
