# Working notes, 16 September 2026

What this session changed, what is still open, and the traps that cost the most
time. Read `HANDOFF.md` for the long-running context; this is only the current
run.

---

## Where things stand

Everything below is built, verified in a **real visible Chrome window** (not
headless — see the trap at the bottom), committed and pushed. Live site checked
and serving it.

---

## The opening, which is the part Sid cares most about

He called it "crucial to get right ... otherwise recruiter might get mood off
from beginning of bad ux", and it was the worst thing on the site.

**It took thirteen seconds to show the headline.** Traced end to end on a first
visit: 5.5s of film, ~1s of dead air, 6s of the cube naming its controls, then
typing. The intent — one thing at a time — was right and the priority was
backwards. The page's argument is the content; the corner controls are
furniture. Now the sentence types as soon as the door opens and the welcome runs
beside it. **Headline visible at 6.2s, fully typed at 8.7s; on a return visit
typed by 2.8s.**

**It is a black room now.** The loader's own ground was transparent, so the
opening composited over whatever the home page happened to be doing underneath —
a starfield, a nebula, the hero's GL stage, none of it chosen for the opening.
It paints solid black with the dust canvas and a fine grain, nothing else.

**The film has no plate.** The footage carries a black matte. `mix-blend-mode:
screen` is the obvious fix and **cannot work here**: the blend composites
against the element's own backdrop, and an opaque backdrop sits between the film
and anything else — screen against pure black is the identity. A soft radial
mask does not care what is behind it.

**Nav and logo are out of the room** (`html.is-onboarding`), and the mark then
forms: cells scale up out of blur on a stagger.

**One line, and the words rise.** Was two sentences with a scramble reveal. A
scramble is unreadable for its entire duration by definition, so every
millisecond was subtracted from reading time — it had already been tuned from
900ms to 620ms chasing that. The words rise instead: legible from the first
frame, whole line in within ~360ms. Copy is now `Welcome to me. I hope you feel
the love`.

---

## Everything else in this run

- **Reel**: the circle came out. Three objects pretending to be one (looping
  video, rotating ring of type, play triangle). Now one link, `WATCH SHOWREEL ·
90S`, with three bars that move.
- **Icons are one set.** They shared a background and a shadow and still read as
  two pairs, because the theme toggle and the cube each carry a `::before`
  radial glow drawn for a dark page — on cream that is a grey halo pooling
  under the control, which is the "bad drop shadow" and is not a shadow. The
  shared `backdrop-filter: brightness(0.84)` was the other half.
- **Strip on cream**: shadow was a 0.5-alpha photographic drop that reads as
  dirt; corners were 2px, which is a square with the tip taken off; the kicker
  was the lightest text in the section. Softened, rounded to 9px, and the kicker
  is now screen-reader only — one line per tile.
- **Four new tiles**: The Big Lez Show (Australian, Jarrad Wright, the character
  is Sassy the Sasquatch — it is NOT "Biggles"), Black Mirror, the Golden
  Record, the Strangers Project.
- **Globe** replaces the lat/long tile. 22 stops plus Norway drawn open as
  "next". Canvas and nine lines of trigonometry, not three.js.
- **About portrait** resolves out of a colour-cell grid on approach.
- **About top edge**: the hard line was the pixel canvas painting an opaque
  rectangle over a card that carries a blob mask. Same mask applied, plus a
  band of real `backdrop-filter` blur that falls from top to bottom on an 11s
  cycle.
- **Cap model** added to the rail: `assets/models/cap-web.glb`, 1.0MB.

---

## Open, and why

1. **The cap model does not finish loading.** The element builds, the library
   and the meshopt decoder both return 200, `loaded` stays false and no error
   event fires. Source was 15.6MB; I repacked textures at 1024 then ran
   `gltfpack -cc -si 0.3`. **Suspect the repack**: validate `cap-web.glb` before
   anything else. If it is bad, redo from the Downloads original — texture
   repack FIRST on the uncompressed file, then gltfpack once (doing it the other
   way round broke the `EXT_meshopt_compression` offsets, which is a separate
   bug I already hit).
2. **`output/`** — 4,510 files, 1.3GB in git history. Excluded from the build so
   nothing publishes, but it is most of the 15GB `.git`. Removing it is a
   history rewrite and needs Sid's explicit yes.
3. **Resume PDF** still says "Kyoorius Creative Award". Not in the file's text
   layer, so it is a vector or image export — fix in the source document.
4. **Voiceover** — thirteen scripts written, no audio recorded, no player.
5. **Footer at 30fps**, with two full-size videos and seven canvases. Cutting it
   means choosing which layers die; that is Sid's call.
6. **Sid's reported lag is still unexplained** on this hardware. Hero holds
   94–110fps in a visible window.

---

## Traps, in the order they cost the most

**Never measure frame rate through an occluded window.** Driving Sid's Chrome
over CDP, the home page appeared to produce one frame every six seconds and a
probe timed out with "the renderer may be frozen". `document.visibilityState`
was `"hidden"` and Chrome throttles rAF to nothing in a hidden tab. I wrote that
up as a severe live bug and had to retract it in a follow-up commit. Check
`visibilityState` before believing any timing number, and prefer a headed
Playwright window with `bringToFront()`.

**The rail clones its tiles.** `.sid-strip` duplicates the row's contents to make
the drift loop seamless, and it does that AFTER page scripts run. Two
consequences, both of which bit this session: a node reference captured at parse
time points at something detached that never intersects (the cap never built),
and a cloned `<canvas>` copies the element and none of its pixels while running
no script (the second globe was a blank square). Bind to `.sid-strip`, which is
stable, and query the child fresh.

**`opacity: 0` does not stop compositing.** The screensaver layer was
`display:block; visibility:visible` at opacity 0 on every page, holding six glass
pieces with `backdrop-filter` plus a full-viewport rain canvas.
`content-visibility: hidden` is the fix.

**`on-paper` is the other way the ground becomes light.** The home hero is paper
while `data-theme` is still dark. Anything keyed only on `data-theme` paints its
dark-page treatment onto cream. Hit this four separate times: the film vignette,
the nav scrim, the corner controls, the reel ring.

**The browser caches aggressively during QA.** Two rounds of "the fix did not
apply" were a cached page. Use a fresh context and a cache-busting query.

**Prettier reformats between edits.** Several `python` patches asserted on
strings that Prettier had already rewrapped. Re-grep the current text before
asserting, and never let a multi-step script write only at the end — a failed
assert in step two silently discards step one.
