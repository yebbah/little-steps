---
title: 'Story 2.3: App shell, navigation and focus management'
type: 'feature'
created: '2026-11-07'
status: 'done'
baseline_commit: '61fe1eb8729183d8fdde35835316a1401c8b3739'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-02-app-shell.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/DESIGN.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** The app renders one bare `<main>`. There is no navigation, no routing, no landmarks, no single status region and no focus rule, so every later screen would invent its own.

**Approach:** An app shell in `frontend/src/shell/` using React Router: skip link, `<nav>` (bottom nav under 600px, left rail from 600px), `<main>`, and one `role="status"` region fed only by a `useStatus()` hook. Five placeholder screens (Today, Goals, Activities, Share, Family) with catalog copy. Every route change sets `document.title` and focuses the `<h1>`. Source: GitHub issue #37, Story 2.3 (UX-DR27, 112, 114, 116 to 118, 124, 128).

## Boundaries & Constraints

**Always:** values from tokens, never literals. Visible text from the message catalog (new `nav.` and `screen.` keys, tone-checked); the product name stays the constant in the shell. Nav items are links with `aria-current="page"` on the active one; active = indigo (`--color-action`), weight 800, 32×4px bar (`--space-nav-indicator-*`) above the icon on the bottom nav and a vertical leading-edge bar on the rail; the bar plus weight carry the state, not colour alone. Icons are the existing `Icon` for `NAV_ICON_NAMES`. Targets at least 48px. Content max width 720px, centred, margins 16px (under 600), 24px (600 to 1023), 32px (1024 and up). Title format `<Screen>: <subject> · LittleSteps`. Order for a navigating action: route, title, focus `<h1>`, message on the next frame. No orientation lock, no time limits.

**Never:** no real screen content (Today, Goals and the rest are placeholders), no auth or guards, no settings route (2.9), no PWA work (2.8), no Card/Sheet/StatusLine (2.5), no route-owned live regions, no shadows, no new dependency except `react-router` (exact version, no range), no change to the `/dev/gallery` route behaviour.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First load | `/` | redirects (replace) to Today; one empty `role="status"` region exists | none |
| Select destination | click or Enter on "Goals" | URL `/goals`, title "Goals: Your goals · LittleSteps", focus on its `<h1>`, `aria-current` moves | none |
| Back | Back after two navigations | previous screen, scroll restored, focus restored to the previously focused element if it still exists, else the `<h1>` | none |
| Announce on navigation | `useStatus().announce(msg)` called with a route change | region text set on the frame after focus moved to the `<h1>`; cleared on the next announce | empty message ignored |
| Announce without navigation | `announce(msg)` | region text set on the next frame | none |
| Unknown path | `/nope` | a not-found placeholder with an `<h1>`, catalog copy, title and focus rules, a link to Today | none |
| Skip link | first Tab on load | "Skip to content" focused first; activating it moves focus to `<main>` | none |

</frozen-after-approval>

## Code Map

- `frontend/src/App.tsx`, `main.tsx` -- bare `<main><h1>` today; `main.tsx` has the `/dev/gallery` branch (keep) and the StrictMode root. App becomes the router provider. `App.test.tsx`, `App.component.test.tsx` assert the old output: update.
- `frontend/src/icons/` (`Icon.tsx`, `names.ts` `NAV_ICON_NAMES`) -- reuse for nav icons; do not edit.
- `frontend/src/i18n/messages.ts` (`t()`, `tf()`), `messages.test.ts`, `tone.ts` -- add keys as one block at the end under `nav.` and `screen.`; must pass the tone check.
- `frontend/src/styles/tokens.css`, `base.css` -- tokens (`--space-nav-indicator-*`, `--space-content-max`, `--space-margin-*`, `--color-action`, `--color-floor`), global `:focus-visible`, type classes. Reuse; no token edits.
- `frontend/.oxlintrc.json`, `.stylelintrc.json` -- no JSX text literals, shadow and outline rules apply to new CSS modules.
- `frontend/src/ui/Button.module.css`, `gallery/Gallery.module.css` -- pattern for CSS modules and breakpoints.
- `frontend/e2e/tests/route-change.spec.ts` -- red-phase test (`test.skip`) for this story: un-skip and keep its assertions. `shell.smoke.spec.ts` expects h1 "LittleSteps" at `/`: update to the Today h1. `e2e/support` -- axe and viewport helpers.
- `frontend/package.json`, `package-lock.json` -- add `react-router`; the dependency passes the security scan before commit.
- New: `frontend/src/shell/` (`AppShell.tsx`, `AppShell.module.css`, `NavItems.tsx`, `StatusRegion.tsx`, `useStatus.ts`, `routes.tsx`, `useRouteFocus.ts`, `screens/*.tsx`) with tests beside them.

## Tasks & Acceptance

**Execution:**
- [x] `frontend/package.json`, `package-lock.json` -- add exact-pinned `react-router`; run the security scan -- UX routing requirement
- [x] `frontend/src/i18n/messages.ts` (+test) -- add nav labels, five screen titles/subjects/intro lines, not-found and skip-link copy -- no inline text
- [x] `frontend/src/shell/useStatus.ts`, `StatusRegion.tsx` -- context provider with one empty `role="status"` region outside the outlet; `announce()` writes on the next animation frame -- UX-DR116
- [x] `frontend/src/shell/AppShell.tsx` (+css) -- skip link first, then `<nav>` and `<main>` landmarks; bottom nav under 600px, left rail from 600px; indicator bar; tokens only -- UX-DR27, 118, 128
- [x] `frontend/src/shell/useRouteFocus.ts`, `routes.tsx`, `screens/*` -- data router, five placeholders and not-found, title and `<h1>` focus on every change, scroll restoration, focus restoration on Back -- UX-DR112, 114, 117
- [x] `frontend/src/App.tsx`, `main.tsx` -- mount the router; keep the gallery branch -- integration
- [x] `frontend/src/shell/*.test.tsx`, `frontend/e2e/tests/app-shell.spec.ts` -- route-change test (title, focus, Back with restored scroll and focus), landmarks and order, `aria-current`, status order, axe at 360 and 768px -- coverage

