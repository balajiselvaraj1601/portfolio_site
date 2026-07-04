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
- **`vision-impact`** (default variant): Title "Leadership & Organizational Impact"; 7 OrgSnapshotCards in a 4-column grid.

The contact CTA is the dedicated **Contact** view.

## Shelved (not in this view)

`technical-vision` (`profile.json` → `vision`), `impact` (`work/strategic-impact.json`),
and `generative-ai` are intentionally out of `home.sections`. Components and content
remain for future re-enable — see `docs/content-editing.md`.
