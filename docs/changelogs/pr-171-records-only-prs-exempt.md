# Changelog: Pull request #171, Exempt records-only pull requests from the changelog and security report rule

| | |
|---|---|
| Pull request | #171, issue #170 |
| Kind | Docs and policy; not a story |
| Origin | Maintainer decision, 2026-11-09: records-only PRs are excluded, so the rule from #169 does not recurse |
| Branch | feature/epic-02-issue-170-records-only-exemption |
| Commits | 94a896f (squashed on merge) |
| Date | 2026-11-09 |
| Size | 3 files, +4 −2 |
| Security report | [pr-171-records-only-prs-exempt.md](../security-reports/pr-171-records-only-prs-exempt.md) |

## Summary

Adds an exemption to the CONTRIBUTING rule so a pull request that only adds or updates the records, or the rule about them, needs none of its own. It also states that PRs before #147 are not backfilled.

## Added

- An "Exempt" paragraph in the CONTRIBUTING section "Non-story pull requests".

## Changed

- The two index READMEs say records-only PRs are exempt.

## Fixed

- None

## Removed or deprecated

- None

## Security

Documentation only. Verdict: pass with warnings (unchanged). Details, scan numbers and the scan source are in the [security report](../security-reports/pr-171-records-only-prs-exempt.md).

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

Not applicable: documents only.

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

The exemption left #169 and #171 without records and did not stop a PR from skipping its records. Reversed by #172: no exemption, records in the same PR, enforced by CI.
