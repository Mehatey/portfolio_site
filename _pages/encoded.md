---
layout: project
pillar: ai
permalink: /encoded/
project_title: Encoded
proj_num: "00"
tagline: >
  A guerrilla AR exhibition at the Metropolitan Museum of Art, reinterpreting the American Wing through contemporary Indigenous perspectives. 25 artworks scanned and activated using Polycam and Niantic Lightship VPS, generating over 2,000 user activations. Recognized with two Webby Awards and featured in Artnet and Agog.
category: AR · Exhibition
year: 2025
hero_bg: "radial-gradient(ellipse at 25% 55%, #0d1535 0%, #060b1f 50%, #010208 100%)"
hero_image: "1.met/0.jpg"
og_image: "assets/img/og/encoded.jpg"
meta:
  - label: Year
    value: "2025"
  - label: Client
    value: Amplifier.org
  - label: Role
    value: Creative Technologist
  - label: Tools
    value: Polycam · Niantic VPS
  - label: Learn More
    value: Read in Detail
    url: https://www.encodedatthemet.com/
highlights:
  - value: "25"
    label: artworks activated
  - value: "2,000+"
    label: visitor activations
  - value: "2×"
    label: Webby Awards
quick_read: >
  Built the on-site capture and location-based AR pipeline that activated 25 American Wing artworks through contemporary Indigenous perspectives and reached more than 2,000 visitors.
award_badge: "2x Webby Awards 2026"
award_image: "assets/img/badge_webby.webp"
refl_type: Testimonial
reflection: >
  Siddharth took ownership of on-site 3D scanning and spatial deployment for Encoded at the Metropolitan Museum of Art. He handled the full pipeline from Polycam capture to Niantic Lightship integration, remaining persistent through unstable uploads and inconsistent scans. His ability to work discreetly within the museum, collaborate across LA and Melbourne, and contribute beyond his core scope made him a strong and dependable part of the team.
refl_source: Stuart Campbell
refl_role: "Founder: EyeJack"
refl_bg: "1.met/12.png"
decisions:
  - choice: "Captured 25 artworks on a phone instead of bringing production gear into the museum"
    why: >
      The exhibition was unsanctioned. Anything that read as a production setup (a rig, lighting, a tripod) would
      have ended the project on the first day. A phone in a gallery is invisible. The entire capture pipeline was
      designed around what one person can do while looking like an ordinary visitor.
    tradeoff: >
      Scan quality was hostage to gallery lighting and to how long I could circle an object without drawing
      attention. Several pieces took four or five attempts, and a few in the darker rooms never reached a mesh I was
      willing to ship.
  - choice: "Anchored to Niantic Lightship VPS rather than to markers or GPS"
    why: >
      The overlays had to sit registered to the actual artwork, inside a building where GPS is useless and where you
      cannot attach a marker to a wall. Visual positioning localises against the space itself, which was the only
      method that left no physical trace in a place we had no permission to alter.
    tradeoff: >
      It made the work dependent on a third-party localisation service and on visitors carrying a compatible device.
      Where the VPS map was thin the content drifted, and there is no graceful degradation: it either localises or
      it does not.
  - choice: "Let the artists' interpretations lead and kept the AR craft quiet"
    why: >
      The reflex in AR is to prove the technology. Here the technology was a delivery mechanism for someone else's
      reading of a museum object, and any effect that pulled attention toward the rendering pulled it away from the
      argument. Transitions are slow, there are no particles, and nothing floats that does not need to.
    tradeoff: >
      It reads as less impressive in a thirty-second clip. The work is legible in the room and undersells itself in
      a reel, which is a real cost for a project whose reach depends on travelling as video.
next_steps: >
  The obvious next move is durability. The piece is tied to a VPS map of a building I do not control; if the
  service changes or the American Wing is rearranged, the work degrades silently and nobody finds out. I would
  want a capture-and-host path that does not rest on one vendor. Beyond that, we measured activations, which
  counts arrivals rather than attention. I would instrument how long visitors actually stayed with each artwork,
  because that is the number the curatorial argument really rests on.
next_project:
  title: "Bloom"
  url: /bloom/
  desc: The thesis that grew out of asking who we are.
---

