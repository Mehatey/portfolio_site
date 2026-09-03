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
- Prettier runs out of `/tmp/pret` (the repo `.prettierrc` is **YAML**, not JSON): copy files in, `--write`, diff back, copy over only if changed. CI runs `npx prettier . --check` over the whole repo.

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

## 6b. What landed in the overnight session (17 unpushed commits)

Everything below is committed on local `main` and **not yet on `origin/main`** (see §5 — the cloud agent cannot push). Newest first:

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

## 7. Open items

1. **PUSH THE SEVENTEEN COMMITS.** `git push origin main` from the Mac, then confirm prettier CI is green and QA the result live in both themes. The cloud agent cannot do this: the remote is `git@github.com:Mehatey/portfolio_site.git`, and the device VM has no `~/.ssh` and no credential helper, so `git push` dies with `Connection closed by UNKNOWN port 65535`.
2. **The remaining "no breathing room" follow-ons** from the governing brief: the **home page** and the **Play page** still want the motion/hover/icon craft pass that Works, Contact, About and the case-study layout have now had. Note that Play is the root-level standalone `play/index.html` (`layout: none`, ~98 items, its own 3D gallery) — it is _not_ a Jekyll page, `pc/ssg.js` does not build it, and it is the highest-risk file in the repo to touch unattended.
3. ~~The "get to know Sid" strip~~ — checked. The strip no longer exists; The Plot replaced it. The footer now reads name → tagline → updated-date → links → pull-quote → plot, and renders correctly in both themes.
4. ~~**Mobile / touch pass**~~ — done for tap targets and the footer hint (`02d7dde2`). What is still open is the part that cannot be judged headless: whether the **cube** and the **desk liquefy** actually feel right under a thumb, which needs a real phone.
5. **Tune the nav glass `scale`** (currently `16`) once Sid has judged the bend in real Chrome.
6. **Dead code, safe to delete once Sid confirms he doesn't want v1 as a rollback:** `assets/js/home-enhance.js`, `_includes/home_cinema.html`, `_layouts/sid_home_v1.html`, `_layouts/about.liquid`, and the leftover `.hs-card` / `.hs-grid` CSS.
7. **`works.html` CSS dedup** — deliberately deferred. A selector scan showed high counts, but most are legitimate duplicates inside media queries and theme blocks. A 4700-line single `<style>` block is high-risk / low-visible-reward to refactor unattended.
8. **Housekeeping on the Mac:** `.git/stale-locks/` is junk and can go. `_scratch/` has been deleted. **Do NOT `rm -rf` `_to_delete/`** — see "Open" item 5 below; it still contains project media and it contained the entire Play archive until 11 Aug.
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

# STATE AS OF 11 AUG 2026 — read this before the rest

Written at the end of a long session so the next agent (or the next terminal) starts
where this one stopped rather than rediscovering it. Everything below is observed, not
assumed.

## Verifying visually — the actual loop

There is no `jekyll serve` in the sandbox this was built in, so the loop was: render a
page through an offline Liquid interpreter, open it in headless Chromium via Playwright,
screenshot it, and **look at the screenshot**. In a terminal with a real dev server you
should just point Playwright at `http://localhost:8080` and skip the renderer entirely.

Two rules that came out of this session the hard way:

**Measure _and_ look. They find different bugs.** Contrast checks, overflow checks and
console-error checks all pass cleanly on a page that is completely blank in the region
you care about. The margin field on Play compiled, linked, ran `drawArrays` 81 times and
read back alpha 42/255 across 103 columns — and painted nothing, because the canvas sat
at `z-index: -1` behind body's opaque background. Nothing errored at any point.

**Your harness can hide the bug.** The screenshot script injects
`scroll-behavior: auto !important` so its own scrolling is deterministic. Play's
auto-scroll had never moved a single pixel in production — the site sets
`scroll-behavior: smooth`, so a `scrollTo` sixty times a second aiming 0.35px ahead
cancels itself every frame — and every screenshot ever taken of that page was of a build
where the bug could not occur. If a harness normalises something, that something is
invisible to you.

## Where the layouts are

- `_layouts/sid_home.html` — home. Hero, "How I think", by-the-numbers (03), studio door (04).
- `_layouts/works.html` — the ring **and** the list view. ~7,700 lines; the ring lives in
  `@media (min-width: 1220px) and (min-height: 840px)`, and there is a second pass block
  after it that corrects the first. Below that floor the page is a plain list-and-panel,
  which is exactly what the list view re-uses.
