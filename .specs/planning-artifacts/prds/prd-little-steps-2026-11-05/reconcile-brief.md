# Input Reconciliation: Product Idea Brief vs PRD

- **Input:** `little-steps/.ideas/non-bmad-prd.md` (LittleSteps Product Idea Brief v1.0)
- **Compared against:** `prd.md`, `addendum.md`, and `.memlog.md` (for deliberate decisions)
- **Date:** 2026-11-05

Coverage key: **Missing** = not in the PRD or addendum. **Partial** = present but weaker or narrower than the brief.

---

## Gaps (ranked by importance)

### G1. Success-metric intent was changed from outcome and burden to app usage
- **Brief:** §10 MVP Success Metrics.
  - Consistency is "percentage of *mutually agreed* practice opportunities attempted".
  - Engagement is "frequency of comfortable, positive participation".
  - Progress visibility is "parents can understand what was observed, where, and under what conditions".
  - Caregiver burden is "parents report that the app simplifies rather than complicates home practice".
  - Principle: "Developmental outcomes will be assessed through appropriate therapist-defined measures rather than app engagement metrics alone."
- **PRD coverage:** Partial.
  - SM-1 (≥3 days a week for 8 weeks) measures app usage, not practice agreed with the therapist.
  - SM-4 covers logging speed, and the ≤30 s time to start an activity appears only as an NFR in §6.
  - The counter-metrics SM-C1 and SM-C2 match the spirit of the brief.
  - Nothing measures child engagement quality, caregiver burden, or whether parents understand their progress data.
  - The principle that outcomes are measured by the therapist, not by engagement, is missing.
- **Fix (§9 Success Metrics):**
  - Add SM-6, caregiver burden: a pilot survey answering "the app simplifies home practice".
  - Add SM-7, the share of sessions logged with positive or OK engagement.
  - Add SM-8, parents can explain what was observed, where, and under what conditions.
  - Reframe SM-1 as practice against the agreed plan.
  - Add the sentence that developmental outcomes are judged by therapist-defined measures and not by app metrics.

### G2. Data controls are missing consent and auditability
- **Brief:** §9 last paragraph: "privacy-by-design controls, minimal data collection, appropriate consent, access restrictions, encryption, auditability, and data deletion capabilities."
- **PRD coverage:** Partial.
  - §5 Privacy covers minimal identifiers, access restricted to the Family, encryption, private storage, the AI provider not training on data, and Family-level export and delete.
  - FR-1 and FR-14 record who made each edit and keep edit history.
  - Consent is not covered anywhere: not at Family creation, not when inviting a co-caregiver, and not for AI processing of uploaded therapist documents.
  - There is no audit trail for access, export, sharing, or deletion events.
  - No requirement covers removing a Caregiver from a Family, revoking their access, or how long uploaded documents and deleted data are kept.
- **Fix (§5 Privacy, plus FR-1):**
  - Add explicit consent at sign-up and on invite acceptance, covering data use and AI processing.
  - Add an audit log of data access, export, sharing, and deletion that Caregivers can view.
  - Add Caregiver removal with immediate loss of access.
  - Add a stated retention and hard-delete window for documents and Observations.

### G3. Goal Assistant boundaries are missing: approval status, professional review of parent goals, and clarifying observable outcomes
- **Brief:**
  - §5.1: each goal has "Source and approval status". Goals may originate from "AI-assisted suggestions for professional review".
  - §7 Goal Assistant: "structure goals, clarify observable outcomes, and flag parent-proposed goals for review".
  - §6 step 2: "identifies required clarifications".
- **PRD coverage:** Partial.
  - FR-4 labels parent-proposed Goals and makes them visually distinct.
  - There is no approval or review status, so a parent goal is never flagged "to discuss with therapist" and never confirmed.
  - Parent-proposed Goals are not sent to the Summary for review.
  - The AI does not help turn a vague goal into an observable target behaviour.
  - Imports do not flag ambiguous or missing fields, such as a missing criterion.
  - It is not stated whether the AI may propose Goals at all.
- **Fix (FR-4, FR-5, FR-17):**
  - Add a Goal review status (e.g. *proposed → discussed with therapist → confirmed/declined*).
  - List parent-proposed Goals in the Summary under "for discussion".
  - Allow an optional AI prompt that helps phrase an observable target behaviour, labelled as a suggestion.
  - Have imports flag fields needing clarification.
  - State whether AI-originated Goals are in scope (and if so, that they always start as *proposed*).

