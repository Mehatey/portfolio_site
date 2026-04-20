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
refl_type: Testimonial
reflection: >
  Siddharth took ownership of on-site 3D scanning and spatial deployment for ENCODED at the Metropolitan Museum of Art. He handled the full pipeline from Polycam capture to Niantic Lightship integration, remaining persistent through unstable uploads and inconsistent scans. His ability to work discreetly within the museum, collaborate across LA and Melbourne, and contribute beyond his core scope made him a strong and dependable part of the team.
refl_source: Stuart Campbell
refl_role: Founder, EyeJack
refl_avatar: "1.met/stuart.png"
refl_bg: "1.met/12.png"
hide_overview: true
next_projects:
  - title: AI SELF_
    url: /ai-self/
    desc: A VR narrative where AI attempts to understand humanity through memory, conflict, and choice.
    bg: "radial-gradient(ellipse at 25% 35%, #0d1f4a 0%, #060d1f 45%, #020508 100%)"
  - title: Mind Your Feelings
    url: /mind-your-feelings/
    desc: An immersive installation exploring emotional landscapes through spatial interaction and light.
    bg: "radial-gradient(ellipse at 25% 55%, #1a0d35 0%, #0d0620 50%, #050210 100%)"
---

<style>
  /* ── LABELS: match cube mono style ── */
  .intro-label,
  .cs-pair-label {
    font-family: var(--font-mono) !important;
    font-size: 11px !important;
    letter-spacing: 0.18em !important;
    text-transform: uppercase !important;
    color: rgba(255,255,255,0.28) !important;
    font-weight: 400 !important;
    margin-bottom: 12px !important;
  }

  /* ── BODY TEXT ── */
  .cs-pair-text .cs-body {
    font-size: clamp(14px, 1.3vw, 16px);
    color: rgba(255,255,255,0.68);
    line-height: 1.75;
  }
  .cs-intro {
    padding: 0 var(--gutter) 40px;
    gap: 16px;
  }
  .cs-intro .cs-body {
    font-size: clamp(14px, 1.4vw, 17px);
    color: rgba(255,255,255,0.68);
  }
</style>

<!-- IMPACT -->
<div class="cs-intro">
  <div class="intro-inner">
    <span class="intro-label">Impact</span>
    <div class="cs-body">
      <p>Built the spatial AR layer across the American Wing. 25+ artworks scanned and activated. 2,000+ user interactions across the exhibition run.</p>
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
      <p>Live museum, security watching, visitors in frame. Reflective bronze and gilded frames broke depth mapping. Dropped what wouldn't hold, adapted on site.</p>
    </div>
  </div>
  <div class="cs-pair-media">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/1.met/2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- Scanning secondary — video left, text right -->
<div class="cs-pair">
  <div class="cs-pair-text">
    <span class="cs-pair-label">Pipeline</span>
    <div class="cs-body">
      <p>10 to 15 scans per sculpture, frequently failing. Once stable, Melbourne and LA layered AR content while I returned to verify alignment in the live gallery.</p>
    </div>
  </div>
  <div class="cs-pair-media cs-pair-media--no-fade">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/1.met/3.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- 02 ALIGNMENT — text left, video right -->
<div class="cs-pair">
  <div class="cs-pair-text">
    <span class="cs-pair-label">Alignment</span>
    <div class="cs-body">
      <p>Content that locked one day would drift the next. Every return visit meant recalibrating. Precision was earned through repetition.</p>
    </div>
  </div>
  <div class="cs-pair-media cs-pair-media--no-fade">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/1.met/4.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/1.met/5.mp4" type="video/mp4" />
  </video>
</div>

<!-- 03 ACTIVATION — text left, video right -->
<div class="cs-pair">
  <div class="cs-pair-text">
    <span class="cs-pair-label">Activation</span>
    <div class="cs-body">
      <p>Digital content placed precisely over physical artworks. When it holds, it does not feel added. It belongs there.</p>
    </div>
  </div>
  <div class="cs-pair-media">
    <video autoplay muted loop playsinline preload="none">
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
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/1.met/7.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/1.met/8.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/1.met/9.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/1.met/10.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed-full" style="position:relative;">
  <video id="promo-video" autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/1.met/11.mp4" type="video/mp4" />
  </video>
  <button class="cover-audio-btn muted" onclick="const v=document.getElementById('promo-video');v.muted=!v.muted;this.classList.toggle('muted');" aria-label="Toggle audio">
    <svg class="audio-icon-on" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.49 4.49 0 002.5-3.5zM14 3.23v2.06a6.51 6.51 0 010 13.42v2.06A8.51 8.51 0 0014 3.23z"/></svg>
    <svg class="audio-icon-off" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13 3l3.6-3.6-1.4-1.4L15 10.2l-3.2-3.2-1.4 1.4L13.8 12l-3.4 3.4 1.4 1.4L15 13.6l3.2 3.2 1.4-1.4L16.2 12z"/></svg>
  </button>
</div>
