import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/+esm";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger/+esm";

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches,
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.55));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9cbb5);
scene.fog = new THREE.Fog(0xd9cbb5, 9, 24);
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.03, 60);
camera.position.set(0, 0.6, 8.5);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xfff4d5, 0x53627a, 2.5));
const sunLight = new THREE.DirectionalLight(0xffdfaa, 5.8);
sunLight.position.set(-4, 7, 5);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.left = -6;
sunLight.shadow.camera.right = 6;
sunLight.shadow.camera.top = 6;
sunLight.shadow.camera.bottom = -3;
scene.add(sunLight);
const rim = new THREE.PointLight(0x1647ff, 16, 10, 2);
rim.position.set(3, 2, 2);
scene.add(rim);
const sand = new THREE.MeshStandardMaterial({
    color: 0xbfac91,
    roughness: 0.86,
    metalness: 0,
  }),
  charcoal = new THREE.MeshPhysicalMaterial({
    color: 0x17191c,
    roughness: 0.3,
    metalness: 0.35,
    clearcoat: 0.35,
    clearcoatRoughness: 0.22,
  }),
  coat = new THREE.MeshPhysicalMaterial({
    color: 0xad4933,
    roughness: 0.6,
    metalness: 0.02,
    clearcoat: 0.12,
  }),
  ceramic = new THREE.MeshPhysicalMaterial({
    color: 0xe7d8c1,
    roughness: 0.44,
    clearcoat: 0.3,
    clearcoatRoughness: 0.28,
  }),
  blue = new THREE.MeshPhysicalMaterial({
    color: 0x1647ff,
    roughness: 0.12,
    metalness: 0.32,
    clearcoat: 1,
    emissive: 0x071968,
    emissiveIntensity: 1.3,
  }),
  glass = new THREE.MeshPhysicalMaterial({
    color: 0x183a98,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.25,
    thickness: 0.4,
    clearcoat: 1,
    transparent: true,
    opacity: 0.92,
  }),
  bone = new THREE.MeshStandardMaterial({ color: 0xe8ddc8, roughness: 0.75 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 28, 1, 1), sand);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.36;
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper(28, 28, 0x625b52, 0x928572);
grid.position.y = -1.345;
grid.material.transparent = true;
grid.material.opacity = 0.16;
scene.add(grid);
const sun = new THREE.Mesh(new THREE.SphereGeometry(1.35, 64, 32), new THREE.MeshBasicMaterial({ color: 0xf09a45 }));
sun.position.set(-5.2, 4.6, -10);
scene.add(sun);
function arch(x, z, s = 0.8) {
  const g = new THREE.Group(),
    columnGeo = new RoundedBoxGeometry(0.32, 3.6, 0.32, 4, 0.05);
  for (const side of [-1, 1]) {
    const c = new THREE.Mesh(columnGeo, bone);
    c.position.set(side * 1.4, 0, 0);
    c.castShadow = true;
    g.add(c);
  }
  const top = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.16, 10, 48, Math.PI), bone);
  top.rotation.z = 0;
  top.position.y = 1.8;
  g.add(top);
  g.position.set(x, 0.42, z);
  g.scale.setScalar(s);
  scene.add(g);
  return g;
}
const arches = [arch(-3.8, -7, 1.25), arch(4.2, -9, 1.55), arch(0, -13, 2.1)];
const monolith = new THREE.Group(),
  stone = new THREE.Mesh(new RoundedBoxGeometry(0.72, 1.45, 0.32, 5, 0.04), charcoal);
stone.castShadow = true;
monolith.add(stone);
const slit = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.7, 0.03, 4, 0.02), blue);
slit.position.z = 0.18;
monolith.add(slit);
monolith.position.set(-0.2, -0.55, 0.35);
monolith.scale.setScalar(0.001);
scene.add(monolith);

