# Security report: Pull request #78, Add infrastructure and component architecture diagrams

| | |
|---|---|
| Pull request | #78, issue none (the pull request says it is not tied to an issue) |
| Branch | docs/architecture-diagrams |
| Last commit of the branch | d8a0bec97872d4135c03eba27f9c4f47eef4393b |
| Date | 2026-11-06 |
| Verdict | NOT SCANNED (documents only) |

## 1. Summary

Merged before CI existed, so no scan result was recorded. The diff adds one document and changes the README. Verdict: not scanned (documents only).

## 2. Scan result

No scan result was recorded for this pull request. It was merged before CI existed (the CI workflow arrived with #96 on 2026-11-06), and the output of the local pre-commit scan was not kept, so any figure given here would be invented. What the diff shows is below; it is the security-relevant fact about this change.

The diff adds one document and changes the README.

One check was run afterwards. On 2026-11-09 gitleaks 8.30.1 was run over this pull request's squash commit with the repository's configuration:

| Target | Result |
|---|---|
| Secrets (gitleaks, retroactive, squash commit only) | PASS (no leaks found) |
| Dependencies | not scanned: the diff changes no dependency manifest |
| Container images | not scanned: the diff changes no image pin |

## 3. Exceptions

17 entries in `security/exceptions.yaml` at the merge commit (16 distinct CVEs): CVE-2017-18018, CVE-2018-20796, CVE-2019-1010022, CVE-2019-1010023, CVE-2019-9192, CVE-2025-69720, CVE-2026-102010, CVE-2026-19499, CVE-2026-5435, CVE-2026-54369, CVE-2026-54370, CVE-2026-54371, CVE-2026-56109, CVE-2026-84243, CVE-2026-85091, CVE-2026-95619. Each entry's package, reason, mitigation and expiry (2026-12-04 at the latest) are in that file at the merge commit, and every active exception is listed in the epic's release note. This pull request did not add or change an exception.

## 4. Container images

Pinned in `deploy/images.yaml` at the merge commit. No image pin was changed by this pull request.

| Image | Source (dhi or other) | Digest | Why not DHI (if other) |
|---|---|---|---|
| dhi.io/postgres | dhi | `sha256:fec65236f2c8f14780ce38ac01f524449c730155fc342bfb88bc51f4a22e090d` | n/a (DHI image) |
| dhi.io/keycloak | dhi | `sha256:aeda9dd828bc6760a29f14365d5ef9b6cd56ac0c7b90ab9dd0384b8bbf341aa0` | n/a (DHI image) |
| dhi.io/node | dhi | `sha256:9df89cda122c694157c12ca34b132297268064f879e84716616b46b75e8798ca` | n/a (DHI image) |
| dhi.io/eclipse-temurin | dhi | `sha256:2a412585b3e916c7093c02308880f4c81f32cdd12debec324b25a1513a1d9efa` | n/a (DHI image) |
| dhi.io/eclipse-temurin | dhi | `sha256:f4c6cc2c00486a97b929972a7511f1f892a7f8b807ffe54abe29744b5a607f5d` | n/a (DHI image) |
| axllent/mailpit | other | `sha256:9b3a463be15354c0f0eba91697d80e3e0d8a5623ef0e627cacc836bc17fd5231` | Not in the DHI catalog (checked 2026-11-06); local development only. |
| ghcr.io/data-privacy-stack/presidio-analyzer | other | `sha256:84cb78c12a26d7ff4d2f5b980452dd9983c0a5c8c56ee410226bb6bb3f19f7d8` | Presidio is P2 and scan-deferred until Epic 18. |
| ghcr.io/data-privacy-stack/presidio-anonymizer | other | `sha256:cf356326f0c9ed1a90b85973976066ff897973d6d495e4f56aa4cba4f351996b` | Presidio is P2 and scan-deferred until Epic 18. |

Images from outside Docker Hardened Images are warnings in the release note: Mailpit (local development only) and the Presidio images (P2, scan deferred).

## 5. Supply chain

None.

## 6. Secrets and data handling

A retroactive gitleaks scan of the squash commit on 2026-11-09 found no leaks found. No secret scan result was recorded at merge time. No change; the diff contains no code that logs, stores or sends data.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New tests | Not applicable | none added |
| Non-regression suite | CI: backend, frontend, accessibility, scripts, security jobs | no CI run existed |

## 8. Review findings with security impact

None recorded. The three-reviewer pass applies to stories; none was run for this non-story change. 

## 9. Residual risks and follow-ups

| Item | Risk | Owner |
|---|---|---|
| Scan not recorded | A later reader cannot see a scan result for this pull request | accepted; the diff is documents only |

## 10. Sign-off

Squash-merged before CI existed; no CI gate applied.
