# Sid Mehta — Portfolio Handoff & Working Guide

> For the next AI coding agent (Codex) picking up this repo. Read this first.
> It covers **how Sid thinks about design**, **how to work with him without friction**,
> the **repo conventions**, and the **current state + known traps**. Written by the
> previous agent after a long build session, so it reflects real observed preferences,
> not guesses.

---

## 1. What this project is

- **Sid Mehta's personal portfolio** — a product designer / creative technologist in NYC, actively job-hunting. The site is a recruiter-facing tool (resume PDF, "See selected work", showreel, case studies). Treat every change through the lens of *"does this impress a design-savvy recruiter in the first 5 seconds?"*
- **Stack:** Jekyll (an `al-folio` fork), deployed via **GitHub Pages / Actions**.
- **Repo:** `github.com:Mehatey/portfolio_site.git` (branch `main`).
- **Live:** https://siddharthmehta.design — a push to `main` triggers a build (takes a few minutes to go live).
- **Local path:** `~/Desktop/al-folio` on Sid's Mac.

---

## 2. Sid's design taste (the most important section)

He has a strong, specific sensibility. Match it and he's happy; miss it and he'll notice immediately.

- **Real over fake.** He wants effects that are *physically grounded*, not cheap approximations. He explicitly rejected a `backdrop-filter: blur` "gray rectangle" and demanded **real liquid-glass refraction** (SVG `feDisplacementMap` that actually bends content). He replaced an abstract "smoke" shader hero with a **real video of himself working**. If you're tempted to fake something, find the real technique first.
- **Hates dead space and things that "float."** A gradient progress line with no glass behind it read as "dead space" to him. Elements should feel intentional and physically connected to their surroundings.
- **Motion-forward, trend-aware.** He wants what's current in the design world *right now*: **liquid glass (iOS-26 style), kinetic/typewriter type, scroll parallax, blur-to-sharp reveals, backdrop blurs**. He said verbatim "that's all in the design world right now." Lean modern and animated, not static.
- **Personal & authentic.** He chose the pixel video of *himself working in nature* as the hero over generic abstract visuals. Bring his real identity/story forward.
- **Interactive & playful.** He loves click-to-change-blend-mode, cursor brush-reveal, hover states, and hidden easter eggs (there's a "logo walkabout" easter egg). Reward curiosity.
- **Legibility is non-negotiable but not at the cost of boldness.** He specifically checks that nav icons/text are legible in **both light and dark mode**. Always verify both themes.
- **Detail-obsessed.** He caught a white-square logo and a floating gradient line instantly. He notices when something *feels* off even when he can't name the CSS cause — so when he describes a vibe problem, translate it to the technical root yourself.

**Palette / system note:** the site runs a three-pillar accent system (product blue / AI amber / culture violet) used across Works lanes, orbit rings, homepage portals, and the case-study progress bar. Respect it — don't introduce random colors.

---

## 3. How to work with Sid (avoid frustration)

- **Keep momentum. Don't stop to ask permission.** He got visibly annoyed at check-ins ("why do u stop working", "continue bro"). Default behavior: **make a reasonable call, state your assumption in one line, keep building.** When he adds a new request mid-task, add it to your task list and continue — don't halt the current work.
- **Take creative calls.** He often says "you can take a call on that." He wants you to decide and execute, then he reacts.
- **Be honest about what you can't verify.** He *respected* being told "I can't judge motion feel from a backgrounded browser — your eyes are the real QA." Don't over-claim. Flag the one thing that needs his eyes.
- **He iterates visually.** He ships, looks in his own Chrome, screenshots, then gives feedback. Don't over-engineer before he's seen a first pass. Small, shippable increments beat big blind batches.
- **His messages are fast, rough, voice-transcribed.** Infer intent from messy phrasing; don't get hung up on literal wording.
- **Budget-conscious.** He watches usage limits. Be efficient — minimize wasted round-trips, batch work, don't redo things.
- **Commit granularly with descriptive messages.** Explain the *why*, not just the *what* — he reviews history.

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

1. **Theme vs. dark-hero specificity.** The site defaults to `data-theme="light"`, but **home / contact / play have permanently dark heros**. Generic `html[data-theme="light"] .studio-nav {…}` rules can out-specify the dark-hero overrides and flip nav ink/logo to the wrong palette — this is what turned the logo into a white square. **Any nav/color work must scope dark-hero pages explicitly**, e.g. `html[data-theme="light"] .home-page .studio-nav::before {…}`, and verify BOTH themes.
2. **jekyll-minifier mangles `var()` inside `calc()`.** It once broke `calc(var(--nav-h) …)` into `var( - - nav - h)`. There's a comment about it in `project.html`. Be cautious with CSS custom properties inside `calc()` in production output.
3. **`home-film.js` went missing from the working tree once** (untracked + deleted on disk, though referenced by the homepage and live in prod — cause unclear, possibly a git op or a flaky sync). **After any big change, run `git ls-files assets/js/home-film.js`** — if it's empty, the hero will 404 on the next rebuild. It's currently restored and tracked (commit `1cb2442d`).
4. **Liquid glass is Chromium-only for the refraction.** `studio_nav.html` uses `backdrop-filter: … url(#nav-glass)` with an inline SVG `feTurbulence` + `feDisplacementMap`. Non-Chromium browsers get a blur-only fallback (by design). Tune the bend via `scale="16"` in the filter.
5. **Backgrounded/automation browsers throttle `requestAnimationFrame`**, so WebGL/canvas *motion* can't be judged from a headless/background tab. Static CSS filters (the glass) do render; rAF-driven animation (the film brush) does not. Validate motion in a real foreground Chrome.

---

## 6. Current state (as of commit `1cb2442d`, all pushed)

**Live and verified working:**
- Logo renders as the cube-face (not a white square); nav labels legible in light + dark.
- **Hero film** (`home-film.js`): pixel video plays an expand-from-a-point intro once per session (sessionStorage `sid_hero_intro`), freezes to a still, then a WebGL brush paints the clear `sid_sitting` footage through on pointer-move; **click cycles blend/shader looks**; left edge gets motion-blur + darken so the headline stays legible. Falls back to `assets/img/sid_pixel_freeze.webp` if WebGL/reduced-motion. Standalone preview at `/hero-lab.html`.
- **Liquid-glass nav**: real refraction that frosts + bends content scrolling under it; reading-progress rail integrated onto the glass edge with an accent glow.
- Showreel plays reliably on click (GitHub-release-hosted ~1:20 video, lazy-loaded on open).
- Fairview animated specialty-care icons; Play page + footer polish.

**Just deployed, may still be building (commit `027c7946`, `home-enhance.js`):**
- Typewriter headline, scroll parallax on project thumbnails, blur-to-sharp reveals, footer glass. All are **defensive no-ops** if their target is missing or JS throws.

---

## 7. Open items / next tasks for Codex

1. **Confirm `home-enhance.js` deployed** (it 404'd during QA due to build lag). If still 404 after ~10 min, investigate the build.
2. **Headline animation conflict:** the hero headline `#home-title` already had a *pre-existing* letter animation (`.ht-w` / `.ht-l` classes in `sid_home.html`). The new typewriter in `home-enhance.js` overrides it. **Pick one** — don't let them fight. Sid wants a typewriter/kinetic feel with a backspace effect.
3. **Interactive video footer (requested, only partially done):** Sid wants an interactive footer using the pixel/working video, content arranged on the left with blur. Only a light CSS glass pass shipped; the full interactive version is pending.
4. **Tune the glass `scale`** to Sid's taste (currently `16`) once he's judged the bend in real Chrome.
5. **Mobile pass:** verify the film, glass, typewriter, and parallax on touch/mobile — several effects are desktop/pointer-centric (`pointermove`, scroll parallax). Don't ship desktop-only motion without a mobile check.
6. **Hero "black on reload" was just fixed** (`1cb2442d`) — on returning visits it now seeks the pixel clip to its final frame for the resting still instead of showing black. Confirm it holds.

---

## 8. A prompt Sid can paste into Codex to set context

> "You're working on my Jekyll portfolio (`~/Desktop/al-folio`, repo `Mehatey/portfolio_site`, live at siddharthmehta.design, deploy = push to main). Read `HANDOFF.md` at the repo root first — it has my design taste, how I like to work, the conventions, and the current state. Key rules: keep momentum and make reasonable calls instead of asking me permission every step; run prettier on anything you edit; always verify nav/logo legibility in BOTH light and dark mode; and I want real, modern, physically-grounded effects (real glass refraction, kinetic type, parallax, blurs), never flat fakes."


---

## 9. Sid's next requests — prioritized build queue (added after handoff)

These came straight from Sid. Build to the taste in §2 (real, modern, physically-grounded; verify light+dark; keep momentum).

### P1 — Homepage project thumbnails: hover-to-preview  ✅ DONE (commit 708769ce)
> Re-enabled in `home-enhance.js` (module 4). The logic already existed in-page but was dead code after a retired peephole's early `return;`. Hover/focus now populates + reveals `#home-project-focus` via `.home-stage.has-project`. Verify feel in real Chrome; tune the takeover timing if desired.

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
