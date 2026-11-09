# Changelog: Demo Family first, setup features later (sprint change and Epic 25)

| | |
|---|---|
| Issue | #178 (Epic 25), #179 to #183 (its stories) |
| Kind | Spec and planning change; not a story |
| Origin | Maintainer decision, 2026-11-09: test the core loop on mock data before sign-in and setup exist |
| Branch | docs/epic-25-stories |
| Pull request | the one opened from this branch; it also carries the records that the earlier spec pull request (#176) did not |
| Date | 2026-11-09 |
| Security report | [change-epic-25-stories.md](../security-reports/change-epic-25-stories.md) |

## Summary

Adds Epic 25 (demo Family and domain foundations) with five fully specified stories, approves it, and records its GitHub issues and sprint status. Together with the sprint change proposal merged in #176, this reorders the remaining work so the core loop is built and tried on seeded data first, and real sign-in and the setup screens plug in later.

## Added

- Stories 25.1 to 25.5 in `epic-25-demo-family-foundations.md`, with acceptance criteria.
- Epic 25 in `sprint-status.yaml`, ahead of Epic 3 in build order.
- Issues #178 (epic) and #179 to #183 (stories), created on GitHub.

## Changed

- Epic 25 is `approved` in the epic index, with its issue numbers.
- Story 3.1 now uses the `caregivers` table created in Story 25.1.
- Story 3.2 is renamed "Signing in again in place" in the specs, the issue (#45) and sprint status, and Story 3.6 (#49) builds on the Story 25.1 tables. Issues #4 to #7, #13 and #14 describe the new split and order.
- CONTRIBUTING, "Issues": names Epic 25 (#178) as an exception to "Epic N is issue #N+1".

## Fixed

- The Story 3.1 and Story 25.1 table ownership conflict found while writing the stories.

## Removed or deprecated

- None.

## Security

Documentation only. The scan on the branch passed. The demo identity the stories specify is local and test only, and the stories require startup to fail if it is on in `prod`. See the [security report](../security-reports/change-epic-25-stories.md).

## Operations impact

| Area | What changes (README is reviewed every story; write "reviewed, no change" if untouched) | README section |
|---|---|---|
| Setup | No change | n/a |
| Development | No change yet. Story 25.5 adds the demo flag, `dev-seed.sh` and the README text | n/a |
| Release | No change | n/a |
| Deployment | No change | n/a |

## After you pull

Nothing to do.

## Tests

Not applicable (specs and records only). CI records check, link and manifest checks run on the pull request.

## Deferred and known issues

- A build-order comment on every epic issue was not added: the Build order column in the epic index is the single source, and the issues linked to Epic 3 to 6, 12 and 13 point to it.
- The roughly 45 `deferred` issues are untouched; a triage pass is still to do.
