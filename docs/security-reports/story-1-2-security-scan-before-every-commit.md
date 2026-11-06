# Security report: Story 1.2, Security scan before every commit

| | |
|---|---|
| Story | 1.2, issue #27 |
| Branch | feature/epic-01-issue-2-local-environment |
| Commit scanned | 2a93c6016775b6666540b8c1f490a8d7b0e1f194 |
| Date | 2026-11-06 |
| Verdict | PASS WITH WARNINGS |

## 1. Summary

This story adds the security gate itself: `deploy/security-scan.sh`, run by a pre-commit hook, which scans staged changes for secrets and the backend, frontend and image components for vulnerabilities. The scan of the repository as it stands passes, with three warnings in frontend dev dependencies, none in KEV and none at 7.0 or above. The gate was reviewed by three independent reviewers, and 23 of their findings were fixed before this report.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies (all scopes, including test) | 93 | PASS | 0 | 0 |
| Frontend dependencies (runtime and dev, transitive) | 439 | PASS | 0 | 3 |
| Container images | 0 | SKIP | 0 | 0 |

Images are skipped because `deploy/images.yaml` does not exist yet (Story 1.3), and no compose file or Dockerfile exists either. From Story 1.3 on, a compose file or Dockerfile without the manifest fails the scan.

### Warnings (below 7.0, not in KEV)

| Package | Version | CVE | CVSS | Fixed in | Decision |
|---|---|---|---|---|---|
| deepmerge | 4.3.1 | CVE-2026-93753 | 5.3 | none | Accepted: dev dependency only, no fix exists. Re-check at each scan. |
| glob | 11.1.0 | CVE-2026-118773 | 6.3 | 14.0.2 | Accepted: dev dependency via vite-plugin-pwa and workbox-build. Upgrade when the parent releases a compatible version. |
| minimatch | 10.2.6 | CVE-2026-118764 | 6.9 | 11.0.1 | Accepted: same parent chain as glob. |

All three come from vite-plugin-pwa 2.0.0, which Story 1.1 added. Epic 2 (Story 2.8) configures it.

## 3. Exceptions

None. `security/exceptions.yaml` is empty.

## 4. Container images

None in this story. No image is pulled or referenced.

Images from outside Docker Hardened Images: None.

## 5. Supply chain

- Grype, Syft and gitleaks are pinned by version in the script. Each release archive is checked against a SHA-256 value held in the script (darwin and linux, arm64 and amd64) before it is extracted. A checksum mismatch installs nothing. The tools are installed into `.tools/`, which is git-ignored.
- Trivy is deliberately not used, because of its 2026 supply-chain compromise.
- `cyclonedx-maven-plugin` 2.9.3 was added to the backend build to produce the SBOM.
- The checksum is verified at install time only. A binary replaced in `.tools/` afterwards would not be detected. Accepted: anyone who can write there can also edit the hook.
- No GitHub Actions were added. CI arrives with Story 1.8, where actions must be pinned to commit SHAs.

## 6. Secrets and data handling

- gitleaks scans the staged changes with an explicit configuration (`deploy/gitleaks.toml`, default rules), so a stray `.gitleaks.toml` or `GITLEAKS_CONFIG` cannot weaken it. Findings are redacted in the output.
- Tests that need a fake secret build it at run time. No secret value is stored in the repository. The test file contains a documented AWS example secret from public documentation, which the commit hook accepted.
- The scan sends no source code or SBOM to any service. It downloads the Grype vulnerability database, the CISA KEV feed (cached for a day) and, once, the tool archives.
- No application code, logging or data handling changed.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `deploy/tests/security-scan.test.sh` | clean target passes, CVSS 5.0 warns, valid exception passes, clean full run passes, clean hook commit goes through |
| New negative tests | `deploy/tests/security-scan.test.sh` | KEV blocks, CVSS 7.5 and 7.0 block, expired and over-long exceptions block, staged secret blocks, vulnerable npm and log4j blocks, missing lockfile, empty SBOM, compose without manifest, partly staged lockfile and no-KEV-cache-no-network all fail |
| Combined result | `deploy/tests/security-scan.test.sh` | 59 passed, 0 failed |
| Non-regression | `cd backend && ./mvnw -q verify` and `cd frontend && npm run build` | both exit 0 |
| Live image scan (optional) | `LS_SCAN_LIVE_IMAGE=<name@digest> deploy/tests/security-scan.test.sh` | passed on a public alpine digest during development |

A real `git commit` with a staged fake secret was blocked by the hook, and the commit was not created.

## 8. Review findings with security impact

Three reviewers (blind, edge case, verification gap) reported about 36 distinct findings. Full triage: Review Triage Log in `.specs/implementation-artifacts/spec-1-2-security-scan-before-every-commit.md`. The ones that mattered for security, all fixed:

- Dev dependencies were silently skipped, leaving 435 of 439 frontend packages unscanned. This was a coverage gap in the gate, not a shipped-code risk: build-time packages run on developer machines and CI but are not bundled into the final artifact, apart from Workbox code that vite-plugin-pwa copies into the service worker. They are scanned because a compromised build tool runs with access to the developer's files and CI tokens.
- The hook path (`run`) had no test. Now covered, including a real commit through the hook.
- Dependency scans read the working tree while a commit takes the index. A partly staged lockfile, `package.json`, `pom.xml` or `images.yaml` now fails the scan.
- Test-scope backend dependencies were left out of the SBOM (55 became 93).
- An image listed without a digest could be skipped silently. It is now an error.
- A corrupt KEV cache, an impossible exception date, a stale summary after a failed run and a duplicate finding collapsing onto a non-blocking one were each fixed.
- A repo-level gitleaks configuration could have weakened the secret scan. Fixed.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| The hook is inactive in a fresh clone until `core.hooksPath` is set | A commit can skip the scan | Story 1.4 (`dev-up.sh` enables it), Story 1.8 (CI repeats the scan) |
| `LS_*` test overrides are honoured in the production path | A stub tools folder or empty KEV file would weaken the scan | Story 1.8: CI asserts none is set |
| Exceptions are keyed by CVE only | One exception silences a CVE in every package and image | Deferred, see `deferred-work.md` |
| A finding with no score and Unknown severity passes as a warning | A new, unscored vulnerability is not blocked | Deferred: policy decision |
| A stale KEV cache is used offline with a warning | A newly listed CVE can be missed while offline | Accepted: approved behaviour, CI has network |
| `report.json` omits the secrets target and failed targets | The JSON looks cleaner than the summary | Deferred: `summary.txt` is complete |

## 10. Sign-off

Pending: reviewer and date. The story is committed locally and not pushed.
