---
name: LittleSteps
status: draft
created: 2026-11-05
updated: 2026-11-05
sources:
  - ../../prds/prd-little-steps-2026-11-05/prd.md
  - ../../prds/prd-little-steps-2026-11-05/addendum.md
---

# LittleSteps: Experience Spine

> Built from the final PRD. It uses the PRD glossary (§3) verbatim. FR and UJ IDs refer to the PRD. Visual specs live in `DESIGN.md`. Spines win on conflict with any mock.

## Foundation

- **Form factor:** multi-surface responsive web app (PWA) for phones, tablets, and laptops.
  - **Phone:** primary for Prep, Practice, Review, and Log a moment.
  - **Laptop:** convenient for import, Plan editing, and Summaries.
  - Every surface works on every device.
- **Browsers:** no browser is assumed. The app works without installing, and installing is offered where the browser supports it (PRD §6).
- **Stack:** React + Vite (addendum §A.6). No UI system is named. `[ASSUMPTION: architecture picks accessible headless primitives (e.g. Radix) for dialogs, sheets, and menus, styled with DESIGN.md tokens. This spine specifies behaviour only.]`
- **Theme:** follows the device's light or dark setting, with a manual override in Settings. `[ASSUMPTION]`
- **Core posture:** **Prep → Activity → Review.**
  - The app is busy before and after practice, and nearly invisible during it.
  - Caregivers should be able to start an Activity in 30 seconds or less and log a typical Review in about 20 seconds.

## Information Architecture

> Composition references: [Today](mockups/key-today.html), [Prep](mockups/key-prep.html), [Practice and Coach Tips](mockups/key-practice.html), [Review and Review saved](mockups/key-review.html). The spine wins on conflict.

Navigation is a bottom bar on phones and a left rail on tablets and laptops, with five destinations: **Today · Goals · Activities · Share · Family**. `[ASSUMPTION: names and grouping]`

| Surface | Reached from | Purpose | PRD |
|---|---|---|---|
| Onboarding | Invite link / first sign-in | Consent → Family → Child Profile → first Care Team Member → first Goal → install and reminders (optional) → invite co-caregiver (optional) | UJ-0, FR-1–4, FR-13 |
| **Today** (home) | App open, nav | The next Plan Activity (Today card), the **Log a moment** button, "This week" Plan strip, and a gentle nudge | FR-13, FR-14 |
| Plan (this week) | Today → "This week" | Accept or edit 3–5 Activities, set days and Contexts, and see weekly availability | FR-13 |
| Prep | Today card, Activity detail | The Prep card. Start the optional timer, or go straight to Log review | FR-11, FR-10 |
| Practice | Prep → Start | Marks (2×2), optional timer, and Done. Coach Tip sheet on Mark | FR-10, FR-12 |
| Review | Practice → Done, Prep → Log review | The quick Observation, pre-filled | FR-14 |
| Log a moment | Today button (sheet) | A spontaneous Observation linked to a Goal or an Inventory list | FR-14, FR-15 |
| **Goals** | Nav | Goals grouped by Care Team Member, then parent-proposed. Filter by Goal Period | FR-3, FR-4, FR-6 |
| Goal detail | Goals row | Description and original wording, Criterion, Strategies and Restrictions, lineage, and a progress view with three separate measures | FR-4, FR-6, FR-7, FR-16 |
| Add or import | Goals → "+" | Manual entry, or import (P2): upload, photo, or paste → **masking review** → draft review → confirm | FR-4, FR-5, FR-7 |
| New Goal Period | Goals → Care Team Member → "New period" | Lineage for each Goal: carried over, revised, new, retired | FR-6, UJ-2 |
| **Activities** | Nav | The library by Goal: favourites, hidden, and "Get new ideas" (AI, P2) | FR-8, FR-9 |
| Activity detail | Library, Plan | Purpose, steps, variations, Cues, Coach Tips, and what to observe. Add to Plan | FR-8 |
| **Share** | Nav | Summaries list, Summary builder and preview, and Appointment Feedback | FR-17, FR-18 |
| Summary builder | Share → "New summary" | Pick Care Team Member and Goal Period → draft → edit → confirm → export or share | FR-17, UJ-4 |
| Appointment Feedback | Share → Summary → "After the appointment" | Goal statuses, Review Status changes, and new Strategies and Restrictions | FR-18 |
| **Family** | Nav | Child Profile, Care Team Members, Caregivers (invite, remove, leave), Inventory lists, and Settings | FR-1–3, FR-15 |
| Settings | Family → Settings | Reminders, theme, Prompt Level list, Status Vocabularies, and privacy: export, audit log, delete Family | FR-13, §5 |

