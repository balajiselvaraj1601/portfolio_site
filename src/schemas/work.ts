import { z } from 'zod';
import { iconNameSchema } from '../lib/icons';
import { EntitySlug } from './shared';

/** Categorical accent keys — map to --cat-* tokens in global.css (shared with About leadership). */
export const visionAccentSchema = z.enum([
  'impact', // gold   — Business & P&L, EVP, Education, Speakers
  'strategic', // blue   — Strategy & sponsorship, Conferences
  'platform', // teal   — Platform & infrastructure, Publications
  'people', // pink   — Team & org building
  'ai', // purple — AI governance (site default)
  'privacy', // red    — Privacy / high-stakes initiatives
  'gxp', // green  — GxP compliance
  'silver', // silver — Medal / recognition
]);
export type VisionAccent = z.infer<typeof visionAccentSchema>;

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
  intro: z.string(),
  groups: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      accent: visionAccentSchema,
      lead: VisionMark,
      marks: z.array(VisionMark),
    })
  ),
  programs: z.array(
    z.object({
      title: z.string(),
      label: z.string(),
      accent: visionAccentSchema,
      badge: VisionMark,
      lines: z.array(z.string()),
      entity: EntitySlug,
    })
  ),
  orgCards: z.array(
    z.object({
      accent: visionAccentSchema.optional(),
      mark: VisionMark,
      title: z.string(),
      lines: z.array(z.string()),
    })
  ),
});

/* ── experience.json ───────────────────────────────────────────────────── */
// Career seniority ladder (present → past). Drives per-role accent colour via
// the .xp-level-* class map in Experience.astro (reuses the --lvl-* hue tokens).
export const xpLevelSchema = z.enum([
  'principal', // AI Associate Principal
  'staff', // Senior Consultant L2
  'senior', // Senior Consultant L1
  'lead', // Lead Engineer
  'associate', // Project Associate
  'engineer', // Clinical Application Engineer
]);

export const experienceSchema = z.object({
  title: z.string(),
  intro: z.string().optional(),
  roles: z.array(
    z.object({
      id: z.string(),
      position: z.string(),
      organization: z.string(),
      orgShort: z.string().optional(),
      level: xpLevelSchema.optional(),
      entity: EntitySlug,
      location: z.string().optional(),
      blurb: z.string().optional(),
      tech: z.array(z.string()).optional(),
      period: z.object({
        start: z.string(),
        end: z.string().nullable(),
        endLabel: z.string(),
      }),
      projects: z.array(
        z.object({
          name: z.string(),
          shortName: z.string().optional(),
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

export type VisionBoard = z.infer<typeof visionBoardSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Role = Experience['roles'][number];
