# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

**al-folio** is a Jekyll static site theme for academics. It is both a deployable personal site and a shared community template. Changes here affect all users who fork it, so prefer conservative, backwards-compatible edits.

## Commands

### Local Development (Docker — preferred)

```bash
docker compose pull && docker compose up    # Start dev server at http://localhost:8080
docker compose up --build                   # Rebuild after Gemfile/Dockerfile changes
docker compose down                         # Stop and free port 8080
```

### Formatting (mandatory before every commit)

```bash
npm install --save-dev prettier @shopify/prettier-plugin-liquid  # First time only
npx prettier . --write
```

PRs will fail CI if prettier has not been run. There is no lint or test command — the build itself is the test.

### Non-Docker build (fallback)

```bash
bundle install
pip3 install --upgrade nbconvert
bundle exec jekyll serve --port 4000        # http://localhost:4000
JEKYLL_ENV=production bundle exec jekyll build
```

## Architecture

The site is a standard Jekyll project with these non-obvious conventions:

- **`_config.yml`** is the single source of truth for feature flags, layout settings, and all integrations. Most "enable/disable" decisions live here as `enabled: true/false` keys.
- **`_bibliography/papers.bib`** drives the publications page via `jekyll-scholar`. al-folio adds custom BibTeX fields: `pdf`, `code`, `preview`, `doi`, `abbr`, `selected`, etc.
- **`_data/`** holds structured content (CV, co-authors, social links, citations, venues, repositories) that templates pull in via Liquid.
- **`_includes/` + `_layouts/`** are Liquid templates. Layouts: `about.liquid`, `post.liquid`, `bib.liquid`, `distill.liquid`, `cv.liquid`. Most page-level logic lives in `_includes/`.
- **`_sass/`** contains SCSS. Production builds run PurgeCSS (`purgecss.config.js`) to strip unused styles.
- **`_scripts/`** contains vanilla JS. No bundler — files are included directly in layouts.

## Critical Configuration Rules

`url` and `baseurl` in `_config.yml` must be set correctly together or CSS/JS will fail to load:

- Personal site (`username.github.io`): `url: https://username.github.io`, `baseurl:` (empty)
- Project site (`username.github.io/repo`): `url: https://username.github.io`, `baseurl: /repo-name/`

Always quote YAML values containing `:`, `&`, or `#`.

## Commit Message Format

```
<type>: <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `config`, `chore`

## Common Pitfalls

- **Port conflict:** `docker compose down` before restarting.
- **Related posts error ("Zero vectors cannot be normalized"):** Post has too little content — add text or set `related_posts: false` in frontmatter.
- **"Unknown tag 'toc'" on deploy:** Verify GitHub Pages source is set to the `gh-pages` branch (not root).
- **Prettier CI failure:** Run `npx prettier . --write` and commit the result before pushing.
- **ImageMagick missing:** Required for image processing. Installed automatically in Docker; local installs need `brew install imagemagick` (Mac) or `apt-get install imagemagick` (Linux).
