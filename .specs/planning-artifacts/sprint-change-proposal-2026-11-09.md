---
date: 2026-11-09
status: approved-and-applied
scope: moderate
trigger: test the core loop on mock data before building sign-in and setup
---

# Sprint change proposal: demo Family first, setup features later

## 1. Issue summary

**Trigger.** Epics 1 and 2 are done. Epic 3 (sign-in, Family, consent) is next, followed by Epics 4 to 6 (Child Profile, Care Team, Goals, Strategies and Restrictions). The core loop (Epics 7 to 9) cannot be tried until all of those exist. The maintainer wants to test the loop with seeded mock data, and plug the setup features in later.

**Type.** Strategic resequencing. No requirement changes.

**Evidence.**
- Epics 7 to 12 read a Family, a Child Profile, Goals and Restrictions, but never write them. Only `Guardrail.check()` (Epic 6) and the device data layer (Story 3.2) are real dependencies.
- Epics 4 to 6 have no story files yet, so reshaping them costs nothing.
- Epic 3 is approved and has sub-issues #44 to #53, none started.

## 2. Impact analysis

### Epics

| Epic | Impact |
| --- | --- |
| 3 Sign-in, Family and consent | Moves to after Epic 13. Story 3.2 is split: the data layer moves to Epic 25, and signing in again in place stays in Epic 3. Other stories unchanged. |
| 4, 5, 6 | Each is split into a **read side** and a **write side**. The read side (tables, entities, read endpoints) moves to Epic 25. The write side (forms, edit, history, onboarding steps) stays and moves after Epic 3. Epic 6 also loses `Guardrail.check()`. |
| 7 to 12 | Unchanged in content. They run first, on seeded data. Epic 12 gains a seeded-history story, because Progress needs weeks of Observations to be worth testing. |
| 13 | Moves up to follow Epic 12. It has no setup dependency. |
| 14 to 17 | Unchanged, built after the real setup (they need real members and accounts). |
| 18 to 24 | Unchanged. |
| **25 (new)** | Demo Family and domain foundations. P1. |

### Findings that shaped the proposal

1. **The seed needs the tables.** Child, Care Team, Goal and Restriction tables belong to Epics 4 to 6. A seed cannot exist without them, so the read side must move to Epic 25. This is why Epics 4 to 6 are split, not just reordered.
2. **`Guardrail.check()` is logic, not data entry.** Epics 7 to 9 call it on every Activity, Plan item and Prep card (AD-11), so it moves to Epic 25 with `RestrictionLookup`.
3. **AD-2 reads the Family from "the authenticated Caregiver's active membership".** A demo resolver has to supply that same membership, through the same code path, so tenancy is exercised from day one and nothing is bypassed.
4. **Risk: demo identity reaching production.** A stand-in for authentication is the one thing that must never ship enabled. Mitigation is in Story 25.1.

### Artifact conflicts

| Document | Change |
| --- | --- |
| PRD | None. FR-1 is still delivered by Epic 3. |
| Architecture spine | Amend AD-2 and AD-3 (a `local`/`test`-only demo resolver may stand in for the token until Epic 3). Amend AD-11 (owner of `Guardrail` is Epic 25). AD-5's rules are unchanged. |
| SPEC | One line: demo identity is local and test only. |
| UX | A small "Demo data" indicator and a Caregiver switcher, local and test builds only (new UX-DR138, UX-DR139), like the component gallery. |
| `epics/requirements.md` | Add UX-DR138 and UX-DR139. Update the AD notes. FR coverage map unchanged. |
| `epics/index.md` | Add Epic 25, a Build order column, and the new "core loop" milestone text. |
| Epic 3, 4, 5, 6 files | See section 4. |
| `docs/CONTRIBUTING.md`, README | Document the demo flag and how to seed and reset. Done in Story 25.5. |

### Technical impact

No existing code changes. New: minimal Family, Caregiver and membership tables, the `CurrentCaregiver` port, the demo resolver, the seed loader, the data layer from 3.2.

## 3. Recommended approach

**Direct adjustment**: add one epic, split three, reorder. Rollback and scope reduction are not needed, because nothing is built yet.

