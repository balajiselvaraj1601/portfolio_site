/**
 * Section component registry keys (SSOT). `SectionRenderer.astro` type-checks
 * its SECTIONS map against this list via
 * `satisfies Record<SectionComponentId, SectionComponent>` — drift between
 * the two fails `astro check`.
 */
export const SECTION_COMPONENT_IDS = [
  'hero',
  'thirukural',
  'vision-programs',
  'leadership',
  'experience',
  'education',
  'awards',
  'publications',
  'conferences',
  'speakers',
  'kaggle',
  'contact',
] as const;

export type SectionComponentId = (typeof SECTION_COMPONENT_IDS)[number];

export const SECTION_COMPONENT_ID_SET = new Set<string>(SECTION_COMPONENT_IDS);
