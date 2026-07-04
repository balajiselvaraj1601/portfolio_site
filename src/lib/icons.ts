import { z } from 'zod';

/** Semantic icon keys rendered by `Icon.astro`. */
export const iconNameSchema = z.enum([
  'email',
  'gmail',
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
  'trophy-cup',
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
  'save',
  'mic',
  'fish',
  'cloud',
  'hand',
  'zap',
  'pen-line',
  'refresh',
  'dashboard',
  'clipboard',
]);

export type IconName = z.infer<typeof iconNameSchema>;

/** Resolve a content icon string to a known icon key, with safe fallback. */
export function resolveIcon(
  value: string | undefined,
  fallback: IconName = 'folder'
): IconName {
  const parsed = iconNameSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

const COMPETITION_ICONS: Record<string, IconName> = {
  'bengaliai-speech-recognition': 'mic',
  'happywhale-identification': 'fish',
  'google-contrails': 'cloud',
  'open-problems-multimodal-single-cell': 'dna',
  'uw-madison-gi-tract-segmentation': 'scan',
  'google-asl-signs': 'hand',
  'enefit-energy-prosumers': 'zap',
  'bengaliai-handwritten-grapheme': 'pen-line',
  'aptos-2019-blindness-detection': 'vision',
};

const COMPETITION_DOMAIN_ICONS: Record<string, IconName> = {
  'Speech Recognition & NLP': 'mic',
  'Re-Identification & Conservation AI': 'fish',
  'Satellite Segmentation & Climate AI': 'cloud',
  'Computational Biology & Multi-Omics': 'dna',
  'Medical Imaging & Radiation Oncology': 'scan',
  'Accessibility AI & Edge Deployment': 'hand',
  'Time Series & Sustainability': 'zap',
  'Computer Vision & OCR': 'pen-line',
  'Medical Imaging & Ophthalmology': 'vision',
};

/** Map Kaggle competition id (and domain) to a semantic icon. */
export function competitionIcon(id: string, domain: string): IconName {
  return COMPETITION_ICONS[id] ?? COMPETITION_DOMAIN_ICONS[domain] ?? 'kaggle';
}
