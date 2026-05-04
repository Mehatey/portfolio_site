---
layout: project
permalink: /mandalas/
project_title: "Bloom; who are you"
proj_num: "04"
status: "Thesis · Ongoing"
tagline: An interactive installation built around one question. This was my thesis but it was really a personal question, sitting with the idea that most of us move through life without ever stopping to ask who we actually are. Generative mandalas, layered audio, and a darkened space designed to make room for reflection.
category: Installation · TouchDesigner
year: 2025
hero_bg: "radial-gradient(ellipse at 40% 60%, #160d24 0%, #080408 55%, #020102 100%)"
hero_video: "4.mandala/cover.mp4"
hero_image: "4.mandala/cover.png"
meta:
  - label: Role
    value: Solo
  - label: Year
    value: 2025
  - label: Tools
    value: TouchDesigner · MediaPipe · MadMapper
  - label: Client
    value: Self Initiated
reflection: >
  Some people closed their eyes and let go of the visuals entirely. That told me more about immersion than anything I had designed for.


  The installation worked best in darker, quieter rooms where conditions invited stillness. I realized that design is not always about what you show, but what you make room for.
refl_bg: "4.mandala/blobs.mp4"
next_project:
  title: Mind Your Feelings
  url: /mind-your-feelings/
---

<style>
  .cs-bleed { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-bleed img, .cs-bleed video { object-fit: contain !important; height: auto !important; }
  .cs-bleed::before { display: none !important; }
  .cs-grid-item { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-grid-item img, .cs-grid-item video { object-fit: cover !important; height: 100% !important; }
  .cs-grid::before { display: none !important; }
  .cs-grid-3::before { display: none !important; }
  .cs-grid-item::before { display: none !important; }
  .cs-grid { gap: 16px !important; align-items: stretch !important; padding: 0 !important; }
  .cs-grid-3 { gap: 16px !important; align-items: stretch !important; padding: 0 !important; }
  .cs-bleed { margin-top: 40px !important; }
  .cs-bleed + .cs-bleed { margin-top: 40px !important; }
  .cs-grid, .cs-grid-3 { margin-top: 40px !important; }
  .cs-grid + .cs-bleed, .cs-bleed + .cs-grid { margin-top: 40px !important; }
  .cs-grid + .cs-grid, .cs-grid-3 + .cs-grid, .cs-grid + .cs-grid-3, .cs-grid-3 + .cs-grid-3 { margin-top: 16px !important; }
  .cs-grid.ma-grid + .cs-grid.ma-grid { margin-top: 16px !important; }

  /* Captions match cube-guy global cube-cap */
  .cube-cap { margin: 40px 0 0; }
  .cube-cap + .cs-bleed, .cube-cap + .cs-grid, .cube-cap + .cs-grid-3 { margin-top: 8px !important; }
  .cube-cap--above + .cs-bleed, .cube-cap--above + .cs-grid, .cube-cap--above + .cs-grid-3 { margin-top: 12px !important; }

  /* Grid sizing — fixed height like cube-guy */
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

  /* ai-contain — override cover for specific items where natural ratio matters */
  .cs-grid-item.ai-contain img,
  .cs-grid-item.ai-contain video,
  .cs-bleed.ai-contain img,
  .cs-bleed.ai-contain video { object-fit: contain !important; }

  /* g-cover — force cover on grid (with slight zoom for cinematic crop) */
  .cs-grid.g-cover .cs-grid-item img,
  .cs-grid.g-cover .cs-grid-item video {
    object-fit: cover !important;
    transform: scale(1.08);
    transform-origin: center center;
  }

  /* ma-cover — explicit cover override on a specific element */
  .ma-cover { object-fit: cover !important; }

  /* ma-grid — denser grid for style-explorations section */
  .cs-grid.ma-grid { height: clamp(220px, 32vh, 380px); }

  /* f-vid-wrap — natural-ratio video, no cropping */
  .f-vid-wrap {
    margin: 40px 0 0;
    width: 100%;
    display: block;
    background: #000;
  }
  .f-vid-wrap video {
    width: 100%;
    height: auto;
    display: block;
  }

  /* m-watch-link — link bar matching cube-guy */
  .m-watch-link {
    display: flex;
    gap: 0;
    margin: 40px var(--gutter) 0;
    border-top: 1px solid rgba(255,255,255,0.07);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .m-watch-link a {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.42);
    padding: 16px 0;
    white-space: nowrap;
    text-decoration: none;
    transition: color 0.2s;
  }
  .m-watch-link a:hover { color: rgba(255,255,255,0.88); }

  /* grid-audio-btn — toggle for in-grid audio */
  .grid-audio-btn {
    position: absolute;
    bottom: 16px; right: 16px;
    z-index: 10;
    width: 36px; height: 36px;
    border: 1px solid rgba(255,255,255,0.30);
    background: rgba(0,0,0,0.55);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    cursor: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .grid-audio-btn:hover {
    border-color: rgba(255,255,255,0.65);
    background: rgba(0,0,0,0.75);
  }
  .grid-audio-btn svg { width: 14px; height: 14px; fill: rgba(255,255,255,0.85); }
  .grid-audio-btn .icon-on, .grid-audio-btn .icon-off { transition: opacity 0.15s; }
  .grid-audio-btn.muted .icon-on { display: none; }
  .grid-audio-btn:not(.muted) .icon-off { display: none; }

  @keyframes projBreathe {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.008) translateY(-3px); }
  }

  /* Thesis docs — two-up bordered link cards at top of body */
  .thesis-docs {
    display: flex;
    gap: 12px;
    margin: 40px var(--gutter) 0;
    flex-wrap: wrap;
  }
  .thesis-doc {
    flex: 1;
    min-width: 260px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 24px 28px;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: border-color 0.3s, background 0.3s;
  }
  .thesis-doc:hover {
    border-color: rgba(255, 255, 255, 0.20);
    background: rgba(255, 255, 255, 0.025);
  }
  .thesis-doc-kicker {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.45);
  }
  .thesis-doc-title {
    font-family: var(--font-head);
    font-size: 17px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.88);
    margin-top: 4px;
    line-height: 1.35;
  }
  .thesis-doc-meta {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.32);
    margin-top: 16px;
    transition: color 0.3s;
  }
  .thesis-doc:hover .thesis-doc-meta { color: rgba(255, 255, 255, 0.65); }
