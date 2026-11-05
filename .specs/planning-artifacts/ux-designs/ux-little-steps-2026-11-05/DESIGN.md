---
name: LittleSteps
description: Home therapy companion for caregivers of young children. "Playroom" direction, like a tidy playroom shelf. Confident soft colour blocks, chunky rounded shapes, one deep indigo for action. Warm and natural, never clinical. No streaks, no scores, no guilt.
status: draft
created: 2026-11-05
updated: 2026-11-05
sources:
  - ../../prds/prd-little-steps-2026-11-05/prd.md
  - ../../prds/prd-little-steps-2026-11-05/addendum.md
colors:
  # ---- Light ----
  floor: '#FAF7F2'
  card: '#FFFFFF'
  ink: '#23252B'
  ink-soft: '#555A66'
  ink-disabled: '#A4A8B3'
  outline: '#D9DCE6'
  outline-strong: '#7E8496'
  selected: '#E9ECF7'
  tile-shadow: '#C9CEDD'
  action: '#33457F'
  action-foreground: '#FFFFFF'
  block: '#3A4D8F'
  block-foreground: '#FFFFFF'
  block-shadow: '#26336A'
  # Domain tints: one per Goal Domain, always paired with the Domain label
  domain-joint-attention: '#DDE5F8'
  domain-communication: '#FCE3CC'
  domain-motor-imitation: '#D6EEDC'
  domain-play: '#F7DCE6'
  domain-regulation: '#E8DDF5'
  domain-sensory: '#D3ECEC'
  care-team: '#3D5A80'
  care-team-soft: '#E4EBF4'
  parent-proposed: '#7A5C1E'
  parent-proposed-soft: '#F6ECD5'
  danger: '#A33A2F'
  focus-ring: '#33457F'
  # ---- Dark ----
  floor-dark: '#17191F'
  card-dark: '#22252D'
  ink-dark: '#EEF0F5'
  ink-soft-dark: '#AEB3C0'
  ink-disabled-dark: '#5F6472'
  outline-dark: '#353A47'
  outline-strong-dark: '#767C8C'
  selected-dark: '#2C3350'
  tile-shadow-dark: '#11131A'
  action-dark: '#A9B8EC'
  action-foreground-dark: '#141A33'
  block-dark: '#8FA2E3'
  block-foreground-dark: '#141A33'
  block-shadow-dark: '#5D6DAE'
  domain-joint-attention-dark: '#273150'
  domain-communication-dark: '#3E2C1E'
  domain-motor-imitation-dark: '#1F3628'
  domain-play-dark: '#3A2430'
  domain-regulation-dark: '#30284A'
  domain-sensory-dark: '#1D3638'
  care-team-dark: '#9DB7DA'
  care-team-soft-dark: '#243142'
  parent-proposed-dark: '#E0C27F'
  parent-proposed-soft-dark: '#3A3020'
  danger-dark: '#E58B80'
  focus-ring-dark: '#A9B8EC'
typography:
  # System font stack: no web-font download, works offline and in every browser.
  # Heavier weights carry the Playroom personality. All sizes are in rem so text scaling is honoured.
  display:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    fontSize: 2.25rem
    fontWeight: '800'
    lineHeight: '1.08'
    letterSpacing: -0.02em
  title:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    fontSize: 1.5rem
    fontWeight: '800'
    lineHeight: '1.15'
    letterSpacing: -0.01em
  heading:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    fontSize: 1.25rem
    fontWeight: '800'
    lineHeight: '1.25'
  section-label:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    fontSize: 0.8125rem
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: 0.04em
  body:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    fontSize: 1.0625rem
    fontWeight: '400'
    lineHeight: '1.55'
  body-sm:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.55'
  cue:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    fontSize: 1.1875rem
    fontWeight: '600'
    lineHeight: '1.35'
  label:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    fontSize: 0.9375rem
    fontWeight: '700'
    lineHeight: '1.3'
  meta:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 12px
  md: 16px
  lg: 20px
  xl: 28px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
  '7': 48px
  gutter: 16px
  margin-mobile: 16px
  margin-tablet: 24px
  margin-desktop: 32px
  content-max: 720px
  target-min: 48px
  button-height: 52px
  mark-target: 72px
  outline-width: 2px
