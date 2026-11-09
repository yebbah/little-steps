# Epic 25 Context: Demo Family and domain foundations

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Let a developer or maintainer start the app as a seeded demo Caregiver in a demo Family that already has a Child Profile, Care Team, Goals, Strategies and Restrictions, so the core loop (Epics 7 to 12) can be built and tried before real sign-in and the setup screens exist. The epic also builds the tenancy, device data layer, read-side data model and Restriction guardrail that Epics 3 to 6 would otherwise have laid, so they are reused unchanged. It is built first (P1, build order 1).

## Stories

- Story 25.1: Demo identity and the tenant resolver
- Story 25.2: Device data layer
- Story 25.3: Child, Care Team and Goal model with read APIs
- Story 25.4: Strategies, Restrictions and Guardrail
- Story 25.5: Demo seed, reset and indicator

## Requirements & Constraints

- Foundations only for tenancy (FR-1), Child Profile (FR-2), Care Team (FR-3), Goals (FR-4, FR-6) and Strategies/Restrictions (FR-7), read side. Forms, editing and history stay in Epics 4 to 6.
- Out of scope: real sign-in, consent, invites, Family creation, the audit table, any write form for Child, Care Team, Goal, Strategy or Restriction data, and seeded Observation history (Epic 12).
- Tenant isolation must be proven: a second demo Family cannot read or change the first Family's rows.
- The Child Profile holds no real name or date of birth. All seed content is invented and generic: no real people, children, families, places or dates of birth.
- Done when: `deploy/dev-up.sh --full --demo` opens the shell as the demo Caregiver with a visible "Demo data" label; seeded data is readable through the real APIs; a second Caregiver can be switched to and outbox commands are credited to the Caregiver who made them; `Guardrail.check()` blocks an item matching a seeded Restriction; the demo resolver is absent in `prod` and startup fails if the flag is set there.
- Epic definition of done: acceptance criteria met, security scan clean (no KEV, High or Critical), full test suite passing, release note in `docs/release-notes/`. README and `docs/CONTRIBUTING.md` explain the demo flag, seed and reset; the epic PR links the sprint change proposal and closes the epic issue.

## Technical Decisions

