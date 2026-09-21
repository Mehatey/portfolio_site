---
layout: project
permalink: /collectio/
project_title: Collectio
proj_num: "17"
tagline: A municipal waste system for Panaji, built around where the model fails. The truck delivers a weight. The belt says what was in it. The ward sees both, and nothing claims more than it can know.
quick_read: >
  Three flows, one chain: a driver's route with real Panaji addresses, a sorting camera that classifies waste live in the browser off a trained model, and a ward officer's queue that never silently empties. Designed so every number on screen says where it came from.
category: AI · Civic systems
year: "2026"
hero_bg: "radial-gradient(ellipse at 40% 45%, #121a14 0%, #0b100c 55%, #06080a 100%)"
hero_image: "assets/img/collectio/04-belt-live.webp"
hero_pos: "50% 40%"
hero_mode: artifact
meta:
  - label: Year
    value: "2026"
  - label: Client
    value: Goa Waste Management · concept
  - label: Role
    value: Design · Model · Prototype
  - label: Tools
    value: PyTorch · JavaScript · OpenStreetMap
  - label: Model
    value: 95,006 parameters, trained from scratch
highlights:
  - value: "14"
    label: real stops, solved before the shift
  - value: "72%"
    label: held-out accuracy, shown on screen
  - value: "3 of 15"
    label: reports held for a person
reflection: >
  Seventy-two percent is not a good number, and the build says so on its own face. The interesting design work is what happens with the other twenty-eight. Asked to choose between six materials, the model will always name one, so before anything is sent it is asked two more questions: have you seen this before, and how sure are you. Fail either and it goes to a person. The cost of that rule is inspector time, and the ward page shows it, because pretending it is free is how a model like this loses trust.

  What I would do differently is start with the belt footage. Twenty-nine percent on a raw crop was the honest number, and reconstructing the framing the network was trained on brought it back to fifty-eight. Measuring that drop and closing most of it was the actual engineering here, and it came last.
refl_bg: "assets/img/collectio/08-where-it-fails.webp"
next_project:
  title: "Obin"
  url: /obin/
  desc: An agent writes the memo. A person checks the numbers.
---

<div class="cs-intro">
  <p>Six years ago Collectio was a segregator's app for a facility in Goa. This is it rebuilt as a system: the driver, the sorting belt and the ward office, in the order waste actually moves. Every screen runs locally, the model runs in the browser, and each of the three flows only claims what it can actually know.</p>
</div>

<div class="cs-section"><span class="cs-section-label">The run</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>One driver, fourteen real Panaji addresses. The route was solved before he opened the app, so he never waits for it. Every leg is a real distance between real coordinates.</em></p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/01-collector-plan.webp" alt="The collector flow: start of shift, at the stop, a report landed, handing it over" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>At the stop he confirms a pickup. He is never asked what material it is. The only decision the app ever puts to him is a mid-run report, and he sees the cost of the detour before anything reorders.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/02-collector-drive.webp" alt="Working the run" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/03-collector-hand.webp" alt="Handing it over: a weighbridge ticket" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The shift ends on a weighbridge ticket: gross, tare, net, countersigned. That ticket is the ward officer's monthly number, and nobody typed it. What is not on this screen is what was in the load. The truck cannot know that. Only the belt can.</em></p>

<div class="cs-section"><span class="cs-section-label">The belt</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>The belt, live. The boxes come from segmentation run over the clip; the class on each box is computed here, in the browser, off the playing video. Twenty-three objects tracked end to end.</em></p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/04-belt-live.webp" alt="The intake camera: live classification over belt footage" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>One photograph, taken all the way through: frame, crop, the transform, the forward pass, the decision, and what happens next.</em></p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/05-one-photograph.webp" alt="One photograph read by the network" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>What it learned from: TrashNet, 2,527 photographs, Yang and Thung at Stanford. And how each one was stretched twelve ways, so it stops memorising the studio.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/06-what-it-learned.webp" alt="The training set" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/07-how-stretched.webp" alt="Augmentation: twelve draws of one photograph" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Where it fails. 72.1% on 383 photographs it had never seen; worst cell is metal read as glass, fourteen times. On a raw crop off the belt, 29%. Reconstructing the training framing brings that back to 57.6%. So it is asked two more questions before anything is sent, and fails either one to a person.</em></p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/08-where-it-fails.webp" alt="Confusion matrix, the lab-to-belt drop, and the abstention rule" loading="lazy" decoding="async" /></div>

<div class="cs-section"><span class="cs-section-label">The ward</span></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Fifteen public posts with real photographs of street waste, tagging the municipality. The model does exactly two things here: is this waste I recognise, and where is it. It never decides what happens next.</em></p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/10-gwmc-queue.webp" alt="The ward queue: public reports with photographs" loading="lazy" decoding="async" /></div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Twelve go to a truck, three go to a person. Each accepted report goes to the nearest truck by real distance on the real street network. The three it refused are named, with the test each one failed. The queue is never silently emptied.</em></p>
<div class="cs-grid">
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/11-gwmc-parsed.webp" alt="The queue parsed: accepted and held" loading="lazy" decoding="async" /></div>
  <div class="cs-grid-item" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/12-gwmc-assigned.webp" alt="Reports assigned to trucks on the map" loading="lazy" decoding="async" /></div>
</div>

<p class="cube-cap cube-cap--above" style="padding-top: 40px;"><em>Where the ward stands. Every number on this page comes out of one of the other two flows: the run, the queue, and the abstention. This is where the three meet, including the inspector hours the rule costs.</em></p>
<div class="cs-bleed" data-zoom><img src="{{ site.baseurl }}/assets/img/collectio/13-gwmc-oversight.webp" alt="The ward oversight page" loading="lazy" decoding="async" /></div>
