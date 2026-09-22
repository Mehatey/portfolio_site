/* ═══════════════════════════════════════════════════════════════════════════
   THE LAKE

   Sid: "a realistic water and a ground for the guy and a little 3d shader
   environment like im standing near a lake looking at my reflection, super
   high quality realistic reflective water with a light source governed by
   my cursor along with the light affecting the title text, and the product
   designer text should be 3d and i should be able to move and break and
   kinda glide those title letters around the landing page."

   Then: "i dont like the brown block below the water can we extend the
   water throughout and maybe have some lotus leaves or some well designed
   slabs or like mud islands to make the text legible. the 3d text is nice
   but on hover it should move around the page and i shud be able to throw
   it into the water."

   One scene, five things in it:

     the water      three's Water (a planar reflection with a normal map
                    driving distortion and specular), under everything, from
                    behind the camera to the horizon;
     the island     one low slab of dark stone where the headline stands.
                    Its edge is the rule: on it a letter rests, off it a
                    letter sinks;
     the leaves     lotus pads on the water, bobbing, nothing else;
     the figure     the rigged cube-guy GLB on his own stone, Idle looping,
                    Look on hover, ClickReact on click;
     the letters    the headline as extruded glyphs, each a Rapier rigid
                    body. Brush one and it slides away from the hand. Drag
                    one and it follows; let go and it keeps its speed. Throw
                    it off the island and it goes under, slowly, a ring
                    spreading where it went in, and a moment later it is
                    back in its place.

   One warm spot light follows the cursor across a plane above the island.
   It lights the letters, the figure and the water's glints; the water's sun
   direction is the same vector, so the reflection highlights move with the
   hand as well.

   WHERE IT DOES NOT RUN. Phones (no pointer to light with, and a GLB plus a
   reflection pass is a battery cost), reduced motion, a lite GL budget, or
   any failure to create the context. In every one of those the DOM hero is
   simply left as it is. The DOM headline stays in the document for screen
   readers and search in every case; only its ink is hidden when the scene
   is up. The layout adds .is-lake before first paint under the same tests,
   so the old figure never shows for a beat; this file removes the class
   again if it has to give up.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Water } from "three/addons/objects/Water.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* Wrapped so the guards can return instead of throwing: a skipped lake
   is a decision, not an error in the console. */
