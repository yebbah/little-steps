# Spine Pair Review (re-validation 2): LittleSteps

## Overall verdict
The fix pass worked. All five prior high findings are resolved. So are the accessibility critical (masking review) and all seven accessibility highs, as far as the spines go. Every prior medium is resolved or partly resolved. I recomputed the contrast claims from the tokens, including those for the new tokens (scrim composites, pressed, tip-surface, attention, mask-cover, danger-foreground, domain-other, focus ring), and every one holds. All 33 light colours have `-dark` twins, and every `{path}` reference resolves except the documented `{colors.domain-<family>}` binding placeholder. The new gaps are mostly in P1 setup and admin surfaces that neither review covered. One is high: FR-6's manual New Goal Period path in P1 has no specification, and the only flow that covers it uses the P2 import. Story-dev can start the core loop, Goals, Progress, Summary and Feedback epics now. Close the high finding and the Care Team Member and Child Profile medium before writing the Goal Period and onboarding stories.

## 1. Flow coverage — adequate
Checked: UJ-0 to UJ-4 and FR-1 to FR-18 against the Key Flows, IA and Component Patterns. All five flows have a protagonist role (unnamed composites, per the privacy override), numbered steps, a bolded climax and a failure path. Flow 1's climax now sits at UJ-1's in-Activity beat (step 4), with a separate Resolution. Guided mode is named as an alternative. FR-10's pause, adapt, skip, stop and two-Activity sequencing are fully specified.
### Findings
- **high** FR-6 (P1) has no manual New Goal Period path. The IA row "New Goal Period" (EXPERIENCE.md › IA) lists "Lineage for each Goal: carried over, revised, new, retired", but no Component Pattern defines the screen. Flow 2, the only flow covering UJ-2, enters through Photo import, which is P2 (FR-5). In P1, story-dev has nothing that defines the following:
  - how the period is created (start and end dates, or a label)
  - how each existing Goal gets its lineage
  - what "revised" does: whether it opens the Goal form pre-filled and links it to the predecessor
  - where new Goals are added
  - how unassigned Goals are handled

  *Fix:* add a "New Goal Period" Component Pattern row: period dates → a list of current Goals with single-select lineage chips → "revised" opens a pre-filled Goal form linked to its predecessor → "+ New goal" opens the Goal form → Confirm closes the old period. Add a matching DESIGN.md Components line, and a P1 manual variant in Flow 2 (e.g. "Alternative (P1): enters the new sheet by hand…").
- **low** Flow 0 drops UJ-0 step 5 (optionally invite a co-caregiver), although the Onboarding IA row includes it. Flow 2 omits part of UJ-2's climax: the original document is kept in private storage for reference (EXPERIENCE.md › Key Flows › Flow 0, Flow 2). *Fix:* add "Skips inviting the co-caregiver for now" to Flow 0, and "the original is kept under Source document" to Flow 2's climax.

## 2. Token completeness — strong
Checked: every key under `colors`, `typography`, `rounded`, `spacing` and `components`, and every `{path}` reference in both files (YAML parsed, references walked).
- 33 light colours, 33 `-dark` twins, no orphans.
- I recomputed every ratio stated in DESIGN.md › Colors and Components, and all match the stated values: pressed 11.71 / 9.75; attention 5.25 / 5.93 / 7.05 / 8.35; danger 6.56 / 6.97; tip-surface 13.70 / 6.18 / 12.06 / 6.55; domain-other set; focus ring 8.55 / 9.14 / 7.00–7.48 / 7.75 and dark 9.00 / 7.85 / 6.34; outline-strong 3.73 / 3.49 / 3.67 / 4.21.
- Scrim composites: card on the light scrim is 3.06, card-dark on the dark scrim is 1.29, and the dark sheet's outline-strong-dark edge is 4.59–4.75.
- The rem sizes match the px table.
- `rounded.sm` is now used, the `ai-label` border uses `outline-width`, and `plan-row` snaps to `lg`.
### Findings
- **low** `{colors.domain-<family>}` is the one reference that won't resolve. That is acceptable, because it is a documented binding placeholder (DESIGN.md frontmatter comment, Colors › Domain tints). The matching rule is ambiguous for the compound Domain strings in PRD §2 ("social interaction and play", "early motor and sensory skills"): whole-string case-insensitive matching sends both to `domain-other`. *Fix:* state whether matching is whole-string or keyword, and seed the Goal form's Domain chips with the table's Domain names so that free text rarely misses.
- **low** The `banner` and `status-line` frontmatter entries have no `typography`, although the prose gives the banner `body-sm` (DESIGN.md › Components › Banner, Status line). *Fix:* add `typography: '{typography.body-sm}'` (banner) and the intended token for the status line.
- Deferred and accepted per the memlog, not counted as findings: the literal paddings (`block-card` 14px, `hero-band`, icon-tile and cue-number sizes, the 24–28px group gap, the 560px sheet) and the 14px badge minimum.

