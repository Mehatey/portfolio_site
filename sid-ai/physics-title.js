import * as THREE from "three";
import * as CANNON from "cannon-es";
import { TTFLoader } from "three/addons/loaders/TTFLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { Font } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.querySelector("#stage"),
  loaderEl = document.querySelector("#loader"),
  cursorEl = document.querySelector(".cursor"),
  stateEl = document.querySelector(".state"),
  stringEls = [...document.querySelectorAll(".string")];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 30);
camera.position.set(0, 0, 8);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.03).texture;
scene.add(new THREE.HemisphereLight(0xcbd5e7, 0x060709, 1.25));
const key = new THREE.DirectionalLight(0xfff4e8, 4);
key.position.set(-4, 6, 7);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
scene.add(key);
const cursorLight = new THREE.PointLight(0x80e8dd, 38, 9, 2);
cursorLight.position.set(3, 1, 4);
scene.add(cursorLight);

const bgMat = new THREE.ShaderMaterial({
  depthWrite: false,
  depthTest: false,
  uniforms: {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uAspect: { value: innerWidth / innerHeight },
    uPulse: { value: 0 },
    uHover: { value: 0 },
    uVelocity: { value: 0 },
  },
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
  fragmentShader: `
uniform float uTime,uAspect,uPulse,uHover,uVelocity;uniform vec2 uPointer;varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(1.6,-1.2,1.2,1.6)*p+1.7;a*=.48;}return v;}
void main(){vec2 uv=vUv,p=uv-.5;p.x*=uAspect;vec2 d=uv-uPointer;d.x*=uAspect;float dist=length(d),t=uTime*.09;vec2 flow=vec2(fbm(p*1.15+vec2(t,-t*.6)),fbm(p*1.15+vec2(4.2,-2.7)-t));float surface=fbm(p*2.15+flow*1.35);float ripple=sin(dist*55.-uTime*5.)*exp(-dist*9.)*(.018+uVelocity*.08+uPulse*.1);surface+=ripple;vec3 ultramarine=vec3(.025,.08,.62),cobalt=vec3(.03,.22,.78),magenta=vec3(.78,.045,.42),turquoise=vec3(.03,.86,.7),sun=vec3(1.,.67,.06);vec3 col=mix(ultramarine,cobalt,smoothstep(.28,.68,surface));col=mix(col,magenta,smoothstep(.61,.9,surface)*.72);col=mix(col,turquoise,smoothstep(.72,.96,flow.x)*.34);float spec=pow(smoothstep(.56,.8,surface)-smoothstep(.8,.95,surface),2.)*9.;col+=sun*spec*.28;
float edge=min(uv.y,1.-uv.y);float columns=pow(noise(vec2(floor(uv.x*92.),uTime*.025)),2.4);float local=exp(-dist*2.8);float reach=18.-(uHover*.72+local*.28)*11.;float streak=exp(-edge*reach)*columns;streak*=.36+.9*uHover+.45*local;col+=mix(magenta,sun,columns)*streak*.58;col+=turquoise*uPulse*exp(-dist*7.)*.25;col*=.9+.1*smoothstep(1.2,.12,length(p));gl_FragColor=vec4(col,1.);}`,
});
const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
bg.frustumCulled = false;
bg.renderOrder = -10;
scene.add(bg);

const particleCount = reduceMotion ? 100 : 900,
  particleGeo = new THREE.BufferGeometry(),
  particlePos = new Float32Array(particleCount * 3),
  particleSeed = new Float32Array(particleCount);
