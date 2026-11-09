# Changelog: Pull request #100, Fix workflow documentation drift

| | |
|---|---|
| Pull request | #100, issue none recorded |
| Kind | Docs and repository setting; not a story |
| Origin | Drift found between the workflow documents and the code |
| Branch | docs/workflow-drift-fixes |
| Commits | bf9ae5b (squashed on merge) |
| Date | 2026-11-06 |
| Size | 4 files, +22 −3 |
| Security report | [pr-100-workflow-documentation-drift-fixes.md](../security-reports/pr-100-workflow-documentation-drift-fixes.md) |

## Summary

Points spec-first step 4 at the changelog's Changed section, states the non-deferrable rule in deferred-items.md, draws the epic and story issue hierarchy in workflow.md, and states in the README what branch protection enables. It also records a repository setting changed with the pull request.

## Added

- None

## Changed

- Changed 4 file(s): `README.md`, `docs/CONTRIBUTING.md`, `docs/deferred-items.md`, `docs/workflow.md`

## Fixed

- None

## Removed or deprecated

- None

## Security

Documentation only, plus a repository setting: branch protection on `main` (a pull request is required, no approvals required, the four CI jobs required, no force push or deletion, administrators not enforced). Verdict: pass with warnings. Details, scan numbers and the scan source are in the [security report](../security-reports/pr-100-workflow-documentation-drift-fixes.md).

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

None.
