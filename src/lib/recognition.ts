/**
 * Recognition and award utilities.
 *
 * Centralizes constants and helpers for medals, awards, and competition
 * recognition system — the single source of truth (SSOT) for medal-tier logic
 * across all components.
 *
 * Medal tiers are defined by the kaggleMedalSchema in src/schemas.ts — this
 * module re-exports them in a form optimized for component usage.
 */

/**
 * Medal tiers earned in Kaggle competitions.
 * Drives filter chip display, card styling, and medal-count statistics.
 * SSOT: defined by kaggleMedalSchema in schemas.ts
 */
export const MEDALS = ['Silver', 'Bronze'] as const;

/**
 * Map medal tier to CSS class name.
 * Applies accent colors (--medal-silver, --medal-bronze) to cards and filter chips.
 *
 * @param medal - Medal tier ('Silver' or 'Bronze')
 * @returns CSS class name ('blob--silver' or 'blob--bronze')
 */
export function medalClass(medal: string): string {
  return medal === 'Silver' ? 'blob--silver' : 'blob--bronze';
}
