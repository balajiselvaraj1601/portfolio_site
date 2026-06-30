# Tasks

Agent batch queue for the codebase sweep. See `.cursor/skills/task-runner/SKILL.md`.

## Conventions

- One actionable item per `- [ ]` line (imperative, verifiable).
- Optional acceptance criteria on the next indented line: `AC: …`
- Verify with `npm run build` before marking an item `[x]`.

## Queue

- [x] Wave 1: Build-time validation (section registry, exclusive viewSections, entity slugs, theme.default, logoSrc path)
      AC: build exits 0; invalid wiring throws at build
- [x] Wave 2: Header desktop controls + Experience a11y/headline + Projects grouping + hero CTAs + Thirukural semantics + mobile focus trap
      AC: build exits 0; theme/save visible on desktop
- [x] Wave 3: Nav scripts + save-page + content metrics/entities + JSON-LD + ContactLink + SpeakingCard datetime + Impact/Contact ariaLabel
      AC: build exits 0
- [x] Wave 4: Low polish (DotNav a11y, MetricCard detail, HeroCanvas tokens, eyebrows, dead code, global.css theme default, docs sync)
      AC: build exits 0; lint passes
- [x] Wave 5: Assets (persist-seq wiring, projects icons, entity cleanup)
      AC: build exits 0
- [x] Final verification: build, check, lint, format:check, smoke:localhost
      AC: all commands exit 0
