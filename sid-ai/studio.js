import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const qs = new URLSearchParams(location.search),
  capture = qs.get("capture") === "1",
  reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (capture) document.documentElement.classList.add("capture");
const width = () => (capture ? Number(qs.get("w") || 3840) : innerWidth),
  height = () => (capture ? Number(qs.get("h") || 2160) : innerHeight),
  status = document.querySelector("#status");

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: capture });
renderer.setPixelRatio(capture ? 1 : Math.min(devicePixelRatio, 1.5));
renderer.setSize(width(), height(), false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0xdedbd4, 1);
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdedbd4);
scene.fog = new THREE.Fog(0xdedbd4, 7.5, 13);
const camera = new THREE.PerspectiveCamera(31, width() / height(), 0.03, 30);
camera.position.set(0, 1.3, 6.4);
camera.lookAt(0, 1.04, 0);

const wallMat = new THREE.MeshStandardMaterial({ color: 0xdedbd4, roughness: 0.92, metalness: 0 }),
  floorMat = new THREE.MeshPhysicalMaterial({ color: 0xe8e5df, roughness: 0.64, metalness: 0.02, clearcoat: 0.18, clearcoatRoughness: 0.72 });
const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 7), wallMat);
wall.position.set(0, 2.7, -2.05);
wall.receiveShadow = true;
scene.add(wall);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);
const disc = new THREE.Mesh(new THREE.CircleGeometry(1.3, 96), new THREE.MeshStandardMaterial({ color: 0x1646c8, roughness: 0.34, metalness: 0.06 }));
disc.position.set(-0.72, 1.42, -1.98);
disc.receiveShadow = true;
scene.add(disc);
const plinth = new THREE.Mesh(
  new THREE.CylinderGeometry(0.92, 1.02, 0.12, 72),
  new THREE.MeshPhysicalMaterial({ color: 0xcdc9c1, roughness: 0.48, clearcoat: 0.34 })
);
plinth.position.set(0.18, 0.06, 0.42);
plinth.receiveShadow = true;
plinth.castShadow = true;
scene.add(plinth);

scene.add(new THREE.HemisphereLight(0xfff8ec, 0x6f7783, 2.1));
const key = new THREE.DirectionalLight(0xfff0dc, 5.4);
key.position.set(-3.2, 5.2, 4.1);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -4;
key.shadow.camera.right = 4;
key.shadow.camera.top = 5;
key.shadow.camera.bottom = -1;
key.shadow.bias = -0.00012;
scene.add(key);
const fill = new THREE.PointLight(0x6d8dff, 12, 7, 2);
fill.position.set(3.1, 2.3, 2.7);
scene.add(fill);
const rim = new THREE.PointLight(0xff7b52, 8, 5, 2);
rim.position.set(-3, 1.5, 0.3);
scene.add(rim);

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),
  hero = new THREE.Group(),
  bodies = [],
  pickMeshes = [];
scene.add(hero);
let cube = null,
  heroLift = 0,
  heroVy = 0,
  heroReaction = 0;
function normalize(object, targetHeight) {
  const box = new THREE.Box3().setFromObject(object),
    size = box.getSize(new THREE.Vector3());
  object.scale.multiplyScalar(targetHeight / Math.max(size.y, 0.001));
  const next = new THREE.Box3().setFromObject(object),
    center = next.getCenter(new THREE.Vector3());
  object.position.sub(center);
  object.position.y += targetHeight * 0.5;
}
function tuneModel(object) {
  object.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    if (o.material) {
      o.material = o.material.clone();
      o.material.envMapIntensity = 0.7;
      o.material.roughness = Math.max(0.24, Math.min(0.56, o.material.roughness ?? 0.42));
      o.material.needsUpdate = true;
    }
  });
}
const heroReady = new Promise((resolve, reject) =>
  loader.load(
    "../cube_guy_web.glb",
    (g) => {
      cube = g.scene;
      normalize(cube, 2.08);
      tuneModel(cube);
      hero.add(cube);
      hero.position.set(0.06, 0.12, 0.38);
      hero.rotation.y = -Math.PI * 0.5;
      resolve();
    },
    undefined,
    reject
  )
);

function loadBody(path, height, home, radius, mass, material) {
  return new Promise((resolve) =>
    loader.load(
      path,
      (g) => {
        const group = new THREE.Group(),
          model = g.scene;
        normalize(model, height);
        group.add(model);
        group.position.copy(home);
        const body = { group, home: home.clone(), radius, mass, velocity: new THREE.Vector3(), angular: new THREE.Vector3(), dragging: false };
        model.traverse((o) => {
          if (!o.isMesh) return;
          o.castShadow = true;
          o.receiveShadow = true;
          o.frustumCulled = false;
          o.material = material.clone();
          o.userData.body = body;
          pickMeshes.push(o);
        });
        scene.add(group);
        bodies.push(body);
        resolve(body);
      },
      undefined,
      (e) => {
        console.error(path, e);
        resolve(null);
      }
    )
  );
}
const chrome = new THREE.MeshPhysicalMaterial({ color: 0x333943, metalness: 0.94, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 }),
  porcelain = new THREE.MeshPhysicalMaterial({ color: 0xf1eee7, metalness: 0.02, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.1 }),
  orange = new THREE.MeshPhysicalMaterial({ color: 0xd94d21, metalness: 0.18, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.12 });
