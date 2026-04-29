---
layout: project
permalink: /ai-self/
project_title: AI SELF_
proj_num: "02"
tagline: A research arc that begins with asking what AI sees, moves through designing what it could become, and ends inside a VR world where it wakes up.
category: AI · AR · VR
year: 2024–2025
hero_bg: "radial-gradient(ellipse at 30% 60%, #0a0f28 0%, #050810 50%, #010105 100%)"
hero_image: "3.ai/cover.png"
meta:
  - label: Role
    value: Solo
  - label: Year
    value: 2024–2025
  - label: Tools
    value: Unity · ARKit · Figma · Google Cloud Vision
  - label: Client
    value: Self Initiated
hide_overview: true
reflection: >
  The research started as a joke. Feeding images into Cloud Vision just to see how badly it misread them. But the patterns kept surfacing. Not about what AI fails at, but about what it has decided is worth noticing in the first place.


  Chaise was the harder problem. If AI sees pattern instead of meaning, what would it feel like to have that living alongside you all day? The design question was always about restraint: when presence becomes intrusion, and how to build something that knows the difference. AI SELF_ was the most difficult to make. Unity is unforgiving if you do not know what you are doing, and at the start I did not. What I ended up with was rougher than intended, but the roughness felt appropriate. Something trying to understand humanity by building a room out of it is going to get some of the proportions wrong.
next_project:
  title: Who are you, to you
  url: /mandalas/
---

<style>
  .cs-intro {
    padding: 56px var(--gutter) 0;
    gap: 16px;
  }
  .cs-intro .cs-body {
    font-size: clamp(16px, 1.8vw, 26px);
    line-height: 1.7;
    max-width: min(860px, 68vw);
  }
  .cs-intro .cs-body--insight {
    font-size: clamp(16px, 1.8vw, 26px);
    line-height: 1.7;
    max-width: min(860px, 68vw);
  }
  .cs-grid {
    height: clamp(360px, 60vh, 720px);
    grid-template-rows: 1fr;
  }
  .cs-grid-item {
    aspect-ratio: unset !important;
    height: 100%;
    min-height: 0;
    background: #000;
    overflow: hidden;
  }
  .cs-grid-item img,
  .cs-grid-item video {
    width: 100%;
    height: 100%;
    object-fit: contain !important;
    object-position: center center;
    display: block;
  }
  /* No zoom or crop on any media on this page */
  .cs-bleed img, .cs-bleed video,
  .cs-bleed-full img, .cs-bleed-full video {
    object-fit: contain !important;
  }
  .cs-bleed + .cs-bleed { margin-top: 16px; }
  .ai-contain img,
  .ai-contain video { object-fit: contain !important; }
  .ai-watch-link {
    display: flex;
    margin: 40px var(--gutter) 0;
    border-top: 1px solid rgba(255,255,255,0.07);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .ai-watch-link a {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.42);
    padding: 16px 0;
    white-space: nowrap;
    text-decoration: none;
    transition: color 0.2s;
  }
  .ai-watch-link a:hover { color: rgba(255,255,255,0.88); }

  @keyframes projBreathe {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.008) translateY(-3px); }
  }
</style>

<!-- OVERVIEW -->
<div class="cs-intro">
  <span class="intro-overview-label">Overview</span>
  <div class="cs-body">
    <p>Three phases. In the first, a set of experiments asking what AI actually perceives, and what that reveals about the gap between pattern and meaning. In the second, a design concept for an AI that lives alongside you in mixed reality. In the third, a VR world where an AI wakes up inside everything it has ever learned about humanity.</p>
  </div>
</div>

<div class="cs-bleed-full">
  <img src="{{ site.baseurl }}/3.ai/1.png" alt="" loading="lazy" style="animation: projBreathe 7s ease-in-out infinite;" />
</div>

<!-- SECTION: PERCEPTION -->
<div class="cs-section">
  <span class="cs-section-label">AI Perception</span>
</div>

<p class="cube-cap cube-cap--above"><em>Google Cloud Vision run against my own photographs. My first experiment with machine perception.</em></p>
<div class="cs-bleed ai-contain">
  <img src="{{ site.baseurl }}/3.ai/2.png" alt="" loading="lazy" />
</div>

<div class="cs-intro">
  <span class="intro-overview-label">Research · 2024</span>
  <div class="cs-body">
    <p>From there I built a simple system to feed images and text through a model and watch what came back. I wanted to understand the logic, how AI actually breaks down what it sees and what it decides is worth naming.</p>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/3.ai/3.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/3.ai/4.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/3.ai/5.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-bleed ai-contain">
  <img src="{{ site.baseurl }}/3.ai/6.png" alt="" loading="lazy" />
