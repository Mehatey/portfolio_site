#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   BAKE A SKINNED GLB DOWN TO SOMETHING A HERO CAN SHIP

   The Meshy export is ten GLBs of ~16MB each: one 135,628-vertex skinned mesh
   repeated with a different clip in each, plus a 6.3MB PNG. 166MB for a
   character that has to appear above the fold.

   This reduces it to about a megabyte and a half without giving up the thing
   that matters, which is that he is RIGGED and MOVES:

     · the surface is sampled into points, area-weighted so density follows
       the mesh rather than its vertex distribution -- every sample carries
       position, normal, uv and, crucially, its four joint indices and weights,
       so it deforms with the skeleton exactly as the mesh would
     · joint matrices are BAKED per frame here rather than derived in the
       browser. Walking a node hierarchy, composing TRS, interpolating
       quaternion tracks and multiplying by inverse binds is a great deal of
       code to get subtly wrong at runtime; doing it once, offline, in a
       script that can be checked, leaves the page with a flat array to index
     · everything is quantised: int16 positions, int8 normals, uint16 uv,
       uint8 joints and weights

   Output is one .bin plus a small .json manifest.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require("fs");
const path = require("path");

const SRC_DIR = process.argv[2];
const OUT_DIR = process.argv[3] || "assets/models";
const N_POINTS = parseInt(process.argv[4] || "60000", 10);
const FPS = 30;

/* Which clips to carry, and the name each gets on the page. Not all ten:
   every extra clip is another 24 matrices a frame on disk, and a hero that
   cycles through ten behaviours reads as a demo reel of a rig. */
const CLIPS = [
  /* Three, not ten, and not the longest ones. Every frame is 24 matrices on
     disk, and "agree" alone is 13 seconds -- 391 frames, 600KB -- for a
     gesture a visitor sees once. Arise is the arrival, walk is the idle,
     dance is the reward for staying. */
  ["Meshy_AI_Sunny_Patch_Kid_biped_Animation_Arise_withSkin.glb", "arise"],
  ["Meshy_AI_Sunny_Patch_Kid_biped_Animation_Walking_withSkin.glb", "walk"],
  ["Meshy_AI_Sunny_Patch_Kid_biped_Animation_All_Night_Dance_withSkin.glb", "dance"],
];

function readGLB(file) {
  const b = fs.readFileSync(file);
  let off = 12,
    json = null,
    bin = null;
  while (off + 8 <= b.length) {
    const len = b.readUInt32LE(off),
      type = b.readUInt32LE(off + 4);
    const data = b.slice(off + 8, off + 8 + len);
    if (type === 0x4e4f534a) json = JSON.parse(data.toString("utf8"));
    else if (type === 0x004e4942) bin = data;
    off += 8 + len;
  }
  return { json, bin };
}

const CT = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const NC = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };

function accessor(g, bin, i) {
  const a = g.accessors[i];
  const n = NC[a.type];
  const T = CT[a.componentType];
  const out = new (a.componentType === 5126 ? Float32Array : T)(a.count * n);
  if (a.bufferView == null) return out;
  const bv = g.bufferViews[a.bufferView];
  const base = (bv.byteOffset || 0) + (a.byteOffset || 0);
  const stride = bv.byteStride || n * T.BYTES_PER_ELEMENT;
  for (let k = 0; k < a.count; k++) {
    const o = base + k * stride;
    for (let c = 0; c < n; c++) {
      const p = o + c * T.BYTES_PER_ELEMENT;
      let v;
      switch (a.componentType) {
        case 5120:
          v = bin.readInt8(p);
          break;
        case 5121:
          v = bin.readUInt8(p);
          break;
        case 5122:
          v = bin.readInt16LE(p);
          break;
        case 5123:
          v = bin.readUInt16LE(p);
          break;
        case 5125:
          v = bin.readUInt32LE(p);
          break;
        default:
          v = bin.readFloatLE(p);
      }
      out[k * n + c] = v;
    }
  }
  return out;
}

