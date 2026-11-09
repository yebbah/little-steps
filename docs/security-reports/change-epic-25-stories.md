# Security report: Demo Family first, setup features later (sprint change and Epic 25)

| | |
|---|---|
| Issue | #178 (Epic 25), #179 to #183 |
| Branch | docs/epic-25-stories |
| Commit scanned | the last commit of the branch before this record (the pre-commit scan ran on every commit) |
| Date | 2026-11-09 |
| Verdict | PASS WITH WARNINGS |

## 1. Summary

Specs, issues and records only: no code, dependency, image or workflow changed. The scan passed with the usual warnings, unchanged. The stories add one security-relevant requirement: a demo identity that must never exist in production.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 0 |
| Frontend dependencies | 653 | PASS | 0 | 3 |
| Container images | 6 scanned (2 Presidio images deferred in `images.yaml`) | PASS | 0 | see `build/security/summary.txt` (no fix published for any, none in KEV) |

### Warnings (below 7.0, not in KEV)

| Package | Version | CVE | CVSS | Fixed in | Decision |
|---|---|---|---|---|---|
| deepmerge | 4.3.1 | CVE-2026-93753 | 5.3 | none | accepted, unchanged by this pull request |
| glob | 11.1.0 | CVE-2026-118773 | 6.3 | 14.0.2 | accepted, unchanged by this pull request |
| minimatch | 10.2.6 | CVE-2026-118764 | 6.9 | 11.0.1 | accepted, unchanged by this pull request |

## 3. Exceptions

No entry in `security/exceptions.yaml` was added or changed. The existing entries (expiring 2026-12-04) are unchanged.

## 4. Container images

No image changed. Images are scanned by the pre-commit hook, not in CI.

## 5. Supply chain

None. No tool, action or dependency was added or changed.

## 6. Secrets and data handling

The secret scan of the staged changes was clean. The records and specs contain no personal data, and the Epic 25 seed is specified as invented, generic data with no real people or children.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive and negative tests | Not applicable (specs and records only) | n/a |
| Non-regression suite | CI on the pull request | see the pull request checks |

## 8. Review findings with security impact

No reviewer pass was run outside a story. The proposal was reviewed by the maintainer on 2026-11-09.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Demo identity reaching production | Anyone could act as a seeded Caregiver | Story 25.1: not a bean in `prod`, startup fails if the flag is on there, tests prove both |
| Demo switcher code in the production bundle | Dead code that exposes a switcher | Story 25.5: the production bundle must contain none, and a test checks it |
| Authentication arrives after the core loop | Auth-related defects found late | Story 3.1 and Story 3.2, with the isolation test re-run on real sign-in |

## 10. Sign-off

Maintainer approval of the epic and its stories: 2026-11-09. Decision to merge: the maintainer merged with the CI Security scan job red, because it could not download the pinned scan tools (GitHub release downloads returned 504 after 4 attempts, the known issue #175) and the change is documentation only. The local pre-commit scan of the branch passed (section 2). This is a recorded exception to the rule against merging on red.
