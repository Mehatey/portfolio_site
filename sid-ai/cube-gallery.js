import * as THREE from 'three';
import { RoundedBoxGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/environments/RoomEnvironment.js';

const canvas = document.querySelector('#stage');
const loader = document.querySelector('#loader');
const cursor = document.querySelector('.cursor');
const nameEl = document.querySelector('#name');
const indexEl = document.querySelector('#index');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
let dpr = Math.min(devicePixelRatio, 1.0);
const maxDpr = Math.min(devicePixelRatio, 1.15);
renderer.setPixelRatio(dpr);
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.03;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090b0e);
const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 80);
camera.position.set(0, 0, 18);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.025).texture;
pmrem.dispose();

scene.add(new THREE.HemisphereLight(0xb9d9ff, 0x140f16, 1.25));
const key = new THREE.DirectionalLight(0xfff6ec, 3.2);
key.position.set(-5, 7, 9);
scene.add(key);
const rim = new THREE.DirectionalLight(0x739cff, 2.1);
rim.position.set(7, -2, 5);
scene.add(rim);
const cursorLight = new THREE.PointLight(0xffffff, 0, 8, 2);
scene.add(cursorLight);

const envVertex = `
varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
`;

const envFragment = `
precision highp float;
uniform float uTime,uHover,uMode;
uniform vec3 uA,uB;
varying vec2 vUv;
float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1)),f.x),f.y);}
void main(){
  vec2 p=vUv-.5;float r=length(p),a=atan(p.y,p.x);float t=uTime*.12;
  float mode=mod(uMode,5.);
  float field;
  if(mode<.5) field=.5+.5*cos(r*17.-t*4.+sin(a*4.)*.8);
  else if(mode<1.5) field=.5+.5*sin((p.x+p.y)*13.+noise2(p*5.+t)*4.);
  else if(mode<2.5) field=.5+.5*cos(a*6.+r*14.-t*3.);
  else if(mode<3.5) field=smoothstep(.46,.0,abs(sin(p.x*12.+t)+p.y*1.8));
  else field=noise2(p*6.+vec2(t,-t*.7));
  float vignette=smoothstep(.74,.10,r);
  float ring=exp(-pow(r-(.22+.035*sin(t*3.)),2.)*190.);
  vec3 color=mix(uA,uB,field);
  color*=vignette*(.12+.2*uHover);
  color+=mix(uB,uA,.35)*ring*(.12+.42*uHover);
  float grain=(hash21(gl_FragCoord.xy+uTime)-.5)*.025;
  gl_FragColor=vec4(color+grain,vignette*(.28+.45*uHover));
}`;

const customVertex = `
uniform float uTime,uHover,uPulse,uMode;
varying vec3 vWorld,vNormalW,vLocal;
varying vec2 vUv;
void main(){
  vUv=uv;vLocal=position;
  float liquid=step(2.5,uMode)*step(uMode,3.5);
  float wave=(sin(position.x*5.+uTime*1.3)+sin(position.y*5.7-uTime)+sin(position.z*4.4+uTime*.8))/3.;
  vec3 p=position+normal*wave*(.025+.06*uHover+.055*uPulse)*liquid;
  vec4 world=modelMatrix*vec4(p,1.);
  vWorld=world.xyz;vNormalW=normalize(mat3(modelMatrix)*normal);
  gl_Position=projectionMatrix*viewMatrix*world;
}`;

