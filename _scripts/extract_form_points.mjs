/* Sample buddha-web.glb down to a point cloud the hero can morph into.

   The cube guy's extractor (extract_cube_guy_points.py) parses its GLB by hand
   in pure Python, because that file is plain glTF. This one cannot: the Buddha
   is EXT_meshopt_compression + KHR_mesh_quantization, and meshopt is a custom
   vertex codec with no reasonable pure-Python decoder. So this runs in Node
   against the official decoder instead, and emits exactly the same format the
   cube guy ships in — N*3 int16 positions then N*3 int8 normals — so
   cube-guy.js can read either file with the same code path.

   The count matters and is not negotiable: the morph lerps between two
   position buffers per point, so the Buddha must have EXACTLY as many points
   as the cube guy or there is nothing to lerp index-by-index against.

     node _scripts/extract_buddha_points.mjs <count>
*/
import fs from "fs";
import { MeshoptDecoder } from "/tmp/claude-501/-Users-siddharthmehta/1e843781-4ada-4bc1-b83b-57739ad6638f/scratchpad/meshopt_decoder.module.js";

/* Generic now, because the Buddha turned out not to be the only form worth
   having. Any plain glTF point cloud or mesh can become one:

     node _scripts/extract_form_points.mjs <input.glb> <out.bin> [count]

   The count is not a preference. Every form is lerped against the cube guy
   index by index, so they must all carry EXACTLY his 55,843 points. Sources
   with fewer vertices than that are not usable as-is; sources with more are
   strided down. */
const SRC = process.argv[2] || "assets/models/buddha-web.glb";
const OUT = process.argv[3] || "assets/models/buddha-points.bin";
const TARGET = +(process.argv[4] || 55843);

const d = fs.readFileSync(SRC);
const total = d.readUInt32LE(8);
let off = 12,
  json = null,
  bin = null;
while (off < total) {
  const clen = d.readUInt32LE(off),
    ctype = d.readUInt32LE(off + 4);
  if (ctype === 0x4e4f534a) json = JSON.parse(d.slice(off + 8, off + 8 + clen).toString("utf8"));
  else bin = d.slice(off + 8, off + 8 + clen);
  off += 8 + clen;
}

await MeshoptDecoder.ready;

/* Decode one bufferView through meshopt if it carries the extension, or slice
   it straight out of the binary chunk if it does not. */
function viewBytes(i) {
  const v = json.bufferViews[i];
  const mo = v.extensions && v.extensions.EXT_meshopt_compression;
  if (!mo) return bin.slice(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength);
  const src = bin.slice(mo.byteOffset || 0, (mo.byteOffset || 0) + mo.byteLength);
  const out = new Uint8Array(mo.count * mo.byteStride);
  MeshoptDecoder.decodeGltfBuffer(out, mo.count, mo.byteStride, src, mo.mode, mo.filter);
  return Buffer.from(out.buffer, out.byteOffset, out.byteLength);
}

const CT = { 5120: [Int8Array, 1], 5121: [Uint8Array, 1], 5122: [Int16Array, 2], 5123: [Uint16Array, 2], 5125: [Uint32Array, 4], 5126: [Float32Array, 4] };
const NC = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

/* KHR_mesh_quantization means POSITION can arrive as int16 or int8 with a
   normalized flag, so every accessor is read through its own component type
   and rescaled rather than assumed to be float32. */
function readAccessor(ai) {
  const a = json.accessors[ai];
  const [Arr, size] = CT[a.componentType];
  const n = NC[a.type];
  const bytes = viewBytes(a.bufferView);
  const stride = (json.bufferViews[a.bufferView].byteStride || 0) || n * size;
  const base = a.byteOffset || 0;
  const out = new Float32Array(a.count * n);
  for (let i = 0; i < a.count; i++) {
    const o = base + i * stride;
    for (let c = 0; c < n; c++) {
      const raw = new Arr(bytes.buffer, bytes.byteOffset + o + c * size, 1)[0];
      out[i * n + c] = a.normalized ? (Arr === Int16Array ? Math.max(raw / 32767, -1) : Arr === Int8Array ? Math.max(raw / 127, -1) : Arr === Uint16Array ? raw / 65535 : raw / 255) : raw;
    }
  }
  return out;
}

/* World transform, walked the same way the Python extractor walks it. */
function nodeMatrix(nd) {
  if (nd.matrix) return nd.matrix.slice();
  const t = nd.translation || [0, 0, 0],
    r = nd.rotation || [0, 0, 0, 1],
    s = nd.scale || [1, 1, 1];
  const [x, y, z, w] = r;
  const m = [
    (1 - 2 * (y * y + z * z)) * s[0], (2 * (x * y + z * w)) * s[0], (2 * (x * z - y * w)) * s[0], 0,
    (2 * (x * y - z * w)) * s[1], (1 - 2 * (x * x + z * z)) * s[1], (2 * (y * z + x * w)) * s[1], 0,
    (2 * (x * z + y * w)) * s[2], (2 * (y * z - x * w)) * s[2], (1 - 2 * (x * x + y * y)) * s[2], 0,
    t[0], t[1], t[2], 1,
  ];
  return m;
}
function mul(a, b) {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
}
function xform(m, p) {
  return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
}

const pts = [],
  nrm = [];
