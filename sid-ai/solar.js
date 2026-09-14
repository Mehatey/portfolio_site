import * as THREE from "three";
import { TTFLoader } from "three/addons/loaders/TTFLoader.js";
import { Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/+esm";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/ScrollTrigger/+esm";
import RAPIER from "https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.19.3/+esm";

await RAPIER.init();
gsap.registerPlugin(ScrollTrigger);
const qs = new URLSearchParams(location.search),
  capture = qs.get("capture") === "1",
  reduced = matchMedia("(prefers-reduced-motion: reduce)").matches,
  loaderEl = document.querySelector("#loader");
if (capture) document.documentElement.classList.add("capture");
const W = () => (capture ? Number(qs.get("w") || 3840) : innerWidth),
  H = () => (capture ? Number(qs.get("h") || 2160) : innerHeight);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
  preserveDrawingBuffer: capture,
});
renderer.setPixelRatio(capture ? 1 : Math.min(devicePixelRatio, 1.45));
renderer.setSize(W(), H(), false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050608);
scene.fog = new THREE.FogExp2(0x050608, 0.052);
const camera = new THREE.PerspectiveCamera(32, W() / H(), 0.03, 40);
camera.position.set(0, 0.15, 8.4);
camera.lookAt(0, 0, -0.3);
const pmrem = new THREE.PMREMGenerator(renderer),
  environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = environment;

const floor = new Reflector(new THREE.PlaneGeometry(16, 16), {
  clipBias: 0.003,
  textureWidth: Math.min(2048, W()),
  textureHeight: Math.min(2048, H()),
  color: 0x111317,
});
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.55;
scene.add(floor);
const horizon = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), new THREE.MeshBasicMaterial({ color: 0x07090b }));
horizon.position.set(0, 1, -3.25);
scene.add(horizon);
scene.add(new THREE.HemisphereLight(0x7e8ca6, 0x080809, 0.56));
const key = new THREE.SpotLight(0xffdfb4, 70, 15, 0.42, 0.7, 1.2);
key.position.set(2.7, 3.2, 3.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
scene.add(key, key.target);
const cool = new THREE.PointLight(0x4d80ff, 12, 8, 2);
cool.position.set(-3, 1.3, 2);
scene.add(cool);

const sun = new THREE.Group();
sun.position.set(2.45, 1.88, -1.5);
const sunCore = new THREE.Mesh(new THREE.SphereGeometry(0.52, 64, 64), new THREE.MeshBasicMaterial({ color: 0xffa62f }));
sun.add(sunCore);
const glowCanvas = document.createElement("canvas");
glowCanvas.width = 256;
glowCanvas.height = 256;
const gc = glowCanvas.getContext("2d"),
  grad = gc.createRadialGradient(128, 128, 10, 128, 128, 126);
grad.addColorStop(0, "rgba(255,190,80,.9)");
grad.addColorStop(0.25, "rgba(255,128,32,.32)");
grad.addColorStop(1, "rgba(255,70,10,0)");
gc.fillStyle = grad;
gc.fillRect(0, 0, 256, 256);
const glow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(glowCanvas),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
);
glow.scale.set(2.8, 2.8, 1);
sun.add(glow);
const sunLight = new THREE.PointLight(0xff9b38, 34, 9, 1.6);
sun.add(sunLight);
scene.add(sun);

const chrome = new THREE.MeshPhysicalMaterial({
    color: 0xb8bec5,
    metalness: 1,
    roughness: 0.13,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.6,
  }),
  darkChrome = new THREE.MeshPhysicalMaterial({
    color: 0x171b20,
    metalness: 0.94,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.4,
  }),
  typeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe8e9e5,
    metalness: 0.86,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.5,
  }),
  acid = new THREE.MeshPhysicalMaterial({
    color: 0xa8ff67,
    metalness: 0.18,
    roughness: 0.2,
    transmission: 0.22,
    thickness: 0.4,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    iridescence: 1,
    iridescenceIOR: 1.35,
  });
