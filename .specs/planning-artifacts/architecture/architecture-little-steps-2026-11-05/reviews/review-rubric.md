# Architecture Spine Review — LittleSteps v1

Reviewed: `little-steps/.specs/planning-artifacts/architecture/architecture-little-steps-2026-11-05/ARCHITECTURE-SPINE.md`
Against: `little-steps/.specs/planning-artifacts/prds/prd-little-steps-2026-11-05/prd.md` and `addendum.md`
Date: 2026-11-05

## Overall verdict

**Strong spine, needs one revision pass before epics.** The spine fixes most of the real divergence points: tenancy by construction (AD-2), idempotent client IDs (AD-4), one outbox (AD-5), client ownership of the open Practice Session (AD-6), append-only history (AD-7), one Restriction store with a fail-closed guardrail (AD-9), allow-listed AI tasks (AD-10), cited AI text (AD-11), the gated import state machine (AD-12), server-side Family calendar (AD-13) and privacy contributors (AD-15). Most Rules can be enforced mechanically (ModularityTests, `@TenantId`, a contributor-coverage test, the `guardrail-eval` tag), and they do prevent the divergence each one names.

The biggest problem is that the module dependency graph is declared closed ("No other edges are allowed") but leaves out edges that several FRs need. Builders working independently would then break AD-1 in different ways. The second gap is the operational envelope. Migrations, backups, event delivery and secrets are either missing or only hinted at, and two of those gaps (migration numbering, event delivery) are places where builders would collide directly. The remaining findings are smaller seams.

## 1. Divergence points fixed for the level below — adequate

### Findings

- **[high] The closed module graph is missing edges that FRs need (AD-1, Design Paradigm diagram).** Spring Modulith checks direct dependencies, not transitive ones. Under the edges as drawn:
  - **FR-18 Appointment Feedback** lives in `summary`. It sets a Goal status, changes a Goal's Review Status, and adds Strategies and Restrictions, all of which `goals` owns (AD-8, AD-9, AD-11). There is no `summary → goals` edge. `summary → progress → goals` is transitive only.
  - **FR-9 and FR-12** (in `library`) need the Child Profile's interests and the engagement history and Helpful history from `practice` ("tips marked helpful appear first next time"). There is no `library → child` edge, and `library → practice` would create a cycle, because `practice → library` already exists.
  - **FR-13 Plan** (in `planning`) is generated from active Goals, the Child Profile and Caregiver availability. There is no `planning → goals` or `planning → child` edge.
  - **FR-17 Summary** lists new Inventory items. FR-15 Inventory sits in `practice`, and there is no `summary → practice` edge.

  Each builder will either add the edge without amending the AD, pass the data through an intermediate module's API, or duplicate it. *Fix:* add `summary → goals`, `summary → practice` (or have `progress` re-export Inventory), `library → child`, `planning → goals` and `planning → child`. Break the `library`/`practice` cycle explicitly. One option is that `practice` publishes `PracticeSessionCompleted` and `library` keeps its own read model for engagement and Helpful ranking. The other is to move tip ranking into `practice`. Record whichever is chosen in AD-1.

- **[medium] Shared devices and the outbox identity (AD-5, AD-19).** Attribution comes from the token ("never from the request body"). Commands that Caregiver A queues offline would therefore be replayed under Caregiver B's token if B signs in on the same tablet. That breaks FR-1 attribution and SM-4. The spine also doesn't say whether sign-out clears the Dexie database. *Fix:* add to AD-5: every outbox command carries the enqueuing `sub`. It is replayed only while that same `sub` is signed in, and otherwise held. Sign-out from the Family clears Family data from Dexie, apart from that Caregiver's own unsent commands, which stay encrypted or are discarded once the Caregiver confirms.

- **[medium] Concurrent Observation edits are silently last-write-wins (AD-5, AD-7).** Observation is not in AD-5's versioned list. Under AD-7 every edit appends a revision and "the current state is the latest revision". Two Caregivers editing the same Observation offline therefore produce exactly the silent overwrite that AD-5 says it prevents. A Summary draft that two Caregivers edit has the same problem. *Fix:* an Observation edit carries the `base_revision_id` it was made from, and a mismatch returns `409` with the same keep-and-reapply UX. Add `Summary` (the draft) to the versioned list.

- **[low] The guardrail check is not yet enforced by types (AD-9).** "Passes `Guardrail.check()` before any endpoint returns it" depends on discipline. *Fix:* the check returns a `CheckedSuggestion`/`CheckedTip` that only `Guardrail` can construct, and web DTOs for suggestions and tips accept only that type. An ArchUnit rule then enforces it.

## 2. Operational envelope — thin

Deployment and environments (AD-20, the environment table), the infrastructure and provider strategy (Deferred, with a reason), TLS (AD-22) and log content (AD-18) are all covered. Migrations, backups, event delivery, secrets and basic monitoring are not.

### Findings