Rules:
- Modal stacks are at most one level deep. Sheets are used for quick actions (Log a moment, Coach Tips) and full screens for flows (Prep, Review, import).
- Every surface can be reached in two taps or fewer from Today, except Settings sub-pages.

## Voice and Tone

These rules cover microcopy. Brand posture lives in `DESIGN.md` under Brand & Style.

Principles:
- **Warm.** Write the way a friend who knows the subject would speak.
- **Short.** Use plain words and no jargon, unless the term is the therapist's own.
- **Honest about data.** Say what was recorded and how much.
- **Never judge the caregiver or the child.**

| Do | Don't |
|---|---|
| "Ready when you are." | "Time to practise!" / "You haven't practised today." |
| "That's okay — logged as not today." | "Session failed" / "Missed" |
| "4 observations so far — too few to show a trend." | "Insufficient data" / "No progress" |
| "AI-suggested · check with your therapist if unsure." | "Recommended treatment" |
| "Proposed by you · not yet discussed with the care team." | "Unverified goal" |
| "This will leave your family. Your summary will be shared outside LittleSteps." | "Export complete!" |
| "We'll keep your review on this device and sync when you're back online." | "Network error" |
| Use the child's nickname from the Child Profile ("Reading with Bean") `[ASSUMPTION]` | Use "your child" coldly, or praise/score the child ("Great job, 8/10!") |

Reminder copy invites practice and never counts what was missed, e.g. "A few minutes of play today? Storybook together is ready."

## Component Patterns

These are behavioural rules. Visual specs live in `DESIGN.md` under Components.

