---
layout: project
permalink: /ledger/
why: "A reviewer with twenty three submissions and a dozen tabs per candidate needs one surface and a decision."
project_title: Ledger
proj_num: "16"
tagline: A reviewer has twenty three submissions, one sitting, and a dozen browser tabs per candidate. Ledger puts the repo, the demo, the README and the walkthrough on one surface and asks for a decision.
quick_read: >
  A submission review layer for hiring. Every candidate's repository, live demo, screenshots and walkthrough live in one reviewable surface, with scoring that separates what a candidate shipped from what they merely claimed.
cover_summary: "One review surface for a candidate's repository, demo, evidence, and score."
category: Agentic AI · Design Systems
year: "2026"
hero_bg: "radial-gradient(ellipse at 45% 40%, #1b1e2c 0%, #12141d 55%, #0a0b11 100%)"
hero_image: "17.ledger/01-review.webp"
og_image: "assets/img/og/ledger.jpg"
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
  - value: "2"
    label: interface modes, light and dark
decisions:
  - choice: "Scored whether a submission is complete separately from whether it is good"
    why: >
      Those two questions arrive at the same moment, and a single star rating collapses them: a candidate who shipped strong work with no README would score the same as one who shipped nothing. Splitting them means every score afterward means something narrower and more honest.
    tradeoff: >
      Pulling them apart cost a column of screen a single combined score would not have needed.
  - choice: "Wrote an anchored rubric with a behavioural description for every point on every criterion"
    why: >
      It is the reason a reviewer can score consistently at submission nineteen instead of drifting from submission one.
    tradeoff: >
      It is also the heaviest thing on the page. I would want to watch somebody use it for an hour before defending the weight.
  - choice: "Scored product judgment, craft, implementation, and communication as four separate numbers instead of one rating"
    why: >
      A single star rating invites halo bias: one strong first impression bleeds into every other dimension. Four axes make it visible when someone writes a beautiful README but builds carelessly, or the reverse.
    tradeoff: >
      Four decisions per submission instead of one. The anchored wording from the rubric above is what keeps that from feeling slower than it is worth.
  - choice: "Tagged every item in a candidate's stack as detected evidence or an unverified claim, instead of one flat list"
    why: >
      Review tools tend to render whatever a candidate typed as though it were fact. Marking the difference costs one visual token and changes how much weight a reviewer gives the rest of the page.
    tradeoff: >
      It only means anything if detection is honest. A badge that claims to have checked something it has not would be worse than no badge at all.
  - choice: "Gave a submitted verdict a six second undo instead of only confirming it went through"
    why: >
      Recording a judgment on someone's work is the one action in the tool that most deserves a way back. People change their mind in the second after clicking, and a tool that makes correction expensive quietly encourages a wrong verdict to stand.
    tradeoff: >
      None taken. This was one of the cheaper decisions on the page and I would make it again immediately.
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

<div class="cs-zoom">
  <div class="cs-zoom__frame">
    <img
      style="--zx: 82%; --zy: 24%; --zs: 1.65"
      src="{{ site.baseurl }}/17.ledger/02-rubric.webp"
      alt="The scorecard, pushing in on the anchored rubric: four criteria, each zero to four, each number defined in words on hover"
      loading="lazy"
      decoding="async"
    />
  </div>
  <p class="cs-zoom__label">Every number on the scale is written out. Two reviewers scoring the same submission are scoring the same definition.</p>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The prototype runs beside the evidence and scorecard. A reviewer can check what shipped, score it, and move forward without losing context.</em></p>
<div class="cs-bleed">
  <video width="1600" height="910" autoplay muted loop playsinline preload="none" aria-label="The review surface: the submission queue, then a candidate opened with their prototype running inline beside the scorecard">
    <source data-src="{{ site.baseurl }}/17.ledger/v3-review.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>This is the review running live, not a recording of it. Page submissions, open the evidence drawer, score a criterion.</em></p>
<div class="cs-embed">
  <div class="cs-embed__bar">
    <span>LEDGER · LIVE</span>
    <a href="{{ site.baseurl }}/ai-prototypes/ledger/" target="_blank" rel="noopener">Open full screen &rarr;</a>
  </div>
  <iframe
    src="{{ site.baseurl }}/ai-prototypes/ledger/"
    title="Ledger, the live review prototype"
    loading="lazy"
  ></iframe>
</div>

<div class="cs-compare" data-reveal>
  <div class="cs-compare__tabs" role="tablist" aria-label="Glass">
    <button type="button" data-compare-tab="a" class="is-active">Glass on</button>
    <button type="button" data-compare-tab="b">Glass off</button>
  </div>
  <div class="cs-compare__stage cs-compare__stage--strip">
    <img
      class="is-active"
      data-compare-img="a"
      src="{{ site.baseurl }}/17.ledger/09-glass-on.webp"
      alt="The toolbar with liquid glass on, frosting and bending the content scrolling behind it"
      loading="lazy"
      decoding="async"
    />
    <img
      data-compare-img="b"
      src="{{ site.baseurl }}/17.ledger/10-glass-off.webp"
      alt="The same toolbar with glass off, a flat solid bar with no refraction"
      loading="lazy"
      decoding="async"
    />
  </div>
  <p class="cs-compare__note" data-compare-note="a">Glass stays on chrome only, the toolbar and overlays, never behind body copy where it would fight legibility.</p>
  <p class="cs-compare__note" data-compare-note="b" hidden>Off is a real accessibility control, not a decoration setting, for <code>prefers-reduced-transparency</code> and anyone who finds the frost harder to read.</p>
</div>

<div class="cs-intro cs-try">
  <p><a class="cs-try__link" href="{{ site.baseurl }}/ai-prototypes/ledger/"><span>Open the Ledger prototype</span><i aria-hidden="true">&rarr;</i></a></p>
  <p class="cs-try__note">Review a candidate, inspect the evidence, and take the shortlist to a handoff.</p>
</div>
