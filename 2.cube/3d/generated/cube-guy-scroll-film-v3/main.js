import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector("#film-canvas");
const stage = document.querySelector(".film-stage");
const chapterNumber = document.querySelector(".chapter__number");
const chapterLine = document.querySelector(".chapter__line");
const progressLine = document.querySelector(".film-progress i");
const scrollHint = document.querySelector(".scroll-hint");
const playButton = document.querySelector("#play-film");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 80);
camera.position.set(0, 0.25, 12);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

scene.add(new THREE.HemisphereLight(0xf8f1e6, 0x43506b, 2.3));
const key = new THREE.DirectionalLight(0xfff1cf, 4.2);
key.position.set(-4, 7, 7);
scene.add(key);
const rim = new THREE.DirectionalLight(0x6e91c6, 2.2);
rim.position.set(5, 2, -4);
scene.add(rim);

const ink = new THREE.Color(0x202125);
const parallax = new THREE.Group();
scene.add(parallax);
const character = new THREE.Group();
character.position.set(0.65, 0.1, 0);
parallax.add(character);

const sharedUniforms = [];
const loader = new THREE.TextureLoader();
const asset = (name) => new URL(`./assets/${name}`, import.meta.url).href;

const textureFiles = [null, "face-childhood.webp", "face-education.webp", "face-time.webp", "face-spirit.webp", "face-language.webp"];

const textures = await Promise.all(
  textureFiles.map(async (file) => {
    if (!file) {
      const data = new Uint8Array([236, 230, 218, 255]);
      const texture = new THREE.DataTexture(data, 1, 1);
      texture.needsUpdate = true;
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }
    const texture = await loader.loadAsync(asset(file));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  })
);

const vertexShader = `
  uniform float uTime;
  uniform float uFlow;
  varying vec2 vUv;
  varying float vWobble;
  void main() {
    vUv = uv;
    vec3 p = position;
    float wave = sin((p.x * 4.1 + p.y * 3.3) + uTime * 0.65) * 0.008 * uFlow;
    p.z += wave;
    vWobble = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uMemory;
  uniform float uOpacity;
  uniform float uPaint;
  uniform vec2 uPointer;
  uniform vec3 uTintA;
  uniform vec3 uTintB;
  varying vec2 vUv;
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1.)), f.x), f.y);
  }
  void main() {
    vec2 drift = vec2(noise(vUv * 2.8 + uTime * .035), noise(vUv * 3.2 - uTime * .027)) - .5;
    vec2 uv = clamp(vUv + drift * .025 * uPaint, 0., 1.);
    vec3 memory = texture2D(uMap, uv).rgb;
    float wash = smoothstep(.18, .92, noise(vUv * 3.1 + drift + uPointer * .15));
    vec3 watercolor = mix(uTintA, uTintB, wash);
    vec3 paper = vec3(.925, .895, .84);
    vec3 color = mix(paper, memory, uMemory);
    color = mix(color, watercolor, uPaint * .7);
    float edgeDistance = min(min(vUv.x, 1. - vUv.x), min(vUv.y, 1. - vUv.y));
    float edge = 1. - smoothstep(.012, .029, edgeDistance);
    color = mix(color, vec3(.105, .108, .12), edge * .9);
    float grain = hash(gl_FragCoord.xy + uTime) - .5;
    color += grain * .035;
    gl_FragColor = vec4(color, uOpacity);
  }
`;

function faceMaterial(texture, tintA, tintB) {
  const uniforms = {
    uMap: { value: texture },
    uTime: { value: 0 },
    uFlow: { value: 0.15 },
    uMemory: { value: 0 },
    uOpacity: { value: 1 },
    uPaint: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
    uTintA: { value: new THREE.Color(tintA) },
    uTintB: { value: new THREE.Color(tintB) },
  };
  sharedUniforms.push(uniforms);
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
}

const head = new THREE.Group();
head.position.y = 2.15;
character.add(head);

