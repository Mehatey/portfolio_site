---
layout: project
pillar: product
permalink: /alpha-stockathon/
project_title: Alpha Stockathon
proj_num: "14"
tagline: >
  Alpha Stockathon is a gamified desktop application that teaches the stock market through a pixel-art world. A character journeys to rescue a wizard, and each level introduces one concept: options, shorting, market cap. Players make decisions and face consequences inside a simulated market rather than reading about one.
category: UI · Gamification
year: 2021
hero_bg: "radial-gradient(ellipse at 55% 45%, #0d0d1a 0%, #07070d 50%, #020205 100%)"
hero_image: "10.alpha/cover.png"
meta:
  - label: Role
    value: Solo
  - label: Duration
    value: 3 days
  - label: Year
    value: 2021
  - label: Tools
    value: Figma · Pixel Art
  - label: Client
    value: Self Initiated
highlights:
  - value: 3 days
    label: research to prototype
  - value: Pixel art
    label: financial learning system
  - value: Solo
    label: product concept & UI
reflection: >
  Three days to understand the stock market and turn it into a game. I had to start teaching it before I'd finished learning it myself.

  Simplification is not dumbing down: every financial concept has a core mechanic, and finding that mechanic was the real design problem. Pixel art made commitment unavoidable. Each shape landed and stayed.
refl_bg: "10.alpha/reflection.jpg"
decisions:
  - choice: "Taught one concept per level and let the level be short"
    why: >
      Financial education fails by front-loading vocabulary. Each level isolates a single mechanic (a short, a call
      option, market cap) and ends as soon as the player has felt the consequence of using it, so the concept is
      learned as an outcome rather than memorised as a definition.
    tradeoff: >
      The concepts stay isolated. Real markets are these mechanics interacting, and nothing in the structure teaches
      how they compound, which is exactly where most people actually lose money.
  - choice: "Chose pixel art, and chose it partly because of the deadline"
    why: >
      A fixed grid and a fixed palette remove almost every open question: no illustration style to develop, no
      spacing debates, no fidelity creep. Inside three days that bought the time to actually design the game logic.
      The retro register also lowers the stakes of a subject most people find intimidating.
    tradeoff: >
      It caps the product. The aesthetic is charming at concept stage and would read as unserious to anyone deciding
      whether to trust it with a real portfolio, so this is not the visual direction it would ship with.
  - choice: "Simulated the market instead of wiring in real data"
    why: >
      Live feeds bring latency, licensing, and the risk of a lesson being contradicted by that day's actual
      movement. A simulated market can be authored (a level about shorting can guarantee the downturn it needs),
      and authorship is what teaching requires.
    tradeoff: >
      It teaches a market more legible than the real one. Everything in it is causal, and the most important thing
      about real markets is that a great deal of them is not.
next_steps: >
  Three days got this to a coherent prototype and no further. The honest next step is to put it in front of
  people who do not already know the concepts and find out how much survives, because I designed it while
  learning the material myself and I have no evidence that the mechanics teach what I believe they teach. After
  that, the compounding problem: the levels are correct in isolation, and it needs at least one that makes them
  interact.
next_project:
  title: Illustrations
  url: /illustrations/
---

<style>
  /* cs-bleed: natural-ratio for sparse photo-essay layout */
  .cs-bleed { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-bleed img { object-fit: contain !important; height: auto !important; }
  .cs-bleed::before { display: none !important; }

  /* cs-grid: fixed-height with cover crop, matches cube-guy */
  .cs-grid {
    margin-top: 40px !important;
    gap: 16px !important;
    padding: 0 !important;
    height: clamp(320px, 50vh, 560px);
    grid-template-rows: 1fr;
    align-items: stretch !important;
  }
  .cs-grid::before { display: none !important; }
  .cs-grid-item {
    aspect-ratio: auto !important;
    height: 100% !important;
    min-height: 0;
    overflow: hidden !important;
    background: transparent !important;
  }
  .cs-grid-item::before { display: none !important; }
  .cs-grid-item img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    object-position: center center;
    display: block;
  }

  /* Spacing rhythm */
  .cs-bleed { margin-top: 40px !important; }
  .cs-bleed + .cs-bleed { margin-top: 40px !important; }
  .cs-grid + .cs-bleed, .cs-bleed + .cs-grid { margin-top: 40px !important; }
  .cs-grid + .cs-grid { margin-top: 16px !important; }

  /* Caption attachment matches cube-guy globals */
  .cube-cap { margin: 40px 0 0; }
  .cube-cap + .cs-bleed, .cube-cap + .cs-grid { margin-top: 8px !important; }
  .cube-cap--above + .cs-bleed, .cube-cap--above + .cs-grid { margin-top: 12px !important; }

  @keyframes projBreathe {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.02) translateY(-6px); }
  }
</style>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/0.png" alt="Alpha Stockathon" loading="eager" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/1.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/2.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<p class="cube-cap cube-cap--above"><em>Brand positioning.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/3.1.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/3.2.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above"><em>Ideation for gamification.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/4.png" alt="Alpha Stockathon" loading="lazy" style="animation: projBreathe 7s ease-in-out infinite;" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/5.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/6.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<p class="cube-cap cube-cap--above"><em>Characters.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/7.png" alt="Alpha Stockathon" loading="lazy" style="animation: projBreathe 8s ease-in-out infinite;" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/8.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/9.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/10.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-grid">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/11.1.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/11.2.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/12.1.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/12.2.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/13.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-grid">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/17.1.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/17.2.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/18.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-grid">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/19.1.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/19.2.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/21.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/22.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/23.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-grid">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/24.1.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/24.2.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/25.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/26.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-grid">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/27.1.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/27.2.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/27.3.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/28.png" alt="Alpha Stockathon" loading="lazy" decoding="async" />
</div>

<div class="cs-grid">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/29.1.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/10.alpha/29.2.png" alt="Alpha Stockathon" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above"><em>Advertisement idea.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/10.alpha/30.png" alt="Alpha Stockathon" loading="lazy" style="animation: projBreathe 7s ease-in-out infinite;" decoding="async" />
</div>
