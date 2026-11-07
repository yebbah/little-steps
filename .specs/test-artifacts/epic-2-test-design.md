---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-11-06'
inputDocuments:
  - .specs/planning-artifacts/epics/epic-02-app-shell.md
  - .specs/planning-artifacts/epics/requirements.md
  - .specs/planning-artifacts/architecture/architecture-little-steps-2026-11-05/ARCHITECTURE-SPINE.md
  - .specs/implementation-artifacts/sprint-status.yaml
---

# Test Design: Epic 2 - App shell and design foundations

**Date:** 2026-11-06
**Status:** Draft

---

## Executive Summary

**Scope:** Epic-level test design for Epic 2 (stories 2.1 to 2.11). Frontend only: tokens and theme, domain tints and icons, shell and navigation, controls, surfaces, message catalog, accessibility harness, PWA shell, settings.

**Risk Summary:**

- Total risks identified: 17
- High-priority risks (≥6): 6 (R-01, R-02, R-03, R-04, R-08, R-10)
- Critical categories: BUS (accessibility and UX floor), TECH (focus, modal, service worker), SEC (gallery leaking to production)
- No score-9 blockers

**Coverage Summary:**

- P0 scenarios: 7 (about 24 tests, ~38 h)
- P1 scenarios: 18 (about 55 tests, ~50 h)
- P2/P3 scenarios: 5 (about 15 tests, ~8 h)
- **Total effort**: ~96 h (range 80 to 125 h incl. harness setup, ~2 to 3 weeks for one developer)

---

## Not in Scope

