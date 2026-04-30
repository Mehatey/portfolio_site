---
layout: project
permalink: /b-plus-b/
project_title: Broken and Beautiful
proj_num: "05"
tagline: "A public interaction project inspired by the Strangers Project. After hours reading anonymous thoughts there, I wanted to recreate that sense of shared emotion by asking one simple question: what feels beautiful, and what feels broken."
category: Research · Public Art
year: 2024
hero_bg: "radial-gradient(ellipse at 70% 40%, #1a0d0d 0%, #0d0505 50%, #030101 100%)"
hero_video: "5.bb/d8.mp4"
meta:
  - label: Role
    value: Solo
  - label: Year
    value: "2024"
  - label: Tools
    value: Vercel · Backend · Web Interface
  - label: Client
    value: Self Initiated
  - label: Watch Experience
    url: "https://www.youtube.com/watch?v=zUG-hui0tkw"
reflection: >
  What stayed with me was how quickly strangers opened up when given a space that felt safe and shared. People weren't looking for perfect words, they just wanted to be heard. Reading others' responses seemed to matter as much as writing their own, almost like realizing their thoughts weren't isolated.

  The design didn't need to do much. The simplest structure worked best, and anything more would have gotten in the way.
refl_bg: "5.bb/board2.2.mp4"
next_project:
  title: Mool
  url: /mool/
---