const objectsReady = Promise.all([
  loadBody("../buddha-web.glb", 0.7, new THREE.Vector3(-1.43, 0.34, 0.66), 0.34, 1.8, chrome),
  loadBody("./models/glowing-mushroom.glb", 0.46, new THREE.Vector3(1.2, 0.23, 0.72), 0.23, 0.72, porcelain),
  loadBody("./models/pumpkin.glb", 0.48, new THREE.Vector3(1.72, 0.24, 0.2), 0.24, 1.05, orange),
]);

const pointer = { x: 0.5, y: 0.5, lastX: 0.5, lastY: 0.5, time: performance.now() },
  ray = new THREE.Raycaster(),
  ndc = new THREE.Vector2(),
  dragPlane = new THREE.Plane(),
  dragPoint = new THREE.Vector3(),
  dragOffset = new THREE.Vector3();
let dragged = null,
  dragVelocity = new THREE.Vector3();
function updatePointer(e) {
  const now = performance.now(),
    dt = Math.max(0.008, (now - pointer.time) / 1000);
  pointer.lastX = pointer.x;
  pointer.lastY = pointer.y;
  pointer.x = e.clientX / innerWidth;
  pointer.y = 1 - e.clientY / innerHeight;
  pointer.time = now;
  ndc.set(pointer.x * 2 - 1, pointer.y * 2 - 1);
  ray.setFromCamera(ndc, camera);
  return dt;
}
renderer.domElement.addEventListener("pointermove", (e) => {
  const dt = updatePointer(e);
  if (!dragged) return;
  if (ray.ray.intersectPlane(dragPlane, dragPoint)) {
    const before = dragged.group.position.clone();
    dragged.group.position.copy(dragPoint).add(dragOffset);
    dragged.group.position.y = Math.max(dragged.radius, dragged.group.position.y);
    dragVelocity.copy(dragged.group.position).sub(before).divideScalar(dt).clampLength(0, 4);
  }
});
renderer.domElement.addEventListener("pointerdown", (e) => {
  updatePointer(e);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(pickMeshes, true)[0];
  if (hit?.object.userData.body) {
    dragged = hit.object.userData.body;
    dragged.dragging = true;
    dragged.velocity.set(0, 0, 0);
    dragged.angular.set(0, 0, 0);
    const normal = camera.getWorldDirection(new THREE.Vector3());
    dragPlane.setFromNormalAndCoplanarPoint(normal, dragged.group.position);
    ray.ray.intersectPlane(dragPlane, dragPoint);
    dragOffset.copy(dragged.group.position).sub(dragPoint);
    renderer.domElement.setPointerCapture(e.pointerId);
  }
});
renderer.domElement.addEventListener("pointerup", (e) => {
  updatePointer(e);
  if (dragged) {
    dragged.dragging = false;
    dragged.velocity.copy(dragVelocity).multiplyScalar(0.72);
    dragged.angular.set(dragVelocity.z, -dragVelocity.x, dragVelocity.y).multiplyScalar(0.65);
    dragged = null;
    return;
  }
  ray.setFromCamera(ndc, camera);
  if (cube && ray.intersectObject(cube, true).length) {
    heroVy = 1.45;
    heroReaction = 1;
  }
});
renderer.domElement.addEventListener("pointercancel", () => {
  if (dragged) {
    dragged.dragging = false;
    dragged = null;
  }
});

