/* ─────────────────────────────────────────────────────────────────────────
   THE MARK SAYS HIS NAME

   Sid: "only play the first 3 audios on hover of cube logo, its me
   pronouncing my name in 3 different ways."

   Three recordings, cleaned and given a room, cycling one per hover so the
   name is said a different way each time rather than becoming a tic.

   ── IT OBEYS THE SOUND TOGGLE, AND THAT IS DELIBERATE ────────────────────
   assets/js/sound.js sets the rule for this site in its own header: sound is
   off until a visitor asks for it, because "a portfolio that makes noise at a
   stranger without being asked is a portfolio they close." A name is content
   rather than a UI blip, so there is a real argument for exempting it, but
   that argument is Sid's to make and not mine to assume. This reads the same
   `sid_sound` key the waveform control writes, so turning sound on turns the
   name on with it. Flip RESPECT_TOGGLE to false to let the name through
   regardless.

   ── WHY HOVER ALONE CANNOT START IT ──────────────────────────────────────
   Chrome and Safari gate audible playback behind a real user gesture, and a
   pointerenter is not one. The first hover on a cold page will be refused by
   the browser no matter what this file does, so the rejection is swallowed
   rather than logged, and a single pointerdown or keydown anywhere unlocks
   playback for the rest of the session.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var RESPECT_TOGGLE = true;
  var CLIPS = ["name-1", "name-2", "name-3"]; /* the first three takes */
  var KEY = "sid_sound";

  /* A pointer that cannot hover has no hover to fire on, and a touch device
     that fires one synthetically would play the name on the way to a tap. */
  if (!window.matchMedia || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var mark = document.querySelector(".studio-mark");

  var audio = null,
    i = 0,
    unlocked = false,
    lastAt = 0;

  function soundOn() {
    if (!RESPECT_TOGGLE) return true;
    try {
      return window.localStorage && localStorage.getItem(KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  /* baseurl comes off the script tag rather than being hardcoded. It is empty
     for this site today, but a static .js file cannot read Liquid, and a
     hardcoded leading slash is exactly what breaks if the site is ever served
     from a subpath. */
  var self = document.currentScript || document.querySelector('script[src*="name-say"]');
  var BASE = (self && self.getAttribute("data-base")) || "";

  /* Built on the first hover, not on load: three clips is about 75KB, and a
     visitor who never points at the mark should not pay for them. */
  function build() {
    if (audio) return;
    audio = CLIPS.map(function (n) {
      var a = new Audio(BASE + "/assets/audio/name/" + n + ".m4a");
      a.preload = "auto";
      a.volume = 0.85;
      return a;
    });
  }

  window.addEventListener(
    "pointerdown",
    function () {
      unlocked = true;
    },
    { once: true, passive: true }
  );
  window.addEventListener(
    "keydown",
    function () {
      unlocked = true;
    },
    { once: true }
  );

  if (mark)
    mark.addEventListener(
      "pointerenter",
      function () {
        if (!soundOn() || document.hidden) return;
        var now = Date.now();
        /* One name per pass. Without this, sliding across the mark and back
       retriggers on top of itself and the reverb tails pile up. */
        if (now - lastAt < 900) return;
        build();
        var a = audio[i % audio.length];
        i++;
        lastAt = now;
        try {
          a.currentTime = 0;
          var p = a.play();
          /* Refused until the page has had a real gesture. Nothing to report:
         the visitor did not ask for a name, they moved a mouse. */
          if (p && p.catch) p.catch(function () {});
        } catch (e) {}
      },
      { passive: true }
    );

  /* ── THE HOMEPAGE BUTTON ─────────────────────────────────────────────
     One file, the three pronunciations mastered as a single take with a
     breath between them, because pressing a button three times to find out
     there are three ways is a worse answer than hearing all three.

     No sound-toggle gate on this one, and that is the point of it being a
     button. The hover on the mark is something that happens TO a visitor, so
     it defers to the toggle. A press is something they asked for, and it is
     also the user gesture browsers demand before allowing any audio at all,
     which is why this always works where the hover sometimes will not. */
  var btn = document.getElementById("hero-say");
  if (!btn) return;
  var say = null;

  btn.addEventListener("click", function () {
    if (!say) {
      say = new Audio(BASE + "/assets/audio/name/say-my-name.m4a");
      say.preload = "auto";
      say.volume = 0.9;
      say.addEventListener("ended", function () {
        btn.classList.remove("is-saying");
      });
      say.addEventListener("pause", function () {
        btn.classList.remove("is-saying");
      });
    }
    /* A second press restarts rather than stacking. Pausing would leave the
       control looking available while saying nothing. */
    try {
      say.currentTime = 0;
      var p = say.play();
      btn.classList.add("is-saying");
      if (p && p.catch)
        p.catch(function () {
          btn.classList.remove("is-saying");
        });
    } catch (e) {
      btn.classList.remove("is-saying");
    }
  });
})();
