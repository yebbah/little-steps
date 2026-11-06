---
id: SPEC-little-steps
companions:
  - ../../planning-artifacts/prds/prd-little-steps-2026-11-05/prd.md
  - ../../planning-artifacts/prds/prd-little-steps-2026-11-05/addendum.md
  - ../../planning-artifacts/ux-designs/ux-little-steps-2026-11-05/EXPERIENCE.md
  - ../../planning-artifacts/ux-designs/ux-little-steps-2026-11-05/DESIGN.md
  - ../../planning-artifacts/architecture/architecture-little-steps-2026-11-05/ARCHITECTURE-SPINE.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# LittleSteps v1 (invite-only pilot)

Terms are the PRD glossary (§3), used verbatim. CAP-1 to CAP-18 are the PRD's FR-1 to FR-18, and their testable consequences in the PRD are acceptance criteria. CAP-19 has no PRD FR and is defined here. Architecture decisions (AD-n) in the architecture spine bind every implementation.

## Why

This spec addresses a pain. Parents and caregivers of young children in developmental therapy get Goals from several professionals (SLP, OT, early-intervention teachers), each in a different format. Sessions are expensive and infrequent, so most of the repetition happens at home, which is where caregivers feel least equipped. They don't know what to practise today or how to do it in the moment, they lose track of what they saw, and they arrive at appointments reconstructing it from memory. LittleSteps brings the Care Team's guidance into one place, turns Goals into short Activities that fit family routines, prepares the caregiver before practice and stays out of the way during it, and returns home evidence to therapists in their own units. It supports professional care and never replaces it.

## Capabilities

P1 is the first pilot slice. It must work end to end before P2 work starts.

- **CAP-1 [P1] Caregiver accounts and Family membership**
  - **intent:** A Caregiver signs in, gives consent, creates or joins a Family by invite, and can leave or remove other Caregivers.
  - **success:** Without consent the account can't be used. An invited Caregiver sees the same Goals, Plan and Observations. Every write is attributed. Removal notifies the remaining Caregivers. Sign-in works in every supported browser, installed or not.
- **CAP-2 [P1] Child Profile**
  - **intent:** Caregivers record the child's nickname, optional age band, interests, materials, sensitivities and engagement notes, so Activities fit the child.
  - **success:** No real name, date of birth or other identifier is requested. A sensitivity marked "avoid" acts as a Restriction in every suggestion and tip.
- **CAP-3 [P1] Care Team Members**
  - **intent:** Caregivers add Care Team Members with a role, a discipline, a Care Setting, their own Status Vocabulary and an optional Prompt Level mapping.
  - **success:** The Status Vocabulary starts from the default and can be edited for each member.
- **CAP-4 [P1] Manual Goal entry**
  - **intent:** Caregivers create Structured or Narrative Goals with a Domain, Source, Criterion, Context, Goal Period and optional baseline.
  - **success:** Caregiver-entered Goals are *parent-proposed* with Review Status *proposed*, and they look different everywhere. Editing a Care Team Goal keeps the original wording alongside the edit. The app prompts for an observable-behaviour description.
- **CAP-5 [P2] Import from a document or message**
  - **intent:** Caregivers upload a PDF, photo or screenshot, or paste text, and review draft Goals, Strategies, Restrictions and prescribed Activities extracted from it.
  - **success:** Identifiers are detected and masked, and the Caregiver confirms before any AI call. No unmasked identifier ever reaches the AI provider. Nothing becomes active until confirmed. Uncertain fields are flagged. Originals are private, deletable and removed after 12 months.
- **CAP-6 [P1] Goal Periods and lineage**
  - **intent:** Caregivers start a new Goal Period for a Care Team Member and mark each Goal as carried over, revised, new or retired.
  - **success:** Past periods and retired Goals stay viewable with their Observations. Progress follows a revised Goal back through its predecessors.
- **CAP-7 [P1] Strategies, Restrictions and prescribed Activities**
  - **intent:** Caregivers record Care Team Strategies, Restrictions and prescribed Activities and attach them to Goals.
  - **success:** Prescribed Activities appear exactly as written, labelled with their Source, and are never rewritten by AI.
