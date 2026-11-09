# Changelog: Pull request #122, Keep Test Architect outputs in the repo

| | |
|---|---|
| Pull request | #122, issue none recorded |
| Kind | Docs and tooling configuration; not a story |
| Origin | The test-architect module wrote to a folder outside the repository, so its outputs were never committed |
| Branch | docs/tea-outputs-in-repo |
| Commits | a858f9d (squashed on merge) |
| Date | 2026-11-07 |
| Size | 6 files, +173 −5 |
| Security report | [pr-122-test-architect-outputs-in-repo.md](../security-reports/pr-122-test-architect-outputs-in-repo.md) |

## Summary

The BMAD configuration now redirects the outputs to `.specs/test-artifacts/`. The Epic 2 test design and checklist move there, two progress files that existed only outside the repository are added, and the references in sprint status and frontend/e2e/README.md are fixed.

## Added

- Added 2 file(s): `.specs/test-artifacts/framework-setup-progress.md`, `.specs/test-artifacts/test-design-progress-epic-2.md`

## Changed

- Changed 4 file(s): `.specs/implementation-artifacts/sprint-status.yaml`, renamed .specs/implementation-artifacts/epic-2-atdd-red-phase.md to .specs/test-artifacts/epic-2-atdd-red-phase.md, renamed .specs/implementation-artifacts/epic-2-test-design.md to .specs/test-artifacts/epic-2-test-design.md, `frontend/e2e/README.md`

## Fixed

- None

## Removed or deprecated

- None

## Security

Documents and tracking files only. Verdict: pass with warnings. Details, scan numbers and the scan source are in the [security report](../security-reports/pr-122-test-architect-outputs-in-repo.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | No change |
| Release | No change |
| Deployment | No change |

README section(s) concerned: Not applicable (documents only).

README.md was not changed in this pull request.

## After you pull

Nothing to do.

## Tests

Not applicable: documents only. No test was added or changed.

The CI run on the pull request concluded successfully.

## Deferred and known issues

None.