| Item | Reasoning | Mitigation |
| ---- | --------- | ---------- |
| Manual screen-reader passes (VoiceOver, TalkBack, NVDA) | Epic 2 defers them to Epic 24 (P2) | Automated axe and keyboard checks now; results table in `docs/a11y-passes.md`; accepted gap |
| Image-layer focus (UX-DR15), push offer (UX-DR130), iOS import (UX-DR131), share (UX-DR132) | Epics 18, 16, 18, 14 | Tested in those epics |
| Feature components (UX-DR30 onward) | Feature epics | Each registers in the gallery and tests itself |
| Backend, API, contract tests | Epic 2 has no backend change | Pact not relevant; existing backend suite stays in CI |
| Performance and load | Epic names no threshold | See Unknown thresholds |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner | Timeline |
| ------- | -------- | ----------- | - | - | ----- | ---------- | ----- | -------- |
| R-01 | SEC | Gallery route or code ships in the production bundle (2.1: registered only when `VITE_ENABLE_GALLERY=true`, never in production; Done-when: a test checks this) | 2 | 3 | 6 | Build test inspects the production bundle for route and gallery code; runs on a production build | Dev | Story 2.1 |
| R-02 | BUS | A token pairing misses WCAG AA in light or dark (2.1, UX-DR6) | 2 | 3 | 6 | Contrast unit test over every token-backed DESIGN.md pairing (image-layer pairings: #111), both modes, 4.5:1 text and 3:1 edges | Dev | Story 2.1 |
| R-03 | TECH | Title, focus and announcement wrong on route change (2.3, UX-DR112/116/117) | 3 | 2 | 6 | Route-change tests: title, h1 focus, one `role=status`, announce on next frame, Back with scroll and focus | Dev | Story 2.3 |
| R-04 | TECH | Modal focus trap, return, inert page or one-level rule fails (2.5, UX-DR28/113) | 2 | 3 | 6 | Component tests plus Playwright keyboard pass on gallery Sheet and Dialog | Dev | Story 2.5 |
| R-08 | TECH | Service worker caches API responses or loses drafts on update (2.8, AD-23) | 2 | 3 | 6 | Build test on the precache manifest (no API); update-hook test; offline and update smoke | Dev | Story 2.8 |
| R-10 | BUS | Layout breaks at 320px, 200% text, or footer/nav reflow rules (2.7, UX-DR120/121) | 3 | 2 | 6 | Playwright at 320px, 200% and 130% text, 400px footer rule, under-500px unpin | Dev | Story 2.7 |

### Medium-Priority Risks (Score 3-5)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
| ------- | -------- | ----------- | - | - | ----- | ---------- | ----- |
| R-05 | BUS | Banned phrases reach the UI (2.6, NFR-8, UX-DR135/136) | 2 | 2 | 4 | CI tone check over the catalog; unknown key is visible | Dev |
| R-06 | TECH | Spine strings missing from catalog (2.10, 2.11) | 2 | 2 | 4 | Coverage test by key group | Dev |
| R-07 | BUS | Wrong theme flashes before first paint (2.1, 2.9) | 2 | 2 | 4 | Pre-paint test; E2E with stored Dark | Dev |
| R-09 | BUS | Install offer on first open, after Not now, or by browser-name sniffing (2.8, NFR-10) | 2 | 2 | 4 | Prompt, instructions and Not-now path tests with feature-detection stubs | Dev |
| R-11 | BUS | State shown by colour alone (2.7, UX-DR123) | 2 | 2 | 4 | Assert text or shape for selection, source, AI, nav, status | Dev |
| R-12 | TECH | Disabled controls natively disabled; stepper edge cases (2.4, UX-DR17/20) | 2 | 2 | 4 | Component tests: aria-disabled, focusable, clamp, Succeeded ≤ Tried | Dev |
| R-13 | OPS | "Frontend: accessibility" CI job missing or run against a build without the gallery (2.7) | 2 | 2 | 4 | Add job; ci-workflow.test.sh asserts job and `VITE_ENABLE_GALLERY=true` | Dev |
| R-16 | TECH | Reduced motion not honoured (2.5, UX-DR122) | 2 | 2 | 4 | Emulated `prefers-reduced-motion` in Playwright | Dev |
| R-17 | TECH | Forced-colors focus ring missing; `outline:none` or shadow slips in (2.1, 2.4, UX-DR12/14) | 2 | 2 | 4 | stylelint rule tests (pattern of `lint-rules.test.sh`); forced-colors emulation | Dev |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | P | I | Score | Action |
| ------- | -------- | ----------- | - | - | ----- | ------ |
| R-14 | TECH | Domain tint mapping wrong (2.2, UX-DR4) | 2 | 1 | 2 | Unit tests (cheap, so covered at P1) |
| R-15 | TECH | Icon missing for a nav destination (2.2) | 1 | 2 | 2 | Enumeration test |

### Risk Category Legend

TECH technical/architecture · SEC security · PERF performance · DATA data integrity · BUS business/UX impact · OPS operations

---

## NFR Planning

| NFR Category | Requirement / Threshold | Risk Link | Planned Validation | Evidence Needed |
| ------------ | ----------------------- | --------- | ------------------ | --------------- |
| Accessibility (NFR-14) | WCAG 2.1 AA; 4.5:1 text, 3:1 control edges; 48px targets; reflow at 320px and 200% text | R-02, R-10, R-11, R-12 | Contrast unit test; axe via Playwright; reflow and target-size checks | Vitest report, axe results, `docs/a11y-passes.md` |
| Platform and browsers (NFR-9, NFR-10) | PWA, standalone manifest, shell-only precache, current major browsers | R-08, R-09 | Build test on manifest and precache; install-path component tests | Built manifest and precache list |
| Tone (NFR-8) and language (NFR-15) | No banned phrases; English | R-05, R-06 | CI tone check; spine-coverage test | CI tone-check log |
| Security (AD-23, gallery) | No gallery in production | R-01 | Production-bundle build test | Build-test report |
| Maintainability | Gallery registers every component and state | R-13 | CI job wiring test | CI workflow, Vitest coverage |

**Unknown thresholds:**

- Performance: no load-time or bundle-size budget in the epic or NFRs. Clarify before adding any perf test.
- Browser matrix: NFR-10 says "current" browsers but not which engines CI runs. Assumption: Chromium on every PR, WebKit and Firefox nightly. Needs confirming.
- Coverage threshold: no frontend target found in the CI workflow. Using ≥80% on new code as a proposal.

---

## Entry Criteria

- [ ] DESIGN.md token and pairing tables final (needed by the contrast test)
- [ ] EXPERIENCE.md spine strings final (needed by 2.10 and 2.11 coverage tests)
- [ ] Testing Library and a jsdom environment added to the frontend (not present today)
- [ ] Browser matrix and coverage target confirmed
- [ ] Story 2.1 and 2.6 started first, as the build order allows

## Exit Criteria

- [ ] All P0 tests passing
- [ ] All P1 tests passing (or failures triaged)
- [ ] R-01, R-02, R-03, R-04, R-08, R-10 mitigated and verified
- [ ] Clean security scan, full suite green, release note (epic Definition of done)
- [ ] `docs/a11y-passes.md` created with automated results

---

## Test Coverage Plan

Levels: Unit, Component (Vitest, Testing Library, jsdom), Build/CI, E2E (Playwright with axe).

### P0 (Critical)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| 2.1 Production bundle has no gallery; test mode does | Build/CI | R-01 | 3 | DEV | Only a built bundle can show this |
| 2.1 Every token-backed pairing passes AA, light and dark | Unit | R-02 | 4 | DEV | Pure computation over the pairing table |
| 2.3 Route change: title, h1 focus, single status region, ordering | Component + E2E | R-03 | 6 | DEV | Component for logic; E2E for real focus and Back |
| 2.5 Sheet/Dialog: trap, return, Esc, scrim, single level, inert | Component + E2E | R-04 | 6 | DEV | Real focus behaviour needs a browser |
| 2.7 axe: no serious/critical on gallery frames and shell, both modes | E2E | R-13 | 2 | DEV | One run per mode over all targets |
| 2.7 320px and 200% text: no horizontal scroll, no truncation | E2E | R-10 | 3 | DEV | Layout needs a real engine |
| 2.8 Manifest valid; precache lists shell only, no API | Build/CI | R-08 | 3 | DEV | Inspect generated artifacts |

**Total P0**: ~27 tests, ~38 h (7 scenarios; counts are estimates)

### P1 (High)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| 2.1 Theme stored, applied before first paint | Component + E2E | R-07 | 3 | DEV | |
| 2.1 stylelint rejects non-none box-shadow and bare outline:none | Build/CI | R-17 | 3 | DEV | Extend `lint-rules.test.sh` |
| 2.2 domainTint mapping rules | Unit | R-14 | 8 | DEV | Include the four named cases, ties, whole-word |
| 2.3 Back restores scroll and focus | E2E | R-03 | 2 | DEV | |
| 2.3 Bottom nav / rail, aria-current, skip link, landmarks | Component + E2E | R-03 | 4 | DEV | |
| 2.4 Button, TextField, ChoiceChips, DisclosureRow keyboard and ARIA | Component | R-12 | 8 | DEV | |
| 2.4 Stepper clamp, "0, minimum", Succeeded ≤ Tried | Component | R-12 | 5 | DEV | |
| 2.4 Focus ring incl. forced-colors; 48px targets | E2E | R-17 | 3 | DEV | |
| 2.5 StatusLine survives own navigation, clears on next action | Component | R-03 | 4 | DEV | No timer clearing |
| 2.6 Unknown key visible; each banned phrase fails the tone check | Unit + Build/CI | R-05 | 6 | DEV | |
| 2.10, 2.11 Spine strings present by key group | Unit | R-06 | 3 | DEV | |
| 2.7 Footer stacking, short-viewport unpin, scroll-padding | E2E | R-10 | 4 | DEV | |
| 2.7 No colour-only state | E2E | R-11 | 2 | DEV | |
| 2.7 CI job exists and builds with gallery enabled | Build/CI | R-13 | 2 | DEV | |
| 2.8 Update hook keeps draft | Component | R-08 | 2 | DEV | Real drafts arrive later; use a stub |
| 2.8 Install offer: prompt, instructions, Not-now, never on first open | Component | R-09 | 4 | DEV | |
| 2.9 Settings from Family, Back to Family, title and focus | E2E | R-03 | 2 | DEV | |
| 2.9 Theme chips default System, apply at once, persist, announced | Component + E2E | R-07 | 3 | DEV | |

**Total P1**: ~64 tests, ~50 h (18 scenarios)

### P2 (Medium)

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| 2.1 Tokens with `-dark` twins; mask-cover equal; no web-font request | Unit | R-02 | 4 | DEV | |
| 2.2 DomainTag text always shown; IconTile sizes; nav icons exist | Component | R-15 | 4 | DEV | |
| 2.5 Banner order, dismiss, never blocks | Component | R-04 | 3 | DEV | |
| 2.5 Reduced motion: no slide or fade | E2E | R-16 | 2 | DEV | |
| 2.6 Standard AI/parent labels; checklist file exists | Unit | R-05 | 2 | DEV | |

**Total P2**: ~15 tests, ~8 h

### P3 (Low)

None identified.

---

## Execution Strategy

**Philosophy:** Run everything on pull requests while the suite stays under 15 minutes.

- **Pull request:** Vitest (unit, component), build and CI tests, and the Playwright "Frontend: accessibility" job on Chromium.
- **Nightly:** WebKit and Firefox projects for focus, forced-colors and install-instruction paths, once the browser matrix is confirmed.
- **Weekly:** None. Manual screen-reader passes come in Epic 24.

---

## Resource Estimates

| Priority | Count | Hours/Test | Total Hours | Notes |
| -------- | ----- | ---------- | ----------- | ----- |
| P0 | ~27 | ~1.4 | ~38 | Browser-level and build inspection |
| P1 | ~64 | ~0.8 | ~50 | Mostly component tests |
| P2 | ~15 | ~0.5 | ~8 | |
| P3 | 0 | - | 0 | |
| **Total** | **~106** | - | **~96 (80 to 125)** | **~2 to 3 weeks** |

### Prerequisites

**Tooling:** Testing Library and jsdom for Vitest; Playwright and `@axe-core/playwright` (with playwright-utils, as configured); stylelint; a contrast calculation helper.

**Environment:** Test-mode build with `VITE_ENABLE_GALLERY=true`; separate Vitest and Playwright include paths (`src/**` vs `e2e/`).

**Test data:** None beyond the gallery fixtures and message catalog.

---

## Quality Gate Criteria

- **P0 pass rate**: 100%
- **P1 pass rate**: ≥95%
- **P2 pass rate**: ≥90%
- **High-risk mitigations**: 100% complete (R-01, R-02, R-03, R-04, R-08, R-10) or approved waiver
- **Coverage:** ≥80% on new frontend code (proposal, see Unknown thresholds)
- **Security:** R-01 test passes 100%

### Non-Negotiable Requirements

- [ ] All P0 tests pass
- [ ] No unmitigated high-risk item
- [ ] axe reports no serious or critical violations
- [ ] Planned NFR evidence exists for `nfr-assess`

---

## Mitigation Plans

### R-01: Gallery in production bundle (Score: 6)
**Mitigation Strategy:** Gate route registration on `VITE_ENABLE_GALLERY`; build test builds in production mode and fails if the route string or gallery module is present.
**Owner:** Dev · **Timeline:** Story 2.1 · **Status:** Planned
**Verification:** Build test red when the flag is forced on in a production build.

### R-02: Contrast misses (Score: 6)
**Mitigation Strategy:** Pairing list drawn from DESIGN.md, tested in both modes; fail on any miss.
**Owner:** Dev · **Timeline:** Story 2.1 · **Status:** Planned
**Verification:** Temporarily lowering one token makes the test fail.

### R-03: Route focus and announcements (Score: 6)
**Mitigation Strategy:** One routed-screen wrapper owns title and focus; `useStatus()` is the only announcer; tests cover ordering.
**Owner:** Dev · **Timeline:** Story 2.3 · **Status:** Planned
**Verification:** Component and E2E route-change tests.

### R-04: Modal behaviour (Score: 6)
**Mitigation Strategy:** Build on Radix; test focus trap, return and single-level in jsdom and in a real browser.
**Owner:** Dev · **Timeline:** Story 2.5 · **Status:** Planned
**Verification:** Keyboard-only Playwright run.

### R-08: Service worker scope (Score: 6)
**Mitigation Strategy:** Precache shell assets only; assert the manifest holds no API route; update hook keeps drafts.
**Owner:** Dev · **Timeline:** Story 2.8 · **Status:** Planned
**Verification:** Build test on generated precache; offline smoke.

### R-10: Reflow (Score: 6)
**Mitigation Strategy:** Min-heights only, wrapping labels; Playwright at 320px and 200% text.
**Owner:** Dev · **Timeline:** Story 2.7 (checks run earlier as each component lands) · **Status:** Planned
**Verification:** No horizontal scroll; no clipped labels.

---

## Assumptions and Dependencies

### Assumptions

1. Testing Library, Playwright and axe are not yet installed (only `App.test.tsx` and bash tests exist); the dependency list is confirmed from `package.json`.
2. CI has one frontend job today; the accessibility job is new.
3. Chromium on PRs is enough for Epic 2 gating.

### Dependencies

1. Story 2.7 harness comes last (epic build order), so 2.1 to 2.6 must ship component-level tests rather than wait for E2E.
2. DESIGN.md and EXPERIENCE.md strings are final before 2.1, 2.10, 2.11 tests are written.

### Risks to Plan

- **Risk**: Harness arrives last, so accessibility defects surface late.
  - **Impact**: Rework across 2.1 to 2.6.
  - **Contingency**: Add axe in component tests from Story 2.4, and run Playwright locally earlier.

---

## Follow-on Workflows (Manual)

- Run `/bmad-testarch-atdd` for failing P0 tests (R-01, R-02, R-03, R-04).
- Run `/bmad-testarch-framework` to set up Playwright and Testing Library before Story 2.7 if wanted earlier.
- Run `/bmad-testarch-automate` once implementation exists.

---

## Interworking & Regression

| Service/Component | Impact | Regression Scope |
| ----------------- | ------ | ---------------- |
| Frontend build and CI | New tests, new job | Existing lint, typecheck, `App.test.tsx`, `lint-rules.test.sh`, `ci-workflow.test.sh` |
| `App.tsx` | Replaced by shell | Update the smoke test that checks the product name |
| Release-note script | Reads JUnit output | `deploy/tests/release-notes.test.sh` must still pass |

---

## Appendix

### Related Documents

- Epic: `.specs/planning-artifacts/epics/epic-02-app-shell.md`
- Requirements: `.specs/planning-artifacts/epics/requirements.md`
- Architecture: `.specs/planning-artifacts/architecture/architecture-little-steps-2026-11-05/ARCHITECTURE-SPINE.md`

**Generated by**: BMad TEA Agent, workflow `bmad-testarch-test-design`
