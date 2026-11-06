---
title: 'Story 1.5: Hardened app image and full mode'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: 'e0ecaa209f2e507d5f7783a3cf7c4b1bcdf2a856'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/little-steps/.specs/implementation-artifacts/epic-1-context.md'
  - '{project-root}/little-steps/.specs/planning-artifacts/epics/epic-01-local-environment.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The app cannot be run as it will ship. There is no image, `dev-up.sh` starts only infrastructure, and the Vite dev server cannot reach a backend.

**Approach:** One multi-stage `deploy/Dockerfile` on digest-pinned DHI images builds the PWA and the Spring Boot jar (PWA inside) and runs it non-root. `dev-up.sh --full` builds and runs it on the compose network. Vite proxies `/api` and `/actuator` for day-to-day development. Source: GitHub issue #30.

## Boundaries & Constraints

**Always:**
- Stages: `dhi.io/node:24-dev` (frontend build, `npm ci`), `dhi.io/maven:3.9-jdk25-dev` (jar build, with the built `dist/` copied to `backend/src/main/resources/static/` before packaging), `dhi.io/eclipse-temurin:25` (JRE, uid 65532, runtime). Every `FROM` is `name:tag@sha256:digest` and listed in `images.yaml` (source `dhi`). `deploy/check-images.sh` also checks Dockerfile `FROM` lines against the manifest and fails on a missing digest, a missing entry or a digest/tag mismatch.
- Runtime stage sets `USER` non-root, copies only the jar, exposes 8080. A `.dockerignore` keeps `node_modules`, `target`, `dist`, `local.env`, `.git`, `.tools` and `build` out of the build context.
- The app serves `/` (PWA) and `/actuator/health` from one origin. A GET for an unknown path that is not under `/api` or `/actuator` and has no file extension returns `index.html` (200). Unknown `/api/**` and unknown paths with a file extension stay 404. Covered by backend tests; the existing health tests stay green.
- Compose gets an `app` service in profile `full` (`build:` from the repo root, no `image:` line), env `SPRING_PROFILES_ACTIVE=local`, port `127.0.0.1:${LS_APP_PORT:-8080}:8080`, on the compose network. `LS_APP_PORT=8080` is added to `local.env.example`. A plain `dev-up.sh` still starts infrastructure only.
- `dev-up.sh --full`: same prerequisite checks first, then builds with `docker compose --profile full build` (layer cache reused), starts infrastructure plus `app`, and polls `http://localhost:$LS_APP_PORT/actuator/health` until it reports UP or `LS_WAIT_TIMEOUT` passes (then names `app` and exits non-zero). The URL list shows the app as running. If `tailscale` is installed and logged in, it prints `tailscale serve --bg --https=443 http://localhost:<app port>` and the host's HTTPS URL. Without it, it prints nothing about Tailscale. Unknown flags exit non-zero with usage. `dev-down.sh` also stops the `app` service.
- `frontend/vite.config.ts` proxies `/api` and `/actuator` to `http://localhost:8080`. Hot reload on both sides is untouched.
- `security-scan.sh scan app-image` scans the locally built image (`docker:` source in Grype) with the same blocking rule. The built image must pass; no exception unless no fix exists.
- README: Setup, Development, Layout, Prerequisites reviewed, "arrives with Story 1.5" notes replaced; add the phone-over-Tailscale-HTTPS steps. `deploy/check-urls.sh` treats the app as informational still, but says "running" when it answers.

