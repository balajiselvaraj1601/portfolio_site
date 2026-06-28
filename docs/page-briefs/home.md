# Page Brief - Home

**Page:** `home`  
**Route:** `/` (single-page shell; nav views scroll to section groups)

## About view (`viewSections`)

| Item (section id) | Source | Question | Weight |
|---|---|---|---|
| `hero` | `content/person/profile.json` | What is this? | heavy |
| `thirukural` | `content/person/profile.json` (`heroQuote`) | What grounds it? | light |
| `leadership` | `content/person/profile.json`, `content/person/collaborations.json` | Who are they, and why trust their leadership? | heavy |
| `skills` | `content/work/skills.json` | How does it work? | medium |

The About group opens the page: hero, then a Thirukural couplet banner (`thirukural`) immediately
above the merged profile and leadership section (`leadership`: bio, scan cards, philosophy, themes,
collaboration logos), followed by technical expertise (`skills`). All sections are visible on `/`
— the page scrolls through every group in nav order, and the **About** button scrolls back to the
top. Each section still belongs to exactly one nav button (no section appears under two), which
drives the scroll target and the active-button highlight.

## Full DOM order on `/`

Sections render once into the DOM, grouped contiguously by view (nav button). All sections remain
visible; nav buttons scroll to a view's first section.

`hero` → `thirukural` → `leadership` → `skills` *(About)* →
`experience-intro` → `experience` → `mentorship` *(Experience)* →
`projects-intro` → `featured-case-studies` → `projects` *(Projects)* →
`publications` → `conferences` → `speakers` *(Research)* →
`awards` → `kaggle` → `education` *(Recognition)* →
`technical-vision` → `vision-board` → `impact` *(Vision)* →
`contact` *(Contact)*

Each nav button maps to exactly one view; see `content/site.json → pages[].viewSections`.
