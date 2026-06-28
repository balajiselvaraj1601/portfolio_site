# Research: The Header / Hero (Home Page Above-the-Fold)

> Synthesized from a review of senior-AI-leader, distinguished-engineer, founder, and
> principal-architect portfolios, mapped to **this** repo's stack (Astro 4 · Zod-validated JSON
> content layer · pure semantic HTML + CSS tokens · **no JS framework, no animation/chart
> library**). Use this alongside the `page-composition` skill — see
> `.claude/skills/page-composition/references/section-catalog.md` (page sequencing) and
> `hero-anatomy.md` (the order-1 block). This file covers **what the header must contain and
> why** for *this* person; the skill's `hero-anatomy.md` covers the generic field map.

This guide grounds the home-page hero (`src/components/sections/Hero.astro`, rendered from
`content/person/profile.json`, validated by `profileSchema` in `src/schemas.ts`). It records the
findings from the session that reviewed Balaji's homepage and concluded the hero under-sold an
otherwise strong résumé.

---

## 1. Purpose — what the header is for

The header is the single highest-leverage surface on the site. A portfolio home page has roughly
**7–15 seconds** (visitors *decide* in ~5) to answer five questions before the visitor scrolls or
leaves:

1. **Who are you?**
2. **What exactly do you do?**
3. **Why should I believe you?**
4. **What makes you different?**
5. **What should I do next?**

The diagnosis that prompted this guide: the earlier hero answered only #1 and partially #2.
Everything that *differentiates* Balaji — strategic impact, funding, Kaggle ranking, global
leadership — lived **below the fold**, where most visitors never reach. The header's job is to
function as an **executive one-page briefing**, not a simple introduction.

Strategic reframing (the central insight of the session): **do not summarize the résumé on the
home page.** The résumé is about *depth*; the home page is about *positioning*. Within 5 seconds a
visitor should think:

> "This is an AI leader who builds enterprise AI platforms that create strategic business impact
> in healthcare."

Make the header about the **transformation driven**, not a biography. Everything else supports
that one statement.

---

## 2. Recommended header anatomy (mapped to this repo)

Information hierarchy, top to bottom (one strong visual, one focused primary action):

```
Nav → Availability → Eyebrow/greeting → Positioning headline → Value-prop sentence →
Trust metrics → Primary + Secondary CTA → Tech / trust signals → (portrait alongside)
```

| # | Element | Question it answers | Status in repo | Field / source |
|---|---|---|---|---|
| 1 | Navigation bar | Where can I go? | Implemented | `Header.astro` ← `site.json` `pages[]` |
| 2 | Clear identity (name) | Who? | Implemented | `profile.name` / `heroTitle` |
| 3 | Positioning headline (not a job title) | What do you do? | Implemented | `profile.heroTitle {lead, emphasis, tail}` |
| 4 | One-sentence value proposition | What do you create? | Implemented | `profile.headline` |
| 5 | Eyebrow (role · domain · location) | Context | Implemented | `profile.heroTag` / `greeting` |
| 6 | Trust-signal metrics strip | Why believe you? | Implemented | `profile.metrics[{value,label}]` → `.hero-stats` |
| 7 | Primary CTA (impact-led) | What next? | Implemented | `profile.ctas[]` `variant:"primary"` |
| 8 | Secondary CTA (résumé) | What next? | Implemented | `profile.ctas[]` `variant:"secondary"` |
| 9 | Availability indicator | Are you reachable? | Implemented | `profile.availability {status,label}` → `AvailabilityBadge` |
| 10 | Professional portrait | Trust (people trust people) | Implemented | `profile.portrait` → `Portrait.astro` |
| 11 | Tech / capability preview | What's the stack? | Implemented | `profile.techStack[]` → `TechIconRow` |
| 12 | Hero background visual | Memorability | Implemented (subtle) | `HeroCanvas.astro` (low-opacity, no autoplay sound) |
| 13 | Social-proof org logos | Credibility by association | Not in hero | derive from `affiliations.json` (see §5) |
| 14 | Social links in hero | Reach you directly | In Contact/Footer only | reuse `profile.contact[]` |

✅ The current hero already carries the high-value elements (2–12). The remaining gaps are the
**org trust-bar** (13) and optionally **in-hero social links** (14) — both low-effort, high-signal.

---

## 3. Element-by-element guidance

