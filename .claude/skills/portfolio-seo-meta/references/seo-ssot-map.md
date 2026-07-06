# SEO SSOT map — which file owns which tag

The SEO surface is split across several files. Each tag/field has **one** owner; the
renderer (`src/components/chrome/BaseHead.astro`) reads the owners and emits the markup.
To change a value, edit its owner — never the rendered output, and never a second copy.
Read the owning file for the live value; the _Owner_ column names it, it is not repeated
here.

## Meta / head tags

| Tag / output                             | Owner (edit here)                           | Notes                                                           |
| ---------------------------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| `<title>`                                | `content/site.json` → `seo.title`           | Per-page override via `BaseHead` `title` prop; defaults to site |
| `<meta name="description">`              | `content/site.json` → `seo.description`     | Per-page override via `description` prop                        |
| `<meta name="keywords">`                 | `content/site.json` → `seo.keywords`        | Joined with `, ` in `BaseHead`; also feeds JSON-LD `knowsAbout` |
| `<link rel="canonical">`                 | `SITE_URL` (`astro.config.mjs`) + page path | `new URL(path, Astro.site)` in `BaseHead`                       |
| `<meta name="viewport">`                 | `BaseHead.astro` (static)                   | `width=device-width, initial-scale=1`                           |
| `<meta name="theme-color">` (light/dark) | `src/lib/theme-colors` (`THEME_BG`)         | Two `media`-scoped variants                                     |
| `<html lang="en">`                       | `Layout.astro`                              | Per the SEO contract in `docs/seo.md`                           |
| favicon / apple-touch / manifest links   | `BaseHead.astro` (static paths)             | Point at `public/` assets                                       |

## OpenGraph + Twitter

| Tag                                      | Owner (value source)                           | Notes                                            |
| ---------------------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| `og:type`                                | `BaseHead.astro` (static)                      | `website`                                        |
| `og:title` / `twitter:title`             | `site.seo.title` (or page `title` prop)        | Same value as `<title>`                          |
| `og:description` / `twitter:description` | `site.seo.description` (or `description` prop) |                                                  |
| `og:url`                                 | `SITE_URL` + page path                         | Same derivation as canonical                     |
| `og:image` / `twitter:image`             | `site.seo.ogImage` + `SITE_URL`                | Path resolved to absolute; file 1200×630, < 1 MB |
| `og:image:alt` / `twitter:image:alt`     | `profile.name` + `profile.title`               | Emitted as `${name} — ${title}`                  |
| `og:locale`                              | `BaseHead.astro` (static)                      | `en`                                             |
| `twitter:card`                           | `content/site.json` → `seo.twitterCard`        | `summary_large_image`                            |

## JSON-LD `Person`

Assembled in `BaseHead.astro` frontmatter, emitted as one `is:inline`
`application/ld+json` script. See [jsonld-sync.md](jsonld-sync.md) for the field map.

| JSON-LD field   | Source                                                  |
| --------------- | ------------------------------------------------------- |
| `name`          | `profile.json` → `name`                                 |
| `jobTitle`      | `profile.json` → `title`                                |
| `email`         | `profile.json` → `contact[type=email].value`            |
| `address`       | `content/site.json` → `location` (locality + country)   |
| `url`           | `SITE_URL` (root)                                       |
| `sameAs`        | `profile.json` → `contact[]` linkedin / github / kaggle |
| `knowsAbout`    | `content/site.json` → `seo.keywords`                    |
| `worksFor.name` | `experience.json` → first role's organization           |

## Sitemap + robots

| Output                                     | Owner                                           | Notes                                                     |
| ------------------------------------------ | ----------------------------------------------- | --------------------------------------------------------- |
| `dist/sitemap-index.xml` / `sitemap-0.xml` | `@astrojs/sitemap` integration                  | Generated at build; **never** hand-edit XML               |
| Sitemap page inclusion                     | `REDIRECT_STUB_PATHS` (`astro.config.mjs`)      | Filter drops any path containing a listed stub → `/` only |
| `robots.txt` rules                         | `public/robots.txt`                             | Static file                                               |
| `robots.txt` `Sitemap:` URL                | `public/robots.txt` (hand-synced to `SITE_URL`) | Not wired to the build — see the URL-change checklist     |

## Boundary

Wording of `title` / `description` / `keywords` as _content_ belongs to
content authoring (overlaps `portfolio-content-authoring`). This map governs the
plumbing — which file to open — not the prose.
