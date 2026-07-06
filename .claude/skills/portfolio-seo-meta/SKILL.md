---
name: portfolio-seo-meta
description: >-
  Keep SEO and page metadata correct and in sync across the split SSOTs of the
  Astro portfolio — canonical, OpenGraph/OG, Twitter card, JSON-LD Person,
  sitemap, robots.txt, and the OG image. Use for "SEO", "meta tags",
  "OpenGraph" / "OG", "canonical", "sitemap", "robots.txt", "JSON-LD",
  "og image", "twitter card", or when the site domain / SITE_URL changes and the
  hand-synced files must follow. Covers the URL SSOT in astro.config.mjs, the
  sitemap redirect-stub exclusions, the BaseHead renderer, and the
  profile.json + site.seo derivation of the Person JSON-LD. Do NOT use for
  authoring the SEO *copy* itself (title/description/keyword wording) — that is
  content authoring and overlaps portfolio-content-authoring; cross-link, don't
  duplicate.
---

# Portfolio SEO / metadata Skill

Binding rules for keeping the site's SEO and social metadata **correct and in sync**.
The concern here is _mechanism and synchronization_ across several files — not the
wording of the copy. This is about which file owns which tag, and what must move
together when a value changes.

**Repo:** `/home/engineer/workspace/portfolio_site`

## Authorities (SSOT — do not duplicate their values)

Never copy the actual SITE_URL string, the keyword list, or a JSON-LD blob into this
skill or a new file as a second authority. Cite the owning file below and read it live.

| Source                                     | Owns                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------- |
| `docs/seo.md`                              | The full SEO contract — the human spec every change is checked against           |
| `astro.config.mjs` → `SITE_URL`            | The single source of truth for all canonical / OG / sitemap absolute URLs        |
| `astro.config.mjs` → `REDIRECT_STUB_PATHS` | The sitemap exclusion list (legacy `noindex` redirect stubs kept out of sitemap) |
| `content/site.json` → `seo`                | `title`, `description`, `keywords`, `ogImage` path, `twitterCard`                |
| `src/components/chrome/BaseHead.astro`     | The renderer — emits every meta/OG/Twitter tag and the JSON-LD `<script>`        |
| `public/robots.txt`                        | `Allow`/`Disallow` + the hand-written `Sitemap:` URL line                        |
| `content/person/profile.json`              | The JSON-LD `Person` source (name, title, `contact[]`, location)                 |

Name the file; never re-hardcode a URL, keyword, or blob that already lives in one of these.

## Core rule

> **The renderer derives; the hand-synced files must be pushed.**
> `BaseHead.astro` computes canonical + OG + Twitter URLs and the JSON-LD Person
> automatically from `Astro.site` (i.e. `SITE_URL`), `site.seo`, and `profile.json`
> — those are correct by construction. The **only** places that can drift are the
> ones no build step touches: the `Sitemap:` line in `public/robots.txt`, an
> optional `public/CNAME`, and `REDIRECT_STUB_PATHS`. Every SEO change reduces to:
> _edit the one owner, then hand-sync the files the build cannot reach._

## What is derived vs hand-synced

| Concern                            | Owner (edit here)                          | Auto-derived by build?                    |
| ---------------------------------- | ------------------------------------------ | ----------------------------------------- |
| `<title>` / description / keywords | `content/site.json` → `seo`                | Yes — read by `BaseHead.astro`            |
| Canonical + `og:url`               | `SITE_URL` (`astro.config.mjs`)            | Yes — `new URL(path, Astro.site)`         |
| `og:image` / `twitter:image` URL   | `site.seo.ogImage` + `SITE_URL`            | Yes — resolved to absolute in `BaseHead`  |
| JSON-LD `Person`                   | `profile.json` + `site.seo.keywords`       | Yes — assembled in `BaseHead` frontmatter |
| Sitemap contents                   | `@astrojs/sitemap` + `REDIRECT_STUB_PATHS` | Yes — **do not** hand-write sitemap XML   |
| `robots.txt` `Sitemap:` URL        | `public/robots.txt`                        | **No — hand-synced to SITE_URL**          |
| Custom-domain `CNAME`              | `public/CNAME` (absent by default)         | **No — hand-created on domain move**      |

Full field-by-field ownership: [references/seo-ssot-map.md](references/seo-ssot-map.md).

## The four precise rules

1. **SITE_URL is the URL SSOT — but robots.txt and CNAME are not wired to it.**
   `SITE_URL` in `astro.config.mjs` feeds `Astro.site`, which feeds every canonical /
   OG / sitemap URL. Two files must be **hand-synced** when it changes because no
   build step reads them from `SITE_URL`: the `Sitemap:` line in `public/robots.txt`,
   and (for a custom domain) `public/CNAME`. See the exact ordered steps from
   `docs/seo.md § Changing the site URL`:
   [references/site-url-change-checklist.md](references/site-url-change-checklist.md).

2. **Legacy redirect stubs stay OUT of the sitemap via `REDIRECT_STUB_PATHS`.**
   The stub pages are `noindex` JS redirects to hash views on `/`; the sitemap filter
   in `astro.config.mjs` drops any page whose path contains a listed stub. If you add
   or rename a redirect-stub page, update `REDIRECT_STUB_PATHS` in the same edit so the
   sitemap keeps listing `/` only. Read the current list from `astro.config.mjs` — do
   not copy it here.

3. **JSON-LD `Person` is built from `profile.json` + `site.seo.keywords` — keep synced.**
   `BaseHead.astro` reads `profile.name` / `profile.title`, the `linkedin` / `github` /
   `kaggle` / `email` entries from `profile.contact[]`, `site.location`, and
   `site.seo.keywords` (→ `knowsAbout`). Change a name, title, contact link, location,
   or keyword in its owning JSON and the structured data updates automatically — but a
   renamed `contact[].type` or a removed field silently drops from the blob. See
   [references/jsonld-sync.md](references/jsonld-sync.md).

4. **OG image is 1200×630, < 1 MB, and must carry `og:image:alt`.**
   The file is `public/assets/og/og-image.png`, referenced by path in
   `site.seo.ogImage`. `BaseHead.astro` emits `og:image:alt` (and `twitter:image:alt`)
   from `${profile.name} — ${profile.title}`. Replacing the image is a binary swap; do
   not change its path without updating `site.seo.ogImage`. Asset specs live in
   `docs/assets.md`.

## When to load references

| If the task involves…                                              | Load                                        |
| ------------------------------------------------------------------ | ------------------------------------------- |
| Which file owns a given tag / field                                | `references/seo-ssot-map.md`                |
| Moving to a new domain / custom domain / changing SITE_URL         | `references/site-url-change-checklist.md`   |
| The Person structured data and what must stay in sync              | `references/jsonld-sync.md`                 |
| The wording of title / description / keywords (copy, not plumbing) | Use `portfolio-content-authoring`, not this |

## Verify a change

- Build, then confirm the sitemap lists `/` only (stubs excluded):
  `npm run build` → inspect `dist/sitemap-index.xml` / `dist/sitemap-0.xml`.
- Validate the Person JSON-LD post-deploy with the
  [Google Rich Results Test](https://search.google.com/test/rich-results).
- Grep for stray hardcoded URLs — every absolute URL should trace back to `SITE_URL`.
