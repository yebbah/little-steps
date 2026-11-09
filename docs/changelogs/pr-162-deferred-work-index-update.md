# Changelog: Pull request #162, Update the deferred-work index

| | |
|---|---|
| Pull request | #162, issue #89 |
| Kind | Docs; not a story |
| Origin | Closure of #101 and #134; Vitest half of #89 done in #159 |
| Branch | feature/epic-02-issue-89-deferred-index |
| Commits | d8cbf5a (squashed on merge) |
| Date | 2026-11-08 |
| Size | 1 files, +1 −3 |
| Security report | [pr-162-deferred-work-index-update.md](../security-reports/pr-162-deferred-work-index-update.md) |

## Summary

Removes the closed deferred issues #101 and #134 from the index and narrows #89 to JaCoCo.

## Added

- None

## Changed

- `deferred-work.md` index.

## Fixed

- None

## Removed or deprecated

- None

## Security

Documentation only. Verdict: pass with warnings (unchanged). Details, scan numbers and the scan source are in the [security report](../security-reports/pr-162-deferred-work-index-update.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | No change |
| Release | No change |
| Deployment | No change |

README section(s) concerned: Not applicable.

README.md was not changed in this pull request.

## After you pull

Nothing to do.

## Tests

Not applicable: one index file.

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

#89 (JaCoCo) remains open, target 2027-02-04.
