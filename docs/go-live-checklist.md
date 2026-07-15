# Go-Live Checklist

Step-by-step guide to publishing the portfolio at https://balajiselvaraj1601.github.io.

## Overview

| Item                      | Value                                             |
| ------------------------- | ------------------------------------------------- |
| Production repo           | `balajiselvaraj1601/balajiselvaraj1601.github.io` |
| Staging mirror (optional) | `balajiselvaraj1601/portfolio_site`               |
| Live URL                  | https://balajiselvaraj1601.github.io              |
| Deploy trigger            | Push to `main`                                    |
| Pages source              | GitHub Actions                                    |

---

## Phase 1 - Local verification

Run before any push:

```bash
cd /path/to/portfolio_site
npm ci
npm run build
npm run preview
```

### Build & content

- [ ] `npm run build` completes with no errors
- [ ] Configured routes load: `/`, `/experience`, `/research`, `/recognition`, `/vision`, `/contact`
- [ ] Each route renders the sections listed in `content/pages/00_site.json`
- [ ] No phone number on page (`grep -ri phone content/` returns nothing)
- [ ] Résumé PDF loads at direct URL (asset-only, not in nav): `/assets/resume/balaji-selvaraj-resume.pdf`
- [ ] OG image loads: `/assets/og/og-image.png`

### UX smoke test (preview URL)

- [ ] Dark theme renders correctly (`html[data-theme="dark"]` on load)
- [ ] Mobile menu: opens, focus trapped, Esc closes, links navigate
- [ ] Header highlights the active route and dot navigation highlights active sections where present
- [ ] All external links open (LinkedIn, Kaggle, publications)
- [ ] 404 page renders at `/404.html`

### SEO artifacts in `dist/`

- [ ] `robots.txt` present
- [ ] `sitemap-index.xml` present
- [ ] `.nojekyll` present
- [ ] View page source: canonical, OG tags, JSON-LD present

---

## Phase 2 - GitHub setup

### Authenticate

```bash
gh auth login    # as balajiselvaraj1601
gh auth status
```

Confirm the active account is **balajiselvaraj1601**, not another user.

### Create production repo

If it does not exist:

```bash
gh repo create balajiselvaraj1601.github.io \
  --public \
  --description "Balaji Selvaraj - Technical AI Leader portfolio (GitHub Pages)"
```

Or create manually on GitHub with the exact name `balajiselvaraj1601.github.io`.

### Push code

```bash
git remote add origin https://github.com/balajiselvaraj1601/balajiselvaraj1601.github.io.git
git push -u origin main
```

### Enable GitHub Pages

In the repo on GitHub:

1. **Settings** - **Pages**
2. **Build and deployment** - **Source:** select **GitHub Actions**
3. Do not use "Deploy from a branch"

### Verify workflow

```bash
gh run list --repo balajiselvaraj1601/balajiselvaraj1601.github.io
gh run watch --repo balajiselvaraj1601/balajiselvaraj1601.github.io
```

Both **build** and **deploy** jobs must succeed.

---

## Phase 3 - Post-deploy verification

Visit https://balajiselvaraj1601.github.io

- [ ] Home page loads (not GitHub 404)
- [ ] CSS/JS load (`/_astro/` paths work)
- [ ] Favicon appears in browser tab
- [ ] Résumé PDF direct URL still loads (not linked from header)
- [ ] `https://balajiselvaraj1601.github.io/robots.txt` accessible
- [ ] `https://balajiselvaraj1601.github.io/sitemap-index.xml` accessible

### SEO validation

- [ ] [Google Rich Results Test](https://search.google.com/test/rich-results) - JSON-LD valid
- [ ] [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) - OG image renders
- [ ] Lighthouse ≥ 95 on Performance, Accessibility, Best Practices, SEO

### Optional staging mirror

To keep a build-only mirror:

```bash
git remote add staging https://github.com/balajiselvaraj1601/portfolio_site.git
git push staging main
```

Deploy is skipped on staging; build job still validates every push.

---

## Phase 4 - Announce

- [ ] Update LinkedIn profile with site URL
- [ ] Add URL to résumé PDF (next export)
- [ ] Test sharing the URL in Slack/email - confirm OG card preview

---

## Ongoing maintenance

| Task                | When           | How                                                     |
| ------------------- | -------------- | ------------------------------------------------------- |
| Update copy         | Résumé changes | Re-derive JSON under `content/` -> push                 |
| Update résumé PDF   | New export     | Replace `public/assets/resume/*.pdf` - push             |
| Content-only change | Anytime        | Edit JSON - `npm run build` - push                      |
| Dependency update   | Cautiously     | Never bump `@astrojs/sitemap` without Astro 5 migration |

Every push to `main` on the user-site repo auto-deploys within ~2 minutes.

---

## Rollback

If a bad deploy goes live:

```bash
git revert HEAD
git push origin main
```

Or revert to a known-good commit:

```bash
git checkout <good-commit-sha>
git push origin HEAD:main --force   # use only if necessary
```

Prefer `git revert` over force-push on `main`.

---

## Related docs

- [Deployment](./deployment.md) - CI/CD details and artifact table
- [Troubleshooting](./troubleshooting.md) - if something fails
- [Getting started](./getting-started.md) - local dev reference
