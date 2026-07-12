// audio.js — a slow, generative ambient bed for MIMIC.
// No audio files: everything is synthesised in the browser so the piece stays a
// single self-contained build. A low evolving drone holds the room; each new
// sighting drops one soft bell tuned to a pentatonic scale, and a confirmed guess
// rings a brighter pair. It is meant to sit under the eye, never in front of it.

const SCALE = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // A minor pentatonic-ish

export class Ambient {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.bus = null;       // bells/reverb send
    this.on = false;       // user-facing toggle state
    this.started = false;  // has the graph been built (needs a gesture)
    this._lastBell = 0;
    this._clip = null;     // currently-playing field recording, if any
  }

  // Build the graph on the first user gesture (autoplay policy).
  async _ensure() {
    if (this.started) return;
    this.started = true;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    const ctx = this.ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0.0001;
    this.master.connect(ctx.destination);

    // a simple, lush feedback-delay "reverb" that everything shares
    const pre = ctx.createGain(); pre.gain.value = 0.5;
    const delay = ctx.createDelay(2.0); delay.delayTime.value = 0.42;
    const fb = ctx.createGain(); fb.gain.value = 0.55;
    const tone = ctx.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = 2200;
    pre.connect(delay); delay.connect(tone); tone.connect(fb); fb.connect(delay);
    delay.connect(this.master);
    this.bus = pre;

    // evolving drone: a few detuned sines under a slowly opening lowpass
    const droneGain = ctx.createGain(); droneGain.gain.value = 0.16;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 480; lp.Q.value = 0.7;
    droneGain.connect(lp); lp.connect(this.master); lp.connect(this.bus);

    const roots = [55, 82.41, 110, 164.81]; // A1, E2, A2, E3
    for (let i = 0; i < roots.length; i++) {
      const o = ctx.createOscillator();
      o.type = i % 2 ? "sine" : "triangle";
      o.frequency.value = roots[i];
      o.detune.value = (i - 1.5) * 4;
      const g = ctx.createGain(); g.gain.value = i === 0 ? 0.9 : 0.4 / i;
      o.connect(g); g.connect(droneGain);
      o.start();
    }

    // slow LFO breathes the drone's cutoff so it is never static
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.045;
    const lfoG = ctx.createGain(); lfoG.gain.value = 260;
    lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start();
  }

  async enable() {
    this.on = true; // reflect intent immediately so the UI is never stale
    try {
      await this._ensure();
      if (this.ctx.state === "suspended") await this.ctx.resume();
      if (!this.on) return; // toggled back off while we were starting
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(0.5, this.ctx.currentTime, 1.4);
    } catch (e) {
      this.on = false; // no audio available; stay silent, never throw
    }
  }

  disable() {
    this.on = false;
    this.stopClip();
    if (!this.started) return;
    this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.5);
  }

  toggle() { this.on ? this.disable() : this.enable(); return this.on; }

  // one soft bell when a new organism arrives
  arrival(seed = 0.5) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (t - this._lastBell < 0.16) return; // never machine-gun
    this._lastBell = t;
    const f = SCALE[Math.floor(Math.abs(seed) * SCALE.length) % SCALE.length];
    this._bell(f, 0.10, 1.8, (seed % 1) * 2 - 1);
  }

  // a brighter two-note ring when a guess is confirmed by reality
  confirm(seed = 0.5) {
    if (!this.on || !this.ctx) return;
    const f = SCALE[(Math.floor(Math.abs(seed) * SCALE.length) + 2) % SCALE.length];
    this._bell(f, 0.12, 2.4, 0);
    this._bell(f * 1.5, 0.08, 2.4, 0, 0.14);
  }

  // play a real field recording of an organism, ducking the ambient bed under it.
  // Uses a plain media element (no Web Audio routing) so no CORS is required.
  async playClip(url) {
    if (!url || !this.on) return;
    try { await this._ensure(); } catch (e) { /* ducking is optional */ }
    this.stopClip();
    const a = new Audio();
    a.src = url;
    a.volume = 0.0;
    this._clip = a;
    this._duck(0.22);
    const done = () => { if (this._clip === a) { this._clip = null; this._duck(1); } };
    a.addEventListener("ended", done);
    a.addEventListener("error", done);
    try {
      await a.play();
      // gentle fade-in on the element itself
      let v = 0; const tgt = 0.92;
      const id = setInterval(() => {
        if (this._clip !== a) { clearInterval(id); return; }
        v = Math.min(tgt, v + 0.06); a.volume = v;
        if (v >= tgt) clearInterval(id);
      }, 40);
    } catch (e) { done(); }
  }

  stopClip() {
    const a = this._clip;
    if (!a) return;
    this._clip = null;
    try { a.pause(); } catch (e) {}
    this._duck(1);
  }

  _duck(factor) {
    if (!this.master || !this.ctx) return;
    const base = this.on ? 0.5 : 0.0001;
    this.master.gain.setTargetAtTime(base * factor, this.ctx.currentTime, 0.25);
  }

  _bell(freq, peak, dur, pan = 0, delay = 0) {
    const ctx = this.ctx, t = ctx.currentTime + delay;
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 2.01;
    const g = ctx.createGain(); g.gain.value = 0;
    const g2 = ctx.createGain(); g2.gain.value = 0;
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (p) p.pan.value = Math.max(-1, Math.min(1, pan));
    o.connect(g); o2.connect(g2);
    const out = p || this.master;
    g.connect(out); g2.connect(out);
    if (p) { p.connect(this.master); p.connect(this.bus); }
    else { g.connect(this.bus); }
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(peak * 0.35, t + 0.012);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.7);
    o.start(t); o2.start(t);
    o.stop(t + dur + 0.1); o2.stop(t + dur + 0.1);
  }
}
