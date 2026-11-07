---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-generation-mode', 'step-03-test-strategy', 'step-04-generate-tests', 'step-05-validate-and-complete']
lastStep: 'step-05-validate-and-complete'
lastSaved: '2026-11-06'
storyId: '2.1, 2.3, 2.5'
storyKey: 'epic-2-high-risk-r01-r04'
storyFile: '.specs/planning-artifacts/epics/epic-02-app-shell.md'
atddChecklistPath: '.specs/test-artifacts/epic-2-atdd-red-phase.md'
generatedTestFiles:
  - frontend/src/build/gallery-bundle.test.ts
  - frontend/src/styles/tokens.contrast.test.ts
  - frontend/e2e/tests/route-change.spec.ts
  - frontend/e2e/tests/dialog.spec.ts
inputDocuments:
  - .specs/planning-artifacts/epics/epic-02-app-shell.md
  - .specs/test-artifacts/epic-2-test-design.md
  - frontend/playwright.config.ts
acceptanceCriteria:
  - { id: 'AC-1', idSource: generated, text: '2.1 Gallery route registered only when VITE_ENABLE_GALLERY=true; production bundle contains no gallery; build test fails otherwise (R-01)' }
  - { id: 'AC-2', idSource: generated, text: '2.1 Contrast test checks every token-backed DESIGN.md pairing in light and dark against 4.5:1 text and 3:1 control edges (R-02)' }
  - { id: 'AC-3', idSource: generated, text: '2.3 Route change sets document.title "<Screen>: <subject> · LittleSteps", moves focus to h1, one role=status region outside routed content, message on next frame, Back restores scroll and focus (R-03)' }
  - { id: 'AC-4', idSource: generated, text: '2.5 Sheet/Dialog: role=dialog aria-modal aria-labelledby, focus to heading on open, trapped, returns to invoker, page inert, Esc/scrim/Close, one modal level (R-04)' }
---

# Step 1: Preflight and context

- Stack: fullstack (frontend scope). Framework: Playwright (`frontend/playwright.config.ts`) and Vitest + Testing Library, set up earlier this session. Playwright-utils mandate applies to e2e specs.
- Scope: R-01..R-04 span three stories (2.1, 2.3, 2.5); one checklist keyed to the risks, not a single story.
- Prerequisite caveat: none of the target code exists (no router, tokens.css, gallery, Dialog). Radix, React Router are not yet installed; tests written against planned file paths from the epic (`frontend/src/styles/tokens.css`, `/dev/gallery`, `useStatus()`).

# Steps 2-5: generation, strategy, validation

Mode: AI generation (no app to record). Executed sequentially; worker temp JSON files not used.

| AC | Risk | Story | Level | File | First (criterion) assertion |
|----|------|-------|-------|------|-----------------------------|
| AC-1 | R-01 | 2.1 | Build (Vitest, vite build API) | src/build/gallery-bundle.test.ts | test-mode bundle contains `/dev/gallery`; then production bundle has no gallery |
| AC-2 | R-02 | 2.1 | Unit | src/styles/tokens.contrast.test.ts | list of AA misses across pairings, light and dark, is empty |
| AC-3 | R-03 | 2.3 | E2E | e2e/tests/route-change.spec.ts | title matches `Goals... · LittleSteps` after clicking Goals; then h1 focused, one status region |
| AC-4 | R-04 | 2.5 | E2E | e2e/tests/dialog.spec.ts | dialog aria-modal=true, heading focused; then Esc closes and focus returns to invoker |

All four leaves are `test.skip` with exactly one AC id in the title, P0.

## Red-phase verification
Un-skipped temporarily: all 4 failed (AC-1: bundle lacks `/dev/gallery`; AC-2: tokens.css missing; AC-3, AC-4: no nav/gallery in app). Re-skipped; Vitest 2 pass + 2 skipped, Playwright 3 pass + 3 skipped, typecheck and lint clean.

## Assumptions to confirm when implementing
- Gallery route `/dev/gallery`; gallery has a button named "Open sheet".
- Nav links are role=link named Today, Goals, Activities, Share, Family (Story 2.3 may render them as buttons: adjust).
- Token file `src/styles/tokens.css` uses `--<token>` names identical to DESIGN.md keys, `-dark` twins as separate custom properties (not a media-query redefinition; if redefined under `prefers-color-scheme`, parse accordingly).
- Hex values only (6-digit) in tokens.css; scrim (8-digit) is not in PAIRINGS.

## Green-phase checklist (secondary branches, not emitted as red leaves)
- R-01: flag forced on in production mode still excluded? (decision: the story says never for production); dev server route registered.
- R-02: expand PAIRINGS to every DESIGN.md pairing incl. 7 domain tints x 4 inks, dark twins; read from DESIGN.md.
- R-03: Back restores scroll and focus; status message announced on next frame; each of 5 destinations; Settings from Family.
- R-04: focus trap (Tab/Shift+Tab), scrim tap, Close button, one modal level only, page inert, Dialog variant, 600px layout.
- Run the axe sweep (Story 2.7) over the gallery once the Sheet is open.
