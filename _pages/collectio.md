---
layout: project
permalink: /collectio/
project_title: Collectio
proj_num: "17"
tagline: A municipal waste system for Panaji, Goa, designed around where its classifier fails rather than where it works. The truck delivers a weight. The belt says what was in it. The ward sees both. Each part only claims what it can actually know.
quick_read: >
  A municipal waste system for Panaji: a driver's route, a sorting camera running a network I trained from scratch, and a ward queue that holds what the model cannot vouch for.
category: AI · Civic systems
year: "2019 · 2026"
hero_bg: "radial-gradient(ellipse at 40% 45%, #121a14 0%, #0b100c 55%, #06080a 100%)"
hero_image: "assets/img/collectio/deck/cover-app.webp"
hero_pos: "62% 45%"
meta:
  - label: Role
    value: Designer and engineer
  - label: Client
    value: Goa Waste Management
  - label: Scope
    value: Route, belt, ward
  - label: Tools
    value: PyTorch, JavaScript
  - label: Year
    value: "2019 to 2026"
highlights:
  - value: "72.1%"
    label: in the lab, on unseen photographs
  - value: "29%"
    label: on a raw crop off a real belt
  - value: "0"
    label: wrong dispatches, 8 of 23 held
reflection: >
  72% is not a good number. That is why the product is built around abstention. A softmax always answers. The product should not. Before anything is sent, the belt asks two more questions, have you seen this before and how sure are you, and fails either one to a person.

  What is still wrong is named openly. The belt footage is generated reference footage; the tracking and every classification on it are real, but a real camera will bring dirt, glare and overlap the training set never saw. The next version starts with the belt, not the lab.
refl_bg: "assets/img/collectio/flow-fail.webp"
next_project:
  title: "Obin"
  url: /obin/
  desc: An agent writes the memo. A person checks the numbers.
---

<div class="cs-section"><span class="cs-section-label">The problem</span></div>

<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/collectio/deck/c1-why-waste.webp" alt="Why I chose waste: India generates 62 million tonnes a year, half of it dumped into landfill sites" loading="lazy" decoding="async" /></div>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/collectio/deck/c2-why-goa.webp" alt="Why Goa: it leads India in per capita plastic waste production, 61.2 grams daily" loading="lazy" decoding="async" /></div>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/collectio/deck/c3-no-data.webp" alt="For the last five years, no segregation data from the 191 villages was shown to the government" loading="lazy" decoding="async" /></div>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/collectio/deck/c4-who-responsible.webp" alt="Who is responsible: how GWMC and the panchayats work, mapped so the app could be designed realistically" loading="lazy" decoding="async" /></div>

<div class="cs-section"><span class="cs-section-label">Research</span></div>

<p class="cube-cap cube-cap--above"><em>Clinton Vaz runs vRecycle, a waste collector in Goa. We spoke about what collection actually looks like on the ground.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/assets/img/collectio/deck/c5-interviews.webp" alt="A call with Clinton Vaz, and the podcast and press coverage of his work at vRecycle" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="metadata" poster="{{ site.baseurl }}/assets/img/collectio/video/founder-interview-poster.jpg"><source src="{{ site.baseurl }}/assets/img/collectio/video/founder-interview.mp4" type="video/mp4" /></video></div>
</div>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/collectio/deck/c6-roles.webp" alt="The three roles: collectors, GWMC, segregators" loading="lazy" decoding="async" /></div>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/collectio/deck/c7-matrix.webp" alt="Feature, benefit and action mapped for GWMC, collectors and segregators" loading="lazy" decoding="async" /></div>

<div class="cs-section"><span class="cs-section-label">The product</span></div>

<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/collectio/deck/c8-ia.webp" alt="The information architecture: how GWMC, collectors, segregators and the waste stream connect" loading="lazy" decoding="async" /></div>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/collectio/deck/c9-solution.webp" alt="Solution: Collectio, a clearer world" loading="lazy" decoding="async" /></div>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/collectio/deck/c10-different.webp" alt="How Collectio is different from the limited waste only apps already out there" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above"><em>Live on the belt: every box tracked, every class a forward pass on the playing video.</em></p>
<div class="cs-bleed"><video autoplay muted loop playsinline preload="metadata" poster="{{ site.baseurl }}/assets/img/collectio/video/live-analyser-poster.jpg"><source src="{{ site.baseurl }}/assets/img/collectio/video/live-analyser.mp4" type="video/mp4" /></video></div>
<div class="cs-bleed"><video autoplay muted loop playsinline preload="metadata" poster="{{ site.baseurl }}/assets/img/collectio/video/onboarding-poster.jpg"><source src="{{ site.baseurl }}/assets/img/collectio/video/onboarding.mp4" type="video/mp4" /></video></div>
