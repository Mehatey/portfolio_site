---
layout: project
permalink: /cube-guy/
project_title: Cube of Creations
proj_num: "01"
tagline: A character built since 2018. A square in an unfamiliar world, collecting insights, adding sides, becoming a cube.
category: Film · Game · Character
year: 2018–2025
hero_bg: "radial-gradient(ellipse at 35% 55%, #0d1a1a 0%, #060d0d 50%, #020505 100%)"
hero_image: "2.cube/cover.png"
meta:
  - label: Year
    value: "2018–2025"
    priority: dim
  - label: Client
    value: Self Initiated
    priority: secondary
  - label: Role
    value: Director · Designer · Developer
    priority: primary
  - label: Tools
    value: Unreal Engine
    priority: dim
reflection: >
  This project has been a six year journey rather than a single build. The film came first, and was one of the most fulfilling pieces I've made. It was the first time the character felt complete, taking years of sketches and ideas and turning them into something I could actually see and share.


  Coming back to it through the game was a very different challenge. It meant translating the same idea into systems and interaction, not just visuals. I had to learn how to build that from scratch, and the process was messy. I lost versions of the project, rebuilt large parts of it, and only then understood the importance of saving, structuring, and managing work properly.


  What stayed consistent through all of this was the character itself. Even as the medium changed, the idea held. This project is not just about a character or a game, but an ongoing body of work where each iteration adds another side to the cube, and in many ways, to me.
hide_overview: true
next_project:
  title: B + b
  url: /b-plus-b/
---

<style>
  /* ── KEYFRAMES ── */
  @keyframes trackIn {
    from { opacity: 0; letter-spacing: 0.04em; transform: translateY(6px); }
    to   { opacity: 1; letter-spacing: 0.18em; transform: translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lineGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  /* ── INTRO ── */
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
  /* Label: tracking expands as it fades in */
  .cs-intro .intro-overview-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    animation: trackIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
  }
  /* Body: slides up */
  .cs-intro .cs-body {
    font-size: clamp(14px, 1.5vw, 20px);
    line-height: 1.6;
    color: rgba(255,255,255,0.68);
    max-width: 740px;
    margin: 0;
    animation: fadeUp 1s cubic-bezier(0.22, 1, 0.36, 1) 0.38s both;
  }
  /* Insight block: line draws, then block slides up */
  .cs-intro .cs-body--insight {
    font-size: clamp(14px, 1.5vw, 20px);
    color: rgba(255,255,255,0.68);
    max-width: 740px;
    position: relative;
    margin-top: 24px;
    padding-top: 24px;
    animation: fadeUp 1s cubic-bezier(0.22, 1, 0.36, 1) 0.78s both;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  /* The divider line draws left-to-right just before the block appears */
  .cs-intro .cs-body--insight::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: rgba(255,255,255,0.07);
    transform-origin: left center;
    animation: lineGrow 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.6s both;
  }
  /* Insight label: tracks in after the block */
  .cs-intro .cs-body--insight .insight-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    animation: trackIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.9s both;
  }

  /* ── GRID SIZING ── */
  .cs-grid {
    height: clamp(360px, 60vh, 720px);
    grid-template-rows: 1fr;
  }
  .cs-grid--asymmetric {
    grid-template-columns: 2fr 3fr;
    height: clamp(360px, 60vh, 720px);
  }
  .cs-grid-3--equal {
    height: clamp(360px, 60vh, 720px);
    grid-template-rows: 1fr;
  }

  /* ── GRID ITEMS ── */
  .cs-grid-item {
    aspect-ratio: unset !important;
    height: 100%;
    min-height: 0;
    background: #000;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cs-grid-item img,
  .cs-grid-item video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center center;
    display: block;
    will-change: transform;
  }
  /* Edge alignment */
  .cs-grid .cs-grid-item:first-child img,
  .cs-grid .cs-grid-item:first-child video,
  .cs-grid-3 .cs-grid-item:first-child img,
  .cs-grid-3 .cs-grid-item:first-child video {
    object-position: left center;
  }
  .cs-grid .cs-grid-item:last-child img,
  .cs-grid .cs-grid-item:last-child video,
  .cs-grid-3 .cs-grid-item:last-child img,
  .cs-grid-3 .cs-grid-item:last-child video {
    object-position: right center;
  }
  /* Hover: brighten slightly */
  .cs-grid-item:hover img,
  .cs-grid-item:hover video {
    filter: brightness(1.12);
    transition: filter 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* ── SLOW DRIFT: conception grids only ── */
  @keyframes driftLeft  { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-16px); } }
  @keyframes driftRight { 0%,100% { transform: translateX(0); } 50% { transform: translateX(16px); } }

  .cs-grid:not(.film-grid) .cs-grid-item:nth-child(1),
  .cs-grid-3 .cs-grid-item:nth-child(1) {
    animation: driftRight 9s ease-in-out infinite;
  }
  .cs-grid:not(.film-grid) .cs-grid-item:nth-child(2),
  .cs-grid-3 .cs-grid-item:nth-child(2) {
    animation: driftLeft 11s ease-in-out infinite;
  }
  .cs-grid-3 .cs-grid-item:nth-child(3) {
    animation: driftRight 7s ease-in-out infinite;
  }


  /* ── IDEA BLOCK ── */
  .cs-idea {
    padding: 64px var(--gutter) 48px;
  }
  .cs-idea p {
    font-size: clamp(15px, 1.5vw, 19px);
    line-height: 1.8;
    color: rgba(255,255,255,0.38);
    font-style: normal;
    max-width: 560px;
    margin: 0;
  }

  /* ── CAPTIONS ── */
  .cube-cap {
    font-family: var(--font-mono);
    font-size: 13px;
    color: rgba(255,255,255,0.42);
    padding: 8px var(--gutter) 0;
    margin: 0;
    line-height: 1.5;
  }
  .cube-cap em {
    font-style: italic;
  }
  .cube-cap--center {
    text-align: center;
    padding: 16px var(--gutter) 0;
    max-width: 560px;
    margin: 0 auto;
  }
  .cube-cap--above {
    padding: 0 var(--gutter) 8px;
  }

  /* ── PROXIMITY: captions attach tight to the element they describe ── */
  .cube-cap--above + .cs-grid-3 {
    margin-top: 8px;
  }
  .cube-cap--above + .cs-grid {
    margin-top: 8px;
  }

  /* ── TIGHT STACK: no gap between paired grids in same set ── */
  .film-grid--no-top {
    margin-top: 0 !important;
  }

  /* ── ASYMMETRIC: left column heavier ── */
  .cs-grid--left-heavy {
    grid-template-columns: 3fr 2fr;
  }

  /* ── FILM/GAME GRIDS: no cropping ── */
  .film-grid .cs-grid-item video,
  .film-grid .cs-grid-item img {
    object-fit: contain !important;
    object-position: center center !important;
  }

  /* Tighter gap when a bleed follows a grid (e.g. 8.x→9, 10.x→10.3) */
  .cs-grid + .cs-bleed {
    margin-top: 24px;
  }
  /* Tight spacing around 1.png (0→1, caption→2) */
  .cs-bleed + .cs-bleed {
    margin-top: 16px;
  }
  .cube-cap + .cs-bleed {
    margin-top: 16px;
  }

  /* ── SECTION LABELS: line draws left-to-right, then label fades ── */
  .cs-section {
    padding: 80px var(--gutter) 32px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .cs-section::before {
    content: '';
    display: block;
    width: 0;
    height: 1px;
    background: rgba(255,255,255,0.18);
    flex-shrink: 0;
    transition: width 1s cubic-bezier(0.22, 1, 0.36, 1) 0.1s;
  }
  .cs-section.is-visible::before {
    width: 28px;
  }
  .cs-section-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.22);
    opacity: 0;
    transition: opacity 0.7s ease 0.55s;
  }
  .cs-section.is-visible .cs-section-label {
    opacity: 1;
  }
