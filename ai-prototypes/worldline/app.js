import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const mount = document.querySelector("#world-canvas");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
mount.appendChild(renderer.domElement);

const currentScene = new THREE.Scene();
const futureScene = new THREE.Scene();
const skyColor = new THREE.Color(0xd9e3e6);
const futureSkyColor = new THREE.Color(0xd8e6df);
currentScene.background = skyColor;
futureScene.background = futureSkyColor;
currentScene.fog = new THREE.FogExp2(0xd9e3e6, 0.018);
futureScene.fog = new THREE.FogExp2(0xd8e6df, 0.014);

const camera = new THREE.PerspectiveCamera(39, mount.clientWidth / mount.clientHeight, 0.1, 160);
camera.position.set(0, 12.5, 25);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.2, -8);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 11;
controls.maxDistance = 52;
controls.maxPolarAngle = Math.PI * 0.46;
controls.update();

const state = {
  split: 0.56,
  trees: 18,
  shade: 4,
  water: 6,
  lane: true,
  time: "noon",
  draggingSplit: false,
};

const futureAssets = { trees: [], shades: [], gardens: [], lane: null, crowns: [] };
const movingCars = [];
const currentCrowns = [];

const materials = {
  road: new THREE.MeshStandardMaterial({ color: 0x343a36, roughness: 1 }),
  futureRoad: new THREE.MeshStandardMaterial({ color: 0x47534a, roughness: 1 }),
  sidewalk: new THREE.MeshStandardMaterial({ color: 0xa9aaa1, roughness: 1 }),
  futureSidewalk: new THREE.MeshStandardMaterial({ color: 0xb7b9ae, roughness: 1 }),
  line: new THREE.MeshBasicMaterial({ color: 0xe4d49e }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x76553d, roughness: 1 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x2f7546, roughness: 0.85 }),
  leafLight: new THREE.MeshStandardMaterial({ color: 0x6f9d4f, roughness: 0.9 }),
  currentLeaf: new THREE.MeshStandardMaterial({ color: 0x64764e, roughness: 1 }),
  water: new THREE.MeshStandardMaterial({ color: 0x4f9ca5, roughness: 0.3, metalness: 0.05 }),
  rainGarden: new THREE.MeshStandardMaterial({ color: 0x5b8155, roughness: 1 }),
  shade: new THREE.MeshStandardMaterial({ color: 0xe46b47, roughness: 0.8, side: THREE.DoubleSide }),
  pedestrian: new THREE.MeshStandardMaterial({ color: 0x96a77c, roughness: 1 }),
};

function seededRandom(seed) {
  const value = Math.sin(seed * 9283.17) * 43758.5453;
  return value - Math.floor(value);
}

function mesh(geometry, material, position, rotation = [0, 0, 0]) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(...position);
  item.rotation.set(...rotation);
  item.castShadow = true;
  item.receiveShadow = true;
  return item;
}

function addLight(scene, future = false) {
  scene.add(new THREE.HemisphereLight(future ? 0xdff4ef : 0xe9e0d0, 0x4a5348, future ? 2.35 : 2.05));
  const sun = new THREE.DirectionalLight(future ? 0xfff1c8 : 0xffddb0, future ? 3.4 : 4.1);
  sun.position.set(-16, 27, 13);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  sun.shadow.camera.left = -28;
  sun.shadow.camera.right = 28;
  sun.shadow.camera.top = 32;
  sun.shadow.camera.bottom = -25;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  scene.add(sun);
  scene.userData.sun = sun;
}

function createBuilding(index, side, future) {
  const z = -31 + index * 7.1;
  const width = 5.8 + seededRandom(index + side * 31) * 2.7;
  const depth = 5.4 + seededRandom(index + side * 17) * 2.4;
  const height = 7 + seededRandom(index + side * 7) * 11;
  const warm = [0xc6aa8f, 0xb88565, 0x9b9384, 0xc3beb0, 0x8c9a97][index % 5];
  const color = future ? new THREE.Color(warm).lerp(new THREE.Color(0xc9d3c7), 0.14) : warm;
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.92 });
  const building = mesh(new THREE.BoxGeometry(width, height, depth), material, [side * (8.1 + depth / 2), height / 2, z]);

  const windowMaterial = new THREE.MeshBasicMaterial({ color: future ? 0xbad5c5 : 0xc2b28e });
  const rows = Math.max(2, Math.floor(height / 2.1));
  for (let row = 0; row < rows; row += 1) {
    for (let column = -1; column <= 1; column += 1) {
      const windowMesh = mesh(
        new THREE.PlaneGeometry(0.72, 0.75),
        windowMaterial,
        [-side * (width / 2 + 0.01), -height / 2 + 1.5 + row * 1.55, column * 1.45],
        [0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]
      );
      building.add(windowMesh);
    }
  }
  return building;
}

