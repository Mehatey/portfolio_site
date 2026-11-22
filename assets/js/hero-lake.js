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

  /* The real pronunciation control, already built and wired by
     name-say.js. Hovering the figure nudges this instead of starting a
     second audio path -- same localStorage key that file uses, so the
     nudge still stops for good once a visitor has actually pressed it. */
  const sayBtn = document.getElementById("hero-say");
  function heardName() {
    try {
      return localStorage.getItem("sid_name_heard") === "1";
    } catch (e) {
      return false;
    }
  }

  const BASE = host.getAttribute("data-base") || "";
  /* The headline and award names are crisp DOM or badge artwork now. No
     perspective-skewed text geometry competes with the water. */
  const LINES = [];

  /* ── RENDERER ─────────────────────────────────────────────────────────── */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    return giveUp();
  }
  /* The scene is softened by fog, grain, water normals, and film texture. A
     sub-1 DPR render is visually indistinguishable there, while cutting the
     reflected-water pixel workload materially on Retina laptops. */
  /* ── ADAPTIVE RESOLUTION ───────────────────────────────────────────
     The fixed 0.78 above made every edge soft: the cube guy's outline, the
     award captions and the headline-sized glyphs all read blurry on a Retina
     screen. A fixed number is also wrong in the other direction, because it
     punishes a machine that could easily afford more. So the scene starts as
     sharp as the device allows (capped at 1.25) and a small governor watches
     how fast the browser actually delivers frames. If delivery slips it steps
     down one rung and stays down; if there is a long stretch of headroom it
     steps back up once. Two drops and it stops trying, so it never oscillates. */
  const DPR_STEPS = [1.25, 1, 0.78, 0.62].filter((v) => v <= Math.max(0.78, devicePixelRatio || 1));
  let dprRung = 0;
  let dprDrops = 0;
  let dprLastMove = 0;
  let rafEma = 16.7;
  let rafPrev = 0;
  let rafGood = 0;
  let rafBad = 0;
  renderer.setPixelRatio(DPR_STEPS[0] || 0.78);
  function governDpr(stamp) {
    /* A gap this long is a hidden tab or a pause, not slow rendering. */
    if (rafPrev && stamp - rafPrev < 60) rafEma += (stamp - rafPrev - rafEma) * 0.08;
    rafPrev = stamp;
    if (stamp - dprLastMove < 4000) return;
    /* A 60Hz display delivers at 16.7ms; slower than ~22ms is the scene, not
       the display, missing frames. */
    if (rafEma > 22) {
      rafBad++;
      rafGood = 0;
    } else if (rafEma < 17.5) {
      rafGood++;
      rafBad = 0;
    } else {
      rafGood = 0;
      rafBad = 0;
    }
    if (rafBad > 45 && dprRung < DPR_STEPS.length - 1) {
      dprRung++;
      dprDrops++;
      applyDpr(stamp);
    } else if (rafGood > 600 && dprRung > 0 && dprDrops < 2) {
      dprRung--;
      applyDpr(stamp);
    }
  }
  function applyDpr(stamp) {
    renderer.setPixelRatio(DPR_STEPS[dprRung]);
    dprLastMove = stamp;
    rafBad = 0;
    rafGood = 0;
    resizeDirty = true;
    resize();
  }
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

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  /* A slightly higher camera keeps objects grounded in the lake while making
     face-up type readable. The old grazing angle heavily foreshortened both
     the headline and award captions. */
  camera.position.set(0, 5.35, 9.35);
  camera.lookAt(0, 0.18, 0.55);
  let baseLookX = 0;
  let camDriftX = 0;
  let camDriftY = 0;
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
          water: 0x087fbd,
          fog: 0x8fc6df,
          sun: 0xd9f5ff,
          key: 0xffc77f,
          sky: 0x73b6d4,
          ground: 0x315b73,
          stone: 0xb9b09f,
          island: 0xaaa394,
          leaf: 0x6f9a72,
          ink: 0x14161c,
        }
      : {
          water: 0x075b8f,
          fog: 0x051a2f,
          sun: 0xbceaff,
          key: 0xffc98a,
          sky: 0x315f8c,
          ground: 0x071c2d,
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
  const key = new THREE.SpotLight(0xffc98a, 72, 42, Math.PI / 3.6, 0.76, 1.5);
  key.position.set(-2, 4.6, 3);
  key.target.position.set(0, 0, 2.5);
  scene.add(key.target);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0015;
  key.shadow.normalBias = 0.03;
  key.shadow.radius = 3;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x82d5ff, 0.92);
  rim.position.set(4, 6, -6);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x8ccde8, 0.42);
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
    textureWidth: 256,
    textureHeight: 256,
    waterNormals,
    sunDirection: new THREE.Vector3(-0.4, 0.6, 0.5).normalize(),
    sunColor: 0xffd9a8,
    waterColor: 0x0b1a2b,
    distortionScale: 1.55,
    fog: true,
  });
  /* Water.js normally renders the entire scene a second time from a mirrored
     camera before every visible frame. That hidden pass was the remaining
     homepage bottleneck. Keep its animated normals, Fresnel edge, and moving
     highlights, but use the authored sky and light as the reflection source. */
  water.onBeforeRender = function () {};
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
        "varying vec2 vUv;uniform vec3 uColor;uniform float uOpacity;void main(){vec2 p=(vUv-.5)*vec2(1.,1.45);float d=length(p);float core=pow(smoothstep(.52,0.,d),2.0);float ripple=pow(max(0.,sin(d*58.)*.5+.5),5.)*smoothstep(.5,.12,d);float a=uOpacity*(core*.3+ripple*.05);gl_FragColor=vec4(uColor*(.28+core),a);}",
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
    [-3.35, 2.18, 0.2],
    [2.05, -2.72, 0.19],
    [5.05, 3.28, 0.23],
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
    leaves.push({ mesh: m, x, z, vx: 0, vz: 0, ox: 0, oz: 0, phase: i * 1.3, tilt: 0.02 + (i % 3) * 0.01 });
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
    flowers.push({ group, x, z, vx: 0, vz: 0, ox: 0, oz: 0, phase, scale });
  }
  addFlower(-4.25, -0.25, 0.85, 0.4);
  addFlower(4.1, 2.45, 0.72, 2.2);
  addFlower(-3.35, 2.18, 0.5, 1.3);
  addFlower(5.05, 3.28, 0.46, 3.1);

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

  /* ── FISH, AS THREE QUIET MOVING ACCENTS ───────────────────────────────
     Shared geometry and materials keep them cheap. They sit just above the
     Water pass so the silhouettes stay readable without another reflection
     render. Hovering makes one dart out of frame and leaves a small DOM note
     at the hand, which is clearer than trying to draw a music glyph in 3D. */
  const fishBodyGeo = new THREE.SphereGeometry(0.2, 14, 8);
  const fishTailGeo = new THREE.ConeGeometry(0.15, 0.24, 3);
  fishTailGeo.rotateX(Math.PI / 2);
  const fishColors = [0x78cce8, 0xf0ad76, 0xb3d69d];
  const fish = [];
  function addFish(x, z, speed, phase, note, color) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.16,
      roughness: 0.48,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
    });
    const body = new THREE.Mesh(fishBodyGeo, mat);
    body.scale.set(0.78, 0.42, 1.45);
    const tailPivot = new THREE.Group();
    tailPivot.position.z = -0.31;
    const tail = new THREE.Mesh(fishTailGeo, mat);
    tail.position.z = -0.11;
    tail.rotation.z = Math.PI / 2;
    tailPivot.add(tail);
    group.add(body, tailPivot);
    group.position.set(x, 0.035, z);
    group.rotation.y = speed > 0 ? Math.PI / 2 : -Math.PI / 2;
    group.scale.setScalar(0.74 + phase * 0.06);
    group.traverse((o) => {
      if (o.isMesh) o.layers.set(1);
    });
    scene.add(group);
    fish.push({ group, body, tailPivot, x, z, speed, phase, note, flee: 0, avoid: 0, avoidDir: 0, hiddenUntil: 0 });
  }
  addFish(-6.8, 0.05, 0.42, 0.2, "♪", fishColors[0]);
  addFish(6.2, 2.9, -0.34, 1.3, "♫", fishColors[1]);
  addFish(-5.4, -2.45, 0.29, 2.4, "♬", fishColors[2]);
  const fishTargets = fish.map((item) => item.body);

  /* ── THE AWARDS, AS ENAMEL FLOATS ON THE WATER ───────────────────── */
  const awards = [];
  const badgeLoader = new THREE.TextureLoader();
  function addAwardFloat(url, x, z, accent, phase) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.68, 0.07, 0.99, 2, 1, 2),
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
    /* Both supplied badge artworks are about 1.76:1. Preserve that ratio so
       the lettering does not get squeezed merely to fit the float. */
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.57, 0.89), faceMat);
    face.rotation.x = -Math.PI / 2;
    /* Keep the printed badge just above the float's top face. The float is
       0.07 high, so placing this below 0.035 hides it inside the geometry. */
    face.position.y = 0.038;
    const trim = new THREE.LineSegments(
      new THREE.EdgesGeometry(base.geometry),
      new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.74 })
    );
    /* A moving specular band across the printed face, with glitter that only
       shows inside the band. Driven per frame from hover and click. */
    const sheen = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      uniforms: { uPos: { value: -1 }, uAmt: { value: 0 }, uTime: { value: 0 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader:
        "varying vec2 vUv; uniform float uPos; uniform float uAmt; uniform float uTime;" +
        "float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }" +
        "void main(){" +
        "  float d = (vUv.x + vUv.y * 0.42) - uPos;" +
        "  float band = exp(-d * d * 38.0);" +
        "  float core = exp(-d * d * 260.0);" +
        "  vec2 g = floor(vUv * vec2(72.0, 40.0));" +
        "  float tw = step(0.965, h(g)) * (0.5 + 0.5 * sin(uTime * 9.0 + h(g + 3.0) * 6.28));" +
        "  vec3 col = vec3(1.0, 0.96, 0.86) * (band * 0.55 + core * 0.9) + vec3(1.0) * tw * band * 1.6;" +
        "  gl_FragColor = vec4(col * uAmt, 1.0);" +
        "}",
    });
    const sheenMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.57, 0.89), sheen);
    sheenMesh.rotation.x = -Math.PI / 2;
    sheenMesh.position.y = 0.043;
    sheenMesh.renderOrder = 3;
    group.add(base, face, trim, sheenMesh);
    group.position.set(x, 0.07, z);
    /* Keep the award face aligned to the reader. Bobbing supplies life; a
       forty-degree yaw only made the identity and its caption harder to read. */
    group.rotation.y = 0;
    scene.add(group);
    awards.push({
      group,
      x,
      z,
      phase,
      hover: 0,
      tap: 0,
      sheen,
      trim,
      sweep: 0,
      sweepSpeed: 1,
      flash: 0,
      name: awards.length === 0 ? "Webby!" : "Kyoorius!",
      travelOffset: awards.length === 0 ? 0.02 : 0.18,
    });
  }
  /* Sid: "award labels come over grass and over fish." Both the plaque
     and the reed cluster at (-5.05, 1.05) are opaque and depth-tested
     correctly -- this was never a z-sorting bug, the camera's view ray
     toward the original z=0.36 just grazed the reed silhouette at wider
     viewports where both come into frame. A first attempt at (-1.1,
     -1.35) cleared the reeds but pulled the plaque forward into the
     hero sentence's own text at the default 1440 viewport -- checked
     only the wide framing, not the one everyone actually loads first.
     Same x as the original (keeps it clear of the headline's text box),
     z nudged by -0.71 rather than -1.71: enough to clear the reeds,
     not enough to reach the text. Verified at 1440x900 and 2000x1050. */
  addAwardFloat(BASE + "/assets/img/badge_webby.webp", -1.95, -0.35, 0xbcecff, 0.4);
  addAwardFloat(BASE + "/assets/img/badge_kyoorius.webp", 0.12, 1.42, 0x86d8ff, 2.1);
  const awardTargets = awards.map((award) => award.group);
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

  /* The figure already looks at the pointer. These rings and one small point
     light make that attention visible across the water instead of expressing
     it only as a 3.5% scale change. They are dormant unless he is hovered. */
  const figureLight = new THREE.PointLight(0x9fe8ff, 0, 4.8, 2);
  figureLight.position.set(2.55, 1.25, -1.35);
  scene.add(figureLight);
  const figureAura = [];
  for (let i = 0; i < 3; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xa9e8ff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.76, 64), mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(2.55, 0.026 + i * 0.001, -1.4);
    ring.layers.set(1);
    scene.add(ring);
    figureAura.push({ ring, mat, phase: i / 3 });
  }

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
  let introStart = 0;

  let figure = null,
    mixer = null,
    clips = {},
    busy = false,
    figureScale = 1,
    figureHover = 0,
    figureMats = [];
  const figureGlowColor = new THREE.Color(0x8edfff);
  new GLTFLoader().load(
    BASE + "/assets/models/cube-guy-rigged.glb",
    (gltf) => {
      figure = gltf.scene;
      const box = new THREE.Box3().setFromObject(figure);
      const h = box.max.y - box.min.y || 1;
      const s = 2.08 / h;
      figureScale = s;
      figure.scale.setScalar(s * 0.76);
      figure.position.set(2.92, 0.18, -1.55);
      figure.rotation.y = -0.35;
      figure.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = false;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((mat) => {
            if (!mat || !mat.emissive || figureMats.some((entry) => entry.mat === mat)) return;
            figureMats.push({ mat, color: mat.emissive.clone(), intensity: mat.emissiveIntensity || 0 });
          });
        }
      });
      scene.add(figure);
      mixer = new THREE.AnimationMixer(figure);
      gltf.animations.forEach((c) => (clips[c.name] = c));
      play("Wave", 1, () => play("Idle"));
      /* Do not reveal a lake with its subject missing. The first frame opens
         from Cube Guy's position, then expands into the environment. */
      requestAnimationFrame(() => {
        introStart = performance.now();
        host.classList.add("is-ready");
        if (mv && mv.parentNode) mv.parentNode.removeChild(mv);
      });
    },
    undefined,
    () => {
      giveUp();
      window.__lakeRequested = false;
      if (window.__loadHeroFallback) window.__loadHeroFallback();
    }
  );
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
    let cursor = o.align === "left" ? 0 : -totalW / 2;
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

    /* Sid: "every click on water let it create a ripple which interacts
       with the environment." The ring was decoration only -- leaves,
       flowers and fish never felt it. They already carry the spring/drag
       fields the award floats use to push them as they drift (ox/oz/vx/vz
       below), so a splash gives the same radial impulse once, scaled by
       the ripple's own size, instead of inventing a second system. */
    const reach = Math.max(0.6, size * 2.4);
    for (const lf of leaves) {
      const dx = lf.mesh.position.x - x;
      const dz = lf.mesh.position.z - z;
      const distance = Math.max(0.08, Math.hypot(dx, dz));
      if (distance < reach) {
        const impulse = ((reach - distance) / reach) * 1.4;
        lf.vx += (dx / distance) * impulse;
        lf.vz += (dz / distance) * impulse;
      }
    }
    for (const f of flowers) {
      const dx = f.group.position.x - x;
      const dz = f.group.position.z - z;
      const distance = Math.max(0.08, Math.hypot(dx, dz));
      if (distance < reach) {
        const impulse = ((reach - distance) / reach) * 1.1;
        f.vx += (dx / distance) * impulse;
        f.vz += (dz / distance) * impulse;
      }
    }
    for (const f of fish) {
      if (!f.group.visible) continue;
      const dx = f.group.position.x - x;
      const dz = f.group.position.z - z;
      const distance = Math.hypot(dx, dz);
      if (distance < reach * 1.2) {
        f.avoid = Math.max(f.avoid, 1 - distance / (reach * 1.2));
        f.avoidDir = dz >= 0 ? 1 : -1;
      }
    }
  }

  /* ── POINTER ──────────────────────────────────────────────────────────── */
  const ray = new THREE.Raycaster();
  ray.layers.enable(1);
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
    overCat = false,
    hoveredAward = null,
    hoveredFish = null;

  function awardFor(object) {
    for (let node = object; node; node = node.parent) {
      const award = awards.find((item) => item.group === node);
      if (award) return award;
    }
    return null;
  }

  function fishFor(object) {
    return fish.find((item) => item.body === object) || null;
  }

  function leaveNote(e, note, phase) {
    const bounds = hero.getBoundingClientRect();
    const glyph = document.createElement("span");
    glyph.className = "lake-note";
    glyph.setAttribute("aria-hidden", "true");
    glyph.textContent = note;
    glyph.style.left = e.clientX - bounds.left + "px";
    glyph.style.top = e.clientY - bounds.top + "px";
    glyph.style.setProperty("--note-r", -10 + phase * 8 + "deg");
    hero.appendChild(glyph);
    glyph.addEventListener("animationend", () => glyph.remove(), { once: true });
  }

  /* ── COMIC CAPTIONS ───────────────────────────────────────────────────────
     Sid: "better comic and animated captions rather than some big basic text
     without any styling." Each character gets a speech bubble that pops in
     with overshoot, sits on its owner, and bounces letter by letter. Pure DOM,
     one element per character, positioned from the projected head each frame. */
  (function injectBubbleCss() {
    const st = document.createElement("style");
    st.textContent = `
.lake-bubble{position:absolute;z-index:8;left:0;top:0;pointer-events:none;opacity:0;--ink:#14110f;--paper:#fff3b0;
  transform:translate(-50%,-100%) scale(.35) rotate(-8deg);transform-origin:50% 100%;
  transition:opacity .16s ease,transform .5s cubic-bezier(.34,1.9,.5,1)}
.lake-bubble.is-on{opacity:1;transform:translate(-50%,-100%) scale(1) rotate(var(--r,-3deg))}
.lake-bubble--cat{--paper:#ffd3de;--r:3deg}
.lake-bubble--pow{--paper:#ffe14d;--r:-5deg}
.lake-bubble__in{position:relative;display:block;padding:9px 16px 10px;border:3px solid var(--ink);border-radius:20px 22px 20px 8px;
  background:radial-gradient(rgba(20,17,15,.16) 1px,transparent 1.4px) 0 0/6px 6px,var(--paper);color:var(--ink);
  font:800 clamp(15px,1.45vw,21px)/1 var(--font-head,"Figtree",sans-serif);letter-spacing:.01em;white-space:nowrap;
  box-shadow:4px 5px 0 var(--ink)}
.lake-bubble__in:after{content:"";position:absolute;left:20px;bottom:-13px;width:16px;height:16px;background:var(--paper);
  border-right:3px solid var(--ink);border-bottom:3px solid var(--ink);transform:skewX(28deg) rotate(45deg);transform-origin:0 0;border-bottom-right-radius:3px}
.lake-bubble--pow .lake-bubble__in{border-radius:6px 24px 6px 24px;font-size:clamp(20px,2.2vw,32px);letter-spacing:.04em;text-transform:uppercase}
.lake-bubble i{display:inline-block;font-style:normal;animation:bubHop 1.3s ease-in-out infinite;animation-delay:calc(var(--i) * 65ms)}
@keyframes bubHop{0%,60%,100%{transform:translateY(0) rotate(0)}30%{transform:translateY(-3px) rotate(-4deg)}45%{transform:translateY(-1px) rotate(3deg)}}
@media(prefers-reduced-motion:reduce){.lake-bubble i{animation:none}.lake-bubble{transition:opacity .15s}}
`;
    document.head.appendChild(st);
  })();
  function makeBubble(cls) {
    const el = document.createElement("div");
    el.className = "lake-bubble " + cls;
    el.setAttribute("aria-hidden", "true");
    hero.appendChild(el);
    return { el, text: "", on: false };
  }
  function setBubble(b, text) {
    if (b.text === text) return;
    b.text = text;
    el_clear(b.el);
    const inner = document.createElement("span");
    inner.className = "lake-bubble__in";
    Array.from(text).forEach((ch, i) => {
      const c = document.createElement("i");
      c.textContent = ch === " " ? " " : ch;
      c.style.setProperty("--i", i);
      inner.appendChild(c);
    });
    b.el.appendChild(inner);
  }
  function el_clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }
  const bubSid = makeBubble("lake-bubble--sid");
  const bubCat = makeBubble("lake-bubble--cat");
  const bubPow = makeBubble("lake-bubble--pow");
  const bubV = new THREE.Vector3();
  function placeBubble(b, x, y, z, on) {
    if (on !== b.on) {
      b.on = on;
      b.el.classList.toggle("is-on", on);
    }
    if (!on) return;
    bubV.set(x, y, z).project(camera);
    const r = renderer.domElement.getBoundingClientRect();
    const h = hero.getBoundingClientRect();
    const w = b.el.offsetWidth || 160;
    const px = Math.max(w / 2 + 12, Math.min(h.width - w / 2 - 12, r.left - h.left + ((bubV.x + 1) / 2) * r.width));
    const py = Math.max(96 + (b.el.offsetHeight || 44), r.top - h.top + ((1 - bubV.y) / 2) * r.height);
    b.el.style.left = px.toFixed(1) + "px";
    b.el.style.top = py.toFixed(1) + "px";
  }
  const bubAward = makeBubble("lake-bubble--pow");
  bubAward.el.style.setProperty("--paper", "#bdf3ff");
  let awardUntil = 0;
  let awardHit = null;
  let hoveredPad = null;
  let _padT = null;
  function padTargets() {
    if (!_padT) _padT = [...leaves.map((l) => l.mesh), ...flowers.map((f) => f.group)];
    return _padT;
  }
  let catDrinkUntil = 0;
  let catHoverSince = 0;
  let powUntil = 0;

  /* ── A RIPPLE THAT TRAVELS ────────────────────────────────────────────────
     Sid: "when I click on the water let me make a ripple that moves and
     interacts with things on screen." A click starts a wavefront that
     actually expands across the lake; everything it passes gets a push or a
     bob at the moment the front reaches it, so the lake answers in order. */
  const waveGeo = new THREE.RingGeometry(0.965, 1, 96);
  waveGeo.rotateX(-Math.PI / 2);
  const waves = [];
  function startWave(x, z) {
    const meshes = [1, 0.78, 0.56].map((k, i) => {
      const m = new THREE.Mesh(waveGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
      m.position.set(x, 0.02 + i * 0.001, z);
      m.scale.setScalar(0.01);
      scene.add(m);
      return { m, k };
    });
    waves.push({ x, z, t: 0, meshes, hit: new Set() });
    if (waves.length > 4) {
      const old = waves.shift();
      old.meshes.forEach(({ m }) => {
        scene.remove(m);
        m.material.dispose();
      });
    }
  }
  let catBob = 0,
    figBob = 0;
  function updateWaves(dt) {
    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i];
      w.t += dt;
      const R = w.t * 2.6;
      const life = w.t / 3.4;
      w.meshes.forEach(({ m, k }, j) => {
        const r = Math.max(0.01, R * k);
        m.scale.setScalar(r);
        m.material.opacity = Math.max(0, 0.5 * (1 - life) * (1 - life)) * (j === 0 ? 1 : 0.55);
      });
      const gain = 1 / (1 + R * 0.28);
      const reach = (px, pz, item, fn) => {
        if (w.hit.has(item)) return;
        if (Math.hypot(px - w.x, pz - w.z) <= R) {
          w.hit.add(item);
          const dx = px - w.x,
            dz = pz - w.z,
            d = Math.max(0.08, Math.hypot(dx, dz));
          fn(dx / d, dz / d);
        }
      };
      for (const lf of leaves)
        reach(lf.mesh.position.x, lf.mesh.position.z, lf, (nx, nz) => {
          lf.vx += nx * 2.4 * gain;
          lf.vz += nz * 2.4 * gain;
        });
      for (const f of flowers)
        reach(f.group.position.x, f.group.position.z, f, (nx, nz) => {
          f.vx += nx * 1.9 * gain;
          f.vz += nz * 1.9 * gain;
        });
      for (const f of fish)
        if (f.group.visible)
          reach(f.group.position.x, f.group.position.z, f, () => {
            f.avoid = Math.max(f.avoid, 0.8);
          });
      for (const a of awards)
        reach(a.group.position.x, a.group.position.z, a, () => {
          a.tap = Math.max(a.tap, 0.9 * Math.min(1, gain * 2.2));
        });
      reach(cat.position.x, cat.position.z, cat, () => {
        catBob = 1;
      });
      if (figure)
        reach(figure.position.x, figure.position.z, figure, () => {
          figBob = 1;
        });
      if (world)
        for (const l of letters)
          if (l.body && !l.wet)
            reach(l.mesh.position.x, l.mesh.position.z, l, () => {
              const b = l.body;
              const m = b.mass();
              b.wakeUp();
              b.applyImpulse({ x: 0, y: m * 0.55 * gain * 3, z: 0 }, true);
              b.applyTorqueImpulse({ x: 0, y: (Math.random() - 0.5) * m * 0.02, z: 0 }, true);
              l.touched = performance.now();
              l.homing = false;
            });
      if (w.t > 3.4) {
        w.meshes.forEach(({ m }) => {
          scene.remove(m);
          m.material.dispose();
        });
        waves.splice(i, 1);
      }
    }
    catBob *= 0.9;
    figBob *= 0.9;
  }

  /* ── CUBE GUY, INTO PIXELS AND BACK ───────────────────────────────────────
     Sid: "when I click on cube guy let him explode across the scene into 3D
     pixels and then come back together." Points are sampled from the live
     skinned surface (colour from its texture), flown out with a little drag
     and gravity, bounced on the water, then pulled home by a spring. */
  const PIX_N = 1300;
  const pixGeo = new THREE.BoxGeometry(1, 1, 1);
  const pixMat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.04 });
  const pix = new THREE.InstancedMesh(pixGeo, pixMat, PIX_N);
  pix.visible = false;
  pix.frustumCulled = false;
  pix.castShadow = true;
  scene.add(pix);
  const pixData = [];
  let blast = null;
  const _p = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const _c = new THREE.Color();
  const _m4 = new THREE.Matrix4();
  const _q = new THREE.Quaternion();
  const _e = new THREE.Euler();
  const _s = new THREE.Vector3();
  const texCache = new Map();
  function texPixels(map) {
    if (texCache.has(map)) return texCache.get(map);
    let out = null;
    try {
      const img = map.image;
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.drawImage(img, 0, 0, 64, 64);
      out = g.getImageData(0, 0, 64, 64).data;
    } catch (_) {}
    texCache.set(map, out);
    return out;
  }
  function samplePixels() {
    const meshes = [];
    figure.updateMatrixWorld(true);
    figure.traverse((o) => {
      if (o.isMesh && o.geometry && o.geometry.attributes.position && o.visible) meshes.push(o);
    });
    if (!meshes.length) return false;
    const tris = meshes.map((o) => (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3);
    const total = tris.reduce((a, b) => a + b, 0);
    pixData.length = 0;
    const center = new THREE.Vector3(figure.position.x, figure.position.y + 0.8, figure.position.z);
    for (let n = 0; n < PIX_N; n++) {
      let pick = Math.random() * total,
        mi = 0;
      while (mi < meshes.length - 1 && pick >= tris[mi]) pick -= tris[mi++];
      const o = meshes[mi];
      const tri = Math.floor(pick);
      const idx = o.geometry.index;
      const ids = [0, 1, 2].map((k) => (idx ? idx.getX(tri * 3 + k) : tri * 3 + k));
      ids.forEach((id, k) => {
        o.getVertexPosition(id, _p[k]);
        _p[k].applyMatrix4(o.matrixWorld);
      });
      let u = Math.random(),
        v = Math.random();
      if (u + v > 1) {
        u = 1 - u;
        v = 1 - v;
      }
      const pos = new THREE.Vector3()
        .copy(_p[0])
        .multiplyScalar(1 - u - v)
        .addScaledVector(_p[1], u)
        .addScaledVector(_p[2], v);
      const mat = Array.isArray(o.material) ? o.material[0] : o.material;
      _c.set(0xdddddd);
      if (mat && mat.color) _c.copy(mat.color);
      if (mat && mat.map) {
        const uv = o.geometry.attributes.uv;
        const data = uv && texPixels(mat.map);
        if (data) {
          const tu = uv.getX(ids[0]) * (1 - u - v) + uv.getX(ids[1]) * u + uv.getX(ids[2]) * v;
          const tv = uv.getY(ids[0]) * (1 - u - v) + uv.getY(ids[1]) * u + uv.getY(ids[2]) * v;
          const x = Math.max(0, Math.min(63, Math.floor((((tu % 1) + 1) % 1) * 64)));
          const y = Math.max(0, Math.min(63, Math.floor((mat.map.flipY ? 1 - (((tv % 1) + 1) % 1) : ((tv % 1) + 1) % 1) * 64)));
          const k = (y * 64 + x) * 4;
          _c.setRGB(data[k] / 255, data[k + 1] / 255, data[k + 2] / 255, THREE.SRGBColorSpace);
        }
      }
      pix.setColorAt(n, _c);
      const away = pos.clone().sub(center);
      const dist = Math.max(0.2, away.length());
      away.normalize();
      const sp = 3 + Math.random() * 7;
      pixData.push({
        home: pos,
        p: pos.clone(),
        v: new THREE.Vector3(
          away.x * sp + (Math.random() - 0.5) * 2,
          1.2 + Math.random() * 3 + away.y * 1.2,
          away.z * sp * 0.9 + (Math.random() - 0.2) * 2.2
        ),
        spin: new THREE.Vector3(Math.random() * 7 - 3.5, Math.random() * 7 - 3.5, Math.random() * 7 - 3.5),
        rot: new THREE.Vector3(Math.random() * 6, Math.random() * 6, 0),
        size: 0.035 + Math.random() * 0.03,
        delay: Math.random() * 0.55 + (1 - Math.min(1, dist / 1.6)) * 0.15,
        wet: false,
      });
    }
    pix.instanceColor.needsUpdate = true;
    return true;
  }
  function explodeFigure(bounds) {
    if (!figure || blast) return false;
    if (!samplePixels()) return false;
    blast = { t: 0, returned: false, splashAt: 0 };
    busy = true;
    if (mixer) mixer.timeScale = 0;
    figure.visible = false;
    pix.visible = true;
    powUntil = performance.now() + 1100;
    splash(figure.position.x, figure.position.z + 0.2, 0.5);
    startWave(figure.position.x, figure.position.z + 0.3);
    return true;
  }
  function updateBlast(dt) {
    if (!blast) return;
    blast.t += dt;
    const T = blast.t;
    const BACK = 2.15;
    let settled = 0;
    for (let i = 0; i < pixData.length; i++) {
      const d = pixData[i];
      if (T < BACK + d.delay) {
        d.v.y -= 4.2 * dt;
        const drag = Math.max(0, 1 - 0.7 * dt);
        d.v.x *= drag;
        d.v.z *= drag;
        d.p.addScaledVector(d.v, dt);
        if (d.p.y < 0.04) {
          d.p.y = 0.04;
          if (d.v.y < -0.8 && !d.wet && T - blast.splashAt > 0.09) {
            splash(d.p.x, d.p.z, 0.12);
            blast.splashAt = T;
          }
          d.wet = true;
          d.v.y *= -0.28;
          d.v.x *= 0.78;
          d.v.z *= 0.78;
        }
        d.rot.x += d.spin.x * dt;
        d.rot.y += d.spin.y * dt;
        d.rot.z += d.spin.z * dt;
      } else {
        /* the spring: critically damped, so they arrive without overshoot */
        const k = 70,
          c = 2 * Math.sqrt(k) * 0.92;
        d.v.x += ((d.home.x - d.p.x) * k - d.v.x * c) * dt;
        d.v.y += ((d.home.y - d.p.y) * k - d.v.y * c) * dt;
        d.v.z += ((d.home.z - d.p.z) * k - d.v.z * c) * dt;
        d.p.addScaledVector(d.v, dt);
        d.rot.multiplyScalar(Math.max(0, 1 - 6 * dt));
        if (d.p.distanceToSquared(d.home) < 0.0004) settled++;
      }
      _e.set(d.rot.x, d.rot.y, d.rot.z);
      _q.setFromEuler(_e);
      const sc = d.size * (1 + (T > BACK ? Math.max(0, 1 - (T - BACK) / 1.1) * 0.5 : 0));
      _s.setScalar(sc);
      _m4.compose(d.p, _q, _s);
      pix.setMatrixAt(i, _m4);
    }
    pix.instanceMatrix.needsUpdate = true;
    if (!blast.returned && T > BACK && (settled > pixData.length * 0.96 || T > BACK + 1.9)) {
      blast.returned = true;
      figure.visible = true;
      pix.visible = false;
      if (mixer) mixer.timeScale = 1;
      figBob = 1;
      splash(figure.position.x, figure.position.z + 0.2, 0.3);
      play("Wave", 1, () => {
        play("Idle");
        busy = false;
      });
      blast = null;
    }
  }

  /* Small read-only probe for repeatable interaction QA. It keeps test code
     out of scene internals while exposing only projected hit positions and
     current hover state. */
  function screenPoint(object) {
    const point = new THREE.Vector3();
    object.getWorldPosition(point);
    point.project(camera);
    const bounds = renderer.domElement.getBoundingClientRect();
    return {
      x: bounds.left + ((point.x + 1) / 2) * bounds.width,
      y: bounds.top + ((1 - point.y) / 2) * bounds.height,
    };
  }
  window.__lakeQA = () => ({
    fish: fish.filter((item) => item.group.visible).map((item) => ({ ...screenPoint(item.body), flee: item.flee, note: item.note })),
    figure: figure ? screenPoint(figure) : null,
    cat: screenPoint(cat),
    exploding: !!blast,
    figureHover,
    auraOpacity: figureAura.map((item) => item.mat.opacity),
  });

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
      const awardHits = ray.intersectObjects(awardTargets, true);
      hoveredAward = awardHits.length ? awardFor(awardHits[0].object) : null;
      const fishHits = ray.intersectObjects(fishTargets, false);
      const nextFish = fishHits.length ? fishFor(fishHits[0].object) : null;
      if (nextFish && nextFish !== hoveredFish && !nextFish.flee && nextFish.group.visible) {
        nextFish.flee = 1;
        nextFish.speed = Math.abs(nextFish.speed) * (nextFish.group.position.x >= fishHits[0].point.x ? 1 : -1);
        leaveNote(e, nextFish.note, nextFish.phase);
        splash(nextFish.group.position.x, nextFish.group.position.z, 0.16);
      }
      hoveredFish = nextFish;
      /* Lily pads and blossoms answer a hover too: a ring and a nudge away. */
      {
        const padHit = ray.intersectObjects(padTargets(), true);
        const pad = padHit.length ? padHit[0].object : null;
        let root = pad;
        while (root && root.parent && root.parent !== scene) root = root.parent;
        if (root && root !== hoveredPad) {
          const px = root.position.x,
            pz = root.position.z;
          splash(px, pz, 0.16);
          const lf = leaves.find((l) => l.mesh === root) || flowers.find((f) => f.group === root);
          if (lf) {
            const dx = px - padHit[0].point.x,
              dz = pz - padHit[0].point.z,
              d = Math.max(0.05, Math.hypot(dx, dz));
            lf.vx += (dx / d) * 1.3;
            lf.vz += (dz / d) * 1.3;
          }
        }
        hoveredPad = root;
      }
      if (of && !overFigure && !busy) play("Look", 1, () => play("Idle"));
      /* Sid: "when hover on cube he glows but let it say hey im sid and
         then an audio button which plays my name pronunciation." The glow
         already existed (figureLight/figureHover below). This adds the
         other two: a one-line note on hover-in, reusing the same glyph
         leaveNote already draws for the fish, and a nudge on the real
         pronunciation button (#hero-say) rather than a second audio
         system -- it already plays on click and already owns the
         discoverability animation via .is-new, so hovering the figure
         just asks for that same attention instead of inventing a new one. */
      if (of && !overFigure) {
        /* Once pressed, the nudge is retired for good (name-say.js's own
           rule) -- a figure hover must not bring it back. */
        if (sayBtn && !heardName()) sayBtn.classList.add("is-new");
      }
      if (oc && !overCat) catHoverSince = performance.now();
      overFigure = of;
      overCat = oc;
      host.style.cursor = hovered || of || oc || hoveredAward || hoveredFish ? "pointer" : "";
    },
    { passive: true }
  );
  hero.addEventListener("pointerleave", () => {
    hasPointer = false;
    hovered = null;
    overCat = false;
    hoveredAward = null;
    hoveredFish = null;
    host.style.cursor = "";
  });
  hero.addEventListener("pointerdown", (e) => {
    if (e.target instanceof Element && e.target.closest("a, button")) return;
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
    const awardHits = ray.intersectObjects(awardTargets, true);
    if (awardHits.length) {
      const award = awardFor(awardHits[0].object);
      if (award) {
        award.tap = 1;
        award.flash = 1;
        award.sweep = 1;
        award.sweepSpeed = 2.6;
        awardHit = award;
        awardUntil = performance.now() + 1100;
        splash(award.group.position.x, award.group.position.z, 0.34);
        if (!prefersLess) startWave(award.group.position.x, award.group.position.z);
        e.preventDefault();
        return;
      }
    }
    if (ray.intersectObject(cat, true).length) {
      if (performance.now() >= catDrinkUntil) catHoverSince = performance.now();
      catDrinkUntil = performance.now() + 3600;
      return;
    }
    if (figure && ray.intersectObject(figure, true).length && !busy) {
      if (!prefersLess && explodeFigure()) return;
      busy = true;
      play("ClickReact", 1, () => {
        play("Idle");
        busy = false;
      });
      return;
    }
    /* The water itself is responsive. One ring is cheaper and clearer than
       another decorative object or a second post-processing pass. */
    if (ray.ray.intersectPlane(lightPlane, hit)) {
      splash(hit.x, hit.z, 0.24);
      if (!prefersLess) startWave(hit.x, hit.z);
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
  let renderTick = 0;
  let resizeDirty = true;
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
    if (!resizeDirty) return;
    resizeDirty = false;
    const r = host.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)),
      h = Math.max(1, Math.round(r.height));
    if (renderer.domElement.width !== w * renderer.getPixelRatio() || renderer.domElement.height !== h * renderer.getPixelRatio()) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      /* Portrait screens otherwise crop the shared stone between the second
         award and the cat. A wider lens keeps the complete little tableau in
         view instead of turning mobile into a random detail crop. */
      const portrait = w / h < 0.72;
      camera.fov = portrait ? 60 : 38;
      baseLookX = portrait ? 0.38 : 0;
      camera.lookAt(baseLookX, 0.18, 0.55);
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
  /* Reading getBoundingClientRect() inside every render frame forced Chrome
     to synchronously lay out the whole hero whenever another animation had
     invalidated styles. DevTools measured 132ms of forced reflow on a single
     load. ResizeObserver turns that read into actual geometry work instead
     of a permanent tax on the water loop. */
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      resizeDirty = true;
    }).observe(host);
  } else {
    window.addEventListener(
      "resize",
      () => {
        resizeDirty = true;
      },
      { passive: true }
    );
  }
  let skyTexture = null;
  let mirrorSky = null;
  function makeSkyTexture(light) {
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (light) {
      gradient.addColorStop(0, "#3f9fc9");
      gradient.addColorStop(0.48, "#7dc4dd");
      gradient.addColorStop(1, "#c4e7ee");
    } else {
      gradient.addColorStop(0, "#030b18");
      gradient.addColorStop(0.55, "#092744");
      gradient.addColorStop(1, "#164866");
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
    /* The reflection pass is switched off for speed, which left the water's
       mirror texture blank, and a blank mirror is why the surface read as flat
       grey instead of picking up the sky. Feeding it the sky gradient gives
       the reflection something to show at no render cost. */
    if (water.material.uniforms.mirrorSampler) {
      /* The hero type and buttons are set in white on the water in both
         themes, so even the daylight lake reflects the deeper sky: a pale
         reflection washed the headline out. */
      if (mirrorSky) mirrorSky.dispose();
      mirrorSky = makeSkyTexture(false);
      water.material.uniforms.mirrorSampler.value = mirrorSky;
    }
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
    hemi.intensity = isLight() ? 0.6 : 0.48;
    fill.intensity = isLight() ? 0.38 : 0.22;
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
    governDpr(stamp);
    const scrollState = window.__sv ? window.__sv() : null;
    const pageMoving = !!scrollState && scrollState.a > 0.035;
    /* The water is a slow surface, not a game camera. Cap it at 20fps while
       scrolling, 24fps at rest, and 30fps during direct interaction. DOM
       input stays at native cadence. */
    const frameGap = pageMoving ? 80 : hasPointer ? 42 : 66;
    if (stamp - lastRenderMs < frameGap) return;
    lastRenderMs = stamp;
    /* The cursor is not changing the composition while a wheel gesture owns
       it. Reuse the last soft shadow instead of rebuilding the shadow map on
       every scrolling water frame; auto-update resumes as soon as it rests. */
    renderTick++;
    renderer.shadowMap.autoUpdate = false;
    if (!pageMoving && renderTick % (hasPointer ? 8 : 24) === 0) renderer.shadowMap.needsUpdate = true;
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.elapsedTime;
    const introAge = introStart ? Math.max(0, (stamp - introStart) / 1000) : 0;
    const arrive = (delay, duration) => {
      if (introAge >= 2.4) return 1;
      const p = Math.max(0, Math.min(1, (introAge - delay) / duration));
      return 1 - Math.pow(1 - p, 4);
    };
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
    const keyLevel = daylight ? (hasPointer ? 54 : 38) : hasPointer ? 104 : 72;
    const cursorLevel = daylight ? (hasPointer ? 8 : 1.5) : hasPointer ? 28 : 5;
    key.intensity += (keyLevel - key.intensity) * 0.09;
    cursorLight.position.set(lightAim.x, 0.95, lightAim.z);
    cursorLight.intensity += (cursorLevel - cursorLight.intensity) * 0.1;
    hoverGlow.position.x = lightAim.x;
    hoverGlow.position.z = lightAim.z;
    const glowLevel = daylight ? (hasPointer ? 0.46 : 0.07) : hasPointer ? 0.88 : 0.15;
    hoverGlow.material.uniforms.uOpacity.value += (glowLevel - hoverGlow.material.uniforms.uOpacity.value) * 0.09;
    const glowPulse = 1 + Math.sin(t * 1.15) * 0.025;
    hoverGlow.scale.set(2.15 * glowPulse, 1.3 * glowPulse, 1);
    tmpV.copy(key.position).sub(key.target.position).normalize();
    water.material.uniforms.sunDirection.value.copy(tmpV);
    water.material.uniforms.time.value += dt * 0.38;

    let stageWake = 0;
    for (const a of awards) {
      /* Let the plaques behave like objects carried by the same slow surface
         current. They begin and reset beyond the camera frustum, so the loop
         is never visible: each one enters from open water, crosses without an
         artificial ease or turnaround, and leaves completely on the far side.
         A shared crossing time keeps the pair from overtaking one another. */
      const crossing = (t / 34 + a.travelOffset) % 1;
      const currentX = THREE.MathUtils.lerp(-8.4, 8.4, crossing);
      a.hover += ((a === hoveredAward ? 1 : 0) - a.hover) * 0.14;
      a.tap += (0 - a.tap) * 0.1;
      /* The shine: a band sweeps the face while it is hovered, and a hard,
         fast one with a flash goes across when it is pressed. */
      if (a.hover > 0.5 && a.sweep <= 0) {
        a.sweep = 1;
        a.sweepSpeed = 1;
      }
      if (a.sweep > 0) a.sweep = Math.max(0, a.sweep - (dt * a.sweepSpeed) / 1.5);
      a.flash *= 0.92;
      a.sheen.uniforms.uPos.value = -0.45 + (1 - a.sweep) * 2.1;
      a.sheen.uniforms.uAmt.value = (a.sweep > 0 ? 0.35 + a.hover * 0.55 : 0) + a.flash * 1.1;
      a.sheen.uniforms.uTime.value = t;
      a.trim.material.opacity = 0.74 + a.hover * 0.26;
      a.group.position.x = currentX + Math.sin(t * 0.19 + a.phase) * 0.08;
      a.group.position.y =
        0.07 - Math.sin(t * (0.42 + a.phase * 0.04) + a.phase) * 0.026 + a.hover * 0.09 + Math.sin(t * 9 + a.phase) * a.tap * 0.018;
      const openWaterZ = a.z + Math.sin(t * 0.13 + a.phase * 1.7) * 0.16;
      /* The stone is an elliptical obstacle, not scenery the plaques can
         ghost through. As a float enters its wake it is carried around the
         near edge, rolls slightly, then settles back into the current. */
      const stoneDx = (a.group.position.x - 2.55) / 2.6;
      const stoneDz = (openWaterZ + 1.4) / 1.55;
      const stoneDistance = Math.hypot(stoneDx, stoneDz);
      const stoneDeflect = stoneDistance < 1 ? (1 - stoneDistance) * (stoneDz >= 0 ? 2.15 : -2.15) : 0;
      stageWake = Math.max(stageWake, Math.max(0, 1 - stoneDistance));
      a.group.position.z = openWaterZ + stoneDeflect;
      a.group.rotation.x = Math.sin(t * 0.28 + a.phase) * 0.045 + a.hover * 0.035;
      a.group.rotation.y = Math.sin(t * 0.11 + a.phase * 1.4) * 0.08;
      a.group.rotation.z =
        Math.sin(t * 0.16 + a.phase * 0.7) * 0.055 + stoneDeflect * 0.12 + Math.sin(a.phase) * a.hover * 0.028 + Math.sin(t * 8) * a.tap * 0.045;
      a.group.scale.setScalar(1 + a.hover * 0.06 + a.flash * 0.05);

      /* Nearby floating objects receive a small radial impulse. Spring and
         drag below return them to their composition after the plaque passes. */
      for (const lf of leaves) {
        const dx = lf.mesh.position.x - a.group.position.x;
        const dz = lf.mesh.position.z - a.group.position.z;
        const distance = Math.max(0.08, Math.hypot(dx, dz));
        if (distance < 1.18) {
          const impulse = (1.18 - distance) * 3.1 * dt;
          lf.vx += (dx / distance) * impulse;
          lf.vz += (dz / distance) * impulse;
        }
      }
      for (const f of flowers) {
        const dx = f.group.position.x - a.group.position.x;
        const dz = f.group.position.z - a.group.position.z;
        const distance = Math.max(0.08, Math.hypot(dx, dz));
        if (distance < 1.08) {
          const impulse = (1.08 - distance) * 2.6 * dt;
          f.vx += (dx / distance) * impulse;
          f.vz += (dz / distance) * impulse;
        }
      }
      for (const f of fish) {
        if (!f.group.visible) continue;
        const dx = f.group.position.x - a.group.position.x;
        const dz = f.group.position.z - a.group.position.z;
        const distance = Math.hypot(dx, dz);
        if (distance < 1.35) {
          f.avoid = Math.max(f.avoid, 1 - distance / 1.35);
          f.avoidDir = dz >= 0 ? 1 : -1;
        }
      }
    }
    stone.scale.set(1 + stageWake * 0.025, 1 - stageWake * 0.035, 0.78 + stageWake * 0.02);
    for (const lf of leaves) {
      const leafIn = arrive(0.68 + lf.phase * 0.025, 0.76);
      lf.vx += -lf.ox * 3.8 * dt;
      lf.vz += -lf.oz * 3.8 * dt;
      const leafDrag = Math.exp(-3.2 * dt);
      lf.vx *= leafDrag;
      lf.vz *= leafDrag;
      lf.ox += lf.vx * dt;
      lf.oz += lf.vz * dt;
      lf.mesh.position.x = lf.x + lf.ox;
      lf.mesh.position.z = lf.z + lf.oz;
      lf.mesh.position.y = 0.012 + Math.sin(t * 0.7 + lf.phase) * 0.006;
      lf.mesh.rotation.x = Math.sin(t * 0.5 + lf.phase) * lf.tilt;
      lf.mesh.rotation.z = Math.cos(t * 0.4 + lf.phase * 1.3) * lf.tilt + lf.vx * 0.2;
      lf.mesh.scale.setScalar(0.64 + leafIn * 0.36);
    }
    for (const f of flowers) {
      const flowerIn = arrive(0.78 + f.phase * 0.035, 0.68);
      f.vx += -f.ox * 4.2 * dt;
      f.vz += -f.oz * 4.2 * dt;
      const flowerDrag = Math.exp(-3.6 * dt);
      f.vx *= flowerDrag;
      f.vz *= flowerDrag;
      f.ox += f.vx * dt;
      f.oz += f.vz * dt;
      f.group.position.x = f.x + f.ox;
      f.group.position.z = f.z + f.oz;
      f.group.position.y = 0.035 + Math.sin(t * 0.7 + f.phase) * 0.007;
      f.group.rotation.z = Math.sin(t * 0.36 + f.phase) * 0.025 + f.vx * 0.18;
      f.group.scale.setScalar(f.scale * (0.45 + flowerIn * 0.55));
    }
    for (const r of reeds) {
      const reedIn = arrive(0.72 + r.phase * 0.08, 0.78);
      r.group.rotation.z = Math.sin(t * 0.42 + r.phase) * 0.025;
      r.group.scale.set(0.7 + reedIn * 0.3, 0.4 + reedIn * 0.6, 0.7 + reedIn * 0.3);
    }
    for (const f of fish) {
      if (!f.group.visible) {
        if (t < f.hiddenUntil) continue;
        f.x = f.speed > 0 ? -7.6 : 7.6;
        f.flee = 0;
        f.group.visible = true;
      }
      f.avoid *= Math.exp(-2.4 * dt);
      const pace = f.flee ? 5.4 : 1 + f.avoid * 1.9;
      f.x += f.speed * pace * dt;
      if (Math.abs(f.x) > 8.1) {
        if (f.flee) {
          f.group.visible = false;
          f.hiddenUntil = t + 2.2 + f.phase * 0.35;
          continue;
        }
        f.x = f.speed > 0 ? -8 : 8;
      }
      f.group.position.x = f.x;
      f.group.position.y = 0.035 + Math.sin(t * 1.25 + f.phase) * 0.012;
      f.group.position.z = f.z + Math.sin(t * 0.48 + f.phase) * 0.34 + f.avoidDir * f.avoid * 0.7;
      f.group.rotation.y = (f.speed > 0 ? Math.PI / 2 : -Math.PI / 2) + Math.sin(t * 0.34 + f.phase) * 0.12 + f.avoidDir * f.avoid * 0.28;
      f.tailPivot.rotation.y = Math.sin(t * (f.flee ? 14 : 5.2) + f.phase) * (f.flee ? 0.72 : 0.34);
      const fishScale = (0.74 + f.phase * 0.06) * (f.flee ? 0.88 : 1);
      f.group.scale.setScalar(fishScale);
    }

    const drinking = overCat || performance.now() < catDrinkUntil;
    catHover += ((drinking ? 1 : 0) - catHover) * 0.12;
    figureHover += ((overFigure ? 1 : 0) - figureHover) * 0.12;
    if (figure) {
      const figureIn = arrive(0.08, 0.82);
      figure.scale.setScalar(figureScale * (0.76 + figureIn * 0.24) * (1 + figureHover * 0.075));
      figure.rotation.y = -0.35 + figureHover * ndc.x * 0.12 + stageWake * 0.09;
      figure.position.y = 0.18 - (1 - figureIn) * 0.16 + figureHover * (0.045 + Math.sin(t * 3.2) * 0.012) + stageWake * 0.025;
    }
    figureLight.intensity += ((overFigure ? (daylight ? 7 : 14) : 0) - figureLight.intensity) * 0.12;
    for (const aura of figureAura) {
      const wave = (t * 0.72 + aura.phase) % 1;
      aura.ring.scale.setScalar(0.92 + wave * 1.15);
      aura.mat.opacity = figureHover * (1 - wave) * (daylight ? 0.2 : 0.34);
    }
    for (const entry of figureMats) {
      entry.mat.emissive.copy(entry.color).lerp(figureGlowColor, figureHover * 0.42);
      entry.mat.emissiveIntensity = entry.intensity + figureHover * 0.38;
    }
    const catIn = arrive(0.24, 0.78);
    cat.scale.setScalar(1.12 * (0.72 + catIn * 0.28));
    cat.position.y = 0.17 - (1 - catIn) * 0.12 + stageWake * 0.018;
    cat.rotation.z = -stageWake * 0.05;
    const idleSip = Math.pow(Math.max(0, Math.sin(t * 0.62)), 7) * (1 - catHover);
    /* Drinking for real: the head dips past the stone's lip to the water, the
       tongue laps in time, and each lap puts a small ring where it touches. */
    const lap = Math.sin(t * 9);
    const drink = Math.max(idleSip, catHover);
    catHeadPivot.rotation.x = 0.7 + idleSip * 0.5 + catHover * (0.62 + lap * 0.07);
    catHeadPivot.position.y = 0.4 - catHover * 0.2 - idleSip * 0.06;
    catHeadPivot.position.z = 0.28 + catHover * 0.2 + idleSip * 0.05;
    catBody.rotation.x = 0.2 + catHover * 0.3;
    catBody.scale.y = 1 + Math.sin(t * 1.4) * 0.012 - catHover * 0.05;
    cat.position.y += Math.sin(catBob * 6) * catBob * 0.03;
    catTail.rotation.y = Math.sin(t * (drinking ? 2.2 : 0.48)) * (0.16 + catHover * 0.2);
    tongue.scale.setScalar(catHover * (0.78 + Math.max(0, lap) * 0.3));
    if (drink > 0.7 && t - lastCatSip > (drinking ? 0.42 : 4.5)) {
      catHeadPivot.getWorldPosition(tmpV);
      splash(tmpV.x, cat.position.z + 0.85, drinking ? 0.1 : 0.18);
      lastCatSip = t;
    }
    updateWaves(dt);
    updateBlast(dt);
    if (figure && figure.visible) figure.position.y += Math.sin(figBob * 6) * figBob * 0.035;
    {
      const nowMs = performance.now();
      const sidOn = (overFigure && !blast) || false;
      if (sidOn) setBubble(bubSid, "Hey, I'm Sid!");
      placeBubble(bubSid, figure ? figure.position.x : 0, 2.12, figure ? figure.position.z : 0, sidOn);
      const catOn = drinking;
      if (catOn) setBubble(bubCat, nowMs - catHoverSince > 900 ? "Slurp slurp!" : "Gingu is thirsty");
      placeBubble(bubCat, cat.position.x, 1.18, cat.position.z + 0.2, catOn);
      const awardOn = nowMs < awardUntil && !!awardHit;
      if (awardOn) setBubble(bubAward, awardHit.name);
      placeBubble(bubAward, awardHit ? awardHit.group.position.x : 0, 0.55, awardHit ? awardHit.group.position.z : 0, awardOn);
      const powOn = nowMs < powUntil;
      if (powOn) setBubble(bubPow, "Ka-pow!");
      placeBubble(bubPow, figure ? figure.position.x : 0, 1.5, figure ? figure.position.z : 0, powOn);
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

    /* ── CURSOR PARALLAX ─────────────────────────────────────────────────
       The camera was bolted down, so the lake read as a picture. A small,
       heavily damped drift toward where the cursor is makes the island, the
       plaques and the far lily pads slide against each other: depth you can
       feel without anything in the scene being told to move. Fine pointers
       only, off for reduced motion and while the page is scrolling. */
    if (!prefersLess && hasPointer && !pageMoving && matchMedia("(pointer: fine)").matches) {
      camDriftX += (ndc.x * 0.42 - camDriftX) * 0.045;
      camDriftY += (ndc.y * 0.16 - camDriftY) * 0.045;
    } else {
      camDriftX *= 0.94;
      camDriftY *= 0.94;
    }
    if (Math.abs(camDriftX) > 0.0005 || Math.abs(camDriftY) > 0.0005) {
      camera.position.x = camDriftX;
      camera.position.y = 5.35 + camDriftY;
      camera.lookAt(baseLookX + camDriftX * 0.35, 0.18, 0.55);
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
