---
epic: 3
title: Sign-in, Family and consent
status: approved
phase: P1
---

# Epic 3: Sign-in, Family and consent

A Caregiver with an invite signs in, gives consent, creates a Family, and invites a co-caregiver, who joins and sees the same Family. Caregivers can leave or be removed, and the others are told. This epic also adds the audit table and a maintainer console for operator tasks.

**Build order (sprint change 2026-11-09):** this epic is built after Epic 13. Family tenancy (the `families` and membership tables, the tenant resolver and the isolation test) and the device data layer (outbox, Dexie, drafts) are built earlier, in [Epic 25](epic-25-demo-family-foundations.md), together with a demo identity that stands in for sign-in until this epic lands. This epic builds on them and replaces the demo identity as the default local mode.

**Done when:**
- A maintainer issues a pilot invite from the maintainer console. The invitee opens the link, creates an account, reads the three consent cards, agrees, and creates a Family.
- That Caregiver invites a co-caregiver, who accepts, gives their own consent and joins the same Family. The first Caregiver sees a "joined" banner and gets an email in Mailpit.
- One Caregiver removes the other. The removed device shows "You're no longer part of this family." and signs out, and the remaining Caregiver gets the security notice by banner and email.
- An expired or used invite never creates an account. A Caregiver with no invite gets `invite-required`, and one with no consent gets `consent-required`.
- The cross-Family isolation test from Epic 25 still passes with real sign-in: one Family can never read another's rows.
- The demo identity from Epic 25 is no longer the default local mode: a local run signs in through Keycloak, and the demo mode stays an opt-in flag.
- The Definition of done in the index is met (clean scan, full test suite passing, release note).

## Requirements covered

- **FRs:** FR-1 (accounts, consent, Family, invites, membership, attribution groundwork)
- **NFRs:** NFR-4 (access), NFR-5 (audit events recorded; the viewer comes in Epic 17), NFR-6 (TLS and encrypted storage carried from Epic 1)
- **Architecture:**
  - AD-2 (tenancy by construction, `GLOBAL_TABLES.md`, native SQL check)
  - AD-3 (Keycloak credentials; the app owns Family, membership, consent and invites)
  - AD-4 (UUIDv7, idempotent `PUT` creates) for the first Family records
  - AD-5 (one command outbox per `sub`) and AD-23 (TanStack Query, Dexie)
  - AD-8 (Family `timezone` and `week_start`)
  - AD-16 (deletion request with `purge_after`, recorded only)
  - AD-17 (security notices are their own category, never suppressed)