Grouped from the 20 elements surfaced in the review; tuned to this candidate and stack.

### Identity and positioning (questions 1–2)

- **Name** must be large and unmissable — present and correct.
- **Positioning headline is not a job title.** "Technical AI Leader" describes thousands of
  people. Lead with value: the repo uses `heroTitle` = *"Turning biological data into clinical
  impact"* — a transformation statement, exactly right. Keep titles/company names out of the
  headline; they belong in the eyebrow and Experience page.
- **Value-prop sentence** should answer *"what do you create?"* not *"what industry?"* Formula:
  `I lead [audience] to achieve [result] using [skill].` The current `headline` quantifies scope
  ("12+ years leading distributed AI teams…") — descriptive and credible; keep it persuasive, not
  a list.

### Trust signals and quantified achievements (question 3 — the biggest former weakness)

Numbers above the fold beat paragraphs below it. The four `metrics` chosen are the strongest
available and all trace to public content:

| Metric | Value | Why it earns trust |
|---|---|---|
| Years | `12+` | Seniority |
| Kaggle | `652 / 200K+` (Top 0.3%) | Externally verifiable, rare |
| Business impact | `$50M` projected savings | Executive-level outcome |
| Scope | `5` countries, 12-member team | Leadership scale |

Rule: **every metric must be real and attributable** — no invented numbers (AGENTS.md privacy +
SSOT). Keep the strip to ~4; more dilutes.

### Differentiation (question 4)

Balaji's edge is the **intersection**, not any single skill: AI *research* + *production delivery*
+ *healthcare domain* + *executive strategy* + *funding success* + *Kaggle-grade craft*. Surface
the intersection (the `techStack` chips and metrics together imply it); the deeper proof lives in
the six themes (§4).

### Calls to action (question 5)

Keep **one primary, one secondary** — too many CTAs cause decision fatigue. Make them
intent-led, not generic ("View Projects"). Current: primary *"View Impact →"*, secondary
*"Download Resume"* — well-matched to a hiring/executive audience. Tertiary social links
(LinkedIn · Kaggle · Email) can sit visually subordinate beneath the CTAs.

### Trust by visual + association

- **Portrait**: waist-up, neutral background, approachable — beats a monogram placeholder.
  Implemented via `Portrait.astro`.
- **Availability badge**: a small accent badge ("Open to AI leadership & advisory roles") signals
  confidence and reachability. Implemented.
- **Org trust-bar** (gap): a single muted row — *AstraZeneca · Broad Institute · IIT Madras · EU
  Research Consortium* — communicates "works with serious organizations" in one glance. Names (not
  third-party logos) avoid trademark/asset issues; source from `content/person/affiliations.json`.

### Background and restraint

A subtle background (mesh / blueprint grid / molecular motif at very low opacity) adds memorability
without distraction — `HeroCanvas.astro` already provides this. **Avoid** autoplay video with
sound, heavy animation, and anything that competes with the message; respect
`prefers-reduced-motion`.

---

## 4. Positioning over summary — the six career themes

The home page should introduce **impact**, then let the rest of the site prove depth. The résumé
review distilled Balaji's career into six themes; these are the credibility pillars the header and
the first scroll should reinforce:

1. **Enterprise AI leadership** — AI strategy, funding, executive influence, roadmaps, org-building
   (not "just an engineer").
2. **Healthcare AI niche** — oncology, drug safety, digital/computational pathology, medical
   imaging, foundation models, clinical AI.
3. **Business impact** — $20–50M projected savings, $500K follow-on funding, €14M consortium,
   executive sponsorship.
4. **Technical depth** — CV, foundation models, GNNs, multimodal, single-cell AI, RAG, LLMs,
   medical imaging, drug discovery.
5. **Leadership scale** — team 1→12, 5 countries, multiple delivery streams and executive
   stakeholders.
6. **Recognition** — Top 0.3% Kaggle, speaker, publications (JITC, bioRxiv), awards, Broad
   Institute / IIT Madras ties.

Translation to the first screen: small eyebrow → large positioning headline → one supporting
sentence → metrics row → impact-led CTA → org trust-bar. The desired progression of impressions:

- ~10s → "This isn't just another AI engineer."
- ~20s → "He leads large healthcare AI initiatives."
- ~30s → "He has delivered enterprise AI with measurable business impact."

