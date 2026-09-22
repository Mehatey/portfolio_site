---
layout: project
pillar: product
permalink: /m-health-fairview/
project_title: M Health Fairview
proj_num: "08"
tagline: >
  M Health Fairview is one of Minnesota's largest health systems, and its Get Care experience had grown into a maze. Patients landed on a page of overlapping options, online visits, virtual urgent care, in person urgent care, primary care and emergency care, with no clear sense of which one they needed or where to start. Working with Deloitte Digital, I reworked the entire care discovery and scheduling journey into one clear, urgency sorted path that guides patients to the right care and moves routine demand off overloaded emergency rooms.
category: Healthcare · Enterprise UX
year: 2024
hero_bg: "radial-gradient(ellipse at 50% 35%, #3a0d16 0%, #1e0710 50%, #0a0305 100%)"
hero_image: "assets/img/fairview/cover.webp"
hero_mode: artifact
og_image: "assets/img/og/m-health-fairview.jpg"
refl_bg: "assets/img/fairview/13-impact-crop.webp"
meta:
  - label: Role
    value: Product Designer
  - label: Partner
    value: Deloitte Digital
  - label: Client
    value: M Health Fairview
  - label: Timeline
    value: 2 sprints
  - label: Year
    value: "2024"
highlights:
  - value: "$13.6M+"
    label: revenue through scheduling
  - value: "32%"
    label: more new patients scheduling
  - value: "4.4"
    label: top rated care app
quick_read: >
  Redesigned M Health Fairview's care discovery and scheduling into one urgency sorted journey with Deloitte Digital, lifting scheduling revenue and moving routine demand away from the emergency room.
reflection: >
  The hardest part of this project was not visual, it was deciding what a patient should see first. A person looking for care is often anxious and short on time, so every extra option is a small tax on someone who is already stressed. We kept returning to one test, does this help someone in the first ten seconds know where to go. Sorting the whole experience by urgency, rather than by how the health system is organised internally, was the decision that made everything else fall into place.


  I also learned how much a single clear entry point can do for a business. By centralising every care option in one place and pushing the right patients toward virtual and preventive care, the same demand produced far better outcomes for both patients and the system.
decisions:
  - choice: "Sorted the whole experience by urgency, not by how the health system is organised"
    why: >
      The old page mirrored the hospital's internal structure, which meant a patient had to already understand the difference between urgent care, virtual urgent care and an eVisit to make a choice. We reorganised everything around a single human question, how soon do you need care, so the first decision a patient makes is one they can actually answer.
    tradeoff: >
      It meant working against internal expectations, since several teams wanted their service surfaced first. We defended the urgency model with the reasoning that a clearer path for patients ultimately sends more qualified demand to every service.
  - choice: "Put every action in the first fold and cut the long explanatory copy"
    why: >
      The audit showed the most important actions sitting below the fold under paragraphs a stressed patient would never read. We surfaced the core choices immediately and moved detail into progressive layers, so the page leads with action and reveals explanation only on request.
    tradeoff: >
      Some clinically important nuance, cost ranges and eligibility, had to move a click away. We accepted that trade in exchange for a first screen a patient could act on without reading a wall of text.
  - choice: "Designed for the patient and the business at the same time"
    why: >
      The brief was not only to help patients, it was to move routine demand off the emergency room and to promote virtual and preventive care. We built entry points for labs, checkups and a promotional banner into the same page, so a patient journey and a business goal could be served by one clear layout.
    tradeoff: >
      More goals on one page risks clutter. We contained it by keeping everything inside the urgency framework, so promotional content never competed with a patient who needed care right now.
next_project:
  title: "Marriott"
  url: /marriott/
  desc: A single pane of glass for the world's largest hotel network.
---

<style>
  @keyframes fvBreathe { 0%,100%{transform:scale(1) translateY(0);} 50%{transform:scale(1.006) translateY(-2px);} }
