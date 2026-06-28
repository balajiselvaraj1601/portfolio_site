import fs from 'node:fs';
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
  speakersSchema,
  kaggleSchema,
  collaborationsSchema,
  entitiesSchema,
} from '@schemas';

import siteRaw from '@content/site.json';
import profileRaw from '@content/person/profile.json';
import collaborationsRaw from '@content/person/collaborations.json';
import strategicImpactRaw from '@content/work/strategic-impact.json';
import visionBoardRaw from '@content/work/vision-board.json';
import experienceRaw from '@content/work/experience.json';
import projectsRaw from '@content/work/projects.json';
import skillsRaw from '@content/work/skills.json';
import mentorshipRaw from '@content/work/mentorship.json';
import publicationsRaw from '@content/research/publications.json';
import conferencesRaw from '@content/research/conferences.json';
import speakersRaw from '@content/research/speakers.json';
import educationRaw from '@content/recognition/education.json';
import awardsRaw from '@content/recognition/awards.json';
import kaggleRaw from '@content/recognition/kaggle.json';
import entitiesRaw from '@content/entities.json';

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
  speakersSchema,
  speakersRaw
);
export const kaggle = load('recognition/kaggle.json', kaggleSchema, kaggleRaw);
export const collaborations = load(
  'person/collaborations.json',
  collaborationsSchema,
  collaborationsRaw
);
export const entities = load('entities.json', entitiesSchema, entitiesRaw);

/** Resolve a canonical entity URL from a content slug (or logo slug). */
export function getEntityUrl(slug?: string): string | undefined {
  if (!slug) return undefined;
  return entities[slug]?.url;
}

/** Resolve a canonical entity display name from a content slug. */
export function getEntityName(slug?: string): string | undefined {
  if (!slug) return undefined;
  return entities[slug]?.name;
}

// Preference order: PNG first (logos are shipped as PNG), then other formats.
// The filesystem is the single source of truth for which logo assets exist
// (scanned once at build).
const LOGO_EXTS = ['png', 'svg', 'webp', 'avif'] as const;
const logoFiles = new Set(fs.readdirSync('public/assets/logos'));

/** Resolve a logo URL from a slug, picking the best available extension. */
export function logoSrc(slug?: string): string | undefined {
  if (!slug) return undefined;
  for (const ext of LOGO_EXTS) {
    if (logoFiles.has(`${slug}.${ext}`)) return `/assets/logos/${slug}.${ext}`;
  }
  return undefined;
}
export const sectionData = {
  hero: profile,
  thirukural: profile,
  impact: strategicImpact,
  'vision-board': visionBoard,
  leadership: profile,
  skills,
  collaborations,
  experience,
  'experience-intro': experience,
  projects,
  'projects-intro': projects,
  'featured-case-studies': projects,
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

type ContentPageEntry = Extract<(typeof site.pages)[number], { external?: false }>;

function isContentPage(
  p: (typeof site.pages)[number]
): p is ContentPageEntry {
  return !('external' in p && p.external);
}

const homePage = site.pages.find(
  (p): p is ContentPageEntry => isContentPage(p) && p.id === 'home'
);
if (!homePage) throw new Error('site.json: missing home page');

/** Full ordered section list rendered on `/`. */
export const homeSections = homePage.sections.filter(
  (id) => site.sections[id]?.visible !== false
);

/** Nav views — content pages with view metadata for section filtering. */
export const navViews = site.pages.flatMap((p) => {
  if (!isContentPage(p) || !p.viewSections?.length) return [];
  const viewAnchor = p.viewAnchor ?? p.id;
  return [
    {
      id: p.id,
      label: p.label,
      path: p.path,
      viewAnchor,
      viewSections: p.viewSections.filter(
        (id) => site.sections[id]?.visible !== false
      ),
    },
  ];
});

/** Map each section id to the page view ids that include it. */
export const sectionViewMap: Record<string, string[]> = {};
for (const view of navViews) {
  for (const sectionId of view.viewSections) {
    if (!sectionViewMap[sectionId]) sectionViewMap[sectionId] = [];
    if (!sectionViewMap[sectionId].includes(view.viewAnchor)) {
      sectionViewMap[sectionId].push(view.viewAnchor);
    }
  }
}

// Validate view wiring at build time.
const homeSectionSet = new Set(homeSections);
for (const view of navViews) {
  for (const sectionId of view.viewSections) {
    if (!homeSectionSet.has(sectionId)) {
      throw new Error(
        `site.json: view "${view.id}" references section "${sectionId}" not in home.sections`
      );
    }
  }
}
for (const sectionId of homeSections) {
  if (!sectionViewMap[sectionId]?.length) {
    throw new Error(
      `site.json: home section "${sectionId}" is not assigned to any viewSections`
    );
  }
}

/** Resolve a nav href for a content page (hash on home for views). */
export function navHref(page: ContentPageEntry): string {
  if (page.id === 'home') return '/';
  const anchor = page.viewAnchor ?? page.id;
  return `/#${anchor}`;
}
