---
title: 'Story 2.9: Settings shell and theme choice'
type: 'feature'
created: '2026-11-07'
status: 'done'
baseline_commit: 'b3ac470038ccf2cbc057c1fc169c5190fdc6f2f5'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-02-app-shell.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/DESIGN.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** There is no Settings screen, so the Caregiver cannot choose Light, Dark or System, and the install offer has no way back after "Not now".

**Approach:** A Settings screen at `/family/settings`, a section of Family (Back returns to Family), with a theme choice on `ChoiceChips` (default System, applied at once, stored on the device, announced through the shell status region) and an "Add to home screen" row that calls `offerInstall({ from: 'settings' })`. Source: GitHub issue #104, Story 2.9 (UX-DR2, UX-DR129).

## Boundaries & Constraints

**Always:** all copy from the catalog; the title and focus rules of Story 2.3 (h1 focus, `<Screen>: <subject> · LittleSteps`); the stored choice uses the existing `setThemeChoice` and storage key from Story 2.1; the announcement goes through `useStatus().announce`.

**Never:** no Reminders or Privacy (Epics 16 and 17), no new dependency, no new storage key, no change to the theme storage format.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open Settings | Family, "Settings" link | h1 "Settings" focused, title set, Family nav current | n/a |
| Back | "Back to Family" or browser Back | Family, focus restored | n/a |
| Default | nothing stored | System selected, no `data-theme` | n/a |
| Choose Dark | radio | `data-theme="dark"` at once, stored, "Theme set to Dark." announced | blocked storage: applied for this visit |
| Reload | stored Dark | Dark selected, applied before first paint | corrupt value: System |
| Install row | button | offer opens, also after "Not now" | n/a |

</frozen-after-approval>

## Code Map

- `frontend/src/shell/SettingsScreen.tsx` (+css, test) -- `FamilyScreen` and `SettingsScreen`.
- `frontend/src/shell/routes.tsx` -- `family` now has children: index and `settings`.
- `frontend/src/i18n/messages.ts` -- `settings.` and `screen.settings.` keys.
- `frontend/e2e/tests/settings.spec.ts` -- Playwright: open and Back, theme at once and after reload, install row, axe in light and dark.

## Tasks & Acceptance

**Execution:**
- [x] Settings route and screen -- UX-DR2
- [x] Theme chips, store, announce
- [x] Install row
- [x] Tests, docs, changelog, security report

**Acceptance Criteria:** the Story 2.9 acceptance criteria in the epic file, unchanged.

## Spec Change Log

## Review Triage Log

Reviewers: BH blind, EC edge, VG verification gap (three separate subagents).

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | The chip read storage on every mount, so with blocked storage it showed System while the page was Dark [BH, EC] | medium | patch, fixed | `appliedThemeChoice()` reads the page; test "with blocked storage the chip still shows the theme the page is in" |
| 2 | The browser bar colour (theme-color metas) followed the device, not the in-app choice [BH, EC] | medium | patch, fixed | `applyTheme` syncs the metas, `main.tsx` applies at start; tests in `theme.test.ts` |
| 3 | The "applied before the app starts" e2e only searched the HTML for a string [BH, EC, VG] | medium | patch, fixed | e2e blocks every app script and checks `data-theme` is already set |
| 4 | The install row did nothing, silently, when the app is already installed [EC, VG] | medium | patch, fixed | row announces "LittleSteps is already on your home screen."; test |
| 5 | Choosing the already selected chip announced and wrote storage again [VG, BH] | low | patch, fixed | early return; test |
| 6 | Weak tests: Back-link focus title, reload test, Reminders and Privacy regex, mock restore, axe with an explicit override and with the dialog open, System test without proof of Dark first [BH, VG] | low | patch, fixed | `SettingsScreen.test.tsx`, `settings.spec.ts` |
| 7 | A theme chosen in another tab is not followed [EC] | low | defer #132 | needs an app-level `storage` listener |
| 8 | Arrow keys on the radios apply and announce each step [EC, BH] | low | rejected | native radio behaviour: each step is a real choice, and Settings is not a place people hold arrows in |
| 9 | "Back to Family" is a push, so history becomes Family, Settings, Family [BH] | low | rejected | the spec says Back returns to Family; `navigate(-1)` would leave the app after a deep link |
| 10 | Storage failure still announces "Theme set to Dark." [BH] | low | rejected | the choice is applied for this visit, which the announcement states truthfully |

## Design Notes

- No spec change is needed. Family is now a real route with an index screen (a link to Settings) because Settings is "a section of Family" in the UX Information Architecture.

## Verification

**Commands:**
- `cd frontend && npm run lint && npm run typecheck && npm test` -- expected: green
- `cd frontend && npm run test:e2e` -- expected: green, including `settings.spec.ts`
- `deploy/security-scan.sh` -- expected: no KEV, no CVSS 7+ (twice per story)