const nameGroup = new THREE.Group();
nameGroup.position.set(0, -0.12, -2.0);
scene.add(nameGroup);
const ttf = new TTFLoader();
ttf.reversed = true;
const font = new Font(await ttf.loadAsync("./fonts/salt-bold.ttf"));
function textMesh(text, size, depth, material, maxWidth) {
  const geo = new TextGeometry(text, {
    font,
    size,
    depth,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: size * 0.035,
    bevelSize: size * 0.018,
    bevelSegments: 4,
  });
  geo.computeBoundingBox();
  geo.center();
  if (maxWidth) {
    const w = geo.boundingBox.max.x - geo.boundingBox.min.x;
    if (w > maxWidth) geo.scale(maxWidth / w, maxWidth / w, maxWidth / w);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
const topName = textMesh("SIDDHARTH", 0.58, 0.13, typeMaterial, 5.7);
topName.position.y = 0.58;
const bottomName = textMesh("MEHTA", 1.08, 0.18, typeMaterial, 5.45);
bottomName.position.y = -0.38;
nameGroup.add(topName, bottomName);
typeMaterial.transparent = true;
typeMaterial.opacity = 0;
nameGroup.scale.setScalar(0.82);

function plant(x, flip = 1) {
  const group = new THREE.Group();
  group.position.set(x, -1.48, -0.45);
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.08 * flip, 0.55, 0),
    new THREE.Vector3(-0.05 * flip, 1.1, 0.02),
    new THREE.Vector3(0.14 * flip, 1.72, 0),
  ];
  const stem = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, 0.045, 12, false), darkChrome);
  stem.castShadow = true;
  group.add(stem);
  const leafGeo = new THREE.SphereGeometry(1, 32, 20);
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(leafGeo, i % 2 ? acid : chrome);
    const y = 0.28 + i * 0.25,
      side = (i % 2 ? 1 : -1) * flip;
    leaf.position.set(side * (0.16 + i * 0.018), y, 0.02 + (i % 3) * 0.04);
    leaf.scale.set(0.095, 0.31, 0.028);
    leaf.rotation.z = side * (-0.58 + (i % 3) * 0.09);
    leaf.castShadow = true;
    leaf.userData.finalScale = leaf.scale.clone();
    group.add(leaf);
  }
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 2), acid);
  crown.position.copy(points.at(-1));
  crown.castShadow = true;
  group.add(crown);
  scene.add(group);
  return group;
}
const plants = [plant(-2.45, 1), plant(2.42, -1)];
plants.forEach((p) => p.scale.setScalar(0.001));

const world = new RAPIER.World({ x: 0, y: 0, z: 0 }),
  entries = [],
  pickables = [];
let playground = false;
function boundary(x, y, z, hx, hy, hz) {
  world.createCollider(RAPIER.ColliderDesc.cuboid(hx, hy, hz).setTranslation(x, y, z).setRestitution(0.86).setFriction(0.05));
}
boundary(-3.25, 0, 0, 0.08, 2.4, 2);
boundary(3.25, 0, 0, 0.08, 2.4, 2);
boundary(0, -2.05, 0, 3.3, 0.08, 2);
boundary(0, 2.45, 0, 3.3, 0.08, 2);
boundary(0, 0, -2.25, 3.3, 2.4, 0.08);
boundary(0, 0, 1.35, 3.3, 2.4, 0.08);
function physicsEntry(mesh, shape, pos, density = 1) {
  const desc = RAPIER.RigidBodyDesc.dynamic().setTranslation(pos.x, pos.y, pos.z).setLinearDamping(0.72).setAngularDamping(0.58).setCanSleep(false),
    body = world.createRigidBody(desc);
  const collider = shape === "cube" ? RAPIER.ColliderDesc.roundCuboid(0.53, 0.53, 0.53, 0.08) : RAPIER.ColliderDesc.ball(shape);
  collider.setDensity(density).setRestitution(0.88).setFriction(0.04);
  world.createCollider(collider, body);
  const entry = { mesh, body, home: pos.clone(), shape };
  mesh.userData.entry = entry;
  pickables.push(mesh);
  entries.push(entry);
  return entry;
}
const cubeGroup = new THREE.Group(),
  cubeMesh = new THREE.Mesh(new RoundedBoxGeometry(1.08, 1.08, 1.08, 7, 0.12), darkChrome);