### G4. Therapist restrictions are enforced but there is no way to record them
- **Brief:** §5.2: "Recommendations consider... therapist guidance and restrictions."
- **PRD coverage:** Partial.
  - FR-9 says suggestions "never contradict a recorded restriction", but no FR lets a Caregiver record one.
  - FR-7 covers Strategies and prescribed Activities only. Child Profile "sensitivities" in FR-2 is not the same as therapist restrictions.
- **Fix (FR-7 and glossary §3):**
  - Add **Restriction** (a "don't do / avoid" instruction from a Care Team Member, attached to a Goal or the Child Profile) to the glossary.
  - Make restrictions capturable both by hand and through FR-5 import.

### G5. Product positioning, product promise, and differentiation were dropped
- **Brief:**
  - Product Positioning statement: "an AI-powered home therapy companion that helps parents turn developmental goals into personalized, engaging everyday activities, track meaningful observations, and collaborate more effectively with therapists".
  - Product promise: "*Less time wondering what to do. More confidence supporting every little step forward.*"
  - §11 five pillars: Goal-centered, Personalized, Practical, Measurable, Collaborative.
  - "Not simply a collection of educational games or an AI chatbot offering therapy advice."
  - §4 "Key differentiation: connects goals, recommendations, execution, and progress measurement in one continuous workflow".
  - §1 notes that existing solutions focus on content, games, or appointment management.
- **PRD coverage:** Partial.
  - The tagline is kept. §1 Vision shows the continuous workflow implicitly, and the Emotional JTBD covers confidence.
  - §7 Non-Goals covers "not a game".
  - The positioning sentence, product promise, five pillars, "not an AI chatbot" stance, and competitive framing are all absent.
  - Downstream UX and copywriting will lose the intended voice.
- **Fix (§1 Vision):**
  - Add a short "Positioning & Promise" block with the positioning sentence and promise verbatim.
  - Add a 5-bullet "What makes it different" list that includes "not a chatbot giving therapy advice".
  - Add one line on the alternatives it competes with.

### G6. AI summaries are not required to be traceable to evidence
- **Brief:**
  - §7 Progress Intelligence: "generate evidence-grounded summaries".
  - §5.5: "highlights uncertainty, and generates questions for professional discussion".
- **PRD coverage:** Partial.
  - FR-16 states how much data there is and draws no clinical conclusions.
  - FR-17 has AI-suggested questions, labelled as suggestions, and no AI status.
  - Neither FR requires every AI-written statement to trace back to recorded Observations, or forbids inventing or extrapolating data.
  - Uncertainty is handled only as a data-count message, not as uncertainty within the narrative.
- **Fix (FR-16 and FR-17 consequences):**
  - "Every AI-written statement cites or links to the Observations it summarises. No figures appear that were not recorded."
  - "Narrative states uncertainty (sparse data, mixed contexts) in plain words."

### G7. Future capabilities and long-term vision are missing from out-of-scope
- **Brief:**
  - §8 Future capabilities: longitudinal developmental insights; carefully validated audio/video-assisted observations; interactive child-facing activities; personalized activity library.
  - §12: collaborative treatment planning; longitudinal developmental records; ambition to "reduce the gap between professional therapy sessions and everyday family life".
- **PRD coverage:** Partial.
  - §8.2 lists the therapist portal and calendar integration.
  - Longitudinal insights/records and collaborative treatment planning are not mentioned.
  - Audio/video observation and child-facing activities appear only as hard Non-Goals (§7, §2.2). The brief's "future, carefully validated" intent is lost, and the memlog records no decision to drop them permanently.
  - The long-term ambition statement is missing.
- **Fix (§8.2 Out of Scope):**
  - Add "Later" rows for longitudinal developmental insights and records, collaborative treatment planning (with v2 therapist logins), and carefully validated audio/video-assisted observations.
  - Add child-facing interactive activities as a "Later" row too, if they are not ruled out for good.
  - Add the long-term ambition line to §1.

