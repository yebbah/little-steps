---
title: LittleSteps PRD
status: draft
created: 2026-11-05
updated: 2026-11-05
---

# PRD: LittleSteps
*Small activities. Meaningful progress.*

## 0. Document Purpose

This PRD defines the first release of LittleSteps. LittleSteps is an app for parents and caregivers of young children receiving developmental therapy. It helps them carry out therapy goals at home, record what they observe, and share useful summaries with their child's care team.

This document is for the product owner and for the BMad workflows that follow it: UX, architecture, and epics and stories. It builds on the product idea brief (`little-steps/.ideas/non-bmad-prd.md`), the project context (`little-steps/.ideas/project-context.md`), and a review of representative goal sheets and progress reports in the formats therapists commonly use. No personal data appears in any planning artifact.

How to read it: terms are defined in §3 and used exactly as defined. Inferred points are tagged `[ASSUMPTION]` and listed in §10. Technical and solution detail lives in `addendum.md`.

## 1. Vision

Young children in developmental therapy often work with several professionals at once: a speech-language pathologist (SLP), an occupational therapist (OT), early-intervention teachers, and group programmes. Each one hands parents goals and home activities in a different format. These include periodic goal tables, narrative reports, verbal tips at the end of a session, and notes sent home from school.

Therapy sessions are often expensive and infrequent, so most of the repetition happens at home. Home is also where caregivers feel least equipped. They don't know what to do today or how to do it well in the moment, and they lose track of what they saw.

LittleSteps brings the care team's guidance into one place. It turns goals into short, playful activities that fit family routines. It also **coaches caregivers during the activity itself**. For example: "Hold the book yourself and control the pace. Get down to the child's eye level. Bring in a familiar song."

Caregivers log what happened in seconds, using the therapists' own units and terms: trials, prompt levels, minutes. At the end of a goal period, they have a shareable summary that shows the therapist what happened at home, in a structure the therapist recognises.

LittleSteps supports professional care and never replaces it. It does not diagnose, does not judge whether therapy is working, and does not change a therapist's techniques. Missed days never build up into a backlog.

## 2. Target User

**Primary:** parents and caregivers of toddlers and preschool-age children receiving speech-language, occupational, or early-intervention support. Often more than one caregiver shares home practice, and many work full time.

**Secondary (recipients, not app users in v1):** SLPs, OTs, and early-intervention educators who receive caregiver summaries.

### 2.1 Jobs To Be Done
- **Functional:** "Show me what to practise today, for which goal, and how, in under a minute."
- **In the moment:** "When my child loses attention, give me a quick tip I can use right now."
- **Memory:** "Help me record what my child did, so I'm not reconstructing it from memory before the next session."
- **Continuity:** "Keep goals from every professional in one place, including how they change from one goal period to the next."
- **Partnership:** "Let another caregiver pick up practice and log it without needing a briefing."
- **Emotional:** "Make me feel intentional and confident, not guilty about what we didn't get to."

### 2.2 Non-Users (v1)
- Therapists, educators, and clinics as app users. They receive exported summaries but don't log in.
- Children. There are no child-facing screens or games.

### 2.3 Key User Journeys

Personas are illustrative composites.

- **UJ-1. A caregiver rescues a shared-reading session that's falling apart.**
  - **Persona + context:** a working parent doing evening practice with a toddler. The activity is shared storybook reading, linked to a joint-attention goal.
  - **Entry state:** signed in on a phone, with today's plan open.
  - **Path:**
    1. The parent taps today's "Storybook together" activity and sees the objective, the materials, and 3 short steps, then starts.
    2. The child keeps grabbing the book and flipping pages.
    3. The parent taps **"Losing attention"** and gets 2–3 short coach tips: *hold the book yourself and control the pace; sit face to face at eye level; sing a familiar song about the picture; let the child turn the page only after a shared look.*
  - **Climax:** the child settles for a few pages and points at a picture. The parent had a workable next step instead of giving up.
  - **Resolution:** the parent taps Stop and logs the session in about 20 seconds: roughly 4 minutes of shared attention, "model shown" as the prompt level, engagement "OK", and which tip helped. Over time, the activity learns which tips work for this child.
  - **Edge case:** the child is tired. The parent stops after 1 minute and logs "not attempted / child not available." Nothing is marked as failed and nothing carries over to tomorrow.