**Never:**
- No database, Flyway, auth or API endpoints (Story 1.6 and later). No secrets in the image or Dockerfile. No `latest` tags. No change to the blocking rule. No `--no-verify`.
- Tests never need the network or a real Docker daemon, except the one manual image build/run check.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Root | GET `/` | PWA `index.html` | N/A |
| Client route | GET `/children/1` | `index.html`, 200 | N/A |
| Unknown API | GET `/api/nope` | 404, not `index.html` | N/A |
| Missing asset | GET `/assets/x.js` | 404 | N/A |
| Health | GET `/actuator/health` | `{"status":"UP"}`, no details | N/A |
| Full mode, ok | infra up, image builds | app UP, URLs printed | N/A |
| Full mode, build fails | broken build | build output shown | exit non-zero, nothing else started |
| Full mode, never UP | app crashes | names `app` | exit non-zero |
| Tailscale | installed and logged in / absent | serve command printed / nothing | N/A |
| Unpinned base | `FROM` without digest | `check-images.sh` names it | exit non-zero |

</frozen-after-approval>

## Code Map

- `deploy/compose.yaml`, `deploy/images.yaml`, `deploy/check-images.sh` -- add `app` service, three manifest entries, Dockerfile check. `active_refs`/`compose_refs` only read `image:` lines, so the build-only `app` service needs no exception.
- `deploy/dev-up.sh` (`main`, `print_urls`, `report_unhealthy`), `deploy/dev-down.sh` -- add `--full`, health poll, Tailscale hint.
- `deploy/security-scan.sh` (`cmd_scan`, `scan_images`, `finish_target`) -- add `app-image` target; `cmd_images` and `scan_images` already scan manifest entries, including the build-stage images.
- `deploy/check-urls.sh`, `deploy/tests/*.test.sh` -- extend; copy the `check` helper and stub style.
- `backend/src/main/java/app/littlesteps/` -- SPA fallback `WebMvcConfigurer`; `HealthEndpointTests` is the test style (RestTestClient).
- `frontend/vite.config.ts`, `frontend/package.json` (`engines` node 24), `README.md`, `deploy/README.md`, `docs/changelogs/`, `docs/security-reports/` -- docs per CONTRIBUTING.

## Tasks & Acceptance

**Execution:**
- [x] `deploy/Dockerfile`, `.dockerignore`, `deploy/images.yaml` -- three-stage build, non-root runtime, pinned manifest entries
- [x] `deploy/check-images.sh` + test -- Dockerfile `FROM` checks, positive and negative
- [x] `backend/.../SpaFallbackConfig.java` + test -- fallback rules from the matrix
- [x] `frontend/vite.config.ts` -- dev proxy
- [x] `deploy/compose.yaml`, `deploy/local.env.example`, `deploy/dev-up.sh`, `deploy/dev-down.sh`, `deploy/check-urls.sh` + tests -- full mode, stub `docker`, `curl`, `tailscale`
- [x] `deploy/security-scan.sh` -- `scan app-image`
- [x] `README.md`, `deploy/README.md`, changelog, security report, deferred issues -- finish per CONTRIBUTING

**Acceptance Criteria:**
- Given a real Mac with the prerequisites, when `deploy/dev-up.sh --full` runs, then the image builds, `http://localhost:8080/` shows the PWA, `/actuator/health` is UP and a deep link returns the page.
- Given the built image, when `docker run --rm --entrypoint id`-style inspection runs, then the user is not root.
- Given the built image, when `security-scan.sh scan app-image` runs, then it reports no blocking finding.
- Given the new and existing tests, when run, then all pass and `shellcheck` is clean.

## Implementation Notes

