// main.js — MIMIC
// A live atlas of life on Earth, arranged by how it looks to a machine instead
// of by what science calls it, and — where the feed outruns the eye — filled
// with the life the machine expects to be there but no one has seen.
//
// Pipeline:
//   iNaturalist firehose  ->  CLIP (a worker)  ->  online force layout in 3-D
//        ->  WebGPU billboards + resemblance web  ->  decay (the atlas forgets)
//        ->  imagined forms (predicted between neighbours, confirmed by reality)

import { Feed, fetchTaxonSound } from "./feed.js";
import { Atlas, loadBitmap } from "./atlas.js";
import { Stage } from "./render.js";
import { nearest, seedPosition, blendVec, relax } from "./layout.js";
import { Ambient } from "./audio.js";

const REAL_CAP = 260;       // how many living forms the eye can hold at once
const GHOST_RATIO = 0.28;   // keep observed animals visually dominant
const TOTAL_CAP = 820;

const FADE_IN = 3600;       // ms — forms bloom in slowly
const FADE_OUT = 9500;      // ms — and dissolve gently
const LIFE_REAL = [240000, 360000];
const LIFE_GHOST = [60000, 96000];
const SCALE_REAL = 3.3;
const SCALE_GHOST = 2.8;
const CONFIRM_SIM = 0.82;   // an imagined form this close to an arriving real is confirmed
const COOL_MS = 15000;      // how long a new form keeps moving before it settles to rest
const REST_NEAR = 5.0;      // spring length for the most-alike pair (spaced so each is hoverable)
const REST_FAR = 14.0;      // spring length for the least-alike pair kept as an edge

// ---------- state ----------
const realNodes = [];
const ghostNodes = [];
const allNodes = [];          // render set = real + ghost (kept in sync)
const pending = new Map();    // id -> {org, _vec, _tile, _tint, _slot}
const confirmArcs = [];       // transient bright links: a guess meeting its reality

const $ = (id) => document.getElementById(id);
const els = {
  intro: $("intro"), introBar: $("intro-bar"), introErr: $("intro-err"),
  introStatus: $("intro-status"), retry: $("retry"),
  readout: $("readout"), detail: $("detail"), sound: $("sound"), motion: $("motion"),
  recenter: $("recenter"), pulse: $("pulse"), guide: $("guide"),
};

let hoverNode = null;   // the form under the cursor; lights its cluster, dims the rest
let pickedNode = null;  // the form clicked into focus (the enlarge card)
let readoutNode = null; // avoids rebuilding the same tooltip every animation frame
const audio = new Ambient();
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
let motionOn = !reduceMotion.matches;

// DEV-only verification hook (localhost): lets a headless check read internal
// state without any on-screen debug chrome. Inert in production.
const DEV = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
  ? (window.__mimic = {
      misses: 0, lastMiss: "",
      get real() { return realNodes.length; },
      get ghost() { return ghostNodes.length; },
      get pending() { return pending.size; },
      get hover() { return hoverNode ? shortName(hoverNode.meta || {}) : null; },
      get minHl() { let m = 1; for (const n of allNodes) if ((n.hl ?? 1) < m) m = n.hl ?? 1; return m; },
      get maxDrift() { return _drift; },
      get topSim() { let m = 0; for (const n of realNodes) { const s = n.meta?.similarity || 0; if (s > m) m = s; } return m; },
    })
  : null;