const kavi = new THREE.Group();
kavi.scale.setScalar(0.86);
scene.add(kavi);
const pickables = [];
function mesh(geo, mat, parent, pos, scale) {
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(pos || new THREE.Vector3());
  if (scale) m.scale.copy(scale);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  pickables.push(m);
  return m;
}
function limb(parent, length, radius, mat) {
  const m = mesh(new THREE.CapsuleGeometry(radius, length - radius * 2, 8, 20), mat, parent, new THREE.Vector3(0, -length / 2, 0));
  return m;
}
const hips = new THREE.Group();
kavi.add(hips);
const pelvis = mesh(new RoundedBoxGeometry(0.88, 0.5, 0.62, 5, 0.12), charcoal, hips, new THREE.Vector3(0, 0.42, 0));
const torso = mesh(new RoundedBoxGeometry(1.25, 1.35, 0.72, 6, 0.18), coat, hips, new THREE.Vector3(0, 1.28, 0));
torso.rotation.z = -0.02;
const belt = mesh(new THREE.TorusGeometry(0.52, 0.055, 10, 48), blue, hips, new THREE.Vector3(0, 0.72, 0.02), new THREE.Vector3(1, 0.62, 1));
belt.rotation.x = Math.PI / 2;
const headPivot = new THREE.Group();
headPivot.position.set(0, 2.35, 0);
hips.add(headPivot);
const head = mesh(new THREE.SphereGeometry(0.58, 48, 36), ceramic, headPivot, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.92, 1.08, 0.88));
const visor = mesh(
  new THREE.SphereGeometry(0.48, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.58),
  glass,
  headPivot,
  new THREE.Vector3(0, 0.02, 0.38),
  new THREE.Vector3(0.9, 0.58, 0.28)
);
visor.rotation.x = Math.PI * 0.2;
const eyeGroup = new THREE.Group();
eyeGroup.position.z = 0.58;
headPivot.add(eyeGroup);
const pupils = [];
[-0.19, 0.19].forEach((x) => {
  const e = mesh(new THREE.SphereGeometry(0.055, 20, 14), bone, eyeGroup, new THREE.Vector3(x, 0.04, 0));
  pupils.push({ mesh: e, base: x });
});
const antenna = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 12), charcoal, headPivot, new THREE.Vector3(0.32, 0.72, 0));
antenna.rotation.z = -0.18;
mesh(new THREE.SphereGeometry(0.07, 18, 12), blue, headPivot, new THREE.Vector3(0.39, 0.92, 0));
const scarf = mesh(new RoundedBoxGeometry(0.82, 0.14, 0.76, 4, 0.06), blue, hips, new THREE.Vector3(0, 1.98, 0));
const scarfTail = mesh(new RoundedBoxGeometry(0.22, 0.9, 0.08, 4, 0.04), blue, hips, new THREE.Vector3(0.48, 1.55, -0.32));
scarfTail.rotation.z = -0.16;
const pack = mesh(new RoundedBoxGeometry(0.74, 0.9, 0.32, 5, 0.12), charcoal, hips, new THREE.Vector3(0, 1.35, -0.48));
const arms = [];
[-1, 1].forEach((side) => {
  const shoulder = new THREE.Group();
  shoulder.position.set(side * 0.72, 1.78, 0);
  hips.add(shoulder);
  mesh(new THREE.SphereGeometry(0.19, 24, 16), coat, shoulder, new THREE.Vector3());
  limb(shoulder, 0.78, 0.14, coat);
  const elbow = new THREE.Group();
  elbow.position.y = -0.78;
  shoulder.add(elbow);
  limb(elbow, 0.72, 0.12, ceramic);
  const hand = mesh(new THREE.SphereGeometry(0.15, 24, 16), ceramic, elbow, new THREE.Vector3(0, -0.76, 0), new THREE.Vector3(0.82, 1.05, 0.72));
  arms.push({ side, shoulder, elbow, hand });
});
const legs = [];
[-1, 1].forEach((side) => {
  const hip = new THREE.Group();
  hip.position.set(side * 0.31, 0.35, 0);
  hips.add(hip);
  limb(hip, 0.92, 0.2, charcoal);
  const knee = new THREE.Group();
  knee.position.y = -0.92;
  hip.add(knee);
  limb(knee, 0.84, 0.17, charcoal);
  const foot = mesh(new RoundedBoxGeometry(0.42, 0.24, 0.78, 5, 0.1), ceramic, knee, new THREE.Vector3(0, -0.88, 0.2));
  legs.push({ side, hip, knee, foot });
});

