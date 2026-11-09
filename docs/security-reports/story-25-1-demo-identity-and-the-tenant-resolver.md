# Security report: Story 25.1, Demo identity and the tenant resolver

| | |
|---|---|
| Story | 25.1, issue #179 |
| Branch | feature/epic-25-issue-179-demo-identity-and-tenant-resolver |
| Commit scanned | the Story 25.1 commit (the pre-commit hook scans it); baseline c76c97bc52a35977b689c2f62c2ad53af7e56223 |
| Date | 2026-11-09 |
| Verdict | PASS WITH WARNINGS |

## 1. Summary

The story adds tenancy and a development-only identity. No dependency was added. The full scan passes (`RESULT: PASS`) with no new warnings or exceptions.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 0 |
| Frontend dependencies | 653 | PASS | 0 | 3 (unchanged) |
| Container images | unchanged | PASS | 0 | unchanged |

### Warnings (below 7.0, not in KEV)

Frontend only, unchanged: deepmerge, glob, minimatch. Image warnings are unchanged.

## 3. Exceptions

No change. Existing image exceptions expire 2026-12-04.

## 4. Container images

No change.

## 5. Supply chain

None.

## 6. Secrets and data handling

Secret scan clean. The demo identity cannot exist in `prod`: the resolver is not a bean outside `local` and `test`, and the start fails when `littlesteps.demo.enabled` is on there or with no profile. The Family never comes from a request value, the resolver never answers the root tenant, and with no tenant a query returns nothing and an insert fails. A Caregiver's email is never returned or logged; the display name appears only in `GET /api/v1/session`, which is a 401 without the flag. The 401 problem carries no detail.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `cd backend && ./mvnw verify` | pass |
| New negative tests (flag off, prod guard, cross-write, unknown header) | `cd backend && ./mvnw verify` | pass |
| Non-regression suite | `cd backend && ./mvnw verify` | all pass, 0 failed |

## 8. Review findings with security impact

Three independent reviewers (blind, edge, verification gap) ran on the diff. One finding was high and is fixed: the temporary 401 filter matched the raw request URI, so an encoded, `;` or dot-segment path could reach a `/api/v1` handler without a Caregiver. The filter now matches the container's decoded, normalised path, and `DemoFlagOffTests` sends ten such variants through a raw HTTP client. Other fixes with security weight: a test that boots the real application and expects the start to fail with the demo flag in `prod` or with no profile, an exact-status cross-tenant write test, a direct `TenantContext` test, and a timezone check. Details: the spec's Review Triage Log.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Temporary servlet filter instead of Spring Security | Weaker than the final design; the gate matches the decoded, normalised path and is covered by variant tests | Story 3.1 (default-deny is now an acceptance criterion) |
| `X-Demo-Caregiver` trusts any caller when the flag is on | Local and test only; a `DEMO IDENTITY ON` warning is logged at start, and the README says never to expose a demo-mode app to other devices | accepted |
| A listener or job with no tenant reads nothing, silently | Fails closed, but hides a forgotten tenant scope | #184 (Story 3.7) |

## 10. Sign-off

Accepted by the maintainer on 2026-11-09 after the review pass and a walkthrough. The final scan of the branch (after every triage fix) passed: secrets clean, backend 178 and frontend 653 components with no blocking finding, the same 3 frontend warnings. Decision: merge.
