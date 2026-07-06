# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-07-06

First production release of the Balaji Selvaraj portfolio site.

### Added

- Astro 4 static site with six nav views and thirteen content sections on a single-page home
- Zod-validated JSON content layer under `content/` (build fails on schema violations)
- GitHub Actions CI (`validate.yml`) and GitHub Pages deploy pipeline (`deploy.yml`)
- Icon and mark standardization pipeline with PNG logo assets and token SSOT drift gate
- Multi-agent design consistency and site review system (page team, site-review-fix)
- Scroll-spy section views, mobile nav, save-page export, and reveal animations
- SEO: meta tags, Open Graph, Twitter cards, JSON-LD Person schema, sitemap, robots.txt
- Résumé PDF as a static asset at `/assets/resume/balaji-selvaraj-resume.pdf`

### Changed

- Dark-only theme (removed header theme toggle; `data-theme="dark"` on load)
- About view scroll target: leadership section first in `viewSections`
- Education stat tiles use Recognition gold hairline grid (aligned with Kaggle summary pattern)
- Vision board IDEA lane uses `silver` accent for medal/recognition semantics

[Unreleased]: https://github.com/balajiselvaraj1601/portfolio_site/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/balajiselvaraj1601/portfolio_site/releases/tag/v1.0.0
