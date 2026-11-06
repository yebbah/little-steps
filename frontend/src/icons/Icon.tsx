import { ICONS } from './glyphs.tsx'
import { STROKE_WIDTH, type IconName } from './names.ts'

/** Decorative: the label next to an icon carries the meaning. */
export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-icon={name}
    >
      {ICONS[name]}
    </svg>
  )
}
