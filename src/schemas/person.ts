import { z } from 'zod';
import { iconNameSchema } from '../lib/icons';
import { EntitySlug } from './shared';

export const MetricItem = z.object({
  value: z.string(),
  label: z.string(),
  detail: z.string().optional(),
  icon: iconNameSchema.optional(),
});
/** Titled content block with an optional Lucide icon (leadership & vision lists). */
const TitledIconItem = z.object({
  title: z.string(),
  description: z.string(),
  icon: iconNameSchema.optional(),
});
export const contactTypeSchema = z.enum([
  'email',
  'linkedin',
  'github',
  'kaggle',
  'location',
]);

/* ── profile.json ──────────────────────────────────────────────────────── */
export const profileSchema = z.object({
  name: z.string(),
  title: z.string(),
  location: z.string(),
  headline: z.string(),
  heroTag: z.string().optional(),
  heroTitle: z
    .object({
      lead: z.string(),
      emphasis: z.string(),
      tail: z.string().optional(),
    })
    .optional(),
  heroQuote: z
    .object({
      tamil: z.string(),
      translation: z.string(),
      author: z.string(),
      image: z.string().optional(),
      imageWebp: z.string().optional(),
      imageAvif: z.string().optional(),
      imageAlt: z.string(),
    })
    .optional(),
  metrics: z.array(MetricItem),
  ctas: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
      variant: z.enum(['primary', 'default', 'secondary']).optional(),
      icon: iconNameSchema.optional(),
    })
  ),
  leadershipPhilosophy: z.object({
    intro: z.union([z.string(), z.array(z.string())]).optional(),
    blockHeadings: z.object({
      strategicVision: z.string(),
      businessImpact: z.string(),
      platform: z.string(),
      peopleMentoring: z.string(),
      governanceAI: z.string(),
      governancePrivacy: z.string(),
      governanceGxP: z.string(),
    }),
    strategicVision: z.array(TitledIconItem).optional(),
    businessImpact: z.array(TitledIconItem).optional(),
    platform: z.array(TitledIconItem).optional(),
    // Team & Org Building block (heading set in LeadershipPhilosophy.astro)
    peopleMentoring: z.array(TitledIconItem).optional(),
    governanceAI: z.array(TitledIconItem).optional(),
    governancePrivacy: z.array(TitledIconItem).optional(),
    governanceGxP: z.array(TitledIconItem).optional(),
  }),
  contactIntro: z.string().optional(),
  contactPage: z.object({
    title: z.string(),
    titleHighlight: z.string().optional(),
    eyebrow: z.string(),
    responseTime: z.string(),
    connectHeading: z.string(),
    bookCallLabel: z.string(),
    bookingHref: z.string().nullable().optional(),
  }),
  photo: z.string().optional(),
  greeting: z.string().optional(),
  availability: z
    .object({
      status: z.enum(['available', 'limited', 'closed']),
      label: z.string(),
    })
    .optional(),
  portrait: z
    .object({
      src: z.string(),
      alt: z.string(),
      webp: z.string().optional(),
      avif: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  contact: z.array(
    z.object({
      type: contactTypeSchema,
      label: z.string(),
      value: z.string(),
      href: z.string().nullable(),
      icon: iconNameSchema,
    })
  ),
});

/* ── collaborations.json ───────────────────────────────────────────────── */
export const collaborationsSchema = z.object({
  title: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      logo: z.string().optional(),
      entity: EntitySlug,
      detail: z.string().optional(),
    })
  ),
});

export type MetricItem = z.infer<typeof MetricItem>;
export type Profile = z.infer<typeof profileSchema>;
export type Collaborations = z.infer<typeof collaborationsSchema>;
export type ContactItem = Profile['contact'][number];