const customFragment = `
precision highp float;
uniform float uTime,uHover,uPulse,uMode;
uniform vec3 uA,uB;
varying vec3 vWorld,vNormalW,vLocal;
varying vec2 vUv;
float hash21(vec2 p){return fract(sin(dot(p,vec2(41.1,289.7)))*43758.5453);}
float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1)),f.x),f.y);}
void main(){
  vec3 n=normalize(vNormalW),v=normalize(cameraPosition-vWorld);
  float fres=pow(1.-abs(dot(n,v)),2.4),glint=pow(max(0.,dot(n,normalize(vec3(-.35,.75,.55)))),24.);
  vec3 col;float alpha=1.;
  if(uMode<.5){
    float pearl=.5+.5*sin((n.x+n.y+n.z)*8.+uTime*.35);
    col=mix(uA,uB,pearl*.55+fres*.35)+vec3(1.)*glint*1.5;
  }else if(uMode<1.5){
    float veins=noise2(vLocal.xy*4.+noise2(vLocal.yz*5.+uTime*.15));
    float heat=smoothstep(.46,.72,veins+.12*sin(vLocal.y*8.-uTime));
    col=mix(vec3(.025,.008,.006),uA,heat)+uB*pow(heat,4.)*1.7+fres*uA*.22;
  }else if(uMode<2.5){
    float scan=.5+.5*sin((vLocal.y+vLocal.x*.2)*70.-uTime*7.);
    float grid=step(.93,fract((vUv.x+vUv.y)*14.+uTime*.12));
    col=mix(uA,uB,fres)+vec3(.5,.9,1.)*(scan*.12+grid*.3);
    alpha=.56+.3*fres;
  }else if(uMode<3.5){
    float flow=.5+.5*sin(vWorld.y*7.+vWorld.x*4.-uTime*1.1);
    col=mix(uA,uB,flow*.55)+vec3(.75,.92,1.)*fres*.72+glint*vec3(1.)*1.8;
  }else{
    float a=atan(vLocal.y,vLocal.x),r=length(vLocal.xy);
    float petals=.5+.5*cos(a*10.+sin(r*20.-uTime)*1.2);
    float rings=.5+.5*cos(r*32.-uTime*1.2);
    col=mix(uA,uB,petals*.58+rings*.28)+fres*vec3(.65,.25,1.)+glint;
  }
  col*=.78+.28*uHover+.2*uPulse;
  gl_FragColor=vec4(col,alpha);
}`;

function environmentMaterial(index, a, b) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uHover: { value: 0 }, uMode: { value: index }, uA: { value: new THREE.Color(a) }, uB: { value: new THREE.Color(b) } },
    vertexShader: envVertex,
    fragmentShader: envFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
}

function customMaterial(mode, a, b, transparent = false) {
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uHover: { value: 0 }, uPulse: { value: 0 }, uMode: { value: mode }, uA: { value: new THREE.Color(a) }, uB: { value: new THREE.Color(b) } },
    vertexShader: customVertex,
    fragmentShader: customFragment,
    transparent,
    depthWrite: !transparent,
    side: THREE.FrontSide
  });
  material.userData.animated = true;
  return material;
}

const studies = [
  { name: 'Liquid glass', env: [0x23d7d0, 0x8168ff], material: () => new THREE.MeshPhysicalMaterial({ color: 0xeaffff, roughness: .05, metalness: 0, transmission: .94, thickness: .52, ior: 1.38, dispersion: 0, attenuationColor: 0x68c8d4, attenuationDistance: 1.8, iridescence: .3, clearcoat: 1, clearcoatRoughness: .03 }) },
  { name: 'Black chrome', env: [0x315dff, 0x06070a], material: () => new THREE.MeshPhysicalMaterial({ color: 0x11141b, roughness: .09, metalness: 1, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 2.4 }) },
  { name: 'Sun brushed alloy', env: [0xffa338, 0x6b371d], material: () => new THREE.MeshPhysicalMaterial({ color: 0xd39a4b, roughness: .26, metalness: 1, anisotropy: .8, anisotropyRotation: .7, clearcoat: .35, envMapIntensity: 1.9 }) },
  { name: 'Spectral pearl', env: [0xff9cb6, 0x74b7ff], material: () => customMaterial(0, 0xf8dbdf, 0x7f88ff) },
  { name: 'Volcanic memory', env: [0xff3b0d, 0x551114], material: () => customMaterial(1, 0xff3416, 0xffbd45) },
  { name: 'Signal hologram', env: [0x00d8ff, 0xd400ff], material: () => customMaterial(2, 0x3be9ff, 0xc554ff, true) },
  { name: 'Celadon glaze', env: [0x73d6ae, 0xe8b8ff], material: () => new THREE.MeshPhysicalMaterial({ color: 0x89bda8, roughness: .2, metalness: 0, clearcoat: 1, clearcoatRoughness: .06, sheen: .7, sheenColor: new THREE.Color(0xc8e9df), sheenRoughness: .45 }) },
  { name: 'Obsidian bloom', env: [0x5630b8, 0xff3a58], material: () => new THREE.MeshPhysicalMaterial({ color: 0x120d1b, roughness: .16, metalness: .52, clearcoat: 1, clearcoatRoughness: .02, iridescence: .65, iridescenceIOR: 1.28, iridescenceThicknessRange: [120, 560] }) },
  { name: 'Living mercury', env: [0xb6f8ff, 0x406b90], material: () => customMaterial(3, 0xbfd9e0, 0x506b82) },
  { name: 'Astral mandala', env: [0xffa72d, 0x703cff], material: () => customMaterial(4, 0xffb331, 0x7c3cff) }
];

