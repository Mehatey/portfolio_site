---
layout: project
permalink: /encoded/
project_title: ENCODED
proj_num: "00"
tagline: A guerrilla AR exhibition at the Metropolitan Museum of Art reinterpreting the American Wing through contemporary Indigenous perspectives.
category: AR · Exhibition
year: 2025
hero_bg: "radial-gradient(ellipse at 25% 55%, #0d1535 0%, #060b1f 50%, #010208 100%)"
hero_image: "1.met/0.png"
meta:
  - label: Year
    value: "2025"
    priority: dim
  - label: Client
    value: Amplifier.org
    priority: secondary
  - label: Role
    value: Creative Technologist
    priority: primary
  - label: Tools
    value: Polycam · Niantic VPS
    priority: dim
  - label: Learn More
    value: Read in Detail
    url: https://www.encodedatthemet.com/
    priority: cta
reflection: >
  Working inside a live museum taught me the environment always wins. Bronze statues we planned to use couldn't be scanned. Plans shifted on the floor. Things that held one day broke the next. The real work was staying adaptive across teams in LA and Melbourne, returning again and again until the activations locked in.


  What this project revealed is how physical AR actually is. Precision is not something you configure. It is something you earn through repetition, light, and timing. When alignment finally holds, it does not announce itself. It just belongs.
refl_bg: "1.met/12.png"
next_projects:
  - title: AI SELF_
    url: /ai-self/
    desc: A VR narrative where AI attempts to understand humanity through memory, conflict, and choice.
    bg: "radial-gradient(ellipse at 25% 35%, #0d1f4a 0%, #060d1f 45%, #020508 100%)"
  - title: ENCODED
    url: /encoded/
    desc: Guerrilla AR exhibition at the Met reinterpreting the American Wing through Indigenous perspectives.
    bg: "radial-gradient(ellipse at 25% 55%, #0d1535 0%, #060b1f 50%, #010208 100%)"
---

<!-- IMPACT -->
<div class="cs-intro">
  <div class="intro-inner">
    <span class="intro-label">Impact</span>
    <div class="cs-body">
      <p>Creative Technologist. Built the spatial AR layer by scanning artworks on-site and translating them into precise location-based activations across the American Wing. 25+ artworks transformed. 2,000+ user activations across the exhibition run.</p>
    </div>
  </div>
</div>

<!-- RECOGNITION -->
<div class="cs-intro">
  <div class="intro-inner">
    <span class="intro-label">Recognition</span>
    <div>
      <p class="cs-body" style="margin-bottom: 0;">Featured in Artnet, The Art Newspaper, and Agog for reinterpreting the American Wing through Indigenous perspectives.</p>
      <div class="press-row" style="display:flex;flex-wrap:wrap;gap:0;margin-top:24px;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);">
        <a href="https://news.artnet.com/art-world/unsanctioned-augmented-reality-indigenous-art-met-museum-2699689" target="_blank" rel="noopener" style="font-family:var(--font-head);font-size:14px;color:rgba(255,255,255,0.50);padding:16px 28px 16px 0;margin-right:28px;border-right:1px solid rgba(255,255,255,0.07);white-space:nowrap;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.88)'" onmouseout="this.style.color='rgba(255,255,255,0.50)'">Artnet ↗</a>
        <a href="https://agog.org/reframing-the-american-wing-encoded-at-the-metropolitan-museum-of-art/" target="_blank" rel="noopener" style="font-family:var(--font-head);font-size:14px;color:rgba(255,255,255,0.50);padding:16px 28px 16px 0;margin-right:28px;border-right:1px solid rgba(255,255,255,0.07);white-space:nowrap;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.88)'" onmouseout="this.style.color='rgba(255,255,255,0.50)'">Agog ↗</a>
        <a href="https://www.theartnewspaper.com/2025/10/13/indigenous-artists-unsanctioned-augmented-reality-exhibition-metropolitan-museum" target="_blank" rel="noopener" style="font-family:var(--font-head);font-size:14px;color:rgba(255,255,255,0.50);padding:16px 0;white-space:nowrap;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.88)'" onmouseout="this.style.color='rgba(255,255,255,0.50)'">The Art Newspaper ↗</a>
      </div>
    </div>
  </div>
</div>

<!-- COVER -->
<div class="cs-bleed-full">
  <img src="{{ site.baseurl }}/1.met/1.png" alt="ENCODED at the Met" />
</div>

<!-- PROCESS CHAPTER -->
<div class="cs-chapter">
  <canvas class="cs-chapter-water" id="chapter-water"></canvas>
  <div class="cs-chapter-inner">
    <span class="cs-chapter-title">Process</span>
  </div>
