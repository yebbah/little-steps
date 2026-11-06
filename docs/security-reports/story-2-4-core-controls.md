# Security report: Story 2.4, Core controls

| | |
|---|---|
| Story | 2.4, issue #38 |
| Branch | story/2-4 |
| Commit scanned | scan run on the working tree staged for the story commit, based on 2e0e2fd3c4ad1e5cceff16790de5d6789bd7ec57; the pre-commit hook scans the final commit again |
| Date | 2026-11-06 |
| Verdict | PASS |

## 1. Summary

The story adds frontend React components, CSS modules, catalog strings, gallery content and tests. No new dependency, no network call, no storage and no change to the backend, CI or images. The scan passes with no blocking finding.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above. Run twice (before the review fixes were final, and after them); both PASS with identical numbers.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 0 new (unchanged from main) |
| Frontend dependencies | 625 | PASS | 0 | 3 (unchanged from main) |
| Container images | 8 scanned (2 deferred in images.yaml) | PASS | 0 | unchanged from main |

### Warnings (below 7.0, not in KEV)

| Package | Version | CVE | CVSS | Fixed in | Decision |
|---|---|---|---|---|---|
| deepmerge | 4.3.1 | CVE-2026-93753 | 5.3 | none | pre-existing (playwright-utils, workbox); not from this story |
| glob | 11.1.0 | CVE-2026-118773 | 6.3 | 14.0.2 | pre-existing (vite-plugin-pwa via workbox); not from this story |
| minimatch | 10.2.6 | CVE-2026-118764 | 6.9 | 11.0.1 | pre-existing (same chain); not from this story |

## 3. Exceptions

The existing image exceptions in `security/exceptions.yaml` (55 findings, expiring 2026-12-04) are unchanged and not touched by this story.

## 4. Container images

No change. The gallery, and with it these controls' demo, is excluded from production bundles (build test in `src/build/gallery-bundle.test.ts` still passes); the controls themselves ship only when a screen imports them.

## 5. Supply chain

None. `package.json` and `package-lock.json` are unchanged. No GitHub Action changed.

## 6. Secrets and data handling

Secret scan clean. The controls hold values only in React state supplied by the caller; they store nothing, send nothing and log nothing. `TextField` sets no `autocomplete` or `inputmode`, so it does not influence what a browser or keyboard remembers. Gallery sample text is generic and contains no personal data. No `dangerouslySetInnerHTML`, no `eval`, and every visible string is rendered as text by React.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `cd frontend && npm test`, `npm run test:e2e` | 23 Vitest and 8 Playwright added |
| New negative tests | same | disabled press does nothing, over-limit entry not committed, negative and non-digit entries, no live region |
| Non-regression suite | `npm run lint`, `typecheck`, `lint:test`, `npm test`, `npm run test:e2e` | 83 Vitest passed, 26 Playwright passed (3 skipped, as before), lint and stylelint clean, 0 failed |

## 8. Review findings with security impact

Reviewed in the [triage log](../../.specs/implementation-artifacts/spec-2-4-core-controls.md). No finding touched secrets, data handling or dependencies. Three input-handling findings (decimal entry, "maximum" announcement, "+" from empty) are fixed with tests.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Succeeded above Tried can exist in a caller's state until it validates | A screen could save an inconsistent pair | Screens that use `PairedStepper` (Epic 8 and later) must validate on save |
| Flaky Story 2.1 gallery focus test (triage row 15) | A false red in CI | [#116](https://github.com/yebbah/little-steps/issues/116), target 2027-01-05 |

## 10. Sign-off

Validated by the maintainer on 2026-11-06.
