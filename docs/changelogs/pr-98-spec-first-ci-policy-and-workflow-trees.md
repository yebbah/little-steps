# Changelog: Pull request #98, Spec-first policy, CI policy and workflow decision trees

| | |
|---|---|
| Pull request | #98, issue none recorded |
| Kind | Docs (policy); not a story |
| Origin | The spec-drift audit of 2026-11-06 |
| Branch | docs/spec-first-policy |
| Commits | 7255ee6 (squashed on merge) |
| Date | 2026-11-06 |
| Size | 6 files, +198 −1 |
| Security report | [pr-98-spec-first-ci-policy-and-workflow-trees.md](../security-reports/pr-98-spec-first-ci-policy-and-workflow-trees.md) |

## Summary

Adds the Spec first policy (a change that would cause drift needs the spec update first, then the issue, then the code), a Continuous integration policy (merge only on green, no skipped jobs, flaky tests become deferred issues), docs/workflow.md with seven decision trees, a pull request template and a change-request issue template. It also adds a security exception.

## Added

- Added 3 file(s): `.github/ISSUE_TEMPLATE/change-request.md`, `.github/pull_request_template.md`, `docs/workflow.md`

## Changed

- Changed 3 file(s): `README.md`, `docs/CONTRIBUTING.md`, `security/exceptions.yaml`

## Fixed

- None

## Removed or deprecated

- None

## Security

One exception was added to `security/exceptions.yaml`: CVE-2026-76844 (zlib1g, CVSS 8.3, no fix published) in the Keycloak and Temurin runtime images, expiring 2026-12-04. Verdict: pass with warnings. Details, scan numbers and the scan source are in the [security report](../security-reports/pr-98-spec-first-ci-policy-and-workflow-trees.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | No change |
| Release | No change |
| Deployment | No change |

README section(s) concerned: Not applicable (documents only).

README.md was changed in this pull request.

## After you pull

Nothing to do.

## Tests

Not applicable: documents only. No test was added or changed.

The CI run on the pull request concluded successfully.

## Deferred and known issues

Keycloak and Temurin exceptions are tracked in #56 and #68.
