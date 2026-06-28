import { z } from 'zod';
import { iconNameSchema } from './lib/icons';

/**
 * Zod schemas for every JSON file under `content/`.
 *
 * These are the SINGLE SOURCE OF TRUTH for content shape: all TypeScript types
 * are derived via `z.infer` (never hand-written parallel interfaces), and the
 * loader in `lib/content.ts` validates the JSON against these at build time, so
 * malformed content fails the build instead of shipping broken.
 */

/* ── shared primitives ─────────────────────────────────────────────────── */
const TextItem = z.object({ text: z.string() });
const MetricItem = z.object({ value: z.string(), label: z.string() });
const LabeledLink = z.object({
  label: z.string(),
  title: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
  youtube: z.string().url().optional(),
  image: z.string().optional(),
  logo: z.string().optional(),
  logoBadge: z.boolean().optional(),
});
const VariantColor = z.enum(['purple', 'red']);
const EntitySlug = z.string().optional();
const EntityRecord = z.object({
  name: z.string(),
  url: z.string().url(),
});
const PageSeo = z.object({ title: z.string(), description: z.string() });
const ContentPage = z.object({
  id: z.string(),
  label: z.string(),
  path: z.string(),
  external: z.literal(false).optional(),
  seo: PageSeo,
  sections: z.array(z.string()),
});
const ExternalPage = z.object({
  id: z.string(),
  label: z.string(),
  path: z.string(),
  external: z.literal(true),
});

/* ── site.json ─────────────────────────────────────────────────────────── */
export const siteSchema = z.object({
  name: z.string(),
  title: z.string(),
  tagline: z.string(),
  location: z.string(),
  pages: z.array(z.union([ContentPage, ExternalPage])),
  sections: z.record(
    z.object({
      title: z.string(),
      source: z.string(),
      visible: z.boolean(),
    })
  ),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    ogImage: z.string(),
    twitterCard: z.string(),
  }),
  resume: z.object({ label: z.string(), path: z.string() }),
  theme: z.object({
    tokensRef: z.string(),
    default: z.string(),
    modes: z.array(z.string()),
  }),
});

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
      imageAlt: z.string().optional(),
    })
    .optional(),
  metrics: z.array(MetricItem),
  ctas: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
      variant: z.enum(['primary', 'default', 'secondary']).optional(),
    })
  ),
  aboutIntro: z.string(),
  aboutCards: z.array(
    z.object({ title: z.string(), items: z.array(z.string()) })
  ),
  leadershipPhilosophy: z.object({ statement: z.string() }),
  vision: z
    .object({
      heading: z.string(),
      headingEmphasis: z.string().optional(),
      paragraphs: z.array(z.string()),
      collaborations: z.array(
        z.object({ org: z.string(), detail: z.string(), entity: EntitySlug })
      ),
      mentorship: z.string().optional(),
    })
    .optional(),
  contactIntro: z.string().optional(),
  contactQuote: z
    .object({
      text: z.string(),
      author: z.string(),
    })
    .optional(),
  contactPage: z.object({
    title: z.string(),
    titleHighlight: z.string().optional(),
    eyebrow: z.string(),
    responseTime: z.string(),
    connectHeading: z.string(),
    emailButtonLabel: z.string(),
    bookCallLabel: z.string(),
    bookingHref: z.string().nullable().optional(),
    ctaText: z.string(),
    ctaLinkText: z.string(),
    resumeEyebrow: z.string(),
    resumeDescription: z.string(),
    resumeLabel: z.string(),
  }),
  credentialHook: z.string().optional(),
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
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  contact: z.array(
    z.object({
      type: z.string(),
      label: z.string(),
      value: z.string(),
      href: z.string().nullable(),
      icon: iconNameSchema,
    })
  ),
});

/* ── strategic-impact.json ─────────────────────────────────────────────── */
export const impactSchema = z.object({
  title: z.string(),
  headline: z.string().optional(),
  headlineHighlight: z.string().optional(),
  subtitle: z.string().optional(),
  metrics: z.array(MetricItem),
  highlights: z.array(TextItem),
  journey: z
    .array(
      z.object({
        icon: iconNameSchema,
        label: z.string(),
        description: z.string(),
        variant: VariantColor,
      })
    )
    .optional(),
  programs: z
    .array(
      z.object({
        title: z.string(),
        icon: iconNameSchema,
        tag: z.string(),
        tagVariant: VariantColor.optional(),
        cardVariant: VariantColor.optional(),
        bullets: z.array(z.string()),
        entity: EntitySlug,
      })
    )
    .optional(),
  leadershipCards: z
    .array(
      z.object({
        icon: iconNameSchema,
        title: z.string(),
        subtitle: z.string(),
        entity: EntitySlug,
      })
    )
    .optional(),
});

/* ── vision-board.json (Impact infographic page) ───────────────────────── */
// Image-exact copy for the /vision infographic. Intentionally distinct from the
// longer prose in strategic-impact.json — same facts, condensed visual wording.
const VisionMark = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('icon'), name: iconNameSchema }),
  z.object({ kind: z.literal('logo'), asset: z.string(), alt: z.string().optional() }),
]);
export const visionBoardSchema = z.object({
  header: z.string(),
  hubs: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      variant: VariantColor,
      center: VisionMark,
      satellites: z.array(iconNameSchema),
    })
  ),
  programs: z.array(
    z.object({
      title: z.string(),
      label: z.string(),
      variant: VariantColor,
      badge: VisionMark,
      lines: z.array(z.string()),
      entity: EntitySlug,
    })
  ),
  orgHeader: z.string(),
  orgCards: z.array(
    z.object({
      icon: iconNameSchema,
      title: z.string(),
      lines: z.array(z.string()),
    })
  ),
});

