/**
 * Zod schemas for every JSON file under `content/`.
 *
 * These are the SINGLE SOURCE OF TRUTH for content shape: all TypeScript types
 * are derived via `z.infer` (never hand-written parallel interfaces), and the
 * loader in `lib/content.ts` validates the JSON against these at build time, so
 * malformed content fails the build instead of shipping broken.
 *
 * Split by content/ domain; this barrel is the `@schemas` alias target and
 * re-exports the full public surface explicitly so it stays greppable.
 */

/* ── shared (entities.json + cross-domain primitives) ──────────────────── */
export { entitiesSchema } from './shared';
export type { Entities, EntityRecord } from './shared';

/* ── site (site.json) ──────────────────────────────────────────────────── */
export { siteSchema } from './site';
export type { Site, Page } from './site';

/* ── person (profile.json, collaborations.json) ────────────────────────── */
export { MetricItem, contactTypeSchema, profileSchema } from './person';
export { collaborationsSchema } from './person';
export type { Profile, Collaborations, ContactItem } from './person';

/* ── work (vision-board.json, experience.json) ─────────────────────────── */
export { visionAccentSchema, visionBoardSchema } from './work';
export { xpLevelSchema, experienceSchema } from './work';
export type { VisionAccent, VisionMark, VisionBoard } from './work';
export type { Experience, Role } from './work';

/* ── recognition (education.json, awards.json, kaggle.json) ────────────── */
export { educationRecordSchema, educationSchema } from './recognition';
export { awardLevelSchema, awardsSchema } from './recognition';
export { kaggleMedalSchema, MEDALS } from './recognition';
export { kaggleCompetitionSchema, kaggleSchema } from './recognition';
export type { Education, EducationRecord } from './recognition';
export type { Awards, AwardLevel } from './recognition';
export type { Kaggle, KaggleCompetition, KaggleMedal } from './recognition';

/* ── research (publications.json, conferences.json, speakers.json) ─────── */
export { linkListSchema, speakersSchema } from './research';
export type { LinkList, Speakers } from './research';
