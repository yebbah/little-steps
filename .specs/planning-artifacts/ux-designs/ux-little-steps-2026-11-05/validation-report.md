# Validation Report — little-steps

- **DESIGN.md:** `DESIGN.md`
- **EXPERIENCE.md:** `EXPERIENCE.md`
- **Run at:** 2026-11-05T14:25:27Z

## Overall verdict

*Findings were raised against the pre-fix draft; a fix pass is being applied in parallel.*

The pair is a solid, buildable contract for the P1 core loop (Today → Prep → Practice → Review). Every color token has a hex value and a dark twin, the contrast claims check out (lowest text pairing is 5.29:1, outline-strong is at least 3.49:1), section shape is canonical, and the flat, no-guilt posture is applied consistently. The weak spots are outside that loop. Several P1 surfaces have an IA row but no visual or behavioural spec: the progress view, the Goal entry form, Strategy and Restriction entry, the Plan editor and Appointment Feedback. FR-10's pause, adapt, skip and second-Activity controls are missing from Practice. The PRD's caregiver-membership notifications conflict with the spine's "never notify about the other Caregiver" rule. And there is no rule for a Domain outside the six tinted ones. The rubric found no critical findings: story-dev can start on the core loop now, but its five high findings should be closed before those epics are written.

The accessibility review shifts that picture for the core loop itself. It confirms the text colour system (every token text pairing passes AA in both themes) and the behavioural floor, but rates the spec **not ready to build**: the mandatory masking review is drag-dependent and visual-only (the one critical finding across both reviewers), nav and Plan-row "now" states rely on colour alone, flat Mark buttons have no visible edge and reuse the Selected wash, dark-mode Practice lacks token parity, text fields and steppers have sub-3:1 edges, there is no semantic contract for custom components, iOS system text sizing is not honoured, and reflow breaks in the Prep footer and Review header. Several findings reinforce rubric items independently: the Mark/Selected overload, the missing scrim and dark sheet edge, the Status line fade, the unspecified progress view, and stale mock headers.

**Accessibility reviewer (own voice):**

Reviewed DESIGN.md, EXPERIENCE.md and all six mocks against WCAG 2.1 AA (PRD §6) and practical caregiver use: phone, one hand, tired, evening (likely dark mode), any browser. Every contrast ratio was computed from the hex tokens. Where a mock differs from a spine the spine wins, but mock divergences are still flagged because builders copy mocks.

**Not ready to build yet. The text colour system is solid, but the component and interaction layer needs fixes.** Text contrast is strong: every text/background pairing passes AA in light and dark (lowest 5.29:1). The behavioural floor is also good: no time limits, gestures never the only way to act, a visible Close on sheets, 200% text scaling, Reduce Motion, and "never colour alone" as a principle.

What blocks build: (1) the mandatory masking review relies on dragging and on vision only; (2) nav active state and Plan-row "now" state are shown by colour alone; (3) flat Mark buttons and dark-mode Practice have no visible boundary or token parity; (4) text fields and steppers have edges below 3:1 in the mocks, and the text field has no token; (5) there is no semantic contract for custom components, and the mocks model incorrect ARIA; (6) system text sizing is not honoured on iOS; (7) reflow fails in the Prep footer and the Review header.

What's already good: every token text pairing passes AA in both themes; `outline-strong` is ≥3:1 for interactive controls (the spec is right; the mocks drift); no time limits and a draft Review survives Back; gestures are never the only route except masking; touch targets ≥48px, buttons 52px, Marks 72px, primary action in the lower third; the banned list (streaks, confetti, countdowns, autoplay) removes most motion and anxiety risk; plain, warm, non-judgemental voice; Domain tints always paired with a text label. The full contrast table lives in `review-accessibility.md`.

## Category verdicts

- Flow coverage — adequate
- Token completeness — adequate
- Component coverage — thin
- State coverage — thin
- Visual reference coverage — adequate
- Bloat & overspecification — strong
- Inheritance discipline — adequate
- Shape fit — strong

Severity totals (all reviewers): critical 1 · high 12 · medium 27 · low 20 (rubric 0/5/15/10, accessibility 1/7/12/10).

## Findings by severity

### Critical (1)

**[Accessibility]** — C1. The masking review is drag-dependent and visual-only (§ EXPERIENCE.md › Component Patterns › Masking review; Privacy & Consent)
WCAG 2.5.1 Pointer Gestures (A), 2.1.1 Keyboard (A), 1.1.1 Non-text Content (A). Adding a cover needs a drag, and the screen is a picture of the page. A keyboard user, switch user, or a caregiver with a tremor or one free hand cannot add a cover. A screen-reader user cannot check what is covered. Because this is the gate before data goes to AI, the failure either blocks import or lets identifiers through.
Fix:
- Pair the image with a **text list of detected lines/identifiers**. Each row is a checkbox ("Covered: clinic letterhead, line 1"), reachable by Tab and toggled with Space.
- Add a single-pointer **"Cover more"** mode: tap a line or block to cover it, or tap two corners to define a box. On keyboard, a focused box moves with arrow keys and resizes with Shift+arrows.
- Keep drag as a shortcut, not the only route.
- Announce the count: "3 items covered."
- Make **"Looks right"** state what will be sent ("Send 1 page with 3 items covered").

