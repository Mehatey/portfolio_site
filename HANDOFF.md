# Sid Mehta — Portfolio Handoff & Working Guide

> For the next AI coding agent (Codex) picking up this repo. Read this first.
> It covers **how Sid thinks about design**, **how to work with him without friction**,
> the **repo conventions**, and the **current state + known traps**. Written by the
> previous agent after a long build session, so it reflects real observed preferences,
> not guesses.

---

## 1. What this project is

- **Sid Mehta's personal portfolio** — a product designer / creative technologist in NYC, actively job-hunting. The site is a recruiter-facing tool (resume PDF, "See selected work", showreel, case studies). Treat every change through the lens of _"does this impress a design-savvy recruiter in the first 5 seconds?"_
- **Stack:** Jekyll (an `al-folio` fork), deployed via **GitHub Pages / Actions**.
- **Repo:** `github.com:Mehatey/portfolio_site.git` (branch `main`).
- **Live:** https://siddharthmehta.design — a push to `main` triggers a build (takes a few minutes to go live).
- **Local path:** `~/Desktop/al-folio` on Sid's Mac.

---

## 2. Sid's design taste (the most important section)

He has a strong, specific sensibility. Match it and he's happy; miss it and he'll notice immediately.

- **Real over fake.** He wants effects that are _physically grounded_, not cheap approximations. He explicitly rejected a `backdrop-filter: blur` "gray rectangle" and demanded **real liquid-glass refraction** (SVG `feDisplacementMap` that actually bends content). He replaced an abstract "smoke" shader hero with a **real video of himself working**. If you're tempted to fake something, find the real technique first.
- **Hates dead space and things that "float."** A gradient progress line with no glass behind it read as "dead space" to him. Elements should feel intentional and physically connected to their surroundings.
- **Motion-forward, trend-aware.** He wants what's current in the design world _right now_: **liquid glass (iOS-26 style), kinetic/typewriter type, scroll parallax, blur-to-sharp reveals, backdrop blurs**. He said verbatim "that's all in the design world right now." Lean modern and animated, not static.
- **Personal & authentic.** He chose the pixel video of _himself working in nature_ as the hero over generic abstract visuals. Bring his real identity/story forward.
- **Interactive & playful.** He loves click-to-change-blend-mode, cursor brush-reveal, hover states, and hidden easter eggs (there's a "logo walkabout" easter egg). Reward curiosity.
- **Legibility is non-negotiable but not at the cost of boldness.** He specifically checks that nav icons/text are legible in **both light and dark mode**. Always verify both themes.
- **Detail-obsessed.** He caught a white-square logo and a floating gradient line instantly. He notices when something _feels_ off even when he can't name the CSS cause — so when he describes a vibe problem, translate it to the technical root yourself.

**Palette / system note:** the site runs a three-pillar accent system (product blue / AI amber / culture violet) used across Works lanes, orbit rings, homepage portals, and the case-study progress bar. Respect it — don't introduce random colors.

---

## 3. How to work with Sid (avoid frustration)

- **Keep momentum. Don't stop to ask permission.** He got visibly annoyed at check-ins ("why do u stop working", "continue bro"). Default behavior: **make a reasonable call, state your assumption in one line, keep building.** When he adds a new request mid-task, add it to your task list and continue — don't halt the current work.
- **Take creative calls.** He often says "you can take a call on that." He wants you to decide and execute, then he reacts.
- **Be honest about what you can't verify.** He _respected_ being told "I can't judge motion feel from a backgrounded browser — your eyes are the real QA." Don't over-claim. Flag the one thing that needs his eyes.
- **He iterates visually.** He ships, looks in his own Chrome, screenshots, then gives feedback. Don't over-engineer before he's seen a first pass. Small, shippable increments beat big blind batches.
- **His messages are fast, rough, voice-transcribed.** Infer intent from messy phrasing; don't get hung up on literal wording.
- **Budget-conscious.** He watches usage limits. Be efficient — minimize wasted round-trips, batch work, don't redo things.
- **Commit granularly with descriptive messages.** Explain the _why_, not just the _what_ — he reviews history.

---

## 4. Repo conventions & structure

- **Homepage:** `_layouts/sid_home.html` (huge file — hero, copy, projects, showreel modal, lots of inline `<style>` and `<script>`).
- **Nav:** `_includes/studio_nav.html` (+ `_includes/site_logo.html` for the cube-face logo, `_includes/nav_icon.html` for pixel icons).
- **Project/case-study pages:** `_layouts/project.html`.
- **Footer:** `_includes/site_footer.html` (root class `.site-footer`).
- **JS:** `assets/js/` — notably `home-film.js` (hero) and `home-enhance.js` (typewriter/parallax/reveals).
- **Media:** `assets/img/`, `assets/video/`.
- **PRETTIER IS ENFORCED.** After editing any `.html` / `.js` / `.css`, run:
  `./node_modules/.bin/prettier --write <files>` and confirm with `--check`. Commits are expected to be prettier-clean.
- **Validate JS** with `node --check <file>` before committing.
- **Deploy = `git push origin main`** → wait a few minutes for the Pages build.

---

## 5. Technical traps we hit (save yourself the pain)

1. **Theme vs. dark-hero specificity — this bug has now bitten twice.** `studio_nav.html` carries a generic `html[data-theme="light"] .studio-nav { --nav-ink: #0a1727 }`. Its specificity (0,2,1) beats the page rule `.home-page .studio-nav` (0,2,0), so in light theme the dark-canvas pages inherit near-black labels and a white-filled logo mark on a black background — invisible. Fixed again in commit `03ac4dee` by adding explicitly `html[data-theme="light"]`-prefixed variants for `.home-page`, `.contact-page` and `.play-page` immediately after the generic block. **If you touch nav colour, re-screenshot home, contact and about in BOTH themes** — this is the single most-regressed thing in the repo.
2. **jekyll-minifier mangles `var()` inside `calc()`.** It once broke `calc(var(--nav-h) …)` into `var( - - nav - h)`. There's a comment about it in `project.html`. Be cautious with CSS custom properties inside `calc()` in production output.
3. **`home-film.js` went missing from the working tree once** (untracked + deleted on disk, though referenced by the homepage and live in prod). **After any big change, run `git ls-files assets/js/home-film.js`** — if it's empty, the hero will 404 on the next rebuild.
4. **Liquid glass is Chromium-only for the refraction.** `studio_nav.html` uses `backdrop-filter: … url(#nav-glass)` with an inline SVG `feTurbulence` + `feDisplacementMap`. Non-Chromium browsers get a blur-only fallback (by design). Tune the bend via `scale="16"` in the filter.
5. **Backgrounded/automation browsers throttle `requestAnimationFrame`**, so WebGL/canvas _motion_ can't be judged from a headless/background tab. Static CSS filters (the glass) do render; rAF-driven animation (the film brush) does not. Validate motion in a real foreground Chrome.
6. **`play/index.html` and `og-card/index.html` are in `.prettierignore`** — they are hand-tuned and prettier reformats their inline JS/CSS in ways that break logic. Edit them by hand and do **not** run prettier on them.
7. **SMIL beats a CSS class for filter ramps.** The contact desk liquefy animates `feDisplacementMap` `scale` from 0 via `<animate begin="indefinite">` triggered from JS with `beginElement()`. A CSS class toggle can only switch a filter on, not ramp it — if you need a displacement to _grow_, use SMIL.

### Working through the Cowork device bridge (if you are the cloud agent, not Codex)

- The repo mounts at `~/mnt/al-folio`, **not** `~/Desktop/al-folio` — but `device_commit_files` rejects the mount path and requires the user-facing one (`~/Desktop/al-folio/...`).
- **`rm` is blocked on the mount** ("Operation not permitted"). To clear a stale git lock, `mv .git/index.lock .git/index.lock.stale`. A reusable one-liner: `for f in .git/index.lock .git/HEAD.lock; do [ -e "$f" ] && mv "$f" "$f.stale"; done`. To free disk, truncate with `: > file`. Cross-device `mv` to `/tmp` also fails — move unwanted files into a `_to_delete/` folder inside the repo instead and tell Sid to delete it.
- Every commit prints `warning: unable to unlink '.git/objects/…/tmp_obj_…'` and a git-lfs hook warning. Both are benign; filter with `grep -v`.
- **There is no `bundle`/`jekyll` on the device VM** (only `/usr/bin/ruby`, `/usr/bin/gem`), so Jekyll builds cannot be validated there. Keep new includes to plain `{{ site.baseurl }}` Liquid and lean on prettier + `node --check`.
- `device_bash` `timeout_ms` maxes out at 45000.
- **Git can create `.lock` files on the fuse mount but cannot unlink them.** Prefix _every_ git call, in the same shell invocation, with a sweep that moves any lock into `.git/stale-locks/`. Do **not** rename locks in place under `.git/refs/` — git parses whatever is in there as a ref and `git log --all` starts failing with `fatal: bad object refs/heads/main.lock.cleared_…`.
- **The cloud agent cannot push.** The remote is SSH (`git@github.com:…`) and the device VM has no `~/.ssh` and no credential helper; `git push` dies with `Connection closed by UNKNOWN port 65535`. Commits land locally and **Sid has to push them himself**.
- **`git reset --hard` does not work on the mount** — it returns `fatal: Could not reset index file to revision 'HEAD~1'` even with every lock swept away. `git add` and `git commit` work fine; only index-rewriting operations fail. To undo a bad commit, restore the content and commit forward instead: `git show HEAD~1:path/to/file > path/to/file`, then `git add` + `git commit`. Verify the revert by checking that the commit stat is the exact inverse of the bad one.
- **`device_stage_files` returns a stale cached copy for any path already staged this session.** It reports the correct byte count in its JSON result while the file that lands under `/mnt/user-data/uploads/` is the _old_ one — the mismatch between the reported `bytes` and `wc -c` on the staged file is the only tell. Workaround: copy the file to a fresh path on the device first (`cp HANDOFF.md _scratch/stage2/HANDOFF.md`) and stage _that_. **Always compare the reported `bytes` against `wc -c` after staging.**

> **The single most expensive mistake made in this repo so far.** The container's `~/repo/` mirror is **not** kept in sync with `~/mnt/al-folio`. Commit `c3bfbca0` edited a container copy of `_layouts/project.html` that had drifted ~500 lines behind the device, then wrote the whole file back — silently deleting the pillar-accent system, the progress bar's tint and glow, and the entire design-decisions section. It was caught only because the commit stat read `203 insertions(+), 504 deletions(-)` for what was supposed to be a purely additive change.
>
> **Rule: stage a file from the device immediately before editing it, and check the commit stat afterwards.** A purely additive edit that reports deletions means you just overwrote something.

### The local QA loop (cloud agent — this is the thing that makes visual QA possible)

rubygems.org returns 403 in the container, so there is no real Jekyll. Instead `/home/claude/pc/` holds a Jekyll-lite pipeline that turns a 15-minute deploy round-trip into an 8-second one:

- `pc/ssg.js` — reads `_config.yml`, `_data/*.yml` and the collections, renders each page through liquidjs, walks the layout chain, writes all 21 pages to `/home/claude/site/`. (liquidjs gotcha: `jekyllInclude: true` requires `dynamicPartials: false`.) It does **not** know about the root-level `play/index.html`, which is `layout: none`.
- `pc/serve.js` — static server on `:4321`.
- `pc/qa.js <path> [tag] [width] [height] [theme] [shots]` — Playwright + Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (pass `executablePath`; the default headless-shell path does not exist), launched with `--enable-unsafe-swiftshader --use-gl=swiftshader`. Dumps geometry JSON, collects page/console errors, writes screenshots. **Print `e.stack`, not `String(e)`** — that is what finally located a `classList` null error that had survived several sessions.
- **`requestAnimationFrame` is throttled to ~500ms in this headless setup.** A rAF sampler over 900ms yields two frames, which looks exactly like a broken transition. To sample a CSS transition mid-flight use `setTimeout(tick, 60)`. Playwright-side `waitForTimeout` probes read endpoint values and lie the same way. Never conclude a transition snaps from rAF sampling alone.
- **`IntersectionObserver` does not deliver reliably here either.** On the home page 18 `.rv` elements exist and exactly one ever gains `.in`, before or after `scrollIntoView`, with zero page errors. Any scroll-reveal work has to be QA'd by forcing the end state — `document.querySelectorAll('.rv').forEach(e => e.classList.add('in'))` — and the _timing_ still needs Sid's eyes in real Chrome.
- **`#enter-gate` intercepts every pointer event on the home page.** Remove it (and `#loader`) before any Playwright `hover`, or the hover times out on an element-intercepts-pointer-events error.
- **The home page cannot be screenshotted below the fold.** The scroll itself works (`scrollY` reaches 6597 and the section's viewport-relative `rect.top` becomes 378), but the capture surface never follows: a full-viewport screenshot after scrolling still shows the hero. Removing the GL canvas does not help. Two dead ends are worth not repeating — `elementHandle.screenshot()` times out on "waiting for element to be stable" because the GL rect-lerping never settles, and a clip computed as `rect.top + scrollY` is wrong because a non-fullPage clip is viewport-relative. **What works:** extract the page's own `<style>` blocks and the section markup out of the built HTML into a standalone file and shoot that at scroll 0. It is the real CSS and the real markup, so it is a genuine check of anything layout-, colour- or hover-related; only the page's own compositing context is missing.
- Prettier runs out of `/tmp/pret` in the container (the repo `.prettierrc` is **YAML**, not JSON). **On the device just use the repo's own `./node_modules/.bin/prettier --write <file>`** — far simpler, and it is the same binary CI uses. CI runs `npx prettier . --check` over the whole repo.

---

## 6. Current state

**Homepage (`_layouts/sid_home.html`)** — rebuilt again (commit `28f5fc32`). The film hero, `home_cinema.html` and `.hs-univ` are gone; the previous layout is preserved verbatim as `_layouts/sid_home_v1.html`, so a revert is one `cp`. Order is now: hero → **01 selected work** (a six-item gallery) → **02 numbers** → **03 `home_cube.html`** → **04 door**.

The page is one continuous WebGL space — `assets/js/home-gl.js` draws a fixed full-viewport canvas (`#gl-stage`, `z-index: 0`) and every section above it is transparent. **Do not give any section an opaque background**; it punches a hole straight through the effect. `home_cube.html` ships `background: var(--home-bg)` on `.hs-object` and is overridden in the layout for exactly this reason — any future include needs the same treatment.

- `assets/js/home-gl.js` — two programs, one rAF loop, no dependencies. (a) A domain-warped fBm backdrop (noise sampled through noise, which is what makes it read as weather rather than a blurred blob) that leans with scroll velocity and cursor, with a `u_light` uniform branching the palette for light theme. (b) **DOM-synced media planes**: project images stay real `<img>` inside real `<a>`, so the DOM keeps layout, links and accessibility; GL hides the pixels (`.is-gl` → `opacity: 0`) and redraws each at its own `getBoundingClientRect()` every frame. The rect is _lerped_ toward the true rect, which is where the inertia comes from. Each plane is a 24×24 mesh that curls along its own surface (a real vertex bend, not a skew), plus per-pixel velocity chromatic aberration and a hover ripple.
- **Native scroll, deliberately — not transform-hijacked smooth scroll.** Lerping only the GL rects gives the inertial drag feel without breaking `position: sticky` or anchor links. Do not swap in a scroll-hijacking library.
- Texture upload is wrapped in try/catch and only then adds `.is-gl`, so a tainted or slow image just stays a normal DOM image. No WebGL and `prefers-reduced-motion` both bail before touching anything — the fallback is the unmodified markup, not a second code path to maintain.
- `.hg-base` is a CSS twin of the shader field that fades out once `html.gl-on` is set, so first paint is never a flat void.
- Leftover `.hs-card` / `.hs-grid` CSS and the `.hs-card` JS references left with the old layout.

- `_includes/home_cinema.html` — a pinned viewport that turns vertical scroll into a horizontal rail of seven panels. `position: sticky` + a JS-computed section height tied to `rail.scrollWidth - innerWidth`; per-frame it sets `--d` (depth) and `--px` (counter-pan) on each panel so off-centre panels shrink, desaturate and dim. Falls back to a native `scroll-snap` scroller on touch, under 900px, and reduced motion.
- `_includes/home_cube.html` — a real CSS 3D cube, six covers on six faces, spun by scroll position plus drag with inertia (`velY *= 0.94`). CSS 3D rather than WebGL on purpose: crisp at any DPR, each face is a real `<a>`, no GL context to lose. Collapses to `.is-flat` grid without `preserve-3d`. A capture-phase click suppressor kills the click when `moved > 8` so a drag never navigates.
- Leftover `.hs-card` / `.hs-grid` CSS is now unused, and three JS references to `.hs-card` (`sid_home.html`, `home-enhance.js` ×2) are harmless no-ops over empty NodeLists. Safe to delete when convenient.

**Contact page (`_layouts/contact.html`)** — the "watch the reel" button is gone (reel lives on the home page only). The desk is ~45% larger and, after a 1.1s sustained hover, liquefies via the SMIL displacement filter described in trap 7, then solidifies on leave.

**Theme** — light mode is now complete across the site, and there is a **theme switch in the studio nav** (`#studio-theme`): one disc that morphs — in dark theme a second circle sits off-canvas with rays extended (sun); in light theme it slides in and bites a crescent while the rays retract (moon). `cx`/`cy`/`r` are animated as CSS properties. It shares the `sid_theme` localStorage key with `head_bootstrap.html`, so the choice applies before first paint on the next load. Where the older floating `#theme-toggle` (in `cursor_fluid.html`) also exists, it is hidden via `body:has(.studio-nav) #theme-toggle`.

**Also live:** logo renders as the cube-face; hero film with the WebGL brush reveal and click-to-cycle blend modes; liquid-glass nav with real refraction; showreel; Fairview animated icons; AI-page autoplay; next-project preview; rebuilt footer with the "get to know Sid" strip.

---

## 6b. What landed in the overnight session (20 unpushed commits)

Everything below is committed on local `main` and **not yet on `origin/main`** (see §5 — the cloud agent cannot push). Newest first:

- `06bf77c8` - **craft pass on the homepage "By the numbers" row.** Each figure gains a 20x20 hairline glyph drawn at the same 1px weight as every rule on the page, so it reads as part of the drawing rather than an icon set bolted on; each strokes itself in behind its own column's existing `--d` delay via `stroke-dasharray`/`dashoffset`, so the row draws in sequence instead of blinking on. The `border-top` above each figure now carries a brighter rule that wipes left to right on reveal - the line is drawn, not switched on - stopping at `--home-faint` because four full-strength rules across the page would read as a table. Hover lifts the glyph 3px and brings glyph, label and rule to full ink; the lift is on `.num__ico` rather than `.num` because `.rv` owns `transform` at 900ms with a `var(--d)` delay, so a hover lift there would inherit that sluggish timing. `prefers-reduced-motion` lands both effects already finished. Deliberately monochrome: the three-pillar accent system's "AI amber" sits too close to the kill-yellow constraint.
- `0666fabf` — corrected a comment in `_layouts/contact.html` that still described the first draft of the copy-button fix (padding + negative margin) rather than what shipped (a transparent `::before` hit-area expander).
- `02d7dde2` — **mobile touch-target pass.** Measured, not guessed: a 390x844 audit counted undersized tap targets at works 7, about 11, contact 8, marriott 9. The worst was the About FAQ, where the padding lived on the `.faq-item` wrapper and the `summary` — the actual click target — was a 16px strip inside a 56px row, so five-sixths of every question did nothing when tapped. Now works 1, about 1, contact 2, marriott 1, and every remaining entry is a known non-issue (`skip-link` is visually hidden until keyboard focus; the two `contact-copybtn` entries still measure 44x23 because the audit reads the element box, not the `::before` that carries the 44px hit area). The contact copy buttons are bordered `border-radius: 999px` pills, so a naive `min-width/min-height: 44px` would have rendered a fat circle beside the email address — they got a transparent pseudo-element hit-area expander instead, leaving the painted pill untouched. The footer hint also now reads "Drag across the plot to plant" on touch, keyed on `(hover: none), (pointer: coarse)` rather than viewport width, so a small laptop window still reads correctly and a large tablet does not. Desktop regression was proven, not assumed: a side-by-side probe at 1512 vs 390 shows desktop metrics unchanged and the mobile FAQ row moving 59px -> 57px while its tap target goes 16px -> 48px. Horizontal overflow was investigated and cleared — all four pages report `scrollWidth === clientWidth === 390`; the flagged elements are the intentional About marquee, the deliberately bleeding contact desk illustration, and `next-cover` at -4 -> 394.
- `4598f6eb` — recorded the stale-mirror and fuse-mount git traps in this file.
- `7964c893` — **The Plot no longer opens as bare ground.** Ambient growth alone took ~20 seconds to fill the plot, so a visitor who scrolled to the bottom met an empty pond, which reads as broken rather than as patient. It now sows 24 seedlings at staggered maturities on the first animation frame, so it opens as a garden that has already been growing. Also fixed a pre-existing bug where every unattended planting used a range (full width, 0.34–0.96 of the height) that overshot the pond on three sides and slowly stranded plants on the dry paper margin — all of it now goes through one `sowPoint()` that samples inside the pond.
- `dddd7f0d` — case-study proof row: the three highlight figures reveal on a 110ms stagger, numeric values count up to their real figure, and hovering draws a hairline under the figure it belongs to. The row also shed ~150px of dead space beneath it. The count-up cannot mangle a number — it writes the front-matter string back verbatim at the end, skips values with no digits, and both the reduced-motion and no-IntersectionObserver paths land straight on the finished state.
- `26301138` — **revert.** Restored `_layouts/project.html` after `c3bfbca0` was written from a stale container mirror and destroyed ~500 lines. See the warning box in §5.
- `c3bfbca0` — **destructive, superseded by the revert above.** Left in history because rewriting it is not possible on this mount.
- `03ac4dee` — removed ~120 lines of dead `#loader-stream` code (the terminal typewriter markup was deleted earlier; its styles, driver IIFE and fade hook were left behind and ran on every visit matching nothing), and re-fixed the light-theme nav blackout on dark-canvas pages (§5 trap 1).
- `604a03fa` — removed a dead `.nav` scroll-dimming handler in `works.html` that threw `TypeError: Cannot read properties of null` on **every scroll frame**; the page renders `studio_nav`, which has no `.nav` element. `404.html` genuinely has `.nav`, so it got a null guard instead. A 12-page sweep afterwards came back JS-error-clean.
- `7a273270` — a "Currently" block in the third About column with a **live New York clock** (`Intl.DateTimeFormat`, repainting every 20s) plus hairline SVG icons. Added because that column trailed off and left the grid unbalanced. Every line restates a fact already on the page — nothing invented.
- `f3ef0897` — About craft pass: row hovers, tag transitions, and a real height-animated FAQ (`<details>` can't animate, so the panel is a `0fr → 1fr` grid row and the summary click is intercepted to hold `open` until the close transition finishes).
- `f68c164d` — Contact craft pass.
- `d2a1cea9` — unified case-study front matter across all 15 projects.
- `de72d861` — retired the last yellow from the nav icons.
- `ba26a361` — **The Plot**: the footer rebuilt as an interactive ASCII/watercolour garden (the emmiwu.com + baothiento.com references).
- `3a5b6850` — Works index rebuilt for breathing room.

---

## 6c. Cover pass, meniscus fix and the light-mode contrast sweep (this session)

Three things landed, all still unpushed at time of writing.

**Covers.** The AI Experiments cover was resourced from `assets/media/ai-prototypes/mimic/mimic5.mp4` at t=1s: every `-poster.webp` on that page is only 1280x720 while the mp4s are true 1920x1080, so `ffmpeg` frame extraction beat every still on disk. ffmpeg and ffprobe are both on the device at `/usr/bin/`. Three works-page items (Bloom, AI Self, Cube of Creations) had no `data-img` at all; Alpha's cover was the yellow-speech-bubble pixel art and Aananda's was a three-panel collage, both replaced with single-scene frames. New covers live in `assets/img/work-covers/` at 1800px, WebP method=6. Contact sheets built with PIL on the device and staged as one image are the way to judge sixteen covers at once — staging sixteen files through the uploads mount hits the path cache.

**The meniscus late-layout bug.** The curve on `.cs-bleed` and friends had shipped and looked right in spot checks, but counting `.mn-edge` elements without a `d` attribute showed it was silently missing on 20-70% of frames per page. It was a state bug, not a geometry bug: `apply()` bailed when the media had no height yet, but `tick()` marked the frame done regardless and the rAF loop parked. Fix was to make `apply()` return whether it actually drew, derive `done` from that, and add a `ResizeObserver` so a frame that gains height redraws. Verified 0 missing across all 17 pages, both themes, desktop and mobile.

**Light-mode contrast.** A computed-contrast sweep (`pc/contrast.js`) over 20 pages x every viewport-height scroll position found text at 1.03-1.83 WCAG ratio in light theme -- white or accent type on the cream page. Fixed: the scroll-progress readout, mandala's thesis cards, the watch/play/source link bars on several pages, `.cs-watch-link` globally, encoded's award tiles and artist list, ai-prototypes' per-card accent links, and the works page 'Recruiter fast lane' label. Both themes now sweep clean.

### Traps this session added to the pile

- **The site-wide fixed background canvas breaks any "is this text over artwork?" heuristic.** `contrast.js` reported all 20 pages clean for three consecutive runs because the full-viewport canvas intersected every element's rect, so every element was skipped as "over media". Filter media by `position !== 'fixed'` and exclude anything covering >90% of the viewport. Always validate a detector against a known-bad element before believing a clean result.
- **Sampling a long page at 7 evenly-spaced scroll positions misses most of it.** A 30000px page gets 4000px gaps. Step by ~760px instead.
- **`pg.evaluate(someArrowFnString)` evaluates the string as an expression and returns the function, not its result.** Wrap it: `pg.evaluate("(" + FN + ")()")`.
- **A debug harness that reads a template literal out of a source file with `readFileSync` gets the escaped source, not the runtime string.** `/[\\d.]+/` in the file is `/[\d.]+/` at runtime; read raw and the regex matches backslashes instead of digits. Two debugging detours came from this.
- **`!important` inside a media query outranks a theme override of higher specificity.** The works 'Recruiter fast lane' label had a hard-coded blue that no light rule could beat. Route colours through a token that flips with the theme rather than adding `!important` to the override.
- **The container mirror has no video files at all**, so every project page reports broken `<video>` and some zero-height grids. Those are artifacts. The real check is to enumerate every asset reference from `_pages/*.md` and `_layouts/*.html` on the device and `urllib.parse.unquote` before testing existence -- repo paths contain literal spaces written as `%20`. All 459 references resolve.
- **Fast synthetic scrolls produce black screenshots** at the harness's ~12fps rAF. Verify with a single settled screenshot before concluding a page failed to render.

---

## 7. Open items

1. **PUSH THE TWENTY COMMITS.** (Counted, not estimated: `git rev-list --count origin/main..HEAD` says 20.) `git push origin main` from the Mac, then confirm prettier CI is green and QA the result live in both themes. The cloud agent cannot do this: the remote is `git@github.com:Mehatey/portfolio_site.git`, and the device VM has no `~/.ssh` and no credential helper, so `git push` dies with `Connection closed by UNKNOWN port 65535`.
2. **The remaining "no breathing room" follow-ons** from the governing brief: the **home page** and the **Play page** still want the motion/hover/icon craft pass that Works, Contact, About and the case-study layout have now had. Note that Play is the root-level standalone `play/index.html` (`layout: none`, ~98 items, its own 3D gallery) — it is _not_ a Jekyll page, `pc/ssg.js` does not build it, and it is the highest-risk file in the repo to touch unattended.
3. ~~The "get to know Sid" strip~~ — checked. The strip no longer exists; The Plot replaced it. The footer now reads name → tagline → updated-date → links → pull-quote → plot, and renders correctly in both themes.
4. ~~**Mobile / touch pass**~~ — done for tap targets and the footer hint (`02d7dde2`). What is still open is the part that cannot be judged headless: whether the **cube** and the **desk liquefy** actually feel right under a thumb, which needs a real phone.
5. **Tune the nav glass `scale`** (currently `16`) once Sid has judged the bend in real Chrome.
6. **Dead code, safe to delete once Sid confirms he doesn't want v1 as a rollback:** `assets/js/home-enhance.js`, `_includes/home_cinema.html`, `_layouts/sid_home_v1.html`, `_layouts/about.liquid`, and the leftover `.hs-card` / `.hs-grid` CSS.
7. **`works.html` CSS dedup** — deliberately deferred. A selector scan showed high counts, but most are legitimate duplicates inside media queries and theme blocks. A 4700-line single `<style>` block is high-risk / low-visible-reward to refactor unattended.
8. **Housekeeping on the Mac:** `_to_delete/` (83M) and `_scratch/` (59M) need a local `rm -rf`; `.git/stale-locks/` is junk and can go too. The disk is at 100% (2.8G free of 461G) — the real pressure is outside this repo.
9. **Untracked and not mine:** `_layouts/arcana.html`, `_pages/arcana.md`, `assets/css/arcana.css`, `assets/js/arcana.js`, `assets/tarot/`.

---

## 8. A prompt Sid can paste into Codex to set context

> "You're working on my Jekyll portfolio (`~/Desktop/al-folio`, repo `Mehatey/portfolio_site`, live at siddharthmehta.design, deploy = push to main). Read `HANDOFF.md` at the repo root first — it has my design taste, how I like to work, the conventions, and the current state. Key rules: keep momentum and make reasonable calls instead of asking me permission every step; run prettier on anything you edit; always verify nav/logo legibility in BOTH light and dark mode; and I want real, modern, physically-grounded effects (real glass refraction, kinetic type, parallax, blurs), never flat fakes."

---

## 9. Sid's next requests — prioritized build queue (added after handoff)

These came straight from Sid. Build to the taste in §2 (real, modern, physically-grounded; verify light+dark; keep momentum).

### P1 — Homepage project thumbnails: hover-to-preview ◐ PARTIAL (commit 708769ce)

> **Wiring DONE, visual BLOCKED.** `home-enhance.js` module 4 now fires `show()/hide()` on hover/focus and toggles `.home-stage.has-project` (previously dead code after a retired peephole's early `return;`). Verified live: the class toggles, `#home-focus-*` fields populate, the cover image loads.
> **Remaining bug (needs live devtools):** the `#home-project-focus` takeover layer computes to **0×0** in the current layout, so nothing shows even though it's `opacity:1; visibility:visible; z-index:2`. Forcing `position:absolute; inset:0` on it did NOT size it (stayed 0×0) — so the cause is deeper than a missing inset (parent sizing / a conflicting higher-specificity rule / the layer being auto-sized to collapsed content). This regressed when the film hero replaced the old shader. Diagnostic facts: parent is `#home-stage` (which is `isolation:isolate`); sibling stacking is film `z:-4`, focus `z:2`, copy `z:4`, projects `z:5`. **To finish:** (1) make `#home-project-focus` fill the hero (size it to `#home-stage`), (2) add `.home-stage.has-project .home-copy{ opacity:0; pointer-events:none; }` so the z-2 preview shows through the z-4 copy, (3) keep thumbnails (z-5) uncovered so pointerenter/leave doesn't flicker. Then it's done.

### (original spec) Homepage project thumbnails: hover-to-preview (interaction bug)

The three thumbnails bottom-right of the hero (`01 Mool`, `02 2026 AI Experiments`, `03 Encoded`) currently do **nothing on hover** — you must click to navigate. Sid wants **hovering a thumbnail to open its preview onto the homepage hero cover** (a large preview takeover), so he can skim projects without leaving the page; click still navigates.

- Likely relevant: the homepage already has a **retired** focus/preview system — see `.home-stage.has-project`, `.home-project-focus`, `.home-project-focus__media`, `#home-work` / `#home-work-img` in `_layouts/sid_home.html`, plus two disabled reveal IIFEs that `return;` early ("Hero cursor-peephole reveal retired", "Work-reveal peephole retired"). **Re-enable / rebuild hover→preview from that scaffolding** rather than starting from zero. Each thumbnail should drive the focus layer on `mouseenter` (with a small intent delay) and clear on `mouseleave`.
- Must coexist with the hero film (`home-film.js`): the film sits at the hero backdrop; the preview takeover should layer above it. Respect reduced-motion.

### P1 — Richer homepage scroll (parallax, animation, relevant info)

Homepage is currently ~single-screen. Sid wants scrolling down to be **more interesting**: stronger/more varied **parallax**, **better animations**, and **more relevant info** revealed as you scroll (e.g. selected-work highlights with real context, the three-pillar disciplines, stats like "6 yrs shipping / 14 projects / 25 artworks at The Met", awards). Make it a designed scroll narrative, not filler. Reuse the blur-to-sharp + parallax primitives already in `assets/js/home-enhance.js`; layer scroll-linked reveals per section. Keep it fast and legible.

### P2 — 3D cube as a lower scroll section (NOT over the hero)

Sid explicitly decided the cube **on top of the hero video is "too much."** Do **not** put a cube behind/over the hero. Instead consider a **3D cube further down the homepage scroll** as a section/transition that reveals the other projects (cube faces = projects, or a cube that assembles on scroll). Optional / exploratory — only if it strengthens the scroll narrative above. The nav logo is already a cube-of-creation motif; keep it consistent.

### P2 — Typewriter headline needs the BACKSPACE motion

Current typewriter (`home-enhance.js`) only types the headline forward once. Sid asked for the **kinetic backspace effect**: type a phrase, **erase it**, and retype/swap — e.g. cycle the ending ("clear, useful experiences." → erase → "spatial experiences." → "products people love."). Implement a type→pause→backspace→type loop on `#home-title`'s accent phrase. NOTE: the headline also has a **pre-existing** letter-split animation (`.ht-w`/`.ht-l`) — pick one system, don't let them fight.

### P2 — Interactive video footer (still open)

Full version not built (only a glass-blur CSS pass on `.site-footer`). Sid wants an **interactive footer using the pixel/working video**, with **content arranged on the left** and **blur**. Build the real thing.

### Verification debts (do before calling any of the above "done")

- **Dark mode**: the liquid-glass nav's dark-theme path is coded but never eyeballed — Sid explicitly asked to verify light AND dark. Check nav/logo/glass legibility in dark mode.
- **Mobile / touch**: the film (`pointermove`), parallax, typewriter, and glass were never checked on mobile. Several are pointer/desktop-centric — verify and add touch fallbacks.
- **Showreel**: only the URL + play logic were verified; the full modal play-through was never watched end-to-end. Confirm it actually plays.

---

## Session log — Aug 2026: meniscus edges, nav legibility, the pond bed

### Traps this session cost real time on (read before touching the repo)

- **`/mnt/user-data/uploads/` caches by device path.** `device_stage_files` reports honest byte counts in its JSON while the mount keeps serving a days-old snapshot at that same path, and re-staging the same path does not refresh it. Workaround: `device_bash`-copy the file to a **new** device path first (e.g. `_scratch/qaN/thing.html`) and stage _that_. A fresh path has no cache entry.
- **The container mirror only carries cover images.** Every other case-study asset 404s, so media frames collapse to alt-text height (18px) and any geometry QA on a project page is meaningless. `pc/serve.js` now serves `pc/ph.jpg` — a gridded stand-in at 16:10 — for any missing `.png/.jpg/.webp/.gif`, which is what makes project-page layout QA possible at all.
- **The harness runs rAF at ~12fps.** Measured, not guessed. Anything spring-driven will look mid-flight in a screenshot taken a second after the input; poll the geometry over 8s before concluding a spring does not settle. It probably does.
- **`qa.js` sets both `theme` and `sid_theme`.** The site reads `sid_theme`; before this fix every light-theme screenshot was a lie.
- **The Bash tool's working directory persists between calls.** Two patches died with `FileNotFoundError` because cwd had drifted to `/home/claude/pc`. Prefix relative-path patches with `cd /home/claude/repo &&`.
- **`git *.lock` cleanup must move `.git/index.lock` AND `.git/HEAD.lock` to unique names.** The glob loop silently no-ops if the destination name already exists in `.git/stale-locks/`, and then the commit fails with "Another git process seems to be running". Suffix with `$RANDOM`.
- **Start the local server with `setsid nohup node serve.js > /tmp/serve.log 2>&1 < /dev/null &`.** `pkill -f serve.js` matches the Bash tool's own shell and kills the call (exit 144).
- **`_includes/cursor_fluid.html` lines ~4152–4260 (`GLOBAL CHROME 6.0`) paint nothing on any real page but ARE live on the 404 page**, which renders `<nav class="nav"><div class="nav-links">`. Do not delete the block.

### The corrected `works.html` cascade map

An earlier handoff named line ~4404's bare `.wli-name` as the winning rule. It is not. Two blocks inside `@media (min-width: 901px)` (around lines 2699 and 3727) share the selector list `.works-list .wli-name, .wli-name` — specificity (0,2,0) — and beat it. Every previous attempt to shrink the works-list type was inert; measurement showed all six rows still at `23.436px` (`1.55vw`) after the "fix". They now measure `19.5px`. **Judge by what is computed, not by what a written-down cascade map claims.**

### The home page is a hard-dark page

`html[data-theme="light"]` nav rules now target `:is(.contact-page, .home-page)`. A prior comment reasoned home _out_ of that list because the home rebuild gave it a cream `--home-bg`. True of the root's computed background, false of what is painted: the smoke canvas and the cube stage cover the whole viewport at every theme, so the nav sits on black and light-theme styling put near-white labels on a near-white capsule. **Judge by what is painted, not by what the root computes to.** `/play/` is still correctly excluded — it is the standalone root page and never includes the partial.

### Meniscus (`_layouts/project.html`)

Case-study media frames (`.cs-bleed`, `.cs-wide-inner`, `.cs-bleed-full`, `.cs-grid-item`, `.cs-split-media`, `.cs-pair-media`, `.cs-pair-media-grid`) get a `clip-path: polygon(...)` whose top and bottom edges are pinned at the corners and bow in the centre. The bow is a spring driven by scroll velocity; a two-stroke chromatic hairline (an `.mn-edge` SVG, `viewBox="0 0 100 100"`, `preserveAspectRatio="none"`, `vector-effect="non-scaling-stroke"`) rides the same curve.

Things worth knowing before tuning it:

- The frames' own `::before` is 70px of solid black top and bottom. Left alone it swallows the curve entirely — this is why the first attempt looked like nothing had changed. The module adds `.mn-on` to each frame and the stylesheet pulls that fade back to 22px at 0.5 alpha.
- The hairline SVG is a child of the frame and is **not** clipped, deliberately. Clipping the frame instead of the media would halve the stroke.
- The clip is applied to the media children, so the bow reveals the frame's own near-black background — the dark curve _is_ the effect.
- Knobs, all in one place: `K` (0.16) stiffness, `C` (0.34) damping, `GAIN` (0.16) scroll sensitivity, `MAXB` (0.85) clamp, `base` (`max(10, min(30, H*0.055))`) the resting inset and therefore the bow's headroom.
- Off-screen frames are drawn once via the `done` flag so nothing pops from straight to bowed on entry; the rAF loop parks when every spring is asleep.

### Still unverified by anyone

**Motion.** The footer pond's water, fish wake and pod collisions; the works-page liquid preview swap; and the meniscus at 60fps have only been checked numerically and frame-stepped at 12fps. None of it has been watched in a real browser.
