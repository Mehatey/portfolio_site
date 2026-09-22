---
layout: project
pillar: product
permalink: /marriott/
project_title: Marriott
proj_num: "09"
tagline: >
  Marriott staff ran daily hotel operations across a scatter of disconnected tools. Working with Deloitte Digital, I designed SPOG, a Single Pane of Glass, an end to end employee application that unifies operations across every Marriott Bonvoy property. One place for a front desk associate to see the day at a glance, arrivals and departures, room occupancy, open cases and events, and to run loyalty enrolment, reservations and requests without ever leaving the screen.
category: Enterprise UX · Design Systems
year: 2023
hero_bg: "radial-gradient(ellipse at 50% 30%, #1c1a17 0%, #100e0c 50%, #050403 100%)"
hero_image: "assets/img/marriott/cover.webp"
hero_mode: artifact
og_image: "assets/img/og/marriott.jpg"
refl_bg: "assets/img/marriott/09-desktop.webp"
meta:
  - label: Role
    value: Product Designer
  - label: Partner
    value: Deloitte Digital
  - label: Client
    value: Marriott International
  - label: Scope
    value: End to end employee app
  - label: Year
    value: "2023"
highlights:
  - value: "9,000+"
    label: properties in scope
  - value: "1 pane"
    label: for the whole shift
  - value: "17%"
    label: lift in inventory accuracy
quick_read: >
  Designed SPOG, a single pane of glass employee application for Marriott Bonvoy properties, unifying daily operations, reservations and loyalty enrolment into one calm, information dense dashboard.
reflection: >
  Enterprise tools are usually judged by how much they can show. This one was judged by how fast a busy associate could understand a shift. That reframing changed every decision. The dashboard carries a large amount of live data, arrivals, departures, occupancy, room status, cases and events, yet it had to read in a glance for someone standing at a front desk mid conversation.


  The craft was in restraint. A warm neutral system, one accent and a strict hierarchy let dense information feel calm instead of overwhelming. Designing the same experience for a tablet at the desk and a browser in the back office taught me how much layout discipline a real operational tool demands.
decisions:
  - choice: "Built one dashboard that reads in a glance, not a wall of dashboards"
    why: >
      An associate does not have time to hunt across screens mid shift. We put the whole day on one overview, arrivals and departures, occupancy, room status, cases and events, with a strict visual hierarchy so the most time sensitive numbers read first and detail waits one tap away.
    tradeoff: >
      Fitting that much on one surface meant relentless editing of what earned a place on the first screen. Several secondary metrics had to move into detail views to keep the overview calm.
  - choice: "Used a warm neutral system with a single accent to keep dense data calm"
    why: >
      Operational data is unforgiving, and colour used carelessly turns a dashboard into noise. We held to a warm neutral base with one gold accent and reserved stronger colour only for states that need attention, so an alert actually feels like an alert.
    tradeoff: >
      A restrained palette gives up some quick visual coding. We made up for it with shape, weight and position so meaning still comes through without leaning on colour.
  - choice: "Designed loyalty enrolment as a guided, glanceable flow"
    why: >
      Enrolling a guest into Bonvoy at the desk had to be fast and hard to get wrong. We built a membership card carousel and a guided enrolment with clear tiers and benefits, so an associate can move a guest through it while talking to them.
    tradeoff: >
      A guided flow is less flexible than a raw form. For the rare edge case an associate has fewer shortcuts, but the common path is far faster and less error prone.
next_project:
  title: "Cube of Creations"
  url: /cube-guy/
  desc: Seven years of a character world, made for play.
---

<style>
  @keyframes mkBreathe { 0%,100%{transform:scale(1) translateY(0);} 50%{transform:scale(1.006) translateY(-2px);} }
</style>