- **UJ-2. A caregiver enters a new period's therapy goals.**
  - **Persona + context:** at the start of a new goal period, a new goal sheet arrives from the SLP, often together with the previous period's progress summary.
  - **Path:**
    1. On a laptop, the caregiver uploads the PDF or a photo.
    2. The app extracts draft goals: domain, long-term goal, short-term goals, criterion, prompt condition, and setting.
    3. The caregiver corrects any fields that came out wrong.
    4. For each goal, the caregiver marks it *carried over*, *revised* (e.g. 10 min → 15–20 min), or *new*, and retires the goals that were dropped.
  - **Climax:** the new goal period is active, earlier goals keep their history, and the original document stays attached for reference.
  - **Edge case:** an OT report has broad goals with no measurable criteria. They are saved as narrative goals and tracked through observations and notes rather than numbers.

- **UJ-3. A second caregiver picks up practice independently.**
  - **Persona + context:** a co-caregiver, invited by the first, runs a weekend session.
  - **Path:** signs in on a tablet → sees the same plan and goals → runs a movement-based activity prescribed by the child's early-intervention teacher → logs the observation.
  - **Climax:** the first caregiver sees the log in the progress view, attributed to the co-caregiver, without having to ask about it.

- **UJ-4. A caregiver prepares for a therapy review.**
  - **Path:**
    1. The caregiver opens Summary and picks the SLP and the current goal period.
    2. The draft shows, per goal: how often it was practised at home, X/Y trials, minutes, prompt levels, contexts, new words and gestures, and the caregiver's questions.
    3. The caregiver edits the draft, then exports or shares it.
  - **Climax:** the therapist receives home evidence in the same structure as their own goals.

## 3. Glossary

- **Family**: the account boundary. Contains one or more Caregivers and one Child Profile in v1. `[ASSUMPTION]`
- **Caregiver**: a person who signs in and uses the app, such as a parent or guardian. All Caregivers in a Family have equal access in v1.
- **Child Profile**: the child's preferences, interests, available materials and toys, and sensitivities. Holds no identifiers beyond a display nickname.
- **Care Team Member**: a professional or educator who sets Goals or Strategies (e.g. SLP, OT, early-intervention teacher). Has a role and a discipline. Not an app user.
- **Source**: where a Goal, Strategy, or Activity came from: a Care Team Member, or a Caregiver (parent-proposed).
- **Goal Period**: the time window in which a set of Goals is active, such as one quarter. Each Care Team Member has their own Goal Periods.
- **Goal**: a target behaviour within a domain. Has a Source, a Goal Period, and a type: **Structured** (has a Criterion) or **Narrative** (no measurable criterion). May sit under a long-term Goal. Links to other Goals through lineage: *carried over from*, *revised from*, *retired*.
- **Criterion**: how a Structured Goal is measured: trials (X of Y), duration (minutes), a count of new items, or frequency per session. Also states the required Prompt Level and the setting.
- **Prompt Level**: how much support the child needed. Chosen from an editable list ordered from most to least support, e.g. physical assist → physical cue → maximum cues → verbal + gestural cue → model shown → verbal prompt → independent.
- **Status Vocabulary**: the progress terms a Care Team Member uses, e.g. Achieved / Achieved in context / Partially achieved / Not yet presented. Configurable per Care Team Member.
- **Strategy**: a technique recommended by a Care Team Member, e.g. "adapt a repeated script by changing 1–2 words to fit the situation." Attached to Goals.
- **Activity**: a short practice idea linked to one or more Goals. Has a purpose, materials, steps, variations, Coach Tips, and what to observe. Either *prescribed* (from a Care Team Member) or *suggested* (AI-generated).
- **Coach Tip**: a short engagement tip shown in the moment during a Practice Session.
- **Plan**: the lightweight set of Activities suggested for the current week.
- **Practice Session**: one run of an Activity by a Caregiver. Can be paused, skipped, or stopped at any time.
- **Observation**: what a Caregiver records about a Practice Session, or about a spontaneous moment.
- **Summary**: a shareable, editable digest of Observations for one Care Team Member and Goal Period.

## 4. Features

### 4.1 Family Access & Child Profile
**Description:** one Caregiver creates a Family and invites others. The Child Profile holds what makes Activities fit the child: interests (e.g. songs, movement, specific toys), materials at home, sensitivities, and what tends to help or hinder engagement. Realizes UJ-3.

#### FR-1: Caregiver accounts
A Caregiver can sign in with their own login and invite other Caregivers into the Family.

