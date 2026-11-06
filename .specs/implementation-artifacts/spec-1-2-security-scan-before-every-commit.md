---
title: 'Story 1.2: Security scan before every commit'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '48f0922fff571abe55f381cd9b9710c9166dfd00'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/little-steps/.specs/implementation-artifacts/epic-1-context.md'
  - '{project-root}/little-steps/.specs/planning-artifacts/epics/epic-01-local-environment.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Nothing stops a commit that carries a known-exploited or high-severity dependency, or a leaked secret, into a public repository that will hold sensitive child data.

**Approach:** One bash entry point, `deploy/security-scan.sh`, run by `.githooks/pre-commit`. It scans staged changes (gitleaks), the backend SBOM and the frontend lockfile (Grype), and the images in `deploy/images.yaml` once that exists. A jq policy turns Grype's JSON into pass or fail using KEV and CVSS, with expiring exceptions.

## Boundaries & Constraints

**Always:**
- Bash and jq only, no Python. Pinned versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1, with SHA-256 per OS and architecture (darwin and linux, arm64 and amd64) held in the script and verified before use. `deploy/security-scan.sh install-tools` downloads them into `.tools/` (git-ignored). A missing tool prints that one command.
- Blocking rule: a finding fails when its CVE is in CISA KEV or its CVSS is 7.0 or above (highest score reported for the CVE). Output per finding: package, version, CVE, KEV flag, CVSS, fixed version.
- KEV feed cached in `build/security/cache/`, refreshed at most once a day. No cache and no network fails the scan with the reason. A stale cache with no network is used with a warning.
- A finding with no fixed version passes only with an entry in `security/exceptions.yaml`: `cve`, `reason`, `mitigation`, `expires` (YYYY-MM-DD, at most 30 days from today, not in the past). Any malformed or expired entry fails the whole scan. An exception never covers a CVE that has a fixed version.
- Findings below 7.0 and not in KEV pass with a warning.
- Reports go to `build/security/`: `report.json` and `summary.txt`.
- Every component class is a scan target, with the same blocking rule: (1) backend Java dependencies, (2) frontend npm dependencies, (3) container images, (4) secrets in staged changes. `summary.txt` lists each target with its component count and result, so a skipped target is visible.
- Backend: `cyclonedx-maven-plugin` 2.9.3 added to `backend/pom.xml`, producing `backend/target/bom.json` (all scopes, transitive). The hook regenerates it only when `backend/pom.xml` is staged or the SBOM is missing; otherwise it reuses it.
- Frontend: Syft builds an SBOM from `frontend/package-lock.json` (runtime and dev dependencies, all transitive), and Grype scans it. A lockfile that is missing or out of step with `package.json` fails the scan.
- Images: every image in `deploy/images.yaml` is scanned by digest through Grype (`registry:` source, no Docker daemon needed). While `images.yaml` is absent, the step passes with a notice only if no `deploy/compose.yaml` or `deploy/Dockerfile` exists. If either exists without the manifest, the scan fails. An image listed in the manifest that cannot be pulled fails the scan.
- A target with zero components found fails the scan, since an empty SBOM would otherwise pass silently.
- Policy logic is separate from tool invocation (`evaluate <grype.json>`), so tests run it on fixtures without the network. The Grype output is the only input to the policy.
- The root README states that commits are never made with `--no-verify`, and how to enable the hook (`git config core.hooksPath .githooks`; Story 1.4's `dev-up.sh` will automate it).

**Never:**
- No Trivy. No CI workflow (Story 1.8). No images manifest (Story 1.3). No bypass flag or environment variable that skips the scan.
- No real secrets in fixtures; the fake secret is built at test time, not stored.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| KEV finding | CVE in KEV, CVSS 5.0 | Exit 1, finding listed with KEV flag | N/A |
| High CVSS | CVSS 7.5, not in KEV | Exit 1 | N/A |
| Low CVSS | CVSS 5.0, not in KEV | Exit 0 with warning | N/A |
| Valid exception | No fix, entry expires in 10 days | Exit 0, exception noted | N/A |
| Expired exception | Entry expired yesterday | Exit 1 | Message names the CVE and date |
| Long or malformed exception | Expiry over 30 days, or missing field | Exit 1 | Message names the entry |
| Exception but fix exists | Fixed version available | Exit 1 | Message says upgrade |
| Staged secret | Fake key staged | Exit 1 from gitleaks | N/A |
| No KEV cache, no network | Empty cache | Exit 1 | Says why |
| Tool missing | No grype | Exit 1 | One install command |
| Vulnerable npm package | Lockfile fixture with a KEV or High package | Exit 1, target shown as frontend | N/A |
| Vulnerable image | Image report with a High finding | Exit 1, target shown as the image name | N/A |
| Missing lockfile or empty SBOM | No `package-lock.json`, or zero components | Exit 1 | Names the target |
| Compose without manifest | `deploy/compose.yaml` exists, no `images.yaml` | Exit 1 | Says to add the manifest |

</frozen-after-approval>

## Code Map

- `deploy/security-scan.sh` -- new; subcommands `run` (default), `install-tools`, `evaluate`.
- `.githooks/pre-commit` -- new; runs the script, exit code passes through.
- `security/exceptions.yaml` -- new; empty `exceptions: []` plus a format comment. `security/README.md` updated.
- `deploy/tests/security-scan.test.sh` and `deploy/tests/fixtures/` -- new; plain-bash tests with fixture Grype reports, a fixture KEV file and exceptions.
- `backend/pom.xml` -- add cyclonedx-maven-plugin 2.9.3 (verify phase). Do not touch the enforcer or other plugins.
- `.gitignore` -- add `.tools/`. `README.md` -- scan section. `deploy/README.md` -- update.
- Not to change: `.specs/planning-artifacts/`, the frontend sources.

## Tasks & Acceptance

**Execution:**
- [x] `deploy/security-scan.sh` -- implement install-tools, KEV cache, SBOM, scans, evaluate policy, reports -- the single scan entry point (AD-25).
- [x] `.githooks/pre-commit`, `security/exceptions.yaml`, `.gitignore`, `backend/pom.xml` -- add -- hook, exception store, SBOM generation.
- [x] `deploy/tests/` -- tests for every Matrix row that does not need the network, plus live checks that prove the real integration for each class: Grype on a CycloneDX fixture with log4j-core 2.14.1 (backend) and on a small npm lockfile fixture with a known KEV or Critical package (frontend) must both block. The image path is tested with a fixture Grype image report, and a live scan of a small public image runs only when `LS_SCAN_LIVE_IMAGE` names one.
- [x] `README.md`, `deploy/README.md`, `security/README.md` -- document usage and the no `--no-verify` rule.
- [x] Run the scan on the repository itself and fix or record whatever it reports (Story 1.1's lockfiles).

**Acceptance Criteria:**
- Given a staged fake secret, when `git commit` runs with the hook enabled, then the commit is blocked.
- Given the repository as it is, when the scan runs, then it exits 0 with no KEV, High or Critical finding, and `build/security/summary.txt` lists the backend and frontend targets with their component counts (and the images target as skipped, with the reason).
- Given the test script, when it runs, then all six cases from the issue pass and the script exits 0.

## Implementation Notes

- Syft ignores devDependencies in lockfiles by default, which left 4 of 439 packages unscanned. `SYFT_JAVASCRIPT_INCLUDE_DEV_DEPENDENCIES=true` fixes it, and the scan now sees all 439.
- Added `deploy/security-policy.jq` (the blocking rule as a pure jq filter) and a `scan backend|frontend|images` subcommand used by tests. Neither bypasses the scan: `run` always covers every target.
- A finding with no CVSS score at all that Grype rates High or Critical blocks (unknown is treated as the worst case). KEV is matched on the CVE and on CVE aliases of GHSA ids.
- `images.yaml` is read as `name:` and `digest:` lines and scanned as `registry:name@digest`. Story 1.3 must keep those two keys, or adapt `cmd_images`.
- First scan of Story 1.1's lockfiles: PASS, with three warnings (deepmerge 5.3 with no fix, glob 6.3, minimatch 6.9), all below 7.0 and not in KEV. These go in the Epic 1 release note.
- Tests: 30 checks pass (policy, KEV cache, targets, live log4j, live lodash, real gitleaks secret). A real `git commit` with a staged fake secret was blocked by the hook. `LS_SCAN_LIVE_IMAGE` run on an alpine digest also passed.
- `core.hooksPath` is set locally to `.githooks`; Story 1.4 automates this for other clones.

## Spec Change Log

## Review Triage Log

Reviewer subagents were not launched (not requested). Inline self-review of the diff:

| # | Layer | Finding | Verdict | Evidence / route |
|---|---|---|---|---|
| 1 | inline | Frontend SBOM skipped dev dependencies (4 of 439 packages) | high | Found by checking the count against the lockfile. Patched with SYFT_JAVASCRIPT_INCLUDE_DEV_DEPENDENCIES. |
| 2 | inline | No KEV cache and no network crashed in jq instead of failing cleanly | medium | Caught by a new test. Patched: KEV is resolved once up front. |
| 3 | inline | Failure in the grouped scan was detected only by grepping the summary | medium | Patched: the group exit status now carries the result. |

## Verification

**Commands:**
- `deploy/security-scan.sh install-tools` -- expected: three tools installed, checksums verified
- `deploy/tests/security-scan.test.sh` -- expected: exit 0, all cases pass
- `deploy/security-scan.sh` -- expected: exit 0, reports in `build/security/`
- `(cd backend && ./mvnw -q verify)` -- expected: exit 0, `backend/target/bom.json` present
