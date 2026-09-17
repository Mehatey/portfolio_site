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
    label: material checks, scored apart from quality
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
  <p>A time poor reviewer should be able to understand one submission, inspect the evidence behind it, and reach a fair decision without leaving the page. Everything below follows from that sentence.</p>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Three factual questions before any judgment: what did they build, does it run, what evidence is here.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/17.ledger/01-review.webp" alt="The review surface: a three question strip, the candidate's own explanation, and the live prototype running inline" loading="lazy" decoding="async" />
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Completeness is counted separately from quality, so a missing README never reads as weak work.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/17.ledger/02-rubric.webp" alt="The scorecard: four criteria scored nought to four, each point carrying a written behavioural description" loading="lazy" decoding="async" />
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>A claimed stack becomes an inspectable one. What the candidate said, against what the repository shows.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/17.ledger/03-evidence.webp" alt="Repository evidence separated from candidate claims, each line traceable to a file" loading="lazy" decoding="async" />
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>A broken deploy is not the same as absent work, and the interface refuses to score them alike.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/17.ledger/07-error.webp" alt="The failed deployment state, which explains what broke and keeps the rest of the evidence usable" loading="lazy" decoding="async" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/17.ledger/08-empty.webp" alt="The missing material state, written to be useful to the reviewer and to the candidate" loading="lazy" decoding="async" />
  </div>
</div>

<div class="cs-intro">
  <p>The system view is part of the prototype rather than a document beside it: tokens, component anatomy, the state matrix and the accessibility contract are all inspectable from inside the thing they describe. Contrast is audited in a script that runs against both themes and reports zero failures.</p>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/17.ledger/04-system.webp" alt="The system view showing colour tokens, component anatomy and the full state matrix" loading="lazy" decoding="async" />
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/17.ledger/06-mobile.webp" alt="The mobile review layout, evidence stacked first with a sticky review dock" loading="lazy" decoding="async" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/17.ledger/05-system-src.webp" alt="The light theme of the system view" loading="lazy" decoding="async" />
  </div>
</div>
