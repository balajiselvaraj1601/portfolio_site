# Page Brief - Experience

**Page:** `experience` (nav view on `/#experience`)  
**Route:** `/experience` redirects to `/#experience`

## Items

| Item (section id) | Source                             | Question                          | Weight |
| ----------------- | ---------------------------------- | --------------------------------- | ------ |
| `experience`      | `content/pages/02_experience.json` | What is this? / How does it work? | heavy  |

## Structure

Single `experience` section; the section header carries the view intro (eyebrow **Experience**,
title, intro subtitle). The interactive career timeline follows, stacked top to bottom:
a horizontal timeline bar (one `role="tab"` stop per role - marker on a gradient line, period +
short org label; current role selected by default, arrow-key navigable), then the focused role's
company block (`card` shell: logo, position, org link, period/location, blurb, tech chips), then
a project selector chip row (site-standard `recog-chip` filter buttons with an **All** default,
skipped for single-project roles, wired through the shared `initRecogGrid` behaviour), then the
role's projects as flagship-style boxes (`card card-accent` shell) with every bullet visible.
Bullet tiers are preserved. Without JS the timeline bar is hidden and all role panels render
stacked and fully expanded.
Strategic impact lives in the **Vision** view (`vision-programs` section); the contact CTA is the dedicated
**Contact** view.
