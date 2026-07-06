---
description: Orchestrate a new release — verify CI, bump version, tag, and push to origin. Use when the user asks to "release", "cut a release", "ship a version", or "tag and publish".
argument-hint: [patch|minor|major|X.Y.Z]
allowed-tools: Read Edit Bash(git *) Bash(npm run verify:*) Bash(npm run release:bump:*)
disable-model-invocation: true
---

Orchestrate a new release: verify CI, bump version, tag, and push.

This command automates the release workflow for the portfolio site.

## Prerequisites

- All changes must be committed (no dirty working tree)
- You must have push access to origin (`https://github.com/balajiselvaraj1601/portfolio_site`)
- The `main` branch must be up to date with origin
- Version SSOT: `package.json` → `version` (also synced in `package-lock.json`)

## Steps

1. **Verify the working tree is clean**
   ```bash
   git status
   ```
   If there are uncommitted changes, commit or stash them before proceeding.

2. **Run the full verify pipeline**
   ```bash
   npm run verify
   ```
   Runs: astro check → icon token sync → eslint → prettier → build.
   If any step fails, fix the issue and re-run. Do not proceed until all steps pass.

3. **Determine the version bump**
   Ask the user: "What type of bump? (patch/minor/major) or specify explicit version (X.Y.Z)?"
   - `patch` — bug fixes, no new features (1.0.0 → 1.0.1)
   - `minor` — new features, backwards compatible (1.0.0 → 1.1.0)
   - `major` — breaking changes (1.0.0 → 2.0.0)

   For the **first release** when `package.json` is already at the target version, skip the bump and tag directly.

4. **Bump the version** (skip if tagging current version unchanged)
   ```bash
   npm run release:bump -- --bump patch
   # or
   npm run release:bump -- --new-version X.Y.Z
   ```

5. **Update CHANGELOG.md** — move `[Unreleased]` items into a dated section for the new version.

6. **Create a commit** for the version bump and changelog
   ```bash
   git add package.json package-lock.json CHANGELOG.md
   git commit -m "chore(release): vX.Y.Z"
   ```

7. **Create an annotated git tag**
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   ```

8. **Push the commit and tag** to origin
   ```bash
   git push origin main
   git push origin vX.Y.Z
   ```

9. **GitHub Release** — the tag push triggers `.github/workflows/release.yml`, which runs verify and creates the release with generated notes. Alternatively:
   ```bash
   gh release create vX.Y.Z --title "vX.Y.Z" --notes-file CHANGELOG.md
   ```

10. **Optional:** mirror `main` to the user-site remote (deploy only fires on `balajiselvaraj1601.github.io`):
    ```bash
    git push pages main
    ```

## Output

Report to the user:

```
✓ Release vX.Y.Z created successfully

Release page: https://github.com/balajiselvaraj1601/portfolio_site/releases/tag/vX.Y.Z

Next steps:
- Confirm the Release workflow completed (verify + gh release)
- Live site deploys on push to balajiselvaraj1601.github.io main (unchanged)
```

## Rollback (if something goes wrong)

Before pushing:

```bash
git reset --soft HEAD~1
git tag -d vX.Y.Z
```

If already pushed:

```bash
git tag -d vX.Y.Z
git push origin :refs/tags/vX.Y.Z
# Revert bump commit on main with git revert, not force-push, unless explicitly requested
```

## Notes

- This package is `"private": true` — there is no npm registry publish step.
- Deploy to GitHub Pages remains on every push to `main` on the user-site repo; tags mark milestones only.
