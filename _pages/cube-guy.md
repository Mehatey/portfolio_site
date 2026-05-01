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
  - label: Client
    value: Self Initiated
  - label: Role
    value: Director · Designer · Developer
  - label: Tools
    value: Unreal Engine
reflection: >
  The film was the first time it felt finished. Years of sketching finally became six minutes of something I could actually share, and that alone made it one of the most fulfilling things I had made.

  The game was harder. Building interactivity from scratch meant learning by breaking things. I lost versions, rebuilt sections, and came out understanding the work in a way I could not have otherwise. What surprised me most was how little the idea needed to change through all of it. The medium kept shifting. The character did not.
refl_bg: "2.cube/5.mp4"
next_project:
  title: AI Self
  url: /ai-self/
---

<style>
  .cs-bleed { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-bleed img { object-fit: contain !important; height: auto !important; }
  .cs-bleed::before { display: none !important; }
  .cs-grid-item { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-grid-item img, .cs-grid-item video { object-fit: contain !important; }
  .cs-grid::before { display: none !important; }
  .cs-grid-item::before { display: none !important; }
  .cs-grid { gap: 16px !important; align-items: stretch !important; padding: 0 !important; margin-left: 0 !important; margin-right: 0 !important; }
  .cs-grid-3 { padding: 0 !important; margin-left: 0 !important; margin-right: 0 !important; }
  .cs-bleed { margin-top: 40px !important; }
  .cs-bleed + .cs-bleed { margin-top: 16px !important; }
  .cs-grid { margin-top: 40px !important; }
  .cs-grid + .cs-bleed { margin-top: 16px !important; }
  .cs-bleed + .cs-grid { margin-top: 16px !important; }

  /* Section dividers use global template styling */

  /* Captions */
  .cube-cap { margin: 40px 0 0; }
  .cube-cap + .cs-bleed, .cube-cap + .cs-grid, .cube-cap + .cs-grid-3 { margin-top: 8px !important; }
  .cube-cap--above + .cs-bleed, .cube-cap--above + .cs-grid { margin-top: 12px !important; }

  /* Conception grids — fixed height, cover to fill, slow drift */
  .cs-grid, .cs-grid-3 {
    height: clamp(320px, 50vh, 560px);
    grid-template-rows: 1fr;
  }
  .cs-grid-3 {
    grid-template-columns: 1fr 1fr 1fr !important;
  }
  .cs-grid-item {
    height: 100% !important;
    min-height: 0;
    overflow: hidden !important;
  }
  .cs-grid-item img, .cs-grid-item video {
    width: 100%; height: 100%;
    object-fit: cover !important;
    object-position: center center;
  }

  /* Slow drift on conception grids */
  @keyframes driftLeft  { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-14px); } }
  @keyframes driftRight { 0%,100% { transform: translateX(0); } 50% { transform: translateX(14px); } }
  .cs-grid:not(.film-grid) .cs-grid-item:nth-child(1),
  .cs-grid-3 .cs-grid-item:nth-child(1) { animation: driftRight 9s ease-in-out infinite; }
  .cs-grid:not(.film-grid) .cs-grid-item:nth-child(2),
  .cs-grid-3 .cs-grid-item:nth-child(2) { animation: driftLeft 11s ease-in-out infinite; }
  .cs-grid-3 .cs-grid-item:nth-child(3) { animation: driftRight 7s ease-in-out infinite; }

  /* Film grids — tight stacking, no drift */
  .film-grid .cs-grid-item img, .film-grid .cs-grid-item video { object-fit: contain !important; object-position: center center !important; }
  .film-grid .cs-grid-item:nth-child(1), .film-grid .cs-grid-item:nth-child(2) { animation: none; }
  .film-grid--no-top { margin-top: 0 !important; }
  .cs-grid--left-heavy { grid-template-columns: 3fr 2fr; }

  @keyframes projBreathe {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.008) translateY(-3px); }
  }
</style>

<!-- 0 -->
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.cube/conception/0.png" alt="Cube of Creations — process work" style="object-fit: contain; animation: projBreathe 7s ease-in-out infinite;" loading="lazy" />
</div>

