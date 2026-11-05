---
epic: 2
title: App shell and design foundations
status: approved
phase: P1
---

# Epic 2: App shell and design foundations

The app gets its "Playroom" visual identity, its navigation shell, a single status region, and the shared components every feature screen uses. The result is a component gallery and an empty five-destination app that already meets the accessibility floor, so feature epics only assemble parts.

**Done when:**
- The component gallery (`/dev/gallery`, local and test builds only) renders every component in light and dark, at 360px, 768px and 1280px.
- Automated accessibility checks pass: axe, contrast, reflow at 320px and at 200% text, and reduced motion.
- The app installs as a PWA shell, and the five nav destinations open placeholder screens with correct focus and titles.
- The Definition of done in the index is met (clean scan, full test suite passing, release note).

## Requirements covered

- **UX-DRs:**
  - UX-DR1–14 (tokens, theme, type, spacing, radii, flat, icons, focus)
  - UX-DR16–29 (shared controls and surfaces)
  - UX-DR110–124 (interaction primitives and accessibility floor)
  - UX-DR128–129 (breakpoints, install)
  - UX-DR135–137 (voice, tone, copy catalogue)
- **NFRs:** NFR-8 (tone), NFR-9 and NFR-10 (PWA, browsers), NFR-14 (accessibility), NFR-15 (language)
- **Architecture:** AD-18 (UI copy in catalogs), AD-23 (Radix with CSS modules on token variables; service worker precaches the shell only)
- **Not in this epic:**
  - UX-DR15 (image-layer focus) comes in Epic 18.
  - UX-DR130 (push offer) comes in Epic 16.
  - UX-DR131 (iOS import) comes in Epic 18.
  - UX-DR132 (share) comes in Epic 14.
  - Feature components (UX-DR30 onward) come with their feature epics.

## Stories

### Story 2.1: Design tokens, theme and type

As a Caregiver,
I want the app to look calm and readable in light and dark, at my chosen text size,
So that it feels warm and works on any device and setting.

**Acceptance Criteria:**

**Given** `frontend/src/styles/tokens.css`
**When** the app loads
**Then** every DESIGN.md colour token exists as a CSS custom property with its exact light value and a `-dark` twin (UX-DR1, UX-DR2). `mask-cover` is the same in both modes.
**And** the app follows `prefers-color-scheme` by default. A Light / Dark / System choice is stored on the device and applied before first paint, so there is no flash of the wrong theme.
**And** the type scale (display, title, heading, section-label, body, body-sm, cue, label, meta) is defined in rem on the system font stack, with no web-font request (UX-DR8).
**And** the root is `html { font-size: 100% }`. The iOS/iPadOS-only `-apple-system-body` root is applied behind the `@supports` guard, and macOS Safari renders body at 17px at default zoom (UX-DR9).
**And** the spacing, target-size and radius tokens match DESIGN.md (UX-DR10, UX-DR11).
**And** a stylelint rule fails on any `box-shadow` other than `none`, and on any `outline: none` without a replacement (UX-DR12, UX-DR14).
**And** an automated contrast test checks every token pairing listed in DESIGN.md in both modes against WCAG AA (4.5:1 for text, 3:1 for control edges), and fails on any miss (UX-DR6).

### Story 2.2: Domain tints and icons

As a Caregiver,
I want each Goal area to have its own soft colour and a simple object icon, always with its name,
So that I can recognise an Activity's area at a glance without relying on colour.

**Acceptance Criteria:**

**Given** the seven Domain tint families in light and dark (UX-DR3)
**When** `domainTint(domainName)` is called
**Then** it applies the DESIGN.md mapping rule (UX-DR4):
- case-insensitive, whole-word keyword matching
- the longest keyword wins, and ties go to the family higher in the table
- no match returns `domain-other`

**And** unit tests cover at least these cases:
- "social interaction and play" → joint-attention
- "early motor and sensory skills" → motor-imitation
- "oral-motor" → sensory
- an unknown Domain → other

**And** a `DomainTag` component always shows the Domain's text label with its tint. The tint is used only in the allowed places (UX-DR5).
**And** an `IconTile` component renders line icons with a 2.4px stroke in white tiles at 76px, 56px and 36px. The icon set contains only objects: no people, faces, mascots, rings, streaks or badges (UX-DR13).