cubeMesh.castShadow = true;
cubeMesh.receiveShadow = true;
cubeGroup.add(cubeMesh);
scene.add(cubeGroup);
const cubeEntry = physicsEntry(cubeMesh, "cube", new THREE.Vector3(0, 0.12, 0.15), 2.2);
cubeEntry.mesh = cubeGroup;
cubeMesh.userData.entry = cubeEntry;
function cubeLabel(text, size, position, rotation) {
  const m = textMesh(text, size, 0.018, new THREE.MeshBasicMaterial({ color: 0xffb13b }), 0.78);
  m.position.copy(position);
  m.rotation.set(rotation.x, rotation.y, rotation.z);
  cubeGroup.add(m);
}
cubeLabel("SID", 0.19, new THREE.Vector3(0, 0, 0.555), new THREE.Euler(0, 0, 0));
cubeLabel("M", 0.28, new THREE.Vector3(0.555, 0, 0), new THREE.Euler(0, Math.PI / 2, 0));
cubeLabel("DESIGN", 0.105, new THREE.Vector3(0, 0.555, 0), new THREE.Euler(-Math.PI / 2, 0, 0));
const seedGeo = new THREE.IcosahedronGeometry(0.13, 2);
for (let i = 0; i < 8; i++) {
  const mesh = new THREE.Mesh(seedGeo, i % 3 === 0 ? acid : chrome);
  mesh.castShadow = true;
  scene.add(mesh);
  const a = (i / 8) * Math.PI * 2,
    r = 1.25 + (i % 2) * 0.35;
  physicsEntry(mesh, 0.14, new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * 0.72, Math.sin(a) * 0.28 + 0.08), 0.65);
}

const ray = new THREE.Raycaster(),
  ndc = new THREE.Vector2(),
  pointer = { x: 0.5, y: 0.5 },
  dragPlane = new THREE.Plane(),
  dragPoint = new THREE.Vector3();
let dragged = null,
  dragOffset = new THREE.Vector3(),
  dragVelocity = new THREE.Vector3(),
  lastDragPoint = new THREE.Vector3(),
  lastDragTime = performance.now(),
  hovered = null;
function setPointer(e) {
  pointer.x = e.clientX / innerWidth;
  pointer.y = 1 - e.clientY / innerHeight;
  ndc.set(pointer.x * 2 - 1, pointer.y * 2 - 1);
  ray.setFromCamera(ndc, camera);
}
renderer.domElement.addEventListener("pointermove", (e) => {
  setPointer(e);
  if (dragged) {
    if (ray.ray.intersectPlane(dragPlane, dragPoint)) {
      const now = performance.now(),
        dt = Math.max(0.008, (now - lastDragTime) / 1000),
        next = dragPoint.clone().add(dragOffset);
      dragVelocity.copy(next).sub(lastDragPoint).divideScalar(dt).clampLength(0, 5);
      dragged.body.setTranslation(next, true);
      dragged.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      dragged.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      lastDragPoint.copy(next);
      lastDragTime = now;
    }
    return;
  }
  const hit = ray.intersectObjects(pickables, false)[0]?.object || null;
  if (hit !== hovered) {
    if (hovered === cubeMesh) gsap.to(darkChrome, { roughness: 0.16, duration: 0.35 });
    hovered = hit;
    if (hovered === cubeMesh) gsap.to(darkChrome, { roughness: 0.04, duration: 0.35 });
  }
});
renderer.domElement.addEventListener("pointerdown", (e) => {
  if (!playground) return;
  setPointer(e);
  const hit = ray.intersectObjects(pickables, false)[0];
  if (hit) {
    dragged = hit.object.userData.entry;
    const t = dragged.body.translation(),
      point = new THREE.Vector3(t.x, t.y, t.z),
      normal = camera.getWorldDirection(new THREE.Vector3());
    dragPlane.setFromNormalAndCoplanarPoint(normal, point);
    ray.ray.intersectPlane(dragPlane, dragPoint);
    dragOffset.copy(point).sub(dragPoint);
    lastDragPoint.copy(point);
    lastDragTime = performance.now();
    renderer.domElement.setPointerCapture(e.pointerId);
  }
});
renderer.domElement.addEventListener("pointerup", (e) => {
  setPointer(e);
  if (dragged) {
    dragged.body.setLinvel(
      {
        x: dragVelocity.x * 0.72,
        y: dragVelocity.y * 0.72,
        z: dragVelocity.z * 0.72,
      },
      true
    );
    dragged.body.setAngvel(
      {
        x: dragVelocity.y * 0.4,
        y: -dragVelocity.x * 0.45,
        z: dragVelocity.x * 0.25,
      },
      true
    );
    dragged = null;
    return;
  }
  if (ray.intersectObject(sunCore, false).length) {
    for (const entry of entries) {
      const t = entry.body.translation(),
        dir = new THREE.Vector3(t.x - sun.position.x, t.y - sun.position.y, t.z - sun.position.z).normalize();
      entry.body.applyImpulse({ x: dir.x * 0.65, y: dir.y * 0.65, z: dir.z * 0.65 }, true);
    }
    gsap.fromTo(
      glow.scale,
      { x: 2.8, y: 2.8 },
      {
        x: 4.1,
        y: 4.1,
        duration: 0.26,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      }
    );
  }
});

