# Changelog: Pull request #159, Enforce an 80% frontend coverage floor in Vitest

| | |
|---|---|
| Pull request | #159, issue #158 |
| Kind | Test tooling; not a story |
| Origin | Epic 2 test design item T1; AD-28 |
| Branch | feature/epic-02-issue-158-coverage-floor |
| Commits | 708cfa7 (squashed on merge) |
| Date | 2026-11-08 |
| Size | 4 files, +12 −3 |
| Security report | [pr-159-frontend-coverage-floor.md](../security-reports/pr-159-frontend-coverage-floor.md) |

## Summary

Vitest now fails the build when frontend coverage drops below 80% for lines, statements, functions or branches. The suite measures above 90% today.

## Added

- `coverage.thresholds` of 80 in `frontend/vite.config.ts`.
- A guard for the thresholds in `deploy/tests/ci-workflow.test.sh`.
- A CONTRIBUTING rule that lowering the floor is a spec change.

## Changed

- README notes the floor.

## Fixed

- None

## Removed or deprecated

- None

## Security

No security-relevant change. Verdict: pass with warnings (unchanged). Details, scan numbers and the CI run are in the [security report](../security-reports/pr-159-frontend-coverage-floor.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | `npm run test:coverage` fails below 80%. |
| Release | No change |
| Deployment | No change |

README section(s) concerned: Development, Continuous integration.

README.md was changed in this pull request.

## After you pull

Nothing to do.

## Tests

`npm run test:coverage` passes (lines 97.34, statements 95.77, functions 93.75, branches 91.85). Negative check: with the lines floor raised to 99 Vitest fails with the expected message. `ci-workflow.test.sh`: 39 passing.

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

The JaCoCo half of #89 remains open.