### Story 2.3: App shell, navigation and focus management

As a Caregiver,
I want a simple shell with five clear places and predictable focus,
So that I can reach anything quickly by touch, keyboard or screen reader.

**Acceptance Criteria:**

**Given** the app shell
**When** it renders below 600px
**Then** a bottom nav shows Today · Goals · Activities · Share · Family, each with a line icon and a label. The active item is indigo, weight 800, with the 32×4px action bar, and has `aria-current="page"` (UX-DR27).

**When** it renders at 600px or wider
**Then** the same destinations appear as a left rail with a vertical bar indicator. Content is centred at 720px with the breakpoint margins (UX-DR128).

**And** each destination is a placeholder screen with an `<h1>` and copy from the catalog.
**And** every destination is one tap or click away from anywhere (UX-DR114).
**And** a "Skip to content" link comes first, followed by `<nav>` and `<main>` landmarks (UX-DR118).

**Given** any route change
**When** the new screen renders
**Then** `document.title` becomes "<Screen>: <subject> · LittleSteps", and focus moves to the `<h1>` (UX-DR117).
**And** one `role="status"` region lives in the shell, outside routed content, present and empty from first load. A `useStatus()` hook is the only way to announce. For navigating actions the order is: route → title → focus the `<h1>` → message on the next frame (UX-DR116).
**And** browser and OS Back works on every screen and restores scroll and focus position (UX-DR112).
**And** orientation is never locked (UX-DR124).

### Story 2.4: Core controls

As a Caregiver,
I want buttons, fields, chips and steppers that are large, clear and consistent,
So that every form is quick to use with one hand.

**Acceptance Criteria:**

**Given** the controls library in `frontend/src/ui/`
**When** each control is rendered in the gallery
**Then** it matches its spec:
- `Button` in primary, secondary, quiet and danger variants: pills at least 52px tall (quiet: 48px) in label type (UX-DR16)
- disabled controls keep their shape, use `aria-disabled="true"`, stay focusable, and are never natively `disabled` when they can hold focus (UX-DR17)
- `TextField` with a visible `<label for>`, error text linked by `aria-describedby`, and dictation accepted (UX-DR18)
- `ChoiceChips` as native radios or checkboxes in a fieldset with a legend. Selected chips get the wash, the action border, the check glyph and weight 800, and arrow keys move a single selection (UX-DR19)
- `Stepper` in paired ("Trials": Succeeded / Tried) and single modes:
  - −/+ named by the field, `inputmode="numeric"`, clamped at 0
  - "−" aria-disabled at 0, with "0, minimum" announced
  - Succeeded can't exceed Tried, shown inline as "Can't be more than 5 tried"
  - no extra live region (UX-DR20)
- `DisclosureRow` as `<button aria-expanded aria-controls>`, with a dashed edge, or solid for the pre-filled variant (UX-DR21)

**And** every control shows the 2px focus ring with a 2px offset under `:focus-visible`, also in forced-colors mode (UX-DR14).
**And** every tap target is at least 48px, and no control depends on long-press, swipe or drag (UX-DR110).
**And** component tests cover the keyboard behaviour, the ARIA attributes and the stepper's edge cases (the minimum, and Succeeded exceeding Tried).

### Story 2.5: Surfaces, feedback and labels

As a Caregiver,
I want consistent cards, sheets, status messages, notices and labels,
So that I always know what happened, where things came from, and how to get back.

**Acceptance Criteria:**

**Given** the surfaces library
**When** each component is rendered in the gallery
**Then** it matches its spec:
- `Card`, `BlockCard`, `HeroBand` and `TipBlock`, flat with 1px edges and their radii (UX-DR29)
- `Sheet` and `Dialog` built on Radix (UX-DR28):
  - On phones: full width, xl top corners and a grabber.
  - From 600px: centred, at most 560px wide.
  - `role="dialog" aria-modal="true" aria-labelledby`. Focus goes to the heading on open, stays trapped inside, and returns to the invoker on close. The page behind is inert.
  - Closes on Esc, scrim tap, swipe down or Close, and scrolls internally within `calc(100dvh - 24px)`.
  - Only one modal level ever opens (UX-DR113).
