---
runScope: 'epic-level'
runKey: 'epic-2'
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-11-06'
---

# Step 1: Mode detection

- Mode: Epic-Level (user named "epic 2"; sprint-status.yaml exists)
- Epic: 2, "App shell and design foundations" (`.specs/planning-artifacts/epics/epic-02-app-shell.md`), 11 stories (2.1-2.11), status backlog
- Prerequisites: epic + stories with acceptance criteria present. No prior checkpoint.

# Step 2: Context loaded

- Stack: frontend (React 19, Vite 8, Vitest 5, vite-plugin-pwa; backend Spring present but out of scope for epic 2). No Playwright/axe yet (Story 2.7 adds). Only existing test: frontend/src/App.test.tsx; bash tests in deploy/tests and frontend/scripts/lint-rules.test.sh.
- CI: GitHub workflow with a single "Frontend" job (lint, typecheck, Vitest+coverage, build, api:check). No a11y job yet.
- Config: playwright-utils on, pact-utils on (no contract relevance for epic 2, skipped), browser automation auto (no running app, exploration skipped).
- Knowledge: risk-governance, probability-impact, test-levels-framework, test-priorities-matrix. nfr-criteria loaded by relevance (accessibility, PWA, tone NFRs).
- Docs: epic-02-app-shell.md, requirements.md (NFR-8/9/10/14/15), ARCHITECTURE-SPINE (AD-18, AD-23, AD-24), DESIGN.md/EXPERIENCE.md.

inputDocuments:
- .specs/planning-artifacts/epics/epic-02-app-shell.md
- .specs/planning-artifacts/epics/requirements.md
- .specs/planning-artifacts/architecture/architecture-little-steps-2026-11-05/ARCHITECTURE-SPINE.md
- .specs/implementation-artifacts/sprint-status.yaml

# Step 3: Risk and testability

## Risk register (each row traced to the epic)

| ID | Cat | Risk (source) | P | I | Score | Mitigation | Owner | Timeline |
|----|-----|---------------|---|---|-------|------------|-------|----------|
| R-01 | SEC | Gallery route/code ships in production build (2.1: "never for the production build"; epic Done-when: "a test checks this") | 2 | 3 | 6 | Build test greps the prod bundle for gallery route and code; CI runs it on the production build, not the test-mode build | Dev | Story 2.1 |
| R-02 | BUS | Colour contrast misses in a token pairing, light or dark (2.1 contrast test; UX-DR6) | 2 | 3 | 6 | Contrast test reads DESIGN.md pairings, both modes, 4.5:1 text / 3:1 edges; fails on any miss | Dev | Story 2.1 |
| R-03 | TECH | Focus, title and live-region order wrong on route change (2.3, UX-DR116/117; order route, title, focus h1, message next frame) | 3 | 2 | 6 | Route-change tests for title, h1 focus, Back with restored scroll/focus; status-region test for ordering and single `role=status` | Dev | Story 2.3 |
| R-04 | TECH | Modal focus trap, return to invoker, inert background, single modal level fail (2.5, UX-DR28/113; Radix) | 2 | 3 | 6 | Component tests on Sheet/Dialog; Playwright keyboard pass in gallery | Dev | Story 2.5 |
| R-05 | BUS | Banned tone phrases reach UI (2.6, NFR-8; UX-DR135/136) | 2 | 2 | 4 | CI tone check over the whole catalog; unknown-key test; coverage test for spine strings (2.10, 2.11) | Dev | Story 2.6 |
| R-06 | TECH | Spine-named strings missing from catalog, so later stories assert on absent keys (2.10, 2.11) | 2 | 2 | 4 | Key-by-group coverage test fails on missing spine string | Dev | Stories 2.10, 2.11 |
| R-07 | BUS | Theme flash or wrong theme before first paint (2.1, 2.9) | 2 | 2 | 4 | Inline pre-paint script test (jsdom: class set before render); Playwright check with stored Dark and no `prefers` match | Dev | Stories 2.1, 2.9 |
| R-08 | TECH | Service worker caches API responses or serves stale shell, losing drafts (2.8, AD-23) | 2 | 3 | 6 | Build test on generated precache manifest (no `/api`); update-hook unit test; Playwright offline/update smoke | Dev | Story 2.8 |
| R-09 | BUS | Install offer appears on first open or after "Not now", or relies on browser-name sniffing (2.8, NFR-10, UX-DR129) | 2 | 2 | 4 | Tests for prompt, instructions and Not-now paths with feature detection stubs | Dev | Story 2.8 |
| R-10 | BUS | Reflow breaks at 320px / 200% text; fixed heights; footers stack wrongly (2.7, UX-DR120/121) | 3 | 2 | 6 | Playwright at 320px, text-scale 200% and 130% thresholds, 400px footer rule, under-500px-tall unpinning | Dev | Story 2.7 |
| R-11 | BUS | State shown by colour alone (2.7, UX-DR123) | 2 | 2 | 4 | Assertions that selection/source/AI/nav/status carry text or shape | Dev | Story 2.7 |
| R-12 | TECH | Disabled controls natively `disabled` (not focusable); stepper edge cases (2.4, UX-DR17/20) | 2 | 2 | 4 | Component tests: aria-disabled, focus retained, clamp at 0, Succeeded <= Tried | Dev | Story 2.4 |
| R-13 | OPS | Accessibility CI job not wired; axe runs against wrong build (2.7: "own CI job 'Frontend: accessibility' against test-mode build with gallery") | 2 | 2 | 4 | Add job; assert `VITE_ENABLE_GALLERY=true` in that build; ci-workflow.test.sh check | Dev | Story 2.7 |
| R-14 | TECH | Domain tint mapping wrong (longest keyword, ties, whole-word, unknown to other) (2.2, UX-DR4) | 2 | 1 | 2 | Unit tests incl. the four named cases plus tie and whole-word cases | Dev | Story 2.2 |
| R-15 | TECH | Missing icon for a nav destination (2.2) | 1 | 2 | 2 | Test enumerates nav destinations against icon set | Dev | Story 2.2 |
| R-16 | TECH | Reduced motion not honoured (2.5, UX-DR122) | 2 | 2 | 4 | Emulate `prefers-reduced-motion` in Playwright; assert no transition on sheets/pressed | Dev | Stories 2.5, 2.7 |
| R-17 | TECH | Forced-colors focus ring missing; `outline:none`/`box-shadow` slips in (2.1, 2.4, UX-DR12/14) | 2 | 2 | 4 | stylelint rule tests (existing lint-rules.test.sh pattern); forced-colors emulation | Dev | Stories 2.1, 2.4 |