<!-- ── ONE CAPTION PER GROUP, NOT PER PICTURE ──────────────────────────
     Sid: "see that we're not using captions for every single divider page,
     because that increases more vertical spacing and we have a longer scroll
     in general." And: "we don't need a dash which says Loyalty Enrollment and
     then another number which says Loyalty Enrollment below it."

     Counted, this page captioned every image it had. Consecutive runs then
     said the same thing three ways -- the dashboard, then the dashboard
     specified, then the dashboard's occupancy, then the dashboard's
     reservations -- and each caption costs a 24px margin plus its own line
     before the picture it introduces.

     What survives is the caption that carries a DESIGN point: what the screen
     is for, or what was decided. What goes is the caption that names what a
     reader can already see. The pictures still read in sequence because they
     are in sequence; they did not each need announcing. -->
<p class="cube-cap cube-cap--above">An employee app for Marriott staff, across every Bonvoy property.</p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/marriott/01-what.webp" alt="What we did, Marriott Bonvoy employee app" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above">UX: the annotation system used across every spec, and how the dashboard scales from tablet to desktop.</p>
<div class="cs-grid cs-grid--fit">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/marriott/11-annotation-legend.webp" alt="Annotation examples: functional requirement, functionality, interaction, micro-interaction, transition, animation" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/marriott/12-responsive.webp" alt="The dashboard's responsive states, tablet through desktop, with the notifications panel open" loading="lazy" decoding="async" /></div>
</div>

<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/marriott/00-spog.webp" alt="Marriott Bonvoy SPOG: a whole shift in one place, read the day, watch what needs attention, help the guest" loading="lazy" decoding="async" /></div>

<div class="cs-section">
  <h2 class="cs-section-label">The dashboard</h2>
</div>

<p class="cube-cap cube-cap--above">The specification. Every element mapped to a requirement.</p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/marriott/03-spec.webp" alt="Annotated dashboard specification" loading="lazy" decoding="async" /></div>

<div class="cs-bleed"><video autoplay muted loop playsinline preload="none" poster="{{ site.baseurl }}/assets/img/marriott/09-dashboard-rec-poster.jpg" aria-label="The dashboard, screen recorded"><source src="{{ site.baseurl }}/assets/img/marriott/09-dashboard-rec.mp4" type="video/mp4" /></video></div>

<div class="cs-grid cs-grid--fit">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" poster="{{ site.baseurl }}/assets/img/marriott/04-overview-poster.jpg" aria-label="Operational overview metrics"><source src="{{ site.baseurl }}/assets/img/marriott/04-overview.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" poster="{{ site.baseurl }}/assets/img/marriott/05-flow-poster.jpg" aria-label="Peak reservation flow and cases"><source src="{{ site.baseurl }}/assets/img/marriott/05-flow.mp4" type="video/mp4" /></video></div>
</div>

<p class="cube-cap cube-cap--above">Notifications, broken down: the banner, the bell, and every state in the panel.</p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/marriott/10-notifspec.webp" alt="Annotated notifications specification: banner, bell icon, panel states, key functionality and user interaction" loading="lazy" decoding="async" /></div>

<div class="cs-section">
  <h2 class="cs-section-label">Loyalty enrolment</h2>
</div>

<p class="cube-cap cube-cap--above">Loyalty enrolment, without leaving the desk.</p>
<div class="cs-grid cs-grid--fit">
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" poster="{{ site.baseurl }}/assets/img/marriott/06-enroll-poster.jpg" aria-label="Bonvoy loyalty enrolment carousel"><source src="{{ site.baseurl }}/assets/img/marriott/06-enroll.mp4" type="video/mp4" /></video></div>
  <div class="cs-grid-item"><video autoplay muted loop playsinline preload="none" poster="{{ site.baseurl }}/assets/img/marriott/08-enrollmodal-poster.jpg" aria-label="Enroll new member modal"><source src="{{ site.baseurl }}/assets/img/marriott/08-enrollmodal.mp4" type="video/mp4" /></video></div>
</div>

<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/marriott/07-enrollspec.webp" alt="Loyalty enrolment key functionality" loading="lazy" decoding="async" /></div>
