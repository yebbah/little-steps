# Changelog: Story 25.3, Child, Care Team and Goal model with read APIs

| | |
|---|---|
| Story | 25.3 |
| Epic | 25, Demo Family and domain foundations |
| Branch | the Story 25.3 branch cut from main |
| Commits | the Story 25.3 commits on the branch (baseline 3c0fca5); the hashes are in the pull request |
| Date | 2026-11-24 |
| Security report | [story-25-3-child-care-team-and-goal-model-with-read-apis.md](../security-reports/story-25-3-child-care-team-and-goal-model-with-read-apis.md) |

## Summary

The Child Profile, Care Team (with Status Vocabulary, Prompt Levels and a per-member Prompt Level mapping), Goal Periods and Goals are stored in tenant-scoped tables and readable through five read-only endpoints. Nothing writes them yet (Epics 4 and 5, and the seed of Story 25.5).

## Added

- Migrations for `child_profile`, `child_sensitivity` (module `child`); `care_team_member`, `prompt_level`, `status_vocabulary_item`, `care_team_member_prompt_level` (`careteam`); `goal_period`, `goal` (`goals`), with database checks: a structured Goal has a Criterion and a narrative one none, a prescribed Goal is confirmed, a parent-proposed Goal names `proposed_to`.
- Read-only entities (`@TenantId`), services in `domain` and controllers in `web` for `GET /api/v1/child-profile` (404 `not-found` when none), `/care-team-members`, `/prompt-levels`, `/goal-periods`, `/goals`; documented in `openapi.json`, frontend types refreshed.
- Test helpers in `DemoFixtures` and `ReadApiTests`.

## Changed

`DemoFixtures.reset()` also deletes the new tables; `PersistenceBaselineTests` expects them and 7 migrations.

## Fixed

Problems found in review, all fixed in this story: a row could reference another Family's member, level, period or Goal; deleting a member or period cascaded to history, and `SET NULL` silently dropped a Goal's Prompt Level or member; `original_text` was write-once only through the JPA mapping (a trigger now enforces it); two `current` Goal Periods per member were accepted; a Goal's origin could contradict its Source, be its own parent, or be `revised` with no predecessor; and the no-Caregiver case was untested with the demo flag off.

## Removed or deprecated

None.

## Security

See [the security report](../security-reports/story-25-3-child-care-team-and-goal-model-with-read-apis.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | Reviewed, no change | Prerequisites, Setup |
| Development | Note on the new read endpoints, empty until Story 25.5 | Development |
| Release | Reviewed, no change | Release |
| Deployment | Reviewed, no change (Flyway applies three migrations) | Deployment |

## After you pull

Flyway applies the migrations on the next start. The new endpoints return empty lists (and 404 for the profile) until rows exist.

## Tests

New `ReadApiTests` (33) and `ReadApiFlagOffTests`: every matrix row, two-Family isolation on each endpoint, 405 for POST/PUT/DELETE, 401 with the demo flag on and off, every database rule (checks, composite same-Family references, refused deletes, the write-once trigger, active-ordinal uniqueness), and `caregiverText` and `lineage` in the API. `./mvnw verify`: 138 tests, 0 failures, 0 skipped. Frontend: 388 unit tests, 89 Chromium e2e tests, lint, typecheck and `api:check` pass.

## Deferred and known issues

The independent review pass ran (blind, edge, verification gap): 20 findings, 11 fixed, 9 rejected with evidence, none deferred. The triage log is in the story spec.
