---
layout: project
permalink: /obin/
project_title: Obin
proj_num: "15"
tagline: A verification workspace for AI-written venture debt memos. The agent drafts in minutes, then an analyst can see which claims are proved, unsupported, or still require judgment.
quick_read: >
  I designed and built a concept workflow for reviewing an AI-written credit memo. It makes every machine assertion inspectable, orders unresolved claims by risk, and deliberately returns sampled claims to a person instead of presenting automation as certainty.
cover_summary: A verification workspace that turns an AI-drafted credit memo into claims, evidence, and decision points for an analyst.
category: Agentic AI · Fintech
year: "2026"
hero_bg: "radial-gradient(ellipse at 40% 45%, #11151c 0%, #0a0d12 55%, #05070a 100%)"
hero_image: "16.obin/00-full.webp"
og_image: "16.obin/v1-agent-poster.jpg"
hero_pos: "50% 30%"
hero_mode: artifact
meta:
  - label: Year
    value: "2026"
  - label: Client
    value: Obin · concept
  - label: Role
    value: Product design · Front-end prototype
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
decisions:
  - choice: "Marked every machine-asserted figure with its own evidence state instead of shipping a clean-looking memo"
    why: >
      An agent that drafts in minutes and looks finished is the problem, not the fix: a well written memo with thirty eight numbers in it and no way to tell which the machine invented just moves the four hours of checking onto the analyst. Underlining proof, conflict, and missing support at reading speed means the speed the agent saved actually reaches the person reviewing it.
    tradeoff: >
      The workflow is a concept, so the interface identifies inferred behaviour rather than presenting it as validated. It has not been tested against a real analyst's workload.
  - choice: "Ordered the review queue by risk rather than by the memo's own order"
    why: >
      The most consequential unsupported claim should be the first thing a reviewer sees, not whatever the agent happened to write first.
    tradeoff: >
      The ordering assumption itself, crossing debt load with evidence reliability, is the first thing that needs testing with venture debt analysts under real time pressure.
  - choice: "Disclosed that two of the twelve queued figures are spot checks drawn at random, without disclosing which two"
    why: >
      It answers the strongest objection to the whole product: what if a wrong figure sits in the twenty eight the agent already marked proved and nobody ever looks at. Measuring accuracy only on what the agent chose to show would let the system grade its own homework.
    tradeoff: >
      An analyst who knows a sample exists may work all twelve rows harder, which biases the measured accuracy upward. Blind on both count and identity would be cleaner science. I took the disclosed version anyway: a measurement that flatters slightly is recoverable, a sampling mechanism a compliance reviewer finds undisclosed is not.
  - choice: "Split the two things the product learns from into separate loops: outcomes train the accuracy score, decisions train what the agent surfaces next time"
    why: >
      If analyst agreement trained the accuracy number, the system would learn to flatter the analyst instead of to be correct. Keeping the loops apart is the difference between a tool that gets more agreeable and one that gets more right.
    tradeoff: >
      It means waiting on real outcomes, audited statements, tripped covenants, to move the one number that matters most, which is slower than training on agreement would have been.
  - choice: "Made the one metric the product claims to improve, an analyst's attention time, pause itself after 45 seconds idle or when the tab is hidden"
    why: >
      A throughput claim measured dishonestly would make the whole product's premise hypocritical. The clock only runs while someone is actually working.
    tradeoff: >
      None taken. A metric that cannot be trusted is worse than no metric, and this was the cheap way to make sure it could be.
reflection: >
  The thing I keep coming back to is that the agent made the analyst's job worse before it made it better. Four hours became four minutes, and what came out the other side was a well written memo with thirty eight numbers in it and no way to tell which the machine had invented. So the analyst checked all thirty eight. The speed went somewhere, but not to them.

  The first test would examine the ordering assumption: whether debt load crossed with evidence reliability is the right sort. The workflow is a concept, so the interface identifies inferred behavior instead of presenting it as validated.
refl_bg: "16.obin/01-figures.webp"
next_project:
  title: "Ledger"
  url: /ledger/