- **Tenancy:** every Family-owned table has `family_id uuid NOT NULL REFERENCES families ON DELETE CASCADE` and is mapped with `@TenantId`. Tables without a Family (e.g. `caregivers`) are listed in `backend/GLOBAL_TABLES.md`; an architecture test enforces this, and a test checks every native query filters on `family_id`. The Hibernate root tenant (`isRoot()`) is only for scheduled jobs; no request path or seed uses it.
- **Resolver:** the Family comes only from the Caregiver's active membership, never from a parameter, header or body. The `family.api` port `CurrentCaregiver` supplies Caregiver ID, `sub`, Family ID. With none, every `/api/v1` endpoint except `/api/v1/ping` and health returns `401` as an RFC 9457 problem.
- **Demo resolver:** enabled by `littlesteps.demo.enabled` (env `LS_DEMO`, default off) only in profiles `local` and `test`. It reads `X-Demo-Caregiver` (default: first seeded Caregiver; unknown gives `401`). Not a bean in `prod`; the app fails to start with the flag on in `prod` or with no profile. `GET /api/v1/session` returns Caregiver ID, `sub`, display name, Family ID, `demo: true` and the seeded Caregivers, and `401` without the flag. Demo Caregivers have fixed `sub` values so outbox ownership behaves as for real ones. A Caregiver belongs to at most one active Family.
- **IDs:** primary keys UUIDv7; client generates IDs for offline-creatable roots; creates are `PUT /api/v1/<collection>/{id}` and idempotent. Seed IDs are UUIDv5 derived from stable slugs; the seed is idempotent.
- **Family time:** Family holds an IANA `timezone` and `week_start` (default Monday).
- **Source and origin (AD-10):** Goal, Strategy and Restriction carry a typed `source_ref` (care_team_member or caregiver) and `origin` (prescribed, curated, ai_suggested, parent_proposed). `original_text` is write-once; Caregiver edits go in `caregiver_text`. Review Status lives on Goal: Care Team Goals `confirmed`, parent-proposed `proposed`.
- **Modules:** `family`, `child`, `careteam`, `goals`, `ai`. `ModularityTests` (`ApplicationModules.verify()`) must pass; no module reads another's tables; references across modules are by ID only, via `api` packages.
- **Read APIs:** `GET /api/v1/child-profile`, `/care-team-members`, `/goal-periods`, `/goals`, `/prompt-levels`, plus Strategy and Restriction reads. Shapes appear in `openapi.json` and generated client types; no write endpoints.
- **Restrictions (AD-11):** `ai` defines `RestrictionLookup`, `goals` implements it. It returns Restriction rows for the Goal and Family plus Child Profile sensitivities marked "avoid" (read live from `child.api`, no derived copy), and a `restriction_set_version` that changes when either source changes. `Guardrail.check(items, scope)` runs a deterministic match first; matching or uncheckable items are dropped, except prescribed Activities, which are kept with the flag "conflicts with a recorded Restriction — check with your therapist". Results are cached against the version. The scope classifier is a no-op port here (Epic 13) but fails closed for an AI item if called and unavailable. Guardrail cases live under `eval/guardrails/` with JUnit tag `guardrail-eval`.
- **Device data layer (AD-5, AD-23):** server reads use TanStack Query; one Dexie database holds outbox, drafts and later the offline snapshot; no server data in a global store. Every mutation goes through `outbox.enqueue(command)`, writing to Dexie before any network call; an ESLint rule bans non-GET `fetch` outside the outbox. Commands store the enqueuing `sub` and replay only under it; unsent commands for the same target coalesce to the latest body; replay is FIFO with backoff. A `4xx` other than 401 parks the command with "Couldn't save just now… Retry" and keeps local data; `401` pauses replay and keeps the queue. `useDraft(key)` autosaves to Dexie and restores. Dexie is wiped when the `session` port reports a different `sub`, before anything is shown. The `session` port is supplied by the demo session here and Keycloak in Story 3.1.
- **Test-only endpoint:** `PUT /api/v1/dev/echo/{id}` exercises the outbox end to end; registered only in the `test` profile.
- **Seed and scripts:** `deploy/dev-seed.sh --reset` removes and recreates the seeded Families and refuses to run unless the demo flag is on. `deploy/dev-up.sh --full --demo` starts the stack with the flag on; `--demo` without `--full` prints the one setting to add for an IDE run. Seed content: two Caregivers, one Family, a Child Profile with nickname and two sensitivities (one "avoid"), two Care Team Members with different Status Vocabularies, a Goal Period with at least three Goals across Domains (Structured, Narrative, parent-proposed), Strategies, one Restriction, and a second separate Family for the isolation test.

## UX & Interaction Patterns

- A persistent "Demo data" label in the shell, shown as text (not colour alone), with copy from the catalog (UX-DR138).
- Settings has a Caregiver switcher listing the seeded Caregivers (UX-DR139). Choosing one sends `X-Demo-Caregiver` on every request and gives the new `sub` to the data layer's `session` port, which wipes Dexie before anything is shown.
- Label and switcher are absent when `/api/v1/session` returns `401` or `demo: false`; the production bundle contains no switcher code.
- Component and end-to-end tests cover the label, switch and wipe, with axe checks in light and dark.

## Cross-Story Dependencies

- Story 25.1 is the base: the resolver, `CurrentCaregiver`, the `families`/`caregivers`/`caregiver_membership` tables and the isolation test underpin all others.
- Story 25.2 reads `sub` from a `session` port that Story 25.5's demo session supplies; the switch-and-wipe behaviour in 25.5 relies on 25.2.
- Story 25.4 depends on 25.3 (Goals and Child Profile sensitivities) for `RestrictionLookup`.
- Story 25.5 seeds data from 25.1, 25.3 and 25.4 and closes the epic (docs, release note).
- Other epics: Story 3.1 later replaces the demo resolver and session with Keycloak; Story 3.2 keeps re-sign-in in place after a `401`. Epics 4 to 6 add the write forms, editing and history on these tables; Epic 6 adds Restriction forms; Epic 13 implements the scope classifier; Epics 7 to 12 are built on this demo data.