const dustGeo = new THREE.BufferGeometry(),
  dustCount = 240,
  dustPos = new Float32Array(dustCount * 3),
  dustSeed = [];
for (let i = 0; i < dustCount; i++) {
  dustPos[i * 3] = (Math.random() - 0.5) * 14;
  dustPos[i * 3 + 1] = Math.random() * 5 - 1;
  dustPos[i * 3 + 2] = -Math.random() * 10 + 2;
  dustSeed.push(Math.random() * 10);
}
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(
  dustGeo,
  new THREE.PointsMaterial({
    color: 0xf2e2c5,
    size: 0.025,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  })
);
scene.add(dust);
const state = { p: 0, click: 0 },
  pointer = new THREE.Vector2(),
  targetPointer = new THREE.Vector2(),
  ray = new THREE.Raycaster();
addEventListener("pointermove", (e) => targetPointer.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)));
renderer.domElement.addEventListener("pointerdown", (e) => {
  const clickPointer = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
  ray.setFromCamera(clickPointer, camera);
  if (ray.intersectObjects(pickables, false).length) gsap.fromTo(state, { click: 1 }, { click: 0, duration: 1.15, ease: "elastic.out(1,.35)" });
});
const shot = { x: 0, y: 0.6, z: 8.5, lookX: 0, lookY: 0.45 };
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".story",
    start: "top top",
    end: "bottom bottom",
    scrub: reduced ? false : 0.8,
    onUpdate: (s) => {
      state.p = s.progress;
      document.querySelector(".chapter-no").textContent = `${String(Math.min(4, Math.floor(s.progress * 4) + 1)).padStart(2, "0")} / 04`;
      gsap.set(".progress i", { y: s.progress * 135 });
    },
  },
});
tl.to(shot, { x: -0.8, y: 0.45, z: 7.2, lookX: -0.5, duration: 1, ease: "none" }, 0)
  .to(monolith.scale, { x: 0.72, y: 0.72, z: 0.72, duration: 0.32, ease: "back.out(1.4)" }, 0.62)
  .to(monolith.position, { x: -0.55, y: -0.28, z: -0.45, duration: 1, ease: "none" }, 0)
  .to(shot, { x: 0.75, y: 0.85, z: 6.6, lookX: 0.35, duration: 1, ease: "none" }, 1)
  .to(monolith.rotation, { y: Math.PI * 1.3, z: 0.14, duration: 1, ease: "none" }, 1)
  .to(monolith.position, { x: 0.4, y: 0.2, z: -0.2, duration: 1, ease: "none" }, 1)
  .to(shot, { x: 0, y: 0.55, z: 7.3, lookX: -0.25, duration: 1, ease: "none" }, 2)
  .to(monolith.scale, { x: 2.2, y: 2.2, z: 2.2, duration: 1, ease: "none" }, 2)
  .to(monolith.position, { x: 1.7, y: 0.2, z: -1.3, duration: 1, ease: "none" }, 2);