</div>

<!-- 01 SCANNING — text left, video right -->
<div class="cs-pair">
  <div class="cs-pair-text">
    <span class="cs-pair-label">Scanning</span>
    <div class="cs-body">
      <p>Capturing geometry on-site required multiple passes from different angles. Reflective bronze and gold surfaces made several sculptures impossible to scan. We dropped them and rethought on the spot.</p>
    </div>
  </div>
  <div class="cs-pair-media">
    <video autoplay muted loop playsinline preload="auto">
      <source src="{{ site.baseurl }}/1.met/2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- Scanning secondary — video left, text right -->
<div class="cs-pair cs-pair--reverse">
  <div class="cs-pair-text">
    <span class="cs-pair-label">On-site</span>
    <div class="cs-body">
      <p>Each visit meant recalibrating. Light changed, crowds shifted, and scans that worked one day failed the next. The process was as physical as the artworks themselves.</p>
    </div>
  </div>
  <div class="cs-pair-media cs-pair-media--no-fade">
    <video autoplay muted loop playsinline preload="auto">
      <source src="{{ site.baseurl }}/1.met/3.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 02 TESTING — text left, video right -->
<div class="cs-pair">
  <div class="cs-pair-text">
    <span class="cs-pair-label">Testing</span>
    <div class="cs-body">
      <p>Alignments drifted between visits. Things that worked one day broke the next. Testing meant returning, rescanning, and holding until the mesh stayed true.</p>
    </div>
  </div>
  <div class="cs-pair-media cs-pair-media--no-fade">
    <video autoplay muted loop playsinline preload="auto">
      <source src="{{ site.baseurl }}/1.met/4.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="auto">
    <source src="{{ site.baseurl }}/1.met/5.mp4" type="video/mp4" />
  </video>
</div>

<!-- 03 ACTIVATION — text left, video right -->
<div class="cs-pair">
  <div class="cs-pair-text">
    <span class="cs-pair-label">Activation</span>
    <div class="cs-body">
      <p>Final activations placed digital content precisely over physical artworks, letting the narrative emerge directly in the gallery. When it holds, it does not feel added on top. It feels like it belongs there.</p>
    </div>
  </div>
  <div class="cs-pair-media">
    <video autoplay muted loop playsinline preload="auto">
      <source src="{{ site.baseurl }}/1.met/6.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- FINAL OUTCOME -->
<div class="cs-chapter">
  <canvas class="cs-chapter-water" id="gallery-water"></canvas>
  <div class="cs-chapter-inner">
    <span class="cs-chapter-title">Final Outcome</span>
  </div>
</div>

<!-- FEATURED ARTISTS -->
<div class="cs-row">
  <div class="cs-content">
    <span class="cs-pair-label">Featured Artists</span>
    <div class="cs-body">
      <p class="cs-artists-credits">Amelia Winger-Bearskin · Bear Fox · Bird x Bird · Cannupa Hanska Luger · Cass Gardiner · Demian DinéYazhi´ · Lite Brite Neon · Flechas · Jarrette Werk · Jeremy Dennis · Josué Rivas · Katsitsionni Fox · Lokotah Sanborn · Mali Obomsawin · Mer Young · Nicholas Galanin · Priscilla Dobler Dzul · Skawennati</p>
      <p style="margin-top:1.6em;"><a href="https://www.encodedatthemet.com/" target="_blank" rel="noopener">View Full Exhibition →</a></p>
    </div>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="auto">
    <source src="{{ site.baseurl }}/1.met/7.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="auto">
    <source src="{{ site.baseurl }}/1.met/8.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="auto">
    <source src="{{ site.baseurl }}/1.met/9.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="auto">
    <source src="{{ site.baseurl }}/1.met/10.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed-full" style="position:relative;">
  <video id="promo-video" autoplay muted loop playsinline preload="auto">
    <source src="{{ site.baseurl }}/1.met/11.mp4" type="video/mp4" />
  </video>
  <button class="cover-audio-btn muted" onclick="const v=document.getElementById('promo-video');v.muted=!v.muted;this.classList.toggle('muted');" aria-label="Toggle audio">
    <svg class="audio-icon-on" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.49 4.49 0 002.5-3.5zM14 3.23v2.06a6.51 6.51 0 010 13.42v2.06A8.51 8.51 0 0014 3.23z"/></svg>
    <svg class="audio-icon-off" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13 3l3.6-3.6-1.4-1.4L15 10.2l-3.2-3.2-1.4 1.4L13.8 12l-3.4 3.4 1.4 1.4L15 13.6l3.2 3.2 1.4-1.4L16.2 12z"/></svg>
  </button>
</div>
