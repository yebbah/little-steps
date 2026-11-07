# Security report: Story 2.9, Settings shell and theme choice

| | |
|---|---|
| Story | 2.5, issue #39 |
| Branch | feature/epic-02-issue-104-settings-shell-and-theme-choice |
| Commit scanned | scan run on the working tree staged for the story commit, based on b3ac470038ccf2cbc057c1fc169c5190fdc6f2f5; the pre-commit hook scans the final commit again |
| Date | 2026-11-07 |
| Verdict | PASS |

## 1. Summary

The story adds a Settings screen with a theme choice and an install row. It adds no dependency, no backend, image or workflow change and no new storage key. The scan found no blocking finding.

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

None. `package.json` and `package-lock.json` are unchanged. No GitHub Action changed.

## 6. Secrets and data handling

Secret scan clean. The theme choice is stored in the existing `littlesteps.theme` key (`light` or `dark`, nothing for System); an invalid stored value is read as System. No personal data is stored or sent. All text is rendered by React.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `cd frontend && npm test`, `npm run test:e2e` | 15 Vitest and 8 Playwright added |
| New negative tests | same | invalid or blocked storage, a repeated choice, "already installed", no Reminders or Privacy |
| Non-regression suite | `npm run lint`, `typecheck`, `lint:test`, `npm test`, `npm run test:e2e`, `npm run build` | 291 Vitest passed, 47 Playwright passed (1 skipped, as before), lint and stylelint clean, build ok, 0 failed |

## 8. Review findings with security impact

Reviewed in the [triage log](../../.specs/implementation-artifacts/spec-2-9-settings-shell-and-theme-choice.md). No finding touched secrets, dependencies or data handling.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Theme change in another tab not followed | Two tabs can show different themes | [#132](https://github.com/yebbah/little-steps/issues/132), target 2027-01-06 |

## 10. Sign-off

Written for the maintainer's validation; pending.
