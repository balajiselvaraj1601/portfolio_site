import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { z } from 'zod';
import iconPaths from './icon-paths.json';
import { iconNameSchema } from './icons';
import { SECTION_COMPONENT_ID_SET } from './section-ids';
import {
  siteSchema,
  profileSchema,
  impactSchema,
  visionBoardSchema,
  experienceSchema,
  projectsSchema,
  educationSchema,
  awardsSchema,
  linkListSchema,
  speakersSchema,
  kaggleSchema,
  collaborationsSchema,
  entitiesSchema,
  textListSchema,
} from '@schemas';

import siteRaw from '@content/site.json';
import profileRaw from '@content/person/profile.json';
import collaborationsRaw from '@content/person/collaborations.json';
import strategicImpactRaw from '@content/work/strategic-impact.json';
import visionBoardRaw from '@content/work/vision-board.json';
import experienceRaw from '@content/work/experience.json';
import projectsRaw from '@content/work/projects.json';
import publicationsRaw from '@content/research/publications.json';
import conferencesRaw from '@content/research/conferences.json';
import speakersRaw from '@content/research/speakers.json';
import educationRaw from '@content/recognition/education.json';
import awardsRaw from '@content/recognition/awards.json';
import kaggleRaw from '@content/recognition/kaggle.json';
import entitiesRaw from '@content/entities.json';
import generativeAiRaw from '@content/drafts/research/generative-ai.json';

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
export const generativeAi = load(
  'drafts/research/generative-ai.json',
  textListSchema,
  generativeAiRaw
);

/** Resolve a canonical entity URL from a content slug (or logo slug). */
export function getEntityUrl(slug?: string): string | undefined {
  if (!slug) return undefined;
  return entities[slug]?.url;
}

// Preference order: PNG first (logos are shipped as PNG), then other formats.
// The filesystem is the single source of truth for which logo assets exist
// (scanned once at build).
const LOGO_EXTS = ['png', 'svg', 'webp', 'avif'] as const;
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const logoFiles = new Set(
  fs.readdirSync(path.join(repoRoot, 'public/assets/logos'))
);

/** Resolve a logo URL from a slug, picking the best available extension. */
export function logoSrc(slug?: string): string | undefined {
  if (!slug) return undefined;
  for (const ext of LOGO_EXTS) {
    if (logoFiles.has(`${slug}.${ext}`)) return `/assets/logos/${slug}.${ext}`;
  }
  return undefined;
}
/** Content-driven pages only — excludes external nav entries (e.g. a link to an external profile). */
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

type ContentPageEntry = Extract<
  (typeof site.pages)[number],
  { external?: false }
>;

function isContentPage(p: (typeof site.pages)[number]): p is ContentPageEntry {
  return !('external' in p && p.external);
}

export const homePage = site.pages.find(
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

// Each home section must appear in exactly one view.
const sectionViewOwners = new Map<string, string>();
for (const view of navViews) {
  for (const sectionId of view.viewSections) {
    const owner = sectionViewOwners.get(sectionId);
    if (owner) {
      throw new Error(
        `site.json: section "${sectionId}" is assigned to both "${owner}" and "${view.id}" viewSections`
      );
    }
    sectionViewOwners.set(sectionId, view.id);
  }
}

// Every rendered home section needs a SectionRenderer component.
for (const sectionId of homeSections) {
  if (!SECTION_COMPONENT_ID_SET.has(sectionId)) {
    throw new Error(
      `site.json: home section "${sectionId}" has no component in SectionRenderer`
    );
  }
}

const entityKeys = new Set(Object.keys(entities));
function assertEntitySlug(slug: string | undefined, context: string) {
  if (!slug) return;
  if (!entityKeys.has(slug)) {
    throw new Error(`${context}: unknown entity slug "${slug}"`);
  }
}

for (const role of experience.roles) {
  assertEntitySlug(role.entity, 'work/experience.json');
}
for (const project of projects.projects) {
  assertEntitySlug(project.entity, 'work/projects.json');
}
for (const item of collaborations.items) {
  assertEntitySlug(item.entity, 'person/collaborations.json');
}
for (const record of education.records) {
  assertEntitySlug(record.entity, 'recognition/education.json');
}
for (const program of visionBoard.programs ?? []) {
  assertEntitySlug(program.entity, 'work/vision-board.json programs');
}
for (const card of strategicImpact.leadershipCards ?? []) {
  assertEntitySlug(card.entity, 'work/strategic-impact.json');
}
for (const collab of profile.vision?.collaborations ?? []) {
  assertEntitySlug(collab.entity, 'person/profile.json vision.collaborations');
}

function assertLogoAsset(slug: string, context: string) {
  for (const ext of LOGO_EXTS) {
    if (logoFiles.has(`${slug}.${ext}`)) return;
  }
  throw new Error(`${context}: missing logo asset "${slug}" under public/assets/logos/`);
}

type VisionMark = { kind: string; asset?: string; name?: string };

function collectVisionMarks(marks: VisionMark[] | undefined, out: Set<string>) {
  for (const mark of marks ?? []) {
    if (mark.kind === 'logo' && mark.asset) out.add(mark.asset);
  }
}

const referencedLogoSlugs = new Set<string>();

for (const item of collaborations.items) {
  if (item.logo) referencedLogoSlugs.add(item.logo);
}

for (const hub of visionBoard.hubs) {
  collectVisionMarks([hub.center], referencedLogoSlugs);
  collectVisionMarks(hub.satellites, referencedLogoSlugs);
}
for (const program of visionBoard.programs ?? []) {
  collectVisionMarks([program.badge], referencedLogoSlugs);
}
for (const card of visionBoard.orgCards ?? []) {
  collectVisionMarks([card.mark], referencedLogoSlugs);
}

for (const list of [publications.items, conferences.items, speakers.items]) {
  for (const item of list) {
    if (item.logo) referencedLogoSlugs.add(item.logo);
  }
}

for (const slug of referencedLogoSlugs) {
  assertLogoAsset(slug, 'content logo reference');
}

const iconPathKeys = new Set(Object.keys(iconPaths));
for (const iconName of iconNameSchema.options) {
  if (!iconPathKeys.has(iconName)) {
    throw new Error(`icon-paths.json: missing geometry for icon "${iconName}"`);
  }
}

export const defaultTheme = site.theme.default === 'light' ? 'light' : 'dark';

/** Dot-nav tooltips — section title, else owning view label, else id. */
export const dotNavLabels: Record<string, string> = {};
for (const sectionId of homeSections) {
  const title = site.sections[sectionId]?.title?.trim();
  if (title) {
    dotNavLabels[sectionId] = title;
    continue;
  }
  const owner = navViews.find((v) => v.viewSections.includes(sectionId));
  dotNavLabels[sectionId] = owner?.label ?? sectionId;
}

/** Resolve a nav href for a content page (hash on home for views). */
export function navHref(page: ContentPageEntry): string {
  if (page.id === 'home') return '/';
  const anchor = page.viewAnchor ?? page.id;
  return `/#${anchor}`;
}
