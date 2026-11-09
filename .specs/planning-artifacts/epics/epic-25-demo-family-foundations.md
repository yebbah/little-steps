---
epic: 25
title: Demo Family and domain foundations
status: approved
phase: P1
build-order: 1
---

# Epic 25: Demo Family and domain foundations

A developer or maintainer starts the app signed in as a seeded demo Caregiver, in a demo Family that already has a Child Profile, Care Team, Goals, Strategies and Restrictions, so the core loop (Epics 7 to 12) can be built and tried before sign-in and the setup screens exist. The epic also builds the foundations that Epics 3 to 6 would otherwise have laid, so they can be reused unchanged.

Added by the sprint change of 2026-11-09 ([proposal](../sprint-change-proposal-2026-11-09.md)). Its stories are below for review, one epic at a time. Approved on 2026-11-09. Epic issue #178, stories #179 to #183.

**Done when:**
- `dev-up.sh --full --demo` starts the stack with the demo flag on, and the shell opens as the demo Caregiver with a visible "Demo data" indicator.
- The seeded Family's Child Profile, Care Team, Goals, Strategies and Restrictions are readable through the real APIs.
- A second demo Caregiver can be switched to, and an outbox command is credited to the Caregiver who made it.
- `Guardrail.check()` blocks an item that matches a seeded Restriction.
- A second demo Family cannot read the first Family's rows.
- The demo resolver is provably absent in `prod`: it is not a bean there, and startup fails if the demo flag is set.
- The Definition of done in the index is met (clean scan, full test suite passing, release note).

## Requirements covered

- **FRs:** none directly. Foundations for FR-1 (tenancy), FR-2, FR-3, FR-4, FR-6, FR-7 (read side). Their owning epics stay as in the index.
- **NFRs:** NFR-4 (access: tenancy and the isolation test), NFR-6 (carried from Epic 1)
- **Architecture:** AD-2 (tenancy and the demo resolver), AD-3 (demo stand-in for the token), AD-4 (UUIDv7, UUIDv5 seed ids), AD-5 and AD-23 (device data layer), AD-8 (Family `timezone` and `week_start`), AD-10 (source and origin), AD-11 (`RestrictionLookup`, `Guardrail`)
- **UX-DRs:** UX-DR138 (Demo data indicator), UX-DR139 (Demo Caregiver switcher)
- **Moved here from other epics:**
  - From Epic 3: the device data layer (Story 3.2, first half), the Family and membership tables, the tenant resolver and the isolation test (Story 3.6).
  - From Epics 4 to 6: tables and read endpoints. Forms, editing and history stay in those epics.
  - From Epic 6: `RestrictionLookup` and `Guardrail.check()`.
- **Not in this epic:** real sign-in, consent, invites, Family creation by a Caregiver, the audit table, any form that writes Child Profile, Care Team, Goal, Strategy or Restriction data, and seeded Observation history (Epic 12).

## Stories

### Story 25.1: Demo identity and the tenant resolver

As a developer,
I want every request to run as a known Caregiver in a known Family before real sign-in exists,
So that every feature is built on the same tenancy it will have in production.

**Acceptance Criteria:**

**Given** the `family` module
**When** its migrations run
**Then** they create `families` (`timezone` IANA, `week_start` default Monday, `created_at`), `caregivers` (`id`, `sub`, `display_name`, `email`) and `caregiver_membership` (Caregiver, Family, `role` = caregiver, `joined_at`, `ended_at`, `end_reason`). A Caregiver belongs to at most one active Family (AD-3).
**And** `caregivers` is listed in `backend/GLOBAL_TABLES.md`. Every Family-owned table from now on has `family_id uuid NOT NULL REFERENCES families ON DELETE CASCADE` and is mapped with `@TenantId` (AD-2).
**And** an architecture test fails if an entity without `@TenantId` is missing from `GLOBAL_TABLES.md`, and a test runs every native query to check that it filters on `family_id`.

**Given** the `family.api` port `CurrentCaregiver` (Caregiver ID, `sub`, Family ID, or none)
**When** a request reaches the tenant resolver
**Then** the resolver takes the Family only from the Caregiver's active membership, never from a request parameter, header or body, and no request path resolves to the root tenant (AD-2).
**And** with no `CurrentCaregiver`, every `/api/v1` endpoint except `/api/v1/ping` and the health endpoint returns `401` as an RFC 9457 problem. This is the state of `prod`, and of `local` without the demo flag, until Story 3.1.

