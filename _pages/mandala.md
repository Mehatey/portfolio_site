---
layout: project
permalink: /mandalas/
project_title: "Who are you, to you"
proj_num: "04"
tagline: An interactive installation built around one question. Generative mandalas, layered audio, and a darkened space designed to make room for reflection.
category: Installation · TouchDesigner
year: 2025
hero_bg: "radial-gradient(ellipse at 40% 60%, #160d24 0%, #080408 55%, #020102 100%)"
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
  This project made me realize how sensitive attention is to sensory balance. Some people chose to close their eyes and focus only on the audio, which showed me that immersion isn't about adding more, but knowing when to step back.


  It also worked far better in darker and seated settings, pushing me to think of design as shaping the conditions where reflection can actually happen.
next_project:
  title: B+b
  url: /b-plus-b/
---

<style>
  .cs-intro {
    opacity: 1 !important;
    transform: none !important;
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
  .cs-intro .cs-body {
    font-size: clamp(14px, 1.5vw, 20px);
    line-height: 1.75;
    color: rgba(255,255,255,0.68);
    max-width: 680px;
    margin: 0;
  }
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
  .cube-cap {
    font-family: var(--font-mono);
    font-size: 13px;
    color: rgba(255,255,255,0.42);
    padding: 8px var(--gutter) 0;
    margin: 0;
    line-height: 1.5;
  }
  .cube-cap em { font-style: italic; }
  .cube-cap--above { padding: 0 var(--gutter) 8px; }
  .cube-cap--above + .cs-grid { margin-top: 8px; }
  .cube-cap--above + .cs-bleed { margin-top: 8px; }
  .cube-cap--above + .cs-bleed-full { margin-top: 8px; }
  .cube-cap + .cs-bleed { margin-top: 16px; }
  .cs-bleed + .cs-bleed { margin-top: 16px; }
  .cs-grid + .cs-bleed { margin-top: 24px; }
  .cs-grid-3 {
    height: clamp(300px, 48vh, 560px);
    grid-template-rows: 1fr;
  }
  .ai-contain img,
  .ai-contain video { object-fit: contain !important; }
  .cs-section {
    padding: 80px var(--gutter) 32px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .cs-section::before {
    content: '';
    display: block;
    width: 0; height: 1px;
    background: rgba(255,255,255,0.18);
    flex-shrink: 0;
    transition: width 1s cubic-bezier(0.22, 1, 0.36, 1) 0.1s;
  }
  .cs-section.is-visible::before { width: 28px; }
  .cs-section-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.22);
    opacity: 0;
    transition: opacity 0.7s ease 0.55s;
  }
  .cs-section.is-visible .cs-section-label { opacity: 1; }
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
    font-size: clamp(14px, 1.5vw, 20px);
    line-height: 1.75;
    color: rgba(255,255,255,0.68);
    max-width: 680px;
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

<div class="cs-bleed-full">
  <img src="{{ site.baseurl }}/4.mandala/1.png" alt="" loading="lazy" />
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
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/4.mandala/9.2.png" alt="" loading="lazy" />
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

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/13.2.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/4.mandala/13.3.png" alt="" loading="lazy" />
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

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Sid's record. A brain scan, a name in binary, a voice, the ideas he keeps returning to. Inspired by the Voyager golden record.</em></p>
<div class="cs-grid-3">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/3.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/3.2.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/4.mandala/3.3.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<p class="cube-cap" style="padding-top: 8px;"><em>The cosmic spiral. The same geometry in a shell, a storm, a galaxy. From two atoms outward.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/4.mp4" type="video/mp4" />
  </video>
</div>

<!-- SECTION: WHAT GETS PEOPLE TO MEDITATE -->
<div class="cs-section">
  <span class="cs-section-label">What gets people to meditate</span>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/6.1.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed ai-contain">
  <img src="{{ site.baseurl }}/4.mandala/7.png" alt="" loading="lazy" />
</div>
<p class="cube-cap"><em>People settled into the space more than expected. Some sat for longer than the session asked for.</em></p>

<div class="m-watch-link">
  <a href="https://www.youtube.com/watch?v=PLACEHOLDER" target="_blank" rel="noopener">Watch Experience ↗</a>
</div>
