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

<!-- ══ THE FILM ══════════════════════════════════════════════════════════
     Sid: "for the ledger you can include some of these videos, you can only
     take the important ones: 1. we need to show the problem. 2. we need to
     show 2-3 on how the app works. 3. start with the logo animation. you need
     to show it like a project case study page, so you need to think."

     Twelve recordings, five used. What each one was, and why the other seven
     are not here:

       logo reveal (3.8s)          KEPT   the opener
       problem of multiple links   KEPT   the whole problem, staged
       Rina2.5 (99s)               KEPT   cut into two: the surface, then the
                                          evidence and the decision
       Shortlist (33s)             KEPT   calibration and the handoff, which
                                          is where the story ends
       Rina1 (45s)                 out    the queue, which Rina2.5 opens on
       Rina2 (22s)                 out    the same queue again
       disagree (21s)              out    the reviewer-conflict banner, which
                                          Shortlist also shows in context
       finalone / lala / slider /
       short screen rec / wrapup   out    fragments and an earlier cut

     Rina2.5 is the only one that needed cutting. At ninety nine seconds it is
     a complete tour and nobody watches a ninety nine second silent loop on a
     case study, so it is two clips that each make one point: 0-40s is the
     surface, 52-86s is what happens after you have looked. The join is at a
     candidate change, so neither clip starts mid gesture.

     All five are muted, looping and autoplaying, like every other film on
     this site -- nothing here makes a sound. Encoded at 1600px and 30fps from
     3024x1720 at 120: the source is a retina screen capture, and a case study
     needs it legible rather than native. 8.9MB for the five.
     ══════════════════════════════════════════════════════════════════════ -->

<div class="cs-bleed">
  <video width="1600" height="862" autoplay muted loop playsinline preload="none" aria-label="The Ledger mark drawing itself, under the line: review the work, not the tabs">
    <source data-src="{{ site.baseurl }}/17.ledger/v1-logo.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-intro">
  <p>A time poor reviewer should be able to understand one submission, inspect the evidence behind it, and reach a fair decision without leaving the page. Everything below follows from that sentence.</p>
</div>

<div class="cs-section"><span class="cs-section-label">The problem</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The legacy tool, running. Four links per candidate, a prototype that fails to load, and a review form that asks for a verdict on work the reviewer can no longer see.</em></p>
<div class="cs-bleed">
  <video width="1600" height="924" autoplay muted loop playsinline preload="none" aria-label="A reviewer opening a candidate across four separate links, hitting a broken video, and being asked for a recommendation anyway">
    <source data-src="{{ site.baseurl }}/17.ledger/v2-problem.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-intro">
  <p>Memory becomes the system. A reviewer is asked to hold four tabs and a broken preview in their head, and then to rate something they half remember, twenty three times in one sitting. Every decision after the first is made against a fading copy of the work.</p>
</div>

<div class="cs-section"><span class="cs-section-label">How it works</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>One surface. The repository, the live demo, the walkthrough and the README are tabs on the submission rather than tabs in the browser, and the prototype runs inside the page being scored.</em></p>
<div class="cs-bleed">
  <video width="1600" height="910" autoplay muted loop playsinline preload="none" aria-label="The review surface: the submission queue, then a candidate opened with their prototype running inline beside the scorecard">
    <source data-src="{{ site.baseurl }}/17.ledger/v3-review.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Evidence, then a decision. What the repository actually contains sits beside what the candidate claimed, and the reviewer advances to the next submission without losing the thread.</em></p>
<div class="cs-bleed">
  <video width="1600" height="910" autoplay muted loop playsinline preload="none" aria-label="Repository evidence, the assist panel, the decision, and the queue advancing to the next candidate">
    <source data-src="{{ site.baseurl }}/17.ledger/v4-evidence.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Calibration before anyone moves forward. Two reviewers disagreeing is surfaced as a thing to resolve, not averaged away, and the finalists leave as a packaged handoff.</em></p>
<div class="cs-bleed">
  <video width="1600" height="910" autoplay muted loop playsinline preload="none" aria-label="Shortlist calibration comparing candidates side by side, resolving a reviewer disagreement, and packaging two finalists for the next round">
    <source data-src="{{ site.baseurl }}/17.ledger/v5-handoff.mp4" type="video/mp4" />
  </video>
</div>

<!-- ── AND THE WAY IN ──────────────────────────────────────────────────────
     Sid: "the link out to the prototype should be there and should be clear."

     It was in the Project details disclosure, as a "Live" row a reader had to
     open a control to find. Everything above is a recording, and a recording
     of a working thing should be followed immediately by the working thing --
     so the way in is a block of its own, at the end of the film, before the
     stills. It also stays in the meta so the page's own header carries it. -->
<div class="cs-intro cs-try">
  <p><a class="cs-try__link" href="{{ site.baseurl }}/ai-prototypes/ledger/"><span>Open the Ledger prototype</span><i aria-hidden="true">&rarr;</i></a></p>
  <p class="cs-try__note">The real thing, running in this browser. Review a candidate, score them against the rubric, and take the shortlist to a handoff.</p>
</div>

<div class="cs-section"><span class="cs-section-label">The detail</span></div>

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
