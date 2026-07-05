# Page Brief - Home

**Page:** `home`  
**Route:** `/` (single-page shell; nav views scroll to section groups)

## About view (`viewSections`)

| Item (section id) | Source                                                              | Question                                      | Weight |
| ----------------- | ------------------------------------------------------------------- | --------------------------------------------- | ------ |
| `hero`            | `content/person/profile.json`                                       | What is this?                                 | heavy  |
| `thirukural`      | `content/person/profile.json` (`heroQuote`)                         | What grounds it?                              | light  |
| `leadership`      | `content/person/profile.json`, `content/person/collaborations.json` | Who are they, and why trust their leadership? | heavy  |

The About group opens the page: hero and Thirukural couplet share an `AboutLanding` wrapper,
then the merged profile and leadership section (`leadership`: bio, scan cards, philosophy, themes,
collaboration logos). All sections are visible on `/` — the page scrolls through every group in
nav order, and the **About** button scrolls back to the top.

## Full DOM order on `/`

Sections render once into the DOM, grouped contiguously by view (nav button). All sections remain
visible; nav buttons scroll to a view's first section.

`hero` → `thirukural` → `leadership` _(About)_ →
`experience` _(Experience)_ →
`publications` → `conferences` → `speakers` _(Research)_ →
`awards` → `kaggle` → `education` _(Recognition)_ →
`vision-programs` → `vision-impact` _(Vision)_ →
`contact` _(Contact)_

Each nav button maps to exactly one view; see `content/site.json → pages[].viewSections`.