### High (12)

**[Flow coverage]** — FR-10 Practice controls missing (§ EXPERIENCE.md › Component Patterns › Practice screen; Key Flows › Flow 1)
The PRD requires pause, adapt (switch to a variation), skip an Activity, and stop, and says a Practice Session holds one or two Activities. The Practice screen offers only Marks, the timer, the Prep card link and Done, with no way to move to a second Activity.
Fix: Add Pause, "Try a variation" and "Skip / next Activity" controls to the Practice screen row (quiet, non-gesture), define how a two-Activity Practice Session sequences into one Review, and add a matching DESIGN.md Components entry.

**[Flow coverage]** — P1 entry surfaces have IA rows but no component pattern (§ EXPERIENCE.md › IA rows Add or import, Goal detail; Component Patterns)
Story-dev would have to invent the forms: the manual Goal form (FR-4: fields, the "describe it as an observable behaviour" prompt, original wording kept beside a Caregiver edit), manual Strategy, Restriction and prescribed-Activity entry (FR-7), editing an Observation later with edit history (FR-14), and viewing or deleting an uploaded original (FR-5).
Fix: Add Component Pattern rows for a Goal form, a Strategy/Restriction form, Observation edit (with a history affordance) and Original file (view/delete, retention note), each with a matching DESIGN.md Components line.

**[Component coverage]** — Progress view (FR-16) has no spec in either spine (§ EXPERIENCE.md › IA › Goal detail; DESIGN.md › Components)
It holds the three separate measures, the Observation count, attention duration "never as a target", AI descriptions that cite Observations, and lineage back through revised Goals. It is the UJ-3 climax and feeds the Summary.
Fix: Add a Progress view row to both spines covering the chart or list form per Criterion type, how the three measures are separated, attribution of who logged each Observation, AI-label placement, and the visual rule against traffic lights or percentages.

**[State coverage]** — Caregiver-membership notifications unspecified and contradicted (§ EXPERIENCE.md › Notifications; State Patterns)
FR-1 says "the remaining Caregivers are notified" when a Caregiver is removed, and PRD §5 says Family deletion "notifies the other Caregivers". The spine's Notifications section says "Never: notifications about the other Caregiver's activity" with no carve-out, and no surface shows how these notices arrive.
Fix: Carve out membership and deletion events (they are security notices, not activity), and specify the channel (in-app banner on Today, plus email via the invite mail path) and the copy.

**[Inheritance discipline]** — Fixed six-Domain tint set vs open-ended PRD Domain (§ DESIGN.md › Colors › Domain tints; EXPERIENCE.md › Component Patterns › Domain tint)
PRD §3 lists joint attention, play, imitation, understanding language and fine motor as examples, §2 names sensory, and L-3 adds oral-motor. Imports extract a free-text domain (UJ-2 step 3). Nothing says how "understanding language" or "fine motor" maps to a tint, or what an unmapped Domain gets.
Fix: State whether Domain is a fixed enum (and list how PRD example Domains map to it), or define a mapping rule plus a neutral fallback tint (e.g. a `domain-other` token with a dark twin). Feed the answer back to the PRD glossary if it becomes an enum.

**[Accessibility]** — H1. Nav and rail active destination is shown by colour only (§ DESIGN.md › components.bottom-nav; mocks key-today, key-review `.nav a.on`)
WCAG 1.4.1 Use of Color (A). Active and inactive labels differ only by colour: indigo #33457F vs ink-soft #555A66 is **1.32:1** in light; in dark, #A9B8EC vs #AEB3C0 is **1.07:1**, so the states are practically identical. Without a non-colour cue the difference would need to be at least 3:1.
Fix:
- Add a shape indicator: a 32×4px `action` bar under the icon (9.14:1 on card, 7.85:1 dark), or a `selected` pill behind the icon *plus* the bar.
- Set the active label to weight 800 and inactive to 600.
- Keep `aria-current="page"`. Apply the same treatment to the tablet/laptop left rail.

