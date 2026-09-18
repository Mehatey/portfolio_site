---
layout: project
permalink: /obin/
project_title: Obin
proj_num: "15"
tagline: An agent writes the credit memo in four minutes. Then an analyst checks every number in it for four hours. This is the workspace that closes that gap.
quick_read: >
  A verification workspace for AI-written venture debt memos. The agent drafts; the interface makes visible which figures it proved against a source, which it could not, and which two of its own it drew back at random for a person to check.
category: Agentic AI · Fintech
year: "2026"
hero_bg: "radial-gradient(ellipse at 40% 45%, #11151c 0%, #0a0d12 55%, #05070a 100%)"
hero_image: "16.obin/00-full.webp"
hero_pos: "50% 30%"
hero_mode: artifact
meta:
  - label: Year
    value: "2026"
  - label: Client
    value: Obin · concept
  - label: Role
    value: Design · Prototype
  - label: Tools
    value: Claude · HTML · CSS · JS
  - label: Live
    value: Run the prototype
    href: /ai-prototypes/obin/
highlights:
  - value: "38"
    label: figures in one memo
  - value: "28"
    label: proved without a person
  - value: "2"
    label: drawn back at random, unnamed
reflection: >
  The thing I keep coming back to is that the agent made the analyst's job worse before it made it better. Four hours became four minutes, and what came out the other side was a well written memo with thirty eight numbers in it and no way to tell which the machine had invented. So the analyst checked all thirty eight. The speed went somewhere, but not to them.

  What I would test first is the one assumption the whole ordering rests on: that leverage crossed with reliability is the right sort. Every workflow decision here is inferred rather than observed, and the design says so on its own face rather than hiding it in a footnote.
refl_bg: "16.obin/01-figures.webp"
next_project:
  title: "Ledger"
  url: /ledger/
---

<div class="cs-intro">
  <p>Obin's agent drafts a venture debt credit memo end to end. The draft is fluent, and fluency is the problem: a model that writes well makes a wrong number look exactly like a right one. This tool cannot stop a bad number. It can stop one from looking like a good one.</p>
</div>

<!-- ══ THE AGENT, WORKING AND THEN STOPPING ═══════════════════════════════
     Sid: "for obin i do have one video, you can feed this up a little, its
     some 50 seconds."

     Sped to 1.4x, which is 52.6 seconds down to 37.5. That is the most it
     takes without becoming unreadable: the whole point of the recording is
     that you can see WHICH file the agent opened and WHICH figure it pulled
     out of it, and past about 1.5x the filenames in the data room stop
     resolving as you watch. It is not a time-lapse, it is evidence.

     THE CAPTION DOES NOT STATE THE SPEED OR THE DURATION, and both were in
     the first draft. "One and a half times" was wrong -- it is 1.4 -- and
     "four minutes of work" contradicted the recording itself, whose own
     status bar reads "3m of 3m" when it halts. A caption that argues with
     the picture above it is worse than no caption, and the multiplier is a
     fact about the encode rather than about the work.

     It earns the top of the page because it is the argument in one take. The
     first half is the agent doing the work -- reading the data room, the ARR
     schedule, the public filings, the case law, and writing the memo with
     every figure it asserts marked as it lands. The second half is the part
     that makes this a design project rather than a demo: it STOPS. "Stopped,
     waiting on you", and four things it will not decide -- the concentration
     against the ceiling, the contract fragility, a round that does not
     reconcile, a blanket lien it found in a public filing and the retention
     figure it could not recompute.

     Which is the page's whole thesis, shown instead of claimed: the machine
     is fast at the part that is arithmetic and silent about the part that is
     judgment, and the interface has to make the difference legible. -->
<!-- ── SECTION LABELS, BECAUSE LEDGER HAS THEM ─────────────────────────────
     Obin carried none, and the two pages are a pair -- same category, next to
     each other in the footer handoff, written in the same week. One of them
     reading as a structured case study and the other as a caption-and-image
     gallery is a difference a reader notices without being able to name.

     It also fixes something measurable: the left measure line's spine draws a
     tick per landmark, and it finds them from .cs-section among other things.
     Obin had three landmarks on a nine thousand pixel page against six on
     every other case study, so its spine was almost blank. -->
<div class="cs-section"><span class="cs-section-label">The run</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The whole run, sped up. It reads the data room, writes the memo, marks every figure it asserts as it lands, and then stops and names the four things it will not decide.</em></p>
<div class="cs-bleed">
  <video width="1600" height="910" autoplay muted loop playsinline preload="none" aria-label="The Obin agent reading a data room, drafting a credit memo with each asserted figure marked, then halting and listing four decisions for a person">
    <source data-src="{{ site.baseurl }}/16.obin/v1-agent.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-intro">
  <p>The speed is not the achievement. Four minutes to a drafted memo only matters if a person can tell, without rereading the data room, which of its numbers were proved and which were asserted well. Everything below is that distinction, made visible.</p>
</div>

<!-- ── AND THE WAY IN ──────────────────────────────────────────────────── -->
<div class="cs-intro cs-try">
  <p><a class="cs-try__link" href="{{ site.baseurl }}/ai-prototypes/obin/"><span>Open the Obin prototype</span><i aria-hidden="true">&rarr;</i></a></p>
  <p class="cs-try__note">The verification workspace, running in this browser. Open any figure to see what it was proved against, or what it was not.</p>
</div>

<div class="cs-section"><span class="cs-section-label">How it reads</span></div>

<!-- The signature move -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Serif for what a person wrote. Monospace for what the machine asserted. The underline carries the state, so it survives being printed in black and white.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/16.obin/01-figures.webp" alt="A credit memo where every machine-asserted figure is set in monospace with a coloured underline: blue for proved, amber for conflict, red for unsupported" loading="lazy" decoding="async" />
</div>

<!-- Ordering -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Ordering is the product. Sorted by leverage crossed with reliability, the undisclosed lien is first. In the order a person reading top to bottom would meet it, it is ninth.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/16.obin/02-risk-order.webp" alt="The queue in risk order, with the senior blanket lien at the top marked unsupported" loading="lazy" decoding="async" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/16.obin/03-document-order.webp" alt="The same queue in document order, where the lien falls to ninth" loading="lazy" decoding="async" />
  </div>
</div>

<!-- Provenance -->
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Every claim opens into what the record says, what the agent did with it, and where the agent went when the data room came up short.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/16.obin/04-review.webp" alt="The verification pane: registry filing on the left, what the agent did with it on the right, and a note that the company did not supply the document" loading="lazy" decoding="async" />
</div>

<!-- The count -->
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/16.obin/05-header.webp" alt="The header strip: time on the memo against a firm baseline, 38 figures, 28 proved without you, 12 to review" loading="lazy" decoding="async" />
</div>

<div class="cs-section"><span class="cs-section-label">What it will not claim</span></div>

<div class="cs-intro">
  <p>Model confidence appears nowhere in the product. A score is 99 when a tool ran the arithmetic and the model never touched the number, and 77 when it read the figure off a slide someone wrote to persuade you. Both are backtested against two hundred and fourteen closed memos where the analyst's own number exists to compare against. Probability measures fluency, and a hallucinated figure often scores higher than a correct hedged one.</p>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/16.obin/06-thesis.webp" alt="The walkthrough page, stating the thesis and listing the four assumptions the design rests on" loading="lazy" decoding="async" />
</div>
