---
name: LittleSteps
description: Home therapy companion for caregivers of young children. "Playroom" direction, flat. Like a tidy playroom shelf, with confident soft colour blocks, generous rounded shapes, and one deep indigo for action. Warm and natural, never clinical. No streaks, no scores, no guilt.
status: final
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
  pressed: '#DDE1EC'
  tip-surface: '#F4F2EE'
  scrim: '#17191F80'
  action: '#33457F'
  action-foreground: '#FFFFFF'
  block: '#3A4D8F'
  block-foreground: '#FFFFFF'
  # Domain tints: one per Domain family, always paired with the Domain label (mapping rule in Colors)
  domain-joint-attention: '#DDE5F8'
  domain-communication: '#FCE3CC'
  domain-motor-imitation: '#D6EEDC'
  domain-play: '#F7DCE6'
  domain-regulation: '#E8DDF5'
  domain-sensory: '#D3ECEC'
  domain-other: '#ECE8E1'
  care-team: '#3D5A80'
  care-team-soft: '#E4EBF4'
  parent-proposed: '#7A5C1E'
  parent-proposed-soft: '#F6ECD5'
  danger: '#A33A2F'
  danger-foreground: '#FFFFFF'
  attention: '#8A5A00'
  attention-soft: '#FBF0DC'
  mask-cover: '#23252B'
  mask-cover-foreground: '#FFFFFF'
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
  pressed-dark: '#353B4F'
  tip-surface-dark: '#2A2D36'
  scrim-dark: '#00000099'
  action-dark: '#A9B8EC'
  action-foreground-dark: '#141A33'
  block-dark: '#8FA2E3'
  block-foreground-dark: '#141A33'
  domain-joint-attention-dark: '#273150'
  domain-communication-dark: '#3E2C1E'
  domain-motor-imitation-dark: '#1F3628'
  domain-play-dark: '#3A2430'
  domain-regulation-dark: '#30284A'
  domain-sensory-dark: '#1D3638'
  domain-other-dark: '#2E2C29'
  care-team-dark: '#9DB7DA'
  care-team-soft-dark: '#243142'
  parent-proposed-dark: '#E0C27F'
  parent-proposed-soft-dark: '#3A3020'
  danger-dark: '#E58B80'
  danger-foreground-dark: '#17191F'
  attention-dark: '#E7B865'
  attention-soft-dark: '#3B301A'
  mask-cover-dark: '#23252B'
  mask-cover-foreground-dark: '#FFFFFF'
  focus-ring-dark: '#A9B8EC'
typography:
  # System font stack: no web-font download, works offline and in every browser.
  # Heavier weights carry the Playroom personality. All sizes are in rem from a root that is never set in px
  # (100%, or -apple-system-body on iOS/iPadOS; see Typography) so browser and OS text size are honoured.
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
  outline-width: 1px
  focus-width: 2px
  focus-offset: 2px
  nav-indicator-width: 32px
  nav-indicator-height: 4px
