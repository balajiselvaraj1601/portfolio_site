import type { z } from 'zod';
import {
  siteSchema,
  profileSchema,
  impactSchema,
  visionBoardSchema,
  textListSchema,
  experienceSchema,
  projectsSchema,
  skillsSchema,
  educationSchema,
  awardsSchema,
  linkListSchema,
  kaggleSchema,
  affiliationsSchema,
} from '@schemas';

import siteRaw from '@content/site.json';
import profileRaw from '@content/person/profile.json';
import affiliationsRaw from '@content/person/affiliations.json';
import strategicImpactRaw from '@content/work/strategic-impact.json';
import visionBoardRaw from '@content/work/vision-board.json';
import experienceRaw from '@content/work/experience.json';
import projectsRaw from '@content/work/projects.json';
import skillsRaw from '@content/work/skills.json';
import mentorshipRaw from '@content/work/mentorship.json';
import generativeAiRaw from '@content/research/generative-ai.json';
import publicationsRaw from '@content/research/publications.json';
import conferencesRaw from '@content/research/conferences.json';
import speakersRaw from '@content/research/speakers.json';
import educationRaw from '@content/recognition/education.json';
import awardsRaw from '@content/recognition/awards.json';
import kaggleRaw from '@content/recognition/kaggle.json';

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
export const profile = load('person/profile.json', profileSchema, profileRaw);
export const strategicImpact = load(
  'work/strategic-impact.json',
  impactSchema,
  strategicImpactRaw
);
export const visionBoard = load(
  'work/vision-board.json',
  visionBoardSchema,
  visionBoardRaw
);
export const experience = load(
  'work/experience.json',
  experienceSchema,
  experienceRaw
);
export const projects = load('work/projects.json', projectsSchema, projectsRaw);
export const generativeAi = load(
  'research/generative-ai.json',
  textListSchema,
  generativeAiRaw
);
export const skills = load('work/skills.json', skillsSchema, skillsRaw);
export const mentorship = load(
  'work/mentorship.json',
  textListSchema,
  mentorshipRaw
);
export const education = load(
  'recognition/education.json',
  educationSchema,
  educationRaw
);
export const awards = load('recognition/awards.json', awardsSchema, awardsRaw);
export const publications = load(
  'research/publications.json',
  linkListSchema,
  publicationsRaw
);
export const conferences = load(
  'research/conferences.json',
  linkListSchema,
  conferencesRaw
);
export const speakers = load(
  'research/speakers.json',
  linkListSchema,
  speakersRaw
);
export const kaggle = load('recognition/kaggle.json', kaggleSchema, kaggleRaw);
export const affiliations = load(
  'person/affiliations.json',
  affiliationsSchema,
  affiliationsRaw
);

export const sectionData = {
  hero: profile,
  about: profile,
  impact: strategicImpact,
  vision: profile,
  'vision-board': visionBoard,
  'featured-projects': projects,
  leadership: profile,
  skills,
  timeline: experience,
  affiliations,
  'featured-publications': publications,
  'contact-teaser': profile,
  experience,
  'experience-intro': experience,
  projects,
  'projects-intro': projects,
  'featured-case-studies': projects,
  'generative-ai': generativeAi,
  mentorship,
  education,
  awards,
  publications,
  conferences,
  speakers,
  kaggle,
  contact: profile,
} as const;

/** Content-driven pages only — excludes external nav entries (e.g. Resume PDF). */
export const pages = site.pages.flatMap((p) => {
  if (p.external) return [];

  return [
    {
      ...p,
      sections: p.sections.filter((id) => site.sections[id]?.visible !== false),
    },
  ];
});

/** All nav entries including external links. */
export const navItems = site.pages;
