import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// One clock, one interaction state. No skinning or speculative likeness.
const $ = (s) => document.querySelector(s),
  all = (s) => [...document.querySelectorAll(s)];
const canvas = $("#stage"),
  status = $("#scene-status"),
  reduce = matchMedia("(prefers-reduced-motion: reduce)");
const state = {
  reveal: 0,
  pinned: false,
  hover: false,
  chapter: 0,
  scroll: 0,
  targetScroll: 0,
  light: 0,
  project: "compete",
  mode: "research",
  pulse: 0,
  paused: reduce.matches,
  voice: false,
  time: 0,
  dragX: 0,
  dragY: 0,
};
const pointer = new THREE.Vector2(),
  smoothPointer = new THREE.Vector2(),
  ray = new THREE.Raycaster();
const chapters = all(".chapter");
let renderer,
  composer,
  headMesh,
  points,
  alive = true,
  last = performance.now(),
  lastDraw = 0,
  lastScreen = 0,
  slow = 0,
  dpr = Math.min(devicePixelRatio, 1.5),
  dimensions = [];
const scene = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 60);
camera.position.set(0, 0.5, 9.7);
camera.lookAt(0, 0.2, 0);
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch (e) {
  status.textContent = "3D is unavailable in this browser. Your portfolio and résumé are still accessible.";
  throw e;
}
renderer.setPixelRatio(dpr);
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
scene.background = new THREE.Color("#102a31");
scene.fog = new THREE.FogExp2("#102a31", 0.022);
const pmrem = new THREE.PMREMGenerator(renderer),
  room = new RoomEnvironment();
const env = pmrem.fromScene(room, 0.03);
scene.environment = env.texture;
room.dispose();
pmrem.dispose();

