---
layout: project
pillar: ai
permalink: /bloom/
project_title: "Bodhi on Vision Pro"
proj_num: "07"
status: "Thesis · visionOS"
tagline: A Vision Pro application that places an AI inhabited bodhi tree in your space, then asks you who you are. Not helpful, not efficient. Just present. A room you sit inside, where attention is the only interface and the voice has infinite patience.
category: Spatial Computing · visionOS
year: 2025-2026
hero_bg: "radial-gradient(ellipse at 50% 45%, #0c1622 0%, #060b12 55%, #02050a 100%)"
hero_image: "15.bloom-vp/cover.jpg"
og_image: "assets/img/og/bloom.jpg"
meta:
  - label: Year
    value: "2025-2026"
  - label: Client
    value: Self Initiated · MFA Thesis, Parsons D+T
  - label: Timeline
    value: 5 months
  - label: Team
    value: Solo
  - label: Role
    value: Designer · Developer · Researcher
  - label: Tools
    value: visionOS · SwiftUI · RealityKit · ARKit · ElevenLabs
highlights:
  - value: 5 months
    label: research, design & build
  - value: Solo
    label: designer · developer · researcher
  - value: visionOS
    label: spatial AI experience
quick_read: >
  Designed and built a Vision Pro thesis experience where a spatial AI tree uses gaze, voice, and deliberate pacing to make attention the interface.
reflection: >
  Building for Vision Pro meant learning a new spatial design language from scratch. There are no flat screens to fall back on. Every UI decision is a room decision. Where the tree sits, how large it reads at arm's length, whether the voice feels near or distant. All of it had to be felt in space, not sketched on a canvas.


  What surprised me was how much the voice carried the experience. The visuals set the stage, but the moment the tree spoke, everything changed. The right pacing made it feel alive. The wrong pacing made it feel like a demo. That line was narrower than I expected, and finding it took more iteration than any technical problem.
refl_bg: "15.bloom-vp/lotus.mp4"
decisions:
  - choice: "Made attention the only input and removed the controls"
    why: >
      Every spatial demo answers the question of what you can do here. The thesis question was whether presence
      alone could hold someone, so there is no menu, no pinch-to-open, no settings panel anywhere in the room. Gaze
      and voice are the entire surface, and the tree responds to being looked at rather than to being operated.
    tradeoff: >
      There is no way to recover from a misunderstanding. When the voice mishears, the user has no control to reach
      for and no obvious way to steer, and more than one tester sat through a stretch they had no idea how to leave.
  - choice: "Slowed the voice past the point that felt comfortable"
    why: >
      Conversational AI defaults to fast turn-taking because latency reads as failure. Here the pauses were the
      content. Response timing was stretched deliberately and the silence after a question was held rather than
      filled, so the system reads as patient instead of as waiting for input.
    tradeoff: >
      The first ninety seconds feel broken. Several testers assumed the app had hung before they understood that the
      pacing was the point, and I never found an onboarding line that fixes this without spoiling it.
  - choice: "Placed the tree at conversational distance instead of filling the room"
    why: >
      The instinct on Vision Pro is scale, because scale is what the device does that a screen cannot. But a tree at
      room scale turns the person wearing the headset into an audience. At roughly two metres, sized to be looked at
      rather than looked up at, the relationship becomes a conversation.
    tradeoff: >
      It gives up the spectacle that makes spatial work legible to anyone who has not worn the headset, and in a
      small room the placement occasionally lands inside furniture.
next_steps: >
  The pacing works and I would not change it, but the recovery problem is unresolved: an interface with no
  controls still needs a way to say it has lost you without breaking the fiction. That is what I would build
  next. I would also want to test beyond a single session. Everything I learned came from first encounters, and
  the claim the thesis actually makes is about sustained attention, which a fifteen-minute demo can neither
  prove nor disprove.