const faceSize = 1.62;
const half = faceSize / 2;
const faceGeometry = new THREE.PlaneGeometry(faceSize, faceSize, 18, 18);
const faceSpecs = [
  { name: "front", position: [0, 0, half], rotation: [0, 0, 0], colors: [0xd9d2c5, 0xb9c9d9] },
  { name: "right", position: [half, 0, 0], rotation: [0, Math.PI / 2, 0], colors: [0xb44e40, 0xe2aa67] },
  { name: "top", position: [0, half, 0], rotation: [-Math.PI / 2, 0, 0], colors: [0x335f92, 0xbab3d7] },
  { name: "left", position: [-half, 0, 0], rotation: [0, -Math.PI / 2, 0], colors: [0x372f4f, 0xb55080] },
  { name: "back", position: [0, 0, -half], rotation: [0, Math.PI, 0], colors: [0x2a3f68, 0xe0b45f] },
  { name: "bottom", position: [0, -half, 0], rotation: [Math.PI / 2, 0, 0], colors: [0xb54839, 0x314f85] },
];

const faces = faceSpecs.map((spec, index) => {
  const material = faceMaterial(textures[index], ...spec.colors);
  const mesh = new THREE.Mesh(faceGeometry, material);
  mesh.name = spec.name;
  mesh.userData.finalPosition = new THREE.Vector3(...spec.position);
  mesh.userData.finalRotation = new THREE.Euler(...spec.rotation);
  if (index === 0) {
    mesh.position.copy(mesh.userData.finalPosition);
    mesh.rotation.copy(mesh.userData.finalRotation);
  } else {
    mesh.position.set((index % 2 ? 1 : -1) * (3.1 + index * 0.18), (index - 2.5) * 0.3, -1.2);
    mesh.rotation.set(0, 0, (index % 2 ? 1 : -1) * 0.08);
    mesh.scale.setScalar(1.55);
    material.uniforms.uOpacity.value = 0;
  }
  head.add(mesh);
  return mesh;
});

function roundedEye(x) {
  const eye = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.18, 5, 10), new THREE.MeshBasicMaterial({ color: ink }));
  eye.position.set(x, 0.12, 0.022);
  return eye;
}

const front = faces[0];
front.add(roundedEye(-0.27), roundedEye(0.27));
const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.018, 0.018), new THREE.MeshBasicMaterial({ color: ink }));
mouth.position.set(0, -0.27, 0.025);
front.add(mouth);

const gltfLoader = new GLTFLoader();
const bodyAsset = await gltfLoader.loadAsync(asset("cube-guy-rigged.glb"));
const body = bodyAsset.scene;
body.name = "authored-rig";
body.position.set(0, -2.87, 0);
body.scale.set(3.18, 0.003, 3.18);
body.visible = false;
body.traverse((node) => {
  if (["CG_Head", "CG_Eye_L", "CG_Eye_R", "CG_Mouth"].includes(node.name)) node.visible = false;
  if (!node.isMesh) return;
  node.castShadow = false;
  node.receiveShadow = false;
  const materials = Array.isArray(node.material) ? node.material : [node.material];
  materials.forEach((material) => {
    material.roughness = 0.94;
    material.metalness = 0;
    if (node.name === "CG_Shirt") material.color.set(0x2b2b2e);
    if (node.name === "CG_Trousers") material.color.set(0x31496f);
    if (node.name === "CG_Body") material.color.set(0xd8d0c4);
    if (node.name === "CG_Shoes") material.color.set(0x222a3b);
  });
});
character.add(body);

const mixer = new THREE.AnimationMixer(body);
const clips = Object.fromEntries(bodyAsset.animations.map((clip) => [clip.name, clip]));
let activeClipName = "";
let activeAction;