function releaseField() {
  if (playground) return;
  playground = true;
  entries.forEach((entry, i) => {
    const a = (i / entries.length) * Math.PI * 2;
    entry.body.setLinvel({ x: Math.cos(a) * 0.22, y: Math.sin(a) * 0.18, z: ((i % 3) - 1) * 0.08 }, true);
    entry.body.setAngvel({ x: 0.14 + i * 0.025, y: 0.22 - i * 0.014, z: 0.12 }, true);
  });
  gsap.to(".play-card", { scale: 0.94, duration: 0.12, yoyo: true, repeat: 1 });
}
function reset() {
  playground = false;
  entries.forEach((entry) => {
    const p = entry.home;
    entry.body.setTranslation({ x: p.x, y: p.y, z: p.z }, true);
    entry.body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    entry.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    entry.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  });
}
const resetButton = document.createElement("button");
resetButton.className = "reset";
resetButton.textContent = "RESET FIELD";
resetButton.onclick = reset;
document.body.appendChild(resetButton);
document.querySelector("#playButton")?.addEventListener("click", releaseField);

const shot = {
  camX: 0,
  camY: 0.15,
  camZ: 7.2,
  lookX: 0,
  lookY: -0.02,
  lookZ: -0.35,
  progress: 0,
};
const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
intro
  .fromTo(shot, { camZ: 11 }, { camZ: 7.2, duration: 2.1 })
  .fromTo(sun.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1, duration: 1.2 }, 0.15)
  .fromTo(cubeGroup.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, duration: 1.25 }, 0.55);
if (reduced) intro.progress(1);

if (!capture) {
  const scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".story",
      start: "top top",
      end: "bottom bottom",
      scrub: reduced ? false : 0.8,
      onUpdate: (self) => {
        shot.progress = self.progress;
        gsap.set(".progress i", { scaleY: self.progress });
      },
    },
  });
  scrollTl
    .to(".blueprint", { opacity: 0, scale: 0.72, rotation: 8, duration: 0.8, ease: "none" }, 0)
    .to(
      shot,
      {
        camX: -1.15,
        camY: 0.38,
        camZ: 6.15,
        lookX: -0.35,
        progress: 0.28,
        duration: 1,
        ease: "none",
      },
      0
    )
    .to(typeMaterial, { opacity: 0.94, duration: 0.65, ease: "none" }, 0.38)
    .to(nameGroup.scale, { x: 1, y: 1, z: 1, duration: 0.65, ease: "none" }, 0.38)
    .to(nameGroup.position, { x: 0.65, y: -0.02, z: -1.72, duration: 1, ease: "none" }, 0)
    .to(sun.position, { x: 2.05, y: 1.18, z: -0.72, duration: 1, ease: "none" }, 0)
    .to(
      shot,
      {
        camX: 1.35,
        camY: 0.18,
        camZ: 5.5,
        lookX: 0.35,
        progress: 0.58,
        duration: 1,
        ease: "none",
      },
      1
    )
    .to(nameGroup.rotation, { y: -0.2, z: 0.025, duration: 1, ease: "none" }, 1)
    .to(plants[0].scale, { x: 1, y: 1, z: 1, duration: 0.62, ease: "power2.out" }, 1.22)
    .to(plants[1].scale, { x: 1, y: 1, z: 1, duration: 0.62, ease: "power2.out" }, 1.32)
    .to(plants[0].position, { x: -1.72, z: 0.2, duration: 1, ease: "none" }, 1)
    .to(plants[1].position, { x: 1.82, z: -0.05, duration: 1, ease: "none" }, 1)
    .to(
      shot,
      {
        camX: 0,
        camY: 0.1,
        camZ: 5.85,
        lookX: 0,
        progress: 1,
        duration: 1,
        ease: "none",
      },
      2
    )
    .to(nameGroup.position, { x: 0, y: -0.3, z: -1.85, duration: 1, ease: "none" }, 2)
    .to(nameGroup.rotation, { y: 0, z: 0, duration: 1, ease: "none" }, 2)
    .to(sun.position, { x: 2.35, y: 1.75, z: -1.3, duration: 1, ease: "none" }, 2)
    .to(typeMaterial, { opacity: 0.26, duration: 0.55, ease: "none" }, 2.35);
  gsap.utils.toArray(".chapter-copy").forEach((copy) =>
    gsap.fromTo(
      copy,
      { autoAlpha: 0.12, y: 70 },
      {
        autoAlpha: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: copy.parentElement,
          start: "top 72%",
          end: "center 55%",
          scrub: 0.55,
        },
      }
    )
  );
}