| Component | Use | Behavioural rules |
|---|---|---|
| Domain tint | Every Activity surface | An Activity takes its Goal Domain's tint on the Today band, Prep hero, Cue tiles, and Plan-row square. When an Activity serves several Goals, it uses the first linked Goal's Domain. The Domain's text label always appears with the tint. |
| Today card | Today | Shows one Activity, the next one in the Plan. "Not this one" swaps it for the next Plan item. Nothing piles up. |
| Prep card | Prep | Readable in under a minute. Shows 2–3 Cues and the Care Team Strategy. The "If it gets hard" section starts collapsed. It opens without starting a Practice Session and can be reopened from Practice. |
| Practice screen | Practice | Has four Marks, an optional timer, a quiet "Prep card" link to reopen the Cues, and Done. The screen may sleep. Reopening the app returns to Practice while a Practice Session is open. Guided mode (P2) adds one step per screen and keeps the screen awake. |
| Mark button | Practice | One tap saves a Mark with a time and opens the Coach Tip sheet. Tapping the same Mark again within 10 seconds does not duplicate it. `[ASSUMPTION]` |
| Coach Tip sheet | After a Mark | Has a visible Close button, so swiping isn't the only way to dismiss it. Shows up to 3 tips. Curated tips appear instantly. Any AI tips appear below them when ready, labelled. Each tip has a "Helpful" toggle. Dismissing returns to Practice. |
| Timer | Practice | Optional. Starts on tap and is shown without emphasis. There is no target and no countdown. Its value pre-fills attention duration in the Review. |
| Review form | Review | Titled "How did it go?". Fields follow the Goal's Criterion. Marks show as selected chips, elapsed time shows as `meta` text, and attention duration is an editable stepper, all pre-filled. The fields are: Prompt Level (default list from PRD §3: full physical → partial physical → model → gestural → verbal → independent); who modelled it ("You · Another caregiver · Other adult · Sibling") `[ASSUMPTION]`; Context labelled "Where", as two single-select rows: routine (Meal · Bath · Reading · Play · Outdoors · Other…) and with whom (One-to-one · With a sibling · In a group); engagement ("A bit hard · OK · Good") `[ASSUMPTION]`; "Which cue or tip helped?" (multi-select); and an optional note. On phones the Review scrolls, with Save pinned at the bottom. Last-used Prompt Level and Context are defaults. The Save button is always visible. "Not attempted" saves in one tap. |
| Stepper | Review, Log a moment | Shows "X of Y" as two steppers, each with −/+ buttons and direct number entry. |
| Choice chips | Review, Plan, Goals | Single-select for Prompt Level and engagement. Single-select for Context, plus "Other…". |
| Log a moment | Today | A bottom sheet that asks: what did you see, for which Goal or list, and where. Saves in 3 taps plus optional text. |
| Source badge | Goals, Goal detail, Prep, Summary | Always shows a text label. Parent-proposed Goals also show their Review Status. |
| AI label | Suggestions, tips, Summary text | Appears on every AI-generated item. Never hidden. |
| Masking review | Import | Shows the page with detected identifiers covered. Tap a block to uncover it, or drag to cover more. Nothing goes to AI until the caregiver taps "Looks right". |
| Draft review | Import | Shows each extracted item, with uncertain fields highlighted. The Care Team Member's original wording sits next to any simplification. Each item has Confirm, Edit, and Discard. |
| Confirm-to-share | Summary | A sheet saying the Summary is leaving the Family, with "Share" and "Not now". |
| Destructive confirm | Remove Caregiver, delete Family | Typed confirmation for Family deletion, plus the 7-day undo explained in plain words. |
| Plan strip | Today | Shows the week's Plan items as rows. Tapping a row opens its Prep card. "See plan" opens Plan. Each row has a Review status in text only. |
| Status line | After Save or Share | Confirms the action in text ("Review saved."), announces it to screen readers, and fades after about 4 seconds. |
| Nudge | Today | A single line on Plan days. It disappears for the day once an Observation is logged. There is no badge on the app icon. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| First run, no Goals | Today | "Let's add your first goal." Links to Goals → Add. The Today card shows a starter Activity for the chosen Domain. |
| No Plan this week | Today | "Pick a few activities for this week?" Offers the suggested Plan, which is accepted with one tap. |
| Plan done early | Today | "That's this week's plan. Anything extra is a bonus." Offers a favourite. No celebration. |
| Not attempted | Review | Saved as a neutral entry. The Today card moves to the next item. Nothing carries over. |
| Offline | Prep, Practice, Review, Log a moment | Prep cards and starter Coach Tips for the current Plan work offline. Observations queue locally. A small line says: "Saved on this device — will sync." |
| Sync waiting (server asleep in local mode) | Any | The same offline treatment. No error dialogs. |
| AI slow or unavailable | Coach Tips, suggestions, import | Curated content shows first. AI areas say "Ideas are taking a moment" and fall back silently. Import keeps the manual-entry route open. |
| Suggestion blocked by a Restriction | Suggestions, tips | The suggestion is not shown. No message, so the Restriction is never undermined. Logged for evaluation. |
| Uncertain extraction | Draft review | The field is highlighted, reading "Please check this." The draft can't be confirmed until each such field is touched. `[ASSUMPTION]` |
| Limited data | Goal detail, Summary | Fewer than 5 Observations: the points are shown and "too few to show a trend" or "limited data" appears. |
| Narrative Goal | Goal detail | No charts. Shows Observations, notes, and Contexts instead. |
| Retired Goal | Goals | Collapsed under "Earlier goals", read-only, with its history intact. |
| Deletion pending | Family → Settings | A banner reads "Family data will be deleted on <date>," with an Undo button, for 7 days. |
| Removed Caregiver | The removed device | "You're no longer part of this family." Signs them out. |

