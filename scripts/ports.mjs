/** Single source of truth for Astro local server ports. */
export const DEV_PORT = 4321;
export const PREVIEW_PORT = 4331;
/** Cleared on stop; never used for serving. */
export const LEGACY_PORTS = [4322];
export const ALL_ASTRO_PORTS = [DEV_PORT, PREVIEW_PORT, ...LEGACY_PORTS];