gsap.utils.toArray(".copy").forEach((c) =>
  gsap.fromTo(
    c,
    { autoAlpha: 0.08, y: 70 },
    {
      autoAlpha: 1,
      y: 0,
      ease: "none",
      scrollTrigger: {
        trigger: c.parentElement,
        start: "top 76%",
        end: "center 54%",
        scrub: 0.5,
      },
    }
  )
);
function smoothWindow(p, a, b, c, d) {
  return THREE.MathUtils.smoothstep(p, a, b) * (1 - THREE.MathUtils.smoothstep(p, c, d));
}
function pathX(p) {
  if (p < 0.33) return THREE.MathUtils.lerp(1.15, -1.15, p / 0.33);
  if (p < 0.66) return THREE.MathUtils.lerp(-1.15, 1.1, (p - 0.33) / 0.33);
  return THREE.MathUtils.lerp(1.1, 0.9, (p - 0.66) / 0.34);
}
const clock = new THREE.Clock();
function animate() {
  const dt = Math.min(0.033, clock.getDelta()),
    t = clock.elapsedTime,
    p = state.p;
  pointer.lerp(targetPointer, 0.075);
  const walk = smoothWindow(p, 0.04, 0.12, 0.56, 0.68),
    phase = p * 38,
    step = Math.sin(phase) * walk;
  const crouch = smoothWindow(p, 0.48, 0.56, 0.63, 0.7) * 0.22,
    jump = state.click * Math.sin((1 - state.click) * Math.PI) * 0.45;
  kavi.position.set(pathX(p), -crouch + jump, 0.15 + Math.sin(p * Math.PI) * 0.1);
  kavi.rotation.y = THREE.MathUtils.lerp(kavi.rotation.y, (p < 0.33 ? -1 : p < 0.66 ? 1 : -1) * 0.14, 0.06);
  hips.position.y = Math.abs(Math.cos(phase)) * walk * 0.055 + Math.sin(t * 1.5) * 0.018;
  hips.rotation.z = step * 0.035;
  legs.forEach((leg, i) => {
    const s = i === 0 ? 1 : -1;
    leg.hip.rotation.x = step * s * 0.8;
    leg.knee.rotation.x = Math.max(0, -step * s) * 0.9;
    leg.foot.rotation.x = -leg.knee.rotation.x * 0.35;
  });
  arms.forEach((arm, i) => {
    const s = i === 0 ? 1 : -1;
    arm.shoulder.rotation.x = -step * s * 0.62;
    arm.shoulder.rotation.z = s * 0.08;
    arm.elbow.rotation.x = -0.18 - Math.max(0, step * s) * 0.45;
  });
  const reach = smoothWindow(p, 0.37, 0.48, 0.64, 0.73);
  arms[1].shoulder.rotation.x = THREE.MathUtils.lerp(arms[1].shoulder.rotation.x, -1.25, reach);
  arms[1].shoulder.rotation.z = THREE.MathUtils.lerp(arms[1].shoulder.rotation.z, -0.48, reach);
  arms[1].elbow.rotation.x = THREE.MathUtils.lerp(arms[1].elbow.rotation.x, -1.05, reach);
  const wave = THREE.MathUtils.smoothstep(p, 0.78, 0.9);
  arms[0].shoulder.rotation.z = THREE.MathUtils.lerp(arms[0].shoulder.rotation.z, 1.75, wave);
  arms[0].shoulder.rotation.x = THREE.MathUtils.lerp(arms[0].shoulder.rotation.x, -0.25, wave);
  arms[0].elbow.rotation.z = wave * Math.sin(t * 6) * 0.42;
  headPivot.rotation.y = THREE.MathUtils.lerp(headPivot.rotation.y, pointer.x * 0.34, 0.07);
  headPivot.rotation.x = THREE.MathUtils.lerp(headPivot.rotation.x, -pointer.y * 0.2 + state.click * 0.12, 0.07);
  pupils.forEach((o) => {
    o.mesh.position.x = THREE.MathUtils.lerp(o.mesh.position.x, o.base + pointer.x * 0.035, 0.12);
    o.mesh.position.y = THREE.MathUtils.lerp(o.mesh.position.y, 0.04 + pointer.y * 0.03, 0.12);
  });
  scarfTail.rotation.z = -0.16 - step * 0.12 + Math.sin(t * 2.2) * 0.03;
  monolith.position.y += Math.sin(t * 1.8 + p * 5) * 0.00035;
  monolith.rotation.y += dt * 0.08;
  const arr = dust.geometry.attributes.position.array;
  for (let i = 0; i < dustCount; i++) {
    arr[i * 3 + 1] += dt * (0.025 + dustSeed[i] * 0.006);
    arr[i * 3] += Math.sin(t * 0.25 + dustSeed[i]) * dt * 0.006;
    if (arr[i * 3 + 1] > 4) arr[i * 3 + 1] = -1;
  }
  dust.geometry.attributes.position.needsUpdate = true;
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, shot.x + pointer.x * 0.09, 0.06);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, shot.y + pointer.y * 0.05, 0.06);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, shot.z, 0.06);
  camera.lookAt(shot.lookX, shot.lookY, 0);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
document.querySelector("#loader").classList.add("done");
animate();
addEventListener("resize", () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  ScrollTrigger.refresh();
});
