# Changelog: Story 25.4, Strategies, Restrictions and Guardrail

| | |
|---|---|
| Story | 25.4 |
| Epic | 25, Demo Family and domain foundations |
| Branch | the Story 25.4 branch cut from main |
| Commits | the Story 25.4 commits on the branch (baseline 001673b); the hashes are in the pull request |
| Date | 2026-11-24 |
| Security report | [story-25-4-strategies-restrictions-and-guardrail.md](../security-reports/story-25-4-strategies-restrictions-and-guardrail.md) |

## Summary

Strategies and Restrictions are stored in tenant-scoped tables and readable through two read-only endpoints, and a deterministic `Guardrail.check(items, scope)` drops or flags any item that conflicts with a Restriction or an "avoid" sensitivity. Nothing writes the new tables yet (Epic 6, and the seed of Story 25.5). No Activity, Plan or model exists yet; the Guardrail is ready for the core loop.

## Added

- Migration `goals/V20261124_1030` with `strategy`, `restriction` and `restriction_avoid_term`: composite keys and foreign keys with `family_id`, no cascade from a Goal, write-once `original_text` (trigger), checks that origin and source agree and that text is not blank.
- `GET /api/v1/strategies` and `/restrictions` (retired included, with a `retired` flag; avoid terms listed), in `openapi.json` and the frontend types.
- `ai.api`: `Guardrail`, `GuardrailItem`, `GuardrailScope`, `GuardrailDecision` (with the flags `restriction-conflict`, `check-with-therapist`, `check-unavailable`), `RestrictionLookup` and `ScopeClassifier`. `ai.domain`: `DefaultGuardrail` (matching, outcomes, cache per Family, scope and version) and the default classifier (clear for non-AI items, unavailable for AI ones).
- `goals` implements `RestrictionLookup` with a SHA-256 `restriction_set_version`; `child.api` gains `AvoidSensitivities`, read live.
- Guardrail cases in `eval/guardrails/*.yaml`, run by `GuardrailEvalFilesTest` in the default build and `GuardrailEvalTaggedTest` (`guardrail-eval`).

## Changed

`DemoFixtures`, `PersistenceBaselineTests` (three tables, 8 migrations) and `ReadApiFlagOffTests` (two more paths). README and CONTRIBUTING describe the endpoints and the Guardrail rules. Module edges are unchanged.

## Fixed

Problems found in review, all fixed in this story: the matching rule missed ordinary wordings ("Don't use flashcards", "No bubbles or whistles", a sensitivity written "dislikes sticky textures"), so it now strips lead-in verbs, splits lists and strips descriptive sensitivity lead-ins (maintainer decision, 2026-11-24); a Restriction made only of avoid words was silently ignored; a failed lookup could mark the caller's transaction rollback-only; an unknown Goal in scope silently applied only Family-level rules; `cookie` and `cookies` did not match; and `check` threw on a null list or element.

## Removed or deprecated

None.

## Security

See [the security report](../security-reports/story-25-4-strategies-restrictions-and-guardrail.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | Reviewed, no change | Prerequisites, Setup |
| Development | Note on the two new read endpoints | Development |
| Release | Reviewed, no change | Release |
| Deployment | Reviewed, no change (Flyway applies one migration) | Deployment |

## After you pull

Flyway applies the migration on the next start. The new endpoints return empty lists until rows exist.

## Tests

`StrategyRestrictionTests` (endpoints, isolation, 405 and 401, each database rule, the lookup and its version, the Guardrail on real data), `GuardrailTests` (matching, outcomes, fail closed, cache) and the YAML cases (12). See the verification results in the pull request.

## Deferred and known issues

- A Restriction matches an item only when the item contains the whole target phrase or an avoid term ("No hand-over-hand prompting" needs "hand over hand prompting" in the item, or an avoid term "hand-over-hand"). This follows the spec; Epic 6 forms should prompt for avoid terms.
- The independent review pass ran (blind, edge, verification gap): 20 findings, 1 resolved by the maintainer, 12 fixed, 7 rejected with evidence, none deferred. The triage log is in the story spec.
