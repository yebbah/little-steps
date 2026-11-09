# Changelog: Pull request #152, Mandatory OpenAPI drift check and required backend test reports

| | |
|---|---|
| Pull request | #152, issue #88 |
| Kind | CI; not a story |
| Origin | Epic 1 retrospective (deferred from Story 1.8); Epic 2 retrospective action A6 |
| Branch | feature/epic-01-issue-88-mandatory-ci-checks |
| Commits | 5bd8938 (squashed on merge) |
| Date | 2026-11-08 |
| Size | 5 files, +22 −11 |
| Security report | [pr-152-mandatory-openapi-drift-and-test-reports.md](../security-reports/pr-152-mandatory-openapi-drift-and-test-reports.md) |

## Summary

Two CI checks that could silently skip are now mandatory: the OpenAPI type drift check always runs, and CI fails when the `ModularityTests` or `PersistenceBaselineTests` report is missing.

## Added

- A CI step "Backend: required test reports exist" that fails with "was not produced" when a required report is missing.
- Guards for both steps in `deploy/tests/ci-workflow.test.sh`.
- CONTRIBUTING rules: a missing required CI script or report fails the job; backend test classes end in `Test` or `Tests`.

## Changed

- `api:check` runs unconditionally; the skip was removed.
- README and `docs/workflow.md` describe the mandatory steps.

## Fixed

- A misnamed test class could pass by never running, and the drift check could skip without notice.

## Removed or deprecated

- None

## Security

No dependency or image changed; the change makes an existing quality gate harder to bypass. Verdict: pass with warnings (unchanged). Details, scan numbers and the CI run are in the [security report](../security-reports/pr-152-mandatory-openapi-drift-and-test-reports.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | Backend test classes must end in `Test` or `Tests`. |
| Release | CI only, no change for developers |
| Deployment | No change |

README section(s) concerned: Continuous integration.

README.md was changed in this pull request.

## After you pull

Nothing to do.

## Tests

`deploy/tests/ci-workflow.test.sh` guards both steps (it fails on a workflow without the report check or with the drift check skipped), and passed in CI.

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

None.
