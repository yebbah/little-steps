---
title: 'Reconcile: Architecture Spine vs load-bearing inputs'
target: little-steps/.specs/planning-artifacts/architecture/architecture-little-steps-2026-11-05/ARCHITECTURE-SPINE.md
inputs:
  - little-steps/.specs/planning-artifacts/prds/prd-little-steps-2026-11-05/prd.md
  - little-steps/.specs/planning-artifacts/prds/prd-little-steps-2026-11-05/addendum.md
  - little-steps/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/EXPERIENCE.md
  - little-steps/.specs/planning-artifacts/ux-designs/ux-little-steps-2026-11-05/DESIGN.md (skimmed for architecture-relevant constraints)
created: '2026-11-05'
scope: architecturally consequential gaps only (UI detail excluded)
---

# Reconcile: Architecture Spine vs PRD, Addendum, EXPERIENCE

## Verdict

The spine covers the headline requirements: offline outbox, client-owned Practice Session, one Restriction store, AI task allow-list, tenancy, purge by cascade. Several quiet requirements still didn't land. Two UX rules contradict the spine directly: concurrent edits keep both versions, and Undo is offered on saved entries. Several more have no mechanism: auth session lifetime and draft survival across re-sign-in, the offline snapshot's freshness and safety, share/export auditing, deletion completeness (identities, backups, pilot end), reminder scheduling semantics, and the cost ceiling. None of these needs a paradigm change. Each needs an AD amendment or a new AD.

Severity: **High** means it contradicts an input, or builders would diverge on it and break a stated guarantee. **Medium** means a quiet requirement has no home and stories would have to invent one. **Low** means it's worth a line in the spine.

---

## A. Contradictions (spine vs inputs)

### A1. Concurrent edits: 409 re-apply vs "both save as versions" — High
- **Input:** EXPERIENCE › State Patterns › Two Caregivers at once: "Two edits to the same record both save as versions in its History, newest shown." The same section says "nothing is merged or overwritten".
- **Spine:** AD-5 makes a stale `If-Match` return `409`, and the client shows its draft next to the server copy for manual re-apply. AD-7 keeps revision history only for Observations.
- **Consequence:** The UX expects every shared, editable record (Goal, Child Profile, Care Team Member, Plan, Strategy/Restriction) to have a version history and to accept both writes. The spine rejects the second write and keeps no history for those records. Builders will either add per-record history tables or follow AD-5, and the screens will disagree.
- **Proposed fix:** Pick one model in AD-5/AD-7. Either (a) every shared, editable record gets an append-only `<entity>_revision` table like Observations, and a stale write is stored as a new revision (latest wins, both visible in History), or (b) the UX is amended to the 409 re-apply flow. The PO has to choose. Option (a) fits the UX and FR-1 attribution better.

### A2. Undo on saved one-tap actions vs append-only Observations — High
- **Input:** EXPERIENCE › Interaction Primitives: "Undo over confirm" applies to Not attempted (and Review saved), "lasts until the next action, with no time limit". The status line "That's okay — logged as not today · Undo" appears after the Save.
- **Spine:** AD-7 says Observation rows are never deleted except by purge. AD-5 enqueues on Save, and the command may already be synced when the Caregiver taps Undo.
- **Consequence:** There is no defined way to undo a synced Observation. Builders will add a DELETE (breaking AD-7), or quietly drop Undo.
- **Proposed fix:** Add to AD-7: "Undo of a saved Observation appends a `voided` revision (excluded from progress, Summaries and active-day counts) or, if the command is still unsent, removes it from the outbox. There is no DELETE endpoint."

---

## B. Quiet requirements that didn't land

### B1. Session expiry, re-sign-in in place, and draft survival — High
- **Inputs:**
  - EXPERIENCE › State Patterns › Session expired: "Sign in again in place; the app returns to the same screen with the draft intact."
  - EXPERIENCE › Accessibility Floor › Time limits: "The Practice Session never times out."
  - EXPERIENCE › Interaction Primitives › Back: never discards an unsaved Review.
  - PRD §6 Resilience.
