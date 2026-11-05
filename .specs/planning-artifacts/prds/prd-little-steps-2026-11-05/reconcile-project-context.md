# Input Reconciliation: project-context.md vs PRD

- **Input:** `little-steps/.ideas/project-context.md` (36 lines)
- **Compared against:** `prd.md`, `addendum.md`, `.memlog.md` (same folder)
- **Date:** 2026-11-05
- **Note:** project-context.md points to `brief.md` as the source of product context. That file doesn't exist; the brief is `.ideas/non-bmad-prd.md`. This report ignores that reference.

## Summary

Most guardrails carried over well. The PRD covers these items: no diagnosis and no AI-assigned status (§5, FR-17), no backlog or guilt (FR-13, §5 Tone, SM-C1), pause/skip/stop (FR-10), encryption (§5), the consistency/performance/generalisation split (FR-16), supportive tone (§5), speed of common actions (§6, SM-4, FR-13 "Today"), and the technology choices being proposals rather than decisions (addendum A).

The gaps are mostly places where the PRD **kept a principle in one place but not where it matters most**, or **named a concept without defining the data behind it**. Examples: uncertainty is required in FR-16 but not in the exported Summary, and FR-9 talks about a "restriction" that the data model never defines.

## Gaps (ranked by importance)

### G1. Goal review/approval status is missing; caregiver edits to Care Team Goals can't be told apart from the original
- **Context:** Product and clinical guardrails, bullet 1: "Keep therapist-guided goals and parent-proposed goals distinguishable, including their source **and review/approval status**." Bullet 3: "Flag clinical decisions and unreviewed suggestions appropriately."
- **PRD coverage:** Partial. FR-4 labels parent-proposed Goals and makes them visually distinct, and Source is in the Glossary. There is no review/approval status field. A parent-proposed Goal can't be marked as "discussed with / accepted by therapist". FR-5 lets every imported field be edited after confirmation, and FR-6 lets the Caregiver revise or retire Care Team Goals. Nothing records that a Care Team Goal was changed by a Caregiver rather than by the therapist, so its Source label could misrepresent the content.
- **Suggested fix:** In §3 Glossary (Goal) and FR-4/FR-6, add a review status (e.g. *parent-proposed – not reviewed / reviewed with [Care Team Member]*). Also require that Caregiver edits to Care-Team-sourced Goals are marked as such and keep the therapist's original version.

### G2. AI Summaries for therapists lack visible uncertainty and grounding rules
- **Context:** Implementation guidance, bullet 3: "Make uncertainty visible in AI-generated summaries; ground summaries in recorded data and avoid overstating trends." Guardrails, bullet 4: describe recorded observations and their context, don't infer outcomes.
- **PRD coverage:** Partial. FR-16 (the in-app progress view) states how much data there is and draws no clinical conclusions. FR-17 (the exported Summary, which is the artifact therapists actually read) has no such rules. Its "Prompt Level and context patterns" and "notable moments" could easily overstate a trend. It only forbids AI-assigned status.
- **Suggested fix:** Add to FR-17 Consequences: the Summary states the number of Observations per Goal, flags when there's too little data for a pattern, and limits AI text to describing what was recorded (the same rule as FR-16). Each "pattern" must be backed by the Observation counts behind it.

### G3. "Restrictions" and family constraints are used but never defined as data
- **Context:** Guardrails, bullet 2: "Recommendations should align with verified goals, therapist guidance, **restrictions**, child interests, available materials, and **family constraints**."
- **PRD coverage:** Partial. FR-9 says suggestions "never contradict a recorded restriction", but no FR or Glossary entry says where a restriction is recorded. Possible places are a Care Team instruction ("avoid X"), a Child Profile sensitivity, or an allergy or feeding note. Family constraints such as time, routines, and who is available only appear as optional per-request filters in FR-9 and aren't stored. FR-12 Coach Tips and the FR-13 Plan don't say they respect restrictions or sensitivities. FR-9 also doesn't limit suggestions to verified (Care-Team-sourced or reviewed) Goals, and suggestions for parent-proposed Goals carry no extra flag.
- **Suggested fix:** Add a "Restriction" term to §3. Make it capturable in FR-2 (Child Profile) and FR-7 (Care Team instructions, including from import). Extend the "never contradict a restriction/sensitivity" rule to FR-12 and FR-13. Add optional saved family constraints (typical time available, routines) to FR-2. In FR-9, label suggestions for unreviewed parent-proposed Goals.

