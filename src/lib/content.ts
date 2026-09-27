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
  aboutPageSchema,
  contactPageContentSchema,
  experiencePageSchema,
  recognitionPageSchema,
  researchPageSchema,
  visionPageSchema,
  entitiesSchema,
} from '@schemas';
import type { VisionMark } from '@schemas';

import siteRaw from '@content/pages/00_site.json';
import aboutPageRaw from '@content/pages/01_about.json';
import experiencePageRaw from '@content/pages/02_experience.json';
import researchPageRaw from '@content/pages/03_research.json';
import recognitionPageRaw from '@content/pages/04_recognition.json';
import visionPageRaw from '@content/pages/05_vision.json';
import contactPageRaw from '@content/pages/06_contact.json';
import entitiesRaw from '@content/pages/99_entities.json';

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

export const site = load('pages/00_site.json', siteSchema, siteRaw);
export const aboutPage = load(
  'pages/01_about.json',
  aboutPageSchema,
  aboutPageRaw
);
export const experience = load(
  'pages/02_experience.json',
  experiencePageSchema,
  experiencePageRaw
);
export const researchPage = load(
  'pages/03_research.json',
  researchPageSchema,
  researchPageRaw
);
export const recognitionPage = load(
  'pages/04_recognition.json',
  recognitionPageSchema,
  recognitionPageRaw
);
export const visionBoard = load(
  'pages/05_vision.json',
  visionPageSchema,
  visionPageRaw
);
export const contactPageContent = load(
  'pages/06_contact.json',
  contactPageContentSchema,
  contactPageRaw
);
export const entities = load(
  'pages/99_entities.json',
  entitiesSchema,
  entitiesRaw
);

const { collaborations: aboutCollaborations, ...aboutProfile } = aboutPage;

/** Compatibility export for components that render hero, about, and contact copy. */
export const profile = { ...aboutProfile, ...contactPageContent };
export const collaborations = aboutCollaborations;
export const publications = researchPage.publications;
export const conferences = researchPage.conferences;
export const speakers = researchPage.speakers;
export const awards = recognitionPage.awards;
export const kaggle = recognitionPage.kaggle;
export const education = recognitionPage.education;

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
/** Drop sections hidden via `site.sections[id].visible === false`. */
const visibleSections = (ids: readonly string[]) =>
  ids.filter((id) => site.sections[id]?.visible !== false);

/** Content-driven pages only — excludes external nav entries (e.g. a link to an external profile). */
export const pages = site.pages.flatMap((p) => {
  if (p.external) return [];

  return [{ ...p, sections: visibleSections(p.sections) }];
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
export const homeSections = visibleSections(homePage.sections);

/**
 * Synthetic hero view — the top landing band (`hero` + `thirukural`). It has no
 * `site.pages` entry, so `Header.astro` renders no nav link for it; it exists
 * only so the scroll-spy and dot-nav treat the hero band as its own view,
 * distinct from About. SSOT for the "hero is not About" split.
 */
const heroView = {
  id: HERO_DOT_ID,
  label: 'Hero',
  path: '/',
  viewAnchor: HERO_DOT_ID,
  viewSections: visibleSections(['hero', 'thirukural']),
};

/** Nav views — the synthetic hero band plus each content page with view metadata. */
export const navViews = [
  heroView,
  ...site.pages.flatMap((p) => {
    if (!isContentPage(p) || !p.viewSections?.length) return [];
    const viewAnchor = p.viewAnchor ?? p.id;
    return [
      {
        id: p.id,
        label: p.label,
        path: p.path,
        viewAnchor,
        viewSections: visibleSections(p.viewSections),
      },
    ];
  }),
];

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

/**
 * Right-side dot nav — one dot per view in order (Hero, About, then each header
 * nav view: 7 dots on home). Derived from `navViews` so the hero/about split and
 * the scroll targets stay in lockstep with the SSOT.
 */
export const dotNavViews: DotNavView[] = navViews.map((v) => ({
  id: v.viewAnchor,
  label: v.label,
  scrollSection: v.viewSections[0],
}));

/** Map section id → dot id for scroll-spy (hero band split from About view).
 *  Derived from sectionViewMap — single ownership is enforced above, so each
 *  section's sole view anchor IS its dot. */
export const sectionToDotNav: Record<string, string> = Object.fromEntries(
  Object.entries(sectionViewMap).map(([sectionId, [anchor]]) => [
    sectionId,
    anchor,
  ])
);

const entityKeys = new Set(Object.keys(entities));
function assertEntitySlug(slug: string | undefined, context: string) {
  if (!slug) return;
  if (!entityKeys.has(slug)) {
    throw new Error(`${context}: unknown entity slug "${slug}"`);
  }
}

function assertLogoAsset(slug: string, context: string) {
  if (logoSrc(slug)) return;
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
    context: 'pages/02_experience.json',
    items: experience.roles,
    getEntity: (role) => role.entity,
  }),
  refCheck({
    context: 'pages/01_about.json collaborations',
    items: collaborations.items,
    getEntity: (item) => item.entity,
    getLogos: (item) => [item.logo],
  }),
  refCheck({
    context: 'pages/04_recognition.json education',
    items: education.records,
    getEntity: (record) => record.entity,
  }),
  refCheck({
    context: 'pages/05_vision.json programs',
    items: visionBoard.programs ?? [],
    getEntity: (program) => program.entity,
    getLogos: (program) => [logoMarkAsset(program.badge)],
  }),
  refCheck({
    context: 'pages/05_vision.json groups',
    items: visionBoard.groups,
    getLogos: (group) => [group.lead, ...group.marks].map(logoMarkAsset),
  }),
  refCheck({
    context: 'pages/05_vision.json orgCards',
    items: visionBoard.orgCards ?? [],
    getLogos: (card) => [logoMarkAsset(card.mark)],
  }),
  refCheck({
    context: 'pages/03_research.json publications',
    items: publications.items,
    getLogos: (item) => [item.logo],
  }),
  refCheck({
    context: 'pages/03_research.json conferences',
    items: conferences.items,
    getLogos: (item) => [item.logo],
  }),
  refCheck({
    context: 'pages/03_research.json speakers',
    items: speakers.items,
    getLogos: (item) => [item.logo],
  }),
  refCheck({
    context: 'pages/04_recognition.json kaggle',
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
