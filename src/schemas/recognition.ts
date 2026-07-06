import { z } from 'zod';
import { iconNameSchema } from '../lib/icons';
import { EntitySlug } from './shared';

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

/* ── kaggle.json ───────────────────────────────────────────────────────── */
// SSOT for the medal tiers earned — drives the medal field and filter chips.
export const kaggleMedalSchema = z.enum(['Silver', 'Bronze']);
// Export the medal enum values as a tuple for use in filter chips and card logic.
export const MEDALS = kaggleMedalSchema.options;
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
  logo: z.string().optional(),
  year: z.number(),
  period: z.string(),
  role: z.string(),
  medal: kaggleMedalSchema,
  rank: z.string(),
  percentile: z.string(),
  summary: z.string(),
  problem: z.string(),
  solution: z.string(),
  outcome: z.string(),
  evaluationMetric: z.string().optional(),
  realWorldImpact: z.string().optional(),
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
  description: z.string().optional(),
  items: z.array(kaggleCompetitionSchema),
});

export type Education = z.infer<typeof educationSchema>;
export type EducationRecord = z.infer<typeof educationRecordSchema>;
export type Awards = z.infer<typeof awardsSchema>;
export type AwardLevel = z.infer<typeof awardLevelSchema>;
export type Kaggle = z.infer<typeof kaggleSchema>;
export type KaggleCompetition = z.infer<typeof kaggleCompetitionSchema>;
export type KaggleMedal = z.infer<typeof kaggleMedalSchema>;
