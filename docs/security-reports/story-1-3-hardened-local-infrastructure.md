# Security report: Story 1.3, Hardened local infrastructure with Docker Compose

| | |
|---|---|
| Story | 1.3, issue #28 |
| Branch | feature/epic-01-issue-28-hardened-local-infrastructure |
| Commit scanned | dbd3cead2df2d654b8950ad613d44065be2e4f42 plus the uncommitted working tree of this story (the scan reads the working copy; the final commit hash is added at sign-off) |
| Date | 2026-11-06 |
| Verdict | PASS WITH WARNINGS (16 time-limited exceptions for Keycloak; Presidio deferred) |

## 1. Summary

This story adds the local stack (PostgreSQL, Keycloak, Mailpit) and the image manifest, so the image scan from Story 1.2 now has real images to scan. Secrets, backend and frontend scans pass. PostgreSQL and Mailpit pass the image scan. Keycloak has 16 CVEs rated 7.0 or above with no fixed version, even on the newest tag available from `dhi.io`; they are covered by 16 written exceptions expiring 2026-12-04. The Presidio images, which are commented out until Epic 18, have one CVE whose fix exists but is not yet in a published image (2.2.366 is the newest release); they are marked `scan: deferred` and skipped by the scan with a notice. Both items are logged in `.specs/implementation-artifacts/deferred-work.md`.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 93 | PASS | 0 | 0 |
| Frontend dependencies | 439 | PASS | 0 | 3 |
| Image `dhi.io/postgres:18-alpine` | 0 vulnerable | PASS | 0 | 0 |
| Image `dhi.io/keycloak:26.8.2` | 25 | PASS (21 findings excepted) | 0 | 46 |
| Image `axllent/mailpit:v1.33.0` | 3 | PASS | 0 | 3 |
| Image Presidio analyzer `2.2.366-distroless` (P2, not running) | n/a | DEFERRED (not scanned) | 1 CVE known: CVE-2026-115557 | 4 known |
| Image Presidio anonymizer `2.2.366-distroless` (P2, not running) | n/a | DEFERRED (not scanned) | 1 CVE known: CVE-2026-115557 | 4 known |

Result of the full run: `RESULT: PASS`. Without the exceptions Keycloak alone would fail. No blocking finding is in the CISA KEV catalog. Every blocking finding in the live images has no fixed version.

### Blocking findings (all covered by exceptions or deferred)

| Image | CVEs | Fixed in | Cause |
|---|---|---|---|
| Keycloak 26.8.2 | CVE-2017-18018, CVE-2018-20796, CVE-2019-1010022, CVE-2019-1010023, CVE-2019-9192, CVE-2025-69720, CVE-2026-102010, CVE-2026-19499, CVE-2026-5435, CVE-2026-54369, CVE-2026-54370, CVE-2026-54371, CVE-2026-56109, CVE-2026-84243, CVE-2026-85091, CVE-2026-95619 | none | Debian base packages in the DHI image (glibc, gcc-14 runtime, libacl, libattr, coreutils, ncurses, zlib, alsa). Not in KEV. |
| Presidio analyzer and anonymizer (deferred, last scanned 2026-11-06) | CVE-2026-115557 (python3, python3-libs 3.12.15-1.azl3) | 3.12.15-3.azl3 | The pinned images were built before the fix. A fix exists, so an exception would not be allowed. Newest release is 2.2.366; the Microsoft registry images are worse (dozens of findings). |

PostgreSQL was moved from `dhi.io/postgres:18` (Debian) to `18-alpine`, which cleared more than 70 distinct unfixed High or Critical CVEs. Keycloak 26.8.2 is the newest tag on `dhi.io` on 2026-11-06 and has no Alpine variant.

### Warnings (below 7.0, not in KEV)

| Package | Version | CVE | CVSS | Fixed in | Decision |
|---|---|---|---|---|---|
| deepmerge, glob, minimatch (frontend) | see Story 1.2 report | CVE-2026-93753, CVE-2026-118773, CVE-2026-118764 | 5.3 to 6.9 | none or later parent version | Unchanged from Story 1.2: dev dependencies, re-check at each scan. |
| busybox, busybox-binsh, ssl_client (Mailpit) | in image | CVE-2025-60876 | 6.5 | none | Accepted: Mailpit is local development only. |
| 46 findings in 11 packages (Keycloak: coreutils, gcc-14-base, libasound2, libc6, libgcc-s1, libstdc++6, libsystemd0, libtinfo6, zlib1g, mariadb-java-client and others) | in image | various | below 7.0 | 4 have a fix | Accepted for local development; upgrade when DHI publishes a newer digest. Full list in `build/security/summary.txt`. |
| python3, python3-libs (Presidio, P2) | 3.12.15-1.azl3 | CVE-2026-114583, CVE-2026-12345 | 6.9, 5.9 | 3.12.16-1.azl3 | Upgrade with the CVE-2026-115557 fix before Epic 18. |

