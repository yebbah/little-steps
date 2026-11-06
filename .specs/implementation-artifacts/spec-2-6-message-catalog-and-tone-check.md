---
title: 'Story 2.6: Message catalog and tone check'
type: 'feature'
created: '2026-11-06'
status: 'in-review'
baseline_commit: '9cf9f738f8d604b54154e07961d3165c41983010'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-02-app-shell.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** Components need one place to read every sentence from (AD-18, UX-DR137), and nothing stops judging or alarming wording from entering it (UX-DR135, UX-DR136). Banned UI patterns are not written down anywhere reviewers can check (UX-DR115). Source: GitHub issue #40 and Story 2.6 in `epic-02-app-shell.md`.

**Approach:** Extend the existing catalog `frontend/src/i18n/messages.ts` with the two standard labels and a lookup whose unknown key is visible. Add a tone check (banned-phrase list plus a Vitest suite over every catalog string) that runs in the existing Frontend CI job. Add `docs/ui-review-checklist.md` and reference it from the release note template.

## Boundaries & Constraints

**Always:** Whole-word, case-insensitive matching, so "dismissed" never trips "Missed". Catalog keys are stable `group.name` strings. The two labels are exactly "AI-suggested · check with your therapist if unsure." and "Proposed by you · not yet discussed with the care team.". No personal or family framing in strings or docs.

**Never:** No new dependency. No catalog strings beyond the two labels (Stories 2.10 and 2.11 add the rest). No change to the lint rule or to CI workflow files.

</frozen-after-approval>

## Code Map

- `frontend/src/i18n/messages.ts` -- catalog and `t()`; reuse, add labels.
- `frontend/src/i18n/tone.ts` -- new: `BANNED_PHRASES`, `findBannedPhrases()`.
- `frontend/src/i18n/messages.test.ts` -- new: lookup, unknown key, labels, key shape, tone over the catalog, checker positive and negative cases.
- `docs/ui-review-checklist.md` -- new; `docs/release-notes/TEMPLATE.md` and `README.md` reference it.

## Tasks & Acceptance

- [x] Catalog labels and visible unknown key
- [x] Tone checker and suite (runs in `npm test`, hence in CI)
- [x] UI review checklist and release note reference
- [x] README, changelog, security report, review pass

**Acceptance Criteria:** as Story 2.6 in the epic file.

## Implementation Notes

Kept the existing `t()` that returns the key for an unknown key. Strings: only the two labels; Stories 2.10 and 2.11 add the rest. Score check also matches "x out of 10".

## Spec Change Log

## Review Triage Log

Layers run: blind (BH), edge-case (EC), verification-gap (VG), as three separate reviewers.

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Score pattern flags "2026/10" and "1/10 of a dose" style text (BH, EC) | medium | patch, fixed | numerator limited to 1-2 digits; test "accepts Updated 2026/10" |
| 2 | "8 out of 10" passes the score check (BH, EC) | medium | patch, fixed | new pattern; test "flags x out of 10" |
| 3 | `t('')` returns blank (EC) | low | patch, fixed | returns "[empty message key]"; test in messages.test.ts |
| 4 | NFKC folding (non-breaking space) untested (BH) | low | patch, fixed | test "Great\u00a0job" flagged |
| 5 | Hyphen-joined words ("Missed-call") flagged, hyphen variants of phrases pass (EC) | low | rejected | whole-word match by design; fixing adds complexity for copy no one writes |
| 6 | Tone check covers catalog values only; attribute strings, key usage, near-variants ("You missed", "Well done") unchecked (BH, EC) | medium | defer #110 | jsx-no-literals has ignoreProps; widening is a later-story design choice |
| 7 | Banned phrases listed in tone.ts and in the checklist (BH) | low | rejected | the checklist is the human-facing statement of the AC wording; tone.ts is the executable list; the test pins tone.ts to the spec |
| 8 | Checklist not wired into CONTRIBUTING or enforced per story; template line unchecked by release-notes.sh (BH, EC) | low | rejected | AC requires only the file and the release-note reference (UX-DR115); enforcement is not in Story 2.6 |
| 9 | Spec status/triage empty, ACs only referenced (BH) | low | patch, fixed | this table; ACs live in the epic file by design (no duplication) |
| 10 | `Object.hasOwn` target support (BH, VG) | false | rejected | tsconfig lib ES2023; Vite 8 targets modern browsers; typecheck and build pass |
| 11 | VG: no gaps found | n/a | rejected | reviewer traced tests to every AC and the CI path (`npm run test:coverage` in ci.yml) |

## Verification

- `cd frontend && npm test && npm run lint && npm run typecheck && npm run build`
