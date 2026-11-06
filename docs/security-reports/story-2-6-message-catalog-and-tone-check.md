# Security report: Story 2.6, Message catalog and tone check

| | |
|---|---|
| Story | 2.6, issue #40 |
| Branch | story/2-6 |
| Commit scanned | working tree on baseline 9cf9f738f8d604b54154e07961d3165c41983010 (not committed yet) |
| Date | 2026-11-06 |
| Verdict | PASS |

## 1. Summary

The story adds frontend source (catalog strings, a tone checker, tests) and documentation. It adds no dependency, image, action, endpoint or network access. The full scan passes (`RESULT: PASS`), run before validation and again after the review fixes.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 0 |
| Frontend dependencies | 603 | PASS | 0 | 3 |
| Container images | 6 scanned images | PASS | 0 | warnings only, plus excepted findings under existing exceptions |

KEV findings: 0.

### Warnings (below 7.0, not in KEV)

| Package | Version | CVE | CVSS | Fixed in | Decision |
|---|---|---|---|---|---|
| deepmerge | 4.3.1 | CVE-2026-93753 | 5.3 | none | unchanged from earlier stories, dev dependency, accepted |
| glob | 11.1.0 | CVE-2026-118773 | 6.3 | 14.0.2 | unchanged, dev dependency, accepted |
| minimatch | 10.2.6 | CVE-2026-118764 | 6.9 | 11.0.1 | unchanged, dev dependency, accepted |

Image warnings (Keycloak and Eclipse Temurin base packages, Mailpit busybox) are unchanged; the totals are in `build/security/summary.txt`.

## 3. Exceptions

No change. The existing Keycloak and build-image exceptions expire 2026-12-04.

## 4. Container images

No image added or changed.

## 5. Supply chain

None. No tool, action or dependency changed.

## 6. Secrets and data handling

Secret scan clean. The catalog holds fixed product wording only; nothing is logged, stored or sent. No personal data in strings, tests or docs.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `cd frontend && npm test` | pass (messages.test.ts: 27 cases in total) |
| New negative tests | `cd frontend && npm test` | pass (each banned phrase flagged, unknown and empty keys) |
| Non-regression suite | `cd frontend && npm test`; `bash deploy/tests/release-notes.test.sh` | 27 passed, 0 failed, 2 skipped (red-phase); 79 passed, 0 failed |

## 8. Review findings with security impact

None with security impact. Triage: see the Review Triage Log in [the story spec](../../.specs/implementation-artifacts/spec-2-6-message-catalog-and-tone-check.md). The one deferral is #110.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Tone check covers catalog values only (#110) | A banned phrase in an attribute string or an unlisted variant reaches users | #110, target 2027-02-04 |

## 10. Sign-off

Validated by the maintainer on 2026-11-06.
