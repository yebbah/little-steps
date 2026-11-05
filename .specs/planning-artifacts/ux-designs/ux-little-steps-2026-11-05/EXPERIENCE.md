---
name: LittleSteps
status: final
created: 2026-11-05
updated: 2026-11-05
sources:
  - ../../prds/prd-little-steps-2026-11-05/prd.md
  - ../../prds/prd-little-steps-2026-11-05/addendum.md
---

# LittleSteps: Experience Spine

> Built from the final PRD. It uses the PRD glossary (§3) verbatim. FR and UJ IDs refer to the PRD. Visual specs live in `DESIGN.md`, under the same component names. Spines win on conflict with any mock; mock header comments are historical.

## Foundation

- **Form factor:** multi-surface responsive web app (PWA) for phones, tablets, and laptops.
  - **Phone:** primary for Prep, Practice, Review, and Log a moment.
  - **Laptop:** convenient for import, Plan editing, and Summaries.
  - Every surface works on every device.
- **Browsers:** no browser is assumed. The app works without installing, and installing is offered where the browser supports it (PRD §6).
- **Stack:** React + Vite (addendum §A.6). No UI system is named. Architecture picks accessible headless primitives (e.g. Radix) for dialogs, sheets, and menus, styled with DESIGN.md tokens. This spine specifies behaviour only.
- **Theme:** follows the device's light or dark setting, with a manual override in Settings.
- **Core posture:** **Prep → Activity → Review.**
  - The app is busy before and after practice, and nearly invisible during it. The default flow needs no screen interaction between Prep and Review (FR-10).
  - Caregivers should be able to start an Activity in 30 seconds or less and log a typical Review in about 20 seconds.

## Information Architecture

> Composition references: [Today](mockups/key-today.html), [Prep](mockups/key-prep.html), [Practice and Coach Tips](mockups/key-practice.html), [Review and Review saved](mockups/key-review.html).

Navigation is a bottom bar on phones and a left rail on tablets and laptops, with five destinations: **Today · Goals · Activities · Share · Family** (approved by the product owner).

| Surface | Reached from | Purpose | PRD |
|---|---|---|---|
| Onboarding | Invite link / first sign-in | Consent → Family → Child Profile → first Care Team Member → first Goal → install and reminders (optional) → invite co-caregiver (optional) | UJ-0, FR-1–4, FR-13 |
| **Today** (home) | App open, nav | The next Plan Activity (Today card), the **Log a moment** button, the Plan strip ("This week"), and the Nudge | FR-13, FR-14 |
| Plan (this week) | Today → "See plan" | Plan editor: accept or edit the suggested Plan | FR-13 |
| Prep | Today card, Plan row, Activity detail | The Prep card. Start the optional timer, or go straight to Log review | FR-11, FR-10 |
| Practice | Prep → Start | Marks (2×2), optional timer, Practice options, and Done. Coach Tip sheet on Mark | FR-10, FR-12 |
| Review | Practice → Done, Prep → Log review | The quick Observation, pre-filled; one section per Activity | FR-14 |
| Log a moment | Today button (sheet) | A spontaneous Observation linked to a Goal or an Inventory list | FR-14, FR-15 |
| **Goals** | Nav | Goals grouped by Care Team Member, then parent-proposed. Filter by Goal Period | FR-3, FR-4, FR-6 |
| Goal detail | Goals row | Description and original wording, Criterion, Strategies and Restrictions, lineage, Observations with history, and the Progress view | FR-4, FR-6, FR-7, FR-14, FR-16 |
| Add a Goal | Goals → "+" | Goal form (manual), or import (P2): upload, photo, or paste → **masking review** → draft review → confirm | FR-4, FR-5, FR-7 |
| Add a Strategy, Restriction or prescribed Activity | Goal detail → "+ Add", Care Team Member page | Strategy/Restriction form | FR-7 |
| Care Team Member page | Goals → group heading, Family → Care Team Members | Role, discipline and Care Setting (Care Team Member form); that member's Goals, Strategies and Restrictions; their Status Vocabulary and Prompt Level terms; "New period" | FR-3, FR-6, FR-7 |
| Originals | Goal detail → "Source document", Family → Settings → Privacy | View or delete uploaded originals | FR-5 |
| New Goal Period | Care Team Member page → "New period" | New Goal Period screen: period dates, lineage for each current Goal (carried over, revised, retired), new Goals; import (P2) as an optional start | FR-6, UJ-2 |
| **Activities** | Nav | The library by Goal: favourites, hidden, and "Get new ideas" (AI, P2) | FR-8, FR-9 |
| Activity detail | Library, Plan | Purpose, steps, variations, Cues, Coach Tips, and what to observe. Add to Plan | FR-8 |
| Get new ideas (P2) | Activities → "Get new ideas" | AI Activity ideas for a Goal, with optional filters | FR-9 |
| **Share** | Nav | Summaries list (each recent row has an "After the appointment" button), Summary builder and preview, and Appointment Feedback | FR-17, FR-18 |
| Summary builder | Share → "New summary" | Pick Care Team Member, then a Goal Period **or a date range** → draft → edit → confirm → export or share | FR-17, UJ-4 |
| Appointment Feedback | Share → Summary row → "After the appointment" | Goal statuses, Review Status changes, and new Strategies and Restrictions | FR-18 |
| **Family** | Nav | Child Profile, Care Team Members, Caregivers, Inventory lists, and Settings | FR-1–3, FR-15 |
| Child Profile | Family → Child Profile | Child Profile form | FR-2 |
| Caregivers | Family → Caregivers | Invite caregiver, pending invites, remove a Caregiver, leave the Family | FR-1 |
| Settings | Family → Settings | Reminders, theme, Family defaults for the Prompt Level list and Status Vocabulary (copied to each new Care Team Member; per-member edits live on the Care Team Member page), and privacy: export, audit log, originals, delete Family | FR-3, FR-13, §5 |

