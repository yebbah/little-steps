---
stepsCompleted: ['step-01-preflight', 'step-02-select-framework', 'step-03-scaffold-framework', 'step-04-docs-and-scripts', 'step-05-validate-and-summary']
lastStep: 'step-05-validate-and-summary'
lastSaved: '2026-11-06'
---

# Step 1: Preflight

- Detected stack: fullstack (frontend/ React 19 + Vite 8 + Vitest 5; backend/ Spring, pom.xml, existing JUnit suite). Scope of this run: frontend only, per Epic 2 test design. Backend framework untouched.
- Prerequisites: frontend/package.json present; no playwright.config.* or cypress.config.* ; no e2e dir.
- Context: Node 24 (.nvmrc), npm, oxlint, CI job "Frontend" in .github/workflows/ci.yml. Epic 2 test design: .specs/test-artifacts/epic-2-test-design.md.

# Step 2: Framework selection

- Browser: **Playwright** (+ @axe-core/playwright). Reasons: Epic 2 needs viewport/text-scale/forced-colors/reduced-motion emulation, multi-engine nightly, and a dedicated parallel CI job (Story 2.7).
- Component level: keep **Vitest 5**, add Testing Library + jsdom (Epic 2 plan: most P1 tests are component tests).
- Backend: existing JUnit 5 suite kept as is (out of scope).

# Step 3: Scaffold

Installed (dev, frontend/): @playwright/test, @axe-core/playwright, @seontechnologies/playwright-utils, @testing-library/{react,dom,user-event,jest-dom}, jsdom. `npm audit` (dev tree) reports 9 moderate/low findings via playwright-utils transitive deps (exceljs/uuid, glob, minimatch, deepmerge); `--omit=dev` is clean. To check against the AD-25 gate.
Created: playwright.config.ts, e2e/{tsconfig.json, support/merged-fixtures.ts, support/helpers/{a11y,viewports}.ts, tests/{shell.smoke,api.health}.spec.ts}, src/test/setup.ts, src/App.component.test.tsx, .env.example. Edited: package.json (test:e2e, test:e2e:install), tsconfig.json (e2e reference), vite.config.ts (setupFiles), .gitignore.
Skipped: auth fixture (no sign-in until Epic 3), data factories (no data yet), Pact (frontend calls its own backend, relevance gate closed).
Verified: typecheck, lint, vitest (2 pass), build, playwright (3 pass, 1 skipped API sample).

# Step 4: Docs and scripts

- Wrote frontend/e2e/README.md. Scripts test:e2e and test:e2e:install added in step 3.
- Backend scripts: JUnit already wired (mvnw), unchanged.
- Write-time hook (section 3): NOT installed. The auto-mode classifier denied the edit of .claude/settings.json (hooks are agent self-modification). Needs the user's explicit decision/permission.

# Step 5: Validation

- Repo security scan (deploy/security-scan.sh scan frontend) initially FAILED: BLOCK uuid 8.3.2 (CVE-2026-41907) via playwright-utils > exceljs. Fixed with npm `overrides: { uuid: ^11.1.1 }` in frontend/package.json; scan now PASS with 3 warnings (deepmerge, glob, minimatch, no fix / non-blocking). exceljs on uuid 11 not exercised (Excel utilities unused).
- Verified after override: Vitest 2 pass, Playwright 3 pass + 1 skipped (API sample), typecheck, lint, build.
- Open: write-time hook not installed (denied by classifier); CI job for e2e arrives in Story 2.7; no package-lock/CI pinning checks run beyond the security scan.