function createTree(x, z, future = true, scale = 1) {
  const group = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.13 * scale, 0.19 * scale, 2.1 * scale, 7), materials.trunk, [0, 1.05 * scale, 0]);
  const crownMaterial = future ? (seededRandom(Math.abs(z * 3)) > 0.5 ? materials.leaf : materials.leafLight) : materials.currentLeaf;
  const crown = mesh(new THREE.IcosahedronGeometry(1.05 * scale, 1), crownMaterial, [0, 2.65 * scale, 0]);
  crown.scale.set(1, 1.15, 0.92);
  group.add(trunk, crown);
  group.position.set(x, 0.25, z);
  group.userData.crown = crown;
  return group;
}

function createShade(x, z) {
  const group = new THREE.Group();
  const postGeometry = new THREE.CylinderGeometry(0.06, 0.07, 2.5, 6);
  group.add(mesh(postGeometry, materials.trunk, [-1.35, 1.25, 0]), mesh(postGeometry, materials.trunk, [1.35, 1.25, 0]));
  const canopy = mesh(new THREE.PlaneGeometry(3.15, 2.1), materials.shade, [0, 2.55, 0], [-Math.PI / 2.25, 0, 0]);
  group.add(canopy);
  group.position.set(x, 0, z);
  return group;
}

function createRainGarden(x, z) {
  const group = new THREE.Group();
  group.add(mesh(new THREE.BoxGeometry(1.4, 0.15, 3.6), materials.rainGarden, [0, 0.18, 0]));
  group.add(mesh(new THREE.BoxGeometry(0.62, 0.04, 2.9), materials.water, [0, 0.28, 0]));
  for (let index = 0; index < 7; index += 1) {
    const plant = mesh(new THREE.ConeGeometry(0.13, 0.55, 6), materials.leafLight, [
      -0.5 + (index % 3) * 0.5,
      0.5,
      -1.2 + Math.floor(index / 3) * 1.15,
    ]);
    group.add(plant);
  }
  group.position.set(x, 0, z);
  return group;
}

function createPerson(x, z, color) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  group.add(mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.85, 7), material, [0, 0.65, 0]));
  group.add(mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshStandardMaterial({ color: 0x735b4b }), [0, 1.22, 0]));
  group.position.set(x, 0, z);
  return group;
}

function populate(scene, future = false) {
  addLight(scene, future);
  const groundMaterial = future ? materials.futureRoad : materials.road;
  scene.add(mesh(new THREE.PlaneGeometry(13.5, 78), groundMaterial, [0, 0, -5], [-Math.PI / 2, 0, 0]));
  scene.add(mesh(new THREE.PlaneGeometry(4.8, 78), future ? materials.futureSidewalk : materials.sidewalk, [-9.1, 0.08, -5], [-Math.PI / 2, 0, 0]));
  scene.add(mesh(new THREE.PlaneGeometry(4.8, 78), future ? materials.futureSidewalk : materials.sidewalk, [9.1, 0.08, -5], [-Math.PI / 2, 0, 0]));

  for (let line = -1; line <= 1; line += 2) {
    for (let z = -40; z < 32; z += 5.4) {
      scene.add(mesh(new THREE.PlaneGeometry(0.12, 2.4), materials.line, [line * 2.2, 0.025, z], [-Math.PI / 2, 0, 0]));
    }
  }

  for (let index = 0; index < 10; index += 1) {
    scene.add(createBuilding(index, -1, future), createBuilding(index, 1, future));
  }

  for (let stripe = -4; stripe <= 4; stripe += 1) {
    scene.add(
      mesh(new THREE.PlaneGeometry(0.65, 5.6), new THREE.MeshBasicMaterial({ color: 0xe5e1d1 }), [stripe * 1.25, 0.035, 9], [-Math.PI / 2, 0, 0])
    );
  }

  const carColors = [0x365d75, 0x8d4939, 0xe5d7b5, 0x434644];
  for (let index = 0; index < 5; index += 1) {
    const car = mesh(
      new THREE.BoxGeometry(1.25, 0.65, 2.5),
      new THREE.MeshStandardMaterial({ color: carColors[index % carColors.length], roughness: 0.5, metalness: 0.18 }),
      [index % 2 ? 3.8 : -3.8, 0.55, -28 + index * 11]
    );
    car.userData.speed = 1.1 + index * 0.14;
    car.userData.direction = index % 2 ? 1 : -1;
    scene.add(car);
    if (!future) movingCars.push(car);
  }

  const currentTrees = [
    [-7.2, -22],
    [7.2, -4],
    [-7.2, 15],
    [7.2, 27],
  ];
  currentTrees.forEach(([x, z], index) => {
    const tree = createTree(x, z, false, 0.78 + index * 0.04);
    scene.add(tree);
    if (!future) currentCrowns.push(tree.userData.crown);
  });

  for (let index = 0; index < 9; index += 1) {
    scene.add(createPerson(index % 2 ? 7.7 : -7.7, -24 + index * 7.2, [0xd45f42, 0x477965, 0xe1b754, 0x6a6c8c][index % 4]));
  }

  if (future) {
    for (let index = 0; index < 24; index += 1) {
      const side = index % 2 ? 1 : -1;
      const tree = createTree(side * 6.9, -31 + Math.floor(index / 2) * 5.7, true, 0.82 + seededRandom(index) * 0.2);
      scene.add(tree);
      futureAssets.trees.push(tree);
      futureAssets.crowns.push(tree.userData.crown);
    }
    for (let index = 0; index < 6; index += 1) {
      const shade = createShade(index % 2 ? 7.2 : -7.2, -22 + index * 10.5);
      scene.add(shade);
      futureAssets.shades.push(shade);
    }
    for (let index = 0; index < 8; index += 1) {
      const garden = createRainGarden(index % 2 ? 5.9 : -5.9, -29 + index * 8.5);
      scene.add(garden);
      futureAssets.gardens.push(garden);
    }
    futureAssets.lane = mesh(new THREE.PlaneGeometry(2.25, 70), materials.pedestrian, [-4.75, 0.04, -5], [-Math.PI / 2, 0, 0]);
    scene.add(futureAssets.lane);
  }
}