Rules:
- Modal stacks are at most one level deep. Sheets are used for quick actions (Log a moment, Coach Tips, Practice options) and full screens for flows (Prep, Review, forms, import).
- Reach:
  - Every nav destination is one tap from anywhere.
  - Today's Activity Prep and Log a moment are one tap from Today (FR-13); Practice and Review are reached from Prep.
  - Every other surface is at most two taps below its nav destination (three from Today). Exceptions: Settings › Privacy sub-pages and later steps inside a flow (import, Summary builder), which follow the flow.

## Voice and Tone

These rules cover microcopy. Brand posture lives in `DESIGN.md` under Brand & Style.

Principles:
- **Warm.** Write the way a friend who knows the subject would speak.
- **Short.** Use plain words. Keep the therapist's own terms, with a plain gloss where they are clinical.
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
| "Couldn't save just now. Your review is kept — try again." | "Error 500" / "Something went wrong" |
| Use the child's nickname from the Child Profile ("Reading with Bean") | Use "your child" coldly, or praise/score the child ("Great job, 8/10!") |

Reminder copy invites practice and never counts what was missed, e.g. "A few minutes of play today? Storybook together is ready."

## Component Patterns

These are behavioural rules. Visual specs live in `DESIGN.md` under Components, with the same names.

### Core loop