A strong follow-on pattern under the hero: three **achievement cards** (Enterprise Drug-Safety AI
→ $20–50M; Oncology AI → 46% over SOTA, +$500K; Research Leadership → €14M, 14 partners), then a
**"What I Build"** capability grid (Drug Safety · Oncology · Foundation Models · Medical Imaging ·
Generative AI · AI Platforms). These are sequencing decisions — see `section-catalog.md`.

---

## 5. Visuals — re-mapped to no-JS, CSS-only builds

This repo has **no charting or animation library**; every visual is semantic HTML + CSS tokens, a
static asset, or an existing component.

| Header visual | Build it here |
|---|---|
| Trust-signal metrics strip | `.hero-stats` grid in `Hero.astro` (already `profile.metrics`) |
| Capability / tech preview | `TechIconRow.astro` / `Chip.astro` (NOT skill-percentage bars) |
| Org trust-bar | a muted text row of names from `affiliations.json` (no third-party logos) |
| Portrait | `Portrait.astro` (`.jpg` + `.webp`, fixed width/height for CLS) |
| Subtle background motif | `HeroCanvas.astro` — low opacity, reduced-motion safe |
| Mini career arc (Research → Production → Leadership → Strategy) | CSS dots + connectors, like `CareerTimeline.astro` |

**Avoid:** skill-percentage bars ("Python 95%"), client-side charts, stock "AI brain" art,
auto-playing media, and a second competing hero image.

---

## 6. Common header mistakes (avoid)

- Treating the hero as a résumé summary instead of a **positioning** statement.
- A job title ("Technical AI Leader") as the headline — it differentiates no one.
- A value prop that names an *industry* instead of the *value created*.
- Hiding the strongest numbers (impact, Kaggle, scope) below the fold.
- Generic CTAs ("View Projects") and **more than ~2 prominent CTAs**.
- Monogram/placeholder instead of a real portrait; vague "Welcome to my portfolio" copy.
- Long autobiographical paragraphs above the fold; empty whitespace where credibility could go.
- Decorative animation/video with sound that distracts from the message.
- Unverified or inflated metrics, or any phone number / References section (AGENTS.md hard rule).

---

## 7. This-repo mapping (generic concept → existing primitive)

| Research concept | Reuse (do not reinvent) |
|---|---|
| Name / nav / theme toggle | `Header.astro` ← `site.json` |
| Positioning headline | `profile.heroTitle {lead, emphasis, tail}` |
| Value-prop sentence | `profile.headline` |
| Eyebrow (role · domain · location) | `profile.heroTag` / `profile.greeting` |
| Trust-signal metrics | `profile.metrics[]` → `.hero-stats` |
| Primary / secondary CTA | `profile.ctas[]` (`variant`) |
| Availability badge | `profile.availability` → `AvailabilityBadge.astro` |
| Portrait | `profile.portrait` → `Portrait.astro` |
| Tech / capability chips | `profile.techStack[]` → `TechIconRow.astro` / `Chip.astro` |
| Background motif | `HeroCanvas.astro` |
| Org trust-bar (new) | source from `content/person/affiliations.json` |
| Social links in hero | `profile.contact[]` (already in Contact/Footer) |
| Section order around hero | `content/site.json` `pages[].sections[]` + `SectionRenderer.astro` |
| Tokens (color 60/30/10, spacing, `--fs-h1`, `--fs-metric`) | `src/styles/global.css` |

Content stays SSOT: edit `content/person/profile.json` (validated by `profileSchema` in
`src/schemas.ts`); add a schema field **before** the JSON or the build fails. Adding a new field is
a content + schema + component change — wire it via the `astro-site` skill.

---

## 8. Sources

- In-session homepage + résumé review (this repo): the diagnosis that the hero answered only "who"
  and partially "what", and the reframing of the home page from *summary* to *positioning*.
- `.claude/skills/page-composition/references/hero-anatomy.md` — the generic header-element → repo
  field map and the 4-question / 5-second test.
- `.claude/skills/page-composition/references/section-catalog.md` — section sequencing around the
  hero (achievement cards, "What I Build" grid).
- Companion guides in this folder: `research/experience-page.md`, `research/projects-page.md`.
- Synthesis of widely-cited portfolio/landing best practice (above-the-fold value communication,
  one-primary-CTA discipline, quantified trust signals) — e.g. Nielsen Norman Group on
  above-the-fold content and landing-page value propositions.
