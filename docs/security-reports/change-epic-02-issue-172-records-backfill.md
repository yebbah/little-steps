# Security report: Backfill changelogs and security reports for the older non-story pull requests

| | |
|---|---|
| Issue | #172 (closes it) |
| Branch | feature/epic-02-issue-172-records-backfill |
| Scanned | the working tree of the branch, by `deploy/security-scan.sh` before the commit (a file cannot name the commit that contains it) |
| Date | 2026-11-09 |
| Verdict | PASS WITH WARNINGS |

## 1. Summary

Documentation only; no dependency, image, workflow or secret handling changed. Verdict: pass with warnings.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above. Numbers are from the local scan of the branch (`deploy/security-scan.sh`, before the commit). Container images are scanned by the pre-commit hook, not in CI (#95); the full local scan below includes them.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 0 |
| Frontend dependencies | 653 | PASS | 0 | 3 |
| Container images | see section 4 | PASS (local scan: 7 images, see section 4) | 0 | n/a (local scan) |

### Warnings (below 7.0, not in KEV)

| Package | Version | CVE | CVSS | Fixed in | Decision |
|---|---|---|---|---|---|
| deepmerge | 4.3.1 | CVE-2026-93753 | 5.3 | none | Below the blocking threshold, not in KEV. Not changed by this change. |
| glob | 11.1.0 | CVE-2026-118773 | 6.3 | 14.0.2 | Below the blocking threshold, not in KEV. Not changed by this change. |
| minimatch | 10.2.6 | CVE-2026-118764 | 6.9 | 11.0.1 | Below the blocking threshold, not in KEV. Not changed by this change. |

## 3. Exceptions

19 entries in `security/exceptions.yaml` on the branch (18 distinct CVEs): CVE-2017-18018, CVE-2018-20796, CVE-2019-1010022, CVE-2019-1010023, CVE-2019-9192, CVE-2025-69720, CVE-2026-102010, CVE-2026-19499, CVE-2026-4738, CVE-2026-5435, CVE-2026-54369, CVE-2026-54370, CVE-2026-54371, CVE-2026-56109, CVE-2026-76844, CVE-2026-84243, CVE-2026-85091, CVE-2026-95619. Each entry's package, reason, mitigation and expiry (2026-12-04 at the latest) are in that file on the branch, and every active exception is listed in the epic's release note. This change did not add or change an exception.

## 4. Container images

Pinned in `deploy/images.yaml` on the branch. No image changed by this pull request. The local scan of this branch passed for PostgreSQL (0 components), Keycloak (23), Node (3), Temurin build (1), Temurin runtime (10) and Mailpit (4); the Presidio images are scan-deferred.

| Image | Source (dhi or other) | Digest | Why not DHI (if other) |
|---|---|---|---|
| dhi.io/postgres | dhi | `sha256:af919daf603560e0b3edf20b16e11adf278c861b74940f79596b12bda8c1ac01` | n/a (DHI image) |
| dhi.io/keycloak | dhi | `sha256:50a09844dc6063ee54cb99259ffbc070ac53ded09a6d1c0075ccaff9e5032f1c` | n/a (DHI image) |
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

The secret scan passed (in the local scan of the branch and again in the pre-commit hook). The records contain no local paths, personal data or secrets (checked before commit). The retroactive gitleaks scan used the repository's own configuration.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| Records check | deploy/check-records.sh origin/main | OK |
| Non-regression suite | CI: backend, frontend, accessibility, scripts, security jobs | gated on all five jobs passing before merge |

## 8. Review findings with security impact

None recorded. The three-reviewer pass applies to stories; none was run for this non-story change. 

## 9. Residual risks and follow-ups

| Item | Risk | Owner |
|---|---|---|
| Eight reports have no dependency or image scan result | A later reader cannot see a scan for those merges | accepted; the diffs are documents (one comment) and a retroactive gitleaks scan found no leaks |

## 10. Sign-off

Squash-merged on 2026-11-09 with all CI jobs green, as part of the maintainer's instruction to finish the Epic 2 retrospective follow-ups. Decision: merge.