## 3. Component coverage — adequate
Checked: 33 frontmatter components and the prose Components, against the EXPERIENCE.md Component Patterns (core loop; Goals, Observations and sources; Import, sharing and planning) and the semantics table. Every prior gap has been added with both visual and behavioural specs: the Progress view, Goal form, Strategy/Restriction form, Observation history, Original file, Practice options sheet, two-Activity Practice Session, Log a moment sheet, Masking review, Draft review, Confirm-to-share, Destructive confirm, Nudge and Timer.
### Findings
- **medium** The P1 setup surfaces for FR-2 and FR-3 have no Component Pattern or visual line. These are the Child Profile form (nickname, age band, interests, materials, sensitivities with "avoid", engagement notes), the Care Team Member form and page (role, discipline, Care Setting, Status Vocabulary, Prompt Level mapping), and Caregiver invite. "Care Team Member page" is cited as an entry point (EXPERIENCE.md › IA › Add a Strategy…; Strategy/Restriction form) but has no IA row (EXPERIENCE.md › IA › Onboarding, Family). *Fix:* add an IA row for the Care Team Member page, and Component Pattern rows for the Child Profile form, Care Team Member form and Invite caregiver (an email field, a pending-invite row with resend or cancel). One DESIGN.md line can cover them by reusing the Goal form pattern.
- **medium** Several components have behavioural rows but no DESIGN.md visual line: Goal row, Plan editor, Activity row and Activity detail (including the Favourite heart and Hide), Summary builder and Summary preview, Consent cards, and Inventory entry (DESIGN.md › Components). The prior finding is therefore only partly resolved. The Summary preview and PDF matters most: FR-17 requires "one standard format, organised by Goal", it is the artifact the therapist sees (SM-3), and its layout is not specified. *Fix:* add one DESIGN.md line for each component, and a Summary document spec (page structure per Goal, how the three measures render in print, "limited data" and "For discussion" treatment, and the AI label in print).
- **medium** Log a moment's "what you saw" control is undefined. DESIGN.md calls it a chip group, and EXPERIENCE.md says "saves in 3 taps". But there are no options, and FR-14 says fields "match the Goal's Criterion" (EXPERIENCE.md › Component Patterns › Log a moment; DESIGN.md › Components › Log a moment sheet). *Fix:* state what the chips are (e.g. the Goal's Criterion behaviours, or Inventory list types plus "Something else"), when a Stepper appears, and the order (Goal first, so the options can follow its Criterion).
- **medium** The Destructive confirm variants are inconsistent. DESIGN.md gives every destructive confirm a typed field, a Danger button "disabled until the text matches", and "the 7-day undo". EXPERIENCE.md applies the typed field and undo only to Family deletion, while Original file deletion "confirms once" and Remove Caregiver has neither specified. The disabled-until-match button also contradicts the new Draft review rule, where Confirm "stays enabled" and explains on press (DESIGN.md › Components › Confirm-to-share and destructive confirm; EXPERIENCE.md › Destructive confirm, Original file). *Fix:* add a three-row variant table (delete Family: typed, 7-day undo; remove Caregiver: plain confirm, no undo or say otherwise; delete original: plain confirm). Keep the Danger button enabled, and on press with a mismatch, focus the field with an inline message.
- **low** FR-9's request filters (time available, materials, Context) and the "Goal not yet discussed" note on suggestions for *proposed* Goals have no spot in "Get new ideas" (EXPERIENCE.md › Activity row; IA › Activities). This is P2. *Fix:* add a "Get new ideas" row with optional filter chips and the proposed-Goal line.

