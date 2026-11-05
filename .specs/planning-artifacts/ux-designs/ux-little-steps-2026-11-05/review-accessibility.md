# Accessibility Review: LittleSteps UX spec (Playroom, flat)

- **Reviewed:** DESIGN.md, EXPERIENCE.md, mockups/ (key-today, key-prep, key-practice, key-review, direction-playroom, key-index)
- **Against:** WCAG 2.1 AA (PRD §6) and practical caregiver use: phone, one hand, tired, evening (likely dark mode), any browser
- **Date:** 2026-11-05
- **Method:** I computed every contrast ratio from the hex tokens using the WCAG relative-luminance formula. Where a mock differs from a spine, the spine wins (as DESIGN.md says), but I still flag mock divergences because builders copy mocks.

## Overall verdict

**Not ready to build yet. The text colour system is solid, but the component and interaction layer needs fixes.**

**Text contrast is strong.** Every text/background pairing in the token set passes AA in light and dark mode. The lowest is 5.29:1, which confirms the DESIGN.md claim. The behavioural floor is also good: no time limits, gestures never the only way to act, a visible Close on sheets, 200% text scaling, Reduce Motion, and "never colour alone" as a principle.

**What blocks build:**
1. The mandatory **masking review** relies on dragging and on vision only.
2. **Nav active state** and **Plan-row "now" state** are shown by colour alone.
3. **Flat Mark buttons** and **dark-mode Practice** have no visible boundary or token parity.
4. **Text fields and steppers** have edges below 3:1 in the mocks, and the text field has no token at all.
5. There is **no semantic contract** for custom components, and the mocks model incorrect ARIA.
6. **System text sizing** is not actually honoured on iOS.
7. **Reflow** fails in the Prep footer and the Review header.

| Severity | Count |
|---|---|
| Critical | 1 |
| High | 7 |
| Medium | 12 |
| Low | 10 |

---

## Findings

### Critical

**C1. The masking review is drag-dependent and visual-only**
- **WCAG:** 2.5.1 Pointer Gestures (A), 2.1.1 Keyboard (A), 1.1.1 Non-text Content (A)
- **Location:** EXPERIENCE.md › Component Patterns › Masking review ("Tap a block to uncover it, or drag to cover more"); Privacy & Consent (masking is mandatory in every import)
- **Issue:** Adding a cover needs a drag, and the screen is a picture of the page.
  - A keyboard user, switch user, or a caregiver with a tremor or one free hand cannot add a cover.
  - A screen-reader user cannot check what is covered.
  - Because this is the gate before data goes to AI, the failure either blocks import or lets identifiers through.
- **Fix:**
  - Pair the image with a **text list of detected lines/identifiers**. Each row is a checkbox ("Covered: clinic letterhead, line 1"), and all rows can be reached by Tab and toggled with Space.
  - Add a single-pointer **"Cover more"** mode: tap a line or block to cover it, or tap two corners to define a box. On keyboard, a focused box moves with arrow keys and resizes with Shift+arrows.
  - Keep drag as a shortcut, not the only route.
  - Announce the count: "3 items covered."
  - Make **"Looks right"** state what will be sent ("Send 1 page with 3 items covered").

### High

**H1. Nav and rail active destination is shown by colour only**
- **WCAG:** 1.4.1 Use of Color (A)
- **Location:** DESIGN.md › components.bottom-nav (active `action` vs inactive `ink-soft`); mocks key-today, key-review `.nav a.on`
- **Issue:** Active and inactive labels differ only by colour. Indigo #33457F vs ink-soft #555A66 is **1.32:1** in light. In dark, #A9B8EC vs #AEB3C0 is **1.07:1**, so the states are practically identical. Without a non-colour cue, the colour difference would need to be at least 3:1.
- **Fix:**
  - Add a shape indicator: a 32×4px `action` bar under the icon (9.14:1 on card, 7.85:1 dark), or a `selected` pill behind the icon *plus* the bar.
  - Set the active label to weight 800 and inactive to 600.
  - Keep `aria-current="page"`. Apply the same treatment to the tablet/laptop left rail.

