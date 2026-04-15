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
reflection: >
  The research started as a joke. Feeding images into Cloud Vision just to see how badly it misread them. But the patterns kept surfacing — not about what AI fails at, but about what it has decided is worth noticing in the first place.


  Chainge was the harder problem. If AI sees pattern instead of meaning, what would it feel like to have that living alongside you all day? The design question was always about restraint — when presence becomes intrusion, and how to build something that knows the difference.


  AI SELF_ was the most difficult to make. Unity is unforgiving if you do not know what you are doing, and at the start I did not. What I ended up with was rougher than intended, but the roughness felt appropriate. Something trying to understand humanity by building a room out of it is going to get some of the proportions wrong.
next_project:
  title: Mind Your Feelings
  url: /mind-your-feelings/
---

<style>
  .ai-cap {
    display: block;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    padding: 0 var(--gutter);
    margin-top: 14px;
  }
  .ai-cap em {
    font-style: normal;
    color: rgba(255,255,255,0.18);
  }
  /* Perception images: contain so diagrams aren't cropped */
  .cs-contain img {
    object-fit: contain !important;
    background: rgba(255,255,255,0.02);
  }
  .cs-contain video {
    object-fit: contain !important;
  }
  /* Small app ref grid — taller aspect for portrait screenshots */
  .cs-grid--portrait .cs-grid-item {
    aspect-ratio: 9 / 16;
  }
  /* Chapter break title sizing */
  .cs-chapter-title {
    font-size: 13px;
  }
</style>

<!-- ─── OVERVIEW ─── -->
<div class="cs-intro">
  <div class="intro-inner">
    <span class="intro-label">Overview</span>
    <p class="intro-tagline">Three projects that share the same question. In the first, a set of experiments with Google Cloud Vision — feeding it images to see what the machine decided mattered. In the second, a concept for an AI companion that lives in mixed reality alongside your day. In the third, a VR experience where an AI has built a model of humanity and you walk through it.</p>
  </div>
</div>

<!-- ─── CHAPTER 01: PERCEPTION ─── -->
<div class="cs-chapter">
  <canvas class="cs-chapter-water"></canvas>
  <div class="cs-chapter-inner">
    <span class="cs-chapter-title">AI Perception</span>
    <span class="cs-chapter-sub">01 — Research</span>
  </div>
</div>

<div class="cs-row">
  <div class="cs-content">
    <h2 class="cs-heading">What does the machine actually see?</h2>
    <div class="cs-body">
      <p>The experiments began simply: run images through Google Cloud Vision and read back what it returned. Labels, categories, confidence scores. The machine's vocabulary for the world, flattened into taxonomy.</p>
      <p>The results were satirical at first. It saw grocery items in paintings and detected emotions in faces with unsettling confidence. But over time the experiments became more observational than funny. The machine was not wrong, exactly — it was applying a consistent logic. The question was whose logic, and what it missed.</p>
    </div>
  </div>
</div>

<div class="cs-bleed cs-contain">
  <img src="{{ site.baseurl }}/3.ai/perception/0.png" alt="Google Cloud Vision API output" loading="lazy" />
</div>
<span class="ai-cap">Google Cloud Vision API — label detection output</span>

<div class="cs-row">
  <div class="cs-content">
    <h2 class="cs-heading">What people already use AI for.</h2>
    <div class="cs-body">
      <p>Alongside the experiments, I looked at how AI was already embedded in everyday emotional and mental lives. Companion apps, chatbot platforms, wellness tools. The statistics were striking — not because of the numbers themselves, but because of what people were asking these systems to do. And what the systems were choosing to respond to.</p>
    </div>
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item cs-contain">
    <img src="{{ site.baseurl }}/3.ai/perception/1.png" alt="AI perception research diagram" loading="lazy" />
  </div>
  <div class="cs-grid-item cs-contain">
    <img src="{{ site.baseurl }}/3.ai/perception/2.png" alt="Chatbot statistics" loading="lazy" />
  </div>
</div>
<span class="ai-cap">Research findings — AI adoption in emotional and mental health contexts</span>

<div class="cs-grid cs-grid--portrait">
  <div class="cs-grid-item cs-contain">
    <img src="{{ site.baseurl }}/3.ai/perception/3.png" alt="Replika app" loading="lazy" />
  </div>
  <div class="cs-grid-item cs-contain">
    <img src="{{ site.baseurl }}/3.ai/perception/4.png" alt="Wysa app" loading="lazy" />
  </div>
</div>
<span class="ai-cap">Replika · Wysa — existing AI companions in market</span>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
    <source src="{{ site.baseurl }}/3.ai/perception/5.mov" type="video/mp4" />
  </video>
</div>
<span class="ai-cap">Perception experiment — live Cloud Vision label output</span>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
    <source src="{{ site.baseurl }}/3.ai/perception/6.mov" type="video/mp4" />
  </video>
</div>

