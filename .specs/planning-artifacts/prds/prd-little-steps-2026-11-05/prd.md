---
title: LittleSteps PRD
status: final
created: 2026-11-05
updated: 2026-11-05
---

# PRD: LittleSteps
*Small activities. Meaningful progress.*

## 0. Document Purpose

This PRD defines the first release of LittleSteps. LittleSteps is an app for parents and caregivers of young children who are receiving developmental therapy. It helps them carry out therapy goals at home, record what they observe, and share useful summaries with the child's care team.

This document is for the product owner and for the BMad workflows that follow it: UX, architecture, and epics and stories. It builds on three inputs:
- the product idea brief (`little-steps/.ideas/non-bmad-prd.md`)
- the project context (`little-steps/.ideas/project-context.md`)
- a review of representative goal sheets and progress reports, in the formats therapists commonly use

No personal data appears in any planning artifact.

How to read it:
- Terms are defined in §3 and used exactly as defined.
- Decisions are listed in §10: those confirmed during discovery (§10.1) and those approved at finalize review (§10.2).
- Technical and solution detail lives in `addendum.md`.

## 1. Vision

Young children in developmental therapy often work with several professionals at once, such as a speech-language pathologist (SLP), an occupational therapist (OT), early-intervention teachers, and group programmes. Each one gives parents goals and home activities in a different format: periodic goal tables, narrative reports, verbal tips at the end of a session, notes sent home on paper, or messages in a chat app.

Therapy sessions are often expensive and infrequent, so most of the repetition happens at home. Home is also where caregivers feel least equipped. They don't know what to do today, or how to do it well in the moment, and they lose track of what they saw.

LittleSteps brings the Care Team's guidance into one place and turns Goals into short, playful Activities that fit family routines. It **prepares caregivers before an Activity**, then stays out of the way while they are with the child, and offers lightweight help only when asked. The aim is a natural interaction for the child and the caregiver, not a clinical one.

After an Activity, caregivers log what happened in seconds, using the therapists' own units and terms: trials, prompt levels, minutes. At the end of a Goal Period, they have a shareable Summary that shows the therapist what happened at home, in a consistent format organised by the therapist's Goals.

LittleSteps supports professional care and never replaces it. It does not diagnose, does not judge whether therapy is working, and does not change a therapist's techniques. Missed days never build up into a backlog.

### 1.1 Positioning & Promise
**Positioning:** LittleSteps is a home therapy companion for parents. It helps them turn developmental Goals into personalised, engaging everyday Activities, record meaningful Observations, and work more effectively with their child's Care Team.

**Promise:** *Less time wondering what to do. More confidence supporting every little step forward.*

### 1.2 What Makes It Different
LittleSteps is not a collection of educational games, and it is not an AI chatbot that gives therapy advice. Its value comes from five connected qualities:
- **Goal-centred:** every Activity is linked to a specific Goal.
- **Personalised:** Activities reflect the child's interests, engagement patterns, and home environment.
- **Practical:** short Practice Sessions fit into everyday routines.
- **Measurable:** Observations attach to individual Goals and are tracked over time.
- **Collaborative:** home-practice evidence supports continuity between caregivers and the Care Team.

## 2. Target User

**Primary users:** parents and caregivers of toddlers and preschool-age children who are receiving speech-language, occupational, or early-intervention support. Home practice is often shared by more than one caregiver, many of whom work full time.

**Initial Goal domains:** speech and communication, social interaction and play, emotional regulation, and early motor and sensory skills.

**Secondary audience (recipients, not app users in v1):** SLPs, OTs, and early-intervention educators who receive caregiver Summaries.

### 2.1 Jobs To Be Done
- **Functional:** "Show me what to practise today, for which goal, and how, in under a minute."
- **Before and in the moment:** "Give me a few cues to take into the activity. If it gets hard, let me mark it and get a quick tip without breaking the flow."
- **Memory:** "Help me record what my child did, so I'm not reconstructing it from memory before the next appointment."
- **Continuity:** "Keep goals from every professional in one place, including how they change from one goal period to the next."
- **Partnership:** "Let another caregiver pick up practice and log it without needing a briefing."
- **Emotional:** "Make me feel intentional and confident, not guilty about what we didn't get to."

### 2.2 Non-Users (v1)
- Therapists, educators, and clinics as app users. They receive exported Summaries but don't log in.
- Children. There are no child-facing screens or games.

### 2.3 Key User Journeys

Personas are illustrative composites.

- **UJ-0. A caregiver sets up LittleSteps and reaches a first Practice Session.**
  - **Persona + context:** a working parent who has just been invited to the pilot.
  - **Entry state:** has opened the invite link on a phone and is not signed in yet.
  - **Path:**
    1. Creates an account and gives consent (FR-1).
    2. Creates the Family and a Child Profile with a nickname, interests, and materials at home (FR-2).
    3. Adds the first Care Team Member, then enters or imports one or two Goals (FR-3 to FR-5).
    4. Is offered the option to install the app to the home screen and turn on push reminders (FR-13).
    5. Optionally invites a co-caregiver (FR-1).
  - **Climax:** Today shows a first suggested Activity with its Prep card.
  - **Edge case:** the caregiver has no goal sheet yet. They can add a parent-proposed Goal (FR-4) and start anyway.