<style>
  .cs-bleed { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-bleed img { object-fit: contain !important; height: auto !important; }
  .cs-bleed::before { display: none !important; }
  .cs-grid-item { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-grid-item img { object-fit: cover !important; height: 100% !important; }
  .cs-grid::before { display: none !important; }
  .cs-grid-item::before { display: none !important; }
  .cs-grid { gap: 16px !important; align-items: stretch !important; }
  .cs-bleed { margin-top: 40px !important; }
  .cs-bleed + .cs-bleed { margin-top: 40px !important; }
  .cs-grid { margin-top: 40px !important; }
  .cs-grid + .cs-bleed, .cs-bleed + .cs-grid { margin-top: 40px !important; }
  .cube-cap { margin: 40px 0 0; }
  .cube-cap + .cs-bleed, .cube-cap + .cs-grid { margin-top: 16px !important; }
  .cube-cap--above + .cs-bleed, .cube-cap--above + .cs-grid { margin-top: 8px !important; }
  .enc-award-tile:hover, .enc-award-tile:focus-visible { border-color: rgba(156,198,255,0.34) !important; background: rgba(156,198,255,0.04) !important; }

  /* These two tiles are the only outbound links on the page that were not
     carrying the house ↗ (see .xarrow in design_tokens), because the mark was
     written for inline text links and a card has no end-of-sentence to sit at.
     It gets a corner instead: same slot, same diagonal handoff on hover, just
     pinned to the top-right of the tile rather than trailing the label. The
     tile becomes the positioning context; the span stays a DIRECT child of the
     <a> so the `:hover > .xarrow` rule in design_tokens still reaches it. */
  .enc-award-tile { position: relative; padding-right: 54px !important; }
  .enc-award-tile .xarrow {
    position: absolute;
    top: 18px;
    right: 20px;
    margin-left: 0;
    font-size: 13px;
    color: rgba(255,255,255,0.32);
    transition: color 0.2s;
  }
  .enc-award-tile:hover .xarrow,
  .enc-award-tile:focus-visible .xarrow { color: rgba(156,198,255,0.8); }
  html[data-theme="light"] .enc-award-tile .xarrow { color: rgba(7,9,15,0.32); }
  html[data-theme="light"] .enc-award-tile:hover .xarrow,
  html[data-theme="light"] .enc-award-tile:focus-visible .xarrow { color: rgba(35,80,127,0.85); }

  /* Light mode. The tiles and the artist list are written inline for the dark
     shell — white at 0.35-0.85 alpha disappears on cream, so these have to
     outrank the style attribute. */
  html[data-theme="light"] .enc-award-tile { border-color: rgba(7,9,15,0.12) !important; }
  html[data-theme="light"] .enc-award-tile:hover,
  html[data-theme="light"] .enc-award-tile:focus-visible {
    border-color: rgba(35,80,127,0.4) !important;
    background: rgba(35,80,127,0.04) !important;
  }
  html[data-theme="light"] .enc-award-kicker { color: rgba(35,80,127,0.9) !important; }
  html[data-theme="light"] .enc-award-title { color: rgba(7,9,15,0.88) !important; }
  html[data-theme="light"] .enc-award-sub { color: rgba(7,9,15,0.5) !important; }
  html[data-theme="light"] .enc-artists { color: rgba(7,9,15,0.66) !important; }
  @keyframes projBreathe {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.008) translateY(-3px); }
  }
</style>

<!-- Awards -->
<div style="padding:0 var(--gutter);margin-top:40px;display:flex;gap:16px;flex-wrap:wrap;">
  <a href="https://winners.webbyawards.com/2026/apps-software-immersive/immersive-experiences/best-community-engagement/365377/encoded-an-unsanctioned-takeover-of-the-metropolitan-museum-of-art" target="_blank" rel="noopener" class="enc-award-tile" style="flex:1;min-width:240px;border:1px solid rgba(255,255,255,0.08);padding:20px 24px;text-decoration:none;transition:border-color 0.2s,background 0.2s;">
    <p class="enc-award-kicker" style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(156,198,255,0.75);margin-bottom:8px;">Webby Winner · 2026</p>
    <p class="enc-award-title" style="font-family:var(--font-head);font-size:15px;color:rgba(255,255,255,0.85);font-weight:500;margin-bottom:4px;">Best Use of Augmented Reality</p>
    <p class="enc-award-sub" style="font-family:var(--font-mono);font-size:10px;color:rgba(255,255,255,0.35);">Apps, Software & Immersive</p>
    <span class="xarrow" aria-hidden="true"></span>
  </a>
  <a href="https://winners.webbyawards.com/2026/apps-software-immersive/immersive-experiences/best-community-engagement/365377/encoded-an-unsanctioned-takeover-of-the-metropolitan-museum-of-art" target="_blank" rel="noopener" class="enc-award-tile" style="flex:1;min-width:240px;border:1px solid rgba(255,255,255,0.08);padding:20px 24px;text-decoration:none;transition:border-color 0.2s,background 0.2s;">
    <p class="enc-award-kicker" style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(156,198,255,0.75);margin-bottom:8px;">Webby Winner · 2026</p>
    <p class="enc-award-title" style="font-family:var(--font-head);font-size:15px;color:rgba(255,255,255,0.85);font-weight:500;margin-bottom:4px;">Best Community Engagement</p>
    <p class="enc-award-sub" style="font-family:var(--font-mono);font-size:10px;color:rgba(255,255,255,0.35);">Apps, Software & Immersive</p>
    <span class="xarrow" aria-hidden="true"></span>
  </a>