- **UX-DRs:**
  - UX-DR84 (consent cards)
  - UX-DR85, UX-DR86 (destructive confirm: remove a Caregiver, leave the Family)
  - UX-DR87 (invite caregiver)
  - UX-DR88 (onboarding: the Consent → Family steps and the optional invite step)
  - UX-DR100 (session expired mid-task)
  - UX-DR104 (consent not given)
  - UX-DR105 (invite invalid or expired)
  - UX-DR108 (deletion pending banner, for the last-Caregiver-leaves case)
  - UX-DR109 (removed Caregiver's device)
  - UX-DR125 (security notices: join, leave, remove; banner and email)
- **Decisions agreed while writing these stories (2026-11-06):**
  - Invites (pilot and Family) expire after 7 days and are single-use.
  - Epic 3 delivers security notices by banner and email. Epic 16 adds push and the deletion notices.
  - When the last Caregiver leaves, the 7-day Family deletion starts. That Caregiver can undo it by signing in again before the date.
  - Operator tasks live in an in-app maintainer console, gated by a Keycloak realm role `maintainer`. A maintainer can never read Family content (AD-2). Its first tool is pilot invites. The console lives in a new platform module `operator` that depends only on `family.api` and `notifications` (proposed AD-29; the PRD and UX addenda follow).
  - An invite can be accepted only by an account whose verified email matches the invited email.
  - Audit recording is its own story (3.7), separate from Family creation.
- **Not in this epic:**
  - Onboarding steps Child Profile, Care Team Member and first Goal come in Epics 4 and 5. They slot in between Family and the invite step.
  - Push delivery of security notices and the deletion notices come in Epic 16.
  - The audit log viewer, Delete Family from Settings, and the purge job come in Epic 17.
  - Support access (architecture OQ-1) is decided before the pilot launches.

## Stories

### Story 3.1: Sign in and sign out

As a Caregiver,
I want to sign in with my own login on any supported browser, installed or not,
So that my family's information is only reachable by me and the people I invite.

**Acceptance Criteria:**

**Given** the PWA and the `littlesteps-pwa` Keycloak client from Epic 1
**When** a signed-out person opens the app
**Then** a sign-in screen with copy from the catalog offers "Sign in" and "Create account". Both go to Keycloak using the authorization code flow with PKCE (S256). Tokens live in memory, and the refresh token rotates (AD-3).
**And** the backend validates the JWT as an OAuth2 resource server on `/api/**`. A request without a valid token gets `401` as an RFC 9457 problem.

**Given** a valid token for a `sub` the app has not seen
**When** the first API request arrives
**Then** a `caregiver` row keyed by `sub` is created, and display name and email are upserted from the token claims on each new session (AD-3). `caregiver` is listed in `backend/GLOBAL_TABLES.md`.
**And** the first request under a new session ID publishes `CaregiverSignedIn` with IDs only (AD-19).

**Given** a signed-in Caregiver with no accepted invite and no membership
**When** they call any `/api/v1` endpoint other than the session and invite endpoints
**Then** they get problem type `invite-required`, and the app shows "LittleSteps is invite-only for now. Ask the person who told you about it to send you an invite." with "Sign out".

**Given** a signed-in Caregiver
**When** they choose "Sign out"
**Then** the Keycloak session ends, in-memory tokens are cleared, and the device data is wiped (AD-5). They return to the sign-in screen.
**And** tests cover: a missing token, an expired token, a token for another realm, the first-request upsert, and `invite-required`.

### Story 3.2: Signing in again in place

As a Caregiver,
I want my session to renew without losing what I was typing,
So that a timeout never costs me my work.

This story builds on the device data layer from Story 25.2 (TanStack Query, Dexie, the outbox, `useDraft`), which moved to Epic 25 in the 2026-11-09 sprint change.

**Acceptance Criteria:**

**Given** a Caregiver mid-form whose session has expired
**When** the outbox or a query gets `401`
**Then** replay pauses, and the Caregiver signs in again in place (a Keycloak redirect that returns to the same route). The draft is restored and replay resumes (UX-DR100).
**And** if a different `sub` signs in, Dexie is wiped before anything is shown, and no command from the previous Caregiver is replayed.

**Given** the test suite
**When** it runs
**Then** unit and end-to-end tests cover: 401 pause and resume, draft restore after re-sign-in, and the wipe on user change. The consent command in Story 3.5 is the first real command to use the outbox with a real session.

### Story 3.3: Maintainer console and pilot invites

As a maintainer,
I want an in-app console where I can issue and manage pilot invites,
So that I can let new families into the pilot without touching the database or reading anyone's data.

**Acceptance Criteria:**

**Given** a Keycloak realm role `maintainer`, added to `deploy/keycloak/littlesteps-realm.json`, and a fictional local user `maintainer@example.test` that has it
**When** a Caregiver without the role opens `/maintainer` or calls `/api/v1/maintainer/**`
**Then** the route is not shown in navigation, the screen says "This area is for maintainers.", and the API returns `403` as a problem.
**And** the console's backend lives in a new platform module `operator`. Its `package-info.java` allows only `family.api` and `notifications`, and `ModularityTests` enforces this.

**Given** a signed-in maintainer
**When** they open `/maintainer`
**Then** the console shows a "Pilot invites" section. It is built from the Epic 2 shared components, with copy from the catalog, and is outside the five-destination nav.
**And** the maintainer can enter an email and choose "Send invite". This creates a single-use pilot invite (`kind = pilot`, which allows creating a Family) that expires in 7 days, and emails the link through the `notifications` email port (Mailpit locally).
**And** the list shows each pilot invite's email, status (pending, accepted, expired, cancelled) and sent and expiry dates, with Resend (a new token and expiry; the old token stops working) and Cancel.
**And** the invite token is random (at least 128 bits) and stored only as a hash. `invite` is listed in `GLOBAL_TABLES.md` as global before acceptance (AD-2).
**And** maintainer endpoints never return Family content. A test asserts the maintainer role resolves to no tenant and gets `403` on every Family endpoint.
**And** each issue, resend and cancel is written to the application log with IDs only.

### Story 3.4: Accept an invite link

As an invited person,
I want the invite link to take me straight to creating my account,
So that joining is simple, and a dead link tells me plainly what to do.

**Acceptance Criteria:**

**Given** an invite link `/invite/{token}`
**When** it is opened by anyone, signed in or not
**Then** the app first calls the public `GET /api/v1/invites/{token}`, which returns only the invite's status and kind, never an email or Family detail.

**When** the invite is expired, cancelled, already used or unknown
**Then** the app shows "This invite has expired. Ask the person who invited you to send a new one." No Keycloak redirect happens, and no account is created (UX-DR105).

**When** the invite is valid
**Then** the person goes to Keycloak "Create account" (or sign in, if they already have one). Afterwards they return to the app, which calls `POST /api/v1/invites/{token}/accept`.
**And** the token survives the whole round trip, including a Keycloak email-verification link that opens in a new tab. It is carried in a short-lived, `HttpOnly`, `SameSite=Lax` cookie set by the status call, never in session storage. A test covers verification in a new tab.

**Given** a signed-in person accepting a valid invite
**When** their verified email (from the token, compared case-insensitively) does not match the invited email
**Then** acceptance fails with `invite-email-mismatch`, nothing is consumed, and the app shows "This invite was sent to <masked email>. Sign in with that address, or ask for a new invite." with "Sign out". The masked email shows only the first character and the domain.
**And** an account whose email is not yet verified gets `email-not-verified` and is asked to verify first.
**And** acceptance is single-use and atomic: two concurrent accepts of the same token give one success and one `invite-used`.
**And** accepting a pilot invite records that the Caregiver may create a Family, and the app continues to consent (Story 3.5).
**And** a Caregiver who already has an active membership gets `already-in-family`, with "You're already part of a family in LittleSteps." (AD-3: one Family per Caregiver in v1).
**And** tests cover: valid, expired, cancelled, used, unknown and concurrent accepts, email match and mismatch, an unverified email, and `already-in-family`.

### Story 3.5: Consent cards

As a Caregiver,
I want to read in plain words what is stored, how AI uses it and how sharing works, and agree before anything is kept,
So that I know exactly what I'm agreeing to.

**Acceptance Criteria:**

**Given** a Caregiver who has accepted an invite and has not consented to the current consent version
**When** the app routes after sign-in
**Then** it shows the three consent cards: what's stored, how AI processes it, how sharing works. Each is full width, shows "n of 3" in meta, has a heading and body copy from the catalog, and reads on its own. There are no checkboxes and nothing is pre-ticked. A primary "I agree" follows the third card, with a quiet "Sign out" (UX-DR84).
**And** the cards are a focus-managed flow (UX-DR117). Each card's heading takes focus when shown, and Back returns to the previous card.

**When** the Caregiver chooses "I agree"
**Then** the app enqueues the consent command through the outbox (Story 25.2), and `PUT /api/v1/me/consent/{consentVersion}` records the consent version, the time and the Caregiver. The record is insert-only and is the source of truth for the `consent-required` check.

**Given** a Caregiver without consent to the current version
**When** they call any Family-data endpoint
**Then** they get `consent-required`, and the app shows the cards again (AD-3).
**And** if they leave without agreeing, the next visit shows "LittleSteps needs your agreement to keep your family's information. You can read the cards again whenever you're ready." with "Read the cards" and "Sign out" (UX-DR104).
**And** the membership, invite and consent checks run in one request filter, in that order (Consistency Conventions › Auth).
**And** tests cover: no consent, an old consent version, the Family-data block, and agreeing.

### Story 3.6: Create the Family

As a Caregiver who has accepted a pilot invite and consented,
I want to create our Family,
So that everything I add from now on is kept for this Family only.

**Acceptance Criteria:**

**Given** the `families`, `caregivers` and membership tables and the tenant resolver from Story 25.1
**When** the real sign-in is added
**Then** the tenant resolver takes the Family from the signed-in Caregiver's active membership, exactly as the demo resolver did, and no request path resolves to the root tenant (AD-2).
**And** `caregiver_membership` carries `role` = caregiver, `joined_at`, `ended_at` and `end_reason`, and the architecture test and native-query test from Story 25.1 still pass.

**Given** a consented Caregiver holding an accepted pilot invite
**When** they continue in onboarding
**Then** the Family step creates the Family with a client UUIDv7 through the outbox (`PUT /api/v1/families/{id}`, which is idempotent on replay). The timezone comes from the browser, and week start defaults to Monday (AD-4, AD-8).
**And** the Caregiver becomes its first active member, the pilot invite is consumed, and `FamilyCreated` is published.
**And** onboarding moves to the next step. Until Epic 4, that is the optional invite step (Story 3.8), then Today (UX-DR88).

**Given** two Families, each with one Caregiver, signed in through Keycloak
**When** the isolation test from Story 25.1 is run against real sign-in
**Then** neither sees nor changes the other's rows (NFR-4).
**And** a Caregiver with no pilot invite who tries to create a Family gets `invite-required`.

### Story 3.7: Audit events for sign-ins and membership

As a Caregiver,
I want every sign-in and membership change in my Family recorded in a log nobody can alter,
So that we can always check who accessed our child's information and when.

**Acceptance Criteria:**

**Given** the `audit` module
**When** its migration runs
**Then** it creates `audit_event` (`family_id` tenant column, `caregiver_id`, `type`, `occurred_at`, and an optional `subject_caregiver_id`). The application database role has `INSERT` and `SELECT` only on this table, with no `UPDATE` or `DELETE` grant (NFR-5, AD-6).

**When** `FamilyCreated` or `CaregiverSignedIn` is received
**Then** one `audit_event` row is written with IDs and the type only, never names, emails or free text (AD-19).
**And** `CaregiverSignedIn` is recorded only for a Caregiver with an active membership. A sign-in before any Family has no tenant and is not recorded.
**And** the listener is idempotent on the event ID, so a resubmitted publication writes no second row.
**And** a public `audit.api.AuditEventTypes` lists the membership types (`caregiver_joined`, `caregiver_left`, `caregiver_removed`, `family_deletion_requested`, `family_deletion_cancelled`). Later stories publish these and the same listener records them.
**And** the `ExportContributor` and the viewer for this table come in Epic 17.
**And** tests cover: the recorded types, no row before membership, idempotent replay, and a direct `UPDATE` or `DELETE` failing under the app role.
**And** this is the first real `@ApplicationModuleListener`, so the tests also cover startup resubmission: an incomplete `event_publication` row is picked up by a fresh context on the same container with no manual call, and the `prod` profile refuses to start without its datasource variables (AD-1, #83).

### Story 3.8: Invite a co-caregiver and join the Family

As a Caregiver,
I want to invite another caregiver by email, and have them join with their own consent,
So that we both see the same Goals, Plan and Observations.

**Acceptance Criteria:**

**Given** Family → Caregivers, and the optional onboarding invite step
**When** the Caregiver enters an email and chooses "Send invite"
**Then** a single-use Family invite (`kind = family`) that expires in 7 days is created and emailed with its link (UX-DR87).
**And** a pending invite is a block-card showing "Invite sent <date>" with quiet "Resend" and "Cancel". An expired invite says so and offers "Resend". Resend issues a new token and invalidates the old one.
**And** the Caregivers page lists active Caregivers by display name, with "(you)" for the current one.
**And** the onboarding invite step is skippable ("Not now") and leads to Today.

**Given** an invitee opening a valid Family invite link
**When** they create an account or sign in (Story 3.4), read the consent cards and agree (Story 3.5)
**Then** they become an active member of the inviting Family, the invite is consumed, and `CaregiverJoined` is published and audited.
**And** they land on Today for that Family, and the shell shows the same Family as the inviter.
**And** a test proves both Caregivers resolve to the same tenant and read the same Family rows.
**And** the server takes `caregiver_id` and `recorded_at` for every write from the token and the clock, never from the request body. A shared `CurrentCaregiver` accessor provides them for later Observation and edit records (AD-8, FR-1 attribution).

### Story 3.9: Leave the Family or remove a Caregiver

As a Caregiver,
I want to leave the Family, or remove another Caregiver, with a clear confirm,
So that access always matches who is really caring for the child.

**Acceptance Criteria:**

**Given** Family → Caregivers with two or more active Caregivers
**When** a Caregiver chooses "Remove" on another Caregiver
**Then** a plain destructive confirm says "<Caregiver> will lose access now. Everything they logged stays." with a danger "Remove" and a quiet "Cancel" that changes nothing (UX-DR85, UX-DR86).
**And** on confirm, the membership gets `ended_at` and `end_reason = removed` and is never deleted, so attribution keeps the display name. `CaregiverRemoved` is published and audited (AD-3).
**And** remove and leave commands lock the Family's active memberships (`SELECT … FOR UPDATE`) and re-check them. If two Caregivers remove each other at the same time, exactly one removal succeeds, the other gets `membership-ended`, and the Family never drops to zero active Caregivers through removal. A concurrency test covers this.

**When** a Caregiver chooses "Leave the family"
**Then** the confirm says "You'll lose access to this family. Everything you logged stays." On confirm, the membership ends with `end_reason = left`, `CaregiverLeft` is published and audited, the device is wiped and signed out.

**Given** a removed Caregiver's device
**When** it next calls the API
**Then** it gets `membership-ended`. The app shows "You're no longer part of this family.", wipes Dexie, and signs out (UX-DR109).
**And** their outbox commands are dropped, not replayed under anyone else.

**Given** the last active Caregiver
**When** they choose "Leave the family"
**Then** the confirm says "You're the only caregiver. Leaving will delete all family data on <date>. You can undo this by signing in again before then."
**And** on confirm, a Family deletion request is recorded with `purge_after = now + 7 days` (AD-16), the membership ends with `end_reason = left_last`, and the event is audited. The purge job itself comes in Epic 17.
**And** the membership gate has a third case: a Caregiver whose membership ended with `left_last`, and whose Family has a pending deletion, is routed to the deletion-pending screen rather than to `invite-required`. They can reach only the session, deletion-status and undo endpoints.
**And** if that Caregiver signs in before `purge_after`, they see "Family data will be deleted on <date>." with "Undo" (UX-DR108). Undo cancels the request, restores their membership, and is audited.
**And** tests cover: remove, leave, removed-device handling, last-Caregiver leave, undo before the date, and no undo after `purge_after`.

### Story 3.10: Security notices for membership changes

As a Caregiver,
I want to be told when someone joins, leaves or is removed from my Family,
So that I always know who can see our child's information.

**Acceptance Criteria:**

**Given** the `notifications` module
**When** `CaregiverJoined`, `CaregiverLeft` or `CaregiverRemoved` is received
**Then** a security notice is created for each other active Caregiver, with copy codes from the catalog (UX-DR125):
- join: "<Caregiver> joined your family (<date>)."
- leave or remove: "<Caregiver> is no longer part of your family (<date>). See the audit log."

**And** each notice shows as a banner on Today until that Caregiver dismisses it. Dismissal is per Caregiver, and banners stack newest first without blocking the screen.
**And** each notice is emailed to the Caregiver's sign-in address through the email port (Mailpit locally), never batched with reminders.
**And** security notices are their own category, and no reminder or quiet-hours rule can suppress them (AD-17). The listener is idempotent, so a replayed event sends no second email.
**And** `<Caregiver>` is the account display name, and `<date>` is formatted in the Family timezone.
**And** tests cover: a join notifying the existing Caregiver, a removal notifying the remaining one, no notice to the actor, per-Caregiver dismissal, and no duplicate email on event replay.