### G8. The loop where therapist feedback informs the next cycle is not closed
- **Brief:** §6 step 9: "Therapist feedback informs the next practice cycle." The journey ends in "Review → Refine".
- **PRD coverage:** Partial.
  - FR-6 Goal Periods and lineage handle new goal sheets.
  - There is no way to record feedback given verbally at an appointment, or the status the therapist assigned. AI is barred from assigning status, but no FR lets a Caregiver enter the therapist's status.
  - Feedback does not flow into the Plan or Strategies.
- **Fix (FR-17 or a new FR):**
  - After an appointment, a Caregiver can record the therapist's feedback, assigned status (in their Status Vocabulary), and new tips, attached to the Summary and Goals.
  - These feed the next Plan.

### G9. Planner adaptivity and therapist-approved prompting are weakened
- **Brief:**
  - §5.3: "Adjustment based on family availability and engagement", "flexible rescheduling", "short practice opportunities" in playtime, meals, and reading.
  - §5.4: sessions include "therapist-approved prompting strategies".
  - §7 Activity Recommendation Engine: "generate and *rank*".
- **PRD coverage:** Partial.
  - FR-13 lets the Caregiver accept or edit the Plan and place items in routines.
  - The suggested Plan does not explicitly adapt to availability or engagement history.
  - The Prep card in FR-11 does not explicitly show the Goal's required Prompt Level or Care Team prompting Strategy.
  - Suggestion ranking is implicit: only helpful tips are ordered first.
- **Fix (FR-13, FR-11):**
  - The suggested Plan uses stated availability and past engagement, and favours Activities that went well.
  - The Prep card shows the Goal's target Prompt Level and the relevant Care Team Strategy.

### G10. AI observability and evaluation are missing from the addendum
- **Brief:** §9 Observability: "structured logs, traces, evaluation metrics". §7: "AI operates within defined guardrails".
- **PRD coverage:** Missing. Addendum A drops the observability row, and nothing states how guardrails are verified.
- **Fix (addendum A, or the §5 guardrails note):**
  - Add structured logs, traces, and an AI evaluation set.
  - The evaluation set checks that suggestions never contradict restrictions or prescribed wording, never assign statuses, and stay within the Coach Tip scope.

### G11. The initial domain focus is not stated
- **Brief:** §3: "initial product will focus on... speech, communication, social interaction, and emotional regulation goals."
- **PRD coverage:** Partial. §2 names the disciplines (SLP, OT, EI) but not the target goal domains. The "Upset" Mark hints at emotional regulation.
- **Fix (§2 Target User):** add one line naming the initial goal domains.

### Covered well (no action)
- Therapy Plan Interpreter preserves the original meaning: FR-5 keeps the original wording and shows rephrasing separately, and FR-7 says AI never rewrites prescribed Activities.
- Clinical suggestions are flagged for the therapist: FR-9 "check with your therapist", and §5 Coach Tip scope.
- No diagnosis and no effectiveness claims: §1, §5, FR-16.
- No backlog and the tone is free of pressure: FR-13, §5 Tone, SM-C1 and SM-C2.
- Pause, skip, and stop: FR-10.
- Parent goals are distinguishable: FR-4.
- Progress has three separate measures (consistency, performance, generalisation): FR-16.
- Questions for professional discussion: FR-17.

---

## Intentional divergences (per memlog or confirmed decisions; not gaps)

1. Multi-caregiver logins moved from future capabilities to MVP (FR-1).
2. The guided session became a **Prep → Activity → Review** flow. Live Guided mode is optional, not the default.
3. Reminders are **on by default** (the brief said "optional reminders"). They are adjustable and never mention missed sessions.
4. v1 is a small **invite-only pilot**. Public sign-up, monetisation, and multi-market compliance are deferred.
5. **English only**, targeting English-speaking markets after the pilot.
6. Therapists are recipients, not app users, in v1. The portal is deferred to v2, which matches the brief's "later" intent.
7. One child per Family. No real name or date of birth is stored.
8. Summaries use one standard **period/date-range** format per Care Team Member instead of the brief's "basic weekly summary". A weekly range is still possible.
9. Early-intervention educators were added as a goal and activity Source alongside SLP and OT.
10. Feeding is recorded as tagged notes only. Session/package tracking is deferred.
11. Voice notes use device dictation, and no audio is stored. This supports the v1 Non-Goal on audio/video (but see G7 on keeping it as future work).
12. The tech stack is kept as proposals in the addendum, with a lighter-stack option left to architecture.
13. A lean PRD, with market research skipped for now.

**Count: 13**
