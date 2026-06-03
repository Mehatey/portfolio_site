---
layout: project
permalink: /bloom/
project_title: "Bloom"
proj_num: "07"
status: "Thesis · visionOS"
tagline: A Vision Pro application that places an AI inhabited bodhi tree in your space, then asks you who you are. Not helpful, not efficient. Just present. A room you sit inside, where attention is the only interface and the voice has infinite patience.
category: Spatial Computing · visionOS
year: 2025-2026
hero_bg: "radial-gradient(ellipse at 50% 45%, #0c1622 0%, #060b12 55%, #02050a 100%)"
hero_image: "15.bloom-vp/cover.jpg"
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
reflection: >
  Building for Vision Pro meant learning a new spatial design language from scratch. There are no flat screens to fall back on. Every UI decision is a room decision. Where the tree sits, how large it reads at arm's length, whether the voice feels near or distant. All of it had to be felt in space, not sketched on a canvas.


  What surprised me was how much the voice carried the experience. The visuals set the stage, but the moment the tree spoke, everything changed. The right pacing made it feel alive. The wrong pacing made it feel like a demo. That line was narrower than I expected, and finding it took more iteration than any technical problem.
refl_bg: "15.bloom-vp/lotus.mp4"
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

  /* Grid sizing — fixed height, cover to fill (cube-guy pattern) */
  .cs-grid, .cs-grid-3 {
    height: clamp(320px, 50vh, 560px);
    grid-template-rows: 1fr;
  }
  .cs-grid-3 { grid-template-columns: 1fr 1fr 1fr !important; }
  .cs-grid-item { height: 100% !important; min-height: 0; overflow: hidden !important; }
  .cs-grid-item img, .cs-grid-item video {
    width: 100%; height: 100%;
    object-fit: cover !important;
    object-position: center center;
  }

  /* bl-contain — override cover where natural ratio matters (portraits, plates) */
  .cs-grid-item.bl-contain img,
  .cs-grid-item.bl-contain video,
  .cs-bleed.bl-contain img,
  .cs-bleed.bl-contain video { object-fit: contain !important; }

  /* Plate showcase — bloom plate full scale, knot a touch smaller, both centered portraits */
  .plate-hero img { max-height: 88vh !important; width: auto !important; max-width: 100% !important; margin: 0 auto !important; }
  .plate-big img { max-height: 74vh !important; width: auto !important; max-width: 100% !important; margin: 0 auto !important; }
  /* Taller grid for the silence + disc pair */
  .cs-grid.grid-tall { height: clamp(420px, 64vh, 720px) !important; }

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

  @keyframes projBreathe {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.008) translateY(-3px); }
  }
</style>

<!-- OPENING: the tree appears, and speaks -->
<p class="cube-cap cube-cap--above"><em>A bodhi tree appears in your room. Its branches breathe. A voice, low and unhurried, begins to ask you things.</em></p>
<div class="cs-bleed" style="position: relative;">
  <video id="tree-vid" autoplay muted loop playsinline preload="metadata" style="width: 100%; display: block;">
    <source src="{{ site.baseurl }}/15.bloom-vp/tree.mp4" type="video/mp4" />
  </video>
  <button class="cover-audio-btn muted" id="tree-audio-btn" aria-label="Toggle audio">
    <svg class="audio-icon-on" viewBox="0 0 24 24" width="14" height="14"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
    <svg class="audio-icon-off" viewBox="0 0 24 24" width="14" height="14"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
  </button>
</div>

<p class="cube-cap cube-cap--above"><em>Bloom. The form the tree settles into when you stay with it long enough.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width: 100%; display: block;">
    <source src="{{ site.baseurl }}/15.bloom-vp/lotus.mp4" type="video/mp4" />
  </video>
</div>

<!-- SECTION: SIT WITH IT — live in-browser AI inhabiting a 3D bodhi tree (self-contained, embedded) -->
<div class="cs-section">
  <h2 class="cs-section-label">Sit with it</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>The tree, alive in the browser. An AI sits inside it. Talk to it.</em></p>
<div class="cs-bleed" style="margin-top: 12px;">
  <iframe
    src="{{ site.baseurl }}/bloom-tree/"
    title="Bloom — sit with the tree"
    loading="lazy"
    allow="autoplay"
    style="width: 100%; height: clamp(560px, 84vh, 860px); border: 0; display: block; background: #04070c; border-radius: 2px;"
  ></iframe>
