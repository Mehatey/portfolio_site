// render.js — the WebGPU stage.
// One instanced draw call paints the whole atlas of life: real organisms as
// soft-cropped photographs, imagined ones as hollow luminous rings. A second
// pass draws the resemblance web — faint filaments tying each form to the
// handful it most resembles, so the organising idea is legible at a glance,
// without a word of explanation. Bloom and a depth haze make it cinematic.

import * as THREE from "three/webgpu";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  attribute, uv, texture, vec2, float, mix, smoothstep, uniform, pass,
} from "three/tsl";

const MAX_EDGES = 3200;

export class Stage {
  constructor(container, atlas, cap = 640) {
    this.cap = cap;
    this.atlas = atlas;

    this.renderer = new THREE.WebGPURenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setClearColor(0x05070a, 1);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 4000);
    this.camera.position.set(0, 0, 58); // close enough to read forms, wide enough for a full field

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.035;
    this.controls.rotateSpeed = 0.24;
    this.controls.zoomSpeed = 0.55;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 320;
    // Slow drift keeps the atlas alive while still leaving forms readable.
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.35;
    this.controls.addEventListener("start", () => document.body.classList.add("dragging"));
    this.controls.addEventListener("end", () => document.body.classList.remove("dragging"));

    this._buildBillboards();
    this._buildWeb();

    this._m = new THREE.Matrix4();
    this._p = new THREE.Vector3();
    this._s = new THREE.Vector3();
    this._q = new THREE.Quaternion();

    // smooth camera move for click-to-focus
    this._tween = null;
    this._tmpDir = new THREE.Vector3();
    this._tmpTarget = new THREE.Vector3();
    this._tmpPos = new THREE.Vector3();
    this.controls.addEventListener("start", () => { this._tween = null; }); // manual drag cancels a tween

