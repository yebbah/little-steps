// The widths the Epic 2 gallery frames and reflow checks use (Stories 2.4 and 2.7).
export const FRAME_WIDTHS = { phone: 360, tablet: 768, desktop: 1280 } as const
export const REFLOW_WIDTH = 320
export const SHORT_VIEWPORT_HEIGHT = 480 // under 500px tall: pinned footers and bottom nav unpin (UX-DR121)

export const viewport = (width: number, height = 800) => ({ width, height })
