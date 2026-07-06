# Page Brief - Vision

**Page:** `vision` (nav view on `/#vision`)  
**Route:** `/vision` redirects to `/#vision`

## Items

| Item (section id) | Source                           | Question                        | Weight |
| ----------------- | -------------------------------- | ------------------------------- | ------ |
| `vision-programs` | `content/work/vision-board.json` | Context, programs, org snapshot | heavy  |

## Structure

Single section (2026-07-06 merge):

- **`vision-programs`** (alt variant): Eyebrow "Vision", title and subtitle from `vision-board.json`, then two IDEA/VISION group theme-cards with CardMark/MarkEmblem, plus 4 program cards (ThemeCard) in a 2-column grid.
- Below the flow, an `h3` sub-heading ("Enterprise Leadership & Organizational Impact", `orgHeader`) introduces the 7 org impact cards (`ThemeCard` via `vision/VisionImpactGrid.astro`) — 4-up top row, centred 3-up bottom row, 3 accent groups from `orgCards[].accent`.

The contact CTA is the dedicated **Contact** view.
