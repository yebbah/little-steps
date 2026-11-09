# Changelog: Pull request #99, Sync specs with the code (spec drift audit)

| | |
|---|---|
| Pull request | #99, issue #95 (CI image scans) |
| Kind | Docs (spec); not a story |
| Origin | The spec drift audit of 2026-11-06 |
| Branch | docs/spec-drift-sync |
| Commits | e3e23cf (squashed on merge) |
| Date | 2026-11-06 |
| Size | 6 files, +18 −14 |
| Security report | [pr-99-spec-drift-sync.md](../security-reports/pr-99-spec-drift-sync.md) |

## Summary

Updates the specs for the drift found in the audit: CI scans secrets and dependencies while image scans run by hand before a release, NFR-20 to NFR-22 added to the PRD, epics index and Epic 1 marked done, and the stack table updated (springdoc 3.2.0, Mailpit v1.33.0 digest-pinned). No code changed.

## Added

- None

## Changed

- Changed 6 file(s): `...nning-artifacts/architecture/architecture-little-steps-2026-11-05/ARCHITECTURE-SPINE.md`, `.specs/planning-artifacts/epics/epic-01-local-environment.md`, `.specs/planning-artifacts/epics/index.md`, `.specs/planning-artifacts/epics/requirements.md`, `.specs/planning-artifacts/prds/prd-little-steps-2026-11-05/prd.md`, `.specs/specs/spec-little-steps/SPEC.md`

## Fixed

- None

## Removed or deprecated

- None

## Security

Specifications only. Verdict: pass with warnings (the usual frontend warnings). Details, scan numbers and the scan source are in the [security report](../security-reports/pr-99-spec-drift-sync.md).

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