- **Spine:** AD-5 pauses the outbox on `401` "until the Caregiver signs in again". AD-3 uses an authorization code + PKCE public client. Nothing covers token lifetime, refresh, or how a draft survives the redirect.
- **Consequence:**
  - An OIDC sign-in is a full-page redirect to Keycloak. It unloads the SPA, so in-memory form state and the route are lost unless they are already in Dexie.
  - Keycloak's default SSO idle timeout (about 30 minutes) is far shorter than a Practice Session left open while the phone sleeps, or a PWA reopened days later offline.
  - Without a refresh-token policy, Caregivers will be bounced to sign-in constantly. Offline, they can't sign in at all, but they must still be able to queue writes.
- **Proposed fix:** Add to AD-3/AD-19:
  - Every in-progress form, Review and Practice Session autosaves to Dexie on change, not only on Save.
  - The pre-redirect route is stored and restored after the callback.
  - The realm uses rotating refresh tokens, with an idle and max lifetime sized for the pilot (for example, days or weeks, not minutes).
  - An expired token never blocks local reads or `outbox.enqueue`. It only pauses replay.

### B2. Offline snapshot: contents, freshness, Restriction safety, eviction, device wipe — High
- **Inputs:**
  - PRD §6 Resilience: "The Prep cards and starter Coach Tips for the current Plan are available offline."
  - EXPERIENCE › Loading: curated content "loads from the device first".
  - Addendum §B: WebKit can clear stored data, "drafts kept offline must sync promptly".
  - PRD §5: Restrictions are "always checked before any suggestion is displayed".
  - EXPERIENCE › Removed Caregiver: the removed device "Signs them out".
- **Spine:** AD-19 says Dexie holds "current Plan, its Prep cards and curated tips". AD-9 checks suggestions "before any endpoint returns it". No AD says what is cached, when it is refreshed, or when it is wiped.
- **Gaps:**
  1. **Guardrail on cached content.** Curated tips shown offline come from Dexie, not from an endpoint, so AD-9's "before any endpoint returns it" doesn't cover them. The snapshot must hold only the already-checked set: per Activity × all 4 Marks × the relevant Contexts, ordered helpful-first, and personalised by interests if tips are templated.
  2. **Invalidation.** A new Restriction (Appointment Feedback, Child Profile "avoid") or a Strategy edit changes Prep card and tip content. Nothing forces the device snapshot to refresh. A Restriction recorded offline on this device isn't applied to that device's cached tips.
  3. **Refresh triggers.** Background Sync is not available in Safari or Firefox. Replay and snapshot refresh must run on app open, `visibilitychange`, `online` and after each Save. This is not stated.
  4. **Eviction.** The spine doesn't call `navigator.storage.persist()` or handle a Dexie that was evicted while unsynced commands were in it. On iOS, the browser tab and the installed home-screen app have separate storage. Safari's 7-day cap on script-writable storage applies to sites that aren't installed.
  5. **Device wipe.** Nothing clears Dexie (child content, drafts, outbox) on sign-out, on removal from the Family, on Family purge, or when a different Caregiver signs in on the same device.
- **Proposed fix:** Add an AD "Offline snapshot":
  - One server-built `GET /api/v1/offline-snapshot` (guardrail-checked, versioned by a content hash) is the only source of offline Prep and tip content.
  - It is refreshed on open, focus, `online` and any `RestrictionChanged`/`StrategyChanged`/`PlanChanged` event.
  - The app requests persistent storage and shows an unsynced count.
  - The whole Dexie database is cleared on sign-out, `membership-revoked`, `family-purged` or a change of Caregiver `sub`. Unsynced commands are confirmed with the Caregiver first, where possible.