/* ── matrix helpers (column-major, glTF convention) ──────────────────────── */
function mIdent() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function mMul(a, b) {
  const o = new Array(16);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      o[j * 4 + i] = a[0 * 4 + i] * b[j * 4 + 0] + a[1 * 4 + i] * b[j * 4 + 1] + a[2 * 4 + i] * b[j * 4 + 2] + a[3 * 4 + i] * b[j * 4 + 3];
    }
  return o;
}
function mFromTRS(t, r, s) {
  const [x, y, z, w] = r;
  const x2 = x + x,
    y2 = y + y,
    z2 = z + z;
  const xx = x * x2,
    xy = x * y2,
    xz = x * z2;
  const yy = y * y2,
    yz = y * z2,
    zz = z * z2;
  const wx = w * x2,
    wy = w * y2,
    wz = w * z2;
  return [
    (1 - (yy + zz)) * s[0],
    (xy + wz) * s[0],
    (xz - wy) * s[0],
    0,
    (xy - wz) * s[1],
    (1 - (xx + zz)) * s[1],
    (yz + wx) * s[1],
    0,
    (xz + wy) * s[2],
    (yz - wx) * s[2],
    (1 - (xx + yy)) * s[2],
    0,
    t[0],
    t[1],
    t[2],
    1,
  ];
}
function qSlerp(a, b, t) {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  let bb = b.slice();
  if (d < 0) {
    d = -d;
    bb = bb.map((v) => -v);
  }
  if (d > 0.9995) {
    const o = a.map((v, i) => v + (bb[i] - v) * t);
    const l = Math.hypot(...o) || 1;
    return o.map((v) => v / l);
  }
  const th = Math.acos(d),
    s = Math.sin(th);
  const wa = Math.sin((1 - t) * th) / s,
    wb = Math.sin(t * th) / s;
  return a.map((v, i) => v * wa + bb[i] * wb);
}
function lerpArr(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t);
}

/* Sample one animation channel at time `tt`. */
function sampleTrack(times, values, stride, tt, isQuat) {
  const n = times.length;
  if (tt <= times[0]) return Array.from(values.slice(0, stride));
  if (tt >= times[n - 1]) return Array.from(values.slice((n - 1) * stride, n * stride));
  let i = 0;
  while (i < n - 2 && times[i + 1] < tt) i++;
  const t0 = times[i],
    t1 = times[i + 1];
  const f = (tt - t0) / Math.max(1e-8, t1 - t0);
  const a = Array.from(values.slice(i * stride, (i + 1) * stride));
  const b = Array.from(values.slice((i + 1) * stride, (i + 2) * stride));
  return isQuat ? qSlerp(a, b, f) : lerpArr(a, b, f);
}

function bakeClip(file, name) {
  const { json: g, bin } = readGLB(file);
  const anim = g.animations[0];
  const skin = g.skins[0];
  const joints = skin.joints;

  /* every node's local TRS, and its parent */
  const parent = new Array(g.nodes.length).fill(-1);
  g.nodes.forEach((nd, i) => (nd.children || []).forEach((c) => (parent[c] = i)));

  const tracks = {};
  let duration = 0;
  anim.channels.forEach((ch) => {
    const s = anim.samplers[ch.sampler];
    const times = accessor(g, bin, s.input);
    const vals = accessor(g, bin, s.output);
    duration = Math.max(duration, times[times.length - 1]);
    (tracks[ch.target.node] = tracks[ch.target.node] || {})[ch.target.path] = { times, vals };
  });

  const frames = Math.max(2, Math.round(duration * FPS));
  const out = new Float32Array(frames * joints.length * 16);
  const ibm = accessor(g, bin, skin.inverseBindMatrices);

  for (let f = 0; f < frames; f++) {
    const tt = (f / frames) * duration;
    const local = g.nodes.map((nd, i) => {
      const tr = tracks[i] || {};
      const T = tr.translation ? sampleTrack(tr.translation.times, tr.translation.vals, 3, tt, false) : nd.translation || [0, 0, 0];
      const R = tr.rotation ? sampleTrack(tr.rotation.times, tr.rotation.vals, 4, tt, true) : nd.rotation || [0, 0, 0, 1];
      const S = tr.scale ? sampleTrack(tr.scale.times, tr.scale.vals, 3, tt, false) : nd.scale || [1, 1, 1];
      return nd.matrix ? Array.from(nd.matrix) : mFromTRS(T, R, S);
    });
    const world = new Array(g.nodes.length).fill(null);
    const resolve = (i) => {
      if (world[i]) return world[i];
      world[i] = parent[i] < 0 ? local[i] : mMul(resolve(parent[i]), local[i]);
      return world[i];
    };
    for (let j = 0; j < joints.length; j++) {
      const w = resolve(joints[j]);
      const inv = Array.from(ibm.slice(j * 16, j * 16 + 16));
      const m = mMul(w, inv);
      for (let k = 0; k < 16; k++) out[(f * joints.length + j) * 16 + k] = m[k];
    }
  }
  return { name, frames, duration, joints: joints.length, mats: out };
}

