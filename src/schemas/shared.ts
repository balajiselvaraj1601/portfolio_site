import { z } from 'zod';

/**
 * Cross-domain primitives shared by two or more schema modules, plus the
 * entity registry (`content/pages/99_entities.json`) that the slugs point into.
 */

/** Optional slug into `entitiesSchema` — used by person, work, and recognition. */
export const EntitySlug = z.string().optional();
const EntityRecord = z.object({
  name: z.string(),
  url: z.string().url(),
});

/* ── pages/99_entities.json ────────────────────────────────────────────── */
export const entitiesSchema = z.record(z.string(), EntityRecord);

export type Entities = z.infer<typeof entitiesSchema>;
export type EntityRecord = z.infer<typeof EntityRecord>;

/**
 * Shape with one `value` schema per option of a Zod enum. Taking the enum
 * schema itself (not its `.options` array) closes the drift path: call sites
 * cannot filter or rename keys, so the key set always matches the enum.
 */
export const enumShape = <U extends string, V extends z.ZodTypeAny>(
  enumSchema: z.ZodEnum<[U, ...U[]]>,
  value: V
): Record<U, V> =>
  Object.fromEntries(enumSchema.options.map((k) => [k, value])) as Record<U, V>;