### B3. Outbox behaviour on non-401 rejections (membership revoked, consent, deletion) — Medium
- **Inputs:** EXPERIENCE › Removed Caregiver ("You're no longer part of this family." and sign-out). Deletion pending lasts 7 days, and its effect on writes isn't specified. AD-3 has `consent-required`.
- **Spine:** AD-5 defines only 2xx, 409 and 401.
- **Consequence:** A removed Caregiver's queued commands will retry forever, or the builder will discard them silently. What happens to writes during the deletion window is undefined.
- **Proposed fix:** Extend AD-5 with an outbox outcome for each problem type:
  - `membership-revoked`: stop replay, wipe per B2, show the removed state.
  - `consent-required`: pause replay.
  - `validation` 4xx: park the command with its draft for the Caregiver.
  - State in AD-15 whether writes are accepted while `purge_after` is set (recommended: yes, so undo is lossless).

### B4. Compound commands: New Goal Period, Appointment Feedback, two-Activity Review — Medium
- **Inputs:** EXPERIENCE › New Goal Period. "Start new period" closes the old period, closes revised predecessors, creates the revised and new Goals, and moves the carried-over ones. "The draft is kept on this device until started or discarded", and it can be queued offline. Appointment Feedback sets statuses, Review Status changes, new Strategies and Restrictions, and "Was the summary useful?" in one save.
- **Spine:** AD-6 defines a compound command only for Practice Sessions. AD-5's `If-Match` is per record. AD-4 covers "every form draft" IDs but not multi-record atomicity.
- **Consequence:** Builders may emit N separate PUTs. A partial replay (for example, the old period closed but the revised Goals not created), or a 409 on one of N Goals, leaves lineage inconsistent. FR-6 history depends on that lineage.
- **Proposed fix:** Add to AD-4/AD-5: "`StartGoalPeriod` and `RecordAppointmentFeedback` are single idempotent commands, each with a client UUIDv7. They carry the client-generated IDs of every Goal, Strategy and Restriction they create, plus the `version` of every record they close or change. They apply atomically or return one 409 listing the stale records. The draft stays in Dexie until 2xx."

### B5. Share/export audit and the PDF/share-sheet fallback — Medium
- **Inputs:**
  - PRD §5 says the audit log records "exports, shares".
  - FR-17 requires confirmation before sharing, a PDF export, or the device share sheet.
  - Addendum §B says the Web Share API is used, with PDF download as the fallback.
  - EXPERIENCE › Platform notes cover the same fallback.
- **Spine:** The map cites "AD-7 (audit of shares)". AD-7's audit consumes server events. The Deferred list fixes server-side openhtmltopdf "from the stored Summary snapshot".
- **Gaps:**
  1. The share happens on the client (`navigator.share` or a download), so the server never sees it unless a command records it. No `SummaryShared`/`SummaryExported` command is defined.
  2. `navigator.share({files})` needs transient user activation. If the PDF is rendered on the server after the tap, the activation can expire (Safari especially) and the share fails. The PDF must be fetched before the Share tap, for example when Confirm-to-share opens. The fallback is decided by `navigator.canShare({files})`, not by browser sniffing.
  3. The PDF render needs a connection. The offline behaviour of Share isn't stated.
  4. The snapshot that was shared must be frozen. Later edits, and SM-3 feedback linked to that Summary, must refer to the exact shared version.
- **Proposed fix:** Add an AD under `summary`:
  - Confirm-to-share issues `ConfirmSummaryShare(summaryId, snapshotVersion, channel ∈ {share_sheet, pdf_download})`, which freezes the snapshot and emits the audit event.
  - The client prefetches the PDF blob before showing the Share button, and falls back on `canShare` failure.
  - Share is "Needs a connection" offline.

### B6. Deletion completeness: identities, backups, pilot-end schedule, export delivery — High
- **Inputs:**
  - PRD §5: "Any Caregiver can delete all of the Family's data". Pilot end: "Families can export their data, and all remaining data is deleted on a schedule that was announced in advance". "Caregivers can export all of their data."
  - Addendum §A.1: nightly backups.