**[Accessibility]** — H2. Dark-mode parity breaks on Practice, the most-used evening screen (§ key-practice.html `.mark`, `.tip` (hard-coded); DESIGN.md has no tip-surface token; no dark Practice mock)
WCAG 1.4.3 Contrast (AA), 1.4.11 Non-text Contrast (AA). In dark mode the hard-coded Mark wash would sit under `ink-dark` text at **1.03:1**, which makes the text invisible. The tip surface #F4F2EE has no `-dark` twin. Practice is used in the evening, on a phone that is probably in dark mode.
Fix:
- Mark buttons use `selected` / `selected-dark` (#2C3350; ink-dark on it is 10.86:1).
- Add `tip-surface: '#F4F2EE'` (ink 13.70:1, ink-soft 6.18:1) and `tip-surface-dark: '#2A2D36'` (ink-dark 12.06:1, ink-soft-dark 6.55:1).
- Add a dark Practice and Coach Tip mock. Add a lint rule: no raw hex in component CSS.

**[Accessibility]** — H3. Flat Mark buttons have no visible edge and reuse the "Selected" colour for an unselected action (§ DESIGN.md › components.mark-button; Practice screen)
WCAG 1.4.11 (practical: the text label technically identifies the control), 1.4.1, 3.2.4 Consistent Identification. The Mark fill against the floor is **1.10:1** light and **1.42:1** dark; with no outline the 72px target edge cannot be seen at a glance, in dim light, or with low vision. The same `selected` wash means "chosen" on Review chips, so all four Marks look already selected. There is no visual "saved" feedback after a tap; the only feedback is the sheet opening.
Fix:
- Give Marks `1px solid outline-strong`: 3.49:1 on floor and 3.16:1 on the wash in light; 4.21:1 on floor in dark. Or use `card` fill + outline-strong (3.73:1), and keep `selected` for chosen states only.
- Make the pressed state darken to `outline-strong` with a 2px `action` border for about 300ms (instant under Reduce Motion).
- The sheet's "Mark saved: …" line stays as the textual confirmation.
- Keep "flat": an outline is not a shadow.

**[Accessibility]** — H4. No semantic contract for custom components, and the mocks model wrong ARIA (§ EXPERIENCE.md › Accessibility Floor; mocks (chips, Marks, stepper, Helpful toggle, disclosure, Plan rows))
WCAG 4.1.2 Name, Role, Value (A), 1.3.1 (A), 2.4.6 (AA). The Floor only says "name, role, state". In the mocks, chips are `<span>` inside `role="radiogroup"` with no `role="radio"`; Marks and buttons are `<a href="#">`; the stepper value is a non-focusable `<span role="spinbutton">` with no min/max/valuetext; the Helpful `role="switch"` spans are not focusable and all share the name "Helpful"; "If it gets hard" is an `<a>` with `aria-expanded`; Plan rows are not interactive elements. Builders will copy the mock markup.
Fix:
- Add a required-semantics table to the Accessibility Floor:
- **Mark:** native `<button>`; name = label; after a tap the sheet's accessible description reads "Mark saved: Losing attention".
- **Single-select chips:** native `<input type="radio">` group in `<fieldset><legend>`; arrow keys move the selection.
- **Multi-select chips** ("Which cue or tip helped?"): native checkboxes in a fieldset.
- **Helpful toggle:** `<button aria-pressed>` named "Helpful", with `aria-describedby` pointing to the tip text so each toggle is distinct.
- **Stepper:** native `<input type="number" inputmode="numeric">` with a visible `<label>`, plus "−"/"+" buttons named "Fewer minutes" / "More minutes". "X of Y" is a fieldset with legend "Trials" and inputs labelled "Succeeded" / "Tried".
- **Disclosure** ("If it gets hard"): `<button aria-expanded aria-controls>`.
- **Sheets and dialogs:** `role="dialog" aria-modal="true"`, `aria-labelledby` = sheet heading, focus trapped, focus returned to the invoker.
- **Status line:** a persistent `role="status"` container rendered empty at page load, with text injected later.
- **Timer:** plain text, *not* `role="timer"` live, `aria-live="off"`, labelled "Time so far".
- **Plan row:** one `<a>` or `<button>` per row whose name includes day, Activity, Domain and status.
- **Today card:** `<article>` with a heading; Prep is the only primary button.

**[Accessibility]** — H5. Text field and stepper boundaries are below 3:1, and the text field has no token (§ DESIGN.md (no `text-field` component); key-review.html `.note`, `.stepper`)
WCAG 1.4.11 (AA). The mocks use `outline` #D9DCE6 = **1.37:1** on card and **1.28:1** on floor (1.35/1.55 dark); the stepper's internal dividers are also `outline`. An empty note field can only be identified by its boundary. The placeholder is not a label.
Fix:
- Add `text-field: { background: card, border: '1px solid {colors.outline-strong}', radius: md, minHeight: 48px }` (3.73:1 light, 3.67:1 dark), focus at 2px `focus-ring`.
- Steppers and their dividers use `outline-strong` as the spine already says.
- Give the note field a real `<label for>`.
- Correct the mock CSS and the mock header note that calls the neutral outline "decorative only".

**[Accessibility]** — H6. System text size isn't honoured on iOS, and the mocks pin the root font size (§ DESIGN.md › Typography; every mock `html{font-size:16px}`)
WCAG 1.4.4 Resize Text (AA); PRD §6 "support for system text sizing". rem follows the *browser's* default size, not iOS Dynamic Type. Safari, and every iOS browser because they all use WebKit, ignores the OS text-size setting unless the root uses `font: -apple-system-body`. A px root size also overrides users' browser font-size settings on desktop and Android.
Fix:
- Never set `html{font-size}` in px.
- Use `html{font:-apple-system-body}` inside `@supports (font: -apple-system-body)` with a `100%` fallback, and scale the type tokens from that base.
- Test with iOS Larger Text at maximum, Android font scale 200%, and Chrome or Firefox minimum/default font size.

**[Accessibility]** — H7. Reflow breaks at 320 CSS px and at 200% text (§ key-prep.html `.footer .btn`; key-review.html `.rtop`, `.field.inline`; pinned footer + bottom nav in landscape)
WCAG 1.4.10 Reflow (AA), 1.4.4 (AA). The Prep footer ("Start (optional timer)" and "Log review" side by side, `nowrap`) truncates or overflows at 320px, or at 200% from about 360px, contradicting "no control truncates". "‹ Back" and "Not attempted / child not available" share one row. At 200% text in landscape, the pinned footer, bottom nav and status bar can take more than 50% of the viewport and hide the focused field.
Fix:
- The footer stacks vertically (primary on the bottom, nearest the thumb) when the container is under about 400px or text scale is above 130% (container queries). Allow labels to wrap.
- Move "Not attempted…" onto its own full-width quiet row under the title.
- The inline stepper field wraps to label-above.
- In landscape, or when viewport height is under 500px, make the footer and nav non-sticky.
- Set `scroll-padding-bottom` equal to the footer height so focused fields aren't hidden.

### Medium (27)

**[Flow coverage]** — Flow 2 has no failure or edge path (§ EXPERIENCE.md › Key Flows › Flow 2)
UJ-2 names one: an OT report with no measurable criteria becomes a Narrative Goal. An unreadable photo or unavailable AI is also uncovered.
Fix: Add "Failure: OT report with broad goals → saved as Narrative Goals; unreadable photo or AI unavailable → manual-entry route stays open."

**[Flow coverage]** — Flows 3 and 4 have no failure paths (§ EXPERIENCE.md › Key Flows › Flow 3, Flow 4)
Neither flow covers what happens when its happy path breaks.
Fix: Flow 3: invite expired, or consent not given → the account can't be used, with plain copy. Flow 4: a Goal under 5 Observations shows "limited data", and with no share sheet the fallback is PDF download.

**[Token completeness]** — No scrim token (§ DESIGN.md › Elevation & Depth; frontmatter `colors`)
Elevation & Depth makes "a dim scrim, not a shadow" the only separation for sheets and dialogs, but no scrim token exists.
Fix: Add `scrim` and `scrim-dark` (hex plus opacity) and reference them from `coach-tip-sheet`.

**[Token completeness]** — `{colors.domain-*}` wildcard cannot be resolved (§ DESIGN.md frontmatter `components` (`hero-band.background`, `cue-tile.background`))
No resolver can flatten the wildcard reference.
Fix: State the binding rule explicitly (e.g. `background: '{colors.domain-<activity.domain>}'` plus a note) and pair it with the Domain fallback in Inheritance discipline.

**[Token completeness]** — Visual states named in EXPERIENCE.md have no tokens (§ EXPERIENCE.md › State Patterns; Component Patterns › Masking review, Destructive confirm)
The uncertain-field highlight ("Please check this."), the masking cover block, the danger button fill or foreground (unclear whether `danger` is text or fill), and the offline line or deletion banner have no tokens.
Fix: Add `attention`/`attention-soft` (non-traffic-light) and `mask-cover` tokens with dark twins, plus `danger-foreground`, and state how `danger` is applied.

**[Token completeness]** — Selected wash overloaded on Mark buttons (§ DESIGN.md › Components › Practice screen; frontmatter `mark-button`)
`mark-button.background` is `{colors.selected}`, the same token that means "selected" on choice chips. At rest, Mark buttons look selected, and their boundary is 1.10:1 against floor (1.42:1 dark) with no outline.
Fix: Give Mark buttons their own token (e.g. `mark` / `mark-dark`) distinct from `selected`, and record the WCAG 1.4.11 rationale: the text label identifies the control, and flat with no outline is the PO's choice.

**[Component coverage]** — EXPERIENCE.md components with no DESIGN.md visual spec (§ DESIGN.md › Components)
The Log a moment sheet (only the button is specified), Masking review, Draft review, Confirm-to-share, Destructive confirm, Nudge and Timer.
Fix: Add one visual line each (surface, radius, tokens, state appearance).

**[Component coverage]** — Surfaces with no component in either spine (§ EXPERIENCE.md › IA)
The Plan editor (FR-13: accept or edit, item count, days and Contexts, weekly availability, week start), the Appointment Feedback form (FR-18), the Summary preview or builder, the consent cards, Goal rows and grouping in Goals, Activity library rows (favourite and hide) and the Inventory entry (FR-15, P2).
Fix: Add behavioural rows, and visual lines where the spine is the only spec.

**[Component coverage]** — Component names drift between files (§ DESIGN.md › Components; EXPERIENCE.md › Component Patterns)
"Plan strip" (EXPERIENCE.md) vs "Plan rows" and "This week" (DESIGN.md) vs `plan-row`; "Helpful toggle" vs "Helpful toggle chip"; "Badges and labels" / "Source badges" vs "Source badge".
Fix: Pick one name per component and use it in both files and the frontmatter.

**[State coverage]** — No loading or cold-load pattern (§ EXPERIENCE.md › State Patterns)
Today on a cold open, Summary draft generation, import OCR and extraction progress, and Prep card fetch have no loading treatment.
Fix: Add a loading row (a skeleton or `meta` line, no spinners that read as waiting on AI for curated content).

**[State coverage]** — Permission and consent states missing (§ EXPERIENCE.md › State Patterns; Privacy & Consent Surfaces)
Camera permission denied for Photo import, push permission declined, consent not given (FR-1: "the account cannot be used"), and an invite link that is invalid or expired.
Fix: Add a row for each with copy and the route forward.

**[State coverage]** — No non-offline error state (§ EXPERIENCE.md › State Patterns)
A Save rejected by the server, an expired OIDC session mid-Review, or a failed upload has no treatment. "No error dialogs" is stated only for sync.
Fix: Add a generic recoverable-error row (the draft is kept, re-auth returns to the same Review) in the Voice and Tone style.

**[State coverage]** — Empty states missing (§ EXPERIENCE.md › State Patterns)
Goals (none yet), Activities (no favourites, everything hidden, or every AI suggestion silently blocked by Restrictions, leaving an empty list with no message), Share (no Summaries yet), and a Summary for a Goal Period with zero Observations.
Fix: Add empty-state rows. For all-blocked suggestions, show a neutral "No new ideas right now" without revealing the Restriction.

**[Inheritance discipline]** — FR-17 date-range option dropped (§ EXPERIENCE.md › IA › Summary builder; Flow 4 step 1)
FR-17 allows a Summary for "either a date range or a Goal Period", but the Summary builder offers only the Goal Period.
Fix: Add a date-range option to the builder.

**[Inheritance discipline]** — Two-tap rule contradicted by the IA (§ EXPERIENCE.md › IA › Rules)
"Every surface can be reached in two taps or fewer from Today, except Settings sub-pages", yet Appointment Feedback (Share → Summary → After the appointment) and New Goal Period (Goals → Care Team Member → New period) take three.
Fix: Widen the exception, or add shortcuts (e.g. an "After the appointment" entry on the Summaries list).

**[Accessibility]** — M1. Focus indicator geometry unspecified; the ring matches the primary button fill (§ DESIGN.md `focus-ring` = `action`; EXPERIENCE.md Keyboard)
WCAG 2.4.7 (AA), 1.4.11. On a primary button the ring against the button is 1.0:1. It only works if offset so it sits on floor or card. Measured ring contrasts otherwise pass everywhere (floor 8.55, card 9.14, Domain tints 7.00–7.45, selected 7.75; dark 9.00 / 7.85 / 6.34).
Fix:
- Specify `outline: 2px solid focus-ring; outline-offset: 2px` on all controls, using `:focus-visible`.
- Never use `outline:none` without a replacement. For Windows High Contrast and forced-colors mode, keep a real `outline` (not a box-shadow ring).

**[Accessibility]** — M2. Focus management for sheets and route changes not specified (§ EXPERIENCE.md › Accessibility Floor)
WCAG 2.4.3 (A), 2.4.2 (A), 2.1.2 (A). The Floor only says the Coach Tip sheet moves focus to its first tip.
Fix:
- When a sheet opens, focus goes to the sheet heading (`tabindex="-1"`), not to a `<p>` as the mock shows.
- Trap focus inside the sheet. On close, return focus to the Mark that opened it.
- On an SPA route change, update `document.title` ("Prep: Storybook together · LittleSteps") and move focus to the `<h1>`.
- Restore scroll and focus position on Back. When Done goes to Review, focus "How did it go?".

**[Accessibility]** — M3. Status messages can be missed or collide (§ Status line; Mark announcement vs sheet focus; AI tips; offline line)
WCAG 4.1.3 Status Messages (AA), 2.2.1 (spirit). A 4s fade is too short for magnifier users or someone glancing back after settling a child. Moving focus into the sheet interrupts the live "Mark saved" announcement. Late AI tips that insert content can shift the target under the thumb.
Fix:
- The status line stays until the next user action or navigation (no time-based fade).
- The "Mark saved: …" line is the sheet's `aria-describedby`, announced with the dialog name, not as a separate live region.
- AI tips are added *below* the curated ones; reserve their space with a "More ideas are on the way" line and announce politely: "1 more idea added."
- Offline and sync lines use `role="status"`.

**[Accessibility]** — M4. Dark-mode sheet edge disappears (flat, no shadow) (§ DESIGN.md › Elevation)
WCAG 1.4.11 (practical), dark parity. `card-dark` #22252D against the scrimmed dark floor is **1.15–1.29:1**, so the top of the Coach Tip sheet is invisible. In light it is 3.06:1, which is fine.
Fix: Add a `1px solid outline-strong-dark` top and side border on sheets and dialogs in dark mode (about 4.6:1 against the scrimmed floor), or a raised `sheet-dark: '#2A2D36'` surface plus that border. Keep the grabber at `outline-strong-dark`.

**[Accessibility]** — M5. Flat cards and tappable rows have weak edges (§ card / plan-row / block-card on floor; "If it gets hard"; hero band)
WCAG 1.4.11 (practical), 3.2.4. `outline` is 1.28:1 light / 1.55:1 dark on floor; card vs floor fill is 1.07 / 1.15; "If it gets hard" uses dashed `outline` at 1.37:1; hero band vs floor is 1.18. Decorative cards are fine, but **Plan rows, the Today card and "If it gets hard" are interactive**, and their extent is barely visible in glare or for low-vision users.
Fix:
- Interactive cards and rows use `outline-strong` (3.49 floor / 4.21 dark) or a new `outline-interactive: '#8E94A4'` (3.03 card / 2.84 floor; take outline-strong if ≥3 on floor is needed). Add a trailing chevron.
- Purely decorative cards may stay on `outline`, or darken it to `#B4B9C6` (1.84 on floor).
- "If it gets hard" uses a dashed `outline-strong`.

**[Accessibility]** — M6. Plan-row "now" is shown by colour only (§ key-review / key-today `.plan li.now`)
WCAG 1.4.1. The current row differs only by an `action` border and an indigo day label.
Fix: Add a text tag "Next" or "Today" (meta, ink) and a 2px `action` border. Keep `aria-current="true"` and include "next up" in the accessible name.

**[Accessibility]** — M7. Selected chip: the mock drops the check glyph and uses a Domain tint (§ mocks `.chip.sel`; spec: `selected` wash, `action` border, check glyph, bold)
WCAG 1.4.1, 1.4.11. The mock has no glyph and unselected chips use `outline` (1.37). Selected and unselected borders (action vs outline-strong) differ by only **2.45:1** (2.14:1 dark), and fills by 1.18, so without the glyph the state is effectively colour-only.
Fix:
- Make the glyph mandatory (ink on selected 12.99 / 10.86).
- Selected border 2px `action`, unselected 1px `outline-strong`, with a padding adjustment so the label doesn't jump.
- Fix the mocks and the "Mark: Losing attention" chip on Review.

**[Accessibility]** — M8. No recovery from one-tap mistakes (§ "Not attempted" on Review; Marks; "Not this one")
WCAG 3.3.4 (spirit), cognitive. "Not attempted" is a one-tap save at the top of Review that discards the pre-filled Review; a wrong Mark has no undo.
Fix:
- Each status line carries an **Undo** button: "That's okay — logged as not today. Undo", "Mark saved: Upset. Undo".
- The Undo stays until the next action, with no time limit.
- The 10-second Mark dedupe tells the user what happened ("Already marked" in the sheet), not a silent ignore.

**[Accessibility]** — M9. Clinical jargon and form length on Review (§ Review › Prompt Level chips; 7+ fields against a 20-second target)
WCAG 3.3.2 (A), cognitive. "Full physical / Partial physical / Model / Gestural / Verbal / Independent" are therapist terms with no gloss.
Fix:
- Keep the therapist's terms, and add a one-line plain gloss under each option in `meta` (e.g. "Model — you showed how", "Gestural — you pointed or nodded").
- Collapse the pre-filled defaults into a summary ("Reading · One-to-one · Model — Change") so a typical Review is just Save.
- Announce the pre-filled state ("pre-filled from last time").

**[Accessibility]** — M10. Draft review: the disabled Confirm button is unexplained (§ EXPERIENCE.md › State Patterns › Uncertain extraction)
WCAG 3.3.1 (A), 1.4.1. `ink-disabled` is 2.38:1, which is exempt, but users don't learn *why* the button is disabled.
Fix:
- Keep Confirm enabled. On press, move focus to the first unchecked field with "Please check this (2 left)".
- The highlight uses a text tag plus an icon plus a 2px `parent-proposed` border (≥3:1), not a tint alone.

**[Accessibility]** — M11. Goal detail progress charts have no accessibility spec (§ EXPERIENCE.md › IA › Goal detail)
WCAG 1.1.1, 1.4.1, 1.4.11. The "three separate measures" have no non-visual or non-hue treatment.
Fix:
- Give each chart a text summary in the spec's honest-data voice, and offer a "Show as table" toggle.
- Distinguish series by label and marker shape, not hue.
- Lines and markers ≥3:1 against the card: use `action` / `ink-soft` / `care-team`, never Domain tints (about 1.2:1).

**[Accessibility]** — M12. Stepper validation and labelling unspecified (§ EXPERIENCE.md › Component Patterns › Stepper)
WCAG 3.3.1, 3.3.3, 1.3.1. "X of Y" with direct entry has no bounds or error copy.
Fix:
- Clamp values to ≥0 and Y ≥ X with inline text ("Can't be more than 5 tried"), linked with `aria-describedby`.
- Disable "−" at 0 and say so ("0, minimum").
- Value changes from −/+ are reflected in the input's value, not a separate live region.

### Low (20)

**[Flow coverage]** — Flow 1 climax drifts from UJ-1; Guided mode absent (§ EXPERIENCE.md › Key Flows › Flow 1)
The Flow 1 climax ("Review saved") replaces UJ-1's in-Activity climax (the child settles and the parent had a workable next step), and Guided mode (UJ-1's Alternative) appears in no flow.
Fix: Make step 4 the climax, or note that the UJ climax maps to step 4. Add a one-line Guided-mode alternative.

