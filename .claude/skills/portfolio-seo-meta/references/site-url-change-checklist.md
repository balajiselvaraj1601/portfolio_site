# Site-URL change checklist

When the site moves to a new domain (e.g. a custom domain, `docs/seo.md` calls this C4),
`SITE_URL` is the URL SSOT — but two artifacts are **not** wired to it and must be
hand-synced, or canonical/OG will point at the old host and search engines will fetch the
wrong sitemap.

## The exact steps (from `docs/seo.md § Changing the site URL`)

1. **Update `SITE_URL`** in `astro.config.mjs`.
   This single value feeds `Astro.site`, so every canonical / `og:url` / `og:image` /
   sitemap absolute URL updates automatically once rebuilt.
2. **Update the `Sitemap:` line** in `public/robots.txt` to the new host.
   Static file — no build step reads `SITE_URL` for it, so it will silently point at the
   old domain until edited by hand.
3. **Add `public/CNAME`** containing the new domain (custom-domain deploys only).
   None exists by default (this is a GitHub Pages _user site_ served at the root).
   GitHub Pages reads this file to bind the custom domain.
4. **Rebuild and redeploy.** `npm run build`, then deploy `dist/`.

## Why these three, and only these

| File                     | Reads `SITE_URL` automatically? | Action on domain move        |
| ------------------------ | ------------------------------- | ---------------------------- |
| `astro.config.mjs`       | It **is** the source            | Edit the constant            |
| `BaseHead.astro` outputs | Yes — via `Astro.site`          | Nothing (auto)               |
| Sitemap XML              | Yes — via the integration       | Nothing (auto, on rebuild)   |
| `public/robots.txt`      | **No** (static)                 | Hand-edit the `Sitemap:` URL |
| `public/CNAME`           | **No** (static, may not exist)  | Create with the new domain   |

## Note on `base`

This is a user site served at the domain root, so `base` is `'/'` in `astro.config.mjs`.
A project-site or subpath deploy would additionally require a `base` change — out of scope
for a straight domain move, but check `astro.config.mjs` if the new host serves from a
subpath.

## Post-move verification

- Rebuild and confirm `dist/sitemap-index.xml` uses the new host.
- Fetch `https://<new-host>/robots.txt` and confirm the `Sitemap:` line matches.
- Re-run the [Google Rich Results Test](https://search.google.com/test/rich-results) on
  the new URL (the Person `url` / `sameAs` should resolve).
- Grep the built `dist/` for the old host — there should be zero matches.
