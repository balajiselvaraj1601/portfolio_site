/**
 * Theme background colors.
 * MUST stay in sync with --bg values in src/styles/global.css.
 * (Meta tags cannot read CSS custom properties, so values are duplicated here.)
 * Drift fails `npm run verify` via scripts/check-theme-token-sync.mjs.
 */
export const THEME_BG = {
  light: '#faf8ff',
  dark: '#0d0b1e',
} as const;