**Consequences (testable):**
- Each Observation and edit records which Caregiver made it.
- Invited Caregivers see the same Goals, Plan, and Observations as the person who invited them.
- Sign-in works on mobile and desktop browsers, including iPhone and iPad (installable to the home screen).

#### FR-2: Child Profile
A Caregiver can maintain the Child Profile: nickname, interests, materials and toys at home, sensitivities, and engagement notes.

**Consequences (testable):**
- Activity suggestions (FR-9) and Coach Tips (FR-12) use the Profile fields.
- No real name, date of birth, or other identifier is required. An age band is optional. `[ASSUMPTION]`

### 4.2 Goals & Care Team Instructions
**Description:** Goals arrive from several Sources in different shapes. SLP goal tables often have measurable criteria. OT reports often use broad narrative goals such as "support X learning". Early-intervention teachers send home activities, and caregivers have ideas of their own. The app holds all of these, keeps their Sources distinct, and tracks how Goals change across Goal Periods. Realizes UJ-2.

#### FR-3: Care Team Members
A Caregiver can add Care Team Members (role, discipline, and setting such as clinic, school, or online). Each has their own Status Vocabulary and an optional Prompt Level mapping.

**Consequences (testable):**
- The Status Vocabulary starts from a sensible default list and can be edited per Care Team Member.

#### FR-4: Manual goal entry
A Caregiver can create a Goal with these fields: domain, description, Source, type (Structured or Narrative), optional parent long-term Goal, Criterion (if Structured), setting, Goal Period, and optional baseline.

**Consequences (testable):**
- A Goal entered by a Caregiver is labelled *parent-proposed* and looks visually distinct from Care Team Goals everywhere in the app.

#### FR-5: Import from document
A Caregiver can upload a PDF or a photo of a goal sheet or report. The app proposes draft Goals and Strategies for the Caregiver to review.

**Consequences (testable):**
- Nothing becomes active until the Caregiver confirms it.
- Every extracted field can be edited, both before and after confirmation.
- The original document is stored privately and linked to the Goals that came from it.
- The therapist's original wording is preserved. Any simplified rephrasing is shown separately.

**Out of Scope:**
- Fully automatic import with no review step.

#### FR-6: Goal Periods & lineage
A Caregiver can start a new Goal Period for a Care Team Member. For each Goal, they can mark it *carried over*, *revised from* (linking to the earlier Goal), *new*, or *retired*.

**Consequences (testable):**
- Retired Goals and past periods stay viewable, along with their Observations.

#### FR-7: Strategies and prescribed Activities
A Caregiver can record Strategies and prescribed Activities and attach them to Goals. Examples: activities sent home by an early-intervention teacher, or a verbal tip given after a session.

**Consequences (testable):**
- Prescribed Activities appear exactly as written, labelled with their Source.
- AI never rewrites a prescribed Activity.

### 4.3 Activities & Coaching
**Description:** LittleSteps suggests short, playful Activities for active Goals. During practice, it guides the Caregiver with glanceable steps and Coach Tips. The core problem it solves is the moment practice falls apart. Realizes UJ-1, UJ-3.

#### FR-8: Activity library
A Caregiver can browse Activities by Goal, save favourites, and hide Activities that don't work.

**Consequences (testable):**
- Each Activity shows its purpose, linked Goal(s), materials, time needed (usually 2–10 minutes), steps, variations, what to observe, and Coach Tips.

#### FR-9: AI activity suggestions
A Caregiver can request new Activity ideas for a Goal. They can optionally filter by time available, materials, or routine (meals, bath, reading, play, outdoors).

**Consequences (testable):**
- Suggestions use the Goal, its Strategies, the Child Profile, and past engagement with similar Activities.
- Suggestions follow the Care Team's Strategies and never contradict a recorded restriction.
- Suggestions are labelled *AI-suggested*.
- Any suggestion that would change a therapeutic technique is flagged "check with your therapist".

#### FR-10: Guided Practice Session
A Caregiver can start an Activity and follow it step by step on a phone or tablet. They can pause, skip a step, or stop at any time.

**Consequences (testable):**
- The session is readable at arm's length and usable with one hand. `[ASSUMPTION]`
- Stopping early always leads to the quick log (FR-13).
- Stopping early is never presented as a failure.

