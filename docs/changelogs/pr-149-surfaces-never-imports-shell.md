# Changelog: Pull request #149, Surfaces never imports shell, enforced by lint

| | |
|---|---|
| Pull request | #149, issue #143 |
| Kind | Feature (frontend structure); not a story |
| Origin | Epic 2 retrospective action R5; AD-28 |
| Branch | feature/epic-02-issue-143-surfaces-shell-boundary |
| Commits | 36c4073 (squashed on merge) |
| Date | 2026-11-08 |
| Size | 9 files, +45 −11 |
| Security report | [pr-149-surfaces-never-imports-shell.md](../security-reports/pr-149-surfaces-never-imports-shell.md) |

## Summary

Moves the shared status context to a neutral module and adds a lint rule that fails the build when anything under `src/surfaces` imports from `src/shell`.

## Added

- `frontend/src/status/statusContext.ts` (moved from `src/shell/`).
- An oxlint `no-restricted-imports` override for `src/surfaces/**` matching `shell`.
- `expect_boundary` cases in `frontend/scripts/lint-rules.test.sh`.
- `src/status/` documented in `frontend/README.md`.

## Changed

- Imports updated in `StatusProvider.tsx`, `SettingsScreen.tsx`, `AppShell.test.tsx` and `surfaces/StatusLineProvider.tsx`.
- `StatusLine.test.tsx` moved from `src/surfaces/` to `src/shell/`.

## Fixed

- None

## Removed or deprecated

- None

## Security

No dependency or runtime behaviour changed. Verdict: pass with warnings (unchanged). Details, scan numbers and the scan source are in the [security report](../security-reports/pr-149-surfaces-never-imports-shell.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | A new lint rule: importing `shell` from `surfaces` fails `npm run lint`. |
| Release | No change |
| Deployment | No change |

README section(s) concerned: frontend/README.md (layout).

README.md was not changed in this pull request.

## After you pull

Nothing to do.

## Tests

`frontend/scripts/lint-rules.test.sh` gained positive and negative boundary cases (run by `npm run lint:test`); Vitest passed after the move.

All five CI jobs passed on the pull request (backend, frontend, accessibility, scripts, security).

## Deferred and known issues

None.