</div>

<!-- Press -->
<div style="display:flex;gap:0;margin:24px var(--gutter) 0;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);">
  <a href="https://news.artnet.com/art-world/unsanctioned-augmented-reality-indigenous-art-met-museum-2699689" target="_blank" rel="noopener" class="cs-watch-link" style="font-family:var(--font-mono);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.42);padding:14px 24px 14px 0;margin-right:24px;border-right:1px solid rgba(255,255,255,0.07);white-space:nowrap;text-decoration:none;transition:color 0.2s;">Artnet<span class="xarrow" aria-hidden="true"></span></a>
  <a href="https://agog.org/reframing-the-american-wing-encoded-at-the-metropolitan-museum-of-art/" target="_blank" rel="noopener" class="cs-watch-link" style="font-family:var(--font-mono);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.42);padding:14px 24px 14px 0;margin-right:24px;border-right:1px solid rgba(255,255,255,0.07);white-space:nowrap;text-decoration:none;transition:color 0.2s;">Agog<span class="xarrow" aria-hidden="true"></span></a>
  <a href="https://winners.webbyawards.com/2026/apps-software-immersive/immersive-experiences/best-community-engagement/365377/encoded-an-unsanctioned-takeover-of-the-metropolitan-museum-of-art" target="_blank" rel="noopener" class="cs-watch-link" style="font-family:var(--font-mono);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.42);padding:14px 24px 14px 0;margin-right:24px;border-right:1px solid rgba(255,255,255,0.07);white-space:nowrap;text-decoration:none;transition:color 0.2s;">Webby Awards<span class="xarrow" aria-hidden="true"></span></a>
  <a href="https://www.encodedatthemet.com/" target="_blank" rel="noopener" class="cs-watch-link" style="font-family:var(--font-mono);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.42);padding:14px 0;white-space:nowrap;text-decoration:none;transition:color 0.2s;">View Exhibition<span class="xarrow" aria-hidden="true"></span></a>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/1.met/1.png" alt="Encoded" loading="lazy" style="animation: projBreathe 7s ease-in-out infinite;" decoding="async" />
</div>

<p class="cube-cap cube-cap--above"><em>Scanning in the American Wing.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%">
    <source data-src="{{ site.baseurl }}/1.met/2.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above"><em>Pipeline and spatial alignment.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%">
    <source data-src="{{ site.baseurl }}/1.met/3.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%">
    <source data-src="{{ site.baseurl }}/1.met/4.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%">
    <source data-src="{{ site.baseurl }}/1.met/5.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above"><em>AR activation over physical artworks.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%">
    <source data-src="{{ site.baseurl }}/1.met/6.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%">
    <source data-src="{{ site.baseurl }}/1.met/7.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%">
    <source data-src="{{ site.baseurl }}/1.met/8.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%">
    <source data-src="{{ site.baseurl }}/1.met/9.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%">
    <source data-src="{{ site.baseurl }}/1.met/10.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-section">
  <h2 class="cs-section-label">Featured Artists</h2>
</div>
<p class="enc-artists" style="font-family:var(--font-mono);font-size:13px;color:rgba(255,255,255,0.50);line-height:2;padding:0 var(--gutter);max-width:620px;margin-bottom:16px;letter-spacing:0.02em;">Amelia Winger-Bearskin · Bear Fox · Bird x Bird · Cannupa Hanska Luger · Cass Gardiner · Demian DinéYazhi´ · Lite Brite Neon · Flechas · Jarrette Werk · Jeremy Dennis · Josué Rivas · Katsitsionni Fox · Lokotah Sanborn · Mali Obomsawin · Mer Young · Nicholas Galanin · Priscilla Dobler Dzul · Skawennati</p>

<p class="cube-cap cube-cap--above"><em>Exhibition promo.</em></p>
<div class="cs-bleed">
  <video controls playsinline preload="none" style="width:100%">
    <source data-src="{{ site.baseurl }}/1.met/11.mp4" type="video/mp4" />
  </video>
</div>