<style>
  .cs-bleed { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-bleed img, .cs-bleed video { object-fit: contain !important; height: auto !important; }
  .cs-bleed::before { display: none !important; }
  .cs-grid-item { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-grid-item img, .cs-grid-item video { object-fit: cover !important; height: 100% !important; }
  .cs-grid::before { display: none !important; }
  .cs-grid-item::before { display: none !important; }
  .cs-grid { gap: 16px !important; align-items: stretch !important; padding: 0 !important; }
  .cs-bleed { margin-top: 40px !important; }
  .cs-bleed + .cs-bleed { margin-top: 16px !important; }
  .cs-grid { margin-top: 40px !important; }
  .cs-grid + .cs-bleed, .cs-bleed + .cs-grid, .cs-grid + .cs-grid { margin-top: 16px !important; }

  /* Caption attachment to cube-guy globals */
  .cube-cap { margin: 40px 0 0; }
  .cube-cap + .cs-bleed, .cube-cap + .cs-grid { margin-top: 8px !important; }
  .cube-cap--above + .cs-bleed, .cube-cap--above + .cs-grid { margin-top: 12px !important; }

  /* Grid sizing matches cube-guy */
  .cs-grid {
    height: clamp(320px, 50vh, 560px);
    grid-template-rows: 1fr;
  }
  .cs-grid-item { height: 100% !important; min-height: 0; overflow: hidden !important; }
  .cs-grid-item img, .cs-grid-item video {
    width: 100%; height: 100%;
    object-fit: cover !important;
    object-position: center center;
  }

  /* Interview videos — wrapper, name tag, audio toggle */
  .interview-wrap { position: relative; }
  .interview-name {
    position: absolute;
    bottom: 14px; left: 14px;
    z-index: 10;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.92);
    background: rgba(0,0,0,0.55);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    padding: 6px 10px;
  }
  .interview-audio {
    position: absolute;
    bottom: 14px; right: 14px;
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
  .interview-audio:hover {
    border-color: rgba(255,255,255,0.65);
    background: rgba(0,0,0,0.75);
  }
  .interview-audio svg { width: 14px; height: 14px; fill: rgba(255,255,255,0.85); }
  .interview-audio.is-muted .icon-sound { display: none; }
  .interview-audio:not(.is-muted) .icon-muted { display: none; }

  /* Process link bar matches cube-guy pattern */
  .bb-process-link-bar {
    display: flex;
    gap: 0;
    margin: 40px var(--gutter) 0;
    border-top: 1px solid rgba(255,255,255,0.07);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .bb-process-link-bar a {
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
  .bb-process-link-bar a:hover { color: rgba(255,255,255,0.88); }

  @keyframes projBreathe {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.008) translateY(-3px); }
  }
</style>

<!-- INSIGHT -->
<div class="cs-intro">
  <div class="cs-body--insight">
    <span class="insight-label">Insight</span>
    <p>285+ responses. 15 street interviews. A quiet thread of human thoughts, gathered in parks and on phones across New York City.</p>
  </div>
</div>

<!-- HERO -->
<div class="cs-bleed-full">
  <video autoplay muted loop playsinline preload="auto">
    <source src="{{ site.baseurl }}/5.bb/d8.mp4" type="video/mp4" />
  </video>
</div>

<!-- SECTION: THE STAND -->
<div class="cs-section">
  <span class="cs-section-label">The Stand</span>
</div>

<p class="cube-cap cube-cap--above"><em>A Reddit thread titled "places to cry in NYC." People looking for somewhere to feel something without being seen.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.bb/2.png" alt="Reddit thread: places to cry in NYC" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.bb/3.png" alt="Research references" />
</div>

<p class="cube-cap cube-cap--above">
  <em>What I wanted the space to feel like: quiet enough to think, open enough not to feel alone.</em>
</p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.bb/4.png" alt="Space reference: what it should feel like" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.bb/5.png" alt="Process" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.bb/6.png" alt="Process" />
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/5.bb/1.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/5.bb/1.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<p class="cube-cap cube-cap--above"><em>A stop sign already means something. Redeployed not as a warning, but as an invitation.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/5.bb/board1.2.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/5.bb/board1.3.png" alt="The stand" />
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/5.bb/board2.1.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above">
  <em>Moment of truth. Union Square Park.</em>
</p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/5.bb/board2.2.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/5.bb/board3.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/5.bb/board4.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/5.bb/board5.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/5.bb/board6.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/5.bb/board7.mp4" type="video/mp4" />
  </video>
</div>

<div class="bb-process-link-bar">
  <a href="https://www.youtube.com/watch?v=zUG-hui0tkw" target="_blank" rel="noopener">View Full Process ↗</a>
</div>

<!-- SECTION: THE SITE -->
<div class="cs-section">
  <span class="cs-section-label">The Site</span>
</div>

<p class="cube-cap cube-cap--above"><em>I had an idea to create an online, Reddit-like site to store stories.</em></p>

<div class="cs-bleed-full">
  <img src="{{ site.baseurl }}/5.bb/branding.png" alt="Broken and Beautiful branding" />
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/5.bb/d1.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/5.bb/d2.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above">
  <em>Made different versions of the poster, each one a small bet on which stranger might stop long enough to scan.</em>
</p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.bb/d3.png" alt="QR code poster variations" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.bb/d4.png" alt="Poster variations" />
</div>

<p class="cube-cap cube-cap--above">
  <em>Responses coming in through the site. People writing what felt broken and what felt beautiful about the world.</em>
</p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/5.bb/d5.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above">
  <em>Union Square subway.</em>
</p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/5.bb/d6.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/5.bb/d6.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<p class="cube-cap cube-cap--above"><em>Words people kept using, given visual shape. Not illustrating, just looking.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/5.bb/d7.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/5.bb/d7.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<p class="cube-cap cube-cap--above"><em>An image of what we carry without knowing others carry it too.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/5.bb/d8.mp4" type="video/mp4" />
  </video>
</div>

<!-- SECTION: STREET INTERVIEWS -->
<div class="cs-section">
  <span class="cs-section-label">Street Interviews</span>
</div>

<p class="cube-cap cube-cap--above"><em>Fifteen strangers. One question. Here are four of them.</em></p>
<div class="cs-bleed interview-wrap">
  <video id="int-russell" autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/5.bb/russell.mp4" type="video/mp4" />
  </video>
  <button class="interview-audio is-muted" id="btn-russell" aria-label="Toggle audio">
    <svg class="icon-sound" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.49 4.49 0 002.5-3.5zM14 3.23v2.06a6.51 6.51 0 010 13.42v2.06A8.51 8.51 0 0014 3.23z"/></svg>
    <svg class="icon-muted" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13 3l3.6-3.6-1.4-1.4L15 10.2l-3.2-3.2-1.4 1.4L13.8 12l-3.4 3.4 1.4 1.4L15 13.6l3.2 3.2 1.4-1.4L16.2 12z"/></svg>
  </button>
  <span class="interview-name">Russell</span>
</div>

<div class="cs-grid">
  <div class="cs-grid-item interview-wrap">
    <video id="int-john" autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/5.bb/john.mp4" type="video/mp4" />
    </video>
    <button class="interview-audio is-muted" id="btn-john" aria-label="Toggle audio">
      <svg class="icon-sound" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.49 4.49 0 002.5-3.5zM14 3.23v2.06a6.51 6.51 0 010 13.42v2.06A8.51 8.51 0 0014 3.23z"/></svg>
      <svg class="icon-muted" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13 3l3.6-3.6-1.4-1.4L15 10.2l-3.2-3.2-1.4 1.4L13.8 12l-3.4 3.4 1.4 1.4L15 13.6l3.2 3.2 1.4-1.4L16.2 12z"/></svg>
    </button>
    <span class="interview-name">John</span>
  </div>
  <div class="cs-grid-item interview-wrap">
    <video id="int-karis" autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/5.bb/karis.mp4" type="video/mp4" />
    </video>
    <button class="interview-audio is-muted" id="btn-karis" aria-label="Toggle audio">
      <svg class="icon-sound" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.49 4.49 0 002.5-3.5zM14 3.23v2.06a6.51 6.51 0 010 13.42v2.06A8.51 8.51 0 0014 3.23z"/></svg>
      <svg class="icon-muted" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13 3l3.6-3.6-1.4-1.4L15 10.2l-3.2-3.2-1.4 1.4L13.8 12l-3.4 3.4 1.4 1.4L15 13.6l3.2 3.2 1.4-1.4L16.2 12z"/></svg>
    </button>
    <span class="interview-name">Karis</span>
  </div>
</div>

<div class="cs-bleed interview-wrap">
  <video id="int-tsing" autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/5.bb/tsing.mp4" type="video/mp4" />
  </video>
  <button class="interview-audio is-muted" id="btn-tsing" aria-label="Toggle audio">
    <svg class="icon-sound" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.49 4.49 0 002.5-3.5zM14 3.23v2.06a6.51 6.51 0 010 13.42v2.06A8.51 8.51 0 0014 3.23z"/></svg>
    <svg class="icon-muted" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13 3l3.6-3.6-1.4-1.4L15 10.2l-3.2-3.2-1.4 1.4L13.8 12l-3.4 3.4 1.4 1.4L15 13.6l3.2 3.2 1.4-1.4L16.2 12z"/></svg>
  </button>
  <span class="interview-name">Tsing</span>
</div>

<script>
  (function () {
    document.querySelectorAll(".interview-audio").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var vidId = btn.id.replace(/^btn-/, "int-");
        var vid = document.getElementById(vidId);
        if (!vid) return;
        vid.muted = !vid.muted;
        btn.classList.toggle("is-muted", vid.muted);
        if (!vid.muted) vid.play().catch(function () {});
      });
    });
  })();
</script>