components:
  # Domain binding rule: '{colors.domain-<family>}' means the tint of the Activity's Domain family,
  # resolved with the Domain → tint table in Colors (unmapped → domain-other). Dark mode uses the -dark twin.
  focus-indicator:
    outline: '{spacing.focus-width} solid {colors.focus-ring}'
    outline-offset: '{spacing.focus-offset}'
    note: ':focus-visible on every control; a real CSS outline (survives forced-colors), never outline:none without this'
  focus-indicator-image:
    outline: '{spacing.focus-width} solid {colors.mask-cover}'
    outer-ring: '{spacing.focus-width} solid {colors.mask-cover-foreground} outside the inner ring'
    note: 'Document image layer only (masking review: lines, covers, keyboard box), same in both modes'
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
  button-danger:
    background: '{colors.danger}'
    foreground: '{colors.danger-foreground}'
    radius: '{rounded.full}'
    minHeight: '{spacing.button-height}'
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
    background: '{colors.domain-<family>}'
    radius: '{rounded.xl}'
    padding: '16px 20px 22px'
  icon-tile:
    background: '{colors.card}'
    radius: '{rounded.lg}'
    size: '76px (hero) / 56px (Today band) / 36px (plan row)'
    shadow: 'none'
    note: 'Plan-row squares (36px) are tinted with the Domain colour, use {rounded.sm} (12px) so they never read as circles, and have no shadow'
  domain-chip:
    background: '{colors.card}'
    foreground: '{colors.action}'
    radius: '{rounded.full}'
    typography: '{typography.section-label}'
  cue-tile:
    background: '{colors.domain-<family>}'
    radius: '{rounded.lg}'
    typography: '{typography.cue}'
  cue-number:
    background: '{colors.block}'
    foreground: '{colors.block-foreground}'
    radius: '{rounded.md}'
    size: '44px'
    shadow: 'none'
  mark-button:
    background: '{colors.card}'
    foreground: '{colors.ink}'
    border: '{spacing.outline-width} solid {colors.outline-strong}'
    pressed-background: '{colors.pressed}'
    radius: '{rounded.lg}'
    minHeight: '{spacing.mark-target}'
    shadow: 'none'
    typography: '{typography.heading}'
  coach-tip-sheet:
    background: '{colors.card}'
    scrim: '{colors.scrim}'
    border-dark: '{spacing.outline-width} solid {colors.outline-strong-dark} (top and sides, dark mode only)'
    radius: '{rounded.xl} {rounded.xl} 0 0'
    padding: '{spacing.5}'
  tip-block:
    background: '{colors.tip-surface}'
    foreground: '{colors.ink}'
    border: 'none'
    radius: '{rounded.lg}'
  sheet:
    background: '{colors.card}'
    scrim: '{colors.scrim}'
    border-dark: '{spacing.outline-width} solid {colors.outline-strong-dark} (top and sides, dark mode only)'
    radius: '{rounded.xl} {rounded.xl} 0 0 (phone) / {rounded.xl} (centred, tablet and laptop)'
    padding: '{spacing.5}'
    note: 'Shared by Log a moment, Practice options, Confirm-to-share and dialogs'
  choice-chip:
    background: '{colors.card}'
    foreground: '{colors.ink}'
    border: '{spacing.outline-width} solid {colors.outline-strong}'
    selected-background: '{colors.selected}'
    selected-border: '{spacing.outline-width} solid {colors.action}'
    selected-indicator: 'check glyph before the label (mandatory), plus bold label'
    labelWeight: '600 at rest, 800 when selected'
    radius: '{rounded.full}'
    minHeight: '{spacing.target-min}'
  helpful-toggle:
    note: 'A choice-chip; aria-pressed="true" uses the selected styling and check glyph. The pressed token is only the momentary touch fill'
  favourite-toggle:
    foreground: '{colors.action}'
    on: 'filled heart + visible text "Favourite ✓" in {typography.label}'
    off: 'outline heart + "Favourite"'
    minHeight: '{spacing.target-min}'
  stepper:
    background: '{colors.card}'
    border: '{spacing.outline-width} solid {colors.outline-strong}'
    dividers: '{spacing.outline-width} solid {colors.outline-strong}'
    radius: '{rounded.md}'
    minHeight: '{spacing.target-min}'
  text-field:
    background: '{colors.card}'
    foreground: '{colors.ink}'
    border: '{spacing.outline-width} solid {colors.outline-strong}'
    radius: '{rounded.md}'
    minHeight: '{spacing.target-min}'
    typography: '{typography.body}'
    label: 'visible {typography.label} above the field; placeholder is never the label'
  plan-row:
    background: '{colors.card}'
    border: '{spacing.outline-width} solid {colors.outline-strong}'
    next-border: '{spacing.outline-width} solid {colors.action}'
    next-tag: '"Next" in {typography.meta}, {colors.ink}'
    radius: '{rounded.lg}'
    trailing: 'chevron in {colors.ink-soft}'
  disclosure-row:
    background: '{colors.card}'
    border: '{spacing.outline-width} dashed {colors.outline-strong}'
    radius: '{rounded.lg}'
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
    border: '{spacing.outline-width} solid {colors.outline}'
    radius: '{rounded.full}'
    typography: '{typography.meta}'
  check-tag:
    background: '{colors.attention-soft}'
    foreground: '{colors.ink}'
    border: '{spacing.outline-width} solid {colors.attention}'
    radius: '{rounded.sm}'
    typography: '{typography.meta}'
    note: 'Uncertain-field highlight: text "Please check this" + info glyph + attention border on the field'
  mask-cover:
    background: '{colors.mask-cover}'
    foreground: '{colors.mask-cover-foreground}'
    radius: '{rounded.sm}'
    label: '"Covered" in {typography.meta}'
  chart:
    series: '{colors.action}'
    earlier-period-series: '{colors.ink-soft}, hollow markers'
    gridlines: '{spacing.outline-width} solid {colors.outline}'
    axis-labels: '{typography.meta}, {colors.ink-soft}'
    note: 'One series per chart; no target lines, no traffic-light colours, no percentages, never Domain tints'
  status-line:
    background: '{colors.card}'
    border: '{spacing.outline-width} solid {colors.outline}'
    foreground: '{colors.ink}'
    radius: '{rounded.md}'
    typography: '{typography.body-sm}'
    action: 'optional button-quiet "Undo" at the end'
  banner:
    background: '{colors.card}'
    border: '{spacing.outline-width} solid {colors.outline-strong}'
    foreground: '{colors.ink}'
    radius: '{rounded.md}'
    typography: '{typography.body-sm}'
    note: 'Offline line, deletion pending, membership and deletion security notices'
  summary-document:
    page: 'A4 / US Letter portrait, 18mm margins, white, single column'
    foreground: '{colors.ink}'
    rules: '{spacing.outline-width} solid {colors.outline-strong}'
    note: 'Print-safe: no fills carry meaning, no Domain tints; badges and labels are outlined text pills'
  bottom-nav:
    background: '{colors.card}'
    border-top: '{spacing.outline-width} solid {colors.outline}'
    active-foreground: '{colors.action}'
    active-weight: '800'
    active-indicator: '{spacing.nav-indicator-width} x {spacing.nav-indicator-height} {colors.action} bar, {rounded.full}, directly above the icon'
    inactive-foreground: '{colors.ink-soft}'
    inactive-weight: '600'
    note: 'Same indicator on the left rail (vertical bar at the leading edge)'
