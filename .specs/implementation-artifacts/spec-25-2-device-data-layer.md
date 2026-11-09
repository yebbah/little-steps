---
title: 'Story 25.2: Device data layer'
type: 'feature'
created: '2026-11-09'
status: 'in-review'
baseline_commit: 'ed64cf90f47d45abf96ca06fcf43a72c5bc6dde0'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.specs/planning-artifacts/epics/epic-25-demo-family-foundations.md'
  - '{project-root}/.specs/implementation-artifacts/epic-25-context.md'
  - '{project-root}/.specs/implementation-artifacts/spec-25-1-demo-identity-and-the-tenant-resolver.md'
---

<frozen-after-approval reason="human-owned intent, do not modify unless human renegotiates">

## Intent

**Problem:** The frontend has no way to read server data or to save anything. Every later screen would invent its own fetching and offline handling, and a weak connection or a session change could lose or misattribute a Caregiver's work.

**Approach:** One data layer, as AD-5 and AD-23 set it: TanStack Query for reads, and one Dexie database holding the outbox and drafts. Every write is queued on the device first, owned by the `sub` that made it, and replayed in order. A `session` port supplies the current `sub`. A test-profile-only echo endpoint lets the outbox be exercised against the real backend.

## Boundaries & Constraints

**Always:**
- New dependencies: `@tanstack/react-query` and `dexie` (runtime, pinned exactly like the existing runtime dependencies), `fake-indexeddb` (dev, for tests). Each at the newest version published on or before 2026-10-26, so it is at least two weeks old. The security scan must stay clean.
- One Dexie database (`littlesteps`) with an `outbox` table and a `drafts` table. Leave room for the offline snapshot (Epic 10) without migrating existing data.
- `outbox.enqueue(command)` writes to Dexie before any network call and returns without waiting for the network. A command holds an ID, the method and path (`PUT` creates per AD-4, later edits), the target ID, the body, the enqueuing `sub`, the creation time, the attempt count and a status (`pending`, `parked`).
- Replay is FIFO per `sub`, only under the `sub` that enqueued the command, with exponential backoff and a cap. An unsent command for the same target replaces the earlier body (coalescing, keeping its queue position). Undoing an unsent command removes it.
- Outcomes: `2xx` removes the command. `401` pauses replay and keeps the whole queue (Story 3.2 adds signing in again in place). Any other `4xx` parks the command with its problem type, and the record shows the catalog line "Couldn't save just now… Retry". Retry moves it back to `pending`. A network error or `5xx` backs off and retries. The local data is never dropped.
- `useDraft(key)` autosaves form state to Dexie on change (debounced) and restores it on return. A draft is cleared on an explicit discard or after its command is enqueued.
- The `session` port exposes the current `sub` (or none) and change notifications. A small demo implementation reads `GET /api/v1/session` and sends `X-Demo-Caregiver` when one is chosen. Story 25.5 adds the switcher UI, and Story 3.1 replaces the demo implementation. When the port reports a `sub` different from the one that owns the stored data, the outbox and drafts are wiped before any of them is shown or replayed.
- Server data is never mirrored into a global store. The Query cache is cleared on a `sub` change.
- Lint: oxlint bans the global `fetch` everywhere in `src/` except the data layer's HTTP module, which reads (`GET`) for TanStack Query and writes only for the outbox. `scripts/lint-rules.test.sh` gets a fixture proving the ban, and `npm run lint:test` passes.
- Backend: `PUT /api/v1/dev/echo/{id}` exists only in profile `test`. It stores the body under the Caregiver's Family (a `@TenantId` table created by the test-only Flyway location from Story 25.1) and returns it. Replaying the same `PUT` is a no-op that returns the stored body (AD-4). It is not a bean in `local` or `prod`, and it is hidden from `openapi.json`.
- All user-facing text comes from the message catalog. Coverage stays at or above 80%.

**Never:**
- No Keycloak, sign-in redirect or re-sign-in in place (Story 3.2). No switcher UI or "Demo data" label (Story 25.5). No feature screen and no real write endpoint.
- No caching of API responses by the service worker (AD-23). No second linter.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Enqueue offline | network down | command stored, `enqueue` resolves at once, replays when online | backoff while down |
| Order | three commands A, B, C | sent A, B, C | n/a |
| Coalesce | two unsent edits to one target | one command with the latest body, first position | n/a |
| Undo | unsent command removed | never sent | n/a |
| Ownership | queue from `sub` X, session is Y | X's commands are not sent | n/a |
| Session change | port switches from X to Y | outbox, drafts and Query cache wiped before anything shows | n/a |
| 401 | server answers 401 | replay pauses, queue kept | resumes on a new session signal |
| Other 4xx | 409 or 422 | command parked with problem type; Retry re-queues it | local data kept |
| 5xx / network error | 503 or fetch rejects | retried with backoff | n/a |
| Draft | form edited, page left, page reopened | values restored | storage blocked: works for the visit |
| Echo replay | same `PUT` twice | second call returns the stored body, one row | n/a |
| Echo outside test | profile `local` or `prod` | not registered | 404 |

