// Flat line drawings of objects, never of people. Drawn on a 24 grid; the stroke is 2.4px at every size.
export const STROKE_WIDTH = 2.4

/** The five navigation destinations (Story 2.3 binds their labels from the catalog). */
export const NAV_ICON_NAMES = ['today', 'goals', 'activities', 'share', 'family'] as const
export const SAMPLE_ICON_NAMES = ['book', 'blocks', 'ball', 'leaf'] as const
export type IconName = (typeof NAV_ICON_NAMES)[number] | (typeof SAMPLE_ICON_NAMES)[number]
