import { z } from 'zod';

/**
 * Cross-domain primitives shared by two or more schema modules, plus the
 * entity registry (`content/entities.json`) that the slugs point into.
 */

/** Optional slug into `entitiesSchema` — used by person, work, and recognition. */
export const EntitySlug = z.string().optional();
const EntityRecord = z.object({
  name: z.string(),
  url: z.string().url(),
});

/* ── entities.json ─────────────────────────────────────────────────────── */
export const entitiesSchema = z.record(z.string(), EntityRecord);

export type Entities = z.infer<typeof entitiesSchema>;
export type EntityRecord = z.infer<typeof EntityRecord>;