**[Token completeness]** — Off-scale literal values (§ DESIGN.md frontmatter; Layout & Spacing; EXPERIENCE.md › Responsive & Platform)
`block-card.padding: 14px`, `hero-band.padding: 16px 20px 22px`, `plan-row.radius: 18px` (not in `rounded`), `cue-number.size: 44px`, `ai-label.border: 1px` (should be `{spacing.outline-width}`), the "24–28px" group gap and "560px" sheet width. `rounded.sm` is never used.
Fix: Snap these to scale tokens or add named tokens, and drop or assign `rounded.sm`.

**[Component coverage]** — Stepper and Choice chips rows incomplete (§ EXPERIENCE.md › Component Patterns › Stepper vs Review form; Choice chips)
The Stepper row says it "shows 'X of Y' as two steppers", but attention minutes uses a single stepper. The Choice chips row omits who-modelled and the multi-select "Which cue or tip helped?" variant.
Fix: Cover both the single and paired stepper modes, and list the multi-select chip variant.

**[State coverage]** — Abandoned open Practice Session has no resolution (§ EXPERIENCE.md › Component Patterns › Practice screen; Accessibility Floor › Time limits)
The Practice Session "never times out" and reopening returns to Practice, but nothing says what happens the next day. WebKit storage eviction for offline drafts (addendum §B) is not reflected.
Fix: Define when a stale open Practice Session prompts for Review or a neutral close, and note prompt sync for queued Observations.

