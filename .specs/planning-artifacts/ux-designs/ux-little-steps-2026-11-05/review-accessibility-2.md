# Accessibility Review 2: LittleSteps UX spines (final)

- **Reviewed:** DESIGN.md, EXPERIENCE.md (status: final), against the prior review-accessibility.md
- **Against:** WCAG 2.1 AA (PRD §6), any browser, phones/tablets/laptops, tired one-handed caregivers
- **Not judged:** mockups (being redrawn; spines are the contract)
- **Date:** 2026-11-05
- **Method:** every ratio recomputed from the hex tokens with the WCAG 2.1 relative-luminance formula. Scrims are alpha-composited over the surface beneath.

## Verdict

**Ready to build P1, with conditions. No critical issues remain.**

The fixes landed well. Every prior High is resolved. All 12 prior Mediums are resolved, and 8 of the 10 Lows. The DESIGN.md contrast claims for the new tokens check out to two decimals. The new semantics table, reflow table, focus geometry and Undo model are solid.

What remains:
- **One High, on the masking review (P2).** Screen-reader and keyboard users can check only what the detector found. This must be closed before import (FR-5) ships, but it does not block the P1 core loop.
- **Five new Mediums,** all introduced or exposed by the fixes:
  - the dark focus ring on the document image
  - `-apple-system-body` shrinking text on macOS Safari
  - status messages across route changes
  - interactive points inside `role="img"` charts
  - focus loss on controls that become disabled
- **Seven new Lows** plus two prior Lows still open.

| Severity | Prior, still open or partial | New |
|---|---|---|
| Critical | 0 (C1 downgraded to partial, residual tracked as N1) | 0 |
| High | 0 | 1 |
| Medium | 0 | 5 |
| Low | 2 (L8 open, L10 partial) | 7 |

---

## Prior findings status

