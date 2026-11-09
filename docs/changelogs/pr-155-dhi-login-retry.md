# Changelog: Pull request #155, Retry the dhi.io login when the registry is unavailable

| | |
|---|---|
| Pull request | #155, issue #102 |
| Kind | CI; not a story |
| Origin | Epic 1 retrospective (deferred from Story 1.8) |
| Branch | feature/epic-01-issue-102-dhi-login-retry |
| Commits | e516f5f (squashed on merge) |
| Date | 2026-11-08 |
| Size | 3 files, +14 −2 |
| Security report | [pr-155-dhi-login-retry.md](../security-reports/pr-155-dhi-login-retry.md) |

## Summary

The backend CI job logs in to `dhi.io` before Testcontainers pulls PostgreSQL. A brief 503 from the registry used to fail the job; the login now retries four times and then fails loudly.

## Added

- A retry loop for the `dhi.io` login (4 attempts, pauses of 10, 20 and 30 s) in `.github/workflows/ci.yml`.
- Guards in `deploy/tests/ci-workflow.test.sh`.

## Changed

- README documents the retry.

## Fixed

- Backend job failures caused by a short registry outage.

## Removed or deprecated

- None

## Security

No secret handling changed: the login still uses the repository secrets and fails after the last attempt. Verdict: pass with warnings (unchanged). Details, scan numbers and the CI run are in the [security report](../security-reports/pr-155-dhi-login-retry.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | No change |
| Release | CI only, no change for developers |
| Deployment | No change |

README section(s) concerned: Continuous integration.

README.md was changed in this pull request.

## After you pull

Nothing to do.

## Tests

`deploy/tests/ci-workflow.test.sh` guards the retry loop and the loud failure.

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

None.