#### FR-11: Before-you-start prep
Before a session, a Caregiver sees 1–3 setup tips specific to the Activity, e.g. *you hold the book and control the pace; sit face to face at eye level; have a familiar song ready.*

#### FR-12: In-the-moment Coach Tips
During a Practice Session, a Caregiver can tap a situation button: **Losing attention**, **Upset**, **Too easy**, or **Too hard**. The app then shows 2–3 short, actionable Coach Tips. Realizes UJ-1.

**Consequences (testable):**
- Tips appear in under 2 seconds.
- A curated starter set of tips comes first, so the first tips never wait on AI. `[ASSUMPTION]`
- Tips draw on the child's interests (e.g. familiar songs) and on the Care Team's Strategies.
- A Caregiver can mark a tip as helpful. Helpful tips are shown first next time.

### 4.4 Light Planning
**Description:** a gentle suggestion of what to practise each week, not a schedule to keep up with.

#### FR-13: Weekly Plan
A Caregiver can accept or edit a suggested weekly Plan: a few Activities spread across active Goals. They can optionally place each item in a routine or on a day.

**Consequences (testable):**
- Unfinished items **never** roll over or pile up. Each week starts fresh.
- Reminders are optional and off by default. `[ASSUMPTION]`
- The home screen shows "Today", with one primary Activity reachable in a single tap.

### 4.5 Observations & Progress
**Description:** logging takes seconds and uses the therapists' units, so home data builds into evidence a therapist recognises. Realizes UJ-1, UJ-3, UJ-4.

#### FR-14: Quick Observation
A Caregiver can log an Observation for a Practice Session, or for a spontaneous moment. The fields match the Goal's Criterion:
- trials (X of Y), duration in minutes, or a count
- Prompt Level, and who modelled the behaviour
- setting or routine
- engagement, on a 3-point scale
- which Coach Tip helped
- an optional dictated or typed note

**Consequences (testable):**
- A typical Observation takes ≤30 seconds, with sensible defaults pre-filled.
- "Not attempted / child not available" is a valid, neutral entry.
- Observations can be edited later, and the edit history is kept.

#### FR-15: Skill inventories and side logs
A Caregiver can add items to running lists:
- **new words**, tagged by function (e.g. request, label)
- **new gestures**, marked as understood or used
- **scripts heard**: the phrase, its context, the likely intent, and how the caregiver adapted it

They can also add tagged notes for topics such as feeding or sensory needs.

**Consequences (testable):**
- Each item records when it was first seen and in what context.

**Out of Scope (v1):**
- Structured feeding-programme tracking. Feeding is a tagged note only. `[ASSUMPTION]`

#### FR-16: Progress view per Goal
A Caregiver can open a Goal and see its progress across the Goal Period, split into three separate measures:
- **practice consistency**: sessions per week
- **performance**: trials, minutes, or counts, plus the Prompt Level trend
- **generalisation**: the settings or routines in which the skill was seen

**Consequences (testable):**
- The view states plainly how much data there is (e.g. "only 3 observations — too few to show a trend").
- AI-written descriptions describe what was recorded and draw no clinical conclusions.

### 4.6 Summaries for the Care Team
#### FR-17: Period Summary
A Caregiver can generate a Summary for a chosen Care Team Member and a date range or Goal Period. Realizes UJ-4. For each Goal, the Summary includes:
- practice frequency
- Observation data in the Goal's Criterion units
- Prompt Level and context patterns
- new inventory items
- notable moments
- the Caregiver's questions

**Consequences (testable):**
- Goals appear in the same structure as the Care Team Member's goal sheet.
- The Caregiver can edit the draft before sharing it.
- The Summary can be exported as a PDF or shared through the device share sheet.
- AI may suggest questions for the therapist, labelled as suggestions.
- AI never suggests a Goal status such as "Achieved". The therapist decides status.

## 5. Constraints & Guardrails

**Clinical safety**
- AI is never presented as clinical advice. Care Team Strategies always take precedence over AI suggestions.
- No diagnosis, no claims about treatment effectiveness, and no AI-assigned goal statuses.
- Coach Tips are limited to general, positive engagement techniques. Anything outside that scope is flagged.