### G4. Data minimisation conflicts with document import and AI extraction
- **Context:** Guardrails, bullet 6: "Minimize child and family data … avoid collecting sensitive data without a clear need."
- **PRD coverage:** Partial, with an internal contradiction. §5 Privacy says no identifiers are required and that "AI requests contain only a nickname or 'the child'". But FR-5 stores the original therapist documents, which typically contain the child's real name, date of birth, diagnosis, and clinic details. FR-5 extraction necessarily sends that document to the AI. The PRD doesn't say whether identifiers are redacted, whether storing the original is optional, or how long uploads are kept. Free-text notes, sensitivities, and feeding/sensory tags are also sensitive and have no minimisation guidance.
- **Suggested fix:** In §5 Privacy and FR-5, require one of two options: prompt or assisted redaction of identifiers before extraction and storage, or an explicit, disclosed exception for import, with a "don't keep original" option. Also add a retention rule for uploaded documents.

### G5. Consent is absent
- **Context:** Guardrails, bullet 6: "Design for **consent**, access control, encryption, auditability, and deletion."
- **PRD coverage:** Not covered. The PRD never mentions consent: not for processing child data, sending content to an AI provider, inviting a co-caregiver into the child's data, or sharing a Summary with a third party. Multi-market legal review is deliberately deferred (memlog line 7, §5 `[NOTE FOR PM]`). Basic product consent isn't legal compliance, though, and wasn't deferred.
- **Suggested fix:** Add a §5 Privacy bullet and an FR-1 Consequence: an explicit consent step at Family creation and on accepting an invite, covering AI processing. Add a confirmation before a Summary is shared outside the Family (FR-17).

### G6. Traceability of Summary content and AI-generated text back to its source
- **Context:** Engineering context: "Keep observations and progress data traceable to their source and context."
- **PRD coverage:** Partial. FR-1 records which Caregiver made each Observation or edit. FR-14 keeps edit history. FR-5 links Goals to their source document. Nothing requires the following:
  - Observations link to the Activity used and its origin (prescribed vs AI-suggested).
  - Summary statements trace back to the underlying Observations.
  - The exported Summary distinguishes AI-drafted text from Caregiver-written text and parent-proposed Goals from Care Team Goals.
- **Suggested fix:** In FR-14, record the Activity (and its Source) and Goal Period with each Observation. In FR-17, label AI-drafted text and parent-proposed Goals in the export, and keep Summary items linked to their Observations.

### G7. Auditability, access revocation, and fine-grained deletion are thin
- **Context:** Guardrails, bullet 6: access control, auditability, deletion.
- **PRD coverage:** Partial.
  - **Access control:** only the Family's Caregivers can access its data, and all have equal access. There's no way to remove a Caregiver or revoke an invite, and the PRD doesn't say what happens to a departing Caregiver's data.
  - **Auditability:** this covers Observations only (FR-14 history). There's no audit trail for Goal and Strategy edits, imports, exports, Summary shares, or deletions.
  - **Deletion:** this is all or nothing (delete the whole Family). The PRD doesn't cover deleting a single document, Observation, or Goal, deletion at the AI provider, or a deletion timeline.
- **Suggested fix:**
  - FR-1: add removing a Caregiver and revoking an invite.
  - §5 Privacy: add an audit log of edits, exports, and shares.
  - §5 Privacy: add per-item deletion (especially uploaded documents) and state that deletion extends to backups and the AI provider within a defined period.

### G8. Describe-don't-infer wording slips in UJ-1 and FR-10
- **Context:** Guardrails, bullet 4: "describe recorded observations … not infer unsupported developmental outcomes."
- **PRD coverage:** Mostly covered (FR-16, §5), but the narrative text contradicts it in places. UJ-1 says "attention span across sessions **shows gentle progression**" and "the activity learns which tips work for this child". FR-10 says it "can be viewed as a gentle trend". This presupposes improvement. The timer itself is an intentional decision (memlog line 23); only the outcome-presuming wording is the gap.
- **Suggested fix:** Reword UJ-1 Resolution and FR-10 to "attention duration across sessions can be viewed over time". Say tips "marked helpful are shown first" rather than "learns what works".

