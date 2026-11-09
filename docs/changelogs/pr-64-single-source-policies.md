# Changelog: Pull request #64, Make CONTRIBUTING.md the single source for policies

| | |
|---|---|
| Pull request | #64, issue none recorded |
| Kind | Docs (policy); not a story |
| Origin | Duplicated rules across several documents |
| Branch | docs/single-source-policies |
| Commits | ea4fc30 (squashed on merge) |
| Date | 2026-11-06 |
| Size | 5 files, +21 −54 |
| Security report | [pr-64-single-source-policies.md](../security-reports/pr-64-single-source-policies.md) |

## Summary

Removes duplicated rules from AGENTS.md, README.md, deploy/README.md and docs/deferred-items.md and links to docs/CONTRIBUTING.md instead. CONTRIBUTING gains a documentation policy, the commit message and public-repository rules, and a rule to cut every new story branch from an up-to-date `main`.

## Added

- None

## Changed

- Changed 5 file(s): `AGENTS.md`, `README.md`, `deploy/README.md`, `docs/CONTRIBUTING.md`, `docs/deferred-items.md`

## Fixed

- None

## Removed or deprecated

- None

## Security

The diff changes five documents; no code, compose or manifest file. No scan result was recorded for this pull request (it predates CI); see the security report. Details, scan numbers and the scan source are in the [security report](../security-reports/pr-64-single-source-policies.md).

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

Not applicable: documents only. The pull request description lists the pre-commit security scan as passing; its output was not kept.

No CI run existed for this pull request (CI arrived with #96).

## Deferred and known issues

None.
