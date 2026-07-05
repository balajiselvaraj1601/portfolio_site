# Portfolio — Feature Requirements

> This is the "required skills" deliverable: the capabilities the portfolio website must
> provide. It is **tech-stack-agnostic** — no framework is assumed. Priorities use MoSCoW
> (Must / Should / Could / Won't-this-stage).

## Target & context

- **Owner:** Balaji Selvaraj — Technical AI Leader (oncology / drug-safety / biopharma R&D AI).
- **Goal:** a fast, credible, public personal portfolio, deployable to GitHub Pages.
- **Audience:** hiring managers, research collaborators, conference/industry peers.
- **Content source:** JSON under `../content/` (single source of truth; see `content-map.md`).

---

## Must have

### Platform & performance

- **M1** Static site, fully pre-rendered, deployable to **GitHub Pages** (no server runtime).
- **M2** Fast first load on a mid-range mobile device (target LCP < 2.5s on 4G).
- **M3** Works without JavaScript for core content (progressive enhancement); JS adds polish, not access.

### Responsiveness & theming

- **M4** Fully responsive across mobile / tablet / desktop with no horizontal scroll.
- **M5** **Dark/light mode** — respects `prefers-color-scheme` and offers a manual toggle that persists (e.g. `localStorage`); no flash of incorrect theme on load.

### Content sections (curated public set)

- **M6** Render these sections, driven by `content/`:
  Hero, Thirukural quote, About / Leadership philosophy, Experience (timeline),
  Publications, Conferences, Speaking Engagements, Awards, Kaggle, Education,
  Vision (programs + org impact), Contact.
- **M7** _(removed)_ — standalone Projects showcase was dropped; project narratives live in Experience roles.
- **M8** **Experience** renders as a chronological timeline of roles → projects → bullets,
  preserving bullet `tier` (primary/secondary) for emphasis.

### Navigation

- **M9** Sticky/persistent header nav with links to each section.
- **M10** **Navigation state** with active route in the header and section dot navigation where configured.
- **M11** Accessible mobile menu (hamburger) with keyboard + screen-reader support.
- **M12** Smooth in-page anchor scrolling that respects `prefers-reduced-motion`.

### Contact

- **M13** Contact section showing **professional email + LinkedIn + Kaggle** (no phone).
  `mailto:` link for email; external links open with `rel="noopener noreferrer"`.

### SEO & metadata

- **M14** Per-page `<title>` and meta description.
- **M15** **OpenGraph + Twitter card** tags with a social preview image.
- **M16** `sitemap.xml` and `robots.txt`.
- **M17** **JSON-LD `Person`** structured data (see `seo.md` for the populated template).
- **M18** Canonical URL and `lang` attribute set.

### Accessibility

- **M19** **WCAG 2.1 AA**: semantic landmarks, logical heading order, full keyboard
  operability, visible focus states, ARIA only where needed, AA color contrast in both themes.
  (Full checklist in `accessibility.md`.)

### Architecture & content

- **M20** **Content-driven**: all copy comes from JSON under `content/`; no content hardcoded in
  components. Changing a JSON file changes the rendered site (SSOT).
- **M21** Reusable, composable section/component structure (no copy-pasted section markup).

### Resources & errors

- **M22** Résumé **PDF download** link (`/assets/resume/…`), shown in header and/or contact.
- **M23** Custom **404** page consistent with site styling.
- **M24** Favicon and a basic web app manifest (name, icons, theme color).

---

## Should have

- **S1** Lighthouse **95+** on Performance, Accessibility, Best Practices, and SEO.
- **S2** Responsive, optimized images (modern formats, correct `sizes`, lazy-loading below the fold).
- **S3** Minimal shipped JavaScript; defer/island non-critical interactivity.
- **S4** Subtle, tasteful animations (entrance/hover), all gated by `prefers-reduced-motion`.
- **S5** Full favicon/app-icon set + social preview image generated.
- **S6** Print-friendly stylesheet (clean printout of the page).
- **S7** Skip-to-content link and a logical tab order verified end-to-end.
- **S8** External link + Kaggle/publication links validated (no dead links).

---

## Could have (deferred — needs a service or the chosen stack)

- **C1** Contact **form** (e.g. Formspree / Web3Forms) — needs a third-party endpoint; not wired now.
- **C2** **Blog / writing** section (Markdown/MDX) for articles and talks.
- **C3** Privacy-friendly **analytics** (e.g. Plausible / GoatCounter).
- **C4** **Custom domain** via `CNAME`.
- **C5** Internationalization (i18n) — currently `en` only.
- **C6** Light interactive extras (filter projects by tag/domain, copy-email button).

---

## Won't (this stage)

- **W1** ~~No framework choice or CI/CD~~ — **resolved:** Astro 4 + GitHub Actions deploy
  (see `deployment.md`, `architecture.md`).
- **W2** No backend, database, auth, or CMS.

---

## Implementation status (2026-06-27)

| Area                   | Status                                                             |
| ---------------------- | ------------------------------------------------------------------ |
| Stack                  | ✅ Astro 4.16, Zod, hand-rolled CSS                                |
| All Must-have (M1–M24) | ✅ Implemented                                                     |
| CI/CD                  | ✅ `.github/workflows/deploy.yml`                                  |
| Static assets          | ✅ Résumé PDF, OG image, favicons, `.nojekyll`                     |
| GitHub Pages live      | ⏳ Pending — repo push + Pages enable (see `go-live-checklist.md`) |
| Lighthouse 95+ (S1)    | ⏳ Run manually post-deploy                                        |
| Link validation (S8)   | ⏳ Manual pass recommended                                         |

## Acceptance criteria (stage-exit)

- [x] All JSON files under `content/` are valid and consumed by the UI without edits.
- [x] Privacy honored: no phone number and no References appear anywhere in shipped content.
- [x] The Must list is satisfiable by a static export to GitHub Pages.
- [x] A developer can build against `content/` + these docs without re-reading the source resume.
- [ ] Site live at https://balajiselvaraj1601.github.io (GitHub setup pending).
