# Epic 25 Context: Demo Family and domain foundations

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Let a developer or maintainer start the app signed in as a seeded demo Caregiver, in a demo Family that already has a Child Profile, Care Team, Goals, Strategies and Restrictions, so the core loop can be built and tried before real sign-in and the setup screens exist. The epic also lays the tenancy, device data layer, read-side domain model and Guardrail foundations that later epics reuse unchanged.

## Stories

- Story 25.1: Demo identity and the tenant resolver
- Story 25.2: Device data layer
- Story 25.3: Child, Care Team and Goal model with read APIs
- Story 25.4: Strategies, Restrictions and Guardrail
- Story 25.5: Demo seed, reset and indicator

## Requirements & Constraints

- No FRs are owned here. This epic is the foundation (tenancy and read side) for the Child Profile, Care Team, Goals, Strategies and Restrictions features, whose forms, editing and history stay in their own epics.
- Only a Family's Caregivers may access its data. A second Family must never read or change the first Family's rows, proven by an isolation test over every Family endpoint.
- The child is identified by nickname only: no real name or date of birth.
- Seed content is invented and generic: no real people, children, families, places or dates of birth.
- Out of scope: real sign-in, consent, invites, Family creation, audit table, write forms for the domain data, seeded Observation history.
- Done when:
  - `dev-up.sh --full --demo` opens the shell as the demo Caregiver with a visible "Demo data" label.
  - Seeded data is readable through the real APIs.
  - A second Caregiver can be switched to, and an outbox command is credited to its author.
  - `Guardrail.check()` blocks an item matching a seeded Restriction.
  - The demo resolver is absent in `prod`.
  - The security scan is clean (no KEV, High or Critical), the full suite passes, and the epic release note is written in `docs/release-notes/`.

## Technical Decisions

- Tenancy:
  - Family-owned tables carry `family_id uuid NOT NULL REFERENCES families ON DELETE CASCADE` and are mapped with `@TenantId`.
  - Tables without it (such as `caregivers`) are listed in `backend/GLOBAL_TABLES.md`. An architecture test enforces this, and a test checks every native query filters on `family_id`.
  - The tenant resolver takes the Family only from the Caregiver's active membership, never from a parameter, header or body. No request path resolves to the root tenant, and seeds never use `isRoot()` outside a scheduled job.
  - A Caregiver belongs to at most one active Family.
- Identity: the `family.api` port `CurrentCaregiver` supplies Caregiver ID, `sub` and Family ID. With none, every `/api/v1` endpoint except `/api/v1/ping` and health returns `401` as an RFC 9457 problem.
- Demo flag `littlesteps.demo.enabled` (env `LS_DEMO`, default off):
  - Allowed only in profiles `local` and `test`.
  - The demo resolver and the `X-Demo-Caregiver` header are not beans in `prod`. Startup fails if the flag is on in `prod` or with no profile.
  - `GET /api/v1/session` returns Caregiver, Family, `demo: true` and the seeded Caregivers. It returns `401` without the flag.
- Ids and seed: UUIDv7 for rows, UUIDv5 from stable slugs for seed ids. The seed is idempotent, writes under each Family's own tenant, and has a second Family for isolation tests. `deploy/dev-seed.sh --reset` recreates it and refuses without the flag. `dev-up.sh --demo` without `--full` prints the setting to add for an IDE run.
- Family stores IANA `timezone` and `week_start` (default Monday).
- Modules: `family`, `child`, `careteam`, `goals`, `ai`. `ModularityTests` must pass with the allowed module edges, and no module reads another's tables.
- Domain model: records carry a typed Source and origin. Care Team wording is stored immutably next to any Caregiver edit. Care Team Goals are `confirmed` and parent-proposed Goals are `proposed`. Read endpoints are `GET /api/v1/child-profile`, `/care-team-members`, `/goal-periods`, `/goals`, `/prompt-levels` (plus Strategy and Restriction reads), with no write endpoints. Shapes go in `openapi.json` and the generated client types.
- Frontend data layer:
  - TanStack Query for server reads, and one Dexie database for outbox, drafts and the later offline snapshot. No server data is mirrored into a global store.
  - All mutations go through `outbox.enqueue(command)`, which writes to Dexie before any network call. A lint rule (oxlint) bans non-GET `fetch` elsewhere.
  - Commands store the enqueuing `sub` and replay only under it. Unsent commands for the same target coalesce. Replay is FIFO with backoff. A `4xx` other than 401 parks the command with a Retry message and keeps local data. A `401` pauses replay and keeps the queue.
  - `useDraft(key)` autosaves and restores form state.
  - Dexie is wiped before anything is shown when the `session` port reports a different `sub`. The demo session supplies `sub` here, and Keycloak will later.
  - A test-profile-only `PUT /api/v1/dev/echo/{id}` exercises the outbox end to end, and is not registered in `local` or `prod`.
- Guardrail:
  - `RestrictionLookup` is defined in `ai` and implemented by `goals`. It returns the Restriction rows for the Goal and the Family, plus Child Profile "avoid" sensitivities read live from `child.api` with no derived copy, with a `restriction_set_version` that changes when either source changes.
  - `Guardrail.check(items, scope)` runs a deterministic Restriction match first. Matching or unverifiable items are dropped, except a prescribed Activity, which is kept with the flag "conflicts with a recorded Restriction — check with your therapist".
  - Results are cached against `restriction_set_version`. The scope classifier is a no-op port (Epic 13 implements it) that fails closed for AI items if called and unavailable.
  - Guardrail eval cases live under `eval/guardrails/` with JUnit tag `guardrail-eval`.

## UX & Interaction Patterns

- A persistent "Demo data" label in the shell, as text and not colour alone, with copy from the catalog.
- A Caregiver switcher in Settings lists the seeded Caregivers. Choosing one sends `X-Demo-Caregiver` on every request and gives the data layer the new `sub`, which wipes Dexie before anything is shown.
- Label and switcher are hidden when the session returns `401` or `demo: false`, and the production bundle contains no switcher code.
- Component and end-to-end tests cover the label, the switch and the wipe, with axe in light and dark.
- The "Couldn't save just now… Retry" message appears on parked commands.

## Cross-Story Dependencies

- 25.1 comes first: tenancy, identity and the isolation test underpin all other stories.
- 25.2 reads `sub` from a `session` port that 25.5's demo session supplies in this epic. Story 3.1 later supplies the Keycloak session. Re-sign-in after a `401` stays in Story 3.2.
- 25.3 and 25.4 depend on the Family tables from 25.1. 25.4 reads Child Profile sensitivities from 25.3.
- 25.5 seeds the data from 25.1, 25.3 and 25.4, and its switcher exercises 25.2's wipe.
- Epic 25 is built first. Epics 7 to 12 (the core loop) build on its demo data. Epics 3 to 6 later add sign-in, setup forms, editing and history on these foundations. Epic 13 implements the scope classifier.
