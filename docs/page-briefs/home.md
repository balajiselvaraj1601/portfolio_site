# Page Brief - Home

**Page:** `home`  
**Route:** `/` (single-page shell; nav views scroll to section groups)

## About view (`viewSections`)

| Item (section id) | Source                                                              | Question                                      | Weight |
| ----------------- | ------------------------------------------------------------------- | --------------------------------------------- | ------ |
| `hero`            | `content/person/profile.json`                                       | What is this?                                 | heavy  |
| `thirukural`      | `content/person/profile.json` (`heroQuote`)                         | What grounds it?                              | light  |
| `about`           | `content/person/profile.json`, `content/person/collaborations.json` | Who are they, and why trust their leadership? | heavy  |

The About group opens the page: hero and Thirukural couplet share a `HeroLanding` wrapper
(`#hero-landing`) that forms the **hero band** — it ends flush above the about section.
The merged profile and about section (`about`: eyebrow **About**, title About, bio, scan cards, philosophy, themes,
collaboration logos) is the start of the About view. All sections are visible on `/` — the page
scrolls through every group in nav order, and the **About** button scrolls to `#about`
(eyebrow: About, title: About), with the full hero band scrolled out of view above it.

### Thirukural band — layout intent (owner, 2026-07-09)

`thirukural` is a **cohesive grounding quote**, not a separate decorative block. Content from
`profile.heroQuote`: Tamil couplet, English translation, author line, and Thiruvalluvar portrait.

| Concern          | Rule                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Surround spacing | `3lh` margin above and below `#thirukural` (typographic, anchored to `--fs-kural`)                                            |
| Mobile stack     | Portrait above copy; tight `--text-gap-inline` (8px) between lines                                                            |
| Desktop row      | Copy height = portrait height; Tamil top and author bottom flush with statue top/base; lines distributed with `space-between` |
| Shell            | Open band on hero gradient — no card/box                                                                                      |

Full binding: `.claude/agents/page-about.md` Appendix D.

## Full DOM order on `/`

Sections render once into the DOM, grouped contiguously by view (nav button). All sections remain
visible; nav buttons scroll to a view's first section.

`hero` → `thirukural` → `about` _(About)_ →
`experience` _(Experience)_ →
`publications` → `conferences` → `speakers` _(Research)_ →
`awards` → `kaggle` → `education` _(Recognition)_ →
`vision-programs` _(Vision)_ →
`contact` _(Contact)_

Each nav button maps to exactly one view; see `content/site.json → pages[].viewSections`.
