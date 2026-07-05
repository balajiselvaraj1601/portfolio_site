# Page Brief - Vision

**Page:** `vision` (nav view on `/#vision`)  
**Route:** `/vision` redirects to `/#vision`

## Items

| Item (section id) | Source                           | Question             | Weight |
| ----------------- | -------------------------------- | -------------------- | ------ |
| `vision-programs` | `content/work/vision-board.json` | Context, programs    | heavy  |
| `vision-impact`   | `content/work/vision-board.json` | Org impact snapshot? | heavy  |

## Structure

Two sections:

- **`vision-programs`** (alt variant): Eyebrow "Vision", title and subtitle from `vision-board.json`, then two IDEA/VISION group theme-cards with CardMark/MarkEmblem, plus 4 program cards (ThemeCard) in a 2-column grid.
- **`vision-impact`** (default variant): Title "Leadership & Organizational Impact"; org impact cards (`ThemeCard`) in a 4-column grid.

The contact CTA is the dedicated **Contact** view.
