# Changelog: Pull request #77, Deferred index sync, scan cadence and triage log format

| | |
|---|---|
| Pull request | #77, issue deferred issues #73 to #76 (origin #27) |
| Kind | Docs (policy); not a story |
| Origin | Stale deferred pointers and an undocumented triage format |
| Branch | docs/triage-log-and-deferred-sync |
| Commits | ec0952b (squashed on merge) |
| Date | 2026-11-06 |
| Size | 9 files, +98 −89 |
| Security report | [pr-77-deferred-index-sync-scan-cadence-triage-log.md](../security-reports/pr-77-deferred-index-sync-scan-cadence-triage-log.md) |

## Summary

Fixes stale deferred pointers, adds the deferred issues #73 to #76 and the index sync check, sets the two-scan cadence per story, normalizes old triage rows to `patch, fixed`, and documents the triage log format.

## Added

- None

## Changed

- Changed 9 file(s): `.specs/implementation-artifacts/deferred-work.md`, `.specs/implementation-artifacts/spec-1-1-scaffold-the-repository.md`, `.specs/implementation-artifacts/spec-1-2-security-scan-before-every-commit.md`, `.specs/implementation-artifacts/spec-1-3-hardened-local-infrastructure.md`, `.specs/implementation-artifacts/spec-1-4-start-and-stop-scripts.md`, `.specs/implementation-artifacts/spec-1-5-hardened-app-image-and-full-mode.md`, `deploy/images.yaml`, `docs/CONTRIBUTING.md`, `docs/deferred-items.md`

## Fixed

- None

## Removed or deprecated

- None

## Security

The diff changes nine files: story specs, the deferred-work index, docs/CONTRIBUTING.md, docs/deferred-items.md and `deploy/images.yaml`. The `deploy/images.yaml` change is a comment only (it now points to the deferred-issue process); no digest or tag changed. No scan result was recorded for this pull request (it predates CI); see the security report. Details, scan numbers and the scan source are in the [security report](../security-reports/pr-77-deferred-index-sync-scan-cadence-triage-log.md).

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

No CI run existed for this pull request (CI arrived with #96).

## Deferred and known issues

None.
