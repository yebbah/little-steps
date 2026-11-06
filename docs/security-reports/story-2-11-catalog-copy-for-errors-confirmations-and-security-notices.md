# Security report: Story 2.11, Catalog copy for errors, confirmations and security notices

| | |
|---|---|
| Story | 2.11, issue #106 |
| Branch | story/2-11 |
| Commit scanned | working tree on baseline 3ee97a47ed31b2ba181bc45bcdec6982059afc2e (not committed yet) |
| Date | 2026-11-06 |
| Verdict | PASS |

## 1. Summary

The story adds frontend catalog strings (errors, confirmations, consent, invite and security notices) and tests. It adds no dependency, image, action, endpoint or network access. The full scan passes (`RESULT: PASS`).

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 0 |
| Frontend dependencies | 625 | PASS | 0 | 3 |
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

Secret scan clean. The catalog holds fixed product wording only; `tf()` only substitutes caller-supplied text into a string with a single-pass replacer function (no `$` pattern interpretation, no HTML, no evaluation) and nothing is logged, stored or sent. No personal data in strings, tests or docs.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `cd frontend && npm test` | pass (error-copy.test.ts: exact text for 27 keys, `tf()` fills every key) |
| New negative tests | `cd frontend && npm test` | pass (removed, reworded and extra key detected; missing value stays visible; no blaming wording) |
| Non-regression suite | `cd frontend && npm test` | 189 passed, 0 failed |

## 8. Review findings with security impact

None with security impact. Triage: see the Review Triage Log in [the story spec](../../.specs/implementation-artifacts/spec-2-11-catalog-copy-for-errors-confirmations-and-security-notices.md). One `defer` row, [#119](https://github.com/yebbah/little-steps/issues/119), not security related.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Consumers must escape or render `tf()` output as text, never as HTML | A future component inserting it as HTML could expose caller-supplied text | accepted: React renders strings as text, and `react/jsx-no-literals` plus the lint rules stay in force |
| Two spine sentences have no catalog key yet ([#119](https://github.com/yebbah/little-steps/issues/119)) | None (copy completeness only) | deferred, target 2027-02-04 |

## 10. Sign-off

Validated by the maintainer on 2026-11-06.
