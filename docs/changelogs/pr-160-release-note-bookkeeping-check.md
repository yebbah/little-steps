# Changelog: Pull request #160, Release-notes check fails a stale story status and a Commit hash not on main

| | |
|---|---|
| Pull request | #160, issue #101 |
| Kind | Feature (tooling); not a story |
| Origin | Epic 1 retrospective findings F1, F3 and F6 |
| Branch | feature/epic-01-issue-101-release-note-bookkeeping-check |
| Commits | 7412712 (squashed on merge) |
| Date | 2026-11-08 |
| Size | 5 files, +67 −7 |
| Security report | [pr-160-release-note-bookkeeping-check.md](../security-reports/pr-160-release-note-bookkeeping-check.md) |

## Summary

`deploy/release-notes.sh check` now fails a done note when a story spec of the epic is not done. With `--strict`, which `tag` runs after the last merge, it also fails when the note's Commit hash is not on `main`.

## Added

- Story-status check and Commit-on-main check in `deploy/release-notes.sh`, with test hooks `LS_SPECS_DIR` and `LS_MAIN_REF`.
- New checks in `deploy/tests/release-notes.test.sh` for each case.

## Changed

- The epic is read from the note's title line, with the file name as fallback.
- CONTRIBUTING, `docs/release-notes/README.md` and `docs/workflow.md` describe the checks.

## Fixed

- Stories left `in-review` after merge and a release note naming a pre-squash hash went unnoticed.

## Removed or deprecated

- None

## Security

Local tooling only; no dependency or image changed. Verdict: pass with warnings (unchanged). Details, scan numbers and the scan source are in the [security report](../security-reports/pr-160-release-note-bookkeeping-check.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | Closing an epic: the story specs must be `done`; `tag` also needs the Commit hash on `main`. |
| Release | Release steps in CONTRIBUTING updated |
| Deployment | No change |

README section(s) concerned: Release (docs/release-notes/README.md).

README.md was not changed in this pull request.

## After you pull

Nothing to do. The real Epic 1 and Epic 2 notes pass `check --strict`.

## Tests

`deploy/tests/release-notes.test.sh`: 91 passed, 0 failed (stale status, draft skips, no specs, no epic named, no Commit row, nonexistent hash, pre-squash hash on another branch, and the passing cases).

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

None.