## 4. State coverage — strong
Checked: each IA surface against loading, generating, empty, error, session expired, offline, permission or consent denied, and focus. All of the prior gaps are now covered: loading placeholders, the generating line, empty Goals, Activities and Share, all-suggestions-blocked (it never reveals the Restriction), a Summary with no Observations, save rejected, session expired, camera denied, push declined, consent not given, invite expired, stale open Practice Session, and WebKit eviction. Focus management is specified globally and per sheet.
### Findings
- **low** The stale-session copy and its precedence are off. "Yesterday's practice is still open" can fire 12 hours later on the same day. Practice screen also says "Reopening the app returns to Practice while a Practice Session is open", without saying that the 12-hour Today prompt overrides it (EXPERIENCE.md › State Patterns › Stale open Practice Session; Component Patterns › Practice screen). *Fix:* use "Earlier practice is still open", and state that after 12 hours the app opens to Today with the prompt instead of returning to Practice.
- **low** The offline treatment is defined only for Prep, Practice, Review and Log a moment. For the Goal form, Plan editor, Summary builder (AI) and Appointment Feedback, only "Save rejected" applies (EXPERIENCE.md › State Patterns › Offline). *Fix:* add one row: forms keep the draft with "Saved on this device — will sync", and AI-dependent steps say "Needs a connection" while the rest of the screen stays usable.
- **low** There is no rule for two Caregivers acting concurrently: for example, both open the same Plan item, or one Reviews while the other's Today card still shows it (FR-1 gives Caregivers equal access) (EXPERIENCE.md › State Patterns). *Fix:* add a row: Today refreshes on focus, a Plan row Reviewed by the other Caregiver shows "Reviewed" with attribution, and both Observations are kept.

## 5. Visual reference coverage — strong
Checked (links only; mock contents are being redrawn and were not judged): `mockups/` holds direction-playroom, key-index, key-today, key-prep, key-practice and key-review, and there is no `imports/` or `wireframes/` folder. DESIGN.md › Brand & Style links all six by name. DESIGN.md › Components links Today, Prep, Practice and Review inline (the prior low is resolved). EXPERIENCE.md › IA links the four key screens, naming what each illustrates. "Spine wins" is stated in both files, and mock header comments are declared historical. No orphans.
### Findings
- **low** The spine-wins example in DESIGN.md › Brand & Style ("the mocks show selected chips filled with periwinkle") will go stale once the redrawn mocks match the spec. The Coach Tip sheet and Practice options sheet bullets have no inline pointer to `key-practice.html`, which illustrates the Coach Tip sheet. *Fix:* after the redraw, drop the example or replace it with a remaining conflict, and add "→ mock" under the Coach Tip sheet bullet.

## 6. Bloat & overspecification — strong
Checked: pixel restatement, source restatement, and decorative prose. The Review fields are now a sub-table, the Progress view is a rule table, and Notifications is a table. DESIGN.md prose stays editorial and tied to decisions.
### Findings
- **low** DESIGN.md › Components now carries behavioural rules that also live in EXPERIENCE.md, which creates a drift risk. Examples: Progress view "Below 5 Observations, points only…", the masking primary button stating the count, "disabled until the text matches", and the status line "stays until the next action". The Destructive confirm conflict in §3 shows the risk is real. *Fix:* keep only the visual treatment in DESIGN.md, and point to the EXPERIENCE.md row for behaviour.