- **UJ-1. A caregiver preps a short shared-reading session, does it naturally, and reviews it afterwards.**
  - **Persona + context:** a working parent doing evening practice with a toddler. The Activity is shared storybook reading, linked to a joint-attention Goal. A Practice Session is one or two short Activities, so the phone can stay in a pocket.
  - **Entry state:** signed in on a phone, with Today open. The child is not involved yet.
  - **Path:**
    1. **Prep (caregiver alone).** The parent opens the storybook Activity and reads a short Prep card: the objective, the materials, the Care Team's Strategy for the linked Goal, and 2–3 Cues, e.g. *hold the book yourself and control the pace; sit face to face at eye level; have a familiar song ready.* The card also shows what to try if the child's attention drops. Then the parent puts the phone away.
    2. **Activity (phone out of the way).** The parent reads with the child, using the Cues from memory. The child keeps grabbing the book and flipping pages, so the parent tries one of the Cues. The optional timer may be running.
    3. **Optional Mark.** If the parent hits a challenge, they can tap **"Losing attention"** without leaving the moment. The app records the Mark and shows up to 3 short Coach Tips, e.g. *sing a familiar song about the picture; let the child turn the page only after a shared look*. The tips are optional and quick to glance at.
  - **Climax:** the child settles for a few pages and points at a picture. The parent had a workable next step instead of giving up.
  - **Resolution (after the Activity):** the parent completes the Review in about 20 seconds. The app pre-fills the elapsed time and any Marks. The parent adds roughly how long the child stayed attentive, "model" as the Prompt Level, engagement "OK", and which Cue or Coach Tip helped. Tips the parent marks as helpful appear first next time. Attention duration across Practice Sessions can be viewed over time.
  - **Edge case:** the child is tired. The parent stops after 1 minute and logs "not attempted / child not available". Nothing is marked as failed, and nothing carries over to tomorrow.
  - **Alternative:** a caregiver who wants live step-by-step guidance can choose **Guided mode**. It is an option, not the default.

- **UJ-2. A caregiver enters a new Goal Period's goals.**
  - **Persona + context:** at the start of a new Goal Period, a new goal sheet arrives from the SLP, often together with the previous period's progress report.
  - **Entry state:** signed in on a phone or a laptop, with the SLP's Care Team Member already set up.
  - **Path:**
    1. The caregiver uploads the PDF, or takes a photo of the paper sheet.
    2. The app finds identifiers such as names, dates of birth, and clinic details, and masks them. The caregiver confirms the masking before anything is sent to AI (FR-5).
    3. The app extracts draft Goals: domain, long-term Goal, short-term Goals, Criterion, Prompt Level, and Context. It flags any field it is unsure about.
    4. The caregiver corrects anything that is wrong. For each Goal they choose *carried over*, *revised* (e.g. a duration target raised from 5 to 10 minutes), or *new*, and they retire the Goals that were dropped.
  - **Climax:** the new Goal Period is active, earlier Goals keep their history, and the original document is kept in private storage for reference.
  - **Edge case:** an OT report has broad goals with no measurable criteria, e.g. "support play participation". These are saved as Narrative Goals and tracked through Observations and notes rather than numbers.

- **UJ-3. A second caregiver picks up practice independently.**
  - **Persona + context:** a co-caregiver, invited by the first, runs a weekend Practice Session.
  - **Entry state:** has accepted the invite and is signed in on a tablet.
  - **Path:** sees the same Plan and Goals → runs a movement-based Activity prescribed by the early-intervention teacher → completes the Review.
  - **Climax:** the first caregiver sees the Observation in the progress view, attributed to the co-caregiver, without having to ask about it.

- **UJ-4. A caregiver prepares for a therapy appointment.**
  - **Persona + context:** a parent the evening before an appointment with the SLP.
  - **Entry state:** signed in on a laptop.
  - **Path:**
    1. The caregiver opens Summary and picks the SLP and the current Goal Period.
    2. The draft shows, for each Goal: practice consistency, performance in the Goal's units, Prompt Level and Context patterns, the number of Observations, new Inventory items, parent-proposed Goals for discussion, and the caregiver's questions.
    3. The caregiver edits the draft, confirms sharing outside the Family, then exports or shares it.
    4. After the appointment, they record the therapist's feedback (FR-18).
  - **Climax:** the therapist receives home evidence in a consistent, easy-to-scan format, organised by their Goals and in their units.

## 3. Glossary