## 3. Exceptions

Sixteen entries in `security/exceptions.yaml`, all for `dhi.io/keycloak:26.8.2`, all expiring 2026-12-04 (28 days):

| CVE | Reason | Mitigation |
|---|---|---|
| CVE-2017-18018, CVE-2018-20796, CVE-2019-1010022, CVE-2019-1010023, CVE-2019-9192, CVE-2025-69720, CVE-2026-102010, CVE-2026-19499, CVE-2026-5435, CVE-2026-54369, CVE-2026-54370, CVE-2026-54371, CVE-2026-56109, CVE-2026-84243, CVE-2026-85091, CVE-2026-95619 | No fixed version published; OS base package in the newest DHI Keycloak tag on 2026-11-06 | Local development container only, published on 127.0.0.1, holding fictional data, not deployed; re-scanned on every commit; replace the image when DHI publishes a newer digest |

Exceptions are keyed by CVE only, so each one also silences the CVE in any other image (a known limitation from Story 1.2, deferred). The remediation target date for the whole set is 2026-12-04; they are listed in the Epic 1 release note.

## 4. Container images

| Image | Source | Digest | Why not DHI |
|---|---|---|---|
| dhi.io/postgres:18-alpine | dhi | sha256:fec65236f2c8f14780ce38ac01f524449c730155fc342bfb88bc51f4a22e090d | n/a |
| dhi.io/keycloak:26.8.2 | dhi | sha256:aeda9dd828bc6760a29f14365d5ef9b6cd56ac0c7b90ab9dd0384b8bbf341aa0 | n/a (the live catalog check on 2026-11-06 found it, so it moved from `quay.io/keycloak`) |
| axllent/mailpit:v1.33.0 | other | sha256:9b3a463be15354c0f0eba91697d80e3e0d8a5623ef0e627cacc836bc17fd5231 | Not in the DHI catalog, local development only. |
| ghcr.io/data-privacy-stack/presidio-analyzer:2.2.366-distroless | other | sha256:84cb78c12a26d7ff4d2f5b980452dd9983c0a5c8c56ee410226bb6bb3f19f7d8 | Not in the DHI catalog. P2, commented out. |
| ghcr.io/data-privacy-stack/presidio-anonymizer:2.2.366-distroless | other | sha256:cf356326f0c9ed1a90b85973976066ff897973d6d495e4f56aa4cba4f351996b | Not in the DHI catalog. P2, commented out. |

Images from outside Docker Hardened Images, to be flagged in the release note: Mailpit (local only), Presidio analyzer and anonymizer (not running yet).

`deploy/check-images.sh` fails when a compose image is missing from the manifest, a tag or digest differs, a digest is missing, an `other` has no reason, or a `dhi` entry is not from `dhi.io`. Commented Presidio references are checked too.

## 5. Supply chain

- Every image is referenced by tag and digest, in `compose.yaml` and `images.yaml` alike, and the two are kept equal by `check-images.sh`.
- The DHI PostgreSQL image has no init-script folder, so Keycloak's role and schema are created by a one-shot compose service that reuses the same pinned PostgreSQL image. No extra image was added.
- The DHI Keycloak image has no curl, so its healthcheck uses bash and `/dev/tcp`. The DHI `-dev` variant was not needed.
- No new tools, GitHub Actions or build dependencies. `security-scan.sh` changed in one place: `cmd_images` now skips an `images.yaml` entry marked `scan: deferred` and prints a notice. `check-images.sh` rejects any other `scan` value and fails when a deferred image is uncommented in compose, so the marker cannot hide a running image.

## 6. Secrets and data handling