next_project:
  title: "Bloom; who are you"
  url: /mandalas/
  desc: The installation the thesis grew from.
---

<style>
  .cs-bleed { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-bleed img, .cs-bleed video { object-fit: contain !important; height: auto !important; }
  .cs-bleed::before { display: none !important; }
  .cs-grid-item { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-grid::before, .cs-grid-3::before, .cs-grid-item::before { display: none !important; }
  .cs-grid, .cs-grid-3 { gap: 16px !important; align-items: stretch !important; padding: 0 !important; }

  /* Standard margins (per STYLEGUIDE) */
  .cs-bleed { margin-top: 40px !important; }
  .cs-bleed + .cs-bleed { margin-top: 40px !important; }
  .cs-grid, .cs-grid-3 { margin-top: 40px !important; }
  .cs-grid + .cs-bleed, .cs-bleed + .cs-grid { margin-top: 40px !important; }
  .cs-grid + .cs-grid, .cs-grid-3 + .cs-grid, .cs-grid + .cs-grid-3 { margin-top: 16px !important; }

  /* Captions match cube-guy global cube-cap */
  .cube-cap { margin: 40px 0 0; }
  .cube-cap + .cs-bleed, .cube-cap + .cs-grid, .cube-cap + .cs-grid-3 { margin-top: 8px !important; }
  .cube-cap--above + .cs-bleed, .cube-cap--above + .cs-grid, .cube-cap--above + .cs-grid-3 { margin-top: 12px !important; }

  /* Grid sizing: fixed height, cover to fill (cube-guy pattern) */
  main .case-story .cs-grid,
  main .case-story .cs-grid-3 {
    height: clamp(320px, 50vh, 560px);
    grid-template-rows: 1fr;
  }
  main .case-story .cs-grid-3 { grid-template-columns: 1fr 1fr 1fr !important; }
  main .case-story .cs-grid-item { height: 100% !important; min-height: 0; overflow: hidden !important; }
  main .case-story .cs-grid-item img,
  main .case-story .cs-grid-item video {
    width: 100%; height: 100%;
    object-fit: cover !important;
    object-position: center center;
  }

  /* bl-contain: override cover where natural ratio matters (portraits, plates) */
  .cs-grid-item.bl-contain img,
  .cs-grid-item.bl-contain video,
  .cs-bleed.bl-contain img,
  .cs-bleed.bl-contain video { object-fit: contain !important; }

  /* Plate showcase: bloom plate full scale, knot a touch smaller, both centered portraits */
  .plate-hero img { max-height: 88vh !important; width: auto !important; max-width: 100% !important; margin: 0 auto !important; }
  .plate-big img { max-height: 74vh !important; width: auto !important; max-width: 100% !important; margin: 0 auto !important; }
  /* Taller grid for the silence + disc pair */
  main .case-story .cs-grid.grid-tall { height: clamp(420px, 64vh, 720px) !important; }
  main .case-story .cs-grid.grid-compact,
  main .case-story .cs-grid-3.grid-compact { height: clamp(260px, 34vh, 420px) !important; }
  .bl-story-open {
    margin-top: 40px !important;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
    gap: clamp(16px, 3vw, 40px);
    align-items: end;
  }
  .bl-story-open .cs-bleed { margin-top: 0 !important; }
  .bl-story-open-copy {
    padding: clamp(18px, 3vw, 32px) 0 0;
    max-width: 52ch;
  }
  .bl-story-open-copy h2 {
    margin: 0 0 14px;
    font-size: clamp(30px, 4vw, 62px);
    line-height: 0.98;
    letter-spacing: -0.03em;
    text-wrap: balance;
  }
  .bl-story-open-copy p {
    margin: 0;
    color: rgba(255, 255, 255, 0.62);
    font-size: clamp(16px, 1.35vw, 22px);
    line-height: 1.45;
    text-wrap: pretty;
  }
  .bl-focus-video video {
    aspect-ratio: 16 / 9;
    max-height: 86vh;
    object-fit: contain !important;
    background: #03070d;
  }

  /* Link bar matching cube-guy */
  .bl-watch-link {
    display: flex; gap: 0;
    margin: 40px var(--gutter) 0;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }
  .bl-watch-link a {
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(255, 255, 255, 0.42);
    padding: 16px 0; white-space: nowrap;
    text-decoration: none; transition: color 0.2s;
  }
  .bl-watch-link a:hover { color: rgba(255, 255, 255, 0.88); }

  /* Light mode — link bar and the story column both sit on the cream page. */
  html[data-theme="light"] .bl-watch-link {
    border-top-color: rgba(7,9,15,0.10);
    border-bottom-color: rgba(7,9,15,0.10);
  }
  html[data-theme="light"] .bl-watch-link a { color: rgba(7,9,15,0.6); }
  html[data-theme="light"] .bl-watch-link a:hover { color: #07090f; }
  html[data-theme="light"] .bl-story-open-copy p { color: rgba(7,9,15,0.72); }

  @media (max-width: 760px) {
    /* minmax(0, 1fr), not 1fr. A grid track's automatic minimum is min-content,
       and .cs-bleed carries `contain-intrinsic-size: auto 600px` for
       content-visibility — so while it is skipped its placeholder measures
       600px wide and the column floors there. On a 390px phone that pushed
       this whole section 236px off the right edge, headline and all. The two
       desktop tracks were already written minmax(0, …); the collapsed one was
       the only place the floor could reach. */
    .bl-story-open { grid-template-columns: minmax(0, 1fr); }
    .bl-story-open-copy { padding-top: 0; }
  }

  @keyframes projBreathe {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.008) translateY(-3px); }
  }

  /* The embedded tree is deliberately opt-in. A live iframe otherwise captures the
     wheel as soon as a visitor crosses it, which made this one artwork feel like a
     scroll trap. The preview remains visible; click only when you want to interact. */
  .bloom-interactive { position: relative; background: #04070c; }
  .bloom-interactive-toggle {
    position: absolute; right: 16px; bottom: 16px; z-index: 2;
    border: 0; border-bottom: 1px solid rgba(255,255,255,0.48);
    padding: 0 0 4px; background: rgba(4,7,12,0.78);
    color: rgba(255,255,255,0.86); font-family: var(--font-mono);
    font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase;
    cursor: pointer; transition: color 0.2s, border-color 0.2s;
  }
  .bloom-interactive-toggle:hover { color: #fff; border-color: #fff; }
  @media (max-width: 600px) { .bloom-interactive-toggle { right: 12px; bottom: 12px; } }
</style>

<!-- OPENING: start with the identity question, then move into spatial AI -->
<div class="bl-story-open">
  <div class="cs-bleed bl-contain">
    <img src="{{ site.baseurl }}/15.bloom-vp/poster.jpg" alt="Bloom: who are you, to you" loading="eager" decoding="async" />
  </div>
  <div class="bl-story-open-copy">
    <h2>Who are you, to you?</h2>
    <p>Bloom turns that question into a Vision Pro room: an AI inhabited bodhi tree, a slow voice, and a drawing space where the visitor answers in 3D instead of typing into a box.</p>
  </div>
</div>

<p class="cube-cap cube-cap--above"><em>The first encounter is not a menu. A bodhi tree appears in the room, breathes, and begins a patient conversation.</em></p>
<div class="cs-bleed" style="position: relative;">
  <video width="1440" height="810" id="tree-vid" autoplay muted loop playsinline preload="metadata" style="width: 100%; display: block;">
    <source src="{{ site.baseurl }}/15.bloom-vp/tree.mp4" type="video/mp4" />
  </video>
  <button class="cover-audio-btn muted" id="tree-audio-btn" aria-label="Toggle audio">
    <svg class="audio-icon-on" viewBox="0 0 24 24" width="14" height="14"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
    <svg class="audio-icon-off" viewBox="0 0 24 24" width="14" height="14"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
  </button>
</div>

<!-- VP SCENES: show the headset experience before the physical archive -->
<p class="cube-cap cube-cap--above"><em>Inside Vision Pro, the project is about presence: the tree, the voice, the room, and the marks you leave in space.</em></p>
<div class="cs-bleed bl-focus-video">
  <video width="1440" height="810" autoplay muted loop playsinline preload="none" style="width: 100%; display: block;">
    <source data-src="{{ site.baseurl }}/15.bloom-vp/vp-21.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video width="1440" height="810" autoplay muted loop playsinline preload="none">
      <source data-src="{{ site.baseurl }}/15.bloom-vp/vp-22.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video width="1440" height="810" autoplay muted loop playsinline preload="none">
      <source data-src="{{ site.baseurl }}/15.bloom-vp/vp-scene-23.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<p class="cube-cap cube-cap--above"><em>The tree settles into Bloom when the visitor stays with it long enough.</em></p>
<div class="cs-bleed bl-focus-video">
  <video width="1440" height="810" autoplay muted loop playsinline preload="none" style="width: 100%; display: block;">
    <source data-src="{{ site.baseurl }}/15.bloom-vp/vp-scene-4.mp4" type="video/mp4" />
  </video>
</div>

<!-- SECTION: SIT WITH IT - live in-browser AI inhabiting a 3D bodhi tree (self-contained, embedded) -->
<div class="cs-section">
  <h2 class="cs-section-label">Sit with it</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>The tree, alive in the browser. An AI sits inside it. Talk to it.</em></p>
<div class="cs-bleed bloom-interactive" id="bloom-interactive" data-project-interactive style="margin-top: 12px;">
  <iframe
    id="bloom-tree-frame"
    src="{{ site.baseurl }}/bloom-tree/"
    title="Bloom: sit with the tree"
    loading="lazy"
    allow="autoplay"
    tabindex="-1"
    style="width: 100%; height: clamp(440px, 64vh, 640px); border: 0; display: block; background: #04070c; border-radius: 2px;"
  ></iframe>
  <button class="bloom-interactive-toggle" id="bloom-interactive-toggle" type="button" aria-pressed="false">Explore the live tree ↗</button>
</div>

<!-- SECTION: ATTENTION IS THE INTERFACE -->
<div class="cs-section">
  <h2 class="cs-section-label">Attention is the interface</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>The tree responds to where you look, not where you tap. Gaze at a branch and it stills. Look away and it drifts again.</em></p>
<div class="cs-bleed">
  <video width="1440" height="810" autoplay muted loop playsinline preload="none" style="width: 100%; display: block;">
    <source data-src="{{ site.baseurl }}/15.bloom-vp/gaze.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above"><em>Every question it asks has no right answer. It does not evaluate what you say. It just continues, with infinite patience.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <video width="1440" height="810" autoplay muted loop playsinline preload="none">
      <source data-src="{{ site.baseurl }}/15.bloom-vp/visitor-1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video width="1440" height="810" autoplay muted loop playsinline preload="none">
      <source data-src="{{ site.baseurl }}/15.bloom-vp/visitor-2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- SECTION: DRAW IN SPACE -->
<div class="cs-section">
  <h2 class="cs-section-label">Draw in space</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>The answer is not only spoken. Visitors can assemble and draw objects in 3D space, turning thought into a small spatial ritual.</em></p>
<div class="cs-bleed bl-focus-video">
  <video width="1280" height="720" autoplay muted loop playsinline preload="none" style="width: 100%; display: block;">
    <source data-src="{{ site.baseurl }}/15.bloom-vp/wall-objects-assemble.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above"><em>A few earlier scene studies stayed in the archive, but the story now points back to the conversational spatial experience.</em></p>
<div class="cs-grid-3 grid-compact">
  <div class="cs-grid-item">
    <video width="1440" height="810" autoplay muted loop playsinline preload="none">
      <source data-src="{{ site.baseurl }}/15.bloom-vp/scene-18.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video width="1440" height="810" autoplay muted loop playsinline preload="none">
      <source data-src="{{ site.baseurl }}/15.bloom-vp/scene-21.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video width="1440" height="810" autoplay muted loop playsinline preload="none">
      <source data-src="{{ site.baseurl }}/15.bloom-vp/scene-22.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- The "Measuring the calm" section — the EEG headband video and the
     BrainBit channel log — moved to /mandalas/. Sid: "in the vision pro
     section there is some video stuff and brainwaves and person wearing
     brainbit that all has to shift to the mandala section and make sure
     vision pro has only the vision pro stuff."

     He is right about where it belongs. The headband was read on visitors of
     the mandala installation, which is the piece whose whole claim is that a
     room can change your attention; on this page it was evidence for a
     different project's thesis sitting in the middle of the Vision Pro
     build. The media moved with it, to 4.mandala/. -->

<!-- SECTION: IN THE ROOM -->
<div class="cs-section">
  <h2 class="cs-section-label">Made physical</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>The exhibition objects remain as proof of the thesis environment, but they now support the main interaction instead of taking over the scroll.</em></p>
<div class="cs-grid-3 grid-compact">
  <div class="cs-grid-item bl-contain">
    <img src="{{ site.baseurl }}/15.bloom-vp/altar.jpg" alt="Bloom exhibition: physical bodhi altar with holographic sheet and lotus" loading="lazy" decoding="async" />
  </div>
  <div class="cs-grid-item bl-contain">
    <img src="{{ site.baseurl }}/15.bloom-vp/plate-bloom.jpg" alt="Bloom exhibition: acrylic plate, No. 09 bloom" loading="lazy" decoding="async" />
  </div>
  <div class="cs-grid-item bl-contain">
    <video width="608" height="1080" autoplay muted loop playsinline preload="none">
      <source data-src="{{ site.baseurl }}/15.bloom-vp/plate-silence.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<p class="cube-cap cube-cap--above"><em>People sitting with it. The screen mirrored what the headset saw, so the room could watch too.</em></p>
<div class="cs-grid grid-compact">
  <div class="cs-grid-item">
    <video width="1440" height="810" autoplay muted loop playsinline preload="none">
      <source data-src="{{ site.baseurl }}/15.bloom-vp/exhibit-room.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video width="640" height="360" autoplay muted loop playsinline preload="none">
      <source data-src="{{ site.baseurl }}/15.bloom-vp/watching.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<script>
  (function () {
    var btn = document.getElementById("tree-audio-btn");
    var vid = document.getElementById("tree-vid");
    if (!btn || !vid) return;
    btn.addEventListener("click", function () {
      vid.muted = !vid.muted;
      btn.classList.toggle("muted", vid.muted);
      if (!vid.muted) vid.play().catch(function () {});
    });
  })();
  (function () {
    var stage = document.getElementById("bloom-interactive");
    var frame = document.getElementById("bloom-tree-frame");
    var toggle = document.getElementById("bloom-interactive-toggle");
    if (!stage || !frame || !toggle) return;
    function setInteractive(active) {
      stage.classList.toggle("is-active", active);
      frame.tabIndex = active ? 0 : -1;
      toggle.setAttribute("aria-pressed", String(active));
      toggle.textContent = active ? "Resume page scroll ↑" : "Explore the live tree ↗";
    }
    toggle.addEventListener("click", function () {
      setInteractive(!stage.classList.contains("is-active"));
    });
    // The page always has an immediate way back from the live experience.
    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && stage.classList.contains("is-active")) {
        setInteractive(false);
        toggle.focus();
      }
    });
  })();
</script>
