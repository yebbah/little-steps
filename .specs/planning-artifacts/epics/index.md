---
status: working
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics]
review: one epic at a time; an epic's requirements and stories are confirmed together
---

# little-steps - Epic Breakdown

LittleSteps v1 is split into small, feature-sized epics. Each epic is built, tested and closed before the next one starts.

- **Requirements:** [requirements.md](requirements.md) lists FR-1 to FR-19, NFR-1 to NFR-22, the architecture requirements (AD-n) and UX-DR1 to UX-DR137.
- **Epic files:** each `epic-NN-*.md` holds the epic's goal, its "Done when" test, the requirements it covers, and its stories with acceptance criteria.
- **Definition of done (every epic):**
  - All stories meet their acceptance criteria.
  - The security scan is clean: no KEV, High or Critical findings.
  - The full test suite passes.
  - The epic's release note is written in `docs/release-notes/` (AD-27).
- **GitHub tracking:**
  - Each epic has a parent issue (Epic N is issue #N+1, except Epic 24; see [Issues](../../../docs/CONTRIBUTING.md#issues)).
  - Each story gets a sub-issue, labelled `story` and `P1` or `P2`, when its epic is approved. Epic 1 is #26–#34, Epic 2 is #35–#42 plus #104–#106 (Stories 2.9 to 2.11), and Epic 3 is #44–#53.
  - A story's issue is closed, with a summary comment, when the story is confirmed.
  - The epic's PR closes the epic issue.
- **Order:** epics 1–17 are P1, and the core loop works online at the end of epic 9. Epics 18–24 are P2, and start only after P1 works end to end.

## Epic List

| # | Epic | Status | Issue |
| --- | --- | --- | --- |
| 1 | [Local environment and project skeleton](epic-01-local-environment.md) | done | [#2](https://github.com/yebbah/little-steps/issues/2) |
| 2 | [App shell and design foundations](epic-02-app-shell.md) | approved | [#3](https://github.com/yebbah/little-steps/issues/3) |
| 3 | [Sign-in, Family and consent](epic-03-sign-in-family-consent.md) | approved | [#4](https://github.com/yebbah/little-steps/issues/4) |
| 4 | Child Profile and Care Team | planned | [#5](https://github.com/yebbah/little-steps/issues/5) |
| 5 | Goals and Goal Periods | planned | [#6](https://github.com/yebbah/little-steps/issues/6) |
| 6 | Strategies and Restrictions | planned | [#7](https://github.com/yebbah/little-steps/issues/7) |
| 7 | Activity library and Prep card | planned | [#8](https://github.com/yebbah/little-steps/issues/8) |
| 8 | Weekly Plan and Today | planned | [#9](https://github.com/yebbah/little-steps/issues/9) |
| 9 | Practice session and Review | planned | [#10](https://github.com/yebbah/little-steps/issues/10) |
| 10 | Offline practice | planned | [#11](https://github.com/yebbah/little-steps/issues/11) |
| 11 | Log a moment and Observation history | planned | [#12](https://github.com/yebbah/little-steps/issues/12) |
| 12 | Progress view (basic) | planned | [#13](https://github.com/yebbah/little-steps/issues/13) |
| 13 | AI foundation and AI Coach Tips | planned | [#14](https://github.com/yebbah/little-steps/issues/14) |
| 14 | Period Summary and sharing | planned | [#15](https://github.com/yebbah/little-steps/issues/15) |
| 15 | Appointment Feedback | planned | [#16](https://github.com/yebbah/little-steps/issues/16) |
| 16 | Reminders and notifications | planned | [#17](https://github.com/yebbah/little-steps/issues/17) |
| 17 | Privacy controls | planned | [#18](https://github.com/yebbah/little-steps/issues/18) |
| 18 | Document import: upload and masking (P2) | planned | [#19](https://github.com/yebbah/little-steps/issues/19) |
| 19 | Document import: extraction and draft review (P2) | planned | [#20](https://github.com/yebbah/little-steps/issues/20) |
| 20 | AI Activity suggestions (P2) | planned | [#21](https://github.com/yebbah/little-steps/issues/21) |
| 21 | Guided mode (P2) | planned | [#22](https://github.com/yebbah/little-steps/issues/22) |
| 22 | Inventory and tagged notes (P2) | planned | [#23](https://github.com/yebbah/little-steps/issues/23) |
| 23 | Progress trends and AI descriptions (P2) | planned | [#24](https://github.com/yebbah/little-steps/issues/24) |
| 24 | Assistive-technology passes (P2) | planned | [#107](https://github.com/yebbah/little-steps/issues/107) |

### Epic 1: Local environment and project skeleton
A developer can start and stop the whole product on a Mac with one command each. A skeleton app builds, boots and passes CI. Every commit is security-scanned, images are hardened, and the release-note tooling exists.
**FRs covered:** FR-19; NFR-20, NFR-21, NFR-22
**Done when:** `dev-up.sh` brings every service up healthy, the skeleton app answers in the browser, `dev-down.sh --wipe` resets everything, a commit with a known-exploited dependency is blocked, CI is green, and the Epic 1 release note is published.

### Epic 2: App shell and design foundations
The app has its visual identity, navigation shell, status region and shared components, ready for every feature screen.
**FRs covered:** none directly (UX-DR tokens, shell and shared components)
**Done when:** a component gallery (local and test builds only) renders in light and dark, at phone and laptop widths, and passes the contrast and accessibility checks.

### Epic 3: Sign-in, Family and consent
A Caregiver with an invite signs in, gives consent, creates a Family, and invites a co-caregiver, who joins and sees the same Family. Also adds Family tenancy, the device outbox, the audit table, and a maintainer console for pilot invites.
**FRs covered:** FR-1; NFR-4, NFR-5 (recording)
**Done when:** invite → sign-up → consent → Family → co-caregiver joins, leaves or is removed, and the others are notified.

### Epic 4: Child Profile and Care Team
Caregivers describe the child and add the Care Team Members, with their Status Vocabularies and Prompt Levels.
**FRs covered:** FR-2, FR-3
**Done when:** the profile, its sensitivities and the members are saved, edited and kept with their history.

### Epic 5: Goals and Goal Periods
Caregivers enter Goals by hand and move them through Goal Periods with lineage.
**FRs covered:** FR-4, FR-6
**Done when:** parent-proposed and Care Team Goals are created, and a new period carries over, revises and retires Goals with their history intact.

### Epic 6: Strategies and Restrictions
Caregivers record Care Team Strategies and Restrictions. The deterministic Restriction check is in place.
**FRs covered:** FR-7 (Strategies and Restrictions)
**Done when:** a Restriction or an "avoid" sensitivity blocks a matching item through `Guardrail.check()`.

### Epic 7: Activity library and Prep card
Caregivers browse the curated Activity library by Goal, favourite and hide Activities, record prescribed Activities, and read a Prep card.
**FRs covered:** FR-8, FR-11, FR-7 (prescribed Activities)
**Done when:** the starter library loads from `content/`, favourites and hidden Activities work, and a Prep card opens without starting a session.

### Epic 8: Weekly Plan and Today
Caregivers get a weekly Plan and see one Activity on Today, with the in-app nudge.
**FRs covered:** FR-13 (Plan and in-app nudge)
**Done when:** a Plan is generated for the Family's week, it can be edited, and nothing rolls over into the next week.

### Epic 9: Practice session and Review
Caregivers run the full prep, activity and review loop online, with Marks and curated Coach Tips.
**FRs covered:** FR-10, FR-12 (curated tips), FR-14 (Review)
**Done when:** a session goes from Today → Prep → Practice → Mark → tips → Review → saved, including "Not attempted".

### Epic 10: Offline practice
The core loop works without a connection and syncs later without losing or duplicating anything.
**FRs covered:** FR-10, FR-12, FR-14 (offline behaviour); NFR-13
**Done when:** with the device in airplane mode mid-session, the Review saves locally and syncs once, credited to the right Caregiver.

### Epic 11: Log a moment and Observation history
Caregivers log spontaneous moments and edit Observations, with the history kept.
**FRs covered:** FR-14 (Log a moment, edits)
**Done when:** a moment is logged from Today, edited, and History shows both versions, including two edits made at the same time.

### Epic 12: Progress view (basic)
Caregivers see a Goal's three measures across the Goal Period.
**FRs covered:** FR-16 (P1)
**Done when:** consistency, performance and generalisation display correctly, the "too few to show a trend" rule applies, and revised Goals are followed back.

### Epic 13: AI foundation and AI Coach Tips
The AI module runs on Ollama with guardrails and the evaluation set, and AI Coach Tips appear after curated ones.
**FRs covered:** FR-12 (AI tips); NFR-1, NFR-3, NFR-16
**Done when:** the evaluation set (30 or more cases) passes on the local model, and AI tips appear within 1.5 seconds or are skipped.

### Epic 14: Period Summary and sharing
Caregivers build, edit, confirm and share a Summary for a Care Team Member.
**FRs covered:** FR-17
**Done when:** a Summary with cited AI text is confirmed, frozen, exported as a PDF and shared, and the share is audited.

### Epic 15: Appointment Feedback
Caregivers record what the therapist said after an appointment.
**FRs covered:** FR-18
**Done when:** a status is recorded in the member's vocabulary, a parent-proposed Goal is confirmed, and a new Restriction affects the next Plan.

### Epic 16: Reminders and notifications
Push reminders and security notices reach Caregivers under the agreed rules.
**FRs covered:** FR-13 (push reminders), FR-1 (security notices)
**Done when:** opt-in push reminders follow the one-per-Plan-day rule, and a removal notice reaches the other Caregivers by banner, email and push.

### Epic 17: Privacy controls
Caregivers view the audit log, export their data and delete the Family. Retention and pilot-end purges run.
**FRs covered:** NFR-5, NFR-7, NFR-18 (PRD §5)
**Done when:** the export archive downloads, deletion can be undone within 7 days, and the purge removes every copy.

### Epic 18: Document import: upload and masking (P2)
Caregivers upload a photo, PDF or pasted text, and confirm which identifiers are covered before anything goes to AI.
**FRs covered:** FR-5 (upload, text reading, masking)
**Done when:** a page is read, identifiers are pre-covered, and the masking review is confirmed with the keyboard and by touch.

### Epic 19: Document import: extraction and draft review (P2)
Masked documents become draft items that Caregivers review and confirm.
**FRs covered:** FR-5 (extraction, draft review)
**Done when:** draft Goals are confirmed into a Goal Period, flagged fields are checked, and the original is kept with its retention date.

### Epic 20: AI Activity suggestions (P2)
Caregivers request new Activity ideas that are safe and labelled.
**FRs covered:** FR-9
**Done when:** filtered suggestions are labelled, Restriction-safe and scope-labelled.

### Epic 21: Guided mode (P2)
Caregivers can choose live step-by-step guidance during an Activity.
**FRs covered:** FR-10 (Guided mode)
**Done when:** steps appear one per screen, the screen stays awake, and Marks still work.

### Epic 22: Inventory and tagged notes (P2)
Caregivers keep word, gesture and script lists and tagged notes.
**FRs covered:** FR-15
**Done when:** items record when they were first seen and in which Context, duplicates merge, and they appear in Summaries.

### Epic 23: Progress trends and AI descriptions (P2)
Caregivers see trends and cited descriptions on the progress view.
**FRs covered:** FR-16 (P2)
**Done when:** trends show at 5 or more Observations, and descriptions cite Observations.

### Epic 24: Assistive-technology passes (P2)
Caregivers who use screen readers are covered by recorded manual passes on the real devices and tools.
**FRs covered:** none directly (NFR-14; UX-DR119 manual passes)
**Done when:** VoiceOver (iOS and macOS), TalkBack and NVDA passes over the component gallery and the app shell are recorded in `docs/a11y-passes.md`, and every finding is fixed or tracked.

## FR Coverage Map

- **FR-1:** Epic 3 (accounts, Family, consent, membership), Epic 16 (security notices)
- **FR-2:** Epic 4 (Child Profile)
- **FR-3:** Epic 4 (Care Team Members, vocabularies, Prompt Levels)
- **FR-4:** Epic 5 (manual Goals)
- **FR-5:** Epic 18 (upload and masking), Epic 19 (extraction and draft review)
- **FR-6:** Epic 5 (Goal Periods and lineage)
- **FR-7:** Epic 6 (Strategies and Restrictions), Epic 7 (prescribed Activities)
- **FR-8:** Epic 7 (Activity library)
- **FR-9:** Epic 20 (AI Activity suggestions)
- **FR-10:** Epic 9 (prep, activity, review), Epic 10 (offline), Epic 21 (Guided mode)
- **FR-11:** Epic 7 (Prep card)
- **FR-12:** Epic 9 (Marks, curated tips), Epic 10 (offline), Epic 13 (AI tips)
- **FR-13:** Epic 8 (Plan, Today, nudge), Epic 16 (push reminders)
- **FR-14:** Epic 9 (Review), Epic 10 (offline), Epic 11 (Log a moment, edits)
- **FR-15:** Epic 22 (Inventory and tagged notes)
- **FR-16:** Epic 12 (basic), Epic 23 (trends and AI descriptions)
- **FR-17:** Epic 14 (Summary and sharing)
- **FR-18:** Epic 15 (Appointment Feedback)
- **FR-19:** Epic 1 (local environment)

UX-DR and NFR coverage is listed in each epic file, and step 4 checks that all of it is covered.
