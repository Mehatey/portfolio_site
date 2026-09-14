import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TTFLoader } from "three/addons/loaders/TTFLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { Font } from "three/addons/loaders/FontLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.querySelector("#stage"),
  loaderEl = document.querySelector("#loader"),
  cursorEl = document.querySelector(".cursor"),
  stateEl = document.querySelector(".state");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050608);
scene.fog = new THREE.FogExp2(0x050608, 0.055);
const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.05, 80);
camera.position.set(0, 0.45, 8.6);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const world = new THREE.Group();
scene.add(world);
const hero = new THREE.Group();
world.add(hero);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(2, 2),
  pointerSmooth = new THREE.Vector2(),
  lastPointer = new THREE.Vector2();
let hover = 0,
  hoverTarget = 0,
  clickPulse = 0,
  scrollProgress = 0,
  mixer,
  character,
  activeAction;
const hitMeshes = [];
scene.add(new THREE.HemisphereLight(0x8d95b5, 0x100d09, 0.46));
const key = new THREE.SpotLight(0xffe4bd, 150, 25, 0.42, 0.7, 1.3);
key.position.set(-4, 7, 6);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
scene.add(key);
const rim = new THREE.PointLight(0x8b4dff, 80, 12, 1.7);
rim.position.set(4, 2, 2);
scene.add(rim);
const cursorLight = new THREE.PointLight(0xc7ff3d, 0, 5, 2);
scene.add(cursorLight);
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(45, 45),
  new THREE.MeshPhysicalMaterial({ color: 0x08090b, roughness: 0.23, metalness: 0.72, clearcoat: 1, clearcoatRoughness: 0.2 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.12;
floor.receiveShadow = true;
world.add(floor);
const monolith = new THREE.Mesh(
  new THREE.BoxGeometry(1.3, 6.7, 0.22, 4, 8, 1),
  new THREE.MeshPhysicalMaterial({
    color: 0x060709,
    metalness: 0.96,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    iridescence: 0.2,
    iridescenceIOR: 1.7,
  })
);
monolith.position.set(-3.05, 0.55, -2.6);
monolith.rotation.z = -0.08;
monolith.castShadow = true;
world.add(monolith);
const sunMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: { uTime: { value: 0 }, uHover: { value: 0 } },
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `varying vec2 vUv;uniform float uTime,uHover;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 p=vUv-.5;float d=length(p)*2.;float edge=1.-smoothstep(.86,1.,d);float core=1.-smoothstep(0.,.92,d);float grain=(h(floor(vUv*240.+uTime*.7))-.5)*.045;vec3 a=vec3(1.,.34,.08),b=vec3(1.,.84,.34);vec3 c=mix(a,b,core)+grain;c+=uHover*vec3(.08,.28,.4)*(1.-d);gl_FragColor=vec4(c,edge*.96);}`,
});
const sun = new THREE.Mesh(new THREE.CircleGeometry(1.82, 128), sunMat);
sun.position.set(2.25, 1.15, -3.1);
world.add(sun);
const COUNT = reduced ? 9000 : 36000,
  pos = new Float32Array(COUNT * 3),
  seed = new Float32Array(COUNT),
  size = new Float32Array(COUNT);