- Secret scan on staged changes: clean. No credential is committed. `deploy/local.env.example` holds only `change-me-...` placeholders, and `deploy/local.env` is git-ignored.
- The realm file holds no passwords. User passwords and the Tailscale host are `${VAR}` placeholders that Keycloak fills from the environment at import time.
- The two realm users use `example.test` addresses and are fictional. No personal data is in the repository.
- All published ports are bound to `127.0.0.1`. The Keycloak management port is not published (the healthcheck runs inside the container). Keycloak runs in development mode (`start-dev`, no TLS), which is for local use only and must not be deployed.
- The realm requires PKCE S256, turns refresh token rotation on with no reuse, and disables the password and implicit grants for the public client, and turns on brute-force protection.
- No application code, logging or data handling changed.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `deploy/tests/check-images.test.sh`, `deploy/tests/realm.test.sh` | matching refs pass; realm has PKCE S256, rotation, three redirect URIs, two users, SMTP to Mailpit |
| New negative tests | same | digest drift, tag mismatch, unlisted image, commented Presidio drift, missing digest, `other` without reason, `dhi` outside `dhi.io`, and compose without `local.env` all fail with the expected message |
| New tests for the deferred marker | `deploy/tests/check-images.test.sh`, `deploy/tests/security-scan.test.sh` | a deferred image is skipped with a notice and left out of the scanned list; a deferred image without a digest is still an error; a deferred image that runs in compose fails; a commented one passes |
| Combined result | all three test scripts | 15 passed (check-images), 21 passed (realm), 0 failed |
| Non-regression | `deploy/tests/security-scan.test.sh` | 63 passed, 0 failed (59 existing, 4 new) |
| Live stack | `docker compose ... up -d --wait` | all services healthy; PKCE token request for `caregiver.a@example.test` succeeds; a Keycloak email for `caregiver.b@example.test` appears in Mailpit |
| Image scan | `deploy/security-scan.sh` | RESULT: PASS (Keycloak through 16 exceptions, Presidio deferred) |

## 8. Review findings with security impact

Three independent reviewers (blind, edge cases, verification gaps) ran on the full diff. 21 rows are in the Review Triage Log of `.specs/implementation-artifacts/spec-1-3-hardened-local-infrastructure.md`. The ones with security impact:

- **Fixed: the `scan: deferred` guard was untested and had holes.** Unknown `scan` and `source` values and untagged compose images now have negative tests. A `scan:` line before any entry, or a duplicate digest line, is now an error. Quoted values are read the same way by both scripts. The deferred-image-runs-in-compose check no longer depends on a pipe under `pipefail` and matches the name exactly.
- **Fixed: the Keycloak DB role could overwrite the superuser** if both used the same name. The init script now refuses. It also no longer passes the password on the `psql` command line, and a no-op `REVOKE` was removed.
- **Fixed: realm and compose hardening.** Brute-force protection on, management port 9000 no longer published to the host, Keycloak waits for a healthy Mailpit, and the database variables fail with the "copy the example" message when missing. Redirect URI tests now compare exact strings and count exactly three.
- **Documented: realm re-import.** `--import-realm` ignores an existing realm, so edited passwords or redirect URIs need a volume reset (`deploy/README.md`). Passwords with `$` or `}` are mangled by compose and the realm import (note in `local.env.example`).
- **Deferred:** an automated stack smoke test ([#60](https://github.com/yebbah/little-steps/issues/60)) and orphan, duplicate and digest-format checks in `check-images.sh` ([#61](https://github.com/yebbah/little-steps/issues/61)).
- **Open, for the human:** acceptance criterion 3 and the Verification line "PASS across all targets" are not met because of Keycloak (section 9). The frozen text named Keycloak 26.8.1 and PostgreSQL 18 and an untouched `security-scan.sh`; each departure is recorded in the Spec Change Log.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Keycloak: 16 unfixed CVEs rated 7.0 or above in the DHI base image, excepted | The local identity service runs with known OS-level weaknesses. None is in KEV; bound to localhost; fictional data | Remediate by 2026-12-04 (exceptions expire); tracked in `deferred-work.md` and, once created, a `deferred` issue |
| Presidio images: CVE-2026-115557, fix exists but is not in the published images | Not scanned while deferred; the services do not run | Bump digests when republished and remove `scan: deferred` before Epic 18 enables them. Tracked in [#57](https://github.com/yebbah/little-steps/issues/57) and [#58](https://github.com/yebbah/little-steps/issues/58). |
| `scan: deferred` is a new bypass of the image scan | A running image could be hidden | Mitigated: `check-images.sh` fails if a deferred image is active in compose; each use needs a `deferred-work.md` entry |
| Exceptions are keyed by CVE only (from Story 1.2) | An exception for a Keycloak CVE would also silence it in any other image | Deferred, see `deferred-work.md` |
| Keycloak runs in `start-dev` | No TLS, relaxed hostname checks | Accepted: local only; production hosting is a later epic |
| Keycloak healthcheck depends on bash `/dev/tcp` | An image update that removes bash would break the check | Re-check on each DHI update, [#59](https://github.com/yebbah/little-steps/issues/59) |

## 10. Sign-off

Decision on the Keycloak findings: option A (time-limited exceptions) chosen by the human on 2026-11-06. Pending: reviewer name and date, and the final commit hash. The deferred items are issues #56 to #61, linked from #28.