- **Family**: the account boundary. Contains one or more Caregivers and, in v1, one Child Profile.
- **Caregiver**: a person who signs in and uses the app, such as a parent or guardian. In v1, all Caregivers in a Family have equal access.
- **Child Profile**: the child's nickname, interests, materials and toys at home, and sensitivities. It holds no identifiers beyond the nickname and an optional age band.
- **Care Team**: all of a child's Care Team Members together.
- **Care Team Member**: a professional or educator who sets Goals, Strategies, or Restrictions, e.g. an SLP, OT, or early-intervention teacher. Has a role, a discipline, and a Care Setting. Is not an app user.
- **Care Setting**: where a Care Team Member works with the child: clinic, school, home visit, or online.
- **Source**: where a Goal, Strategy, Restriction, or Activity came from: a Care Team Member, or a Caregiver (*parent-proposed*).
- **Review Status**: whether the Care Team has looked at a parent-proposed Goal. The values are *proposed* → *discussed* → *confirmed*. Goals from a Care Team Member are *confirmed* by default.
- **Goal Period**: the time window in which a set of Goals is active, e.g. one quarter. Each Care Team Member has their own Goal Periods.
- **Domain**: the developmental area a Goal belongs to, e.g. joint attention, play, imitation, understanding language, or fine motor.
- **Goal**: a target behaviour within a Domain. Each Goal has a Source, a Review Status, a Goal Period, and a type:
  - **Structured**: has a Criterion.
  - **Narrative**: has no measurable criterion.

  A Goal may sit under a long-term Goal. Its lineage across Goal Periods is one of *carried over*, *revised*, *new*, or *retired* (see FR-6).
- **Criterion**: how a Structured Goal is measured. It is one of: trials (X of Y), duration (minutes), a count of new items, or frequency per Practice Session. A Criterion also includes the required Prompt Level and the Context.
- **Prompt Level**: how much support the child needed. Chosen from an editable list ordered from most to least support. The default list is: full physical → partial physical → model → gestural → verbal → independent.
- **Status Vocabulary**: the progress terms a Care Team Member uses. The editable default is: Achieved / Achieved in some Contexts / Partially achieved / Not yet observed.
- **Context**: the situation in which practice or an Observation happened, either a routine (meal, bath, reading, play, outdoors) or a social setting (one-to-one, with a sibling, in a group).
- **Strategy**: a technique recommended by a Care Team Member, attached to Goals, e.g. "adapt a repeated phrase by changing one or two words to fit the situation".
- **Restriction**: something a Care Team Member, or the Child Profile's sensitivities, says to avoid, e.g. "no hand-over-hand prompting" or "avoid sticky textures". Restrictions are recorded as data and always checked before any suggestion is displayed.
- **Activity**: a short practice idea linked to one or more Goals. It has a purpose, materials, steps, variations, Cues, Coach Tips, and what to observe. Its origin is either *prescribed* (from a Care Team Member) or *suggested* (generated by AI).
- **Prep**: the step a Caregiver does alone before an Activity, using a Prep card.
- **Cue**: one of 2–3 short, memorable reminders on a Prep card that the Caregiver carries into the Activity.
- **Mark**: a one-tap note a Caregiver makes during an Activity about a challenge: Losing attention, Upset, Too easy, or Too hard.
- **Coach Tip**: a short engagement tip shown on request after a Mark, or listed on the Prep card under "if it gets hard".
- **Guided mode**: an optional mode that keeps an Activity's steps on screen during the Practice Session.
- **Practice Session**: one or two Activities done in one sitting, preceded by Prep and followed by a Review. It can be paused, adapted, or stopped at any time.
- **Review**: the quick Observation a Caregiver logs after a Practice Session.
- **Observation**: what a Caregiver records about a Practice Session (a Review), or about a spontaneous moment (via **Log a moment**).
- **Inventory**: running lists of new words, new gestures, and scripts heard (FR-15).
- **Plan**: the lightweight set of Activities suggested for the current week.
- **Today**: the home screen. It shows the next Plan Activity and the Log a moment entry.
- **Summary**: a shareable, editable digest of Observations for one Care Team Member and Goal Period.
- **Appointment Feedback**: what a Caregiver records after a therapy appointment, e.g. a goal status the therapist gave, new Strategies, or Restrictions.

## 4. Features

**Pilot sequencing.** Every FR is in v1. Each one is tagged **[P1]**, meaning it is in the first pilot slice and proves the core thesis, or **[P2]**, meaning it is built next within v1. P1 must be usable end-to-end before P2 work starts.

### 4.1 Family Access & Child Profile
**Description:** one Caregiver creates a Family, gives consent, and invites others. The Child Profile holds what makes Activities fit the child: interests (e.g. songs, movement, specific toys), materials at home, sensitivities, and what tends to help or hinder engagement. Realizes UJ-0, UJ-3.

#### FR-1: Caregiver accounts & Family membership [P1]
A Caregiver can sign in with their own login, create a Family, and invite other Caregivers into it.

**Consequences (testable):**
- At Family creation and at invite acceptance, the Caregiver must give consent covering what data is stored, how AI processes it, and how sharing works. Without consent, the account cannot be used.
- Every Observation and edit records which Caregiver made it.
- An invited Caregiver sees the same Goals, Plan, and Observations as the person who invited them.
- A Caregiver can leave the Family. Any Caregiver can remove another Caregiver, and the remaining Caregivers are notified.
- Sign-in works in any supported browser (§6), whether or not the app is installed to the home screen.

