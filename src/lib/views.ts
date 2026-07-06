/**
 * Structural view/anchor constants shared by the build-time content pipeline
 * (`src/lib/content.ts`, layout/chrome components) and the client nav scripts
 * (`src/scripts/section-views.ts`, `src/scripts/init-sections.ts`).
 *
 * Data SSOT: `content/site.json` owns every per-view anchor string (each
 * page's `viewAnchor`) and the view→section wiring — those values are loaded
 * and validated in `src/lib/content.ts` and must never be duplicated here.
 * This module holds only structural literals defined by the code itself:
 * synthetic ids, DOM attribute contracts, and shared timing.
 */

/** Page id `content/site.json` must define for the root (`/`) page. */
export const HOME_PAGE_ID = 'home';

/** Synthetic dot-nav id for the hero band (not a nav view in site.json). */
export const HERO_DOT_ID = 'hero';

/** Attribute on header nav links carrying the link's target view anchor. */
export const VIEW_ANCHOR_ATTR = 'data-view-anchor';

/** Selector for header nav links that target a view anchor. */
export const VIEW_ANCHOR_LINK_SELECTOR = `a[${VIEW_ANCHOR_ATTR}]` as const;

/** Class marking a section wrapper that participates in view scroll-spy. */
export const SECTION_VIEW_ROOT_CLASS = 'section-view-root';

/** Attribute on section wrappers carrying the section id for scroll-spy. */
export const SECTION_ID_ATTR = 'data-section-id';

/** Selector for section wrappers observed by the view scroll-spy. */
export const SECTION_VIEW_ROOT_SELECTOR =
  `.${SECTION_VIEW_ROOT_CLASS}[${SECTION_ID_ATTR}]` as const;

/** Window (ms) after a programmatic scroll during which scroll-spy is suppressed. */
export const PROGRAMMATIC_SCROLL_SETTLE_MS = 1200;

/** Build the location hash for a view anchor — sole owner of the `#` prefix. */
export function viewHash(anchor: string): string {
  return `#${anchor}`;
}
