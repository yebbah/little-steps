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
| vite-plugin-pwa | 2.0.0 (exact, dev) | installed, not configured yet (Epic 2) |

## Commands

```bash
npm ci          # install from package-lock.json
npm run dev     # dev server
npm run build   # typecheck (tsc -b) and production build into dist/
npm run lint    # oxlint
```