## 7. Inheritance discipline — adequate
Checked: `sources` resolve (`../../prds/prd-little-steps-2026-11-05/prd.md` and `addendum.md`). UJ and FR IDs are cited, and the glossary terms are verbatim: Domain (no more "Goal Domain"), Practice Session, Observation, Prompt Level list, Status Vocabulary, Review Status values, Mark names, and "Not attempted / child not available". FR-17's date range has been restored. The reach rule is restated consistently with the IA, and the two-tap paths check out. The Status line fade contradiction is resolved ("no animation" / "no timed fade"). The Notifications carve-out matches FR-1 and §5.
### Findings
- **medium** The Prompt Level list and Status Vocabularies sit in global Settings, but FR-3 makes the Status Vocabulary per Care Team Member and adds an optional Prompt Level mapping per Care Team Member. The Review fields table also says "Care Team Member's list" (EXPERIENCE.md › IA › Settings; Review fields › Prompt Level; Appointment Feedback). Architecture needs to know the scope for the data model. *Fix:* move both into the Care Team Member page (see §3), and keep Settings for the family-wide default only, or state explicitly that Settings edits per Care Team Member.
- **medium** The Review fields table has no separate attention-duration field and no Required column. Attention minutes appear only as the default for "Measure", which is per Criterion. That works for a duration Criterion, but a trials Goal loses attention duration, although FR-14 and FR-16 record it "where recorded" and Flow 1 shows "6 minutes elapsed, 4 minutes of attention" alongside the Prompt Level. Which fields block Save is also unstated (EXPERIENCE.md › Component Patterns › Review fields). *Fix:* add an optional "Attention (minutes)" row (single Stepper, pre-filled from the timer, shown whenever the timer ran). Add a Required column, with nothing required beyond the Measure, or "Not attempted".
- **low** The Strategy/Restriction form has the user "pick the Source (Care Team Member)" only. The glossary Source allows a Caregiver for Strategies, and Restrictions can come from Child Profile sensitivities (EXPERIENCE.md › Strategy/Restriction form). *Fix:* add "Proposed by you" as a Source for Strategies, and show the sensitivity-derived Restrictions with "From Child Profile" as their Source.
- **low** Some names still drift: "Log a moment sheet" / "Log a moment"; "Appointment Feedback form" / "Appointment Feedback"; "Strategy or Restriction form" / "Strategy/Restriction form"; "Disclosure row" / "Disclosure". `Banner` has a DESIGN.md entry but no EXPERIENCE.md Component Patterns row, and is described only in State Patterns and semantics (DESIGN.md › Components; EXPERIENCE.md › Component Patterns). *Fix:* use one name per component in both files, and add a Banner row (persistence, dismissal, one action).

## 8. Shape fit — strong
Checked: DESIGN.md runs in canonical order: Brand & Style → Colors → Typography → Layout & Spacing → Elevation & Depth → Shapes → Components → Do's and Don'ts. EXPERIENCE.md has every required default: Foundation, IA, Voice and Tone, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor, Key Flows. The multi-surface design triggers Responsive & Platform, which is present. Inspiration & Anti-patterns is present and states that there are no references. The invented sections, Notifications and Privacy & Consent Surfaces, earn their place, and the Component Patterns sub-groups help navigation. The Components prose now carries the frontmatter keys (the prior low is resolved).
### Findings
None.

## Prior findings status

Rubric review (`review-rubric.md`), all critical and high findings plus the notable medium ones:

| Prior finding | Sev | Status | Evidence |
|---|---|---|---|
| FR-10 Practice controls missing (pause, variation, skip, two Activities) | high | **Resolved** | Practice options sheet row; Two-Activity Practice Session row; DESIGN Practice screen and Practice options sheet; Flow 1 Alternative |
| P1 entry surfaces without component patterns (Goal form, Strategy/Restriction, Observation edit, Original file) | high | **Resolved** | Rows in Goals, Observations and sources; matching DESIGN lines. *New adjacent gap:* the Child Profile and Care Team Member forms (§3) |
| Progress view (FR-16) unspecified | high | **Resolved** | Progress view rule table; DESIGN `chart` and Progress view; chart semantics |
| Membership notifications contradicted | high | **Resolved** | Notifications › Security notices table and channel; "Never" narrowed to practice activity |
| Fixed six-Domain set vs open PRD Domain | high | **Resolved** | Seven-family mapping table plus `domain-other`, with contrast. Residual low: compound-string matching (§2) |
| Flow 2 no failure path | med | Resolved | Flow 2 Failure |
| Flows 3 and 4 no failure paths | med | Resolved | Flow 3 and Flow 4 Failure |
| No scrim token | med | Resolved | `scrim` / `scrim-dark`; dark sheet edge |
| `{colors.domain-*}` wildcard | med | Resolved | Documented `domain-<family>` binding rule |
| Visual-state tokens missing (attention, mask, danger-foreground) | med | Resolved | `attention*`, `mask-cover*`, `danger-foreground*`, `check-tag`, `mask-cover` |
| Selected wash overloaded on Mark buttons | med | Resolved | `mark-button` card plus outline-strong; `pressed` token |
| EXPERIENCE components lacking DESIGN visuals | med | Resolved | Log a moment sheet, Masking, Draft, Confirm, Destructive, Nudge, Timer lines added |
| Surfaces with no component in either spine | med | **Partially** | Behavioural rows added for Plan editor, Activity row, Summary builder, Appointment Feedback, Consent cards, Goal row and Inventory. Visual lines are still missing for most of them (§3) |
| Component name drift | med | Mostly resolved | Plan strip / Plan row, Helpful toggle and Source badge are aligned. Residual low (§7) |
| No loading state | med | Resolved | Loading, Generating rows |
| Permission and consent states missing | med | Resolved | Camera, Push, Consent, Invite rows |
| No non-offline error state | med | Resolved | Save rejected, Session expired rows |
| Empty states missing | med | Resolved | No Goals, No favourites, All suggestions blocked, No Summaries, Summary with no Observations |
| FR-17 date range dropped | med | Resolved | Summary builder Step 2; Flow 4 step 1 |
| Two-tap rule contradicted | med | Resolved | Reach rule restated; "After the appointment" shortcut |
| Off-scale literals | low | Partially (accepted) | `rounded.sm` used, plan-row on `lg`, `ai-label` on `outline-width`. Paddings deferred per memlog |
| Status line fade contradiction | low | Resolved | "no animation" / "no timed fade" |
| Mocks linked only in one block | low | Resolved | Inline links in DESIGN Components |

Accessibility review (`review-accessibility.md`), critical and high findings, checked at spine level only:

| Prior finding | Sev | Status | Evidence |
|---|---|---|---|
| C1 Masking review drag-only and visual-only | critical | **Resolved** | Text checkbox list; single-pointer and keyboard cover mode; count announced in `role="status"` |
| H1 Nav active shown by colour only | high | Resolved | 32×4 `action` bar plus weight 800; `aria-current="page"` |
| H2 Dark parity on Practice | high | Resolved in spine | `tip-surface-dark`, `pressed-dark`, dark Mark values. The dark Practice mock is deferred (accepted) |
| H3 Flat Mark buttons have no edge and reuse Selected | high | Resolved | `mark-button` outline-strong 3.49 / 4.21 |
| H4 No semantic contract | high | Resolved | Accessibility Floor semantics table |
| H5 Text field and stepper boundaries < 3:1 | high | Resolved | `text-field`, `stepper` on outline-strong 3.73 / 3.67 |
| H6 iOS text size not honoured | high | Resolved | 100% root plus `-apple-system-body` |
| H7 Reflow at 320px / 200% | high | Resolved | Reflow table |

## Mechanical notes
- **YAML:** the DESIGN.md frontmatter parses. The component objects mix token references with literal strings (`note`, `size`), which is harmless.
- **Cross-refs:** every `{path}` reference in both files resolves except the documented `{colors.domain-<family>}` placeholder. The EXPERIENCE.md references (`{spacing.content-max}`, `domain-other`, `focus-indicator`, `meta`) resolve to DESIGN.md.
- **Contrast:** every stated ratio was recomputed from the hex values and matches to two decimals.
- **Frontmatter:** both files have name, status, created, updated and sources, and both `sources` lists resolve.
- **Prose glitches:**
  - The Draft review row ends with a dangling "(each flagged field must be touched)" after the sentence it qualifies (EXPERIENCE.md › Draft review).
  - In a two-Activity Practice Session, the scope of the Review-header "Not attempted / child not available" is unstated: whole session or the current section.
- **Mermaid:** none present.
- **Not counted (accepted per memlog):** badge 14px minimum, the "Not today" relabel, literal paddings, the dark Practice mock, and unnamed composite protagonists.
