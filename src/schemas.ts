import { z } from 'zod';

/**
 * Zod schemas for every `content/*.json` file.
 *
 * These are the SINGLE SOURCE OF TRUTH for content shape: all TypeScript types
 * are derived via `z.infer` (never hand-written parallel interfaces), and the
 * loader in `lib/content.ts` validates the JSON against these at build time, so
 * malformed content fails the build instead of shipping broken.
 */

/* ── shared primitives ─────────────────────────────────────────────────── */
const TextItem = z.object({ text: z.string() });
const LabeledLink = z.object({
  label: z.string(),
  title: z.string(),
  url: z.string().url(),
});

/* ── site.json ─────────────────────────────────────────────────────────── */
export const siteSchema = z.object({
  name: z.string(),
  title: z.string(),
  tagline: z.string(),
  location: z.string(),
  nav: z.array(z.object({ id: z.string(), label: z.string() })),
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
  summary: z.array(z.string()),
  contact: z.array(
    z.object({
      type: z.string(),
      label: z.string(),
      value: z.string(),
      href: z.string().nullable(),
      icon: z.string(),
    })
  ),
});

/* ── strategic-impact / generative-ai / mentorship (text-item lists) ───── */
export const textListSchema = z.object({
  title: z.string(),
  items: z.array(TextItem),
});

/* ── experience.json ───────────────────────────────────────────────────── */
export const experienceSchema = z.object({
  title: z.string(),
  roles: z.array(
    z.object({
      position: z.string(),
      organization: z.string(),
      period: z.object({
        start: z.string(),
        end: z.string().nullable(),
        endLabel: z.string(),
      }),
      projects: z.array(
        z.object({
          name: z.string().nullable(),
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
  projects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      org: z.string(),
      period: z.string(),
      role: z.string(),
      summary: z.string(),
      highlights: z.array(z.string()),
      tags: z.array(z.string()),
      domain: z.string(),
    })
  ),
});

/* ── skills.json ───────────────────────────────────────────────────────── */
export const skillsSchema = z.object({
  title: z.string(),
  note: z.string().optional(),
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
      period: z.string(),
      gpa: z.string().optional(),
      achievement: z.string().optional(),
    })
  ),
});

/* ── awards.json ───────────────────────────────────────────────────────── */
export const awardsSchema = z.object({
  title: z.string(),
  items: z.array(z.object({ label: z.string(), detail: z.string() })),
});

/* ── publications.json / conferences.json (labeled external links) ─────── */
export const linkListSchema = z.object({
  title: z.string(),
  items: z.array(LabeledLink),
});

/* ── kaggle.json ───────────────────────────────────────────────────────── */
export const kaggleSchema = z.object({
  title: z.string(),
  profile: z.string().url(),
  rank: z.string(),
  items: z.array(z.object({ label: z.string(), url: z.string().url() })),
});

/* ── derived types (SSOT → z.infer, no parallel interfaces) ────────────── */
export type Site = z.infer<typeof siteSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type TextList = z.infer<typeof textListSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Projects = z.infer<typeof projectsSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Awards = z.infer<typeof awardsSchema>;
export type LinkList = z.infer<typeof linkListSchema>;
export type Kaggle = z.infer<typeof kaggleSchema>;

export type NavItem = Site['nav'][number];
export type ContactItem = Profile['contact'][number];
export type Role = Experience['roles'][number];
export type Project = Projects['projects'][number];
