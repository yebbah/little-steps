# Security report: Pull request #157, Spec the nightly browser run, coverage floor and release-note bookkeeping check; drop R7

| | |
|---|---|
| Pull request | #157, issue #134, #101, #151 |
| Branch | feature/epic-02-issue-134-spec-t1-101-r7 |
| Commit scanned | 066c88e1dea7f67eac364074420ae050c8deb6db |
| Date | 2026-11-08 |
| Verdict | PASS WITH WARNINGS |

## 1. Summary

Specification changes only. Verdict: pass with warnings.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above. Numbers are from the CI Security scan job on the pull request's head commit (run 42450588111). Specs and docs only: no dependency or image changed, so the scan result is the same as on `main`.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 0 |
| Frontend dependencies | 653 | PASS | 0 | 3 |
| Container images | see section 4 | PASS (pre-commit hook; images are not scanned in CI) | 0 | n/a (local scan) |

### Warnings (below 7.0, not in KEV)

| Package | Version | CVE | CVSS | Fixed in | Decision |
|---|---|---|---|---|---|
| deepmerge | 4.3.1 | CVE-2026-93753 | 5.3 | none | Below the blocking threshold, not in KEV. Not changed by this pull request. |
| glob | 11.1.0 | CVE-2026-118773 | 6.3 | 14.0.2 | Below the blocking threshold, not in KEV. Not changed by this pull request. |
| minimatch | 10.2.6 | CVE-2026-118764 | 6.9 | 11.0.1 | Below the blocking threshold, not in KEV. Not changed by this pull request. |

## 3. Exceptions

19 entries in `security/exceptions.yaml` at the merge commit (18 distinct CVEs): CVE-2017-18018, CVE-2018-20796, CVE-2019-1010022, CVE-2019-1010023, CVE-2019-9192, CVE-2025-69720, CVE-2026-102010, CVE-2026-19499, CVE-2026-4738, CVE-2026-5435, CVE-2026-54369, CVE-2026-54370, CVE-2026-54371, CVE-2026-56109, CVE-2026-76844, CVE-2026-84243, CVE-2026-85091, CVE-2026-95619. Each entry's package, reason, mitigation and expiry (2026-12-04 at the latest) are in that file at the merge commit, and every active exception is listed in the epic's release note. This pull request did not add or change an exception.

## 4. Container images

Pinned in `deploy/images.yaml` at the merge commit. No image changed by this pull request; the pre-commit hook scanned all listed images on every commit.

| Image | Source (dhi or other) | Digest | Why not DHI (if other) |
|---|---|---|---|
| dhi.io/postgres | dhi | `sha256:af919daf603560e0b3edf20b16e11adf278c861b74940f79596b12bda8c1ac01` | n/a (DHI image) |
| dhi.io/keycloak | dhi | `sha256:aeda9dd828bc6760a29f14365d5ef9b6cd56ac0c7b90ab9dd0384b8bbf341aa0` | n/a (DHI image) |
| dhi.io/node | dhi | `sha256:d331ca42569f4d69779a8a74cf722f7ae709637f49205fcfc1b26ce198c16922` | n/a (DHI image) |
| dhi.io/eclipse-temurin | dhi | `sha256:337310214d6ad56c57d7370b67fb7191a297bbd41741a9bf00f6920cdafe0f9d` | n/a (DHI image) |
| dhi.io/eclipse-temurin | dhi | `sha256:d0d11acaef8d8cb5874663557a32ad70e800917b9ec7b55977d8c82993daaed5` | n/a (DHI image) |
| axllent/mailpit | other | `sha256:9b3a463be15354c0f0eba91697d80e3e0d8a5623ef0e627cacc836bc17fd5231` | Not in the DHI catalog (checked 2026-11-06); local development only. |
| ghcr.io/data-privacy-stack/presidio-analyzer | other | `sha256:84cb78c12a26d7ff4d2f5b980452dd9983c0a5c8c56ee410226bb6bb3f19f7d8` | Presidio is P2 and scan-deferred until Epic 18. |
| ghcr.io/data-privacy-stack/presidio-anonymizer | other | `sha256:cf356326f0c9ed1a90b85973976066ff897973d6d495e4f56aa4cba4f351996b` | Presidio is P2 and scan-deferred until Epic 18. |

Images from outside Docker Hardened Images are warnings in the release note: Mailpit (local development only) and the Presidio images (P2, scan deferred).

## 5. Supply chain

None.

## 6. Secrets and data handling

The secret scan passed (for the commit history in CI, and for the staged changes in the pre-commit hook). No change.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New tests | Not applicable (specs only) | none added |
| Non-regression suite | CI: backend, frontend, accessibility, scripts, security jobs | all 5 passed |

## 8. Review findings with security impact

None recorded. The three-reviewer pass applies to stories; this non-story change was gated by CI and the maintainer's instruction. 

## 9. Residual risks and follow-ups

| Item | Risk | Owner |
|---|---|---|
| R7 dropped | No local Linux check before pushing | accepted; CI covers Linux |

## 10. Sign-off

Squash-merged on 2026-11-08 with all CI jobs green, as part of the maintainer's instruction to finish the Epic 2 retrospective follow-ups. Decision: merge.
