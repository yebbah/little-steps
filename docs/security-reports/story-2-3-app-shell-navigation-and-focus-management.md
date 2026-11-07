# Security report: Story 2.3, App shell, navigation and focus management

| | |
|---|---|
| Story | 2.3, issue #37 |
| Branch | feature/epic-02-issue-37-app-shell-navigation-and-focus-management |
| Commit scanned | c710736 (scan run on the staged changes before the commit) |
| Date | 2026-11-07 |
| Verdict | PASS |

## 1. Summary

The story adds client-side routing and an app shell. It adds one runtime dependency, `react-router` 8.5.0, and stores or sends nothing. The scan passes with no blocking findings.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | unchanged |
| Frontend dependencies | 628 | PASS | 0 | 3 |
| Container images | see summary | PASS | 0 | unchanged from main |

### Warnings (below 7.0, not in KEV)

| Package | Version | CVE | CVSS | Fixed in | Decision |
|---|---|---|---|---|---|
| deepmerge | 4.3.1 | CVE-2026-93753 | 5.3 | none | pre-existing, not from this story |
| glob | 11.1.0 | CVE-2026-118773 | 6.3 | 14.0.2 | pre-existing, not from this story |
| minimatch | 10.2.6 | CVE-2026-118764 | 6.9 | 11.0.1 | pre-existing, not from this story |

`react-router` adds none of these (components went from 625 to 628).

## 3. Exceptions

The existing image exceptions in `security/exceptions.yaml` (expiring 2026-12-04) are unchanged.

## 4. Container images

No image changed. Images from outside Docker Hardened Images are warnings in the release note: unchanged from main.

## 5. Supply chain

`react-router` 8.5.0 is pinned exactly in `package.json` and locked in `package-lock.json`. It was published 19 days before this story; the newer 8.5.1 (11 days old) was not chosen.

## 6. Secrets and data handling

Secret scan clean. The shell logs, stores and sends nothing; routes carry no identifiers. The status region holds only catalog text.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `(cd frontend && npm test)` | 15 new, passed |
| New negative tests | same (not-found path, empty announce, unknown route) | passed |
| Non-regression suite | `(cd frontend && npm test && npm run test:e2e)` | 202 passed, 0 failed; 32 e2e passed |

## 8. Review findings with security impact

None. The review's triage is in the spec's Review Triage Log.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Deep links 404 in the app image | availability only | [#124](https://github.com/yebbah/little-steps/issues/124) |
| Nav sizing under zoom | accessibility | [#125](https://github.com/yebbah/little-steps/issues/125) |

## 10. Sign-off

Accepted by the human on 2026-11-07; merge.