</style>

<!-- INTRO -->
<div class="cs-intro">
  <span class="intro-overview-label">Intro</span>
  <div class="cs-body">
    <p>A character I've been building since 2018. Developed across a short film, a 2D platform game, and a 3D world in Unreal Engine. A square in an unfamiliar world, collecting insights, adding a side with each one, slowly becoming a cube.</p>
  </div>
  <div class="cs-body cs-body--insight">
    <span class="insight-label">Insight</span>
    <p>What began as a simple character became a way for me to externalize my own fears, insecurities, and experiences. It turned into a kind of metaphor, a way of saying things indirectly, where the character carries what I cannot always articulate directly.</p>
  </div>
</div>

<!-- 0 -->
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.cube/conception/0.png" alt="" style="object-fit: contain;" />
</div>

<!-- caption + 1 -->
<p class="cube-cap" style="padding-top: 24px;"><em>In my first year of college I began listening to a lot of music and it became a big part of my life. 11.2 km/sec is Earth's escape velocity</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.cube/conception/1.png" alt="" style="object-fit: contain;" />
</div>

<!-- 2 -->
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.cube/conception/2.png" alt="" style="object-fit: contain;" />
</div>

<!-- Ideating sketches label + 6.1 + 6.2 -->
<p class="cube-cap cube-cap--above"><em>Ideating sketches</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/6.1.png" alt="" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/6.2.png" alt="" />
  </div>
</div>

<!-- 7.1 + 7.2 + 7.3 -->
<div class="cs-grid-3 cs-grid-3--equal">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/7.1.png" alt="" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/7.2.png" alt="" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/7.3.jpg" alt="" />
  </div>
