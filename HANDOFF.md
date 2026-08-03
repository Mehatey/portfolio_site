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

1. **Theme vs. dark-hero specificity.** Historically home / contact / play were _pinned_ dark even under `html[data-theme="light"]`, via overrides in `studio_nav.html`. **That is no longer true** — all three now have real light layers (commits `71034525`, `846f73c8`). The white nav ink those pages need in dark theme is now scoped `html:not([data-theme="light"]) .home-page .studio-nav {…}`, which keeps the specificity relationship explicit rather than relying on source order. If you add nav colour rules, keep that shape and **verify both themes** — a generic `html[data-theme="light"] .studio-nav` rule out-specifying the page rules is what once turned the logo into a white square.
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

## 7. Open items

1. **Visual QA of the light theme.** The layers were written by restating only the declarations that carry surface or ink — they were never seen rendered. Walk home, contact and play in **both** themes and look for anything still assuming a dark background. The home hero is the riskiest: its scrim was inverted (warm white on the reading side instead of black) so dark type reads over dark footage.
2. **The "get to know Sid" strip** in `_includes/site_footer.html` has never been visually checked — confirm it loops seamlessly.
3. **Mobile / touch pass** on the pinned cinema (it falls back to a snap scroller under 900px), the cube, and the desk liquefy.
4. **Interactive video footer** — still only partially done. Sid wants the pixel/working video in the footer with content arranged on the left and blur. Only a CSS glass pass shipped.
5. **Tune the nav glass `scale`** (currently `16`) once Sid has judged the bend in real Chrome.
6. **Dead `.hs-card` CSS/JS** on the homepage can be removed (see §6).
7. **`_to_delete/`** at the repo root holds scratch files the cloud agent could not `rm`. Untracked; delete it locally.

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