function animationAt(time) {
  if (time < 3.05) return null;
  if (time < 6.2) return ["Walk", time - 3.05];
  if (time < 9.2) return ["Wave", time - 6.2];
  if (time < 13.0) return ["Look", time - 9.2];
  if (time < 17.0) return ["Idle", time - 13.0];
  if (time < 21.0) return ["ThoughtRelease", time - 17.0];
  if (time < 23.5) return ["Look", time - 21.0];
  if (time < 26.2) return ["ClickReact", time - 23.5];
  return ["Idle", time - 26.2];
}

function scrubBodyAnimation(time) {
  const selection = animationAt(time);
  if (!selection) return;
  const [name, localTime] = selection;
  const clip = clips[name];
  if (!clip) return;
  if (name !== activeClipName) {
    activeAction?.stop();
    activeClipName = name;
    activeAction = mixer.clipAction(clip);
    activeAction.play();
  }
  mixer.setTime(localTime % Math.max(0.01, clip.duration));
}

const cap = new THREE.Group();
const capMat = new THREE.MeshStandardMaterial({ color: 0x24486d, roughness: 0.96, transparent: true, opacity: 0 });
const crown = new THREE.Mesh(new THREE.SphereGeometry(0.91, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
crown.scale.y = 0.58;
const brim = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.07, 0.58), capMat);
brim.position.set(0, 0.08, 0.72);
brim.rotation.x = -0.16;
cap.add(crown, brim);
cap.position.set(0, 0.79, 0.03);
cap.scale.setScalar(0.01);
head.add(cap);

const brush = new THREE.Group();
const brushHandle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.035, 0.035, 1.25, 8),
  new THREE.MeshStandardMaterial({ color: 0x8d4d39, roughness: 1 })
);
const brushTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 8), new THREE.MeshStandardMaterial({ color: 0x355b91, roughness: 1 }));
brushTip.position.y = 0.74;
brush.add(brushHandle, brushTip);
brush.visible = false;
brush.position.set(1.4, 1.2, 0.45);
brush.rotation.z = -0.45;
character.add(brush);

const dustGeometry = new THREE.BufferGeometry();
const dustCount = 170;
const dustPositions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i += 1) {
  dustPositions[i * 3] = (Math.random() - 0.5) * 16;
  dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 9;
  dustPositions[i * 3 + 2] = -2 - Math.random() * 5;
}
dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
const dust = new THREE.Points(
  dustGeometry,
  new THREE.PointsMaterial({ color: 0x5a5960, size: 0.015, transparent: true, opacity: 0.22, depthWrite: false })
);
scene.add(dust);

const chapters = [
  [0, "A square arrived with only one point of view."],
  [3.8, "Depth began when another side answered."],
  [7.3, "Making gave the first face a memory."],
  [11.2, "Learning added a way to read the world."],
  [15.1, "Time taught him that every view keeps moving."],
  [19.0, "Stillness made room for what could not be measured."],
  [22.8, "Language connected the faces he had collected."],
  [25.7, "Then he painted the face he wanted."],
  [28.2, "Creation was not the answer. It was how he kept becoming."],
];

let currentChapter = -1;
function updateChapter(time) {
  let index = 0;
  for (let i = 0; i < chapters.length; i += 1) if (time >= chapters[i][0]) index = i;
  if (index === currentChapter) return;
  currentChapter = index;
  gsap.to([chapterNumber, chapterLine], {
    opacity: 0,
    y: 8,
    duration: 0.16,
    overwrite: true,
    onComplete: () => {
      chapterNumber.textContent = String(index + 1).padStart(2, "0");
      chapterLine.textContent = chapters[index][1];
      gsap.fromTo([chapterNumber, chapterLine], { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.32, stagger: 0.035 });
    },
  });
}

