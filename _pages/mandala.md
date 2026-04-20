---
layout: project
permalink: /mandalas/
project_title: "Who are you, to you"
proj_num: "04"
tagline: An interactive installation built around one question. Generative mandalas, layered audio, and a darkened space designed to make room for reflection.
category: Installation · TouchDesigner
year: 2025
hero_bg: "radial-gradient(ellipse at 40% 60%, #160d24 0%, #080408 55%, #020102 100%)"
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
hide_overview: true
reflection: >
  Some people closed their eyes and let go of the visuals entirely. That told me more about immersion than anything I had designed for.


  The installation worked best in darker, quieter rooms where conditions invited stillness. I realized that design is not always about what you show, but what you make room for.
next_project:
  title: B+b
  url: /b-plus-b/
---

<style>
  .cs-intro {
    max-width: none !important;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    text-align: left;
    padding: 56px var(--gutter) 72px;
    gap: 24px;
  }
  .cs-intro .intro-overview-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
  }
  /* Word-reveal JS handles cs-body — disable global fadeUp */
  .cs-intro .cs-body {
    font-size: clamp(16px, 1.8vw, 26px);
    line-height: 1.7;
    color: rgba(255,255,255,0.82);
    max-width: min(860px, 68vw);
    margin: 0;
    animation: none;
  }
  .cs-intro .cs-body--insight { animation: none; }
  .cs-grid {
    height: clamp(360px, 60vh, 720px);
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
  .cs-bleed img, .cs-bleed video,
  .cs-bleed-full img, .cs-bleed-full video {
    object-fit: contain !important;
  }
  .cs-bleed + .cs-bleed { margin-top: 16px; }
  .cs-grid-3 {
    height: clamp(360px, 56vh, 680px);
    grid-template-rows: 1fr;
    gap: 4px;
  }
  .ai-contain img,
  .ai-contain video { object-fit: contain !important; }
  /* Specific items that must crop to fill (cover), not letterbox */
  .g-cover .cs-grid-item img,
  .g-cover .cs-grid-item video { object-fit: cover !important; }
  .ma-cover { object-fit: cover !important; }
  .m-watch-link {
    display: flex;
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
  .cs-intro .cs-body--insight {
    font-size: clamp(16px, 1.8vw, 26px);
    line-height: 1.7;
    color: rgba(255,255,255,0.82);
    max-width: min(860px, 68vw);
    position: relative;
    margin-top: 8px;
    padding-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .cs-intro .cs-body--insight::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 1px;
    background: rgba(255,255,255,0.07);
  }
  .cs-intro .cs-body--insight .insight-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
  }

  .cs-intro .cs-body p .tw-word,
  .cs-intro .cs-body--insight p .tw-word {
    opacity: 0;
    transition: opacity 0.18s ease;
    display: inline;
  }
  .cs-intro .cs-body--insight {
    visibility: hidden;
  }
  .cs-intro {
    padding-bottom: 96px;
  }
  .proj-title {
    font-size: clamp(48px, 7.5vw, 108px) !important;
  }
  .hero-video {
    object-fit: contain !important;
    transform: scale(0.62) translateY(18%) !important;
    transform-origin: center center;
  }
  .f-vid-wrap {
    width: 100%;
    margin: 40px 0 0;
    background: #000;
  }
  .f-vid-wrap video {
    width: 100%;
    height: auto;
    display: block;
  }

  /* Custom audio toggle for grid video */
  .grid-audio-btn {
    position: absolute;
    bottom: 12px;
    right: 12px;
    z-index: 10;
    background: rgba(0,0,0,0.55);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
  }
  .grid-audio-btn:hover { background: rgba(0,0,0,0.8); }
  .grid-audio-btn svg { width: 16px; height: 16px; fill: rgba(255,255,255,0.85); }
  .grid-audio-btn .icon-on,
  .grid-audio-btn .icon-off { transition: opacity 0.15s; }
  .grid-audio-btn.muted .icon-on { display: none; }
  .grid-audio-btn:not(.muted) .icon-off { display: none; }

  /* Horizontal drift for mandala exploration grids */
  @keyframes ma-drift {
    from { transform: translateX(-2%); }
    to   { transform: translateX(2%); }
  }
  .ma-grid .cs-grid-item video {
    animation: ma-drift 12s ease-in-out infinite alternate;
    will-change: transform;
  }

  /* Continuous slow breathing zoom on all images */
  @keyframes slow-zoom {
    from { transform: scale(1); }
    to   { transform: scale(1.06); }
  }
  .cs-grid-item img,
  .cs-bleed img {
    animation: slow-zoom 12s ease-in-out infinite alternate;
  }
</style>

<!-- OVERVIEW -->
<div class="cs-intro">
  <span class="intro-overview-label">Overview</span>
  <div class="cs-body">
    <p>This was my thesis but it was really a personal question. I had been getting into meditation, spending a lot of time with Alan Watts and Ram Dass, sitting with the idea that most of us move through life without ever stopping to ask who we actually are. I wanted to find my own kind of quiet, and I wanted to know whether design could create the conditions for someone else to find theirs.</p>
  </div>
  <div class="cs-body--insight">
    <span class="insight-label">Insight</span>
    <p>I was moved by the Strangers Project, where people write what they are carrying and leave it anonymously for the world. There is something in that which tells you we are all holding the same questions, just in different bodies. This installation started from there, from the belief that the human condition is not something you sit with alone.</p>
  </div>
</div>

<p class="cube-cap cube-cap--above"><em>Spiral concept of evolution interested me.</em></p>
<div class="f-vid-wrap">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/4.mandala/first.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/people.mp4" type="video/mp4" />
  </video>
</div>

<!-- SECTION: INTROSPECTIVE SPACES -->
<div class="cs-section">
  <span class="cs-section-label">Introspective spaces</span>
</div>

<p class="cube-cap cube-cap--above"><em>The lit room. Brighter, more reflective. People found it harder to settle.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/8.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/9.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/a1.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/10.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/4.mandala/10.2.png" alt="" loading="lazy" />
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/11.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/12.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/4.mandala/12.2.png" alt="" loading="lazy" />
  </div>
</div>

<div class="cs-bleed ai-contain">
  <img src="{{ site.baseurl }}/4.mandala/13.1.png" alt="" loading="lazy" />
</div>

<div class="cs-grid-3">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/13.2.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/4.mandala/13.3.png" alt="" loading="lazy" />
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/4.mandala/9.2.png" alt="" loading="lazy" />
  </div>
</div>

<!-- SECTION: MANDALAS -->
<div class="cs-section">
  <span class="cs-section-label">Mandalas</span>
</div>

<p class="cube-cap cube-cap--above"><em>In India, mandalas were made on festival floors in chalk and color, then walked over and dissolved. This project started from that memory.</em></p>
<div class="cs-bleed ai-contain">
  <img src="{{ site.baseurl }}/4.mandala/2.png" alt="" loading="lazy" />
</div>

<div class="cs-bleed ai-contain">
  <img src="{{ site.baseurl }}/4.mandala/1.png" alt="" loading="lazy" />
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/3.2.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Sid's record. A brain scan, a name in binary, a voice, the ideas he keeps returning to. Inspired by the Voyager golden record.</em></p>
<div class="cs-grid-3">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/2.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/2.2.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/2.3.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- SECTION: GUIDED MEDITATION -->
<div class="cs-section">
  <span class="cs-section-label">Guided meditation</span>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/6.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/4.mandala/cover.png" alt="" loading="lazy" />
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/ab.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/abc.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item" style="position:relative;">
    <video id="mandala-compiled-vid" autoplay muted loop playsinline preload="auto" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/mandala-shorter.mp4" type="video/mp4" />
    </video>
    <button class="grid-audio-btn muted" id="mandala-audio-btn" aria-label="Toggle audio">
      <svg class="icon-on" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
      <svg class="icon-off" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
    </button>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/m1.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="m-watch-link">
  <a href="https://www.youtube.com/watch?v=v14nAzshrLs" target="_blank" rel="noopener">Watch Full Meditation ↗</a>
</div>

<p class="cube-cap cube-cap--above" style="margin-top:48px;"><em>Most people needed a prompt to begin. Without direction, reflection stayed on the surface.</em></p>
<div class="cs-grid g-cover" style="align-items:stretch;">
  <div class="cs-grid-item" style="height:clamp(360px,60vh,720px);overflow:hidden;">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;transform:scale(1.08);transform-origin:center center;">
      <source src="{{ site.baseurl }}/4.mandala/g.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item" style="height:clamp(360px,60vh,720px);">
    <img src="{{ site.baseurl }}/4.mandala/j.png" alt="" loading="lazy" style="width:100%;height:100%;display:block;" />
  </div>
</div>

<!-- SECTION: MANDALAS STYLE EXPLORATIONS -->
<div class="cs-section">
  <span class="cs-section-label">Mandalas style explorations</span>
</div>

<p class="cube-cap cube-cap--above"><em>The goal was for people to not use the cursor. The coin is a distraction.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/ma1.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above"><em>When you shake your hand, the mandala ripples.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/ripple-web.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/ma2.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/4.mandala/test-ma26.png" alt="" loading="lazy" class="ma-cover" style="width:100%;height:100%;display:block;" />
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/ma26.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma3.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma4.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma5.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma6.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/ma7.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma8.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma9.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma10.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma11.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma13.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma14.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/ma15.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma16.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma17.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma18.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma20.mp4" type="video/mp4" /></video></div>
</div>

<p class="cube-cap cube-cap--above"><em>Going beyond mandalas and playing with different eye tracking forms.</em></p>
<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma21.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma23.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma24.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma25.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma28.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma29.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma30.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma31.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/ma32.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma33.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma34.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-grid ma-grid">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/ma36.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;"><source src="{{ site.baseurl }}/4.mandala/blobs.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/ma35.mp4" type="video/mp4" />
  </video>
</div>

<div class="m-watch-link">
  <a href="https://mehatey.github.io/sid-mandala-camera-one/" target="_blank" rel="noopener">Try the Full Experience ↗</a>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/4.mandala/p1.png" alt="" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/4.mandala/p2.png" alt="" loading="lazy" />
  </div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top:40px;"><em>A report of what you stayed with, and what that might say about you.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/ma37.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/5.2.mp4" type="video/mp4" />
  </video>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function () {
    var paras = Array.from(
      document.querySelectorAll(
        '.cs-intro .cs-body p, .cs-intro .cs-body--insight p'
      )
    );

    // Wrap each word in a span, preserving spaces, without changing layout
    paras.forEach(function (p) {
      var words = p.textContent.split(' ');
      p.innerHTML = words
        .map(function (w) { return '<span class="tw-word">' + w + '</span>'; })
        .join(' ');
    });

    function revealPara(p, done) {
      var insightBlock = document.querySelector('.cs-intro .cs-body--insight');
      if (insightBlock && p.closest('.cs-body--insight')) {
        insightBlock.style.visibility = 'visible';
      }
      var words = p.querySelectorAll('.tw-word');
      var i = 0;
      var timer = setInterval(function () {
        if (i < words.length) {
          words[i].style.opacity = '1';
          i++;
        } else {
          clearInterval(timer);
          if (done) setTimeout(done, 200);
        }
      }, 38);
    }

    var idx = 0;
    function next() {
      if (idx < paras.length) {
        revealPara(paras[idx], function () {
          idx++;
          setTimeout(next, 120);
        });
      }
    }

    setTimeout(next, 400);

    // Grid audio toggle
    var audioBtn = document.getElementById('mandala-audio-btn');
    var audioVid = document.getElementById('mandala-compiled-vid');
    if (audioBtn && audioVid) {
      var audioCtx = null;
      var gainNode = null;
      var audioOn = false;

      audioBtn.addEventListener('click', function () {
        // First click: wire up Web Audio so video stays muted (autoplay safe)
        // but sound routes through a gain node we control
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          var source = audioCtx.createMediaElementSource(audioVid);
          gainNode = audioCtx.createGain();
          gainNode.gain.value = 0;
          source.connect(gainNode);
          gainNode.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        audioOn = !audioOn;
        gainNode.gain.setTargetAtTime(audioOn ? 1 : 0, audioCtx.currentTime, 0.05);
        audioBtn.classList.toggle('muted', !audioOn);
      });
    }

  });
</script>
