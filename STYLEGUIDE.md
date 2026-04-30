# Portfolio Site — Visual Style Guide

This file is the single source of truth for layout, typography, and component conventions across all project pages. Every new session should read this before touching any `_pages/` file.

---

## Reference page

**`_pages/cube-guy.md`** is the canonical implementation. When in doubt, copy its CSS and structure exactly.

---

## Page inventory (last full QA pass: 2026-04-29)

| File                           | proj_num | Status | Notes                                                              |
| ------------------------------ | -------- | ------ | ------------------------------------------------------------------ |
| `_pages/encoded.md`            | 00       | Live   | Reference. Uses cs-pair layout, Testimonial reflection, two next_projects |
| `_pages/cube-guy.md`           | 01       | Live   | Reference. Custom keyframe animations on cs-intro, refl_bg = .mp4 |
| `_pages/ai-self.md`            | 02       | Live   | Sections: AI Perception / AR Experience / VR Experience. Audio toggle on 23.mp4 + 24.mp4 |
| `_pages/mind-your-feelings.md` | 03       | Live   | Brain-wrap LED visualization, no sub-sections                      |
| `_pages/mandala.md`            | 04       | Live   | Sections: Introspective spaces / Breathe / Vision Pro / Mandalas / Guided meditation / Style explorations |
| `_pages/b-plus-b.md`           | 05       | Live   | Street Interviews section with audio toggle (Russell/John/Karis/Tsing) |
| `_pages/mool.md`               | 06       | Live   | Custom mool-hero with vignette, sparse photo-essay layout          |
| `_pages/shot-on-iphone.md`     | 08       | Live   | Sparse photo-essay layout, breathe animations on featured frames   |
| `_pages/naavo.md`              | 09       | Live   | Branding portfolio, refl_bg = 19.png                               |
| `_pages/aananda.md`            | 13       | Live   | Has narrow-bleed accent for 8.png (cs-bleed--narrow class)         |
| `_pages/alpha-stockathon.md`   | 14       | Live   | Pixel-art game project, refl_bg = 7.png                            |
| `_pages/illustrations.md`      | 16       | Live   | 6 cs-section sub-projects (Music, Soft Rains, Avatar Vishnu, Astrologer, Reminiscence, Identity) |

---

## Page structure (mandatory order)

```
frontmatter (layout: project, tagline, hero_image, refl_bg, ...)
<style> block (page-scoped CSS)
<div class="cs-bleed-full"> hero image </div>     # OR cs-bleed if natural-ratio override is set
[cs-section dividers + caption + media blocks ...]
[optional watch/link bar between sections]
[optional <script> block for audio toggles, etc.]
```

The tagline renders as the page Overview automatically (via the layout). Don't add a body-level cs-intro with "Overview" label.

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

**Never use `cs-intro` mid-page.** Never use `cs-chapter`, `cs-row`, `cs-content`, `cs-heading`, `vis-ph`, or `cs-label` (old system).

**Never duplicate the Overview label.** The frontmatter `tagline:` already renders as the page Overview via the layout default. Do NOT add a `<div class="cs-intro">` with `<span class="intro-overview-label">Overview</span>` in the body — it duplicates. If the tagline isn't rich enough, expand it directly in frontmatter.

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
proj_num: "01" # zero-padded, must be unique across all project pages
tagline: "..." # renders as the layout's default Overview — make this rich enough to stand alone
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

- **No em dashes** anywhere — text, captions, alt text, frontmatter, even CSS comments. Use comma, period, or colon.
- **No emojis**.
- **Captions: max 2 lines (~110 chars).** Modern designer practice (2026). Never write paragraph-length captions. Always wrapped in `<em>`, sentence case, ending in a period (or `?` / `!`).
- Reflection: 2–3 short paragraphs, same weight as cube-guy.md.

---

## Page-level CSS standards (per session 2026-04-29)

Every project page's `<style>` block should set:

```css
.cs-bleed { margin-top: 40px !important; }
.cs-bleed + .cs-bleed { margin-top: 40px !important; }      /* consecutive standalones get full breathing room */
.cs-grid { margin-top: 40px !important; }
.cs-grid + .cs-bleed, .cs-bleed + .cs-grid { margin-top: 40px !important; }
.cs-grid + .cs-grid { margin-top: 16px !important; }        /* tighter for series of grids (contact-sheet feel) */

.cube-cap { margin: 40px 0 0; }
.cube-cap + .cs-bleed, .cube-cap + .cs-grid { margin-top: 8px !important; }
.cube-cap--above + .cs-bleed, .cube-cap--above + .cs-grid { margin-top: 12px !important; }
```

**Never** use page-specific caption classes like `.aan-cap`, `.bb-cap`, `.naavo-cap`, etc. They're dead CSS. Always use the global `cube-cap` / `cube-cap--above`.

---

## Reflection block (`refl_bg`)

The layout's reflection section (`_layouts/project.html`) supports both image AND `.mp4` video for `refl_bg`. Detection is based on `.mp4` substring in the path. Examples:

```yaml
refl_bg: "2.cube/5.mp4"      # video — auto-loops, used for cube-guy
refl_bg: "1.met/12.png"      # image — used for encoded
refl_bg: "2.ai-self/reflection.png"
```

For Testimonial style (encoded pattern), also set:

```yaml
refl_type: Testimonial
refl_source: "Person Name"
refl_role: "Title"
refl_avatar: "path/to/headshot.png"  # optional
```

---

## Link bar pattern (Watch / Play / View links)

Used at the end of a section to link out (YouTube walkthrough, GitHub repo, live demo). Two variants:

**Inline-styled (cube-guy, ai-self, b-plus-b):**

```html
<div style="display:flex;gap:0;margin:40px var(--gutter) 0;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);">
  <a href="https://..." target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.42);padding:16px 0;white-space:nowrap;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.88)'" onmouseout="this.style.color='rgba(255,255,255,0.42)'">Watch Full Film ↗</a>
</div>
```

**Class-based (mandala uses `.m-watch-link`, b-plus-b uses `.bb-process-link-bar`):** Same visual result via a page-style class. Either works.

---

## Audio toggle pattern (per-video unmute)

For video that has audio worth playing (rare — most should stay muted). Two implementations:

**Layout-driven** (cs-bleed-full only): add `data-audio` attribute. The layout's JS auto-injects a `cover-audio-btn` in the bottom-right.

```html
<div class="cs-bleed-full" data-audio>
  <video autoplay muted loop playsinline preload="none">
    <source src="..." type="video/mp4" />
  </video>
</div>
```

**Page-level** (any video): add the SVG button + page-level click handler. Pattern used in ai-self (23.mp4), b-plus-b interviews, mandala (mandala-shorter.mp4). The button toggles `video.muted` and a `.muted` class for icon swap.

```html
<div class="cs-bleed">
  <video id="my-vid" autoplay muted loop playsinline preload="none">
    <source src="..." type="video/mp4" />
  </video>
  <button class="cover-audio-btn muted" id="my-btn" aria-label="Toggle audio">
    <svg class="audio-icon-on" ...></svg>
    <svg class="audio-icon-off" ...></svg>
  </button>
</div>

<script>
  (function () {
    var btn = document.getElementById("my-btn");
    var vid = document.getElementById("my-vid");
    btn.addEventListener("click", function () {
      vid.muted = !vid.muted;
      btn.classList.toggle("muted", vid.muted);
      if (!vid.muted) vid.play().catch(function () {});
    });
  })();
</script>
```

Browsers REQUIRE `muted` for autoplay. There's no way to autoplay-with-sound. Always start muted, let the user click to unmute.

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
