# Changelog: Pull request #157, Spec the nightly browser run, coverage floor and release-note bookkeeping check; drop R7

| | |
|---|---|
| Pull request | #157, issue #134, #101, #151 |
| Kind | Spec; not a story |
| Origin | Epic 2 retrospective decisions confirmed by the maintainer on 2026-11-08 |
| Branch | feature/epic-02-issue-134-spec-t1-101-r7 |
| Commits | 066c88e (squashed on merge) |
| Date | 2026-11-08 |
| Size | 6 files, +21 −15 |
| Security report | [pr-157-spec-nightly-coverage-floor-release-note-check.md](../security-reports/pr-157-spec-nightly-coverage-floor-release-note-check.md) |

## Summary

Specifies three changes before code: a nightly Chromium, WebKit and Firefox run, an 80% frontend coverage floor, and a release-note check for story status and the Commit hash. R7 (a Linux accessibility script) is dropped.

## Added

- AD-27: `release-notes.sh check` reads the epic's story specs and, with `--strict`, the Commit hash.
- AD-28: nightly run on the built bundle; Vitest coverage floor of 80%.
- Story 1.9 acceptance line; Epic 2 "Done when" line; test design decisions.

## Changed

- Sprint status marks T1 and R1 done and R7 dropped; the retro records the decisions.

## Fixed

- None

## Removed or deprecated

- R7 (#151): a Playwright container is a new image under AD-26 and CI already runs the accessibility job on Linux.

## Security

Specifications only. Verdict: pass with warnings (unchanged). Details, scan numbers and the CI run are in the [security report](../security-reports/pr-157-spec-nightly-coverage-floor-release-note-check.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | No change |
| Release | No change |
| Deployment | No change |

README section(s) concerned: Not applicable (specs only).

README.md was not changed in this pull request.

## After you pull

Nothing to do.

## Tests

Not applicable: specs only.

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

Code follows in #158, #101 and #134.
