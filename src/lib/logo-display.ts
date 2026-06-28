/** Light/white marks that render on the dark card without a white pill. */
const PLAIN_LOGO_SLUGS = new Set(['jitc', 'hcl']);

export function logoUsesBadge(slug?: string, override?: boolean): boolean {
  if (override !== undefined) return override;
  if (!slug) return true;
  return !PLAIN_LOGO_SLUGS.has(slug);
}