#### FR-2: Child Profile [P1]
A Caregiver can maintain the Child Profile: nickname, optional age band, interests, materials and toys at home, sensitivities, and engagement notes.

**Consequences (testable):**
- No real name, date of birth, or other identifier is requested or required.
- A sensitivity can be marked "avoid". It then becomes a Restriction.
- Activity suggestions (FR-9), Coach Tips (FR-12), and the Plan (FR-13) use the Child Profile.

### 4.2 Goals & Care Team Instructions
**Description:** Goals come from several Sources in different shapes:
- SLP goal tables often have measurable criteria.
- OT reports often use broad narrative goals.
- Early-intervention teachers send home activities on paper or by message.
- Caregivers have ideas of their own.

The app holds all of these, keeps their Sources and Review Status distinct, and tracks how Goals change across Goal Periods. Realizes UJ-0, UJ-2.

#### FR-3: Care Team Members [P1]
A Caregiver can add Care Team Members. Each has a role, a discipline, a Care Setting, their own Status Vocabulary, and an optional Prompt Level mapping.

**Consequences (testable):**
- The Status Vocabulary starts from the default in §3 and can be edited for each Care Team Member.

#### FR-4: Manual goal entry [P1]
A Caregiver can create a Goal with these fields:
- Domain
- description
- Source
- type (Structured or Narrative)
- optional parent long-term Goal
- Criterion (if Structured)
- Context
- Goal Period
- optional baseline

**Consequences (testable):**
- A Goal entered by a Caregiver is *parent-proposed*, with Review Status *proposed*. It is visually distinct from Care Team Goals everywhere in the app.
- The app prompts the Caregiver to describe a Goal as an observable behaviour. For example, "says more words" becomes "names 5 familiar objects when asked". The Caregiver can accept or ignore the prompt.
- A Caregiver can edit a Care Team Goal. The Care Team Member's original wording is preserved alongside the edit, and the Goal shows that it was edited by a Caregiver.

#### FR-5: Import from a document or message [P2]
A Caregiver can upload a PDF, a photo of a paper sheet, or a screenshot from a messaging app, or paste text copied from a message. Import works for goal sheets, reports, and home-activity instructions. The app proposes draft Goals, Strategies, Restrictions, and prescribed Activities for the Caregiver to review. Until P2 ships, manual entry (FR-4, FR-7) covers the same need.

**Consequences (testable):**
- Before any content is sent to AI, the app detects likely identifiers (names, dates of birth, addresses, clinic and ID numbers) and masks them. The Caregiver confirms or adjusts the masking.
- No unmasked identifier is ever sent to the AI provider.
- The original file is kept in private storage, linked to the items extracted from it. Only Caregivers in the Family can view it.
- A Caregiver can delete an original file at any time. Originals are deleted automatically after a retention limit (§10.2) and when the Family is deleted.
- Nothing becomes active until the Caregiver confirms it.
- Every extracted field can be edited, both before and after confirmation.
- Fields the app is unsure about are flagged for the Caregiver to check.
- The Care Team Member's original wording is preserved. Any simplified rephrasing is shown separately and never replaces it.

**Out of Scope:**
- Fully automatic import with no review step.
- Receiving content through the iOS share sheet (see addendum §B).

#### FR-6: Goal Periods & lineage [P1]
A Caregiver can start a new Goal Period for a Care Team Member and choose a lineage for each Goal:
- *carried over*: the same Goal continues into the new period and keeps its Observations.
- *revised*: a new Goal is created and linked to the earlier one, which closes.
- *new*: a Goal with no predecessor.
- *retired*: the Goal closes and becomes read-only.

**Consequences (testable):**
- Retired Goals and past Goal Periods stay viewable, along with their Observations.
- The progress view (FR-16) can follow a revised Goal back through its predecessors.

#### FR-7: Strategies, Restrictions & prescribed Activities [P1]
A Caregiver can record Strategies, Restrictions, and prescribed Activities, and attach them to Goals. Examples: an activity sent home by an early-intervention teacher, a verbal tip after a session, or "avoid hand-over-hand prompting".

**Consequences (testable):**
- Prescribed Activities appear exactly as written and are labelled with their Source. AI never rewrites them.
- Strategies, Restrictions, and prescribed Activities can be entered by hand, or captured through the import in FR-5.

### 4.3 Activities & Coaching
**Description:** LittleSteps suggests short, playful Activities for active Goals. The flow is **prep, activity, review**:
- The Caregiver preps with Cues.
- They do the Activity naturally, with the phone out of the way.
- They complete the Review afterwards.

During the Activity, the app stays in the background and offers only optional Marks and Coach Tips. The core problem it solves is the moment practice falls apart. Realizes UJ-1, UJ-3.

#### FR-8: Activity library [P1]
A Caregiver can browse Activities by Goal, save favourites, and hide Activities that don't work.

