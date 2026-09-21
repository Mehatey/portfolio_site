/* ═══════════════════════════════════════════════════════════════════════════
   THE CUBE STORY  ·  About Sid, through the cube

   One pinned section on /siddharth/, between the hero and the work. One
   renderer, one loop, one damped progress value 0..1 from the section's
   own scroll. Seven scenes on that clock, each authored to play both ways:

     0.00 - 0.12  GRASS    a white cube with a face on a hill of windblown
                           grain, blue sky, clouds. It breathes. Hey, I'm Sid.
     0.12 - 0.32  UNFOLD   still in the field. Real hinges open the net one
                           face at a time. The faces are kraft card carrying
                           the eye, the brain, and the credentials.
     0.32 - 0.44  THROUGH  the net closes; the camera goes in through the
                           front face. Five clips on the walls. Drag to look.
                           Out through the back.
     0.44 - 0.62  WATER    dusk. The cube drops into a moving river, drifts,
                           and its material runs kraft, clay, water, glass.
     0.62 - 0.80  BODY     a shore with trees by the sea. The figure stands
                           up out of the cube. His tee is an LED screen that
                           types the numbers. A resin cube forms round his
                           head. One close shot.
     0.80 - 0.90  COSMOS   night. Stars. The camera moves into the resin.
     0.90 - 1.00  SCREEN   the head is a screen. Six billboards carry the
                           work and the photographs; then they fold away to
                           a small stroke cube that docks beside the next title.

   SOURCES, and what each gives: cube-of-creation/web-3d (the grass world,
   the river, the resin head, the cosmos), sid-portfolio-source/cube-guy
   (the hinge-tree fold, kraft credentials as surface, the LED tee, the
   screen finale), unfolded-lidar-hero-v1 (the eye and brain panels, the
   interior clips). Nothing pasted; every scene is written to this clock.

   RULES. No shader touches the eye, the brain, a clip or a photograph.
   The body is the rigged cube-guy the site already ships. Reduced motion,
   touch, no WebGL, or no GL budget: return before any context is made and
   the static About block stays.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

(function main() {
  const host = document.getElementById("cube-story");
  if (!host) return;
  const stage = host.querySelector(".cs-stage");
  const captionEl = host.querySelector(".cs-caption");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(hover: none)").matches || innerWidth < 900;
  const budget = !window.SidGL || window.SidGL.claim("cube-story");
  if (reduce || coarse || !budget) return;

  const BASE = host.getAttribute("data-base") || "";
  const A = BASE + "/assets/cube-story/";

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(1.5, devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = "cs-canvas";
  stage.appendChild(renderer.domElement);
  host.classList.add("is-live");

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const sm = (a, b, t) => {
    const x = clamp01((t - a) / (b - a));
    return x * x * (3 - 2 * x);
  };
  const lerp = THREE.MathUtils.lerp;
  const C = (h) => new THREE.Color(h);

  /* ── SCENE, CAMERA, LIGHT ──────────────────────────────────────────── */
  const scene = new THREE.Scene();
  scene.background = C(0xa5c4e6);
  scene.fog = new THREE.Fog(0xb9ccd4, 10, 40);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 140);
  const camRig = new THREE.Group();
  camRig.add(camera);
  scene.add(camRig);
  const hemi = new THREE.HemisphereLight(0xdfe8f4, 0x5a5230, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.4);
  sun.position.set(-4, 6, 5);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x9fc2ff, 0.8);
  rim.position.set(4, 3, 5);
  scene.add(rim);

  /* ── SKY: one dome, colours, clouds and stars driven by the clock ──── */
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      t: { value: 0 },
      zen: { value: C(0x0e4a9e) },
      hor: { value: C(0xa1c7e8) },
      cloud: { value: 0.68 },
      star: { value: 0 },
      sunDir: { value: new THREE.Vector3(-0.55, 0.5, -0.7).normalize() },
      sunCol: { value: C(0xffb857) },
    },
    vertexShader: "varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader: `precision highp float; varying vec3 vP; uniform float t, cloud, star; uniform vec3 zen, hor, sunDir, sunCol;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      void main(){
        float y = clamp(vP.y*0.5+0.5, 0.0, 1.0);
        vec3 col = mix(hor, zen, pow(y, 0.7));
        vec2 q = vP.xz/(0.22+max(vP.y,0.035));
        float c = n(q*1.35+vec2(t*0.008,0.0))*0.62 + n(q*2.8-vec2(t*0.012,0.0))*0.38;
        float mask = smoothstep(0.57,0.76,c)*smoothstep(0.02,0.7,vP.y);
        col = mix(col, vec3(0.94,0.96,0.95), mask*cloud);
        float s = pow(max(0.0, dot(vP, sunDir)), 160.0);
        col += s*sunCol;
        float st = step(0.9985, h(floor(vP.xy*420.0)+floor(vP.z*77.0)))*star*smoothstep(0.0,0.3,vP.y);
        col += st;
        gl_FragColor = vec4(col, 1.0); }`,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(60, 32, 20), skyMat));

  /* ── GRASS WORLD (after cube-of-creation) ──────────────────────────── */
  const field = new THREE.Group();
  scene.add(field);
  const fh = (x, z) => Math.sin(x * 0.19) * 0.38 + Math.sin(z * 0.155 + 0.8) * 0.52 + Math.sin((x + z) * 0.08) * 0.24 - Math.sin(0.8) * 0.52;
  const fieldGeo = new THREE.PlaneGeometry(34, 42, 72, 86);
  {
    const pos = fieldGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, fh(pos.getX(i), -pos.getY(i)));
    pos.needsUpdate = true;
    fieldGeo.computeVertexNormals();
  }
  const ground = new THREE.Mesh(fieldGeo, new THREE.MeshStandardMaterial({ color: 0x8d8b50, roughness: 0.9 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.55;
  field.add(ground);
  const windU = { value: 0 };
  function windy(mat, amt) {
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uT = windU;
      sh.vertexShader =
        "uniform float uT;\n" +
        sh.vertexShader.replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
        float seed = instanceMatrix[3].x*0.43 + instanceMatrix[3].z*0.29;
        transformed.x += uv.y*uv.y*sin(uT*1.2+seed)*${amt};`
        );
    };
    mat.customProgramCacheKey = () => "wind" + amt;
    return mat;
  }
  const M4 = new THREE.Matrix4(),
    Q = new THREE.Quaternion(),
    V3 = new THREE.Vector3(),
    COL = new THREE.Color();
  const grainGeo = new THREE.ConeGeometry(0.026, 1, 5, 1);
  grainGeo.translate(0, 0.5, 0);
  const grain = new THREE.InstancedMesh(grainGeo, windy(new THREE.MeshBasicMaterial({ color: 0xd6b55d }), "0.075"), 430);
  const grassGeo = new THREE.ConeGeometry(0.018, 0.48, 3, 1);
  grassGeo.translate(0, 0.24, 0);
  const grass = new THREE.InstancedMesh(grassGeo, windy(new THREE.MeshBasicMaterial({ color: 0x727d39 }), "0.055"), 1100);
  let planted = 0;
  for (let a = 0; a < 3400 && planted < 430; a++) {
    const x = (Math.random() - 0.5) * 28,
      z = (Math.random() - 0.5) * 34;
    if (x * x + z * z < 8.5 || (z > 0.5 && Math.abs(x) < 4.5)) continue;
    Q.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.08));
    M4.compose(
      V3.set(x, fh(x, z) - 0.55, z),
      Q,
      new THREE.Vector3(0.8 + Math.random() * 0.45, 0.65 + Math.random() * 0.72, 0.8 + Math.random() * 0.45)
    );
    grain.setMatrixAt(planted, M4);
    grain.setColorAt(planted, COL.set(planted % 4 === 0 ? 0x89964e : planted % 3 === 0 ? 0xb69545 : 0xc7a856));
    planted++;
  }
  let blades = 0;
  for (let a = 0; a < 3000 && blades < 1100; a++) {
    const x = (Math.random() - 0.5) * 30,
      z = (Math.random() - 0.5) * 36;
    /* nothing on the camera's path into the cube, so no blade crosses the lens */
    if ((z > 1.5 && Math.abs(x) < 3) || (z > -1.2 && Math.abs(x) < 1.6)) continue;
    Q.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.14));
    M4.compose(
      V3.set(x, fh(x, z) - 0.55, z),
      Q,
      new THREE.Vector3(0.8 + Math.random() * 0.55, 0.6 + Math.random() * 1.15, 0.8 + Math.random() * 0.55)
    );
    grass.setMatrixAt(blades++, M4);
  }
  grass.count = blades;
  grain.instanceMatrix.needsUpdate = grass.instanceMatrix.needsUpdate = true;
  if (grain.instanceColor) grain.instanceColor.needsUpdate = true;
  grain.frustumCulled = grass.frustumCulled = false;
  field.add(grain, grass);

  /* ── THE CUBE: a hinge tree of six plates ──────────────────────────── */
  const NET = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, 1],
    [0, -1],
    [2, 0],
  ];
  function tree(coords) {
    const key = (c) => c[0] + "," + c[1];
    const map = new Map(coords.map((c, i) => [key(c), i]));
    const n = coords.length,
      parent = new Array(n).fill(-1),
      dir = new Array(n).fill(null),
      depth = new Array(n).fill(0),
      order = [];
    const seen = new Set([0]),
      q = [0];
    while (q.length) {
      const i = q.shift();
      order.push(i);
      for (const d of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const j = map.get(key([coords[i][0] + d[0], coords[i][1] + d[1]]));
        if (j === undefined || seen.has(j)) continue;
        seen.add(j);
        parent[j] = i;
        dir[j] = d;
        depth[j] = depth[i] + 1;
        q.push(j);
      }
    }
    return { parent, dir, depth, order, n, maxD: Math.max(...depth) };
  }
  const T = tree(NET);
  const S = 1.0;
  const cube = new THREE.Group();
  scene.add(cube);
  const KRAFT = 0xd9cdb6,
    WHITE = 0xf3f1ea;
  const plateMat = new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.6, metalness: 0, side: THREE.DoubleSide });
  const plateGeo = new THREE.BoxGeometry(S, S, 0.03);
  const faces = [];
  for (let i = 0; i < T.n; i++) {
    const hinge = new THREE.Group(),
      pivot = new THREE.Group(),
      plate = new THREE.Mesh(plateGeo, plateMat.clone());
    pivot.add(plate);
    hinge.add(pivot);
    faces.push({ hinge, pivot, plate });
  }
  for (const i of T.order) {
    const f = faces[i];
    if (T.parent[i] < 0) {
      cube.add(f.hinge);
      continue;
    }
    const d = T.dir[i],
      pp = faces[T.parent[i]].plate.position;
    /* hinge on the far edge of the parent plate; plate half a face past it */
    f.hinge.position.set(pp.x + (d[0] * S) / 2, pp.y + (d[1] * S) / 2, 0);
    f.plate.position.set((d[0] * S) / 2, (d[1] * S) / 2, 0);
    faces[T.parent[i]].pivot.add(f.hinge);
  }
  function setFold(t) {
    for (let i = 0; i < T.n; i++) {
      const f = faces[i];
      if (T.parent[i] < 0) continue;
      const d = T.dir[i];
      const lag = T.depth[i] / (T.maxD + 1);
      const ft = clamp01((t - lag * 0.35) / 0.65);
      const th = ft * ft * (3 - 2 * ft) * (Math.PI / 2);
      f.pivot.rotation.set(0, 0, 0);
      if (d[0] !== 0) f.pivot.rotation.y = d[0] * th;
      else f.pivot.rotation.x = -d[1] * th;
    }
    cube.position.z = 0.5 * S * clamp01(t);
  }

  /* The face: two eyes and a mouth drawn to canvas so it can blink. */
  const faceCan = document.createElement("canvas");
  faceCan.width = faceCan.height = 512;
  const fg = faceCan.getContext("2d");
  const faceTex = new THREE.CanvasTexture(faceCan);
  faceTex.colorSpace = THREE.SRGBColorSpace;
  function drawFace(blink, smile) {
    fg.clearRect(0, 0, 512, 512);
    fg.fillStyle = "#14161c";
    const eh = lerp(58, 4, blink);
    fg.fillRect(180, 210 - eh / 2, 24, eh);
    fg.fillRect(308, 210 - eh / 2, 24, eh);
    fg.fillRect(232, 318, 48, 14);
    if (smile > 0.01) {
      fg.fillRect(212, 306, 20, 14 * smile);
      fg.fillRect(280, 306, 20, 14 * smile);
    }
    faceTex.needsUpdate = true;
  }
  drawFace(0, 0);
  const faceMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(S * 0.96, S * 0.96),
    new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, toneMapped: false })
  );
  faceMesh.position.z = 0.017;
  faces[0].plate.add(faceMesh);

  /* What the other faces carry: photographs with cover UVs on a plain
     material; credentials drawn to canvas. */
  const texLoader = new THREE.TextureLoader();
  function photo(url, w, h) {
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, toneMapped: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    texLoader.load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      const ia = t.image.width / t.image.height,
        pa = w / h;
      if (ia > pa) {
        t.repeat.set(pa / ia, 1);
        t.offset.set((1 - pa / ia) / 2, 0);
      } else {
        t.repeat.set(1, ia / pa);
        t.offset.set(0, (1 - ia / pa) / 2);
      }
      mat.map = t;
      mat.needsUpdate = true;
    });
    return mesh;
  }
  function card(lines, o) {
    o = Object.assign({ font: "600 52px Figtree, sans-serif", ink: "#2b2418", small: "", dark: false, accent: "", accentLine: -1 }, o);
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d");
    g.fillStyle = o.dark ? "#1c1a16" : "#d9cdb6";
    g.fillRect(0, 0, 512, 512);
    const ink = o.dark ? "#f2ead8" : o.ink;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = o.font;
    const lh = 62,
      y0 = 256 - ((lines.length - 1) * lh) / 2;
    lines.forEach((l, i) => {
      g.fillStyle = o.accent && i === o.accentLine ? o.accent : ink;
      g.fillText(l, 256, y0 + i * lh);
    });
    if (o.small) {
      g.fillStyle = ink;
      g.font = "500 20px 'DM Mono', monospace";
      g.globalAlpha = 0.7;
      g.fillText(o.small, 256, 448);
      g.globalAlpha = 1;
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.Mesh(
      new THREE.PlaneGeometry(S * 0.96, S * 0.96),
      new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, toneMapped: false })
    );
  }
  const eye = photo(A + "eye.webp", S * 0.94, S * 0.94);
  const brain = photo(A + "brain.webp", S * 0.94, S * 0.94);
  const creds = [
    card(["OPEN", "TO WORK"], { dark: true, small: "NEW YORK · ANYWHERE" }),
    card(["2×", "WEBBY"], { dark: true, small: "ENCODED · THE MET · 2026", accent: "#f0c419", accentLine: 0 }),
    card(["PRODUCT", "DESIGN"], { small: "RESEARCH TO SHIPPED CODE" }),
    card(["PARSONS", "MFA D+T"], { small: "DESIGN AND TECHNOLOGY" }),
    card(["CREATIVE", "TECH"], { dark: true, small: "GL · UNITY · SWIFT · TS", accent: "#7ad3ff", accentLine: 1 }),
  ];
  const mount = (i, mesh, z = 0.02) => {
    mesh.position.z = z;
    faces[i].plate.add(mesh);
    return mesh;
  };
  mount(1, eye);
  mount(2, brain);
  mount(3, creds[0]);
  mount(4, creds[2]);
  mount(5, creds[1]);
  const backCred = mount(5, creds[4], -0.02);
  backCred.rotation.y = Math.PI;
  const eyeBack = mount(1, creds[3], -0.02);
  eyeBack.rotation.y = Math.PI;

  /* ── THE ROOM (after unfolded-lidar): five clips on the walls ──────── */
  const room = new THREE.Group();
  room.visible = false;
  scene.add(room);
  const R = 2.2;
  room.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(R * 2, R * 2, R * 2),
      new THREE.MeshStandardMaterial({ color: 0x0e1117, roughness: 0.95, side: THREE.BackSide })
    )
  );
  const videos = [];
  const clips = [
    ["interior-space.mp4", 16 / 9],
    ["interior-mesh.mp4", 3024 / 1526],
    ["interior-vp.mp4", 16 / 9],
    ["interior-sid.mp4", 16 / 9],
    ["interior-o2.mp4", 610 / 1078],
  ];
  const wallDefs = [
    [0, 0, -R + 0.02, 0, 0, 0],
    [R - 0.02, 0, 0, 0, -Math.PI / 2, 0],
    [-R + 0.02, 0, 0, 0, Math.PI / 2, 0],
    [0, R - 0.02, 0, Math.PI / 2, 0, 0],
    [0, -R + 0.02, 0, -Math.PI / 2, 0, 0],
  ];
  clips.forEach(([file, ar], i) => {
    const v = document.createElement("video");
    v.src = A + file;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "none";
    const t = new THREE.VideoTexture(v);
    t.colorSpace = THREE.SRGBColorSpace;
    const w = ar >= 1 ? R * 1.5 : R * 1.5 * ar,
      h = ar >= 1 ? (R * 1.5) / ar : R * 1.5;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
    const [x, y, z, rx, ry, rz] = wallDefs[i];
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    room.add(m);
    videos.push(v);
  });
  const wallLight = new THREE.PointLight(0xffffff, 6, 8, 2);
  room.add(wallLight);

  /* ── WATER (after cube-of-creation): a river at dusk ───────────────── */
  const river = new THREE.Group();
  river.visible = false;
  scene.add(river);
  const riverMat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { t: { value: 0 }, op: { value: 1 }, deep: { value: C(0x0b3a52) }, shallow: { value: C(0x2f93a4) }, sky: { value: C(0xffd7a8) } },
    vertexShader: `varying vec2 vUv; varying vec3 vP; uniform float t;
      void main(){ vUv=uv; vec3 p=position; p.z += (sin(p.x*1.7+t*0.9)*0.5+sin(p.y*2.3-t*0.7)*0.35)*0.05; vP=p; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }`,
    fragmentShader: `varying vec2 vUv; varying vec3 vP; uniform float t, op; uniform vec3 deep, shallow, sky;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      void main(){ float d = smoothstep(0.0,1.0,vUv.y); vec3 c = mix(shallow, deep, d*0.85);
        float w = n(vP.xy*2.2 + vec2(t*0.25, -t*0.18))*0.6 + n(vP.xy*5.0 + vec2(-t*0.4, t*0.3))*0.4;
        float crest = smoothstep(0.62, 0.8, w); c = mix(c, sky, crest*0.3*(1.0-d*0.6)); c = mix(c, sky, pow(d,3.0)*0.55);
        gl_FragColor = vec4(c, 0.96*op); }`,
  });
  const riverMesh = new THREE.Mesh(new THREE.PlaneGeometry(60, 60, 100, 100), riverMat);
  riverMesh.rotation.x = -Math.PI / 2;
  riverMesh.position.y = -0.56;
  river.add(riverMesh);

  /* ── SHORE (after cube-guy): trees by the sea ──────────────────────── */
  const shore = new THREE.Group();
  shore.visible = false;
  scene.add(shore);
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshStandardMaterial({ color: 0xc9bea6, roughness: 1 }));
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(0, -0.6, 8);
  shore.add(sand);
  const leafGeo = new THREE.IcosahedronGeometry(0.16, 0);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x8a9a6a, roughness: 0.9 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 1 });
  const treeDefs = [
    [-7, 4, 2.6],
    [-3.5, 7, 3.2],
    [3, 8, 3.6],
    [7.5, 5, 2.9],
    [-11, 10, 4],
    [11, 11, 4.2],
    [0, 13, 4.6],
  ];
  const leaves = new THREE.InstancedMesh(leafGeo, leafMat, treeDefs.length * 60);
  let li = 0;
  treeDefs.forEach(([x, z, r]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, r * 0.9, 6), trunkMat);
    trunk.position.set(x, -0.55 + r * 0.45, z);
    shore.add(trunk);
    for (let k = 0; k < 60; k++) {
      const a = Math.random() * Math.PI * 2,
        b = Math.random() * Math.PI,
        rr = r * (0.55 + Math.random() * 0.45);
      V3.set(x + Math.sin(b) * Math.cos(a) * rr, -0.55 + r * 0.9 + Math.cos(b) * rr * 0.7, z + Math.sin(b) * Math.sin(a) * rr);
      M4.compose(
        V3,
        Q.setFromEuler(new THREE.Euler(Math.random(), Math.random(), Math.random())),
        new THREE.Vector3().setScalar(1.2 + Math.random() * 1.4)
      );
      leaves.setMatrixAt(li, M4);
      leaves.setColorAt(li, COL.set(k % 3 === 0 ? 0x9aa87a : k % 2 ? 0x7f8f5e : 0xb7bfa0));
      li++;
    }
  });
  leaves.instanceMatrix.needsUpdate = true;
  if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
  shore.add(leaves);

  /* ── BODY: the rigged cube-guy, an LED tee, a resin head ───────────── */
  const figureGroup = new THREE.Group();
  figureGroup.visible = false;
  scene.add(figureGroup);
  let figure = null,
    figScale = 1,
    mixer = null,
    headBone = null,
    figureLoaded = false;
  /* LED: a 5x7 bitmap font rasterised to a small canvas, mapped onto the
     shirt. Words change with the beat, like cube-guy's tee. */
  const G = {
    " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
    0: [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
    2: [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
    5: ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
    ".": [".....", ".....", ".....", ".....", ".....", "..#..", "....."],
    "×": [".....", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "....."],
    B: ["####.", "#...#", "####.", "#...#", "#...#", "#...#", "####."],
    E: ["#####", "#....", "####.", "#....", "#....", "#....", "#####"],
    H: ["#...#", "#...#", "#####", "#...#", "#...#", "#...#", "#...#"],
    L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
    M: ["#...#", "##.##", "#.#.#", "#...#", "#...#", "#...#", "#...#"],
    N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
    O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
    T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
    W: ["#...#", "#...#", "#...#", "#...#", "#.#.#", "##.##", "#...#"],
    Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  };
  const ledCan = document.createElement("canvas");
  ledCan.width = 256;
  ledCan.height = 256;
  const lg = ledCan.getContext("2d");
  const ledTex = new THREE.CanvasTexture(ledCan);
  ledTex.colorSpace = THREE.SRGBColorSpace;
  ledTex.magFilter = THREE.NearestFilter;
  function ledWord(word, col) {
    lg.fillStyle = "#1f2a30";
    lg.fillRect(0, 0, 256, 256);
    const cols = word.length * 6 - 1,
      cell = Math.min(12, Math.floor(180 / cols));
    const x0 = 128 - (cols * cell) / 2,
      y0 = 128 - (7 * cell) / 2;
    lg.fillStyle = col;
    [...word].forEach((ch, ci) => {
      const g = G[ch] || G[" "];
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 5; c++) if (g[r][c] === "#") lg.fillRect(x0 + (ci * 6 + c) * cell, y0 + r * cell, cell - 1, cell - 1);
    });
    ledTex.needsUpdate = true;
  }
  ledWord("HEY.", "#ffb347");
  const resin = new THREE.Mesh(
    new RoundedBoxGeometry(0.52, 0.52, 0.52, 4, 0.07),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.04,
      transmission: 1,
      thickness: 0.7,
      ior: 1.45,
      transparent: true,
      clearcoat: 1,
      attenuationColor: C(0xbfe3ef),
      attenuationDistance: 0.9,
    })
  );
  resin.visible = false;
  figureGroup.add(resin);
  function loadFigure() {
    if (figureLoaded) return;
    figureLoaded = true;
    new GLTFLoader().load(BASE + "/assets/models/cube-guy-rigged.glb", (g) => {
      figure = g.scene;
      const box = new THREE.Box3().setFromObject(figure);
      figScale = 1.7 / (box.max.y - box.min.y || 1);
      figure.scale.setScalar(figScale);
      figure.position.y = -0.55;
      figure.traverse((o) => {
        if (o.isBone && /head/i.test(o.name) && !headBone) headBone = o;
        if (o.isMesh && /shirt/i.test(o.name)) {
          /* the LED panel sits on the chest, in model units */
          const bb = new THREE.Box3().setFromObject(o);
          const w = (bb.max.x - bb.min.x) * 0.62,
            h = w * 0.72;
          const led = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: ledTex, toneMapped: false }));
          led.position.set((bb.max.x + bb.min.x) / 2, bb.min.y + (bb.max.y - bb.min.y) * 0.4, bb.max.z + 0.004);
          figure.add(led);
        }
      });
      figureGroup.add(figure);
      mixer = new THREE.AnimationMixer(figure);
      const by = {};
      g.animations.forEach((c) => (by[c.name] = c));
      mixer.clipAction(by.Idle || g.animations[0]).play();
    });
  }
  const LED = [
    [0.64, "HEY.", "#ffb347"],
    [0.68, "500", "#8fd8ff"],
    [0.71, "MET", "#7ff0d8"],
    [0.74, "2×WEBBY", "#f0c419"],
    [0.77, "NOW", "#a0c8ff"],
    [0.8, "PLY", "#ff9ad8"],
  ];
  let ledShown = "";

  /* ── SCREEN (after cube-guy's finale): six billboards ──────────────── */
  const boards = new THREE.Group();
  boards.visible = false;
  scene.add(boards);
  const boardSrc = [
    [BASE + "/1.met/0.jpg", 21 / 9],
    [BASE + "/play/assets/hi/p10.webp", 3 / 2],
    [BASE + "/assets/img/fairview/07-choose-poster.jpg", 16 / 9],
    [BASE + "/6.mindu/cover2.webp", 3 / 2],
    [BASE + "/play/assets/hi/p101.webp", 4 / 3],
    [BASE + "/7.naavo/18.1.webp", 16 / 10],
  ];
  const boardMeshes = boardSrc.map(([url, ar], i) => {
    const w = 2.1,
      h = w / ar;
    const m = photo(url, w, h);
    m.material.opacity = 1;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.6 })
    );
    const g = new THREE.Group();
    g.add(frame, m);
    m.position.z = 0.04;
    const col = i % 3,
      row = Math.floor(i / 3);
    g.position.set((col - 1) * 2.45, 0.95 - row * 1.85, -2 - Math.abs(col - 1) * 0.15);
    g.rotation.y = (1 - col) * 0.12;
    boards.add(g);
    return g;
  });
  const gridFloor = new THREE.GridHelper(40, 40, 0x3aa0c8, 0x1e5a72);
  gridFloor.position.y = -0.56;
  boards.add(gridFloor);
  const stroke = new THREE.LineSegments(
    new THREE.EdgesGeometry(new RoundedBoxGeometry(0.5, 0.5, 0.5, 3, 0.06)),
    new THREE.LineBasicMaterial({ color: 0xf1ede4, transparent: true, opacity: 0 })
  );
  stroke.visible = false;
  scene.add(stroke);

  /* ── CAPTIONS: one line per scene ───────────────────────────────────── */
  const CAP = [
    [0.01, 0.1, "Hey. I'm Sid."],
    [0.14, 0.3, "What I think with, and what I have done with it."],
    [0.34, 0.42, "Inside: the tools, the code, the rooms. Drag to look."],
    [0.47, 0.6, "The same object in five materials. Range is the point."],
    [0.64, 0.78, "And then it is a person."],
    [0.82, 0.89, "Everything gets built."],
    [0.91, 0.98, "The work is next."],
  ];
  let capShown = "";
  function caption(p) {
    let want = "";
    for (const [a, b, t] of CAP) if (p >= a && p <= b) want = t;
    if (want !== capShown) {
      capShown = want;
      captionEl.textContent = want;
      captionEl.classList.toggle("is-on", !!want);
    }
  }

  /* ── INPUT ──────────────────────────────────────────────────────────── */
  let target = 0,
    p = 0,
    dragging = false,
    dx = 0,
    dy = 0,
    yaw = 0,
    pitch = 0,
    yawT = 0,
    pitchT = 0;
  const pointer = new THREE.Vector2();
  function readScroll() {
    const r = host.getBoundingClientRect();
    const travel = host.offsetHeight - innerHeight;
    target = travel > 0 ? clamp01(-r.top / travel) : 0;
  }
  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", readScroll, { passive: true });
  stage.addEventListener("pointerdown", (e) => {
    if (p > 0.34 && p < 0.44) {
      dragging = true;
      dx = e.clientX;
      dy = e.clientY;
      stage.setPointerCapture(e.pointerId);
    }
  });
  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    if (!dragging) return;
    yawT += (e.clientX - dx) * 0.004;
    pitchT = Math.max(-1, Math.min(1, pitchT + (e.clientY - dy) * 0.003));
    dx = e.clientX;
    dy = e.clientY;
  });
  window.addEventListener("pointerup", () => (dragging = false));

  function resize() {
    const r = stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)),
      h = Math.max(1, Math.round(r.height));
    if (renderer.domElement.width !== Math.round(w * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  /* ── PALETTES per scene, blended by the clock ───────────────────────── */
  const PAL = {
    day: { bg: 0xa5c4e6, fog: 0xb9ccd4, zen: 0x0e4a9e, hor: 0xa1c7e8, cloud: 0.68, star: 0, sunC: 0xffb857, hemi: 0.9, sun: 2.4 },
    dusk: { bg: 0x2b3a5c, fog: 0x3a3f5e, zen: 0x3b4a7a, hor: 0xf2b48c, cloud: 0.35, star: 0, sunC: 0xffb05a, hemi: 0.6, sun: 1.6 },
    shore: { bg: 0x9db4c8, fog: 0xbfc9cf, zen: 0x6f8fb0, hor: 0xeae3d6, cloud: 0.8, star: 0, sunC: 0xfff0d8, hemi: 0.9, sun: 1.8 },
    night: { bg: 0x070d24, fog: 0x0a1030, zen: 0x040816, hor: 0x24365e, cloud: 0.1, star: 1, sunC: 0x8fa8ff, hemi: 0.5, sun: 0.8 },
    screen: { bg: 0x0b0e14, fog: 0x0b0e14, zen: 0x050810, hor: 0x0e2432, cloud: 0, star: 0.6, sunC: 0x3aa0c8, hemi: 0.7, sun: 1.0 },
  };
  const COLOUR_KEYS = new Set(["bg", "fog", "zen", "hor", "sunC"]);
  const tmpC = new THREE.Color(),
    tmpC2 = new THREE.Color();
  function blend(a, b, k) {
    const out = {};
    for (const key in a) out[key] = COLOUR_KEYS.has(key) ? tmpC.set(a[key]).lerp(tmpC2.set(b[key]), k).getHex() : lerp(a[key], b[key], k);
    return out;
  }
  function applyPal(P) {
    scene.background.set(P.bg);
    scene.fog.color.set(P.fog);
    skyMat.uniforms.zen.value.set(P.zen);
    skyMat.uniforms.hor.value.set(P.hor);
    skyMat.uniforms.cloud.value = P.cloud;
    skyMat.uniforms.star.value = P.star;
    skyMat.uniforms.sunCol.value.set(P.sunC);
    hemi.intensity = P.hemi;
    sun.intensity = P.sun;
  }

  /* ── THE LOOP ───────────────────────────────────────────────────────── */
  const clock = new THREE.Clock();
  let live = false,
    playing = false,
    blinkAt = 2.5;
  const tmp = new THREE.Vector3();
  const stops = [
    [0.48, 0xd9cdb6, 0.85, 0, 0],
    [0.51, 0xe6eef4, 0.46, 0, 0],
    [0.54, 0x2f93a4, 0.06, 0, 0.9],
    [0.57, 0xdff0f6, 0.04, 0, 1],
    [0.6, 0xf3f1ea, 0.6, 0, 0],
  ];

  function frame() {
    if (!live) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, clock.getDelta());
    const time = clock.elapsedTime;
    resize();
    p += (target - p) * (1 - Math.exp(-6 * dt));
    yaw += (yawT - yaw) * 0.12;
    pitch += (pitchT - pitch) * 0.12;
    caption(p);
    windU.value = time;

    /* scene weights */
    const grassW = 1 - sm(0.3, 0.36, p);
    const unfold = sm(0.12, 0.3, p);
    const fold = sm(0.3, 0.34, p);
    const enter = sm(0.34, 0.385, p);
    const exit = sm(0.4, 0.44, p);
    const inside = enter * (1 - exit);
    const waterW = sm(0.43, 0.48, p) * (1 - sm(0.6, 0.64, p));
    const walk = sm(0.48, 0.6, p);
    const shoreW = sm(0.6, 0.64, p) * (1 - sm(0.86, 0.9, p));
    const body = sm(0.62, 0.7, p);
    const closeShot = sm(0.75, 0.8, p);
    const intoResin = sm(0.84, 0.9, p);
    const screenW = sm(0.9, 0.94, p);
    const dock = sm(0.97, 1.0, p);

    /* palette */
    let P;
    if (p < 0.48) P = blend(PAL.day, PAL.dusk, sm(0.4, 0.48, p));
    else if (p < 0.64) P = blend(PAL.dusk, PAL.shore, sm(0.58, 0.64, p));
    else if (p < 0.86) P = blend(PAL.shore, PAL.night, sm(0.8, 0.86, p));
    else P = blend(PAL.night, PAL.screen, sm(0.88, 0.94, p));
    applyPal(P);
    skyMat.uniforms.t.value = time;

    /* worlds */
    field.visible = p < 0.48 && !(p > 0.372 && p < 0.41);
    field.position.y = -1.6 * sm(0.43, 0.48, p);
    river.visible = waterW > 0.01;
    riverMat.uniforms.t.value = time;
    riverMat.uniforms.op.value = waterW;
    shore.visible = shoreW > 0.01 && p < 0.9;
    boards.visible = screenW > 0.01;

    /* the cube */
    setFold(1 - unfold * (1 - fold));
    const cubeOn = (1 - sm(0.366, 0.374, p) * (1 - sm(0.41, 0.42, p))) * (1 - body);
    cube.visible = cubeOn > 0.01;
    cube.scale.setScalar(Math.max(0.001, 1 - body));
    const breathe = Math.sin(time * 0.9) * 0.02 * grassW;
    cube.rotation.set(
      Math.sin(time * 0.5) * 0.02 * grassW + breathe,
      Math.sin(time * 0.35) * 0.05 * grassW + lerp(0, Math.PI * 2.2, walk) * waterW + lerp(0, 0.35, fold) * (1 - inside),
      0
    );
    cube.position.x = lerp(0, -0.4, walk) * waterW;
    cube.position.y = lerp(0, -0.2, waterW) + Math.sin(time * 1.3) * 0.04 * waterW;
    if (time > blinkAt) {
      const k = (time - blinkAt) / 0.22;
      drawFace(k < 1 ? Math.sin(k * Math.PI) : 0, sm(0.02, 0.1, p));
      if (k > 1) blinkAt = time + 2.4 + Math.random() * 3.2;
    }
    faceMesh.material.opacity = 1 - sm(0.345, 0.365, p);
    const credA = unfold * (1 - fold);
    eye.material.opacity = credA;
    brain.material.opacity = credA * sm(0.2, 0.26, p);
    creds.forEach((m, i) => (m.material.opacity = credA * sm(0.14 + i * 0.025, 0.2 + i * 0.025, p)));
    /* the plates go white to kraft as the net opens, then run the
       material score on the water */
    if (waterW > 0.01) {
      let a = stops[0],
        b = stops[4],
        k = 0;
      for (let i = 0; i < 4; i++)
        if (p >= stops[i][0] && p <= stops[i + 1][0]) {
          a = stops[i];
          b = stops[i + 1];
          k = (p - a[0]) / (b[0] - a[0]);
        }
      if (p > stops[4][0]) {
        a = b = stops[4];
        k = 0;
      }
      tmpC.set(a[1]).lerp(tmpC2.set(b[1]), k);
      faces.forEach((f) => {
        const m = f.plate.material;
        m.color.copy(tmpC);
        m.roughness = lerp(a[2], b[2], k);
        m.metalness = lerp(a[3], b[3], k);
        m.transparent = true;
        m.opacity = 1 - lerp(a[4], b[4], k) * 0.55;
      });
    } else if (p < 0.44) {
      tmpC.set(WHITE).lerp(tmpC2.set(KRAFT), unfold);
      faces.forEach((f) => {
        const m = f.plate.material;
        m.color.copy(tmpC);
        m.roughness = lerp(0.6, 0.85, unfold);
        m.metalness = 0;
        m.opacity = 1;
      });
    }

    /* the room */
    room.visible = p > 0.35 && p < 0.415;
    room.position.copy(cube.position);
    faces[0].plate.position.x = enter * (1 - exit) * 1.6;
    if (room.visible && !playing) {
      playing = true;
      videos.forEach((v) => {
        v.preload = "auto";
        v.play().catch(() => {});
      });
    } else if (!room.visible && playing) {
      playing = false;
      videos.forEach((v) => v.pause());
    }
    wallLight.intensity = 6 * inside;

    /* the body */
    if (p > 0.56) loadFigure();
    figureGroup.visible = body > 0.01 && p < 0.9;
    if (figure) {
      figure.scale.setScalar(figScale * lerp(0.001, 1, body));
      figure.position.set(cube.position.x, -0.55, 0);
      figure.rotation.y = Math.PI + lerp(-0.2, 0.15, closeShot);
      if (mixer) mixer.update(dt);
      resin.visible = body > 0.7;
      if (headBone) {
        headBone.getWorldPosition(tmp);
        resin.position.copy(tmp);
      } else resin.position.set(cube.position.x, 1.0, 0);
      resin.scale.setScalar(lerp(0.001, 1, sm(0.7, 0.76, p)) * lerp(1, 2.4, intoResin));
      let want = "";
      for (const [at, w, c] of LED) if (p >= at) want = w + "|" + c;
      if (want && want !== ledShown) {
        ledShown = want;
        const [w, c] = want.split("|");
        ledWord(w, c);
      }
    }

    /* the screen and the stroke cube */
    boardMeshes.forEach((g, i) => {
      const k = sm(0.9 + i * 0.006, 0.93 + i * 0.006, p);
      g.scale.setScalar(Math.max(0.001, k * (1 - dock)));
      g.visible = k > 0.01 && dock < 0.99;
    });
    stroke.visible = dock > 0.01;
    stroke.material.opacity = dock;
    stroke.rotation.y = time * 0.4;
    const viewH = 2 * 6.5 * Math.tan(THREE.MathUtils.degToRad(18));
    const viewW = viewH * camera.aspect;

    /* camera */
    let cy = 0,
      cz = 0,
      ry = 0,
      rx = 0;
    if (p < 0.44) {
      cz = lerp(lerp(4.6, 5.8, unfold), 0, enter);
      cz = lerp(cz, -5.8, exit);
      /* out the back, then turn to look at the cube from behind */
      const turn = sm(0.0, 0.45, exit);
      cy = lerp(lerp(0.35, 0.05, unfold), 0.55, turn);
      rx = lerp(lerp(-0.06, 0, unfold), 0.1, turn);
      ry = Math.PI * turn;
    } else if (p < 0.64) {
      cz = lerp(-5.8, -5.4, waterW);
      cy = 0.55;
      ry = Math.PI;
      rx = 0.1;
    } else {
      cz = lerp(-5.0, -3.2, closeShot) + lerp(0, 0.9, intoResin);
      cy = lerp(0.45, 0.85, closeShot) + lerp(0, 0.2, intoResin);
      ry = Math.PI;
      rx = lerp(-0.08, -0.02, closeShot);
      if (p >= 0.9) {
        /* a hard cut through black into the screen */
        cz = 5.2;
        cy = 0.0;
        ry = 0;
        rx = -0.03;
      }
    }
    camRig.position.set(pointer.x * 0.06 * (1 - inside) + lerp(0, cube.position.x, waterW), cy + pointer.y * 0.04 * (1 - inside), cz);
    camRig.rotation.set(rx + pitch * 0.9 * inside + pointer.y * 0.015 * (1 - inside), ry + yaw * inside + pointer.x * 0.025 * (1 - inside), 0);
    camera.fov = lerp(lerp(36, 74, enter), 36, exit);
    camera.updateProjectionMatrix();
    stroke.position.set(lerp(0, -viewW * 0.42, dock), lerp(0, viewH * 0.3, dock), camRig.position.z - 6.5);
    stroke.scale.setScalar(lerp(1.2, 0.55, dock));

    renderer.toneMappingExposure = 1.05 * (1 - sm(0.885, 0.9, p) * (1 - sm(0.9, 0.93, p)));
    renderer.render(scene, camera);
  }

  const io = new IntersectionObserver(
    (es) => {
      const on = es[0].isIntersecting;
      if (on && !live) {
        live = true;
        clock.getDelta();
        readScroll();
        frame();
      } else if (!on) {
        live = false;
        videos.forEach((v) => v.pause());
        playing = false;
      }
    },
    { threshold: 0.01 }
  );
  io.observe(host);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) live = false;
    else if (!live) {
      live = true;
      clock.getDelta();
      frame();
    }
  });
  window.__cs = {
    get p() {
      return p;
    },
    camRig,
    boards,
    stroke,
    scene,
    camera,
    faces,
    cube,
  };
  readScroll();
})();