</style>

<!-- THESIS DOCUMENTS -->
<div class="thesis-docs">
  <a href="{{ site.baseurl }}/4.mandala/thesis-paper.pdf" target="_blank" rel="noopener" class="thesis-doc">
    <span class="thesis-doc-kicker">Thesis Paper · v1</span>
    <span class="thesis-doc-title">The academic write-up</span>
    <span class="thesis-doc-meta">PDF ↗</span>
  </a>
  <a href="{{ site.baseurl }}/4.mandala/bloom-diary.pdf" target="_blank" rel="noopener" class="thesis-doc">
    <span class="thesis-doc-kicker">Bloom · A Visual Diary</span>
    <span class="thesis-doc-title">Mandala explorations, illustrated</span>
    <span class="thesis-doc-meta">PDF ↗</span>
  </a>
</div>

<p class="cube-cap cube-cap--above"><em>Spiral concept of evolution interested me.</em></p>
<div class="f-vid-wrap">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/first.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above"><em>I wanted to combine the spiral shape with the stories of shared human experience.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/people.mp4" type="video/mp4" />
  </video>
</div>

<!-- SECTION: INTROSPECTIVE SPACES -->
<div class="cs-section">
  <h2 class="cs-section-label">Introspective spaces</h2>
</div>

<p class="cube-cap cube-cap--above"><em>The lit room. Brighter, more reflective. People found it harder to settle.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/8.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/9.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/a1.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/10.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/4.mandala/10.2.png" alt="Bloom mandala installation — process and explorations" loading="lazy" />
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/11.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/12.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/4.mandala/12.2.png" alt="Bloom mandala installation — process and explorations" loading="lazy" />
  </div>
</div>

<div class="cs-bleed ai-contain">
  <img src="{{ site.baseurl }}/4.mandala/9.2.png" alt="Bloom mandala installation — process and explorations" loading="lazy" />
</div>

<!-- 13.1 + 13.2 + 13.3 grid -->
<div class="cs-grid-3">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/4.mandala/13.1.png" alt="Bloom mandala installation — process and explorations" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/13.2.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/4.mandala/13.3.png" alt="Bloom mandala installation — process and explorations" loading="lazy" />
  </div>
</div>

<!-- SECTION: BREATHE -->
<div class="cs-section">
  <h2 class="cs-section-label">Breathe</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>An earlier experiment. A 2D pixel art game asking if play could make you more still.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/g1.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/g2.mp4" type="video/mp4" />
  </video>
</div>

<!-- g3 + g4 side-by-side -->
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/g3.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/g4.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/g5.mp4" type="video/mp4" />
  </video>
</div>

<!-- BREATHE LINK -->
<div class="m-watch-link">
  <a href="https://mehatey.github.io/breathe-game/" target="_blank" rel="noopener">Play Breathe ↗</a>
</div>

<!-- SECTION: VISION PRO -->
<div class="cs-section">
  <h2 class="cs-section-label">Vision Pro</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>Taking the mandala into augmented reality.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/mandalavr.mp4" type="video/mp4" />
  </video>
</div>

<!-- vr1 + vr2 -->
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/vr1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/vr2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- vr3 + vr4 -->
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/vr3.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/vr4.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- SECTION: BLOOM -->
<div class="cs-section">
  <h2 class="cs-section-label">Bloom</h2>
</div>

<!-- Bloom logo hero -->
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/4.mandala/bloom-logo.jpeg" alt="Bloom" loading="lazy" />
</div>