**Given** the demo flag `littlesteps.demo.enabled` (environment `LS_DEMO`, default off)
**When** it is on in profile `local` or `test`
**Then** a demo resolver supplies `CurrentCaregiver` from the `X-Demo-Caregiver` header (a seeded Caregiver ID), defaulting to the first seeded Caregiver. An unknown ID gets `401`.
**And** `GET /api/v1/session` returns the Caregiver ID, `sub`, display name, Family ID, `demo: true` and the list of seeded Caregivers. Without the flag it returns `401`.
**And** the demo resolver and the header are not beans in `prod`, and the app fails to start when `LS_DEMO` is on in profile `prod` or with no profile.

**Given** two seeded Families, each with one Caregiver
**When** the isolation test reads and writes through every Family endpoint as each Caregiver
**Then** neither sees nor changes the other's rows (NFR-4), and a test proves the demo header has no effect with the flag off or in `prod`.

### Story 25.2: Device data layer

As a Caregiver,
I want what I type to be saved on my device first and never lost,
So that a weak connection never costs me my work.

Moved from Epic 3 (Story 3.2, first half). Signing in again in place after a `401` stays in Story 3.2.

**Acceptance Criteria:**

**Given** the frontend
**When** the data layer is added
**Then** server reads use TanStack Query, and one Dexie database holds the outbox, drafts and (later) the offline snapshot. No server data is mirrored into a global store (AD-23).
**And** the data layer reads the current `sub` from a `session` port. In this epic the demo session (Story 25.5) supplies it; Story 3.1 supplies the Keycloak session.
**And** every mutation goes through `outbox.enqueue(command)`, which writes to Dexie before any network call. An ESLint rule fails on `fetch` with a non-GET method outside the outbox (AD-5).
**And** each command stores the `sub` that enqueued it and replays only under that `sub`. Unsent commands for the same target ID coalesce to the latest body. Replay is FIFO with backoff.
**And** a `4xx` problem other than 401 parks the command on its record with "Couldn't save just now… Retry", and keeps the local data. A `401` pauses replay and keeps the queue.
**And** a `useDraft(key)` hook autosaves form state to Dexie on change and restores it on return.
**And** Dexie is wiped when the `session` port reports a different `sub` than the one that owns the data, before anything is shown.

**Given** the test suite
**When** it runs
**Then** unit tests cover: enqueue order, coalescing, `sub` ownership, 401 pause, parking with Retry, the wipe on user change, and draft restore. A test-profile-only endpoint `PUT /api/v1/dev/echo/{id}` exercises the outbox end to end. It is not registered in the `local` or `prod` profiles.

### Story 25.3: Child, Care Team and Goal model with read APIs

As a developer building the core loop,
I want the Child Profile, Care Team and Goals stored and readable through the real APIs,
So that Plan, Prep and Practice read the same data the setup screens will later write.

**Acceptance Criteria:**

