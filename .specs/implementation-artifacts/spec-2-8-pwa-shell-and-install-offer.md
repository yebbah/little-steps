---
title: 'Story 2.8: PWA shell and install offer'
type: 'feature'
created: '2026-11-07'
status: 'done'
baseline_commit: '99d31abc25c5e7c2e5fac584209a39ab8a32f930'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-02-app-shell.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/DESIGN.md'
  - '{project-root}/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** The app cannot be added to a home screen, has no manifest, no service worker and no install offer, so it cannot open like an app, and later epics have no hook for offering install or for updating without losing a draft.

**Approach:** vite-plugin-pwa builds a manifest (name, short name, token colours, standalone, icons from an SVG kept in the repo) and a service worker that precaches the shell only. A new version waits and takes over on the next open; `useAppUpdate()` is the hook. `offerInstall()` shows the browser's own prompt or short instructions, chosen by feature detection, never on the first visit, never again after "Not now" except from Settings. Source: GitHub issue #42, Story 2.8 (NFR-9, NFR-10, UX-DR129, AD-23).

## Boundaries & Constraints

**Always:** manifest colours read from `tokens.css`. Icons are a simple object drawing (blocks), no people or faces, SVG kept in `frontend/public/icons/`, PNGs generated from it by `npm run icons`. Service worker: precache of built files only, no runtime caching, API and actuator paths never fall back to the shell page, no `skipWaiting` or `clientsClaim`. Install path chosen by feature detection (`beforeinstallprompt`, display mode), never browser name. All text from the catalog. Every feature works uninstalled.

**Never:** no Settings screen or route (Story 2.9 calls `offerInstall({ from: 'settings' })`), no push, no offline data, no API caching, no backend change (deferred #124 stays deferred), no new dependency (vite-plugin-pwa and workbox are already in the lockfile).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First visit | feature calls `offerInstall()` | nothing shown | n/a |
| Prompt path | second visit, browser fired `beforeinstallprompt` | dialog with "Add to home screen"; accepting calls the browser prompt | dismissed prompt counts as "Not now" |
| Instructions path | no browser prompt | dialog with short instructions, no browser named, "Got it" | n/a |
| Not now | Not now or Close | closed; feature calls never show it again | n/a |
| Settings | `offerInstall({ from: 'settings' })` | shown even after "Not now" and on a first visit | n/a |
| Installed | standalone display mode or `appinstalled` | nothing offered | n/a |
| New version | worker waiting | `useAppUpdate().updateReady` is true; nothing reloads until `applyUpdate()` or the next open | n/a |
| Storage blocked | `localStorage` throws | offer works, may repeat | no throw |

</frozen-after-approval>

## Code Map

- `frontend/pwa.config.ts` -- manifest and service worker rules, read by `vite.config.ts` and by a test.
- `frontend/src/pwa/` -- `install.ts` (store and `offerInstall`), `InstallOffer.tsx` (dialog), `update.ts` and `register.ts` (update hook), tests beside them.
- `frontend/public/icons/` -- `app-icon.svg` and generated PNGs; `frontend/scripts/generate-icons.mjs`.
- `frontend/index.html` -- icons, theme colour, `viewport-fit=cover` (part of deferred #125).
- `frontend/src/shell/AppShell.tsx` mounts `InstallOffer`; `frontend/src/main.tsx` starts tracking and registers the worker in production.
- `frontend/src/i18n/messages.ts` -- `pwa.` block.

## Tasks & Acceptance

**Execution:**
- [x] Manifest, icons, service worker rules -- AD-23
- [x] Update hook -- next open, no draft lost
- [x] Install offer (prompt, instructions, Not now, first visit, Settings) -- UX-DR129
- [x] Tests, docs, changelog, security report

**Acceptance Criteria:** the Story 2.8 acceptance criteria in the epic file, unchanged.

## Spec Change Log

## Review Triage Log

Reviewers: BH blind, EC edge, VG verification gap (three separate subagents).

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | An offer called while another modal is open is refused and then recorded as "Not now", silencing all feature offers [EC] | high | patch, fixed | `offerInstall` checks `isModalOpen()`; test "an offer is not opened behind another modal" |
| 2 | A failing `prompt()` is an unhandled rejection and the dialog just closes [BH, EC] | medium | patch, fixed | try/catch in `acceptInstall`; test "a browser prompt that fails when used" |
| 3 | The visit counter counted every reload, NaN or blocked storage showed the offer early or never [BH, EC, VG] | medium | patch, fixed | once per browser session, damaged value counts as 0; four tests |
| 4 | An installed app opened in a browser tab was offered install again [BH, EC] | medium | patch, fixed | installed flag persisted, wider display-mode query; two tests |
| 5 | Offer stuck on instructions when the browser prompt arrives late; "Add" closed silently when the prompt was gone [BH, VG] | low | patch, fixed | late-prompt switch and instructions fallback; two tests |
| 6 | A `--mode test` build would register a service worker [BH] | medium | patch, fixed | `main.tsx` requires mode `production` |
| 7 | Registration failure was an unhandled rejection [EC] | low | patch, fixed | `onRegisterError` and `.catch` |
| 8 | Nothing tests the built manifest and worker (AD-23 rested on config assertions) [VG] | medium | patch, fixed | `src/build/pwa-build.test.ts` builds and reads `sw.js` and the manifest |
| 9 | Theme metas and icon colours not checked against tokens; blocked-storage spies leaked; vacuous assertions [VG, BH] | low | patch, fixed | `pwa.config.test.ts`, `install.test.tsx` restore mocks |
| 10 | A waiting version is never applied on resume; stale shell on installed phones [BH, EC] | medium | defer #130 | quiet banner and update check when drafts exist |
| 11 | Shell fallback for server-handled routes; no-cache headers for sw.js and index.html [BH, EC, VG] | medium | defer #129 | belongs with Epic 3 routes and #124 |
| 12 | Manifest theme and background colour are light only, the in-app Dark choice is not reflected in browser chrome [BH, EC] | low | rejected | the manifest has one value per field; the metas follow the device setting and the app paints its own theme |
| 13 | Hard-coded root `start_url`, scope and icon paths under a sub-path [EC] | low | rejected | the app is served from the root (Spring static files); a sub-path is not a supported deployment |
| 14 | Dismissing the native prompt is a permanent decline [BH] | low | rejected | the spec says "Not now" is final unless Settings asks; a dismissed prompt is the Caregiver saying not now |
| 15 | `getInstalledRelatedApps` not used for installed detection [BH] | low | rejected | Chromium only, behind a permission prompt; the persisted flag covers the app's own installs |
| 16 | The "no faces" icon test is a proxy [VG] | low | rejected | style and subject cannot be tested; the file is reviewed by eye and contains only rects |

## Design Notes

- No spec change is needed. #124 (serving index.html for client routes in the full-mode image) is a backend change and stays deferred; the dev server and `vite preview` already serve every route.

## Verification

**Commands:**
- `cd frontend && npm run lint && npm run typecheck && npm test` -- expected: green
- `cd frontend && npm run build` -- expected: manifest and `sw.js` in `dist/`
- `deploy/security-scan.sh` -- expected: no KEV, no CVSS 7+ (twice per story)
