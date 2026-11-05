---
title: 'Adversarial review — LittleSteps v1 architecture spine'
target: ../ARCHITECTURE-SPINE.md
prd: ../../../prds/prd-little-steps-2026-11-05/prd.md
lens: adversary (compliant-but-incompatible unit pairs)
created: '2026-11-05'
---

# Adversarial review — Architecture Spine, LittleSteps v1

## Verdict

**Not build-safe yet.** The ADs are individually sound, but the module graph in AD-1 has no edges for several flows the PRD requires: Summary/Feedback → Goals, Library → Child/Practice, Planning → Goals/Child, Import → Library, and platform listeners → feature events. Ownership is also left unassigned for five entities: Prompt Level list, Goal Period of parent-proposed Goals, prescribed Activity, tip helpfulness, and the reminder schedule. Two teams can each follow every AD exactly and still ship incompatible modules. Every finding below names such a pair and proposes the rule that closes the gap.

## Method

For each pair: two units one level below the spine (epic, story, or client layer). Each obeys every AD as written. The pair is shown to clash on one of these: shared data shape, entity ownership, mutation path, module-graph cycle, or identity/time semantics. Severity:
- **Critical** — blocks a P1 FR or forces an AD-1 violation.
- **High** — produces silent data divergence.
- **Medium** — produces rework or UX inconsistency.

References: `ARCHITECTURE-SPINE.md` (AD-n), `prds/prd-little-steps-2026-11-05/prd.md` (FR-n, §n).

---

## A. Module-graph holes (edges the FRs need but AD-1 forbids)

### A1 — Appointment Feedback epic vs Goals epic: who writes Goal status and Review Status? — Critical

- **Unit X (summary / FR-18 Appointment Feedback):** AD-11 says Goal status is written *only* by the Appointment Feedback command. FR-18 also has Feedback change a parent-proposed Goal's Review Status and add Strategies/Restrictions. The command lives in `summary` (Capability Map).
- **Unit Y (goals / FR-4, FR-7):** AD-8 puts Review Status on Goal. AD-9 makes `goals` the only Restriction store. AD-1 says each module owns its own tables.
- **Clash:** the diagram has no `summary → goals` edge. Team X persists `goal_status` and `review_status` in a `summary` table, which leaves two owners of Goal state. Team Y keeps the AD-8 field on Goal. The only alternative is for `goals` to listen to a `summary` event, but that creates `goals → summary → progress → goals`, a cycle that `ApplicationModules.verify()` rejects. Strategies and Restrictions added through Feedback have no legal write path either.
- **Proposed rule (amend AD-1, AD-11):** "Add the edge `summary → goals`. Appointment Feedback is stored in `summary`, and its Goal-status, Review-Status, Strategy and Restriction effects are applied only by calling `goals.api` commands (`RecordGoalStatus`, `SetReviewStatus`, `AddStrategy`, `AddRestriction`). `goals` is the sole owner of those fields."

### A2 — Summary epic vs Goals: a Summary is "organised by Goal" but cannot read Goals — Critical

- **Unit X (summary / FR-17):** needs Goal list per Care Team Member and Goal Period, Criterion units, parent-proposed Goals listed separately, and Status Vocabulary (careteam, which is allowed).
- **Unit Y (progress / FR-16):** exposes per-Goal measures.
- **Clash:** `summary` reaches Goals only through `progress`. Team Y re-exports Goal DTOs from `progress.api`, and Team X builds a second Goal shape from them. Goal identity, Criterion and lineage now have two API shapes, and they drift. New Inventory items (owned by `practice`) are equally unreachable from `summary`.
- **Proposed rule (amend AD-1):** "No module's `api` may re-export another module's entity shape. A module that needs another module's data gets a direct edge. Add `summary → goals` and, for Inventory, either `summary → practice` or a `progress.api` Inventory query named in the spine."

### A3 — Library (AI suggestions, tips) vs Practice/Child: engagement history and interests are unreachable — Critical