</div>

<!-- 7.4 + 7.5 -->
<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/7.4.png" alt="" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/7.5.png" alt="" />
  </div>
</div>

<!-- 8.1 + 8.2 + 8.3 -->
<div class="cs-grid-3 cs-grid-3--equal">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="object-fit: cover; object-position: top center;">
      <source src="{{ site.baseurl }}/2.cube/conception/8.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/8.2.png" alt="" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/8.3.png" alt="" />
  </div>
</div>

<!-- 9 -->
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/conception/9.mp4" type="video/mp4" />
  </video>
</div>

<!-- 10.1 + 10.2 + 10.3 -->
<div class="cs-grid-3 cs-grid-3--equal">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/10.1.png" alt="" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/10.2.png" alt="" />
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/conception/10.3.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- SECTION: FILM -->
<div class="cs-section">
  <span class="cs-section-label">Film</span>
</div>

<!-- FILM POSTER -->
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.cube/short%20film%20hd/0.png" alt="Squarube film poster" style="object-fit: contain;" />
</div>

<!-- FILM INTRO -->
<div class="cs-intro">
  <span class="intro-overview-label">Short Film · 2022</span>
  <div class="cs-body">
    <p>Squarube. An alien square lands on Earth looking for purpose. He observes three humans, collects their insights, and adds a side with each one. Six minutes. The first time years of sketches became something you could actually watch.</p>
  </div>
</div>

<!-- TEXT: home planet -->
<p class="cube-cap cube-cap--above" style="padding-top: 72px;"><em>An alien square. Lives on a planet of two-dimensional beings. Flat, contained, known.</em></p>

<!-- 2.1 + 2.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/2.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/2.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- TEXT: leaves for Earth -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>He leaves. Comes to Earth searching for meaning. Finds three humans and follows them.</em></p>

<!-- 3.1 + 3.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/3.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/3.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- TEXT: six insights -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Each human gives him something. Six insights. Each one adds a side.</em></p>

<!-- 5.1 + 5.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/5.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/5.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 6.1 + 6.2 -->
<div class="cs-grid film-grid film-grid--no-top">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/6.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/6.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 7.1 + 7.2 -->
<div class="cs-grid film-grid film-grid--no-top">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/7.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/7.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 8.1 + 8.2 -->
<div class="cs-grid film-grid film-grid--no-top">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/8.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/8.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 9.1 + 9.2 -->
<div class="cs-grid film-grid film-grid--no-top">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/9.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/9.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 11.1 + 11.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/11.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/11.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 12.1 + 12.2 -->
<div class="cs-grid film-grid film-grid--no-top">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/12.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/12.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- TEXT: evolution -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Six sides complete. The square becomes a cube. A new dimension added to his life.</em></p>

<!-- 13 standalone -->
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/13.mp4" type="video/mp4" />
  </video>
</div>

<!-- CONCLUSION -->
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/1.mp4" type="video/mp4" />
  </video>
</div>

<!-- FILM LINK -->
<div style="display:flex;gap:0;margin:40px var(--gutter) 0;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);">
  <a href="https://www.youtube.com/watch?v=fl8L5V_pOUU" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.42);padding:16px 0;white-space:nowrap;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.88)'" onmouseout="this.style.color='rgba(255,255,255,0.42)'">Watch Full Film ↗</a>
</div>

<!-- SECTION: 2D GAME -->
<div class="cs-section">
  <span class="cs-section-label">2D Game</span>
</div>

<!-- 2D: 1 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/2d/1.mp4" type="video/mp4" />
  </video>
</div>

<!-- 2D INTRO -->
<div class="cs-intro">
  <span class="intro-overview-label">2D Game · 2021</span>
  <div class="cs-body">
    <p>The character brought into an interactive world. A 2D platformer built from scratch, the same square from the film, now something you could actually play. Personalised to the player, populated with distractions, ending in a boss fight with Doubt itself.</p>
  </div>
</div>

<!-- TEXT: opening gameplay -->
<p class="cube-cap cube-cap--above" style="padding-top: 72px;"><em>The game in motion. The world the character walks through.</em></p>

<!-- 2.2 + 2.3 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/2d/2.2.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/2d/2.3.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- TEXT: drawings into character -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Sketches given motion. Flat drawings turned into a character you could actually play.</em></p>

<!-- 3.1 + 3.2 -->
<div class="cs-grid film-grid cs-grid--left-heavy">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/2d/3.1.png" alt="" />
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/2d/3.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 4 standalone -->
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/2d/4.mp4" type="video/mp4" />
  </video>
</div>

<!-- TEXT: personalised game -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Before it starts, it asks you who you are. Your answers shape the world you walk through.</em></p>

