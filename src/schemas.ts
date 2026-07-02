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
export const MetricItem = z.object({
  value: z.string(),
  label: z.string(),
  detail: z.string().optional(),
});
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
  viewSections: z.array(z.string()).optional(),
  viewAnchor: z.string().optional(),
});
// Nav entry that links straight out of the site (e.g. a hosted document or
// external profile). Capability kept even when no external entry is configured.
const ExternalPage = z.object({
  id: z.string(),
  label: z.string(),
  path: z.string(),
  external: z.literal(true),
});

/* ── site.json ─────────────────────────────────────────────────────────── */
export const siteSchema = z
  .object({
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
        eyebrow: z.string().optional(),
      })
    ),
    seo: z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
      ogImage: z.string(),
      twitterCard: z.string(),
    }),
    theme: z.object({
      tokensRef: z.string(),
      default: z.string(),
      modes: z.array(z.string()),
    }),
  })
  .superRefine((data, ctx) => {
    for (const page of data.pages) {
      if ('external' in page && page.external) continue;

      if (!page.viewSections?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `site.json: page "${page.id}" must define viewSections`,
        });
        continue;
      }

      for (const sectionId of page.viewSections) {
        if (!data.sections[sectionId]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `site.json: page "${page.id}" viewSections references unknown section "${sectionId}"`,
          });
        }
      }
    }
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
      icon: iconNameSchema.optional(),
    })
  ),
  leadershipPhilosophy: z.object({
    intro: z.string().optional(),
    blockHeadings: z.object({
      strategicVision: z.string(),
      businessImpact: z.string(),
      platform: z.string(),
      peopleMentoring: z.string(),
      governanceAI: z.string(),
      governancePrivacy: z.string(),
      governanceGxP: z.string(),
    }),
    strategicVision: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: iconNameSchema.optional(),
        })
      )
      .optional(),
    businessImpact: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: iconNameSchema.optional(),
        })
      )
      .optional(),
    platform: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: iconNameSchema.optional(),
        })
      )
      .optional(),
    // Team & Org Building block (heading set in LeadershipPhilosophy.astro)
    peopleMentoring: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: iconNameSchema.optional(),
        })
      )
      .optional(),
    governanceAI: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: iconNameSchema.optional(),
        })
      )
      .optional(),
    governancePrivacy: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: iconNameSchema.optional(),
        })
      )
      .optional(),
    governanceGxP: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: iconNameSchema.optional(),
        })
      )
      .optional(),
  }),
  vision: z
    .object({
      heading: z.string(),
      headingEmphasis: z.string().optional(),
      paragraphs: z.array(z.string()),
      collaborations: z
        .array(
          z.object({ org: z.string(), detail: z.string(), entity: EntitySlug })
        )
        .optional(),
      mentorship: z.string().optional(),
    })
    .optional(),
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

/* ── vision-board.json ─────────────────────────────────────────────────── */
const VisionMark = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('icon'), name: iconNameSchema }),
  z.object({
    kind: z.literal('logo'),
    asset: z.string(),
    alt: z.string().optional(),
  }),
]);
export type VisionMark = z.infer<typeof VisionMark>;
export const visionBoardSchema = z.object({
  header: z.string(),
  eyebrow: z.string().optional(),
  intro: z.string().optional(),
  hubs: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      variant: VariantColor,
      center: VisionMark,
      satellites: z.array(VisionMark),
    })
  ),
  programs: z
    .array(
      z.object({
        title: z.string(),
        label: z.string(),
        variant: VariantColor,
        badge: VisionMark,
        lines: z.array(z.string()),
        entity: EntitySlug,
      })
    )
    .optional(),
  orgHeader: z.string().optional(),
  orgCards: z
    .array(
      z.object({
        mark: VisionMark,
        title: z.string(),
        lines: z.array(z.string()),
      })
    )
    .optional(),
  principles: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        icon: iconNameSchema.optional(),
      })
    )
    .optional(),
  quote: z
    .object({
      tamil: z.string().optional(),
      translation: z.string(),
      author: z.string(),
      image: z.string().optional(),
      imageAlt: z.string().optional(),
    })
    .optional(),
  technicalVision: z
    .object({
      heading: z.string(),
      headingEmphasis: z.string().optional(),
      paragraphs: z.array(z.string()),
    })
    .optional(),
});

/* ── generative-ai (text-item list) ────────────────────────────────────── */
export const textListSchema = z.object({
  title: z.string(),
  items: z.array(TextItem),
});

