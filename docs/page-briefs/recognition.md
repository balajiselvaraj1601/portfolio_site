# Page Brief - Recognition

**Page:** `recognition` (nav view on `/#recognition`)  
**Route:** `/recognition` redirects to `/#recognition`

## Items

| Item (section id) | Source | Question | Weight |
|---|---|---|---|
| `awards` | `content/recognition/awards.json` | Why should I trust it? | medium |
| `kaggle` | `content/recognition/kaggle.json` | Why should I trust it? | heavy |
| `education` | `content/recognition/education.json` | Why should I trust it? | light |

## Structure

`awards` -> `kaggle` -> `education`

The view makes awards and Kaggle rank distinct trust signals and keeps education as the grounding
reset. The contact CTA is the dedicated **Contact** view.
