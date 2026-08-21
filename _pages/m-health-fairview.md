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
refl_bg: "assets/img/fairview/13-impact.webp"
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
  title: "Marriott Bonvoy SPOG"
  url: /marriott/
  desc: A single pane of glass for the world's largest hotel network.
---

<style>
  @keyframes fvBreathe { 0%,100%{transform:scale(1) translateY(0);} 50%{transform:scale(1.006) translateY(-2px);} }
</style>

<!-- ── THE ORDER, AND WHY ────────────────────────────────────────────────
     Sid: "in the fairview page there is one metric screen you can bring that
     before and an ai chat which takes too much space add it to a grid. also
     keep the icons which are animated and the movie version and remove the
     other version which is jsut a png. also a lot of pages have too much of a
     scroll with too many full length images which dont deserve to be there or
     the order of the work details needs to be better to tell the story
     better."

     All four of those were the same page. It ran as fourteen full-bleed
     blocks in a single column, every one of them the same size and therefore
     the same importance, and the numbers that justify the whole project were
     the fourteenth thing you reached.

     THE IMPACT MOVES UP. It now follows the before-and-after, because that
     pairing is the argument: here is what changed, here is what it did.
     Everything after it is the detail of how, which is the right thing to
     read second and the wrong thing to read for six screens before you have
     been told whether it worked.

     FOUR PAIRS BECOME GRIDS. Business needs and the heuristic audit are one
     analysis and were two scrolls. Constraints and research likewise. The
     assistant is a 796x1126 phone recording that was being served at the same
     width as a 1600px desktop board, which is where "takes too much space"
     comes from — it is beside the prepare-for-your-visit screen now, at the
     size a phone actually is.

     THE STATIC ICONS COME OUT. 09-compare.webp was one tall screenshot
     carrying the specialty icon grid AND the care-type comparison table, and
     the icon grid in it is the same set that specialty-icons.mp4 animates two
     blocks later. The still is cropped down to the comparison table, so the
     icons appear once, moving.

     Fourteen bleeds to eight bleeds and three grids. -->

<p class="cube-cap cube-cap--above">The requirement, broken down with Deloitte Digital.</p>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/fairview/01-requirements.webp" alt="Client requirements and problems to solve" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above">The audit: a broken booking flow, and a misleading Emergency Care button.</p>
<div class="cs-grid cs-grid--fit">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/assets/img/fairview/02-needs.webp" alt="Business needs, user needs and heuristic analysis" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/assets/img/fairview/03-audit.webp" alt="Annotated heuristic audit of the existing site" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above">The constraints: a third party API, two sprints, no access to patients.</p>
<div class="cs-grid cs-grid--fit">
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/assets/img/fairview/04-constraints.webp" alt="Project constraints" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/assets/img/fairview/05-research.webp" alt="Secondary research, ideation and initial concepts" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above">Before and after. Every action in the first fold, sorted by urgency.</p>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/fairview/06-beforeafter.webp" alt="Before and after of the Get Care page" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above">$13.6M in scheduling revenue, and 32% more new patients booking themselves.</p>
<div class="cs-bleed" style="text-align:center;"><img src="{{ site.baseurl }}/assets/img/fairview/13-impact.webp" alt="Our impact, key metrics" loading="lazy" style="animation:fvBreathe 6s ease-in-out infinite;" decoding="async" /></div>

<p class="cube-cap cube-cap--above">The new entry point. One clear place to start.</p>
<div class="cs-bleed"><video width="1200" height="674" autoplay muted loop playsinline preload="none" poster="{{ site.baseurl }}/assets/img/fairview/07-choose-poster.jpg" aria-label="Choose the right care page in motion"><source src="{{ site.baseurl }}/assets/img/fairview/07-choose.mp4" type="video/mp4" /></video></div>

<p class="cube-cap cube-cap--above">Get Care Today and Schedule Your Care, separated into two paths.</p>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/fairview/08-getcare.webp" alt="Get Care Today and Schedule Your Care" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above">Care types compared by cost, wait and what they treat.</p>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/fairview/09-comparison.webp" alt="Side by side comparison of every care type by cost, wait and what it treats" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above">The specialty icons, designed and animated by hand.</p>
<div class="cs-bleed"><video width="1600" height="908" src="{{ site.baseurl }}/assets/img/fairview/specialty-icons.mp4" poster="{{ site.baseurl }}/assets/img/fairview/specialty-icons-poster.webp" autoplay muted loop playsinline preload="metadata" aria-label="The M Health Fairview specialty care icons animating in a grid"></video></div>

<p class="cube-cap cube-cap--above">Choosing a care type. Routine preventive, primary and specialty care surfaced as three clear routes.</p>
<div class="cs-bleed"><img src="{{ site.baseurl }}/assets/img/fairview/10-caretypes.gif" alt="Care type selection in motion" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above">A helper for patients who would rather be led than browse.</p>
<div class="cs-grid cs-grid--fit">
  <div class="cs-grid-item"><video width="796" height="1126" autoplay muted loop playsinline preload="none" poster="{{ site.baseurl }}/assets/img/fairview/11-assistant-poster.jpg" aria-label="Conversational care assistant"><source src="{{ site.baseurl }}/assets/img/fairview/11-assistant.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><img src="{{ site.baseurl }}/assets/img/fairview/12-prepare.webp" alt="Prepare for your appointment" loading="lazy" decoding="async" /></div>
</div>
