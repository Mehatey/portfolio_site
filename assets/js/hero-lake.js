/* ═══════════════════════════════════════════════════════════════════════════
   THE LAKE

   Sid: "a realistic water and a ground for the guy and a little 3d shader
   environment like im standing near a lake looking at my reflection, super
   high quality realistic reflective water with a light source governed by
   my cursor along with the light affecting the title text, and the product
   designer text should be 3d and i should be able to move and break and
   kinda glide those title letters around the landing page."

   One scene, four things in it:

     the shore      a dark ground plane in the foreground, where the letters
                    stand;
     the water      three's Water (a planar reflection with a normal map
                    driving distortion and specular), from the shoreline to
                    the horizon, so his reflection lies between him and you;
     the figure     the rigged cube-guy GLB on a stone in the water, Idle
                    looping, Look on hover, ClickReact on click;
     the letters    the headline as extruded glyphs, each a Rapier rigid body
                    resting on the shore. Drag one and it follows the hand;
                    let go and it keeps its velocity, slides, tumbles, knocks
                    the others.

   One warm point light follows the cursor across a plane above the shore.
   It lights the letters, the figure and the water's glints; the water's sun
   direction is the same vector, so the reflection highlights move with the
   hand as well.

   WHERE IT DOES NOT RUN. Phones (no pointer to light with, and a GLB plus a
   reflection pass is a battery cost), reduced motion, a lite GL budget, or
   any failure to create the context. In every one of those the DOM hero is
   simply left as it is. The DOM headline stays in the document for screen
   readers and search in every case; only its ink is hidden when the scene
   is up.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Water } from "three/addons/objects/Water.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const hero = document.getElementById("hero");
const host = document.getElementById("lake-stage");
if (!hero || !host) throw new Error("no lake host");

const prefersLess = matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = matchMedia("(hover: none)").matches || innerWidth < 900;
const budget = !window.SidGL || window.SidGL.claim("hero-lake");
if (prefersLess || coarse || !budget) throw new Error("lake skipped");

const BASE = host.getAttribute("data-base") || "";
const LINES = ["Product designer who", "builds what he designs."];

/* ── RENDERER ─────────────────────────────────────────────────────────── */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
} catch (e) {
  throw new Error("no webgl");
}
renderer.setPixelRatio(Math.min(1.5, devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.className = "lake-canvas";
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
camera.position.set(0, 3.1, 9.4);
camera.lookAt(0, 0.5, 0.4);

/* ── THEME ────────────────────────────────────────────────────────────── */
const isLight = () => document.documentElement.getAttribute("data-theme") === "light";
const palette = () =>
  isLight()
    ? { ground: 0xd9d4c8, water: 0x8fb0c4, fog: 0xf0ede6, sun: 0xfff1d6, key: 0xffe6c2, sky: 0xffffff, floor: 0xc9c3b6 }
    : { ground: 0x101319, water: 0x0b1a2b, fog: 0x07060c, sun: 0xffd9a8, key: 0xffc98a, sky: 0x3a4a66, floor: 0x1a1e27 };

/* ── LIGHT ────────────────────────────────────────────────────────────── */
const hemi = new THREE.HemisphereLight(0x8fa8c8, 0x141a24, 0.55);
scene.add(hemi);
/* A spot, not a point: a point light's shadow renders the scene six
   times a frame, a spot's once. It follows the hand the same way and its
   cone is wide enough to read as a lamp over the whole shore. */
const key = new THREE.SpotLight(0xffc98a, 60, 40, Math.PI / 2.6, 0.6, 1.4);
key.position.set(-2, 3.2, 3);
key.target.position.set(0, 0, 2.5);
scene.add(key.target);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.bias = -0.0015;
scene.add(key);
const rim = new THREE.DirectionalLight(0x9fc2ff, 0.7);
rim.position.set(4, 6, -6);
scene.add(rim);

/* ── SHORE ────────────────────────────────────────────────────────────── */
const SHORE_Z = 1.5; /* water begins here and runs away from the camera */
const groundMat = new THREE.MeshStandardMaterial({ color: 0x0e1117, roughness: 0.97, metalness: 0.0 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 14), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, 0, SHORE_Z + 7);
ground.receiveShadow = true;
scene.add(ground);

/* A soft lip where the shore meets the water, so the two do not meet at a
   mathematically straight line. */
const lipMat = new THREE.MeshStandardMaterial({ color: 0x0c0f14, roughness: 1 });
const lip = new THREE.Mesh(new THREE.BoxGeometry(60, 0.08, 0.5), lipMat);
lip.position.set(0, -0.02, SHORE_Z);
scene.add(lip);

/* ── WATER ────────────────────────────────────────────────────────────── */
const waterNormals = new THREE.TextureLoader().load(BASE + "/assets/textures/waternormals.jpg", (t) => {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
});
const water = new Water(new THREE.PlaneGeometry(200, 120), {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals,
  sunDirection: new THREE.Vector3(-0.4, 0.6, 0.5).normalize(),
  sunColor: 0xffd9a8,
  waterColor: 0x0b1a2b,
  distortionScale: 2.2,
  fog: true,
});
water.rotation.x = -Math.PI / 2;
water.position.set(0, -0.005, SHORE_Z - 60);
scene.add(water);

/* ── THE STONE, AND THE FIGURE ON IT ───────────────────────────────────── */
const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 0.22, 40), new THREE.MeshStandardMaterial({ color: 0x1a1e27, roughness: 0.9 }));
stone.position.set(2.6, 0.06, -1.4);
stone.castShadow = true;
stone.receiveShadow = true;
scene.add(stone);

