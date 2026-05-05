---
layout: project
permalink: /mind-your-feelings/
project_title: Mind Your Feelings
proj_num: "03"
tagline: >
  Mind Your Feelings is a participatory installation at the Johnson Public Library in Hackensack that visualizes the feelings of community members. The system combines a touchscreen interface with a responsive LED brain sculpture, allowing users to select emotions, map them onto the body, and see them come alive through light. Over 800 participants have experienced the installation, turning internal emotional states into shared, tangible moments of reflection.
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
refl_bg: "6.mindu/refl_bg.jpg"
reflection: >
  This was the first project where I had to connect physical hardware to a live software system in a public space. The Arduino brain needed to respond to user input within milliseconds or the experience would feel broken. Getting the Python backend to reliably bridge the web interface to the WLED controller took more debugging than I expected, but once it worked it felt like magic.


  What surprised me was how quickly strangers opened up when given a space that felt safe. People were not looking for the right answer, they just wanted to be seen. 800 participants in five months, and the data we collected is now being used by local mental health organizations to better understand community wellbeing.
next_project:
  title: Broken and Beautiful
  url: /b-plus-b/
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
  .cs-grid + .cs-bleed, .cs-bleed + .cs-grid { margin-top: 16px !important; }

  /* Caption attachment matches cube-guy globals */
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

  /* Gentle sway for brain */
  .brain-sway {
    animation: projBreathe 8s ease-in-out infinite;
    max-width: 350px;
    width: 50%;
    height: auto;
    object-fit: contain;
    position: relative;
    z-index: 1;
  }
  @keyframes projBreathe {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.008) translateY(-3px); }
  }

  /* Color blobs behind brain */
  .brain-wrap {
    position: relative;
    text-align: center;
    display: flex;
    justify-content: center;
    padding: 40px 0;
    margin-top: 40px;
  }
  .brain-wrap::before {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    top: 50%; left: 40%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(140,80,220,0.15) 0%, transparent 70%);
    filter: blur(60px);
    pointer-events: none;
  }
  .brain-wrap::after {
    content: '';
    position: absolute;
    width: 250px; height: 250px;
    top: 45%; left: 60%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(60,180,220,0.12) 0%, transparent 70%);
    filter: blur(50px);
    pointer-events: none;
  }
</style>

<!-- HERO -->
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="auto">
      <source src="{{ site.baseurl }}/6.mindu/0.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/6.mindu/0.2.webp" alt="Mind Your Feelings" loading="eager" />
  </div>
</div>

<div class="brain-wrap">
  <img src="{{ site.baseurl }}/6.mindu/1.webp" alt="LED Brain" class="brain-sway" />
</div>

<p class="cube-cap cube-cap--above"><em>Our supporters.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/2.0.png" alt="Supporters" loading="lazy" />
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/6.mindu/2.1.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/3.png" alt="Mind Your Feelings" loading="lazy" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/5.png" alt="Mind Your Feelings" loading="lazy" />
</div>

<p class="cube-cap cube-cap--above"><em>Walkthrough of the kiosk.</em></p>
<div class="cs-bleed">
  <video src="{{ site.baseurl }}/6.mindu/kiosk1.mp4" muted loop playsinline autoplay preload="metadata" aria-label="Walkthrough of the Mind Your Feelings kiosk"></video>
</div>

<p class="cube-cap cube-cap--above"><em>The color of the emotion you draw is sent to the brain — and the brain lights up in that color.</em></p>
<div class="cs-bleed">
  <video src="{{ site.baseurl }}/6.mindu/kiosk2.mp4" muted loop playsinline autoplay preload="metadata" aria-label="Color of the drawn emotion sent to the brain"></video>
</div>

<div class="cs-bleed">
  <video src="{{ site.baseurl }}/6.mindu/kiosk3.mp4" muted loop playsinline autoplay preload="metadata" aria-label="Mind Your Feelings kiosk in use"></video>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/6.png" alt="Mind Your Feelings" loading="lazy" />
</div>

<div class="cs-grid">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/6.mindu/7.1.png" alt="Mind Your Feelings" loading="lazy" /></div>
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/6.mindu/7.2.png" alt="Mind Your Feelings" loading="lazy" /></div>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/6.mindu/gg.png" alt="Mind Your Feelings" loading="lazy" />
</div>
