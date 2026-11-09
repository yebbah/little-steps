# Security report: Story 25.2, Device data layer

| | |
|---|---|
| Story | 25.2, issue #180 |
| Branch | feature/epic-25-issue-180-device-data-layer |
| Commit scanned | the Story 25.2 commit (the pre-commit hook scans it); baseline ed64cf90f47d45abf96ca06fcf43a72c5bc6dde0 |
| Date | 2026-11-09 |
| Verdict | PASS WITH WARNINGS |

## 1. Summary

Adds the frontend data layer and a test-profile-only endpoint. Three dependencies were added. The full scan passes (`RESULT: PASS`): secrets clean, backend 178 and frontend 657 components with no blocking finding, and the same three frontend warnings as before (deepmerge, glob, minimatch; the other glob and minimatch lines come from image scans and are unchanged). A three-reviewer pass found 23 items; 12 were fixed, 1 deferred (#186) and 10 rejected with evidence.

## 2. Scan result

Blocking rule: CVE in CISA KEV, or CVSS 7.0 or above.

| Target | Components | Result | Blocking | Warnings |
|---|---|---|---|---|
| Staged secrets (gitleaks) | n/a | PASS | 0 | 0 |
| Backend dependencies | 178 | PASS | 0 | 0 |
| Frontend dependencies | 657 | PASS | 0 | 3 (unchanged: deepmerge, glob, minimatch) |
| Container images | unchanged | PASS | 0 | unchanged |

## 3. Exceptions

No change. Existing image exceptions expire 2026-12-04.

## 4. Container images

No change.

## 5. Supply chain

`@tanstack/react-query` 5.105.0 (published 2026-10-26), `dexie` 4.4.7 (2026-10-19), `fake-indexeddb` 6.2.6 (2026-10-16, dev only), pinned exactly and at least two weeks old.

## 6. Secrets and data handling

Secret scan clean. Commands, drafts and the owning `sub` are stored in the browser's IndexedDB; they are wiped when the session reports a different `sub`, before anything is shown or replayed, and a command is replayed only under the `sub` that made it. The service worker caches no API response. The echo endpoint is not a bean outside profile `test`, is hidden from `openapi.json`, and stores under the Caregiver's Family only. Stored `sub` values are not logged. Data left in IndexedDB while nobody is signed in (a 401) is kept by design; the wipe happens on the next different `sub`.

## 7. Tests

| Kind | Command | Result |
|---|---|---|
| New positive and negative tests | `cd frontend && npm run test:coverage` | 388 passed; statements 96.2%, branches 91.7%, functions 93.3%, lines 97.5% |
| Lint ban fixtures | `cd frontend && npm run lint:test` | 38 passed, 0 failed |
| Backend echo tests and non-regression | `cd backend && ./mvnw verify` | 103 tests, 0 failed, 0 skipped |

## 8. Review findings with security impact

Three independent reviewers (blind, edge, verification gap) ran on the diff. Findings with security weight, all fixed: a cold offline start refused saves (the last known `sub` is now kept for a network failure only, and a 401 forgets it); a replay racing a coalescing edit could send a stale body and delete the newer edit; two tabs could drain the same queue; `undo` did not check the owner; the `fetch` ban missed `window.fetch`, `globalThis.fetch` and `self.fetch`. The full log is in the story spec's Review Triage Log.

## 9. Residual risks and follow-ups

| Item | Risk | Owner (story) |
|---|---|---|
| Another aliasing of `fetch` (for example `const f = window['fetch']`) | A direct write could bypass the outbox | accepted; code review |
| The frontend write contract is not checked against a real backend in CI | The two could drift | #186 (target 2027-01-08) |
| Previous Caregiver's data stays in IndexedDB after sign-out until a different `sub` signs in | Shared device exposure | Story 3.2 and the sign-out story |

## 10. Sign-off

Pending the maintainer's validation.