**Consequences (testable):**
- Each Activity shows its purpose, linked Goals, materials, time needed (usually 2–10 minutes), steps, variations, Cues, Coach Tips, and what to observe.
- Hidden Activities are excluded from suggestions (FR-9) and from the Plan (FR-13). Favourites are given priority in the Plan.
- The pilot launches with a curated starter library covering the initial Goal domains (§2). A qualified professional reviews it before the pilot.

#### FR-9: AI activity suggestions [P2]
A Caregiver can request new Activity ideas for a Goal. They can optionally filter by time available, materials, or Context.

**Consequences (testable):**
- Suggestions use the Goal, its Strategies, the Child Profile, and engagement history from Activities for the same Goal or the same Domain and Context.
- Before a suggestion is displayed, it is checked against every Restriction recorded for the Goal and the Child Profile. A suggestion that conflicts with one is never shown.
- If a suggestion can't be confirmed as a general engagement technique, it is labelled "check with your therapist".
- Suggestions are labelled *AI-suggested*. Suggestions for a Goal with Review Status *proposed* also say that the Goal hasn't been discussed with the Care Team yet.
- Before the pilot, the suggestion and Coach Tip guardrails must pass a fixed evaluation set of Restriction and scope cases (§10.2).

#### FR-10: Prep, activity, review flow [P1; Guided mode P2]
A Caregiver can prep an Activity, do it without the app in the foreground, and complete the Review afterwards. A Practice Session contains one or two Activities.

**Consequences (testable):**
- The default flow needs no interaction with the screen between Prep and Review.
- The Caregiver can pause, adapt (switch to a variation), skip an Activity, or stop at any time.
- Stopping early always leads to the Review (FR-14) and is never presented as a failure.
- An optional timer starts with one tap. It is never required and never shown as a target. Its only use is to pre-fill attention duration in the Review.
- In Guided mode, the Activity's steps appear one per screen, the screen stays awake, and Marks remain available.

#### FR-11: Prep card [P1]
Before an Activity, a Caregiver sees a Prep card with:
- the objective
- the materials
- the Care Team's Strategy and Prompt Level guidance for the linked Goal
- 2–3 Cues, e.g. *you hold the book and control the pace; sit face to face at eye level; have a familiar song ready*
- what to try if it gets hard

**Consequences (testable):**
- The Prep card can be read in under a minute and opened without starting a Practice Session.
- The Caregiver can reopen the card at any time.

#### FR-12: Marks & Coach Tips [P1]
During an Activity, a Caregiver who hits a challenge can tap one Mark: **Losing attention**, **Upset**, **Too easy**, or **Too hard**. The Mark is saved with the Practice Session. The app can then show up to 3 short, actionable Coach Tips.

**Consequences (testable):**
- Marking takes one tap. Coach Tips are optional and can be dismissed.
- Tips appear in under 2 seconds. Curated starter tips come first, so the first tips never wait on AI.
- The starter tip set covers all 4 Marks for the common Contexts (reading, play, meals, movement). A qualified professional reviews it before the pilot.
- Tips draw on the child's interests and the Care Team's Strategies, and they are checked against Restrictions in the same way as FR-9.
- A Caregiver can mark a tip as helpful, during the Activity or in the Review. Tips marked helpful appear first next time.
- Marks pre-fill the Review.

### 4.4 Light Planning
**Description:** a gentle suggestion of what to practise each week, not a schedule to keep up with. Reminders encourage consistency without creating guilt. Realizes UJ-0.

#### FR-13: Weekly Plan & reminders [P1]
A Caregiver can accept or edit a suggested weekly Plan. By default the Plan holds 3–5 Activities spread across active Goals, and the Caregiver can adjust that number. Each item can optionally be placed in a Context or on a day.

**Consequences (testable):**
- The Plan is generated from active Goals, favourites, engagement history, and the Caregiver's stated weekly availability. Activities that are going well are given priority.
- The week starts on Monday by default and the Caregiver can change it. Unfinished items **never** roll over or pile up, and each week starts fresh.
- **On by default:** a gentle in-app nudge on Today on Plan days, at a time chosen during onboarding.
- **Offered, opt-in:** push reminders, offered during onboarding once the app is installed to the home screen. Accepting takes one tap. Caregivers can change the timing or turn reminders off at any time.
- Reminder wording invites practice and never mentions missed Practice Sessions.
- Today shows one primary Activity, reachable in a single tap.

### 4.5 Observations & Progress
**Description:** logging takes seconds and uses the therapists' units, so home data builds into evidence a therapist recognises. Realizes UJ-1, UJ-3, UJ-4.

#### FR-14: Review & Log a moment [P1]
A Caregiver can log an Observation for a Practice Session (the Review) or for a spontaneous moment (Log a moment). The fields match the Goal's Criterion:
- trials (X of Y), duration in minutes, or a count
- Prompt Level, and who modelled the behaviour
- Context
- engagement, on a 3-point scale
- which Cue or Coach Tip helped
- an optional dictated or typed note