- **Spine:** AD-15 purges by `families` cascade and the storage prefix. AD-14 lists pilot-end deletion as a bound concern. The Structural Seed schedules nightly `pg_dump`.
- **Gaps:**
  1. **Keycloak identities.** Caregiver email addresses and accounts live in Keycloak (AD-3). Neither Family purge nor pilot end deletes them.
  2. **Backups.** Nightly `pg_dump` copies keep "deleted" Family data with no stated retention. Purge is not actually permanent until the backups age out.
  3. **Pilot end.** There is no mechanism: no configured pilot-end date, no announcement notice to every Family (banner and email), no bulk export window, and no bulk purge reusing the AD-15 path.
  4. **Export delivery.** `ExportContributor` defines the contributions but not the format, whether originals are decrypted into the export, async generation, where the artifact is stored (it must sit under `families/{id}/` so purge removes it), link expiry, or the `DataExported` audit event.
  5. **Other stores.** Push subscriptions, email-provider logs, and the AD-12 import artifacts (masked text, page images) also need to be inside the purge boundary.
- **Proposed fix:** Extend AD-15:
  - Purge also deletes the Keycloak users who have no other Family (through an `IdentityPort`) and the push subscriptions.
  - Backups are retained for at most N days (stated), so permanent deletion completes within 7 + N days.
  - Pilot end is a configured `pilot_end_at`. A due job sends the announcement at T-30 days and then calls the same purge for every Family.
  - Export is an async job that writes an encrypted archive under the Family storage prefix, with an expiring download, and is audited.

### B7. Reminders and security notices: ownership, timing, and catch-up — Medium
- **Inputs:**
  - FR-13: "a time chosen during onboarding". Caregivers can change the timing.
  - EXPERIENCE › Notifications: push at most one per Plan day at the chosen time, never on non-Plan days. Security notices reach the remaining Caregivers by banner, email and push, are never batched with reminders, and are dismissible per Caregiver.
  - Addendum §A.1: "Reminders only send while the Mac is awake."
  - FR-1: the remaining Caregivers are notified.
- **Spine:** AD-14 has `next_reminder_at` and "one reminder per Plan day". `notifications` consumes events. Nothing else.
- **Gaps:**
  1. **Granularity.** It isn't said whether reminder time and opt-in are per Caregiver or per Family. Push subscriptions are per Caregiver per device, and there is no owner or entity for them in the ER diagram or module map.
  2. **Timezone.** Reminder time is evaluated in the Family timezone (AD-13), but co-caregivers may be on devices in other timezones. This needs a decision, even if it is "Family timezone".
  3. **Catch-up after downtime.** A due-state job (AD-14) that wakes after the host slept will send every overdue reminder, possibly hours late (for example, at 3 a.m.). It needs a send window: skip reminders more than X minutes past due and roll `next_reminder_at` forward.
  4. **"Plan day" definition.** Plan items have an optional day. If no item has a day, it's unclear whether every day of the week counts as a Plan day. This drives the job's rule.
  5. **Security-notice delivery.** The email goes to "each Caregiver's sign-in address", but the app doesn't hold email addresses (Keycloak does, AD-3). The per-Caregiver banner dismissal needs a `notice_receipt` record. Notices must bypass the reminder rate limits.
  6. **Removed or deleted actors.** The display name must still resolve after the Caregiver is removed.
- **Proposed fix:** Add an AD under `notifications`:
  - Reminder preferences and `push_subscription` are per Caregiver, owned by `notifications`, and evaluated in the Family timezone by `FamilyCalendar`.
  - The job skips reminders more than 60 minutes overdue.
  - The Plan-day rule is defined (with or without assigned days).
  - Security notices are a separate channel with per-Caregiver receipts, are never rate-limited, and are sent by email from a Caregiver profile (see B8).

### B8. Caregiver profile, sign-in audit, and attribution after removal — Medium
- **Inputs:**
  - PRD §5: the audit log records "sign-ins".
  - EXPERIENCE: `<Caregiver>` is "the account display name". "Everything they logged stays" after removal. Observation history shows the editor.