High risks (>=6): R-01, R-02, R-03, R-04, R-08, R-10. No score-9 blockers.

## NFR planning (thresholds from the epic)

- NFR-14 accessibility: WCAG 2.1 AA; 4.5:1 text, 3:1 control edges; 48px targets; 320px reflow; 200% text. Evidence: contrast test, axe (no serious/critical), Playwright.
- NFR-9/10 PWA and browsers: manifest, standalone, shell-only precache. Browser matrix thresholds beyond "current" UNKNOWN: clarify which engines CI runs (Chromium only is the likely default; WebKit/Firefox for focus and install-instruction paths).
- NFR-8 tone / NFR-15 English: tone check in CI.
- Performance: no threshold in the epic. UNKNOWN (no load-time or bundle budget). Clarification item, not a risk.
- Manual screen-reader passes deferred to Epic 24 (P2): accepted gap, recorded.

## Testability notes

- Controllable: gallery with fixed-width frames and per-state registration gives deterministic targets. Catalog keys allow assertion by key.
- Gap: Playwright, axe and a router are not yet installed; only one SSR smoke test exists. Story 2.7 harness arrives last, so 2.1-2.6 must carry component-level tests (jsdom/Vitest) rather than defer to e2e. Recommend adding Testing Library + jest-axe-style checks early (assumption: not in package.json today).
- Vitest `include` covers `src/**` only; e2e dir needs its own runner config to avoid collision.

# Step 4: Coverage plan

Levels: Unit (U), Component (C, Vitest+Testing Library, jsdom), Build/CI (B), E2E (E, Playwright+axe, Chromium; WebKit/Firefox for install and focus paths).

