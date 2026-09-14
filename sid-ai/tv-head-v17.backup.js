import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";
import { UltraHDRLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/UltraHDRLoader.js";
import { RoomEnvironment } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js";

const $ = (s) => document.querySelector(s),
  canvas = $("#stage"),
  loader = $("#loader"),
  textEl = $("#dialogueText"),
  choicesEl = $("#choices"),
  soundButton = $("#sound"),
  restartButton = $("#restart"),
  modelMeta = $("#modelMeta");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.45));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.94;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070b);
scene.fog = new THREE.FogExp2(0x071018, 0.042);
const camera = new THREE.PerspectiveCamera(31, innerWidth / innerHeight, 0.1, 80);
camera.position.set(6.8, 2.45, 9.6);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.target.set(1.55, 0.55, 0);
controls.enablePan = false;
controls.minDistance = 7;
controls.maxDistance = 12;
controls.maxPolarAngle = Math.PI * 0.62;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
new UltraHDRLoader().load("./assets/royal_esplanade_2k.hdr.jpg", (t) => {
  t.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = pmrem.fromEquirectangular(t).texture;
  t.dispose();
});

const backdropUniforms = {
  uTime: { value: 0 },
  uPointer: { value: new THREE.Vector2(0.5, 0.5) },
  uReveal: { value: 0 },
  uPulse: { value: 0 },
  uAspect: { value: innerWidth / innerHeight },
};
const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 24),
  new THREE.ShaderMaterial({
    depthWrite: false,
    toneMapped: false,
    uniforms: backdropUniforms,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `
precision highp float;varying vec2 vUv;uniform float uTime,uReveal,uPulse,uAspect;uniform vec2 uPointer;
float n21(vec2 p){return fract(sin(dot(p,vec2(41.31,289.17)))*45758.53);}
void main(){vec2 p=vUv-.5;vec2 m=uPointer-.5;m.x*=uAspect;p.x*=uAspect;float d=length(p-m);float halo=exp(-d*d*4.8);float horizon=smoothstep(.03,.68,abs(p.y+.05));vec3 c=mix(vec3(.018,.025,.043),vec3(.055,.092,.13),1.-horizon);c+=vec3(.03,.16,.24)*exp(-length(p-vec2(.42,.12))*3.8);c+=vec3(.23,.075,.025)*exp(-length(p-vec2(-.48,-.14))*4.6);c+=halo*mix(vec3(.02,.08,.13),vec3(.06,.24,.34),uReveal)*.82;float ring=smoothstep(.018,0.,abs(d-uPulse*.66))*(1.-uPulse);c+=ring*vec3(.45,.72,1.)*.32;float grain=n21(vUv*vec2(1700.,1100.)+uTime*.002)-.5;c+=grain*.012;gl_FragColor=vec4(c,1.);}
`,
  })
);
backdrop.position.set(0, 3, -9);
scene.add(backdrop);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 20),
  new THREE.MeshPhysicalMaterial({ color: 0x070b10, roughness: 0.18, metalness: 0.42, envMapIntensity: 0.65 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.0;
floor.receiveShadow = true;
scene.add(floor);
const pool = new THREE.Mesh(
  new THREE.CircleGeometry(3.3, 96),
  new THREE.MeshBasicMaterial({ color: 0x183449, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })
);
pool.rotation.x = -Math.PI / 2;
pool.position.set(1.55, -1.975, 0);
scene.add(pool);

scene.add(new THREE.HemisphereLight(0xaedaff, 0x100b09, 0.34));
const key = new THREE.SpotLight(0xffe0bd, 76, 22, 0.46, 0.72, 1.4);
key.position.set(-3.2, 7.5, 6);
key.target.position.set(1.25, 1.2, 0);
key.castShadow = true;
key.shadow.mapSize.set(1536, 1536);
scene.add(key, key.target);
const rim = new THREE.SpotLight(0x65cfff, 62, 18, 0.5, 0.78, 1.5);
rim.position.set(6.5, 5, -2.8);
rim.target.position.set(1.4, 1.4, 0);
scene.add(rim, rim.target);
const pointerLight = new THREE.PointLight(0xffa45b, 0, 5.5, 2);
scene.add(pointerLight);

const dustGeometry = new THREE.BufferGeometry(),
  dustCount = 420,
  dustPositions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  dustPositions[i * 3] = (Math.random() - 0.5) * 15;
  dustPositions[i * 3 + 1] = Math.random() * 8 - 2;
  dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1;
}
dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
const dust = new THREE.Points(
  dustGeometry,
  new THREE.PointsMaterial({ color: 0x9ac5d8, size: 0.018, transparent: true, opacity: 0.24, depthWrite: false })
);
scene.add(dust);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.24, 0.32, 1.18);
composer.addPass(bloom);

