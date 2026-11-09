# Changelog: Pull request #153, Playwright refuses a stale server unless asked to reuse one

| | |
|---|---|
| Pull request | #153, issue #150 |
| Kind | Test tooling; not a story |
| Origin | Epic 2 retrospective action R6 |
| Branch | feature/epic-02-issue-150-playwright-no-stale-server |
| Commits | 8c5fe46 (squashed on merge) |
| Date | 2026-11-08 |
| Size | 2 files, +3 −1 |
| Security report | [pr-153-playwright-refuses-stale-server.md](../security-reports/pr-153-playwright-refuses-stale-server.md) |

## Summary

A leftover dev server on the test port used to be reused silently, so tests could run against stale code. Playwright now fails fast on a busy port unless `E2E_REUSE_SERVER=true`.

## Added

- `E2E_REUSE_SERVER` in `frontend/playwright.config.ts`, documented in `frontend/e2e/README.md`.

## Changed

- `reuseExistingServer` is false by default.

## Fixed

- Tests running against a stale server.

## Removed or deprecated

- None

## Security

No security-relevant change. Verdict: pass with warnings (unchanged). Details, scan numbers and the scan source are in the [security report](../security-reports/pr-153-playwright-refuses-stale-server.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | Set `E2E_REUSE_SERVER=true` to reuse a server already on the port. |
| Release | No change |
| Deployment | No change |

README section(s) concerned: frontend/e2e/README.md.

README.md was not changed in this pull request.

## After you pull

Stop any dev server on port 4173 before running the end-to-end tests.

## Tests

Checked locally: with a server on the port the run fails fast, and with `E2E_REUSE_SERVER=true` it reuses it. No new automated test was added; the Playwright suite itself passed in CI.

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

None.