const cubeGeometry = new RoundedBoxGeometry(1.34, 1.34, 1.34, 5, .18);
const edgeGeometry = new THREE.EdgesGeometry(cubeGeometry, 26);
const planeGeometry = new THREE.PlaneGeometry(2.05, 2.05);
const shadowGeometry = new THREE.CircleGeometry(.62, 40);
const objects = [];
const hitMeshes = [];

studies.forEach((spec, index) => {
  const group = new THREE.Group();
  const envMat = environmentMaterial(index, spec.env[0], spec.env[1]);
  const aura = new THREE.Mesh(planeGeometry, envMat);
  aura.position.z = -.9;
  aura.scale.setScalar(1.12);
  group.add(aura);

  const shadow = new THREE.Mesh(shadowGeometry, new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .28, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -.78, .02);
  shadow.scale.y = .34;
  group.add(shadow);

  const material = spec.material();
  const cube = new THREE.Mesh(cubeGeometry, material);
  cube.rotation.set(.28 + index * .035, -.46 + index * .06, index % 2 ? -.055 : .055);
  cube.userData.index = index;
  group.add(cube);
  hitMeshes.push(cube);

  const edge = new THREE.LineSegments(edgeGeometry, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .13, blending: THREE.AdditiveBlending, depthWrite: false }));
  edge.rotation.copy(cube.rotation);
  group.add(edge);

  const echoA = new THREE.LineSegments(edgeGeometry, new THREE.LineBasicMaterial({ color: spec.env[0], transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  const echoB = new THREE.LineSegments(edgeGeometry, new THREE.LineBasicMaterial({ color: spec.env[1], transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  echoA.rotation.copy(cube.rotation);echoB.rotation.copy(cube.rotation);
  group.add(echoA, echoB);

  scene.add(group);
  objects.push({ group, cube, edge, echoA, echoB, aura, shadow, material, envMat, index, name: spec.name, home: new THREE.Vector3(), hover: 0, pulse: 0, kick: 0 });
});

function layout() {
  const aspect = innerWidth / innerHeight;
  const portrait = aspect < .72;
  const columns = portrait ? 2 : 5;
  const rows = portrait ? 5 : 2;
  const gapX = portrait ? 1.95 : 2.03;
  const gapY = portrait ? 1.6 : 2.25;
  objects.forEach((item, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    item.home.set((column - (columns - 1) / 2) * gapX, ((rows - 1) / 2 - row) * gapY, 0);
    item.group.position.copy(item.home);
  });
  const width = (columns - 1) * gapX + 1.75;
  const height = (rows - 1) * gapY + 1.75;
  camera.aspect = aspect;
  camera.fov = portrait ? 31 : 34;
  const fov = THREE.MathUtils.degToRad(camera.fov);
  camera.position.z = Math.max(height / (2 * Math.tan(fov / 2)), width / aspect / (2 * Math.tan(fov / 2))) * 1.12;
  camera.position.y = portrait ? 0 : .02;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
}

layout();

const pointer = new THREE.Vector2(2, 2);
const pointerSmooth = new THREE.Vector2(0, 0);
const raycaster = new THREE.Raycaster();
let active = null;
let running = !document.hidden;
let lastRenderTime = 0;
let frames = 0;
let frameTime = 0;
let qualityTimer = 0;
const frameInterval = 1000 / 60;
const clock = new THREE.Clock();

function setReadout(item) {
  indexEl.textContent = item ? String(item.index + 1).padStart(2, '0') : '00';
  nameEl.textContent = item ? item.name : 'Ten states of the same form';
  cursor.classList.toggle('hot', Boolean(item));
}

addEventListener('pointermove', event => {
  pointer.set(event.clientX / innerWidth * 2 - 1, -(event.clientY / innerHeight) * 2 + 1);
  cursor.style.transform = `translate(${event.clientX}px,${event.clientY}px) translate(-50%,-50%)`;
});

addEventListener('pointerleave', () => pointer.set(2, 2));
addEventListener('pointerdown', () => {
  if (!active) return;
  active.pulse = 1;
  active.kick += .75;
});

function resize() {
  renderer.setPixelRatio(dpr);
  layout();
}

addEventListener('resize', resize);

function setRunning(next) {
  running = next;
  lastRenderTime = 0;
  renderer.setAnimationLoop(running ? animate : null);
  if (running) clock.getDelta();
}

document.addEventListener('visibilitychange', () => setRunning(!document.hidden));
addEventListener('pagehide', () => setRunning(false));
canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); setRunning(false); });
canvas.addEventListener('webglcontextrestored', () => location.reload());

function animate(now) {
  if (!running) return;
  if (lastRenderTime) {
    const elapsed = now - lastRenderTime;
    if (elapsed < frameInterval * .9) return;
    lastRenderTime = now - (elapsed % frameInterval);
  } else lastRenderTime = now;

  const dt = Math.min(clock.getDelta(), .04);
  const time = clock.elapsedTime;
  pointerSmooth.lerp(pointer, 1 - Math.exp(-dt * 9));
  raycaster.setFromCamera(pointerSmooth, camera);
  const hit = raycaster.intersectObjects(hitMeshes, false)[0];
  const nextActive = hit ? objects[hit.object.userData.index] : null;
  if (nextActive !== active) { active = nextActive; setReadout(active); }

  cursorLight.position.set(pointerSmooth.x * 5, pointerSmooth.y * 4, 4.5);
  cursorLight.intensity = THREE.MathUtils.damp(cursorLight.intensity, active ? 7 : 0, 7, dt);
  if (active) cursorLight.color.setHex(studies[active.index].env[0]);

  objects.forEach(item => {
    const targetHover = item === active ? 1 : 0;
    item.hover = THREE.MathUtils.damp(item.hover, targetHover, 8, dt);
    item.pulse = THREE.MathUtils.damp(item.pulse, 0, 3.2, dt);
    item.kick *= Math.exp(-dt * 2.4);
    const phase = item.index * .67;
    const idle = reduceMotion ? 0 : 1;
    item.group.position.x = THREE.MathUtils.damp(item.group.position.x, item.home.x, 8, dt);
    item.group.position.y = THREE.MathUtils.damp(item.group.position.y, item.home.y + Math.sin(time * .55 + phase) * .025 * idle, 8, dt);
    item.group.position.z = THREE.MathUtils.damp(item.group.position.z, item.hover * .7 + item.pulse * .18, 7, dt);
    const scale = 1 + item.hover * .14 + item.pulse * .1;
    item.group.scale.setScalar(THREE.MathUtils.damp(item.group.scale.x, scale, 8, dt));

    item.cube.rotation.x += dt * (.08 + item.index * .003) * idle;
    item.cube.rotation.y += dt * (.11 + item.index * .004 + item.kick) * idle;
    item.cube.rotation.z += dt * item.kick * .42;
    item.edge.rotation.copy(item.cube.rotation);
    item.echoA.rotation.copy(item.cube.rotation);
    item.echoB.rotation.copy(item.cube.rotation);
    item.echoA.scale.setScalar(1 + item.pulse * .42);
    item.echoB.scale.setScalar(1 + item.pulse * .7);
    item.echoA.material.opacity = item.pulse * .42;
    item.echoB.material.opacity = item.pulse * .25;
    item.edge.material.opacity = .1 + item.hover * .32;
    item.shadow.material.opacity = .22 + item.hover * .12;
    item.shadow.scale.x = 1 + item.hover * .22;
    item.shadow.scale.y = .34 + item.hover * .07;

    item.envMat.uniforms.uTime.value = time + phase;
    item.envMat.uniforms.uHover.value = item.hover + item.pulse * .55;
    if (item.material.userData.animated) {
      item.material.uniforms.uTime.value = time + phase;
      item.material.uniforms.uHover.value = item.hover;
      item.material.uniforms.uPulse.value = item.pulse;
    } else {
      item.material.envMapIntensity = 1.25 + item.hover * 1.3;
      if ('clearcoat' in item.material) item.material.clearcoat = Math.min(1, (item.material.clearcoat || 0) + item.hover * .02);
    }
  });

  camera.position.x = THREE.MathUtils.damp(camera.position.x, pointerSmooth.x * .12, 5, dt);
  camera.position.y = THREE.MathUtils.damp(camera.position.y, pointerSmooth.y * .08, 5, dt);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);

  frames++;
  frameTime += dt;
  qualityTimer += dt;
  if (frames >= 90) {
    const average = frameTime / frames;
    let nextDpr = dpr;
    if (qualityTimer > 2 && average > .0205) nextDpr = Math.max(.75, dpr - .1);
    else if (qualityTimer > 7 && average < .0145) nextDpr = Math.min(maxDpr, dpr + .05);
    frames = 0;
    frameTime = 0;
    if (Math.abs(nextDpr - dpr) > .001) { dpr = nextDpr; qualityTimer = 0; resize(); }
  }
}

renderer.setAnimationLoop(running ? animate : null);
loader.classList.add('done');