- **Unit X (library / FR-9, FR-12):** suggestions must use the Child Profile and engagement history. Tips must draw on interests, and helpful tips must rank first.
- **Unit Y (practice / FR-14):** owns Observations, engagement ratings and Helpful toggles (AD-6).
- **Clash:** `practice → library` exists, so `library → practice` would be a cycle. There is also no `library → child` edge. Team X either builds `SuggestActivities` input without the inputs FR-9 mandates, or keeps a shadow `engagement_stat` table fed by events. That would be a second owner of engagement data, which Planning (A4) reads from a different place.
- **Proposed rule (amend AD-1):** "Engagement history is owned by `practice` and exposed as `practice.api.EngagementQuery`. Composition that needs both the catalogue and history (suggestion ranking, tip ranking, Plan generation) happens in the module above both (`practice` or `planning`). `library` returns unranked, guardrail-checked candidates only. Add `library → child`."

### A4 — Planning epic vs Goals/Child: the Plan is built from active Goals with no edge to them — High

- **Unit X (planning / FR-13):** generates the Plan from active Goals, favourites, engagement history, availability, and the Child Profile (FR-2).
- **Unit Y (library):** a team that sees `planning → library` only will add "active goals" and "child profile" queries to `library.api` as pass-throughs.
- **Clash:** this is the same leakage as A2. Two facades over Goals exist, with different filters for "active". Planning and Summary can then disagree on which Goals are current.
- **Proposed rule:** "Add `planning → goals` and `planning → child`. 'Active Goal' is defined once, as `goals.api.ActiveGoalsQuery(at)`, and every module uses it."

### A5 — Import epic vs Library: prescribed Activities extracted by import have no write path — High

- **Unit X (import / FR-5):** extracts draft Goals, Strategies, Restrictions *and prescribed Activities*. Its only feature edge is `import → goals`.
- **Unit Y (library / FR-7, FR-8):** the Capability Map puts FR-7 in "`goals`, `library`". The ER diagram puts ACTIVITY next to the library catalogue.
- **Clash:** if `library` owns prescribed Activities, import cannot create them. If `goals` owns them, the Activity entity has two owners: prescribed rows in `goals`, curated and AI rows in `library`. Plan items and Observations then point at two ID spaces. See B1.
- **Proposed rule:** settled by B1, plus "add `import → library` if prescribed Activities live in `library`".

### A6 — Every feature module vs `audit`/`notifications`: platform listeners must import feature event types — High

- **Unit X (family, publishes `CaregiverRemoved`):** the event type is defined in `family.api`, per the layer table.
- **Unit Y (audit, notifications):** the diagram says platform modules "depend on no feature module". A listener for `family.api.CaregiverRemoved` *is* such a dependency, and Modulith counts it.
- **Clash:** the Audit team puts event records in `shared`, while the family team keeps them in `family.api`. The two sets of event classes don't match, and `verify()` fails for whichever team guessed wrong.
- **Proposed rule (amend AD-1):** "Events consumed by platform modules are defined in the consuming platform module's `api` (for example `audit.api.AuditableEvent`, `notifications.api.NotificationRequested`). Feature modules publish those types, so the dependency points feature → platform. Feature-to-feature events live in the publisher's `api` and need a declared edge from listener to publisher."

### A7 — Privacy purge job vs Family module: platform cannot delete the `families` row — Medium

- **Unit X (privacy / AD-15):** deleting the `families` row triggers the cascade.
- **Unit Y (family):** owns `families`, the deletion request, and the undo window (FR-1 notifications).
- **Clash:** `privacy` may not depend on `family`. Writing `purge_after` to `families` from `privacy` breaks AD-1, and so does running the job there.
- **Proposed rule (amend AD-15):** "`family` owns the deletion request, the undo window, the purge job, and the tombstone. `privacy` owns only export orchestration and `ExportContributor`. Storage-prefix deletion is invoked by `family` through `StoragePort`."

---

## B. Two owners of one entity

### B1 — Library epic vs Goals epic: prescribed Activities vs curated vs AI Activities — Critical

