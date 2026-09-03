/* ═══════════════════════════════════════════════════════════════════════════
   SOUND

   Sid: "can we have some good quality sound design which is tech forward and
   hig quality sort of futuristic button hover sounds and click sound and an
   icon of a waveform for when sound is on to move slowly and when off to be a
   still line we dont need text look at the pro sites."

   SYNTHESISED, NOT SAMPLED

   There is no audio file here. Every sound is built from oscillators and a
   noise burst through the Web Audio API at the moment it plays, which is the
   right trade three times over: nothing is downloaded, nothing is decoded, and
   a sample played four hundred times in a session becomes a tic while a
   synthesised one can carry a little variance and never quite repeat.

   "Tech forward" in practice means short, clean and slightly detuned. Each
   sound is under 120ms, uses a sine or triangle rather than a saw, and lands
   its pitch a few cents off the last one so a fast run of hovers reads as
   texture rather than as a car alarm.

   OFF BY DEFAULT, AND THAT IS NOT A COMPROMISE

   A portfolio that makes noise at a stranger without being asked is a
   portfolio they close. The state persists per visitor, so somebody who turns
   it on gets it everywhere and somebody who does not is never asked twice.

   THE CONTROL IS THE WAVEFORM

   No label, per the brief. A row of bars: travelling when sound is on, flat
   when it is off. The flat state is a straight line rather than shorter bars,
   because a smaller version of the same shape reads as "quieter" and what is
   wanted is "off".
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var KEY = "sid_sound";
  var store = null;
  try {
    store = window.localStorage;
  } catch (e) {}

  var on = false;
  try {
    on = store && store.getItem(KEY) === "1";
  } catch (e) {}

  var ctx = null;
  var master = null;
  var lastHover = 0;
  var detune = 0;

  function audio() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    /* Everything here sits under a single low master. These are punctuation,
       not content, and the ceiling is what keeps them that way. */
    master.gain.value = 0.05;
    master.connect(ctx.destination);
    return ctx;
  }

  /* One voice: a pitch, a shape, and an envelope. Attack is deliberately not
     zero -- a hard start is a click artefact, and 4ms is inaudible as a ramp
     but removes it. */
  function tone(freq, dur, type, peak, glide) {
    var c = audio();
    if (!c) return;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, c.currentTime);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, c.currentTime + dur);
    o.detune.value = detune;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(peak, c.currentTime + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g);
    g.connect(master);
    o.start();
    o.stop(c.currentTime + dur + 0.02);
  }

  /* A very short filtered noise burst. This is the "mechanism" layer -- it is
     what stops the click sounding like a note and starts it sounding like a
     switch. */
  function tick(dur, freq, peak) {
    var c = audio();
    if (!c) return;
    var n = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, n, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = c.createBufferSource();
    src.buffer = buf;
    var bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = 1.6;
    var g = c.createGain();
    g.gain.value = peak;
    src.connect(bp);
    bp.connect(g);
    g.connect(master);
    src.start();
  }

  function hover() {
    if (!on) return;
    var now = Date.now();
    /* Sweeping a nav of six links fires six hovers in half a second. A gate
       turns that from a arpeggio into a single event. */
    if (now - lastHover < 90) return;
    lastHover = now;
    /* Walks up a few cents each time and resets, so consecutive hovers rise
       very slightly rather than being identical. */
    detune = ((detune + 7) % 28) - 14;
    tone(1180, 0.055, "sine", 0.5);
    tick(0.018, 3600, 0.1);
  }

  function click() {
    if (!on) return;
    tone(760, 0.09, "triangle", 0.6, 420);
    tick(0.03, 2100, 0.22);
  }

  /* The toggle's own sounds ignore `on`, because the press that turns sound ON
     has to be audible or the control appears not to work. */
  function confirm(state) {
    if (state) {
      tone(560, 0.08, "sine", 0.55, 880);
      setTimeout(function () {
        tone(880, 0.1, "sine", 0.45, 1180);
      }, 70);
    } else {
      tone(680, 0.12, "sine", 0.4, 340);
    }
  }

  /* ── THE CONTROL ────────────────────────────────────────────────────────── */
  var BARS = 5;
  var btn = document.createElement("button");
  btn.type = "button";
  btn.id = "sound-toggle";
  btn.className = "sound-toggle";
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.setAttribute("aria-label", "Sound");
  var wave = document.createElement("span");
  wave.className = "sound-wave";
  wave.setAttribute("aria-hidden", "true");
  for (var i = 0; i < BARS; i++) {
    var bar = document.createElement("i");
    bar.style.setProperty("--i", i);
    wave.appendChild(bar);
  }
  btn.appendChild(wave);

  function paint() {
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", on ? "Sound on" : "Sound off");
  }

  btn.addEventListener("click", function () {
    on = !on;
    try {
      if (store) store.setItem(KEY, on ? "1" : "0");
    } catch (e) {}
    paint();
    var c = audio();
    /* A context created inside a gesture starts running; one created earlier
       may be suspended and has to be asked. */
    if (c && c.state === "suspended") c.resume();
    confirm(on);
  });

  function mount() {
    document.body.appendChild(btn);
    paint();

    /* Delegated, so anything added to the page later is covered without this
       file knowing about it. The selector is the site's real interactive
       surface rather than every element that happens to be clickable. */
    var SEL = "a[href], button, [role='button'], .wk-card, .studio-link, .proto__open";
    document.addEventListener(
      "pointerover",
      function (e) {
        if (!on) return;
        var t = e.target.closest && e.target.closest(SEL);
        if (t && t !== btn && !btn.contains(t)) hover();
      },
      { passive: true }
    );
    document.addEventListener(
      "pointerdown",
      function (e) {
        if (!on) return;
        var t = e.target.closest && e.target.closest(SEL);
        if (t && t !== btn && !btn.contains(t)) click();
      },
      { passive: true }
    );
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
