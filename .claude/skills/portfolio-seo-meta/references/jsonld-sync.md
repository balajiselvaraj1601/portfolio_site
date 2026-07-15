# JSON-LD `Person` - derivation and sync

The site emits one `Person` structured-data blob so search engines can attribute the page
to a real person. It is **assembled at build time** in `src/components/chrome/BaseHead.astro`
from two content SSOTs - never hand-written - and rendered as an `is:inline`
`application/ld+json` `<script>` (the `is:inline` keeps it verbatim and silences
`astro(4000)`).

## Sources

- `content/pages/01_about.json` - the person's identity.
- `content/pages/06_contact.json` - the person's public contact links.
- `content/pages/00_site.json` - `seo.keywords` and `location`.
- `content/pages/02_experience.json` - first role's organization (for `worksFor`).
- `SITE_URL` (`astro.config.mjs`, via `Astro.site`) - the `url`.

Read those files for the live values. Do **not** paste the assembled blob anywhere as a
second authority; the illustrative example in `docs/seo.md § JSON-LD - Person` is the only
sanctioned snapshot and is explicitly attributed there.

## Field - source map (as built in `BaseHead.astro`)

| JSON-LD field             | Derivation in `BaseHead.astro`                                                     |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `@context` / `@type`      | Static: `https://schema.org` / `Person`                                            |
| `name`                    | `profile.name`                                                                     |
| `jobTitle`                | `profile.title`                                                                    |
| `email`                   | `profile.contact` entry where `type === 'email'` - its `value` (omitted if absent) |
| `address.addressLocality` | `site.location` before the first comma (`.split(',')[0]`)                          |
| `address.addressCountry`  | `'SE'` iff `site.location` includes `'Sweden'`, else `undefined`                   |
| `url`                     | `new URL('/', Astro.site).href`                                                    |
| `sameAs`                  | `profile.contact` `linkedin` / `github` / `kaggle` `href`s, falsy-filtered         |
| `knowsAbout`              | `site.seo.keywords` (the array, verbatim)                                          |
| `worksFor.name`           | `experience.roles[0].organization` before the first comma                          |

## What to keep in sync - and the silent-drop traps

Changing a value in its owning JSON updates the blob automatically. The failure modes are
**structural**, not textual:

- **`contact[].type` is the join key.** `email`, `linkedin`, `github`, `kaggle` are matched
  by `type`. Rename a `type` (or the contact entry) and the corresponding `email` / `sameAs`
  link **silently disappears** from the JSON-LD - no build error.
- **`address` keys off literal strings.** `addressLocality` is everything before the first
  comma in `site.location`; `addressCountry` is `'SE'` only when `site.location` contains
  the word `'Sweden'`. Moving country means updating `site.location` in `content/pages/00_site.json`,
  and the `'Sweden'` - `'SE'` mapping is hardcoded in `BaseHead.astro` - a new country needs
  a code added there.
- **`knowsAbout` mirrors `seo.keywords`.** Editing keywords for SEO also rewrites the
  structured-data `knowsAbout`. Intended, but be aware the two are the same list.
- **`worksFor` tracks the first experience role.** Reordering `experience.roles` changes the
  advertised employer.

## Validate

- Build and open the page source; confirm the `ld+json` script parses.
- Run the [Google Rich Results Test](https://search.google.com/test/rich-results) post-deploy.
- `docs/seo.md` notes: if project detail routes are added later, consider a `CreativeWork`
  JSON-LD per project (not yet implemented).