**Consequences (testable):**
- A typical Review takes 30 seconds or less. Elapsed time, attention duration (from the timer), and Marks are pre-filled.
- "Not attempted / child not available" is a valid, neutral entry.
- Today has a one-tap **Log a moment** entry for spontaneous Observations (e.g. a new gesture at dinner). It links to a Goal or an Inventory list and asks only for what was seen and in which Context.
- Every Observation records its Caregiver, its Context, and its Practice Session (if any).
- Observations can be edited later, and the edit history is kept.

#### FR-15: Inventory & tagged notes [P2]
A Caregiver can add items to Inventory lists:
- **new words**, tagged by function (e.g. request, label)
- **new gestures**, marked as understood or used
- **scripts heard**: the phrase, its Context, the likely intent, and how the Caregiver adapted it

They can also add tagged notes on topics such as feeding or sensory needs.

**Consequences (testable):**
- Each Inventory item records when it was first seen and in which Context.

**Out of Scope (v1):**
- Structured feeding-programme tracking and structured sensory profiles. In v1, feeding and sensory information is captured as tagged notes and as Child Profile sensitivities.

#### FR-16: Progress view per Goal [P1 basic; trends P2]
A Caregiver can open a Goal and see its progress across the Goal Period, shown as three separate measures:
- **practice consistency**: Practice Sessions per week
- **performance**: trials, minutes, or counts, the Prompt Level trend, and, where recorded, attention duration across Practice Sessions
- **generalisation**: the Contexts in which the skill was observed

**Consequences (testable):**
- The view shows the number of Observations. Below 5 Observations in a Goal Period, it shows the data points without a trend and says "too few to show a trend".
- Attention duration appears only where it was recorded and is never framed as a target.
- AI-written descriptions only describe what was recorded, cite the Observations they rely on, and draw no clinical conclusions.

### 4.6 Summaries & Appointment Feedback
**Description:** this closes the loop with the Care Team. Before an appointment, the Caregiver shares a Summary. Afterwards, they record what the therapist said. Realizes UJ-4.

#### FR-17: Period Summary [P1]
A Caregiver can generate a Summary for a chosen Care Team Member, covering either a date range or a Goal Period. For each Goal, the Summary includes:
- practice consistency, performance, and generalisation, kept as separate measures (as in FR-16)
- the number of Observations
- Prompt Level and Context patterns
- new Inventory items
- notable moments
- the Caregiver's questions

Parent-proposed Goals are listed separately, for discussion.

**Consequences (testable):**
- Every Summary uses one standard format, organised by Goal. It uses each Goal's Criterion units and the Care Team Member's Status Vocabulary terms.
- Goals with fewer than 5 Observations are labelled "limited data".
- Every statement in the Summary traces back to recorded Observations. AI text only describes those Observations.
- AI may suggest questions for the therapist, labelled as suggestions. AI never suggests a Goal status such as "Achieved", because that decision belongs to the therapist.
- The Caregiver can edit the draft. Before the Summary is shared outside the Family, the Caregiver must confirm.
- The Summary can be exported as a PDF or shared through the device share sheet.

#### FR-18: Appointment Feedback [P1]
After an appointment, a Caregiver can record Appointment Feedback and attach it to Goals.

**Consequences (testable):**
- Feedback can record a goal status given by the therapist, using that therapist's Status Vocabulary. It can also change a parent-proposed Goal's Review Status to *discussed* or *confirmed*.
- Feedback can add new Strategies or Restrictions (FR-7). These take effect in the next Plan and in later suggestions.

## 5. Constraints & Guardrails

**Clinical safety**
- AI output is never presented as clinical advice. Care Team Strategies and Restrictions always take precedence over AI suggestions.
- The app makes no diagnosis, makes no claims about treatment effectiveness, and never assigns a goal status through AI.
- Coach Tips and suggestions are limited to general, positive engagement techniques. They are checked before display, as specified in FR-9 and FR-12.
- Starter Activities, Cues, and Coach Tips are reviewed by a qualified professional before the pilot.

**Privacy (sensitive child data)**
- No names or identifiers are required anywhere in the product.
- AI requests contain only the nickname or "the child", plus the Goal and Observation content that the request needs. Uploaded documents are masked before they are sent to AI (FR-5).
- AI is provider-agnostic. With a local model, no child data leaves the host machine. Any hosted AI provider must be set not to train on user data.
- Consent is collected at Family creation and invite acceptance (FR-1), and confirmation is required before any Summary is shared outside the Family (FR-17).
- Only the Family's Caregivers can access its data. Operator staff have no access to Family content, unless a Caregiver grants time-limited access for support.
- An audit log records sign-ins, membership changes, exports, shares, and deletions. Caregivers in the Family can view it.
- Uploaded originals live in private storage. All data is encrypted in transit and at rest.
- Caregivers can export all of their data.
- Any Caregiver can delete all of the Family's data. Deletion requires a typed confirmation, notifies the other Caregivers, and can be undone for 7 days before it becomes permanent.
- When the pilot ends, Families can export their data, and all remaining data is deleted on a schedule that was announced in advance.
- `[NOTE FOR PM]` Before any public release, review the data-protection requirements for children's and health-related data in each target market, such as GDPR, COPPA, and HIPAA-adjacent expectations.