<!-- caption + 1 -->
<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>In my first year of college I began listening to a lot of music and it became a big part of my life. 11.2 km/sec is Earth's escape velocity</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.cube/conception/1.png" alt="Cube of Creations — process work" style="object-fit: contain;" loading="lazy" />
</div>

<!-- 2 -->
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.cube/conception/2.png" alt="Cube of Creations — process work" style="object-fit: contain;" loading="lazy" />
</div>

<!-- Ideating sketches label + 6.1 + 6.2 -->
<p class="cube-cap cube-cap--above"><em>Ideating sketches</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/6.1.png" alt="Cube of Creations — process work" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/6.2.png" alt="Cube of Creations — process work" loading="lazy" />
  </div>
</div>

<!-- 7.1 + 7.2 + 7.3 -->
<div class="cs-grid-3">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/7.1.png" alt="Cube of Creations — process work" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/7.2.png" alt="Cube of Creations — process work" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/7.3.jpg" alt="Cube of Creations — process work" loading="lazy" />
  </div>
</div>

<!-- 7.4 + 7.5 -->
<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/7.4.png" alt="Cube of Creations — process work" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/7.5.png" alt="Cube of Creations — process work" loading="lazy" />
  </div>
</div>

<!-- 8.1 + 8.2 + 8.3 -->
<div class="cs-grid-3">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/8.2.png" alt="Cube of Creations — process work" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata" style="object-fit: cover; object-position: top center;">
      <source src="{{ site.baseurl }}/2.cube/conception/8.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/8.3.png" alt="Cube of Creations — process work" loading="lazy" />
  </div>
</div>

<!-- 9 -->
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/conception/9.mp4" type="video/mp4" />
  </video>
</div>

<!-- 10.1 + 10.2 + 10.3 -->
<div class="cs-grid-3">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/10.1.png" alt="Cube of Creations — process work" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/conception/10.2.png" alt="Cube of Creations — process work" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/conception/10.3.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- SECTION: FILM -->
<div class="cs-section">
  <h2 class="cs-section-label">Film</h2>
</div>

<!-- FILM POSTER -->
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.cube/short%20film%20hd/0.png" alt="Squarube film poster" style="object-fit: contain;" loading="lazy" />
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
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/2.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/2.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- TEXT: leaves for Earth -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>He leaves. Comes to Earth searching for meaning. Finds three humans and follows them.</em></p>

<!-- 3.1 + 3.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/3.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/3.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- TEXT: six insights -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Each human gives him something. Six insights. Each one adds a side.</em></p>

<!-- 5.1 + 5.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/5.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/5.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 6.1 + 6.2 -->
<div class="cs-grid film-grid film-grid--no-top">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/6.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/6.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 7.1 + 7.2 -->
<div class="cs-grid film-grid film-grid--no-top">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/7.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/7.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 8.1 + 8.2 -->
<div class="cs-grid film-grid film-grid--no-top">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/8.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/8.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 9.1 + 9.2 -->
<div class="cs-grid film-grid film-grid--no-top">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/9.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/9.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 11.1 + 11.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/11.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/11.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 12.1 + 12.2 -->
<div class="cs-grid film-grid film-grid--no-top">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/12.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/12.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- TEXT: evolution -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Six sides complete. The square becomes a cube. A new dimension added to his life.</em></p>

<!-- 13 standalone -->
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/13.mp4" type="video/mp4" />
  </video>
</div>

<!-- CONCLUSION -->
<div class="cs-bleed-full">
  <video autoplay muted loop playsinline preload="metadata">
    <source src="{{ site.baseurl }}/2.cube/short%20film%20hd/1.mp4" type="video/mp4" />
  </video>
</div>

<!-- FILM LINK -->
<div style="display:flex;gap:0;margin:40px var(--gutter) 0;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);">
  <a href="https://www.youtube.com/watch?v=fl8L5V_pOUU" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.42);padding:16px 0;white-space:nowrap;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.88)'" onmouseout="this.style.color='rgba(255,255,255,0.42)'">Watch Full Film ↗</a>
</div>

<!-- SECTION: 2D GAME -->
<div class="cs-section">
  <h2 class="cs-section-label">2D Game</h2>
</div>

