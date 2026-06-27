# Deployment Plan — GitHub Pages

Deployment target and go-live checklist for the **Astro 4** portfolio. CI/CD is implemented in
`.github/workflows/deploy.yml`.

## Target

- **Host:** GitHub Pages (static hosting, no server runtime).
- **Live URL:** https://balajiselvaraj1601.github.io
- **Repo type:** GitHub Pages **user site** — repo must be named `balajiselvaraj1601.github.io`
  and is served at the domain root (`/`).
- **Build output:** `dist/` — pre-rendered HTML/CSS/JS + `/assets`.

## Stack decisions (resolved)

| Decision | Choice | Where configured |
|----------|--------|------------------|
| Framework | Astro 4.16 | `package.json` |
| Base path | `/` (user site root) | `astro.config.mjs` → `base: '/'` |
| Site URL (SSOT) | `https://balajiselvaraj1601.github.io` | `astro.config.mjs` → `SITE_URL` |
| Deploy method | GitHub Actions | `.github/workflows/deploy.yml` |
| Custom domain | Not yet (C4) | Add `public/CNAME` + DNS when ready |

## CI/CD workflow

`.github/workflows/deploy.yml` runs on every push to `main`:

1. `npm ci`
2. `npm run build` → `dist/`
3. `actions/upload-pages-artifact` uploads `dist/`
4. `actions/deploy-pages` publishes to GitHub Pages

The **deploy job is gated** to the user-site repo only:

```yaml
if: github.repository == 'balajiselvaraj1601/balajiselvaraj1601.github.io'
```

On the staging mirror (`balajiselvaraj1601/portfolio_site`), the build job still runs and
validates the site, but deploy is skipped (Pages is not enabled there).

## Required static artifacts

| Artifact | Status | Location |
|----------|--------|----------|
| `index.html` | ✅ Built | `dist/index.html` |
| `404.html` | ✅ Built | `dist/404.html` |
| `robots.txt` | ✅ Present | `public/robots.txt` |
| `sitemap-index.xml` | ✅ Generated | `@astrojs/sitemap` (pinned 3.6.0) |
| `.nojekyll` | ✅ Present | `public/.nojekyll` (required for `_astro/`) |
| Résumé PDF | ✅ Present | `public/assets/resume/balaji-selvaraj-resume.pdf` |
| OG image | ✅ Present | `public/assets/og/og-image.png` |
| Favicon set | ✅ Present | `public/favicon.svg`, `favicon.ico`, `assets/icons/*` |
| Web manifest | ✅ Present | `public/site.webmanifest` |

## Pre-deploy checklist

### Code & build (done locally)

- [x] Base path `/` for user-site repo type.
- [x] `404.html`, `robots.txt`, sitemap present in build output.
- [x] `.nojekyll` present (Jekyll bypass for `_astro/`).
- [x] Résumé PDF in `assets/resume/` and linked from header/contact.
- [x] OG image in `assets/og/` referenced by absolute URL.
- [x] `npm run build` passes.
- [x] Privacy: no phone number or References in content.
- [ ] Lighthouse 95+ on built output (S1 — run manually before announcing).
- [ ] External links validated (publications, Kaggle, LinkedIn — S8).

### GitHub (pending — requires `balajiselvaraj1601` account)

- [ ] Create repo **`balajiselvaraj1601/balajiselvaraj1601.github.io`** (public).
- [ ] Push this codebase to `main` on that repo.
- [ ] **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- [ ] Confirm the deploy workflow completes and the site loads at the live URL.
- [ ] (Optional) Push to `balajiselvaraj1601/portfolio_site` as a staging mirror.

### Go-live commands

Authenticate as **balajiselvaraj1601**, then:

```bash
# User site (production — triggers deploy)
git remote add origin https://github.com/balajiselvaraj1601/balajiselvaraj1601.github.io.git
git push -u origin main

# Or, if using portfolio_site as staging first:
git remote add origin https://github.com/balajiselvaraj1601/portfolio_site.git
git push -u origin main
# Then mirror to the user-site repo when ready to publish.
```

## Local verification

```bash
npm ci
npm run build
npm run preview   # spot-check at http://localhost:4321
```

Verify: [Go-live checklist](./go-live-checklist.md) · [Troubleshooting](./troubleshooting.md)

## Custom domain (optional, C4)

1. Add `public/CNAME` with your domain (e.g. `balajiselvaraj.com`).
2. Configure DNS (A/ALIAS or CNAME to GitHub Pages).
3. Update `SITE_URL` in `astro.config.mjs` and the sitemap URL in `public/robots.txt` together.