Build stages use `dhi.io/node:24-alpine3.23-dev` and `dhi.io/eclipse-temurin:25-jdk-alpine3.23-dev` (with `./mvnw`, wrapper checksum pinned) instead of the Debian `-dev` images named in the spec: those carried dozens of unfixed CVSS 7+ findings. Human decision 2026-11-06: no `scan: deferred` for build stages. One exception (CVE-2026-56109, #68). Runtime stage is `dhi.io/eclipse-temurin:25`, uid 65532.

## Spec Change Log

## Review Triage Log

Layers run: blind-hunter, edge-case-hunter, verification-gap (iteration 1).

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Build-stage images (`node:24-dev`, `maven:3.9-jdk25-dev`) set to `scan: deferred` with dozens of CVSS 7+ findings; weakens the gate; header contradicts (BH, EC) | high | intent_gap, resolved | Human chose non-dev/Alpine images and no deferral (see Implementation Notes). Implementer report: both fail the blocking rule, most without a fix, so exceptions cannot cover them; spec assumed they pass. Human decision needed. |
| 2 | `scan app-image` untested (VG, BH) | medium | patch, fixed | no test names the target; a no-op would still print PASS |
| 3 | `LS_APP_PORT` in check-urls untested (VG, BH) | low | patch, fixed | all tests use 8080 |
| 4 | No cache policy for index.html / service worker (EC, BH) | medium | patch, fixed | custom `/**` handler; stale PWA after redeploy |
| 5 | Missing Dockerfile silently skipped by check-images (EC) | medium | patch, fixed | `-f` guard |
| 6 | Crash-looping app waits full timeout (EC, BH) | medium | patch, fixed | poll never checks container state |
| 7 | Tailscale hint ignores BackendState (EC) | low | patch, fixed | spec says "logged in"; direct fix |
| 8 | images.yaml header contradicts entries (EC, BH) | medium | patch, fixed | header says deferred = not running yet |
| 9 | Plain shellcheck not clean, only `-S warning` (EC) | medium | patch, fixed | spec Verification expects no output |
| 10 | Docs: "only reports state" stale with --full; phone cannot reach Keycloak (BH) | low | patch, fixed | direct doc fix |
| 11 | Exceptions expire 2026-12-04, `scan app-image` then fails (EC, BH) | medium | defer #68 | covered by #56 and #68 renewal; noted in security report |
| 12 | App container hardening: read_only, cap_drop, no-new-privileges, JVM flags (BH) | medium | defer #70 | not in spec |
| 13 | `/API/x` case-sensitive; dotted last segment 404; Accept header; later prefixes (EC, BH) | false | rejected | spec rule is "no file extension", paths are case-sensitive in Spring; prefixes are added when those endpoints exist |
| 14 | Jar glob / -plain jar; mvn vs mvnw (EC, BH) | low | rejected | repackage makes one jar; spec mandates the DHI Maven stage; unlikely |
| 15 | Dockerfile parsing: stage case, continuations, ARG, unused images (EC, BH) | low | rejected | not used in this Dockerfile; orphan check is #61 |
| 16 | curl absent, pretty JSON, wrong LS_TAILSCALE_HOST, docker-missing message, stale image, -h exit code, tailscale off on down (EC, BH) | low | rejected | unlikely in everyday use; each fix adds branches |
| 17 | check-urls "running" on any answer; no compose healthcheck for app (BH, EC) | low | rejected | spec: "running when it answers"; JRE image has no tool for a healthcheck |
| 18 | SpaFallbackTests thin; report_unhealthy app skip untested; jar-contains-PWA only manual (BH, VG) | low | rejected | manual image run covered the real jar; diagnostics-only path |
| 19 | Spec bookkeeping, "Review pass not run" (BH, VG) | medium | patch, fixed | completed in the finish step |

## Verification

**Commands:**
- `cd backend && ./mvnw -q verify` -- expected: tests pass
- `cd frontend && npm run build && npm run lint` -- expected: success
- `shellcheck deploy/*.sh deploy/tests/*.sh` -- expected: no output
- `for t in deploy/tests/*.test.sh; do $t; done && deploy/check-images.sh` -- expected: all pass
- `docker compose --env-file deploy/local.env -f deploy/compose.yaml --profile full config -q` -- expected: valid
- `deploy/security-scan.sh && deploy/security-scan.sh scan app-image` -- expected: PASS

**Manual checks:**
- `deploy/dev-up.sh --full` from another directory; open `http://localhost:8080/` and a deep link; `docker exec`-free check that the container user is 65532; `deploy/dev-down.sh`.