| Component | Use | Behavioural rules |
|---|---|---|
| Domain tint | Every Activity surface | An Activity takes its Domain family's tint (mapping rule in DESIGN.md › Colors; unmapped → `domain-other`) on the Today band, Prep hero, Cue tiles, and Plan row square. When an Activity serves several Goals, it uses the first linked Goal's Domain. The Domain's text label always appears with the tint. |
| Today card | Today | Shows one Activity, the next one in the Plan. Prep is its one primary button; the card itself is not a tap target. "Not this one" swaps it for the next Plan item and shows "Swapped for Bubble play · Undo". Nothing piles up. |
| Plan strip | Today | The week's Plan items as Plan rows. Each row is one button that opens its Prep card; its accessible name includes day, Activity, Domain and status. The next item says "Next" in text. "See plan" opens the Plan editor. Review status is text only. |
| Prep card | Prep | Readable in under a minute. Shows 2–3 Cues and the Care Team Strategy. "If it gets hard" starts collapsed. Opens without starting a Practice Session and can be reopened from Practice. A quiet "Add another Activity" adds one more Plan item to this Practice Session (max two, FR-10). |
| Practice screen | Practice | Four Marks, the optional timer, a quiet "Prep card" link, a quiet "Pause or change" button, and the primary button. The screen may sleep. Reopening the app returns to Practice while a Practice Session is open, unless it has been open over 12 hours (then Today opens with the stale-session prompt; see State Patterns). Orientation is never locked. Guided mode (P2) adds one step per screen and keeps the screen awake. |
| Practice options sheet | Practice → "Pause or change" | **Pause:** stops the timer; the screen shows "Paused" and "Resume"; the Practice Session stays open. **Try a variation:** lists the Activity's variations; choosing one updates the Prep card and is recorded on the Practice Session. **Skip this Activity:** moves to the next Activity, or to the Review if none; the skipped Activity's Review section is pre-set to "Not attempted / child not available" (changeable). **Stop and review:** goes to the Review, never framed as failure. |
| Two-Activity Practice Session | Practice, Review | Before the second Activity the primary reads "Next: <Activity>" and opens its Prep card, then Practice continues in the same Practice Session; "Activity 1 of 2" shows in text. **One Review per Practice Session** (PRD §3, FR-14), with one section per Activity whose fields follow that Activity's Goal Criterion. One Save stores one Observation per Activity, each linked to the shared Practice Session. The second section pre-fills Where from the first. The header "Not attempted / child not available" covers the whole Practice Session; each section also has its own, for that Activity only. |
| Mark button | Practice | One tap saves a Mark with a time and opens the Coach Tip sheet. Tapping the same Mark again within 10 seconds does not duplicate it, and the sheet says "Already marked". |
| Coach Tip sheet | After a Mark | Opens with "Mark saved: <Mark> · Undo" (Undo removes the Mark). Close at the top and "Back to practice" at the bottom, so swiping isn't the only way out. Up to 3 tips. Curated tips appear instantly. AI tips appear below them when ready, labelled, in space held by a "More ideas are on the way" line so the layout doesn't shift; their arrival is announced politely ("1 more idea added"). Each tip has a Helpful toggle. Closing returns to Practice. |
| Timer | Practice | Optional. Starts on tap and reads "Time so far 3:42", without emphasis. No target, no countdown, never announced live. Its value pre-fills Attention (minutes) in the Review. |
| Review form | Review | Titled "How did it go?". Fields: see Review fields. On phones it scrolls, with Save pinned. Fields pre-filled from last time (Prompt Level, Where) collapse into one row, e.g. "Model · Reading · One-to-one — Change", announced as "pre-filled from last time", so a typical Review is the Measure plus Save (just Save when the timer filled it). "Not attempted / child not available" saves in one tap and shows "That's okay — logged as not today · Undo". |
| Stepper | Review, Log a moment sheet, Plan editor | Two modes: **paired** "X of Y" (legend "Trials", inputs "Succeeded" and "Tried") for trials, and **single** for minutes or counts. −/+ buttons and direct number entry. Values clamp at 0; at 0 the "−" becomes `aria-disabled` and keeps focus (the field reads "0, minimum"); Succeeded can't exceed Tried, with inline text "Can't be more than 5 tried". |
| Choice chips | Review, Plan, Goals, forms | Single-select for Prompt Level, who modelled, each Where row, and engagement. Multi-select for "Which cue or tip helped?". Where adds "Other…". |
| Helpful toggle | Coach Tip sheet, Review | Toggles on or off. Tips marked helpful appear first next time (FR-12). |
| Log a moment sheet | Today | A bottom sheet in this order: **for which Goal or list** (chips: active Goals by short description, then Inventory lists in P2), **what you saw** (options follow that Goal's Criterion, below), **Where** (pre-filled from last time, collapsed with "Change"). Saves in 3 taps (Goal, what you saw, Save) plus optional text. |
| Status line | After Save, Share, Not attempted, swap | Confirms in text ("Review saved."), announced to screen readers, with an Undo where the action is one tap. It survives the navigation its own action caused, then clears on the next user action or navigation (no timed fade). Announcement order: Accessibility Floor › Status messages. |
| Banner | Today, Settings, any screen while offline | Persistent notices: offline (not dismissable; clears itself when synced), deletion pending (action "Undo"; shown until the deletion completes or is undone), security notices (dismissable per Caregiver). At most one action each. Banners stack newest first and never block the screen. |
| Nudge | Today | A single line on Plan days. It disappears for the day once an Observation is logged. No badge on the app icon. |

**Review fields**

| Field | Control | Options | Pre-fill / default | Required |
|---|---|---|---|---|
| Marks | Selected chips (removable) | Marks from Practice | From Practice | No |
| Elapsed time | `meta` text | — | From Practice | — |
| Measure | Stepper (paired or single, per Criterion) | Trials (X of Y), count, or frequency. For a duration Criterion the Measure *is* Attention (minutes), shown once | Empty; duration: from the timer | **Yes** for a Structured Goal, unless Not attempted |
| Attention (minutes) | Single stepper | — | From the timer. Shown whenever the timer ran; otherwise behind a quiet "+ Add attention time" | No |
| Prompt Level | Single-select chips, each with a plain gloss | The Goal's Care Team Member's terms (their Prompt Level mapping, if set) over the Family's Prompt Level list. Default list from PRD §3: full physical ("you guided their body"), partial physical ("a light touch to start"), model ("you showed how"), gestural ("you pointed or nodded"), verbal ("you said a word or hint"), independent ("on their own") | Last used | No |
| Who modelled it | Single-select chips | You · Another caregiver · Other adult · Sibling | You | No |
| Where | Two single-select rows | Routine: Meal · Bath · Reading · Play · Outdoors · Other…; with whom: One-to-one · With a sibling · In a group | Last used | No |
| Engagement | Single-select chips | A bit hard · OK · Good | None | No |
| Which cue or tip helped? | Multi-select chips | This Activity's Cues and the tips shown | Tips marked Helpful | No |
| Note | Text field (dictation allowed) | — | Empty | No |

Save stays enabled. With a required Measure missing, it moves focus to the Measure and says "Add how many, or choose Not attempted". A Narrative Goal has no required field.

**Log a moment: "what you saw"**

| Goal's Criterion | Options | Then |
|---|---|---|
| Trials | Did it on their own · Did it with help · Tried, not yet | Saves as 1 of 1 or 0 of 1; "with help" adds the Prompt Level chips (optional) |
| Duration | Stayed with it | Single stepper, minutes (optional) |
| Count of new items | Something new | Single stepper, default 1, and "What was it?" text (optional) |
| Frequency | It happened | Single stepper, default 1 |
| Narrative Goal | Something I noticed | Note field |
| Inventory list (P2) | — | Inventory entry |

### Goals, Observations and sources

| Component | Use | Behavioural rules |
|---|---|---|
| Goal row | Goals | Grouped by Care Team Member, then "Proposed by you". Shows the Goal description, Domain label, Source badge, and for parent-proposed Goals the Review Status. Retired Goals collapse under "Earlier goals". Each group heading opens that Care Team Member page. |
| Goal form | Add a Goal, Goal detail → Edit | Fields per FR-4, in order: Domain (chips seeded with the Domain family names in DESIGN.md › Colors plus the Family's existing Domains, + "Other…" free text), description, Source (Care Team Member or "Proposed by you"), type (Structured / Narrative), optional long-term Goal, Criterion (if Structured: type, then target, Prompt Level, Context), Context, Goal Period, optional baseline. **Observable-behaviour prompt:** after the description loses focus, a tip offers a rewrite as an observable behaviour ("says more words" → "names 5 familiar objects when asked") with "Use this" and "Keep mine"; ignoring it is fine. A Caregiver-entered Goal saves as parent-proposed, *proposed*. Editing a Care Team Goal keeps the original wording visible above the edit and labels the Goal "Edited by a caregiver". |
| Strategy/Restriction form | Goal detail, Care Team Member page, Appointment Feedback form | Pick the kind (Strategy, Restriction, prescribed Activity), enter text exactly as given, pick the Source (a Care Team Member, or "Proposed by you" for a Strategy), attach to one or more Goals. A Restriction applies from the next Plan and suggestion (FR-18). A prescribed Activity is saved verbatim with its Source and is never rewritten. A Child Profile sensitivity marked "avoid" appears here as a Restriction with the Source "From Child Profile", edited only from the Child Profile (FR-2). |
| Child Profile form | Onboarding, Family → Child Profile | Nickname (required, the only identifier), optional age band chips, interests, materials and toys at home (each added as a removable chip), sensitivities (text, each with an "Avoid" checkbox; checked → Restriction), engagement notes (what helps or hinders). Never asks for a real name or date of birth. |
| Care Team Member form | Onboarding, Family → Care Team Members → "+" | Role (chips: SLP, OT, Early-intervention teacher, Other…), discipline, Care Setting (Clinic · School · Home visit · Online). Saves with the Family default Status Vocabulary and Prompt Level list copied in. No name field is required; the role is the display label. |
| Care Team Member page | Goals group heading, Family | Shows the Care Team Member form fields (Edit), the member's Goals by Goal Period, Strategies and Restrictions, and "New period". **Status Vocabulary** for this member: editable list of terms, starting from the Family default (FR-3). **Prompt Level terms** (optional mapping): relabel each level of the Family's list in this member's words, same order; blank keeps the default. Used by Review, the Appointment Feedback form and Summaries for this member's Goals. |
| Invite caregiver | Onboarding (optional), Family → Caregivers | Email field and "Send invite". A pending invite shows "Invite sent 5 Nov" with Resend and Cancel; an expired one says so and offers Resend (State Patterns › Invite invalid or expired). The invitee gives their own consent on acceptance. |
| New Goal Period | Care Team Member page → "New period" | 1. Period: start and end dates (end defaults to start + 3 months), optional label ("Spring term"). 2. Each current Goal of this member as a card with single-select lineage chips: **Carried over** (pre-selected; keeps its Observations), **Revised** (opens the Goal form pre-filled from the Goal; saving creates a new Goal linked to its predecessor and the card shows the change, e.g. "5 → 10 minutes"), **Retired** (closes, read-only). 3. "+ New goal" opens the Goal form with this Source and the new period; these show under "New this period" with lineage *new*. Optional (P2): "Start from a document" runs import, whose confirmed Goals land here as *new* or matched for revision. **Start new period** closes the old period: revised predecessors and retired Goals close, carried-over Goals move. The draft is kept on this device until started or discarded. Status line: "New period started." |
| Observation history | Goal detail, Progress view | Each Observation shows who logged it ("You" or the Caregiver's account display name), when, and its Context. "Edit" reopens the Review form; saving keeps the earlier version. An edited Observation shows "Edited" and a "History" link listing earlier versions with editor and date. |
| Original file | Goal detail → "Source document", Settings → Privacy → Originals | Shows the file name, upload date, and "Kept until <date>" (12 months, PRD §10.2). "View" opens it (Family Caregivers only). "Delete" uses the plain Destructive confirm ("The goals you confirmed stay. The file is removed.") and is logged in the audit log. |
| Progress view | Goal detail | See below. |
| Source badge | Goals, Goal detail, Prep, Summary | Always a text label. Parent-proposed Goals also show their Review Status. |
| AI label | Suggestions, tips, Summary text, Progress descriptions | On every AI-generated item. Never hidden. |

**Progress view (FR-16)**

| Aspect | Rule |
|---|---|
| Structure | Three separate cards in fixed order: Practice consistency (Practice Sessions per week), Performance, Generalisation (Contexts observed). Never combined into a score. |
| Performance per Criterion | Trials: each Observation as "X of Y" points. Duration: minutes per Observation. Count of new items: running count. Frequency: count per Practice Session. Plus a Prompt Level chart on the Prompt Level list's own order, and attention duration only where recorded, never with a target line. |
| Narrative Goal | No charts. A list of Observations, notes, and Contexts. |
| Data notes | The Observation count heads the view. Below 5 Observations in the Goal Period: points only, no trend, "too few to show a trend". Trends are P2. |
| Attribution | Each point and table or list row names who logged it. Tapping a point opens that Observation (pointer shortcut only). "Show as table" is how keyboard and screen-reader users open an Observation: each row's date links to it. |
| Lineage | A revised Goal shows earlier periods behind a labelled divider ("Revised 12 Aug: 5 → 10 minutes"), back through each predecessor (FR-6). |
| AI descriptions | Labelled AI, describe only what was recorded, and cite their Observations ("Based on 6 observations" expands the list). No clinical conclusions. |
| Never | Traffic-light colours, percentages, scores, targets, or Domain tints in charts. |
| Accessible alternative | Each card starts with a one-sentence text summary in the honest-data voice. "Show as table" swaps the chart for a table (date, value in Criterion units, Prompt Level, Context, logged by). Series differ by label and marker shape, never hue alone. |

### Import, sharing and planning

| Component | Use | Behavioural rules |
|---|---|---|
| Masking review | Import (P2) | Mandatory gate before AI. Shows the page with detected identifiers covered **and** a list of **every text line on the page** (OCR, reading order) as checkbox rows, legend "Cover before sending"; checked = covered. Detected identifiers come pre-checked, grouped first under "We covered these"; all other lines follow under "Everything else on the page". A row label is just the line ("Clinic letterhead, line 1"), never "Covered:". All rows are reachable by Tab and toggled with Space; checking a row covers that line on the image. **Cover more** (a toggle): in cover mode a single tap or Enter on a line covers it, or tap two corners to draw a box; on keyboard, a focused box moves with arrows and resizes with Shift+arrows, announcing after each move the text it overlaps ("Covers: clinic phone line, line 3"), and Enter places it. Every manual cover joins the list as its own checked row ("Your cover 1: page 1, covers 'Tel …'"). Tap a cover or uncheck its row to uncover; uncovering from the image announces "Uncovered: <line> · Undo". Drag is only a shortcut. Changes announce the total ("3 items covered"). The primary button says what will be sent ("Send 1 page with 3 items covered"). Nothing goes to AI before it is pressed. If no text can be read from the page, it says so ("We couldn't read the text on this page") and offers Paste or the Goal form instead; there is no visual-only review. |
| Draft review | Import (P2) | Each extracted item with Confirm, Edit, Discard. Original wording sits next to any simplification. Uncertain fields say "Please check this". Each flagged field must be touched before its item confirms: Confirm stays enabled, and pressing it with unchecked fields moves focus to the first one and says "Please check this (2 left)". |
| Plan editor | Plan | Accept the suggested Plan in one tap, or edit: number of items (default 3–5), add, remove, or swap Activities, set an optional day and Context per item, weekly availability, and week start (Monday by default). Each week starts fresh; nothing rolls over. |
| Activity row | Activities | Name (opens Activity detail), Domain label, time needed, Source (prescribed) or AI label. Favourite and Hide are separate toggle buttons beside the name, never inside it. Hidden Activities move under "Hidden" and can be restored. |
| Get new ideas | Activities (P2) | Pick a Goal, optionally filter by time available, materials or Where, then "Show ideas". Results are AI-labelled and Restriction-checked before display. For a Goal with Review Status *proposed*, each idea also says "This goal hasn't been discussed with your care team yet." "Add to Plan" or Favourite on each. |
| Summary builder | Share | Step 1: Care Team Member. Step 2: "Goal Period" (default: current) or "Date range" (two date fields). Then the Summary preview: the standard document (DESIGN.md › Summary preview and document), one section per Goal, parent-proposed Goals under "For discussion", AI-suggested questions labelled. Each AI sentence shows "Based on N observations", which expands the list. Every section is editable; Confirm-to-share, then export (PDF) or share. |
| Appointment Feedback form | Share → Summary → "After the appointment" | Per Goal: status from that Care Team Member's Status Vocabulary (chips), Review Status change for parent-proposed Goals (*discussed* / *confirmed*), "Was the summary useful?" (Yes / Not really, for SM-3), and "+ Strategy or Restriction" (opens the Strategy/Restriction form). Saves with "Feedback saved. New Restrictions apply from the next Plan." |
| Inventory entry | Log a moment sheet, Family → Inventory (P2) | Pick the list (new words, new gestures, scripts heard), enter the item, tag it (function, understood/used, or Context and intent); first-seen date and Context default to now and last Where. |
| Consent cards | Onboarding, invite acceptance | Three plain-language cards (what's stored, how AI processes it, how sharing works), each readable on its own; "I agree" at the end; no pre-ticked boxes. |
| Confirm-to-share | Summary | A sheet saying the Summary is leaving the Family, with "Share" and "Not now". |
| Destructive confirm | Delete Family, remove Caregiver, leave Family, delete original | Variant per action, below. The Danger button never becomes natively disabled. In the typed variant it is `aria-disabled="true"` until the text matches, with `aria-describedby` → the visible instruction ("Type DELETE to confirm"); pressing early moves focus to the field and shows that instruction inline. Cancel closes with nothing changed. |

**Destructive confirm variants**

| Action | Confirmation | Undo | Copy |
|---|---|---|---|
| Delete Family | Typed ("DELETE") | 7 days, by any Caregiver, from the banner or Settings → Privacy | "All family data will be deleted on <date>. Any caregiver can undo this until then." |
| Remove a Caregiver | Plain confirm | None; invite them again to restore access | "<Caregiver> will lose access now. Everything they logged stays." |
| Leave the Family | Plain confirm | None; ask to be invited again | "You'll lose access to this family. Everything you logged stays." |
| Delete an original file | Plain confirm | None | "The goals you confirmed stay. The file is removed." |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Loading (cold open) | Today, Prep, Goal detail | Layout placeholders in the card shapes, no spinner. Curated content (Prep card, starter tips) loads from the device first, so it never looks like it waits on AI. |
| Generating | Summary draft, import extraction | A `meta` line ("Drafting your summary…", "Reading the page…") with the rest of the screen usable; Cancel available. |
| First run, no Goals | Today | "Let's add your first goal." Links to Goals → Add. The Today card shows a starter Activity for the chosen Domain. |
| No Goals | Goals | "No goals yet. Add one from your therapist's sheet, or propose your own." Add button. |
| No favourites / all hidden | Activities | "No favourites yet — tap the heart on any activity." / "Everything here is hidden. Show hidden." |
| All suggestions blocked | Activities → Get new ideas | "No new ideas right now. Try a favourite?" Never says a Restriction blocked them. |
| No Summaries | Share | "Before an appointment, make a summary for your therapist." New summary button. |
| Summary with no Observations | Summary builder | "Nothing recorded in this period yet." The draft still lists Goals and the questions section. |
| No Plan this week | Today | "Pick a few activities for this week?" Offers the suggested Plan, accepted with one tap. |
| Plan done early | Today | "That's this week's plan. Anything extra is a bonus." Offers a favourite. No celebration. |
| Not attempted | Review | Saved as a neutral entry, with Undo. The Today card moves to the next item. Nothing carries over. |
| Stale open Practice Session | Today, next open after 12 hours | Takes precedence over returning to Practice: the app opens to Today with "Earlier practice is still open.", "Review it" and "Close without review" (saves nothing, no message about missing it). |
| Offline (core loop) | Prep, Practice, Review, Log a moment sheet | Prep cards and starter Coach Tips for the current Plan work offline. Observations queue locally and sync as soon as a connection returns (browsers may clear long-unsynced data). A `role="status"` banner says: "Saved on this device — will sync." |
| Offline (forms and AI steps) | Forms (Goal, Strategy/Restriction, Child Profile, Care Team Member, Appointment Feedback), Plan editor, New Goal Period | The draft is kept on this device; Save queues with "Saved on this device — will sync." AI-dependent steps (Summary draft, Get new ideas, import, AI Coach Tips) say "Needs a connection" in place, and the rest of the screen stays usable. |
| Sync waiting (server asleep in local mode) | Any | The same offline treatment. No error dialogs. |
| Two Caregivers at once | Today, Plan, Review, any record | Today and the Plan refresh on app focus and after each Save. A Plan row Reviewed by the other Caregiver shows "Reviewed by <Caregiver>". If both Review the same Plan item, both Observations are kept, each attributed; nothing is merged or overwritten. Two edits to the same record both save as versions in its History, newest shown. |
| Save rejected / upload failed | Review, forms, import | Inline: "Couldn't save just now. Your review is kept — try again." with Retry. The draft is never lost. |
| Session expired | Any, mid-task | Sign in again in place; the app returns to the same screen with the draft intact. |
| Camera permission denied | Import → Photo | "Camera access is off. You can upload a photo or PDF instead, or turn the camera on in your browser settings." Upload and Paste stay available. |
| Push declined | Onboarding, Settings | Accepted silently; "You'll see a gentle nudge in the app instead." No re-ask unless the Caregiver opens Settings → Reminders. |
| Consent not given | Onboarding, invite acceptance | "LittleSteps needs your agreement to keep your family's information. You can read the cards again whenever you're ready." The account can't be used until consent (FR-1); Sign out is offered. |
| Invite invalid or expired | Invite link | "This invite has expired. Ask the person who invited you to send a new one." No account is created. |
| AI slow or unavailable | Coach Tips, suggestions, import | Curated content shows first. AI areas say "Ideas are taking a moment" and fall back silently. Import keeps the manual-entry route open. |
| Suggestion blocked by a Restriction | Suggestions, tips | The suggestion is not shown. No message, so the Restriction is never undermined. Logged for evaluation. |
| Uncertain extraction | Draft review | "Please check this" tag on the field; see Draft review. |
| Limited data | Goal detail, Summary | Fewer than 5 Observations: points are shown with "too few to show a trend" (Goal detail) or "limited data" (Summary). |
| Narrative Goal | Goal detail | No charts; see Progress view. |
| Retired Goal | Goals | Collapsed under "Earlier goals", read-only, with its history intact. |
| Deletion pending | Today, Family → Settings | A banner: "Family data will be deleted on <date>." with Undo, for 7 days, shown to every Caregiver. |
| Caregiver removed, left, or joined | Today (other Caregivers) | Security notice banner; see Notifications. |
| Removed Caregiver | The removed device | "You're no longer part of this family." Signs them out. |

## Interaction Primitives

- **Tap first.** Every action is a visible tap target of at least 48px. Marks are 72px.
- **Sheets:** swipe down, tap the scrim, press Esc, or use the visible Close.
- **Gestures are never the only way to act.** No long-press, no swipe-only or drag-only actions (masking included).
- **Undo over confirm** for one-tap actions: Not attempted, Mark, and "Not this one" each offer Undo in place (Helpful simply toggles back); it lasts until the next action, with no time limit. Destructive, multi-item actions (delete Family, remove Caregiver) use a confirm instead.
- **Back:** browser and OS Back always works and never discards an unsaved Review. A draft Review is kept and reappears. Back restores scroll and focus position.
- **Banned:**
  - streaks, scores, and badges
  - confetti or celebration animations
  - visible countdowns or target timers
  - unread counters on the app icon
  - autoplay media
  - nags after dismissal

## Accessibility Floor

These are behavioural rules. Visual contrast, focus indicator and reflow geometry live in `DESIGN.md`.

- **Standard:** WCAG 2.1 AA (PRD §6).
- **Screen readers** (VoiceOver, TalkBack, NVDA): every control has a name, role, and state, per the table below.
- **Text size:** follows the OS and browser setting (DESIGN.md › Typography: no px root, `-apple-system-body` on iOS and iPadOS only). Content reflows at 200% and at 320 CSS px with no truncation (DESIGN.md › Layout & Spacing › Reflow). Test with iOS Larger Text at maximum, Android font scale 200%, desktop browser font size settings, and macOS Safari at default zoom (body renders at 17px).
- **Reduce Motion:** follows `prefers-reduced-motion: reduce`. Sheets appear without sliding or fading, and pressed states change instantly.
- **One-handed reach:** the primary action and the Marks sit in the lower half on phones.
- **Never colour alone:** Source, AI, status, selection, the active nav item, the next Plan row, and Marks always carry text or a shape.
- **Keyboard:** full keyboard operation. Visible focus indicator (DESIGN.md `focus-indicator`). `Esc` closes the topmost sheet or dialog. Tab order follows reading order. A "Skip to content" link precedes the nav, with `<nav>` and `<main>` landmarks.
- **Focus management:** on a route change, update `document.title` ("Prep: Storybook together · LittleSteps") and move focus to the `<h1>`. Done → Review focuses "How did it go?". Sheets focus their heading on open, trap focus, and return it to the invoker on close.
- **Status messages:** one `role="status"` region lives in the app shell, outside routed content, present (empty) from first load; no route renders its own. On an action that navigates: route → `document.title` → focus the `<h1>` → inject the message on the next frame. The visible status line sits right after the `<h1>`, so its Undo is the next Tab stop.
- **Disabled controls:** use `aria-disabled="true"` (still focusable, drawn `ink-disabled`), never native `disabled` on a control that can hold focus, so focus is never dropped to `<body>`. Pressing it does nothing unless a message is specified (Stepper, Destructive confirm).
- **Time limits:** none. The Practice Session never times out; the 7-day undo is the only time-bound element.
- **Orientation:** never locked.
- **Dictation:** every text field accepts the device keyboard's dictation. The app records no audio itself.

| Component | Required semantics |
|---|---|
| Mark button | Native `<button>`, name = Mark label. The Coach Tip sheet's `aria-describedby` points at a text span holding only "Mark saved: Losing attention"; Undo is a separate button, first in the tab order after the heading. |
| Removable Mark chip (Review) | `<button>` named "Remove Losing attention". |
| Pre-filled row (Review) | `<button aria-expanded>` named "Change pre-filled answers: Model, Reading, One-to-one". |
| Single-select chips | Native `<input type="radio">` in `<fieldset>` + `<legend>`; arrow keys move the selection. |
| Multi-select chips | Native checkboxes in a `<fieldset>`. |
| Helpful toggle, Favourite, Hide | `<button aria-pressed>`; on state also shows in text (check glyph, "Favourite ✓"). Helpful has `aria-describedby` → its tip text, so each is distinct. Favourite and Hide include the Activity name ("Favourite Storybook together"). |
| Stepper | Native `<input type="number" inputmode="numeric">` with a visible `<label>`; "−"/"+" buttons named by the field ("Fewer minutes" / "More minutes"), `aria-disabled` at the limit; paired mode is a fieldset ("Trials") with "Succeeded" and "Tried". Value changes show in the input, not a separate live region. Errors linked with `aria-describedby`. |
| Text field | Native input or textarea with `<label for>`; placeholder is never the label. |
| Disclosure row ("If it gets hard", "Earlier goals", "Hidden") | `<button aria-expanded aria-controls>`. |
| Sheets and dialogs | `role="dialog" aria-modal="true"`, `aria-labelledby` = heading, focus trapped, focus returned to the invoker. |
| Status line, offline banner | Announced through the single app-shell `role="status"` region (see Status messages). |
| Banner | A region labelled "Notices"; the dismiss control is a `<button>` named "Dismiss notice: <first words>". |
| Timer | Plain text labelled "Time so far"; not `role="timer"`, `aria-live="off"`. |
| Plan row | One `<a>` or `<button>`; name includes day, Activity, Domain and status ("Thursday, Storybook together, Joint attention, next up"). The next row has `aria-current="true"`. |
| Today card | `<article>` with a heading. Prep and "Not this one" are separate buttons; the card itself is not a click target. Never nest interactive elements. |
| Activity row | The Activity name is a link; Favourite and Hide are sibling buttons, not inside it. |
| Nav | `<nav>` with links; the active one has `aria-current="page"`. |
| Masking list | Checkboxes in two fieldsets ("We covered these", "Everything else on the page") under the legend "Cover before sending"; "Cover more" is a `<button aria-pressed>`; the cover count, the keyboard box's overlapped text and "Uncovered … · Undo" go to the shell status region. |
| Destructive confirm | Danger button `aria-disabled` + `aria-describedby` → instruction until the typed text matches. |
| Charts | `role="img"`, not focusable, with the text summary as its name. Tappable points are `aria-hidden` with `tabindex="-1"`. "Show as table" reveals a real `<table>` whose date cells link to each Observation. |

## Responsive & Platform

| Width | Behaviour |
|---|---|
| < 600px (phone) | Bottom nav and a single column. Sheets are full-width. The Practice screen fills the viewport. |
| 600–1023px (tablet) | Left rail, with content centred at `{spacing.content-max}`. Sheets are centred, 560px max. |
| ≥ 1024px (laptop) | Left rail. Import and the Summary builder use two columns (source on the left, draft on the right). Summary preview has a print-like page. |

Platform notes:
- **Install:** offered after the first saved Review, never on first open. Uses each browser's own install pattern, or shows short instructions where the browser has no prompt.
- **Push reminders:** offered during onboarding once the app is installed. The in-app nudge is the default (FR-13).
- **iOS (every browser uses WebKit):** no share-target import, so import offers Upload, Photo, and Paste. Push works only after installing to the home screen. Dynamic Type needs the `-apple-system-body` root, gated to iOS and iPadOS (DESIGN.md › Typography); the default base there is 17px.
- **Share:** uses the device share sheet where available. Falls back to a PDF download.

## Notifications

- **Default:** an in-app nudge on Today on Plan days, at the time picked during onboarding (early evening by default).
- **Opt-in push:** at most one per Plan day, at the chosen time. Tapping it opens Today. Never sent on non-Plan days, and never more than once a day.
- **Security notices (required, FR-1 and §5).** Membership changes and Family deletion are security notices, not activity notifications, and always reach the other Caregivers:

  | Event | Who is told | Copy |
  |---|---|---|
  | A Caregiver is removed or leaves | Remaining Caregivers | "<Caregiver> is no longer part of your family (5 Nov). See the audit log." |
  | A Caregiver joins | Existing Caregivers | "<Caregiver> joined your family (5 Nov)." |
  | Family deletion requested | Every other Caregiver | "<Caregiver> asked to delete all family data. It will be deleted on <date>. You can undo this in Settings → Privacy." |
  | Deletion undone | Every Caregiver | "Family deletion was cancelled." |

  Channel: a banner on Today until dismissed, plus an email to each Caregiver's sign-in address, plus push if that Caregiver opted in. Never batched with reminders. `<Caregiver>` is the account display name.
- **Never:**
  - "you missed" messages
  - streak or score references
  - notifications about the other Caregiver's practice activity (Observations, Reviews, Marks)

## Privacy & Consent Surfaces

- **Consent** comes first in onboarding and at invite acceptance, as the Consent cards (see Component Patterns). No pre-ticked boxes. Declining is covered in State Patterns.
- **Masking review** is a mandatory step in every import (FR-5).
- **Confirm before** every Summary export or share.
- **Settings → Privacy** contains:
  - export all data
  - the audit log, a readable list of sign-ins, membership changes, exports, shares, and deletions
  - Originals: view or delete uploaded files, each showing its retention date
  - Delete Family, with typed confirmation and the 7-day undo
  - support access grants, which are time-limited and revocable

## Inspiration & Anti-patterns

The product owner gave no references. These anti-patterns come from the PRD's guardrails.

- **Rejected: streaks and habit gamification.** They make missed days a source of guilt. Missed days never accumulate.
- **Rejected: an on-screen coach during play.** It makes play clinical and draws the caregiver's attention from the child. Guidance happens before and after.
- **Rejected: traffic-light progress and percentages.** These imply clinical judgement the app must not make (PRD §5).
- **Rejected: an AI chat interface.** LittleSteps is not a chatbot giving therapy advice (PRD §1.2). AI appears only as labelled suggestions inside structured surfaces.

## Key Flows

The protagonists are illustrative composites, per the privacy rule. Flows mirror the PRD's UJ names.

### Flow 0: Setup to first Practice Session (a working parent, invited to the pilot, on a phone) (UJ-0)
1. Opens the invite link and creates an account.
2. Reads three consent cards and taps "I agree".
3. Creates the Family. Enters the child's nickname, interests (songs, cars), and materials at home.
4. Adds the SLP as a Care Team Member, then adds one Goal with the Goal form (accepting the observable-behaviour rewrite), or pastes a message from the early-intervention teacher.
5. Is offered "Add to home screen and get a gentle reminder?" and skips it for now. Skips inviting the co-caregiver for now too.
6. **Climax:** Today shows "Reading with [nickname]," with a Prep button. The parent knows what to do tonight.

Failure: no goal sheet yet. The parent adds a parent-proposed Goal, labelled "Proposed by you," and continues. Invite expired: plain copy asks for a new invite, and no account is created.

### Flow 1: Prep, play, review (a working parent, evening, with a toddler) (UJ-1)
1. Taps Prep on the Today card. Reads the objective, the Care Team Strategy, and three Cues in about 40 seconds.
2. Taps "Start", which starts the optional timer, and puts the phone face-down.
3. Reads with the child. The child flips pages, and the parent uses a Cue.
4. Picks up the phone and taps **Losing attention**. Glances at the tips, tries a familiar song, and the phone goes back down. **Climax (UJ-1):** the child settles for a few pages and points at a picture; the parent had a workable next step.
5. Taps **Done**. The Review is pre-filled with 6 minutes elapsed and the Mark; Attention (minutes) starts at 6 from the timer, and the parent lowers it to 4.
6. Picks "model" as the Prompt Level and "OK" for engagement, marks the song tip as helpful, and taps Save.
7. **Resolution:** "Review saved." Today now shows tomorrow's Activity. Logging took 20 seconds.

Failure: the child is tired. The parent taps "Not attempted / child not available" on the Review and sees "That's okay — logged as not today · Undo."
Alternative: the child loses interest in the book, so the parent opens "Pause or change" → "Try a variation" (a picture walk), or skips to a second queued Activity; one Review covers both. Guided mode (P2) keeps each step on screen instead.

### Flow 2: New Goal Period from a paper sheet (a parent, on a phone) (UJ-2)
1. Goals → SLP → "New period", enters the dates → "Start from a document" → Photo.
2. On the masking review, the child's name and the clinic letterhead are covered and listed under "We covered these". The parent checks one more line under "Everything else on the page" and taps "Send 1 page with 3 items covered."
3. The draft review lists 6 Goals. Two fields say "Please check this", and the parent fixes them.
4. Marks each Goal: 3 carried over, 1 revised (5 → 10 minutes), 2 new. Retires one Goal.
5. Taps "Start new period".
6. **Climax:** the Goals tab shows the new period, and the original is kept under "Source document". Tapping the revised Goal shows its Progress view, back to the previous quarter.

Alternative (P1, before import ships): on the New Goal Period screen the parent enters the new sheet by hand: keeps 3 Goals as Carried over, taps Revised on one and changes 5 → 10 minutes in the pre-filled Goal form, retires one, adds 2 with "+ New goal", and taps "Start new period".
Failure: an OT report with broad goals → those Goals are saved as Narrative Goals. Unreadable photo, camera denied, or AI unavailable → Upload, Paste and the Goal form stay open.

### Flow 3: The co-caregiver's weekend session (UJ-3)
1. Accepts the invite on a tablet and gives their own consent.
2. Today shows the early-intervention teacher's prescribed movement Activity, labelled with its Source.
3. Runs it, then completes the Review.
4. **Climax:** the first caregiver opens the Goal detail and sees the Observation in the Progress view, attributed to the co-caregiver.

Failure: the invite has expired, or consent isn't given → the account can't be used, with plain copy and a way to ask for a new invite or read the cards again.

### Flow 4: Before and after the appointment (a parent, on a laptop) (UJ-4)
1. Share → New summary → SLP → current Goal Period (or a date range).
2. The preview shows each Goal's three measures, Observation counts, "limited data" labels, Contexts, and new words. Parent-proposed Goals are listed under "For discussion".
3. Edits a question, taps Share, confirms "This will leave your family," and downloads the PDF.
4. After the appointment: Share → this Summary's "After the appointment." Records "Achieved in some Contexts" for one Goal and marks a parent-proposed Goal as discussed. Adds a Restriction: "no hand-over-hand."
5. **Climax:** next week's Plan and Coach Tips already respect the new Restriction.

Failure: a Goal with under 5 Observations is labelled "limited data"; no device share sheet → PDF download.