### G9. Seed content and AI Activity suggestions have no clinical-content review or scope limit
- **Context:** Product section: "avoid inventing clinical claims or capabilities". Guardrails, bullet 3: no substitute for professional judgment.
- **PRD coverage:** Partial. §5 limits Coach Tips to general engagement techniques. But there's no requirement that the curated starter Coach Tips and starter Activities (addendum C/D) are reviewed by a qualified professional before the pilot. FR-9 AI Activities aren't bound to a similar safe-scope rule beyond flagging technique changes. Physical or sensory activities with safety implications aren't covered.
- **Suggested fix:** In §5 Clinical safety, require professional review of seed Coach Tips and Activities before the pilot. Apply the "general, positive engagement only; flag otherwise" scope to FR-9 suggestions, including basic physical-safety checks.

### G10. "Adapt" is missing from pause/skip/stop
- **Context:** Guardrails, bullet 5: "easy to pause, skip, **adapt**, or stop."
- **PRD coverage:** Partial. FR-10 covers pause, skip, and stop. Activities have variations (FR-8), and Too easy/Too hard Marks give tips (FR-12). There's no explicit in-session way to switch to an easier or harder variation, or to log that the Activity was adapted.
- **Suggested fix:** In FR-10, add that a Caregiver can switch to a variation or adapt the Activity mid-session, and the Review records that it was adapted (not as a failure).

### G11. The consistency/performance/generalisation distinction isn't carried into the Summary
- **Context:** Implementation guidance, bullet 2.
- **PRD coverage:** Covered in FR-16. FR-17 lists frequency, data, and context patterns, but doesn't require the export to keep the three measures as separate labelled sections, so a reader could mistake practice volume for skill gain.
- **Suggested fix:** In FR-17, organise each Goal's section into the same three labelled measures as FR-16.

## Covered (no action)
- No diagnosis, no treatment-effectiveness claims, no AI goal status: §1, §5, §7, FR-17.
- AI suggestions labelled, with "check with your therapist" on technique changes: FR-9. Prescribed Activities never rewritten: FR-7. Import drafts need confirmation: FR-5.
- No backlog or guilt: FR-13, §5 Tone, SM-C1, FR-10 stop is not a failure, FR-14 neutral "not attempted".
- Encryption in transit and at rest, private storage, Family-only access: §5.
- Consistency/performance/generalisation in the progress view: FR-16.
- Supportive, nonjudgmental tone: §5 Tone.
- Speed: §6 (≤30 s to an Activity), SM-4 (≤30 s Observation), FR-13 one-tap Today, FR-14 one-tap Log a moment.
- Accessibility and responsive design: §6.
- Technology as proposals, explicit workflows and controlled AI use over multi-agent design: addendum A.

## Intentional divergences (from .memlog.md, not gaps)
1. Multi-market compliance (GDPR/COPPA/HIPAA) deferred for a lean, invite-only pilot (memlog line 7). This covers the legal review only, not basic consent (see G5).
2. Gentle reminders on by default to support consistency, worded never to mention missed sessions (line 31).
3. Optional timer and attention-duration trend added, never a target (line 23). Only the outcome-presuming wording is flagged (G8).
4. Prep → Activity → Review flow with optional Guided mode reshapes the "Practice" step of the context workflow (lines 20–22).
5. Scope widened beyond speech, communication, social, and emotional goals: OT and early-intervention educators are Goal and Activity sources (line 14).
6. Feeding recorded as tagged notes only (line 33).
7. One child per Family; no real name or date of birth stored (line 33). This supports minimisation.
8. AI provider configured not to train on user data; PWA, English-only, low cost (line 33).

Scoped but not in the memlog: therapists and educators are recipients only, not app users in v1 (§2.2, §8.2). That differs from the context's "secondary users", but the PRD states it explicitly. It's the reason G1's review status would be recorded by the Caregiver for now.