**Tone**
- Warm, nonjudgmental, caregiver-friendly language.
- No streaks, scores, or "missed" counters.

## 6. Cross-Cutting NFRs
- **Platform:** a responsive web app (PWA) for phones, tablets, and computers. There is no native app in v1.
- **Browsers:** no specific browser is assumed. The app supports the current versions of Chrome, Safari, Firefox, Edge, and Samsung Internet on iOS, iPadOS, Android, macOS, and Windows. Every feature works without installing the app. Installing it to the home screen is offered where the browser supports it.
- **Deployment:** the full product, including AI, runs end to end on a Mac for development and testing, using no paid services. Production hosting is decided at launch. Every component is portable to low-cost hosting without code changes (addendum §A).
- **Speed:** opening the app to the Prep card of today's Activity takes 30 seconds or less. Coach Tips appear in 2 seconds or less.
- **Resilience:** data from a Practice Session in progress (Marks, timer, Review) is not lost if the connection drops. The Prep cards and starter Coach Tips for the current Plan are available offline.
- **Accessibility:** large touch targets and support for system text sizing. The target is WCAG 2.1 AA.
- **Language:** v1 ships in English for English-speaking markets. User-facing text is kept separate from code, so translation stays possible later.
- **Cost:** low running cost per Family, suitable for a small pilot, with a ceiling set in §10.2. Local development and testing cost nothing beyond the Mac.
- **Observability:** structured logs and traces, plus evaluation metrics for AI output. Logs never contain child content or identifiers.
- **Supply-chain security (NFR-20):** every commit passes a vulnerability scan. Any finding in the CISA KEV catalog, or rated High or Critical (CVSS 7.0 or above), blocks until it is fixed. Staged changes are also scanned for secrets.
- **Hardened images (NFR-21):** container images come from Docker Hardened Images where available, pinned by digest. Any other source is flagged in the release note.
- **Release notes (NFR-22):** every completed epic ships a release note covering integration, changes, new features, security, code quality and test results.

## 7. Non-Goals
- Not a therapist portal or clinic management tool.
- Not a child-facing game or screen-time app in v1.
- Not a system for therapy appointments, billing, or session packages.
- Not a diagnostic or assessment tool.
- No audio or video capture or analysis of children in v1.

## 8. MVP Scope

### 8.1 In Scope
FR-1 to FR-18, built in the order set by the [P1] and [P2] tags in §4:
- **P1:** accounts with consent and membership; the Child Profile; Care Team Members; manual Goals with Review Status and lineage; Strategies and Restrictions; the curated Activity library; prep, activity, review with Marks and Coach Tips; the weekly Plan with reminders; Review and Log a moment; the basic progress view; Summaries; Appointment Feedback.
- **P2:** document and message import with masking; AI Activity suggestions; Guided mode; the Inventory; progress trends.

v1 is released as a small, invite-only pilot.

### 8.2 Out of Scope for MVP
- Therapist and educator logins, and comments from them. Planned for v2; until then, they receive exported Summaries.
- Collaborative treatment planning with the Care Team. Planned for later, after therapist logins.
- Public self-serve sign-up and monetisation. Planned for after the pilot.
- Calendar integration. Later.
- Native mobile apps. Later, if the PWA proves limiting.
- Structured feeding-programme tracking and structured sensory profiles. Later (see §8.3 L-4).
- Longitudinal developmental insights across several Goal Periods, beyond Goal lineage. Later.
- Interactive child-facing activities. To be evaluated after the pilot.
- Audio- or video-assisted Observations. Later, and only with careful validation.
- Tracking of therapy sessions and packages. Later.
- Multiple children per Family. Later.

### 8.3 Later Versions (post-MVP)
These capabilities are planned for releases after the pilot. They come from a common situation: a Care Team Member, for example an early-intervention educator, notices a new behaviour such as oral seeking. The educator asks the Caregivers whether they see it at home, asks them to check with the other therapists, and asks what those therapists are working on.

**How v1 already covers this situation:**
- The behaviour can be captured with Log a moment and tagged notes (FR-14, FR-15).
- Caregivers can bring it to the SLP and OT through "the Caregiver's questions" in a Summary (FR-17).
- The answers can be recorded as Appointment Feedback (FR-18).
- If a therapist sets a Goal, its Activities follow the normal flow (FR-4, FR-7, FR-8).

**What v1 cannot yet do,** and these later versions add:

- **L-1. Care Team Requests.** A Caregiver can log a request or question that arrives from a Care Team Member, by message, paper, or verbally, using the import from FR-5. The app tracks it until it is answered:
  - which Care Team Members it should be raised with
  - the answers gathered through Appointment Feedback
  - a short reply Summary back to the requester

  This closes the loop *across* Care Team Members, not only with one of them.
