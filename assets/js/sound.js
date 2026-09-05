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
    /* ── QUIETER, ACROSS THE BOARD ─────────────────────────────────────
       Sid: "make sure to try to make the audio hover sounds a lot more subtle
       and gentler. They're way too much. Too much is happening right now."

       The master is the honest place to take it out of, because every voice
       in this file is mixed against it -- dropping individual peaks would
       just move the problem to whichever sound happened to be loudest. 0.05
       to 0.028 is a little over half, and the hover and click peaks below
       come down again on top of that so the interface reads as a texture you
       notice rather than a thing that answers you. */
    master.gain.value = 0.028;
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

  /* ── HOVER IS ALMOST SILENT NOW ───────────────────────────────────────
     Sid: "the hover sound on each and everything is way too much audio also
     can we have something more futuristic."

     The 90ms gate was solving the wrong problem. It stopped a nav sweep
     becoming an arpeggio, but it still let every single deliberate hover make
     a noise -- and on a page of seventeen cards, a strip of tiles and four
     nav marks, that is a sound every time the pointer moves anywhere. The
     failure was not the rate, it was that hover was audible at all.

     A hover is not an event. It is the pointer being somewhere. So it only
     speaks for elements that are genuinely a destination -- and even then at
     a third of the level, once every 700ms at most. Everything else is
     silent and the click carries the interaction.

     FUTURISTIC, CONCRETELY. The old hover was a 1180Hz sine plus a bright
     noise tick, which is a UI beep. This is a short two-oscillator chime a
     perfect fifth apart with the upper voice detuned four cents, run through
     a lowpass that opens as it sounds -- so it arrives soft and resolves,
     rather than clicking. That opening filter is most of what separates
     "spacecraft" from "notification". */
  function hover() {
    if (!on) return;
    var now = Date.now();
    if (now - lastHover < 700) return;
    lastHover = now;
    detune = ((detune + 5) % 20) - 10;
    var c = audio();
    if (!c) return;
    var g = c.createGain();
    var lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(700, c.currentTime);
    lp.frequency.exponentialRampToValueAtTime(4200, c.currentTime + 0.07);
    lp.Q.value = 0.7;
    g.gain.setValueAtTime(0, c.currentTime);
    /* Hover: halved again and given a longer tail, so it is a breath rather
       than a tick. A short sharp envelope is what made a row of cards sound
       like a keyboard. */
    g.gain.linearRampToValueAtTime(0.07, c.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.22);
    [880, 1320].forEach(function (f, i) {
      var o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.detune.value = detune + (i ? 4 : 0);
      o.connect(lp);
      o.start();
      o.stop(c.currentTime + 0.16);
    });
    lp.connect(g);
    g.connect(master);
    pulse();
  }

  /* The click is the same instrument an octave down, with the noise layer
     kept -- that burst is what makes it read as a mechanism closing rather
     than as a second chime. It is the sound that matters now that hover has
     stepped back, so it is the one allowed to be definite. */
  function click() {
    if (!on) return;
    var c = audio();
    if (!c) return;
    var g = c.createGain();
    var lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(520, c.currentTime);
    lp.frequency.exponentialRampToValueAtTime(3200, c.currentTime + 0.05);
    g.gain.setValueAtTime(0, c.currentTime);
    /* Click stays the loudest thing, because it confirms something happened,
       but 0.34 against a 0.028 master was the one sound people flinched at. */
    g.gain.linearRampToValueAtTime(0.18, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.26);
    [440, 660].forEach(function (f, i) {
      var o = c.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(f * 0.86, c.currentTime + 0.2);
      o.detune.value = i ? 5 : 0;
      o.connect(lp);
      o.start();
      o.stop(c.currentTime + 0.24);
    });
    lp.connect(g);
    g.connect(master);
    tick(0.022, 1800, 0.13);
    pulse();
  }

  /* The waveform only travels while something is sounding -- see the note on
     .is-playing in site_footer.html. */
  var pulseT = 0;
  function pulse() {
    var el = document.getElementById("sound-toggle");
    if (!el) return;
    el.classList.add("is-playing");
    clearTimeout(pulseT);
    pulseT = setTimeout(function () {
      el.classList.remove("is-playing");
    }, 420);
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

  /* ── THUNDER ─────────────────────────────────────────────────────────────
     Exposed for ambient.js, which owns the rain and decides when a storm
     happens. It is published rather than imported so the two files stay
     independent: the weather does not need audio to work, and the audio does
     not need to know what the weather is doing.

     A thunderclap is not a note. It is a wide band of noise with almost no
     attack shape and a very long, filtered decay, plus a low sine underneath
     that carries the part you feel rather than hear. Six seconds of buffer is
     generated on demand -- a sample would be a 200KB download for something a
     visitor might hear twice.

     It respects the toggle like everything else here. Sid asked for thunder;
     nobody asked to be startled by a website. */
  window.__thunder = function (distance) {
    if (!on) return;
    var c = audio();
    if (!c) return;
    var far = typeof distance === "number" ? distance : 0.5; /* 0 close, 1 far */
    var dur = 2.4 + far * 3.4;
    var n = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, n, c.sampleRate);
    var d = buf.getChannelData(0);
    /* Brownian rather than white. White noise is static; integrating it tilts
       the spectrum toward the low end, which is what makes it read as weather
       instead of as a broken speaker. */
    var last = 0;
    for (var i = 0; i < n; i++) {
      var w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      /* The rumble rolls in rather than starting at full -- a clap that begins
         at its peak is a gunshot. */
      var env = Math.min(1, i / (c.sampleRate * 0.12)) * Math.pow(1 - i / n, 2.1);
      d[i] = last * 3.4 * env;
    }
    var src = c.createBufferSource();
    src.buffer = buf;
    var lp = c.createBiquadFilter();
    lp.type = "lowpass";
    /* Distance is a filter, not a volume. Far thunder loses its top long
       before it loses its level, which is the only cue that makes one clap
       sound closer than another. */
    lp.frequency.setValueAtTime(1400 - far * 900, c.currentTime);
    lp.frequency.exponentialRampToValueAtTime(220, c.currentTime + dur);
    var g = c.createGain();
    g.gain.value = 0.55 - far * 0.3;
    src.connect(lp);
    lp.connect(g);
    g.connect(master);
    src.start();

    /* The body of it. Sub content the small speakers will not reproduce and
       the good ones will, which is the right way round. */
    var o = c.createOscillator();
    var og = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(58 - far * 14, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(32, c.currentTime + dur * 0.8);
    og.gain.setValueAtTime(0, c.currentTime);
    og.gain.linearRampToValueAtTime(0.5 - far * 0.28, c.currentTime + 0.09);
    og.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur * 0.85);
    o.connect(og);
    og.connect(master);
    o.start();
    o.stop(c.currentTime + dur);
  };

  /* ═════════════════════════════════════════════════════════════════════
     THE BED

     Sid: "the bg can be a relaxing lofi channel like the claude fm channel
     very light."

     SYNTHESISED, LIKE EVERYTHING ELSE HERE. A lofi stream is a 3MB file on
     loop, and a loop is the one thing that kills the effect -- you notice the
     seam on the second pass and after that you only hear the seam. This is a
     generative bed: four voices that never line up the same way twice, so it
     has no length to notice.

     WHAT IT IS. Three sine voices held on a chord, plus a slow filtered noise
     wash that breathes. The chord moves once every twelve to twenty seconds
     between four positions of the same scale, and each move is a glide rather
     than a change, so nothing ever "starts". A lowpass at 900Hz takes the top
     off everything, which is what makes it sit under a page instead of on it,
     and a very slow LFO on that cutoff is the tape-warble the genre is built
     on.

     "VERY LIGHT" IS A NUMBER. The bed runs at 0.055 against a master of 0.05,
     so its absolute peak is under a thousandth of full scale. It is below the
     hover chime and well below the click. On laptop speakers in a quiet room
     it is barely there; that is the intent -- somebody should have to notice
     it rather than be played at.

     It only ever exists behind the same toggle as everything else, it starts
     on a fade so turning sound on is not a cut, and it stops entirely on a
     hidden tab -- nobody wants a portfolio humming in a background window.
     ═════════════════════════════════════════════════════════════════════ */
  var bed = null;

  function startBed() {
    var c = audio();
    if (!c || bed) return;

    var out = c.createGain();
    out.gain.setValueAtTime(0, c.currentTime);
    /* Sid: "Let it start with a nice background lo-fi nature-type sound, very
       light." The pad comes down with everything else and the air below it
       carries the "nature" half. */
    out.gain.linearRampToValueAtTime(0.04, c.currentTime + 4.5);

    var lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    lp.Q.value = 0.4;
    lp.connect(out);
    out.connect(master);

    /* The warble. A slow wobble on the cutoff, which is the tape artefact
       that separates this from an ambient pad. */
    var lfo = c.createOscillator();
    var lfoGain = c.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);
    lfo.start();

    /* Fmaj9-ish, low and open. Voiced in fourths and fifths so no two voices
       beat against each other at this level. */
    var CHORDS = [
      [174.61, 261.63, 349.23],
      [196.0, 293.66, 392.0],
      [155.56, 233.08, 311.13],
      [174.61, 277.18, 349.23],
    ];
    var voices = CHORDS[0].map(function (f, i) {
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = "sine";
      o.frequency.value = f;
      o.detune.value = i * 3 - 3;
      g.gain.value = 0.34;
      o.connect(g);
      g.connect(lp);
      o.start();
      return o;
    });

    /* The wash. Brown noise, heavily filtered, breathing on its own clock --
       it is the room the chord is played in. */
    var n = Math.floor(c.sampleRate * 4);
    var buf = c.createBuffer(1, n, c.sampleRate);
    var d = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < n; i++) {
      var w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 2.4;
    }
    var noise = c.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    /* ── THE AIR IS THE NATURE LAYER, AND IT WAS ALREADY HERE ──────────
       Sid: "Let it start with a nice background lo-fi nature-type sound, very
       light."

       This brown-noise wash already existed under the pad and is the right
       instrument for it -- a loop of real rain is recognisable, and once you
       recognise it you start hearing the loop point, whereas shaped noise has
       no loop to find. What it lacked was movement and the right band: a flat
       420Hz lowpass is a hiss, and it is the drift across the band that makes
       noise read as weather rather than as a broken speaker.

       So the filter opens up and its cutoff now wanders on a two-minute
       cycle, and the level comes up slightly against the quieter master --
       0.05 to 0.075 -- because with the pad at 0.04 the air should be the
       thing you are mostly hearing. */
    var nf = c.createBiquadFilter();
    nf.type = "lowpass";
    nf.frequency.value = 620;
    nf.Q.value = 0.5;
    var ndrift = c.createOscillator();
    var ndriftGain = c.createGain();
    ndrift.frequency.value = 0.0085;
    ndriftGain.gain.value = 240;
    ndrift.connect(ndriftGain);
    ndriftGain.connect(nf.frequency);
    ndrift.start();
    var ng = c.createGain();
    ng.gain.value = 0.075;
    noise.connect(nf);
    nf.connect(ng);
    ng.connect(out);
    noise.start();

    var breathe = c.createOscillator();
    var bg = c.createGain();
    breathe.frequency.value = 0.045;
    bg.gain.value = 0.03;
    breathe.connect(bg);
    bg.connect(ng.gain);
    breathe.start();

    var chordAt = 0;
    var timer = setInterval(
      function () {
        if (!bed) return;
        chordAt = (chordAt + 1) % CHORDS.length;
        var next = CHORDS[chordAt];
        /* A glide, not a change. Six seconds, so the move is under the
         threshold at which somebody would call it an event. */
        voices.forEach(function (o, k) {
          o.frequency.exponentialRampToValueAtTime(next[k], c.currentTime + 6);
        });
      },
      12000 + Math.random() * 8000
    );

    bed = {
      stop: function () {
        clearInterval(timer);
        try {
          out.gain.cancelScheduledValues(c.currentTime);
          out.gain.setValueAtTime(out.gain.value, c.currentTime);
          out.gain.linearRampToValueAtTime(0, c.currentTime + 1.2);
        } catch (e) {}
        setTimeout(function () {
          try {
            voices.forEach(function (o) {
              o.stop();
            });
            noise.stop();
            lfo.stop();
            ndrift.stop();
            breathe.stop();
          } catch (e) {}
        }, 1400);
      },
    };
  }

  function stopBed() {
    if (!bed) return;
    bed.stop();
    bed = null;
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopBed();
    else if (on) startBed();
  });

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
    if (on) startBed();
    else stopBed();
  });

  function mount() {
    document.body.appendChild(btn);
    paint();

    /* Delegated, so anything added to the page later is covered without this
       file knowing about it. The selector is the site's real interactive
       surface rather than every element that happens to be clickable. */
    /* ── ONLY DESTINATIONS SPEAK ──────────────────────────────────────
       The old list included every anchor and every button on the site, which
       on /works/ alone is seventeen cards plus their titles, plus the lane
       links, plus the nav, plus the footer. Moving the pointer across the
       page made noise more or less continuously.

       A hover sound is worth having on things that ARE somewhere -- a
       project, a nav destination, the prototype you are about to open. It is
       not worth having on a copy button, a theme toggle, an inline link in a
       paragraph, or a tile in a drifting strip. Those still click; they just
       do not announce themselves as the pointer passes. */
    var SEL = ".wk-card, .studio-link, .proto__open, .ftr__cta, .hero__resume, .contact-address a";
    /* Click is broader than hover on purpose: pressing a thing should always
       answer, even when passing over it should not. */
    var CLICK_SEL = "a[href], button, [role='button']";
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
        var t = e.target.closest && e.target.closest(CLICK_SEL);
        if (t && t !== btn && !btn.contains(t)) click();
      },
      { passive: true }
    );
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();

  /* A visitor who turned sound on earlier gets the bed back, but only after a
     real gesture -- an AudioContext created without one is born suspended, and
     a silent context that thinks it is playing is worse than no bed at all. */
  if (on) {
    var wake = function () {
      var c = audio();
      if (c && c.state === "suspended") c.resume();
      startBed();
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
    window.addEventListener("pointerdown", wake, { once: true });
    window.addEventListener("keydown", wake, { once: true });
  }
})();