const STATES = {
  intro: {
    text: "I keep the machine visible. Hover and the person inside answers.",
    choices: [
      ["Show me the work", "work"],
      ["Who are you?", "who"],
      ["Surprise me", "surprise"],
    ],
  },
  work: {
    text: "Product systems, spatial interaction, and prototypes that make the idea tangible.",
    choices: [
      ["Selected projects", "projects"],
      ["How I work", "process"],
      ["Start over", "intro"],
    ],
  },
  who: {
    text: "Siddharth Mehta. Designer, builder, and the human operating this strange little object.",
    choices: [
      ["Meet the designer", "designer"],
      ["Show the work", "work"],
      ["Back", "intro"],
    ],
  },
  surprise: {
    text: "Move slowly across the glass. The robot gives way to the human underneath.",
    choices: [
      ["Continue", "work"],
      ["Again", "intro"],
    ],
  },
  projects: {
    text: "Three case studies, each built around a real constraint and an interaction worth keeping.",
    choices: [
      ["Open portfolio", "external"],
      ["Process", "process"],
      ["Back", "intro"],
    ],
  },
  process: {
    text: "Observe. Prototype the risky part. Tune the behavior. Remove everything that does not earn its place.",
    choices: [
      ["Projects", "projects"],
      ["Start over", "intro"],
    ],
  },
  designer: {
    text: "A product and interaction designer who codes when a static mockup stops being honest.",
    choices: [
      ["See the work", "projects"],
      ["Let’s talk", "mail"],
      ["Back", "intro"],
    ],
  },
};

const forceReveal = new URLSearchParams(location.search).get("reveal") === "1";
let model,
  head,
  idPivot,
  glassMesh,
  baseScale = 1,
  baseY = 0,
  reveal = 0,
  hoverTarget = 0,
  pulse = 0,
  voiceOn = false,
  typeToken = 0,
  state = "intro";
const faceParts = [],
  robotParts = [],
  pointer = new THREE.Vector2(-2, -2),
  smoothPointer = new THREE.Vector2(-2, -2),
  ray = new THREE.Raycaster(),
  clock = new THREE.Clock();

function cloneFadeMaterial(o, opacity) {
  o.material = o.material.clone();
  o.material.transparent = true;
  o.material.opacity = opacity;
  o.material.depthWrite = opacity > 0.5;
  o.userData.fullOpacity = opacity;
}
new GLTFLoader().load(
  "./models/tv-head/sid-tv-character.glb",
  (g) => {
    model = g.scene;
    const box = new THREE.Box3().setFromObject(model),
      size = box.getSize(new THREE.Vector3()),
      center = box.getCenter(new THREE.Vector3());
    baseScale = 5.18 / size.y;
    baseY = -box.min.y * baseScale - 1.7;
    model.scale.setScalar(baseScale);
    model.position.set(-center.x * baseScale + 1.62, baseY, -center.z * baseScale);
    model.rotation.y = 0.035;
    scene.add(model);
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.name.startsWith("FACE_")) {
          cloneFadeMaterial(o, 0);
          faceParts.push(o);
        }
        if (o.name.startsWith("ROBOT_")) {
          cloneFadeMaterial(o, 1);
          robotParts.push(o);
        }
        if (/^JACKET_(?!POCKET|HEM)/.test(o.name))
          o.material = new THREE.MeshPhysicalMaterial({
            color: 0x527f9f,
            roughness: 0.78,
            metalness: 0,
            sheen: 0.32,
            sheenColor: new THREE.Color(0x9bc0d4),
          });
        if (/JACKET_POCKET|JACKET_HEM|KNIT_SWEATER/.test(o.name)) o.material = new THREE.MeshStandardMaterial({ color: 0x172947, roughness: 0.88 });
        if (o.name.startsWith("SHEARLING_")) o.material = new THREE.MeshStandardMaterial({ color: 0xcdb78f, roughness: 0.96 });
        if (/^HUMAN_(FOREARM|HAND|NECK)/.test(o.name)) o.material = new THREE.MeshPhysicalMaterial({ color: 0x81503b, roughness: 0.58, sheen: 0.08 });
        if (o.name === "CUBE_GLASS") {
          glassMesh = o;
          o.material = new THREE.MeshPhysicalMaterial({
            color: 0xbdeaff,
            roughness: 0.035,
            metalness: 0.02,
            transmission: 0.92,
            thickness: 0.55,
            ior: 1.46,
            transparent: true,
            opacity: 0.42,
            clearcoat: 1,
            clearcoatRoughness: 0.035,
            envMapIntensity: 2.4,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
        }
        if (o.name === "CUBE_INNER_SHADOW") {
          o.material = new THREE.MeshPhysicalMaterial({
            color: 0x07111d,
            roughness: 0.12,
            metalness: 0.22,
            transmission: 0.45,
            thickness: 0.12,
            transparent: true,
            opacity: 0.22,
            depthWrite: false,
          });
        }
      }
      if (o.name === "Head_Root") head = o;
      if (o.name === "Parsons_ID_Pivot") idPivot = o;
    });
    loader.classList.add("done");
    renderState("intro", false);
  },
  undefined,
  (e) => {
    loader.textContent = "Model failed to load";
    console.error(e);
  }
);