/* ── generative-ai / mentorship (text-item lists) ──────────────────────── */
export const textListSchema = z.object({
  title: z.string(),
  items: z.array(TextItem),
});

/* ── experience.json ───────────────────────────────────────────────────── */
export const experienceSchema = z.object({
  title: z.string(),
  intro: z.string().optional(),
  snapshot: z.array(MetricItem).optional(),
  roles: z.array(
    z.object({
      id: z.string(),
      position: z.string(),
      organization: z.string(),
      entity: EntitySlug,
      location: z.string().optional(),
      mission: z.string().optional(),
      tech: z.array(z.string()).optional(),
      period: z.object({
        start: z.string(),
        end: z.string().nullable(),
        endLabel: z.string(),
      }),
      projects: z.array(
        z.object({
          name: z.string().nullable(),
          subtitle: z.string().optional(),
          icon: iconNameSchema.optional(),
          bullets: z.array(
            z.object({
              text: z.string(),
              tier: z.enum(['primary', 'secondary']),
            })
          ),
        })
      ),
    })
  ),
});

/* ── projects.json ─────────────────────────────────────────────────────── */
export const projectsSchema = z.object({
  title: z.string(),
  note: z.string().optional(),
  intro: z.string().optional(),
  snapshot: z.array(MetricItem).optional(),
  projects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      org: z.string(),
      entity: EntitySlug,
      period: z.string(),
      role: z.string(),
      summary: z.string(),
      highlights: z.array(z.string()),
      tags: z.array(z.string()),
      domain: z.string(),
      featured: z.boolean().optional(),
      problem: z.string().optional(),
      solution: z.string().optional(),
      architecture: z.string().optional(),
      businessImpact: z.string().optional(),
      outcome: z.string().optional(),
      lessons: z.string().optional(),
    })
  ),
});

/* ── skills.json ───────────────────────────────────────────────────────── */
export const skillsSchema = z.object({
  title: z.string(),
  categories: z.array(
    z.object({ label: z.string(), skills: z.array(z.string()) })
  ),
});

/* ── education.json ────────────────────────────────────────────────────── */
export const educationSchema = z.object({
  title: z.string(),
  records: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      entity: EntitySlug,
      period: z.string(),
      gpa: z.string().optional(),
      achievement: z.string().optional(),
    })
  ),
});

/* ── awards.json ───────────────────────────────────────────────────────── */
export const awardsSchema = z.object({
  title: z.string(),
  items: z.array(
    z.object({
      label: z.string(),
      detail: z.string(),
      variant: z.enum(['purple', 'red', 'gold']).optional(),
    })
  ),
});

/* ── publications.json / conferences.json (labeled external links) ─────── */
export const linkListSchema = z.object({
  title: z.string(),
  items: z.array(LabeledLink),
});

const SpeakingEngagement = z.object({
  role: z.string(),
  event: z.string(),
  location: z.string(),
  date: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string().url(),
  youtube: z.string().url().optional(),
  image: z.string().optional(),
  logo: z.string().optional(),
  logoBadge: z.boolean().optional(),
});

export const speakersSchema = z.object({
  title: z.string(),
  items: z.array(SpeakingEngagement),
});

/* ── kaggle.json ───────────────────────────────────────────────────────── */
export const kaggleSchema = z.object({
  title: z.string(),
  profile: z.string().url(),
  rank: z.string(),
  rankDenominator: z.string().optional(),
  rankDetail: z.string().optional(),
  headline: z.string().optional(),
  description: z.string().optional(),
  items: z.array(z.object({ label: z.string(), url: z.string().url() })),
});

/* ── entities.json ─────────────────────────────────────────────────────── */
export const entitiesSchema = z.record(z.string(), EntityRecord);

/* ── collaborations.json ───────────────────────────────────────────────── */
export const collaborationsSchema = z.object({
  title: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      logo: z.string().optional(),
      entity: EntitySlug,
    })
  ),
});

/* ── derived types (SSOT → z.infer, no parallel interfaces) ────────────── */
export type Site = z.infer<typeof siteSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Impact = z.infer<typeof impactSchema>;
export type VisionBoard = z.infer<typeof visionBoardSchema>;
export type TextList = z.infer<typeof textListSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Projects = z.infer<typeof projectsSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Awards = z.infer<typeof awardsSchema>;
export type LinkList = z.infer<typeof linkListSchema>;
export type Speakers = z.infer<typeof speakersSchema>;
export type Kaggle = z.infer<typeof kaggleSchema>;
export type Collaborations = z.infer<typeof collaborationsSchema>;
export type Entities = z.infer<typeof entitiesSchema>;
export type EntityRecord = z.infer<typeof EntityRecord>;

export type Page = Site['pages'][number];
export type ContactItem = Profile['contact'][number];
export type Role = Experience['roles'][number];
export type Project = Projects['projects'][number];
