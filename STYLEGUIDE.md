# Portfolio Site — Visual Style Guide

This file is the single source of truth for layout, typography, and component conventions across all project pages. Every new session should read this before touching any `_pages/` file.

---

## Reference page

**`_pages/cube-guy.md`** is the canonical implementation. When in doubt, copy its CSS and structure exactly.

---

## Page structure (mandatory order)

```
frontmatter (layout: project, hide_overview: true, ...)
<style> block (page-scoped CSS)
<!-- OVERVIEW -->
<div class="cs-intro"> ... </div>
<div class="cs-bleed-full"> hero image </div>
[cs-section dividers + media blocks]
[optional watch/link bar]
```

---

## Text hierarchy

| Element         | Class                             | Purpose                                                        |
| --------------- | --------------------------------- | -------------------------------------------------------------- |
| Section divider | `cs-section` + `cs-section-label` | Only 3 per page max. Mono, 11px, uppercase, line left of label |
| Overview block  | `cs-intro` > `cs-body`            | Opening paragraph. Large. Only at page top.                    |
| Insight block   | `cs-intro` > `cs-body--insight`   | Reflection. Same size as overview. Only at page top.           |
| Caption below   | `cube-cap`                        | 13px mono, all mid-page text                                   |
| Caption above   | `cube-cap cube-cap--above`        | Same, placed before media                                      |

**Never use `cs-intro` mid-page.** Never use `cs-chapter`, `cs-row`, `cs-content`, or `cs-heading`.

---

## cs-intro CSS (copy exactly)

```css
.cs-intro {
  opacity: 1 !important;
  transform: none !important;
  max-width: none !important;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 56px var(--gutter) 72px;
  gap: 24px;
}
.cs-intro .intro-overview-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.28);
}
.cs-intro .cs-body {
  font-size: clamp(14px, 1.5vw, 20px);
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.68);
  max-width: 680px;
  margin: 0;
}
.cs-intro .cs-body--insight {
  font-size: clamp(14px, 1.5vw, 20px);
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.68);
  max-width: 680px;
  position: relative;
  margin-top: 8px;
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.cs-intro .cs-body--insight::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
}
.cs-intro .cs-body--insight .insight-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.28);
}
```

---

## cs-section CSS (copy exactly)

```css
.cs-section {
  padding: 80px var(--gutter) 32px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.cs-section::before {
  content: "";
  display: block;
  width: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.18);
  flex-shrink: 0;
  transition: width 1s cubic-bezier(0.22, 1, 0.36, 1) 0.1s;
}
.cs-section.is-visible::before {
  width: 28px;
}
.cs-section-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.22);
  opacity: 0;
  transition: opacity 0.7s ease 0.55s;
}
.cs-section.is-visible .cs-section-label {
  opacity: 1;
}
```

---

## cube-cap CSS (copy exactly)

```css
.cube-cap {
  font-family: var(--font-mono);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.42);
  padding: 8px var(--gutter) 0;
  margin: 0;
  line-height: 1.5;
}
.cube-cap em {
  font-style: italic;
}
.cube-cap--above {
  padding: 0 var(--gutter) 8px;
}
.cube-cap--above + .cs-grid {
  margin-top: 8px;
}
.cube-cap--above + .cs-bleed {
  margin-top: 8px;
}
.cube-cap--above + .cs-bleed-full {
  margin-top: 8px;
}
.cube-cap + .cs-bleed {
  margin-top: 16px;
}
.cs-bleed + .cs-bleed {
  margin-top: 16px;
}
.cs-grid + .cs-bleed {
  margin-top: 24px;
}
```

---

## Grid sizing CSS (copy exactly)

```css
.cs-grid {
  height: clamp(360px, 60vh, 720px);
  grid-template-rows: 1fr;
}
.cs-grid-3 {
  height: clamp(300px, 48vh, 560px);
  grid-template-rows: 1fr;
}
.cs-grid-item {
  aspect-ratio: unset !important;
  height: 100%;
  min-height: 0;
  background: #000;
  overflow: hidden;
}
.cs-grid-item img,
.cs-grid-item video {
  width: 100%;
  height: 100%;
  object-fit: contain !important;
  object-position: center center;
  display: block;
}
```

---

## Media rules

- All images and videos: `object-fit: contain !important` (never cover)
- Hero cover only: `cs-bleed-full` (full bleed, 100vw)
- All other images: `cs-bleed` or `cs-grid-item`
- Never add `style="object-fit:cover"` inline on video elements
- Decimal filenames → grids: `x.1 + x.2` → `cs-grid`, `x.1 + x.2 + x.3` → `cs-grid-3`
- Videos: always `autoplay muted loop playsinline preload="none"`

---

## Frontmatter (required keys)

```yaml
layout: project
permalink: /slug/
project_title: "Title"
proj_num: "01" # zero-padded, matches works.html card order
hide_overview: true # always true when page has custom cs-intro
tagline: "..."
category: "Type · Tool"
year: 2025
hero_bg: "radial-gradient(...)"
meta:
  - label: Role
    value: Solo
  - label: Year
    value: 2025
  - label: Tools
    value: Tool · Tool
  - label: Client
    value: Self Initiated
reflection: >
  One or two short paragraphs. No em dashes.
next_project:
  title: Project Name
  url: /slug/
```

---

## Language rules

- No em dashes anywhere (not in text, not in captions, not in frontmatter)
- No emojis
- Captions: sentence case, italic via `<em>`, one line preferred

---

## Before every commit

```bash
npx prettier . --write
git add [specific files]
git commit -m "type: description"
git push origin main
```

CI fails if prettier has not been run.