const bgUniforms = { time: { value: 0 }, mouse: { value: new THREE.Vector2() }, warm: { value: 0 }, pulse: { value: 0 } };
const bg = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 24),
  new THREE.ShaderMaterial({
    uniforms: bgUniforms,
    depthWrite: false,
    vertexShader: `varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `
varying vec2 v;uniform float time,warm,pulse;uniform vec2 mouse;
void main(){vec2 p=v-.5;float light=exp(-length((p-vec2(.20,.08))*vec2(2.,1.4))*4.);float arch=exp(-pow((length((p-vec2(.30,-.25))*vec2(1.,.7))-.31)*45.,2.));
vec3 c=mix(vec3(.018,.057,.065),vec3(.065,.17,.18),light);c+=arch*vec3(.025,.062,.065);
float h=exp(-length(p-mouse*.18-vec2(.1,0.))*8.);c+=h*vec3(.02,.026,.022);
c=mix(c,c*vec3(1.6,.86,.64)+vec3(.021,.006,0.),warm*.65);
gl_FragColor=vec4(c,1.);}`,
  })
);
bg.position.set(0, 1, -8);
scene.add(bg);
scene.add(new THREE.HemisphereLight("#d3e8e1", "#1b363e", 1.25));
const key = new THREE.SpotLight("#ffe2bc", 95, 25, 0.6, 0.8, 2);
key.position.set(-2.8, 6, 6);
key.target.position.set(1.5, 0.4, 0);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.025;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight("#71c7dc", 3.4);
rim.position.set(4, 2, -3);
scene.add(rim);
const fill = new THREE.DirectionalLight("#b6d6de", 1.3);
fill.position.set(-4, 0, 2);
scene.add(fill);
const hoverLight = new THREE.PointLight("#ffc692", 0, 6, 2);
hoverLight.position.set(1.7, 1, 3);
scene.add(hoverLight);

const hero = new THREE.Group();
hero.position.set(1.65, 0.45, 0);
scene.add(hero);
const tilt = new THREE.Group();
hero.add(tilt);
const core = new THREE.Group();
tilt.add(core);
const silver = new THREE.MeshStandardMaterial({ color: "#b9cacc", metalness: 0.88, roughness: 0.23 });
const dark = new THREE.MeshStandardMaterial({ color: "#10292e", metalness: 0.65, roughness: 0.32 });
const glassMat = new THREE.MeshPhysicalMaterial({
  color: "#c7e5e1",
  metalness: 0,
  roughness: 0.07,
  transmission: 0.99,
  thickness: 0.12,
  ior: 1.46,
  clearcoat: 0.5,
  clearcoatRoughness: 0.07,
  envMapIntensity: 0.5,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
});
function box(w, h, d, r, mat, parent = tilt) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
  parent.add(m);
  return m;
}
const shell = box(2.5, 2.5, 2.5, 0.16, glassMat);
shell.renderOrder = 5;
const panels = [];
for (let i = 0; i < 4; i++) {
  const p = new THREE.Group();
  tilt.add(p);
  const panel = box(
    2.18,
    2.18,
    0.025,
    0.08,
    new THREE.MeshPhysicalMaterial({
      color: i % 2 ? "#9cbcc6" : "#d7c3a9",
      metalness: 0.28,
      roughness: 0.18,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    p
  );
  if (i === 0) p.position.set(0, 0, -1.19);
  if (i === 1) {
    p.position.set(1.19, 0, 0);
    p.rotation.y = Math.PI / 2;
  }
  if (i === 2) {
    p.position.set(-1.19, 0, 0);
    p.rotation.y = -Math.PI / 2;
  }
  if (i === 3) {
    p.position.set(0, 1.19, 0);
    p.rotation.x = -Math.PI / 2;
  }
  p.userData.base = p.position.clone();
  panels.push(p);
}
// Thin machined seams keep the silhouette readable without a luminous cage.
for (const x of [-1.19, 1.19])
  for (const y of [-1.19, 1.19]) {
    const rail = box(0.024, 0.024, 2.16, 0.01, silver);
    rail.position.set(x, y, 0);
  }
for (const z of [-1.19, 1.19])
  for (const x of [-1.19, 1.19]) {
    const rail = box(0.024, 2.16, 0.024, 0.01, silver);
    rail.position.set(x, 0, z);
  }
const lip = box(2.24, 2.24, 0.06, 0.14, dark);
lip.position.z = 1.23;
const screenCanvas = document.createElement("canvas");
screenCanvas.width = 1024;
screenCanvas.height = 1024;
const ctx = screenCanvas.getContext("2d");
const screenTexture = new THREE.CanvasTexture(screenCanvas);
screenTexture.colorSpace = THREE.SRGBColorSpace;
screenTexture.anisotropy = 4;
const screenMaterial = new THREE.MeshBasicMaterial({ map: screenTexture, transparent: true, opacity: 1, depthWrite: false, toneMapped: false });
const screen = box(2.08, 2.08, 0.018, 0.12, screenMaterial);
screen.position.z = 1.278;
screen.renderOrder = 7;
const faceGlass = box(
  2.1,
  2.1,
  0.016,
  0.13,
  new THREE.MeshPhysicalMaterial({
    color: "#d0ecea",
    metalness: 0.15,
    roughness: 0.09,
    transparent: true,
    opacity: 0.1,
    clearcoat: 1,
    depthWrite: false,
  })
);
faceGlass.position.z = 1.31;
faceGlass.renderOrder = 8;
// The aperture border has an actual opening, not an opaque panel behind the face.
lip.visible = false;
for (const y of [-1.1, 1.1]) {
  let a = box(2.16, 0.045, 0.06, 0.02, dark);
  a.position.set(0, y, 1.23);
}
for (const x of [-1.1, 1.1]) {
  let a = box(0.045, 2.16, 0.06, 0.02, dark);
  a.position.set(x, 0, 1.23);
}
const led = box(0.13, 0.024, 0.02, 0.01, new THREE.MeshStandardMaterial({ color: "#ffd9ac", emissive: "#ff9d52", emissiveIntensity: 1.7 }));
led.position.set(0.9, -1.17, 1.27);
const led2 = box(0.38, 0.014, 0.01, 0.005, silver);
led2.position.set(-0.77, -1.17, 1.27);
// ID hangs from a preserved pivot; wind changes rotation, never its anchor.
const tagPivot = new THREE.Group();
tagPivot.position.set(-0.85, -1.2, 0.35);
tilt.add(tagPivot);
const cord = new THREE.Mesh(
  new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.04, -0.24, 0.05), new THREE.Vector3(0, -0.43, 0.07)]),
    20,
    0.009,
    6,
    false
  ),
  dark
);
tagPivot.add(cord);
const tagCanvas = document.createElement("canvas");
tagCanvas.width = 512;
tagCanvas.height = 640;
const tc = tagCanvas.getContext("2d");
tc.fillStyle = "#e9ece3";
tc.fillRect(0, 0, 512, 640);
tc.fillStyle = "#c34639";
tc.fillRect(0, 588, 512, 52);
tc.fillStyle = "#172a2b";
tc.font = "bold 61px Arial";
tc.fillText("PARSONS", 32, 94);
tc.font = "18px Arial";
tc.fillText("THE NEW SCHOOL", 34, 130);
tc.fillRect(34, 192, 80, 80);
tc.fillStyle = "#e9ece3";
tc.font = "25px Arial";
tc.fillText("SM", 53, 245);
tc.fillStyle = "#172a2b";
tc.font = "bold 34px Arial";
tc.fillText("SID MEHTA", 34, 354);
tc.font = "21px Arial";
tc.fillText("DESIGN & TECHNOLOGY", 34, 398);
tc.fillText("MFA · 2026", 34, 438);
for (let i = 0; i < 40; i++) tc.fillRect(34 + i * 6, 495, 1 + (i % 3), 37);
const tagTexture = new THREE.CanvasTexture(tagCanvas);
tagTexture.colorSpace = THREE.SRGBColorSpace;
const tag = box(0.4, 0.5, 0.025, 0.022, new THREE.MeshStandardMaterial({ map: tagTexture, roughness: 0.58 }), tagPivot);
tag.position.set(0, -0.65, 0.08);

const tl = new THREE.TextureLoader();
const normal = tl.load("./models/tv-head/head-normal.jpg");
normal.flipY = false;
const headMaterial = new THREE.MeshPhysicalMaterial({
  color: "#84978c",
  roughness: 0.56,
  metalness: 0.02,
  normalMap: normal,
  normalScale: new THREE.Vector2(0.7, 0.7),
  clearcoat: 0.06,
  envMapIntensity: 0.5,
});
new GLTFLoader().load(
  "./models/tv-head/placeholder-head.glb",
  (g) => {
    let source;
    g.scene.traverse((o) => {
      if (o.isMesh && !source) source = o;
    });
    if (!source) throw Error("Placeholder contains no mesh");
    const geometry = source.geometry.clone();
    geometry.computeBoundingBox();
    const size = geometry.boundingBox.getSize(new THREE.Vector3());
    geometry.center();
    const scale = 1.82 / Math.max(size.x, size.y, size.z);
    geometry.scale(scale, scale, scale);
    headMesh = new THREE.Mesh(geometry, headMaterial);
    headMesh.position.set(0, -0.03, 0.05);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    core.add(headMesh);
    const p = geometry.attributes.position.array,
      cloudGeo = new THREE.BufferGeometry();
    cloudGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(p), 3));
    points = new THREE.Points(
      cloudGeo,
      new THREE.PointsMaterial({ color: "#d8b38a", size: 0.014, transparent: true, opacity: 0, depthWrite: false })
    );
    points.position.copy(headMesh.position);
    points.scale.setScalar(1.017);
    core.add(points);
    status.classList.add("loaded");
    document.body.dataset.model = "ready";
  },
  undefined,
  (e) => {
    status.textContent = "The placeholder head did not load. Reload to retry; all portfolio links still work.";
    console.error(e);
  }
);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({
    color: "#071b20",
    roughness: 0.82,
    metalness: 0,
    envMapIntensity: 0.25,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.1;
floor.receiveShadow = true;
scene.add(floor);
const shadowCanvas = document.createElement("canvas");
shadowCanvas.width = 256;
shadowCanvas.height = 256;
const sc = shadowCanvas.getContext("2d"),
  gradient = sc.createRadialGradient(128, 128, 0, 128, 128, 128);
gradient.addColorStop(0, "rgba(0,9,12,.58)");
gradient.addColorStop(1, "rgba(0,9,12,0)");
sc.fillStyle = gradient;
sc.fillRect(0, 0, 256, 256);
const shadow = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 4),
  new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false })
);
shadow.rotation.x = -Math.PI / 2;
shadow.position.set(1.65, -2.095, 0);
scene.add(shadow);
const dustCount = 240,
  dustGeo = new THREE.BufferGeometry(),
  positions = new Float32Array(dustCount * 3),
  seeds = new Float32Array(dustCount);
let seed = 4207;
const random = () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 4294967296;
};
for (let i = 0; i < dustCount; i++) {
  positions[i * 3] = (random() - 0.5) * 13;
  positions[i * 3 + 1] = (random() - 0.5) * 8;
  positions[i * 3 + 2] = (random() - 0.5) * 8;
  seeds[i] = random();
}
dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
dustGeo.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
const dustUniforms = { time: { value: 0 }, pixel: { value: dpr }, pointer: { value: new THREE.Vector2() } };
const dust = new THREE.Points(
  dustGeo,
  new THREE.ShaderMaterial({
    uniforms: dustUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `attribute float seed;uniform float time,pixel;uniform vec2 pointer;varying float a;void main(){vec3 p=position;p.x+=sin(time*.13+seed*20.)*.12;p.y+=sin(time*.11+seed*30.)*.18;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((1.5+seed*2.)*pixel*7./-mv.z,1.,5.);a=.12+seed*.22;}`,
    fragmentShader: `varying float a;void main(){float d=length(gl_PointCoord-.5)*2.;gl_FragColor=vec4(.7,.85,.8,a*(1.-smoothstep(.1,1.,d)));}`,
  })
);
scene.add(dust);

const satellite = new THREE.Group();
tilt.add(satellite);
const tileMat = new THREE.MeshStandardMaterial({ color: "#cfb793", metalness: 0.65, roughness: 0.3, transparent: true, opacity: 0 });
const tiles = [];
for (let i = 0; i < 18; i++) {
  let tile = box(0.1, 0.1, 0.025, 0.018, tileMat, satellite);
  tile.userData.angle = (i / 18) * Math.PI * 2;
  tiles.push(tile);
}

composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.18, 0.38, 1.2);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const grainPass = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, amount: { value: 0.013 }, glitch: { value: 0 } },
  vertexShader: `varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float time,amount,glitch;varying vec2 v;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=v;float strip=step(.985,hash(vec2(floor(v.y*130.),floor(time*18.))));uv.x+=strip*glitch*.0015;vec3 c=texture2D(tDiffuse,uv).rgb;float g=(hash(gl_FragCoord.xy+floor(time*24.))-.5)*amount;c+=g;float vig=1.-smoothstep(.12,.8,length((v-.5)*vec2(.85,1.)));c*=.90+.10*vig;gl_FragColor=vec4(c,1.);}`,
});
composer.addPass(grainPass);

const projectData = {
  compete: {
    role: "Design Engineer · Compete · 2025–2026",
    title: "Make progress feel tangible.",
    description:
      "Designed and tested athlete onboarding, challenges, rankings, and rewards for a video-based sports platform. Prototyped AI coaching and scoring workflows alongside athlete and judge experiences.",
    proof: "A connected system of feedback: XP, streaks, badges, leaderboards, and live scoring.",
  },
  deloitte: {
    role: "UI/UX Designer · Deloitte Digital · 2022–2024",
    title: "Clarity at enterprise scale.",
    description:
      "Research, journeys, interfaces, and developer handoff for hospitality, food service, healthcare, and Salesforce workflows. Work included Marriott, Del Taco, Yum Brands, and Fairview Health.",
    proof: "Shipped workflows across 100+ franchise stores and 9,000+ hotel properties.",
  },
  encoded: {
    role: "XR Developer · EyeJack · 2025",
    title: "Let the artwork leave its frame.",
    description:
      "Helped build ENCODED, a public AR exhibition at the Metropolitan Museum of Art. Owned on-site scanning, photogrammetry, prototyping, QA, and location-based AR implementation.",
    proof: "25 artworks. 2,000+ activations. The exhibition received two 2026 Webby Awards.",
  },
  credits: {
    role: "An interactive portfolio study",
    title: "Human intent. Digital material.",
    description:
      "A glass interface reveals a neutral scanned human bust. This is a temporary study model, not Siddharth’s likeness. It will be replaced after a usable face scan is available.",
    proof:
      "Placeholder: Lee Perry-Smith / Infinite-Realities, via the Three.js examples and McGuire Computer Graphics Archive. Built with Three.js; no live AI service or camera access.",
  },
};
const modal = $("#project-dialog");
function openProject(id) {
  const p = projectData[id];
  $("#project-role").textContent = p.role;
  $("#project-title").textContent = p.title;
  $("#project-description").textContent = p.description;
  $("#project-proof").textContent = p.proof;
  modal.showModal();
}
modal.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    e.preventDefault();
    modal.close();
  }
});
$("#close-dialog").onclick = () => modal.close();
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    const r = modal.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close();
  }
});
$("#credits").onclick = () => openProject("credits");
all("[data-project]").forEach((b) => {
  b.onpointerenter = b.onfocus = () => {
    state.project = b.dataset.project;
    state.pulse = 1;
    $("#input-code").textContent = '"' + state.project + '"';
  };
  b.onclick = () => openProject(b.dataset.project);
});
const practiceCopy = {
  research: "Start with the person, their context, and the thing getting in their way.",
  prototype: "Build the uncertain part first. Interfaces, spatial prototypes, and code you can actually try.",
  test: "Take the prototype into the real setting. Observe, adjust, and make the next interaction clearer.",
};
all("[data-mode]").forEach(
  (b) =>
    (b.onclick = () => {
      state.mode = b.dataset.mode;
      all("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $("#practice-detail").textContent = practiceCopy[state.mode];
      state.pulse = 1;
      $("#input-code").textContent = '"' + state.mode + '"';
    })
);
$("#reveal").onclick = () => {
  state.pinned = !state.pinned;
  $("#reveal").setAttribute("aria-pressed", String(state.pinned));
  $("#reveal").innerHTML = state.pinned
    ? 'Return to interface <span aria-hidden="true">↙</span>'
    : 'Meet the human <span aria-hidden="true">↗</span>';
  state.pulse = 1;
};
const lightNames = ["Daybreak", "Blue hour", "Ember"];
$("#light-mode").onclick = () => {
  state.light = (state.light + 1) % 3;
  $("#light-name").textContent = lightNames[state.light];
  state.pulse = 0.65;
};
function updateMotion() {
  $("#motion").textContent = state.paused ? "Resume motion" : "Pause motion";
  $("#motion").setAttribute("aria-pressed", String(state.paused));
}
$("#motion").onclick = () => {
  state.paused = !state.paused;
  updateMotion();
};
reduce.addEventListener("change", () => {
  state.paused = reduce.matches;
  updateMotion();
});
updateMotion();
function speak() {
  if (!state.voice || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const text = chapters[state.chapter].querySelector("h1,h2").textContent + ". " + chapters[state.chapter].querySelector(".summary").textContent;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}
$("#voice").onclick = () => {
  if (!("speechSynthesis" in window)) {
    $("#voice").textContent = "Voice unavailable";
    return;
  }
  state.voice = !state.voice;
  $("#voice").setAttribute("aria-pressed", String(state.voice));
  $("#voice").textContent = state.voice ? "Voice on" : "Voice off";
  state.voice ? speak() : speechSynthesis.cancel();
};
let down = null;
canvas.addEventListener("pointerdown", (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, 1 - (e.clientY / innerHeight) * 2);
  ray.setFromCamera(pointer, camera);
  if (ray.intersectObject(shell).length) down = { x: e.clientX, y: e.clientY, id: e.pointerId };
});
canvas.addEventListener("pointerup", (e) => {
  if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 8) {
    state.pulse = 1;
    state.project = ["compete", "deloitte", "encoded"][(["compete", "deloitte", "encoded"].indexOf(state.project) + 1) % 3];
  }
  down = null;
});
canvas.addEventListener("pointercancel", () => (down = null));
addEventListener("pointermove", (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, 1 - (e.clientY / innerHeight) * 2);
  if (down && e.pointerType !== "touch") {
    state.dragX = THREE.MathUtils.clamp((e.clientX - down.x) * 0.002, -0.35, 0.35);
    state.dragY = THREE.MathUtils.clamp((e.clientY - down.y) * 0.001, -0.14, 0.14);
  }
});
document.documentElement.addEventListener("pointerleave", () => {
  pointer.set(-3, -3);
  state.hover = false;
  down = null;
});
function measure() {
  dimensions = chapters.map((el) => el.offsetTop);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight, false);
  composer.setSize(innerWidth, innerHeight);
  dustUniforms.pixel.value = dpr;
}
new ResizeObserver(measure).observe(document.documentElement);
addEventListener("resize", measure);
measure();
addEventListener(
  "scroll",
  () => {
    const y = scrollY;
    let index = 0;
    while (index < 3 && y >= dimensions[index + 1]) index++;
    const next = dimensions[index + 1] ?? dimensions[index] + innerHeight;
    state.targetScroll = Math.min(3, index + (y - dimensions[index]) / (next - dimensions[index]));
    $("#progress").style.transform = `scaleY(${y / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;
  },
  { passive: true }
);
const clamp = THREE.MathUtils.clamp,
  lerp = THREE.MathUtils.lerp;
function approach(a, b, rate, dt) {
  return lerp(a, b, 1 - Math.exp(-rate * dt));
}
function drawScreen(t) {
  ctx.clearRect(0, 0, 1024, 1024);
  ctx.fillStyle = "#061b20";
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.fillStyle = "#34515a";
  ctx.font = "19px monospace";
  ctx.fillText("SID / HUMAN INTERFACE", 65, 84);
  ctx.fillText("INPUT " + (state.hover ? "DETECTED" : "READY"), 65, 950);
  ctx.fillText("●", 916, 84);
  const blink = state.paused ? 1 : Math.sin(t * 0.72) > 0.993 ? 0.12 : 1,
    px = clamp(smoothPointer.x, -1, 1) * 25,
    py = clamp(smoothPointer.y, -1, 1) * -16;
  if (state.chapter === 0 || state.chapter === 3) {
    ctx.save();
    ctx.translate(512 + px, 480 + py);
    ctx.fillStyle = state.light === 1 ? "#ace4ec" : "#f8cba1";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 30;
    for (const x of [-142, 142]) {
      ctx.beginPath();
      ctx.roundRect(x - 49, -62 * blink, 98, 124 * blink, 40);
      ctx.fill();
    }
    ctx.shadowBlur = 10;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-37, 145);
    ctx.quadraticCurveTo(0, 155 + state.pulse * 20, 37, 145);
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.strokeStyle = "#668f96";
    ctx.lineWidth = 2;
    const mode = state.chapter === 2 ? state.mode : state.project;
    ctx.fillStyle = "#d9e7df";
    ctx.font = "34px Manrope, Arial";
    ctx.fillText(
      mode === "encoded"
        ? "Beyond the frame"
        : mode === "deloitte"
          ? "Connected systems"
          : mode === "compete"
            ? "Progress, made visible"
            : mode === "research"
              ? "Human context"
              : mode === "prototype"
                ? "Working prototype"
                : "Feedback loop",
      64,
      176
    );
    if (mode === "encoded") {
      // A frame becomes a spatial volume, echoing the public AR exhibition.
      for (let i = 0; i < 7; i++) {
        const d = i * 29;
        ctx.save();
        ctx.translate(512, 500);
        ctx.rotate((i - 3) * 0.012 + Math.sin(t * 0.25) * i * 0.004);
        ctx.strokeStyle = i === 0 ? "#f1b986" : `rgba(112,179,180,${0.8 - i * 0.08})`;
        ctx.lineWidth = i === 0 ? 5 : 2;
        ctx.strokeRect(-260 + d, -255 + d, 520 - d * 2, 510 - d * 2);
        ctx.restore();
      }
      for (let i = 0; i < 25; i++) {
        const a = i * 2.4 + t * 0.055,
          r = 60 + Math.sqrt(i) * 32;
        ctx.fillStyle = i % 5 ? "#82b8bc" : "#f1b986";
        ctx.beginPath();
        ctx.arc(512 + Math.cos(a) * r, 500 + Math.sin(a) * r, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#a9c7c7";
      ctx.font = "20px monospace";
      ctx.fillText("25 ARTWORKS  /  ONE SHARED SPACE", 155, 805);
    } else if (mode === "deloitte" || mode === "research") {
      // A quiet network: many workflows, one legible system.
      const nodes = Array.from({ length: 9 }, (_, i) => ({ x: 180 + (i % 3) * 330, y: 320 + Math.floor(i / 3) * 200 }));
      ctx.lineWidth = 2;
      nodes.forEach((p, i) => {
        for (const j of [i + 1, i + 3]) {
          if (nodes[j] && (j === i + 3 || i % 3 < 2)) {
            const q = nodes[j];
            ctx.strokeStyle = "#365f67";
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            const k = (t * 0.12 + i * 0.17) % 1;
            ctx.fillStyle = "#e6be94";
            ctx.beginPath();
            ctx.arc(p.x + (q.x - p.x) * k, p.y + (q.y - p.y) * k, 4, 0, 7);
            ctx.fill();
          }
        }
      });
      nodes.forEach((p, i) => {
        ctx.fillStyle = i === 4 ? "#e6be94" : "#204b54";
        ctx.strokeStyle = "#8cb8bd";
        ctx.beginPath();
        ctx.roundRect(p.x - 42, p.y - 35, 84, 70, 14);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = i === 4 ? "#14313a" : "#c3d6d2";
        ctx.font = "19px monospace";
        ctx.fillText(String(i + 1).padStart(2, "0"), p.x - 12, p.y + 7);
      });
    } else if (mode === "prototype" || mode === "test") {
      // Live geometry is a readable visual metaphor, not simulated AI output.
      ctx.save();
      ctx.translate(512, 510);
      const a = t * 0.16,
        vs = [
          [-1, -1, -1],
          [1, -1, -1],
          [1, 1, -1],
          [-1, 1, -1],
          [-1, -1, 1],
          [1, -1, 1],
          [1, 1, 1],
          [-1, 1, 1],
        ].map(([x, y, z]) => {
          const xx = x * Math.cos(a) + z * Math.sin(a),
            zz = -x * Math.sin(a) + z * Math.cos(a);
          return [(xx * 180) / (1 + zz * 0.17), (y * 180) / (1 + zz * 0.17) + zz * 38];
        });
      for (const [i, j] of [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ]) {
        ctx.strokeStyle = mode === "test" ? "#e6be94" : "#92c7c8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(...vs[i]);
        ctx.lineTo(...vs[j]);
        ctx.stroke();
      }
      vs.forEach((p) => {
        ctx.fillStyle = "#f3d2ae";
        ctx.beginPath();
        ctx.arc(...p, 5, 0, 7);
        ctx.fill();
      });
      ctx.restore();
      ctx.font = "20px monospace";
      ctx.fillStyle = "#9cbfc0";
      ctx.fillText(mode === "test" ? "OBSERVE → ADJUST → TEST AGAIN" : "IDEA → PROTOTYPE → EXPERIENCE", 175, 815);
    } else {
      ctx.strokeStyle = "#244851";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(90, 300 + i * 105);
        ctx.lineTo(930, 300 + i * 105);
        ctx.stroke();
      }
      const curve = (y) => 560 - Math.sin(y * 4 - 1) * 85 - y * 190;
      ctx.beginPath();
      for (let i = 0; i <= 90; i++) {
        let x = i / 90;
        if (i === 0) ctx.moveTo(100, curve(x));
        else ctx.lineTo(100 + x * 800, curve(x));
      }
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#f1b986";
      ctx.stroke();
      const q = (t * 0.075) % 1;
      ctx.shadowColor = "#f1b986";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#f7d4ac";
      ctx.beginPath();
      ctx.arc(100 + q * 800, curve(q), 9, 0, 7);
      ctx.fill();
      ctx.shadowBlur = 0;
      ["ONBOARD", "PRACTICE", "FEEDBACK"].forEach((s, i) => {
        ctx.fillStyle = "#6fa0a7";
        ctx.font = "19px monospace";
        ctx.fillText(s, 95 + i * 330, 790);
      });
    }
    ctx.font = "18px monospace";
    ctx.fillStyle = "#77999f";
    ctx.fillText("observe()  →  build()  →  test()", 74, 900);
  }
  ctx.fillStyle = "rgba(0,10,14,.17)";
  for (let y = 0; y < 1024; y += 4) ctx.fillRect(0, y, 1024, 1);
  if (state.pulse > 0.7 && !state.paused) {
    ctx.fillStyle = "rgba(146,222,216,.22)";
    ctx.fillRect(64, (t * 310) % 950, 894, 5);
  }
  screenTexture.needsUpdate = true;
}

const lightColors = [new THREE.Color("#ffe2bc"), new THREE.Color("#c5dfff"), new THREE.Color("#ffc09e")],
  rimColors = [new THREE.Color("#71c7dc"), new THREE.Color("#b6a6eb"), new THREE.Color("#b9d8bc")];
function frame(now) {
  if (!alive) return;
  requestAnimationFrame(frame);
  if (document.hidden) {
    last = now;
    return;
  }
  if (now - lastDraw < 1000 / 60 - 1) return;
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  lastDraw = now;
  if (!state.paused) state.time += dt;
  const t = state.time;
  if (dt > 0.027) slow++;
  else slow = Math.max(0, slow - 1);
  if (slow > 100 && dpr > 1) {
    dpr = Math.max(1, dpr - 0.15);
    slow = 0;
    measure();
  }
  smoothPointer.lerp(pointer, 1 - Math.exp(-6 * dt));
  state.scroll = approach(state.scroll, state.targetScroll, 5, dt);
  const chapter = clamp(Math.round(state.scroll), 0, 3);
  if (chapter !== state.chapter) {
    state.chapter = chapter;
    $("#input-code").textContent = ["pointer", '"systems"', '"space"', '"conversation"'][chapter];
    speak();
  }
  if (!state.paused) state.pulse = Math.max(0, state.pulse - dt * 1.6);
  else state.pulse = 0;
  const mobile = innerWidth <= 680;
  camera.position.z = mobile ? 10.6 : 9.7;
  const worldWidth = 2 * Math.tan(THREE.MathUtils.degToRad(17)) * camera.position.z * camera.aspect;
  const compact = clamp(state.scroll, 0, 1),
    heroScale = mobile ? Math.min(0.61, (worldWidth * 0.66) / 3.3) * (1 - compact * 0.25) : Math.min(1, (worldWidth * 0.43) / 3.3);
  hero.position.x = mobile ? 0 : worldWidth * 0.245;
  hero.position.y = mobile ? lerp(-0.83, -1.1, compact) : 0.4;
  hero.scale.setScalar(heroScale);
  shadow.position.x = hero.position.x;
  tagPivot.position.y = mobile ? -0.82 : -1.2;
  ray.setFromCamera(pointer, camera);
  state.hover = ray.intersectObject(shell).length > 0 && !modal.open;
  const revealTarget = state.pinned || state.hover ? 1 : 0;
  state.reveal = approach(state.reveal, revealTarget, 5, dt);
  const open = Math.sin((clamp(state.scroll, 0, 3) / 3) * Math.PI);
  tilt.rotation.y = approach(tilt.rotation.y, 0.24 + Math.sin(state.scroll * 1.6) * 0.3 + clamp(smoothPointer.x, -1, 1) * 0.065 + state.dragX, 4, dt);
  tilt.rotation.x = approach(tilt.rotation.x, 0.035 + clamp(smoothPointer.y, -1, 1) * -0.035 + state.dragY, 4, dt);
  if (!down) {
    state.dragX = approach(state.dragX, 0, 2, dt);
    state.dragY = approach(state.dragY, 0, 2, dt);
  }
  hero.position.y += state.paused ? 0 : Math.sin(t * 0.6) * 0.018;
  panels.forEach((p, i) => {
    p.position.copy(p.userData.base).multiplyScalar(1 + open * 0.19 + state.pulse * 0.025);
    p.children[0].material.opacity = 0.035 + open * 0.025;
  });
  screenMaterial.opacity = 1 - state.reveal * 0.985;
  faceGlass.material.opacity = 0.025 - state.reveal * 0.02;
  glassMat.opacity = 0.3 - state.reveal * 0.1;
  if (points) {
    points.material.opacity = ((state.mode === "test" && chapter === 2 ? 0.34 : 0.08) + state.pulse * 0.18) * state.reveal;
    points.rotation.y = 0;
  }
  core.visible = state.reveal > 0.02;
  if (headMesh) {
    headMesh.rotation.y = clamp(smoothPointer.x, -1, 1) * 0.04;
  }
  tagPivot.rotation.z = state.paused ? 0 : Math.sin(t * 0.7) * 0.055;
  tagPivot.rotation.x = state.paused ? 0 : Math.sin(t * 0.49) * 0.028;
  tileMat.opacity = open * 0.6;
  tiles.forEach((m, i) => {
    const a = m.userData.angle + (state.paused ? 0 : t * 0.04);
    m.position.set(Math.cos(a) * (1.75 + open * 0.15), Math.sin(a) * (1.75 + open * 0.15), -0.25 + Math.sin(a * 2) * 0.2);
    m.rotation.z = a;
  });
  key.color.lerp(lightColors[state.light], 1 - Math.exp(-3 * dt));
  rim.color.lerp(rimColors[state.light], 1 - Math.exp(-3 * dt));
  hoverLight.intensity = state.reveal * 3;
  hoverLight.position.set(hero.position.x + clamp(smoothPointer.x, -1, 1), 1 + clamp(smoothPointer.y, -1, 1), 3);
  bgUniforms.time.value = t;
  bgUniforms.mouse.value.copy(smoothPointer);
  bgUniforms.warm.value = approach(bgUniforms.warm.value, state.light === 2 ? 1 : 0, 3, dt);
  dustUniforms.time.value = t;
  grainPass.uniforms.time.value = t;
  grainPass.uniforms.amount.value = state.paused ? 0.007 : 0.013;
  grainPass.uniforms.glitch.value = state.pulse * 0.4;
  $("#signal-label").textContent =
    state.reveal > 0.5
      ? "Human layer revealed"
      : state.chapter === 1
        ? "Explore a project"
        : state.chapter === 2
          ? "Change the process"
          : "Listening to your cursor";
  $("#reveal-label").innerHTML =
    state.reveal > 0.5 ? "A real human form.<br>A placeholder, until your scan." : "Move over the glass.<br>There’s a person underneath.";
  canvas.style.cursor = state.hover ? "pointer" : "default";
  if (now - lastScreen > 50) {
    drawScreen(t);
    lastScreen = now;
  }
  composer.render();
  document.body.dataset.chapter = String(state.chapter);
  document.body.dataset.reveal = state.reveal > 0.8 ? "open" : "closed";
  document.body.dataset.motion = state.paused ? "paused" : "running";
}
canvas.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  alive = false;
  status.classList.remove("loaded");
  status.textContent = "Graphics paused. Reload this page to restore the study.";
});
canvas.addEventListener("webglcontextrestored", () => location.reload());
document.addEventListener("visibilitychange", () => {
  last = performance.now();
  if (document.hidden && "speechSynthesis" in window) speechSynthesis.cancel();
});
requestAnimationFrame(frame);