- **Unit X (goals, FR-7 manual entry):** stores prescribed Activities next to Strategies, attached to Goals, with `origin = prescribed` (AD-8).
- **Unit Y (library, FR-8/FR-9):** stores curated Activities as global YAML-loaded rows (AD-17) and accepted AI suggestions as Family rows.
- **Clash:** Plan items (planning), Observations (`activity_id`), favourites/hidden, and the Prep card all need one Activity reference. Each team follows AD-1 ("by ID only") but uses a different table and ID namespace. The ER diagram's `GOAL }o--o{ ACTIVITY` join has no owner: `goals` cannot see library rows, and curated rows are global with no `family_id`.
- **Proposed rule (new AD):** "`library` is the sole owner of every Activity (curated, prescribed, AI-suggested) and of the Goal↔Activity link table, which is Family-scoped and references Goals by ID. `goals` owns Strategies and Restrictions only. Every other module references an Activity by its single UUID."

### B2 — Child Profile epic vs Goals epic: sensitivity-derived Restrictions have two mutation paths — High

- **Unit X (child / FR-2):** marks a sensitivity "avoid" and publishes an event (AD-9). Later the sensitivity is edited, un-avoided, or deleted.
- **Unit Y (goals / FR-7):** owns the resulting Restriction, a versioned record (AD-5) that a Caregiver can edit in the Restrictions UI.
- **Clash:** nothing says whether a Child Profile edit updates, deletes or ignores the derived Restriction, or whether a goals-side edit writes back. The event is also asynchronous after commit by default under Modulith. Between commit and consumption, `Guardrail.check()` succeeds against a stale Restriction set, so an "avoid sticky textures" tip can be shown. That doesn't count as "can't be checked", so fail-closed does not trigger.
- **Proposed rule (tighten AD-9):** "A sensitivity-derived Restriction is keyed by the sensitivity ID, is read-only in `goals`, and is created, updated or removed only by a synchronous, same-transaction listener on Child Profile events. `RestrictionLookup` returns a monotonic `restriction_set_version` that every Guardrail result carries."

### B3 — Goal Periods: ER says Care Team Member owns them, FR-6 says goals, and parent-proposed Goals have no Care Team Member — High

- **Unit X (careteam):** reads the ER diagram (`CARE_TEAM_MEMBER ||--o{ GOAL_PERIOD`) and owns `goal_period`.
- **Unit Y (goals / FR-4, FR-6):** the Capability Map puts FR-6 in `goals`. FR-4 requires a Goal Period on *every* Goal, including parent-proposed ones that have no Care Team Member.
- **Clash:** two candidate owners. Parent-proposed Goals either get a fake Care Team Member, a null period, or a Family-level period. FR-17 also needs a rule for which Care Team Member's Summary lists a given parent-proposed Goal "for discussion".
- **Proposed rule:** "`goals` owns Goal Periods. A Goal Period always belongs to one Care Team Member. A parent-proposed Goal must name the Care Team Member it is proposed to (`proposed_to`) and sits in that member's current period. Summaries list parent-proposed Goals by `proposed_to`."

### B4 — Prompt Level list: "editable per Family", with a per-Care-Team-Member mapping, and no owner — High

- **Pair:** goals (Criterion's required Prompt Level), practice (Observation's Prompt Level), careteam (FR-3 "optional Prompt Level mapping"), progress (trend), summary (patterns).
- **Clash:** the Conventions table says "server enums or rows" without naming an owner. If `goals` owns the list, the mapping in `careteam` cannot reference it, because that would be `careteam → goals`, a cycle. Observations that store a label break when the list is renamed or reordered. Observations that store an ID lose the ordering the trend depends on when a level is deleted.
- **Proposed rule (new AD or Convention):** "`careteam` owns the Family Prompt Level list and each Care Team Member's mapping, as rows with stable UUIDs and an ordinal. Levels are retired, never deleted. Observations and Criteria store the level ID plus a snapshot of its ordinal at write time. Trends use the snapshot."

### B5 — Coach Tip helpfulness: session payload vs Review edits vs ranking owner — High