- `StatusLine` under the `<h1>`, with an optional quiet Undo (UX-DR25):
  - It survives the navigation its own action caused and clears on the next user action or navigation, never on a timer.
  - It is announced through the shell status region.
- `Banner` with at most one action and an optional "Dismiss notice: <first words>". Banners stack newest first inside a "Notices" region and never block the screen (UX-DR26).
- `SourceBadge` (Care Team, or parent-proposed with Review Status), `AiLabel` ("AI-suggested") and `CheckTag` ("Please check this"), each always carrying text (UX-DR22–24)

**And** with `prefers-reduced-motion: reduce`, sheets appear without sliding or fading, and pressed states change instantly (UX-DR122).
**And** an `Undo` pattern helper supports one-tap actions whose Undo lasts until the next action (UX-DR111). Its use is tested in the feature epics.
**And** component tests cover focus trap and return, Esc, the status line clearing rules, and banner order.

### Story 2.6: Copy catalogue and tone checks

As a Caregiver,
I want every message to sound warm, short and never judging,
So that the app supports me instead of making me feel behind.

**Acceptance Criteria:**

**Given** the frontend message catalog (AD-18)
**When** a component needs text
**Then** it reads the text from the catalog by key. The catalog already holds every exact string the UX spines name for status lines, banners, empty states, errors, confirms and security notices, so later stories assert on keys (UX-DR137).
**And** a tone check runs in CI and fails if any catalog string contains a banned phrase: "Missed", "Session failed", "Insufficient data", "No progress", "Network error", "Error 500", "Something went wrong", or score-style praise such as "Great job" or "/10" (UX-DR135, UX-DR136).
**And** the catalog includes the standard labels "AI-suggested · check with your therapist if unsure." and "Proposed by you · not yet discussed with the care team." (UX-DR136).
**And** a checklist of banned UI patterns (streaks, scores, badges, confetti, countdowns, unread counters, autoplay, nags, an AI chat, an on-screen coach during play) is added to `docs/ui-review-checklist.md`, which every feature epic's release note references (UX-DR115).

### Story 2.7: Responsive reflow and accessibility test harness

As a Caregiver who uses large text, a screen reader or a keyboard,
I want every screen to reflow and remain fully operable,
So that the app works however I set up my device.

**Acceptance Criteria:**

**Given** Playwright with axe in `frontend/e2e/`, run in CI
**When** the gallery and every shell screen are tested
**Then** axe reports no serious or critical violations in light or dark mode (UX-DR119).
**And** at 320 CSS px wide and at 200% text there is no horizontal scroll and no truncated label (UX-DR120).
**And** the reflow rules hold (UX-DR121):
- two-button footers sit side by side only while the container is 400px or wider and text scale is 130% or less, and otherwise stack with the primary at the bottom
- labels wrap
- under 500px tall, pinned footers and the bottom nav unpin
- `scroll-padding-bottom` matches the pinned footer height
- chips, status line and steppers use min-height, never fixed height

**And** tests confirm no state is shown by colour alone: selection, source, AI, active nav and status each carry text or a shape (UX-DR123).
**And** a manual screen-reader pass (VoiceOver on iOS and macOS, TalkBack, NVDA) over the gallery is recorded in `docs/a11y-passes.md`. Each later feature epic adds its screens to this file.

### Story 2.8: PWA shell and install offer

As a Caregiver,
I want to add LittleSteps to my home screen when the time is right, without being nagged,
So that it opens like an app while still working fully in the browser.

**Acceptance Criteria:**

**Given** vite-plugin-pwa
**When** the app is built
**Then** it has a web app manifest (name, short name, icons, theme colours from tokens, `display: standalone`), and its service worker precaches the app shell only, never API responses (AD-23).
**And** a new version is picked up on the next open without losing any in-progress draft. Drafts arrive in later epics, and this story provides the update hook.

**Given** the install offer component
**When** a feature calls `offerInstall()` (first called after the first saved Review in Epic 9)
**Then** it uses the browser's own install prompt where one is available, or short instructions where there isn't (iOS Safari, Firefox), based on feature detection, never on browser name (NFR-10, UX-DR129).
**And** it is never shown on first open, never shown again after "Not now" unless the Caregiver opens Settings, and every feature works uninstalled.
**And** tests cover the prompt path, the instructions path and the "Not now" path.