| ID | Finding | Status | Evidence in spines / residual |
|---|---|---|---|
| C1 | Masking review drag-dependent, visual-only | **Partially resolved** | EXPERIENCE › Masking review now has a checkbox list, single-pointer Cover more, a keyboard box, a count announcement and a "Send 1 page with 3 items covered" button. Residual: the list covers only *detected* items, so a non-visual user can't find or cover what the detector missed. Custom boxes aren't listed. See N1. |
| H1 | Nav active state by colour only | Resolved | `bottom-nav` has a 32×4 `action` bar (9.14 / 7.85), weight 800 vs 600, `aria-current="page"`, and the same on the rail. |
| H2 | Dark parity on Practice; tip surface untokenised | Resolved | `tip-surface` / `tip-surface-dark` tokens; Marks on `card`. All pairs pass (table below). |
| H3 | Flat Marks without edge; `selected` reused | Resolved | `mark-button`: card + 1px `outline-strong` (3.49 floor / 4.21 dark), `pressed` token. `selected` is reserved for chosen states (Do/Don't). "Already marked" on dedupe. |
| H4 | No semantic contract | Resolved | Accessibility Floor semantics table. Small gaps logged as N8. |
| H5 | Field/stepper edges < 3:1; no text-field token | Resolved | `text-field` and `stepper` (border and dividers) use `outline-strong` 3.73 / 3.67. Visible label; placeholder is never the label. |
| H6 | iOS Dynamic Type not honoured | Resolved, with a new side effect | `100%` root plus `@supports (font:-apple-system-body)`. This also matches macOS Safari (see N3). |
| H7 | Reflow at 320px / 200% | Resolved | DESIGN › Reflow table: footers stack, the Review header splits, the inline stepper wraps, short viewports unpin, `scroll-padding-bottom`. |
| M1 | Focus geometry | Resolved | `focus-indicator`: 2px outline, 2px offset, `:focus-visible`, real outline for forced-colors. New exception on the document image: N2. |
| M2 | Focus management | Resolved | Route title and `<h1>` focus, Done → "How did it go?", sheet heading focus, trap and return, Back restores focus. |
| M3 | Status messages missed or colliding | Resolved | No timed fade; sheet `aria-describedby`; AI-tip space reserved and announced politely. Cross-route gap: N4. |
| M4 | Dark sheet edge invisible | Resolved | `border-dark` `outline-strong-dark`: 4.74 on the scrimmed floor, 4.60 on a scrimmed card. Light-mode edge over cards: N7. |
| M5 | Interactive cards and rows have weak edges | Resolved | `plan-row` and `disclosure-row` use `outline-strong`; Plan rows have a trailing chevron. |
| M6 | Plan-row "now" by colour only | Resolved | "Next" text tag plus `aria-current="true"` plus the name includes "next up". |
| M7 | Selected chip state effectively colour-only | Resolved | Check glyph is mandatory, plus a bold label. The 1px `action` border (not the 2px proposed) is acceptable because the glyph carries the state. |
| M8 | No recovery from one-tap mistakes | Resolved | Undo on Not attempted, Mark and swap, with no time limit. |
| M9 | Jargon and form length | Resolved | Prompt Level glosses, collapsed pre-fill row announced "pre-filled from last time". |
| M10 | Disabled Confirm unexplained | Resolved | Confirm stays enabled; focus moves to the first unchecked field; `check-tag` text, glyph and `attention` edge (5.93). |
| M11 | Charts have no a11y spec | Resolved | Text summary, "Show as table", label/marker-shape series, `action` series. New conflict with tappable points: N5. |
| M12 | Stepper validation | Resolved | Clamp, Succeeded ≤ Tried text, `aria-describedby`. The "−" disables at 0, which causes N6. |
| L1 | `ink-disabled` misuse | Resolved | Restricted to disabled controls. |
| L2 | Reduce Motion mapping | Resolved | `prefers-reduced-motion: reduce`. |
| L3 | Orientation | Resolved | Never locked. |
| L4 | Coach sheet Close out of reach | Resolved | Full-width "Back to practice" at the bottom. |
| L5 | Timer wording | Resolved | "Time so far 3:42", not live. |
| L6 | Bypass blocks | Resolved | Skip link plus `<nav>` / `<main>`. |
| L7 | Text spacing | Resolved | Reflow table: min-height and padding, no fixed line-height. |
| L8 | 13px meta for badges and AI label | **Open** | `meta` and `section-label` are still 0.8125rem. The meta role has grown: it now also carries Prompt Level glosses, the "Mark saved · Undo" line and the "Covered" label. |
| L9 | Stale mock notes | Resolved (by policy) | Both spines declare mock header comments historical and spines authoritative. |
| L10 | "Not attempted / child not available" length | **Partially resolved** | Moved to its own full-width row (fixes reflow). The label is still long. |

---

## New findings

### High

**N1. The masking review can't be verified non-visually beyond what the detector found** (residual of C1)
- **WCAG:** 1.1.1 Non-text Content (A), 2.1.1 Keyboard (A), 1.3.1 Info and Relationships (A)
- **Location:** EXPERIENCE › Import, sharing and planning › Masking review; Accessibility Floor › Masking list; DESIGN › Components › Masking review
- **Issue:**
  - The text list contains "every *detected* item". A blind or low-vision Caregiver can confirm those covers, but can't learn what *else* on the page is identifying: a sibling's name, a phone number in a footer, a handwritten note. So they can't cover it.
  - The keyboard box (arrows, Shift+arrows, Enter) is positioned blind, with no announced position or underlying text.
  - Boxes added through Cover more are not said to appear in the list, so they can't be reviewed or removed by keyboard or screen reader.
  - This is the privacy gate before AI (FR-5), so a gap here means identifiers can be sent.
- **Fix:**
  - List **every OCR'd line of the page**, not only detections, as checkbox rows in reading order. Detected identifiers come pre-checked and are grouped first under "We covered these". The rest go under "Everything else on the page". Checking a row covers that line on the image.
  - Every manual cover becomes a list row ("Your cover 1: page 1, covers 'Tel 555-…'", using the OCR text under the box) with its own checkbox.
  - The keyboard box announces the OCR text it currently overlaps after each move ("Covers: Dr. A. Smith, line 3").
  - Give "Cover more" `aria-pressed`, and state that in cover mode a single tap or Enter on a line covers it (N8).
  - If OCR text can't be extracted (illegible photo), say so in text and offer Paste or manual entry. Don't offer a visual-only review.

### Medium

**N2. The dark-mode focus ring disappears on the document image**
- **WCAG:** 2.4.7 Focus Visible (AA), 1.4.11 Non-text Contrast (AA)
- **Location:** DESIGN › `focus-indicator` (`focus-ring-dark` #A9B8EC); `mask-cover` (same in both modes "because it sits on the document image")
- **Issue:**
  - The page image stays a light document in dark mode. With the 2px offset, the ring sits on paper. `focus-ring-dark` on white paper is **1.95:1**, and on grey paper (#E0E0E0) **1.48:1**.
  - In light mode the ring is 9.14 on paper but **1.68:1** where it touches a `mask-cover`. Adjacent covers make that common.
  - The same applies to the keyboard-placed box and to a focused detected line.
- **Fix:** On the image layer only, use a theme-independent two-tone indicator: a 2px `mask-cover` (#23252B) ring plus a 2px #FFFFFF outer ring. On paper the dark ring is 15.32:1; on a cover or dark photo background the white ring is 15.32:1. Add a `focus-indicator-image` component token. A covered block that has focus also shows "Covered (focused)" in its label, not just the ring.

**N3. `-apple-system-body` also matches macOS Safari, where it resolves to about 13px**
- **WCAG:** 1.4.4 Resize Text (AA, practical legibility); PRD §6 "support for system text sizing"
- **Location:** DESIGN › Typography › Text sizing; EXPERIENCE › Responsive & Platform (iOS note)
- **Issue:**
  - `@supports (font: -apple-system-body)` is true in desktop Safari too, where the body text style is about 13px, not 16px. Every rem token would then shrink by about 19%: `meta` 13px becomes about 10.6px and `body` 17px becomes about 13.8px. Laptop Safari is a named surface (import, Summaries).
  - On iOS the default is 17px, not 16px. The "Pixel sizes above assume a 16px default" table is about 6% off there. This is harmless, but builders may "correct" it in px.
- **Fix:**
  - Gate the rule to touch WebKit: `@supports (font: -apple-system-body) and (-webkit-touch-callout: none) { html { font: -apple-system-body; } }`. `-webkit-touch-callout` is iOS/iPadOS-only.
  - Note that iOS's default base is 17px.
  - Add "macOS Safari default zoom: body renders at 17px" to the test list. Verify on device; if gating fails on iPadOS desktop-class Safari, fall back to a JS check.

**N4. Status messages that cross a route change can be lost**
- **WCAG:** 4.1.3 Status Messages (AA)
- **Location:** EXPERIENCE › Status line ("Stays until the next action or navigation"); Accessibility Floor ("Persistent `role="status"` container present (empty) at page load"; route change moves focus to `<h1>`); Flow 1 step 7 (Save → "Review saved." on Today)
- **Issue:**
  - Review Save, Not attempted and Feedback Save all navigate. If each route renders its own status container, it is new at that moment and many screen readers won't announce the injected text.
  - The `<h1>` focus move also speaks over it.
  - The rule "stays until navigation" would also clear the message on the very navigation that the Save caused.
- **Fix:**
  - Use **one** `role="status"` region in the app shell, outside routed content, present from first load.
  - Order of events on an action that navigates: route → `document.title` → focus `<h1>` → inject the status text on the next frame.
  - The visible status line persists through the navigation its own action caused, and clears on the *next* user action or navigation.
  - The Undo inside it is reachable as the next Tab stop after the `<h1>`.

**N5. Charts are `role="img"` but their points are tappable**
- **WCAG:** 4.1.2 Name, Role, Value (A), 2.1.1 Keyboard (A)
- **Location:** Accessibility Floor › Charts (`role="img"`); Progress view › Attribution ("tapping a point opens that Observation")
- **Issue:** Children of `role="img"` are presentational. Interactive points inside are hidden from assistive technology, and if they are focusable they become nameless focus stops. Mouse and touch users get a route that keyboard and screen-reader users don't.
- **Fix:**
  - Keep the chart graphic `role="img"` and non-focusable.
  - Make the **table view** the equivalent route: each row's date is a link to that Observation.
  - For pointer users, points may stay tappable, but mark them `aria-hidden`, with `tabindex="-1"` on each point.
  - State in the spine: "Show as table" is how keyboard and screen-reader users open an Observation from the Progress view.

**N6. Controls that become disabled drop keyboard focus, and disabled-until-valid buttons are hidden from screen readers**
- **WCAG:** 2.4.3 Focus Order (A), 3.3.2 Labels or Instructions (A)
- **Location:** EXPERIENCE › Stepper ("'−' disables at 0"); DESIGN › Destructive confirm ("`button-danger`, disabled until the text matches")
- **Issue:**
  - A keyboard user pressing "−" down to 0 has focus on a button that becomes `disabled`. Focus falls to `<body>`, and they lose their place mid-Review.
  - A natively disabled Delete button is skipped by Tab and often by screen-reader browse lists. The typed-confirmation requirement isn't tied to it programmatically.
  - This is inconsistent with the M10 pattern (Confirm stays enabled).
- **Fix:**
  - Use `aria-disabled="true"` (still focusable, visually `ink-disabled`). Pressing it does nothing and the field reads "0, minimum".
  - Destructive confirm: the Delete button stays focusable with `aria-disabled` until the text matches. Its `aria-describedby` points to the visible instruction ("Type DELETE to confirm"). Pressing early moves focus to the text field with that instruction.

### Low

**N7. The light-mode sheet edge over card surfaces is 2.90:1**
- **WCAG:** 1.4.11 (practical)
- **Location:** DESIGN › Colors › Scrim ("Card on the scrimmed floor is 3.06:1"), `coach-tip-sheet`, `sheet`
- **Issue:** The 3.06 figure holds only over the floor. Over a scrimmed **card** (the Mark buttons the Coach Tip sheet rises over, the Today card under Log a moment), white vs scrimmed white is **2.90:1**, and light sheets have no border.
- **Fix:** Raise `scrim` to 50% (`#17191F80`): 3.36 over card, 3.54 over floor, 3.81 over Selected. Or apply the `outline-strong` top edge in both modes.

**N8. Gaps in the semantics table**
- **WCAG:** 4.1.2, 2.4.6
- **Location:** Accessibility Floor table
- **Missing rows:**
  - Removable Mark chips on Review: a `<button>` "Remove Losing attention".
  - The collapsed pre-fill row: a `<button aria-expanded>` named "Change pre-filled answers: Model, Reading, One-to-one".
  - Cover more: `aria-pressed`.
  - The banner dismiss button: named "Dismiss notice: <first words>".
  - The Today card: Flow 1 says "Taps the Today card to open Prep", but the table makes Prep the only primary button. Either the card is not a click target, or it uses a stretched link with "Not this one" layered above it. Never nest interactive elements.

**N9. The Coach Tip sheet's description includes the Undo button**
- **WCAG:** 1.3.1, 2.4.6
- **Location:** Mark button semantics (`aria-describedby` = the "Mark saved: … · Undo" line)
- **Fix:** Point `aria-describedby` at a text span containing "Mark saved: Losing attention" only. Undo is a separate button, first in the tab order after the heading.

**N10. Favourite and Hide pressed states have no visual spec; "pressed" is overloaded**
- **WCAG:** 1.4.1
- **Location:** EXPERIENCE › Activity row (`aria-pressed`); DESIGN `helpful-toggle` note ("pressed = selected styling")
- **Fix:**
  - Favourite is a filled heart plus the visible text "Favourite ✓" when on, and an outline heart when off. Hide uses a text label, not icon-only.
  - Reword the Helpful note to "`aria-pressed="true"` uses the `selected` styling and check glyph; the `pressed` token is only the momentary touch fill". This keeps builders from mapping `aria-pressed` to the `pressed` token (1.31:1 vs card, which would be a colour-only state).

**N11. Attention and parent-proposed are nearly the same colour (1.05:1)**
- **WCAG:** 1.4.1 (informational; passes because both always carry text)
- **Location:** DESIGN › Colors (`attention` #8A5A00 vs `parent-proposed` #7A5C1E)
- **Issue:** In Draft review, a honey "Proposed by you" badge next to an ochre "Please check this" tag reads as related.
- **Fix:** Keep the glyph mandatory on `check-tag` (already specified). Optionally place the tag inside the field, not beside the source badge.

**N12. Masking checkbox wording and accidental uncover**
- **WCAG:** 2.4.6, 3.3.4 (spirit)
- **Location:** Masking review ("Covered: clinic letterhead, line 1"; "Tap a cover … to uncover")
- **Issue:** When a row is unchecked, its label still says "Covered:". A tremor tap on a cover in the image silently uncovers an identifier.
- **Fix:**
  - The row label is just the item; the checkbox state means covered. Legend: "Cover before sending".
  - Uncovering from the image announces "Uncovered: … · Undo" in the status region.

**N13. Large-text Practice and sheet overflow aren't specified**
- **WCAG:** 1.4.10, 1.4.4
- **Location:** Reflow table (the Mark grid goes to one column above 130%); Practice "fills the viewport"; sheets
- **Fix:**
  - The Practice screen scrolls rather than clipping when one-column Marks plus Done exceed the viewport. Done stays reachable.
  - Sheets have `max-height: 100dvh − 24px` and scroll internally, with Close and "Back to practice" always reachable.

### Prior Lows still open

- **L8 (open):** raise `meta` to 0.875rem for Prompt Level glosses, badges, the AI label, the "Mark saved" line and "Covered". Keep 13px only for dates and axis labels.
- **L10 (partial):** shorten the label to "Not today", with the accessible name "Not attempted today: child not available".

---

## Contrast table: new and changed tokens

All values were recomputed from the DESIGN.md hex tokens. Text needs ≥4.5 (large text ≥3); non-text needs ≥3.

### Text

| Pairing | Light | Dark | Result |
|---|---|---|---|
| ink / pressed | 11.71 | 9.75 | Pass (matches spec) |
| ink-soft / pressed | 5.28 | 5.30 | Pass |
| action / pressed | 6.99 | 5.69 | Pass |
| ink / tip-surface | 13.70 | 12.06 | Pass |
| ink-soft / tip-surface | 6.18 | 6.55 | Pass |
| action / tip-surface ("Use this" secondary button on a tip block) | 8.17 | 7.04 | Pass |
| attention / attention-soft | **5.25** (new lowest) | 7.05 | Pass |
| ink / attention-soft (`check-tag` text) | 13.57 | 11.34 | Pass |
| ink-soft / attention-soft | 6.12 | 6.16 | Pass |
| attention / card | 5.93 | 8.35 | Pass |
| attention / floor | 5.55 | — | Pass |
| mask-cover-foreground / mask-cover ("Covered") | 15.32 | 15.32 | Pass |
| ink / domain-other | 12.54 | 12.21 | Pass |
| ink-soft / domain-other | 5.66 | 6.64 | Pass |
| action / domain-other | 7.48 | 7.13 | Pass |
| block / domain-other (non-text, Cue number tile) | 6.52 | 5.60 | Pass |
| danger / card · danger-foreground / danger | 6.56 · 6.56 | 6.08 · 6.97 | Pass |
| care-team / care-team-soft | 5.88 | 6.42 | Pass |
| parent-proposed / parent-proposed-soft | 5.29 | 7.51 | Pass |
| action-foreground / action | 9.14 | 8.78 | Pass |
| ink / selected | 12.99 | 10.86 | Pass |
| ink-disabled / card | 2.38 | 2.59 | Exempt (disabled only) |

### Non-text, focus and state

| Pairing | Light | Dark | Result |
|---|---|---|---|
| outline-strong / card · floor | 3.73 · 3.49 | 3.67 · 4.21 | Pass |
| outline-strong / attention-soft | 3.30 | — | Pass |
| outline-strong-dark / tip-surface-dark (Helpful toggle edge on a tip block) | — | 3.30 | Pass |
| outline-strong / pressed (Mark edge while pressed, against own fill) | 2.85 | 2.66 | OK: the boundary against the floor stays 3.49 / 4.21, and the state is transient |
| pressed / card (fill only) | 1.31 | 1.38 | Not a state cue; must never carry `aria-pressed` (N10) |
| tip-surface / card | 1.12 | 1.11 | Decorative surface; OK, since tip text and the toggle carry meaning |
| attention border / card (uncertain field) | 5.93 | 8.35 | Pass |
| attention vs parent-proposed | 1.05 | — | Indistinguishable hues; text carries meaning (N11) |
| mask-cover / white paper · grey paper (#E0E0E0) | 15.32 · 11.60 | same | Pass |
| focus-ring / domain tints incl. domain-other | 7.00–7.48 | 6.55–7.29 | Pass |
| focus-ring / pressed | 6.99 | 5.69 | Pass |
| focus-ring / selected | 7.75 | 6.34 | Pass |
| focus-ring / tip-surface | 8.17 | 7.04 | Pass |
| focus-ring / attention-soft | 8.09 | 6.62 | Pass |
| focus-ring / white paper (document image) | 9.14 | **1.95** | **Fail in dark (N2)** |
| focus-ring / grey paper | — | **1.48** | **Fail (N2)** |
| focus-ring / mask-cover | **1.68** | 7.84 | **Fail in light where the ring touches a cover (N2)** |
| proposed two-tone ring (#23252B + #FFFFFF) on paper / cover | 15.32 / 15.32 | same | Pass (N2 fix) |
| card / scrimmed floor (`scrim` #17191F 45%) | 3.06 | 1.29 | Light pass; dark needs the border |
| card / scrimmed **card** | **2.90** | 1.25 | Light just under 3:1 (N7) |
| outline-strong-dark / scrimmed floor · card (`scrim-dark` #000 60%) | — | 4.74 · 4.60 | Pass (M4 fix verified) |
| card / scrimmed card at a proposed 50% scrim | 3.36 | — | Pass (N7 fix) |
| nav bar (action) / card | 9.14 | 7.85 | Pass; the bar carries the state (H1) |
| selected border (action) vs unselected (outline-strong) | 2.45 | 2.14 | OK, because the glyph and bold label carry the state (M7) |
