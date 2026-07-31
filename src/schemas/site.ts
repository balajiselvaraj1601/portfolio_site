import { z } from 'zod';
import { contactTypeSchema } from './person';
import { enumShape } from './shared';

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
    ui: z.object({
      common: z.object({
        all: z.string(),
        opensInNewWindow: z.string(),
        skipToContent: z.string(),
        watchOnYouTubePrefix: z.string(),
        onYouTubeSuffix: z.string(),
        videoThumbnailPrefix: z.string(),
        videoTitleSuffix: z.string(),
      }),
      header: z.object({
        primaryNavLabel: z.string(),
        savePageLabel: z.string(),
        saveFailedLabel: z.string(),
        openMenuLabel: z.string(),
        closeMenuLabel: z.string(),
      }),
      dotNav: z.object({
        ariaLabel: z.string(),
      }),
      footer: z.object({
        socialLinksLabel: z.string(),
        allRightsReserved: z.string(),
        opensInNewTabSuffix: z.string(),
        backToTop: z.string(),
      }),
      about: z.object({
        filterLabel: z.string(),
      }),
      experience: z.object({
        keyProjectsLabel: z.string(),
        filterProjectsPrefix: z.string(),
      }),
      recognition: z.object({
        cardToggle: z.object({
          details: z.string(),
          hide: z.string(),
        }),
        awards: z.object({
          countLabel: z.string(),
          searchPlaceholder: z.string(),
          searchAriaLabel: z.string(),
          filterGroupLabel: z.string(),
          featuredFilter: z.string(),
          nominatorLabel: z.string(),
          reasonLabel: z.string(),
          dateLabel: z.string(),
          emptyState: z.string(),
        }),
        kaggle: z.object({
          competitionsLabel: z.string(),
          silverLabel: z.string(),
          bronzeLabel: z.string(),
          globalRankLabel: z.string(),
          searchPlaceholder: z.string(),
          searchAriaLabel: z.string(),
          filterGroupLabel: z.string(),
          profileLinkLabel: z.string(),
          emptyState: z.string(),
          summaryLabel: z.string(),
          evaluationMetricLabel: z.string(),
          stats: z.object({
            role: z.string(),
            medal: z.string(),
            rank: z.string(),
            percentile: z.string(),
            period: z.string(),
            totalEntrants: z.string(),
          }),
        }),
        education: z.object({
          institutionLabel: z.string(),
          periodLabel: z.string(),
          gpaLabel: z.string(),
          achievementLabel: z.string(),
        }),
      }),
      contact: z.object({
        // One action label per contact channel type — keys derive from
        // contactTypeSchema (SSOT), so adding a channel type forces a label.
        actions: z.object(enumShape(contactTypeSchema, z.string())),
      }),
      notFound: z.object({
        titleTemplate: z.string(),
        description: z.string(),
        code: z.string(),
        heading: z.string(),
        message: z.string(),
        backHome: z.string(),
        viewExperience: z.string(),
      }),
      redirect: z.object({
        title: z.string(),
      }),
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

export type Site = z.infer<typeof siteSchema>;
export type Page = Site['pages'][number];