let figure = null,
  mixer = null,
  clips = {},
  busy = false;
new GLTFLoader().load(BASE + "/assets/models/cube-guy-rigged.glb", (gltf) => {
  figure = gltf.scene;
  const box = new THREE.Box3().setFromObject(figure);
  const h = box.max.y - box.min.y || 1;
  const s = 1.85 / h;
  figure.scale.setScalar(s);
  figure.position.set(stone.position.x, 0.17, stone.position.z);
  figure.rotation.y = -0.35;
  figure.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = false;
    }
  });
  scene.add(figure);
  mixer = new THREE.AnimationMixer(figure);
  gltf.animations.forEach((c) => (clips[c.name] = c));
  play("Wave", 1, () => play("Idle"));
});
function play(name, reps, then) {
  const c = clips[name] || clips.Idle;
  if (!mixer || !c) return;
  mixer.stopAllAction();
  const a = mixer.clipAction(c);
  a.reset();
  a.setLoop(reps === 1 ? THREE.LoopOnce : THREE.LoopRepeat, reps === 1 ? 1 : Infinity);
  a.clampWhenFinished = true;
  a.fadeIn(0.25).play();
  if (then) setTimeout(then, c.duration * 1000 + 60);
}

/* ── THE LETTERS ──────────────────────────────────────────────────────── */
const letterMat = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.42, metalness: 0.08 });
const letters = []; /* { mesh, body, w, h, d } */
let RAPIER = null,
  world = null;

