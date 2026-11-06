# Security report: Story 2.2, Domain tints and icons

| | |
|---|---|
| Story | 2.2, issue #36 |
| Branch | feature/epic-02-issue-36-domain-tints-and-icons |
| Commit scanned | 2e0e2fd3c4ad1e5cceff16790de5d6789bd7ec57 plus the staged story changes (scan run on 2026-11-06 over the staged tree; the pre-commit hook scans the commit again) |
| Date | 2026-11-06 |
| Verdict | PASS |

## 1. Summary

The story adds pure TypeScript, React components, inline SVG and CSS. No new dependency, network call or stored data. The scan passes with no blocking findings.

## 2. Scan result

Scan tool versions: Grype 0.121.2, Syft 1.57.0, gitleaks 8.30.1. Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 4 (mariadb-java-client, unchanged) |
| Frontend dependencies | 625 | PASS | 0 | 3 (deepmerge, glob, minimatch, unchanged) |
| Container images | see summary | PASS | 0 | unchanged from main |

### Warnings (below 7.0, not in KEV)

| Package | Version | CVE | CVSS | Fixed in | Decision |
|---|---|---|---|---|---|
| deepmerge | 4.3.1 | CVE-2026-93753 | 5.3 | none | unchanged, dev tooling |
| glob | 11.1.0 | CVE-2026-118773 | 6.3 | 14.0.2 | unchanged, dev tooling |
| minimatch | 10.2.6 | CVE-2026-118764 | 6.9 | 11.0.1 | unchanged, dev tooling |

## 3. Exceptions

The active entries in `security/exceptions.yaml` are the base-image exceptions to 2026-12-04, unchanged by this story.

## 4. Container images

No change.

## 5. Supply chain

None. No dependency, tool or GitHub Action added or changed; no icon library (icons are hand-drawn inline SVG).

## 6. Secrets and data handling

Secret scan clean. Domain text is rendered as a React text child (escaped), never as HTML; the tint is chosen from a fixed family list, so user text never reaches a style value. Nothing is stored, logged or sent.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive tests | `npm test`, `npm run test:e2e` | 15 Vitest and 2 Playwright added, all passed |
| New negative tests | `npm test` | unmatched, whole-word, blank and banned-name cases pass |
| Non-regression suite | `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e` | 75 Vitest passed, 19 Playwright passed (3 skipped), 0 failed |

## 8. Review findings with security impact

None touched security. The [triage log](../../.specs/implementation-artifacts/spec-2-2-domain-tints-and-icons.md) records all 19 findings.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Playwright not in CI yet | Visual regressions in tints and tiles are caught locally only | Story 2.7 |

## 10. Sign-off

Validated by the maintainer on 2026-11-06.