const scene = json.scenes[json.scene || 0];
(function walk(idx, parent) {
  const nd = json.nodes[idx];
  const m = mul(parent, nodeMatrix(nd));
  if (nd.mesh !== undefined) {
    for (const prim of json.meshes[nd.mesh].primitives) {
      const P = readAccessor(prim.attributes.POSITION);
      const N = prim.attributes.NORMAL !== undefined ? readAccessor(prim.attributes.NORMAL) : null;
      for (let i = 0; i < P.length / 3; i++) {
        pts.push(xform(m, [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]]));
        nrm.push(N ? [N[i * 3], N[i * 3 + 1], N[i * 3 + 2]] : [0, 1, 0]);
      }
    }
  }
  for (const c of nd.children || []) walk(c, m);
})(scene.nodes[0], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

console.log("vertices found:", pts.length);

/* Even stride rather than random choice, so the sample is spatially uniform
   and does not clump the way a random pick over an unevenly tessellated mesh
   does. */
const step = pts.length / TARGET;
const sel = [];
for (let i = 0; i < TARGET; i++) sel.push(Math.min(pts.length - 1, Math.floor(i * step)));

/* Normalise into the same unit box the cube guy uses: centred on x and z,
   sitting on y = -1, longest axis scaled to fit. Anything else and the two
   figures would not occupy the same space and the morph would translate as
   well as reshape. */
/* ── OUTLIERS DECIDE THE BOUNDING BOX, SO THEY DO NOT GET A VOTE ──────────
   Absolute min/max is fine for a modelled asset and wrong for a scan. These
   are photogrammetry and lidar clouds: a handful of stray points metres away
   from the subject is normal, and with min/max those strays set the extent —
   the scale collapses, the centre shifts toward the noise, and the actual
   object renders small and off to one side. Measured on tree.glb: it drew at
   about a third of the intended height, below the floor line and well left of
   centre.

   So the box is taken from the 1st to 99th percentile on each axis instead.
   The subject decides its own size; the strays are still drawn, they simply
   fall outside the unit box and off the edge of the figure, which is what a
   stray is. */
const pct = (arr, q) => arr[Math.min(arr.length - 1, Math.max(0, Math.floor(arr.length * q)))];
let mn = [0, 0, 0], mx = [0, 0, 0];
for (let c = 0; c < 3; c++) {
  const col = sel.map((i) => pts[i][c]).sort((a, b) => a - b);
  mn[c] = pct(col, 0.01);
  mx[c] = pct(col, 0.99);
}
const ext = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]];
/* ── EVERY FORM STANDS THE SAME HEIGHT ────────────────────────────────────
   Scaling by the LONGEST axis is right for fitting an object into a box and
   wrong for a substitution system. These forms all occupy the same slot in
   the same frame, one after another, and the only property that has to agree
   between them is how tall they are — a tree that happens to be wider than it
   is tall got scaled by its width and rendered at half the cube guy's height,
   sitting below the floor line he stands on.

   So height decides, and the other two axes come along at the same scale so
   nothing is stretched. A form wider than the frame is a fine outcome; a form
   that does not reach the floor is not. */
const scale = 2 / Math.max(1e-6, ext[1]);
const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;

const pos = new Int16Array(TARGET * 3);
const nor = new Int8Array(TARGET * 3);
sel.forEach((src, i) => {
  const p = pts[src], n = nrm[src];
  /* ── THE TWO FILES MUST AGREE ON WHICH WAY IS UP ──────────────────────
     cube-guy-points.bin is written in the model's Blender frame, where up is
     the THIRD component, and the shader swizzles it with vec3(p.x, p.z, p.y)
     to get WebGL's Y-up. glTF is already Y-up, so up arrives here as p[1] —
     and writing it straight out put the Buddha's height on the shader's depth
     axis, which is why the first extract rendered as a small blob lying in
     the bottom corner rather than as a figure.

     So the axes are reordered on the way out, into the cube guy's convention:
     x, depth, up. Both files then read through the identical swizzle and land
     in the same space, which is the whole requirement for a per-point lerp
     between them. */
  const v = [(p[0] - cx) * scale, (p[2] - cz) * scale, (p[1] - mn[1]) * scale - 1];
  /* No halving. The runtime reads these back as pos/32767, i.e. it expects
     the full int16 range to span the unit box — dividing by two here drew the
     Buddha at half the cube guy's size. */
  /* Clamped to the box rather than to the int16 range: a stray that would
     otherwise sit at the very edge of the quantisation reads as a bright dot
     pinned to the frame, which is worse than not drawing it. */
  for (let c = 0; c < 3; c++) pos[i * 3 + c] = Math.max(-32767, Math.min(32767, Math.round(Math.max(-1.35, Math.min(1.35, v[c])) * 32767)));
  const L = Math.hypot(n[0], n[1], n[2]) || 1;
  /* Same reorder, or the lighting would be lit from the side the geometry is
     no longer facing. */
  const nv = [n[0] / L, n[2] / L, n[1] / L];
  for (let c = 0; c < 3; c++) nor[i * 3 + c] = Math.max(-127, Math.min(127, Math.round(nv[c] * 127)));
});

const out = Buffer.concat([Buffer.from(pos.buffer), Buffer.from(nor.buffer)]);
fs.writeFileSync(OUT, out);
console.log("wrote", OUT, out.length, "bytes for", TARGET, "points");