components:
  button-primary:
    background: '{colors.action}'
    foreground: '{colors.action-foreground}'
    radius: '{rounded.full}'
    minHeight: '{spacing.button-height}'
    typography: '{typography.label}'
  button-secondary:
    background: '{colors.card}'
    foreground: '{colors.action}'
    border: '{spacing.outline-width} solid {colors.action}'
    radius: '{rounded.full}'
    minHeight: '{spacing.button-height}'
    typography: '{typography.label}'
  button-quiet:
    background: 'transparent'
    foreground: '{colors.ink-soft}'
    minHeight: '{spacing.target-min}'
    typography: '{typography.label}'
  card:
    background: '{colors.card}'
    border: '{spacing.outline-width} solid {colors.outline}'
    radius: '{rounded.xl}'
  block-card:
    background: '{colors.card}'
    border: '{spacing.outline-width} solid {colors.outline}'
    radius: '{rounded.lg}'
    padding: '14px'
  hero-band:
    background: 'the Activity Domain tint ({colors.domain-*})'
    radius: '{rounded.xl}'
    padding: '16px 20px 22px'
  icon-tile:
    background: '{colors.card}'
    radius: '{rounded.lg}'
    size: '76px (hero) / 56px (Today band) / 36px (plan row)'
    shadow: '0 3px 0 {colors.tile-shadow}'
    note: 'Plan-row squares (36px) are tinted with the Domain colour and have no shadow'
  domain-chip:
    background: '{colors.card}'
    foreground: '{colors.action}'
    radius: '{rounded.full}'
    typography: '{typography.section-label}'
  cue-tile:
    background: 'the Activity Domain tint ({colors.domain-*})'
    radius: '{rounded.lg}'
    typography: '{typography.cue}'
  cue-number:
    background: '{colors.block}'
    foreground: '{colors.block-foreground}'
    radius: '{rounded.md}'
    size: '44px'
    shadow: '0 3px 0 {colors.block-shadow}'
  mark-button:
    background: '{colors.card}'
    foreground: '{colors.ink}'
    border: '{spacing.outline-width} solid {colors.action}'
    radius: '{rounded.lg}'
    minHeight: '{spacing.mark-target}'
    shadow: '0 3px 0 {colors.block-shadow}'
    typography: '{typography.heading}'
  coach-tip-sheet:
    background: '{colors.card}'
    radius: '{rounded.xl} {rounded.xl} 0 0'
    padding: '{spacing.5}'
  choice-chip:
    background: '{colors.card}'
    foreground: '{colors.ink}'
    border: '{spacing.outline-width} solid {colors.outline-strong}'
    selected-background: '{colors.selected}'
    selected-border: '{spacing.outline-width} solid {colors.action}'
    selected-indicator: 'check glyph before the label, plus bold label'
    radius: '{rounded.full}'
    minHeight: '{spacing.target-min}'
  stepper:
    background: '{colors.card}'
    border: '{spacing.outline-width} solid {colors.outline-strong}'
    radius: '{rounded.md}'
    minHeight: '{spacing.target-min}'
  plan-row:
    background: '{colors.card}'
    border: '{spacing.outline-width} solid {colors.outline}'
    radius: '18px'
  source-badge-care-team:
    background: '{colors.care-team-soft}'
    foreground: '{colors.care-team}'
    radius: '{rounded.full}'
    typography: '{typography.meta}'
  source-badge-parent-proposed:
    background: '{colors.parent-proposed-soft}'
    foreground: '{colors.parent-proposed}'
    radius: '{rounded.full}'
    typography: '{typography.meta}'
  ai-label:
    background: '{colors.floor}'
    foreground: '{colors.ink-soft}'
    border: '1px solid {colors.outline}'
    radius: '{rounded.full}'
    typography: '{typography.meta}'
  status-line:
    background: '{colors.card}'
    border: '{spacing.outline-width} solid {colors.outline}'
    foreground: '{colors.ink}'
    radius: '{rounded.md}'
  bottom-nav:
    background: '{colors.card}'
    border-top: '{spacing.outline-width} solid {colors.outline}'
    active-foreground: '{colors.action}'
    inactive-foreground: '{colors.ink-soft}'
---

## Brand & Style

The product owner chose the **Playroom** direction. LittleSteps should feel like a tidy playroom shelf: soft colour blocks, chunky rounded shapes like wooden toys, and everything in its place. It is confident and cheerful without being loud, and organised without being clinical. The product promise, *"less time wondering what to do, more confidence supporting every little step forward"*, shapes the posture: a clear structure lets a tired caregiver find the next step at a glance.