- `_includes/site_footer.html` — one footer for every page: marquee, Get to know Sid,
  the pond, the Apple Music coda, and two closing lines.
- `_includes/cursor_fluid.html` — 6,300 lines and badly named. It is the cursor _and_ the
  grain, vignette, spotlight, command palette, theme toggle, cube chat button and a pile
  of light-mode overrides. Including it is how a page joins the rest of the site.
- `play/index.html` — the only page built as a standalone document rather than through a
  layout, which is why it kept missing site-wide includes.

## Traps that cost real time

- **`overflow: hidden` breaks `position: sticky` in descendants.** A hidden ancestor is a
  scroll container, and that is what sticky resolves against. Use `overflow: clip`, which
  clips identically and is not a scroll container.
- **`premultipliedAlpha` must match the shader.** A premultiplied fragment output
  (`vec4(col*a, a)`) with `premultipliedAlpha: false` gets multiplied by alpha twice.
- **Absolute children resolve against the _padding_ box.** Offsetting a full-bleed layer
  by a negative gutter pushes it a gutter _past_ the page and adds a horizontal scrollbar.
- **`nowrap` + a shrinkable flex item overflows silently.** The box shrinks, the text does
  not, and `getBoundingClientRect` reports the box — so measuring says it fits and the
  page says it does not. The page is right.
- **Never pattern-delete CSS rules.** A regex over selectors mentioning a class once ate a
  prose comment containing a brace, which turned the comment into a selector and swallowed
  the next rule. Brace counts stayed balanced, so the diff looked fine. Neutralise with an
  override instead.
- **Two `!important` declarations are decided by specificity.** Several ring rules can only
  be beaten by adding an ancestor — this is why the list view is written as `html.wv-list …`.
- **git on the Cowork device mount cannot unlink.** Every `git` invocation leaves
  `.git/index.lock` and `.git/HEAD.lock` behind. Move _both_ aside before committing.
  There are hundreds of stranded lock files in `.git/` and `.git/stale-locks/`; they are
  harmless and can be deleted from a normal terminal. **In a real terminal none of this
  applies** — git works normally.
- **Commit messages containing backticks or inner double quotes break the shell.** Write
  the message to a file and use `git commit -F`.

## Done in this session

`65e6c6ca` one footer + the physics line-trail cursor restored ·
`8c062c9a` Play: cursor, a working auto-scroll, the WebGL margin field ·
`79a2b1f5` home hero cut back, by-the-numbers marks redrawn as pixel figures ·
`fd1d0e03` works: importance order, tags, per-change plate animation, ring + list views.

## Open — Sid is the blocker on the first two

1. **Play's missing pieces.** Sid says there were ~220 including photos and video. The repo
   holds 57 stills, 12 videos and 41 works-derived images that were deliberately removed
   from Play. The folder `~/Desktop/play page website add` holds 16 more (8 screen
   recordings, 8 screenshots) which still need transcoding to web-sized mp4/webp and
   folding into `play/index.html`'s `files` array. The rest are not in the repo — ask him
   which folder they live in.
2. ~~**A failing GitHub Actions job.**~~ **SOLVED, and the guess here was wrong.** It was
   lychee, and it does not block the deploy — both true. It was _not_ rate limits. It was
   reporting six genuinely missing files, correctly, for as long as it had been red:
   `.gitignore` blocks `*.mp4` globally with a short allowlist, and six case-study demo
   clips referenced by `/marriott/` and `/m-health-fairview/` were not on it. They existed
   on this machine and on no deploy, so those pages shipped six broken `<video>` elements
   while looking perfect in every local preview. Allowlisted and committed (1.49MB for all
   six); the job is green. **A checker failing for a real reason and assumed to be noise is
   worse than no checker** — that assumption cost this repo months of a red build.
3. **Two unfinished sentences of his**, left alone deliberately: "when I hover on the cube,
   let it, uh—" and "on play, my cursor—" (the second is resolved: Play had no cursor at
   all, and now does).
4. **Older, still true:** the caption worksheet (Encoded has 4 captions across 11 plates;
   Shot on iPhone 21 images / 0 captions; Mool 22 / 0), and 41 unused `d##.webp` files
   under `play/assets/spatial/`.