- **L-2. Watch items (concerns before goals).** A Caregiver or a Care Team Member can name a behaviour to observe, for example oral seeking, before it becomes a Goal. Log a moment offers active watch items, so Observations record when, where, and how often the behaviour appears, across Caregivers and Contexts. A watch item can later be turned into a Goal, keeping its Observations, or closed.
- **L-3. Sensory and oral-motor Activities.** Goals in sensory and oral-motor Domains, such as addressing oral sensitivities, reuse the existing Goal → Activity → Prep → Review flow. Many of these Activities are therapeutic techniques, for example oral massage or using chew tools. So:
  - They come only from a Care Team Member, as prescribed Activities and Strategies (FR-7), or from a professionally reviewed library.
  - AI suggestions (FR-9) and Coach Tips (FR-12) stay limited to general engagement, such as making the routine playful or pairing it with a song. Any technique suggestion is labelled "check with your therapist" or blocked.
  - Restrictions, such as textures to avoid, apply as they do in v1.
- **L-4. Structured sensory profile.** This extends the tagged sensory notes already listed in §8.2. A light, Caregiver-friendly profile of sensory seeking and avoiding patterns, which can feed Activity fit and Summaries.

Guardrails unchanged: none of these lets AI assess, diagnose, or decide whether a behaviour is a concern. They only record, organise, and relay what Caregivers and the Care Team observe and recommend (§5).

## 9. Success Metrics

Developmental outcomes are assessed by the Care Team, using their own measures, not by app metrics. The metrics below judge whether LittleSteps makes home practice easier and more useful. The targets are approved for the pilot (§10.2) and are revisited at week 4.

An **active day** is a day with at least one Review or Log a moment.

**Primary**
- **SM-1 (Consistency):** at least 60% of pilot Families have active days on at least 3 days a week, for 8 consecutive weeks, against their own weekly Plan. Validates FR-10, FR-13.
- **SM-2 (Caregiver burden):** at least 70% of Caregivers answer "easier" in a monthly in-app check-in: "Does LittleSteps make home practice easier, the same, or harder?" Validates the product as a whole.
- **SM-3 (Therapist usefulness):** for at least 70% of shared Summaries, the Caregiver records in Appointment Feedback (FR-18) that the therapist found the Summary useful. Validates FR-17.

**Secondary**
- **SM-4 (Partnership):** in Families with more than one Caregiver, at least two Caregivers log Observations independently within the first month. Validates FR-1, FR-14.
- **SM-5 (Documentation):** the median Review takes 30 seconds or less. Validates FR-14.
- **SM-6 (Engagement):** the share of Reviews with engagement rated OK or good, tracked descriptively over the pilot. Validates FR-11, FR-12.
- **SM-7 (Coaching):** at least 40% of all Coach Tip displays that follow a Mark are marked helpful. Validates FR-12.
- **SM-8 (Progress visibility):** in pilot interviews, Caregivers can explain from the progress view what was observed, in which Context, and with what support. Validates FR-16.

**Counter-metrics (do not optimise)**
- **SM-C1:** number of Activities completed. Pushing this number creates pressure and guilt. Counterbalances SM-1.
- **SM-C2:** Practice Session length. Short, positive sessions are better than long ones. Counterbalances SM-1 and SM-6.

## 10. Decisions

### 10.1 Confirmed Decisions
- One Child Profile per Family in v1.
- No real name or date of birth is requested. An age band is optional (FR-2).
- A curated starter set of Coach Tips means tips never wait on AI (FR-12).
- Spontaneous moments get a one-tap Log a moment entry on Today (FR-14).
- Feeding and sensory information are captured as tagged notes and sensitivities only in v1 (FR-15). *Gives up:* structured feeding-programme tracking.
- Home instructions often arrive on paper or through messaging apps, so import accepts photos, screenshots, and pasted text (FR-5, FR-7). *Gives up:* share-sheet import on iOS.
- Uploaded documents are masked before AI processing. The original is kept privately, with a delete option and a retention limit (FR-5).
- The in-app nudge is on by default. Push reminders are offered once the app is installed, and are opt-in (FR-13). *Gives up:* reminders that reach every Caregiver without setup.
- Summaries use one standard format for every Care Team Member (FR-17). *Gives up:* templates for each therapist.
- AI is provider-agnostic. It can run on a local model, and any hosted provider is set not to train on user data (§5).
- v1 is a PWA with offline-tolerant Practice Sessions. It works in any supported browser, ships in English only, has low running cost, and runs end to end on a Mac for development and testing (§6). *Gives up:* dependable push on iOS, where every browser uses WebKit, and share-target import on iOS.
- After the pilot, the product continues to target English-speaking markets.
- v1 is an invite-only pilot (§8.1).

### 10.2 Decisions Added During Finalize Review (approved)
1. **Retention limit for uploaded originals:** 12 months after upload, unless the Caregiver deletes the file sooner.
2. **Cost ceiling:** at most US$5 per Family per month at pilot usage, covering AI and hosting.
3. **Guardrail evaluation set:** at least 30 Restriction and scope cases, which all suggestions and Coach Tips must pass before the pilot.
4. **Sequencing:** the [P1] and [P2] split in §4 and §8.1.
5. **Success-metric targets:** the thresholds in §9.
6. **Family deletion safeguard:** a 7-day window in which deletion can be undone.
