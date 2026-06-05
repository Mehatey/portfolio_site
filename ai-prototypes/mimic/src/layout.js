// layout.js — arrangement by resemblance, not by name.
// Life here is not sorted by taxonomy. Each organism is placed by where its
// *image* lands in CLIP space, so a moth and the leaf it imitates drift together,
// and convergent forms from unrelated branches of the tree pool into the same
// neighbourhood. The clustering is the argument: the machine sees likeness where
// science sees distance.
//
// We can't run UMAP on a live, growing stream, so we relax an online force graph
// in 3-D: springs pull each organism toward its few nearest neighbours in CLIP
// space, short-range repulsion keeps forms from stacking, gentle gravity holds
// the whole atlas together.

export function cosine(a, b) {
  // vectors arrive L2-normalised from CLIP, so dot == cosine.
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

// midpoint in CLIP space, renormalised — "the form expected between two forms".
export function blendVec(a, b, t = 0.5) {
  const out = new Float32Array(a.length);
  let n = 0;
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i] * (1 - t) + b[i] * t;
    n += out[i] * out[i];
  }
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < out.length; i++) out[i] /= n;
  return out;
}

// deterministic-ish jitter without Math.random (kept reproducible across resumes)
let _seed = 0x9e3779b9;
function rand() {
  _seed ^= _seed << 13; _seed ^= _seed >>> 17; _seed ^= _seed << 5;
  return ((_seed >>> 0) / 4294967296);
}

// Find the K most visually-similar existing organisms to a new vector.
export function nearest(vec, nodes, K, minSim = 0.55) {
  const scored = [];
  for (const n of nodes) {
    if (!n.vec) continue;
    const s = cosine(vec, n.vec);
    if (s > minSim) scored.push({ node: n, s });
  }
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, K);
}

// Where a newcomer should appear: in the heart of its neighbours, so it lands
// already-clustered rather than flying in from the void. Spreads onto a sphere
// when it resembles nothing seen yet.
export function seedPosition(neighbours) {
  if (!neighbours.length) {
    const u = rand() * 2 - 1;
    const th = rand() * Math.PI * 2;
    const r = 26 + rand() * 8;
    const s = Math.sqrt(1 - u * u);
    return [Math.cos(th) * s * r, u * r, Math.sin(th) * s * r];
  }
  let x = 0, y = 0, z = 0, w = 0;
  for (const { node, s } of neighbours) {
    x += node.pos[0] * s; y += node.pos[1] * s; z += node.pos[2] * s; w += s;
  }
  w = w || 1;
  return [
    x / w + (rand() - 0.5) * 3,
    y / w + (rand() - 0.5) * 3,
    z / w + (rand() - 0.5) * 3,
  ];
}

// One relaxation step over the whole atlas.
// nodes: [{ pos:[x,y,z], vel:[x,y,z], edges:[{to,rest,k}], pinned, scale }]
export function relax(nodes, dt, opts = {}) {
  const {
    gravity = 0.0016,      // pull toward origin
    repel = 70,            // short-range anti-overlap strength
    repelRadius = 4.2,     // only neighbours within this distance repel
    damping = 0.86,
    maxSpeed = 1.4,
  } = opts;

  // --- spatial hash for cheap local repulsion ---
  const cell = repelRadius;
  const grid = new Map();
  const key = (x, y, z) =>
    `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
  for (const n of nodes) {
    const k = key(n.pos[0], n.pos[1], n.pos[2]);
    let b = grid.get(k);
    if (!b) grid.set(k, (b = []));
    b.push(n);
  }
  const neighborOffsets = [];
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++)
      for (let dz = -1; dz <= 1; dz++) neighborOffsets.push([dx, dy, dz]);

  for (const n of nodes) {
    if (n.pinned) continue;
    // mobility cools with age: a freshly-arrived form moves into place, then the
    // cluster it joined holds still so it can be read and hovered. Newcomers
    // (mob≈1) yield to settled structure (mob→floor) instead of shoving it around.
    const mob = n.mob === undefined ? 1 : n.mob;
    if (mob <= 0.0001) continue;
    let fx = 0, fy = 0, fz = 0;

    // gravity toward the centre
    fx -= n.pos[0] * gravity;
    fy -= n.pos[1] * gravity;
    fz -= n.pos[2] * gravity;

    // springs to visual neighbours
    for (const e of n.edges) {
      const t = e.to;
      if (t.dead) continue; // a neighbour faded out of the atlas
      let dx = t.pos[0] - n.pos[0];
      let dy = t.pos[1] - n.pos[1];
      let dz = t.pos[2] - n.pos[2];
      const d = Math.hypot(dx, dy, dz) || 1e-4;
      const f = ((d - e.rest) * e.k) / d;
      fx += dx * f; fy += dy * f; fz += dz * f;
    }

    // local repulsion
    const cx = Math.floor(n.pos[0] / cell);
    const cy = Math.floor(n.pos[1] / cell);
    const cz = Math.floor(n.pos[2] / cell);
    for (const [ox, oy, oz] of neighborOffsets) {
      const b = grid.get(`${cx + ox},${cy + oy},${cz + oz}`);
      if (!b) continue;
      for (const m of b) {
        if (m === n) continue;
        let dx = n.pos[0] - m.pos[0];
        let dy = n.pos[1] - m.pos[1];
        let dz = n.pos[2] - m.pos[2];
        let d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > repelRadius * repelRadius) continue;
        const d = Math.sqrt(d2) || 1e-3;
        const f = repel / (d2 + 0.6);
        fx += (dx / d) * f; fy += (dy / d) * f; fz += (dz / d) * f;
      }
    }

    n.vel[0] = (n.vel[0] + fx * dt * mob) * damping;
    n.vel[1] = (n.vel[1] + fy * dt * mob) * damping;
    n.vel[2] = (n.vel[2] + fz * dt * mob) * damping;

    const lim = maxSpeed * mob;
    const sp = Math.hypot(n.vel[0], n.vel[1], n.vel[2]);
    if (sp > lim) {
      const k = lim / sp;
      n.vel[0] *= k; n.vel[1] *= k; n.vel[2] *= k;
    }

    n.pos[0] += n.vel[0]; n.pos[1] += n.vel[1]; n.pos[2] += n.vel[2];
  }
}
