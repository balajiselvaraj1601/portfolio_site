import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { z } from 'zod';
import iconPaths from './icon-paths.json';
import { iconNameSchema } from './icons';
import { SECTION_COMPONENT_ID_SET } from './section-ids';
import { HERO_DOT_ID, HOME_PAGE_ID, viewHash } from './views';
import {
  siteSchema,
  profileSchema,
  visionBoardSchema,
  experienceSchema,
  educationSchema,
  awardsSchema,
  linkListSchema,
  speakersSchema,
  kaggleSchema,
  collaborationsSchema,
  entitiesSchema,
} from '@schemas';
import type { VisionMark } from '@schemas';

import siteRaw from '@content/site.json';
import profileRaw from '@content/person/profile.json';
import collaborationsRaw from '@content/person/collaborations.json';
import visionBoardRaw from '@content/work/vision-board.json';
import experienceRaw from '@content/work/experience.json';
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

// Preference order: PNG first (logos are shipped as PNG), then other formats.
// The filesystem is the single source of truth for which logo assets exist
// (scanned once at build).
const LOGO_EXTS = ['png', 'svg', 'webp', 'avif'] as const;
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

// Scan org/, marks/, and the root fallback in priority order.
// Maps "filename.ext" → the URL path ("/assets/logos/sub/file") for that asset.
const LOGO_SUBDIRS = ['org', 'marks', ''] as const;
const logoBase = path.join(repoRoot, 'public/assets/logos');
const logoFiles = new Map<string, string>();
for (const sub of LOGO_SUBDIRS) {
  const dir = sub ? path.join(logoBase, sub) : logoBase;
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (file.startsWith('_') || file.startsWith('.')) continue;
    if (!logoFiles.has(file)) {
      logoFiles.set(
        file,
        sub ? `/assets/logos/${sub}/${file}` : `/assets/logos/${file}`
      );
    }
  }
}