function voice() {
  const list = speechSynthesis.getVoices();
  return list.find((v) => /Daniel|Samantha|Ryan/i.test(v.name)) || list.find((v) => /^en/i.test(v.lang)) || list[0];
}
function speak(value) {
  if (!voiceOn || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(value);
  u.voice = voice();
  u.rate = 0.91;
  u.pitch = 0.84;
  u.volume = 0.82;
  speechSynthesis.speak(u);
}
function typeLine(value) {
  const token = ++typeToken;
  textEl.textContent = "";
  let i = 0;
  const tick = () => {
    if (token !== typeToken) return;
    textEl.textContent = value.slice(0, i++);
    if (i <= value.length) setTimeout(tick, 16 + Math.random() * 15);
  };
  tick();
}
function renderState(next, announce = true) {
  state = next;
  const data = STATES[next];
  typeLine(data.text);
  choicesEl.replaceChildren();
  data.choices.forEach(([label, target]) => {
    const b = document.createElement("button");
    b.className = "choice";
    b.textContent = label;
    b.onclick = () => choose(target);
    choicesEl.append(b);
  });
  restartButton.classList.toggle("visible", next !== "intro");
  pulse = 0.001;
  if (announce) speak(data.text);
}
function choose(target) {
  if (target === "external") {
    location.href = "https://siddharthmehta.design";
    return;
  }
  if (target === "mail") {
    location.href = "mailto:hello@siddharthmehta.design";
    return;
  }
  renderState(target);
}
soundButton.onclick = () => {
  voiceOn = !voiceOn;
  soundButton.setAttribute("aria-pressed", String(voiceOn));
  soundButton.textContent = voiceOn ? "◖)))" : "◖))";
  voiceOn ? speak(STATES[state].text) : speechSynthesis.cancel();
};
restartButton.onclick = () => renderState("intro");

addEventListener("pointermove", (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, (-e.clientY / innerHeight) * 2 + 1);
  backdropUniforms.uPointer.value.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight);
});
canvas.addEventListener("pointerdown", () => {
  if (!model) return;
  ray.setFromCamera(pointer, camera);
  if (ray.intersectObject(model, true).length) {
    pulse = 0.001;
    renderState(state);
  }
});
function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 760 ? 1.05 : 1.45));
  renderer.setSize(innerWidth, innerHeight, false);
  composer.setSize(innerWidth, innerHeight);
  backdropUniforms.uAspect.value = innerWidth / innerHeight;
}
addEventListener("resize", resize);
document.addEventListener("visibilitychange", () => {
  if (document.hidden && "speechSynthesis" in window) speechSynthesis.cancel();
});

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.033, clock.getDelta()),
    t = clock.elapsedTime;
  smoothPointer.lerp(pointer, 0.055);
  controls.update();
  backdropUniforms.uTime.value = t;
  if (pulse > 0) {
    pulse += dt * 0.72;
    if (pulse > 1) pulse = 0;
  }
  backdropUniforms.uPulse.value = pulse;
  if (model) {
    ray.setFromCamera(pointer, camera);
    hoverTarget = forceReveal ? 1 : ray.intersectObject(model, true).length ? 1 : 0;
    reveal += (hoverTarget - reveal) * 0.075;
    canvas.style.cursor = hoverTarget ? "pointer" : "grab";
    modelMeta.classList.toggle("visible", reveal > 0.28);
    backdropUniforms.uReveal.value = reveal;
    const humanFade = THREE.MathUtils.smoothstep(reveal, 0.12, 0.86);
    faceParts.forEach((o) => {
      o.visible = humanFade > 0.01;
      o.material.opacity = humanFade;
      o.material.depthWrite = humanFade > 0.72;
    });
    robotParts.forEach((o) => {
      o.visible = reveal < 0.54;
      o.material.opacity = 1 - THREE.MathUtils.smoothstep(reveal, 0.08, 0.52);
      o.scale.y = 0.25 + 0.75 * (1 - reveal);
    });
    if (glassMesh) glassMesh.material.opacity = 0.42 - reveal * 0.16;
    model.rotation.y = 0.035 + smoothPointer.x * 0.018;
    pointerLight.intensity = reveal * 28;
    pointerLight.position.set(1.65 + smoothPointer.x * 1.7, 1.5 + smoothPointer.y * 0.9, 2.4);
  }
  if (head) {
    head.rotation.x += (smoothPointer.y * 0.018 - head.rotation.x) * 0.035;
    head.rotation.z += (-smoothPointer.x * 0.018 - head.rotation.z) * 0.035;
  }
  if (idPivot) {
    idPivot.rotation.z = Math.sin(t * 0.72) * 0.035 + smoothPointer.x * 0.018;
    idPivot.rotation.x = Math.sin(t * 0.43) * 0.018;
    idPivot.position.y = Math.sin(t * 0.62) * 0.018;
  }
  dust.rotation.y = t * 0.004;
  pool.material.opacity = 0.16 + reveal * 0.1;
  composer.render();
}
frame();
