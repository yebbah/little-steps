# Security report: Story 2.5, Surfaces, feedback and labels

| | |
|---|---|
| Story | 2.5, issue #39 |
| Branch | feature/epic-02-issue-39-surfaces-feedback-and-labels |
| Commit scanned | scan run on the working tree staged for the story commit, based on d08dbda72e5773c28e73c4764a05e5663cd442f3; the pre-commit hook scans the final commit again |
| Date | 2026-11-07 |
| Verdict | PASS |

## 1. Summary

The story adds frontend components and one runtime dependency family, `@radix-ui/react-dialog` 1.3.1 (exact version) with its Radix helpers. No backend, image, workflow or data-handling change. The scan found no blocking finding.

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

The frontend component count went from 625 to 653 with the Radix packages; none of the 28 new components has a finding.

## 3. Exceptions

The existing image exceptions in `security/exceptions.yaml` (expiring 2026-12-04) are unchanged and not touched by this story.

## 4. Container images

No change. The surfaces ship only when a screen imports them; the gallery stays out of production bundles (build test `src/build/gallery-bundle.test.ts` passes).

## 5. Supply chain

`@radix-ui/react-dialog` 1.3.1 added to `frontend/package.json` as an exact version (no range) and recorded in `package-lock.json` with integrity hashes; it is the library the architecture names for modals (AD-23). Its install scripts: none ran (the install reported only the two existing blocked scripts, from playwright-utils and fsevents). No GitHub Action changed.

## 6. Secrets and data handling

Secret scan clean. The components hold only caller-supplied text in React state; they store nothing, send nothing and log nothing. The status line and banners render text through React (no `dangerouslySetInnerHTML`, no `eval`). Sheets add `inert` to other body children while open and remove it on close, so they do not touch page data. Gallery sample text is generic and holds no personal data.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `cd frontend && npm test`, `npm run test:e2e` | 31 Vitest and 7 Playwright added |
| New negative tests | same | second modal refused, line not cleared by a timer, Tab and modifier keys do not clear, empty text ignored |
| Non-regression suite | `npm run lint`, `typecheck`, `lint:test`, `npm test`, `npm run test:e2e`, `npm run build` | 246 Vitest passed, 40 Playwright passed (1 skipped, as before), lint and stylelint clean, build ok, 0 failed |

## 8. Review findings with security impact

Reviewed in the [triage log](../../.specs/implementation-artifacts/spec-2-5-surfaces-feedback-and-labels.md). One finding left the whole page inert with no modal on screen (a sheet handing off to a dialog); it is fixed with a test. No finding touched secrets, dependencies or data handling.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Status line and programmatic navigation | A line could stay on a screen after a redirect | [#127](https://github.com/yebbah/little-steps/issues/127), target 2027-01-06 |

## 10. Sign-off

Validated by the maintainer on 2026-11-07. Merged as `99d31ab`.
