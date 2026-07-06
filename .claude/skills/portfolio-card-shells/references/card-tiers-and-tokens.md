# Card tiers and shell tokens

Deep reference for the box shell surface. Values are current defaults; the SSOT is
`src/styles/global.css` `:root` and the `.card` base rule. Tier/exception authority
is `.claude/references/design-consistency-contract.md` §5–6, §11.

## The four tiers

One base rule (`.card, .recog-card, .recog-tile, .content-card`, ~L659) gives all
tiers the accent top border, `--radius-xl`, gradient wash, and hover lift. Tiers
differ only in padding and role.

| Tier                | Shell class                                | Padding                    | Radius        | Role / used by                                                                                                            |
| ------------------- | ------------------------------------------ | -------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **A — compact**     | `.card`                                    | `--card-padding` (24px)    | `--radius-xl` | Default surface: `.theme-card` (Vision programs + org snapshots, About leadership), connect-card, project accordion       |
| **B — content**     | `.content-card`                            | `--card-padding-lg` (32px) | `--radius-xl` | Text-dense cards: `ResearchCard`, `SpeakingCard`. Sets `height: 100%` for equal-height grids                              |
| **C — recognition** | `.recog-card`, `.recog-tile`, `.edu-panel` | `--card-padding` (24px)    | `--radius-xl` | Recognition band — Awards, Kaggle, Education. **Aliases of `.card`**: same base rule, extra header/divider/stat internals |
| **D — special**     | `.card--accent`, `.vision-hub__ring`       | varies                     | varies        | Vision hub circle and other one-offs governed by EX rules                                                                 |

`.card` itself sets **no padding** — padding comes from the component class
(`.theme-card`, `.recog-card` internals). `.content-card` is the only tier that
sets its own padding in the base block.

## Shell token SSOT

Change these in `global.css` `:root` to move all cards at once.

| Token               | Value                            | Controls                                    |
| ------------------- | -------------------------------- | ------------------------------------------- |
| `--card-padding`    | `var(--space-6)` = 24px          | Tier A / C inner padding                    |
| `--card-padding-lg` | `var(--space-8)` = 32px          | Tier B inner padding                        |
| `--radius-xl`       | 14px                             | All card corners (EX-001)                   |
| `--card-lift`       | -2px                             | Hover `translateY`                          |
| `--shadow-md`       | theme-defined                    | Hover box-shadow                            |
| `--focus-ring`      | `#6c2fbf` light / `#9b5ee8` dark | Global `:focus-visible` outline (2px)       |
| `--stack-sm/md/lg`  | space-4 / 6 / 8                  | Vertical gaps inside and between cards      |
| `--accent-card`     | contextual (unset by default)    | The card's accent; falls back to `--accent` |

Gradient/border mix ratios (baked into the base rule, not tokens — treat as the
recipe, do not hand-roll elsewhere):

| Layer           | Light                           | Dark             |
| --------------- | ------------------------------- | ---------------- |
| Gradient wash   | 6% → 2% accent over `--bg-elev` | 12% → 4%         |
| Hairline border | 40% accent over `--border`      | 45%              |
| Top stripe      | 2px solid accent                | 3px solid accent |

## Tier decision tree

1. Is it the Vision hub circle or a bespoke shape? → **Tier D**, follow the EX rule.
2. Is it in the recognition band (Awards / Kaggle / Education)? → **Tier C**
   (`.recog-*` / `.edu-panel`).
3. Is the card text-dense and needs breathing room / equal-height grid? → **Tier B**
   (`.content-card`, 32px).
4. Otherwise → **Tier A** (`.card` + a component class, 24px). Default.

Never invent a padding between 24px and 32px — pick the tier. If a genuinely new
spacing is needed, that is a tier/token change (`change-recipes.md` §D/§A), not a
one-off literal.

## Colour-highlight patterns (nested, inside a shell)

From design-consistency-contract §5 — for bands/callouts _within_ a card:

| Pattern     | Class                                         | Use                                                          |
| ----------- | --------------------------------------------- | ------------------------------------------------------------ |
| Soft tint   | `.card-tint`                                  | Neutral `--accent-soft` wash (pipeline, impact strip)        |
| Accent tint | `.card-tint--accent`                          | Contextual `--accent-card` wash (edu highlight, level bands) |
| Top stripe  | Tier-C `border-top` / `.card--accent::before` | Categorical emphasis                                         |
| Radial wash | `.recog-tile::after`, `.edu-panel::before`    | Tier-C hero/stat tiles only                                  |

## Binding exceptions (do not "fix" — authority: contract §11)

Referenced by ID; read the contract for full wording.

| ID     | What                                                                            |
| ------ | ------------------------------------------------------------------------------- |
| EX-001 | `.recog-card` / `.recog-tile` use `--radius-xl` to pair with the top stripe     |
| EX-002 | `.recog-card` gradient elevates the recognition band above standard cards       |
| EX-003 | 2px solid `border-top: var(--accent-card)` is the categorical colour identifier |
| EX-004 | `.edu-panel::before` dotted radial overlay — education hero only                |
| EX-017 | Experience timeline rail uses a unified violet→red gradient, not per-role       |