**Privacy (sensitive child data)**
- No names or identifiers are required anywhere in the product.
- AI requests contain only a nickname or "the child", plus the Goal and Observation content the request actually needs.
- The AI provider is configured not to train on user data. `[ASSUMPTION]`
- Only the Family's Caregivers can access its data.
- Uploaded documents are kept in private storage.
- All data is encrypted in transit and at rest.
- Caregivers can export all of their data and delete all of their Family's data.
- `[NOTE FOR PM]` Before any public release, review the data-protection requirements for children's and health-related data in each target market, such as GDPR, COPPA, and HIPAA-adjacent expectations.

**Tone**
- Warm, nonjudgmental, caregiver-friendly language.
- No streaks, scores, or "missed" counters.

## 6. Cross-Cutting NFRs
- **Platform:** a responsive web app that can be installed to the home screen on iOS, iPadOS, and Android, and is fully usable in desktop browsers. `[ASSUMPTION: PWA rather than native apps for v1]`
- **Speed:** from opening the app to a started Activity in ≤30 seconds. Coach Tips appear in ≤2 seconds.
- **Resilience:** an Observation in progress is not lost if the connection drops. `[ASSUMPTION]`
- **Accessibility:** large touch targets and support for system text sizing. Target WCAG 2.1 AA.
- **Localisation-ready:** all user-facing text is externalised. v1 ships in English. `[ASSUMPTION]`
- **Cost:** low running cost per Family, suitable for a small pilot. `[ASSUMPTION]`

## 7. Non-Goals
- Not a therapist portal or clinic management tool in v1.
- Not a child-facing game or screen-time app.
- Not a system for therapy appointments, billing, or session packages.
- Not a diagnostic or assessment tool.
- No audio or video capture or analysis of children.

## 8. MVP Scope

### 8.1 In Scope
FR-1 to FR-17:
- multi-caregiver Family access
- Child Profile
- multi-source Goals with Goal Periods and lineage
- document import with review
- Strategies and prescribed Activities
- Activity library with AI suggestions
- guided Practice Sessions with prep and in-the-moment Coach Tips
- a weekly Plan with no backlog
- quick Observations
- skill inventories
- the Goal progress view
- period Summaries

v1 is released as a small, invite-only pilot. `[ASSUMPTION]`

### 8.2 Out of Scope for MVP
- Therapist and educator logins, and comments from them. Planned for v2; until then they receive exported Summaries.
- Public self-serve sign-up and monetisation. Planned for after the pilot.
- Calendar integration, and push reminders beyond basic opt-in. Later.
- Native mobile apps. Later, if the PWA proves limiting.
- Structured feeding-programme tracking and sensory profiles. Later.
- Tracking of therapy sessions and packages. Later.
- Multiple children per Family. Later.

## 9. Success Metrics
**Primary**
- **SM-1:** Pilot Families use LittleSteps for home practice on ≥3 days a week for 8 consecutive weeks. Validates FR-10, FR-13.
- **SM-2:** In Families with more than one Caregiver, at least two Caregivers log Observations independently within the first month. Validates FR-1, FR-14.
- **SM-3:** Caregivers share Summaries at therapy reviews, and the therapists rate them as useful. Validates FR-17.

**Secondary**
- **SM-4:** A typical Observation is logged in ≤30 seconds. Validates FR-14.
- **SM-5:** When a session falls apart, the Coach Tips shown are marked helpful more often than not. Validates FR-12.

**Counter-metrics (do not optimise)**
- **SM-C1:** Number of Activities completed. Pushing this number creates pressure and guilt. Counterbalances SM-1.
- **SM-C2:** Session length. Short, positive sessions are better than long ones. Counterbalances SM-5.

## 10. Open Questions & Assumptions

**Open Questions**
1. Should spontaneous everyday moments (e.g. a new gesture at dinner) get their own fast entry point on the home screen?
2. Through which channels do early-intervention programmes typically send home activities (paper, messaging apps, verbally)? The answer affects FR-5 and FR-7.
3. Should Summaries use one standard format, or mirror each Care Team Member's own report structure?
4. Which markets and languages come after the pilot?

**Assumptions Index**
- §3: one Child Profile per Family in v1.
- FR-2: no real name or date of birth stored; age band optional.
- FR-10: usable with one hand, readable at arm's length.
- FR-12: a curated starter set of Coach Tips, so tips never wait on AI.
- FR-13: reminders off by default.
- FR-15: feeding recorded as tagged notes only in v1.
- §5: the AI provider does not train on user data.
- §6: PWA rather than native apps; offline-tolerant logging; English-only v1 that is ready for localisation; low running cost.
- §8.1: v1 is an invite-only pilot.