- **CAP-8 [P1] Activity library**
  - **intent:** Caregivers browse Activities by Goal, favourite them and hide them.
  - **success:** Each Activity shows its purpose, Goals, materials, time, steps, variations, Cues, Coach Tips and what to observe. Hidden Activities never appear in suggestions or the Plan. A professionally reviewed starter library covers the initial Domains.
- **CAP-9 [P2] AI Activity suggestions**
  - **intent:** Caregivers request new Activity ideas for a Goal, optionally filtered by time, materials or Context.
  - **success:** No suggestion that conflicts with a Restriction is ever shown. Suggestions are labelled *AI-suggested*. Out-of-scope ideas say "check with your therapist". Suggestions for *proposed* Goals say the Goal hasn't been discussed with the Care Team. The guardrail evaluation set passes.
- **CAP-10 [P1; Guided mode P2] Prep, activity, review flow**
  - **intent:** Caregivers prep an Activity, practise without the app in the foreground, and review afterwards. They can pause, adapt, skip or stop at any time.
  - **success:** The default flow needs no screen interaction between Prep and Review. Stopping early leads to the Review and is never presented as a failure. The timer is optional and is never shown as a target.
- **CAP-11 [P1] Prep card**
  - **intent:** Before an Activity, Caregivers see the objective, materials, the Care Team Strategy and Prompt Level guidance, 2–3 Cues, and what to try if it gets hard.
  - **success:** It reads in under a minute, opens without starting a session, and can be reopened at any time, including offline.
- **CAP-12 [P1] Marks and Coach Tips**
  - **intent:** During an Activity, a Caregiver taps one Mark and optionally sees up to 3 Coach Tips.
  - **success:** Marking takes one tap. Tips appear in 2 seconds or less, with curated tips first. Every tip is checked against Restrictions. Tips marked helpful rank first next time. Marks pre-fill the Review.
- **CAP-13 [P1] Weekly Plan and reminders**
  - **intent:** Caregivers accept or edit a suggested weekly Plan of 3–5 Activities and get gentle reminders.
  - **success:** Unfinished items never roll over. The in-app nudge is on by default, and push reminders are opt-in after install. Reminder wording never mentions missed sessions. Today shows one primary Activity, one tap away.
- **CAP-14 [P1] Review and Log a moment**
  - **intent:** Caregivers log Observations in the Goal's own units, for a Practice Session or a spontaneous moment.
  - **success:** A typical Review takes 30 seconds or less, with time, attention duration and Marks pre-filled. "Not attempted" is a neutral entry. Edits keep their history. Nothing is lost offline.
- **CAP-15 [P2] Inventory and tagged notes**
  - **intent:** Caregivers keep lists of new words, new gestures and scripts heard, plus tagged notes such as feeding or sensory.
  - **success:** Each item records when it was first seen and in which Context.
- **CAP-16 [P1 basic; trends P2] Progress view per Goal**
  - **intent:** Caregivers see a Goal's practice consistency, performance and generalisation across the Goal Period.
  - **success:** Below 5 Observations it shows the points and says "too few to show a trend". AI descriptions cite Observations and draw no clinical conclusions.
- **CAP-17 [P1] Period Summary**
  - **intent:** Caregivers generate an editable Summary for one Care Team Member and a Goal Period or date range, then export or share it.
  - **success:** It uses one standard format, organised by Goal, in the Goal's units and the member's Status Vocabulary. Goals with fewer than 5 Observations are labelled "limited data". Every statement traces to Observations. AI never suggests a status. Sharing outside the Family requires confirmation. It exports as a PDF or through the share sheet.
- **CAP-18 [P1] Appointment Feedback**
  - **intent:** After an appointment, Caregivers record the therapist's goal status, new Strategies and Restrictions, and the Review Status of parent-proposed Goals.
  - **success:** The status uses that therapist's Status Vocabulary. New Strategies and Restrictions take effect in the next Plan and in later suggestions.