    addEventListener("resize", () => this.onResize());
  }

  setMotion(enabled) {
    this.controls.autoRotate = enabled;
  }

  // Ease the camera to frame a world point at a chosen distance. A null point
  // returns to the resting wide view. Pure tween over OrbitControls so the user
  // can still orbit once it lands.
  focusOn(pos, dist = 15) {
    this._startTween(pos ? [pos[0], pos[1], pos[2]] : [0, 0, 0], pos ? dist : 58);
  }

  _startTween(targetArr, dist) {
    this._tmpDir.copy(this.camera.position).sub(this.controls.target);
    if (this._tmpDir.lengthSq() < 1e-6) this._tmpDir.set(0, 0, 1);
    this._tmpDir.normalize();
    const tgt = new THREE.Vector3(targetArr[0], targetArr[1], targetArr[2]);
    const camEnd = tgt.clone().add(this._tmpDir.multiplyScalar(dist));
    this._tween = {
      fromT: this.controls.target.clone(), toT: tgt,
      fromP: this.camera.position.clone(), toP: camEnd,
      t: 0, dur: 1100,
    };
  }

  _advanceTween(dt) {
    const tw = this._tween;
    if (!tw) return;
    tw.t = Math.min(1, tw.t + dt / tw.dur);
    const e = tw.t < 0.5 ? 2 * tw.t * tw.t : 1 - Math.pow(-2 * tw.t + 2, 2) / 2; // easeInOut
    this._tmpTarget.copy(tw.fromT).lerp(tw.toT, e);
    this._tmpPos.copy(tw.fromP).lerp(tw.toP, e);
    this.controls.target.copy(this._tmpTarget);
    this.camera.position.copy(this._tmpPos);
    if (tw.t >= 1) this._tween = null;
  }

  _buildBillboards() {
    const cap = this.cap;
    const geo = new THREE.PlaneGeometry(1, 1);
    this.aTile = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4);
    this.aTint = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3);
    this.aGhost = new THREE.InstancedBufferAttribute(new Float32Array(cap * 1), 1);
    this.aAlpha = new THREE.InstancedBufferAttribute(new Float32Array(cap * 1), 1);
    this.aGlow = new THREE.InstancedBufferAttribute(new Float32Array(cap * 1), 1); // 0..1 selection glow
    for (const a of [this.aTile, this.aTint, this.aGhost, this.aAlpha, this.aGlow]) a.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("aTile", this.aTile);
    geo.setAttribute("aTint", this.aTint);
    geo.setAttribute("aGhost", this.aGhost);
    geo.setAttribute("aAlpha", this.aAlpha);
    geo.setAttribute("aGlow", this.aGlow);

    this.uFlick = uniform(1.0);

    const mat = new THREE.MeshBasicNodeMaterial();
    mat.transparent = true;
    mat.depthWrite = false;
    mat.depthTest = true;
    mat.side = THREE.DoubleSide;
    mat.toneMapped = false;

    const tile = attribute("aTile", "vec4");
    const tint = attribute("aTint", "vec3");
    const ghost = attribute("aGhost", "float");
    const alpha = attribute("aAlpha", "float");
    const glow = attribute("aGlow", "float");

    const buv = uv();
    const atlasUv = buv.mul(vec2(tile.z, tile.w)).add(vec2(tile.x, tile.y));
    const photo = texture(this.atlas.texture, atlasUv);

    const d = buv.sub(0.5).length();
    // hollow luminous ring for imagined forms
    const inner = smoothstep(0.28, 0.375, d);
    const outer = float(1.0).sub(smoothstep(0.40, 0.49, d));
    const ring = inner.mul(outer);
    const core = float(1.0).sub(smoothstep(0.0, 0.10, d)).mul(0.6); // faint nucleus
    const ghostShape = ring.add(core);
    const ghostCol = tint.mul(ghostShape).mul(2.3);

    // Photos keep their native exposure. A restrained hover lift makes the chosen
    // animal easier to find without washing out its features.
    const litPhoto = photo.rgb.mul(float(1.0).add(glow.mul(0.35)));
    const litGhost = ghostCol.mul(float(1.0).add(glow.mul(1.0)));
    mat.colorNode = mix(litPhoto, litGhost, ghost);

    const circle = float(1.0).sub(smoothstep(0.44, 0.5, d)); // soft round crop
    const ghostA = ghostShape.mul(this.uFlick);
    mat.opacityNode = alpha.mul(mix(circle, ghostA, ghost));

    this.mesh = new THREE.InstancedMesh(geo, mat, cap);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.scene.add(this.mesh);
  }

  _buildWeb() {
    this.webPos = new Float32Array(MAX_EDGES * 2 * 3);
    this.webCol = new Float32Array(MAX_EDGES * 2 * 3);
    const g = new THREE.BufferGeometry();
    this.webPosAttr = new THREE.BufferAttribute(this.webPos, 3).setUsage(THREE.DynamicDrawUsage);
    this.webColAttr = new THREE.BufferAttribute(this.webCol, 3).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("position", this.webPosAttr);
    g.setAttribute("color", this.webColAttr);
    g.setDrawRange(0, 0);
    this.webGeo = g;

    const m = new THREE.LineBasicNodeMaterial();
    m.transparent = true;
    m.depthWrite = false;
    m.depthTest = true;
    m.blending = THREE.AdditiveBlending;
    m.toneMapped = false;
    m.colorNode = attribute("color", "vec3"); // additive: colour IS intensity

    this.web = new THREE.LineSegments(g, m);
    this.web.frustumCulled = false;
    this.scene.add(this.web);
  }

  async init() {
    await this.renderer.init();
    // Bloom is the difference between "data viz" and "alive". Guard the addon
    // import so a CDN/API mismatch degrades to a clean un-bloomed render.
    try {
      const { bloom } = await import("three/addons/tsl/display/BloomNode.js");
      const scenePass = pass(this.scene, this.camera);
      // A very high threshold and low strength keep the field photographic.
      // Bloom is now reserved for the faint imagined rings, never a veil over
      // the observed animals.
      const bloomPass = bloom(scenePass, 0.90, 0.18, 0.55);
      this.post = new THREE.PostProcessing(this.renderer);
      this.post.outputNode = scenePass.add(bloomPass);
    } catch (e) {
      this.post = null;
      console.warn("bloom unavailable, rendering direct:", e);
    }
  }

  onResize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  }

  // segs: [{ a:[x,y,z], b:[x,y,z], c:[r,g,b] }]
  updateWeb(segs) {
    const n = Math.min(segs.length, MAX_EDGES);
    const P = this.webPos, C = this.webCol;
    for (let i = 0; i < n; i++) {
      const s = segs[i], o = i * 6;
      P[o] = s.a[0]; P[o + 1] = s.a[1]; P[o + 2] = s.a[2];
      P[o + 3] = s.b[0]; P[o + 4] = s.b[1]; P[o + 5] = s.b[2];
      C[o] = s.c[0]; C[o + 1] = s.c[1]; C[o + 2] = s.c[2];
      C[o + 3] = s.c[0]; C[o + 4] = s.c[1]; C[o + 5] = s.c[2];
    }
    this.webGeo.setDrawRange(0, n * 2);
    this.webPosAttr.needsUpdate = true;
    this.webColAttr.needsUpdate = true;
  }

  // Write the current node set into instance buffers + billboard matrices,
  // fade distant forms into a haze, and render.
  frame(nodes, flick, dt = 16) {
    this._advanceTween(dt);
    this.controls.update();
    const cam = this.camera.position;
    this._q.copy(this.camera.quaternion); // billboards share the camera facing

    const n = Math.min(nodes.length, this.cap);
    const im = this.mesh.instanceMatrix.array;
    const tl = this.aTile.array, tn = this.aTint.array,
          gh = this.aGhost.array, al = this.aAlpha.array, gw = this.aGlow.array;

    for (let i = 0; i < n; i++) {
      const nd = nodes[i];
      const px = nd.pos[0], py = nd.pos[1], pz = nd.pos[2];
      this._p.set(px, py, pz);
      const sc = nd.scale;
      this._s.set(sc, sc, sc);
      this._m.compose(this._p, this._q, this._s);
      this._m.toArray(im, i * 16);

      const r = nd.tile;
      tl[i * 4] = r[0]; tl[i * 4 + 1] = r[1]; tl[i * 4 + 2] = r[2]; tl[i * 4 + 3] = r[3];
      tn[i * 3] = nd.tint[0]; tn[i * 3 + 1] = nd.tint[1]; tn[i * 3 + 2] = nd.tint[2];
      gh[i] = nd.kind === "ghost" ? 1 : 0;

      // depth haze: forms far from the camera dissolve, giving the field volume
      const dx = px - cam.x, dy = py - cam.y, dz = pz - cam.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      let fog = 1 - (dist - 62) / 200;
      fog = fog < 0.18 ? 0.18 : fog > 1 ? 1 : fog;
      // hl: hover highlight. 1 normally; the hovered form and its look-alikes stay
      // lit while the rest of the field dims, so a cluster reads at a glance.
      const hl = nd.hl === undefined ? 1 : nd.hl;
      al[i] = nd.alpha * fog * hl;
      gw[i] = nd.glow || 0; // selection glow → the only thing allowed to bloom
    }

    this.mesh.count = n;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.aTile.needsUpdate = true;
    this.aTint.needsUpdate = true;
    this.aGhost.needsUpdate = true;
    this.aAlpha.needsUpdate = true;
    this.aGlow.needsUpdate = true;
    this.uFlick.value = flick;

    if (this.post) this.post.renderAsync();
    else this.renderer.renderAsync(this.scene, this.camera);
  }

  // project a world position to screen px; null if behind the camera
  project(pos) {
    this._p.set(pos[0], pos[1], pos[2]).project(this.camera);
    if (this._p.z > 1) return null;
    return {
      x: (this._p.x * 0.5 + 0.5) * innerWidth,
      y: (-this._p.y * 0.5 + 0.5) * innerHeight,
    };
  }
}