- **Unit X (practice / AD-6):** Helpful toggles travel in `CompletePracticeSession`. "Which Cue or Coach Tip helped" is a Review field, so later Observation edits create revisions (AD-7).
- **Unit Y (library / FR-12):** serves tips and must put helpful tips first. It also feeds the offline Dexie tips (AD-19). The SM-7 counter needs *displays after a Mark*, but AD-6 says tip requests persist nothing.
- **Clash:** Team Y adds a `tip_feedback` table and endpoint, a second write path that AD-6 never forbade for the Review. Team X derives helpfulness from the latest Observation revision. Rankings differ, and the offline tip order differs from the online order. SM-7 cannot be measured because displays are never recorded.
- **Proposed rule (tighten AD-6):** "Tip helpfulness and tip displays are owned by `practice`. They are derived only from the latest Observation revision, and `CompletePracticeSession` carries the list of displayed tip IDs per Mark. Tip ranking is computed in `practice` (A3). The ranked order for the current Plan is written into the Dexie copy so offline order matches online order."

### B6 — Inventory: Log a moment vs the Inventory screen create the same item twice — Medium

- **Unit X (practice / FR-14 Log a moment):** "links to a Goal or an Inventory list". The team creates an Observation and, as a side effect, an Inventory item.
- **Unit Y (practice / FR-15 Inventory):** `PUT /inventory-items/{id}` with a client ID (AD-4).
- **Clash:** the same new word gets two items with different UUIDs, or two Caregivers offline both add "ball". Inventory is not in AD-5's versioned list and AD-7 does not cover it. Whether items are append-only or editable, which "first seen" wins, and what "new Inventory items" in a Summary counts are all undefined.
- **Proposed rule:** "An Inventory item is created only by its own command. Log a moment produces an Observation that references an `inventory_item_id`. Items are unique per `(family_id, list, normalised_text)`. A colliding create merges into the existing item, the earliest `first_seen_at` wins, and edits follow AD-7 revisioning."

### B7 — Activity favourites/hidden: per Caregiver or per Family, and the AD-4 replay rule — Medium

- **Unit X (library / FR-8):** "a Caregiver can save favourites". Stored per `caregiver_id`.
- **Unit Y (planning / FR-13):** "favourites are given priority in the Plan". It reads per Family, because the Plan is per Family.
- **Clash:** the two disagree on scope. AD-4's "different body under the same ID → 409" also breaks a toggle modelled as `PUT /activity-preferences/{activityId}` the second time it flips.
- **Proposed rule:** "Favourite and hidden are per-Family, single-valued state owned by `library`, written as set-state `PUT /activity-preferences/{activityId}` with last-write-wins. AD-4's 409 rule applies only to entity *creates*. Hidden applies to suggestions and the Plan but never hides an Activity from Browse."

---

## C. Conflicting mutation paths and state shapes

### C1 — Frontend offline layer vs the Attribution convention: the server stamps `at` at sync time — Critical

- **Unit X (frontend outbox / AD-5):** a Log a moment at dinner while offline syncs the next morning.
- **Unit Y (backend):** the Conventions table says every write records `at` "from the token, never from the request body". AD-13 computes the active day and week on the server.
- **Clash:** the Observation lands on the wrong day, and possibly the wrong week or Goal Period. Consistency (FR-16, SM-1) and "active day" are corrupted. Both teams obeyed the spine.
- **Proposed rule (amend Conventions + AD-13):** "Records captured offline carry a client-supplied `occurred_at`. The server keeps it if it is within [last sync − 14 days, now + 5 min] and otherwise clamps it and flags the record. `recorded_at` and `caregiver_id` stay server-stamped. All day, week and period bucketing uses `occurred_at`."

### C2 — AD-4 vs AD-6: Marks are "created offline with client IDs and PUT", but no Mark endpoint may exist — High

- **Unit X (API scaffolding story following AD-4):** generates `PUT /api/v1/marks/{id}`, because AD-4 lists Mark among entities created offline.
- **Unit Y (practice / AD-6):** forbids any Mark endpoint.
- **Proposed rule:** "AD-4's PUT-per-collection applies to aggregate roots only. Marks, adapt/skip events and Helpful toggles are child rows of `PracticeSession`, have client UUIDs, and exist only inside `CompletePracticeSession`."

