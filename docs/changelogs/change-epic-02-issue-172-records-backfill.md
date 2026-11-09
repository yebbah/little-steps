# Changelog: Backfill changelogs and security reports for the older non-story pull requests

| | |
|---|---|
| Issue | #172 (closes it) |
| Kind | Docs; not a story |
| Origin | Maintainer decision, 2026-11-09: no holes or gaps in the records |
| Branch | feature/epic-02-issue-172-records-backfill |
| Pull request | the one opened from this branch (its number is in the squash commit title and in the index) |
| Date | 2026-11-09 |
| Security report | [change-epic-02-issue-172-records-backfill.md](../security-reports/change-epic-02-issue-172-records-backfill.md) |

## Summary

Adds a changelog and a security report for each of the 20 non-story pull requests merged before #147 (#1 to #142), so every merged pull request now has both records. Eight of them predate CI, and their reports say that no scan was recorded and give the one check that could still be run: a gitleaks scan of each squash commit, which found no leaks.

## Added

- 20 changelogs and 20 security reports named `pr-<number>-<slug>.md`, with the facts taken from each pull request on GitHub, its diff (`git diff --name-status` at the merge commit), the CI security job log where one exists, and `security/exceptions.yaml` and `deploy/images.yaml` at the merge commit.
- Index rows for the 20 in `docs/changelogs/README.md` and `docs/security-reports/README.md`.
- This change's own records.

## Changed

- The 20 records are indexed together with the 17 earlier ones.

## Fixed

- The gap in the audit trail: pull requests #1 to #142 had no changelog or security report.

## Removed or deprecated

- None

## Security

Documentation only. The reports it adds record a retroactive gitleaks scan of eight pre-CI squash commits (no leaks) and say plainly where no scan result exists. Verdict: pass with warnings (the usual frontend warnings, unchanged). Details, scan numbers and the scan source are in the [security report](../security-reports/change-epic-02-issue-172-records-backfill.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | No change |
| Release | No change |
| Deployment | No change |

README section(s) concerned: Not applicable (docs only).

## After you pull

Nothing to do.

## Tests

Not applicable: documents only. `deploy/check-records.sh origin/main` passes on this branch. The records were checked for local paths, personal details and unfilled placeholders before commit.

All CI jobs must pass before merge; the merge is gated on them.

## Deferred and known issues

None. Pull requests merged after #171 carry their own records in the same pull request (CONTRIBUTING).
