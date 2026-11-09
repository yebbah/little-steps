# Changelog: Pull request #63, Refresh the README and require a README review in every story

| | |
|---|---|
| Pull request | #63, issue none recorded |
| Kind | Docs (policy); not a story |
| Origin | Stale README content found while reviewing; a new policy |
| Branch | docs/readme-every-story |
| Commits | b68f45d (squashed on merge) |
| Date | 2026-11-06 |
| Size | 4 files, +26 −13 |
| Security report | [pr-63-readme-every-story.md](../security-reports/pr-63-readme-every-story.md) |

## Summary

Refreshes stale README content (Docker and DHI prerequisites, local stack, test commands, branching levels, finishing-a-story steps, layout) and adds the policy that the README is reviewed in every story and recorded in the changelog's Operations impact table.

## Added

- None

## Changed

- Changed 4 file(s): `AGENTS.md`, `README.md`, `docs/CONTRIBUTING.md`, `docs/changelogs/TEMPLATE.md`

## Fixed

- None

## Removed or deprecated

- None

## Security

The diff changes four documents: AGENTS.md, the README, docs/CONTRIBUTING.md and the changelog template. No scan result was recorded for this pull request (it predates CI); see the security report. Details, scan numbers and the scan source are in the [security report](../security-reports/pr-63-readme-every-story.md).

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

Not applicable: documents only. The pull request description lists the pre-commit security scan as passing with warnings only; its output was not kept.

No CI run existed for this pull request (CI arrived with #96).

## Deferred and known issues

None.
