# LittleSteps frontend

React + TypeScript + Vite app that becomes the LittleSteps PWA.

## Origin

Scaffolded with `npm create vite@latest frontend -- --template react-ts`, using **create-vite 9.3.4**.

## Pinned versions

| Package | Version | Notes |
|---------|---------|-------|
| Node | 24 (`.nvmrc`, `engines.node` `>=24 <25`) | |
| react, react-dom | 19.3.1 (exact) | |
| typescript | ~7.0.2 | as generated |
| vite | ^8 | as generated |
| stylelint | ^18 (dev) | CSS rules for flat design and focus (`.stylelintrc.json`) |
| vite-plugin-pwa | 2.0.0 (exact, dev) | installed, not configured yet (Epic 2) |
| @playwright/test, @axe-core/playwright, @seontechnologies/playwright-utils | caret ranges (dev) | end-to-end and accessibility tests (`e2e/`). `overrides` pins `uuid` to ^11.1.1 because playwright-utils pulls in exceljs with 8.3.2, which the security scan blocks |
| @testing-library/*, jsdom | caret ranges (dev) | component tests |

## Commands

```bash
npm ci          # install from package-lock.json
npm run dev     # dev server
npm run build   # typecheck (tsc -b) and production build into dist/
npm run lint    # oxlint and stylelint
npm run lint:test  # tests for the lint rules
npm test        # Vitest (unit and component, Testing Library with jsdom)
npm run test:e2e   # Playwright and axe; see e2e/README.md
```

## Source layout

- `src/ui/`: shared controls (`Button`, `TextField`, `ChoiceChips`, `Stepper`, `DisclosureRow`), one CSS module each, tests beside them. Import from `src/ui/index.ts`.
- `src/gallery/`: the dev-only gallery at `/dev/gallery`; its sample text lives in `strings.ts`, not in the product catalog.
- `src/i18n/`: the message catalog and tone check. `src/styles/`: tokens, base styles and theme.
