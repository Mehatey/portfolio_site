---
layout: project
permalink: /ledger/
project_title: Ledger
proj_num: "16"
tagline: A reviewer has twenty three submissions, one sitting, and a dozen browser tabs per candidate. Ledger puts the repo, the demo, the README and the walkthrough on one surface and asks for a decision.
quick_read: >
  A submission review layer for hiring. Every candidate's repository, live demo, screenshots and walkthrough live in one reviewable surface, with scoring that separates what a candidate shipped from what they merely claimed.
category: Agentic AI · Design Systems
year: "2026"
hero_bg: "radial-gradient(ellipse at 45% 40%, #1b1e2c 0%, #12141d 55%, #0a0b11 100%)"
hero_image: "17.ledger/01-review.webp"
hero_pos: "50% 16%"
# ── THE COVER IS THE PRODUCT NOW ──────────────────────────────────────────
# Sid: "ledger cover pic looks bad and tells me nothing about the product, at
# least mock it up or have a ui shot."
#
# Fair. 00-landing is the marketing page: a headline on a near-black ground
# with most of the frame empty, and cropped to a hero band it showed almost
# nothing but that emptiness. It told a visitor the project has a tagline.
#
# 01-review is the working surface, and it answers "what is this" in one
# look: the three question strip, the candidate, the live prototype running
# inline, the completeness checklist and the scorecard all visible at once.
# A dense real interface is the honest cover for a tool, and the density is
# the point rather than a problem -- nobody has to read it to understand
# they are looking at something for reviewing submissions.
#
# hero_pos 16% rather than centre, because the top of this screenshot is
# where the three questions and the name are. A centre crop would land on
# the middle of the live preview and lose the frame that does the explaining.
#
# Still no hero_mode: artifact. That mode lays a heavy left-to-right scrim to
# tame a BRIGHT screenshot, which is right for Obin's pale memo; this one is
# already dark, and with the aperture the title sits on the frame's own foot
# rather than on the picture, so there is nothing left for a scrim to fix.
meta:
  - label: Year
    value: "2026"
  - label: Client
    value: Exercise · concept
  - label: Role
    value: Design · Front end
  - label: Tools
    value: React · Claude · Design tokens
  - label: Live
    value: Run the prototype
    href: /ai-prototypes/ledger/
highlights:
  - value: "0"
    label: external tabs to reach a verdict
  - value: "5"
    label: material checks, scored apart
  - value: "0"
    label: contrast failures, light and dark
reflection: >
  The decision I would defend hardest is separating whether a submission is complete from whether it is good. Those two questions arrive at the same moment and a single star rating collapses them, so a candidate who shipped strong work with no README scores like a candidate who shipped nothing. Pulling them apart cost a column of screen and made every score afterwards mean something narrower and more honest.

  The one I would revisit is the anchored rubric. Writing behavioural descriptions for every point on every criterion is the reason a reviewer can score consistently at submission nineteen, and it is also the heaviest thing on the page. I would want to watch somebody use it for an hour before defending the weight.
refl_bg: "17.ledger/04-system.webp"
next_project:
  title: "Obin"
  url: /obin/
---

<div class="cs-intro">
  <p>Ledger gives a reviewer one place to understand a submission, inspect the evidence behind it, and make a fair decision. The repository, live demo, walkthrough, and scorecard stay together.</p>
</div>

<div class="cs-section"><span class="cs-section-label">Why it exists</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The old workflow split each candidate across browser tabs. Reviewers had to remember the work while scoring it somewhere else.</em></p>
<div class="cs-bleed">
  <video width="1600" height="924" autoplay muted loop playsinline preload="none" aria-label="A reviewer opening a candidate across four separate links, hitting a broken video, and being asked for a recommendation anyway">
    <source data-src="{{ site.baseurl }}/17.ledger/v2-problem.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-section"><span class="cs-section-label">The review</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The prototype runs beside the evidence and scorecard. A reviewer can check what shipped, score it, and move forward without losing context.</em></p>
<div class="cs-bleed">
  <video width="1600" height="910" autoplay muted loop playsinline preload="none" aria-label="The review surface: the submission queue, then a candidate opened with their prototype running inline beside the scorecard">
    <source data-src="{{ site.baseurl }}/17.ledger/v3-review.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-section"><span class="cs-section-label">The evidence</span></div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/17.ledger/02-rubric.webp" alt="A scorecard with written descriptions for every point on each criterion" loading="lazy" decoding="async" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/17.ledger/03-evidence.webp" alt="Repository evidence shown beside the candidate's claims, with each line traceable to a file" loading="lazy" decoding="async" />
  </div>
</div>

<div class="cs-intro cs-try">
  <p><a class="cs-try__link" href="{{ site.baseurl }}/ai-prototypes/ledger/"><span>Open the Ledger prototype</span><i aria-hidden="true">&rarr;</i></a></p>
  <p class="cs-try__note">Review a candidate, inspect the evidence, and take the shortlist to a handoff.</p>
</div>
