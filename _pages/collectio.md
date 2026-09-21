---
layout: project
permalink: /collectio/
project_title: Collectio
proj_num: "17"
tagline: A municipal waste system for Panaji, Goa, designed around where its classifier fails rather than where it works. The truck delivers a weight. The belt says what was in it. The ward sees both. Each part only claims what it can actually know.
quick_read: >
  A municipal waste system for Panaji: a driver's route, a sorting camera running a network I trained from scratch, and a ward queue that holds what the model cannot vouch for.
category: AI · Civic systems
year: "2019 · 2026"
hero_bg: "radial-gradient(ellipse at 40% 45%, #121a14 0%, #0b100c 55%, #06080a 100%)"
hero_image: "assets/img/collectio/detect-final.webp"
hero_pos: "50% 50%"
hero_mode: artifact
meta:
  - label: Role
    value: Designer and engineer
  - label: Client
    value: Goa Waste Management
  - label: Scope
    value: Route, belt camera, ward queue
  - label: Tools
    value: PyTorch, JavaScript
  - label: Year
    value: "2019 to 2026"
highlights:
  - value: "72.1%"
    label: in the lab, on unseen photographs
  - value: "29%"
    label: on a raw crop off a real belt
  - value: "0"
    label: wrong dispatches after abstention
reflection: >
  72% is not a good number. That is why the product is built around abstention. A softmax always answers; the product should not. So before anything is sent the belt asks two more questions, have you seen this before and how sure are you, and fails either one to a person. The cost of that rule is somebody's afternoon, and the ward page shows the inspector hours it took, because pretending it is free is how a model loses trust.


  What is still wrong is named openly. The belt footage is generated reference footage; the tracking and every classification on it are real, but a real camera will bring dirt, glare and overlap the training set never saw. Six classes is not a municipality's waste stream. And 57.6% after reframing is the honest ceiling of a 494 KB network trained on studio photographs. The next version starts with the belt, not the lab.
refl_bg: "assets/img/collectio/flow-fail.webp"
next_project:
  title: "Obin"
  url: /obin/
  desc: An agent writes the memo. A person checks the numbers.
---

<style>
  /* ── THE FLOAT: what goes in the bin, rising over the description ──
     Sid: "that trash png image ... u have added a black bg rect behind it
     now it doesnt look like a png or that 3d scroll look i wanted. it could
     come up on top of the project description through a scroll, the text is
     behind it and these individual trash bag and bottle keep rising on top
     of it so u can partly see text but also partly see models."
     No plate. The four cut-outs live over the overview paragraph, each at
     its own depth; the scroll carries them up through the words and out
     the top, turning a little as they go. Reduced motion: they rest. */
  .proj-intro {
    position: relative;
    overflow: visible;
  }
  .col-float {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    overflow: visible;
    perspective: 1200px;
  }
  .col-float img {
    position: absolute;
    width: var(--w);
    left: var(--x);
    top: var(--y);
    transform-style: preserve-3d;
    will-change: transform;
    filter: drop-shadow(0 18px 24px rgba(0, 0, 0, 0.28));
    user-select: none;
  }
  .col-float__bin {
    --w: 15%;
    --x: 44%;
    --y: 10%;
    --d: 0.6;
    --r: -4;
  }
  .col-float__bottle {
    --w: 6.5%;
    --x: 70%;
    --y: -20%;
    --d: 1.15;
    --r: -22;
  }
  .col-float__bag {
    --w: 9%;
    --x: 17%;
    --y: -10%;
    --d: 0.9;
    --r: 14;
  }
  .col-float__wrapper {
    --w: 4.5%;
    --x: 62%;
    --y: 55%;
    --d: 1.4;
    --r: 30;
  }
  @media (max-width: 720px) {
    .col-float {
      display: none;
    }
  }
  /* ── 2019 versus 2026: one table, not paragraphs ─────────────────── */
  .col-table {
    max-width: none;
    margin: 40px 0 0;
    padding: 0;
    font-family: var(--font-head);
    font-size: clamp(14px, 1.2vw, 16px);
    line-height: 1.5;
    color: var(--ink);
  }
  .col-table table {
    width: 100%;
    border-collapse: collapse;
  }
  .col-table th,
  .col-table td {
    text-align: left;
    vertical-align: top;
    padding: 14px 18px 14px 0;
    border-top: 1px solid var(--line-2);
    width: 50%;
  }
  .col-table th {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 500;
    color: var(--ink-3);
    border-top: 0;
    padding-top: 0;
  }
  .col-table tr:last-child td {
    border-bottom: 1px solid var(--line-2);
  }
  .col-table em {
    font-style: normal;
    color: var(--ink-3);
  }
  /* ── CHAIN: the numbered steps ───────────────────────────────────── */
  .col-steps {
    max-width: none;
    margin: 40px 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0 24px;
    counter-reset: step;
  }
  .col-steps p {
    margin: 0;
    padding: 14px 0 0;
    border-top: 1px solid var(--line-2);
    font-family: var(--font-head);
    font-size: clamp(13px, 1.1vw, 15px);
    line-height: 1.5;
    color: var(--ink);
  }
  .col-steps p::before {
    counter-increment: step;
    content: counter(step, decimal-leading-zero);
    display: block;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    color: var(--ink-3);
    margin-bottom: 8px;
  }
  @media (max-width: 720px) {
    .col-steps {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px 20px;
    }
  }
  .col-founder video {
    width: 100%;
    display: block;
  }
