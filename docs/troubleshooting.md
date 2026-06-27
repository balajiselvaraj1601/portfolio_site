# Troubleshooting

Common issues when developing, building, or deploying the portfolio site.

## Build failures

### Invalid content in `*.json`

**Symptom:**

```
Invalid content in profile.json:
  • contact.1.href: Invalid url
```

**Cause:** JSON does not match the Zod schema in `src/schemas.ts`.

**Fix:**

1. Read the field path in the error message.
2. Compare against the schema in `src/schemas.ts`.
3. Common mistakes: missing required field, invalid URL format, wrong `tier` enum value.

See [Content editing](./content-editing.md).

### Sitemap build crash

**Symptom:**

```
Cannot read properties of undefined (reading 'reduce')
```

at `astro:build:done` from `@astrojs/sitemap`.

**Cause:** `@astrojs/sitemap` was upgraded to ≥ 3.6.1. Those versions require Astro 5's
`astro:routes:resolved` hook, which does not exist in Astro 4.

**Fix:**

```bash
# Restore the pin in package.json
"@astrojs/sitemap": "3.6.0"

npm ci
npm run build
```

Do **not** run `npm update @astrojs/sitemap`. Either keep the pin or migrate the entire site
to Astro 5.

### Module not found for content JSON

**Symptom:** Cannot resolve `@content/foo.json`

**Cause:** Missing file or wrong import path; `tsconfig.json` path aliases misconfigured.

**Fix:** Ensure the file exists in `content/` and is imported in `src/lib/content.ts` with a
matching schema.

## Local development

### Port already in use

**Symptom:** `Port 4321 is already in use`

**Fix:**

```bash
npm run dev -- --port 4322
# or
npm run preview -- --port 4322
```

### Theme flash on load

**Symptom:** Brief wrong-theme flash before page settles.

**Cause:** `ThemeScript.astro` must be the first element in `<head>` (before CSS).

**Fix:** Do not move or defer the inline theme script. It sets `data-theme` before first paint.

### Mobile menu stuck open

**Symptom:** Menu won't close or body scroll locked.

**Fix:** Hard refresh. The menu resets on viewport resize > 900px. Check browser console for
JS errors in `Header.astro`.

## GitHub Pages / deploy

### 403 on git push

**Symptom:** `Permission denied` pushing to `balajiselvaraj1601/...`

**Cause:** GitHub CLI or git credentials authenticated as a different user.

**Fix:**

```bash
gh auth login          # log in as balajiselvaraj1601
git remote -v          # confirm remote URL
git push -u origin main
```

### Workflow runs but site not updated

**Symptom:** Build succeeds on `portfolio_site` but nothing publishes.

**Cause:** Deploy job is gated to the user-site repo only:

```yaml
if: github.repository == 'balajiselvaraj1601/balajiselvaraj1601.github.io'
```

**Fix:** Push to `balajiselvaraj1601.github.io`, not just the staging mirror. See
[Go-live checklist](./go-live-checklist.md).

### Pages shows 404 after deploy

**Checklist:**

| Check | Expected |
|-------|----------|
| Pages source | **GitHub Actions** (not "Deploy from branch") |
| Repo name (user site) | `balajiselvaraj1601.github.io` |
| `base` in astro.config | `'/'` for user site |
| `.nojekyll` in dist | Present at root |
| Workflow deploy job | Completed successfully |

### Assets 404 on live site (`/_astro/`, `/assets/`)

**Cause:** Missing `.nojekyll` — GitHub Pages Jekyll ignores folders starting with `_`.

**Fix:** Ensure `public/.nojekyll` exists (empty file). Rebuild and redeploy.

### Wrong URLs in sitemap or canonical tags

**Cause:** `SITE_URL` in `astro.config.mjs` out of sync with actual Pages URL.

**Fix:** Update `SITE_URL` and `public/robots.txt` together. Rebuild and redeploy.

## Content / privacy

### Phone number appeared on site

**Fix:** Remove from `content/*.json` immediately. Never add `type: "phone"` to contact.
Re-derive from résumé following curation rules in [content/README.md](../content/README.md).

Verify:

```bash
grep -ri phone content/
```

Should return no matches.

## Performance / quality

### Lighthouse score below 95

**Common causes:**

- Large unoptimized OG image or PDF
- Too much client JS (keep additions minimal)
- Missing alt text on images

Run Lighthouse against `npm run preview` output or the live URL. See [Accessibility](./accessibility.md).

### OG preview not updating

**Cause:** Social platforms cache preview images aggressively.

**Fix:** Use LinkedIn Post Inspector or add a cache-busting query param temporarily after
replacing `og-image.png`. Allow 24–48h for cache expiry.

## Getting help

1. Run `npm run build` locally — most issues surface here.
2. Check the GitHub Actions log for the failing step.
3. Consult the relevant doc:
   - Content → [Content editing](./content-editing.md)
   - Deploy → [Deployment](./deployment.md) · [Go-live checklist](./go-live-checklist.md)
   - Architecture → [Architecture](./architecture.md)
