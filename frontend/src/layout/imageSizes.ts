/**
 * `sizes` for a picture as wide as the content column: on desktop the screen less the sidebar and
 * gutters (312px, see layout.css) up to the content's 1176px cap, and the whole screen below the
 * 960px breakpoint, where the sidebar goes.
 */
export const CONTENT_WIDTH_SIZES = '(min-width: 961px) min(calc(100vw - 312px), 1176px), 100vw'
