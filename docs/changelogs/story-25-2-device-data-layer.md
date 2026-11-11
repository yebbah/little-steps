# Changelog: Story 25.2, Device data layer

| | |
|---|---|
| Story | 25.2, issue #180 |
| Epic | 25, Demo Family and domain foundations |
| Branch | feature/epic-25-issue-180-device-data-layer |
| Commits | the Story 25.2 commit on the branch (baseline ed64cf9); the hash is in the pull request |
| Date | 2026-11-09 |
| Security report | [story-25-2-device-data-layer.md](../security-reports/story-25-2-device-data-layer.md) |

## Summary

The frontend now has one way to read and one way to save. Reads use TanStack Query; every write is stored on the device first in an outbox (Dexie), owned by the session `sub` that made it, and replayed in order. Drafts survive leaving a page, and a change of `sub` wipes the stored data before anything is shown.

## Added

- `frontend/src/data/`: Dexie database `littlesteps` (`outbox`, `drafts`, `meta`, and an empty `snapshot` table for Epic 10), `outbox.enqueue`, undo, Retry, FIFO replay with backoff, `useDraft`, the `session` port with a demo implementation, the ownership check and wipe, and the Query client and provider.
- An oxlint rule that fails `fetch` outside `src/data/http.ts`, with fixtures in `scripts/lint-rules.test.sh`.
- Test-profile-only `PUT /api/v1/dev/echo/{id}` (hidden from `openapi.json`), and an optional `API_URL` Playwright sample.
- Dependencies: `@tanstack/react-query` 5.105.0, `dexie` 4.4.7, `fake-indexeddb` 6.2.6 (dev).

## Changed

- `App.tsx` wraps the app in `QueryClientProvider` and starts the data layer.
- A new `frontend/src/data/store.ts` shares the external-store shape used by `pwa/update.ts`.

## Fixed

Problems found in review, all fixed in this story: a cold offline start refused saves; a replay racing a coalescing edit could lose the newer edit; two tabs could send a command twice; 408 and 429 were parked instead of retried; `undo` did not check the owner; the last half second of typing was lost when a tab was hidden or closed; `window.fetch`, `globalThis.fetch` and `self.fetch` bypassed the lint ban; a concurrent replay of the echo `PUT` got 409.

## Removed or deprecated

None.

## Security

No finding. The scan passes with the same three frontend warnings. See the [security report](../security-reports/story-25-2-device-data-layer.md).

## Operations impact

| Area | What changes (README is reviewed every story; write "reviewed, no change" if untouched) | README section |
|---|---|---|
| Setup | Three new npm dependencies; run `npm ci` in `frontend/` | n/a |
| Development | Writes only through the outbox; `fetch` (also `window.`, `globalThis.` and `self.`) only in `src/data/http.ts` (lint). Echo endpoint in profile `test` | Device data layer |
| Release | No change | n/a |
| Deployment | No change | n/a |

## After you pull

`cd frontend && npm ci`.

## Tests

Frontend: unit tests for every matrix row (enqueue offline, order, coalesce, undo, ownership, session change, 401, parking and Retry, 5xx and network error, draft), the HTTP classification and the demo session; `npm run lint`, `lint:test` (38 fixtures), `typecheck`, `test:coverage` (388 tests; statements 96.2%, branches 91.7%, functions 93.3%, lines 97.5%) and `build` pass. Backend: `DevEchoTests` (store, replay no-op, other Family 409, hidden from OpenAPI, not a bean in `local` or `prod`) and `DevEchoControllerTests` (a replay race returns the stored body); `./mvnw verify` passes (103 tests, 0 failures, 0 skipped). `deploy/security-scan.sh` PASS.

## Deferred and known issues

- The Caregiver switcher and "Demo data" label are Story 25.5; re-sign-in after a 401 is Story 3.2; the Keycloak session is Story 3.1.
- #186: the frontend write contract is not checked against a real backend in CI (target 2027-01-08).
- The independent review pass ran: 23 findings, 12 fixed, 1 deferred, 10 rejected with evidence (triage log in the story spec).
