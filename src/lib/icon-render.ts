import type { IconName } from './icons';
import iconPaths from './icon-paths.json';

/** Brand marks use filled Simple Icons geometry; Lucide icons use stroke. */
const FILLED_ICONS = new Set<IconName>([
  'linkedin',
  'kaggle',
  'github',
  'gmail',
  'trophy-cup',
]);

/**
 * Official monochrome brand marks. Rendered in neutral per-background ink
 * (--brand-mark) instead of the surrounding context color, so the logo stays
 * near-black on light backgrounds and near-white on dark. `trophy-cup` is
 * filled but not a brand, so it is intentionally excluded.
 */
const BRAND_MONO_ICONS = new Set<IconName>([
  'linkedin',
  'github',
  'kaggle',
  'gmail',
]);

/**
 * Icon pixel sizes. MUST stay in sync with the `--icon-*` tokens in
 * src/styles/global.css (CSS custom properties can't be imported into TS).
 */
export const ICON_SIZE_TOKENS = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type IconSizeToken = keyof typeof ICON_SIZE_TOKENS;

export function isFilledIcon(name: IconName): boolean {
  return FILLED_ICONS.has(name);
}

export function isBrandMonoIcon(name: IconName): boolean {
  return BRAND_MONO_ICONS.has(name);
}

export function iconPixelSize(size: number | IconSizeToken): number {
  if (typeof size === 'number') return size;
  return ICON_SIZE_TOKENS[size];
}

/** Inner SVG markup for a semantic icon (paths/groups only). */
export function iconBody(name: IconName): string {
  const raw = iconPaths[name];
  if (!raw) return '';
  if (isFilledIcon(name)) {
    return raw.replace(/fill="#000"/g, 'fill="currentColor"');
  }
  return raw;
}