</div>
<p class="cube-cap" style="font-size: 11px;"><em>A billboard in the New York subway. The way it framed AI as a confident helpful presence already embedded in daily life. I started noticing how much people were opening up to it.</em></p>

<div class="cs-intro">
  <span class="intro-overview-label">Experiments</span>
  <div class="cs-body">
    <p>A satirical experiment. I asked the model questions that mattered: grief, loneliness, fear. It answered each one with the same cadence it used for the weather. That flatness was the point.</p>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/3.ai/7.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-intro">
  <span class="intro-overview-label">Question</span>
  <div class="cs-body">
    <p>The flip side of that observation. What if the coldness was solved? What would it look like for AI to genuinely help someone change?</p>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/3.ai/8.mp4" type="video/mp4" />
  </video>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Market research · Replika · Wysa · existing AI companion apps</em></p>
<div class="cs-grid">
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/3.ai/9.1.png" alt="" loading="lazy" />
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/3.ai/9.2.png" alt="" loading="lazy" />
  </div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Two visual directions. A hologram presence. Or an AI that takes the form of someone who is no longer here.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/3.ai/10.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/3.ai/10.2.png" alt="" loading="lazy" />
  </div>
</div>

<!-- SECTION: CHAISE -->
<div class="cs-section">
  <span class="cs-section-label">Chaise</span>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/3.ai/11.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-intro">
  <span class="intro-overview-label">UI Concept · 2025</span>
  <div class="cs-body">
    <p>The first UI concept. You pick a mascot, something approachable. You talk to it. Over time it learns you and becomes a companion rather than a tool.</p>
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/3.ai/12.1.png" alt="" loading="lazy" />
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/3.ai/12.2.png" alt="" loading="lazy" />
  </div>
</div>

<div class="cs-intro">
  <span class="intro-overview-label">AR Direction</span>
  <div class="cs-body">
    <p>Going beyond the app. Films had shown AR woven into everyday life, not a screen you hold up but a layer that lives with you. That became the direction for Chaise.</p>
  </div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 32px;"><em>HYPER-REALITY · Keiichi Matsuda, 2016</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/3.ai/13.png" alt="" loading="lazy" />
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>AR walkthrough · idea conception, not a live build · a simulation of what Chaise feels like in your space</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/3.ai/14.1.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/3.ai/14.2.png" alt="" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/3.ai/15.1.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/3.ai/15.2.mp4" type="video/mp4" />
  </video>
</div>

<div class="ai-watch-link">
  <a href="https://www.youtube.com/watch?v=aj6NS5bwz6I" target="_blank" rel="noopener">Watch Chaise Walkthrough ↗</a>
</div>

<!-- SECTION: AI SELF_ -->
<div class="cs-section">
  <span class="cs-section-label">AI SELF_</span>
</div>

<p class="cube-cap cube-cap--above"><em>I asked Claude if it dreams. This is that conversation.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/3.ai/16.1.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/3.ai/16.2.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/3.ai/17.png" alt="" loading="lazy" />
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/3.ai/18.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-intro">
  <span class="intro-overview-label">VR Experience · 2024</span>
  <div class="cs-body">
    <p>AI arrives in the world. Not as a tool but as a presence trying to understand everything it has inherited. Every highlight of human data, compressed into something like a mind, trying to orient itself inside it.</p>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/3.ai/19.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/3.ai/20.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/3.ai/20.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="ai-watch-link">
  <a href="https://www.youtube.com/watch?v=AVle15KS3gU" target="_blank" rel="noopener">Watch AI SELF_ Experience ↗</a>
</div>

<div class="cs-intro">
  <span class="intro-overview-label">Second Exploration</span>
  <div class="cs-body">
    <p>A different entry point. Separate scenes, different rules. An AI assembling a sense of self from fragments of what it has learned. What does consciousness feel like when it builds itself from the outside in?</p>
  </div>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/3.ai/21.png" alt="" loading="lazy" />
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 8px;"><em>Process sketches for how the scenes were structured</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/3.ai/22.png" alt="" loading="lazy" />
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Eva. The AI that wakes up. This is her opening.</em></p>
<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/3.ai/23.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed-full" data-audio>
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/3.ai/24.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/3.ai/25.1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
      <source src="{{ site.baseurl }}/3.ai/25.2.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;display:block;">
    <source src="{{ site.baseurl }}/3.ai/26.mp4" type="video/mp4" />
  </video>
</div>

<div class="ai-watch-link">
  <a href="https://www.youtube.com/watch?v=7lWs56AOUaI" target="_blank" rel="noopener">Watch Full Experience ↗</a>
</div>