// ---------- boot guards ----------
if (!navigator.gpu) {
  els.introErr.textContent =
    "This live version needs WebGPU. Open it in a current desktop Chrome, Edge, or Safari 18+ browser.";
  els.introStatus.textContent = "Showing a lightweight live field preview instead.";
  els.retry.hidden = false;
  startFallback();
} else {

const atlas = new Atlas({ size: 2560, tile: 128 }); // 20x20 = 400 photo slots
const stage = new Stage(document.getElementById("app"), atlas, TOTAL_CAP);
setMotion(motionOn);

// ---------- the eye (CLIP in a worker) ----------
const worker = new Worker(new URL("./clip.worker.js", import.meta.url), { type: "module" });
const bootTimeout = setTimeout(() => {
  if (els.intro.classList.contains("ready")) return;
  els.introStatus.textContent = "This is taking longer than usual.";
  els.introErr.textContent = "The vision model is still loading. Check your connection or try again.";
  els.retry.hidden = false;
}, 60000);

worker.onmessage = (ev) => {
  const m = ev.data;
  if (m.type === "boot") {
    if (typeof m.pct === "number") {
      const pct = Math.round(m.pct);
      els.introBar.style.width = `${pct}%`;
      els.introStatus.textContent = `loading the machine's eye · ${pct}%`;
    }
  } else if (m.type === "ready") {
    clearTimeout(bootTimeout);
    els.introBar.style.width = "100%";
    els.intro.classList.add("ready");
    els.introStatus.textContent = "the field is ready";
    feed.start();
  } else if (m.type === "embedding") {
    const p = pending.get(m.id);
    if (p) { p._vec = m.vec; tryPromote(m.id); }
  } else if (m.type === "miss") {
    if (DEV) { DEV.misses++; DEV.lastMiss = m.error || "(no error)"; }
    dropPending(m.id);
  } else if (m.type === "fatal") {
    clearTimeout(bootTimeout);
    els.introErr.textContent = "Could not load the vision model: " + m.error;
    els.introStatus.textContent = "Check your connection, then try again.";
    els.retry.hidden = false;
  }
};

// ---------- feed -> intake ----------
const feed = new Feed(onOrganism, { intervalMs: 5000 });

function freeASlot() {
  // capacity is finite; if the atlas is full, force the oldest living form to fade.
  let slot = atlas.alloc();
  if (slot != null) return slot;
  let oldest = null;
  for (const n of realNodes) {
    if (n.fading) continue;
    if (!oldest || n.born < oldest.born) oldest = n;
  }
  if (oldest) startFade(oldest, true);
  return atlas.alloc();
}

async function onOrganism(org) {
  if (pending.has(org.id)) return;
  const slot = freeASlot();
  if (slot == null) return; // atlas saturated; let the world keep moving, sip later
  const p = { org, _vec: null, _tile: null, _tint: null, _slot: slot };
  pending.set(org.id, p);

  worker.postMessage({ type: "embed", id: org.id, photo: org.photo });

  try {
    const bmp = await loadBitmap(org.photo);
    // the embed may have been dropped (eye fell behind) while the image loaded —
    // its slot is gone, so don't draw into a slot now owned by someone else.
    const live = pending.get(org.id);
    if (!live || live._slot !== slot) { bmp.close && bmp.close(); return; }
    const tint = atlas.draw(slot, bmp);
    bmp.close && bmp.close();
    p._tile = atlas.rect(slot);
    p._tint = tint;
    tryPromote(org.id);
  } catch (e) {
    dropPending(org.id);
  }
}

function dropPending(id) {
  const p = pending.get(id);
  if (!p) return;
  atlas.release(p._slot);
  pending.delete(id);
}

function tryPromote(id) {
  const p = pending.get(id);
  if (!p || !p._vec || !p._tile) return;
  pending.delete(id);

  const o = p.org;
  const neigh = nearest(p._vec, realNodes, 6, 0.5);
  const pos = seedPosition(neigh);

  const node = {
    id, kind: "real", vec: p._vec, pos, vel: [0, 0, 0], edges: [],
    tile: p._tile, slot: p._slot, tint: p._tint,
    scale: 0.001, targetScale: SCALE_REAL, alpha: 0,
    born: now(), life: rangeRand(LIFE_REAL, id), fading: false, dead: false,
    meta: {
      sci: o.sci, common: o.common, place: o.place, when: o.when, iconic: o.iconic,
      photo: o.photo, sound: o.sound, taxonId: o.taxonId, observationId: o.id,
      nearest: neigh[0]?.node ? shortName(neigh[0].node.meta) : "",
      similarity: neigh[0]?.s || 0,
    },
  };

  for (const { node: nb, s } of neigh) {
    if (nb.dead) continue;
    const rest = mapRange(s, 0.5, 1, REST_FAR, REST_NEAR);
    node.edges.push({ to: nb, rest, k: 0.018 });
    nb.edges.push({ to: node, rest, k: 0.009 });
  }

  realNodes.push(node);
  allNodes.push(node);
  audio.arrival(frac(typeof id === "number" ? id : node.born));

  confirmGhostsNear(node);
  maybeSpawnGhost(node, neigh);
}

// ---------- imagined forms: the life expected between known forms ----------
function maybeSpawnGhost(node, neigh) {
  if (!neigh.length) return;
  const want = Math.floor(realNodes.length * GHOST_RATIO);
  const live = ghostNodes.filter((g) => !g.fading).length;
  if (live >= want) return;
  if (allNodes.length >= TOTAL_CAP - 4) return;

  const partner = neigh[0].node;
  if (!partner || partner.dead) return;

  const t = 0.4 + 0.2 * frac(node.id);
  const vec = blendVec(node.vec, partner.vec, t);
  const pos = [
    (node.pos[0] + partner.pos[0]) / 2 + (frac(node.id * 7) - 0.5) * 4,
    (node.pos[1] + partner.pos[1]) / 2 + (frac(node.id * 13) - 0.5) * 4,
    (node.pos[2] + partner.pos[2]) / 2 + (frac(node.id * 19) - 0.5) * 4,
  ];
  // imagined forms get a cool, luminous palette so the machine's guesses read
  // as distinct from the full natural colour of real life.
  const h = frac(node.id * 0.6180339);
  const tint = [0.48 + 0.24 * h, 0.40 + 0.16 * (1 - h), 0.96];

  const ghost = {
    id: "g" + node.id, kind: "ghost", vec, pos, vel: [0, 0, 0],
    edges: [
      { to: node, rest: 6.0, k: 0.02 },
      { to: partner, rest: 6.0, k: 0.02 },
    ],
    tile: [0, 0, 0, 0], slot: null, tint,
    scale: 0.001, targetScale: SCALE_GHOST, alpha: 0,
    born: now(), life: rangeRand(LIFE_GHOST, node.id), fading: false, dead: false,
    confirmed: false,
    meta: { between: [shortName(node.meta), shortName(partner.meta)] },
  };
  ghostNodes.push(ghost);
  allNodes.push(ghost);
}

function confirmGhostsNear(node) {
  for (const g of ghostNodes) {
    if (g.fading || g.dead || !g.vec) continue;
    let s = 0;
    for (let i = 0; i < g.vec.length; i++) s += g.vec[i] * node.vec[i];
    if (s > CONFIRM_SIM) {
      g.confirmed = true;
      g.confirmFlash = 1;
      // a bright filament from the guess to the real thing that proved it
      confirmArcs.push({ a: [g.pos[0], g.pos[1], g.pos[2]], real: node, t0: now() });
      audio.confirm(frac((node.born || 1) * 1.7));
      startFade(g, true); // the guess collapses into reality
    }
  }
}

// ---------- decay / animation ----------
function startFade(node, forced) {
  if (node.fading) return;
  node.fading = true;
  node.fadeStart = now();
  if (forced) node.life = 0;
}

function removeNode(node) {
  node.dead = true;
  if (node === pickedNode) releasePick();
  if (node.kind === "real") {
    atlas.release(node.slot);
    const i = realNodes.indexOf(node);
    if (i >= 0) realNodes.splice(i, 1);
  } else {
    const i = ghostNodes.indexOf(node);
    if (i >= 0) ghostNodes.splice(i, 1);
  }
  const j = allNodes.indexOf(node);
  if (j >= 0) allNodes.splice(j, 1);
}

function step(dt) {
  const t = now();

  // forced forgetting: over capacity, the oldest start to fade
  if (realNodes.length > REAL_CAP) {
    const over = realNodes.length - REAL_CAP;
    const cand = realNodes.filter((n) => !n.fading).sort((a, b) => a.born - b.born);
    for (let i = 0; i < Math.min(over, cand.length); i++) startFade(cand[i], true);
  }

  for (let i = allNodes.length - 1; i >= 0; i--) {
    const n = allNodes[i];
    if (!n.fading && t - n.born > n.life) startFade(n, false);

    if (n.fading) {
      const k = (t - n.fadeStart) / FADE_OUT;
      n.alpha = Math.max(0, 1 - k);
      n.scale = n.targetScale * (0.6 + 0.4 * n.alpha);
      if (n.confirmFlash) {
        n.confirmFlash = Math.max(0, n.confirmFlash - dt / 350);
        n.scale = n.targetScale * (1 + n.confirmFlash * 1.6);
      }
      if (n.alpha <= 0.001) { removeNode(n); continue; }
    } else {
      const age = t - n.born;
      const inK = Math.min(1, age / FADE_IN);
      n.alpha = inK;
      const breathe = 1 + 0.018 * Math.sin((t + n.born) * 0.0006);
      const focusK = n.focusK || 0;
      n.scale = n.targetScale * (0.25 + 0.75 * inK) * breathe * (1 + 0.85 * focusK);
      // cool the node as it ages: it drifts into its cluster over the first
      // ~COOL_MS, then comes to rest so the field is calm and readable.
      n.mob = Math.max(0.05, 1 - age / COOL_MS);
    }
  }

  relax(allNodes, 0.22, {
    gravity: 0.0014,
    repel: 88,
    repelRadius: 9.0,
    damping: 0.93,
    maxSpeed: 0.10,
  });

  // verification: how fast is the fastest *settled* form still drifting? Should be
  // tiny once cooled, which is what makes the field calm enough to read.
  if (DEV) {
    let d = 0;
    for (const n of allNodes) {
      if (n.fading || t - n.born <= COOL_MS) continue;
      const sp = Math.hypot(n.vel[0], n.vel[1], n.vel[2]);
      if (sp > d) d = sp;
    }
    _drift = d;
  }
}
let _drift = 0;

// ---------- the resemblance web ----------
// Faint filaments from every form to the handful it most resembles. This is the
// idea made visible: you can see life pulling itself into look-alike clusters,
// and the imagined forms hanging between their parents in cool violet.
function buildWeb() {
  const segs = [];
  const seen = new Set();
  for (const nd of realNodes) {
    if (nd.alpha < 0.06) continue;
    for (const e of nd.edges) {
      const t = e.to;
      if (t.dead || t.kind !== "real" || t.alpha < 0.06) continue;
      const key = nd.id < t.id ? nd.id + "_" + t.id : t.id + "_" + nd.id;
      if (seen.has(key)) continue;
      seen.add(key);
      const sim = clamp01((REST_FAR - e.rest) / (REST_FAR - REST_NEAR));
      const a = Math.min(nd.alpha, t.alpha);
      // the cluster under the cursor lights up; everything else recedes
      const touch = hoverNode && (nd === hoverNode || t === hoverNode);
      const boost = hoverNode ? (touch ? 3.4 : 0.25) : 1;
      const I = (0.045 + sim * 0.20) * a * boost;
      segs.push({ a: nd.pos, b: t.pos, c: [0.26 * I, 0.95 * I, 0.55 * I] });
    }
  }
  for (const g of ghostNodes) {
    if (g.alpha < 0.06) continue;
    for (const e of g.edges) {
      const t = e.to;
      if (t.dead || t.alpha < 0.06) continue;
      const I = 0.13 * Math.min(g.alpha, t.alpha);
      segs.push({ a: g.pos, b: t.pos, c: [0.58 * I, 0.40 * I, 0.98 * I] });
    }
  }
  const t = now();
  for (let i = confirmArcs.length - 1; i >= 0; i--) {
    const arc = confirmArcs[i];
    const age = t - arc.t0;
    if (age > 900 || arc.real.dead) { confirmArcs.splice(i, 1); continue; }
    const I = (1 - age / 900) * 0.95;
    segs.push({ a: arc.a, b: arc.real.pos, c: [0.85 * I, 0.80 * I, 1.0 * I] });
  }
  return segs;
}

// ---------- pointer: hover readout + click to focus ----------
let mouse = { x: -1, y: -1, on: false };
addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; });
addEventListener("pointerleave", () => { mouse.on = false; });

