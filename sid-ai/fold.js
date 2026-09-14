import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/+esm";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger/+esm";

gsap.registerPlugin(ScrollTrigger);
const params = new URLSearchParams(location.search),
  capture = params.get("capture") === "1",
  reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (capture) document.documentElement.classList.add("capture");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
  preserveDrawingBuffer: capture,
});
renderer.setPixelRatio(capture ? 1 : Math.min(devicePixelRatio, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(31, innerWidth / innerHeight, 0.02, 50);
camera.position.set(0, 0, 8);
const clock = new THREE.Clock();
const pmrem = new THREE.PMREMGenerator(renderer),
  env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
scene.environment = env;
scene.add(new THREE.HemisphereLight(0xffffff, 0x9da5b6, 2.2));
const key = new THREE.DirectionalLight(0xffffff, 4.5);
key.position.set(-3, 4, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
scene.add(key);
const blueLight = new THREE.PointLight(0x1647ff, 18, 9, 2);
blueLight.position.set(2, -0.5, 2);
scene.add(blueLight);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ color: 0x41434a, opacity: 0.12 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.15;
floor.receiveShadow = true;
scene.add(floor);
const paper = new THREE.MeshPhysicalMaterial({
    color: 0xe9e5dc,
    roughness: 0.72,
    metalness: 0.02,
    clearcoat: 0.12,
    clearcoatRoughness: 0.75,
    envMapIntensity: 0.45,
  }),
  graphite = new THREE.MeshStandardMaterial({
    color: 0x151719,
    roughness: 0.46,
    metalness: 0.18,
  }),
  cobalt = new THREE.MeshPhysicalMaterial({
    color: 0x1647ff,
    roughness: 0.18,
    metalness: 0.38,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.3,
  });
const bodyPaper = paper.clone();
bodyPaper.transparent = true;
bodyPaper.opacity = 0.06;
const object = new THREE.Group();
object.position.set(0.95, 0, 0);
object.scale.z = 0.03;
scene.add(object);
const body = new THREE.Mesh(new RoundedBoxGeometry(2.15, 2.15, 1.68, 7, 0.08), bodyPaper);
body.castShadow = true;
body.receiveShadow = true;
object.add(body);
const edges = new THREE.LineSegments(
  new THREE.EdgesGeometry(body.geometry, 28),
  new THREE.LineBasicMaterial({
    color: 0x111317,
    transparent: true,
    opacity: 0.58,
  })
);
body.add(edges);
const face = new THREE.Group();
face.position.z = 0.855;
object.add(face);
const eyeGeo = new THREE.SphereGeometry(0.18, 36, 22),
  pupilGeo = new THREE.SphereGeometry(0.07, 28, 18),
  eyes = [];
[-0.38, 0.38].forEach((x) => {
  const socket = new THREE.Mesh(eyeGeo, graphite);
  socket.scale.set(1, 0.8, 0.42);
  socket.position.x = x;
  face.add(socket);
  const pupil = new THREE.Mesh(pupilGeo, cobalt);
  pupil.position.set(x, 0, 0.16);
  pupil.scale.set(1, 0.85, 0.45);
  face.add(pupil);
  eyes.push({ socket, pupil, base: x });
});
const mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.2, 8, 18), graphite);
mouth.rotation.z = Math.PI / 2;
mouth.scale.y = 0.7;
mouth.position.set(0, -0.43, 0.13);
face.add(mouth);
face.scale.y = 0.001;
const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.52, 5), cobalt);
core.scale.setScalar(0.001);
object.add(core);
const coreGlow = new THREE.PointLight(0x1647ff, 0, 5, 2);
object.add(coreGlow);
const panels = [];
const panelGeo = new THREE.BoxGeometry(2.08, 2.08, 0.045);
for (let i = 0; i < 4; i++) {
  const pivot = new THREE.Group(),
    panel = new THREE.Mesh(panelGeo, paper);
  panel.castShadow = true;
  pivot.add(panel);
  pivot.position.z = i < 2 ? 0.87 : -0.87;
  if (i === 0) {
    pivot.position.x = -1.06;
    panel.position.x = 1.06;
    pivot.userData.axis = "y";
    pivot.userData.sign = -1;
  } else if (i === 1) {
    pivot.position.x = 1.06;
    panel.position.x = -1.06;
    pivot.userData.axis = "y";
    pivot.userData.sign = 1;
  } else if (i === 2) {
    pivot.position.y = 1.06;
    panel.position.y = -1.06;
    pivot.userData.axis = "x";
    pivot.userData.sign = -1;
  } else {
    pivot.position.y = -1.06;
    panel.position.y = 1.06;
    pivot.userData.axis = "x";
    pivot.userData.sign = 1;
  }
  panel.visible = false;
  object.add(pivot);
  panels.push(pivot);
}
const lineMat = new THREE.LineBasicMaterial({
    color: 0x151719,
    transparent: true,
    opacity: 0.86,
    depthTest: false,
  }),
  drawGeo = new THREE.BufferGeometry(),
  drawLine = new THREE.Line(drawGeo, lineMat);