### C3 — Outbox vs AD-4 409-on-different-body: editing a queued Review or draft deadlocks — High

- **Unit X (frontend):** the Caregiver completes a session offline, then fixes the Review before sync. The outbox now holds a second command for the same session ID with a different body.
- **Unit Y (backend):** replays the first create, then returns 409 to the second, permanently. AD-5's re-apply UI only covers *versioned* records, so this conflict falls outside it.
- **Proposed rule (tighten AD-5):** "The outbox coalesces unsent commands by target ID, keeping the latest body. A create that has already synced is followed by an edit command (an Observation revision), never a second create."

### C4 — Observation edits by two Caregivers: append-only but unversioned — High

- **Pair:** practice edit-Observation story (AD-7 revisions) vs the AD-5 conflict rule, which lists Goal, Child Profile, Care Team Member, Plan and Strategy/Restriction but not Observation.
- **Clash:** two offline edits both append. "Latest revision is current" silently discards one Caregiver's correction, which AD-5 says must never happen.
- **Proposed rule:** "A revision command carries `based_on_revision_id`. If it is not the latest, the server returns 409 and the client shows both versions (AD-5)."

### C5 — Stored Plan vs a new Restriction from Feedback; Dexie Prep cards vs the guardrail — High

- **Unit X (planning):** stores the week's Plan items at generation. AD-9 checked them then.
- **Unit Y (summary / FR-18):** adds a Restriction midweek. FR-18 says it takes effect "in the next Plan", but AD-9 says nothing is returned without a check. Dexie also holds Prep cards and tips checked against the old set.
- **Clash:** one team re-checks on read, the other trusts the stored Plan. The offline device shows a now-restricted tip.
- **Proposed rule (tighten AD-9, AD-19):** "Guardrail results are cached against `restriction_set_version`. Every read of Plan items, Prep cards or tips re-checks when the version changed. The Dexie copy stores the version and is invalidated (restricted items removed) on the next sync that shows a newer one. Until that sync, an offline device shows only items checked against the last known version."

### C6 — Prescribed Activities vs fail-closed guardrail — Medium

- **Pair:** library (AD-9: every Activity suggestion passes `Guardrail.check()`, items that fail are dropped) vs goals/§5 ("Care Team Strategies and Restrictions take precedence"). FR-7 also says prescribed Activities appear exactly as written.
- **Clash:** a therapist-prescribed Activity that matches a profile sensitivity is silently hidden by one team and shown by another.
- **Proposed rule:** "Prescribed Activities are never dropped by the guardrail. On a Restriction match they are shown with a 'conflicts with a recorded Restriction — check with your therapist' flag. Drop-on-fail applies to curated and AI items only."

### C7 — Summary draft editing vs AD-11 citation drop — Medium

- **Unit X (summary AI path):** the server drops any sentence that has no citation.
- **Unit Y (summary editor / FR-17):** the Caregiver edits or adds sentences, which have no citations. The draft is also not in AD-5's versioned list, though two Caregivers can edit it.
- **Clash:** a validator applied on save deletes Caregiver text. Two Caregivers editing overwrite each other.
- **Proposed rule:** "A Summary stores AI sentences (with citations, immutable as in AD-8's `original_text`) separately from Caregiver text blocks (labelled as Caregiver-written). The citation rule applies only to AI sentences. Summary is a versioned record under AD-5, and share/export snapshots the current version."

### C8 — Progress measures vs Summary measures computed twice — Medium

- **Pair:** progress (FR-16 "below 5 Observations → too few to show a trend") vs summary (FR-17 "fewer than 5 → limited data", date range *or* Goal Period).
- **Clash:** two implementations of consistency per week, Prompt Level patterns and generalisation. Their boundaries and lineage handling differ (revised Goals followed back, or not).
- **Proposed rule:** "Per-Goal measures for any `(goal lineage, date range)` are computed only by `progress.api.GoalMeasuresQuery`, using `FamilyCalendar`. `summary` never aggregates Observations itself."

---

## D. Identity and shape mismatches

### D1 — Curated content IDs: UUIDv7 primary keys (AD-4) vs stable slug upsert (AD-17) — High