function addFace(timeline, index, time) {
  const face = faces[index];
  const uniforms = face.material.uniforms;
  const end = face.userData.finalPosition;
  const rotation = face.userData.finalRotation;
  timeline
    .to(uniforms.uOpacity, { value: 0.92, duration: 0.32 }, time)
    .to(face.scale, { x: 1, y: 1, z: 1, duration: 1.25, ease: "power3.inOut" }, time)
    .to(face.position, { x: end.x, y: end.y, z: end.z, duration: 1.25, ease: "power3.inOut" }, time)
    .to(face.rotation, { x: rotation.x, y: rotation.y, z: rotation.z, duration: 1.25, ease: "power3.inOut" }, time)
    .to(uniforms.uMemory, { value: 0.78, duration: 0.72, ease: "power2.out" }, time + 0.56);
}

const timeline = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
timeline.duration(30);

timeline
  .fromTo(character.position, { x: -2.4, y: -2.15 }, { x: 0.65, y: -0.55, duration: 3.5, ease: "power3.out" }, 0)
  .fromTo(head.rotation, { z: -0.18 }, { z: 0.05, duration: 3.5, ease: "power3.out" }, 0)
  .fromTo(camera.position, { z: 13.5 }, { z: 11.2, duration: 3.5, ease: "power2.out" }, 0)
  .to(front.material.uniforms.uFlow, { value: 0.7, duration: 1.2 }, 2.2)
  .set(body, { visible: true }, 3.05)
  .to(body.scale, { y: 3.18, duration: 1.25, ease: "power3.out" }, 3.15)
  .to(character.position, { y: 0.15, duration: 1.25 }, 3.15)
  .to(head.rotation, { y: -0.22, x: 0.04, duration: 1.1 }, 4.1)
  .to(character.position, { x: -0.35, duration: 2.1, ease: "sine.inOut" }, 4.25);

addFace(timeline, 1, 5.4);
timeline
  .to(head.rotation, { y: 0.42, z: -0.07, duration: 0.9 }, 6.15)
  .to(capMat, { opacity: 1, duration: 0.55 }, 7.35)
  .to(cap.scale, { x: 1, y: 1, z: 1, duration: 0.78, ease: "back.out(1.5)" }, 7.35)
  .to(character.rotation, { y: -0.16, duration: 1.1 }, 8.1);

addFace(timeline, 2, 9.25);
timeline.to(head.rotation, { y: -0.35, x: -0.1, z: 0.02, duration: 1.2 }, 10.4).to(camera.position, { x: 1.0, z: 10.5, duration: 1.7 }, 10.25);

addFace(timeline, 3, 13.0);
timeline
  .to(character.rotation, { y: 0.28, duration: 1.4 }, 13.45)
  .to(camera.position, { x: -1.0, y: 0.35, z: 10.8, duration: 1.7 }, 13.3)
  .to(head.rotation, { y: 0.55, x: 0.08, duration: 1.25 }, 14.2);

addFace(timeline, 4, 16.7);
timeline
  .to(character.rotation, { y: -0.08, duration: 1.1 }, 17.0)
  .to(character.position, { y: 0.05, duration: 1.3 }, 17.0)
  .to(head.rotation, { x: -0.16, y: 0.02, z: 0, duration: 1.25 }, 17.4)
  .to(camera.position, { x: 0, y: 0.65, z: 10.8, duration: 1.5 }, 17.1);

addFace(timeline, 5, 20.45);
timeline
  .to(character.position, { y: 0.15, duration: 1.25 }, 20.7)
  .to(head.rotation, { y: -0.48, x: 0.04, duration: 1.25 }, 21.1)
  .to(camera.position, { x: 1.2, y: 0.25, z: 10.75, duration: 1.6 }, 20.8);

