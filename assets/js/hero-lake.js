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
  /* The headline is now crisp DOM type on the page grid. Keep the text
     geometry system available for the award captions, but do not build a
     second, perspective-skewed version of the main claim in the scene. */
  const LINES = [];

  /* ── RENDERER ─────────────────────────────────────────────────────────── */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    return giveUp();
  }
  renderer.setPixelRatio(Math.min(1.25, devicePixelRatio || 1));
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
  /* A slightly higher camera keeps objects grounded in the lake while making
     face-up type readable. The old grazing angle heavily foreshortened both
     the headline and award captions. */
  camera.position.set(0, 5.35, 9.35);
  camera.lookAt(0, 0.18, 0.55);
  /* Sid: "the 3d text doesn't work" -- diagnosed by disabling the physics
     sim entirely and finding the exact same artifact, which meant it was
     never the geometry: it was the water's own reflection of the text.
     Water.js renders the whole scene a second time into its reflection
     texture from a mirrored camera with no filtering, and text this close
     to the waterline, seen at this camera's shallow angle, reflects back
     close enough to the direct view to read as a doubled, jittery second
     copy rather than a legible reflection. Layer 1 is invisible to that
     mirror camera (a plain PerspectiveCamera with only the default layer
     enabled) but visible to this one, so anything on it renders once. */
  camera.layers.enable(1);

  /* ── THEME ────────────────────────────────────────────────────────────── */
  const isLight = () => document.documentElement.getAttribute("data-theme") === "light";
  const palette = () =>
    isLight()
      ? {
          water: 0x4f7f9b,
          fog: 0x9fb5bf,
          sun: 0xc9dfe8,
          key: 0xffc77f,
          sky: 0x86a7b7,
          ground: 0x445c68,
          stone: 0xb9b09f,
          island: 0xaaa394,
          leaf: 0x6f9a72,
          ink: 0x14161c,
        }
      : {
          water: 0x0b1a2b,
          fog: 0x07060c,
          sun: 0x91b5cc,
          key: 0xffc98a,
          sky: 0x3a4a66,
          ground: 0x141a24,
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
  const key = new THREE.SpotLight(0xffc98a, 72, 42, Math.PI / 2.85, 0.9, 1.5);
  key.position.set(-2, 3.2, 3);
  key.target.position.set(0, 0, 2.5);
  scene.add(key.target);
  key.castShadow = true;
  key.shadow.mapSize.set(512, 512);
  key.shadow.bias = -0.0015;
  key.shadow.normalBias = 0.03;
  key.shadow.radius = 3;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fc2ff, 0.7);
  rim.position.set(4, 6, -6);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xb9d8e8, 0.32);
  fill.position.set(-5, 3.5, 2);
  scene.add(fill);
  const cursorLight = new THREE.PointLight(0xffc98a, 0, 7.5, 2);
  scene.add(cursorLight);

  /* ── WATER, UNDER EVERYTHING ──────────────────────────────────────────── */
  const waterNormals = new THREE.TextureLoader().load(BASE + "/assets/textures/waternormals.jpg", (t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 6);
    t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  });
  const water = new Water(new THREE.PlaneGeometry(240, 240), {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals,
    sunDirection: new THREE.Vector3(-0.4, 0.6, 0.5).normalize(),
    sunColor: 0xffd9a8,
    waterColor: 0x0b1a2b,
    distortionScale: 1.55,
    fog: true,
  });
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -0.005, -30);
  scene.add(water);

  /* Visible water footprint for the cursor light. */
  const hoverGlow = new THREE.Mesh(
    new THREE.CircleGeometry(1, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color(0xffc98a) }, uOpacity: { value: 0 } },
      vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader:
        "varying vec2 vUv;uniform vec3 uColor;uniform float uOpacity;void main(){vec2 p=(vUv-.5)*vec2(1.,1.45);float d=length(p);float core=pow(smoothstep(.5,0.,d),2.2);float ripple=pow(max(0.,sin(d*58.)*.5+.5),5.)*smoothstep(.48,.12,d);float a=uOpacity*(core*.18+ripple*.035);gl_FragColor=vec4(uColor*(.22+core),a);}",
    })
  );
  hoverGlow.rotation.x = -Math.PI / 2;
  hoverGlow.position.set(0, 0.018, 0);
  hoverGlow.scale.set(2.15, 1.3, 1);
  scene.add(hoverGlow);

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
    /* Kept as an invisible layout reference only. The visible slab made the
       headline occupy half the frame and read as a black blob. */
    return { mesh: m, pts };
  })();

  /* ── THE LEAVES ───────────────────────────────────────────────────────── */
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2c4a3c, roughness: 0.85, side: THREE.DoubleSide, envMapIntensity: 0.1 });
  const leaves = [];
  [
    [-4.25, -0.25, 0.34],
    [-2.15, -1.95, 0.24],
    [0.3, -2.65, 0.27],
    [4.35, -0.05, 0.31],
    [4.1, 2.45, 0.36],
    [-4.7, 3.35, 0.29],
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

  const flowerPetalGeo = new THREE.SphereGeometry(0.085, 10, 6);
  const flowerPetalMat = new THREE.MeshStandardMaterial({ color: 0xffd5de, roughness: 0.75 });
  const flowerCoreMat = new THREE.MeshStandardMaterial({ color: 0xffc85d, roughness: 0.65 });
  const flowers = [];
  function addFlower(x, z, scale, phase) {
    const group = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const petal = new THREE.Mesh(flowerPetalGeo, flowerPetalMat);
      petal.scale.set(1.45, 0.34, 0.72);
      petal.position.set(Math.cos(a) * 0.105, 0.035, Math.sin(a) * 0.105);
      petal.rotation.y = -a;
      group.add(petal);
    }
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 6), flowerCoreMat);
    core.scale.y = 0.65;
    core.position.y = 0.075;
    group.add(core);
    group.position.set(x, 0.035, z);
    group.scale.setScalar(scale);
    scene.add(group);
    flowers.push({ group, phase });
  }
  addFlower(-4.25, -0.25, 0.85, 0.4);
  addFlower(4.1, 2.45, 0.72, 2.2);

  const reedMat = new THREE.MeshStandardMaterial({ color: 0x57715a, roughness: 0.9 });
  const reedGeo = new THREE.CylinderGeometry(0.012, 0.018, 0.62, 6);
  const reeds = [];
  function addReeds(x, z, count, phase) {
    const group = new THREE.Group();
    for (let i = 0; i < count; i++) {
      const stem = new THREE.Mesh(reedGeo, reedMat);
      stem.position.set((i - count / 2) * 0.075, 0.25 + (i % 3) * 0.045, Math.sin(i * 2.1) * 0.06);
      stem.scale.y = 0.72 + (i % 3) * 0.14;
      stem.rotation.z = (i - count / 2) * 0.025;
      group.add(stem);
    }
    group.position.set(x, 0, z);
    scene.add(group);
    reeds.push({ group, phase });
  }
  addReeds(-5.05, 1.05, 7, 0.2);
  addReeds(4.85, 1.6, 6, 1.8);

  /* ── LIGHTWEIGHT SCENE LABELS ─────────────────────────────────────────
     Employers and availability are supporting context, not objects for the
     viewer to inspect. They stay as quiet 3D type, so the scene has one
     material language: water, figure, headline, then a small factual line.
     No image marks, backing cards, or curved type. */
  /* ── THE AWARDS, AS ENAMEL FLOATS ON THE WATER ───────────────────── */
  const awards = [];
  const badgeLoader = new THREE.TextureLoader();
  function addAwardFloat(url, x, z, accent, phase) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.34, 0.06, 0.76, 2, 1, 2),
      new THREE.MeshPhysicalMaterial({
        color: 0x080a10,
        metalness: 0.75,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.8,
      })
    );
    base.castShadow = true;
    base.receiveShadow = true;
    const faceMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    badgeLoader.load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      faceMat.map = texture;
      faceMat.needsUpdate = true;
    });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.68), faceMat);
    face.rotation.x = -Math.PI / 2;
    face.position.y = 0.0305;
    const trim = new THREE.LineSegments(
      new THREE.EdgesGeometry(base.geometry),
      new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.74 })
    );
    group.add(base, face, trim);
    group.position.set(x, 0.055, z);
    /* Keep the award face aligned to the reader. Bobbing supplies life; a
       forty-degree yaw only made the identity and its caption harder to read. */
    group.rotation.y = 0;
    scene.add(group);
    awards.push({ group, x, z, phase });
  }
  addAwardFloat(BASE + "/assets/img/badge_webby.webp", -1.85, -0.48, 0xd7ecff, 0.4);
  addAwardFloat(BASE + "/assets/img/badge_kyoorius.png", 0.05, -0.82, 0x806cff, 2.1);
  /* A cool daylight dome gives the water depth. The previous orange horizon
     contaminated the whole reflection and made the lake read brown. */
  const envScene = new THREE.Scene();
  const domeGeo = new THREE.SphereGeometry(20, 24, 16);
  const domeMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {},
    vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader:
      "varying vec3 vP; void main(){ float h=normalize(vP).y;vec3 top=vec3(.58,.72,.82);vec3 hor=vec3(.84,.85,.80);vec3 low=vec3(.055,.09,.13);vec3 c=h>0.?mix(hor,top,smoothstep(0.,.72,h)):mix(hor,low,smoothstep(0.,.55,-h));gl_FragColor=vec4(c,1.);}",
  });
  envScene.add(new THREE.Mesh(domeGeo, domeMat));
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;
  pmrem.dispose();

  /* ── THE STONE, AND THE FIGURE ON IT ───────────────────────────────────── */
  const stone = new THREE.Mesh(
    new THREE.CylinderGeometry(1.42, 1.62, 0.24, 48),
    new THREE.MeshStandardMaterial({ color: 0x1a1e27, roughness: 0.82, metalness: 0.015, envMapIntensity: 0.28 })
  );
  stone.position.set(2.55, 0.06, -1.4);
  stone.scale.z = 0.78;
  stone.castShadow = true;
  stone.receiveShadow = true;
  scene.add(stone);

  /* One little scene, not two disconnected props: the cat shares the stone
     with Sid and leans past its front edge to drink. */
  const cat = new THREE.Group();
  const catMat = new THREE.MeshStandardMaterial({ color: 0xc58c5c, roughness: 0.82 });
  const catCreamMat = new THREE.MeshStandardMaterial({ color: 0xe8c9a2, roughness: 0.86 });
  const catDarkMat = new THREE.MeshStandardMaterial({ color: 0x372c2a, roughness: 0.9 });
  const catBody = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 12), catMat);
  catBody.scale.set(0.82, 1, 1.35);
  catBody.position.set(0, 0.42, -0.08);
  catBody.rotation.x = 0.2;
  const catHeadPivot = new THREE.Group();
  catHeadPivot.position.set(0, 0.4, 0.28);
  catHeadPivot.rotation.x = 0.7;
  const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 12), catMat);
  catHead.scale.set(0.9, 0.86, 0.92);
  catHead.position.z = 0.14;
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), catCreamMat);
  muzzle.scale.set(1.05, 0.58, 0.72);
  muzzle.position.set(0, -0.035, 0.29);
  catHeadPivot.add(catHead, muzzle);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), catDarkMat);
  nose.scale.set(1.15, 0.72, 0.65);
  nose.position.set(0, -0.015, 0.35);
  catHeadPivot.add(nose);
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), catDarkMat);
    eye.scale.y = 0.72;
    eye.position.set(side * 0.065, 0.045, 0.285);
    catHeadPivot.add(eye);
  }
  const tongue = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.075, 3, 6), new THREE.MeshStandardMaterial({ color: 0xe89aa0, roughness: 0.72 }));
  tongue.rotation.x = Math.PI / 2;
  tongue.position.set(0, -0.09, 0.34);
  tongue.scale.setScalar(0.001);
  catHeadPivot.add(tongue);
  const earGeo = new THREE.ConeGeometry(0.085, 0.18, 4);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, catMat);
    ear.position.set(side * 0.105, 0.14, 0.13);
    ear.rotation.z = side * -0.16;
    catHeadPivot.add(ear);
  }
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.34, 7), catMat);
    leg.position.set(side * 0.13, 0.22, 0.23);
    leg.rotation.x = -0.18;
    cat.add(leg);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 7), catCreamMat);
    paw.scale.set(1, 0.48, 1.3);
    paw.position.set(side * 0.13, 0.055, 0.275);
    cat.add(paw);
  }
  for (const side of [-1, 1]) {
    const haunch = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 9), catMat);
    haunch.scale.set(0.78, 1, 1.05);
    haunch.position.set(side * 0.145, 0.27, -0.23);
    cat.add(haunch);
  }
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 9), catCreamMat);
  chest.scale.set(0.82, 1.2, 0.62);
  chest.position.set(0, 0.34, 0.18);
  cat.add(chest);
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.16, 0.46, -0.29),
    new THREE.Vector3(0.4, 0.55, -0.42),
    new THREE.Vector3(0.43, 0.7, -0.62),
    new THREE.Vector3(0.24, 0.78, -0.72),
  ]);
  const catTail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 18, 0.035, 6, false), catMat);
  catTail.name = "cat-tail";
  cat.add(catBody, catHeadPivot, catTail);
  cat.position.set(1.35, 0.17, -0.82);
  cat.rotation.y = -0.04;
  cat.scale.setScalar(1.12);
  cat.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  scene.add(cat);
  let lastCatSip = -10;
  let catHover = 0;

  let figure = null,
    mixer = null,
    clips = {},
    busy = false;
  new GLTFLoader().load(BASE + "/assets/models/cube-guy-rigged.glb", (gltf) => {
    figure = gltf.scene;
    const box = new THREE.Box3().setFromObject(figure);
    const h = box.max.y - box.min.y || 1;
    const s = 2.08 / h;
    figure.scale.setScalar(s);
    figure.position.set(2.92, 0.18, -1.55);
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
  const letterMat = new THREE.MeshStandardMaterial({
    color: 0xf2efe8,
    emissive: 0x17130f,
    emissiveIntensity: 0.16,
    roughness: 0.6,
    metalness: 0.03,
    envMapIntensity: 0.18,
  });
  const letters = []; /* { mesh, body, w, h, d, home, line, wet, nudged } */
  const sceneTypeMats = [];
  let RAPIER = null,
    world = null;
  const SIZE = 0.26,
    DEPTH = 0.075,
    GAP = 0.032,
    SPACE = 0.15;
  const LINE_Z = [1.65, 2.35];

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
        l.home = { x: x + l.w / 2, y: DEPTH / 2 + ISLAND.top + 0.012, z };
        x += l.w + GAP;
      }
    });
    letters.forEach((l) => (l.placed = false));
    placeDom();
  }

  /* ── QUIET 3D CONTEXT ─────────────────────────────────────────────────
     Supporting facts use the headline's material without its scale or
     physics. They are readable in the water world, not a row of objects. */
  function buildText3D(text, font, o) {
    const size = o.size,
      depth = o.depth != null ? o.depth : DEPTH * 0.55,
      gap = o.gap != null ? o.gap : size * 0.09,
      spaceW = size * 0.55;
    const mat = o.material || letterMat.clone();
    sceneTypeMats.push(mat);
    const parts = [];
    let totalW = 0;
    for (const ch of text) {
      if (ch === " ") {
        parts.push({ space: true, w: spaceW });
        totalW += spaceW + gap;
        continue;
      }
      const geo = new TextGeometry(ch, { font, size, depth, curveSegments: 10, bevelEnabled: false });
      geo.computeBoundingBox();
      const bb = geo.boundingBox;
      const w = bb.max.x - bb.min.x;
      parts.push({ geo, bb, w });
      totalW += w + gap;
    }
    const group = new THREE.Group();
    let cursor = -totalW / 2;
    for (const part of parts) {
      if (part.space) {
        cursor += part.w + gap;
        continue;
      }
      const { geo, bb, w } = part;
      const h = bb.max.y - bb.min.y,
        d = bb.max.z - bb.min.z;
      geo.translate(-bb.min.x, -(bb.min.y + h / 2), -(bb.min.z + d / 2));
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.position.x = cursor;
      mesh.layers.set(1);
      group.add(mesh);
      cursor += w + gap;
    }
    group.position.set(o.x || 0, o.y || 0, o.z || 0);
    if (o.rotationY) group.rotation.y = o.rotationY;
    if (o.rotationX) group.rotation.x = o.rotationX;
    scene.add(group);
    return group;
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
          curveSegments: 14,
          bevelEnabled: true,
          bevelThickness: 0.008,
          bevelSize: 0.005,
          bevelSegments: 2,
        });
        geo.computeBoundingBox();
        const bb = geo.boundingBox;
        const w = bb.max.x - bb.min.x,
          h = bb.max.y - bb.min.y,
          d = bb.max.z - bb.min.z;
        geo.translate(-(bb.min.x + w / 2), -(bb.min.y + h / 2), -(bb.min.z + d / 2));
        const mesh = new THREE.Mesh(geo, letterMat.clone());
        /* Face-up type belongs to the lake. Its extrusion becomes buoyant
           thickness and the camera supplies the perspective, rather than a
           standing headline hovering in front of the scene. */
        mesh.rotation.x = -Math.PI / 2;
        /* The water already supplies movement and reflection. A second dark
           silhouette under every glyph made the sentence look doubled at
           laptop resolution, so the headline receives light without casting
           another copy of itself onto the surface. */
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        mesh.layers.set(1);
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
          toppled: false,
          toppleTimer: 0,
          tween: null,
        });
      }
    });
    resize();
    layoutHomes();
    letters.forEach((l) => l.mesh.position.set(l.home.x, l.home.y, l.home.z));

    /* Labels are facts, not more jewellery. Unlit material keeps their strokes
       stable while the plaques and water continue to catch the moving light. */
    const awardLabelMat = new THREE.MeshBasicMaterial({ color: 0xf5f1e8, toneMapped: false });
    buildText3D("2X WEBBY AWARD", font, {
      x: -1.85,
      y: 0.045,
      z: 0.48,
      size: 0.155,
      depth: 0.014,
      gap: 0.012,
      rotationX: -Math.PI / 2,
      material: awardLabelMat,
    });
    buildText3D("KYOORIUS AWARD", font, {
      x: 0.05,
      y: 0.045,
      z: 0.16,
      size: 0.155,
      depth: 0.014,
      gap: 0.012,
      rotationX: -Math.PI / 2,
      material: awardLabelMat.clone(),
    });
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
    world.createCollider(RAPIER.ColliderDesc.cylinder(0.12, 1.48).setTranslation(stone.position.x, 0.06, stone.position.z));

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
  /* Sid: "the letters still glitch / the 3d text doesn't work." Turned out
     to be the water, not the geometry: disabling buildPhysics() entirely
     reproduced the exact same jagged/doubled look, which ruled out the
     Rapier sync loop, and the letters sit close enough to the waterline
     that Water.js's own reflection pass (a second full-scene render from a
     mirrored camera, see camera.layers.enable(1) above) put a second,
     near-coincident copy of the text right behind the first. The bevel
     was also simplified (off, curveSegments raised) while chasing this,
     which is a real improvement on its own but was not the cause. */
  new FontLoader().load(
    BASE + "/assets/fonts/helvetiker_bold.typeface.json",
    (font) => {
      buildMeshes(font);
    },
    undefined,
    giveUp
  );

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
  const lightPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.03); /* water surface */
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.16); /* y = 0.16 */
  const hit = new THREE.Vector3();
  const lastHand = new THREE.Vector3();
  let hasPointer = false,
    dragging = null,
    dragTarget = new THREE.Vector3(),
    hovered = null,
    overFigure = false,
    overCat = false;

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
      const oc = ray.intersectObject(cat, true).length > 0;
      if (of && !overFigure && !busy) play("Look", 1, () => play("Idle"));
      overFigure = of;
      overCat = oc;
      host.style.cursor = hovered || of || oc ? "pointer" : "";
    },
    { passive: true }
  );
  hero.addEventListener("pointerleave", () => {
    hasPointer = false;
    hovered = null;
    overCat = false;
  });
  hero.addEventListener("pointerdown", (e) => {
    toNdc(e);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(
      letters.map((l) => l.mesh),
      false
    );
    if (hits.length) {
      dragging = letters.find((l) => l.mesh === hits[0].object);
      /* Lightweight interaction: a clicked glyph falls flat onto the water
         and rights itself. This preserves the tactile 3D idea without
         loading and stepping a physics engine for every letter. */
      if (!dragging.body) {
        const l = dragging;
        dragging = null;
        clearTimeout(l.toppleTimer);
        l.toppled = true;
        l.tween = {
          fromX: l.mesh.rotation.x,
          toX: -Math.PI / 2,
          fromZ: l.mesh.rotation.z,
          toZ: (Math.random() > 0.5 ? 1 : -1) * 0.2,
          fromY: l.mesh.position.y,
          toY: 0.012,
          start: performance.now(),
          duration: 360,
        };
        splash(l.mesh.position.x, l.mesh.position.z, Math.max(l.w, l.h) * 1.3);
        l.toppleTimer = setTimeout(() => {
          l.toppled = false;
          l.tween = {
            fromX: l.mesh.rotation.x,
            toX: -Math.PI / 2,
            fromZ: l.mesh.rotation.z,
            toZ: 0,
            fromY: l.mesh.position.y,
            toY: l.home.y,
            start: performance.now(),
            duration: 620,
          };
        }, 620);
        e.preventDefault();
        return;
      }
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
  const keyTarget = new THREE.Vector3(-2, 4.4, 3);
  const lightAim = new THREE.Vector3(0, 0, 1);
  const lightAimTarget = new THREE.Vector3(0, 0, 1);
  /* The display may refresh at 120Hz, but the lake contains a reflection
     render, so drawing it 120 times a second spends a second full scene pass
     on frames the eye does not need. Cap only this canvas near 60fps; Lenis,
     DOM transforms and pointer input remain native-rate. */
  let lastRenderMs = 0;
  let idlePaused = document.documentElement.hasAttribute("data-idle");
  let live = !idlePaused;
  let heroInView = true;
  function resumeIfAllowed() {
    if (!heroInView || document.hidden || idlePaused || live) return;
    live = true;
    clock.getDelta();
    lastRenderMs = 0;
    frame();
  }
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
          if (!l.body) {
            if (!l.toppled && !l.tween) l.mesh.position.set(l.home.x, l.home.y, l.home.z);
            continue;
          }
          if (dragging === l || l.wet) continue;
          const v = l.body.linvel();
          if (Math.hypot(v.x, v.y, v.z) < 0.05) {
            l.body.setTranslation(l.home, true);
            l.body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
          }
        }
      }
    }
  }
  let skyTexture = null;
  function makeSkyTexture(light) {
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (light) {
      gradient.addColorStop(0, "#6f96aa");
      gradient.addColorStop(0.48, "#9fb8c2");
      gradient.addColorStop(1, "#c0c8c6");
    } else {
      gradient.addColorStop(0, "#04060c");
      gradient.addColorStop(0.55, "#111827");
      gradient.addColorStop(1, "#22252a");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
  function applyTheme() {
    const p = palette();
    /* A vertical sky gradient preserves a horizon without creating a hard
       seam where the reflective plane meets a single flat background. */
    if (skyTexture) skyTexture.dispose();
    skyTexture = makeSkyTexture(isLight());
    scene.background = skyTexture;
    scene.fog = new THREE.Fog(p.fog, isLight() ? 12 : 9, isLight() ? 52 : 42);
    stone.material.color.set(p.stone);
    islandMat.color.set(p.island);
    leafMat.color.set(p.leaf);
    reedMat.color.set(isLight() ? 0x68846d : 0x57715a);
    water.material.uniforms.waterColor.value.set(p.water);
    water.material.uniforms.sunColor.value.set(p.sun);
    if (water.material.uniforms.distortionScale) water.material.uniforms.distortionScale.value = isLight() ? 1.25 : 1.55;
    key.color.set(p.key);
    cursorLight.color.set(p.key);
    hoverGlow.material.uniforms.uColor.value.set(p.key);
    hemi.color.set(p.sky);
    hemi.groundColor.set(p.ground);
    hemi.intensity = isLight() ? 0.68 : 0.55;
    fill.intensity = isLight() ? 0.5 : 0.26;
    rim.intensity = isLight() ? 0.58 : 0.7;
    renderer.toneMappingExposure = isLight() ? 0.82 : 1.05;
    letterMat.color.set(p.ink);
    letterMat.emissive.set(isLight() ? 0x000000 : 0x17130f);
    letters.forEach((l) => {
      l.mesh.material.color.set(p.ink);
      l.mesh.material.emissive.set(isLight() ? 0x000000 : 0x17130f);
    });
    sceneTypeMats.forEach((m) => m.color.set(p.ink));
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  function frame(now) {
    if (!live) return;
    requestAnimationFrame(frame);
    const stamp = typeof now === "number" ? now : performance.now();
    const scrollState = window.__sv ? window.__sv() : null;
    const pageMoving = !!scrollState && scrollState.a > 0.035;
    /* During a scroll the whole canvas is already translating and fading.
       A ~42fps water update is visually continuous there and leaves the main
       thread room for Lenis and layout. At rest it returns to ~60fps. */
    if (stamp - lastRenderMs < (pageMoving ? 22 : 15)) return;
    lastRenderMs = stamp;
    /* The cursor is not changing the composition while a wheel gesture owns
       it. Reuse the last soft shadow instead of rebuilding the shadow map on
       every scrolling water frame; auto-update resumes as soon as it rests. */
    renderer.shadowMap.autoUpdate = !pageMoving;
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.elapsedTime;
    resize();

    /* Light source, target, water glint and visible bloom all meet under
       the hand. Previously the lamp moved but continued aiming elsewhere. */
    if (hasPointer) {
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(lightPlane, hit)) {
        lightAimTarget.set(THREE.MathUtils.clamp(hit.x, -7, 7), 0.02, THREE.MathUtils.clamp(hit.z, -6, 8));
      }
    } else {
      lightAimTarget.set(Math.sin(t * 0.18) * 2.8 - 0.7, 0.02, 1.5 + Math.cos(t * 0.13) * 1.3);
    }
    lightAim.lerp(lightAimTarget, hasPointer ? 0.14 : 0.025);
    keyTarget.set(lightAim.x, 4.4, lightAim.z + 2.25);
    key.position.lerp(keyTarget, 0.08);
    key.target.position.set(lightAim.x, 0, lightAim.z);
    const daylight = isLight();
    const keyLevel = daylight ? (hasPointer ? 48 : 34) : hasPointer ? 96 : 68;
    const cursorLevel = daylight ? (hasPointer ? 6 : 1) : hasPointer ? 24 : 4;
    key.intensity += (keyLevel - key.intensity) * 0.09;
    cursorLight.position.set(lightAim.x, 0.95, lightAim.z);
    cursorLight.intensity += (cursorLevel - cursorLight.intensity) * 0.1;
    hoverGlow.position.x = lightAim.x;
    hoverGlow.position.z = lightAim.z;
    const glowLevel = daylight ? (hasPointer ? 0.38 : 0.06) : hasPointer ? 0.82 : 0.14;
    hoverGlow.material.uniforms.uOpacity.value += (glowLevel - hoverGlow.material.uniforms.uOpacity.value) * 0.09;
    const glowPulse = 1 + Math.sin(t * 1.15) * 0.025;
    hoverGlow.scale.set(2.15 * glowPulse, 1.3 * glowPulse, 1);
    tmpV.copy(key.position).sub(key.target.position).normalize();
    water.material.uniforms.sunDirection.value.copy(tmpV);
    water.material.uniforms.time.value += dt * 0.38;

    for (const a of awards) {
      a.group.position.x = a.x + Math.sin(t * 0.16 + a.phase) * 0.11;
      a.group.position.y = 0.055 + Math.sin(t * 0.72 + a.phase) * 0.012;
      a.group.position.z = a.z + Math.cos(t * 0.14 + a.phase) * 0.07;
      a.group.rotation.x = Math.sin(t * 0.54 + a.phase) * 0.026;
      a.group.rotation.z = Math.cos(t * 0.48 + a.phase) * 0.034;
    }
    for (const lf of leaves) {
      lf.mesh.position.y = 0.012 + Math.sin(t * 0.7 + lf.phase) * 0.006;
      lf.mesh.rotation.x = Math.sin(t * 0.5 + lf.phase) * lf.tilt;
      lf.mesh.rotation.z = Math.cos(t * 0.4 + lf.phase * 1.3) * lf.tilt;
    }
    for (const f of flowers) {
      f.group.position.y = 0.035 + Math.sin(t * 0.7 + f.phase) * 0.007;
      f.group.rotation.z = Math.sin(t * 0.36 + f.phase) * 0.025;
    }
    for (const r of reeds) r.group.rotation.z = Math.sin(t * 0.42 + r.phase) * 0.025;

    catHover += ((overCat ? 1 : 0) - catHover) * 0.12;
    const idleSip = Math.pow(Math.max(0, Math.sin(t * 0.62)), 7) * (1 - catHover);
    const hoverSip = catHover * (0.72 + Math.sin(t * 7.2) * 0.12);
    const drink = Math.max(idleSip, hoverSip);
    catHeadPivot.rotation.x = 0.7 + drink * 0.62;
    catHeadPivot.position.y = 0.4 - catHover * 0.105;
    catHeadPivot.position.z = 0.28 + catHover * 0.09;
    catBody.rotation.x = 0.2 + catHover * 0.12;
    catBody.scale.y = 1 + Math.sin(t * 1.4) * 0.012 - catHover * 0.05;
    catTail.rotation.y = Math.sin(t * (overCat ? 2.2 : 0.48)) * (0.16 + catHover * 0.2);
    tongue.scale.setScalar(catHover * (0.78 + Math.sin(t * 7.2) * 0.2));
    if (drink > 0.78 && t - lastCatSip > (overCat ? 0.82 : 4.5)) {
      splash(cat.position.x, cat.position.z + 0.62, 0.18);
      lastCatSip = t;
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

    /* Only clicked letters animate. No always-on simulation, no network
       physics module, and no contact solver fighting the water plane. */
    for (const l of letters) {
      if (!l.tween) continue;
      const k = Math.min(1, (performance.now() - l.tween.start) / l.tween.duration);
      const e = 1 - Math.pow(1 - k, 3);
      l.mesh.rotation.x = THREE.MathUtils.lerp(l.tween.fromX, l.tween.toX, e);
      l.mesh.rotation.z = THREE.MathUtils.lerp(l.tween.fromZ || 0, l.tween.toZ || 0, e);
      l.mesh.position.y = THREE.MathUtils.lerp(l.tween.fromY, l.tween.toY, e);
      if (k === 1) l.tween = null;
    }

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
      const active = l === hovered || l === dragging;
      const want = active ? 0.35 : 0;
      const m = l.mesh.material;
      m.emissive.set(0xffc98a);
      m.emissiveIntensity += (want - m.emissiveIntensity) * 0.2;
      if (!l.body && !l.tween) {
        const targetY = l.home.y + (active ? 0.035 : Math.sin(t * 0.72 + l.home.x * 0.8) * 0.006);
        l.mesh.position.y += (targetY - l.mesh.position.y) * 0.16;
      }
      /* under water it dims, so it reads as gone rather than glowing */
      m.opacity = 1;
    }

    renderer.render(scene, camera);
  }
  resize();
  if (!idlePaused) frame();

  /* The idle scene is another full-screen animated renderer. It is designed
     to replace the page temporarily, so the reflective lake must actually
     stop, not continue drawing invisibly under canvas weather and backdrop
     filters. */
  window.addEventListener("sid:idle", (event) => {
    idlePaused = !!event.detail?.active;
    if (idlePaused) live = false;
    else resumeIfAllowed();
  });

  /* Stop when the hero is off screen; the site has enough running below. */
  new IntersectionObserver(
    (es) => {
      heroInView = es[0].isIntersecting;
      if (heroInView) resumeIfAllowed();
      else live = false;
    },
    { threshold: 0.02 }
  ).observe(hero);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) live = false;
    else resumeIfAllowed();
  });
})();