- **Effort:** low to medium. Epic 25 is about five stories. Most of its content was already inside Epics 3 to 6.
- **Risk:** medium, from authentication arriving late and from the seed going stale. Both have mitigations below.
- **Timeline:** the core loop is testable roughly after Epic 25 plus Epics 7 to 9, instead of after Epics 3 to 9.

**Mitigations.**
- The demo resolver goes through the same Family-scoped path as real sign-in. The cross-Family isolation test (originally in Story 3.6) runs in Epic 25 using two demo Families.
- Startup fails if the demo flag is on with profile `prod`. A test proves the demo resolver is not a bean in `prod`.
- After Epic 3, the seed stays as a test fixture and an opt-in local mode. The default local run uses real sign-in.

## 4. Detailed change proposals

### 4.1 New Epic 25: Demo Family and domain foundations (P1)

> A developer or maintainer can start the app signed in as a seeded demo Caregiver, in a demo Family that already has a Child Profile, Care Team, Goals, Strategies and Restrictions, so the core loop can be tried before sign-in and setup exist.

**Done when:** `dev-up.sh --demo` starts the app, the shell opens as the demo Caregiver with a visible "Demo data" indicator, the seeded Family's data is readable through the real APIs, a second demo Caregiver can be switched to, `Guardrail.check()` blocks a seeded Restriction, a second demo Family cannot read the first's rows, and the demo resolver is provably absent in `prod`.

Stories (full text written when the epic is approved):

- **25.1 Demo identity and the tenant resolver.** Minimal `families`, `caregivers` and `memberships` tables (including `timezone` and `week_start`, AD-8). `CurrentCaregiver` port. AD-2 resolver reads the active membership from it. `GLOBAL_TABLES.md`. Demo resolver active only with the demo flag in profile `local` or `test`; startup fails with `prod`. Two-Family isolation test and native-query check.
- **25.2 Device data layer.** Moved from Story 3.2: TanStack Query, Dexie, `outbox.enqueue`, `sub` ownership, coalescing, FIFO replay, parking with Retry, `useDraft`, the ESLint rule, and the test-profile dev echo endpoint. The 401 sign-in-in-place and the wipe on user change stay in Story 3.2.
- **25.3 Child, Care Team and Goal model with read APIs.** Tables, entities and read endpoints for the Child Profile and sensitivities, Care Team Members with Status Vocabularies and Prompt Levels, Goals, Goal Periods and Criteria. Source and origin fields (AD-10).
- **25.4 Strategies, Restrictions and Guardrail.** Tables and read endpoints for Strategies and Restrictions, `RestrictionLookup`, `restriction_set_version`, and `Guardrail.check()` with the deterministic match and fail-closed rules (AD-11). Moved from Epic 6.
- **25.5 Demo seed, reset and indicator.** Idempotent seed (UUIDv5 ids, two Caregivers, one Family, one Child, two Care Team Members, a Goal Period with Goals, Strategies, a Restriction), `dev-up.sh --demo` and `dev-seed.sh --reset`, the "Demo data" indicator and Caregiver switcher (UX-DR138, UX-DR139), README and CONTRIBUTING updates, release note.

Seed content follows the global-product rule: invented, generic names and details, no real people.

### 4.2 Epic 3