for (let i = 0; i < particleCount; i++) {
  particlePos[i * 3] = (Math.random() - 0.5) * 14;
  particlePos[i * 3 + 1] = (Math.random() - 0.5) * 8;
  particlePos[i * 3 + 2] = -1.5 - Math.random() * 1.5;
  particleSeed[i] = Math.random();
}
particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
particleGeo.setAttribute("aSeed", new THREE.BufferAttribute(particleSeed, 1));
const particleMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 }, uRelease: { value: 0 } },
  vertexShader: `attribute float aSeed;uniform float uTime,uRelease;varying float vA;void main(){vec3 p=position;p.x+=sin(p.y*.5+uTime*.08+aSeed*8.)*.08;p.y+=cos(p.x*.4-uTime*.06+aSeed*5.)*.055;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=(.6+aSeed)*(8./-mv.z);gl_Position=projectionMatrix*mv;vA=.025+.055*uRelease;}`,
  fragmentShader: `varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(mix(vec3(.42,.32,1.),vec3(.82,.86,1.),gl_PointCoord.x),vA*(1.-d*2.));}`,
});
scene.add(new THREE.Points(particleGeo, particleMat));

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
world.broadphase = new CANNON.SAPBroadphase(world);
world.solver.iterations = 18;
world.defaultContactMaterial.friction = 0.38;
world.defaultContactMaterial.restitution = 0.22;
const items = [],
  letters = [],
  props = [],
  boundaries = [],
  raycaster = new THREE.Raycaster(),
  ndc = new THREE.Vector2(2, 2),
  pointerWorld = new THREE.Vector3(),
  previousWorld = new THREE.Vector3(),
  pointerUv = new THREE.Vector2(0.5, 0.5),
  dragVelocity = new THREE.Vector3();
let hovered = null,
  dragged = null,
  grabConstraint = null,
  dragOffset = new THREE.Vector3(),
  audioCtx = null,
  lastLine = -1,
  lastLineTime = 0,
  release = 0,
  releaseUntil = 0,
  loaded = 0,
  hoverStrength = 0,
  pointerSpeed = 0;
const grabBody = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC, collisionFilterGroup: 0, collisionFilterMask: 0 });
world.addBody(grabBody);
const notes = [130.81, 164.81, 196, 261.63, 329.63],
  stringEnergy = new Float32Array(5),
  stringPhase = new Float32Array(5),
  lineFractions = [0.24, 0.37, 0.5, 0.63, 0.76];
function viewSize() {
  const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * camera.position.z;
  return { w: h * camera.aspect, h };
}
function addBounds() {
  boundaries.splice(0).forEach((b) => world.removeBody(b));
  const { w, h } = viewSize(),
    add = (x, y, hx, hy) => {
      const b = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(hx, hy, 1)), position: new CANNON.Vec3(x, y, 0) });
      world.addBody(b);
      boundaries.push(b);
    };
  add(-w / 2 - 0.25, 0, 0.3, h);
  add(w / 2 + 0.25, 0, 0.3, h);
  add(0, -h / 2 - 0.2, w, 0.3);
  add(0, h / 2 + 0.2, w, 0.3);
}
addBounds();

const palettes = [0xff3f8e, 0xffcf2f, 0x35e0b8, 0x765bff];
new TTFLoader().load("./fonts/archivo-black.ttf", (json) => buildLetters(new Font(json)));
function buildLetters(font) {
  const { w } = viewSize(),
    size = THREE.MathUtils.clamp(w / 13, 0.58, 0.92),
    rows = [
      { text: "SIDDHARTH", y: 0.5 },
      { text: "MEHTA", y: -0.62 },
    ];
  rows.forEach((row, rowIndex) => {
    const made = [];
    let total = 0,
      gap = size * 0.09;
    for (const char of row.text) {
      const g = new TextGeometry(char, {
        font,
        size,
        depth: size * 0.34,
        curveSegments: 10,
        bevelEnabled: true,
        bevelThickness: size * 0.025,
        bevelSize: size * 0.014,
        bevelSegments: 3,
      });
      g.computeBoundingBox();
      const b = g.boundingBox,
        w = b.max.x - b.min.x,
        h = b.max.y - b.min.y,
        d = b.max.z - b.min.z;
      g.translate(-(b.min.x + b.max.x) / 2, -(b.min.y + b.max.y) / 2, -(b.min.z + b.max.z) / 2);
      const color = palettes[(letters.length + rowIndex) % palettes.length],
        m = new THREE.MeshPhysicalMaterial({
          color,
          metalness: color === 0xeee9df ? 0.28 : 0.76,
          roughness: color === 0x191815 ? 0.2 : 0.27,
          clearcoat: 0.75,
          clearcoatRoughness: 0.12,
          iridescence: 0.06,
        });
      const mesh = new THREE.Mesh(g, m);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      const mass = 1.4 + w * 0.8,
        body = new CANNON.Body({
          mass,
          shape: new CANNON.Box(new CANNON.Vec3(w * 0.47, h * 0.46, Math.max(d * 0.45, 0.08))),
          linearDamping: 0.58,
          angularDamping: 0.7,
        });
      body.linearFactor.set(1, 1, 0);
      body.angularFactor.set(0, 0, 1);
      world.addBody(body);
      const item = { kind: "letter", mesh, body, width: w, home: new CANNON.Vec3(), homeXRatio: 0, spring: 22 };
      mesh.userData.item = item;
      letters.push(item);
      items.push(item);
      made.push(item);
      total += w + gap;
    }
    total -= gap;
    let x = -total / 2;
    made.forEach((item) => {
      item.home.set(x + item.width / 2, row.y, 0);
      item.homeXRatio = item.home.x / viewSize().w;
      item.body.position.copy(item.home);
      x += item.width + gap;
    });
  });
  assetReady();
}

