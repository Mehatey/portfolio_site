---
layout: project
permalink: /mind-your-feelings/
project_title: Mind Your Feelings
proj_num: "02"
tagline: >
  Mind Your Feelings is a participatory installation at the Johnson Public Library in Hackensack that visualizes the feelings of community members. The system combines a touchscreen interface with a responsive LED brain sculpture, allowing users to select emotions, map them onto the body, and see them come alive through light. Over 800 participants have experienced the installation since December 2025, turning internal emotional states into shared, tangible moments of reflection.
category: Installation · Creative Tech
year: 2026
hero_bg: "radial-gradient(ellipse at 50% 50%, #1a0a2e 0%, #0d0518 50%, #030108 100%)"
hero_image: "6.mindu/cover 2.webp"
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
  /* Gentle sway rotation for brain */
  .brain-sway {
    animation: brainSway 8s ease-in-out infinite;
  }
  @keyframes brainSway {
    0%, 100% { transform: rotate(-15deg) scale(1); }
    50% { transform: rotate(15deg) scale(1.02); }
  }
  /* Caption matching cube-guy style */
  .myf-cap {
    font-family: var(--font-mono);
    font-size: 13px;
    color: rgba(255,255,255,0.42);
    padding: 0 var(--gutter) 8px;
    margin: 56px 0 12px;
    line-height: 1.5;
  }
</style>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="auto" src="{{ site.baseurl }}/6.mindu/0.1.mp4"></video>
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/6.mindu/0.2.webp" alt="Mind Your Feelings" loading="eager" />
  </div>
</div>

<div class="cs-bleed" style="text-align:center; display:flex; justify-content:center;">
  <img src="{{ site.baseurl }}/6.mindu/1.webp" alt="LED Brain" class="brain-sway" style="max-width:400px; width:60%; height:auto !important; object-fit:contain !important;" />
</div>

<p class="myf-cap">Our supporters</p>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/2.0.png" alt="Supporters" loading="lazy" />
</div>

<p class="myf-cap">Designing for a public kiosk meant working through multiple issues connecting Arduino to the web interface in real time.</p>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="auto" src="{{ site.baseurl }}/6.mindu/2.1.mp4"></video>
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/6.mindu/2.2.JPEG" alt="Installation" loading="lazy" />
  </div>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/3.png" alt="The Neural Landscape" loading="lazy" />
</div>

<p class="myf-cap">3D brain sculpture designed by Rodolfo Kusulas</p>

<div class="cs-grid">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/6.mindu/4.1.jpeg" alt="Brain hardware" loading="lazy" /></div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="auto" src="{{ site.baseurl }}/6.mindu/4.2.mp4"></video>
  </div>
</div>

<p class="myf-cap">The app user flow is simple and intuitive, guiding participants through emotion selection to visualization.</p>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/5.png" alt="UI flow" loading="lazy" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/6.png" alt="Interactions" loading="lazy" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/7.png" alt="System" loading="lazy" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/p1.png" alt="Installation" loading="lazy" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/p2.png" alt="Installation" loading="lazy" />
</div>