Four things carry the personality:
- **Colour blocks.** Each Goal Domain owns one soft tint.
- **Heavy, friendly type.** Activity names are set at 800 weight.
- **Block shapes.** Generous corners, 2px outlines, and a small solid "block" shadow under tiles and buttons that can be pressed.
- **Simple object icons.** A book, blocks, a ball, a leaf, each in a white tile.

The design never uses mascots, drawings or photos of children, confetti, progress rings, streaks, or achievement badges.

> **Visual references:** [Playroom direction](mockups/direction-playroom.html) and key screens: [Today](mockups/key-today.html), [Prep](mockups/key-prep.html), [Practice](mockups/key-practice.html), [Review](mockups/key-review.html), or [all four side by side](mockups/key-index.html). This spine wins on any conflict. For example, the mocks show selected chips filled with periwinkle, but the spec is the neutral Selected wash plus a check glyph.

## Colors

One colour is reserved for action. A family of soft Domain tints carries the colour, and everything else is neutral.

- **Floor (#FAF7F2)** is the canvas, a warm off-white. **Card (#FFFFFF)** surfaces sit on it with a 2px **Outline** (#D9DCE6). Interactive controls such as chips, steppers, and inputs use **Outline-strong** (#7E8496), which gives at least 3:1 against card and floor so their edges are visible (WCAG 1.4.11).
- **Selected (#E9ECF7)** is a neutral indigo wash for selected chips. It belongs to the action colour family, not to any Domain, and is always paired with a check glyph.
- **Ink (#23252B)** is used for all primary text. **Ink-soft (#555A66)** is used for supporting text and passes AA on every tint.
- **Indigo action (#33457F)** is the only strong colour on any screen. It is used for primary buttons, secondary-button outlines, the active tab, the focus ring, and links. **Block indigo (#3A4D8F)**, with a block shadow (#26336A), fills the Cue numbers.
- **Domain tints.** Each Goal Domain owns one tint, which colours that Domain's hero band, Today card band, Cue tiles, and Plan-row square:

  | Domain | Tint |
  |---|---|
  | Joint attention and social | periwinkle #DDE5F8 |
  | Speech and communication | apricot #FCE3CC |
  | Motor and imitation | mint #D6EEDC |
  | Play | rose #F7DCE6 |
  | Emotional regulation | lilac #E8DDF5 `[ASSUMPTION]` |
  | Sensory | teal #D3ECEC `[ASSUMPTION]` |

  A tint always appears together with the Domain's text label. Colour is never the only signal.
- **Source colours.** The Care Team badge is blue on blue-soft (#3D5A80 on #E4EBF4). The parent-proposed badge is honey on honey-soft (#7A5C1E on #F6ECD5). Both always carry text.
- **Danger (#A33A2F)** is used only for destructive confirmations. It is never used for "missed", "not attempted", or low data.
- **Dark mode.** Every token has a `-dark` twin:
  - a deep floor (#17191F) and cards (#22252D)
  - a light indigo action (#A9B8EC) with dark text
  - deepened Domain tints

  Dark mode follows the device setting, and the user can override it manually.
- **Contrast.** Every text pairing passes WCAG AA in both light and dark mode. The lowest is 5.29:1, for ink-soft on lilac and for parent-proposed on honey-soft.

Avoid traffic-light status colours, gradients, Domain tints used outside their Domain, and more than one strong colour on a screen.

## Typography

The app uses the system font stack: SF on Apple devices, Roboto on Android, and Segoe on Windows. That means no font downloads, offline support, and support in every browser. The Playroom personality comes from **heavy weights and size contrast**, not from a custom font.

| Role | Size / weight | Use |
|---|---|---|
| `display` | 36px / 800, tight | The Activity name on the Prep card |
| `title` | 24px / 800 | Screen titles, the Activity name on the Today card, and the Today greeting |
| `heading` | 20px / 800 | Section heads (e.g. "This week") and Mark labels |
| `section-label` | 13px / 700, letter-spaced, never all-caps | "You'll need", "Care Team Strategy", "Take these with you" |
| `body` | 17px / 400 | General reading text, Coach Tips, and the nudge |
| `body-sm` | 14px / 400, ink-soft | Supporting text under a big name: the Activity description, materials, and Strategy text |
| `cue` | 19px / 600 | Cues, which stay large because the caregiver carries them into the Activity |
| `label` | 15px / 700 | Buttons and chips |
| `meta` | 13px / 400 | Dates, badges, AI labels, and data notes |

The jump from `display` to `body-sm` makes the Activity name read first.

All sizes are in rem, and layouts reflow at 200% text size.

## Layout & Spacing

The layout is block-structured, with medium density. The spacing scale is 4 / 8 / 12 / 16 / 24 / 32 / 48. Cards in the same group sit 8–12px apart, and groups sit 24–28px apart.

- **Phone:** a single column with 16px margins. Primary actions sit in the bottom third, and the Prep footer is pinned.
- **Tablet:** content is centred at 720px, with a left rail.
- **Laptop:** a left rail, plus two columns for import and the Summary builder.
- **Touch targets:** at least 48px. Buttons are 52px and Mark buttons are 72px.

## Elevation & Depth

Depth comes from a shelf of blocks, not from floating layers.
- Cards are flat, with 2px outlines.
- Tiles and buttons that can be pressed get a small solid **block shadow**: 0 3px 0, in a darker shade of their own colour. This makes them feel like objects you can pick up.
- Only the Coach Tip sheet and dialogs float, with a soft shadow over a scrim.

Cards never get blurred drop shadows.

## Shapes

| Radius | Used for |
|---|---|
| `xl` (28px) | Cards, hero bands, and sheets |
| `lg` (20px) | Block cards, Cue tiles, Mark buttons, and icon tiles |
| `md` (16px) | Steppers and Cue numbers |
| `full` | Buttons, chips, and badges |

Corners are generous everywhere, with no sharp edges and no perfect circles for surfaces. Icons are simple line drawings of objects with a 2.4px stroke, never of people.

## Components

- **Today screen.**
  - The greeting is in `title`, and the nudge is in `body` with ink-soft.
  - **Today card:** a white card topped by a Domain-tinted band. The band holds a 56px icon tile and the Activity name in `title`. Below the band come the meta line, the primary "Prep" button, and a quiet "Not this one".
  - **"Log a moment"** is a secondary button.
  - **"This week"** is a list of Plan rows. Each row has the day, a 36px tinted Domain square with its icon, the Activity name, and the Domain label in `meta`. Once the Activity has a Review, the row shows "Reviewed" in ink-soft.
- **Prep card.**
  - **Hero band** in the Domain's tint. It holds a quiet back link, a 76px white icon tile with a block shadow, a white Domain chip, the Activity name in `display`, and the description in `body-sm`.
  - **Materials** form a 2-column grid of block cards, each with an icon and `body-sm` text.
  - **Care Team Strategy** is a block card with a Care Team badge.
  - **"Take these with you"** shows 2–3 Cue tiles in the Domain tint, each with a numbered indigo block.
  - **"If it gets hard"** is a row with a dashed outline that expands.
  - **Footer** (pinned): "Start (optional timer)" as the secondary button and "Log review" as the primary button.
- **Practice screen.** Nearly empty, on the floor colour. A quiet timer in ink-soft sits at the top and is never shown as a target. The four Mark buttons fill the lower half in a 2×2 grid. They are white block buttons with an indigo outline and a block shadow. `[ASSUMPTION]` A "Done" primary button closes the screen.
- **Coach Tip sheet.** A white sheet with `xl` top corners, a grabber, and the heading "A few ideas to try". It shows up to 3 tips in `body`, each with a Helpful toggle chip.
- **Review form.**
  - Choice chips cover Prompt Level, who modelled, Where, engagement, and "Which cue or tip helped?" (multi-select). A selected chip has the neutral Selected wash, an indigo outline, a check glyph, and a bold label. Selection never depends on colour alone.
  - Steppers capture trials or counts, and attention minutes.
  - Save is pinned at the bottom.
  - "Not attempted / child not available" is a quiet button at the top.
- **Badges and labels.**
  - Source badges: blue for Care Team and honey for parent-proposed, always with text.
  - The AI label is a neutral outlined pill reading "AI-suggested".
  - Data notes are `meta` text in ink-soft.
- **Status line.** A white outlined pill, e.g. "Review saved.", with no icon and no toast animation.
- **Bottom nav (phone) / left rail.** Five destinations, each with a line icon and a label. The active destination is indigo.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Give each Goal Domain its tint, paired with its label | Use Domain tints for status, grading, or decoration |
| Keep one strong colour (indigo) per screen, for the action | Add a second accent colour or a gradient |
| Use heavy weights and size contrast for hierarchy (`display` → `body-sm`) | Set supporting text at the same size as names |
| Use block shadows only on things you can press | Put blurred drop shadows on cards |
| Draw simple line icons of objects | Draw people, children, faces, or mascots |
| Keep the Practice screen nearly empty | Show countdowns, target times, progress rings, streaks, or badges |