---

## Brand & Style

The product owner chose the **Playroom** direction. LittleSteps should feel like a tidy playroom shelf: soft colour blocks, chunky rounded shapes like wooden toys, and everything in its place. It is confident and cheerful without being loud, and organised without being clinical. The product promise, *"less time wondering what to do, more confidence supporting every little step forward"*, shapes the posture: a clear structure lets a tired caregiver find the next step at a glance.

Four things carry the personality:
- **Colour blocks.** Each Domain family owns one soft tint.
- **Heavy, friendly type.** Activity names are set at 800 weight.
- **Flat block shapes.** Generous corners and flat fills, with no shadows and only hairline outlines where an edge is needed.
- **Simple object icons.** A book, blocks, a ball, a leaf, each in a white tile.

The design never uses mascots, drawings or photos of children, confetti, progress rings, streaks, or achievement badges.

> **Visual references:** [Playroom direction](mockups/direction-playroom.html) and key screens: [Today](mockups/key-today.html), [Prep](mockups/key-prep.html), [Practice](mockups/key-practice.html), [Review](mockups/key-review.html), or [all four side by side](mockups/key-index.html). Mocks illustrate composition only; where a mock and this spine differ in any token, state or label, this spine wins. Mock header comments are historical notes, not spec.

## Colors

One colour is reserved for action, a family of soft Domain tints carries the rest of the colour, and everything else is neutral.