let last = performance.now(),
  accumulator = 0;
const scriptedQuat = new THREE.Quaternion();
function render(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  if (!playground) {
    const p = shot.progress;
    let cubeX;
    if (p < 0.33) cubeX = THREE.MathUtils.lerp(1.05, -1.12, p / 0.33);
    else if (p < 0.66) cubeX = THREE.MathUtils.lerp(-1.12, 1.02, (p - 0.33) / 0.33);
    else cubeX = THREE.MathUtils.lerp(1.02, -1.16, (p - 0.66) / 0.34);
    const cubePos = {
      x: cubeX,
      y: 0.12 + Math.sin(p * Math.PI * 2) * 0.12,
      z: 0.15 - p * 0.12,
    };
    cubeEntry.body.setTranslation(cubePos, true);
    scriptedQuat.setFromEuler(new THREE.Euler(-0.08 + p * 0.22, p * Math.PI * 0.72, 0.04 - p * 0.08));
    cubeEntry.body.setRotation(scriptedQuat, true);
    entries.slice(1).forEach((entry, i) => {
      const a = (i / 7) * Math.PI * 2 + p * 1.2,
        r = 0.82 + p * 0.74;
      entry.mesh.scale.setScalar(THREE.MathUtils.smoothstep(p, 0.12, 0.36));
      entry.body.setTranslation(
        {
          x: Math.cos(a) * r,
          y: Math.sin(a) * (0.48 + p * 0.22),
          z: 0.04 + Math.sin(a * 2) * 0.16,
        },
        true
      );
      entry.body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    });
  }
  accumulator += dt;
  while (accumulator >= 1 / 60) {
    world.timestep = 1 / 60;
    world.step();
    accumulator -= 1 / 60;
  }
  for (const entry of entries) {
    const p = entry.body.translation(),
      q = entry.body.rotation();
    entry.mesh.position.set(p.x, p.y, p.z);
    entry.mesh.quaternion.set(q.x, q.y, q.z, q.w);
  }
  sun.rotation.y += (reduced ? 0 : 0.00035) * (dt * 60);
  key.position.x = THREE.MathUtils.lerp(key.position.x, 2.7 + (pointer.x - 0.5) * 2.3, 0.04);
  key.position.y = THREE.MathUtils.lerp(key.position.y, 3.2 + (pointer.y - 0.5) * 1.2, 0.04);
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, shot.camX + (pointer.x - 0.5) * 0.12, 0.06);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, shot.camY + (pointer.y - 0.5) * 0.08, 0.06);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, shot.camZ, 0.06);
  camera.lookAt(shot.lookX, shot.lookY, shot.lookZ);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
loaderEl.classList.add("done");
requestAnimationFrame(render);
function resize() {
  if (capture) return;
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(document.body);
addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "r") reset();
  if (e.key.toLowerCase() === "c") {
    const a = document.createElement("a");
    a.download = `sid-solar-${Date.now()}.png`;
    a.href = renderer.domElement.toDataURL("image/png");
    a.click();
  }
});