populate(currentScene, false);
populate(futureScene, true);

function updateAssets() {
  futureAssets.trees.forEach((tree, index) => {
    tree.visible = index < state.trees;
  });
  futureAssets.shades.forEach((shade, index) => {
    shade.visible = index < state.shade;
  });
  futureAssets.gardens.forEach((garden, index) => {
    garden.visible = index < state.water;
  });
  futureAssets.lane.visible = state.lane;

  document.querySelector("#tree-output").textContent = state.trees;
  document.querySelector("#shade-output").textContent = state.shade;
  document.querySelector("#water-output").textContent = state.water;

  const shadePercent = Math.round(14 + state.trees * 1.85 + state.shade * 3.7);
  const cooling = Math.min(9, Math.round(state.trees * 0.23 + state.shade * 0.7 + (state.lane ? 1.2 : 0)));
  const waterLiters = Math.round(state.water * 3.1);
  const walkScore = Math.min(94, Math.round(42 + state.trees * 1.15 + state.shade * 2.6 + (state.lane ? 8 : 0)));
  document.querySelector("#heat-impact").textContent = `${39 - cooling}°C`;
  document.querySelector("#heat-delta").textContent = `−${cooling}°`;
  document.querySelector("#shade-impact").textContent = `${shadePercent}%`;
  document.querySelector("#shade-delta").textContent = `+${shadePercent - 14}%`;
  document.querySelector("#water-impact").textContent = `${waterLiters}k L`;
  document.querySelector("#walk-impact").textContent = walkScore;
}

const splitHandle = document.querySelector("#split-handle");
function setSplit(clientX) {
  const rect = mount.getBoundingClientRect();
  state.split = Math.max(0.14, Math.min(0.86, (clientX - rect.left) / rect.width));
  splitHandle.style.left = `${state.split * 100}%`;
}
splitHandle.addEventListener("pointerdown", (event) => {
  state.draggingSplit = true;
  splitHandle.setPointerCapture(event.pointerId);
  setSplit(event.clientX);
});
splitHandle.addEventListener("pointermove", (event) => {
  if (state.draggingSplit) setSplit(event.clientX);
});
splitHandle.addEventListener("pointerup", () => {
  state.draggingSplit = false;
});
splitHandle.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  state.split = Math.max(0.14, Math.min(0.86, state.split + (event.key === "ArrowRight" ? 0.03 : -0.03)));
  splitHandle.style.left = `${state.split * 100}%`;
});

const inputs = {
  trees: document.querySelector("#tree-control"),
  shade: document.querySelector("#shade-control"),
  water: document.querySelector("#water-control"),
};
Object.entries(inputs).forEach(([key, input]) => {
  input.addEventListener("input", () => {
    state[key] = Number(input.value);
    updateAssets();
  });
});
document.querySelector("#lane-control").addEventListener("change", (event) => {
  state.lane = event.target.checked;
  updateAssets();
});

