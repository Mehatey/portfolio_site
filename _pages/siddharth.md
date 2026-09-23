---
layout: reel
title: Siddharth Mehta
permalink: /siddharth/
description: Everything Siddharth Mehta makes, in one scroll. Product, brand, spatial, AI, illustration, all shown as the finished thing.
---

{% assign B = site.baseurl %}

<section class="reel-hero">
  <p class="reel-hero__kicker">Siddharth Mehta · New York</p>
  <h1 class="reel-hero__name">Designs it. Builds it. Ships it.</h1>
  <p class="reel-hero__line">Product designer and creative technologist. Two Webby Awards, a Kyoorius, 100,000+ people using the work.</p>
  <p class="reel-hero__hint"><i></i>Scroll</p>
</section>

<!-- ── THE CUBE STORY ──────────────────────────────────────────────────
     A pinned WebGL section (assets/js/cube-story.js): the cube wakes,
     unfolds into who he is, folds into where he has worked, opens into
     how he works, walks through five materials, becomes a person, and
     breaks into voxels that gather into a small stroke cube. When it
     cannot run (phone, reduced motion, no GL), the about block below it
     is what shows; when it can, .is-live hides the block. -->
<section class="cube-story" id="cube-story" data-base="{{ B }}" aria-label="About Sid, through the cube">
  <div class="cs-pin">
    <div class="cs-stage"></div>
    <p class="cs-caption" aria-live="polite"></p>
  </div>
</section>

<section class="reel-about" id="about-static">
  <div class="reel-about__pic"><img src="{{ B }}/assets/img/sid_about.jpg" alt="Siddharth Mehta" loading="eager" decoding="async" /></div>
  <ul class="reel-about__facts">
    <li><span>Now</span>Design Engineer, Compete · New York</li>
    <li><span>Before</span>Deloitte Digital · EyeJack · Philips · Leaf</li>
    <li><span>School</span>MFA Design &amp; Technology, Parsons</li>
    <li><span>Makes</span>Interfaces, systems, brands, films, 3D, and the code that ships them</li>
    <li><span>Tools</span>Figma · TypeScript · Three.js · Unity · visionOS · TouchDesigner</li>
  </ul>
</section>

<div class="reel-marq" aria-hidden="true"><div class="reel-marq__track"><span>Product</span><span>Brand</span><span>Spatial</span><span>AI</span><span>Motion</span><span>Illustration</span><span>Film</span><span>Photography</span><span>3D</span><span>Product</span><span>Brand</span><span>Spatial</span><span>AI</span><span>Motion</span><span>Illustration</span><span>Film</span><span>Photography</span><span>3D</span></div></div>

<!-- 01 -->
<section class="reel-ch">
  <span class="reel-ch__num" aria-hidden="true">01</span>
  <div class="reel-ch__head">
    <h2 class="reel-ch__title">Product that shipped.</h2>
    <ul class="reel-ch__from"><li><a href="{{ B }}/m-health-fairview/">M Health Fairview</a></li><li><a href="{{ B }}/marriott/">Marriott</a></li><li><a href="{{ B }}/mool/">Mool</a></li><li><a href="{{ B }}/alpha-stockathon/">Alpha Stockathon</a></li></ul>
  </div>
  <!-- Sid: "try not to have too much mool fairview marriott in the scroll,
       ui ux, cause i will be presenting those." Down from eight plates to
       three; the KFC, Pizza Hut and Arby's pricing analyzer and Alpha
       Stockathon carry the rest of the chapter now. -->
  <div class="reel-grid">
    <div class="reel-plate reel-plate--wide" style="--ar: 16/9"><img src="{{ B }}/10.alpha/17.1.webp" alt="Alpha Stockathon, the pixel art overworld map" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--8"><img src="{{ B }}/assets/img/pricing-analyzer/kfc-dashboard.webp" alt="KFC pricing recommendations dashboard" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--tall" style="--ar: 3/4"><img src="{{ B }}/5.mool/0.webp" alt="Mool" loading="lazy" decoding="async" style="--pos: 50% 50%" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/10.alpha/12.1.webp" alt="Alpha Stockathon, a module chapter screen" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/assets/img/pricing-analyzer/pizzahut-portal.webp" alt="Pizza Hut pricing portal dashboard" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/assets/img/pricing-analyzer/arbys-onboarding.webp" alt="Arby's pricing analyzer onboarding" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/img/marriott/06-enroll-poster.jpg"><source src="{{ B }}/assets/img/marriott/06-enroll.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/assets/img/fairview/13-impact.webp" alt="Fairview impact" loading="lazy" decoding="async" style="--pos: 50% 0" /></div>
    <div class="reel-plate reel-plate--wide" style="--ar: 2000/550"><img src="{{ B }}/assets/img/pricing-analyzer/pizzahut-illustrations.webp" alt="Pizza Hut brand illustrations: pizza, delivery, the kitchen, the storefront" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--wide" style="--ar: 16/9"><img src="{{ B }}/assets/img/pricing-analyzer/error-states.webp" alt="Error state illustrations for the Yum! Brands pricing portals: Pizza Hut, Taco Bell, KFC, Arby's" loading="lazy" decoding="async" /></div>
  </div>
