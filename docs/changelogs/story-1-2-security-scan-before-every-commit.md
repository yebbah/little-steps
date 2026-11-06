# Changelog: Story 1.2, Security scan before every commit

| | |
|---|---|
| Story | 1.2, issue #27 |
| Epic | 1, Local environment and project skeleton |
| Branch | feature/epic-01-issue-2-local-environment |
| Commits | c88898d, 2a93c60, ec7a1a7 |
| Date | 2026-11-06 |
| Security report | [story-1-2-security-scan-before-every-commit.md](../security-reports/story-1-2-security-scan-before-every-commit.md) |

## Summary

Every commit is now scanned for leaked secrets and for vulnerable backend, frontend and image components. A finding in the CISA KEV catalog, or with a CVSS of 7.0 or more, blocks the commit.

## Added

- `deploy/security-scan.sh`: the single scan entry point, with subcommands `run` (default), `install-tools`, `secrets`, `evaluate`, `images` and `scan`.
- `.githooks/pre-commit`, which runs the scan before each commit.
- Pinned Grype, Syft and gitleaks, installed into `.tools/` with SHA-256 verification.
- `deploy/security-policy.jq` (the blocking rule), `deploy/gitleaks.toml`, and `security/exceptions.yaml` for written exceptions (reason, mitigation, expiry within 30 days).
- A CycloneDX SBOM of the backend (`cyclonedx-maven-plugin`, test scope included), and reports in `build/security/` (`summary.txt`, `report.json`).
- `deploy/tests/security-scan.test.sh`, with fixtures.
- `docs/security-reports/` with a template and the Story 1.2 report.

## Changed

- Root README: security scan section, no `--no-verify`.
- `.gitignore` ignores `.tools/`.

## Fixed

- Review found and fixed 23 issues before release, among them dev dependencies skipped by the frontend scan, partly staged files scanned from the wrong copy, test-scope dependencies missing from the SBOM, and portability to Linux.

## Removed or deprecated

None.

## Security

Verdict: pass with warnings. Three frontend dev-dependency warnings (deepmerge, glob, minimatch), none blocking, no exceptions. See the [security report](../security-reports/story-1-2-security-scan-before-every-commit.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | Run `deploy/security-scan.sh install-tools` once; `jq` is required | Setup |
| Development | A commit runs the scan, never use `--no-verify`; exceptions go in `security/exceptions.yaml` | Development |
| Release | The security report of each story is part of the release record | Release |
| Deployment | No change | Deployment |

## After you pull

1. `deploy/security-scan.sh install-tools`
2. `git config core.hooksPath .githooks`
3. `deploy/security-scan.sh` to check the repository scans clean.

## Tests

59 checks in `deploy/tests/security-scan.test.sh` pass (blocking, warning, exception, KEV cache, every target, the full run, and a real commit through the hook). `./mvnw verify` and the frontend build still pass.

## Deferred and known issues

- Hook enabled automatically by `dev-up.sh`: Story 1.4.
- CI asserts no `LS_*` test override is set: Story 1.8.
- Exceptions scoped by package, a policy for unscored Unknown findings, and a fuller `report.json`: see `.specs/implementation-artifacts/deferred-work.md`.