</frozen-after-approval>

## Code Map

- `frontend/src/data/` -- new neutral module (no `shell` or `surfaces` imports, AD-28): `db.ts` (Dexie), `outbox.ts`, `http.ts` (the only `fetch`), `queryClient.ts`, `useDraft.ts`, `session.ts` (port and demo implementation).
- `frontend/src/App.tsx` -- wrap the app in `QueryClientProvider`; start replay.
- `frontend/src/pwa/update.ts` -- model for a small external store with `useSyncExternalStore` (the epic-2 retro noted three copies; reuse the shape, do not add a fourth ad-hoc one if a shared helper fits).
- `frontend/src/i18n/messages.ts` -- reuse `error.saveRejected` ("Couldn't save just now. Your review is kept — try again.", Story 2.11) and the existing Retry action label; add no new copy for the parked state.
- `frontend/.oxlintrc.json`, `frontend/scripts/lint-rules.test.sh` -- the `fetch` ban and its fixture.
- `frontend/src/api/schema.d.ts` -- types for `GET /api/v1/session` (from Story 25.1).
- `backend/src/main/java/app/littlesteps/shared/web/` or a test-profile controller -- the echo endpoint; Story 25.1's `tenantprobe` (in `src/test`) and `CaregiverFilter` show the test-only and tenancy patterns.
- `frontend/e2e/tests/api.health.spec.ts` -- the optional `API_URL` sample pattern.

## Tasks & Acceptance

**Execution:**
- [ ] Dependencies, Dexie database, `http.ts`, Query client and provider
- [ ] `outbox.ts`: enqueue, coalesce, undo, FIFO replay per `sub`, backoff, 401 pause, park and Retry
- [ ] `session.ts` port with the demo implementation, and the wipe on `sub` change
- [ ] `useDraft`
- [ ] oxlint `fetch` ban and lint fixture
- [ ] Backend echo endpoint (test profile only) with tests for replay and absence in `local` and `prod`
- [ ] Unit tests for every matrix row (`fake-indexeddb`); an optional `API_URL` Playwright sample that enqueues against the echo endpoint
- [ ] README and CONTRIBUTING lines (data layer rule: writes only through the outbox); changelog, security report, sprint status

**Acceptance Criteria:** the Story 25.2 acceptance criteria in the epic file.

## Implementation Notes

- Frontend: `frontend/src/data/` (`db`, `http`, `store`, `session`, `lifecycle`, `outbox`, `useDraft`, `runtime`, `queryClient`, `index`). `lifecycle.ts` is the ownership check and wipe; `runtime.ts` builds the singletons; `App.tsx` starts them. `fake-indexeddb/auto` is loaded in `src/test/setup.ts`.
- Dexie holds `outbox`, `drafts`, `meta` (the owner `sub`) and an empty `snapshot` table reserved for Epic 10.
- Coalescing merges only a pending, not-in-flight command of the same `sub`, target and method. A parked command does not block those behind it.
- Backend: the echo endpoint is test-only code under `src/test` (`devecho` package, `@Profile("test")`, `@Hidden`), with a `dev_echo` table in the test Flyway location. An id used by another Family is a 409.
- The oxlint ban is `no-restricted-globals` on `fetch` plus `no-restricted-properties` on `window.fetch`, `globalThis.fetch` and `self.fetch`, off only for `src/data/http.ts`.
- The Playwright sample exercises the echo endpoint's replay contract over HTTP, not the outbox in the browser.
- Review fixes (2026-11-09): the demo session keeps the last known `sub` (localStorage, `littlesteps.lastSub`) for a network failure; `pass()` sets `inFlight` then re-reads the row before sending; replay runs inside a `navigator.locks` lock; 408 and 429 retry; `undo` checks the owner; `useDraft` flushes on `pagehide` and `visibilitychange`; the echo endpoint re-reads on a replay race. Verification after review: frontend 388 tests (coverage about 96%), backend 103 tests, scan PASS.
- Dependencies: `@tanstack/react-query` 5.105.0 (2026-10-26), `dexie` 4.4.7 (2026-10-19), `fake-indexeddb` 6.2.6 (2026-10-16).

## Spec Change Log

- 2026-11-09, planning: the epic said "an ESLint rule"; the repo's linter is oxlint (AD-23), as in Epic 1. The epic file, the epic context and issue #180 now say "a lint rule (oxlint)". No behaviour change.

## Review Triage Log