5. **`_to_delete/` IS NOT SAFE TO DELETE, whatever item 8 above says.** It still holds
   `unreffed-toplevel/` and `unreferenced-masters/` — bloom-vp scenes, mandala masters,
   `play-memory-wall.png`. On 11 Aug the full Play archive was found inside it and rescued:
   `_to_delete/play-assets` → `~/Desktop/play-archive-raw`, 253 entries, `p1`..`p207`,
   705MB (155 jpg, 46 png, 45 mp4, 6 gif, plus `tube/` with 16 webp). **That is the missing
   ~200 pieces from item 1** — they still need transcoding and folding into the `files`
   array. `_scratch/` was pure build scratch and has been deleted.

## Standing constraints he has stated

- Keep: the 3D cube, the way projects are presented, the shared background, chromatic
  aberration, the shader on hover. Kill yellow in the chrome (artwork is exempt).
- Desktop first, mobile a nice-to-have. Always verify **both themes**.
- No "AI slop". Prettier is CI-enforced.
- He pushes himself — do not push to the remote, hand him the command.
- He dislikes stock/generic marks intensely. Everything drawn on this site is hand-made,
  and a library glyph in that company reads as a placeholder nobody replaced.

---

# STATE AS OF 11 AUG 2026, EVENING — a QA + design pass, 22 commits, all pushed

Read this with the 11 Aug section above; it does not replace it. Everything below
was measured on the running site, not reasoned about.

## Four traps that cost real time this session

**1. A CSS rule aimed at a class that is not in the markup fails silently, and it
failed twice on the same class.** `.contact-copy` does not exist anywhere in
`_layouts/contact.html`; the wrappers are `.c-corner`, and the only near-match in
the document is the `.contact-copybtn` button. Two separate rules were pointed at
it. `.contact-copy { z-index: 4 }` was the rule keeping the email above the mobile
scrim — so on every phone the email, the phone number and all four social links
were painted under a 98%-opaque veil at contrast 1.09–1.73. And
`.contact-copy > * { animation: contactRise }` was the entire seven-element entry
stagger — exactly one element on the page ever animated, the footer timestamp.
**Before trusting a rule, check at runtime that its selector matches something.**

**2. Contrast tools that read CSS cannot see compositing.** On that contact page,
`getComputedStyle` on the email returned `#f7f9fb`, opacity 1, no filter, and a
clean ancestor chain — I walked it. The dimming came from a positioned _sibling_
painting over it. The only way to see it was to read the painted pixels: ink at
luminance 56 against a ground of 5. `pc/qa.js`-style checks and every contrast
audit in this repo will report that page as fine. **Screenshot it and sample the
box.**

**3. Measuring a layout that does not exist yet returns confident nonsense.** On
Play I tried setting `loading` by reading each image's `offsetTop` after a forced
reflow. It marked 55 of 57 images eager: none had a `src` yet, an image with no
intrinsic size has no height, so every element was collapsed to zero and every one
looked like it was in the first viewport. The fix was arithmetic over the column
count instead. Related: `column-fill: balance` redistributes as images load, so
"which tiles are in view" drifts between runs — do not tune a number against a
single measurement of it.

**4. Two of three adversarial critiques contained confident, specific, false
claims.** A critic asserted the homepage typewriter clips mid-word and reserves one
line where it needs two; measured, mobile already reserves two lines and the host
box is a constant 41px across all five phrases. Another asserted the About portrait
is pushed below the fold on mobile; it starts at y≈505 of an 844 viewport with the
face clearly visible. Both would have been real work spent making the site worse.
**Verify every structural claim against the source or the browser before acting on
it** — the critiques are still worth running, they found the mobile nav occlusion,
the buried decisions section and the Play footer, but roughly one claim in six is
wrong.

## What changed

- **Home**: chapter numbers were `03 → 01 → 02 → 03 → 04` with 03 used twice, now
  01–05 in order; two "Scroll" cues rendered 6px apart, now one; the mobile nav had
  no ground and its opaque marks ate the first character of `function` on the code
  block, now a real plane with the labels restored; section rhythm 13vh → 8.5vh
  (10211px → 9781px); the light-theme pixel portrait was a pale blob because
  `brightness(2.45)` fights `mix-blend-mode: multiply` (white is multiply's
  identity), exposure now near unity; the hero stat block carried the same "six
  years" as the headline 340px above it and now carries the Met.