</style>

<div class="col-float" id="col-float" aria-hidden="true">
  <img class="col-float__bag" src="{{ site.baseurl }}/assets/img/collectio/trash/bag.webp" alt="" loading="eager" decoding="async" />
  <img class="col-float__bin" src="{{ site.baseurl }}/assets/img/collectio/trash/bin.webp" alt="" loading="eager" decoding="async" />
  <img class="col-float__bottle" src="{{ site.baseurl }}/assets/img/collectio/trash/bottle.webp" alt="" loading="eager" decoding="async" />
  <img class="col-float__wrapper" src="{{ site.baseurl }}/assets/img/collectio/trash/wrapper.webp" alt="" loading="eager" decoding="async" />
</div>

<div class="cs-section"><span class="cs-section-label">Where it started</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;">The 2019 pitch, from interviews with panchayat staff and waste officials.</p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/2019/old-concept.webp" alt="The 2019 concept slide: a phone in a collector's hand showing the Collectio home screen" loading="lazy" decoding="async" /></div>

<div class="cs-grid">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/2019/old-roles.webp" alt="Collector and segregator home screens from 2019" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/2019/old-complaints.webp" alt="Complaints tracking screens from 2019 alongside the interview quotes" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;">The brand went further than the app: a kiosk, four bins, a truck.</p>
<div class="cs-rail cs-rail--art" tabindex="0" role="group" aria-label="Collectio brand pieces, scroll sideways">
  <figure class="cs-rail-item">
    <img src="{{ site.baseurl }}/assets/img/collectio/brand/kiosk.webp" alt="A man feeding a plastic bottle into a green Collectio reverse vending kiosk" loading="lazy" decoding="async" />
  </figure>
  <figure class="cs-rail-item">
    <img src="{{ site.baseurl }}/assets/img/collectio/brand/bins.webp" alt="Four Collectio bins in red, green, yellow and blue for plastic, glass, cans and paper" loading="lazy" decoding="async" />
  </figure>
  <figure class="cs-rail-item">
    <img src="{{ site.baseurl }}/assets/img/collectio/brand/truck.webp" alt="A green Collectio collection truck with Leemp Kor on its side and Hi I am a Collector on the door" loading="lazy" decoding="async" />
  </figure>
  <figure class="cs-rail-item">
    <img src="{{ site.baseurl }}/assets/img/collectio/2019/old-ia.webp" alt="The 2019 information architecture map of the app" loading="lazy" decoding="async" />
  </figure>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;">The 2019 dashboards. Every figure on them was typed in by somebody.</p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/2019/old-data.webp" alt="District and taluka analysis screens from 2019, with figures entered by hand" loading="lazy" decoding="async" /></div>

<div class="col-table">
  <table>
    <thead>
      <tr><th>2019</th><th>2026</th></tr>
    </thead>
    <tbody>
      <tr><td>Two roles, collector and segregator</td><td>The same two, plus the ward officer who reads them both</td></tr>
      <tr><td>Predetermined routes drawn by hand</td><td>14 real Panaji stops, solved before the shift on real streets</td></tr>
      <tr><td>Composition typed into a dashboard</td><td>Composition measured on the belt, and nowhere else</td></tr>
      <tr><td>Every report answered</td><td>Reports the model cannot vouch for are held, and named</td></tr>
      <tr><td>Accuracy assumed</td><td>Accuracy measured, including the bad numbers</td></tr>
    </tbody>
  </table>
</div>

<div class="cs-section"><span class="cs-section-label">The model</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;">Trained from scratch in PyTorch: four convolution blocks, 95,006 parameters, 494 KB. Here I am teaching it one object at a time.</p>
<div class="cs-bleed">
  <video width="1600" height="900" autoplay muted loop playsinline preload="none" style="width:100%;display:block;"><source data-src="{{ site.baseurl }}/assets/img/collectio/video/training-live.mp4" type="video/mp4" /></video>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video width="1600" height="798" autoplay muted loop playsinline preload="none" style="width:100%;display:block;"><source data-src="{{ site.baseurl }}/assets/img/collectio/video/training-set.mp4" type="video/mp4" /></video>
  </div>
  <div class="cs-grid-item">
    <video width="1600" height="796" autoplay muted loop playsinline preload="none" style="width:100%;display:block;"><source data-src="{{ site.baseurl }}/assets/img/collectio/video/augmentation.mp4" type="video/mp4" /></video>
  </div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;">One photograph, all the way through: crop, transform, every activation, the decision.</p>
