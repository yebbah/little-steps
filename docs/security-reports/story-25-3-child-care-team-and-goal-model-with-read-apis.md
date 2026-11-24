# Security report: Story 25.3, Child, Care Team and Goal model with read APIs

| | |
|---|---|
| Story | 25.3 |
| Branch | the Story 25.3 branch cut from main |
| Commit scanned | the Story 25.3 commit; baseline 3c0fca57e294aa80606cbbcc5af6d10d7feb1be8 |
| Date | 2026-11-24 |
| Verdict | PASS WITH WARNINGS |

## 1. Summary

Adds tenant-scoped tables and five read-only endpoints. No dependency, image or write path was added. The full scan passes (`RESULT: PASS`). A three-reviewer pass found 20 items: 11 were fixed, 9 rejected with evidence (3 of them wrong claims), none deferred.

## 2. Scan result

Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 0 |
| Frontend dependencies | 657 | PASS | 0 | 2 (glob, minimatch, unchanged) |
| Container images | unchanged | PASS | 0 | unchanged |

## 3. Exceptions

No change. The existing OpenSSL image exceptions expire 2026-12-24.

## 4. Container images

No change.

## 5. Supply chain

No dependency added or changed.

## 6. Secrets and data handling

Secret scan clean. The Child Profile has no real name or date of birth column (tested). Every table has `family_id` with `@TenantId`, so reads are limited to the Caregiver's Family; a two-Family test covers each endpoint. Responses carry codes and enums, never UI sentences, and no write method exists (405 problem, tested). Care Team wording `original_text` is mapped `updatable = false`.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive and negative tests | `cd backend && ./mvnw verify` | 138 tests, 0 failed, 0 skipped (`ReadApiTests` 33, `ReadApiFlagOffTests`) |
| API types | `cd frontend && npm run api:check`, `lint`, `typecheck` | pass |

## 8. Review findings with security impact

Three independent reviewers (blind, edge, verification gap) ran on the diff. Findings with security weight, all fixed: the database did not stop a row in one Family from referencing another Family's member, level, period or Goal (every cross-table reference is now a composite foreign key that includes `family_id`, with a refusal test per reference type); deleting a member or period cascaded to history, and `SET NULL` dropped a Goal's Prompt Level or member (those references now refuse the delete, and a Family purge still cascades from `families`); Care Team wording (`original_text`) was write-once only through the JPA mapping (a database trigger now refuses any change, tested with a JDBC update); and the no-Caregiver 401 was tested only with an unknown demo ID (a flag-off test now covers all five paths). The full log is in the story spec's Review Triage Log.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Child sensitivities are free text read by the API | Sensitive text exposed to the Family's own Caregivers only | by design (FR-2) |

## 10. Sign-off

Accepted by the maintainer on 2026-11-24 after the review pass. The final scan of the branch (after every triage fix) passed: secrets clean, backend 178 and frontend 657 components with no blocking finding, the same three frontend warnings. Decision: merge.