/* ── experience.json ───────────────────────────────────────────────────── */
export const experienceSchema = z.object({
  title: z.string(),
  intro: z.string().optional(),
  headline: z.string().optional(),
  headlineHighlight: z.string().optional(),
  snapshot: z.array(MetricItem).optional(),
  roles: z.array(
    z.object({
      id: z.string(),
      position: z.string(),
      organization: z.string(),
      entity: EntitySlug,
      location: z.string().optional(),
      mission: z.string().optional(),
      blurb: z.string().optional(),
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
  groups: z
    .array(
      z.object({
        id: z.string(),
        heading: z.string(),
      })
    )
    .optional(),
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
      group: z.string().optional(),
      icon: iconNameSchema.optional(),
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

/* ── education.json ────────────────────────────────────────────────────── */
export const educationRecordSchema = z.object({
  id: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  institution: z.string(),
  entity: EntitySlug,
  period: z.string(),
  gpa: z.string().optional(),
  achievement: z.string().optional(),
  achievementDetail: z.string().optional(),
  summary: z.string().optional(),
});

export const educationSchema = z.object({
  title: z.string(),
  intro: z.string().optional(),
  records: z.array(educationRecordSchema).min(1).max(1),
});

/* ── awards.json ───────────────────────────────────────────────────────── */
// SSOT for the six nominator levels — drives summary tile grouping, accent
// colors, and the filter controls in Awards.astro.
export const awardLevelSchema = z.enum([
  'EVP',
  'CIO',
  'Senior Director',
  'Director',
  'Associate Director',
  'National Level',
]);
export const awardsSchema = z.object({
  title: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      nominator: z.string(),
      designation: z.string(),
      level: awardLevelSchema,
      awardType: z.string(),
      reason: z.string(),
      date: z.string().optional(), // some awards (e.g. academic) have no recorded date
      dateSort: z.string().optional(), // ISO YYYY-MM-DD, retained for reference
      rank: z.number().int().positive(), // within-level impact rank (1 = highest)
      message: z.string(),
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
  dateSort: z.string().optional(),
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
// SSOT for the medal tiers earned — drives the medal field and filter chips.
export const kaggleMedalSchema = z.enum(['Silver', 'Bronze']);
// Export the medal enum values as a tuple for use in filter chips and card logic.
export const MEDALS = ['Silver', 'Bronze'] as const;
const KaggleCompetitionStats = z.object({
  prizePool: z.string(),
  entrants: z.string(),
  submissions: z.string(),
});

export const kaggleCompetitionSchema = z.object({
  id: z.string(),
  compId: z.string(),
  name: z.string(),
  url: z.string().url(),
  icon: iconNameSchema,
  year: z.number(),
  period: z.string(),
  role: z.string(),
  medal: kaggleMedalSchema,
  rank: z.string(),
  percentile: z.string(),
  summary: z.string(),
  problem: z.string(),
  solution: z.string(),
  architecture: z.string().optional(),
  outcome: z.string(),
  lessons: z.string().optional(),
  evaluationMetric: z.string().optional(),
  realWorldImpact: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  tags: z.array(z.string()),
  domain: z.string(),
  stats: KaggleCompetitionStats.optional(),
  teamMembers: z.array(z.string()).optional(),
  conferenceTrack: z.string().optional(),
});

export const kaggleSchema = z.object({
  title: z.string(),
  profile: z.string().url(),
  rank: z.string(),
  rankDenominator: z.string().optional(),
  rankDetail: z.string().optional(),
  headline: z.string().optional(),
  description: z.string().optional(),
  items: z.array(kaggleCompetitionSchema),
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
      detail: z.string().optional(),
    })
  ),
});

/* ── derived types (SSOT → z.infer, no parallel interfaces) ────────────── */
export type MetricItem = z.infer<typeof MetricItem>;
export type Site = z.infer<typeof siteSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Impact = z.infer<typeof impactSchema>;
export type VisionBoard = z.infer<typeof visionBoardSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Projects = z.infer<typeof projectsSchema>;
export type Education = z.infer<typeof educationSchema>;
export type EducationRecord = z.infer<typeof educationRecordSchema>;
export type Awards = z.infer<typeof awardsSchema>;
export type AwardLevel = z.infer<typeof awardLevelSchema>;
export type LinkList = z.infer<typeof linkListSchema>;
export type Speakers = z.infer<typeof speakersSchema>;
export type Kaggle = z.infer<typeof kaggleSchema>;
export type KaggleCompetition = z.infer<typeof kaggleCompetitionSchema>;
export type KaggleMedal = z.infer<typeof kaggleMedalSchema>;
export type Collaborations = z.infer<typeof collaborationsSchema>;
export type Entities = z.infer<typeof entitiesSchema>;
export type EntityRecord = z.infer<typeof EntityRecord>;

export type Page = Site['pages'][number];
export type ContactItem = Profile['contact'][number];
export type Role = Experience['roles'][number];
export type Project = Projects['projects'][number];