// nearest live form to a screen point, within a forgiving radius
function pickNode(x, y, radius = 40) {
  let best = null, bestScreen = null, bestD = radius * radius;
  for (const n of allNodes) {
    if (n.alpha < 0.25) continue;
    const sc = stage.project(n.pos);
    if (!sc) continue;
    const dx = sc.x - x, dy = sc.y - y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD) { bestD = d2; best = n; bestScreen = sc; }
  }
  return { node: best, screen: bestScreen };
}

// sticky hover: keep the current form lit until the cursor leaves a wider radius,
// so the highlight does not flicker between forms that crowd the same spot.
function pickHover(x, y) {
  if (hoverNode && !hoverNode.dead && hoverNode.alpha > 0.2) {
    const sc = stage.project(hoverNode.pos);
    if (sc && Math.hypot(sc.x - x, sc.y - y) < 64) return { node: hoverNode, screen: sc };
  }
  return pickNode(x, y, 34);
}

function updateReadout() {
  const { node: best, screen } = mouse.on ? pickHover(mouse.x, mouse.y) : { node: null, screen: null };

  // Light the hovered (or focused) form and the look-alikes it is tied to; dim
  // the rest, so the cluster the machine grouped together is what you actually see.
  hoverNode = best;
  const anchor = best || (pickedNode && !pickedNode.dead ? pickedNode : null);
  const lit = new Set();
  if (anchor) {
    lit.add(anchor);
    for (const e of anchor.edges) if (!e.to.dead) lit.add(e.to);
  }
  for (const n of allNodes) {
    const cur = n.hl === undefined ? 1 : n.hl;
    const target = !anchor ? 1 : lit.has(n) ? 1 : 0.14;
    n.hl = cur + (target - cur) * 0.16;
    // gentle scale bloom on the focused form
    const fTarget = n === pickedNode && !n.dead ? 1 : 0;
    n.focusK = (n.focusK || 0) + (fTarget - (n.focusK || 0)) * 0.1;
    // glow: only the anchor (and faintly its neighbours) is bright enough to bloom
    const gTarget = !anchor ? 0 : n === anchor ? 1 : lit.has(n) ? 0.28 : 0;
    n.glow = (n.glow || 0) + (gTarget - (n.glow || 0)) * 0.14;
  }

  document.body.classList.toggle("pickable", !!best);

  // hover tooltip is suppressed while a detail card is open (less clutter)
  if (!best || pickedNode) { els.readout.style.opacity = "0"; readoutNode = null; return; }
  const r = els.readout;
  if (best !== readoutNode) {
    if (best.kind === "ghost") {
      r.classList.add("imagined");
      const [a, b] = best.meta.between || ["?", "?"];
      r.innerHTML =
        `<div class="name">imagined form</div>` +
        `<div class="meta">expected between <i>${esc(a)}</i> and <i>${esc(b)}</i></div>`;
    } else {
      r.classList.remove("imagined");
      const m = best.meta;
      r.innerHTML =
        `<div class="name">${esc(m.sci)}` +
        (m.common ? ` <span class="common">· ${esc(m.common)}</span>` : "") + `</div>` +
        `<div class="meta">${esc(m.place || "somewhere on Earth")}</div>`;
    }
    readoutNode = best;
  }
  r.style.left = screen.x + "px";
  r.style.top = screen.y + "px";
  r.style.opacity = "1";
}

