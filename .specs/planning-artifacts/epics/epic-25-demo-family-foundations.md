---
epic: 25
title: Demo Family and domain foundations
status: planned
phase: P1
build-order: 1
---

# Epic 25: Demo Family and domain foundations

A developer or maintainer starts the app signed in as a seeded demo Caregiver, in a demo Family that already has a Child Profile, Care Team, Goals, Strategies and Restrictions, so the core loop (Epics 7 to 12) can be built and tried before sign-in and the setup screens exist. The epic also builds the foundations that Epics 3 to 6 would otherwise have laid, so they can be reused unchanged.

Added by the sprint change of 2026-11-09 ([proposal](../sprint-change-proposal-2026-11-09.md)). Its stories are outlined here and get full acceptance criteria when the epic is approved, one epic at a time.

**Done when:**
- `dev-up.sh --demo` starts the app, and the shell opens as the demo Caregiver with a visible "Demo data" indicator.
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

## Stories (outline)

### Story 25.1: Demo identity and the tenant resolver
Minimal `families` (with `timezone` and `week_start`), `caregivers` and `caregiver_membership` tables. A `CurrentCaregiver` port. The AD-2 resolver reads the active membership from it. `backend/GLOBAL_TABLES.md`, the architecture test and the native-query test. The demo resolver, enabled only by the demo flag in profiles `local` and `test`, fails startup with `prod`, with a test proving it is not a bean there. The two-Family isolation test.

### Story 25.2: Device data layer
Moved from Story 3.2: TanStack Query, one Dexie database, `outbox.enqueue`, `sub` ownership, coalescing, FIFO replay with backoff, parking with Retry, `useDraft`, the ESLint rule against non-GET `fetch` outside the outbox, and the test-profile-only dev echo endpoint. The 401 sign-in in place stays in Story 3.2.

### Story 25.3: Child, Care Team and Goal model with read APIs
Tables, entities and read endpoints in `child`, `careteam` and `goals` for the Child Profile and its sensitivities, Care Team Members with Status Vocabularies and Prompt Levels, Goals, Goal Periods and Criteria, with Source and origin fields (AD-10).

### Story 25.4: Strategies, Restrictions and Guardrail
Tables and read endpoints for Strategies and Restrictions. `RestrictionLookup` and `restriction_set_version`. `Guardrail.check()` with the deterministic match and the fail-closed rules (AD-11), including the flag on prescribed Activities.

### Story 25.5: Demo seed, reset and indicator
An idempotent seed (UUIDv5 ids): two Caregivers, one Family, one Child, two Care Team Members, a Goal Period with Goals, Strategies and a Restriction. `dev-up.sh --demo` and `dev-seed.sh --reset`. The "Demo data" indicator and the Caregiver switcher (UX-DR138, UX-DR139). README and CONTRIBUTING updates, and the epic's release note. Seed content is invented and generic: no real people, children or families.
