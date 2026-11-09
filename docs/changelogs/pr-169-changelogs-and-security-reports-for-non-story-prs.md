# Changelog: Pull request #169, Changelogs and security reports for the non-story pull requests

| | |
|---|---|
| Pull request | #169, issue #167 |
| Kind | Docs and policy; not a story |
| Origin | Maintainer request, 2026-11-09: a changelog and a security report for non-story PRs too |
| Branch | feature/epic-02-issue-167-pr-records |
| Commits | 6a59455 (squashed on merge) |
| Date | 2026-11-09 |
| Size | 33 files, +2271 −0 |
| Security report | [pr-169-changelogs-and-security-reports-for-non-story-prs.md](../security-reports/pr-169-changelogs-and-security-reports-for-non-story-prs.md) |

## Summary

Adds a changelog and a security report for each of the 15 non-story pull requests from #147 to #168, an index for each folder, and a CONTRIBUTING rule that non-story PRs carry both records. The records were named by PR number and added after the merge, which later proved to leave gaps (#172).

## Added

- 15 changelogs (`docs/changelogs/pr-<number>-<slug>.md`) and 15 security reports (`docs/security-reports/pr-<number>-<slug>.md`), with facts taken from GitHub, the CI security job logs and the repository at each merge commit.
- `docs/security-reports/README.md` (an index), and a "Non-story pull requests" table in `docs/changelogs/README.md`.
- A CONTRIBUTING section "Non-story pull requests".

## Changed

- None

## Fixed

- None

## Removed or deprecated

- None

## Security

Documentation only. Verdict: pass with warnings (unchanged). Details, scan numbers and the scan source are in the [security report](../security-reports/pr-169-changelogs-and-security-reports-for-non-story-prs.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | No change |
| Release | No change |
| Deployment | No change |

README section(s) concerned: Not applicable (docs only).

README.md was not changed in this pull request.

## After you pull

Nothing to do.

## Tests

Not applicable: documents only. The files were checked for local paths, personal details and unfilled placeholders before commit.

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

Records named by PR number can only be written after the PR exists, and the exemption added in #171 left PRs without records: replaced by #172.
