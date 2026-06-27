import type { z } from 'zod';
import {
  siteSchema,
  profileSchema,
  textListSchema,
  experienceSchema,
  projectsSchema,
  skillsSchema,
  educationSchema,
  awardsSchema,
  linkListSchema,
  kaggleSchema,
} from '@schemas';

// Raw JSON imports (resolveJsonModule). `content/` is the SSOT; these are the
// only places the JSON enters the app.
import siteRaw from '@content/site.json';
import profileRaw from '@content/profile.json';
import strategicImpactRaw from '@content/strategic-impact.json';
import experienceRaw from '@content/experience.json';
import projectsRaw from '@content/projects.json';
import generativeAiRaw from '@content/generative-ai.json';
import skillsRaw from '@content/skills.json';
import mentorshipRaw from '@content/mentorship.json';
import educationRaw from '@content/education.json';
import awardsRaw from '@content/awards.json';
import publicationsRaw from '@content/publications.json';
import conferencesRaw from '@content/conferences.json';
import kaggleRaw from '@content/kaggle.json';

/**
 * Parse-or-throw: validates raw JSON against its schema. A failure here fails
 * `astro build` with a precise path to the offending field — content drift is
 * caught at build time, never shipped.
 */
function load<T extends z.ZodTypeAny>(
  name: string,
  schema: T,
  raw: unknown
): z.infer<T> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid content in ${name}:\n${issues}`);
  }
  return result.data;
}

export const site = load('site.json', siteSchema, siteRaw);
export const profile = load('profile.json', profileSchema, profileRaw);
export const strategicImpact = load(
  'strategic-impact.json',
  textListSchema,
  strategicImpactRaw
);
export const experience = load(
  'experience.json',
  experienceSchema,
  experienceRaw
);
export const projects = load('projects.json', projectsSchema, projectsRaw);
export const generativeAi = load(
  'generative-ai.json',
  textListSchema,
  generativeAiRaw
);
export const skills = load('skills.json', skillsSchema, skillsRaw);
export const mentorship = load(
  'mentorship.json',
  textListSchema,
  mentorshipRaw
);
export const education = load('education.json', educationSchema, educationRaw);
export const awards = load('awards.json', awardsSchema, awardsRaw);
export const publications = load(
  'publications.json',
  linkListSchema,
  publicationsRaw
);
export const conferences = load(
  'conferences.json',
  linkListSchema,
  conferencesRaw
);
export const kaggle = load('kaggle.json', kaggleSchema, kaggleRaw);

/**
 * Map of section id → content for that section, used by index.astro to render
 * sections in the order declared by `site.json.nav` (order never hardcoded).
 */
export const sectionData = {
  hero: profile,
  about: profile,
  impact: strategicImpact,
  experience,
  projects,
  'generative-ai': generativeAi,
  skills,
  mentorship,
  education,
  awards,
  publications,
  conferences,
  kaggle,
  contact: profile,
} as const;

/** Only sections marked visible in site.json, in nav order. */
export const visibleNav = site.nav.filter(
  (item) => site.sections[item.id]?.visible !== false
);