</div>

<!-- SECTION: ATTENTION IS THE INTERFACE -->
<div class="cs-section">
  <h2 class="cs-section-label">Attention is the interface</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>The tree responds to where you look, not where you tap. Gaze at a branch and it stills. Look away and it drifts again.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width: 100%; display: block;">
    <source src="{{ site.baseurl }}/15.bloom-vp/gaze.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above"><em>Every question it asks has no right answer. It does not evaluate what you say. It just continues, with infinite patience.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/15.bloom-vp/visitor-1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/15.bloom-vp/visitor-2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- SECTION: AGAINST THE NOISE -->
<div class="cs-section">
  <h2 class="cs-section-label">Against the noise</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>Step outside and the noise returns. A world that sells your attention back to you, one sponsored moment at a time.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width: 100%; display: block;">
    <source src="{{ site.baseurl }}/15.bloom-vp/outside.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above"><em>Fragments of that noise, burned into wood. The messages that view you without ever respecting you.</em></p>
<div class="cs-bleed bl-contain">
  <img src="{{ site.baseurl }}/15.bloom-vp/notifications.jpg" alt="Bloom exhibition — engraved wood panel of notification fragments" loading="lazy" decoding="async" />
</div>

<!-- SECTION: MEASURING THE CALM -->
<div class="cs-section">
  <h2 class="cs-section-label">Measuring the calm</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>Calm should not be a claim. So an EEG headband read each visitor before the tree, and again after, to see what actually changed.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width: 100%; display: block;">
    <source src="{{ site.baseurl }}/15.bloom-vp/brainbit.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above"><em>Four channels, read live. The meditation score rising and drowsiness falling as attention settled on the tree.</em></p>
<div class="cs-bleed bl-contain">
  <img src="{{ site.baseurl }}/15.bloom-vp/brainbit.jpg" alt="BrainBit Studio — EEG brain log from a Bloom session" loading="lazy" decoding="async" />
</div>

<!-- SECTION: IN THE ROOM -->
<div class="cs-section">
  <h2 class="cs-section-label">In the room</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>The tree made physical. A small altar where the digital stillness met the room.</em></p>
<div class="cs-bleed bl-contain">
  <img src="{{ site.baseurl }}/15.bloom-vp/altar.jpg" alt="Bloom exhibition — physical bodhi altar with holographic sheet and lotus" loading="lazy" style="animation: projBreathe 7s ease-in-out infinite;" decoding="async" />
</div>

<p class="cube-cap cube-cap--above"><em>It started with me asking people what is beautiful and broken about the world.</em></p>
<div class="cs-bleed bl-contain">
  <img src="{{ site.baseurl }}/15.bloom-vp/poem-panel.jpg" alt="Bloom exhibition — laser engraved wooden panel with the project text" loading="lazy" decoding="async" />
</div>

<p class="cube-cap cube-cap--above"><em>Engraved acrylic plates, each one a fragment of the thesis, holograms caught in clear sheets.</em></p>
<div class="cs-bleed bl-contain plate-hero">
  <img src="{{ site.baseurl }}/15.bloom-vp/plate-bloom.jpg" alt="Bloom exhibition — acrylic plate, No. 09 bloom" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed bl-contain plate-big">
  <img src="{{ site.baseurl }}/15.bloom-vp/plate-knot.jpg" alt="Bloom exhibition — acrylic plate, No. 05 knot" loading="lazy" decoding="async" />
</div>

<div class="cs-grid grid-tall">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/15.bloom-vp/plate-silence.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item bl-contain">
    <img src="{{ site.baseurl }}/15.bloom-vp/disc.jpg" alt="Bloom exhibition — clear acrylic disc with engraved text" loading="lazy" decoding="async" />
  </div>
</div>

<p class="cube-cap cube-cap--above"><em>People sitting with it. The screen mirrored what the headset saw, so the room could watch too.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/15.bloom-vp/exhibit-room.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/15.bloom-vp/watching.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- CLOSE: poster -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Who are you, to you.</em></p>
<div class="cs-bleed bl-contain">
  <img src="{{ site.baseurl }}/15.bloom-vp/poster.jpg" alt="Bloom — who are you, to you" loading="lazy" decoding="async" />
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
</script>
