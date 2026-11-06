# Changelog: Story 1.9, Release notes for each epic

| | |
|---|---|
| Story | 1.9, issue #34 |
| Epic | 1, Local environment and project skeleton |
| Branch | feature/epic-01-issue-34-release-notes |
| Commits | see the Story 1.9 commit on the branch (baseline f66e007) |
| Date | 2026-11-06 |
| Security report | [story-1-9-release-notes-for-each-epic.md](../security-reports/story-1-9-release-notes-for-each-epic.md) |

## Summary

Closing an epic now produces a release note from the repository's real facts instead of memory. `deploy/release-notes.sh <epic>` fills the template, and a check refuses a note that still has TODOs or reports KEV or High/Critical findings.

## Added

- `docs/release-notes/TEMPLATE.md` with Summary, New features, Changes, Integration notes, Security, Code quality, Test results and Known issues.
- `deploy/release-notes.sh <epic>`: creates `docs/release-notes/epic-NN-<slug>.md`, pre-filled with commits since the previous epic tag, new Flyway migrations, new `local.env.example` keys, services and ports, scan date and tool versions, severity totals, exceptions with expiry, a warning per non-DHI image, SBOM location, coverage and test counts. Narrative parts are `TODO(author)`; a missing input is a `TODO(author)`, never a zero.
- `release-notes.sh check [--strict] <note>` (fails on KEV or High/Critical not 0, scan not PASS, failed tests, missing sections, and on TODO(author) once `Status: done`), `tag <epic>` (strict check, then local tag `epic-NN`) and `shell-tests` (records the `deploy/tests` counts).
- `deploy/tests/release-notes.test.sh` (79 checks, throwaway git repo, no network).
- `docs/release-notes/epic-01-local-environment.md`: generated draft for Epic 1.

## Changed

- `docs/CONTRIBUTING.md` "Finishing an epic" now lists the steps; `docs/release-notes/README.md` documents inputs and the check.
- Vitest also writes `frontend/test-results/junit.xml` (git-ignored, uploaded with the `frontend-reports` CI artifact), the input the release note reads for frontend test counts. Story 1.8 did not produce it.

## Fixed

- None.

## Removed or deprecated

- None.

## Security

No dependency, image or action changed. The full scan passes with no KEV, High or Critical finding outside exceptions. See the [security report](../security-reports/story-1-9-release-notes-for-each-epic.md).

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | No change | Setup (reviewed, no change) |
| Development | New command `deploy/release-notes.sh` and its test suite | Layout, deploy/README |
| Release | Per-epic release note is now in use: generate, finish, check, tag | Release |
| Deployment | No change | Deployment (reviewed, no change) |

Prerequisites and Versions reviewed, no change.

## After you pull

Nothing to do. To close an epic, follow [Finishing an epic](../CONTRIBUTING.md#finishing-an-epic).

## Tests

- New positive tests (generation, every pre-filled section, second-epic base tag, finished note passes, tag created) and negative tests (unknown epic, overwrite, missing tag, TODO remaining, KEV or High/Critical not 0, failed scan or tests, missing section or status, tag refused on dirty tree or existing tag): `deploy/tests/release-notes.test.sh`, 79 passed.
- Non-regression: `check-images` 24, `check-urls` 10, `dev-scripts` 70, `realm` 21, `security-scan` 67 (run with the pinned tools from `.tools/`; without them 27 of its checks fail), all with `shellcheck` clean. Backend and frontend suites unchanged by this story.

## Deferred and known issues

- [#85](https://github.com/yebbah/little-steps/issues/85): resolved in this story. Stories 1.6 to 1.8 merged, the Epic 1 note is finished (`Status: done`) and passes `check --strict`. Close the issue when this merges.
- [#86](https://github.com/yebbah/little-steps/issues/86): release-notes.sh hardening and test gaps.
- [#87](https://github.com/yebbah/little-steps/issues/87): count new positive and negative tests automatically.