for (let i = 0; i < COUNT; i++) {
  const j = i * 3,
    r = Math.pow(Math.random(), 0.72) * 5.2,
    a = Math.random() * Math.PI * 2;
  pos[j] = Math.cos(a) * r;
  pos[j + 1] = (Math.random() - 0.5) * 6.4;
  pos[j + 2] = Math.sin(a) * 1.7 - 1.2;
  seed[i] = Math.random();
  size[i] = 0.4 + Math.random() * 1.35;
}
const pg = new THREE.BufferGeometry();
pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
pg.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
pg.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
const particleMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
    uHover: { value: 0 },
    uPulse: { value: 0 },
    uScroll: { value: 0 },
    uDpr: { value: renderer.getPixelRatio() },
  },
  vertexShader: `attribute float aSeed,aSize;uniform float uTime,uHover,uPulse,uScroll,uDpr;uniform vec2 uPointer;varying float vA,vSeed;void main(){vec3 p=position;float t=uTime*.12;float band=sin(p.y*1.7+aSeed*21.+t*3.)*.26;p.x+=band+sin(p.y*.42+t+aSeed*6.28)*.34;p.z+=cos(p.y*.55-t*1.4+aSeed*8.)*.28;vec4 mv=modelViewMatrix*vec4(p,1.);vec2 sp=mv.xy/max(.8,-mv.z);float d=length(sp-uPointer*.48);float force=exp(-d*d*9.)*(.18+uHover*.45);float ang=atan(sp.y-uPointer.y*.48,sp.x-uPointer.x*.48);mv.xy+=vec2(cos(ang),sin(ang))*force*(.35+sin(aSeed*41.+uTime*2.)*.12);mv.xy+=normalize(mv.xy+vec2(.001))*uPulse*(.25+aSeed*.55);mv.x+=sin(uScroll*6.283+aSeed*9.)*.15*uScroll;gl_Position=projectionMatrix*mv;gl_PointSize=aSize*uDpr*(22./max(2.,-mv.z))*(.7+uHover*.9);vA=(.06+.28*pow(1.-aSeed,2.)+uHover*.14)*smoothstep(12.,2.,-mv.z);vSeed=aSeed;}`,
  fragmentShader: `varying float vA,vSeed;uniform float uHover;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);float a=smoothstep(.5,.05,d)*vA;vec3 pearl=vec3(.72,.79,.88),acid=vec3(.72,1.,.2),violet=vec3(.52,.25,1.);vec3 c=mix(pearl,mix(violet,acid,uHover),smoothstep(.58,1.,vSeed));gl_FragColor=vec4(c,a);}`,
});
const particles = new THREE.Points(pg, particleMat);
particles.position.set(0, 0.35, -1);
world.add(particles);
const textGroup = new THREE.Group();
world.add(textGroup);
const chromeText = new THREE.MeshPhysicalMaterial({
  color: 0xe9e6df,
  metalness: 0.8,
  roughness: 0.16,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  iridescence: 0.35,
});
new TTFLoader().load("./fonts/salt-bold.ttf", (json) => {
  const font = new Font(json);
  const make = (word, y, s = 0.72) => {
    const g = new TextGeometry(word, {
      font,
      size: s,
      depth: 0.15,
      curveSegments: 10,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.012,
      bevelSegments: 4,
    });
    g.computeBoundingBox();
    g.translate(-(g.boundingBox.max.x - g.boundingBox.min.x) / 2, 0, 0);
    const m = new THREE.Mesh(g, chromeText);
    m.position.y = y;
    m.castShadow = true;
    textGroup.add(m);
  };
  make("SID", 0.18, 1.02);
  make("MEHTA", -0.58, 0.58);
  textGroup.position.set(-1.2, 1.42, -1.3);
  textGroup.rotation.y = 0.12;
});
new GLTFLoader().load(
  "./models/xbot.glb",
  (gltf) => {
    character = gltf.scene;
    character.scale.setScalar(2.02);
    character.position.set(1.55, -2.1, 0.05);
    character.rotation.y = -0.3;
    const graphite = new THREE.MeshPhysicalMaterial({
        color: 0x101217,
        metalness: 0.92,
        roughness: 0.17,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        iridescence: 0.82,
        iridescenceIOR: 1.55,
        iridescenceThicknessRange: [180, 520],
      }),
      pearl = new THREE.MeshPhysicalMaterial({
        color: 0xb6bac2,
        metalness: 0.72,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        iridescence: 0.45,
      });
    let ix = 0;
    character.traverse((o) => {
      if (o.isMesh) {
        o.material = ix++ % 3 === 0 ? pearl : graphite;
        o.castShadow = true;
        o.receiveShadow = true;
        hitMeshes.push(o);
      }
    });
    hero.add(character);
    mixer = new THREE.AnimationMixer(character);
    gltf.animations.forEach((c) => (character.userData[c.name] = mixer.clipAction(c)));
    play("idle", 0.4);
    loaderEl.classList.add("done");
    setupScroll();
  },
  undefined,
  (err) => {
    console.error(err);
    loaderEl.textContent = "Character failed to load";
  }
);
function play(name, fade = 0.3) {
  if (!character?.userData[name]) return;
  const next = character.userData[name];
  if (next === activeAction) return;
  next.reset().fadeIn(fade).play();
  activeAction?.fadeOut(fade);
  activeAction = next;
  stateEl.textContent = name.replace("_", " ") + " / live";
}
function setupScroll() {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll(".chapter").forEach((section, i) => {
    const copy = section.querySelector(".copy");
    if (i)
      gsap.fromTo(
        copy,
        { autoAlpha: 0, y: 60 },
        { autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: section, start: "top 72%", end: "top 42%", scrub: true } }
      );
    if (i < 3)
      gsap.to(copy, { autoAlpha: 0, y: -40, ease: "none", scrollTrigger: { trigger: section, start: "bottom 58%", end: "bottom 18%", scrub: true } });
  });
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      scrollProgress = self.progress;
      document.querySelector(".rail i").style.transform = `scaleY(${1 + scrollProgress * 3})`;
      const chapter = Math.min(3, Math.floor(scrollProgress * 4));
      document.querySelector(".folio").textContent = `0${chapter + 1} / 04 · Designer / Builder`;
      if (chapter === 1) play("walk");
      else if (chapter === 2) play("agree");
      else if (chapter === 3) play("headShake");
      else play("idle");
    },
  });
}
addEventListener("pointermove", (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, (-e.clientY / innerHeight) * 2 + 1);
  lastPointer.copy(pointer);
  cursorEl.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
});
addEventListener("pointerdown", () => {
  if (hoverTarget) {
    clickPulse = 1;
    play(Math.random() > 0.5 ? "agree" : "headShake", 0.16);
    setTimeout(() => play("idle", 0.35), 1050);
  }
});
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight, false);
  particleMat.uniforms.uDpr.value = renderer.getPixelRatio();
});
const clock = new THREE.Clock();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") clock.start();
  else clock.stop();
});
function render() {
  requestAnimationFrame(render);
  const dt = Math.min(clock.getDelta(), 0.04),
    t = clock.elapsedTime;
  pointerSmooth.lerp(pointer, 0.075);
  raycaster.setFromCamera(pointerSmooth, camera);
  hoverTarget = hitMeshes.length && raycaster.intersectObjects(hitMeshes, false).length ? 1 : 0;
  hover = THREE.MathUtils.damp(hover, hoverTarget, 7, dt);
  cursorEl.classList.toggle("hot", !!hoverTarget);
  clickPulse = THREE.MathUtils.damp(clickPulse, 0, 4.2, dt);
  mixer?.update(dt);
  const p = scrollProgress,
    phase = p * 3,
    segment = Math.floor(phase),
    local = phase - segment;
  camera.position.x = THREE.MathUtils.damp(camera.position.x, Math.sin(p * Math.PI * 2) * 0.52, 3, dt);
  camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.46 + Math.sin(p * Math.PI) * 0.7, 3, dt);
  camera.position.z = THREE.MathUtils.damp(camera.position.z, 8.6 - p * 0.85, 3, dt);
  camera.lookAt(0, 0.05, -0.35);
  if (character) {
    const targetX = [1.55, -1.45, 1.2, -0.5][Math.min(3, segment + (local > 0.72 ? 1 : 0))];
    character.position.x = THREE.MathUtils.damp(character.position.x, targetX, 2.3, dt);
    character.rotation.y = THREE.MathUtils.damp(character.rotation.y, -0.3 + pointerSmooth.x * 0.12 + Math.sin(p * 5) * 0.24, 3, dt);
    character.rotation.z = THREE.MathUtils.damp(character.rotation.z, -pointerSmooth.x * 0.025 * hover, 6, dt);
    character.scale.setScalar(2.02 + clickPulse * 0.09);
  }
  textGroup.rotation.y = 0.15 + pointerSmooth.x * 0.08;
  textGroup.position.z = -0.55 - p * 1.4;
  textGroup.visible = p < 0.34;
  monolith.rotation.y = -pointerSmooth.x * 0.07 + p * 0.5;
  sun.scale.setScalar(1 + p * 0.34);
  sun.position.x = 2.15 - Math.sin(p * Math.PI) * 3.3;
  rim.position.x = pointerSmooth.x * 4;
  rim.position.y = 2 + pointerSmooth.y * 2;
  cursorLight.position.set(pointerSmooth.x * 4, pointerSmooth.y * 2.5, 2);
  cursorLight.intensity = hover * 42;
  sunMat.uniforms.uTime.value = t;
  sunMat.uniforms.uHover.value = hover;
  particleMat.uniforms.uTime.value = t;
  particleMat.uniforms.uPointer.value.copy(pointerSmooth);
  particleMat.uniforms.uHover.value = hover;
  particleMat.uniforms.uPulse.value = clickPulse;
  particleMat.uniforms.uScroll.value = p;
  particles.rotation.y = Math.sin(t * 0.08) * 0.08 + p * 0.45;
  particles.rotation.z = Math.sin(t * 0.11) * 0.025;
  renderer.render(scene, camera);
}
render();
