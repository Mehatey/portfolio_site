---
layout: project
permalink: /mandalas/
project_title: Mandala
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
    padding: 56px var(--gutter) 0;
    gap: 16px;
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
    line-height: 1.6;
    color: rgba(255,255,255,0.68);
    max-width: 740px;
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
</style>

<!-- OVERVIEW -->
<div class="cs-intro">
  <span class="intro-overview-label">Overview</span>
  <div class="cs-body">
    <p>A meditation experience built around one question: who are you to you? Using real-time visuals generated in TouchDesigner and projected into a physical space, visitors were invited to sit with that question. The audio layered voices of Alan Watts and Terence McKenna alongside my own. Every design decision was about using technology to slow someone down rather than occupy them.</p>
  </div>
</div>

<div class="cs-bleed-full">
  <img src="{{ site.baseurl }}/4.mandala/1.png" alt="" loading="lazy" />
</div>

<!-- SECTION: CONCEPT -->
<div class="cs-section">
  <span class="cs-section-label">Concept</span>
</div>

<p class="cube-cap cube-cap--above"><em>In India, mandalas were made on festival floors in chalk and color, then walked over and dissolved. This project started from that memory.</em></p>
<div class="cs-bleed ai-contain">
  <img src="{{ site.baseurl }}/4.mandala/2.png" alt="" loading="lazy" />
</div>

<div class="cs-intro">
  <span class="intro-overview-label">Golden Record</span>
  <div class="cs-body">
    <p>In 1977 the Voyager probe carried a golden record into space. A selection of sounds, images, and music meant to say: this is who we are. The mandala started from the same question. If you had to compress yourself into a single document, what would it include? A brain scan. Your name in binary. Your voice. The ideas you keep returning to even when you cannot explain why.</p>
  </div>
</div>

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

<div class="cs-intro">
  <span class="intro-overview-label">Cosmic Spiral</span>
  <div class="cs-body">
    <p>The same geometry appears in a nautilus shell and in a galaxy. Every mandala pattern points outward from a center that was always already there. This piece traces that path, from two atoms to the cosmos, one layer at a time.</p>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/4.mp4" type="video/mp4" />
  </video>
</div>

<!-- SECTION: FIRST SPACE -->
<div class="cs-section">
  <span class="cs-section-label">First Space</span>
</div>

<div class="cs-intro">
  <span class="intro-overview-label">Set Design · 2025</span>
  <div class="cs-body">
    <p>The first version of the space. Photographs of myself and others on the walls, a guided audio to help people move inward, and a prompt to write something true about how they felt. The idea was to give people something to look at before they had to look inward.</p>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/5.1.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/4.mandala/5.2.png" alt="" loading="lazy" />
</div>

<div class="cs-intro">
  <span class="intro-overview-label">Reflection Forms</span>
  <div class="cs-body">
    <p>Writing without a prompt is harder than it sounds. Most people need a question to begin. The forms gave them that entry point, before and after, and the responses were the clearest sign the space was doing something.</p>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/6.1.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/4.mandala/6.2.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed ai-contain">
  <img src="{{ site.baseurl }}/4.mandala/7.png" alt="" loading="lazy" />
</div>
<p class="cube-cap" style="font-size: 11px;"><em>People settled into the space more than expected. Some sat for longer than the session asked for.</em></p>

<!-- SECTION: SECOND SPACE -->
<div class="cs-section">
  <span class="cs-section-label">Second Space</span>
</div>

<div class="cs-intro">
  <span class="intro-overview-label">The Lit Room</span>
  <div class="cs-body">
    <p>The second version. Brighter lighting, more reflective surfaces, mandalas bouncing between mirrors. People found it harder to sit still. The darkness in the first space had been doing more work than I realized. This version clarified what the design conditions actually needed to be.</p>
  </div>
</div>

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

<div class="m-watch-link">
  <a href="https://www.youtube.com/watch?v=PLACEHOLDER" target="_blank" rel="noopener">Watch Experience ↗</a>
</div>