**[Visual reference coverage]** — Mocks linked in one block, not inline (§ DESIGN.md › Components › Today screen, Prep card, Practice screen, Review form)
The mocks are linked from Brand & Style and IA, not at the Components or Component Patterns entries they illustrate.
Fix: Add a one-line "→ mockups/key-*.html" under each matching component.

**[Visual reference coverage]** — Mock header comments describe superseded spine content (§ mockups/key-*.html headers)
Headers claiming to list "GOVERNING SPINE SECTIONS" mention block shadows on icon tiles and Cue numbers, a "2px action outline, block shadow" on Mark buttons, and periwinkle-filled selected chips. They cite the removed `.working/direction-playroom.html` and keep `--block-shadow` / `--tile-shadow-*` variables. The Review mock's who-modelled options differ ("Caregiver" vs the spine's "You · Another caregiver"). Spine-wins covers this, so impact is low.
Fix: Refresh the mock headers, or add one sentence to the spine's reference note saying mock header comments are historical.

**[Bloat & overspecification]** — Review form row is one dense paragraph (§ EXPERIENCE.md › Component Patterns › Review form)
It carries about eight fields, options, defaults and pre-fill rules in a single paragraph.
Fix: Split it into a sub-table (Field · Control · Options · Default/pre-fill source · Required).