</section>

<!-- 02 -->
<section class="reel-ch">
  <span class="reel-ch__num" aria-hidden="true">02</span>
  <div class="reel-ch__head">
    <h2 class="reel-ch__title">Brand in the world.</h2>
    <ul class="reel-ch__from"><li><a href="{{ B }}/naavo/">Naavo</a></li><li><a href="{{ B }}/aananda/">Aananda</a></li><li><a href="{{ B }}/b-plus-b/">Broken and Beautiful</a></li><li><a href="{{ B }}/mool/">Mool</a></li></ul>
  </div>
  <div class="reel-grid">
    <div class="reel-plate reel-plate--8"><img src="{{ B }}/7.naavo/18.1.webp" alt="Naavo" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--tall" style="--ar: 3/4"><img src="{{ B }}/7.naavo/cover.webp" alt="Naavo box" loading="lazy" decoding="async" style="--pos: 50% 40%" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/9.aananda/cover.webp" alt="Aananda, the book" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/9.aananda/13.webp" alt="Aananda, the book" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--wide" style="--ar: 21/9"><img src="{{ B }}/7.naavo/24.webp" alt="Naavo at night" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/5.bb/d4.webp" alt="Broken and Beautiful" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/9.aananda/27.webp" alt="Aananda posters" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third reel-plate--fit" style="--plate-bg: #f4f2ec"><img src="{{ B }}/5.mool/2.2.png" alt="Mool brand" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--8"><img src="{{ B }}/5.bb/cover.webp" alt="Broken and Beautiful, on the street" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--tall" style="--ar: 3/4"><video autoplay muted loop playsinline preload="metadata"><source src="{{ B }}/7.naavo/3.2.mp4" type="video/mp4" /></video></div>
  </div>
</section>

<div class="reel-marq" aria-hidden="true"><div class="reel-marq__track"><span>The Met</span><span>Parsons</span><span>A library in Brooklyn</span><span>A street in Manhattan</span><span>A thesis show</span><span>The Met</span><span>Parsons</span><span>A library in Brooklyn</span><span>A street in Manhattan</span><span>A thesis show</span></div></div>