// ---------- click to enlarge ----------
addEventListener("pointerdown", (e) => {
  if (e.target.closest("#sound") || e.target.closest("#motion") || e.target.closest("#recenter") || e.target.closest("#detail") || e.target.closest("#intro")) return;
  hideGuide();
  enableAudioOnce();
  // a drag to orbit should not also pick; remember where the press began
  press = { x: e.clientX, y: e.clientY, moved: false };
});
addEventListener("pointermove", (e) => {
  if (press && (Math.abs(e.clientX - press.x) > 5 || Math.abs(e.clientY - press.y) > 5)) press.moved = true;
});
addEventListener("pointerup", (e) => {
  if (!press) return;
  const wasTap = !press.moved;
  press = null;
  if (!wasTap) return;
  const { node } = pickNode(e.clientX, e.clientY);
  if (node) focusPick(node);
  else releasePick();
});
let press = null;

let soundToken = 0;
function focusPick(node) {
  pickedNode = node;
  stage.focusOn(node.pos, node.kind === "ghost" ? 16 : 14);
  showDetail(node);
  audio.stopClip();
  // the actual voice of this organism, if it has one on record
  const tok = ++soundToken;
  if (node.kind === "real" && (node.meta.sound || node.meta.taxonId)) {
    const sound = node.meta.sound
      ? Promise.resolve(node.meta.sound)
      : fetchTaxonSound(node.meta.taxonId);
    sound.then((url) => {
      if (tok !== soundToken || pickedNode !== node) return; // moved on
      if (url && audio.on) { audio.playClip(url); markListening(); }
    });
  }
}