async function buildLetters(font) {
  const mod = await import("https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.17.3");
  RAPIER = mod.default || mod;
  await RAPIER.init();
  world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  /* the shore, as a collider */
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(40, 0.5, 20)
      .setTranslation(0, -0.5, SHORE_Z + 10)
      .setFriction(0.9)
  );
  /* a low wall at the water's edge so a thrown letter stops at the shore
     rather than drowning; and one at the camera so nothing leaves the frame */
  world.createCollider(RAPIER.ColliderDesc.cuboid(40, 3, 0.2).setTranslation(0, 2.5, SHORE_Z - 0.1));
  world.createCollider(RAPIER.ColliderDesc.cuboid(40, 1, 0.2).setTranslation(0, 0.5, 7.4));
  world.createCollider(RAPIER.ColliderDesc.cuboid(0.2, 1, 20).setTranslation(-6.2, 0.5, 5));
  world.createCollider(RAPIER.ColliderDesc.cuboid(0.2, 1, 20).setTranslation(6.2, 0.5, 5));

  const SIZE = 0.3,
    DEPTH = 0.09,
    GAP = 0.045,
    SPACE = 0.18;
  const startX = -3.7;
  LINES.forEach((line, li) => {
    /* The nearer row is projected wider, so it starts a little further
       right to keep the two left edges reading as one. */
    let x = startX + li * 0.3;
    const z = 1.9 + li * 0.95;
    for (const ch of line) {
      if (ch === " ") {
        x += SPACE;
        continue;
      }
      const geo = new TextGeometry(ch, {
        font,
        size: SIZE,
        depth: DEPTH,
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.008,
        bevelSegments: 2,
      });
      geo.computeBoundingBox();
      const bb = geo.boundingBox;
      const w = bb.max.x - bb.min.x,
        h = bb.max.y - bb.min.y,
        d = bb.max.z - bb.min.z;
      geo.translate(-(bb.min.x + w / 2), -(bb.min.y + h / 2), -(bb.min.z + d / 2));
      const mesh = new THREE.Mesh(geo, letterMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      const body = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(x + w / 2, h / 2 + 0.02, z)
          .setLinearDamping(1.4)
          .setAngularDamping(1.8)
      );
      world.createCollider(
        RAPIER.ColliderDesc.cuboid(w / 2, h / 2, d / 2)
          .setDensity(1)
          .setFriction(0.8)
          .setRestitution(0.1),
        body
      );
      letters.push({ mesh, body, w, h, d, home: { x: x + w / 2, y: h / 2 + 0.02, z } });
      x += w + GAP;
    }
  });
  hero.classList.add("is-lake");
  retire();
}
new FontLoader().load(BASE + "/assets/fonts/helvetiker_bold.typeface.json", (font) => {
  buildLetters(font).catch(() => {
    /* No physics: the letters simply stand. */
    hero.classList.add("is-lake");
    retire();
  });
});

/* ── WHAT THE LAKE REPLACES, IT STOPS ─────────────────────────────────
   Sid: "why is my landing page so laggy." Measured: twelve animation loops
   ran every frame on the hero. With the scene up, the model-viewer figure
   (its own WebGL context and loop), the wash, its code layer and the
   watercolour are all underneath an opaque lake. They stop. */
function retire() {
  window.__lakeActive = true;
  const mv = document.getElementById("cg-model");
  if (mv && mv.parentNode) mv.parentNode.removeChild(mv);
}

/* ── POINTER ──────────────────────────────────────────────────────────── */
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2(0, 0);
const lightPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2.6); /* y = 2.6 */
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.16); /* y = 0.25 */
const hit = new THREE.Vector3();
let hasPointer = false,
  dragging = null,
  dragTarget = new THREE.Vector3(),
  hovered = null,
  overFigure = false;

function toNdc(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
}
hero.addEventListener(
  "pointermove",
  (e) => {
    toNdc(e);
    hasPointer = true;
    ray.setFromCamera(ndc, camera);
    if (dragging) {
      if (ray.ray.intersectPlane(dragPlane, hit)) dragTarget.copy(hit);
      return;
    }
    /* hover: the nearest letter, and the figure */
    const objs = letters.map((l) => l.mesh);
    const hits = ray.intersectObjects(objs, false);
    hovered = hits.length ? letters.find((l) => l.mesh === hits[0].object) : null;
    let of = false;
    if (figure) of = ray.intersectObject(figure, true).length > 0;
    if (of && !overFigure && !busy) play("Look", 1, () => play("Idle"));
    overFigure = of;
    host.style.cursor = hovered || of ? "grab" : "";
  },
  { passive: true }
);
hero.addEventListener("pointerleave", () => {
  hasPointer = false;
  hovered = null;
});
hero.addEventListener("pointerdown", (e) => {
  if (!world) return;
  toNdc(e);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(
    letters.map((l) => l.mesh),
    false
  );
  if (hits.length) {
    dragging = letters.find((l) => l.mesh === hits[0].object);
    if (ray.ray.intersectPlane(dragPlane, hit)) dragTarget.copy(hit);
    host.style.cursor = "grabbing";
    e.preventDefault();
    return;
  }
  if (figure && ray.intersectObject(figure, true).length && !busy) {
    busy = true;
    play("ClickReact", 1, () => {
      play("Idle");
      busy = false;
    });
  }
});
window.addEventListener("pointerup", () => {
  if (dragging) host.style.cursor = "";
  dragging = null;
});