</style>
<style>
  /* ── THE BAND ────────────────────────────────────────────────────────
     Sid: "this one can be a zoomed in and since its a wide image can
     continuously have motion and keep going in one direction like a
     divider visual band." Five chapter cards from the original deck, run
     as one strip that never stops: the image twice in a row, translated
     by half its width on a loop, so the seam is invisible. It marks each
     chapter of the page. */
  .fv-band { overflow: hidden; margin: clamp(40px, 6vw, 88px) 0; -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
  .fv-band__track { display: flex; width: max-content; animation: fvBand 48s linear infinite; }
  .fv-band__track img { display: block; height: clamp(120px, 16vw, 220px); width: auto; }
  @keyframes fvBand { to { transform: translateX(-50%); } }
  @media (prefers-reduced-motion: reduce) { .fv-band__track { animation: none; } }
</style>

<!-- ── THE STORY, IN ORDER ─────────────────────────────────────────────
     Sid: "its too long of a scroll and in the beginning i have no idea what
     the story is." Rebuilt as five chapters, each opened by the band from
     the original deck: what Fairview is, what was broken, what we did,
     what shipped, what it did. Eleven media blocks, down from fourteen. -->

<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/fairview/00-journey.webp" alt="Our journey: the M Health Fairview project" loading="lazy" decoding="async" /></div>

<div class="cs-section">
  <h2 class="cs-section-label">01 · About the project</h2>
</div>
<p class="cube-cap cube-cap--above">One of Minnesota's largest health systems: 100+ hospitals and 60 clinics, one promise to patients.</p>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/fairview/00-about.webp" alt="M Health Fairview: care you can trust, on your terms" loading="lazy" decoding="async" /></div>

<div class="fv-band" aria-hidden="true"><div class="fv-band__track"><img src="{{ site.baseurl }}/assets/img/fairview/band.webp" alt="" loading="lazy" decoding="async" /><img src="{{ site.baseurl }}/assets/img/fairview/band.webp" alt="" loading="lazy" decoding="async" /></div></div>

<div class="cs-section">
  <h2 class="cs-section-label">02 · The problem</h2>
</div>
<p class="cube-cap cube-cap--above">Four problems for patients, five needs for the business. The brief was to solve both on one page.</p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/fairview/01-requirements.webp" alt="Problems to solve and business needs" loading="lazy" decoding="async" /></div>
<p class="cube-cap cube-cap--above">The audit: a booking flow that broke, an Emergency Care button that misled, and no patient access to test against.</p>
<div class="cs-grid cs-grid--fit">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/fairview/03-audit.webp" alt="Annotated heuristic audit of the existing site" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/fairview/04-constraints.webp" alt="Project constraints: third party API, two sprints, no patient access" loading="lazy" decoding="async" /></div>
</div>

<div class="cs-section">
  <h2 class="cs-section-label">03 · The process</h2>
</div>
<p class="cube-cap cube-cap--above">Six stages, two sprints. Discover and define with the functional team, design against a feasibility check, deliver hi-fi with dev notes, then QA every build.</p>
<div class="cs-grid cs-grid--fit">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/fairview/14-process.webp" alt="The six-stage process: discover, define, design, deliver, develop, deploy" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/fairview/05-research.webp" alt="Secondary research, ideation and initial concepts" loading="lazy" decoding="async" /></div>
</div>

<div class="cs-section">
  <h2 class="cs-section-label">04 · What shipped</h2>
</div>
<p class="cube-cap cube-cap--above">Before and after. Every action in the first fold, sorted by how soon you need care.</p>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/fairview/06-beforeafter.webp" alt="Before and after of the Get Care page" loading="lazy" decoding="async" /></div>
<p class="cube-cap cube-cap--above">The new entry point, in motion.</p>
<div class="cs-bleed"><video width="1200" height="674" autoplay muted loop playsinline preload="none" poster="{{ site.baseurl }}/assets/img/fairview/07-choose-poster.jpg" aria-label="Choose the right care page in motion"><source src="{{ site.baseurl }}/assets/img/fairview/07-choose.mp4" type="video/mp4" /></video></div>
<p class="cube-cap cube-cap--above">The specialty set that carries every care type.</p>
<div class="cs-bleed"><video width="1600" height="908" src="{{ site.baseurl }}/assets/img/fairview/specialty-icons.mp4" poster="{{ site.baseurl }}/assets/img/fairview/specialty-icons-poster.webp" autoplay muted loop playsinline preload="metadata" aria-label="The M Health Fairview specialty care icons animating in a grid"></video></div>
<p class="cube-cap cube-cap--above">Care types compared by cost, wait and what they treat. A helper for patients who would rather be led, and a checklist for the visit itself.</p>
<div class="cs-grid-3 cs-grid--fit">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/fairview/09-comparison.webp" alt="Side by side comparison of every care type by cost, wait and what it treats" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item"><video width="796" height="1126" autoplay muted loop playsinline preload="none" poster="{{ site.baseurl }}/assets/img/fairview/11-assistant-poster.jpg" aria-label="Conversational care assistant"><source src="{{ site.baseurl }}/assets/img/fairview/11-assistant.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/fairview/12-prepare.webp" alt="Prepare for your appointment" loading="lazy" decoding="async" /></div>
</div>
</div>

<div class="cs-section">
  <h2 class="cs-section-label">05 · Impact</h2>
</div>
<p class="cube-cap cube-cap--above">$13.6M through scheduling, 32% more new patients booking themselves, 22% more e-visits, and the top-rated care app against every direct competitor.</p>
<div class="cs-bleed" style="text-align:center;"><img src="{{ site.baseurl }}/assets/img/fairview/13-impact.webp" alt="Impact: 22% more e-visits, 32% more new patients scheduling, $13.6M revenue through scheduling, 4.4 rated app" loading="lazy" decoding="async" style="max-width:1100px;width:100%;" /></div>
