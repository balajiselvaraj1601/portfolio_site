/**
 * Recognition and award utilities.
 *
 * Centralizes constants and helpers for medals, awards, and competition
 * recognition system — the single source of truth (SSOT) for medal-tier logic
 * across all components.
 *
 * Medal tiers are re-exported from kaggleMedalSchema in src/schemas/recognition.ts — this
 * module provides them alongside other medal-tier utilities.
 */

/**
 * Medal tiers earned in Kaggle competitions.
 * Drives filter chip display, card styling, and medal-count statistics.
 * Re-exported from: kaggleMedalSchema in src/schemas/recognition.ts
 */
import { MEDALS } from '@schemas';
export { MEDALS };

/**
 * Count the items that earned the given medal tier.
 * Drives the derived stat-tile counts in Kaggle.astro — keeps inline medal
 * string comparisons out of components.
 */
export function medalCount(
  items: readonly { medal: string }[],
  medal: (typeof MEDALS)[number]
): number {
  return items.filter((i) => i.medal === medal).length;
}

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