function physics(dt) {
  const gravity = reduced ? -1.8 : -4.4;
  for (const b of bodies) {
    if (b.dragging) continue;
    b.velocity.y += gravity * dt;
    b.velocity.multiplyScalar(Math.pow(0.995, dt * 60));
    b.group.position.addScaledVector(b.velocity, dt);
    b.group.rotation.x += b.angular.x * dt;
    b.group.rotation.y += b.angular.y * dt;
    b.group.rotation.z += b.angular.z * dt;
    b.angular.multiplyScalar(Math.pow(0.982, dt * 60));
    if (b.group.position.y < b.radius) {
      b.group.position.y = b.radius;
      if (b.velocity.y < 0) b.velocity.y = -b.velocity.y * 0.52;
      b.velocity.x *= 0.91;
      b.velocity.z *= 0.91;
      b.angular.multiplyScalar(0.88);
      if (Math.abs(b.velocity.y) < 0.045) b.velocity.y = 0;
    }
    for (const axis of ["x", "z"]) {
      const limit = axis === "x" ? 2.45 : 1.25,
        min = axis === "x" ? -2.45 : -0.55;
      if (b.group.position[axis] + b.radius > limit) {
        b.group.position[axis] = limit - b.radius;
        b.velocity[axis] = -Math.abs(b.velocity[axis]) * 0.62;
      }
      if (b.group.position[axis] - b.radius < min) {
        b.group.position[axis] = min + b.radius;
        b.velocity[axis] = Math.abs(b.velocity[axis]) * 0.62;
      }
    }
    const heroCenter = new THREE.Vector3(hero.position.x, 1.02 + heroLift, hero.position.z),
      delta = b.group.position.clone().sub(heroCenter),
      distance = delta.length(),
      minimum = b.radius + 0.48;
    if (distance > 0 && distance < minimum) {
      const normal = delta.multiplyScalar(1 / distance),
        penetration = minimum - distance;
      b.group.position.addScaledVector(normal, penetration);
      const closing = b.velocity.dot(normal);
      if (closing < 0) b.velocity.addScaledVector(normal, -closing * 1.5);
      b.angular.add(new THREE.Vector3(normal.z, 0, -normal.x).multiplyScalar(Math.max(0.15, -closing) * 0.5));
      heroReaction = Math.max(heroReaction, Math.min(0.45, Math.abs(closing) * 0.18));
    }
  }
  for (let i = 0; i < bodies.length; i++)
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i],
        b = bodies[j];
      if (a.dragging || b.dragging) continue;
      const delta = a.group.position.clone().sub(b.group.position),
        distance = delta.length(),
        minimum = a.radius + b.radius;
      if (distance <= 0 || distance >= minimum) continue;
      const normal = delta.multiplyScalar(1 / distance),
        correction = (minimum - distance) * 0.52;
      a.group.position.addScaledVector(normal, correction);
      b.group.position.addScaledVector(normal, -correction);
      const relative = a.velocity.clone().sub(b.velocity),
        closing = relative.dot(normal);
      if (closing < 0) {
        const impulse = (-(1 + 0.58) * closing) / (1 / a.mass + 1 / b.mass);
        a.velocity.addScaledVector(normal, impulse / a.mass);
        b.velocity.addScaledVector(normal, -impulse / b.mass);
        a.angular.add(new THREE.Vector3(normal.z, normal.x, -normal.y).multiplyScalar(impulse * 0.18));
        b.angular.add(new THREE.Vector3(-normal.z, -normal.x, normal.y).multiplyScalar(impulse * 0.18));
      }
    }
}

function resetObjects() {
  for (const b of bodies) {
    b.group.position.copy(b.home);
    b.group.rotation.set(0, 0, 0);
    b.velocity.set(0, 0, 0);
    b.angular.set(0, 0, 0);
  }
}
const reset = document.createElement("button");
reset.className = "capture-hide reset";
reset.textContent = "RESET";
reset.onclick = resetObjects;
document.body.appendChild(reset);

let last = performance.now();
function render(now) {
  const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
  last = now;
  physics(dt);
  heroVy += (-heroLift * 8.5 - heroVy * 5.4) * dt;
  heroLift += heroVy * dt;
  heroReaction *= Math.pow(0.9, dt * 60);
  hero.position.y = 0.12 + heroLift + Math.sin(now * 0.00075) * 0.004;
  hero.rotation.z = THREE.MathUtils.lerp(hero.rotation.z, (pointer.x - 0.5) * -0.025 + Math.sin(now * 0.012) * heroReaction * 0.035, 0.08);
  hero.rotation.x = THREE.MathUtils.lerp(hero.rotation.x, Math.sin(now * 0.009) * heroReaction * 0.022, 0.08);
  const targetScale = 1 + heroReaction * 0.006;
  hero.scale.lerp(new THREE.Vector3(targetScale, 1 + heroReaction * 0.012, targetScale), 0.1);
  key.position.x = THREE.MathUtils.lerp(key.position.x, -3.2 + (pointer.x - 0.5) * 2.2, 0.035);
  key.position.z = THREE.MathUtils.lerp(key.position.z, 4.1 + (pointer.y - 0.5) * 1.1, 0.035);
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, (pointer.x - 0.5) * 0.13, 0.025);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.3 + (pointer.y - 0.5) * 0.06, 0.025);
  camera.lookAt(0, 1.04, 0.18);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function resize() {
  if (capture) return;
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(document.body);
addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "c") {
    const link = document.createElement("a");
    link.download = `sid-studio-${Date.now()}.png`;
    link.href = renderer.domElement.toDataURL("image/png");
    link.click();
  }
  if (e.key.toLowerCase() === "r") resetObjects();
});
Promise.all([heroReady, objectsReady])
  .then(() => {
    status.classList.add("done");
    requestAnimationFrame(render);
  })
  .catch((e) => {
    console.error(e);
    status.textContent = "Scene failed";
    status.classList.add("error");
  });