## Interaction Primitives

- **Tap first.** Every action is a visible tap target of at least 48px. Marks are 72px.
- **Sheets:** swipe down or tap outside to dismiss.
- **Gestures are never the only way to act.** No long-press, no swipe-only actions.
- **Back:** browser and OS Back always works and never discards an unsaved Review. A draft Review is kept and reappears.
- **Banned:**
  - streaks, scores, and badges
  - confetti or celebration animations
  - visible countdowns or target timers
  - unread counters on the app icon
  - autoplay media
  - nags after dismissal

## Accessibility Floor

These are behavioural rules. Visual contrast lives in `DESIGN.md`.

- **Standard:** WCAG 2.1 AA (PRD §6).
- **Screen readers** (VoiceOver, TalkBack, NVDA):
  - Every control has a name, role, and state.
  - Marks announce "Mark saved: Losing attention."
  - The Coach Tip sheet moves focus to its first tip.
  - A saved Review announces "Review saved."
- **Text scaling up to 200%:** content reflows and no control truncates. The 2×2 Mark grid becomes a single column.
- **Reduce Motion:** sheets appear without sliding, and no animated transitions play.
- **One-handed reach:** the primary action and the Marks sit in the lower half on phones.
- **Never colour alone:** Source, AI, status, and Marks always carry text.
- **Keyboard:** full keyboard operation on laptops. Visible focus ring (`{colors.focus-ring}`). `Esc` closes the topmost sheet or dialog. Tab order follows reading order.
- **Time limits:** none. The Practice Session never times out, and the 7-day undo is the only time-bound element.
- **Dictation:** every text field accepts the device keyboard's dictation. The app records no audio itself.

## Responsive & Platform

| Width | Behaviour |
|---|---|
| < 600px (phone) | Bottom nav and a single column. Sheets are full-width. The Practice screen fills the viewport. |
| 600–1023px (tablet) | Left rail, with content centred at `{spacing.content-max}`. Sheets are centred, 560px max. |
| ≥ 1024px (laptop) | Left rail. Import and the Summary builder use two columns (source on the left, draft on the right). Summary preview has a print-like page. |

Platform notes:
- **Install:** offered after the first saved Review, never on first open. Uses each browser's own install pattern, or shows short instructions where the browser has no prompt. `[ASSUMPTION]`
- **Push reminders:** offered during onboarding once the app is installed. The in-app nudge is the default (FR-13).
- **iOS (every browser uses WebKit):** no share-target import, so import offers Upload, Photo, and Paste. Push works only after installing to the home screen.
- **Share:** uses the device share sheet where available. Falls back to a PDF download.

## Notifications

- **Default:** an in-app nudge on Today on Plan days, at the time picked during onboarding (early evening by default). `[ASSUMPTION]`
- **Opt-in push:** at most one per Plan day, at the chosen time. Tapping it opens Today. Never sent on non-Plan days, and never more than once a day.
- **Never:**
  - "you missed" messages
  - streak or score references
  - notifications about the other Caregiver's activity `[ASSUMPTION]`

## Privacy & Consent Surfaces

- **Consent** comes first in onboarding and at invite acceptance. It uses plain-language cards covering what is stored, how AI processes data (masked, local or hosted), and how sharing works. One "I agree" button at the end. No pre-ticked boxes.
- **Masking review** is a mandatory step in every import (FR-5).
- **Confirm before** every Summary export or share.
- **Settings → Privacy** contains:
  - export all data
  - the audit log, a readable list of sign-ins, membership changes, exports, shares, and deletions
  - Delete Family, with typed confirmation and the 7-day undo
  - support access grants, which are time-limited and revocable

## Inspiration & Anti-patterns