<!-- 03 -->
<section class="reel-ch">
  <span class="reel-ch__num" aria-hidden="true">03</span>
  <div class="reel-ch__head">
    <h2 class="reel-ch__title">Rooms people walked&nbsp;into.</h2>
    <ul class="reel-ch__from"><li><a href="{{ B }}/encoded/">Encoded</a></li><li><a href="{{ B }}/bloom/">Bodhi on Vision Pro</a></li><li><a href="{{ B }}/mind-your-feelings/">Mind Your Feelings</a></li><li><a href="{{ B }}/mandalas/">Bloom</a></li></ul>
  </div>
  <div class="reel-grid">
    <div class="reel-plate reel-plate--wide" style="--ar: 21/9"><img src="{{ B }}/1.met/0.jpg" alt="Encoded at The Met" loading="lazy" decoding="async" /></div>
    <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata"><source src="{{ B }}/1.met/6.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate"><img src="{{ B }}/1.met/12.webp" alt="Visitors activating Encoded" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--8"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/15.bloom-vp/cover.jpg"><source src="{{ B }}/15.bloom-vp/visitor-1.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate reel-plate--tall" style="--ar: 3/4"><img src="{{ B }}/6.mindu/7.1.webp" alt="Mind Your Feelings kiosk" loading="lazy" decoding="async" /></div>
    <!-- Sid: "add both of these together in the creative tech section."
         The Neural Landscape: the lit brain sculpture's build (Grasshopper
         script, 3D print) and the kiosk in the wild at a library. -->
    <div class="reel-plate reel-plate--wide" style="--ar: 21/9"><img src="{{ B }}/6.mindu/neural-landscape-process.webp" alt="The Neural Landscape: Grasshopper script, 3D print test, the lit brain sculpture" loading="lazy" decoding="async" /></div>
    <div class="reel-plate"><img src="{{ B }}/6.mindu/neural-landscape-kiosk.webp" alt="The Neural Landscape kiosk in a public library" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/15.bloom-vp/poster.jpg"><source src="{{ B }}/15.bloom-vp/lotus.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/6.mindu/cover2.webp" alt="Mind Your Feelings" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--tall" style="--ar: 3/4"><img src="{{ B }}/4.mandala/cover.jpg" alt="Bloom, EEG installation" loading="lazy" decoding="async" style="--pos: 70% 50%" /></div>
    <div class="reel-plate reel-plate--8"><video autoplay muted loop playsinline preload="metadata"><source src="{{ B }}/4.mandala/final-walking.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/4.mandala/2.webp" alt="Bloom" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/4.mandala/9.2.webp" alt="Bloom, the table" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--wide" style="--ar: 21/9"><video autoplay muted loop playsinline preload="metadata"><source src="{{ B }}/1.met/9.mp4" type="video/mp4" /></video></div>
    <!-- Sid: "add these to the scroll, they are creative tech." The live
         visuals, the headset piece and the generative mandala, in the
         chapter about rooms people stood in. -->
    <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/4.mandala/ct-projection-poster.jpg"><source src="{{ B }}/4.mandala/ct-projection.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/4.mandala/ct-headset-poster.jpg"><source src="{{ B }}/4.mandala/ct-headset.mp4" type="video/mp4" /></video></div>
    <!-- Sid: "one of them needs to be bigger so u can see the concept, dont
         make small media too small on scroll." The generative mandala runs
         the whole column. -->
    <div class="reel-plate reel-plate--wide" style="--ar: 16/9"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/4.mandala/ct-ripple-poster.jpg"><source src="{{ B }}/4.mandala/ct-ripple.mp4" type="video/mp4" /></video></div>
    <!-- Vision Pro passthrough: a tree in the station, a garden on the street. -->
    <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/15.bloom-vp/vp-subway-tree-poster.jpg"><source src="{{ B }}/15.bloom-vp/vp-subway-tree.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/15.bloom-vp/vp-street-garden-poster.jpg"><source src="{{ B }}/15.bloom-vp/vp-street-garden.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/4.mandala/ct-ar-mandalas-poster.jpg"><source src="{{ B }}/4.mandala/ct-ar-mandalas.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/4.mandala/ct-pixel-poster.jpg"><source src="{{ B }}/4.mandala/ct-pixel.mp4" type="video/mp4" /></video></div>
  </div>
</section>

