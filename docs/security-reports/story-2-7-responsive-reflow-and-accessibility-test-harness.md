# Security report: Story 2.7, Responsive reflow and accessibility test harness

| | |
|---|---|
| Story | 2.5, issue #39 |
| Branch | feature/epic-02-issue-41-responsive-reflow-and-accessibility-test-harness |
| Commit scanned | scan run on the working tree staged for the story commit, based on 5db79516fd9f22d5029140dd8c7d0d975df6498d; the pre-commit hook scans the final commit again |
| Date | 2026-11-07 |
| Verdict | PASS |

## 1. Summary

The story adds layout rules, accessibility tests and one CI job. It adds no dependency and no backend or image change. The scan found no blocking finding.

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

No new dependency: `package.json` and `package-lock.json` are unchanged. The new CI job "Frontend: accessibility" uses the same three actions as the existing Frontend job (`actions/checkout`, `actions/setup-node`, `actions/upload-artifact`), each pinned to the same full commit SHA with its version in a comment; `deploy/check-actions.sh` passes (14 references, all pinned). The job downloads Chromium with `playwright install --with-deps chromium` from Playwright's own CDN, and the job's token has the default read-only permissions and no secrets.

## 6. Secrets and data handling

Secret scan clean. The tests use only generic sample text; no personal data. The uploaded Playwright report and traces contain only the test pages.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `cd frontend && npm test`, `npm run test:e2e` | 10 Vitest and 38 Playwright added |
| New negative tests | same | a fixed height on a text box, a clipped label, a footer that should stack, a nav that should unpin |
| Non-regression suite | `npm run lint`, `typecheck`, `lint:test`, `npm test`, `npm run test:e2e`, `npm run build` | 301 Vitest passed, 86 Playwright passed (1 skipped, as before), lint and stylelint clean, build ok, 0 failed |

## 8. Review findings with security impact

Reviewed in the [triage log](../../.specs/implementation-artifacts/spec-2-7-responsive-reflow-and-accessibility-test-harness.md). No finding touched secrets, dependencies or data handling.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Accessibility checks run on Chromium and the dev server only | A WebKit or Firefox-only problem is found later | [#134](https://github.com/yebbah/little-steps/issues/134), target 2027-01-06 |
| "Frontend: accessibility" is not yet a required check | A pull request could merge with it red | Repository owner: add it under Settings, Branches |

## 10. Sign-off

Written for the maintainer's validation; pending.
