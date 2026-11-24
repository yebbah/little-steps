# Security report: Bump every pinned image to its current version, and add the OpenSSL exceptions

| | |
|---|---|
| Issue | #189 |
| Branch | chore/bump-image-digests |
| Commit scanned | the commit on this branch (the pre-commit hook scans it) |
| Date | 2026-11-24 |
| Verdict | PASS WITH WARNINGS |

## 1. Summary

Newly published CVEs blocked the image scan. Every pin was moved to the current image of its tag, which removed the findings that have a fix. Nine OpenSSL 3.5.9 CVEs (CVSS 7.5 to 8.1, none in KEV) have no fixed library in any latest image, so they are covered by written exceptions expiring 2026-12-24. Verdict: pass with warnings.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above. Numbers are from the local scan of the branch.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 0 |
| Frontend dependencies | 653 | PASS | 0 | 3 (unchanged: deepmerge, glob, minimatch) |
| Container images | 6 scanned (2 Presidio images deferred) | PASS | 0 | listed in `build/security/summary.txt` |

## 3. Exceptions

New, expiring 2026-12-24, all "no fixed OpenSSL published in the latest image of the pinned tag (checked 2026-11-24)": CVE-2026-107493, CVE-2026-107494, CVE-2026-107496, CVE-2026-121482, CVE-2026-124709, CVE-2026-84786, CVE-2026-88823, CVE-2026-95691, CVE-2026-95692. Mitigation: local development containers on 127.0.0.1 holding fictional data, and build stages; never deployed. Tracked in #189. The earlier Keycloak exceptions (#56) are unchanged and expire 2026-12-04.

## 4. Container images

| Image | Source | Digest | Why not DHI |
|---|---|---|---|
| dhi.io/postgres:18-alpine | dhi | sha256:11d2673dae24c4fa2df8be1f7ce81bd9136e4fe64bebef2508c5233ae884c3e4 | n/a |
| dhi.io/keycloak:26.8.2 | dhi | sha256:b25d28ed7f1685f74037f7ede62fc5301f4c29f6966a8741b1d8ffdc44b4ad59 | n/a |
| dhi.io/node:24-alpine3.23-dev | dhi | sha256:abe5e2eb4166f422dea213c4181c1ab069f63bb5d4b4bb0878abba2039fefec6 | n/a |
| dhi.io/eclipse-temurin:25-jdk-alpine3.23-dev | dhi | sha256:9ccd430c9ef9c747bb78df43e14599a92416b404c6b65965e94b56c7efcdc977 | n/a |
| dhi.io/eclipse-temurin:25 | dhi | sha256:6d19fe86794c4e6aa17e10090227658d99dc9fa525135e18acf5477bdce9e795 | n/a |
| axllent/mailpit:v1.34.0 | other | sha256:23a2ef85bc50853ab3093645d1d64679afd8887e89da5e48a88940c172591a4e | Not in the DHI catalog (checked 2026-11-06); local development only |

Images from outside Docker Hardened Images are warnings in the release note: Mailpit (unchanged status).

## 5. Supply chain

Digests are pinned in `deploy/images.yaml`, `deploy/compose.yaml` and `deploy/Dockerfile`, and `deploy/check-images.sh` confirms they agree.

## 6. Secrets and data handling

Secret scan clean. No data handling changed.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| Image manifest check | `deploy/check-images.sh` | OK |
| Scan | `deploy/security-scan.sh` | PASS |

## 8. Review findings with security impact

No reviewer pass was run outside a story. The maintainer chose "bump the pins and add 30-day exceptions" on 2026-11-24 after seeing the findings.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Nine OpenSSL CVEs excepted for up to 30 days | A vulnerable library in local containers and build stages | #189, by 2026-12-24 |

## 10. Sign-off

Approved by the maintainer's choice on 2026-11-24.