const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const propSpecs = [
  { url: "./models/buddha-web.glb", home: [-0.41, 0.29], scale: 0.78, style: "silver" },
  { url: "./models/pumpkin.glb", home: [0.41, -0.3], scale: 0.64, style: "violet" },
];
propSpecs.forEach((spec) =>
  gltfLoader.load(
    spec.url,
    (g) => addProp(g.scene, spec),
    undefined,
    () => assetReady()
  )
);
function addProp(group, spec) {
  const box = new THREE.Box3().setFromObject(group),
    size = box.getSize(new THREE.Vector3()),
    center = box.getCenter(new THREE.Vector3()),
    s = spec.scale / Math.max(size.x, size.y, size.z);
  group.position.sub(center.multiplyScalar(s));
  group.scale.setScalar(s);
  const shell = new THREE.Group();
  shell.add(group);
  shell.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const silver = spec.style === "silver";
    o.material = new THREE.MeshPhysicalMaterial({
      color: silver ? 0x24d9c0 : 0xff477f,
      metalness: 0.7,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      iridescence: 0.65,
      iridescenceIOR: 1.5,
      emissive: silver ? 0x063d42 : 0x3d071e,
      emissiveIntensity: 0.4,
    });
  });
  scene.add(shell);
  const { w, h } = viewSize(),
    body = new CANNON.Body({ mass: 2.2, shape: new CANNON.Sphere(spec.scale * 0.35), linearDamping: 0.46, angularDamping: 0.55 });
  body.linearFactor.set(1, 1, 0);
  body.angularFactor.set(0, 0, 1);
  const home = new CANNON.Vec3(spec.home[0] * w, spec.home[1] * h, 0);
  body.position.copy(home);
  world.addBody(body);
  const item = { kind: "prop", mesh: shell, body, home, spring: 5.5, spec };
  shell.traverse((o) => (o.userData.item = item));
  props.push(item);
  items.push(item);
  assetReady();
}
function assetReady() {
  loaded++;
  if (loaded >= 3) loaderEl.classList.add("done");
}

