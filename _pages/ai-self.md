---
layout: project
permalink: /ai-self/
project_title: AI SELF_
proj_num: "02"
tagline: From machine perception research to an AR companion concept to a VR experience — three ways of asking what AI understands about us.
category: AI · MR · VR
year: 2024–2025
hero_bg: "radial-gradient(ellipse at 30% 60%, #0a0f28 0%, #050810 50%, #010105 100%)"
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
  The research started as a joke. Feeding images into Cloud Vision just to see how badly it misread them. But the patterns kept surfacing — not about what AI fails at, but about what it has decided is worth noticing in the first place.


  Chainge was the harder problem. If AI sees pattern instead of meaning, what would it feel like to have that living alongside you all day? The design question was always about restraint — when presence becomes intrusion, and how to build something that knows the difference.


  AI SELF_ was the most difficult to make. Unity is unforgiving if you do not know what you are doing, and at the start I did not. What I ended up with was rougher than intended, but the roughness felt appropriate. Something trying to understand humanity by building a room out of it is going to get some of the proportions wrong.
next_project:
  title: Mind Your Feelings
  url: /mind-your-feelings/
---

<style>
  /* ── INTRO ── */
  .cs-intro {
    opacity: 1 !important;
    transform: none !important;
    max-width: none !important;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    text-align: left;
    padding: 56px var(--gutter) 0;
    gap: 16px;
  }
  .cs-intro .intro-overview-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
  }
  .cs-intro .cs-body {
    font-size: clamp(14px, 1.5vw, 20px);
    line-height: 1.6;
    color: rgba(255,255,255,0.68);
    max-width: 740px;
    margin: 0;
  }
  .cs-intro .cs-body--insight {
    font-size: clamp(14px, 1.5vw, 20px);
    color: rgba(255,255,255,0.68);
    max-width: 740px;
    position: relative;
    margin-top: 24px;
    padding-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .cs-intro .cs-body--insight::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 1px;
    background: rgba(255,255,255,0.07);
  }
  .cs-intro .cs-body--insight .insight-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
  }

  /* ── GRID SIZING ── */
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
    object-fit: cover;
    object-position: center center;
    display: block;
  }

  /* ── CAPTIONS ── */
  .cube-cap {
    font-family: var(--font-mono);
    font-size: 13px;
    color: rgba(255,255,255,0.42);
    padding: 8px var(--gutter) 0;
    margin: 0;
    line-height: 1.5;
  }
  .cube-cap em {
    font-style: italic;
  }
  .cube-cap--above {
    padding: 0 var(--gutter) 8px;
  }
  .cube-cap--above + .cs-grid { margin-top: 8px; }
  .cube-cap--above + .cs-bleed { margin-top: 8px; }
  .cube-cap + .cs-bleed { margin-top: 16px; }
  .cs-bleed + .cs-bleed { margin-top: 16px; }
  .cs-grid + .cs-bleed { margin-top: 24px; }

  /* ── SECTION LABELS ── */
  .cs-section {
    padding: 80px var(--gutter) 32px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .cs-section::before {
    content: '';
    display: block;
    width: 0;
    height: 1px;
    background: rgba(255,255,255,0.18);
    flex-shrink: 0;
    transition: width 1s cubic-bezier(0.22, 1, 0.36, 1) 0.1s;
  }
  .cs-section.is-visible::before {
    width: 28px;
  }
  .cs-section-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.22);
    opacity: 0;
    transition: opacity 0.7s ease 0.55s;
  }
  .cs-section.is-visible .cs-section-label {
    opacity: 1;
  }

  /* Contain for diagrams / screenshots that shouldn't be cropped */
  .ai-contain img,
  .ai-contain video {
    object-fit: contain !important;
  }
</style>

<!-- ─── OVERVIEW ─── -->
<div class="cs-intro">
  <span class="intro-overview-label">Overview</span>
  <div class="cs-body">
    <p>Three projects built around the same question. First, a set of experiments with Google Cloud Vision — feeding it images to see what the machine decided mattered. Then a concept for an AI companion that lives in mixed reality alongside your day. Then a VR experience where an AI has built a model of humanity and you walk through it.</p>
  </div>
  <div class="cs-body cs-body--insight">
    <span class="insight-label">Insight</span>
    <p>AI does not misunderstand us by accident. The gaps are structural, built into what it has been asked to see. These projects try to make that legible.</p>
  </div>
</div>

<!-- ─── SECTION: PERCEPTION ─── -->
<div class="cs-section">
  <span class="cs-section-label">AI Perception</span>
</div>

<div class="cs-bleed ai-contain">
  <img src="{{ site.baseurl }}/3.ai/perception/0.png" alt="Google Cloud Vision API output" loading="lazy" />
</div>

<div class="cs-intro">
  <span class="intro-overview-label">Research · 2024</span>
  <div class="cs-body">
    <p>The experiments began simply: run images through Google Cloud Vision and read back what it returned. Labels, categories, confidence scores — the machine's vocabulary for the world, flattened into taxonomy.</p>
    <p>The results were satirical at first. It saw grocery items in paintings and detected emotions in faces with unsettling confidence. But the experiments became more observational than funny. The machine was not wrong exactly — it was applying a consistent logic. The question was whose logic, and what it missed.</p>
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/3.ai/perception/1.png" alt="AI perception research diagram" loading="lazy" />
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/3.ai/perception/2.png" alt="Chatbot statistics" loading="lazy" />
  </div>
