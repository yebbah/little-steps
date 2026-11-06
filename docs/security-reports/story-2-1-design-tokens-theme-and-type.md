# Security report: Story 2.1, Design tokens, theme and type

| | |
|---|---|
| Story | 2.1, issue #35 |
| Branch | story/2-1 |
| Commit scanned | c606a6bc44b07de6fe77998a0e07087ca49f9315 (scan run by the pre-commit hook on this commit's staged changes; the earlier scan ran on 3b727d7) |
| Date | 2026-11-06 |
| Verdict | PASS |

## 1. Summary

The story adds CSS, a small theme module, an inline script, a dev-only gallery and stylelint as a dev dependency. No new runtime dependency, no network call, no stored data beyond a Light / Dark preference. The scan passes with no blocking findings.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 4 (mariadb-java-client, unchanged) |
| Frontend dependencies | 625 | PASS | 0 | 3 |
| Container images | see summary | PASS | 0 | unchanged from main |

### Warnings (below 7.0, not in KEV)

| Package | Version | CVE | CVSS | Fixed in | Decision |
|---|---|---|---|---|---|
| deepmerge | 4.3.1 | CVE-2026-93753 | 5.3 | none | pre-existing (playwright-utils, workbox); not from this story |
| glob | 11.1.0 | CVE-2026-118773 | 6.3 | 14.0.2 | pre-existing (vite-plugin-pwa via workbox); not from this story |
| minimatch | 10.2.6 | CVE-2026-118764 | 6.9 | 11.0.1 | pre-existing (same chain); not from this story |

`npm ls` shows stylelint adds none of these.

## 3. Exceptions

The existing image exceptions in `security/exceptions.yaml` (expiring 2026-12-04) are unchanged.

## 4. Container images

No change. The app image build runs `npm run build` in production mode, which excludes the gallery.

## 5. Supply chain

New dev dependency: stylelint ^18 (lockfile pinned, scanned in the frontend SBOM). No new GitHub Action; the CI change adds a `run` step only. Playwright Chromium was installed locally for tests, not in the repository.

## 6. Secrets and data handling

Secret scan clean. The only stored value is `littlesteps.theme` (`light` or `dark`) in localStorage, validated against an allow-list before it reaches `setAttribute`; storage errors are caught. The inline script has no user data. No CSP exists yet; when one is added, the inline script needs a hash or nonce. The gallery and its text are excluded from production bundles (build tests for production and staging).

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `npm test`, `npx playwright test` | 33 Vitest (incl. 2 un-skipped) and 14 Playwright added |
| New negative tests | `npm run lint:test`, bundle tests | 19 stylelint cases (10 reject), production and staging bundles have no gallery |
| Non-regression suite | `npm run lint`, `typecheck`, `build`, `npm test`, `npx playwright test` | 35 Vitest and 17 Playwright passed, 0 failed |

## 8. Review findings with security impact

Reviewed in the [triage log](../../.specs/implementation-artifacts/spec-2-1-design-tokens-theme-and-type.md): gallery inclusion in non-production modes (row 2) and the stylelint bypasses (row 1) are fixed. No finding touched secrets or data.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Inline script and a future CSP | A strict CSP would block it | Story that adds a CSP (hash or nonce) |
| Deferred checks | Contrast of image focus ring, WebKit root font | #111, #112 |

## 10. Sign-off

Validated by the maintainer on 2026-11-06.