/* ── surface sampling ────────────────────────────────────────────────────── */
function samplePoints(file, n) {
  const { json: g, bin } = readGLB(file);
  const prim = g.meshes[0].primitives[0];
  const P = accessor(g, bin, prim.attributes.POSITION);
  const N = accessor(g, bin, prim.attributes.NORMAL);
  const U = accessor(g, bin, prim.attributes.TEXCOORD_0);
  const J = accessor(g, bin, prim.attributes.JOINTS_0);
  const W = accessor(g, bin, prim.attributes.WEIGHTS_0);
  const I = accessor(g, bin, prim.indices);
  const triN = I.length / 3;

  /* Area-weighted, so density follows the surface rather than the vertex
     distribution -- a mesh with a dense head and a coarse leg would otherwise
     sample the head far more heavily than it is actually seen. */
  const cum = new Float64Array(triN);
  let total = 0;
  for (let t = 0; t < triN; t++) {
    const a = I[t * 3],
      b = I[t * 3 + 1],
      c = I[t * 3 + 2];
    const ax = P[a * 3],
      ay = P[a * 3 + 1],
      az = P[a * 3 + 2];
    const e1 = [P[b * 3] - ax, P[b * 3 + 1] - ay, P[b * 3 + 2] - az];
    const e2 = [P[c * 3] - ax, P[c * 3 + 1] - ay, P[c * 3 + 2] - az];
    const cx = e1[1] * e2[2] - e1[2] * e2[1],
      cy = e1[2] * e2[0] - e1[0] * e2[2],
      cz = e1[0] * e2[1] - e1[1] * e2[0];
    total += 0.5 * Math.hypot(cx, cy, cz);
    cum[t] = total;
  }

  const pos = new Float32Array(n * 3),
    nrm = new Float32Array(n * 3),
    uv = new Float32Array(n * 2);
  const ji = new Uint8Array(n * 4),
    jw = new Uint8Array(n * 4);
  let seed = 12345;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  for (let k = 0; k < n; k++) {
    const target = rnd() * total;
    let lo = 0,
      hi = triN - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    const t = lo;
    const a = I[t * 3],
      b = I[t * 3 + 1],
      c = I[t * 3 + 2];
    let u = rnd(),
      v = rnd();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const w0 = 1 - u - v,
      w1 = u,
      w2 = v;
    for (let d = 0; d < 3; d++) {
      pos[k * 3 + d] = P[a * 3 + d] * w0 + P[b * 3 + d] * w1 + P[c * 3 + d] * w2;
      nrm[k * 3 + d] = N[a * 3 + d] * w0 + N[b * 3 + d] * w1 + N[c * 3 + d] * w2;
    }
    for (let d = 0; d < 2; d++) uv[k * 2 + d] = U[a * 2 + d] * w0 + U[b * 2 + d] * w1 + U[c * 2 + d] * w2;
    /* Skin data is taken from the NEAREST corner, not blended: averaging joint
       INDICES is meaningless, and a sample that lands between two differently
       rigged corners should belong to one of them. */
    const near = w0 >= w1 && w0 >= w2 ? a : w1 >= w2 ? b : c;
    for (let d = 0; d < 4; d++) {
      ji[k * 4 + d] = J[near * 4 + d];
      jw[k * 4 + d] = Math.max(0, Math.min(255, Math.round(W[near * 4 + d] * 255)));
    }
  }
  return { pos, nrm, uv, ji, jw, n, images: g.images, bufferViews: g.bufferViews, bin };
}

const first = path.join(SRC_DIR, CLIPS[0][0]);
console.log("sampling surface from", path.basename(first));
const S = samplePoints(first, N_POINTS);

/* bounds, so the page does not have to guess at scale */
let mn = [1e9, 1e9, 1e9],
  mx = [-1e9, -1e9, -1e9];
