# Security report: Story 25.4, Strategies, Restrictions and Guardrail

| | |
|---|---|
| Story | 25.4 |
| Branch | the Story 25.4 branch cut from main |
| Commit scanned | the Story 25.4 commit; baseline 001673b7878fb5696dcb25f3ae499abbf19cba1d |
| Date | 2026-11-24 |
| Verdict | PASS WITH WARNINGS |

## 1. Summary

Adds three tenant-scoped tables, two read-only endpoints and the Guardrail. No dependency, image or write path was added. The Guardrail fails closed.

## 2. Scan result

`deploy/security-scan.sh`: `RESULT: PASS` (no blocking finding; the existing OpenSSL exceptions and warnings are unchanged).

## 3. Exceptions

No change.

## 4. Container images

No change.

## 5. Supply chain

No dependency added or changed.

## 6. Secrets and data handling

Every new table has `family_id` with `@TenantId`; every reference to a Goal or Restriction is a composite foreign key with `family_id`, so a row cannot name another Family's Goal or Restriction (tested). `source_id` is a typed reference (Care Team Member or Caregiver, by `source_kind`) with no key, so it is not enforced across Families, as with `goal.source_id`. Reads are limited to the Caregiver's Family and a two-Family test covers both endpoints and the Guardrail. The lookup refuses to run with no tenant. No native SQL. Responses carry codes and enums, never UI sentences, and no write method exists (405, tested). `original_text` is write-once in the database (tested).

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| Backend | `cd backend && ./mvnw verify` | 233 tests, 0 failed, 0 skipped |
| Guardrail cases | `GuardrailEvalFilesTest`, `GuardrailEvalTaggedTest` | 18 cases in `eval/guardrails/` pass (six added in review) |

## 8. Review findings with security impact

Three independent reviewers (blind, edge, verification gap) ran on the diff. Findings with security weight, all fixed: the approved matching rule missed ordinary wordings of a Restriction ("Don't use flashcards", "No bubbles or whistles", a sensitivity written "dislikes sticky textures"), the unsafe direction, so the maintainer chose to extend it (lead-in verbs, lists, descriptive sensitivity lead-ins); a Restriction made only of avoid words was silently ignored (the whole text is now the target); a failed Restriction lookup could break the caller's transaction (now `noRollbackFor`); an unknown Goal in scope silently applied only Family-level rules (now the check is unavailable and fails closed); and `check` could throw on a null list or element. A Caregiver's edit of a Restriction is matched as well as the Care Team's wording, and tests now prove it. The full log is in the story spec's Review Triage Log.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Matching is by phrase, not meaning | A paraphrase of a Restriction is not caught | Epic 13 (scope classifier) |
| AI items are dropped until a classifier exists | None for safety; AI content is hidden | Epic 13 |

## 10. Sign-off

Accepted by the maintainer on 2026-11-24 after the review pass. The final scan of the branch (after every triage fix) passed: secrets clean, backend 178 and frontend 657 components with no blocking finding, the same three frontend warnings. Decision: merge.