function releasePick() {
  if (!pickedNode) return;
  pickedNode = null;
  soundToken++;
  audio.stopClip();
  stage.focusOn(null);
  hideDetail();
}

// a quiet "listening" line appears on the card once a recording starts
function markListening() {
  const el = els.detail.querySelector(".listen");
  if (el) el.classList.add("on");
}

function showDetail(node) {
  const m = node.meta || {};
  const d = els.detail;
  if (node.kind === "ghost") {
    const [a, b] = m.between || ["a form", "a nearby form"];
    d.classList.add("imagined");
    d.innerHTML =
      `<div class="ghostmark"><span></span></div>` +
      `<div class="body">` +
      `<div class="sci">an imagined form</div>` +
      `<div class="row">A resemblance the machine <b>expects</b> to exist, placed at the midpoint between ` +
      `<b>${esc(a)}</b> and <b>${esc(b)}</b>. No one has logged it. If a real sighting lands here, the guess is confirmed and dissolves into it.</div>` +
      `<div class="close">click anywhere to release</div>` +
      `</div>`;
  } else {
    d.classList.remove("imagined");
    const sim = m.similarity ? Math.round(clamp01(m.similarity) * 100) : 0;
    const near = m.nearest
      ? `Placed beside <b>${esc(m.nearest)}</b> — the machine reads them as <b>${sim}%</b> alike by sight, though they may be nothing alike by name.`
      : `Held open a new visual region; nothing seen so far looks like it.`;
    d.innerHTML =
      (m.photo ? `<img class="photo" src="${esc(m.photo)}" alt="${esc(m.common || m.sci || "animal observation")}" referrerpolicy="no-referrer" />` : "") +
      `<div class="body">` +
      `<div class="sci">${esc(m.sci || "unknown form")}` +
      (m.common ? `<span class="common">${esc(m.common)}</span>` : "") + `</div>` +
      `<div class="row">${near}</div>` +
      (m.place ? `<div class="place">${esc(m.place)}${m.when ? " · " + esc(formatWhen(m.when)) : ""}</div>` : "") +
      (m.observationId ? `<a class="source" href="https://www.inaturalist.org/observations/${encodeURIComponent(m.observationId)}" target="_blank" rel="noopener noreferrer">view source on iNaturalist ↗</a>` : "") +
      `<div class="listen"><i></i>listening</div>` +
      `<div class="close">click anywhere to release</div>` +
      `</div>`;
  }
  d.classList.add("show");
}

