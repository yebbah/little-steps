# Epic 25 Context: Demo Family and domain foundations

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Let a developer or maintainer start the app signed in as a seeded demo Caregiver, in a demo Family that already has a Child Profile, Care Team, Goals, Strategies and Restrictions, so the core loop (Epics 7 to 12) can be built and tried before real sign-in and the setup screens exist. The epic also builds the foundations that Epics 3 to 6 would otherwise have laid (tenancy, device data layer, read-side domain model, Guardrail), so they are reused unchanged later.

## Stories

- Story 25.1: Demo identity and the tenant resolver
- Story 25.2: Device data layer
- Story 25.3: Child, Care Team and Goal model with read APIs
- Story 25.4: Strategies, Restrictions and Guardrail
- Story 25.5: Demo seed, reset and indicator

## Requirements & Constraints

- Foundations only (read side): tenancy, Child Profile, Care Team, Goals, Strategies, Restrictions. No forms, editing or history; those stay in Epics 4 to 6.
- Out of scope: real sign-in, consent, invites, Family creation, audit table, any write path for setup data, seeded Observation history.
- Tenant isolation: one Family must never read or change another's rows; proven by an isolation test over every Family endpoint.
- Child Profile holds no real name or date of birth (nickname, optional age band).
- All seed content is invented and generic: no real people, children, families, places or birth dates (repo is public).
- Demo must be provably absent in `prod`: not a bean there, and startup fails if the demo flag is on in `prod` or with no profile.
- Done when: `dev-up.sh --full --demo` opens the shell as the demo Caregiver with a visible "Demo data" label; seeded data is readable via real APIs; switching Caregivers works and outbox commands are credited to the acting Caregiver; `Guardrail.check()` blocks an item matching a seeded Restriction; clean scan, full tests passing, release note published, README and `docs/CONTRIBUTING.md` updated.

## Technical Decisions

- Tenancy (AD-2): every Family-owned table has `family_id uuid NOT NULL REFERENCES families ON DELETE CASCADE` and its entity uses `@TenantId`. Global tables (e.g. `caregivers`) are listed in `backend/GLOBAL_TABLES.md`. An architecture test fails for an entity without `@TenantId` that is not listed; a test checks every native query filters on `family_id`. The Family comes only from the Caregiver's active membership, never from a parameter, header or body; no request resolves to the root tenant; no `isRoot()` outside scheduled jobs. A Caregiver has at most one active Family.
- `family` module tables: `families` (IANA `timezone`, `week_start` default Monday), `caregivers`, `caregiver_membership` (role, `joined_at`, `ended_at`, `end_reason`). `family.api` exposes the `CurrentCaregiver` port.
- No `CurrentCaregiver`: every `/api/v1` endpoint except `/api/v1/ping` and health returns `401` as an RFC 9457 problem.
- Demo resolver: flag `littlesteps.demo.enabled` (env `LS_DEMO`, default off), only in profiles `local` or `test`. Reads `X-Demo-Caregiver` (default first seeded Caregiver; unknown ID gives `401`). `GET /api/v1/session` returns Caregiver ID, `sub`, display name, Family ID, `demo: true`, and seeded Caregivers; `401` without the flag.
- IDs: UUIDv7 generally; seed IDs are UUIDv5 from stable slugs. Seed is idempotent and writes under each Family's own tenant. A second separate Family is seeded for isolation tests.
- Domain tables (modules `child`, `careteam`, `goals`): `child_profile`, `care_team_member` (with `status_vocabulary`, optional Prompt Level mapping), `prompt_level`, `goal_period`, `goal` (Structured or Narrative, optional parent long-term Goal, Review Status, `revised_from`), `strategy`, `restriction` (Goal-level or Family-level). Every record has a typed Source and origin; Care Team wording is stored immutably beside any Caregiver edit (AD-10). Care Team Goals are `confirmed`; parent-proposed are `proposed`.
- Read endpoints only: `GET /api/v1/child-profile`, `/care-team-members`, `/goal-periods`, `/goals`, `/prompt-levels`; shapes in `openapi.json` and generated client types. `ModularityTests` must pass with AD-1 edges; no module reads another's tables.
- Guardrail (AD-11): `ai` module defines `RestrictionLookup`, implemented by `goals`. It returns Restriction rows (Goal and Family) plus Child Profile sensitivities flagged "avoid" (read live via `child.api`, no derived copy) and a `restriction_set_version` that changes when either source changes. `Guardrail.check(items, scope)`: deterministic Restriction match first; a matching or uncheckable item is dropped, except a prescribed Activity is kept with the flag "conflicts with a recorded Restriction — check with your therapist". Results cached per `restriction_set_version`. Scope classifier is a no-op port (Epic 13); fails closed for an AI item if called and unavailable. Guardrail eval cases live in `eval/guardrails/` with JUnit tag `guardrail-eval`.
- Frontend data layer (AD-5, AD-23): TanStack Query for server reads; one Dexie database for outbox, drafts and later the offline snapshot; no server data in a global store. All mutations go through `outbox.enqueue(command)`, which writes to Dexie before any network call; an oxlint rule fails on non-GET `fetch` outside the outbox. Commands store the enqueuing `sub` and replay only under it; unsent commands for the same target ID coalesce to the latest body; replay is FIFO with backoff; non-401 `4xx` parks the command with "Couldn't save just now… Retry" and keeps local data; `401` pauses replay and keeps the queue. `useDraft(key)` autosaves and restores form state. Dexie is wiped when the `session` port reports a different `sub`, before anything is shown. The `session` port is supplied by the demo session here and by Keycloak in Story 3.1.
- Test-profile-only `PUT /api/v1/dev/echo/{id}` exercises the outbox end to end; not registered in `local` or `prod`.
- Tooling: `deploy/dev-seed.sh --reset` removes and recreates seeded Families and refuses to run unless the demo flag is on. `deploy/dev-up.sh --full --demo` starts the stack with the flag on; `--demo` without `--full` prints the one setting for an IDE run.

## UX & Interaction Patterns

- Persistent "Demo data" label in the shell whenever the demo identity is active; text, not colour alone; copy from the message catalog (UX-DR138).
- Settings shows a Caregiver switcher listing seeded Caregivers (UX-DR139). Choosing one sends `X-Demo-Caregiver` on every request, supplies the new `sub` to the `session` port, and wipes Dexie before anything is shown.
- Label and switcher are absent when `/api/v1/session` returns `401` or `demo: false`; the production bundle contains no switcher code.
- Component and e2e tests cover label, switch and wipe, with axe checks in light and dark.

## Cross-Story Dependencies

- 25.5 depends on 25.1 (demo resolver, session endpoint), 25.2 (session port, Dexie wipe), and 25.3 and 25.4 (seeded data).
- 25.4 depends on 25.3 (Goals and Child Profile sensitivities).
- 25.1's isolation test covers endpoints added by 25.3 and 25.4.
- Later epics: Epic 3 replaces the demo session with Keycloak sign-in (Stories 3.1, 3.2 keep re-sign-in in place after a `401`). Epics 4 to 6 add the write endpoints, forms and history on these tables. Epic 13 implements the scope classifier. Epics 7 to 12 consume the seeded data; Epic 12 owns Observation history.