<!-- 04 -->
<section class="reel-ch">
  <span class="reel-ch__num" aria-hidden="true">04</span>
  <div class="reel-ch__head">
    <h2 class="reel-ch__title">AI, designed and built.</h2>
    <ul class="reel-ch__from"><li><a href="{{ B }}/obin/">Obin</a></li><li><a href="{{ B }}/ledger/">Ledger</a></li><li><a href="{{ B }}/ai-self/">AI Self</a></li><li><a href="{{ B }}/ai-prototypes/">12 experiments</a></li></ul>
  </div>
  <div class="reel-grid">
    <!-- Sid: "on the obin ai section you are too zoomed in, dont zoom, keep
         original ratio." 16/9 was cropping a screen recording shot at
         1600x910; the box now matches the file's own ratio, so cover has
         nothing left to crop. -->
    <div class="reel-plate reel-plate--wide" style="--ar: 1600/910"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/16.obin/v1-agent-poster.jpg"><source src="{{ B }}/16.obin/v1-agent.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate reel-plate--8"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/2.ai-self/25.1-poster.jpg"><source src="{{ B }}/2.ai-self/25.1.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate reel-plate--tall" style="--ar: 3/4"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/2.ai-self/23-poster.jpg"><source src="{{ B }}/2.ai-self/23.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate reel-plate--third"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/2.ai-self/19-poster.jpg"><source src="{{ B }}/2.ai-self/19.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate reel-plate--third"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/2.ai-self/26-poster.jpg"><source src="{{ B }}/2.ai-self/26.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/2.ai-self/12.webp" alt="AI Self, choose an AI" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--8"><img src="{{ B }}/2.ai-self/cover.jpg" alt="AI Self, the dream" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--wide" style="--ar: 16/9"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/17.ledger/v3-review-poster.jpg"><source src="{{ B }}/17.ledger/v3-review.mp4" type="video/mp4" /></video></div>
  </div>
  <div class="reel-strip" aria-label="AI experiments">
    <div class="reel-strip__track">
          <!-- Sid: "the vids u have used in ai protos arent great and barely
               visible, use some from latent atlas and more visually strong
               ones." Stronger, more legible clips in. -->
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/latent-atlas/atlas-ar-poster.jpg"><source src="{{ B }}/assets/media/ai-prototypes/latent-atlas/atlas-ar.mp4" type="video/mp4" /></video></div>
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/latent-atlas/atlas-formation-poster.jpg"><source src="{{ B }}/assets/media/ai-prototypes/latent-atlas/atlas-formation.mp4" type="video/mp4" /></video></div>
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/mimic/mimic-ring-poster.jpg"><source src="{{ B }}/assets/media/ai-prototypes/mimic/mimic-ring.mp4" type="video/mp4" /></video></div>
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/mimic/mimic-specimens-poster.jpg"><source src="{{ B }}/assets/media/ai-prototypes/mimic/mimic-specimens.mp4" type="video/mp4" /></video></div>
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/vantage/transition-poster.webp"><source src="{{ B }}/assets/media/ai-prototypes/vantage/opening.mp4" type="video/mp4" /></video></div>
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/vantage/vantage-desk-poster.jpg"><source src="{{ B }}/assets/media/ai-prototypes/vantage/vantage-desk.mp4" type="video/mp4" /></video></div>
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/guise/GUISE-transforms-poster.webp"><source src="{{ B }}/assets/media/ai-prototypes/guise/GUISE-transforms.mp4" type="video/mp4" /></video></div>
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/feral/FERAL-walkthrough-poster.webp"><source src="{{ B }}/assets/media/ai-prototypes/feral/FERAL-walkthrough.mp4" type="video/mp4" /></video></div>
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/forecast/FORECAST-assembly-transition-poster.webp"><source src="{{ B }}/assets/media/ai-prototypes/forecast/FORECAST-assembly-transition.mp4" type="video/mp4" /></video></div>
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/watcher/WATCHER-dossiers-poster.webp"><source src="{{ B }}/assets/media/ai-prototypes/watcher/WATCHER-dossiers.mp4" type="video/mp4" /></video></div>
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/flatten/flatten-cloud-poster.jpg"><source src="{{ B }}/assets/media/ai-prototypes/flatten/flatten-cloud.mp4" type="video/mp4" /></video></div>
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/mirror/mirror-figure-poster.jpg"><source src="{{ B }}/assets/media/ai-prototypes/mirror/mirror-figure.mp4" type="video/mp4" /></video></div>
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/revision/revision-map-poster.jpg"><source src="{{ B }}/assets/media/ai-prototypes/revision/revision-map.mp4" type="video/mp4" /></video></div>
          <div class="reel-plate"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/assets/media/ai-prototypes/captcha/CAPTCHA-03-where-the-wild-begins-poster.webp"><source src="{{ B }}/assets/media/ai-prototypes/captcha/CAPTCHA-03-where-the-wild-begins.mp4" type="video/mp4" /></video></div>
    </div>
  </div>
</section>

<!-- 05 -->
<section class="reel-ch">
  <span class="reel-ch__num" aria-hidden="true">05</span>
  <div class="reel-ch__head">
    <h2 class="reel-ch__title">Drawn, filmed, modelled.</h2>
    <ul class="reel-ch__from"><li><a href="{{ B }}/illustrations/">Illustrations</a></li><li><a href="{{ B }}/cube-guy/">Cube of Creations</a></li></ul>
  </div>
  <div class="reel-grid">
    <div class="reel-plate reel-plate--8"><img src="{{ B }}/11.illu/12.1.webp" alt="Illustration" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--tall" style="--ar: 3/4"><img src="{{ B }}/11.illu/31.1.webp" alt="Chaat" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/2.cube/conception/6.1.webp" alt="Sketchbook" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/11.illu/13.webp" alt="Illustration" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/2.cube/2d/4-poster.jpg"><source src="{{ B }}/2.cube/2d/4.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate reel-plate--8"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/2.cube/cover.jpg"><source src="{{ B }}/2.cube/end of cube .mp4" type="video/mp4" /></video></div>
    <div class="reel-plate reel-plate--tall" style="--ar: 3/4"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/2.cube/3d/13-poster.jpg"><source src="{{ B }}/2.cube/3d/13.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/play/assets/hi/p66.webp" alt="Avengers, watercolour" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/play/assets/hi/p40.webp" alt="Horses, oil" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/play/assets/hi/p71.webp" alt="Buddha, oil" loading="lazy" decoding="async" style="--pos: 50% 30%" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/11.illu/18.webp" alt="Dashavatara icon set" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--8"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/2.cube/3d/10.1-web-poster.jpg"><source src="{{ B }}/2.cube/3d/10.1-web.mp4" type="video/mp4" /></video></div>
    <div class="reel-plate reel-plate--tall" style="--ar: 3/4"><video autoplay muted loop playsinline preload="metadata" poster="{{ B }}/2.cube/3d/10.2-web-poster.jpg"><source src="{{ B }}/2.cube/3d/10.2-web.mp4" type="video/mp4" /></video></div>
  </div>