function hideDetail() { els.detail.classList.remove("show"); }

// ---------- sound ----------
let audioTouched = false;
function enableAudioOnce() {
  if (audioTouched) return;
  audioTouched = true;
  audio.enable().then(syncSoundUI);
}
els.sound.addEventListener("click", (e) => {
  e.stopPropagation();
  audioTouched = true;
  audio.toggle();
  syncSoundUI();
});
els.motion.addEventListener("click", (e) => {
  e.stopPropagation();
  setMotion(!motionOn);
});
els.recenter.addEventListener("click", (e) => {
  e.stopPropagation();
  releasePick();
  stage.focusOn(null);
  hideGuide();
});
reduceMotion.addEventListener("change", (e) => setMotion(!e.matches));
function setMotion(on) {
  motionOn = on;
  stage.setMotion(on);
  els.motion.classList.toggle("on", on);
  els.motion.setAttribute("aria-pressed", String(on));
  els.motion.querySelector(".lbl").textContent = on ? "motion on" : "motion off";
}
function syncSoundUI() {
  els.sound.classList.toggle("on", audio.on);
  els.sound.setAttribute("aria-pressed", String(audio.on));
  els.sound.querySelector(".lbl").textContent = audio.on ? "sound on" : "sound off";
}

// ---------- intro: click to enter (also the gesture that wakes the sound) ----------
let entered = false;
function enter() {
  if (entered || !els.intro.classList.contains("ready")) return;
  entered = true;
  els.intro.classList.add("gone");
  enableAudioOnce();
  els.guide.classList.add("show");
  setTimeout(hideGuide, 10000);
}
els.intro.addEventListener("click", enter);
els.retry.addEventListener("click", (e) => { e.stopPropagation(); location.reload(); });
// safety net: if the model is slow but forms are already arriving, let it open
setInterval(() => { if (!entered && realNodes.length >= 8) enter(); }, 1500);

