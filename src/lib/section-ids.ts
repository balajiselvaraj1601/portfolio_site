/** Section component registry keys — must match `SectionRenderer.astro` SECTIONS map. */
export const SECTION_COMPONENT_IDS = [
  'hero',
  'thirukural',
  'vision-programs',
  'vision-impact',
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