- **Pair:** content loader (AD-17) vs every Family table that references curated content (favourites, Plan items, Observation "which Cue/Tip helped", helpfulness).
- **Clash:** a UUIDv7 minted at first load differs per environment and changes on a reseed, which orphans Family references and makes exports non-portable. Referencing by slug instead violates the AD-4 single-ID convention. When `content_version` bumps, it is unclear whether a reference points to the old wording or the new.
- **Proposed rule (tighten AD-17):** "A curated item's ID is a UUIDv5 derived from its slug, stable forever. `content_version` changes never change the ID. Family records that capture what was shown (Review 'helped', tip displays) also store the `content_version`."

### D2 — `source_ref` is "a Care Team Member ID or a Caregiver ID" with no discriminator — Medium

- **Pair:** goals/library writers vs summary/progress readers that label Source. The ID sits in two modules' ID spaces. A removed Caregiver (FR-1) leaves a dangling reference.
- **Proposed rule (tighten AD-8):** "`source_ref` is `{kind ∈ {care_team_member, caregiver}, id}`. Caregivers are never hard-deleted while the Family exists: removal marks the membership ended and keeps the display name for attribution."

### D3 — Reminder schedule and push subscriptions: no owner, and the job cannot see Plans — Medium

- **Pair:** planning (Plan days, availability) vs notifications (push, templates, AD-14 job on `next_reminder_at`).
- **Clash:** the AD-14 job must check "a Plan item exists today", but `notifications` cannot read `planning`. Reminder time, push subscriptions and `next_reminder_at` have no named owner.
- **Proposed rule:** "`planning` owns reminder preferences, `next_reminder_at`, and the reminder job. When a reminder is due it publishes `notifications.api.NotificationRequested`. `notifications` owns push subscriptions, templates and delivery only."

### D4 — Weekly Plan creation race and a `week_start` change — Medium

- **Pair:** two Caregivers open Today on Monday at the same time, and each request generates a Plan. Separately, a Caregiver changes `week_start` midweek.
- **Clash:** AD-13's key prevents duplicates only if generation is idempotent on that key. A `week_start` change silently orphans the current Plan.
- **Proposed rule (tighten AD-13):** "Plan generation is `INSERT … ON CONFLICT (family_id, week_start_date) DO NOTHING` followed by a read. A `week_start` change takes effect from the next week boundary."

### D5 — Frontend: TanStack Query cache vs Dexie copy as two read sources for the Plan — Medium

- **Pair:** the Today screen story (reads with TanStack Query, AD-19) vs the offline layer story (reads the Dexie copy of the current Plan, AD-19).
- **Clash:** online and offline views differ. Pending outbox edits are not reflected in TanStack data.
- **Proposed rule (tighten AD-19):** "Resources in the offline set are read only through a Dexie-backed query function that overlays pending outbox commands. TanStack Query wraps that function and never reads those resources from the network directly."

---

## Top holes (priority order)

1. **A1/A2: the Summary and Appointment Feedback module cannot reach `goals`.** Add the `summary → goals` edge. Feedback effects go only through `goals.api` commands, `goals` remains the sole owner of Goal status and Review Status, and there are no re-exported entity shapes.
2. **B1/A5: Activity has two owners.** `library` owns all Activities (curated, prescribed, AI) and the Goal↔Activity link table, with one UUID space. Add `import → library`.
3. **A3/B5: ranking by engagement and helpfulness needs a cycle.** `practice` owns engagement and helpfulness (including displays, for SM-7) and does the ranking. `library` returns unranked, guardrail-checked candidates. Add `library → child`.
4. **C1: offline time is lost.** Records captured offline carry a clamped, client-supplied `occurred_at` used for all bucketing. Only `recorded_at` and the Caregiver are server-stamped.
5. **B2/C5: Restriction freshness.** Sensitivity Restrictions are derived synchronously and are read-only in `goals`. Guardrail results are keyed to `restriction_set_version` and re-checked on read and in Dexie.
6. **B4: the Prompt Level list has no owner.** `careteam` owns the list and the mappings as stable, retire-only rows, and Observations snapshot the ordinal.
