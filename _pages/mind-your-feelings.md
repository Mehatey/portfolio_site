---
layout: project
permalink: /mind-your-feelings/
project_title: Mind Your Feelings
proj_num: "02"
tagline: >
  Mind Your Feelings is a participatory installation at the Johnson Public Library in Hackensack that visualizes the feelings of community members. The system combines a touchscreen interface with a responsive LED brain sculpture, allowing users to select emotions, map them onto the body, and see them come alive through light. Over 800 participants have experienced the installation since December 2025, turning internal emotional states into shared, tangible moments of reflection.
category: Installation · Creative Tech
year: 2025–2026
hero_bg: "radial-gradient(ellipse at 50% 50%, #1a0a2e 0%, #0d0518 50%, #030108 100%)"
hero_image: "6.mindu/cover.webp"
meta:
  - label: Role
    value: Developer
  - label: Duration
    value: 1 month
  - label: Year
    value: 2026
  - label: Tools
    value: JavaScript · Python · Arduino · WLED
  - label: Team
    value: Juanli Carrión, Rodolfo Kusulas, Siddharth Mehta
  - label: Client
    value: Northern NJ Community Foundation · ArtsBergen
reflection: >
  This was the first project where I had to connect physical hardware to a live software system in a public space. The Arduino brain needed to respond to user input within milliseconds or the experience would feel broken. Getting the Python backend to reliably bridge the web interface to the WLED controller took more debugging than I expected, but once it worked it felt like magic.


  What surprised me was how quickly strangers opened up when given a space that felt safe. People were not looking for the right answer. They just wanted to be seen. Watching someone select an emotion, see it light up a brain sculpture, and then pause for a moment of recognition taught me something about what design can do when it steps out of a screen and into a room.


  800 participants in five months. The data we collected is now being used by local mental health organizations to better understand community wellbeing. That was never part of the original brief but it became the most meaningful outcome.
next_project:
  title: Mandalas
  url: /mandalas/
---

<style>
  .cs-bleed { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-bleed img, .cs-bleed video { object-fit: contain !important; height: auto !important; }
  .cs-bleed::before { display: none !important; }
  .cs-grid-item { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-grid-item img, .cs-grid-item video { object-fit: cover !important; height: 100% !important; }
  .cs-grid::before { display: none !important; }
  .cs-grid-item::before { display: none !important; }
  .cs-grid { gap: 16px !important; align-items: stretch !important; }
  .cs-bleed { margin-top: 56px !important; }
  .cs-grid { margin-top: 56px !important; }
  /* Slow rotation for 1.2 brain webp */
  .rotate-slow { animation: rotateSlow 20s linear infinite; }
  @keyframes rotateSlow { to { transform: rotate(360deg); } }
  /* Small caption above images */
  .img-caption {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-top: 56px;
    margin-bottom: 12px;
    padding: 0 var(--gutter);
  }
</style>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="auto" src="{{ site.baseurl }}/6.mindu/1.1.mp4"></video>
  </div>
  <div class="cs-grid-item" style="display:flex; align-items:center; justify-content:center; background:#111 !important;">
    <img src="{{ site.baseurl }}/6.mindu/1.2.webp" alt="LED Brain" class="rotate-slow" style="width:70%; height:auto !important; object-fit:contain !important;" />
  </div>
</div>

<p class="img-caption">Installation site · Johnson Public Library, Hackensack</p>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="auto" src="{{ site.baseurl }}/6.mindu/2.1.mp4" style="width:100%; display:block;"></video>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/2.2.JPEG" alt="Installation space" loading="lazy" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/3.png" alt="The Neural Landscape" loading="lazy" />
</div>

<p class="img-caption">Arduino 3D brain sculpture · Designed by Rodolfo Kusulas</p>

<div class="cs-grid">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/6.mindu/4.1.jpeg" alt="Brain hardware" loading="lazy" /></div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="auto" src="{{ site.baseurl }}/6.mindu/4.2.mp4"></video>
  </div>
</div>

<p class="img-caption">UI flow · Touchscreen kiosk interface</p>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/5.png" alt="UI flow" loading="lazy" />
</div>

<p class="img-caption">User interactions</p>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/6.png" alt="Interactions" loading="lazy" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/7.png" alt="System architecture" loading="lazy" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/8.jpeg" alt="Installation detail" loading="lazy" />
</div>