| Story | Scenario | Level | Pri | Risk |
|-------|----------|-------|-----|------|
| 2.1 | Prod bundle contains no gallery route/code; dev/test mode registers it | B | P0 | R-01 |
| 2.1 | Every DESIGN.md pairing passes AA in light and dark | U | P0 | R-02 |
| 2.1 | Theme stored on device, applied before first paint, no flash | C+E | P1 | R-07 |
| 2.1 | stylelint rejects box-shadow != none and outline:none without replacement | B | P1 | R-17 |
| 2.1 | Tokens exist with `-dark` twins; mask-cover equal in both modes; no web-font request | U | P2 | R-02 |
| 2.2 | domainTint: 4 named cases, tie, whole-word, case, unknown | U | P1 | R-14 |
| 2.2 | DomainTag always shows text; IconTile sizes; icon exists per nav destination | C | P2 | R-15 |
| 2.3 | Route change: title format, h1 focus, single status region, ordering | C+E | P0 | R-03 |
| 2.3 | Back restores scroll and focus | E | P1 | R-03 |
| 2.3 | Bottom nav <600px / rail >=600px; aria-current; skip link; landmarks | C+E | P1 | R-03 |
| 2.4 | Button/TextField/ChoiceChips/DisclosureRow keyboard + ARIA | C | P1 | R-12 |
| 2.4 | Stepper min clamp, "0, minimum", Succeeded<=Tried message | C | P1 | R-12 |
| 2.4 | Focus ring incl. forced-colors; 48px targets | E | P1 | R-17 |
| 2.5 | Sheet/Dialog: trap, return, Esc, scrim, single level, inert | C+E | P0 | R-04 |
| 2.5 | StatusLine survives own navigation, clears on next action not timer | C | P1 | R-03 |
| 2.5 | Banner order, dismiss, never blocks | C | P2 | R-04 |
| 2.5 | Reduced motion: no slide/fade, instant pressed state | E | P2 | R-16 |
| 2.6 | Unknown key visible; tone check fails on each banned phrase | U+B | P1 | R-05 |
| 2.6 | Standard AI/parent labels present; checklist file exists | U | P2 | R-05 |
| 2.10/2.11 | Spine strings present by key, by group; tone passes on additions | U | P1 | R-06 |
| 2.7 | axe: no serious/critical, all gallery frames + shell screens, light/dark | E | P0 | R-13 |
| 2.7 | 320px and 200% text: no horizontal scroll or truncation | E | P0 | R-10 |
| 2.7 | Footer stacking rule (400px / 130%); <500px tall unpin; scroll-padding | E | P1 | R-10 |
| 2.7 | No colour-only state | E | P1 | R-11 |
| 2.7 | CI job "Frontend: accessibility" exists, builds with gallery on | B | P1 | R-13 |
| 2.8 | Manifest fields; precache has no API routes | B | P0 | R-08 |
| 2.8 | Update hook preserves draft; new version on next open | C+E | P1 | R-08 |
| 2.8 | Install offer: prompt, instructions, Not-now, never on first open | C | P1 | R-09 |
| 2.9 | Settings reachable from Family, Back returns, focus/title rules | E | P1 | R-03 |
| 2.9 | Theme chips default System, apply at once, persist across reload, status announced | C+E | P1 | R-07 |

Counts: P0 6, P1 17, P2 5, P3 0 (31 rows, some combined levels).

## NFR evidence plan
- NFR-14: contrast unit test report, axe JSON, Playwright reflow traces, to `frontend/test-results` and a11y-passes.md.
- NFR-9/10: built manifest + precache list artifact; browser matrix UNKNOWN (clarify).
- NFR-8/15: tone check log in CI.
- Performance: no threshold, none planned.

## Execution
- PR: Vitest (unit/component) + build tests + Playwright accessibility job (expect <15 min with Chromium only).
- Nightly: WebKit and Firefox project for focus, forced-colors and install-instruction paths, if adopted.
- Weekly: none. Manual screen-reader passes deferred to Epic 24.

## Estimates (ranges)
- P0: ~20-32 h; P1: ~35-55 h; P2: ~8-15 h; P3: 0. Total ~65-100 h, about 2-3 weeks for one developer alongside feature work.

## Quality gates
- P0 100%, P1 >=95%, all R-01..R-04, R-08, R-10 mitigated before epic release note.
- Frontend coverage >=80% on new code (adjust to existing CI threshold if one exists).
- Clean security scan and full suite per epic definition of done.

# Step 5: Output

Wrote test-design-epic-2.md. Corrected counts: P0 7 scenarios, P1 18, P2 5 (30 total); ~96 h (80-125).
