---
title: 'Story 2.11: Catalog copy for errors, confirmations and security notices'
type: 'feature'
created: '2026-11-06'
status: 'done'
baseline_commit: '3ee97a47ed31b2ba181bc45bcdec6982059afc2e'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-02-app-shell.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The catalog holds no error, destructive-confirmation, consent, invite or security-notice strings, and nothing detects a spine string that is missing or reworded (UX-DR137). Source: GitHub issue #106 and Story 2.11 in `epic-02-app-shell.md`. Checkpoint 1 (spec approval) was delegated to the agent by the maintainer (autopilot run, 2026-11-06); no spec drift, the epic text is unchanged.

**Approach:** Add every string EXPERIENCE.md names exactly for an error, a destructive or share confirmation, a consent or permission notice, an invite or a security notice (State Patterns, Component Patterns, Notifications, Voice and Tone samples of that kind) to `frontend/src/i18n/messages.ts` under `error.*`, `invite.*`, `consent.*`, `confirm.*` and `security.*`. Add `error-copy.test.ts` with its own expected-text table per group; Story 2.10's `spine-copy.test.ts` is not edited.

## Boundaries & Constraints

**Always:** Wording is exactly the spine's, verbatim, including punctuation, the em dash and the arrow. Variable parts are camelCase tokens (`{caregiver}`, `{date}`, `{count}`). Keys are stable `group.name`. Every string passes the tone check. No personal or family framing.

**Never:** No status lines, banners, empty or in-progress states (Story 2.10). No components or screens, no new dependency, no change to the lint rule, CI files, `tone.ts`, `tf()` or 2.10's test. No strings the spine does not name: "Session expired" and "Suggestion blocked" name no text (the first is a behaviour, the second is silent by design), and "Sign out" is a label the spine does not quote, so none is added.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Known key | `tf('security.caregiverJoined', { caregiver: 'Sam', date: '5 Nov' })` | "Sam joined your family (5 Nov)." | N/A |
| Missing value | `tf('security.caregiverLeft', { caregiver: 'Sam' })` | `{date}` stays visible | never blank, never throws |
| Spine string reworded or removed | catalog differs from the table | `error-copy.test.ts` fails naming the key | N/A |
| Catalog key not in the table | new `error.*` / `invite.*` / `consent.*` / `confirm.*` / `security.*` key | per-group key listing fails | N/A |
| 2.10 groups absent | `status.*` etc. removed | this story's test still passes (2.10's fails) | N/A |

</frozen-after-approval>

## Code Map

- `frontend/src/i18n/messages.ts` -- add the five groups.
- `frontend/src/i18n/error-copy.test.ts` -- new: table per group, key listing, drift detection, `tf()` cases.
- `.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/EXPERIENCE.md` -- source (Voice and Tone table, Component Patterns, State Patterns, Notifications). Read only.
- `docs/changelogs/`, `docs/security-reports/`, `README.md` -- finishing artifacts per CONTRIBUTING.

## Tasks & Acceptance

**Execution:**
- [x] `frontend/src/i18n/messages.ts` -- `error.*` (save rejected, Retry, offline kept, camera denied, cannot read page, Please check this and "(N left)", removed from family), `invite.*` (Send invite, Invite sent {date}, Resend, Cancel, expired), `consent.*` (not given, push declined), `confirm.*` (Type DELETE, the four destructive variants, share-leaving, Share, Not now), `security.*` (the four Notifications rows).
- [x] `frontend/src/i18n/error-copy.test.ts` -- as in the Code Map.
- [x] Finish per CONTRIBUTING: review pass (three reviewers), changelog, security report, README review, scans.

**Acceptance Criteria:**
- Given the spine strings above, when the test runs, then each key exists with the exact spine text.
- Given a catalog string is removed or reworded, when the test runs, then it fails naming the key.
- Given any added string, when the tone check runs, then it passes.
- Given a Story 2.10 group is changed, when this story's test runs, then it is unaffected.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Error-copy test not prettier-formatted [BH] | low | rejected | The repo does not enforce prettier (5 existing files, including 2.10's, also differ); CI runs oxlint and stylelint, which pass. |
| 2 | Drift tests re-implemented the comparison on a mutated copy and would pass without the real table tests; no extra-key case [BH, VG] | medium | patch, fixed | `error-copy.test.ts` now shares a `driftIn()` helper like 2.10: real catalog drift-free, reworded, removed and extra key each named. |
| 3 | Table is a hand copy, so a string missing from both catalog and table passes; nothing reads EXPERIENCE.md [BH, VG] | medium | rejected | Same design as 2.10 and accepted in its spec; a string named in the spine but absent from the table was found by manual comparison of all 27 (no gap). Automatic spine-to-catalog coverage is already tracked in #110. |
| 4 | "Never blames" regex nearly vacuous and limited to error and consent [BH, VG] | low | patch, fixed | Regex widened (didn't, should have, must, your fault, invalid) and applied to all five groups. |
| 5 | `tf()` filled for only some placeholder strings; `confirm.deleteFamily` not exercised [VG] | low | patch, fixed | New test fills every key of the five groups and asserts no `{token}` remains; exact cases added for `confirm.deleteFamily`. |
| 6 | Placeholder-shape check not repeated for 2.11 [VG] | false | rejected | `spine-copy.test.ts` "spells every placeholder as a plain word" iterates the whole catalog, including these keys. |
| 7 | Redundant cast and unused `_removed` in test [BH] | low | patch, fixed | Cast removed; lint passes (underscore names are allowed). |
| 8 | Odd copy: no trailing period on `error.cannotReadPage`, "audit log" has no UI yet, English `DELETE` token not catalogued, passive `deleteOriginal` [BH, EC] | low | rejected | All verbatim from the spine (verified line by line); wording is frozen and the typed token is matched in code by the screen story. |
| 9 | No generic Cancel key; `invite.cancel` could be reused for confirms [EC, VG] | low | rejected | The spine names "Cancel" only for invites; a shared label is a decision for the first confirm screen. |
| 10 | Placeholder values not checked against tone, `undefined` renders as text, no plural handling [EC] | low | rejected | Same as 2.10 triage rows 1, 3 and 5. |
| 11 | Reminder copy ("A few minutes of play today?...") and "This goal hasn't been discussed..." belong to no copy story [VG] | low | defer #119 | Issue #119, target 2027-02-04. |
| 12 | Verbatim check of 27 strings against EXPERIENCE.md, key collisions, `Object.hasOwn` handling [EC] | n/a | rejected | No defects: every string matches, no duplicate keys. |

## Design Notes

Split with 2.10: that story did neutral system speech; this one covers failure, consent, destruction and security. Table-per-group means each story's test is independent. The spine sentence "This goal hasn't been discussed with your care team yet." (Get new ideas, P2) fits neither story; it is tracked as a deferred issue for the P2 story that renders it.

## Verification

**Commands:**
- `cd frontend && npm test && npm run lint && npm run typecheck && npm run build` -- expected: all pass
- `deploy/security-scan.sh` -- expected: exit 0 (twice per story)
