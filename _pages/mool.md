---
layout: project
pillar: product
permalink: /mool/
project_title: Mool
proj_num: "06"
tagline: >
  The majority of Indians deserve a better shot at money and a source that empowers them with the opportunities they truly need. Mool was built to be that source. A neo banking platform designed for underserved communities across India, blending the visual richness of Indian folk art, traditional motifs, and regional patterns with the precision and trust that financial tools demand. The challenge was making a banking app that doesn't just work, but feels like it belongs to the people using it.
category: UI · Fintech
year: 2021
hero_bg: "radial-gradient(ellipse at 50% 40%, #1a237e 0%, #0d1442 50%, #050818 100%)"
hero_image: "5.mool/cover.jpg"
og_image: "assets/img/og/mool.jpg"
award_badge: "Kyoorius Design Award 2021"
award_image: "assets/img/badge_kyoorius.png"
meta:
  - label: Role
    value: Visual Designer
  - label: Duration
    value: 6 months
  - label: Year
    value: 2021
  - label: Tools
    value: Figma
  - label: Team
    value: Leaf Design Studio
  - label: Case Study
    value: View on Leaf Design
    url: https://www.leafdesign.co/work/mool
highlights:
  - value: "100k+"
    label: downloads
  - value: "6 months"
    label: design timeline
  - value: Kyoorius
    label: Design Award · 2021
quick_read: >
  Led visual design for a neo-banking product that made everyday financial tools feel familiar and trustworthy for underserved communities across India.
refl_bg: "5.mool/reflection.png"
reflection: >
  Before Mool I thought accessible meant simpler. This project taught me it really means resonant. People trust an app not because it looks clean but because it feels like it was made by someone who understands their world. We studied Indian folk art, regional patterns, and traditional color palettes not as decoration but as signals of belonging.


  Every visual decision was tested against one question: does this make someone from a small town feel like this was built for them. Clarity is emotional, not just functional. A user who feels seen will trust you with their money.
decisions:
  - choice: "Built the folk-art vocabulary into the system, not onto it"
    why: >
      Every fintech product aimed at this audience looked like a Western banking app that had been translated. The
      visual language itself said the product came from somewhere else. Regional motifs went into the illustration
      set, the empty states and the transaction confirmations, so the ornament carried meaning about belonging
      rather than sitting on top of a neutral layout as decoration.
    tradeoff: >
      It made the design system slow to extend. A new screen could not be assembled from generic components.
      Someone had to decide which regional vocabulary it belonged to, and that decision needed a person who knew the
      reference.
  - choice: "Kept the numbers plain while the rest of the interface stayed rich"
    why: >
      Trust in a banking app is won or lost at the balance. Whatever richness the surrounding screen carried,
      amounts, dates and account numbers stayed in one neutral face at high contrast with tabular figures, so
      nothing about the styling could be misread as a flourish placed over someone's money.
    tradeoff: >
      The two voices share a screen, and on the dense views (statements, full transaction history) the split reads
      as unresolved rather than deliberate. It is the part of the system I would rebuild first.
  - choice: "Designed for a first-time smartphone user, not a first-time banking user"
    why: >
      The assumption everyone starts with is that the gap is financial literacy. The harder gap was interface
      literacy: for a meaningful share of this audience, this was among the first apps they had installed. Flows
      were built around one decision per screen, explicit confirmation, and no gesture that had to be discovered
      before it could be used.
    tradeoff: >
      It costs experienced users taps. Someone moving money between their own accounts for the twentieth time goes
      through the same paced flow as someone doing it for the first time, and there is no express path for them.
next_steps: >
  The app shipped and the visual system held, but I never saw it under the network conditions of the places it
  was built for. That is where I would start: a low-bandwidth pass on the illustration set, and a usability
  round with first-time smartphone users in a tier-three town rather than in a studio. The other open thread is
  the two-voice type system. The ornamental and the numeric never fully reconciled on the dense screens, and I
  would rather resolve that than keep defending it.
next_project:
  title: "M Health Fairview"
  url: /m-health-fairview/
  desc: Enterprise UX for a health system serving millions.
---

<style>
  .cs-bleed { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-bleed img { object-fit: contain !important; height: auto !important; }
  .cs-bleed::before { display: none !important; }
  .cs-grid-item { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-grid-item img { object-fit: cover !important; height: 100% !important; }
  .cs-grid { align-items: stretch !important; padding: 0 !important; }
  .cs-grid::before { display: none !important; }
  .cs-grid-item::before { display: none !important; }
  .cs-grid { gap: 16px !important; }
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
  .cs-grid-item img {
    width: 100%; height: 100%;
    object-fit: cover !important;
    object-position: center center;
  }

  /* Custom hero, natural ratio with vignette */
  .mool-hero {
    margin: 0 !important;
    width: 100%;
    position: relative;
    overflow: hidden;
  }
  .mool-hero img {
    width: 100%;
    display: block;
  }
  .mool-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 10%, transparent 25%, transparent 75%, rgba(0,0,0,0.7) 100%),
      linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.5) 100%);
  }

  /* Narrow centered bleed for accent images */
  .cs-bleed--narrow {
    max-width: 800px;
    margin-left: auto !important;
    margin-right: auto !important;
    text-align: center;
  }

  @keyframes projBreathe {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.008) translateY(-3px); }
  }
</style>

<!-- HERO -->
<div class="mool-hero">
  <img src="{{ site.baseurl }}/5.mool/0.webp" alt="Mool 100k+ downloads" loading="eager" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.mool/1.jpg" alt="Mool" loading="lazy" decoding="async" />
</div>

<div class="cs-grid">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/5.mool/2.1.webp" alt="" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/5.mool/2.2.png" alt="" loading="lazy" decoding="async" /></div>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.mool/3.webp" alt="" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.mool/4.jpg" alt="" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.mool/5.webp" alt="" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.mool/6.webp" alt="" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.mool/7.webp" alt="" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.mool/8.webp" alt="" loading="lazy" decoding="async" />
</div>

<div class="cs-bleed" style="text-align:center;">
  <img src="{{ site.baseurl }}/5.mool/9.webp" alt="" loading="lazy" style="animation: projBreathe 6s ease-in-out infinite;" decoding="async" />
</div>

<div class="cs-bleed cs-bleed--narrow">
  <img src="{{ site.baseurl }}/5.mool/10.webp" alt="" loading="lazy" style="animation: projBreathe 6s ease-in-out infinite;" decoding="async" />
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/5.mool/13.jpg" alt="" loading="lazy" decoding="async" />
</div>