**Given** the `child`, `careteam` and `goals` modules
**When** their migrations run
**Then** they create tenant-scoped tables for: `child_profile` (nickname, optional age band, interests, materials and toys, sensitivities with an "avoid" flag, engagement notes; no real name or date of birth, FR-2); `care_team_member` (role, discipline, Care Setting, `status_vocabulary`, optional Prompt Level mapping, FR-3); `prompt_level` (the Family's ordered list); `goal_period` (for a Care Team Member, with dates and status); and `goal` (Domain, description, Source, type Structured or Narrative, optional parent long-term Goal, Criterion, Context, Goal Period, optional baseline, Review Status, `revised_from`, FR-4, FR-6).
**And** every record carries a typed Source and an origin, and Care Team wording is stored immutably next to any Caregiver edit (AD-10).

**Given** a signed-in (or demo) Caregiver
**When** they call the read endpoints (`GET /api/v1/child-profile`, `/care-team-members`, `/goal-periods`, `/goals`, `/prompt-levels`)
**Then** they get only their Family's records, with the Care Team Goals `confirmed` and parent-proposed Goals `proposed` (AD-10).
**And** the response shapes are in `openapi.json` and the generated client types, and carry no write endpoints. Write endpoints are Epics 4 and 5.

**Given** the module graph
**When** `ModularityTests` runs
**Then** it passes with the edges of AD-1, and no module reads another's tables.
**And** tests cover a Family reading only its own rows and the Review Status rule.

### Story 25.4: Strategies, Restrictions and Guardrail

As a Caregiver,
I want anything the app suggests to be checked against what my care team told us to avoid,
So that nothing unsafe reaches Today, even before I can enter Restrictions myself.

Moved from Epic 6: the tables, read endpoints and the Guardrail. The forms stay in Epic 6.

**Acceptance Criteria:**

**Given** the `goals` module
**When** its migrations run
**Then** they create tenant-scoped `strategy` and `restriction` tables. A Strategy or Restriction belongs to a Goal, and a Restriction can also be Family-level. Each carries a typed Source and origin (AD-10), and read endpoints return them (FR-7).

**Given** the `ai` module
**When** it defines `RestrictionLookup` and `goals` implements it
**Then** the lookup returns the Family's Restriction set (Restriction rows for the Goal and the Family, plus the Child Profile sensitivities marked "avoid", read live from `child.api` with no derived copy) and a `restriction_set_version` that changes whenever either source changes (AD-11).

**Given** `Guardrail.check(items, scope)`
**When** items are checked
**Then** a deterministic Restriction match runs first. An item that matches, or can't be checked, is dropped, and a prescribed Activity is kept with the flag "conflicts with a recorded Restriction — check with your therapist" (AD-11).
**And** results are cached against `restriction_set_version`, and the cache is invalid after the version changes.
**And** the scope classifier is a no-op port in this epic (Epic 13 implements it), and the check still fails closed if it is called and unavailable for an AI item.
**And** the first guardrail cases are written under `eval/guardrails/` with the JUnit tag `guardrail-eval`, covering a Restriction match, an "avoid" sensitivity match, a prescribed Activity flag, a version change, and an unavailable check.

### Story 25.5: Demo seed, reset and indicator

As a developer or maintainer,
I want one command to give me a believable demo Family and a visible sign that it is demo data,
So that I can try the core loop without any setup screens.

**Acceptance Criteria:**

**Given** the demo flag is on in `local` or `test`
**When** the app starts
**Then** an idempotent seed creates, with UUIDv5 IDs derived from stable slugs (AD-4): two Caregivers with fixed `sub` values, one Family with a timezone, a Child Profile with a nickname and two sensitivities (one "avoid"), two Care Team Members with different Status Vocabularies, a Goal Period with at least three Goals across different Domains (one Structured, one Narrative, one parent-proposed), Strategies, and one Restriction. A second, separate Family is seeded for the isolation test.
**And** the seed writes under each Family's own tenant, never the root tenant, and uses no `isRoot()` outside a scheduled job (AD-2).
**And** all seed content is invented and generic: no real people, children, families, places or dates of birth.
**And** running the seed twice changes nothing.

**Given** `deploy/dev-seed.sh --reset`
**When** it runs against the local stack
**Then** it removes the seeded Families and recreates them, and refuses to run unless the demo flag is on. `deploy/dev-up.sh --full --demo` starts the stack with the flag on, and `dev-up.sh --demo` without `--full` prints the one setting to add for an IDE run.

**Given** the demo identity is active
**When** any screen is shown
**Then** a persistent "Demo data" label appears in the shell, as text and not by colour alone, with copy from the catalog (UX-DR138).
**And** Settings shows a Caregiver switcher listing the seeded Caregivers (UX-DR139). Choosing one sends `X-Demo-Caregiver` on every request, supplies the new `sub` to the data layer's `session` port, and so wipes Dexie before anything is shown (Story 25.2).
**And** the label and switcher are absent when `GET /api/v1/session` returns `401` or `demo: false`, and the production bundle contains no switcher code.
**And** component and end-to-end tests cover the label, the switch, the wipe, and the guard tests above (axe in light and dark).

**Given** the epic is complete
**When** it is closed
**Then** the README and `docs/CONTRIBUTING.md` explain the demo flag, the seed and the reset command, the Epic 25 release note is published, and the epic's PR links the sprint change proposal.
