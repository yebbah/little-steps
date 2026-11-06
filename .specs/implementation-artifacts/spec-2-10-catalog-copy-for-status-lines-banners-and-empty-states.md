---
title: 'Story 2.10: Catalog copy for status lines, banners and empty states'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '2e0e2fd3c4ad1e5cceff16790de5d6789bd7ec57'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-02-app-shell.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The message catalog (Story 2.6) holds only the two standard labels. The UX spine names exact strings for status lines, banners and empty states; later stories need them under stable keys and nothing yet detects a spine string that is missing or reworded (UX-DR137). Source: GitHub issue #105 and Story 2.10 in `epic-02-app-shell.md`.

**Approach:** Add every string that EXPERIENCE.md names for a status line, banner, empty state or non-error system state (Component Patterns, State Patterns, Voice and Tone samples of the same kind) to `frontend/src/i18n/messages.ts` under `status.*`, `banner.*`, `empty.*` and `state.*` keys. Add a coverage test with an expected-text table per group, so a missing or changed spine string fails. Add a small `tf()` helper that fills `{name}` placeholders, because several strings carry values.

## Boundaries & Constraints

**Always:** Wording is exactly the spine's, verbatim, including punctuation and the em dash. Variable parts become `{activity}`, `{caregiver}`, `{date}`, `{mark}`, `{count}`, `{line}`, `{first words}` style tokens (camelCase). Keys are stable `group.name`. Every string passes the tone check. No personal or family framing.

**Never:** No errors, destructive or plain confirmations, consent or security notices (Story 2.11 owns them: Save rejected, Session expired, Camera denied, Consent not given, Invite invalid, Removed Caregiver, Push declined, Destructive confirm, Confirm-to-share, the four Notifications rows, field validation messages). No components or screens, no new dependency, no change to the lint rule, CI files or `tone.ts`. No strings the spine does not name.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Known key | `tf('status.swapped', { activity: 'Bubble play' })` | "Swapped for Bubble play · Undo" | N/A |
| Missing value | `tf('status.swapped', {})` | placeholder stays visible: "Swapped for {activity} · Undo" | never blank, never throws |
| Unknown key | `tf('no.such', {...})` | the key itself, as `t()` | N/A |
| Spine string reworded or removed | catalog differs from the expected table | coverage test fails naming the key | N/A |
| Catalog key not in the table | new key added without an expected entry | coverage test fails, so the table stays complete for these groups | N/A |

</frozen-after-approval>

## Code Map

- `frontend/src/i18n/messages.ts` -- catalog and `t()`; add entries and `tf()`. Keep the `as const satisfies` shape.
- `frontend/src/i18n/messages.test.ts` -- existing lookup, key-shape and tone suites run over all strings automatically; leave them.
- `frontend/src/i18n/spine-copy.test.ts` -- new: expected key-to-text table by group, "lists keys by group" check, `tf()` cases.
- `.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/EXPERIENCE.md` -- source of the strings (lines 78-90, 101-116, 160, 183-189, 192 excluded, 204-236). Read only.
- `docs/changelogs/`, `docs/security-reports/`, `README.md` -- finishing-a-story artifacts per CONTRIBUTING.

## Tasks & Acceptance

**Execution:**
- [x] `frontend/src/i18n/messages.ts` -- add `status.*` (Review saved.; Swapped for {activity} · Undo; That's okay — logged as not today · Undo; New period started.; Feedback saved. New Restrictions apply from the next Plan.; Mark saved: {mark} · Undo; Already marked; 1 more idea added; {count} items covered; Uncovered: {line} · Undo; Reviewed by {caregiver}), `banner.*` (Saved on this device — will sync.; Family data will be deleted on {date}.; Undo action label; Dismiss notice: {firstWords}; Notices region label; Earlier practice is still open. with Review it and Close without review), `empty.*` (Let's add your first goal.; No goals yet. Add one from your therapist's sheet, or propose your own.; No favourites yet — tap the heart on any activity.; Everything here is hidden. Show hidden.; No new ideas right now. Try a favourite?; Before an appointment, make a summary for your therapist.; Nothing recorded in this period yet.; Pick a few activities for this week?; That's this week's plan. Anything extra is a bonus.), `state.*` (Drafting your summary…; Reading the page…; Needs a connection; Ideas are taking a moment; More ideas are on the way; too few to show a trend; limited data; Ready when you are.) and `tf()`.
- [x] `frontend/src/i18n/spine-copy.test.ts` -- expected table per group, exact text, key listing by group, missing-key failure, `tf()` matrix cases.
- [ ] Finish per CONTRIBUTING: review pass (three reviewers), changelog, security report, README review, scans.

**Acceptance Criteria:**
- Given the spine strings above, when the test runs, then each key exists with the exact spine text.
- Given a catalog string is removed or reworded, when the test runs, then it fails naming the key.
- Given any added string, when the tone check runs, then it passes.
- Given a Story 2.11 group key, when it is absent, then this story's test still passes (2.11 adds its own table).

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | `{count} items covered` reads "1 items covered" for a count of 1; no plural mechanism [BH, EC] | low | rejected | The spine wording is verbatim and frozen; the only consumer is the P2 masking review, which does not exist yet, so plural handling belongs to that story. Fix would add branches and keys. |
| 2 | Test table duplicates catalog text, so a copy edit changes two files [BH] | low | rejected | Intended: the table is the guard against silent rewording (UX-DR137). |
| 3 | Placeholder names not checked against callers; `tf()` values not typed per key [BH, EC] | low | rejected | No callers exist yet; per-key typing adds public surface. Placeholders are pinned by the exact-text table. |
| 4 | Placeholder like `{first-words}` would not be filled by `\w+` [BH, EC] | low | patch, fixed | `spine-copy.test.ts` "spells every placeholder as a plain word" checks the whole catalog. |
| 5 | `tf()` with `undefined`, `null` or empty-string value shows "undefined" or a blank [EC] | low | rejected | Values are typed `string \| number`; an empty value is a caller's provided value, the matrix covers a missing one. |
| 6 | "inherited names" test never passes an inherited name, so `in` instead of `Object.hasOwn` would go unnoticed [BH, EC] | low | patch, fixed | `spine-copy.test.ts` now passes `Object.create({ caregiver: 'Sam' })` and expects the placeholder to stay. |
| 7 | No dedicated test that a removed or reworded key fails naming the key [EC, VG-style claim] | medium | patch, fixed | `driftIn()` helper and "spine drift detection" tests: removed, reworded and extra key each named. |
| 8 | Acceptance "tone check passes" is not exercised by this diff [EC] | false | rejected | `messages.test.ts` runs `findBannedPhrases` over every `messages` entry, including the new ones (passes, 111 tests). |
| 9 | No aria-live wiring, British spelling, "Undo" embedded in sentences, README and changelog missing, unused keys [BH] | low | rejected | Out of this story's scope by the spec's Never list (no components); spelling and embedded Undo are the spine's wording; README and changelog are written at finish. |
| 10 | Verification-gap layer | n/a | rejected | No gaps found. |

## Design Notes

Split with 2.11: 2.10 is neutral system speech (confirming, noticing, empty, in-progress). 2.11 is anything about failure, consent, destruction or security. Where a spine row is both (Offline), the text it names for the banner is 2.10. The test table is per group so 2.11 adds `error.*`, `confirm.*`, `security.*` tables without editing these.

## Verification

**Commands:**
- `cd frontend && npm test && npm run lint && npm run typecheck && npm run build` -- expected: all pass
- `deploy/security-scan.sh` -- expected: exit 0 (twice per story, per CONTRIBUTING)