**[Inheritance discipline]** — "Goal Domain" vs glossary "Domain"; paraphrased flow titles (§ DESIGN.md › Colors; EXPERIENCE.md › Key Flows)
The files use "Goal Domain", but the glossary term is "Domain". Flow titles paraphrase the UJ names (IDs are present, so they stay traceable).
Fix: Use "Domain", and optionally quote the UJ title after the ID.

**[Inheritance discipline]** — Status line animation contradicts across spines (§ DESIGN.md › Components › Status line; EXPERIENCE.md › Component Patterns › Status line)
DESIGN.md says "no toast animation"; EXPERIENCE.md says it "fades after about 4 seconds", and the fade has no Reduce Motion rule.
Fix: Either drop the fade or define it as an opacity change that Reduce Motion skips.

**[Shape fit]** — DESIGN.md Components organised by screen, frontmatter by component (§ DESIGN.md › Components)
The prose mixes composition with component specs, while the frontmatter is keyed by component (`hero-band`, `cue-tile`, …). Mapping prose to tokens takes inference.
Fix: Keep the screen groupings, but put the frontmatter key in each bullet (e.g. "Hero band (`hero-band`)").

**[Accessibility]** — L1. Restrict `ink-disabled` to disabled controls (§ Tokens)
WCAG 1.4.3. It is 2.38 on card, 2.23 on floor, 2.97 in dark.
Fix: Restrict it by rule to disabled controls only, never placeholders, hints or "Reviewed" states.