- **Spine:** AD-3 keys the Caregiver by `sub`, and Keycloak holds "credentials and login only". AD-7's audit consumes app events.
- **Gaps:**
  - Sign-ins happen in Keycloak, not in the app, so no app event exists to audit.
  - The display name and email the app needs (attribution, notices, invites) have no stated source or sync rule.
  - Nothing says the Caregiver row and display name survive leaving or removal, which attribution of retained Observations depends on.
- **Proposed fix:** Amend AD-3/AD-7:
  - The app upserts `caregiver(sub, display_name, email)` from token claims on each sign-in, and emits `CaregiverSignedIn` (once per new session, `sid` claim) to `audit`.
  - Caregiver rows outlive membership. Only Family purge, or identity deletion with no other Family, removes them.

### B9. Cost ceiling (US$5 per Family per month) has no mechanism — Medium
- **Inputs:** PRD §10.2-2. Addendum §A.1 and §A.5 say the hosted model is kept within the ceiling.
- **Spine:** The ceiling is mentioned only in the Structural Seed table and OQ-2.
- **Consequence:** AI Coach Tips fire on every Mark, Summaries regenerate, and imports are large. Nothing meters or caps per-Family spend, so a heavy Family, or a retry loop, can exceed the ceiling unseen.
- **Proposed fix:** Add to AD-10:
  - Each `AiTask` declares a max input/output token budget.
  - `ai` keeps a per-Family monthly usage counter (tokens and estimated cost, IDs only) and exposes it as a metric.
  - Above a configured soft cap, AI tasks degrade to curated-only / "Needs a connection"-style fallbacks instead of calling the provider.

### B10. Tip latency (≤ 2 s) and long-running AI tasks — Medium
- **Inputs:**
  - FR-12 and §6: tips in under 2 seconds, curated first.
  - EXPERIENCE › Coach Tip sheet: AI tips arrive later, "when ready".
  - EXPERIENCE › Generating: the Summary draft and import extraction show progress, the screen stays usable, and "Cancel available".
  - EXPERIENCE › AI slow or unavailable: fall back silently.
- **Spine:** AD-19 caches curated tips. AD-6 says AI tip requests are read-only. There is no timeout, async pattern or cancellation.
- **Gaps:**
  - The spine doesn't state that curated tips render from Dexie with no network call. That is the only way to meet 2 s offline or on slow links.
  - AI tips have no timeout budget. AD-9's fail-closed guardrail adds latency.
  - Summary drafting and import extraction on a local model can take tens of seconds, so a synchronous HTTP call would hit proxy or Spring timeouts and can't be cancelled.
- **Proposed fix:**
  - Add to AD-10: AI tips use a hard server timeout (for example, 8 s) after which nothing is returned.
  - `DraftSummaryText`, `DescribeProgress` and `ExtractDraftItems` run as an async `ai_job` resource (`POST` to start, `GET` to poll, `DELETE` to cancel), with results persisted under the Family.
  - Add to AD-19: curated tips for a Mark are rendered from the offline snapshot with no network round trip.

### B11. Stale-session (12 h) semantics and tip-display data — Low
- **Inputs:**
  - EXPERIENCE › Stale open Practice Session: after 12 h, Today opens with "Review it" or "Close without review (saves nothing)".
  - SM-7: at least 40% of Coach Tip displays after a Mark are marked helpful.
- **Spine:** AD-6 says the stale-session prompt goes through `CompletePracticeSession`, but "Close without review" sends nothing. AD-6 also says tip requests persist nothing.
- **Consequences:**
  - The spine's wording is ambiguous about whether "Close without review" emits a command.
  - The 12 h clock is the client's (`started_at` in Dexie), which should be stated.
  - If tip displays are never persisted, SM-7's denominator can't be computed.
