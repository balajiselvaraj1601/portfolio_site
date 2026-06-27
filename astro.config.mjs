// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the absolute site URL.
// This is a GitHub Pages *user site* (served at the domain root), so `base` is '/'.
// The repo must be named `balajiselvaraj1601.github.io` to serve at this URL.
// `Astro.site` in components and the sitemap both derive from this one value;
// `public/robots.txt` references it too (static file — update both together).
// ─────────────────────────────────────────────────────────────────────────────
const SITE_URL = 'https://balajiselvaraj1601.github.io';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  base: '/',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {
    // Keep clean URLs and a predictable asset folder.
    assets: '_astro',
  },
});