The product owner gave no references. These anti-patterns come from the PRD's guardrails.
- **Rejected: streaks and habit gamification.** These turn a busy family's calendar into a guilt engine. Missed days never accumulate.
- **Rejected: an on-screen coach during play.** It makes the interaction clinical and pulls the caregiver's eyes away from the child. Guidance happens before and after.
- **Rejected: traffic-light progress and percentages.** These imply clinical judgement the app must not make (PRD §5).
- **Rejected: an AI chat interface.** LittleSteps is not a chatbot giving therapy advice (PRD §1.2). AI appears only as labelled suggestions inside structured surfaces.

## Key Flows

The protagonists are illustrative composites, per the privacy rule. Flows mirror the PRD's UJ names.

### Flow 0: Setup to first Practice Session (a working parent, invited to the pilot, on a phone) (UJ-0)
1. Opens the invite link and creates an account.
2. Reads three consent cards and taps "I agree".
3. Creates the Family. Enters the child's nickname, interests (songs, cars), and materials at home.
4. Adds the SLP as a Care Team Member, then adds one Goal by hand, or pastes a message from the early-intervention teacher.
5. Is offered "Add to home screen and get a gentle reminder?" and skips it for now.
6. **Climax:** Today shows "Reading with [nickname]," with a Prep button. The parent knows exactly what to do tonight.

Failure: no goal sheet yet. The parent adds a parent-proposed Goal, labelled "Proposed by you," and continues.

### Flow 1: Prep, play, review (a working parent, evening, with a toddler) (UJ-1)
1. Taps the Today card to open Prep. Reads the objective, the Care Team Strategy, and three Cues in about 40 seconds.
2. Taps "Start", which starts the optional timer, and puts the phone face-down.
3. Reads with the child. The child flips pages, and the parent uses a Cue.
4. Picks up the phone and taps **Losing attention**. Glances at the tips, tries a familiar song, and the phone goes back down.
5. Taps **Done**. The Review is pre-filled with 6 minutes elapsed, 4 minutes of attention, and the Mark.
6. Picks "model" as the Prompt Level and "OK" for engagement, marks the song tip as helpful, and taps Save.
7. **Climax:** "Review saved." Today now shows tomorrow's Activity. Practice took a few minutes and logging took 20 seconds, and the parent spent the time with the child, not the screen.

Failure: the child is tired. The parent taps "Not attempted" on the Review and sees "That's okay — logged as not today."

### Flow 2: New Goal Period from a paper sheet (a parent, on a phone) (UJ-2)
1. Goals → SLP → "New period" → Photo.
2. On the masking review, the child's name and the clinic letterhead are covered. The parent covers one more line and taps "Looks right."
3. The draft review lists 6 Goals. Two fields are highlighted as uncertain, and the parent fixes them.
4. Marks each Goal: 3 carried over, 1 revised (5 → 10 minutes), 2 new. Retires one Goal.
5. **Climax:** the Goals tab shows the new period. Tapping the revised Goal shows its history, back to the previous quarter.

### Flow 3: The co-caregiver's weekend session (UJ-3)
1. Accepts the invite on a tablet and gives their own consent.
2. Today shows the early-intervention teacher's prescribed movement Activity, labelled with its Source.
3. Runs it, then completes the Review.
4. **Climax:** the first caregiver opens the Goal detail and sees the Observation attributed to the co-caregiver.

### Flow 4: Before and after the appointment (a parent, on a laptop) (UJ-4)
1. Share → New summary → SLP → current Goal Period.
2. The preview shows each Goal's three measures, Observation counts, "limited data" labels, Contexts, and new words. Parent-proposed Goals are listed under "For discussion".
3. Edits a question, taps Share, confirms "This will leave your family," and downloads the PDF.
4. After the appointment: Share → this Summary → "After the appointment." Records "Achieved in some Contexts" for one Goal and marks a parent-proposed Goal as discussed. Adds a Restriction: "no hand-over-hand."
5. **Climax:** next week's Plan and Coach Tips already respect the new Restriction. The loop is closed.