/** Resolve a logo URL from a slug, picking the best available extension. */
export function logoSrc(slug?: string): string | undefined {
  if (!slug) return undefined;
  for (const ext of LOGO_EXTS) {
    const found = logoFiles.get(`${slug}.${ext}`);
    if (found) return found;
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

/** Type guard: internal content-driven page (excludes external nav entries). */
export function isContentPage(
  p: (typeof site.pages)[number]
): p is ContentPageEntry {
  return !('external' in p && p.external);
}

export const homePage = site.pages.find(
  (p): p is ContentPageEntry => isContentPage(p) && p.id === HOME_PAGE_ID
);
if (!homePage) throw new Error('site.json: missing home page');

/** Anchor of the home (About) view — sourced from site.json `viewAnchor`. */
export const homeViewAnchor = homePage.viewAnchor ?? homePage.id;

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

export type DotNavView = {
  id: string;
  label: string;
  scrollSection: string;
};

/** Right-side dot nav — Hero plus each header nav view (7 dots on home). */
export const dotNavViews: DotNavView[] = [
  { id: HERO_DOT_ID, label: 'Hero', scrollSection: 'hero' },
  { id: homeViewAnchor, label: 'About', scrollSection: 'leadership' },
  ...navViews
    .filter((v) => v.id !== HOME_PAGE_ID)
    .map((v) => ({
      id: v.viewAnchor,
      label: v.label,
      scrollSection: v.viewSections[0],
    })),
];

/** Map section id → dot id for scroll-spy (hero band split from About view). */
export const sectionToDotNav: Record<string, string> = {};
for (const sectionId of homeSections) {
  if (sectionId === 'hero' || sectionId === 'thirukural') {
    sectionToDotNav[sectionId] = HERO_DOT_ID;
  } else if (sectionId === 'leadership') {
    sectionToDotNav[sectionId] = homeViewAnchor;
  } else {
    const owner = navViews.find(
      (v) => v.id !== HOME_PAGE_ID && v.viewSections.includes(sectionId)
    );
    if (owner) sectionToDotNav[sectionId] = owner.viewAnchor;
  }
}

const entityKeys = new Set(Object.keys(entities));
function assertEntitySlug(slug: string | undefined, context: string) {
  if (!slug) return;
  if (!entityKeys.has(slug)) {
    throw new Error(`${context}: unknown entity slug "${slug}"`);
  }
}

function assertLogoAsset(slug: string, context: string) {
  for (const ext of LOGO_EXTS) {
    if (logoFiles.has(`${slug}.${ext}`)) return;
  }
  throw new Error(
    `${context}: missing logo asset "${slug}" under public/assets/logos/`
  );
}

/** Logo slug referenced by a vision mark (icon-kind marks reference none). */
function logoMarkAsset(mark: VisionMark): string | undefined {
  return mark.kind === 'logo' ? mark.asset : undefined;
}

/**
 * One cross-reference check per content collection: every linked entity slug
 * must exist in entities.json, and every referenced logo slug must resolve to
 * an asset under public/assets/logos/. `context` names the source content
 * file in the thrown build diagnostics.
 */
type ContentRefCheck<T> = {
  /** Source label used in thrown diagnostics. */
  context: string;
  items: readonly T[];
  /** Entity slug an item links to (validated against entities.json). */
  getEntity?: (item: T) => string | undefined;
  /** Logo slugs an item references (validated against public/assets/logos/). */
  getLogos?: (item: T) => readonly (string | undefined)[];
};

// Erases the per-collection item type so heterogeneous checks share one
// manifest array; each entry's getters are only ever called with its own
// `items`, so the widening is safe.
function refCheck<T>(check: ContentRefCheck<T>): ContentRefCheck<unknown> {
  return check as ContentRefCheck<unknown>;
}

const contentRefChecks = [
  refCheck({
    context: 'work/experience.json',
    items: experience.roles,
    getEntity: (role) => role.entity,
  }),
  refCheck({
    context: 'person/collaborations.json',
    items: collaborations.items,
    getEntity: (item) => item.entity,
    getLogos: (item) => [item.logo],
  }),
  refCheck({
    context: 'recognition/education.json',
    items: education.records,
    getEntity: (record) => record.entity,
  }),
  refCheck({
    context: 'work/vision-board.json programs',
    items: visionBoard.programs ?? [],
    getEntity: (program) => program.entity,
    getLogos: (program) => [logoMarkAsset(program.badge)],
  }),
  refCheck({
    context: 'work/vision-board.json groups',
    items: visionBoard.groups,
    getLogos: (group) => [group.lead, ...group.marks].map(logoMarkAsset),
  }),
  refCheck({
    context: 'work/vision-board.json orgCards',
    items: visionBoard.orgCards ?? [],
    getLogos: (card) => [logoMarkAsset(card.mark)],
  }),
  refCheck({
    context: 'research/publications.json',
    items: publications.items,
    getLogos: (item) => [item.logo],
  }),
  refCheck({
    context: 'research/conferences.json',
    items: conferences.items,
    getLogos: (item) => [item.logo],
  }),
  refCheck({
    context: 'research/speakers.json',
    items: speakers.items,
    getLogos: (item) => [item.logo],
  }),
  refCheck({
    context: 'recognition/kaggle.json',
    items: kaggle.items,
    getLogos: (item) => [item.logo],
  }),
];

for (const { context, items, getEntity, getLogos } of contentRefChecks) {
  for (const item of items) {
    if (getEntity) assertEntitySlug(getEntity(item), context);
    for (const slug of getLogos?.(item) ?? []) {
      if (slug) assertLogoAsset(slug, context);
    }
  }
}

const iconPathKeys = new Set(Object.keys(iconPaths));
for (const iconName of iconNameSchema.options) {
  if (!iconPathKeys.has(iconName)) {
    throw new Error(`icon-paths.json: missing geometry for icon "${iconName}"`);
  }
}

export const defaultTheme = site.theme.default === 'light' ? 'light' : 'dark';

/** Resolve a nav href for a content page (hash on home for views). */
export function navHref(page: ContentPageEntry): string {
  if (page.id === HOME_PAGE_ID) return '/';
  const anchor = page.viewAnchor ?? page.id;
  return `/${viewHash(anchor)}`;
}
