# Security report: Story 2.8, PWA shell and install offer

| | |
|---|---|
| Story | 2.5, issue #39 |
| Branch | feature/epic-02-issue-42-pwa-shell-and-install-offer |
| Commit scanned | scan run on the working tree staged for the story commit, based on 99d31abc25c5e7c2e5fac584209a39ab8a32f930; the pre-commit hook scans the final commit again |
| Date | 2026-11-07 |
| Verdict | PASS |

## 1. Summary

The story adds the web app manifest, a service worker and the install offer. It adds no dependency (`vite-plugin-pwa` and Workbox were already in the lockfile) and no backend, image or workflow change. The scan found no blocking finding.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 0 new (unchanged from main) |
| Frontend dependencies | 653 | PASS | 0 | 3 (unchanged from main) |
| Container images | 8 scanned (2 deferred in images.yaml) | PASS | 0 | unchanged from main |

### Warnings (below 7.0, not in KEV)

| Package | Version | CVE | CVSS | Fixed in | Decision |
|---|---|---|---|---|---|
| deepmerge | 4.3.1 | CVE-2026-93753 | 5.3 | none | pre-existing (playwright-utils, workbox); not from this story |
| glob | 11.1.0 | CVE-2026-118773 | 6.3 | 14.0.2 | pre-existing (vite-plugin-pwa via workbox); not from this story |
| minimatch | 10.2.6 | CVE-2026-118764 | 6.9 | 11.0.1 | pre-existing (same chain); not from this story |

The frontend component count is unchanged from main (653).

## 3. Exceptions

The existing image exceptions in `security/exceptions.yaml` (expiring 2026-12-04) are unchanged and not touched by this story.

## 4. Container images

No change.

## 5. Supply chain

None: `package.json` gains only an `icons` script, and `package-lock.json` is unchanged. The icon script uses the Playwright Chromium already in the dev dependencies and is run by hand. No GitHub Action changed.

**Service worker (AD-23).** It precaches the built shell (HTML, scripts, styles, icons, manifest) and registers no runtime caching, so no API response, token or child data is stored in the browser cache by the worker. API and actuator paths never fall back to the shell page. A build test (`src/build/pwa-build.test.ts`) reads the real worker and fails if a caching strategy appears, and a real-browser check confirmed the cache holds no `/api` entry.

## 6. Secrets and data handling

Secret scan clean. The install offer stores three small flags in `localStorage` (declined, installed, visit count) and one in `sessionStorage`; none holds personal data. Nothing is sent anywhere. The worker script is served from the app's own origin.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `cd frontend && npm test` | 30 Vitest added |
| New negative tests | same | no offer on the first visit, after "Not now", when installed, behind another modal; no runtime caching in the built worker |
| Non-regression suite | `npm run lint`, `typecheck`, `lint:test`, `npm test`, `npm run test:e2e`, `npm run build` | 276 Vitest passed, 40 Playwright passed (1 skipped, as before), lint and stylelint clean, build ok, 0 failed |

## 8. Review findings with security impact

Reviewed in the [triage log](../../.specs/implementation-artifacts/spec-2-8-pwa-shell-and-install-offer.md). No finding touched secrets or data handling. Two touch the worker: server-handled routes must stay out of the shell fallback and `sw.js` should be served uncached ([#129](https://github.com/yebbah/little-steps/issues/129)), and a resumed app should check for a new version ([#130](https://github.com/yebbah/little-steps/issues/130)).

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Shell fallback and cache headers | A future server route could be answered with the shell page | [#129](https://github.com/yebbah/little-steps/issues/129), target 2027-01-06 |
| No update check on resume | An installed app can keep an old shell for a long time | [#130](https://github.com/yebbah/little-steps/issues/130), target 2027-01-06 |

## 10. Sign-off

Written for the maintainer's validation; pending.