**[Accessibility]** — L2. Map Reduce Motion to the web setting (§ Accessibility Floor)
WCAG 2.3.3 good practice.
Fix: Map it to `@media (prefers-reduced-motion: reduce)`. The status line and Mark pressed state change instantly, and sheets appear with no slide or fade.

**[Accessibility]** — L3. Don't lock orientation (§ Practice, Prep)
WCAG 1.3.4.
Fix: Practice and Prep must work in landscape, for example with the phone propped up.

**[Accessibility]** — L4. Coach sheet Close is out of thumb reach (§ Coach Tip sheet)
It sits top-right.
Fix: Add a full-width "Back to practice" quiet button at the bottom of the sheet, in the one-handed zone.

**[Accessibility]** — L5. Timer wording (§ Practice › Timer)
"Timer 3:42" can read as a countdown.
Fix: Use "Time so far 3:42". It is never announced live (see H4).

**[Accessibility]** — L6. Bypass blocks (§ Laptop / tablet layout)
WCAG 2.4.1. The mocks have `<main>` on the presentation board only.
Fix: Add a "Skip to content" link before the left rail, plus `<nav>`/`<main>` landmarks.

**[Accessibility]** — L7. Text spacing (§ Chips, status line pill, stepper value)
WCAG 1.4.12. Fixed heights (e.g. stepper value `line-height:48px`) can clip.
Fix: Use min-height and padding so text with 1.5 line-height and 0.12em letter-spacing doesn't clip (40px min-height on the status pill is fine).