/* ── LOOP ─────────────────────────────────────────────────────────────── */
const clock = new THREE.Clock();
const tmpV = new THREE.Vector3();
const keyTarget = new THREE.Vector3(-2, 3.2, 3);
let live = true;
function resize() {
  const r = host.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width)),
    h = Math.max(1, Math.round(r.height));
  if (renderer.domElement.width !== w * renderer.getPixelRatio()) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}
function applyTheme() {
  const p = palette();
  /* The water runs into the page colour at the horizon rather than
     stopping at a line. */
  scene.fog = new THREE.Fog(p.fog, 9, 42);
  groundMat.color.set(p.ground);
  stone.material.color.set(p.floor);
  lipMat.color.set(p.floor);
  water.material.uniforms.waterColor.value.set(p.water);
  water.material.uniforms.sunColor.value.set(p.sun);
  key.color.set(p.key);
  hemi.color.set(p.sky);
  letterMat.color.set(isLight() ? 0x14161c : 0xf2efe8);
}
applyTheme();
new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

function frame() {
  if (!live) return;
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, clock.getDelta());
  resize();

  /* the light follows the hand */
  if (hasPointer) {
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(lightPlane, hit)) keyTarget.set(THREE.MathUtils.clamp(hit.x, -7, 7), 2.6, THREE.MathUtils.clamp(hit.z, -6, 8));
  } else {
    const t = clock.elapsedTime;
    keyTarget.set(Math.sin(t * 0.18) * 3 - 1, 3.2, 2 + Math.cos(t * 0.13) * 1.5);
  }
  key.position.lerp(keyTarget, 0.08);
  key.target.position.set(key.position.x * 0.5, 0, 2.5);
  tmpV
    .copy(key.position)
    .sub(new THREE.Vector3(0, 0, -6))
    .normalize();
  water.material.uniforms.sunDirection.value.copy(tmpV);
  water.material.uniforms.time.value += dt * 0.55;

  if (mixer) mixer.update(dt);

  if (world) {
    if (dragging) {
      const b = dragging.body;
      const p = b.translation();
      const dx = dragTarget.x - p.x,
        dz = dragTarget.z - p.z,
        dy = dragTarget.y + dragging.h / 2 - p.y;
      /* a spring toward the hand, so it glides rather than teleports */
      b.setLinvel({ x: dx * 14, y: dy * 10, z: dz * 14 }, true);
      b.setAngvel({ x: 0, y: b.angvel().y * 0.9, z: 0 }, true);
    }
    world.timestep = dt;
    world.step();
    for (const l of letters) {
      const p = l.body.translation(),
        q = l.body.rotation();
      /* A letter that leaves the shore anyway (over the wall, off the
         side) comes back to where it started, upright, quietly. */
      if (p.y < -1 || p.z < SHORE_Z - 0.6 || Math.abs(p.x) > 7 || p.z > 9) {
        l.body.setTranslation({ x: l.home.x, y: l.home.y, z: l.home.z }, true);
        l.body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
        l.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        l.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
        if (dragging === l) dragging = null;
      }
      l.mesh.position.set(p.x, p.y, p.z);
      l.mesh.quaternion.set(q.x, q.y, q.z, q.w);
    }
  }
  /* hover lift on the material via emissive, one letter at a time */
  for (const l of letters) {
    const want = l === hovered || l === dragging ? 0.35 : 0;
    if (!l.mesh.material.__own) {
      l.mesh.material = letterMat.clone();
      l.mesh.material.__own = true;
    }
    const m = l.mesh.material;
    m.emissive.set(0xffc98a);
    m.emissiveIntensity += (want - m.emissiveIntensity) * 0.2;
  }

  renderer.render(scene, camera);
}
resize();
frame();

/* Stop when the hero is off screen; the site has enough running below. */
new IntersectionObserver(
  (es) => {
    const on = es[0].isIntersecting;
    if (on && !live) {
      live = true;
      clock.getDelta();
      frame();
    } else if (!on) live = false;
  },
  { threshold: 0.02 }
).observe(hero);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) live = false;
  else if (!live) {
    live = true;
    clock.getDelta();
    frame();
  }
});