</div>

<p class="cube-cap" style="padding-top: 8px;"><em>Research findings — AI adoption in emotional and mental health contexts</em></p>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Replika · Wysa — existing AI companions in market</em></p>
<div class="cs-grid">
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/3.ai/perception/3.png" alt="Replika" loading="lazy" />
  </div>
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/3.ai/perception/4.png" alt="Wysa" loading="lazy" />
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
    <source src="{{ site.baseurl }}/3.ai/perception/5.mov" type="video/mp4" />
  </video>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
    <source src="{{ site.baseurl }}/3.ai/perception/6.mov" type="video/mp4" />
  </video>
</div>

<!-- ─── SECTION: CHAINGE ─── -->
<div class="cs-section">
  <span class="cs-section-label">Chainge</span>
</div>

<div class="cs-grid">
  <div class="cs-grid-item ai-contain">
    <img src="{{ site.baseurl }}/3.ai/chainge/0.png" alt="Chainge logo" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/3.ai/chainge/1.png" alt="Chainge inspiration" loading="lazy" />
  </div>
</div>

<div class="cs-intro">
  <span class="intro-overview-label">AR Concept · 2025</span>
  <div class="cs-body">
    <p>Chainge is a concept for an AI presence in mixed reality — not an app you open, but something that lives at the edges of your attention. It observes patterns across your day, connects moments you would not connect yourself, and surfaces them when it matters.</p>
    <p>Most people lack reflection and support, not information. The design question was whether an AI companion could be built that understood that difference.</p>
  </div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 72px;"><em>Maria — primary persona. Wants reflection, not answers.</em></p>
<div class="cs-bleed">
  <img src="{{ site.baseurl }}/3.ai/chainge/2.png" alt="Maria persona" loading="lazy" />
</div>

<div class="cs-intro">
  <span class="intro-overview-label">Experience Design</span>
  <div class="cs-body">
    <p>The hardest design challenge was defining when the AI should speak and when it should stay silent. Every intervention needed to feel like a suggestion, never a demand. Spatial cues at the edges of attention rather than the center. Presence without pressure.</p>
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/3.ai/chainge/3.png" alt="Experience 1" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/3.ai/chainge/4.png" alt="Experience 2" loading="lazy" />
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/3.ai/chainge/5.png" alt="Outcome 1" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/3.ai/chainge/6.png" alt="Outcome 2" loading="lazy" />
  </div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Testing — interaction prototypes</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/3.ai/chainge/7.png" alt="Testing" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
      <source src="{{ site.baseurl }}/3.ai/chainge/8.mov" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
    <source src="{{ site.baseurl }}/3.ai/chainge/9.mov" type="video/mp4" />
  </video>
</div>
<p class="cube-cap" style="padding-top: 8px;"><em>Conversation prototype — dummy interaction flow</em></p>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
      <source src="{{ site.baseurl }}/3.ai/chainge/10.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/3.ai/chainge/11.png" alt="Conversation" loading="lazy" />
  </div>
</div>
<p class="cube-cap" style="padding-top: 8px;"><em>Conversation design — AI response patterns</em></p>

<!-- ─── SECTION: AI SELF_ VR ─── -->
<div class="cs-section">
  <span class="cs-section-label">AI SELF_</span>
</div>

<div class="cs-bleed-full">
  <img src="{{ site.baseurl }}/3.ai/vr/0.png" alt="AI SELF_ VR cover" loading="lazy" />
</div>

<div class="cs-intro">
  <span class="intro-overview-label">VR Experience · 2024</span>
  <div class="cs-body">
    <p>AI SELF_ takes the question to its extreme. An AI that has built a model of what it means to be human — rough, earnest, incomplete — and invites you to walk through it. Spaces that feel architectural but also associative. Rooms organized not by logic but by what the AI has decided matters most about being human.</p>
    <p>Built in Unity with the XR Interaction Toolkit. No menus, no UI chrome. Proximity and gaze are the triggers. Every interaction feels discovered rather than taught.</p>
  </div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 72px;"><em>Opening sequence — a dream the machine built</em></p>
<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
      <source src="{{ site.baseurl }}/3.ai/vr/1.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
      <source src="{{ site.baseurl }}/3.ai/vr/2.mov" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
    <source src="{{ site.baseurl }}/3.ai/vr/3.mp4" type="video/mp4" />
  </video>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
      <source src="{{ site.baseurl }}/3.ai/vr/4.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
      <source src="{{ site.baseurl }}/3.ai/vr/5.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
      <source src="{{ site.baseurl }}/3.ai/vr/6.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
      <source src="{{ site.baseurl }}/3.ai/vr/7.mp4" type="video/mp4" />
    </video>
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
      <source src="{{ site.baseurl }}/3.ai/vr/8.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
      <source src="{{ site.baseurl }}/3.ai/vr/9.mp4" type="video/mp4" />
    </video>
  </div>
</div>
<p class="cube-cap" style="padding-top: 8px;"><em>AI SELF_ — Unity XR, in-headset environment captures</em></p>