<!-- 5.1 + 5.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/2d/5.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/2d/5.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- TEXT: distractions given form -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Distractions given shape. The things that pull you off course become obstacles to dodge.</em></p>

<!-- 7.1 + 7.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/2d/7.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/2d/7.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 8 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/2d/8.mp4" type="video/mp4" />
  </video>
</div>

<!-- TEXT: familiar enemies -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The enemies borrowed from memory. Characters already lodged in the brain, now in your way.</em></p>

<!-- 9.1 + 9.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/2d/9.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/2d/9.2.png" alt="" />
  </div>
</div>

<!-- 10 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/2d/10.mp4" type="video/mp4" />
  </video>
</div>

<!-- TEXT: boss battle -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Clip from the boss battle. A fight with Doubt.</em></p>

<!-- 11 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/2d/11.mp4" type="video/mp4" />
  </video>
</div>

<!-- 12 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/2d/12.mp4" type="video/mp4" />
  </video>
</div>

<!-- 2D GAME LINKS -->
<div style="display:flex;gap:0;margin:40px var(--gutter) 0;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);">
  <a href="https://mehatey.github.io/game_final/" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.42);padding:16px 28px 16px 0;margin-right:28px;border-right:1px solid rgba(255,255,255,0.07);white-space:nowrap;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.88)'" onmouseout="this.style.color='rgba(255,255,255,0.42)'">Play Game ↗</a>
  <a href="https://github.com/Mehatey/game_final" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.42);padding:16px 0;white-space:nowrap;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.88)'" onmouseout="this.style.color='rgba(255,255,255,0.42)'">GitHub ↗</a>
</div>

<!-- SECTION: 3D GAME -->
<div class="cs-section">
  <span class="cs-section-label">3D Game</span>
</div>

<!-- 3D: 0 opening bleed -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/0.mp4" type="video/mp4" />
  </video>
</div>

<!-- 3D INTRO -->
<div class="cs-intro">
  <span class="intro-overview-label">3D Game · 2024</span>
  <div class="cs-body">
    <p>The same character, now fully three-dimensional. Built in Unreal Engine. What started as a sketch on paper had become a film, then a 2D game, and now a world you could actually walk through.</p>
  </div>
</div>

<!-- TEXT: character goes 3D -->
<p class="cube-cap cube-cap--above" style="padding-top: 72px;"><em>The flat drawings taken into a new dimension. The character rebuilt in Meshy AI, given volume, weight, and shadow for the first time.</em></p>

<!-- 1 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/1.mp4" type="video/mp4" />
  </video>
</div>

<!-- 2 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/2.mp4" type="video/mp4" />
  </video>
</div>

<!-- TEXT: world exploration -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Different worlds tried on. Mirror-like spaces and distorted geometry, looking for a place that felt like the inside of a mind.</em></p>

<!-- 3 + 3.1 grid -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/3d/3.png" alt="" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/3d/3.1.png" alt="" />
  </div>
</div>

<!-- TEXT: final scene -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The chosen scene. The one that stayed.</em></p>

<!-- 5 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/5.mp4" type="video/mp4" />
  </video>
</div>

<!-- TEXT: gameplay begins -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The game begins. Six years of a character, now something you can move through.</em></p>

<!-- 6 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/6.mp4" type="video/mp4" />
  </video>
</div>

<!-- 7 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/7.mp4" type="video/mp4" />
  </video>
</div>

<!-- 8 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/8.mp4" type="video/mp4" />
  </video>
</div>

<!-- 9.1 + 9.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/3d/9.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/3d/9.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 10.1 + 10.2 -->
<div class="cs-grid film-grid film-grid--no-top">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/3d/10.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.cube/3d/10.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 11 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/11.mp4" type="video/mp4" />
  </video>
</div>

<!-- 12 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/12.mp4" type="video/mp4" />
  </video>
</div>

<!-- TEXT: inner child -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Congratulations. Your inner child has been found and integrated. The square became a cube. The cube found its world.</em></p>

<!-- 13 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/13.mp4" type="video/mp4" />
  </video>
</div>

<!-- 3D GAME LINK -->
<div style="display:flex;gap:0;margin:40px var(--gutter) 0;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);">
  <a href="https://www.youtube.com/watch?v=2q1UYA1BzR0" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.42);padding:16px 0;white-space:nowrap;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.88)'" onmouseout="this.style.color='rgba(255,255,255,0.42)'">Watch Walkthrough ↗</a>
</div>

<!-- END OF CUBE -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Meh thanks you for staying till the end.</em></p>
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="none" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/end%20of%20cube%20.mp4" type="video/mp4" />
  </video>
</div>

<script>
  (function () {
    var extras = document.querySelectorAll('.cs-section');
    if (!extras.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    extras.forEach(function (el) { io.observe(el); });
  })();
</script>