</section>

<!-- 06 -->
<section class="reel-ch">
  <span class="reel-ch__num" aria-hidden="true">06</span>
  <div class="reel-ch__head">
    <h2 class="reel-ch__title">Photographed.</h2>
    <ul class="reel-ch__from"><li><a href="{{ B }}/play/">Play</a></li></ul>
  </div>
  <div class="reel-grid">
    <div class="reel-plate reel-plate--tall" style="--ar: 3/4"><img src="{{ B }}/play/assets/hi/p101.webp" alt="Himachal" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--8"><img src="{{ B }}/play/assets/hi/p10.webp" alt="Two silhouettes at sunset" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--8"><img src="{{ B }}/play/assets/hi/p11.webp" alt="Basketball, Harlem" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--tall" style="--ar: 3/4"><img src="{{ B }}/play/assets/hi/p102.webp" alt="A girl in Himachal" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/play/assets/hi/p104.webp" alt="Goats on the hill" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/play/assets/hi/p176.webp" alt="Jaipur" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/play/assets/hi/p119.webp" alt="A cat in an alley" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/play/assets/hi/p179.webp" alt="Jaipur" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--8"><img src="{{ B }}/play/assets/hi/p197.webp" alt="A dog, mid-air" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--tall" style="--ar: 3/4"><img src="{{ B }}/play/assets/hi/p181.webp" alt="Rain on the window" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/play/assets/hi/p1.webp" alt="A bead ball" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--third"><img src="{{ B }}/play/assets/hi/p160.webp" alt="Chefs" loading="lazy" decoding="async" /></div>
      <!-- Sid: "u can use these in photo section of scroll." Shot on iPhone,
         the campaign slides, with the concept legible. -->
    <div class="reel-plate reel-plate--wide" style="--ar: 16/9"><img src="{{ B }}/assets/img/soi/family.webp" alt="Shot on iPhone, by Family: children doing homework by torchlight" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--wide" style="--ar: 16/9"><img src="{{ B }}/assets/img/soi/escapism.webp" alt="Shot on iPhone, by Escapism: red light and motion streaks" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--wide" style="--ar: 16/9"><img src="{{ B }}/assets/img/soi/happiness.webp" alt="Shot on iPhone, by Happiness: two women laughing in the hills" loading="lazy" decoding="async" /></div>
    <div class="reel-plate reel-plate--wide" style="--ar: 16/9"><img src="{{ B }}/assets/img/soi/human-condition.webp" alt="Shot on iPhone, by the Human Condition: rain caught on a rail" loading="lazy" decoding="async" /></div>
</div>
</section>

<!-- 07 -->
<section class="reel-ch">
  <span class="reel-ch__num" aria-hidden="true">07</span>
  <div class="reel-ch__head">
    <h2 class="reel-ch__title">Recognition.</h2>
  </div>
  <div class="reel-awards">
    <div class="reel-award"><img src="{{ B }}/assets/img/badge_webby.webp" alt="Webby Award" loading="lazy" /><b>Webby · Best Use of AR</b><span>Encoded · 2026</span></div>
    <div class="reel-award"><img src="{{ B }}/assets/img/badge_webby.webp" alt="Webby Award" loading="lazy" /><b>Webby · Community Engagement</b><span>Encoded · 2026</span></div>
    <div class="reel-award"><img src="{{ B }}/assets/img/badge_kyoorius.png" alt="Kyoorius Design Award" loading="lazy" /><b>Kyoorius Design Award</b><span>Mool · 2021</span></div>
    <div class="reel-award"><b>MIT Reality Hack</b><span>2026</span></div>
  </div>
</section>

<section class="reel-close">
  <h2>Available to work. New York, or anywhere.</h2>
  <div class="reel-close__row">
    <a class="is-primary" href="mailto:sidmehtadesign@gmail.com">Email Sid</a>
    <a href="{{ B }}/assets/resume.pdf" target="_blank" rel="noopener">Résumé</a>
    <a href="https://www.linkedin.com/in/siddharth-mehta-35560916b/" target="_blank" rel="noopener">LinkedIn</a>
    <a href="{{ B }}/works/">All 16 projects</a>
  </div>
</section>
