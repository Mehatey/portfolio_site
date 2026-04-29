---
layout: project
permalink: /b-plus-b/
project_title: Broken and Beautiful
proj_num: "05"
tagline: "A public interaction project asking one question: what feels beautiful and what feels broken."
category: Research · Public Art
year: 2024
hero_bg: "radial-gradient(ellipse at 70% 40%, #1a0d0d 0%, #0d0505 50%, #030101 100%)"
hero_image: "5.bb/cover.png"
meta:
  - label: Role
    value: Solo
    priority: secondary
  - label: Year
    value: "2024"
    priority: dim
  - label: Tools
    value: Vercel · Backend · Web Interface
    priority: dim
  - label: Client
    value: Self Initiated
    priority: dim
  - label: Watch Experience
    url: "https://www.youtube.com/watch?v=zUG-hui0tkw"
    priority: cta
hide_overview: true
reflection: >
  What stayed with me was how quickly strangers opened up when given a space that felt safe and shared. People weren't looking for perfect words, they just wanted to be heard. Reading others' responses seemed to matter as much as writing their own, almost like realizing their thoughts weren't isolated.

  The design didn't need to do much. The simplest structure worked best, and anything more would have gotten in the way.
next_project:
  title: ENCODED
  url: /encoded/
---

<style>
  .cs-intro {
    padding: 56px var(--gutter) 0;
    gap: 16px;
  }
  .cs-intro .cs-body,
  .cs-intro .cs-body--insight {
    font-size: clamp(16px, 1.8vw, 26px);
    max-width: min(860px, 68vw);
  }
  .cs-grid {
    height: clamp(360px, 60vh, 720px);
    grid-template-rows: 1fr;
  }
  .cs-grid-3 {
    height: clamp(300px, 48vh, 560px);
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
  .bb-process-link {
    display: block;
    padding: 32px var(--gutter);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
    text-decoration: none;
    transition: color 0.2s;
  }
  .bb-process-link:hover {
    color: rgba(255, 255, 255, 0.7);
  }

  @keyframes projBreathe {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.008) translateY(-3px); }
  }
  /* ── INTERVIEW VIDEOS ── */
  .interview-wrap {
    position: relative;
  }
  .interview-audio {
    position: absolute;
    bottom: 20px;
    right: calc(var(--gutter) + 4px);
    z-index: 10;
    background: rgba(0, 0, 0, 0.52);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 0.65);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: none;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition:
      border-color 0.2s,
      color 0.2s;
  }
  .interview-audio:hover {
    border-color: rgba(255, 255, 255, 0.5);
    color: #fff;
  }
  .interview-audio svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
  .interview-audio .icon-sound { display: block; }
  .interview-audio .icon-muted { display: none; }
  .interview-audio.is-muted .icon-sound { display: none; }
  .interview-audio.is-muted .icon-muted { display: block; }
  .cs-grid-item .interview-audio {
    right: 12px;
    bottom: 12px;
  }
  .interview-name {
    position: absolute;
    bottom: 20px;
    left: var(--gutter);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.32);
    padding: 0;
    margin: 0;
    pointer-events: none;
  }
  .cs-grid-item .interview-name {
    left: 12px;
    bottom: 12px;
  }
</style>

<!-- OVERVIEW -->
<div class="cs-intro">
  <div class="intro-inner">
    <span class="intro-overview-label">Overview</span>
    <div class="cs-body">
      <p>A public interaction project inspired by the Strangers Project. After spending hours reading anonymous thoughts there, I wanted to recreate that sense of shared emotion by asking one simple question: what feels beautiful, and what feels broken.</p>
    </div>
    <div class="cs-body--insight">
      <p>285+ responses. 15 street interviews. A quiet thread of human thoughts, gathered in parks and on phones across New York City.</p>
    </div>
  </div>
</div>

<!-- HERO -->
<div class="cs-bleed-full">
  <img src="{{ site.baseurl }}/5.bb/cover.png" alt="Broken and Beautiful" style="animation: projBreathe 7s ease-in-out infinite;" />
</div>

<!-- SECTION: THE STAND -->
<div class="cs-section">
  <div class="cs-section-label">The Stand</div>
</div>

<p class="cube-cap cube-cap--above">
  <em>I found a Reddit thread titled "places to cry in NYC" and kept reading it for longer than I expected. People weren't being dramatic. They were just looking for somewhere to feel something without being seen.</em>
</p>
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

<p class="cube-cap cube-cap--above">
  <em>I found a stop sign and decided to use it. A sign that already means something in the world. Stop, pause, pay attention. Redeployed not as a warning but as an invitation.</em>
</p>
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

<a href="https://www.youtube.com/watch?v=zUG-hui0tkw" target="_blank" rel="noopener" class="bb-process-link">View Full Process ↗</a>

<!-- SECTION: THE SITE -->
<div class="cs-section">
  <div class="cs-section-label">The Site</div>
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

<p class="cube-cap cube-cap--above">
  <em>I pulled the words people kept using and let them take shape visually. Not illustrating them, just seeing what they looked like when you stopped reading and started looking.</em>
</p>
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

<p class="cube-cap cube-cap--above">
  <em>A concept for taking those same words further. Not a poster, not a site, but an image of what we carry without knowing others carry it too.</em>
</p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/5.bb/d8.mp4" type="video/mp4" />
  </video>
</div>

<!-- SECTION: STREET INTERVIEWS -->
<div class="cs-section">
  <div class="cs-section-label">Street Interviews</div>
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
    var pairs = [
      ["btn-russell", "int-russell"],
      ["btn-john", "int-john"],
      ["btn-karis", "int-karis"],
      ["btn-tsing", "int-tsing"],
    ];
    pairs.forEach(function (pair) {
      var btn = document.getElementById(pair[0]);
      var vid = document.getElementById(pair[1]);
      if (!btn || !vid) return;
      btn.addEventListener("click", function () {
        // Mute all other interview videos first
        pairs.forEach(function (other) {
          if (other[0] !== pair[0]) {
            var ov = document.getElementById(other[1]);
            var ob = document.getElementById(other[0]);
            if (ov) ov.muted = true;
            if (ob) ob.classList.add("is-muted");
          }
        });
        vid.muted = !vid.muted;
        btn.classList.toggle("is-muted", vid.muted);
      });
    });
  })();
</script>
