import type { IconName } from '@lib/icons';
import data from './icon-paths.json';

/**
 * Single source of truth for inline-icon path geometry (data lives in
 * `icon-paths.json` so the Node generator `scripts/export-icon-svgs.mjs` can read
 * the same source). Each entry is wrapped at export time in the standard 24×24
 * stroke wrapper and rasterized to `public/assets/icons/ui/<name>.png`.
 */
export const ICON_PATHS = data as Record<IconName, string>;