for (let i = 0; i < S.n; i++)
  for (let d = 0; d < 3; d++) {
    const v = S.pos[i * 3 + d];
    if (v < mn[d]) mn[d] = v;
    if (v > mx[d]) mx[d] = v;
  }
const ext = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]];
const scale = 1 / Math.max(ext[0], ext[1], ext[2]);
console.log(
  "bounds",
  mn.map((v) => v.toFixed(2)).join(","),
  "..",
  mx.map((v) => v.toFixed(2)).join(","),
  "extent",
  ext.map((v) => v.toFixed(2)).join(",")
);

const clips = CLIPS.map(([f, name]) => {
  const c = bakeClip(path.join(SRC_DIR, f), name);
  console.log("baked", name, c.frames, "frames,", c.duration.toFixed(2) + "s,", c.joints, "joints");
  return c;
});

/* ── pack ────────────────────────────────────────────────────────────────── */
const n = S.n,
  JN = clips[0].joints;
const totalFrames = clips.reduce((s, c) => s + c.frames, 0);
const posQ = new Int16Array(n * 3),
  nrmQ = new Int8Array(n * 3),
  uvQ = new Uint16Array(n * 2);
for (let i = 0; i < n; i++) {
  for (let d = 0; d < 3; d++) {
    posQ[i * 3 + d] = Math.max(-32767, Math.min(32767, Math.round(S.pos[i * 3 + d] * scale * 32767)));
    nrmQ[i * 3 + d] = Math.max(-127, Math.min(127, Math.round(S.nrm[i * 3 + d] * 127)));
  }
  uvQ[i * 2] = Math.max(0, Math.min(65535, Math.round(S.uv[i * 2] * 65535)));
  uvQ[i * 2 + 1] = Math.max(0, Math.min(65535, Math.round(S.uv[i * 2 + 1] * 65535)));
}
/* ── THE MATRICES HAVE TO BE SCALED TOO ──────────────────────────────────
   Positions are quantised with `scale` applied, so what the shader skins is
   s*p, not p. A matrix does not commute with that: M*(s*p) is not s*(M*p),
   because the translation column is added AFTER the linear part and so is not
   scaled by anything.

   Conjugating by the scale -- M' = S*M*S^-1 -- leaves the 3x3 alone for a
   uniform S and multiplies the translation column by s. Measured before this:
   the mean displacement between a point's bind position and its own skinned
   position at frame 0 was 0.73 on a figure one unit tall, which is how he
   arrived as a ball. */
const mats = new Float32Array(totalFrames * JN * 16);
let mo = 0;
clips.forEach((c) => {
  const m = c.mats;
  for (let k = 0; k < m.length; k += 16) {
    m[k + 12] *= scale;
    m[k + 13] *= scale;
    m[k + 14] *= scale;
  }
  mats.set(m, mo);
  mo += m.length;
});

const parts = [
  Buffer.from(posQ.buffer),
  Buffer.from(nrmQ.buffer),
  Buffer.from(uvQ.buffer),
  Buffer.from(S.ji.buffer),
  Buffer.from(S.jw.buffer),
  Buffer.from(mats.buffer),
];
const out = Buffer.concat(parts);
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "figure.bin"), out);

let fo = 0;
const manifest = {
  points: n,
  joints: JN,
  scale: scale,
  offset: [(-(mn[0] + mx[0]) / 2) * scale, -mn[1] * scale, (-(mn[2] + mx[2]) / 2) * scale],
  clips: clips.map((c) => {
    const o = { name: c.name, start: fo, frames: c.frames, duration: c.duration };
    fo += c.frames;
    return o;
  }),
  layout: { pos: 0, nrm: n * 6, uv: n * 9, joints: n * 13, weights: n * 17, mats: n * 21 },
};
fs.writeFileSync(path.join(OUT_DIR, "figure.json"), JSON.stringify(manifest));

/* the texture, straight out of the GLB */
const img = S.images[0];
const bv = S.bufferViews[img.bufferView];
const png = S.bin.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
fs.writeFileSync(path.join(OUT_DIR, "figure-albedo-src.png"), png);

console.log("figure.bin", (out.length / 1048576).toFixed(2) + "MB  (points", n, "joints", JN, "frames", totalFrames + ")");
console.log("texture out at", (png.length / 1048576).toFixed(2) + "MB (downscale next)");
