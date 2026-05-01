---
layout: project
permalink: /ai-self/
project_title: AI Self
proj_num: "02"
tagline: A research arc in three phases. First, experiments asking what AI actually perceives, and what that reveals about the gap between pattern and meaning. Second, a design concept for an AI that lives alongside you in mixed reality. Third, a VR world where an AI wakes up inside everything it has ever learned about humanity.
category: AI · AR · VR
year: 2024–2025
hero_bg: "radial-gradient(ellipse at 30% 60%, #0a0f28 0%, #050810 50%, #010105 100%)"
hero_video: "2.ai-self/19.mp4"
meta:
  - label: Role
    value: Solo
  - label: Year
    value: 2024–2025
  - label: Tools
    value: Unity · ARKit · Figma · Google Cloud Vision
  - label: Client
    value: Self Initiated
reflection: >
  The research started as a joke. Feeding images into Cloud Vision just to see how badly it misread them. But the patterns kept surfacing. Not about what AI fails at, but about what it has decided is worth noticing in the first place.


  Chaise was the harder problem. If AI sees pattern instead of meaning, what would it feel like to have that living alongside you all day? The design question was always about restraint: when presence becomes intrusion, and how to build something that knows the difference. AI Self was the most difficult to make. Unity is unforgiving if you do not know what you are doing, and at the start I did not. What I ended up with was rougher than intended, but the roughness felt appropriate. Something trying to understand humanity by building a room out of it is going to get some of the proportions wrong.
refl_bg: "2.ai-self/reflection.png"
next_project:
  title: Bloom; who are you
  url: /mandalas/
---

<style>
  .cs-bleed { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-bleed img, .cs-bleed video { object-fit: contain !important; height: auto !important; }
  .cs-bleed::before { display: none !important; }
  .cs-grid-item { aspect-ratio: auto !important; overflow: visible !important; background: transparent !important; }
  .cs-grid-item img, .cs-grid-item video { object-fit: cover !important; height: 100% !important; }
  .cs-grid::before { display: none !important; }
  .cs-grid-item::before { display: none !important; }
  .cs-grid { gap: 16px !important; align-items: stretch !important; }
  .cs-bleed { margin-top: 40px !important; }
  .cs-bleed + .cs-bleed { margin-top: 40px !important; }
  .cs-grid { margin-top: 40px !important; }
  .cs-grid + .cs-bleed { margin-top: 16px !important; }
  .cs-bleed + .cs-grid { margin-top: 16px !important; }

  .cube-cap { margin: 40px 0 0; }
  .cube-cap + .cs-bleed, .cube-cap + .cs-grid { margin-top: 8px !important; }
  .cube-cap--above + .cs-bleed, .cube-cap--above + .cs-grid { margin-top: 12px !important; }

  @keyframes projBreathe {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.008) translateY(-3px); }
  }
</style>

<!-- HERO -->
<div class="cs-bleed-full">
  <img src="{{ site.baseurl }}/2.ai-self/1.png" alt="" loading="lazy" style="animation: projBreathe 7s ease-in-out infinite;" />
</div>

<!-- SECTION: AI PERCEPTION -->
<div class="cs-section">
  <h2 class="cs-section-label">AI Perception</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 24px;"><em>Google Cloud Vision run against my own photographs. My first experiment with machine perception.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.ai-self/2.png" alt="" loading="lazy" />
</div>

<p class="cube-cap cube-cap--above"><em>A simple system to feed images through a model and watch what it decides is worth naming.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/2.ai-self/3.mp4" type="video/mp4" />
  </video>
</div>

<!-- 4 standalone -->
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/2.ai-self/4.mp4" type="video/mp4" />
  </video>
</div>

<!-- 5 standalone -->
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/2.ai-self/5.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>I asked the model about grief, loneliness, fear. It answered each with the cadence of weather.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/2.ai-self/7.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above"><em>The flip side. What if the coldness was solved? What if AI could help someone change?</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/2.ai-self/8.mp4" type="video/mp4" />
  </video>
</div>

