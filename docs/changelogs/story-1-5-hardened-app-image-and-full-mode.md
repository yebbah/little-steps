# Changelog: Story 1.5, Hardened app image and full mode

| | |
|---|---|
| Story | 1.5, issue #30 |
| Epic | 1, Local environment and project skeleton |
| Branch | feature/epic-01-issue-30-hardened-app-image-full-mode |
| Commits | see the Story 1.5 commit on the branch (baseline e0ecaa2) |
| Date | 2026-11-06 |
| Security report | [story-1-5-hardened-app-image-and-full-mode.md](../security-reports/story-1-5-hardened-app-image-and-full-mode.md) |

## Summary

The app can now be run as it will ship. One multi-stage `deploy/Dockerfile` builds the PWA and the Spring Boot jar (PWA inside) on pinned Docker Hardened Images and runs it as a non-root user. `deploy/dev-up.sh --full` builds and starts it, and the Vite dev server proxies `/api` and `/actuator` for day-to-day development.

## Added

- `deploy/Dockerfile`: stages `dhi.io/node:24-alpine3.23-dev` (`npm ci`, build), `dhi.io/eclipse-temurin:25-jdk-alpine3.23-dev` (jar via the Maven wrapper, with `dist/` copied into `static/`) and `dhi.io/eclipse-temurin:25` (runtime, uid 65532, only the jar, port 8080). Every `FROM` is pinned by digest. `.dockerignore` keeps `node_modules`, `target`, `dist`, `local.env`, `.git`, `.tools` and `build` out of the context.
- `app` service in `deploy/compose.yaml`, profile `full`, built from the repo root, profile `local`, bound to `127.0.0.1:${LS_APP_PORT:-8080}`. `LS_APP_PORT=8080` in `local.env.example`.
- `deploy/dev-up.sh --full`: same prerequisite checks, `docker compose --profile full build` (nothing is started if it fails), starts everything, polls `/actuator/health` until UP or `LS_WAIT_TIMEOUT` (names `app` on failure), shows the app as running, and prints the `tailscale serve` command and HTTPS URL only when `tailscale` is installed and logged in. Unknown flags exit 2 with usage.
- `SpaFallbackConfig` (backend): a GET for an unknown path with no file extension and not under `/api` or `/actuator` returns `index.html`; other unknown paths stay 404.
- `security-scan.sh scan app-image`: scans the locally built image (`docker:littlesteps-app`) with the same blocking rule.
- `check-images.sh` also checks Dockerfile `FROM` lines (digest, tag, manifest entry, matching tag and digest).
- `images.yaml`: entries for the three Dockerfile images.

## Changed

- `frontend/vite.config.ts`: dev proxy for `/api` and `/actuator` to `http://localhost:8080`.
- `dev-down.sh` stops the `app` service too. `check-urls.sh` reports the app as "running" when it answers (still informational) and uses `LS_APP_PORT`.
- `backend/.mvn/wrapper/maven-wrapper.properties`: `distributionSha256Sum` pins the Maven distribution used by the image build.
- `check-images.sh`: a missing `deploy/Dockerfile` fails; one image name may be listed with several tags. `SpaFallbackConfig` sends `Cache-Control: no-cache` for `index.html`, `sw.js` and the fallback and a one-year `immutable` for `/assets/**`. `dev-up.sh --full` stops waiting as soon as the app container exits and prints the Tailscale hint only when `BackendState` is `Running`.
- Plain `shellcheck deploy/*.sh deploy/tests/*.sh` is clean (three narrow, justified file-level disables).

## Fixed

None.

## Removed or deprecated

None.

## Security

The built image passes the scan with no blocking finding (the glibc and zlib findings with no upstream fix are covered by the existing Story 1.3 exceptions, no new exception). The build stages use Alpine `-dev` DHI images that pass the normal scan; the only exception added is CVE-2026-56109 (alsa-lib in the JDK build image, no fix, expires 2026-12-04, #68). See the [security report](../security-reports/story-1-5-hardened-app-image-and-full-mode.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | New `dev-up.sh --full`, new optional `LS_APP_PORT`, phone-over-Tailscale steps | Setup (updated), Local URLs (updated) |
| Development | Vite proxy, `scan app-image`, shellcheck over all scripts | Development (updated) |
| Release | Reviewed, no change | Release |
| Deployment | Local full mode available | Deployment (updated), Layout (updated) |

## After you pull

1. Optionally add `LS_APP_PORT=8080` to `deploy/local.env` (the default applies without it).
2. `deploy/dev-up.sh --full` and open `http://localhost:8080`.

## Tests

- New: `SpaFallbackTests` (6): root, client route, unknown API (404), missing asset (404), unknown actuator path (404), health. Backend total 11 passed (incl. cache headers).
- New: 6 Dockerfile checks in `check-images.test.sh` (24 total), full-mode checks in `dev-scripts.test.sh` (70 total), 2 in `check-urls.test.sh` (10), 4 `scan app-image` checks in `security-scan.test.sh` (67).
- Non-regression: `realm.test.sh` 21, `shellcheck deploy/*.sh deploy/tests/*.sh` prints nothing.
- Manual: `dev-up.sh --full` built and started the image; `/` served the PWA, `/children/1` 200, `/api/nope`, `/assets/x.js` 404, health UP; container user 65532; `scan app-image` PASS; `check-urls.sh` all passed. Tailscale was not installed, so the hint was tested only with stubs.

## Review pass

Three independent reviewers ran (blind, edge cases, verification gaps); every finding is triaged with evidence in the Review Triage Log of `.specs/implementation-artifacts/spec-1-5-hardened-app-image-and-full-mode.md`. Fixed: untested `scan app-image` and `LS_APP_PORT`, missing cache policy for index.html and the service worker, missing Dockerfile skipped by `check-images.sh`, slow failure on a crashing app, Tailscale hint when logged out, images.yaml header, plain shellcheck, stale wording. Decision by the human: build stages must pass the scan, so the Alpine DHI `-dev` images replaced the Debian ones and `scan: deferred` was dropped. Deferred: #68, #70 and the existing #56.

## Deferred and known issues

- #68: exception for CVE-2026-56109 (alsa-lib, JDK build image, no fix), expires and target 2026-12-04.
- #70: compose hardening for the app container (read_only, cap_drop, no-new-privileges, JVM flags), target 2027-01-05.
- #69: `scan app-image` is manual, not in CI or the default scan (target 2027-01-05).
- #71: flaky `dev-scripts` test "--full app container exited" (seen once, not reproduced), target 2027-01-05.
- Keycloak CVE exceptions remain tracked in #56.