- **CAP-19 [P1, built first] Local development environment**
  - **intent:** A developer can bring the whole product up on a Mac with one command and tear it down with another, using container images for everything except the AI runtime.
  - **success:**
    - On a Mac with the prerequisites installed, one start command brings up PostgreSQL, Keycloak with the realm imported, and Mailpit, all reporting healthy.
    - The start command names any missing prerequisite (Docker, Java, Node, Ollama, the configured model) with the step to fix it, and running it twice is harmless.
    - A full mode also builds and runs the app image, and a phone reaches the app over Tailscale HTTPS.
    - A check command requests every local URL (identity provider, mail catcher, database port) and reports pass or fail for each, so nobody has to test them by hand.
    - The stop command stops everything and keeps the data. A wipe option resets the volumes and local files.
    - The README covers first-time setup in these commands.

## Constraints

- **Clinical safety:** AI output is never clinical advice, never a diagnosis, never a judgement of effectiveness, and never a Goal status. Care Team Strategies and Restrictions override AI. Tips and suggestions are limited to general, positive engagement and checked before display. Starter content is reviewed by a qualified professional before the pilot.
- **Privacy:** No identifiers are required anywhere. AI requests carry only the nickname or "the child", plus the content the request needs. Any hosted AI provider is set not to train on user data. Only the Family's Caregivers can access Family data, with no operator access except time-limited support access granted by a Caregiver. An append-only audit log is visible to the Family. All data is encrypted in transit and at rest. Caregivers can do a full export. Family deletion needs a typed confirmation, notifies the other Caregivers and can be undone for 7 days. All data is deleted on a pre-announced schedule when the pilot ends.
- **Tone:** Warm and nonjudgmental. No streaks, scores or "missed" counters anywhere.
- **Platform:** A responsive PWA with no native app. Every feature works uninstalled in current Chrome, Safari, Firefox, Edge and Samsung Internet. Install is offered where the browser supports it.
- **Deployment and cost:** Runs end to end, AI included, on a Mac with no paid services. Portable to low-cost hosting without code changes. At most US$5 per Family per month at pilot usage.
- **Speed:** App open to today's Prep card takes 30 seconds or less. Coach Tips appear in 2 seconds or less.
- **Resilience:** Practice Session data survives a dropped connection. Prep cards and starter tips for the current Plan work offline.
- **Accessibility:** WCAG 2.1 AA, large touch targets and system text sizing.
- **Language:** English only in v1, with all user-facing text kept separate from code.
- **Observability:** Structured logs, traces and AI evaluation metrics. Logs never contain child content or identifiers.
- **Supply-chain security (NFR-20, NFR-21):** Every commit passes a vulnerability scan (secrets, dependencies and images), and CI repeats the secret and dependency scans. Image scans and the app image build are run by hand before a release. Any finding in the CISA KEV catalog, or rated High or Critical, blocks until it is fixed. Container images come from Docker Hardened Images where available, and any other source is flagged in the release note.
- **Release notes (NFR-22):** An epic is closed only with a release note covering integration, changes, new features, security, code quality and test results (new tests plus non-regression).
- **Architecture:** The architecture spine's AD-1 to AD-27 are binding. A contradiction is surfaced, never resolved locally.

## Non-goals

- Therapist, educator or clinic logins and comments (v2). Therapists receive exported Summaries only.
- Child-facing screens, games or screen time.
- Diagnosis, assessment, or any judgement of whether therapy works.
- Appointment, billing or session-package tracking.
- Audio or video capture or analysis.
- Public self-serve sign-up and monetisation.
- Multiple children per Family.
- Native apps, calendar integration, and share-sheet import on iOS.
- Structured feeding programmes and sensory profiles. These are tagged notes only (later versions: PRD §8.3 L-1 to L-4).

## Success signal

Over an 8-week invite-only pilot:
- At least 60% of Families have active days (a day with at least one Review or Log a moment) on at least 3 days a week.
- At least 70% of Caregivers answer "easier" in the monthly check-in.
- For at least 70% of shared Summaries, the Caregiver records in Appointment Feedback that the therapist found it useful.

The secondary metrics and the counter-metrics not to optimise are in PRD §9.