**[Accessibility]** — L8. Small meta text (§ `meta` (dates, badges, AI labels))
13px/400 is legible but small for tired eyes at night.
Fix: Consider a 14px minimum for badges and the AI label.

**[Accessibility]** — L9. Stale mock notes (§ mockups/ header notes and captions)
They describe old states ("2px action outline, block shadow" Marks, "white block Mark with indigo outline", "outline decorative only").
Fix: Update them so reviewers and builders aren't misled.

**[Accessibility]** — L10. "Not attempted / child not available" label length (§ Review header)
It is long for a quiet button.
Fix: Shorten to "Not today" with the accessible name "Not attempted today".

## Mechanical notes

- **Name inconsistencies:** Plan strip / Plan rows / "This week" / `plan-row`; Helpful toggle / Helpful toggle chip; Source badge / Source badges / Badges and labels; Goal Domain / Domain; Mark button / Mark buttons (harmless plural).
- **Cross-refs:** both `{path}` references in EXPERIENCE.md resolve. In DESIGN.md, `{colors.domain-*}` is unresolvable as written, and `ai-label.border` hard-codes `1px` instead of `{spacing.outline-width}`. `plan-row.radius: 18px` is off the `rounded` scale and missing from the Shapes table.
- **Frontmatter:** DESIGN.md has name, description and all five token groups, plus non-spec keys (status, created, updated, sources), which are harmless. EXPERIENCE.md has name, status, created, updated and sources. Both `sources` lists resolve.
- **Mocks:** headers reference the deleted `.working/` path and superseded shadow and outline specs. Phone-frame `box-shadow` in the mocks is presentation chrome, not a product spec.
- **Memlog:** earlier assumptions (sage primary, apricot for Marks, 14px inputs, 2px outlines, block shadows) are all superseded by later decisions, and the spines reflect the final state.
- **Mermaid:** none present.

## Reviewer files
- `review-rubric.md`
- `review-accessibility.md`
