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
- Tests: 59 checks pass after the reviewer pass (policy, KEV cache, every target, SBOM regeneration with a stub mvnw, the full `run`, a real `git commit` through the hook, live log4j, live lodash in dependencies and devDependencies, real gitleaks secret). A real `git commit` with a staged fake secret was blocked by the hook. `LS_SCAN_LIVE_IMAGE` run on an alpine digest also passed.
- `core.hooksPath` is set locally to `.githooks`; Story 1.4 automates this for other clones.

## Spec Change Log

## Review Triage Log

Three reviewer subagents ran (Blind Hunter, Edge Case Hunter, Verification Gap) on the diff from `baseline_commit` to the first commit. Earlier inline self-review found rows 1 to 3.

| # | Layer | Finding | Verdict | Evidence / route |
|---|-------|---------|---------|------------------|
| 1 | inline | Frontend SBOM skipped devDependencies (4 of 439 packages) | high | patch, fixed with SYFT_JAVASCRIPT_INCLUDE_DEV_DEPENDENCIES. |
| 2 | inline | No KEV cache and no network crashed in jq | medium | patch, fixed: KEV resolved once up front. |
| 3 | inline | Failure in the grouped scan only detected by grepping the summary | medium | patch, fixed: group exit status carries the result. |
| 4 | gap | `run` (the hook path) has no test | high | Real: nothing called `cmd_run`. patch, fixed: run tests for every target, hook test through real `git commit`. |
| 5 | gap, edge | SBOM regeneration untested | medium | patch, fixed: stub-mvnw tests for missing, fresh, newer-pom and staged-pom cases. |
| 6 | gap | devDependency scanning unpinned by tests | medium | patch, fixed: devDependency lodash fixture. |
| 7 | blind, edge, gap | `tr 'A-Za-z0-9._-\n'` is a reversed range on GNU tr | medium | Real for Linux CI (Story 1.8). patch, fixed: `-` moved last. |
| 8 | blind, edge | Dependency scans read the working tree, commit takes the index | medium | patch, fixed: a partly staged pom, package.json, lockfile or images.yaml fails. |
| 9 | blind | Backend SBOM omitted test-scope dependencies | medium | Spec says all scopes. patch, fixed: includeTestScope (55 to 93 components). |
| 10 | edge | images.yaml entry without a digest silently never scanned | medium | patch, fixed: parse error fails the scan. |
| 11 | edge | Image report files collide when sanitised names match | low | patch, fixed: index prefix. |
| 12 | edge | grype inside a heredoc-fed loop can eat stdin | low | patch, fixed: `</dev/null`. |
| 13 | edge | Impossible date (2026-13-45) gave an opaque jq failure; broken exceptions check read as no errors | medium | patch, fixed: clear message, check fails on evaluation error. |
| 14 | edge | `scan` skipped the exceptions expiry check | low | patch, fixed. |
| 15 | edge | `grep -q` in a pipeline under pipefail can miss a staged pom | low | patch, fixed: staged list read into a variable. |
| 16 | edge | Corrupt KEV cache under a day old fails opaquely | medium | patch, fixed: cache validated before use. |
| 17 | edge | Old summary.txt and report.json survive an early failure | medium | patch, fixed: removed at the start of `run`. |
| 18 | edge | `unique_by` can drop the blocking duplicate | medium | patch, fixed: block sorts first. |
| 19 | edge | Repo `.gitleaks.toml` or GITLEAKS_CONFIG could weaken the secret scan | medium | patch, fixed: explicit `deploy/gitleaks.toml`, env unset. |
| 20 | blind | Installer leaks temp dir, needs `shasum` | low | patch, fixed: cleanup and `sha256sum` fallback. |
| 21 | blind | Unindented `- cve:` list item rejected | low | patch, fixed (it failed closed). |
| 22 | blind | `--help` truncated, `scan` undocumented | low | patch, fixed. |
| 23 | gap, blind | `"$(echo 0)"` and `sleep 1` oddities in tests | low | patch, fixed. |
| 24 | blind, edge | LS_* test overrides honoured in the production path | medium | Deferred to Story 1.8: CI must assert none is set. They replace inputs, not skip the scan. |
| 25 | blind | Exceptions keyed by CVE only, no package scope | medium | Deferred: schema change. |
| 26 | blind, edge | Unscored finding with Unknown severity passes | medium | Deferred: unknowable score, policy decision for the user. |
| 27 | blind, edge | report.json omits secrets and failed targets | low | Deferred: summary.txt is complete. |
| 28 | blind | Hook inactive until `core.hooksPath` is set, no fast path | medium | Deferred to Story 1.4 (dev-up.sh enables it). |
| 29 | blind | CVSS pooled across v2, v3, v4 and related ids | false | Deliberate and in the approved intent: highest score reported for the CVE. |
| 30 | blind | Stale KEV cache accepted offline | false | Deliberate and approved: warning, only a missing cache fails. |
| 31 | blind | Grype database age unchecked | false | Grype itself refuses a database older than 5 days and the scan fails with a message. |
| 32 | blind, edge | Zero-match image report passes | false | A clean image has no matches. An unreadable image makes Grype exit non-zero. Label only (deferred in row 27's family, cosmetic). |
| 33 | edge | Hook regenerates when pom is newer than SBOM | false | Intended: the SBOM must reflect the pom. |
| 34 | blind | Expired exception fails the scan even if the CVE is gone | false | Specified behaviour: an expired entry fails the scan. |
| 35 | edge | Tool checksums verified only at install | low | Rejected: `.tools/` is local and git-ignored; anyone who can write there can edit the hook. |
| 36 | blind | Invalid JSON reported as out of step; parent-POM changes ignored; summary lacks counts for secrets | low | Rejected: still fails closed, no named harm. |

## Verification

**Commands:**
- `deploy/security-scan.sh install-tools` -- expected: three tools installed, checksums verified
- `deploy/tests/security-scan.test.sh` -- expected: exit 0, all cases pass
- `deploy/security-scan.sh` -- expected: exit 0, reports in `build/security/`
- `(cd backend && ./mvnw -q verify)` -- expected: exit 0, `backend/target/bom.json` present