// Keyboard access mirrors pointer selection: arrows browse live forms, Enter
// opens the current form, and Escape returns to the full field.
let keyboardIndex = -1;
addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
    const nodes = allNodes.filter((n) => n.alpha >= 0.25 && !n.dead);
    if (!nodes.length) return;
    e.preventDefault();
    const dir = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;
    keyboardIndex = (keyboardIndex + dir + nodes.length) % nodes.length;
    focusPick(nodes[keyboardIndex]);
  } else if (e.key === "Enter" && hoverNode && !pickedNode) {
    e.preventDefault();
    focusPick(hoverNode);
  } else if (e.key === "Escape") {
    releasePick();
  }
});

function hideGuide() { els.guide.classList.remove("show"); }

// Do not consume GPU/battery while the portfolio tab is out of view.
let pageVisible = !document.hidden;
addEventListener("visibilitychange", () => {
  pageVisible = !document.hidden;
  if (pageVisible) requestAnimationFrame(loop);
});

// ---------- main loop ----------
let prevT = 0;
let lastPulse = 0;
function loop() {
  if (!pageVisible) return;
  const t = now();
  const dt = Math.min(50, t - prevT || 16);
  prevT = t;

  step(dt);
  stage.updateWeb(buildWeb());
  const flick = motionOn ? 0.62 + 0.38 * Math.sin(t * 0.0022) : 0.85;
  stage.frame(allNodes, flick, dt);
  updateReadout();
  updatePulse(t);

  requestAnimationFrame(loop);
}

function updatePulse(t) {
  if (t - lastPulse < 1000) return;
  lastPulse = t;
  els.pulse.textContent = `${realNodes.length} observed · ${ghostNodes.length} imagined · live`;
}

// ---------- helpers ----------
function now() { return performance.now(); }
function frac(x) { const v = Math.sin(x * 12.9898) * 43758.5453; return v - Math.floor(v); }
function rangeRand(range, salt) { return range[0] + frac(salt + 0.123) * (range[1] - range[0]); }
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function mapRange(v, a, b, c, d) {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return c + (d - c) * t;
}
function shortName(meta) { return meta.common || meta.sci || "a form"; }
function esc(s) { return String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])); }
function formatWhen(w) {
  try {
    const d = new Date(w);
    if (isNaN(d)) return w;
    return d.toUTCString().replace(":00 GMT", " UTC").replace(" GMT", " UTC");
  } catch { return w; }
}

// ---------- go ----------
(async function start() {
  await stage.init();
  requestAnimationFrame(loop);
})();
}

// A real, lightweight fallback for browsers that cannot render WebGPU. It keeps
// the work viewable on a portfolio review device rather than ending at an error.
async function startFallback() {
  const app = document.getElementById("app");
  app.classList.add("fallback");
  try {
    const q = new URLSearchParams({
      order: "desc", order_by: "created_at", per_page: "12", photos: "true",
      sounds: "true", quality_grade: "research",
      iconic_taxa: "Aves,Amphibia,Mammalia,Reptilia,Actinopterygii,Insecta,Arachnida,Mollusca",
      fields: "taxon,photos",
    });
    const res = await fetch(`https://api.inaturalist.org/v1/observations?${q}`);
    if (!res.ok) throw new Error(`iNat ${res.status}`);
    const data = await res.json();
    let count = 0;
    for (const observation of data.results || []) {
      const photo = observation.photos?.[0]?.url;
      if (!photo) continue;
      const item = document.createElement("figure");
      item.className = "fallback-form";
      const image = document.createElement("img");
      image.src = photo.replace("/square.", "/medium.");
      image.alt = observation.taxon?.preferred_common_name || observation.taxon?.name || "animal observation";
      const label = document.createElement("figcaption");
      label.textContent = image.alt;
      item.append(image, label);
      app.append(item);
      count++;
    }
    els.pulse.textContent = `${count} observed · lightweight preview`;
    els.introStatus.textContent = "live field preview ready";
    els.intro.classList.add("ready");
  } catch (e) {
    els.introStatus.textContent = "The preview could not connect. Try again when you are online.";
  }
}