- **Works**: the ring was gated behind `min-height: 840px`, which excludes a 13"
  MBA (1280×745), a 14" with bookmarks (1440×790) and a 16" with a bookmarks bar
  (1512×835) — and the same rule hid the ring/list toggle, so those visitors were
  never told a ring existed. Floor is 760 now; measured, the lowest ring item bottoms
  out at 742 in a 760 viewport. Three of sixteen projects now carry the outcome lines
  that were already authored in `data-proof` and never rendered.
- **Case studies**: the decisions section (the only writing that shows him thinking)
  rendered _after_ the body — on `/mool/` that is twelve captionless images, so the
  argument arrived at ~85% scroll depth. It opens at 10% now. Heroes carry
  `Role · Studio for Client` instead of hiding attribution in a closed `<details>`.
  `hero_mode: artifact` for covers that are screenshots, so the title stops sitting
  on the product's own UI.
- **Play**: was the one page with no footer (commit `65e6c6ca` was literally "one
  footer" and missed it), so the page a recruiter reaches _after_ they like the work
  dead-ended. It has one, and the ambient drift is now bounded to the gallery so it
  cannot tour the footer on its own. The lightbox was unreadable in light theme —
  dark ink on a near-black surface, contrast ~1.
- **Contact**: `Updated Jul 2026` was hand-typed and already false; it is
  `site.time` now and visible on mobile again.

## Open, and Sid is the blocker

1. **Play's captions.** Every title in that gallery is generated by bucketing the
   filename number — `titleFor()` returns "Visual system 034" because 34 falls in a
   range, so a graphite copy of Guernica is labelled a visual system. All 57 pieces
   open to the same sentence about "ongoing practice", and `image.alt = item.title`
   means a screen reader hears 57 fabricated descriptions, twice (the duplicate
   `#play-access-list`). The `file >= 82` branch is dead — the highest file is 80.
   This needs a real `{title, medium, year, tool}` per piece and **nobody but Sid can
   write it**; inventing a medium and a year for his artwork is not an option.
2. **`/mool/` has twelve images and no words.** Every `alt` is the string "Mool".
   The template should not be able to render an uncaptioned `.cs-bleed`.
3. **"PAST COLLABORATORS" on /about/** blends employers (Philips, Deloitte, EyeJack,
   Leaf) with what are almost certainly Deloitte client brands (KFC, Pizza Hut, Taco
   Bell, Del Taco) under one label, and the experience column 40 lines below lets a
   reader do the subtraction. Relabelling costs one line.
4. **The About claim is my draft of his voice.** "Most spatial and AI work demos
   beautifully and falls apart the moment a real person uses it in a real room." Every
   figure under it is from his resume and nothing is invented, but the sentence itself
   should be read aloud by him before it stands as the first thing anyone reads.
5. **Build noise:** `assets/img/fairview/10-caretypes.gif` is an animated GIF, and
   the ImageMagick step logs three red "Invalid frame dimensions" errors per build
   trying to make animated WebP variants of it. Non-breaking — the page uses a plain
   `<img src=".gif">` with no srcset, and 0 srcset targets are missing site-wide — but
   red errors on every build are how a real one gets ignored.

---

# STATE AS OF 14 AUG 2026 — the intro is back, and the checker tells the truth again

Short session after a machine restart. Everything below was measured on a real dev
server (`bundle exec jekyll serve --port 4123`), not reasoned about.

## Running the verification loop on this machine

Playwright's own chromium is not installed and its download is a separate ~130MB.
It does not need to be: `bin/portfolio-qa.cjs` now honours `PORTFOLIO_CHROME`, so
point it at the puppeteer cache already on disk and the whole suite runs:

```bash
bundle exec jekyll serve --port 4123
PORTFOLIO_CHROME="$HOME/.cache/puppeteer/chrome/mac_arm-149.0.7827.22/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing" \
  node bin/portfolio-qa.cjs http://localhost:4123
```

`git` needs `DEVELOPER_DIR=/Library/Developer/CommandLineTools` exported or every
invocation dies in `xcrun`. Xcode proper is not installed; do not point it at
`/Applications/Xcode.app`.

## What changed

- **The mark's features thinned.** Eyes were 2.6×5.4 and the mouth 1.5 tall on a
  36px glyph, which at nav size read as three bars. Now 1.9×5 and 1.1, centres and
  radii scaled with them. Geometry lives in exactly one place, `_includes/site_logo.html`.
- **`/bloom/` no longer runs off a phone.** Body scrolled 626px wide at 390. The
  opening story grid collapses to one column below 760px but the track was `1fr`,
  and a track's automatic minimum is min-content — `.cs-bleed` carries
  `contain-intrinsic-size: auto 600px` for `content-visibility`, so while the image
  is skipped that placeholder measures 600px and the column floored there.
  `minmax(0, 1fr)` fixes it. **Any `.cs-bleed` dropped into a grid column will do
  this again unless the track is written `minmax(0, …)`.**
- **The QA run is honest again.** It was reporting 9 failures and 8 were the checker
  being stale: three Play assertions looked for `#play-canvas`, a `.play-fallback`
  grid and a page that never scrolled past one viewport, none of which have existed
  since Play became a masonry gallery with a footer — the last one asserted the
  opposite of what the page should now do. The work-index check grepped for "view
  project" / "quick case" copy that is nowhere on the site, because the index makes
  the whole row the target and hangs an arrow off the title. Both rewritten against
  what the pages actually have to do. 628/628 green.

## Two things the old notes get wrong now

- **Item 5 of the 11 Aug evening list (the GIF build noise) is fixed.** A full build
  on 14 Aug emits no "Invalid frame dimensions" and exits 0. All four GIFs in
  `assets/img/` are animated and all four convert cleanly.
- **The hover turn on the cube is not broken, whatever a computed-style read says.**
  `getComputedStyle` returns the identity matrix on hover because the transform is
  `rotateY(360deg)`, and 360° _is_ identity. Screenshot it; the turn is there.

## Still open, and Sid is the blocker

Unchanged from the lists above: Play's per-piece captions, `/mool/`'s twelve
images with `alt="Mool"` and no words, the "PAST COLLABORATORS" label on /about/,
and the About claim written in his voice. The disk is at 99% (6.7GB free).

---

# STATE AS OF 24 AUG 2026 — the homepage session, and the measurement trap that runs through it

Three days of homepage work, 15 commits. The last twelve are listed by subject in
`git log`; the commit bodies are the record and they are detailed. Read this
section for the pattern, not the inventory.

## The one thing to take from this session

**Three separate features passed their own verification and were still broken for
every real visitor.** Each was measured honestly and each measured the wrong
quantity. If you read nothing else here, read this list and then go and check
whatever you are about to call done against _what a visitor sees_, not against
the arithmetic that produces it.

- **The hero opener** (`_includes/hero_opener.html`) was gated on `loaderDone`,
  correctly, and carried a blind `setTimeout(kick, 12000)` underneath. The real
  first visit takes ~20s (the Buddha gate waits for a click, then the cube
  sequence runs ~16s), so the failsafe won every time: the film started at 12.2s
  with the loader still `display:flex` and was 8.2 of its 10.64 seconds gone by
  the time the page appeared. It verified green because **the way you test an
  opener is `?opener=1`, and that path has no loader on it at all**. The failsafe
  only ever misfired on the one visit nobody tests.
- **The cube's six faces** (`_includes/home_cube.html`). The pass that added the
  lid and base verified "which face wins" and got six of six. It never asked
  whether the cube was _on screen_ when each won. It was not: the base won at
  scroll 2100, four hundred pixels after the object had left the viewport, so one
  of the two faces that pass existed to reveal still had never been seen.
- **The same cube's readout** named the wrong face on exactly that pair, because
  `FACE_N` had the flat normals swapped. Four of six faces are named by the axis
  you are already looking down, so only this pair can disagree silently — and it
  did, saying "Aananda · Brand" with Naavo square to the camera.

The QA suite was 628/628 green through all three.

## What "verify" has to mean here

`bin/portfolio-qa.cjs` checks routes, media, nav and flows. It cannot see
composition, timing or whether an element was behind something else. For anything
visual or time-based, drive the real page and measure the visitor-facing quantity:

- **Timed things**: stamp the events, do not trust a duration. Instrument with
  `addInitScript`, record `performance.now()` at each transition, and print the
  sequence. The opener's fault was one line of that output.
- **Scroll-linked things**: walk the page in 50px steps and record the state
  _together with the element's on-screen box_. "Which face wins" and "is it
  visible" are different columns and the bug lived between them.
- **First-visit things**: a fresh context with no `sid_loaded`, and click through
  `#enter-label` — not `#enter-btn`, which measures 0x0 and swallows the click
  silently. Anything that only reproduces on a first visit will not reproduce on
  the shortcut you reach for.

## Running the loop (unchanged from 14 Aug, still correct)

```bash
bundle exec jekyll serve --port 4123
export PORTFOLIO_CHROME="$HOME/.cache/puppeteer/chrome/mac_arm-149.0.7827.22/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
node bin/portfolio-qa.cjs http://localhost:4123
```

`git` and `python3` still need `DEVELOPER_DIR=/Library/Developer/CommandLineTools`
exported. Playwright resolves from the repo's own `node_modules`; there is no
puppeteer here (it is in `~/Desktop/latent-atlas`) — scripts requiring it by path
will fail.

## What the session changed

The homepage now answers the pointer on every surface, which was the through-line:
the background field is genuinely interactive and a real curl, clicking open ground
cycles four inks, the headline letters are playable and dead still until touched,
the work covers hinge and fold up off the page, the frame rules run a real 1D wave,
the cube shows all six sides with a scroll-linked readout, and the page opens on a
pixelled take of him that the cursor dissolves.

- `sid_sitting_pixel.mp4` is new: `sid_sitting.mp4` through a 64x36
  nearest-neighbour round trip, square 20px blocks, same frames, same 10.744s.
  **The old `sid_pixelated.mp4` was never a pixelled copy of that shot** — it is a
  black frame with a small figure, an intro animation, which `home-field.js` had
  already worked out and dropped. It is deleted now. Do not reach for it again.
- The opener's rim vignette was `radial-gradient(120% 108%)`, which puts the
  mid-edges at 42% and 46% of the gradient radius, inside the opaque 52% stop — it
  could only ever round the corners, never soften the frame. **Any vignette meant
  to fade an element's edges needs radii below ~96% of the box**, or it is
  decorative only.
- A `.hero-film`-style box must carry its content's aspect ratio. At 662x594 with
  a 16:9 take, `object-fit: contain` painted into the middle 372 rows and the
  vignette spent its whole fade on empty letterbox.

## Still open

- **The disk is full.** 151Mi free on the data volume; it hard-failed a screenshot
  mid-session. `.git` alone is 10G, with 1.71GB loose and **200 packs** — a plain
  `git gc` would consolidate that, but repacking 8.74GB needs headroom it does not
  currently have, so free space first. `_site` (999M) is regenerable. Sid's call.
- Unchanged and Sid is the blocker: Play's per-piece captions, `/mool/`'s twelve
  images with `alt="Mool"` and no words, the "PAST COLLABORATORS" label on
  /about/, the About claim in his voice.
- `_includes/footer_surface.html` is still in the repo unreferenced, waiting to be
  rebuilt full-bleed behind real content.
- Not shipped, with a reason: letters reacting to the figure. Built, measured, one
  letter moved 0.7px — the hero puts the clauses in columns either side of him
  with a 662px gap, so there is nothing there to interact with. Needs a different
  idea, not a bigger constant.

---

# STATE AS OF 3 SEP 2026 — a recruiter pass, then Sid opened the whole site

Two halves. The first was a planned recruiter-experience pass. The second was
Sid going through the live site page by page and finding a lot. Nothing in this
session is committed: ten files sit in the working tree.

## The measurement that started it

Run against the LIVE site in a fresh context, because that is the only way a
recruiter's visit reproduces:

- Land and do not click and you see nothing, forever. The Buddha gate waits.
- Click Enter and wait: **19.4s** before the page is revealed.
- A "Skip intro" button already existed and got you there in **4.3s**. It worked.
  It was 113x32px of 9px mono at 0.68 alpha in the corner of a moving film.
- **No resume link anywhere on the revealed home page.** It was on the Enter gate
  the whole time, and the gate is destroyed four seconds later.

## What landed (all verified on a real page, 628/628 throughout)

- **Resume CTA** in the hero foot row. Outside `.hero__stamp` because that `<p>` is
  aria-hidden, and not inside it because the stamp is `display:none` below 900px.
- **Escape ends the intro** (3.5s vs 19.4s). Skip button to 10.5px / 0.86 alpha.
- **`/works/` lanes** — `lane:` on all 17 entries in works.yml, three sections.
  Numbering restarts per lane: kept portfolio-wide it produced 01, 06, 07, 08 down
  the product column, which reads as four missing projects.
- **`/ai-prototypes/`** — a three-link "places to start" sentence in the header. NOT
  the featured band the July audit asked for: that page's own note says "nothing is
  featured, nothing appears twice" and it is right.
- **Onboarding rebuilt.** One message in two beats. Icon map deleted, portal ring
  deleted, hover glitch fixed (the label lifted 6px out from under the cursor).
- **Nav pills gone**, logo and links, both themes. They were not only CSS —
  `nav-glass.js` paints a canvas that kept drawing both rims. Blur band 104 -> 72px.
- **Play scroll cylinder removed.** rotateX + getBoundingClientRect per card per
  frame across 57 items. Now 60fps, p95 17.3ms.
- **`#global-vignette`** was black at 0.55 from 55% of the radius, i.e. inside the
  measure. Now 0.2 from 74%.

## THE HERO — read this before touching it

Three findings, in order, each of which killed the previous theory:

1. The real DOM headline is at **`opacity: 0`**. A canvas paints the smoky copy.
2. It is **not `#gl-stage`** — hiding that changes nothing. It is a different,
   anonymous full-bleed canvas at z-index 1.
3. Hide that canvas and force the DOM type visible and **the real headline appears
   correctly** ("Product designer, six years.") and is STILL DIM. So a third layer
   is dimming it, most likely `#hero-solid` (z:2, full-bleed). Not yet confirmed.

Do not rip out `hero-scene.js` (59KB) on the strength of 1 and 2 alone; it also
draws the figure. Start from finding 3.

The home page carries **20 canvases, 14 of them full-size**, and 8 WebGL direction
renderers plus the shuffle. That is the lag.

## Sid's open queue, in his words

**Fixes:** `/works/` card text barely legible · "Get to know Sid": remove the hover
ASCII AND all the text (photos already imply a divider) · Buddha sculpture shatters
and falls off screen, do neither · the room-pic hover reads like real cloth, make it
bigger · homepage still dim, still laggy, "wtf is this cover pic".

**Builds:**

- **Footer.** The clearest brief he has given. Kill the kinetic type and "Siddharth
  Mehta, product designer, built with Jekyll" — it repeats About and the homepage.
  Wants: a real CTA, copyable email, backup nav, socials, last-updated, minimal.
  The homepage video of him working, in pixel form, with a black gradient/motion
  blur off the top so scrolling into it is not abrupt; hover reveals the real video
  in that area. The two-video concept from the entry, moved to the footer.
- **Contact.** Desk in the CENTRE and much bigger, info placed around it (four
  corners or below). Currently a left column stack with a small desk right, and he
  says it "looks so bad like a ppt". Structure is `.c-corner--tl` / `--tr` around
  `#contact-desk` in `_layouts/contact.html`.
- **Phone/music section** scrolls start-to-end in about a second. Pin it so the
  section holds and you can actually scroll the songs.
- **"Get to know Sid" entry physics** — images and videos coming in on a clothesline,
  real cloth motion, plus a better hover.
- **Replace the falling squares** — not cubes of different materials. Liquid-glass
  clouds, a tree, a river, properly animated.
- **About** — the icons sit next to each other; clicking one animates it, it grows
  and becomes a dynamic thing that replaces what was there.
- **Nav** — page-specific captions in his voice, Gandalf-ish, an intro to each page,
  shown between the nav labels and the cube logo. **`_includes/cube_says.html`
  ALREADY DOES THIS** (`#cube-says`, `data-line`, is-in/is-out) and is included by
  sid_home, contact and ai-prototypes. Extend it per page rather than building a
  second system. He also wants the nav itself more creative/dynamic with every
  state designed, selected and unselected, for every page.
- **Ambient, occasional, must not overwhelm** — rain and thunder, sunlight, pixel
  birds across the screen, a lens flare now and then. "little little creative things
  which others might miss."
- **Sound design** — futuristic, high quality hover and click sounds; a waveform
  icon that moves when sound is on and is a still line when off. No text.

## Standing constraint reconfirmed this session

He notices dimness, lag and anything that moves when you point at it. Measure the
painted pixels, not the computed value: `#loader-skip` looked like it needed a
light-theme rule from its computed backdrop (cream) and did not, because the cube
video paints over that backdrop in both themes. A theme branch there would have
fixed a problem that is not on screen.

---

# STATE AS OF 3 SEP 2026, LATER — the pass where Sid went through every page

Twelve commits. The first five are recorded in the section above; what follows
is the rest, and the one finding worth carrying forward.

## The bug that explains the whole "it looks so dim" thread

`.film` means TWO unrelated things in this repo:

- `_includes/film_grade.html` — the site-wide grade. Fixed, inset 0, z-index
  8000, grain and vignette, present on every page.
- `_layouts/sid_home.html` — the HERO FILM, footage behind the type, with a
  `::after` "veil" that darkened the left of the frame so the headline had a
  clean field to sit on.

The hero film was deleted some commits ago. Its element went; **seventeen of
its rules did not**, and the grade layer answers to the same class name. So the
veil moved onto it: `rgba(4,6,11,0.97) → 0.9` across the left 38% of the
VIEWPORT, fixed, above everything, on every page.

Peak luminance inside the headline's own box measured **42 of 255** while the
nav label beside it measured **247**, with every computed style on the h1
reporting `rgb(244,247,251)` at opacity 1. Nothing was wrong with the text.
Deleting one pseudo-element took it to 247.

**If a colour looks wrong and every computed value says it is right, sample the
painted pixels and then bisect by hiding layers.** That is what found this, and
nothing else would have.

## The hero typography

`home-shuffle.js` runs direction 01 in three descending tiers and sets
`is-solid` if ANY of them starts: `__ink` (a real fluid solve), then
`__mercury`, then `__solidType` (the sentence raymarched as glass).
`html:not([data-home]) .hero.is-solid .hero__col--l { opacity: 0 }` is what hid
the real sentence. Removing one renderer just handed the page to the next one
down. All three are unloaded now; the files remain. **71fps → 108fps, p95 frame
33.4ms → 16.6ms.**

## Everything else that landed

- **/works/** — captions were 0.62 ink over a live shader running at full
  strength. 0.8 ink, tags 0.72, `--field-opacity: 0.5` **declared on body**,
  because the field is a fixed SIBLING and a property set on `.wk` never
  reaches it.
- **Get to know Sid** — head text gone (aria-label kept), ASCII hover gone, and
  the tiles now hang on a **clothesline**: a damped pendulum off the rail's own
  per-frame acceleration, pivot above each tile, per-tile multiplier plus a
  phase-shifted breeze so they never move in lockstep.
- **The Buddha no longer shatters.** `buddha-voxels.js` is not loaded — that
  also takes 11,000 instanced cubes and a WebGL context off the shared footer.
- **The wall is more cloth** — displacement ceiling 11 → 26, settle 0.94 →
  0.925, and the filter region grew to -12%/124% because a feDisplacementMap
  can only move a pixel to somewhere inside its own region.
- **/contact/** — four corners around a big central desk. The desk is written
  in SIX places and three use `.contact-shell > .contact-desk`, which outranks
  the plain class; one block at the end settles where it goes.
- **The music panel held for 45px.** The stage is sticky at `min-height:100svh`
  inside a `105svh` runway, so the held range is the DIFFERENCE — five svh for
  thirty frames. 240svh now. **That number is a difference, not a duration; do
  not "optimise" it again without reading this.**
- **The footer** was rebuilt: pixel plate with a pointer lens onto the real
  take, big CTA, copyable email, backup nav, socials, and a date. The kinetic
  type and the Jekyll colophon are gone.
- **Nav** — pills removed from logo and links (they were partly painted by a
  `nav-glass.js` canvas, not only CSS), blur band 104 → 72px.
- **Play** — the scroll cylinder is off; it was a rotateX plus a
  getBoundingClientRect per card per frame across 57 items.
- **The cube speaks on all six pages**, not three.
- **New:** `assets/js/ambient.js` (pixel birds, a light shaft, a lens flare —
  one event at a time, 3-7 minutes apart, nothing at rest but a timer) and
  `assets/js/sound.js` (synthesised hover/click, off by default, waveform
  toggle with no label).
- **The idle scene** is glass clouds, a river and two trees instead of tiles
  and cubes.

## Still open

**The About icons.** Sid: "the icons are next to each other, and when you click
on one, it animates and becomes a dynamic thing. It gets bigger and then
replaces that." The dashed arc with three dots visible in his screenshot of the
LIVE /about/ could not be reproduced on a local build at any scroll position or
width — no matching element exists in `about-contact.html`. It needs him to
point at it before anything is built, and building the wrong control here is
worse than leaving it.

**Rain and thunder** were asked for and deliberately not built. Rain over a page
of photographs is either invisible or a filter over somebody's work, and thunder
is sound arriving unrequested — which now has a home behind the sound toggle if
he wants it.