- **Floor (#FAF7F2)** is the canvas, a warm off-white. **Card (#FFFFFF)** surfaces sit on it with a 1px **Outline** (#D9DCE6), which is decorative only. Anything interactive (chips, steppers, text fields, Mark buttons, Plan rows, the "If it gets hard" row) uses **Outline-strong** (#7E8496): 3.73:1 on card and 3.49:1 on floor; dark 3.67:1 and 4.21:1 (WCAG 1.4.11).
- **Selected (#E9ECF7)** is a neutral indigo wash used **only for chosen states** (selected chips, a pressed Helpful toggle), always with a check glyph. **Pressed (#DDE1EC / dark #353B4F)** is the brief fill a control takes while pressed; it never means "chosen". Ink on pressed is 11.71:1 (dark 9.75:1).
- **Ink (#23252B)** is used for all primary text. **Ink-soft (#555A66)** is used for supporting text and passes AA on every tint. **Ink-disabled** is for disabled controls only (they stay focusable; see EXPERIENCE › Accessibility Floor), never for placeholders, hints or "Reviewed".
- **Indigo action (#33457F)** is the only strong colour on any screen. It is used for primary buttons, secondary-button outlines, the active nav bar, the focus ring, chart series, and links. **Block indigo (#3A4D8F)** fills the Cue numbers.
- **Domain tints.** A Domain is free text (PRD §3), so each Domain is mapped to one of seven tint families. The family tint fills that Domain's hero band, Today card band, Cue tiles and Plan-row square, and is what `{colors.domain-<family>}` resolves to in the component tokens:

  | Family token | Tint (light / dark) | Keywords matched in the Domain text |
  |---|---|---|
  | `domain-joint-attention` | periwinkle #DDE5F8 / #273150 | joint attention, social interaction, social |
  | `domain-communication` | apricot #FCE3CC / #3E2C1E | speech, communication, language |
  | `domain-motor-imitation` | mint #D6EEDC / #1F3628 | imitation, motor, fine motor, gross motor, early motor |
  | `domain-play` | rose #F7DCE6 / #3A2430 | play |
  | `domain-regulation` | lilac #E8DDF5 / #30284A | regulation, emotional |
  | `domain-sensory` | teal #D3ECEC / #1D3638 | sensory, oral-motor |
  | `domain-other` | stone #ECE8E1 / #2E2C29 | anything not matched above, including new Domains from import |

  The rule is **keyword, not whole-string**: find every keyword that appears in the Domain text as whole words (case-insensitive; the app holds the list). The longest matching keyword wins, ties go to the family higher in the table, and no match → `domain-other`. So "social interaction and play" → joint attention, "early motor and sensory skills" → motor-imitation, "oral-motor" → sensory. The Goal form seeds its Domain chips with these family names so free text rarely misses. A tint always appears with the Domain's own text label, so colour is never the only signal and `domain-other` never hides which Domain it is. `domain-other` contrast: ink 12.54, ink-soft 5.66, action 7.48, block 6.52; dark: ink 12.21, ink-soft 6.64, action 7.13, block 5.60.
- **Tip surface (#F4F2EE / dark #2A2D36)** fills Coach Tip blocks. Ink 13.70, ink-soft 6.18; dark ink 12.06, ink-soft 6.55.
- **Scrim (#17191F at 50% / dark #000000 at 60%)** dims the screen under sheets and dialogs. A light sheet against what it covers: 3.54:1 over the scrimmed floor, 3.36:1 over a scrimmed card, 3.81:1 over scrimmed Selected. A dark card on the scrimmed surface would be only 1.25–1.29:1, so dark sheets add a 1px `outline-strong-dark` top and side edge: 4.74:1 over the scrimmed floor, 4.60:1 over a scrimmed card, 4.38:1 over scrimmed Selected (dark scrim unchanged, rechecked).
- **Source colours.** The Care Team badge is blue on blue-soft (#3D5A80 on #E4EBF4). The parent-proposed badge is honey on honey-soft (#7A5C1E on #F6ECD5). Both always carry text.
- **Attention (#8A5A00) on attention-soft (#FBF0DC)** marks an uncertain imported field ("Please check this"). It is an ochre, not a traffic-light amber, and always comes with the text tag and a glyph. Text 5.25:1 on attention-soft, border 5.93:1 on card; dark #E7B865 on #3B301A 7.05:1, on card-dark 8.35:1.
- **Mask cover (#23252B, both modes)** is the solid block laid over identifiers on an imported page, labelled "Covered" in white (15.32:1). It stays the same in dark mode because it sits on the document image, not on the app surface. For the same reason, focus on the image layer uses the two-tone `focus-indicator-image` (Components).
- **Danger (#A33A2F)** is used only for destructive confirmations: as text (6.56:1 on card) or as the Danger button fill with **danger-foreground** (#FFFFFF, 6.56:1; dark #17191F on #E58B80, 6.97:1). It is never used for "missed", "not attempted", or low data.
- **Dark mode.** Every token has a `-dark` twin: a deep floor (#17191F) and cards (#22252D), a light indigo action (#A9B8EC) with dark text, and deepened Domain tints. Dark mode follows the device setting; the user can override it.
- **Contrast.** Every text pairing passes WCAG AA in both light and dark mode. The lowest is 5.25:1 (attention on attention-soft), then 5.29:1 (ink-soft on lilac, parent-proposed on honey-soft). Ratios in this file are WCAG 2.1 relative-luminance values computed from the tokens.

Avoid traffic-light status colours, gradients, Domain tints used outside their Domain, and more than one strong colour on a screen.

## Typography

The app uses the system font stack: SF on Apple devices, Roboto on Android, and Segoe on Windows. Nothing is downloaded, so text works offline and in every browser. The Playroom personality comes from **heavy weights and size contrast**, not from a custom font.

| Role | Size / weight | Use |
|---|---|---|
| `display` | 36px / 800, tight | The Activity name on the Prep card |
| `title` | 24px / 800 | Screen titles, the Activity name on the Today card, and the Today greeting |
| `heading` | 20px / 800 | Section heads (e.g. "This week") and Mark labels |
| `section-label` | 13px / 700, letter-spaced, never all-caps | "You'll need", "Care Team Strategy", "Take these with you" |
| `body` | 17px / 400 | General reading text, Coach Tips, text fields, and the nudge |
| `body-sm` | 14px / 400, ink-soft | Supporting text under a big name: the Activity description, materials, and Strategy text |
| `cue` | 19px / 600 | Cues, which stay large because the caregiver carries them into the Activity |
| `label` | 15px / 700 | Buttons, chips, and field labels |
| `meta` | 13px / 400 | Dates, badges, AI labels, Prompt Level glosses, and data notes |

The jump from `display` to `body-sm` makes the Activity name read first. Pixel sizes above assume a 16px default. On iOS and iPadOS the base is the Dynamic Type body size (17px at the default setting), so everything renders about 6% larger there. That is intended; never "correct" it in px.

**Text sizing (honours OS and browser settings):**
- Never set the root font size in px. The root is `html { font-size: 100%; }`.
- On iOS and iPadOS only: `@supports (font: -apple-system-body) and (-webkit-touch-callout: none) { html { font: -apple-system-body; } }`, so Dynamic Type (every iOS browser) scales the base. The `-webkit-touch-callout` guard keeps macOS Safari (whose system body is about 13px) on the 100% root. `body` then resets `font-family` to the stack; all type tokens stay in rem from that base.
- Test: macOS Safari at default zoom renders `body` at 17px. If the guard misfires on iPadOS desktop-class Safari, fall back to a script check for touch WebKit before applying the rule.
- Layouts reflow at 200% text size and at iOS's largest accessibility sizes (rules in Layout & Spacing).

## Layout & Spacing

The layout is block-structured, with medium density. The spacing scale is 4 / 8 / 12 / 16 / 24 / 32 / 48. Cards in the same group sit 8–12px apart, and groups sit 24–28px apart.

- **Phone:** a single column with 16px margins. Primary actions sit in the bottom third, and the Prep footer and Review Save are pinned.
- **Tablet:** content is centred at 720px, with a left rail.
- **Laptop:** a left rail, plus two columns for import and the Summary builder.
- **Touch targets:** at least 48px. Buttons are 52px and Mark buttons are 72px.

**Reflow (320 CSS px, 200% text):**

| Where | Rule |
|---|---|
| Two-button footers (Prep, Review, dialogs) | Side by side only while the container is ≥ 400px and text scale ≤ 130% (container query). Otherwise stack full width, primary at the bottom nearest the thumb. Labels wrap; never `nowrap`. |
| Review header | "‹ Back" and the title on one row; "Not attempted / child not available" on its own full-width quiet row below the title. |
| Inline label + control (steppers) | Wraps to label above the control. |
| Mark grid | 2×2 becomes one column above 130% text or under 340px. |
| Short viewports (height < 500px, e.g. landscape, or large text) | Pinned footers and the bottom nav unpin and sit in the flow. |
| Focused fields | `scroll-padding-bottom` equals the pinned footer height, so a focused field is never hidden behind it. |
| Text spacing | Chips, the status line and the stepper value use min-height and padding, never fixed height or fixed line-height (WCAG 1.4.12). |
| Practice at large text | When one-column Marks plus Done exceed the viewport, the Practice screen scrolls; it never clips, and Done stays reachable. |
| Sheets | `max-height: calc(100dvh - 24px)` and scroll internally; Close and "Back to practice" stay reachable. |

## Elevation & Depth

**Flat everywhere.** The product owner chose this.
- Nothing has a drop shadow or a block shadow: not cards, tiles, buttons, Cue numbers, or Mark buttons.
- Hierarchy comes from **colour blocks** (Domain tints, the tip surface, and the neutral Selected wash), **size contrast**, and **spacing**.
- Edges, where needed, are 1px: `outline` for cards and `outline-strong` for interactive controls, at 3:1 or more. No bevels and no thick outlines. The only 2px line is the focus indicator.
- Overlays (sheets and dialogs) are separated from the screen below by `{colors.scrim}`, not a shadow. In dark mode they also take a 1px `outline-strong-dark` top and side edge.

## Shapes

| Radius | Used for |
|---|---|
| `xl` (28px) | Cards, hero bands, and sheets |
| `lg` (20px) | Block cards, Cue tiles, Mark buttons, tip blocks, icon tiles, and Plan rows |
| `md` (16px) | Steppers, text fields, status line, banners, and Cue numbers |
| `sm` (12px) | Mask covers and the "Please check this" tag |
| `full` | Buttons, chips, badges, and the nav indicator bar |

Corners are generous everywhere, with no sharp edges and no perfect circles for surfaces. Shapes are flat, with no bevels or shadows. Icons are simple line drawings of objects with a 2.4px stroke, never of people.

## Components

Frontmatter component keys are in parentheses. Behaviour lives in EXPERIENCE.md under the same names; this section holds only the visual treatment.

**Shared**
- **Focus indicator** (`focus-indicator`). 2px `focus-ring` outline with a 2px offset on every control via `:focus-visible`. The offset lets the ring sit on floor, card, a tint or Selected rather than on the button fill (ring vs primary fill is 1.00:1, so the offset is required). Ring contrasts: floor 8.55, card 9.14, Domain tints 7.00–7.48, selected 7.75; dark floor 9.00, card 7.85, selected 6.34.
- **Image-layer focus** (`focus-indicator-image`). On the document image only (masking lines, covers, the keyboard box), in both modes: a 2px `mask-cover` (#23252B) inner ring plus a 2px white outer ring. On white paper the dark ring is 15.32:1 (grey paper #E0E0E0 11.60:1); on a cover or dark photo the white ring is 15.32–21:1. A focused cover also reads "Covered (focused)" in its label.
- **Disabled controls.** Keep their shape and edge; label and glyph turn `ink-disabled`. They are never hidden or removed from the layout.
- **Text field** (`text-field`). Card fill, 1px `outline-strong` (3.73:1 / dark 3.67:1), `md` radius, 48px min, `body` text, visible `label` above. Error text is ink with a leading glyph, never colour alone.
- **Source badge** (`source-badge-care-team`, `source-badge-parent-proposed`): blue for Care Team and honey for parent-proposed, always with text. The **AI label** (`ai-label`) is a neutral outlined pill reading "AI-suggested". Data notes are `meta` text in ink-soft.
- **Status line** (`status-line`). A white outlined pill in `body-sm`, e.g. "Review saved.", with an optional quiet "Undo" at the end, no icon, and no animation. It sits directly under the screen's `<h1>` and any banners.
- **Banner** (`banner`). Card fill with a 1px `outline-strong` edge, `body-sm` text, at most one quiet action, and a quiet × "Dismiss" where dismissable. Full width at the top of the content, directly under the `<h1>`; banners stack newest first, 8px apart.
- **Bottom nav (phone) / left rail** (`bottom-nav`). Five destinations, each with a line icon and a label. The active destination is indigo, weight 800, with a 32×4px `action` bar above the icon (9.14:1 on card; dark 7.85:1); inactive is ink-soft at 600. On the rail the bar is vertical at the leading edge. The bar, not the colour, carries the state.
- **Sheets and dialogs** (`sheet`). Card fill over the scrim, `xl` top corners and a grabber on phones, centred with all corners `xl` (560px max) on tablet and laptop. Heading in `heading`, Close top right.

**Core loop**
- **Today screen** → [mock](mockups/key-today.html)
  - The greeting is in `title`, and the **Nudge** is one `body` line in ink-soft, with no icon or badge.
  - **Today card** (`card` + `hero-band`): a white card topped by a Domain-tinted band. The band holds a 56px icon tile and the Activity name in `title`. Below the band come the meta line, the primary "Prep" button, and a quiet "Not this one". The card itself is not a tap target.
  - **"Log a moment"** is a secondary button.
  - **Plan strip** ("This week"): a list of **Plan rows** (`plan-row`). Each row is one button with a 1px `outline-strong` edge, the day, a 36px tinted Domain square with its icon, the Activity name, the Domain label in `meta`, and a trailing chevron. The next row has a 1px `action` edge plus a "Next" tag in text. Once the Activity has a Review, the row shows "Reviewed" in ink-soft.
- **Prep card** → [mock](mockups/key-prep.html)
  - **Hero band** (`hero-band`) in the Domain's tint. It holds a quiet back link, a 76px white icon tile (flat), a white Domain chip, the Activity name in `display`, and the description in `body-sm`.
  - **Materials** form a 2-column grid of block cards (`block-card`), each with an icon and `body-sm` text.
  - **Care Team Strategy** is a block card with a Care Team Source badge.
  - **"Take these with you"** shows 2–3 Cue tiles (`cue-tile`) in the Domain tint, each with a numbered indigo block (`cue-number`).
  - **"If it gets hard"** is a **Disclosure row** (`disclosure-row`) with a dashed `outline-strong` edge that expands. A quiet "Add another Activity" button sits directly below it, above the footer.
  - **Footer** (pinned, stacks per Reflow): "Start (optional timer)" as the secondary button and "Log review" as the primary button.
- **Practice screen** → [mock](mockups/key-practice.html)
  - Nearly empty, on the floor colour. At the top, a quiet "Time so far 3:42" in ink-soft `meta` (never shown as a target) sits with the quiet "Prep card" link. In a two-Activity Practice Session, a `meta` line reads "Activity 1 of 2".
  - The four **Mark buttons** (`mark-button`) fill the lower half in a 2×2 grid: card fill, 1px `outline-strong`, `heading` label, no shadow. While pressed they take the `pressed` fill (instant under Reduce Motion).
  - Below them, a quiet "Pause or change" opens the Practice options sheet, and a primary button reads "Done" (or "Next: <Activity>" before a queued second Activity).
  - When paused, the Marks hide and the screen shows "Paused" in `heading` with a primary "Resume".
- **Coach Tip sheet** (`coach-tip-sheet`) → [mock](mockups/key-practice.html). A white sheet over the scrim with `xl` top corners, a grabber, the line "Mark saved: Losing attention · Undo" in `meta`, and the heading "A few ideas to try". Up to 3 **tip blocks** (`tip-block`, tip surface, no outline), each in `body` with a **Helpful toggle** (`helpful-toggle`). Close sits at the top right and a full-width quiet "Back to practice" at the bottom.
- **Practice options sheet** (`sheet`). A list of full-width quiet rows: Pause, Try a variation, Skip this Activity, Stop and review. Variations open as a list of `block-card`s.
- **Review form** → [mock](mockups/key-review.html)
  - **Choice chips** (`choice-chip`) cover Prompt Level, who modelled, Where, engagement, and "Which cue or tip helped?" (multi-select). A selected chip has the neutral Selected wash, a 1px indigo outline, a mandatory check glyph, and a bold label. Selection never depends on colour alone.
  - Prompt Level chips each carry a one-line plain gloss under the label in `meta`.
  - **Steppers** (`stepper`) capture the Measure and Attention (minutes). Edge and internal dividers are `outline-strong`.
  - Marks appear as removable chips: a selected `choice-chip` with a trailing × glyph.
  - The pre-filled row is a `disclosure-row` (solid edge) reading "Model · Reading · One-to-one" with a quiet "Change".
  - The note is a **text field** (`text-field`).
  - Save is pinned at the bottom; "Not attempted / child not available" sits under the title (see Reflow).
  - In a two-Activity Practice Session, each Activity is a `card` section headed by its name and Domain chip.
- **Log a moment sheet** (`sheet`). Three stacked chip groups in this order: for which Goal or list, what you saw, Where (pre-filled, collapsed). A single `stepper` appears under "what you saw" when the Goal's Criterion counts something. Optional `text-field`, pinned primary Save.

**Goals, setup and sources**
- **Goal row.** Uses the `plan-row` anatomy without the tinted square: the Goal description in `body` at weight 700, a `meta` line with the Domain label and Source badge (plus Review Status text for parent-proposed Goals), and a trailing chevron. Groups are headed in `heading` by Care Team Member role, then "Proposed by you"; "Earlier goals" is a `disclosure-row`.
- **Goal form, Strategy/Restriction form, Appointment Feedback form, Child Profile form, Care Team Member form.** Full screens of labelled `text-field`s and `choice-chip` groups in `card` sections, with a pinned primary Save. The observable-behaviour prompt is a `tip-block` under the description field with "Use this" (secondary) and "Keep mine" (quiet). The Care Team Member's original wording shows above an edited description as a `block-card` labelled "Original wording" in `section-label`. Child Profile sensitivities are rows with an "Avoid" checkbox chip; list fields (interests, materials) add entries as removable chips.
- **Care Team Member page.** A `title` header (role and discipline) with the Care Setting in `meta`, then `card` sections: Goals (Goal rows), Strategies and Restrictions (`block-card`s with Source badges), Status Vocabulary and Prompt Level terms (editable rows of `text-field`s in list order), and a secondary "New period".
- **Invite caregiver.** An email `text-field` and a secondary "Send invite". A pending invite is a `block-card` with "Invite sent 5 Nov" in `meta` and quiet "Resend" and "Cancel".
- **New Goal Period.** A full screen: a `card` with Start and End date fields and an optional label field; then one `card` per current Goal with its description and a single-select lineage `choice-chip` row (Carried over · Revised · Retired). A revised Goal shows its change as a `meta` line ("5 → 10 minutes") with a quiet "Edit". "+ New goal" is a secondary button; new Goals list under "New this period". Pinned primary "Start new period".
- **Observation history.** An Observation row shows "Logged by <Caregiver> · <date>" in `meta`; an edited one adds "Edited" and a quiet "History" link that lists earlier versions as `block-card`s.
- **Original file.** A `block-card` with a file icon, upload date, "Kept until <date>" in `meta`, a secondary "View" and a quiet danger-text "Delete".
- **Progress view** (`chart`). Goal detail shows three separate `card`s titled "Practice consistency", "Performance" and "Generalisation", never merged into one score. Each chart has one `action` series, `outline` gridlines and `meta` axis labels in the Criterion's units ("3 of 5", "minutes", "new words"). Never percentages, target lines, red/amber/green, or Domain tints. Data notes ("too few to show a trend") are `meta` in ink-soft above the chart. Earlier periods of a revised Goal appear in ink-soft with hollow markers, behind a labelled divider ("Revised 12 Aug: 5 → 10 minutes"). Generalisation is a list of Context chips with Observation counts in text, not a heatmap. Each card has a text summary above the chart and a quiet "Show as table" toggle; the table uses `body-sm` rows on card with `outline` row rules, and each date is a link.

**Activities and planning**
- **Activity row.** The `plan-row` anatomy (36px tinted Domain square with icon, Activity name, a `meta` line with Domain label and time needed, then the Source badge or AI label). The name is the link; the trailing **Favourite** (`favourite-toggle`: outline heart + "Favourite" when off, filled heart + "Favourite ✓" in bold when on) and a quiet text "Hide" are separate buttons, never inside the link. Hidden rows list under a "Hidden" `disclosure-row`.
- **Activity detail.** A `hero-band` like the Prep card with the name in `title`, Favourite and Hide below it; then `card` sections: Purpose, Materials (`block-card` grid), Steps (numbered list in `body`), Variations (`block-card`s), Cues (`cue-tile`s), Coach Tips (`tip-block`s), What to observe. Pinned primary "Add to Plan".
- **Plan editor.** A single `stepper` "Activities this week", then the items as `block-card`s (Activity name in `label`, Domain chip, optional day and Context as `choice-chip`s, quiet "Swap" and "Remove"), secondary "+ Add activity", weekly availability as multi-select day chips, and week start as single-select chips. Pinned primary "Use this plan".
- **Get new ideas** (P2). Optional filter `choice-chip` rows (time, materials, Where) above suggestion `block-card`s, each with the AI label.

**Import, sharing and consent**
- **Masking review.** The page image on `card`, identifiers under `mask-cover` blocks labelled "Covered", focus per `focus-indicator-image`. Beside it (laptop) or below it (phone), a `card` with the line list as checkbox rows in two groups headed in `section-label`: "We covered these" and "Everything else on the page"; manual covers join the first group. A secondary "Cover more" toggle shows its on state with the selected styling and check glyph. Pinned primary send button.
- **Draft review.** Each extracted item is a `card` with Confirm (primary), Edit (secondary), Discard (quiet). Uncertain fields take a 1px `attention` edge plus a `check-tag` "Please check this" with an info glyph, placed inside the field's card. Original wording sits in a `block-card` beside any simplification.
- **Summary builder.** Laptop: two columns, choices and section editing on the left, the live Summary preview on the right. Phone: steps as full screens with `choice-chip` groups (Care Team Member; "Goal Period" or "Date range" with two date `text-field`s), then the preview. Each editable section has a quiet "Edit"; AI-suggested questions carry the AI label.
- **Summary preview and document** (`summary-document`). On screen, the preview is the document on a white print-like page (`card`, 1px `outline`) at `{spacing.content-max}`. The exported PDF is the same document:

  | Part | Treatment |
  |---|---|
  | Header (page 1) | "Home practice summary" in `title`; Care Team Member role and discipline, the Goal Period or date range, and the child's nickname in `body`; "Prepared <date> · <N> observations" in `meta`. |
  | Goal section (one per Care Team Goal, in Goal order) | Goal description in `heading`, a `meta` line with Domain label (text, no tint), Criterion and the last Status Vocabulary term given by the therapist, if any. "Limited data" is an outlined text pill in ink, never red or filled. Starts a new page only if it won't fit; `break-inside: avoid` per measure. |
  | Three measures | Three labelled blocks in fixed order (Practice consistency, Performance, Generalisation), never combined. Performance is one ink-line chart in the Criterion's units with a compact value row beneath (dates and values as text), so it reads in greyscale. Generalisation and Prompt Level and Context patterns are text lists with counts. |
  | Inventory, notable moments | Text lists under `section-label` heads; notable moments are quoted notes with date and Context. |
  | For discussion | Parent-proposed Goals after all Care Team Goals, under a `title` "For discussion", each with an outlined "Proposed by you" pill and its Review Status. |
  | Questions | "Your questions" last; AI-suggested questions and any AI-written sentence carry an outlined "AI-suggested" text pill in print. |
  | Footer | "Page 2 of 4 · Based on <N> observations recorded in LittleSteps" in `meta`. |

  Print type uses the same tokens at 0.8× (body ≈ 10pt, `meta` never below 8pt), ink on white, 1px `outline-strong` rules between Goals. No Domain tints, fills or colour-only meaning anywhere in print.
- **Confirm-to-share** (`sheet`). Heading, plain explanation, primary "Share", quiet "Not now".
- **Destructive confirm** (dialog). Heading, plain consequence in `body`, then for the typed variant a `text-field` with its instruction as the label; a `button-danger` and a quiet "Cancel". Until the typed text matches, the Danger button is drawn in the disabled style (card fill, 1px `outline-strong`, `ink-disabled` label) but stays in place and focusable; a mismatch message appears below the field in ink with a leading glyph. Variant rules are in EXPERIENCE › Destructive confirm.
- **Consent cards.** Three full-width `card`s, one per topic, each with "1 of 3" in `meta`, a `heading` and `body` text; no checkboxes. Primary "I agree" after the third card and a quiet "Sign out".
- **Inventory entry** (P2). In the Log a moment sheet or Family → Inventory: list `choice-chip`s (New words, New gestures, Scripts heard), an item `text-field`, tag `choice-chip`s, and the first-seen date and Where as a collapsed pre-filled row with "Change".

## Do's and Don'ts

| Do | Don't |
|---|---|
| Give each Domain its family tint, paired with its label; fall back to `domain-other` | Use Domain tints for status, grading, charts, or decoration |
| Keep one strong colour (indigo) per screen, for the action | Add a second accent colour or a gradient |
| Use heavy weights and size contrast for hierarchy (`display` → `body-sm`) | Set supporting text at the same size as names |
| Keep everything flat: fills, 1px edges, scrims for overlays | Add drop shadows, block shadows, bevels, or thick outlines |
| Use `outline-strong` on anything interactive and `selected` only for chosen states | Fill a resting control with `selected`, or rely on `outline` for a control edge |
| Show progress in the Criterion's own units, one measure per chart | Show percentages, scores, target lines, or traffic-light colours |
| Draw simple line icons of objects | Draw people, children, faces, or mascots |
| Keep the Practice screen nearly empty | Show countdowns, target times, progress rings, streaks, or badges |
| Set the root font in % (or `-apple-system-body` on iOS and iPadOS only) and type in rem | Set `html { font-size }` in px |
