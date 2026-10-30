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
  <p>Obin verifies the numbers inside an AI written venture debt memo. It shows which figures were proved against a source, which remain unsupported, and which need a person to decide.</p>
</div>

<div class="cs-section"><span class="cs-section-label">The run</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The agent reads the data room, writes the memo, marks each figure, then stops when judgment is required.</em></p>
<div class="cs-bleed">
  <video width="1600" height="910" autoplay muted loop playsinline preload="none" aria-label="The Obin agent reading a data room, drafting a credit memo with each asserted figure marked, then halting and listing four decisions for a person">
    <source data-src="{{ site.baseurl }}/16.obin/v1-agent.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-section"><span class="cs-section-label">The verification layer</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Human writing stays in serif. Machine assertions use monospace. The underline shows whether each figure is proved, conflicting, or unsupported.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/16.obin/01-figures.webp" alt="A credit memo where every machine-asserted figure is set in monospace with a coloured underline: blue for proved, amber for conflict, red for unsupported" loading="lazy" decoding="async" />
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Risk order puts the most consequential unsupported claim first. Opening it reveals the source, the agent's reasoning, and the missing evidence.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/16.obin/02-risk-order.webp" alt="The queue in risk order, with the senior blanket lien at the top marked unsupported" loading="lazy" decoding="async" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/16.obin/04-review.webp" alt="The verification pane showing the source record beside what the agent did with it" loading="lazy" decoding="async" />
  </div>
</div>

<div class="cs-intro cs-try">
  <p><a class="cs-try__link" href="{{ site.baseurl }}/ai-prototypes/obin/"><span>Open the Obin prototype</span><i aria-hidden="true">&rarr;</i></a></p>
  <p class="cs-try__note">Open any figure to see what supports it, what conflicts, and what still needs a person.</p>
</div>
