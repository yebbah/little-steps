# Changelog: Pull request #164, Bump the Keycloak 26.8.2 digest to the current image

| | |
|---|---|
| Pull request | #164, issue #56 |
| Kind | Fix (image pin); not a story |
| Origin | The pre-commit scan blocked: the newer Keycloak image includes the zlib fix |
| Branch | feature/epic-01-issue-56-keycloak-digest-bump |
| Commits | 861cef3 (squashed on merge) |
| Date | 2026-11-09 |
| Size | 2 files, +2 −2 |
| Security report | [pr-164-keycloak-digest-bump.md](../security-reports/pr-164-keycloak-digest-bump.md) |

## Summary

The `26.8.2` tag moved to a new image that has the zlib fix for CVE-2026-76844 and CVE-2026-85091. Under the image-fix rule the exceptions no longer cover those findings, so the pin was upgraded.

## Added

- None

## Changed

- The Keycloak digest is `sha256:50a09844…` in `deploy/images.yaml` and `deploy/compose.yaml` (same tag).

## Fixed

- The pre-commit scan block on Keycloak zlib CVE-2026-76844 and CVE-2026-85091 (CVSS 8.3).

## Removed or deprecated

- None

## Security

The upgraded Keycloak image scans clean (23 components). Verdict: pass with warnings; the other Keycloak exceptions remain under #56. Details, scan numbers and the CI run are in the [security report](../security-reports/pr-164-keycloak-digest-bump.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | No change |
| Release | No change |
| Deployment | The Keycloak image digest changed. |

README section(s) concerned: Not applicable.

README.md was not changed in this pull request.

## After you pull

Run `deploy/dev-down.sh` then `deploy/dev-up.sh` to pull the new Keycloak image.

## Tests

`deploy/security-scan.sh scan images`: Keycloak PASS (23 components), all other images unchanged and passing. CI security job passed on rerun after two HTTP 504 failures downloading the scan tools (#165).

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

The remaining Keycloak exceptions and the plan to replace the image stay with #56 (expiry 2026-12-04). CI tool download retry: #165.