drawLine.position.z = 0.94;
drawLine.renderOrder = 10;
drawLine.frustumCulled = false;
object.add(drawLine);
const corners = [
    new THREE.Vector3(-1.18, -1.18, 0),
    new THREE.Vector3(1.18, -1.18, 0),
    new THREE.Vector3(1.18, 1.18, 0),
    new THREE.Vector3(-1.18, 1.18, 0),
    new THREE.Vector3(-1.18, -1.18, 0),
  ],
  draw = { value: 0 };
const pencil = new THREE.Group(),
  shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.78, 12), cobalt),
  tip = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.18, 12), graphite);
shaft.rotation.z = -Math.PI / 4;
tip.rotation.z = -Math.PI / 4;
tip.position.set(0.34, -0.34, 0);
pencil.add(shaft, tip);
pencil.position.z = 0.99;
object.add(pencil);
function samplePath(t) {
  const scaled = THREE.MathUtils.clamp(t, 0, 1) * 4,
    i = Math.min(3, Math.floor(scaled)),
    f = scaled - i;
  return corners[i].clone().lerp(corners[i + 1], f);
}
function updateDrawing() {
  const count = Math.max(2, Math.floor(draw.value * 80)),
    pts = [];
  for (let i = 0; i < count; i++) {
    const p = samplePath((i / (count - 1)) * draw.value);
    p.x += Math.sin(i * 12.3) * 0.003;
    p.y += Math.sin(i * 7.1) * 0.003;
    pts.push(p);
  }
  drawGeo.setFromPoints(pts);
  drawGeo.computeBoundingSphere();
  pencil.position.copy(samplePath(draw.value));
  pencil.position.z = 0.99;
}
const particles = [],
  particleGeo = new THREE.SphereGeometry(0.018, 8, 6);
for (let i = 0; i < 110; i++) {
  const m = new THREE.Mesh(particleGeo, i % 7 === 0 ? cobalt : graphite),
    a = i * 0.618 * Math.PI * 2,
    r = 0.9 + (i % 13) * 0.045;
  m.position.set(Math.cos(a) * r, Math.sin(a) * r, ((i % 9) - 4) * 0.08);
  m.scale.setScalar(0.001);
  m.userData = { home: m.position.clone(), v: new THREE.Vector3() };
  object.add(m);
  particles.push(m);
}
const state = { p: 0, hold: 0 },
  pointer = new THREE.Vector2(),
  targetPointer = new THREE.Vector2();
addEventListener("pointermove", (e) => targetPointer.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)));
addEventListener("pointerdown", () => gsap.to(state, { hold: 1, duration: 0.75, ease: "power3.out" }));
addEventListener("pointerup", () => gsap.to(state, { hold: 0, duration: 1.1, ease: "elastic.out(1,.45)" }));
gsap
  .timeline({ defaults: { ease: "power3.inOut" } })
  .to(draw, { value: 1, duration: 1.65, onUpdate: updateDrawing })
  .to(pencil.scale, { x: 0, y: 0, z: 0, duration: 0.35 }, "-=.12");