<p class="cube-cap cube-cap--above"><em>Experimenting with translucent acrylic shades and reflections.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/bloom1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/4.mandala/bloom2.jpg" alt="Bloom mandala installation — process and explorations" loading="lazy" />
  </div>
</div>

<!-- SECTION: BRAIN BIT BAND -->
<div class="cs-section">
  <h2 class="cs-section-label">Brain Bit Band</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>Experimenting with the Brain Bit Band to capture live EEG data.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/4.mandala/brainbit.png" alt="Brain Bit Band" loading="lazy" />
</div>

<p class="cube-cap cube-cap--above"><em>Planning to take that live EEG data and let it shape the mandalas in real time.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/eeg.mp4" type="video/mp4" />
  </video>
</div>

<!-- SECTION: MANDALAS -->
<div class="cs-section">
  <h2 class="cs-section-label">Mandalas</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>Mandalas made on festival floors, then walked over and dissolved. This started from that memory.</em></p>
<div class="cs-bleed ai-contain">
  <img src="{{ site.baseurl }}/4.mandala/2.png" alt="Bloom mandala installation — process and explorations" loading="lazy" style="animation: projBreathe 7s ease-in-out infinite;" />
</div>

<div class="cs-bleed ai-contain">
  <img src="{{ site.baseurl }}/4.mandala/1.png" alt="Bloom mandala installation — process and explorations" loading="lazy" />
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/3.2.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Sid's record. A brain scan, a name in binary, a voice. Inspired by the Voyager golden record.</em></p>
<div class="cs-grid-3">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/2.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/2.2.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/2.3.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- SECTION: GUIDED MEDITATION -->
<div class="cs-section">
  <h2 class="cs-section-label">Guided meditation</h2>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/6.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/4.mandala/cover.png" alt="Bloom mandala installation — process and explorations" loading="lazy" />
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/ab.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/abc.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item" style="position:relative;">
    <video id="mandala-compiled-vid" autoplay muted loop playsinline preload="auto">
      <source src="{{ site.baseurl }}/4.mandala/mandala-shorter.mp4" type="video/mp4" />
    </video>
    <button class="grid-audio-btn muted" id="mandala-audio-btn" aria-label="Toggle audio">
      <svg class="icon-on" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
      <svg class="icon-off" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
    </button>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/m1.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="m-watch-link">
  <a href="https://www.youtube.com/watch?v=v14nAzshrLs" target="_blank" rel="noopener">Watch Full Meditation ↗</a>
</div>

<p class="cube-cap cube-cap--above"><em>Most people needed a prompt to begin. Without direction, reflection stayed on the surface.</em></p>
<div class="cs-grid g-cover">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/g.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/4.mandala/j.png" alt="Bloom mandala installation — process and explorations" loading="lazy" />
  </div>
</div>

<!-- SECTION: MANDALAS STYLE EXPLORATIONS -->
<div class="cs-section">
  <h2 class="cs-section-label">Mandalas style explorations</h2>
</div>

<p class="cube-cap cube-cap--above"><em>The goal was for people to not use the cursor. The coin is a distraction.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/ma1.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above"><em>When you shake your hand, the mandala ripples.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/ripple-web.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/ma2.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/4.mandala/test-ma26.png" alt="Bloom mandala installation — process and explorations" loading="lazy" class="ma-cover" />
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/4.mandala/ma26.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma3.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma4.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma5.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma6.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/ma7.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma8.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma9.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma10.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma11.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma13.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma14.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/ma15.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma16.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma17.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma18.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma20.mp4" type="video/mp4" /></video></div>
</div>

<p class="cube-cap cube-cap--above"><em>Going beyond mandalas and playing with different eye tracking forms.</em></p>
<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma21.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma23.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma24.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma25.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma28.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma29.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma30.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma31.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/ma32.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma33.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma34.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/ma36.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none"><source src="{{ site.baseurl }}/4.mandala/blobs.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/ma35.mp4" type="video/mp4" />
  </video>
</div>

<div class="m-watch-link">
  <a href="https://mehatey.github.io/sid-mandala-camera-one/" target="_blank" rel="noopener">Try the Full Experience ↗</a>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/4.mandala/p1.png" alt="Bloom mandala installation — process and explorations" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/4.mandala/p2.png" alt="Bloom mandala installation — process and explorations" loading="lazy" />
  </div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top:40px;"><em>A report of what you stayed with, and what that might say about you.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/ma37.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/5.2.mp4" type="video/mp4" />
  </video>
</div>

<script>
  (function () {
    var btn = document.getElementById("mandala-audio-btn");
    var vid = document.getElementById("mandala-compiled-vid");
    if (!btn || !vid) return;
    btn.addEventListener("click", function () {
      vid.muted = !vid.muted;
      btn.classList.toggle("muted", vid.muted);
      if (!vid.muted) vid.play().catch(function () {});
    });
  })();
</script>