Reviewers: BH blind, EC edge, VG verification gap (three separate subagents). The review diff left out the spec, sprint status and `package-lock.json`.

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | A cold start while offline reads as signed out: the session read fails with a network error and publishes `sub: null`, so `enqueue` throws and the offline-first guarantee fails [EC, VG] | high | patch, fixed | `session.ts` keeps and persists the last known `sub` for a network failure (not a 401 or other HTTP error); tests |
| 2 | `pass()` reads a command, then a coalescing edit or undo commits before `inFlight` is set: a stale body is sent and the delete then removes the merged newer edit [EC] | medium | patch, fixed | set `inFlight` first, then re-read the row and send that; tests |
| 3 | Two tabs run the outbox against the same Dexie queue and may send a command twice [EC] | medium | patch, fixed | one drainer across tabs with `navigator.locks` where available; test |
| 4 | 408 and 429 are parked instead of retried [EC] | low | patch, fixed | `http.ts` classifies them as retry; test |
| 5 | `undo` does not check the `sub` that owns the command [BH] | low | patch, fixed | `undo` filters on the current `sub`, like `retry`; test |
| 6 | The last 500 ms of typing is lost when the tab is hidden or closed without a React unmount [EC] | medium | patch, fixed | `useDraft` flushes on `pagehide` and `visibilitychange`; test |
| 7 | No test starts the real wiring (`startDataLayer`, `outbox.start`, `session.refresh`): deleting the `App.tsx` effect keeps every test green [VG] | medium | patch, fixed | new test asserts `/api/v1/session` is requested, a stored command replays, and a foreign owner is wiped |
| 8 | A concurrent replay of the same echo `PUT` gets 409, which would park a good command [EC] | low | patch, fixed | echo endpoint re-reads the row on a violation and returns it; test |
| 9 | The Playwright echo sample skips itself when the endpoint errors, and never runs in CI [VG, BH] | medium | patch, fixed | skips only on 404, fails on any other error; wiring it into CI is #7 below |
| 10 | The `fetch` ban misses `window.fetch`, `globalThis.fetch` and `self.fetch` [EC, VG, BH] | medium | patch, fixed | extend the oxlint rule if oxlint can express it, with fixtures; otherwise report and defer |
| 11 | README restates data-layer rules that CONTRIBUTING owns [BH] | low | patch, fixed | README links to CONTRIBUTING |
| 12 | Records inconsistent or incomplete (verdict wording, "no review yet", coverage figure, commit and sign-off placeholders) [BH] | low | patch, fixed | records finished after the fixes, in the finishing step |
| 13 | The frontend sends the write contract to a real backend nowhere in CI, so the two could drift [VG] | medium | defer #186 | the backend side is covered by `DevEchoTests`; wire `API_URL` and a test-profile backend into the nightly e2e |
| 14 | A command that always gets 5xx holds back every later command [EC] | low | rejected | the spec says a 5xx backs off and retries; parking after N tries is a policy choice for the first screen that shows the queue |
| 15 | `getJson` does not handle 204, an empty body or non-JSON [EC] | low | rejected | its one caller returns JSON; any failure is an error to Query either way |
| 16 | After a 401 the Query cache is not cleared [EC] | low | rejected | a 401 is not a sign-out, and the same `sub` signing in again keeps its cache; sign-out wipes in Story 3.1 |
| 17 | Rows exist but the owner row is missing, so a different `sub` does not wipe them [EC] | low | rejected | the outbox and drafts read only rows with the current `sub`, so nothing foreign is shown or replayed |
| 18 | A parked command is retried after a newer edit to the same target and overwrites it [EC] | low | rejected | Retry keeps the command's original `seq`, so it replays before the newer one and the final state is the newer |
| 19 | `startDataLayer` cleanup under StrictMode leaves waiters pending [EC, BH] | low | rejected | the waiters belong to effects that StrictMode also cleans up, and the remount starts a new lifecycle |
| 20 | Parked-state copy "Your review is kept" is review-specific [BH] | low | rejected | the spec says to reuse `error.saveRejected`; no screen renders the parked state yet |
| 21 | The echo body is unvalidated and unbounded, the 409 is not a problem response, and `ApplicationContextRunner` is vacuous [BH, VG] | low | rejected | test-only code; the global handler turns `ResponseStatusException` into a problem; the runner test fails without `@Profile("test")` because the repository bean is missing |
| 22 | The context rewrite drops FR, AD and UX tags, and PATCH and DELETE replays are not idempotent [BH] | low | rejected | the context is a compiled aid and the requirement lists stay in the epic file; only `PUT` creates exist |
| 23 | Missing tests for a Dexie upgrade, a changelog "above 80%" claim without a figure, `window.fetch` limitation not in CONTRIBUTING, Release row [BH] | low | rejected | version 1 is the first schema; the figure is added in the records; the limitation is fixed in #10 |

## Design Notes

The lint rule bans every direct `fetch` outside `src/data/http.ts`, which is stricter than "no non-GET `fetch`" and simpler to enforce with oxlint's restricted globals. Reads still go through TanStack Query, with `http.ts` as the query function.

The end-to-end check against the real backend is an optional Playwright sample run with `API_URL` (like `api.health.spec.ts`), because CI does not start the backend for the frontend suite. Every matrix row is covered by unit tests that run in CI.

## Verification

**Commands:**
- `cd frontend && npm run lint && npm run lint:test && npm run typecheck && npm run test:coverage && npm run build` -- expected: all pass, coverage at least 80%
- `cd backend && ./mvnw verify` -- expected: all tests pass
- `deploy/security-scan.sh` -- expected: PASS
