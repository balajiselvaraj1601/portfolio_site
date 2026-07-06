import { z } from 'zod';

/** Fields shared by external labeled links and speaking engagements. */
const MediaLinkFields = {
  title: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
  youtube: z.string().url().optional(),
  image: z.string().optional(),
  imageWebp: z.string().optional(),
  imageAvif: z.string().optional(),
  logo: z.string().optional(),
  logoBadge: z.boolean().optional(),
};
const LabeledLink = z.object({
  label: z.string(),
  ...MediaLinkFields,
});

/* ── publications.json / conferences.json (labeled external links) ─────── */
export const linkListSchema = z.object({
  title: z.string(),
  items: z.array(LabeledLink),
});

const SpeakingEngagement = z.object({
  role: z.string(),
  event: z.string(),
  location: z.string(),
  date: z.string(),
  dateSort: z.string().optional(),
  ...MediaLinkFields,
  description: z.string(),
});

export const speakersSchema = z.object({
  title: z.string(),
  items: z.array(SpeakingEngagement),
});

export type LinkList = z.infer<typeof linkListSchema>;
export type Speakers = z.infer<typeof speakersSchema>;