<!-- SECTION: AR EXPERIENCE -->
<div class="cs-section">
  <h2 class="cs-section-label">AR Experience</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 72px;"><em>The first UI concept. Pick a mascot. Talk to it. Over time it becomes a companion, not a tool.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.ai-self/12.png" alt="" loading="lazy" />
</div>

<p class="cube-cap cube-cap--above"><em>Beyond the app. AR woven into everyday life, not a screen you hold up but a layer that lives with you.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.ai-self/13.png" alt="" loading="lazy" />
</div>

<p class="cube-cap cube-cap--above"><em>AR walkthrough. Idea conception, not a live build.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/2.ai-self/14.1.mp4" type="video/mp4" />
  </video>
</div>

<!-- AR LINK -->
<div style="display:flex;gap:0;margin:40px var(--gutter) 0;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);">
  <a href="https://www.youtube.com/watch?v=aj6NS5bwz6I" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.42);padding:16px 0;white-space:nowrap;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.88)'" onmouseout="this.style.color='rgba(255,255,255,0.42)'">Watch Chaise Walkthrough ↗</a>
</div>

<!-- SECTION: VR EXPERIENCE -->
<div class="cs-section">
  <h2 class="cs-section-label">VR Experience</h2>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 72px;"><em>I asked Claude if it dreams. This is that conversation.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/2.ai-self/16.1.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.ai-self/17.png" alt="" loading="lazy" />
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/2.ai-self/18.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>AI arrives in the world. Not as a tool, but as a presence trying to understand what it has inherited.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/2.ai-self/19.mp4" type="video/mp4" />
  </video>
</div>

<!-- 20.1 + 20.2 grid -->
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.ai-self/20.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.ai-self/20.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<!-- AI SELF VR LINK -->
<div style="display:flex;gap:0;margin:40px var(--gutter) 0;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);">
  <a href="https://www.youtube.com/watch?v=AVle15KS3gU" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.42);padding:16px 0;white-space:nowrap;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.88)'" onmouseout="this.style.color='rgba(255,255,255,0.42)'">Watch AI Self Experience ↗</a>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>A different entry point. An AI assembling a sense of self from fragments of what it has learned.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.ai-self/21.png" alt="" loading="lazy" />
</div>

<p class="cube-cap cube-cap--above"><em>Process sketches for how the scenes were structured.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/2.ai-self/22.png" alt="" loading="lazy" />
</div>

<p class="cube-cap cube-cap--above"><em>Eva. The AI that wakes up. This is her opening.</em></p>
<div class="cs-bleed">
  <video id="ai-vid-23" autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/2.ai-self/23.mp4" type="video/mp4" />
  </video>
  <button class="cover-audio-btn muted" id="ai-btn-23" aria-label="Toggle audio">
    <svg class="audio-icon-on" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
    <svg class="audio-icon-off" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
  </button>
</div>

<div class="cs-bleed-full" data-audio>
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/2.ai-self/24.mp4" type="video/mp4" />
  </video>
</div>

<!-- 25.1 + 25.2 grid -->
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.ai-self/25.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none">
      <source src="{{ site.baseurl }}/2.ai-self/25.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none">
    <source src="{{ site.baseurl }}/2.ai-self/26.mp4" type="video/mp4" />
  </video>
</div>

<!-- FULL EXPERIENCE LINK -->
<div style="display:flex;gap:0;margin:40px var(--gutter) 0;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);">
  <a href="https://www.youtube.com/watch?v=7lWs56AOUaI" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.42);padding:16px 0;white-space:nowrap;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.88)'" onmouseout="this.style.color='rgba(255,255,255,0.42)'">Watch Full Experience ↗</a>
</div>

<script>
  (function () {
    var btn = document.getElementById("ai-btn-23");
    var vid = document.getElementById("ai-vid-23");
    if (!btn || !vid) return;
    btn.addEventListener("click", function () {
      vid.muted = !vid.muted;
      btn.classList.toggle("muted", vid.muted);
      if (!vid.muted) vid.play().catch(function () {});
    });
  })();
</script>
