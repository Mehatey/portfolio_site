# Portfolio Site — Visual Style Guide

This file is the single source of truth for layout, typography, and component conventions across all project pages. Every new session should read this before touching any `_pages/` file.

---

## Reference page

**`_pages/cube-guy.md`** is the canonical implementation. When in doubt, copy its CSS and structure exactly.

---

## Page inventory

| File                           | proj_num | Status      | Notes                                                          |
| ------------------------------ | -------- | ----------- | -------------------------------------------------------------- |
| `_pages/encoded.md`            | 00       | Live        | Uses cs-pair layout, Testimonial reflection, two next_projects |
| `_pages/cube-guy.md`           | 01       | Live        | Reference page. Has custom keyframe animations on cs-intro     |
| `_pages/ai-self.md`            | 02       | Live        | Three cs-section dividers, uses global animations              |
| `_pages/mandala.md`            | 04       | Live        | Word-reveal JS on intro, custom hero (cover.png), audio toggle |
| `_pages/b-plus-b.md`           | 05       | Placeholder | Old cs-row/vis-ph system, needs rebuild for project 5          |
| `_pages/mool.md`               | 06       | Placeholder | Old cs-row/vis-ph system                                       |
| `_pages/mind-your-feelings.md` | 02       | Placeholder | Old cs-row/vis-ph system                                       |

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

## Global CSS (project.html) — what's already defined

The following are defined GLOBALLY in `_layouts/project.html` and do NOT need to be re-declared in page style blocks:

- **cs-section** + **cs-section-label** — divider animation (IntersectionObserver in JS adds `is-visible`)
- **cube-cap** + **cube-cap--above** — caption styles
- **cs-intro** base — padding 56px/72px, gap 24px, font clamp(14px,1.5vw,20px)
- **Intro entry animations** — `introTrackIn` (label) + `introFadeUp` (cs-body, cs-body--insight) fire on load globally
- **cs-grid**, **cs-grid-3**, **cs-bleed**, **cs-bleed-full** — layout containers
- **Scroll reveal** — IntersectionObserver adds `.reveal` to most cs-\* elements (NOT cs-intro — intro animates on load instead)
- **Section observer** — IntersectionObserver adds `is-visible` to `.cs-section` elements

**Pages that override cs-intro per-page (correct — page-level wins cascade):**

- cube-guy: uses custom `trackIn`/`fadeUp` keyframes, `padding: 56px var(--gutter) 0`, `gap: 16px`
- mandala: disables global fadeUp (`animation: none` on cs-body), uses word-reveal JS instead; `padding: 56px var(--gutter) 72px`
- ai-self: `padding: 56px var(--gutter) 0`, `gap: 16px`
- encoded: `padding: 0 var(--gutter) 40px`, `gap: 16px` (two stacked intro blocks)

---

## Text hierarchy

| Element         | Class                             | Purpose                                                        |
| --------------- | --------------------------------- | -------------------------------------------------------------- |
| Section divider | `cs-section` + `cs-section-label` | Only 3 per page max. Mono, 11px, uppercase, line left of label |
| Overview block  | `cs-intro` > `cs-body`            | Opening paragraph. Large. Only at page top.                    |
| Insight block   | `cs-intro` > `cs-body--insight`   | Reflection. Same size as overview. Only at page top.           |
| Caption below   | `cube-cap`                        | 13px mono, all mid-page text                                   |
| Caption above   | `cube-cap cube-cap--above`        | Same, placed BEFORE media (tight 8px attach)                   |

**Never use `cs-intro` mid-page.** Never use `cs-chapter`, `cs-row`, `cs-content`, or `cs-heading` (old system).

---

## cs-intro CSS (global in project.html — per-page overrides fine)

```css
.cs-intro {
  max-width: none !important;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 56px var(--gutter) 72px;
  gap: 24px;
}
/* Entry animations fire on load (not scroll-reveal) */
.cs-intro .intro-overview-label {
  animation: introTrackIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
}
.cs-intro .cs-body {
  animation: introFadeUp 1s cubic-bezier(0.22, 1, 0.36, 1) 0.38s both;
}
.cs-intro .cs-body--insight {
  animation: introFadeUp 1s cubic-bezier(0.22, 1, 0.36, 1) 0.78s both;
}
```

**If a page uses JS-driven text reveal (like word-reveal), add `animation: none` to override.**

---

## cs-section CSS (global in project.html)

```css
.cs-section {
  padding: 80px var(--gutter) 32px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.cs-section::before {
  width: 0;
  transition: width 1s...;
}
.cs-section.is-visible::before {
  width: 28px;
}
.cs-section-label {
  opacity: 0;
  transition: opacity 0.7s ease 0.55s;
}
.cs-section.is-visible .cs-section-label {
  opacity: 1;
}
```

---

## cube-cap CSS (global in project.html)

```css
.cube-cap {
  font-family: var(--font-mono);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.42);
  padding: 8px var(--gutter) 0;
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
```

---

## Grid sizing CSS (add per-page to override global aspect-ratio)

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

**If specific items need `object-fit: cover`, add a class like `.g-cover .cs-grid-item img { object-fit: cover !important; }` and apply it to the grid — inline `object-fit:cover` CANNOT override `!important`.**

---

## Media rules

- All images and videos in grids: `object-fit: contain !important` (never cover by default)
- Hero cover only: `cs-bleed-full` (full bleed, 100vw)
- All other images: `cs-bleed` or `cs-grid-item`
- Never add `style="object-fit:cover"` inline when page CSS uses `!important` — use a class override
- Decimal filenames → grids: `x.1 + x.2` → `cs-grid`, `x.1 + x.2 + x.3` → `cs-grid-3`
- Videos: always `autoplay muted loop playsinline preload="none"`
- Max 2 three-column grids per section (items get too small otherwise)
- Bitrate target: CRF 18/medium/30fps (~3–10 Mbps). Anything above ~12 Mbps will stall in browser

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
next_project: # singular for one, next_projects: (array) for multiple
  title: Project Name
  url: /slug/
```

---

## Language rules

- No em dashes anywhere (not in text, not in captions, not in frontmatter)
- No emojis
- Captions: sentence case, italic via `<em>`, one line preferred
- Reflection: 2–3 short paragraphs, same weight as cube-guy.md

---

## Known page-specific quirks

**mandala.md:**

- Word-reveal JS fires on cs-body/cs-body--insight — `animation: none` overrides global fadeUp
- Audio toggle on `mandala-shorter.mp4` uses Web Audio API GainNode (video stays muted, sound via gain)
- `f-vid-wrap` custom div bypasses cs-bleed-full cropping for natural-ratio display
- `.g-cover` class forces cover on g.mp4/j.png grid; `.ma-cover` on test-ma26.png

**cube-guy.md:**

- Has own `@keyframes trackIn`, `fadeUp`, `lineGrow` — these override global `introTrackIn`/`introFadeUp`
- Drift animations on grid items (driftLeft/driftRight)

**encoded.md:**

- Uses `next_projects:` (array, plural) — layout supports both singular and plural
- Uses `refl_type: Testimonial` with `refl_source` / `refl_avatar` / `refl_bg`
- Uses cs-pair layout (not cs-intro mid-page)
- Has two cs-chapter water canvas sections (`id="chapter-water"` and `id="gallery-water"`)

---

## Before every commit

```bash
npx prettier . --write
git add [specific files]
git commit -m "type: description"
git push origin main
```

CI fails if prettier has not been run.