- **[high] Backups conflict with the deletion promise, and part of the data has no backup (environment table: "nightly `pg_dump` backups").** §5 says deletion "becomes permanent" after 7 days, and AD-15 leaves only a tombstone. Purged Family data, however, survives in nightly dumps for as long as those dumps are kept, and retention is not stated. The storage volume (encrypted originals) and the AES key are not backed up at all. If the key is lost, every original is unreadable. *Fix:* add one AD or a convention row covering: backup retention ≤ N days, published as part of the deletion promise; whether a restore re-applies tombstones (the purge job runs again against `families` IDs in the tombstone table after any restore); storage-volume backup on the same schedule; and the encryption key stored separately from the data backups.

- **[medium] Migration ownership is undefined (Stack: "Flyway"; AD-1: "each owns its own tables").** Builders on different modules will each add `V<n>__*.sql` to one shared sequence and collide, or one will put Flyway folders per module and another a single folder. The startup content loader (AD-17) also needs a fixed order relative to Flyway. *Fix:* add a convention: one Flyway history, files in `db/migration/<module>/`, with a timestamped version (`V2026110512__goals_add_x.sql`), and `outOfOrder` set explicitly. Migrations are forward-only and must be backwards-compatible with the previous image (expand, then contract). The content loader runs after Flyway.

- **[medium] Event delivery semantics are unspecified (AD-1, AD-7, AD-9, AD-15).** The audit log, the Restriction created from a Child Profile sensitivity, the notice to remaining Caregivers when one is removed, and reminders all ride on domain events. One builder will use synchronous `@EventListener` in the same transaction. Another will use `@ApplicationModuleListener` (async, after commit) with no publication registry, and that loses audit rows on a crash. §5 requires a complete audit log. *Fix:* add to AD-1: cross-module events use `@ApplicationModuleListener` with the Spring Modulith JPA event publication registry turned on, and incomplete publications are resubmitted at startup. Event payloads carry `family_id` and IDs only (AD-18). Listeners are idempotent by event ID.

- **[medium] The sign-in audit has no source (AD-7, §5 "audit log records sign-ins").** Sign-ins happen in Keycloak, and the app only sees tokens. One builder will add a Keycloak event-listener SPI, and another will log the first API call for each session. *Fix:* decide in AD-3. A suggested rule: the app records `CaregiverSignedIn` the first time it sees a new token `sid`, and Keycloak's own event store is not the audit log.

- **[low] Secrets and keys are not listed.** "No secrets in the repo" and "the key from the environment" leave the VAPID keypair (web push), the Keycloak client and admin credentials, the hosted AI key and the AES key without rotation guidance. The AES ciphertext has no key ID either, so the key can never be rotated. *Fix:* add a single convention row: secrets come only from the env-file (`prod.env`, outside the repo, mode 600); ciphertext is prefixed with a `key_id` so keys can be rotated; and list the secrets in `deploy/local.env.example`.

- **[low] Liveness and job health are not covered.** Choosing an observability backend can reasonably wait. Knowing when the reminder or purge job has stopped running cannot, because purge is a privacy promise. *Fix:* in the Deferred observability bullet, state that Actuator health and a `last_run_at` per scheduled job are exposed from day one.

## 3. Deferred items — adequate

None of the Deferred items lets two units diverge. Running more than one instance, the shipping host, the email provider, the PDF layout, the observability backend, v2 tenancy and share-target import are all either behind a port or contained by an AD. One item to watch: the Deferred "Production host and provider" depends on AD-20 being true. That holds only if TLS termination (a reverse proxy in `compose.yaml` or one supplied by the host) is a deployment detail and not app code, so it is worth one clause in AD-20.

## 4. FR coverage (FR-1 to FR-18) — adequate

Every FR appears in the Capability Map with a module and governing ADs. The gaps are in how the coverage is wired, not in what is covered:
- FR-13 push reminders: the spine doesn't say where push subscriptions live (per Caregiver, per device) or whether reminder time and `next_reminder_at` are per Caregiver or per Family. FR-13 lets "Caregivers" change their own timing. *Fix:* one line in AD-14: push subscriptions and reminder preferences are per Caregiver in `notifications`, and `next_reminder_at` is per Caregiver.
- FR-3 and the Units convention: the per-Family editable Prompt Level list and the per-Care-Team-Member Prompt Level mapping have no named owning module. *Fix:* name `careteam` (or `goals`) in the Capability Map.
- FR-17 and FR-18 depend on the missing edges in §1.
- AI cost ceiling (§10.2-2): there is no per-Family metering. This is low risk at pilot scale, but a counter of AI calls per Family per month in `ai` (AD-18 already allows counters) would make the US$5 ceiling checkable.

## 5. Rules enforceable and preventing their stated divergence — strong

AD-1, AD-2, AD-4, AD-8, AD-12, AD-15, AD-16, AD-18 and AD-21 can be checked by tests or types. AD-6 removes the "add Mark to an open session" endpoint outright, which is the right way to make it enforceable. AD-13's "no code copies items from one week's Plan to the next" is weaker but acceptable, because the `(family_id, week_start_date)` key carries most of the weight. AD-9 would be stronger with the type-level gate suggested in §1.

## 6. Leanness — strong

The spine stays at the right altitude. The Stack, Structural Seed and entity sketch don't cross into story detail, and the Open Questions are real decisions with triggers for revisiting them. The fixes above add rows and clauses, not new sections.