if (!capture) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".story",
      start: "top top",
      end: "bottom bottom",
      scrub: reduced ? false : 0.85,
      onUpdate: (s) => {
        state.p = s.progress;
        gsap.set(".rail i", { y: s.progress * 128 });
      },
    },
  });
  tl.to(".sketch", { opacity: 0, scale: 0.82, duration: 0.55, ease: "none" }, 0)
    .to(object.scale, { z: 1, duration: 0.86, ease: "none" }, 0)
    .to(object.position, { x: -1.15, duration: 1, ease: "none" }, 0)
    .to(object.rotation, { x: -0.12, y: 0.62, z: -0.04, duration: 1, ease: "none" }, 0)
    .to(face.scale, { y: 1, duration: 0.18, ease: "power3.out" }, 0.72)
    .to(object.position, { x: 1.08, y: 0.05, duration: 1, ease: "none" }, 1)
    .to(object.rotation, { x: 0.08, y: -0.5, z: 0.03, duration: 1, ease: "none" }, 1)
    .to(core.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: "back.out(1.4)" }, 1.68)
    .to(coreGlow, { intensity: 22, duration: 0.35 }, 1.68)
    .to(object.position, { x: -1.1, y: 0, duration: 1, ease: "none" }, 2)
    .to(object.rotation, { x: 0, y: 0.2, z: 0, duration: 1, ease: "none" }, 2);
  gsap.utils.toArray(".copy").forEach((c) =>
    gsap.fromTo(
      c,
      { autoAlpha: 0.1, y: 50 },
      {
        autoAlpha: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: c.parentElement,
          start: "top 75%",
          end: "center 52%",
          scrub: 0.5,
        },
      }
    )
  );
}
function animate() {
  const dt = Math.min(0.033, clock.getDelta());
  pointer.lerp(targetPointer, 0.08);
  const p = state.p,
    open = THREE.MathUtils.smoothstep(p, 0.63, 0.86) * (0.72 + state.hold * 0.28);
  panels.forEach((pivot) => {
    pivot.children[0].visible = open > 0.01;
    pivot.rotation[pivot.userData.axis] = pivot.userData.sign * open * 1.24;
  });
  const solid = THREE.MathUtils.smoothstep(p, 0.04, 0.24);
  drawLine.material.opacity = 0.86 * (1 - THREE.MathUtils.smoothstep(p, 0.12, 0.3));
  body.material.opacity = solid * (1 - open * 0.88);
  body.material.transparent = true;
  body.visible = open < 0.98;
  face.visible = open < 0.7;
  eyes.forEach(({ pupil, base }) => {
    pupil.position.x = THREE.MathUtils.lerp(pupil.position.x, base + pointer.x * 0.055, 0.08);
    pupil.position.y = THREE.MathUtils.lerp(pupil.position.y, pointer.y * 0.06, 0.08);
  });
  particles.forEach((m, i) => {
    m.scale.setScalar(THREE.MathUtils.smoothstep(p, 0.54, 0.75));
    const home = m.userData.home,
      swirl = new THREE.Vector3(-home.y, home.x, Math.sin(i + p * 8) * 0.12).multiplyScalar(0.18 + state.hold * 0.75),
      pointerForce = new THREE.Vector3(pointer.x * 1.6, pointer.y * 1.1, 0.4).sub(m.position).multiplyScalar(state.hold * 0.012);
    m.userData.v
      .add(swirl.multiplyScalar(dt))
      .add(pointerForce)
      .add(
        home
          .clone()
          .sub(m.position)
          .multiplyScalar(dt * 0.7)
      )
      .multiplyScalar(0.965);
    m.position.addScaledVector(m.userData.v, dt * 4);
  });
  core.rotation.x += dt * 0.18;
  core.rotation.y += dt * 0.27;
  const coreScale = Math.max(0.001, THREE.MathUtils.smoothstep(p, 0.52, 0.7) * (1 + state.hold * 0.16));
  core.scale.setScalar(coreScale);
  coreGlow.intensity = 22 * THREE.MathUtils.smoothstep(p, 0.52, 0.7) * (1 + state.hold * 0.9);
  key.position.x = -3 + pointer.x * 0.7;
  blueLight.position.x = 2 + pointer.x;
  camera.position.x = pointer.x * 0.08;
  camera.position.y = pointer.y * 0.05;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
document.querySelector("#loader").classList.add("done");
updateDrawing();
animate();
addEventListener("resize", () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  ScrollTrigger.refresh();
});
