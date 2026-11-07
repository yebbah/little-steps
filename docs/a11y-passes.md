# Accessibility passes

What has been checked for accessibility, screen by screen. The automated checks run in CI as the job "Frontend: accessibility" (Playwright and axe, `frontend/e2e/tests/a11y-reflow.spec.ts` and the specs beside it). The manual screen-reader passes are not done yet: they belong to Epic 24 (P2) and are added to this file then.

Rules checked: no serious or critical axe violation in light or dark (UX-DR119); no horizontal scroll and no truncated label at 320 CSS px and 200% text (UX-DR120); the reflow rules (UX-DR121); no state shown by colour alone (UX-DR123).

## Automated results

Run: Chromium against the Vite test-mode dev server (`npm run test:e2e`), 2026-11-07. "Pass" means every automated check named above passed for that screen in that run; the specs enforce it on every CI run. The "200% text" checks set the root font size to 200%, which scales rem-based text (all text here is in rem) and does not model a browser's text-only zoom.

| Screen | Route | axe 360, 768 and 1280px, light and dark | 320px at 200% text | Notes |
|---|---|---|---|---|
| Today | `/today` | Pass | Pass | Placeholder content |
| Goals | `/goals` | Pass | Pass | Placeholder content |
| Activities | `/activities` | Pass | Pass | Placeholder content |
| Share | `/share` | Pass | Pass | Placeholder content |
| Family | `/family` | Pass | Pass | Link to Settings |
| Settings | `/family/settings` | Pass | Pass | Theme chips, install row. `settings.spec.ts` also checks an explicit Dark choice on a light device and the open install offer |
| Not found | any unknown path | Pass | Pass | |
| Component gallery | `/dev/gallery` | Pass | Pass | Dev and test builds only; includes the 360, 768 and 1280px control frames |
| Sheet | gallery "Open sheet" | Pass (360px, light and dark, in `dialog.spec.ts`) | Pass | Phone, tablet and short viewport sizing in `dialog.spec.ts` and `a11y-reflow.spec.ts` |
| Dialog | gallery "Open dialog", and the install offer | Pass (install offer: `settings.spec.ts`) | Pass | Stacked actions below a 400px container and above 130% text, side by side otherwise |

## Reflow rules (UX-DR121), automated

| Rule | Check |
|---|---|
| Two-button footers side by side only at 400px or wider and 130% text or less, otherwise stacked with the primary at the bottom | Dialog actions at 360, 768 and 1280px, and at 130% and 150% text |
| Labels wrap | No clipped or ellipsised label on any screen at 320px and 200% text |
| Under 500px tall, pinned footers and the bottom nav unpin | Nav is static and a sheet scrolls as a whole at 360 by 480 |
| `scroll-padding-bottom` matches the pinned footer height | Equal to the measured nav height at 100% and 200% text |
| Chips, status line and steppers use min-height, never a fixed height | CSS check (`src/ui/layout-rules.test.ts`) and a text-spacing test (WCAG 1.4.12) |

## No state by colour alone (UX-DR123), automated

| State | What also carries it |
|---|---|
| Selected chip | Check glyph and heavier label |
| Active nav item | A bar, a heavier label and `aria-current="page"` |
| Source (Care Team, parent-proposed) | The badge text |
| AI-suggested | The label text |
| Please check this | The text and an info glyph |
| Status | The status line text |

## Manual passes (Epic 24, not done)

| Pass | Status |
|---|---|
| VoiceOver on iOS | Not done |
| VoiceOver on macOS | Not done |
| TalkBack on Android | Not done |
| NVDA on Windows | Not done |