timeline
  .set(brush, { visible: true }, 23.4)
  .fromTo(brush.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: 1, y: 1, z: 1, duration: 0.48 }, 23.5)
  .to(brush.position, { x: 0.92, y: 2.75, z: 0.55, duration: 1.0, ease: "power2.inOut" }, 23.65)
  .to(
    sharedUniforms.map((u) => u.uPaint),
    { value: 1, duration: 2.0, stagger: 0.07 },
    24.0
  )
  .to(
    sharedUniforms.map((u) => u.uFlow),
    { value: 1, duration: 1.2 },
    24.0
  )
  .to(head.rotation, { y: 0.45, x: -0.08, duration: 1.9 }, 24.0)
  .to(brush.position, { x: 1.35, y: 2.1, z: 0.72, duration: 1.0 }, 24.7)
  .to(brush.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.45, ease: "power2.in" }, 25.7)
  .set(brush, { visible: false }, 26.15)
  .to(camera.position, { x: 0, y: 0.32, z: 10.2, duration: 1.6 }, 25.2)
  .to(character.rotation, { y: -0.18, duration: 1.2 }, 25.4)
  .to(character.position, { x: 0.35, y: 0.12, duration: 1.2 }, 25.4)
  .to(head.rotation, { y: Math.PI * 0.24, x: -0.12, z: 0.03, duration: 1.4 }, 26.3)
  .to(head.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 1.7, ease: "power3.inOut" }, 27.1)
  .to(camera.position, { x: -0.45, y: 0.28, z: 10.6, duration: 1.7, ease: "power3.inOut" }, 27.1)
  .to(body.scale, { x: 3.18, y: 3.18, z: 3.18, duration: 1.2 }, 27.4)
  .to(dust.material, { opacity: 0.38, size: 0.025, duration: 1.4 }, 27.5)
  .to(head.rotation, { y: Math.PI * 0.42, x: 0.02, duration: 1.7, ease: "sine.inOut" }, 28.25);

const state = { time: reducedMotion ? 30 : 0 };
if (reducedMotion) timeline.time(30);

let scrollTrigger;
if (!reducedMotion) {
  scrollTrigger = ScrollTrigger.create({
    trigger: "#film",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.72,
    onUpdate(self) {
      state.time = self.progress * 30;
      timeline.time(state.time, false);
      progressLine.style.transform = `scaleX(${self.progress})`;
      scrollHint.style.opacity = String(Math.max(0, 1 - self.progress * 10));
      updateChapter(state.time);
    },
  });
}

const pointer = new THREE.Vector2();
window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / innerHeight) * 2 + 1;
});

let autoPlayFrame = 0;
function stopAutoPlay() {
  cancelAnimationFrame(autoPlayFrame);
  autoPlayFrame = 0;
  playButton.textContent = "Play 30s";
}

function autoPlay() {
  if (autoPlayFrame || reducedMotion) return stopAutoPlay();
  const startScroll = scrollY;
  const endScroll = document.documentElement.scrollHeight - innerHeight;
  const remaining = Math.max(0.5, 30 * (1 - startScroll / Math.max(1, endScroll)));
  const startTime = performance.now();
  playButton.textContent = "Pause";
  const step = (now) => {
    const t = Math.min(1, (now - startTime) / (remaining * 1000));
    scrollTo(0, THREE.MathUtils.lerp(startScroll, endScroll, t));
    if (t < 1) autoPlayFrame = requestAnimationFrame(step);
    else stopAutoPlay();
  };
  autoPlayFrame = requestAnimationFrame(step);
}

playButton.addEventListener("click", autoPlay);
window.addEventListener("wheel", stopAutoPlay, { passive: true });
window.addEventListener("touchstart", stopAutoPlay, { passive: true });

const clock = new THREE.Clock();
function render() {
  const elapsed = clock.getElapsedTime();
  scrubBodyAnimation(state.time);
  sharedUniforms.forEach((uniforms) => {
    uniforms.uTime.value = elapsed;
    uniforms.uPointer.value.lerp(pointer, 0.035);
  });
  dust.rotation.z = Math.sin(elapsed * 0.09) * 0.025;
  if (!reducedMotion) {
    parallax.rotation.y += (pointer.x * 0.022 - parallax.rotation.y) * 0.035;
    parallax.rotation.x += (-pointer.y * 0.012 - parallax.rotation.x) * 0.035;
  }
  camera.lookAt(0, 0.25, 0);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  ScrollTrigger.refresh();
});

updateChapter(state.time);
