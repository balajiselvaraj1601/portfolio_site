# Verb Update Proposal - portfolio_site displayed content

**Date:** 2026-07-15
**Scope:** All content rendered on the live site **except the Awards page** (`content/pages/04_recognition.json` - Awards & Recognition, Kaggle, Education were deliberately left untouched).
**Deliverable:** `docs/verb-update-proposal.csv` - two columns: *Current Sentence* - *Recommendation*.
**Nothing has been changed** in the content files. This is a proposal for review.

## Method

Verbs were assessed against the site's actual audience - European Directors / Heads of AI / VPs - using the established in-repo framework:

- `verb-core` - precision-over-sophistication; name the true action.
- `euro-eval-lexicon` - categories 14 (*use sparingly*) and 15 (*avoid unless justified*), plus the top-offender scan and the workhorse-verb variation rule.

The lens is not "make the verbs bigger." For this audience it is the opposite: **competence expressed with restraint, collaboration over self-promotion.** Recommendations preserve every quantified fact - only the verb changes.

## Files reviewed

| File | Page(s) | Verdict |
|---|---|---|
| `00_site.json` | global chrome, hero, SEO | Clean (see note on `cutting-edge` below) |
| `01_about.json` | About / home | 6 recommendations |
| `02_experience.json` | Experience | 16 recommendations |
| `03_research.json` | Research | Clean - `Presented`/`Explored`/`Proposed` are accurate and appropriate |
| `05_vision.json` | Vision | 1 recommendation |
| `06_contact.json` | Contact | Clean |
| `04_recognition.json` | **Awards** | **Excluded by request** |

## Headline finding - the implementation-verb cluster

The single biggest issue is not any one verb; it is the **cluster**. Bullets open predominantly with a small set of construction verbs:

| Verb | Approx. uses across About + Experience | Lexicon status |
|---|---|---|
| Architected | 3 | Cat 14 - fine once, flag when repeated |
| Engineered | 6 | Cat 14 |
| Built | 6+ | Cat 14 |
| Designed | 5+ | Cat 14 |
| Developed | 8+ | Cat 14 |
| Delivered | 5+ | Cat 14 |

Per the euro lexicon: *"a resume whose bullets open predominantly with Architected / Engineered / Developed / Designed / Built reads as 'strong technical architect', not 'leader'."* The fix is **variation**, not downgrade - direct a share of openers toward organizational / leadership verbs (**Established, Enabled, Standardized, Coordinated, Governed, Led, Mentored, Introduced**) where that is what actually happened. The CSV applies this selectively, keeping the strongest single use of each verb and varying the repeats.

## Specific top-offender verbs (individually flagged)

| Current | - Recommended | Why |
|---|---|---|
| `Oversaw` (3 delivery streams) | Coordinated / Governed | Reads top-down; the lexicon flags it by name for matrix leadership. |
| `Directed alignment` | Coordinated / Aligned | Top-down + weak collocation with "alignment". |
| `Headed` (pre-sales) | Led | Hierarchical; Led is the neutral standard. |
| `Championed` (V&V protocols) | Established / Led | Cat-14 top-offender; concrete verb suits protocol work. |
| `Spearheaded delivery` | Led / Drove | Cat-14 top-offender; card already states ownership. |
| `Pioneered` (algorithms) | Introduced / Developed | Innovation-hype; European style prefers understatement. |
| `beat state-of-the-art` | exceeded / surpassed | Informal, competitive register. |
| `drive` / `driving` (adoption, direction) | accelerate / setting | Overused cat-14; more precise alternatives exist. |

## Retained on purpose

- **`Architected` on the Drug Safety AI Platform** - kept as the one genuinely architectural anchor. The recommendation is to vary the *other two* uses, not this one.
- **`Presented` (×3) in Research** - factual and correct for conference talks; repetition here is honest, not a stylistic flaw.
- **`Secured`, `Led`, `Established`, `Mentored`, `Standardized`, `Accelerated`, `Reduced`, `Validated`, `Co-developing`** - already preferred-vocabulary; no change.

## Out-of-scope note

One **adjective**, not a verb, is worth a later look but was excluded from this verb-only pass: `cutting-edge` in the hero subtitle (`00_site.json`) - a cat-14 hype word. Flagged here for visibility; not in the CSV.

## Next step

If you approve, the edits are low-risk (single-verb swaps in JSON string values, no schema or fact changes) and can be applied file-by-file. Recommend applying `01_about.json` and `02_experience.json` first, then re-running `/page-team` or a build to confirm nothing else references the strings.