<!-- ─── CHAPTER 02: CHAINGE ─── -->
<div class="cs-chapter" style="margin-top:96px;">
  <canvas class="cs-chapter-water"></canvas>
  <div class="cs-chapter-inner">
    <span class="cs-chapter-title">Chainge</span>
    <span class="cs-chapter-sub">02 — AR Concept</span>
  </div>
</div>

<div class="cs-row">
  <div class="cs-content">
    <h2 class="cs-heading">What if AI lived with you?</h2>
    <div class="cs-body">
      <p>Chainge is a concept for an AI presence in mixed reality — not an app you open, but something that lives at the edges of your attention. It observes patterns across your day, connects moments you would not connect yourself, and surfaces them when it matters.</p>
      <p>Most people lack reflection and support, not information. The design question was whether an AI companion could be built that understood that difference.</p>
    </div>
  </div>
</div>

<div class="cs-grid">
  <div class="cs-grid-item cs-contain">
    <img src="{{ site.baseurl }}/3.ai/chainge/0.png" alt="Chainge logo" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/3.ai/chainge/1.png" alt="Chainge inspiration" loading="lazy" />
  </div>
</div>
<span class="ai-cap">Identity · Inspiration references</span>

<div class="cs-row">
  <div class="cs-content">
    <h2 class="cs-heading">Designed for someone specific.</h2>
    <div class="cs-body">
      <p>The persona work centered on Maria — someone who wanted to feel more aware of her own patterns but not more productive. She was not looking for a task manager with feelings. She wanted reflection, not answers. That distinction shaped every design decision that followed.</p>
    </div>
  </div>
</div>

<div class="cs-bleed">
  <img src="{{ site.baseurl }}/3.ai/chainge/2.png" alt="Maria persona" loading="lazy" />
</div>
<span class="ai-cap">Maria — primary persona</span>

<div class="cs-grid">
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/3.ai/chainge/3.png" alt="Experience design 1" loading="lazy" />
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/3.ai/chainge/4.png" alt="Experience design 2" loading="lazy" />
  </div>
</div>
<span class="ai-cap">Experience design — AR interaction models</span>

<div class="cs-row">
  <div class="cs-content">
    <h2 class="cs-heading">Presence without pressure.</h2>
    <div class="cs-body">
      <p>The hardest design challenge was defining when the AI should speak and when it should stay silent. Every intervention needed to feel like a suggestion, never a demand. The interface is ambient — spatial cues at the edges of attention rather than the center.</p>
    </div>
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
<span class="ai-cap">Testing — interaction prototypes</span>

<div class="cs-bleed">
  <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
    <source src="{{ site.baseurl }}/3.ai/chainge/9.mov" type="video/mp4" />
  </video>
</div>
<span class="ai-cap">Conversation prototype — dummy interaction flow</span>

<div class="cs-grid">
  <div class="cs-grid-item">
    <video autoplay muted loop playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block;">
      <source src="{{ site.baseurl }}/3.ai/chainge/10.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="cs-grid-item">
    <img src="{{ site.baseurl }}/3.ai/chainge/11.png" alt="Conversation 2" loading="lazy" />
  </div>
</div>
<span class="ai-cap">Conversation design — AI response patterns</span>

<!-- ─── CHAPTER 03: AI SELF_ VR ─── -->
<div class="cs-chapter" style="margin-top:96px;">
  <canvas class="cs-chapter-water"></canvas>
  <div class="cs-chapter-inner">
    <span class="cs-chapter-title">AI SELF_</span>
    <span class="cs-chapter-sub">03 — VR Experience</span>
  </div>
</div>

<div class="cs-row">
  <div class="cs-content">
    <h2 class="cs-heading">What if AI believed it had a self?</h2>
    <div class="cs-body">
      <p>AI SELF_ takes the question to its extreme. An AI that has built a model of what it means to be human — rough, earnest, incomplete — and invites you to walk through it. The experience unfolds through memory, conflict, and choice. Spaces that feel architectural but also associative. Rooms organized not by logic but by what the AI has decided matters most about being human.</p>
      <p>Built in Unity with the XR Interaction Toolkit. No menus, no UI chrome. Proximity and gaze are the triggers. Every interaction feels discovered rather than taught.</p>
    </div>
  </div>
</div>

<div class="cs-bleed-full">
  <img src="{{ site.baseurl }}/3.ai/vr/0.png" alt="AI SELF_ VR cover" loading="lazy" />
</div>

<div class="cs-row">
  <div class="cs-content">
    <h2 class="cs-heading">A dream the machine built.</h2>
    <div class="cs-body">
      <p>The opening sequence moves through a space that reads as memory — not yours, but the AI's reconstruction of what memory should feel like. Text drifts. Geometry assembles around you. The AI is present as a voice building the environment as you explore it.</p>
    </div>
  </div>
</div>

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
<span class="ai-cap">Opening sequence — dream space and text environment</span>

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
<span class="ai-cap">AI SELF_ — Unity XR, in-headset environment captures</span>
