import { z } from 'zod';

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

export type Site = z.infer<typeof siteSchema>;
export type Page = Site['pages'][number];
