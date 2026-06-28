import { z } from 'zod';

/** Semantic icon keys rendered by `Icon.astro`. */
export const iconNameSchema = z.enum([
  'email',
  'linkedin',
  'kaggle',
  'github',
  'location',
  'external',
  'download',
  'clock',
  'calendar',
  'arrow-right',
  'sun',
  'moon',
  'menu',
  'close',
  'arrow-up',
  'chevron',
  'chevron-right',
  'trophy',
  'brain',
  'rocket',
  'pill',
  'institution',
  'microscope',
  'presentation',
  'chart',
  'funding',
  'target',
  'link',
  'team',
  'globe',
  'blocks',
  'document',
  'graduation',
  'diamond',
  'folder',
  'layers',
  'scan',
  'graph',
  'dna',
  'vision',
  'lightbulb',
  'book',
  'handshake',
  'table',
  'pulse',
  'image',
]);

export type IconName = z.infer<typeof iconNameSchema>;

const DOMAIN_ICONS: Record<string, IconName> = {
  'Biopharma R&D': 'pill',
  'Translational Oncology': 'microscope',
  'Clinical Imaging': 'scan',
  'Oncology Imaging': 'scan',
  'Digital Pathology': 'microscope',
  'Computational Pathology': 'graph',
  'Enterprise Vision': 'vision',
  'Academic Research': 'graduation',
};

const ABOUT_CARD_ICONS: Record<string, IconName> = {
  Industries: 'layers',
  Leadership: 'team',
  Research: 'microscope',
  Recognition: 'trophy',
};

/** Resolve a content icon string to a known icon key, with safe fallback. */
export function resolveIcon(value: string | undefined, fallback: IconName = 'folder'): IconName {
  const parsed = iconNameSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

/** Map project domain (and optional id) to a semantic icon. */
export function projectIcon(domain: string, id?: string): IconName {
  if (id?.includes('drug-safety') || id?.includes('safety')) return 'pill';
  if (id?.includes('tumor') || id?.includes('oncology') || id?.includes('recurrence')) return 'microscope';
  if (id?.includes('foundation') || id?.includes('framework')) return 'blocks';
  if (id?.includes('pathology')) return 'microscope';
  if (id?.includes('gnn') || id?.includes('graph')) return 'graph';
  if (id?.includes('vision') || id?.includes('enterprise')) return 'vision';
  if (id?.includes('imaging') || id?.includes('segmentation') || id?.includes('clinical')) return 'scan';
  return DOMAIN_ICONS[domain] ?? 'folder';
}

/** Map About section card titles to icons. */
export function aboutCardIcon(title: string): IconName {
  return ABOUT_CARD_ICONS[title] ?? 'diamond';
}