<div class="cs-bleed">
  <video width="1600" height="798" autoplay muted loop playsinline preload="none" style="width:100%;display:block;"><source data-src="{{ site.baseurl }}/assets/img/collectio/video/forward-pass.mp4" type="video/mp4" /></video>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;">72.1% in the lab. 29% on a raw belt crop. 57.6% once the crop is reframed the way the network was trained.</p>
<div class="cs-grid">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/domain.webp" alt="Three crops side by side: a studio photograph, a raw belt crop, and the belt crop reframed" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-fail.webp" alt="The confusion matrix on the held out set and three bars for the drop from lab to belt" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;">Background subtraction against a median of 121 frames finds all 23 objects and tracks each one.</p>
<div class="cs-grid">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/pipeline.webp" alt="Four stages of detection: the frame, the temporal median, the difference, and the connected components" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/detect-final.webp" alt="The belt with all 23 objects boxed and classified" loading="lazy" decoding="async" /></div>
</div>

<div class="col-steps">
  <p>A median of 121 frames becomes the empty belt; anything that differs is an object.</p>
  <p>Blobs are opened, closed and dilated, then split where they are thin.</p>
  <p>Each blob is followed frame to frame with a prior that it moves down, not across.</p>
  <p>The six cleanest crops of each track are read, mirror averaged, and given one class.</p>
</div>

<div class="cs-section"><span class="cs-section-label">The three flows</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;">The collector: one number, one button, and the cost of a detour before he takes it.</p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-collector.webp" alt="Four phone screens of the collector app: the plan, the stop, the report, the handover ticket" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;">The intake camera tells the segregator which items it is not sure about. Four in ten come back held.</p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-belt.webp" alt="The belt running live with boxes on each object and the verdict panel beside it" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;">The ward officer. The model says what the waste is and where. It never decides what happens next.</p>
<div class="cs-grid">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-queue.webp" alt="The public reports queue with photographs" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-parsed.webp" alt="One parsed report with its decision trail: recognised, confidence, location" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;">Reports go to the nearest truck by real distance on real Panaji streets, 77 minutes down to 69.</p>
<div class="cs-grid">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-assign.webp" alt="Reports assigned to trucks on the Panaji map" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-track.webp" alt="Following one truck live along its route" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;">The ward. Six cards, every number from the truck, the belt, or the reports held.</p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-stand.webp" alt="The ward oversight page with six cards" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;">Clinton Vaz, founder of vRecycle, on what collection looks like on the ground in Goa.</p>
<div class="cs-bleed col-founder">
  <video width="1600" height="900" controls playsinline preload="metadata" poster="{{ site.baseurl }}/assets/img/collectio/founder-poster.webp"><source src="{{ site.baseurl }}/assets/img/collectio/video/founder.mp4" type="video/mp4" /></video>
</div>

<script>
  /* The float: the scroll carries each cut-out up through the overview.
     Progress runs from 0 (the overview's centre at the foot of the window)
     to 1 (at its head); an item starts below the paragraph and leaves
     above it, faster the nearer it is. */
  (function () {
    var host = document.getElementById("col-float");
    var over = document.getElementById("case-overview");
    if (!host || !over) return;
    over.appendChild(host);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var items = [].slice.call(host.querySelectorAll("img")).map(function (el) {
      var cs = getComputedStyle(el);
      return { el: el, d: parseFloat(cs.getPropertyValue("--d")) || 1, r: parseFloat(cs.getPropertyValue("--r")) || 0 };
    });
    var ticking = false;
    function place() {
      ticking = false;
      var r = over.getBoundingClientRect();
      var vh = innerHeight;
      if (r.bottom < -vh || r.top > vh * 2) return;
      var p = Math.max(-0.2, Math.min(1.2, 1 - (r.top + r.height / 2) / vh));
      items.forEach(function (it) {
        var y = (0.55 - p) * vh * 1.25 * it.d;
        var rz = it.r + (p - 0.5) * 26 * it.d;
        var ry = (p - 0.5) * 30 * it.d;
        var rx = -(p - 0.5) * 10 * it.d;
        it.el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) rotateZ(" + rz.toFixed(2) + "deg)";
      });
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(place);
    }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    place();
  })();
</script>
