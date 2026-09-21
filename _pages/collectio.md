---
layout: project
permalink: /collectio/
project_title: Collectio
proj_num: "17"
tagline: A municipal waste system for Panaji, Goa, designed around where its classifier fails rather than where it works. The truck delivers a weight. The belt says what was in it. The ward sees both. Each part only claims what it can actually know.
quick_read: >
  Six years after a student app for Goa's waste collectors, the same three roles rebuilt as one measured system: a driver's route on real Panaji streets, a sorting camera running a network I trained from scratch, and a ward queue that holds what the model cannot vouch for. 72% in the lab, 29% on a real belt, and a product built around that gap.
category: AI · Civic systems
year: "2019 · 2026"
hero_bg: "radial-gradient(ellipse at 40% 45%, #121a14 0%, #0b100c 55%, #06080a 100%)"
hero_image: "assets/img/collectio/detect-final.webp"
hero_pos: "50% 50%"
hero_mode: artifact
meta:
  - label: Year
    value: "2019, rebuilt 2026"
  - label: Client
    value: Goa Waste Management · concept
  - label: Role
    value: Research · Design · Model · Prototype
  - label: Tools
    value: PyTorch · JavaScript · OpenStreetMap
  - label: Model
    value: 95,006 parameters, trained from scratch
highlights:
  - value: "72.1%"
    label: on 383 photographs it had never seen
  - value: "29%"
    label: on a raw crop off a real belt
  - value: "0"
    label: wrong dispatches, with 42% held for a person
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
  /* ── THE FLOAT: the bin and what goes in it, moving with the scroll ──
     Four cut-outs on one plate. Each carries a depth; the scroll moves it
     by that depth and turns it a little in three axes, so the plate reads
     as a shallow diorama rather than a flat collage. Reduced motion: the
     items sit still in their resting arrangement. */
  .col-float {
    position: relative;
    margin: 40px auto 0;
    max-width: var(--content-max);
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 6px;
    background: linear-gradient(180deg, #e9ebe6 0%, #d9ddd5 100%);
    perspective: 1200px;
  }
  html[data-theme="dark"] .col-float {
    background: linear-gradient(180deg, #171b18 0%, #0f1210 100%);
  }
  .col-float img {
    position: absolute;
    width: var(--w);
    left: var(--x);
    top: var(--y);
    transform-style: preserve-3d;
    will-change: transform;
    filter: drop-shadow(0 18px 24px rgba(0, 0, 0, 0.22));
    pointer-events: none;
    user-select: none;
  }
  .col-float__bin {
    --w: 26%;
    --x: 37%;
    --y: 30%;
    --d: 0.35;
    --r: 0;
  }
  .col-float__bottle {
    --w: 13%;
    --x: 63%;
    --y: 14%;
    --d: 1.1;
    --r: -22;
  }
  .col-float__bag {
    --w: 17%;
    --x: 17%;
    --y: 20%;
    --d: 0.85;
    --r: 14;
  }
  .col-float__wrapper {
    --w: 9%;
    --x: 66%;
    --y: 60%;
    --d: 1.4;
    --r: 30;
  }
  /* ── 2019 versus 2026: one table, not paragraphs ─────────────────── */
  .col-table {
    max-width: var(--content-max);
    margin: 40px auto 0;
    padding: 0 var(--gutter);
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
    max-width: var(--content-max);
    margin: 40px auto 0;
    padding: 0 var(--gutter);
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

<div class="cs-intro">
  <p>In 2019 nobody in Goa could prove what had been collected. None of the 191 village panchayats had shown segregation data to the waste corporation in five years. Collectio began as a student app for the people doing the collecting. This is the same project six years on, rebuilt around one rule: every number on screen says where it came from.</p>
</div>

<div class="col-float" id="col-float" aria-hidden="true">
  <img class="col-float__bag" src="{{ site.baseurl }}/assets/img/collectio/trash/bag.webp" alt="" loading="eager" decoding="async" />
  <img class="col-float__bin" src="{{ site.baseurl }}/assets/img/collectio/trash/bin.webp" alt="" loading="eager" decoding="async" />
  <img class="col-float__bottle" src="{{ site.baseurl }}/assets/img/collectio/trash/bottle.webp" alt="" loading="eager" decoding="async" />
  <img class="col-float__wrapper" src="{{ site.baseurl }}/assets/img/collectio/trash/wrapper.webp" alt="" loading="eager" decoding="async" />
</div>

<div class="cs-section"><span class="cs-section-label">Where it started</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The 2019 pitch. Interviews with panchayat staff and waste officials: "Panchayat is too slow/corrupt." "Issuing penalties to non segregators takes too much time." Two roles came out of it, collectors and segregators, and both survive unchanged in the rebuild.</em></p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/2019/old-concept.webp" alt="The 2019 concept slide: a phone in a collector's hand showing the Collectio home screen" loading="lazy" decoding="async" /></div>

<div class="cs-grid">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/2019/old-roles.webp" alt="Collector and segregator home screens from 2019" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/2019/old-complaints.webp" alt="Complaints tracking screens from 2019 alongside the interview quotes" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The brand went further than the app: a kiosk that pays for bottles, four bins that name their material, and a truck that introduces itself.</em></p>
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

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The honest critique. The 2019 dashboards were right about what a ward officer needs to see and wrong about where it would come from: every figure on them was typed in by somebody. It assumed the data would arrive.</em></p>
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

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Trained from scratch in PyTorch so every failure could be measured. Four convolution blocks, 95,006 parameters, 494 KB once exported. The forward pass is rewritten by hand in JavaScript and agrees with PyTorch to under a millionth. It runs in the browser with no network calls. Here I am teaching it, one object at a time, and correcting it when it is wrong.</em></p>
<div class="cs-bleed">
  <video width="1600" height="900" autoplay muted loop playsinline preload="none" style="width:100%;display:block;"><source data-src="{{ site.baseurl }}/assets/img/collectio/video/training-live.mp4" type="video/mp4" /></video>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>What it learned from: TrashNet, 2,527 photographs by Yang and Thung at Stanford, split per class at seed 7 with the test set opened once, after the last epoch. And how each photograph is stretched twelve ways so the network stops memorising the studio.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <video width="1600" height="798" autoplay muted loop playsinline preload="none" style="width:100%;display:block;"><source data-src="{{ site.baseurl }}/assets/img/collectio/video/training-set.mp4" type="video/mp4" /></video>
  </div>
  <div class="cs-grid-item">
    <video width="1600" height="796" autoplay muted loop playsinline preload="none" style="width:100%;display:block;"><source data-src="{{ site.baseurl }}/assets/img/collectio/video/augmentation.mp4" type="video/mp4" /></video>
  </div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>One photograph, taken all the way through: the crop, the transform, the activations of every block, and the decision.</em></p>
<div class="cs-bleed">
  <video width="1600" height="798" autoplay muted loop playsinline preload="none" style="width:100%;display:block;"><source data-src="{{ site.baseurl }}/assets/img/collectio/video/forward-pass.mp4" type="video/mp4" /></video>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The break. 72.1% on 383 photographs it had never seen. 29% on a raw crop off a real belt. 57.6% once the crop is rebuilt into the framing the network was trained on: upright, at its photographed scale, read twice with a mirror. The second number is the honest one, and it is why the rest of the project exists.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/domain.webp" alt="Three crops side by side: a studio photograph, a raw belt crop, and the belt crop reframed" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-fail.webp" alt="The confusion matrix on the held out set and three bars for the drop from lab to belt" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Finding the objects at all. Thresholding on brightness found 13 and missed the newspaper, the box and the shoe. Background subtraction against a median of 121 frames finds 23 and tracks each one end to end. One real bug: the first filter measured sideways motion. This belt runs top to bottom. That single assumption discarded most of the real tracks.</em></p>
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

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The collector. One number and one button on the working screen. He confirms a pickup; he is never asked what material it is. A report lands mid run and he sees the cost of the detour before he decides. He leaves with a weighbridge ticket: gross, tare, net, countersigned. This ticket is the ward officer's monthly number, and nobody typed it. It does not show what was in the load, because a truck cannot know that.</em></p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-collector.webp" alt="Four phone screens of the collector app: the plan, the stop, the report, the handover ticket" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The intake camera, built for the segregator. It does not replace him; it tells him which items it is not sure about. Every box is tracked and every class is a live forward pass on the playing video. Four in ten come back held for a human and the chutes stay dark until a person picks one. The footage is generated reference footage; the tracking and every classification on it are real.</em></p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-belt.webp" alt="The belt running live with boxes on each object and the verdict panel beside it" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The ward officer. Fifteen public posts with photographs arrive overnight. The model does exactly two things: is this waste it recognises, and where is it. It never decides what happens next. Each report carries its full decision trail, and the ones it refused are named with the test they failed.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-queue.webp" alt="The public reports queue with photographs" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-parsed.webp" alt="One parsed report with its decision trail: recognised, confidence, location" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Accepted reports go to the nearest truck by real distance on real Panaji streets: 1,404 street centrelines, 755 buildings, 77 water polygons from OpenStreetMap. A greedy tour and then local swaps take the morning from 77.1 minutes to 69.9. Clicking a truck follows it live.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-assign.webp" alt="Reports assigned to trucks on the Panaji map" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-track.webp" alt="Following one truck live along its route" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Where the ward stands. Six cards, and every number on them comes out of one of the other two flows: the weight from the truck, the composition from the belt, the reports held and the inspector hours the holding costs. This is where the three meet.</em></p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/flow-stand.webp" alt="The ward oversight page with six cards" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Clinton Vaz, founder of vRecycle Waste Management Services, a waste collector in Goa. We spoke to him for Collectio about what collection looks like on the ground.</em></p>
<div class="cs-bleed col-founder">
  <video width="1600" height="900" controls playsinline preload="metadata" poster="{{ site.baseurl }}/assets/img/collectio/founder-poster.webp"><source src="{{ site.baseurl }}/assets/img/collectio/video/founder.mp4" type="video/mp4" /></video>
</div>

<script>
  /* The float: scroll drives depth, tilt and a slow turn. Progress runs
     from -1 (plate just below the viewport) to 1 (just above); each item
     moves by its own depth so the arrangement parallaxes as one scene. */
  (function () {
    var host = document.getElementById("col-float");
    if (!host || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var items = [].slice.call(host.querySelectorAll("img")).map(function (el) {
      var cs = getComputedStyle(el);
      return { el: el, d: parseFloat(cs.getPropertyValue("--d")) || 1, r: parseFloat(cs.getPropertyValue("--r")) || 0 };
    });
    var ticking = false;
    function place() {
      ticking = false;
      var r = host.getBoundingClientRect();
      var vh = innerHeight;
      if (r.bottom < -vh || r.top > vh * 2) return;
      var p = Math.max(-1, Math.min(1, 1 - (r.top + r.height / 2) / (vh / 2) ));
      items.forEach(function (it) {
        var y = -p * 56 * it.d;
        var rz = it.r + p * 18 * (it.d - 0.35);
        var ry = p * 22 * it.d;
        var rx = -p * 8 * it.d;
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