(function main() {
  const hero = document.getElementById("hero");
  const host = document.getElementById("lake-stage");
  if (!hero || !host) return;
  const giveUp = () => {
    hero.classList.remove("is-lake");
    window.__lakeActive = false;
  };

  const prefersLess = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(hover: none)").matches || innerWidth < 900;
  const budget = !window.SidGL || window.SidGL.claim("hero-lake");
  if (prefersLess || coarse || !budget) return giveUp();

  const BASE = host.getAttribute("data-base") || "";
  const LINES = ["Product designer who", "builds what he designs."];

  /* ── RENDERER ─────────────────────────────────────────────────────────── */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    return giveUp();
  }
  renderer.setPixelRatio(Math.min(1.5, devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "lake-canvas";
  host.appendChild(renderer.domElement);

  /* The context is up: the scene owns the hero from here. What it replaces,
     it stops. Sid: "why is my landing page so laggy." Twelve loops ran on
     the hero; the model-viewer figure (its own context) and the washes are
     under an opaque lake now, so they go. */
  hero.classList.add("is-lake");
  window.__lakeActive = true;
  const mv = document.getElementById("cg-model");
  if (mv && mv.parentNode) mv.parentNode.removeChild(mv);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  camera.position.set(0, 3.1, 9.4);
  camera.lookAt(0, 0.5, 0.4);

  /* ── THEME ────────────────────────────────────────────────────────────── */
  const isLight = () => document.documentElement.getAttribute("data-theme") === "light";
  const palette = () =>
    isLight()
      ? {
          water: 0x8fb0c4,
          fog: 0xf0ede6,
          sun: 0xfff1d6,
          key: 0xffe6c2,
          sky: 0xffffff,
          stone: 0xc9c3b6,
          island: 0xbdb6a8,
          leaf: 0x6f9a72,
          ink: 0x14161c,
        }
      : {
          water: 0x0b1a2b,
          fog: 0x07060c,
          sun: 0xffd9a8,
          key: 0xffc98a,
          sky: 0x3a4a66,
          stone: 0x1a1e27,
          island: 0x171a20,
          leaf: 0x2c4a3c,
          ink: 0xf2efe8,
        };

  /* ── LIGHT ────────────────────────────────────────────────────────────── */
  const hemi = new THREE.HemisphereLight(0x8fa8c8, 0x141a24, 0.55);
  scene.add(hemi);
  /* A spot, not a point: a point light's shadow renders the scene six
     times a frame, a spot's once. */
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

  /* ── WATER, UNDER EVERYTHING ──────────────────────────────────────────── */
  const waterNormals = new THREE.TextureLoader().load(BASE + "/assets/textures/waternormals.jpg", (t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
  });
  const water = new Water(new THREE.PlaneGeometry(240, 240), {
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
  water.position.set(0, -0.005, -30);
  scene.add(water);

  /* ── THE ISLAND ───────────────────────────────────────────────────────
     One slab, its outline drawn by hand rather than a rectangle, so its
     edge reads as stone and not as a stage. It is exactly as wide as the
     two lines of the headline plus a margin, and it is the only ground a
     letter can rest on. */
  const ISLAND = { x0: -4.35, x1: 3.35, z0: 1.3, z1: 3.45, top: 0.02, thick: 0.22 };
  const islandMat = new THREE.MeshStandardMaterial({ color: 0x171a20, roughness: 0.96, metalness: 0.02, envMapIntensity: 0.1 });
  const island = (() => {
    const cx = (ISLAND.x0 + ISLAND.x1) / 2,
      cz = (ISLAND.z0 + ISLAND.z1) / 2,
      rx = (ISLAND.x1 - ISLAND.x0) / 2,
      rz = (ISLAND.z1 - ISLAND.z0) / 2;
    const pts = [];
    const N = 28;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      /* a superellipse, so the corners are soft but the sides stay straight
         enough to hold a line of type, with a little hand wobble */
      const c = Math.cos(a),
        s = Math.sin(a);
      const k = 1 / Math.pow(Math.pow(Math.abs(c), 3.2) + Math.pow(Math.abs(s), 3.2), 1 / 3.2);
      const wob = 1 + 0.035 * Math.sin(a * 3.1 + 0.7) + 0.02 * Math.sin(a * 7.3 + 2.1);
      pts.push(new THREE.Vector2(cx + c * k * rx * wob, cz + s * k * rz * wob));
    }
    const shape = new THREE.Shape(pts);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: ISLAND.thick,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.05,
      bevelSegments: 3,
      curveSegments: 4,
    });
    /* extruded along +z in shape space: lay it flat with its top at y = top */
    geo.rotateX(Math.PI / 2);
    geo.translate(0, ISLAND.top, 0);
    const m = new THREE.Mesh(geo, islandMat);
    m.receiveShadow = true;
    m.castShadow = true;
    scene.add(m);
    return { mesh: m, pts };
  })();

  /* ── THE LEAVES ───────────────────────────────────────────────────────── */
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2c4a3c, roughness: 0.85, side: THREE.DoubleSide, envMapIntensity: 0.1 });
  const leaves = [];
  [
    [-5.6, -0.6, 0.62],
    [-4.1, -2.4, 0.46],
    [-2.2, -1.5, 0.34],
    [0.9, -3.2, 0.5],
    [4.9, 0.6, 0.58],
    [5.9, -2.2, 0.42],
    [4.4, 3.9, 0.72],
    [-6.1, 3.2, 0.5],
    [-5.0, 5.4, 0.66],
    [1.2, 5.6, 0.4],
  ].forEach(([x, z, r], i) => {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.absarc(0, 0, r, 0.42, Math.PI * 2 - 0.42, false);
    sh.lineTo(0, 0);
    const g = new THREE.ShapeGeometry(sh, 24);
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, leafMat);
    m.position.set(x, 0.012, z);
    m.rotation.y = (i * 1.7) % (Math.PI * 2);
    m.receiveShadow = true;
    scene.add(m);
    leaves.push({ mesh: m, phase: i * 1.3, tilt: 0.02 + (i % 3) * 0.01 });
  });

  /* ── WHAT FLOATS ON THE WATER ─────────────────────────────────────────
     Sid: "get the award labels and previous companies onto the homepage
     maybe floating on the water, with light text of awards and previously."
     Each is a small upright plane standing on the surface, so the water
     carries its reflection, drifting a hand's width on its own slow clock.
     The awards sit nearer; the places he has worked sit further out,
     under one word that says what they are. */
  /* ── WHERE HE HAS WORKED, AS THEIR OWN MARKS ─────────────────────────
     Sid: "can we use company logos here. also i never worked at marriott,
     look at my resume." Marriott and M Health Fairview are brands he
     worked ON, through Deloitte; they are not employers and they came
     out. What is left is the four places that employed him, set as their
     own logos rather than as typed names, on one row behind the island. */
  const FLOATS = [["PREVIOUSLY", -6.2, -4.4, 0.5]];
  /* One row behind the stone so the figure never stands in front of a
     mark, each logo sized by WIDTH so a long wordmark and a square one
     carry the same weight. */
  const LOGO_W = 1.15;
  const LOGO_H = 0.3;
  const LOGO_Z = -4.4;
  const LOGOS = [
    ["deloitte", -3.4],
    ["eyejack", -1.3],
    ["philips", 0.5],
    ["leaf", 1.9],
  ];
  const logos = [];
  const logoMat = [];
  function makeLogos() {
    LOGOS.forEach(([name, x], i) => {
      new THREE.TextureLoader().load(BASE + "/assets/img/companies/mono/" + name + ".png", (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        /* width for a wordmark, capped height for a square mark, so a
           roundel does not tower over a logotype */
        const ar = tex.image.width / tex.image.height;
        const h = Math.min(LOGO_W / ar, LOGO_H);
        const m = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
          toneMapped: false,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(h * ar, h), m);
        mesh.position.set(x, h / 2 + 0.02, LOGO_Z);
        scene.add(mesh);
        logoMat.push(m);
        logos.push({ mesh, x, h, phase: i * 1.7 });
      });
    });
  }

  /* ── AVAILABLE, AROUND THE ISLAND ────────────────────────────────────
     Sid: "Available to work in New York, kind of mapped in a curved way
     around my island." One arc of small caps on the water, hugging the
     slab's near edge, read from the camera. */
  function makeArc() {
    const text = "AVAILABLE TO WORK  ·  NEW YORK";
    const cx = (ISLAND.x0 + ISLAND.x1) / 2,
      cz = (ISLAND.z0 + ISLAND.z1) / 2;
    const rx = (ISLAND.x1 - ISLAND.x0) / 2 + 0.6,
      rz = (ISLAND.z1 - ISLAND.z0) / 2 + 0.55;
    const g = new THREE.Group();
    const font = '500 44px "DM Mono", ui-monospace, Menlo, monospace';
    const H = 0.17;
    const n = text.length;
    const span = 0.62; /* radians of arc the line covers */
    for (let i = 0; i < n; i++) {
      const ch = text[i];
      if (ch === " ") continue;
      const c = document.createElement("canvas");
      const q = c.getContext("2d");
      q.font = font;
      const cw = Math.ceil(q.measureText(ch).width);
      c.width = cw + 8;
      c.height = 64;
      q.font = font;
      q.fillStyle = "#fff";
      q.textBaseline = "middle";
      q.fillText(ch, 4, 34);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry((c.width / c.height) * H, H),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })
      );
      const u = i / (n - 1);
      const ang = Math.PI / 2 + (u - 0.5) * span; /* pi/2 is the near edge */
      m.position.set(cx + Math.cos(ang) * rx * -1, H / 2 + 0.02, cz + Math.sin(ang) * rz);
      m.rotation.y = (u - 0.5) * span * 0.6;
      floatMat.push(m.material);
      g.add(m);
    }
    scene.add(g);
    return g;
  }
  const floats = [];
  const floatMat = [];
  function makeFloats() {
    const H = 0.3; /* world height of a label */
    FLOATS.forEach(([text, x, z, tone], i) => {
      const c = document.createElement("canvas");
      const g = c.getContext("2d");
      const font = '500 44px "DM Mono", ui-monospace, Menlo, monospace';
      g.font = font;
      const tw = Math.ceil(g.measureText(text).width) + 6 * text.length;
      c.width = tw + 24;
      c.height = 64;
      g.font = font;
      g.fillStyle = "#ffffff";
      g.textBaseline = "middle";
      let cx = 12;
      for (const ch of text) {
        g.fillText(ch, cx, 34);
        cx += g.measureText(ch).width + 6;
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      const m = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.9 * tone,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      });
      const w = (c.width / c.height) * H;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, H), m);
      mesh.position.set(x, H / 2 + 0.02, z);
      scene.add(mesh);
      floatMat.push(m);
      floats.push({ mesh, x, z, phase: i * 1.9 });
    });
  }
  const ready = document.fonts && document.fonts.load ? document.fonts.load('500 44px "DM Mono"') : Promise.resolve();
  const build = () => {
    makeFloats();
    makeArc();
    makeLogos();
  };
  ready.then(build, build);

  /* ── THE AWARDS, AS THINGS ON THE WATER ─────────────────────────────
     Sid: "instead of them being text, little 3D shiny items which are kind
     of moving down ... just keep floating on and off down the river."
     Two Webby discs, one Kyoorius bar, one Reality Hack ring, in
     polished metal, each riding the current from right to left at its own
     pace and coming round again. */
  const awardMat = (c) =>
    new THREE.MeshPhysicalMaterial({ color: c, metalness: 1, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.4 });
  const awards = [];
  const awardDefs = [
    [new THREE.CylinderGeometry(0.26, 0.26, 0.06, 40), 0xd9dde6, 0.0, -1.1, 0.055],
    [new THREE.CylinderGeometry(0.26, 0.26, 0.06, 40), 0xd9dde6, 0.42, -0.5, 0.05],
    [new THREE.BoxGeometry(0.62, 0.05, 0.22), 0xe6c45a, 0.8, -3.1, 0.042],
    [new THREE.TorusGeometry(0.22, 0.05, 16, 40), 0xb7c9d9, 0.25, -1.9, 0.06],
  ];
  awardDefs.forEach(([geo, col, ph, z, speed], i) => {
    const m = new THREE.Mesh(geo, awardMat(col));
    if (geo.type === "TorusGeometry") m.rotation.x = Math.PI / 2;
    m.castShadow = true;
    scene.add(m);
    awards.push({ mesh: m, ph, z, speed, y: 0.03 + i * 0.004 });
  });
  /* a mirror needs something to mirror: a soft graded dome, warm at the
     horizon and pale above, baked once */
  const envScene = new THREE.Scene();
  const domeGeo = new THREE.SphereGeometry(20, 24, 16);
  const domeMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {},
    vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader:
      "varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 top = vec3(0.86,0.9,0.98); vec3 hor = vec3(1.0,0.86,0.66); vec3 low = vec3(0.05,0.07,0.1); vec3 c = h > 0.0 ? mix(hor, top, smoothstep(0.0,0.7,h)) : mix(hor, low, smoothstep(0.0,0.5,-h)); gl_FragColor = vec4(c,1.0); }",
  });
  envScene.add(new THREE.Mesh(domeGeo, domeMat));
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;
  pmrem.dispose();

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
  const letterMat = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.42, metalness: 0.08, envMapIntensity: 0.35 });
  const letters = []; /* { mesh, body, w, h, d, home, line, wet, nudged } */
  let RAPIER = null,
    world = null;
  const SIZE = 0.3,
    DEPTH = 0.09,
    GAP = 0.045,
    SPACE = 0.18;
  const LINE_Z = [1.9, 2.85];

  /* ── ONE LEFT EDGE ────────────────────────────────────────────────────
     Sid: "align the type properly, a lot of on the left side is just
     floating." The headline's left edge is the page's left edge: the same
     x, in pixels, as the proof line and the foot row under it. Each row is
     at a different depth, so each gets its own world x for that pixel. */
  const proj = new THREE.Vector3();
  function pageLeftPx() {
    const foot = hero.querySelector(".hero__foot-row");
    const hr = hero.getBoundingClientRect();
    if (foot) return foot.getBoundingClientRect().left - hr.left;
    return hr.width * 0.05;
  }
  function worldXAtPixel(px, y, z) {
    const w = host.getBoundingClientRect().width || 1;
    const ndcX = (px / w) * 2 - 1;
    const a = proj.set(0, y, z).project(camera).x;
    const b = proj.set(1, y, z).project(camera).x;
    return (ndcX - a) / (b - a);
  }
  function screenYOf(x, y, z) {
    const h = host.getBoundingClientRect().height || 1;
    proj.set(x, y, z).project(camera);
    return ((1 - proj.y) / 2) * h;
  }
  /* The DOM lines above and below the headline take their place from the
     letters, so the column reads status, headline, proof, foot on one edge
     at every viewport. */
  function placeDom() {
    if (!letters.length) return;
    const top = screenYOf(0, SIZE + 0.02, LINE_Z[0]);
    const bottom = screenYOf(0, 0, LINE_Z[1] + DEPTH);
    hero.style.setProperty("--lake-title-top", Math.round(top) + "px");
    hero.style.setProperty("--lake-title-bottom", Math.round(bottom) + "px");
  }
  function layoutHomes() {
    const left = pageLeftPx();
    LINES.forEach((line, li) => {
      const z = LINE_Z[li];
      let x = worldXAtPixel(left, SIZE / 2, z);
      for (const ch of line) {
        if (ch === " ") {
          x += SPACE;
          continue;
        }
        const l = letters.find((q) => q.line === li && q.ch === ch && !q.placed);
        if (!l) continue;
        l.placed = true;
        l.home = { x: x + l.w / 2, y: l.h / 2 + ISLAND.top, z };
        x += l.w + GAP;
      }
    });
    letters.forEach((l) => (l.placed = false));
    placeDom();
  }

  /* The glyphs stand as soon as the font is here; the physics arrives after
     and picks them up where they are. Nothing waits on the network for the
     headline to exist. */
  function buildMeshes(font) {
    LINES.forEach((line, li) => {
      for (const ch of line) {
        if (ch === " ") continue;
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
        const mesh = new THREE.Mesh(geo, letterMat.clone());
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        letters.push({
          mesh,
          body: null,
          w,
          h,
          d,
          home: null,
          line: li,
          ch,
          wet: 0,
          nudged: 0,
          tick: 0,
          markAt: 0,
          mark: null,
          homing: false,
          touched: 0,
        });
      }
    });
    resize();
    layoutHomes();
    letters.forEach((l) => l.mesh.position.set(l.home.x, l.home.y, l.home.z));
  }

  async function buildPhysics() {
    const mod = await import("https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.17.3");
    RAPIER = mod.default || mod;
    await RAPIER.init();
    world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    world.timestep = STEP;
    /* The island is the only floor. Its collider is the hull of the slab,
       so a letter pushed past the drawn edge really does go over. */
    const hull = [];
    for (const p of island.pts) {
      hull.push(p.x, ISLAND.top, p.y);
      hull.push(p.x, ISLAND.top - ISLAND.thick, p.y);
    }
    const islandCol = RAPIER.ColliderDesc.convexHull(new Float32Array(hull));
    if (islandCol) world.createCollider(islandCol.setFriction(0.9));
    /* his stone, so a letter thrown at him lands on it */
    world.createCollider(RAPIER.ColliderDesc.cylinder(0.11, 1.0).setTranslation(stone.position.x, 0.06, stone.position.z));

    for (const l of letters) {
      const body = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(l.home.x, l.home.y, l.home.z)
          .setLinearDamping(0.9)
          .setAngularDamping(1.6)
          .setCanSleep(true)
          .setCcdEnabled(true)
      );
      world.createCollider(
        RAPIER.ColliderDesc.cuboid(l.w / 2, l.h / 2, l.d / 2)
          .setDensity(1)
          .setFriction(0.9)
          .setRestitution(0),
        body
      );
      l.body = body;
    }
    /* ── THEY START AS TYPE, NOT AS A PILE ─────────────────────────────
       Left to the solver the headline took seven to ten seconds to stop
       jostling after it was built, which is the whole of a first look.
       Every letter is already exactly where it belongs, so it is slept
       there and the simulation only takes over when a hand arrives. */
    for (const l of letters) {
      l.body.setTranslation(l.home, false);
      l.body.setLinvel({ x: 0, y: 0, z: 0 }, false);
      l.body.sleep();
    }
  }
  /* Sid: "the letters still glitch, just fix the glitching." The extruded
     3D headline rendered with jagged, doubled strokes under real use. The
     DOM headline carries the title instead (see the CSS in sid_home.html
     that no longer hides .hero__title's ink in lake mode); this call is
     what used to build the mesh and its physics, left here disabled so
     the letter code above it stays intact if it is ever debugged and
     brought back.
  new FontLoader().load(
    BASE + "/assets/fonts/helvetiker_bold.typeface.json",
    (font) => {
      buildMeshes(font);
      buildPhysics().catch(() => {});
    },
    undefined,
    giveUp
  );
  */

  /* ── RINGS, WHERE A LETTER WENT IN ────────────────────────────────────── */
  const ringGeo = new THREE.RingGeometry(0.9, 1, 48);
  ringGeo.rotateX(-Math.PI / 2);
  const rings = [];
  function splash(x, z, size) {
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false }));
    m.position.set(x, 0.015, z);
    m.scale.setScalar(size * 0.3);
    scene.add(m);
    rings.push({ mesh: m, t: 0, size });
  }

  /* ── POINTER ──────────────────────────────────────────────────────────── */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2(0, 0);
  const lightPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2.6); /* y = 2.6 */
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.16); /* y = 0.16 */
  const hit = new THREE.Vector3();
  const lastHand = new THREE.Vector3();
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
      /* ── BRUSHED, IT MOVES ─────────────────────────────────────────────
         Sid: "on hover it should move around the page." A letter under the
         hand slides away from it, in the direction the hand is travelling,
         a little off the ground so it skips rather than scrapes. Once per
         pass: a hand resting on a letter does not keep kicking it. */
      if (hovered && hovered.body && !hovered.wet && performance.now() - hovered.nudged > 260 && ray.ray.intersectPlane(dragPlane, hit)) {
        const b = hovered.body;
        const p = b.translation();
        let dx = p.x - hit.x,
          dz = p.z - hit.z;
        const mx = hit.x - lastHand.x,
          mz = hit.z - lastHand.z;
        dx += mx * 3;
        dz += mz * 3;
        const n = Math.hypot(dx, dz) || 1;
        const m = b.mass();
        b.wakeUp();
        hovered.mark = null;
        hovered.markAt = hovered.tick;
        hovered.homing = false;
        hovered.touched = performance.now();
        b.applyImpulse({ x: (dx / n) * m * 0.75, y: m * 0.22, z: (dz / n) * m * 0.75 }, true);
        b.applyTorqueImpulse({ x: 0, y: (Math.random() - 0.5) * m * 0.03, z: 0 }, true);
        hovered.nudged = performance.now();
      }
      if (ray.ray.intersectPlane(dragPlane, hit)) lastHand.copy(hit);
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
      if (dragging.wet) {
        dragging = null;
        return;
      }
      dragging.body.wakeUp();
      dragging.mark = null;
      dragging.markAt = dragging.tick;
      dragging.homing = false;
      dragging.touched = performance.now();
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
  const STEP = 1 / 90;
  let acc = 0;
  const tmpV = new THREE.Vector3();
  const tmpQ = new THREE.Quaternion();
  const IDENT = new THREE.Quaternion();
  const keyTarget = new THREE.Vector3(-2, 3.2, 3);
  let live = true;
  function resize() {
    const r = host.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)),
      h = Math.max(1, Math.round(r.height));
    if (renderer.domElement.width !== w * renderer.getPixelRatio() || renderer.domElement.height !== h * renderer.getPixelRatio()) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (letters.length) {
        layoutHomes();
        /* a resting letter follows the new edge; a moving one is left alone */
        for (const l of letters) {
          if (!l.body || dragging === l || l.wet) continue;
          const v = l.body.linvel();
          if (Math.hypot(v.x, v.y, v.z) < 0.05) {
            l.body.setTranslation(l.home, true);
            l.body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
          }
        }
      }
    }
  }
  function applyTheme() {
    const p = palette();
    /* The water runs into the page colour at the horizon rather than
       stopping at a line. */
    scene.fog = new THREE.Fog(p.fog, 9, 42);
    stone.material.color.set(p.stone);
    islandMat.color.set(p.island);
    leafMat.color.set(p.leaf);
    water.material.uniforms.waterColor.value.set(p.water);
    water.material.uniforms.sunColor.value.set(p.sun);
    key.color.set(p.key);
    hemi.color.set(p.sky);
    letterMat.color.set(p.ink);
    letters.forEach((l) => l.mesh.material.color.set(p.ink));
    floatMat.forEach((m) => m.color.set(p.ink));
    logoMat.forEach((m) => m.color.set(p.ink));
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  function frame() {
    if (!live) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.elapsedTime;
    resize();

    /* the light follows the hand */
    if (hasPointer) {
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(lightPlane, hit)) keyTarget.set(THREE.MathUtils.clamp(hit.x, -7, 7), 2.6, THREE.MathUtils.clamp(hit.z, -6, 8));
    } else {
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

    for (const f of floats) {
      /* one row, so it reads as a line of type on the water; it only bobs */
      f.mesh.position.x = f.x;
      f.mesh.position.z = f.z + Math.cos(t * 0.09 + f.phase * 0.7) * 0.05;
      f.mesh.position.y = 0.17 + Math.sin(t * 0.6 + f.phase) * 0.008;
      f.mesh.rotation.y = 0;
    }
    for (const g of logos) {
      g.mesh.position.z = LOGO_Z + Math.cos(t * 0.09 + g.phase * 0.7) * 0.05;
      g.mesh.position.y = g.h / 2 + 0.02 + Math.sin(t * 0.6 + g.phase) * 0.008;
    }
    for (const a of awards) {
      const k = (((t * a.speed + a.ph) % 1) + 1) % 1;
      a.mesh.position.set(9.5 - k * 19, a.y + Math.sin(t * 0.9 + a.ph * 7) * 0.012, a.z + Math.sin(k * Math.PI * 2) * 0.3);
      a.mesh.rotation.y = t * 0.25 + a.ph;
      a.mesh.rotation.z = Math.sin(t * 0.7 + a.ph) * 0.06;
    }
    for (const lf of leaves) {
      lf.mesh.position.y = 0.012 + Math.sin(t * 0.7 + lf.phase) * 0.006;
      lf.mesh.rotation.x = Math.sin(t * 0.5 + lf.phase) * lf.tilt;
      lf.mesh.rotation.z = Math.cos(t * 0.4 + lf.phase * 1.3) * lf.tilt;
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.t += dt;
      const k = r.t / 1.1;
      r.mesh.scale.setScalar(r.size * (0.3 + k * 2.2));
      r.mesh.material.opacity = 0.55 * (1 - k) * (1 - k);
      if (k >= 1) {
        scene.remove(r.mesh);
        r.mesh.material.dispose();
        rings.splice(i, 1);
      }
    }

    if (mixer) mixer.update(dt);

    if (world) {
      if (dragging) {
        const b = dragging.body;
        const p = b.translation();
        const dx = dragTarget.x - p.x,
          dz = dragTarget.z - p.z,
          dy = dragTarget.y + dragging.h / 2 - p.y;
        /* a spring toward the hand, so it glides rather than teleports */
        dragging.touched = performance.now();
        b.setLinvel({ x: dx * 14, y: dy * 10, z: dz * 14 }, true);
        b.setAngvel({ x: 0, y: b.angvel().y * 0.9, z: 0 }, true);
      }
      /* A fixed step. Stepping by the frame's own dt made a resting letter
         resolve its contact differently every frame, which read as a
         twitch, and let a body sink a hair and pop back, which read as a
         flash. Sid: "once it goes to the ground it starts to sink in
         weirdly, like flashing." */
      acc = Math.min(acc + dt, 0.1);
      while (acc >= STEP) {
        world.step();
        acc -= STEP;
      }
      for (const l of letters) {
        const b = l.body;
        const p = b.translation(),
          q = b.rotation();
        /* ── INTO THE WATER ──────────────────────────────────────────────
           Off the island a letter meets the surface: a ring spreads where
           it went in, it slows to a sink, and once it is under it comes
           back to its place from a little above, so the drop reads. */
        if (!l.wet && p.y < -0.05) {
          l.wet = t;
          splash(p.x, p.z, Math.max(l.w, l.h) * 1.4);
          b.setGravityScale(0.08, true);
          b.setLinearDamping(3.5);
          b.setAngularDamping(2.5);
          b.setLinvel({ x: b.linvel().x * 0.3, y: Math.min(b.linvel().y, -0.2), z: b.linvel().z * 0.3 }, true);
          if (dragging === l) dragging = null;
        }
        const lost = Math.abs(p.x) > 9 || p.z > 10 || p.z < -8;
        if ((l.wet && p.y < -1.4) || lost || (l.wet && t - l.wet > 4)) {
          l.wet = 0;
          b.setGravityScale(1, true);
          b.setLinearDamping(0.9);
          b.setAngularDamping(1.6);
          b.setTranslation({ x: l.home.x, y: l.home.y + 0.9, z: l.home.z }, true);
          b.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
          b.setLinvel({ x: 0, y: 0, z: 0 }, true);
          b.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
        /* ── A LETTER THAT HAS STOPPED IS TYPE AGAIN ────────────────────
           Sid: "the 3D text is glitching a lot, it doesn't move smoothly,
           once it goes to the ground it starts to sink in weirdly, like
           flashing." Measured with a hook: all thirty eight bodies carried
           0.03 to 0.29 of velocity for ever and not one of them ever
           slept. A body resting on a collider takes a step of gravity
           every step and gives it back through the contact, so it never
           settles, and at this scale that is the whole headline
           vibrating.
           So the simulation stops owning a letter once it has stopped. One
           at rest near where it belongs is put back exactly there and
           slept; one that came to rest somewhere else is slept where it
           lies. The hand wakes them again. */
        if (!l.wet && dragging !== l && !b.isSleeping()) {
          const near = Math.hypot(p.x - l.home.x, p.y - l.home.y, p.z - l.home.z) < 0.05;
          /* Stillness is drift across a third of a second, not velocity
             and not a single frame. A body resting on a collider reports
             a quarter of a metre a second for ever, and shakes four
             millimetres each way, while ending every window exactly where
             it started. A letter the hand has actually moved travels. */
          l.tick++;
          const drift = l.mark ? Math.hypot(p.x - l.mark.x, p.y - l.mark.y, p.z - l.mark.z) : 1;
          let park = false;
          if (l.tick - l.markAt >= 30) {
            if (drift < 0.02) park = true;
            else {
              l.mark = { x: p.x, y: p.y, z: p.z };
              l.markAt = l.tick;
            }
          }
          if (near && park) {
            b.setTranslation(l.home, false);
            b.setRotation({ x: 0, y: 0, z: 0, w: 1 }, false);
            b.setLinvel({ x: 0, y: 0, z: 0 }, false);
            b.setAngvel({ x: 0, y: 0, z: 0 }, false);
            b.sleep();
          } else if (park) {
            /* ── AND THE SENTENCE PUTS ITSELF BACK ─────────────────────
               A letter knocked out of the line used to stay out of it, so
               one pass of a cursor left the headline reading "Produc
               designer" for the rest of the visit. Once a letter has come
               to rest away from home and nothing has touched it for a
               couple of seconds, it walks back and lies down. The play is
               the same; the sentence heals. */
            b.setLinvel({ x: 0, y: 0, z: 0 }, false);
            b.setAngvel({ x: 0, y: 0, z: 0 }, false);
            b.sleep();
          }
        }
        /* Outside the awake guard on purpose: a letter that has been put
           to sleep out of place still has to find its way back. */
        /* No flag and no conditions about how it came to rest: if the
           hand has left a letter alone for a couple of seconds and it is
           not where it belongs, it goes back. A letter leaning on its
           neighbour never settles enough to ask politely. */
        if (performance.now() - l.touched > 2200 && dragging !== l && !l.wet) {
          const c = b.translation(),
            r = b.rotation(),
            t = 0.055;
          const nx = THREE.MathUtils.lerp(c.x, l.home.x, t),
            ny = THREE.MathUtils.lerp(c.y, l.home.y, t),
            nz = THREE.MathUtils.lerp(c.z, l.home.z, t);
          b.setTranslation({ x: nx, y: ny, z: nz }, false);
          tmpQ.set(r.x, r.y, r.z, r.w).slerp(IDENT, t);
          b.setRotation({ x: tmpQ.x, y: tmpQ.y, z: tmpQ.z, w: tmpQ.w }, false);
          if (Math.hypot(nx - l.home.x, ny - l.home.y, nz - l.home.z) < 0.004 && Math.abs(tmpQ.w) > 0.9999) {
            b.setTranslation(l.home, false);
            b.setRotation({ x: 0, y: 0, z: 0, w: 1 }, false);
            b.setLinvel({ x: 0, y: 0, z: 0 }, false);
            b.setAngvel({ x: 0, y: 0, z: 0 }, false);
            b.sleep();
          }
          const f = b.translation(),
            g = b.rotation();
          l.mesh.position.set(f.x, f.y, f.z);
          l.mesh.quaternion.set(g.x, g.y, g.z, g.w);
          continue;
        }
        l.mesh.position.set(p.x, p.y, p.z);
        l.mesh.quaternion.set(q.x, q.y, q.z, q.w);
      }
    }
    /* hover lift on the material via emissive, one letter at a time */
    for (const l of letters) {
      const want = l === hovered || l === dragging ? 0.35 : 0;
      const m = l.mesh.material;
      m.emissive.set(0xffc98a);
      m.emissiveIntensity += (want - m.emissiveIntensity) * 0.2;
      /* under water it dims, so it reads as gone rather than glowing */
      m.opacity = 1;
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
})();