---

<div class="cs-intro">
  <p>Obin is a concept workflow I designed and built around one question: after an agent writes a credit memo, how does an analyst know what deserves attention? Every machine-written figure carries its evidence state. The review queue starts with the highest-risk unresolved claim.</p>
</div>

<div class="cs-section"><span class="cs-section-label">The run</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The workflow decision: draft fast, expose evidence immediately, then stop when judgment is required.</em></p>
<div class="cs-bleed">
  <video width="1600" height="910" autoplay muted loop playsinline preload="none" aria-label="The Obin agent reading a data room, drafting a credit memo with each asserted figure marked, then halting and listing four decisions for a person">
    <source data-src="{{ site.baseurl }}/16.obin/v1-agent.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-section"><span class="cs-section-label">The verification layer</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The interface makes authorship and evidence state legible at reading speed: human writing in serif, machine assertions in monospace, and an underline for proof, conflict, or missing support.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/16.obin/01-figures.webp" alt="A credit memo where every machine-asserted figure is set in monospace with a coloured underline: blue for proved, amber for conflict, red for unsupported" loading="lazy" decoding="async" />
</div>

<div class="cs-compare" data-reveal>
  <div class="cs-compare__tabs" role="tablist" aria-label="Queue order">
    <button type="button" data-compare-tab="a" class="is-active">Document order</button>
    <button type="button" data-compare-tab="b">Risk order</button>
  </div>
  <div class="cs-compare__stage">
    <img
      class="is-active"
      data-compare-img="a"
      src="{{ site.baseurl }}/16.obin/03-document-order.webp"
      alt="The queue in the order the memo wrote it, lien buried at position nine"
      loading="lazy"
      decoding="async"
    />
    <img
      data-compare-img="b"
      src="{{ site.baseurl }}/16.obin/02-risk-order.webp"
      alt="The same queue reordered by risk, the senior blanket lien now first"
      loading="lazy"
      decoding="async"
    />
  </div>
  <p class="cs-compare__note" data-compare-note="a">The memo's own order. The blanket lien, the one fact that changes the recommendation, sits ninth.</p>
  <p class="cs-compare__note" data-compare-note="b" hidden>Sorted by risk instead. Same data, same agent, one toggle: the lien moves to first.</p>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/16.obin/04-review.webp" alt="The verification pane showing the source record beside what the agent did with it" loading="lazy" decoding="async" />
</div>

<div class="cs-section"><span class="cs-section-label">What I built</span></div>

<div class="cs-intro">
  <p>The working prototype connects four states that are usually split across tools: the agent run, the drafted memo, a risk-ordered verification queue, and the source record behind each figure. The analyst can move from an assertion to its evidence without leaving the memo, then advance, hold, or pass the review with private notes attached.</p>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>This is the memo running live, not a recording of it. Open a figure, check what the blue, amber, and red underlines actually mean.</em></p>
<div class="cs-embed">
  <div class="cs-embed__bar">
    <span>OBIN · LIVE</span>
    <a href="{{ site.baseurl }}/ai-prototypes/obin/" target="_blank" rel="noopener">Open full screen &rarr;</a>
  </div>
  <iframe
    src="{{ site.baseurl }}/ai-prototypes/obin/"
    title="Obin, the live verification prototype"
    loading="lazy"
  ></iframe>
</div>

<div class="cs-section"><span class="cs-section-label">Result</span></div>

<div class="cs-intro">
  <p>Obin is a designed and built concept, not a deployed lending product. It demonstrates a review model in which automation makes its evidence visible and stops at judgment. The next step is testing the queue with venture debt analysts to learn whether the risk ordering matches how they investigate a memo under time pressure.</p>
</div>

<div class="cs-intro cs-try">
  <p><a class="cs-try__link" href="{{ site.baseurl }}/ai-prototypes/obin/"><span>Open the Obin prototype</span><i aria-hidden="true">&rarr;</i></a></p>
  <p class="cs-try__note">Open any figure to see what supports it, what conflicts, and what still needs a person.</p>
</div>
