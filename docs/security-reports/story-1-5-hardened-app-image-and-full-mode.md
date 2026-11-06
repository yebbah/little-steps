# Security report: Story 1.5, Hardened app image and full mode

| | |
|---|---|
| Story | 1.5, issue #30 |
| Branch | feature/epic-01-issue-30-hardened-app-image-full-mode |
| Commit scanned | working tree on baseline e0ecaa2 (not committed yet) |
| Date | 2026-11-06 |
| Verdict | PASS WITH WARNINGS (one new exception, build image only) |

## 1. Summary

The story adds the app image, a compose service, full-mode scripts and an SPA fallback. The full scan passes (`RESULT: PASS`) and `scan app-image` passes with no new exception.

## 2. Scan result

Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking: KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking |
|---|---|---|---|
| Backend / frontend dependencies | 93 / 439 | PASS | 0 |
| Images in the default scan | postgres 0, keycloak 25, eclipse-temurin 12, mailpit 3 | PASS | 0 |
| Built app image (`scan app-image`) | 12 | PASS | 0 (31 excepted findings, all no-fix glibc, libstdc++ and zlib, covered by existing exceptions to 2026-12-04) |
| dhi.io/node:24-alpine3.23-dev, dhi.io/eclipse-temurin:25-jdk-alpine3.23-dev (build stages) | 3 / 1 | PASS | 0 (1 excepted: alsa-lib CVE-2026-56109) |

## 3. Exceptions

One added: CVE-2026-56109 (alsa-lib 1.2.14-r2, CVSS 7.0, no fix) in the JDK build-stage image, expires 2026-12-04, tracked in #68. The existing Story 1.3 exceptions also cover the Debian base packages in the app image.

## 4. Container images

Runtime: `dhi.io/eclipse-temurin:25`, digest-pinned, non-root (uid 65532, verified on the running container), jar only, no secrets in the Dockerfile. Build stages are scanned like any other image. The non-dev Node image has no npm or shell and no non-dev Maven image exists; the Debian `-dev` variants have dozens of blocking findings, so the Alpine `-dev` variants are used (Node 24, JDK 25 with Maven from the wrapper, pinned by SHA-256). The Alpine Maven image was rejected: zlib CVE-2026-85091 has a fix that the image does not yet include.

## 5. Supply chain

Build downloads npm and Maven dependencies from their public registries (`npm ci` from the lockfile). The Maven distribution is pinned by `distributionSha256Sum`; dependency versions are the ones in `pom.xml`. All base images are pinned by digest, checked by `check-images.sh`.

## 6. Secrets and data handling

No secret in the image or Dockerfile; `local.env` is excluded from the build context. The container port is bound to 127.0.0.1. Actuator exposure is unchanged (health only, no details). Tailscale serve exposes the app only if the developer runs the printed command.

## 7. Tests

Positive and negative tests are listed in the changelog. Backend 11, `check-images` 24, `check-urls` 10, `dev-scripts` 70, `realm` 21, `security-scan` 67, all passing.

## 8. Review findings with security impact

A three-reviewer pass (blind, edge cases, verification gaps) ran. Security-relevant findings: the build-stage images carried dozens of CVSS 7+ findings (resolved by moving to Alpine DHI `-dev` images that scan clean, plus one exception, CVE-2026-56109, #68); no cache policy for the service worker (fixed); app container hardening options missing (deferred, #70); the Story 1.3 exceptions expire 2026-12-04 and `scan app-image` fails after that unless renewed (#56). Full triage is in the story spec.

## 9. Residual risks and follow-ups

| Item | Risk | Owner |
|---|---|---|
| alsa-lib exception on the build image | Unfixed double-free in a library the build never uses | #68 (renew or remove by 2026-12-04) |
| `scan app-image` not automated | Image regressions are found late | #69 |
| App container not read-only, no capability drop | Smaller blast radius if the app is compromised | #70 |
| Keycloak exceptions | See Story 1.3 | #56 |

## 10. Sign-off

Review, changelog and this report are complete. Pending: human validation.