function screenToWorld(x, y) {
  ndc.set((x / innerWidth) * 2 - 1, (-y / innerHeight) * 2 + 1);
  const v = new THREE.Vector3(ndc.x, ndc.y, 0.5).unproject(camera),
    dir = v.sub(camera.position).normalize(),
    distance = -camera.position.z / dir.z;
  pointerWorld.copy(camera.position).add(dir.multiplyScalar(distance));
  pointerUv.set(x / innerWidth, 1 - y / innerHeight);
}
function itemFromObject(o) {
  while (o && !o.userData.item) o = o.parent;
  return o?.userData.item || null;
}
function setHover(next) {
  if (hovered === next) return;
  hovered = next;
  cursorEl.classList.toggle("hot", !!hovered);
}
addEventListener("pointermove", (e) => {
  cursorEl.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  previousWorld.copy(pointerWorld);
  screenToWorld(e.clientX, e.clientY);
  const delta = pointerWorld.clone().sub(previousWorld);
  pointerSpeed = Math.min(1, pointerSpeed + delta.length() * 2.4);
  dragVelocity.lerp(delta.multiplyScalar(18), 0.28);
  raycaster.setFromCamera(ndc, camera);
  setHover(
    itemFromObject(
      raycaster.intersectObjects(
        items.map((i) => i.mesh),
        true
      )[0]?.object
    )
  );
  if (dragged) {
    grabBody.position.set(pointerWorld.x - dragOffset.x, pointerWorld.y - dragOffset.y, 0);
    grabBody.velocity.set(dragVelocity.x, dragVelocity.y, 0);
    grabBody.aabbNeedsUpdate = true;
  }
  checkStrings(e.clientX, e.clientY, delta.length());
});
addEventListener("pointerdown", () => {
  unlockAudio();
  if (hovered) {
    dragged = hovered;
    dragOffset.set(pointerWorld.x - dragged.body.position.x, pointerWorld.y - dragged.body.position.y, 0);
    grabBody.position.copy(dragged.body.position);
    dragged.body.wakeUp();
    grabConstraint = new CANNON.PointToPointConstraint(
      dragged.body,
      new CANNON.Vec3(),
      grabBody,
      new CANNON.Vec3(),
      Math.max(70, dragged.body.mass * 42)
    );
    grabConstraint.collideConnected = false;
    world.addConstraint(grabConstraint);
  } else releaseField();
});
function finishDrag() {
  if (!dragged) return;
  if (grabConstraint) {
    world.removeConstraint(grabConstraint);
    grabConstraint = null;
  }
  dragged.body.velocity.set(
    THREE.MathUtils.clamp(dragged.body.velocity.x * 0.45 + dragVelocity.x * 0.55, -1.8, 1.8),
    THREE.MathUtils.clamp(dragged.body.velocity.y * 0.45 + dragVelocity.y * 0.55, -1.8, 1.8),
    0
  );
  dragged = null;
}
addEventListener("pointerup", finishDrag);
addEventListener("pointercancel", finishDrag);
addEventListener("blur", finishDrag);
function releaseField() {
  releaseUntil = performance.now() + 760;
  items.forEach((item) => {
    const dx = item.body.position.x - pointerWorld.x,
      dy = item.body.position.y - pointerWorld.y,
      d = Math.max(0.5, Math.hypot(dx, dy));
    if (d < 2.2) {
      const k = (1 - d / 2.2) * 0.42;
      item.body.applyImpulse(new CANNON.Vec3((dx / d) * k, (dy / d) * k, 0), item.body.position);
    }
  });
  for (let i = 0; i < stringEnergy.length; i++) stringEnergy[i] += 3 + Math.random() * 3;
}

function unlockAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioCtx.resume();
}
function checkStrings(x, y, speed) {
  let near = -1;
  lineFractions.forEach((f, i) => {
    if (Math.abs(y - innerHeight * f) < 10) near = i;
  });
  if (near < 0) {
    lastLine = -1;
    return;
  }
  if (near !== lastLine && performance.now() - lastLineTime > 90) {
    lastLine = near;
    lastLineTime = performance.now();
    stringEnergy[near] = Math.min(18, stringEnergy[near] + 6 + speed * 70);
    stringPhase[near] = (x / innerWidth) * Math.PI;
    playPiano(notes[near]);
  }
}
function playPiano(freq) {
  if (!audioCtx || audioCtx.state !== "running") return;
  const now = audioCtx.currentTime,
    master = audioCtx.createGain(),
    filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(4800, now);
  filter.frequency.exponentialRampToValueAtTime(750, now + 1.7);
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.13, now + 0.005);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.75);
  filter.connect(master).connect(audioCtx.destination);
  [
    [1, "triangle", 0.7],
    [2, "sine", 0.18],
    [3.01, "sine", 0.07],
  ].forEach(([mul, type, g]) => {
    const o = audioCtx.createOscillator(),
      gain = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq * mul;
    gain.gain.value = g;
    o.connect(gain).connect(filter);
    o.start(now);
    o.stop(now + 1.8);
  });
}
function drawStrings(time) {
  stringEls.forEach((el, i) => {
    const y = innerHeight * lineFractions[i],
      amp = stringEnergy[i] * Math.sin(time * (7 + i * 0.38) + stringPhase[i]);
    const x = pointerUv.x * innerWidth,
      c1 = Math.max(0, x - 260),
      c2 = Math.min(innerWidth, x + 260);
    el.setAttribute("d", `M 0 ${y} C ${c1} ${y}, ${Math.max(0, x - 70)} ${y + amp}, ${x} ${y + amp} S ${c2} ${y}, ${innerWidth} ${y}`);
    el.classList.toggle("active", stringEnergy[i] > 1.5);
    stringEnergy[i] *= 0.94;
  });
}

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  renderer.setSize(innerWidth, innerHeight, false);
  bgMat.uniforms.uAspect.value = innerWidth / innerHeight;
  addBounds();
  const v = viewSize();
  letters.forEach((item) => (item.home.x = item.homeXRatio * v.w));
  props.forEach((p) => p.home.set(p.spec.home[0] * v.w, p.spec.home[1] * v.h, 0));
});
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 1 / 30),
    time = clock.elapsedTime,
    targetRelease = performance.now() < releaseUntil ? 1 : 0;
  release = THREE.MathUtils.lerp(release, targetRelease, targetRelease ? 0.18 : 0.075);
  hoverStrength = THREE.MathUtils.lerp(hoverStrength, hovered ? 1 : 0, 0.075);
  pointerSpeed *= 0.91;
  stateEl.textContent = hovered ? "Surface awake" : targetRelease ? "Water disturbed" : audioCtx ? "Piano on" : "Sound locked";
  stateEl.classList.toggle("live", !!hovered || !!targetRelease);
  bgMat.uniforms.uTime.value = time;
  bgMat.uniforms.uPointer.value.copy(pointerUv);
  bgMat.uniforms.uPulse.value = release;
  bgMat.uniforms.uHover.value = hoverStrength;
  bgMat.uniforms.uVelocity.value = pointerSpeed;
  particleMat.uniforms.uTime.value = time;
  particleMat.uniforms.uRelease.value = Math.max(release, hoverStrength * 0.55);
  cursorLight.color.setHex(0xffcf2f);
  cursorLight.intensity = 34 + hoverStrength * 26;
  cursorLight.position.set(ndc.x * 4, ndc.y * 2.4, 4);
  items.forEach((item, i) => {
    const isProp = item.kind === "prop",
      phase = i * 0.71;
    item.mesh.scale.setScalar(
      THREE.MathUtils.lerp(item.mesh.scale.x, item === hovered ? 1.16 : 1 + Math.sin(time * 0.55 + phase) * (isProp ? 0.025 : 0.009), 0.085)
    );
    if (item !== dragged) {
      const idleX = isProp ? Math.sin(time * 0.28 + phase) * 0.1 : 0,
        idleY = Math.sin(time * (isProp ? 0.34 : 0.48) + phase) * (isProp ? 0.11 : 0.028),
        dx = item.home.x + idleX - item.body.position.x,
        dy = item.home.y + idleY - item.body.position.y,
        m = item.body.mass,
        k = item.spring,
        c = 2 * Math.sqrt(k * m) * 0.9;
      item.body.force.x += dx * k - item.body.velocity.x * c;
      item.body.force.y += dy * k - item.body.velocity.y * c;
      const q = item.body.quaternion,
        angle = Math.atan2(2 * (q.w * q.z), 1 - 2 * q.z * q.z),
        ak = item.kind === "letter" ? 18 : 6;
      item.body.torque.z += -angle * ak - item.body.angularVelocity.z * 2.6 + (isProp ? Math.sin(time * 0.4 + phase) * 0.035 : 0);
    }
    item.body.position.z = 0;
    item.body.velocity.z = 0;
  });
  world.step(1 / 60, dt, 5);
  items.forEach((item) => {
    item.mesh.position.copy(item.body.position);
    item.mesh.quaternion.copy(item.body.quaternion);
  });
  drawStrings(time);
  renderer.render(scene, camera);
}
animate();