<!-- 2D: 1 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/2d/1.mp4" type="video/mp4" />
  </video>
</div>

<!-- 2D INTRO -->
<div class="cs-intro">
  <span class="intro-overview-label">2D Game · 2021</span>
  <div class="cs-body">
    <p>The character brought into an interactive world. A 2D platformer built from scratch, the same square from the film, now something you could actually play. Personalized to the player, populated with distractions, ending in a boss fight with Doubt itself.</p>
  </div>
</div>

<!-- TEXT: opening gameplay -->
<p class="cube-cap cube-cap--above" style="padding-top: 72px;"><em>The game in motion. The world the character walks through.</em></p>

<!-- 2.2 + 2.3 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/2d/2.2.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/2d/2.3.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- TEXT: drawings into character -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Sketches given motion. Flat drawings turned into a character you could actually play.</em></p>

<!-- 3.1 + 3.2 -->
<div class="cs-grid film-grid cs-grid--left-heavy">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/2d/3.1.png" alt="Cube of Creations — process work" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/2d/3.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 4 standalone -->
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/2d/4.mp4" type="video/mp4" />
  </video>
</div>

<!-- TEXT: personalised game -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Before it starts, it asks you who you are. Your answers shape the world you walk through.</em></p>

<!-- 5.1 + 5.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/2d/5.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/2d/5.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- TEXT: distractions given form -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Distractions given shape. The things that pull you off course become obstacles to dodge.</em></p>

<!-- 7.1 + 7.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/2d/7.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/2d/7.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 8 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/2d/8.mp4" type="video/mp4" />
  </video>
</div>

<!-- TEXT: familiar enemies -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The enemies borrowed from memory. Characters already lodged in the brain, now in your way.</em></p>

<!-- 9.1 -->
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/2d/9.1.mp4" type="video/mp4" />
  </video>
</div>

<!-- 10 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/2d/10.mp4" type="video/mp4" />
  </video>
</div>

<!-- TEXT: boss battle -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Clip from the boss battle. A fight with Doubt.</em></p>

<!-- 11 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/2d/11.mp4" type="video/mp4" />
  </video>
</div>

<!-- 12 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
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
  <h2 class="cs-section-label">3D Game</h2>
</div>

<!-- 3D: 0 opening bleed -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
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
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/1.mp4" type="video/mp4" />
  </video>
</div>

<!-- 2 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/2.mp4" type="video/mp4" />
  </video>
</div>

<!-- TEXT: world exploration -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Different worlds tried on. Mirror-like spaces and distorted geometry, looking for a place that felt like the inside of a mind.</em></p>

<!-- 3 + 3.1 grid -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/3d/3.png" alt="Cube of Creations — process work" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/2.cube/3d/3.1.png" alt="Cube of Creations — process work" loading="lazy" />
  </div>
</div>

<!-- TEXT: final scene -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The chosen scene. The one that stayed.</em></p>

<!-- 5 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/5.mp4" type="video/mp4" />
  </video>
</div>

<!-- TEXT: gameplay begins -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The game begins. Six years of a character, now something you can move through.</em></p>

<!-- 6 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/6.mp4" type="video/mp4" />
  </video>
</div>

<!-- 7 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/7.mp4" type="video/mp4" />
  </video>
</div>

<!-- 9.1 + 9.2 -->
<div class="cs-grid film-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/3d/9.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/3d/9.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 10.1 + 10.2 -->
<div class="cs-grid film-grid film-grid--no-top">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/3d/10.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="{{ site.baseurl }}/2.cube/3d/10.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 11 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/11.mp4" type="video/mp4" />
  </video>
</div>

<!-- 12 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/3d/12.mp4" type="video/mp4" />
  </video>
</div>

<!-- TEXT: inner child -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Congratulations. Your inner child has been found and integrated. The square became a cube. The cube found its world.</em></p>

<!-- 13 standalone -->
<div class="cs-bleed cs-bleed--no-fade">
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
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
  <video autoplay muted loop playsinline preload="metadata" style="width:100%;display:block;">
    <source src="{{ site.baseurl }}/2.cube/end%20of%20cube%20.mp4" type="video/mp4" />
  </video>
</div>

<!-- custom cursor removed -->
