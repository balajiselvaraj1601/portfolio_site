/** Light/white marks that render on the dark card without a white pill. */
const PLAIN_LOGO_SLUGS = new Set(['jitc', 'hcl', 'persist-seq']);

export function logoUsesBadge(slug?: string, override?: boolean): boolean {
  if (override !== undefined) return override;
  if (!slug) return true;
  return !PLAIN_LOGO_SLUGS.has(slug);
}

/** Pipeline-generated logo_* badges already draw their own circular ring. */
export function logoHasOwnRing(slug?: string): boolean {
  return !!slug?.startsWith('logo_');
}