function setTime(time) {
  state.time = time;
  document.querySelectorAll("[data-time]").forEach((button) => button.classList.toggle("is-active", button.dataset.time === time));
  const settings = {
    morning: { position: [-22, 13, 4], intensity: 2.7, exposure: 0.96 },
    noon: { position: [-16, 27, 13], intensity: 4.1, exposure: 1.05 },
    evening: { position: [24, 8, -10], intensity: 2.2, exposure: 0.86 },
  }[time];
  [currentScene, futureScene].forEach((scene, index) => {
    scene.userData.sun.position.set(...settings.position);
    scene.userData.sun.intensity = settings.intensity - index * 0.35;
  });
  renderer.toneMappingExposure = settings.exposure;
}
document.querySelectorAll("[data-time]").forEach((button) => button.addEventListener("click", () => setTime(button.dataset.time)));

const toast = document.querySelector("#toast");
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

const simulationDialog = document.querySelector("#simulation-dialog");
const pipelineLabels = ["Maps context", "Climate layers", "Spatial proposal", "3D future"];
const pipelineDetails = [
  "Reading street geometry, places, transit stops, and loading zones.",
  "Mapping sun exposure, surface heat, canopy, and drainage.",
  "Testing interventions against movement and infrastructure constraints.",
  "Rendering the proposed block and calculating predicted impact.",
];

async function requestGroundedProposal() {
  const apiUrl = window.WORLDLINE_CONFIG?.apiUrl;
  if (!apiUrl) return null;
  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/propose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      place: placeInput.value,
      coordinates: { latitude: 40.7173, longitude: -73.9915 },
      climate: { airTemperatureC: 34, feelsLikeC: 39, canopyPercent: 14, condition: "heat advisory" },
      goal: "Create a continuous heat-safe walking route while preserving deliveries and accessible curb access.",
    }),
  });
  if (!response.ok) throw new Error(`Proposal service returned ${response.status}`);
  return response.json();
}

function applyProposal(proposal) {
  if (!proposal?.interventions) return;
  const { interventions } = proposal;
  state.trees = Math.max(2, Math.min(24, Number(interventions.trees) || state.trees));
  state.shade = Math.max(0, Math.min(6, Number(interventions.shadeStructures) || state.shade));
  state.water = Math.max(0, Math.min(8, Number(interventions.rainGardens) || state.water));
  state.lane = interventions.pedestrianEdge !== false;
  inputs.trees.value = state.trees;
  inputs.shade.value = state.shade;
  inputs.water.value = state.water;
  document.querySelector("#lane-control").checked = state.lane;
  if (proposal.summary) document.querySelector(".proposal-summary").textContent = proposal.summary;
  updateAssets();
}

async function runSimulation() {
  simulationDialog.showModal();
  const steps = [...document.querySelectorAll(".pipeline-steps span")];
  const proposalRequest = requestGroundedProposal().catch((error) => ({ error: error.message }));
  for (let index = 0; index < steps.length; index += 1) {
    steps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === index));
    document.querySelector("#simulation-detail").textContent = pipelineDetails[index];
    document.querySelector(".simulation-copy h2").textContent = pipelineLabels[index];
    await new Promise((resolve) => setTimeout(resolve, 560));
  }
  const proposal = await proposalRequest;
  if (proposal?.error) showToast(`Live grounding unavailable. Showing prototype proposal.`);
  else applyProposal(proposal);
  simulationDialog.close();
  state.split = 0.5;
  splitHandle.style.left = "50%";
  showToast("Heat-safe walk generated from the prototype block dataset.");
}
document.querySelector("#simulate-button").addEventListener("click", runSimulation);

const placeInput = document.querySelector("#place-input");
placeInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  showToast("Prototype currently includes Allen Street. Live Maps grounding connects at deployment.");
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    placeInput.focus();
    placeInput.select();
  }
});

function resize() {
  const width = mount.clientWidth;
  const height = mount.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(mount);

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  controls.update();
  [...currentCrowns, ...futureAssets.crowns].forEach((crown, index) => {
    crown.rotation.y = Math.sin(elapsed * 0.45 + index) * 0.035;
    crown.rotation.z = Math.sin(elapsed * 0.6 + index * 0.7) * 0.018;
  });
  movingCars.forEach((car) => {
    car.position.z += car.userData.speed * car.userData.direction * 0.012;
    if (car.position.z > 36) car.position.z = -42;
    if (car.position.z < -42) car.position.z = 36;
  });

  const width = mount.clientWidth;
  const height = mount.clientHeight;
  const splitPixels = Math.round(width * state.split);
  renderer.setScissorTest(false);
  renderer.clear();
  renderer.setScissorTest(true);
  renderer.setViewport(0, 0, splitPixels, height);
  renderer.setScissor(0, 0, splitPixels, height);
  renderer.render(currentScene, camera);
  renderer.setViewport(splitPixels, 0, width - splitPixels, height);
  renderer.setScissor(splitPixels, 0, width - splitPixels, height);
  renderer.render(futureScene, camera);
  renderer.setScissorTest(false);
}

updateAssets();
setTime("noon");
animate();