- **Proposed fix:**
  - Add to AD-6: the 12 h threshold is evaluated on the client from the Dexie `started_at`.
  - "Close without review" discards the local session and emits only an IDs-only counter.
  - `CompletePracticeSession` carries the IDs of the tips displayed for each Mark (curated slug or AI flag) and the Helpful flags, so SM-7 and "helpful first" can be computed.

### B12. Pilot metrics vs "no operator access to Family content" — Medium
- **Inputs:**
  - PRD §9: SM-1 to SM-7, including SM-2, a monthly in-app check-in ("easier, the same, or harder?"), which no FR or spine element covers.
  - PRD §5: operators have no access to Family content.
- **Spine:** AD-2 says no operator role can read Family content. AD-18 keeps AI metrics as counters. There is no metrics path for product success measures, and no check-in entity or prompt schedule.
- **Consequence:** Computing SM-1, SM-3, SM-4 and SM-7 means querying Family-scoped tables across tenants, which AD-2 forbids by construction. Builders will either bypass the tenant resolver or the metrics won't exist.
- **Proposed fix:** Add an AD: "Pilot metrics are emitted as IDs-free aggregate counters or a nightly per-Family aggregate row (counts only, pseudonymous Family key) in a global `pilot_metric` table listed in `GLOBAL_TABLES.md`. The SM-2 check-in is a Family-scoped `checkin_response` with a monthly due-state prompt (AD-14)."

### B13. Invite-only pilot and "no account is created" — Medium
- **Inputs:**
  - UJ-0: the first Caregiver arrives through a pilot invite link.
  - EXPERIENCE › Invite invalid or expired: "No account is created."
  - PRD §8.1: invite-only. §8.2: no public self-serve sign-up.
- **Spine:** AD-3 covers only co-caregiver invites issued by the app. It doesn't cover Keycloak self-registration.
- **Consequence:**
  - If Keycloak self-registration is open, anyone can create an account, and an expired invite still leaves an account behind.
  - If registration is closed, invited people can't sign up.
  - Pilot-entry invites, which create a new Family, have no issuer.
- **Proposed fix:** Add to AD-3:
  - The app validates the invite token before handing off to Keycloak registration.
  - Registration is gated so it is reachable only with a valid invite, for example a Keycloak registration flow step that calls the app, or an account created through the admin API on acceptance.
  - Pilot-entry invites are issued by an operator CLI or job. They never give the operator access to Family content.

### B14. Summary PDF rendering constraints from DESIGN.md — Low
- **Inputs:**
  - DESIGN.md › Summary document: the same tokens at 0.8× and a Performance ink-line chart in greyscale.
  - DESIGN.md › Typography: the system font stack and nothing downloaded.
- **Spine:** The Deferred list fixes openhtmltopdf server-side.
- **Consequence:**
  - openhtmltopdf has no access to the device's system fonts, and it supports only a subset of CSS (limited flex/grid).
  - Charts need SVG rendering (the Batik plugin) or pre-rendered SVG.
  - Builders will discover this late.
- **Proposed fix:** Add one line to the Deferred PDF note: the renderer embeds a bundled open font (with a metric-compatible fallback), renders charts from server-generated SVG, and uses a print stylesheet limited to the CSS subset openhtmltopdf supports.

---

## C. Landed adequately (no action)

- **Offline-tolerant Practice Session (§6 Resilience):** AD-5, AD-6.
- **Restriction precedence and fail-closed checks:** AD-9, with the cached-content caveat in B2.
- **Masking before AI, and originals encrypted with a retention timer:** AD-12, AD-14, AD-22.
- **No AI goal status; cited descriptive text:** AD-11.
- **Weeks start fresh, no rollover, Family timezone:** AD-13.
- **7-day undoable Family deletion:** AD-15, with the completeness gaps in B6.
- **Logs never contain child content:** AD-18.
- **English-only release with copy kept out of code:** AD-17.
- **Runs locally at no cost and portable by configuration:** AD-20.
- **Guardrail evaluation as a release gate:** AD-21.
- **Install not required, and no service-worker API caching:** AD-19, AD-20.