**H2. Dark-mode parity breaks on Practice, the most-used evening screen**
- **WCAG:** 1.4.3 Contrast (AA), 1.4.11 Non-text Contrast (AA)
- **Location:** key-practice.html `.mark{background:#E9ECF7}`, `.tip{background:#F4F2EE}` (both hard-coded); DESIGN.md has no token for the tip surface; no dark Practice mock exists
- **Issue:**
  - In dark mode the hard-coded Mark wash would sit under `ink-dark` text at **1.03:1**, which makes the text invisible.
  - The tip surface #F4F2EE has no `-dark` twin.
  - Practice is used in the evening, on a phone that is probably in dark mode.
- **Fix:**
  - Mark buttons use `selected` / `selected-dark` (#2C3350; ink-dark on it is 10.86:1).
  - Add the tokens `tip-surface: '#F4F2EE'` (ink 13.70:1, ink-soft 6.18:1) and `tip-surface-dark: '#2A2D36'` (ink-dark 12.06:1, ink-soft-dark 6.55:1).
  - Add a dark Practice and Coach Tip mock. Add a lint rule: no raw hex in component CSS.

**H3. Flat Mark buttons have no visible edge and reuse the "Selected" colour for an unselected action**
- **WCAG:** 1.4.11 Non-text Contrast (AA, practical: the text label technically identifies the control), 1.4.1 Use of Color, 3.2.4 Consistent Identification
- **Location:** DESIGN.md › components.mark-button (`background: selected`, `border: none`); Practice screen
- **Issue:**
  - The Mark fill against the floor is **1.10:1** in light and **1.42:1** in dark. With no outline, the 72px target edge cannot be seen, which matters at a glance, in dim light, or with low vision.
  - The same `selected` wash means "chosen" on Review chips, so all four Marks look already selected (a cross-screen meaning conflict).
  - There is no visual "saved" feedback after a tap. The only feedback is the sheet opening.
- **Fix:**
  - Give Marks `1px solid outline-strong`: 3.49:1 on floor and 3.16:1 on the wash in light; 4.21:1 on floor in dark. Or use `card` fill + outline-strong (3.73:1), and keep `selected` for chosen states only.
  - Make the pressed state darken to `outline-strong` with a 2px `action` border for about 300ms (instant under Reduce Motion).
  - The sheet's "Mark saved: …" line stays as the textual confirmation.
  - Keep "flat": an outline is not a shadow.

**H4. No semantic contract for custom components, and the mocks model wrong ARIA**
- **WCAG:** 4.1.2 Name, Role, Value (A), 1.3.1 Info and Relationships (A), 2.4.6 Headings and Labels (AA)
- **Location:** EXPERIENCE.md › Accessibility Floor (only says "name, role, state"); mocks: chips are `<span>` inside `role="radiogroup"` with no `role="radio"`; Marks and buttons are `<a href="#">`; the stepper value is a `<span role="spinbutton">` with no min/max/valuetext and is not focusable; the Helpful `role="switch"` spans are not focusable and all share the name "Helpful"; "If it gets hard" is an `<a>` with `aria-expanded`; Plan rows are not interactive elements
- **Issue:** Builders will copy the mock markup.
- **Fix:** Add a table to the Accessibility Floor:

  | Component | Required semantics |
  |---|---|
  | Mark | Native `<button>`. Name = label. After a tap, the sheet's accessible description reads "Mark saved: Losing attention". |
  | Single-select chips | Native `<input type="radio">` group in `<fieldset><legend>`. Arrow keys move the selection. |
  | Multi-select chips ("Which cue or tip helped?") | Native checkboxes in a fieldset. |
  | Helpful toggle | `<button aria-pressed>`. Name "Helpful", with `aria-describedby` pointing to the tip text, so each toggle is distinct ("Helpful, Sing a familiar song, pressed"). |
  | Stepper | Native `<input type="number" inputmode="numeric">` with a visible `<label>`, plus "−"/"+" buttons named "Fewer minutes" / "More minutes". "X of Y" is a fieldset with the legend "Trials" and the two inputs labelled "Succeeded" / "Tried". |
  | Disclosure ("If it gets hard") | `<button aria-expanded aria-controls>`. |
  | Sheets and dialogs | `role="dialog" aria-modal="true"`, `aria-labelledby` = sheet heading, focus trapped, focus returned to the invoker. |
  | Status line | A persistent `role="status"` container rendered empty at page load, with text injected later. |
  | Timer | Plain text, *not* `role="timer"` live, `aria-live="off"`, labelled "Time so far". |
  | Plan row | One `<a>` or `<button>` per row whose name includes day, Activity, Domain and status ("Thursday, Storybook together, Joint attention, Reviewed"). |
  | Today card | `<article>` with a heading. Prep is the only primary button. |

**H5. Text field and stepper boundaries are below 3:1, and the text field has no token**
- **WCAG:** 1.4.11 Non-text Contrast (AA)
- **Location:** DESIGN.md has no `text-field` component (the prose says inputs use outline-strong). key-review.html `.note` and `.stepper` use `outline` #D9DCE6 = **1.37:1** on card and **1.28:1** on floor (1.35/1.55 in dark). The stepper's internal dividers are also `outline`.
- **Issue:** An empty note field can only be identified by its boundary. The placeholder is not a label.
- **Fix:**
  - Add the token `text-field: { background: card, border: '1px solid {colors.outline-strong}', radius: md, minHeight: 48px }`. This gives 3.73:1 light and 3.67:1 dark, with focus at 2px `focus-ring`.
  - Steppers and their dividers use `outline-strong` as the spine already says.
  - Give the note field a real `<label for>`.
  - Correct the mock CSS and the mock header note that calls the neutral outline "decorative only".

**H6. System text size isn't honoured on iOS, and the mocks pin the root font size**
- **WCAG:** 1.4.4 Resize Text (AA); PRD §6 "support for system text sizing"
- **Location:** DESIGN.md Typography ("All sizes are in rem so text scaling is honoured"); every mock has `html{font-size:16px}`
- **Issue:** rem follows the *browser's* default size, not iOS Dynamic Type. Safari, and every iOS browser because they all use WebKit, ignores the OS text-size setting unless the root uses `font: -apple-system-body`. A px root size also overrides users' browser font-size settings on desktop and Android.
- **Fix:**
  - Never set `html{font-size}` in px.
  - Use `html{font:-apple-system-body}` inside `@supports (font: -apple-system-body)` with a `100%` fallback, and scale the type tokens from that base.
  - Test with iOS Larger Text at maximum, Android font scale 200%, and Chrome or Firefox minimum/default font size.

**H7. Reflow breaks at 320 CSS px and at 200% text**
- **WCAG:** 1.4.10 Reflow (AA), 1.4.4 Resize Text (AA)
- **Location:**
  - key-prep.html `.footer .btn{white-space:nowrap}`: "Start (optional timer)" and "Log review" sit side by side, each at 52px.
  - key-review.html `.rtop`: "‹ Back" and "Not attempted / child not available" sit on one row.
  - `.field.inline` puts the stepper label and the stepper on one row.
  - Pinned Save or footer plus the bottom nav on a landscape phone.
- **Issue:**
  - The Prep footer truncates or overflows at 320px, or at 200% from about 360px. This contradicts "no control truncates".
  - At 200% text in landscape, the pinned footer, bottom nav and status bar can take more than 50% of the viewport and hide the focused field.
- **Fix:**
  - The footer stacks vertically (primary on the bottom, nearest the thumb) when the container is under about 400px or text scale is above 130% (use container queries). Allow labels to wrap.
  - Move "Not attempted…" onto its own full-width quiet row under the title.
  - The inline stepper field wraps to label-above.
  - In landscape, or when the viewport height is under 500px, make the footer and nav non-sticky (in the flow).
  - Set `scroll-padding-bottom` equal to the footer height so focused fields aren't hidden.

### Medium

**M1. Focus indicator geometry unspecified; the ring matches the primary button fill**
- **WCAG:** 2.4.7 Focus Visible (AA), 1.4.11
- **Location:** DESIGN.md `focus-ring` = `action`; EXPERIENCE.md Keyboard
- **Issue:** On a primary button the ring against the button is 1.0:1. It only works if it is offset so that it sits on floor or card.
- **Fix:**
  - Specify `outline: 2px solid focus-ring; outline-offset: 2px` on all controls, using `:focus-visible`.
  - Measured ring contrasts: floor 8.55, card 9.14, Domain tints 7.00–7.45, selected 7.75. Dark: floor-dark 9.00, card-dark 7.85, selected-dark 6.34. All pass.
  - Inside a Domain-tinted hero, the offset gap is the tint (≥7:1, fine).
  - Never use `outline:none` without a replacement. Windows High Contrast and forced-colors mode: keep a real `outline` (not a box-shadow ring) so it survives.

**M2. Focus management for sheets and route changes not specified**
- **WCAG:** 2.4.3 Focus Order (A), 2.4.2 Page Titled (A), 2.1.2 No Keyboard Trap (A)
- **Location:** EXPERIENCE.md Accessibility Floor (only "Coach Tip sheet moves focus to its first tip")
- **Fix:**
  - When a sheet opens, focus goes to the sheet heading (`tabindex="-1"`), not to a `<p>` as the mock shows.
  - Trap focus inside the sheet. On close, return focus to the Mark that opened it.
  - On an SPA route change, update `document.title` ("Prep: Storybook together · LittleSteps") and move focus to the `<h1>`.
  - Restore the scroll and focus position on Back.
  - When Done goes to Review, put focus on "How did it go?".

**M3. Status messages can be missed or collide**
- **WCAG:** 4.1.3 Status Messages (AA), 2.2.1 Timing Adjustable (spirit)
- **Location:** Status line ("fades after about 4 seconds"); the Mark announcement vs the sheet focus move; AI tips "appear below when ready"; offline "Saved on this device" line
- **Issue:**
  - A 4s fade is too short for magnifier users or for someone glancing back after settling a child.
  - Moving focus into the sheet interrupts the live "Mark saved" announcement.
  - Late AI tips that insert content can shift the target under the thumb.
- **Fix:**
  - The status line stays until the next user action or navigation (no time-based fade).
  - The "Mark saved: …" line is the sheet's `aria-describedby`, so it is announced with the dialog name, not as a separate live region.
  - AI tips are added *below* the curated ones. Reserve their space with a "More ideas are on the way" line so nothing shifts, and announce politely: "1 more idea added."
  - Offline and sync lines use `role="status"`.

**M4. Dark-mode sheet edge disappears (flat, no shadow)**
- **WCAG:** 1.4.11 (practical), dark parity
- **Location:** DESIGN.md Elevation ("overlays separated by a dim scrim")
- **Issue:** `card-dark` #22252D against the scrimmed dark floor is **1.15–1.29:1**, so the top of the Coach Tip sheet is invisible. In light it is 3.06:1, which is fine.
- **Fix:** Add a `1px solid outline-strong-dark` top and side border on sheets and dialogs in dark mode (about 4.6:1 against the scrimmed floor), or a raised surface token `sheet-dark: '#2A2D36'` plus that border. Keep the grabber at `outline-strong-dark`.

**M5. Flat cards and tappable rows have weak edges**
- **WCAG:** 1.4.11 (practical), 3.2.4
- **Location:** card / plan-row / block-card on floor: `outline` 1.28:1 light / 1.55:1 dark. Card vs floor fill is 1.07 / 1.15. "If it gets hard" uses a dashed `outline` at 1.37:1. Hero band vs floor is 1.18.
- **Issue:** Decorative cards are fine. **Plan rows, the Today card and "If it gets hard" are interactive**, and their extent is barely visible in glare or for low-vision users.
- **Fix:**
  - Interactive cards and rows use `outline-strong` (3.49 floor / 4.21 dark) or a new `outline-interactive: '#8E94A4'` (3.03 card / 2.84 floor; take outline-strong if you need ≥3 on floor). Add a trailing chevron.
  - Purely decorative cards may stay on `outline`, or darken it to `#B4B9C6` (1.84 on floor) for a sturdier shelf look.
  - "If it gets hard" uses a dashed `outline-strong`.

**M6. Plan-row "now" is shown by colour only**
- **WCAG:** 1.4.1
- **Location:** key-review/key-today `.plan li.now` (border `action` plus an indigo day label)
- **Fix:** Add a text tag "Next" or "Today" (meta, ink) and a 2px `action` border. Keep `aria-current="true"` and include "next up" in the accessible name.

**M7. Selected chip: the mock drops the check glyph and uses a Domain tint**
- **WCAG:** 1.4.1, 1.4.11
- **Location:** mocks `.chip.sel{background:var(--joint)}` with no glyph, and unselected chips use `outline` (1.37). Spec: `selected` wash, `action` border, check glyph, bold.
- **Issue:** The selected and unselected borders (action vs outline-strong) differ by only **2.45:1** (2.14:1 in dark), and the fills by 1.18. So without the glyph, the state is effectively colour-only.
- **Fix:**
  - Make the glyph mandatory (ink on selected 12.99 / 10.86).
  - Set the selected border to 2px `action` and the unselected border to 1px `outline-strong`, with a padding adjustment so the label doesn't jump.
  - Fix the mocks and the "Mark: Losing attention" chip on Review.

**M8. No recovery from one-tap mistakes**
- **WCAG:** 3.3.4 (spirit), cognitive
- **Location:** "Not attempted" (one-tap save, at the top of Review, which discards the pre-filled Review); Marks (wrong Mark); "Not this one"
- **Fix:**
  - Each status line carries an **Undo** button: "That's okay — logged as not today. Undo", "Mark saved: Upset. Undo".
  - The Undo stays until the next action, with no time limit.
  - The 10-second Mark dedupe tells the user what happened: "Already marked" in the sheet, not a silent ignore.

**M9. Clinical jargon and form length on Review**
- **WCAG:** 3.3.2 Labels or Instructions (A), cognitive
- **Location:** Prompt Level chips ("Full physical / Partial physical / Model / Gestural / Verbal / Independent"); 7 or more fields against a 20-second target
- **Fix:**
  - Keep the therapist's terms, and add a one-line plain gloss under each option in `meta`, e.g. "Model — you showed how", "Gestural — you pointed or nodded".
  - Collapse the pre-filled defaults into a summary ("Reading · One-to-one · Model — Change") so a typical Review is just Save.
  - The pre-filled state must be announced ("pre-filled from last time").

**M10. Draft review: the disabled Confirm button is unexplained**
- **WCAG:** 3.3.1 Error Identification (A), 1.4.1
- **Location:** State Patterns › Uncertain extraction
- **Issue:** `ink-disabled` is 2.38:1, which is exempt, but users don't learn *why* the button is disabled.
- **Fix:**
  - Keep Confirm enabled. On press, move focus to the first unchecked field with "Please check this (2 left)".
  - The highlight uses a text tag plus an icon plus a 2px `parent-proposed` border (≥3:1), not a tint alone.

**M11. Goal detail progress charts have no accessibility spec**
- **WCAG:** 1.1.1, 1.4.1, 1.4.11
- **Location:** IA › Goal detail ("three separate measures")
- **Fix:**
  - Give each chart a text summary that uses the spec's honest-data voice.
  - Offer a "Show as table" toggle.
  - Distinguish series by label and marker shape, not hue.
  - Lines and markers must be ≥3:1 against the card. Use the `action` / `ink-soft` / `care-team` tokens, never Domain tints, which are about 1.2:1.

**M12. Stepper validation and labelling unspecified**
- **WCAG:** 3.3.1, 3.3.3, 1.3.1
- **Location:** Stepper ("X of Y" with direct entry)
- **Fix:**
  - Clamp values to ≥0 and Y ≥ X with inline text ("Can't be more than 5 tried"), linked with `aria-describedby`.
  - Disable "−" at 0 and say so ("0, minimum").
  - Value changes from the −/+ buttons are reflected in the input's value, not in a separate live region.

### Low

1. **L1. Restrict `ink-disabled` to disabled controls** (1.4.3). It is 2.38 on card, 2.23 on floor, 2.97 in dark. Restrict it by rule to disabled controls only, never placeholders, hints or "Reviewed" states.
2. **L2. Map Reduce Motion to the web setting** (2.3.3 good practice). Map it to `@media (prefers-reduced-motion: reduce)`. The status line and Mark pressed state change instantly, and sheets appear with no slide or fade.
3. **L3. Don't lock orientation** (1.3.4). Practice and Prep must work in landscape, for example with the phone propped up.
4. **L4. Coach sheet Close is out of thumb reach.** It sits top-right. Add a full-width "Back to practice" quiet button at the bottom of the sheet, in the one-handed zone.
5. **L5. Timer wording.** "Timer 3:42" can read as a countdown. Use "Time so far 3:42". It is never announced live (see H4).
6. **L6. Bypass blocks** (2.4.1). On laptop/tablet, add a "Skip to content" link before the left rail, plus `<nav>`/`<main>` landmarks (the mocks have `<main>` on the presentation board only).
7. **L7. Text spacing** (1.4.12). Avoid fixed heights on chips, the status line pill (40px min-height is fine) and the stepper value `line-height:48px`. Use min-height and padding so text with 1.5 line-height and 0.12em letter-spacing doesn't clip.
8. **L8. Small meta text.** 13px/400 `meta` for dates, badges and AI labels is legible but small for tired eyes at night. Consider a 14px minimum for badges and the AI label.
9. **L9. Stale mock notes.** The mock header notes and captions describe old states ("2px action outline, block shadow" Marks, "white block Mark with indigo outline", "outline decorative only"). Update them so reviewers and builders aren't misled.
10. **L10. "Not attempted / child not available" label length.** It is long for a quiet button. Shorten to "Not today" with the accessible name "Not attempted today".

---

## What's already good

- Every token text pairing passes AA in both themes, with healthy margins.
- `outline-strong` is set at ≥3:1 for interactive controls (the spec is right; the mocks drift).
- There are no time limits, and the Practice Session never times out. A draft Review survives Back.
- Gestures are never the only route (except masking, C1). Sheets have a visible Close and `Esc`.
- Touch targets are ≥48px, buttons 52px and Marks 72px. The primary action sits in the lower third.
- The banned list (streaks, confetti, countdowns, autoplay) removes most motion and anxiety risk.
- The voice guidelines are plain, warm and non-judgemental, which is strong for cognitive accessibility.
- Domain tints are always paired with a text label.

---

## Contrast table

All values were computed from the DESIGN.md hex tokens. Text needs 4.5:1, or 3:1 for large text (≥24px, or ≥18.66px bold). Non-text needs 3:1.

### Text pairings

| Foreground / background | Light | Dark | Result |
|---|---|---|---|
| ink / floor | 14.33 | 15.41 | Pass |
| ink / card | 15.32 | 13.44 | Pass |
| ink-soft / floor | 6.46 | 8.37 | Pass |
| ink-soft / card | 6.91 | 7.30 | Pass |
| ink / selected (Mark label, selected chip) | 12.99 | 10.86 | Pass |
| ink-soft / selected | 5.86 | 5.90 | Pass |
| action / selected | 7.75 | 6.34 | Pass |
| ink / joint-attention | 12.14 | 11.22 | Pass |
| ink-soft / joint-attention | 5.47 | 6.10 | Pass |
| ink / communication | 12.40 | 11.63 | Pass |
| ink-soft / communication | 5.59 | 6.32 | Pass |
| ink / motor-imitation | 12.49 | 11.39 | Pass |
| ink-soft / motor-imitation | 5.63 | 6.19 | Pass |
| ink / play | 11.91 | 12.49 | Pass |
| ink-soft / play | 5.37 | 6.79 | Pass |
| ink / regulation | 11.74 | 12.05 | Pass |
| ink-soft / regulation | **5.29** (lowest) | 6.55 | Pass |
| ink / sensory | 12.38 | 11.25 | Pass |
| ink-soft / sensory | 5.58 | 6.11 | Pass |
| action / joint, comm, motor, play, reg, sensory (hero back link, Domain chip) | 7.24 / 7.40 / 7.45 / 7.11 / 7.00 / 7.39 | 6.55 / 6.79 / 6.65 / 7.29 / 7.04 / 6.57 | Pass |
| action / card (secondary button, links) | 9.14 | 7.85 | Pass |
| action / floor | 8.55 | 9.00 | Pass |
| action-foreground / action (primary button) | 9.14 | 8.78 | Pass |
| block-foreground / block (Cue number) | 7.96 | 6.89 | Pass |
| care-team / care-team-soft (badge) | 5.88 | 6.42 | Pass |
| parent-proposed / parent-proposed-soft (badge) | **5.29** | 7.51 | Pass |
| danger / card | 6.56 | 6.08 | Pass |
| danger / floor | 6.13 | 6.97 | Pass |
| ink-soft / floor (AI label) | 6.46 | 8.37 | Pass |
| ink / tip surface #F4F2EE (hard-coded, no token) | 13.70 | *no token*; ink-dark on #E9ECF7 = **1.03** if hard-coded hex leaks | Fail risk (H2) |
| ink-dark / proposed tip-surface-dark #2A2D36 | — | 12.06 | Pass |
| ink-soft-dark / proposed tip-surface-dark #2A2D36 | — | 6.55 | Pass |
| ink-disabled / card | 2.38 | 2.59 | Exempt (disabled only, L1) |
| ink-disabled / floor | 2.23 | 2.97 | Exempt (disabled only, L1) |

### Non-text (1.4.11) and state distinction (1.4.1)

| Pairing | Light | Dark | Result |
|---|---|---|---|
| outline-strong / card (chip, stepper, input border per spec) | 3.73 | 3.67 | Pass |
| outline-strong / floor | 3.49 | 4.21 | Pass |
| outline-strong / selected | 3.16 | 2.97 | Borderline in dark: use 2px action for selected |
| outline / card (card edge; mock chips, stepper, note field) | **1.37** | **1.35** | Fail for controls (H5, M7); OK only for decorative cards |
| outline / floor | **1.28** | **1.55** | Weak for interactive cards (M5) |
| card / floor (fill) | 1.07 | 1.15 | No edge without an outline |
| selected / floor (flat Mark fill) | **1.10** | **1.42** | No boundary (H3) |
| selected / card (selected chip fill) | 1.18 | 1.24 | Not a state cue by itself |
| Domain tint / floor or card (hero, Cue tiles, plan square) | 1.15–1.30 | 1.11–1.37 | Decorative only; must not carry state or data |
| block / Domain tints (Cue number tile) | 6.10–6.49 | 5.15–5.73 | Pass |
| action / card (secondary button border, stepper ± glyphs) | 9.14 | 7.85 | Pass |
| focus-ring / floor | 8.55 | 9.00 | Pass |
| focus-ring / card | 9.14 | 7.85 | Pass |
| focus-ring / Domain tints | 7.00–7.45 | 6.55–7.29 | Pass |
| focus-ring / selected | 7.75 | 6.34 | Pass |
| focus-ring / action (ring touching the primary button) | 1.00 | 1.00 | Needs 2px offset (M1) |
| nav active (action) vs inactive (ink-soft) | **1.32** | **1.07** | Fail 1.4.1 (H1) |
| selected border (action) vs unselected (outline-strong) | 2.45 | 2.14 | Needs glyph + weight (M7) |
| sheet (card) / scrimmed floor (rgba(23,25,31,.45)) | 3.06 | **1.15–1.29** | Dark edge invisible (M4) |
| outline-strong-dark / scrimmed dark floor (proposed sheet border) | — | 4.6–4.75 | Pass (fix for M4) |
| proposed outline-interactive #8E94A4 / card, floor | 3.03 / 2.84 | — | Use outline-strong if ≥3 on floor is needed |
