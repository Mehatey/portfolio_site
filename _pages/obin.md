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
<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Accuracy is measured on figures the analyst chose to check, not on figures the agent chose to show. The count is disclosed. Which two never is.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/16.obin/05-header.webp" alt="The header strip: time on the memo against a firm baseline, 38 figures, 28 proved without you, 12 to review" loading="lazy" decoding="async" />
</div>

<div class="cs-intro">
  <p>Model confidence appears nowhere in the product. A score is 99 when a tool ran the arithmetic and the model never touched the number, and 77 when it read the figure off a slide someone wrote to persuade you. Both are backtested against two hundred and fourteen closed memos where the analyst's own number exists to compare against. Probability measures fluency, and a hallucinated figure often scores higher than a correct hedged one.</p>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The assumptions are stated on the page rather than defended afterwards, including the one that there was no user research.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/16.obin/06-thesis.webp" alt="The walkthrough page, stating the thesis and listing the four assumptions the design rests on" loading="lazy" decoding="async" />
</div>