**Acceptance Criteria:**
- Given the shell below 600px, then a bottom nav shows Today, Goals, Activities, Share, Family each with icon and label; the active item has `aria-current="page"` and the 32×4px bar.
- Given 600px or wider, then the same links appear as a left rail with a vertical bar and content is centred at 720px with the breakpoint margin.
- Given any route change, then `document.title` matches the format and focus is on the `<h1>`.
- Given the shell, then exactly one `role="status"` region exists, empty on first load, outside routed content; `useStatus` is the only code that writes to it.
- Given Back, then the previous screen shows with scroll and focus restored.
- Given a keyboard user, then Skip to content is the first tab stop and every destination is reachable by Tab and Enter.

## Implementation Notes

- Built directly from the spec (no implementation subagent). `react-router` 8.5.0, exact pin, data router; `App.tsx` holds one module-level router.
- Files: `frontend/src/shell/` (`AppShell`, `NavItems`, `Screen`, `StatusProvider`, `statusContext`, `useRouteFocus`, `routes`, CSS module, tests), catalog block `nav.` and `screen.`, `App.test.tsx` rewritten, `route-change.spec.ts` un-skipped and extended, `shell.smoke.spec.ts` now expects the Today h1.
- Decisions: the redirect from `/` counts as the first load (focus stays on the skip link); the product name is the `PRODUCT_NAME` constant interpolated into `screen.titleFormat`; the status region is visually hidden until Story 2.5 adds the visible status line.

## Spec Change Log

## Review Triage Log

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Announce during a pending loader navigation is unverified (VG) | medium | patch, fixed | loader-gated test in `AppShell.test.tsx`; the flush now also checks idle |
| 2 | Announce then navigate can flush before the route renders (BH, EC) | medium | patch, fixed | rAF callback re-checks idle; same test |
| 3 | An identical repeat message is silent (BH, EC) | medium | patch, fixed | region cleared before each flush; test "delivered twice" |
| 4 | Focus on Back undoes restored scroll (BH, EC) | medium | patch, fixed | `focus({ preventScroll })` on POP in `useRouteFocus.ts` |
| 5 | Product name hard-coded in the catalog; title stale without a handle (BH, EC) | low | patch, fixed | `PRODUCT_NAME` constant, fallback title |
| 6 | Remembered focus key can go stale (EC) | low | patch, fixed | key deleted on focus of an unkeyed element |
| 7 | Browser router created in render leaks a listener under StrictMode (BH, EC) | low | patch, fixed | module-level router in `App.tsx` |
| 8 | App wiring lost its unit test (EC, BH) | low | patch, fixed | new `App.test.tsx` mounts App |
| 9 | Paths, icon names and keys tied by casts (BH, EC) | low | patch, fixed | `App.test.tsx` asserts every nav key exists in the catalog |
| 10 | Safe-area inset and rail overflow on short screens (BH, EC) | low | patch, fixed | `env(safe-area-inset-bottom)`, `overflow-y: auto`, `100dvh` in the CSS module |
| 11 | Nav height under text zoom, `viewport-fit` (BH, EC) | medium | defer #125 | owned by Stories 2.7 and 2.8 |
| 12 | Reload on a route 404s in the full-mode image (found while checking serving) | medium | defer #124 | `deploy/Dockerfile` copies the build to `static/`; no fallback in the backend |
| 13 | Query-only change pulls focus to the h1 (EC) | low | rejected | no route uses search params; the spec says every route change focuses the h1 |
| 14 | `CSS.escape` may be missing (EC) | false | rejected | present in jsdom and every supported browser; Back test passes |
| 15 | Lockfile and catalog tests absent from diff (EC) | false | rejected | diff excluded the lockfile; `messages.test.ts` runs the tone check on all keys |
| 16 | Back to not-found "Go to Today" focus untested (VG) | low | rejected | placeholder link, no behaviour beyond the shared hook |
| 17 | e2e layout assertions loose, no 599/600 boundary, focus-visible on nav (BH) | low | rejected | layout and `:focus-visible` rule covered by the checks added; exact boundary adds no new risk |
| 18 | README, changelog, issue references missing from the diff (BH) | low | patch, fixed | added in this story's finish step |
| 19 | not-found noindex (BH) | false | rejected | single-page app behind sign-in, no crawlable content |

## Design Notes

Routing is a data router (`createBrowserRouter`) so `ScrollRestoration` works. Focus handling lives in one hook run by the shell's layout route: on `PUSH`/`REPLACE` focus the `<h1>` (`tabIndex={-1}`); on `POP` restore the element recorded for that `location.key` (by `data-focus-key`) else the `<h1>`. Titles use the screen name and a subject from the catalog, for example "Goals: Your goals · LittleSteps". The first load does not steal focus from the skip link.

## Verification

**Commands:**
- `cd frontend && npm run typecheck && npm run lint && npm test` -- expected: all green
- `cd frontend && npm run build` -- expected: success, gallery chunk still absent in production
- `cd frontend && npm run test:e2e` -- expected: shell spec and axe pass at 360 and 768px
- `deploy/security-scan.sh` -- expected: no blocking finding for the new dependency

**Manual checks (if no CLI):**
- Resize across 600px: bottom nav becomes a left rail, no horizontal scroll. Tab from page load: skip link first. VoiceOver or similar: route change announces the new `<h1>`.
