# Changelog: Pull request #141, Epic 2 acceptance, retrospective, release note and Story 2.2 spec reconciliation

| | |
|---|---|
| Pull request | #141, issue #3 (Epic 2); #124 closed, #129 narrowed, #116 and #125 closed |
| Kind | Docs and spec; not a story |
| Origin | Closing Epic 2 |
| Branch | docs/epic-02-acceptance-and-story-2-2-spec |
| Commits | df98088 (squashed on merge) |
| Date | 2026-11-07 |
| Size | 19 files, +479 −29 |
| Security report | [pr-141-epic-2-acceptance-retro-release-note.md](../security-reports/pr-141-epic-2-acceptance-retro-release-note.md) |

## Summary

Marks stories 2.5, 2.7, 2.8 and 2.9 done (the maintainer accepted the app), updates the changelogs' commit rows and the security reports' sign-offs, and reconciles Story 2.2 and UX-DR13 with DESIGN.md as the maintainer confirmed (white tiles at 76 px and 56 px, a Domain-tinted square at 36 px). Adds the Epic 2 retrospective (accepted with open items) and the Epic 2 release note.

## Added

- Added 2 file(s): `.specs/implementation-artifacts/epic-2-retro-2026-11-07.md`, `docs/release-notes/epic-02-app-shell.md`

## Changed

- Changed 17 file(s): `.specs/implementation-artifacts/deferred-work.md`, `.specs/implementation-artifacts/spec-2-2-domain-tints-and-icons.md`, `.specs/implementation-artifacts/spec-2-5-surfaces-feedback-and-labels.md`, `...s/implementation-artifacts/spec-2-7-responsive-reflow-and-accessibility-test-harness.md`, `.specs/implementation-artifacts/spec-2-8-pwa-shell-and-install-offer.md`, `.specs/implementation-artifacts/spec-2-9-settings-shell-and-theme-choice.md`, `.specs/implementation-artifacts/sprint-status.yaml`, `.specs/planning-artifacts/epics/epic-02-app-shell.md`, `.specs/planning-artifacts/epics/requirements.md`, `docs/changelogs/story-2-5-surfaces-feedback-and-labels.md`, `docs/changelogs/story-2-7-responsive-reflow-and-accessibility-test-harness.md`, `docs/changelogs/story-2-8-pwa-shell-and-install-offer.md` and 5 more

## Fixed

- None

## Removed or deprecated

- None

## Security

Documents only; the release note records the Epic 2 security posture. Verdict: pass with warnings. Details, scan numbers and the scan source are in the [security report](../security-reports/pr-141-epic-2-acceptance-retro-release-note.md).

## Operations impact

| Area | What changes |
|---|---|
| Setup | No change |
| Development | No change |
| Release | No change |
| Deployment | No change |

README section(s) concerned: Not applicable (documents only).

README.md was not changed in this pull request.

## After you pull

Nothing to do.

## Tests

From the pull request description: `deploy/release-notes.sh check` OK on the Epic 2 release note.

The CI run on the pull request concluded successfully.

## Deferred and known issues

None.