- **Status:** stays `approved`; position moves to after Epic 13.
- **Story 3.2** (#45): retitle "Signing in again in place". Keep only the 401 re-sign-in with draft restore and replay resume, and the Dexie wipe when a different `sub` signs in. Remove the data-layer acceptance criteria (moved to 25.2). It depends on 25.2.
- **Story 3.6** (#49): remove the isolation-test criterion (moved to 25.1). It now extends the 25.1 tables with the create flow.
- **"Done when"** gains: the demo resolver is no longer the default local mode.
- Other stories unchanged.

### 4.3 Epics 4, 5, 6

| Epic | Moves to Epic 25 (read side) | Stays (write side, after Epic 3) |
| --- | --- | --- |
| 4 | Child and Care Team tables, read endpoints | Profile and member forms, edit with history, onboarding steps |
| 5 | Goal and Goal Period tables, read endpoints | Goal forms, Goal Period carry-over, revise and retire, lineage |
| 6 | Strategy and Restriction tables, `Guardrail.check()` | Strategy and Restriction forms. **Done when** becomes: recording a Restriction changes `restriction_set_version`, and the next Plan or library result reflects it. |

### 4.4 Epic 12

Add Story 12.0: **Seeded history for Progress** (Observations across a Goal Period, including a Goal revised mid-period and a period with too few Observations). It needs the Observation tables from Epics 9 and 11, so it is written when Epic 12 is approved.

### 4.5 Build order (new column in `epics/index.md`)

| Order | Epic |
| --- | --- |
| 1 | 25 Demo Family and domain foundations |
| 2 to 7 | 7, 8, 9, 10, 11, 12 |
| | **Test point: the core loop on mock data** |
| 8 | 13 AI foundation and Coach Tips |
| 9 | 3 Sign-in, Family and consent |
| 10 to 12 | 4, 5, 6 (write side) |
| 13 to 16 | 14, 15, 16, 17 |
| 17+ | 18 to 24 (P2) |

The index sentence "core loop works online at the end of epic 9" becomes "core loop works online on demo data at the end of Epic 9, and on real accounts after Epic 6."

### 4.6 Architecture spine edits

- **AD-2:** add "Until Epic 3, a demo resolver enabled by the demo flag (profiles `local` and `test` only) supplies the active membership. It is not a bean in `prod`, and startup fails if the flag is set there."
- **AD-3:** add the same pointer: "Until Epic 3 the demo resolver stands in for the token."
- **AD-11:** note that Epic 25 delivers `Guardrail` and `RestrictionLookup`.

### 4.7 GitHub issues (after approval)

- Create Epic 25 (label `epic`, `P1`) and its five stories as sub-issues (`story`, `P1`). The number is the next free issue, like Epic 24; recorded in `index.md`.
- Edit #45 (Story 3.2) and #49 (Story 3.6) to match 4.2.
- Edit Epic 4, 5, 6 issues (#5, #6, #7) with the read/write split.
- Add a build-order comment to each epic issue and to the index issue links.
- Leave the `deferred` issues as they are. A triage pass comes next.

## 5. Implementation handoff

**Scope: moderate.** Backlog reorganisation, one new epic, and three small architecture amendments.

- **Maintainer (you):** approve this proposal.
- **Developer agent:** apply the spec edits in 4.1 to 4.6 on this branch, update `index.md`, `requirements.md`, the spine and the SPEC, then create and edit the issues in 4.7.
- **Then:** `bmad-create-epics-and-stories` detail for Epic 25 for your review (one epic at a time), then sprint planning to add Epic 25 to `sprint-status.yaml`.

**Success criteria.** All documents agree on the new order, no document still says the loop needs Epic 3 first, and the issues match the specs.

## 6. Applied (2026-11-09, branch `docs/course-correct-demo-family`)

Changed:
- `epics/index.md`: Build order column, Epic 25 row and summary, notes on Epics 3, 4, 5, 6 and 12, the Order bullet, the FR coverage note.
- `epics/epic-25-demo-family-foundations.md`: new, with the story outline.
- `epics/epic-03-sign-in-family-consent.md`: build-order note, "Done when", Story 3.2 (now "Signing in again in place"), Story 3.6 (tables and isolation test moved to Epic 25).
- `epics/requirements.md`: UX-DR138, UX-DR139, and the Epic 25 additional requirements.
- Architecture spine: AD-2, AD-3 and AD-11 amended.
- SPEC: demo identity constraint.

Not changed: the PRD (no requirement changed); Epics 4, 5 and 6 have no epic files yet, so their split is in the index and is written into their files when each is approved. README and CONTRIBUTING are updated in Story 25.5, when the demo flag exists. Docs only: no code, so no new security surface or test results to report.

Still to do after review: create Epic 25 and its story issues (when the epic is approved), edit issues #45, #49, #5, #6 and #7, and add Epic 25 to `sprint-status.yaml`.
