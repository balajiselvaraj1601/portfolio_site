# Page Brief - Projects

**Page:** `projects` (nav view on `/#projects`)  
**Route:** `/projects` redirects to `/#projects`

## Items

| Item (section id) | Source | Question | Weight |
|---|---|---|---|
| `projects-intro` | `content/work/projects.json` | What is this? | medium |
| `featured-case-studies` | `content/work/projects.json` | Why should I care? | heavy |
| `projects` | `content/work/projects.json` | How does it work? | heavy |

## Structure

`projects-intro` -> `featured-case-studies` -> `projects`

The view frames the project portfolio with metrics, presents flagship systems first, then provides
the broader project catalogue with traceable details. `featured-case-studies` is reached only here
(no longer duplicated in the About view). The contact CTA is the dedicated **Contact** view.
