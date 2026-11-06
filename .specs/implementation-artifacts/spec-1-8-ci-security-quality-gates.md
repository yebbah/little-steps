---
title: 'Story 1.8: Continuous integration with security and quality gates'
type: 'feature'
created: '2026-11-06'
status: 'in-review'
baseline_commit: 'f66e007e124a4111f828d576e6e9de02af250076'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/little-steps/.specs/implementation-artifacts/epic-1-context.md'
  - '{project-root}/little-steps/.specs/planning-artifacts/epics/epic-01-local-environment.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every check runs only on a developer machine, behind a hook that can be skipped. Nothing builds, tests, scans or lints a push on its own.

**Approach:** One GitHub Actions workflow, `.github/workflows/ci.yml`, repeats the build, test, boundary, security and quality checks on every push and pull request, on free hosted runners. Source: GitHub issue #33 (acceptance criteria there are the contract).

## Boundaries & Constraints

**Always:**
- Jobs: Backend (`./mvnw verify`, JaCoCo, `guardrail-eval` excluded), Frontend (npm ci, lint, typecheck, Vitest coverage, build, OpenAPI drift check when `api:check` exists), Scripts (action pinning, shellcheck, `images.yaml` digest check, script tests), Security (`security-scan.sh secrets` over history, `scan backend`, `scan frontend`; image scans and the app image build stay manual, #95). The Backend job logs in to dhi.io for Testcontainers.
- Every third-party action pinned to a full commit SHA with the version in a comment; `deploy/check-actions.sh` fails on anything else and refuses forms it cannot read.
- Reports (surefire, JaCoCo, SBOM, coverage, security) uploaded as artifacts. Maven, npm and the Grype database cached; scan tools and the KEV feed are never cached.
- The security gate rule is unchanged (KEV or CVSS 7.0+).

**Never:**
- No `--no-verify` equivalents, no skipped scan, no image push, no self-hosted or paid runners, no new third-party actions beyond `actions/*`.
- Do not build Story 1.6 or 1.7 content (modules, Testcontainers base, `api:check`).

</frozen-after-approval>

## Code Map

- `.github/workflows/ci.yml` -- the workflow. `deploy/check-actions.sh` + `deploy/tests/check-actions.test.sh`, `deploy/tests/ci-workflow.test.sh` -- pin check and a guard that required steps stay.
- `deploy/security-scan.sh` (`cmd_secrets`) -- `LS_SECRETS_SCOPE=history` for CI, validated; tests in `deploy/tests/security-scan.test.sh`.
- `backend/pom.xml` -- JaCoCo (0.8.16) and surefire `excludedGroups`. `frontend/package.json`, `vite.config.ts`, `src/App.test.tsx` -- `typecheck`, `test`, `test:coverage`, Vitest 5.1.0.
- `README.md` (badge, "Continuous integration"), `deploy/README.md`, `docs/CONTRIBUTING.md` (pointer to the pin check).

## Tasks & Acceptance

- [x] Workflow, pin check and tests, workflow guard test
- [x] JaCoCo, surefire exclusion, Vitest, scripts
- [x] History scope for the secret scan, tests
- [x] README, deploy README, CONTRIBUTING pointer, changelog, security report, deferred issues

**Acceptance Criteria:** see issue #33. Verified locally: all commands the workflow runs, actionlint 1.7.7 clean. The workflow itself can only run on GitHub (needs the DHI secrets for the Backend job).

## Review Triage Log

Layers run: blind-hunter, edge-case-hunter, verification-gap (iteration 1, three separate reviewers).

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Cache restore across branches could replace `.tools` binaries or serve a stale KEV feed (BH, EC) | high | patch, fixed | only `~/.cache/grype` cached; README and ci.yml comment |
| 2 | `LS_SECRETS_SCOPE` typo falls back to staged scan, passing vacuously in CI (EC) | medium | patch, fixed | `cmd_secrets` dies on unknown value; test "unknown secrets scope" |
| 3 | History scan on a shallow clone scans less (BH, EC) | low | patch, fixed | dies when shallow; test "refuses a shallow clone" |
| 4 | check-actions skips flow mapping, quoted key, block scalar, last line without newline; CRLF false positive (BH, EC) | medium | patch, fixed | new tests in check-actions.test.sh |
| 5 | check-actions accepts `..` paths and non-hex docker digests (BH) | low | patch, fixed | tightened regexes; tests |
| 6 | Push plus pull_request double runs; main runs cancelled by newer push (BH, EC) | medium | patch, fixed | concurrency group on `head_ref`, no cancel on main |
| 7 | No test that required steps stay in ci.yml, every step named, badge present (VG) | high | patch, fixed | deploy/tests/ci-workflow.test.sh, run in Scripts job |
| 8 | `.err` and `.log` scan diagnostics not uploaded (EC) | low | patch, fixed | artifact paths in ci.yml |
| 9 | `api:check` skipped silently; ModularityTests and Testcontainers not asserted; no failsafe (VG, EC) | medium | defer #88 | depends on #31 and #34 |
| 10 | Coverage reported, not gated (VG) | medium | defer #89 | no baseline yet |
| 11 | Fork and Dependabot PRs fail the Security job; PR scan reads whole history (BH, EC, VG) | medium | defer #90 | single maintainer today; README documents the secrets |
| 12 | `npm ci --ignore-scripts` (BH) | low | rejected | the lockfile is audited by the scan; read-only token; would risk the native build tools |
| 13 | GRYPE_*/GITLEAKS_* env not in the override guard (BH) | low | rejected | runner env is controlled by the workflow file itself |
| 14 | app-image result not in summary.txt/report.json (VG) | low | rejected | superseded: image scans removed from CI (#95) |
| 15 | Grype cache path assumed (VG) | low | rejected | default Linux location; cache miss only costs time |
| 16 | Security job cache key per run churns cache (EC) | low | rejected | restore-keys fallback; 10 GB limit not near |

## Verification

- `cd backend && ./mvnw verify`; `cd frontend && npm ci && npm run lint && npm run typecheck && npm run test:coverage && npm run build`
- `shellcheck deploy/*.sh deploy/tests/*.sh .githooks/*`; `for t in deploy/tests/*.test.sh; do $t; done`; `deploy/check-actions.sh`; `deploy/check-images.sh`
- `docker run --rm -v "$PWD":/repo -w /repo rhysd/actionlint:1.7.7`
