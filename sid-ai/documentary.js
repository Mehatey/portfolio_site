import * as THREE from "three";

const canvas = document.querySelector("#stage"),
  loaderEl = document.querySelector("#loader"),
  cursorEl = document.querySelector(".cursor");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 30);
camera.position.z = 7;
const group = new THREE.Group();
scene.add(group);

const video = document.createElement("video");
video.src = "./assets/sidvideo_1.mp4";
video.muted = true;
video.loop = true;
video.playsInline = true;
video.preload = "auto";
video.crossOrigin = "anonymous";
const videoTexture = new THREE.VideoTexture(video);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
const textureLoader = new THREE.TextureLoader();
const projects = {};
const names = ["mandala", "aananda", "naavo", "alpha"];
let loaded = 0;
names.forEach((name) =>
  textureLoader.load(`./assets/${name}.webp`, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
    projects[name] = t;
    if (++loaded === names.length) ready();
  })
);
video.addEventListener(
  "canplay",
  () => {
    video.play().catch(() => {});
    ready();
  },
  { once: true }
);
let videoReady = false,
  assetsReady = false;
function ready() {
  videoReady = video.readyState >= 3;
  assetsReady = loaded === names.length;
  if (videoReady && assetsReady) {
    planeMat.uniforms.uProject.value = projects.mandala;
    pointMat.uniforms.uProject.value = projects.mandala;
    loaderEl.classList.add("done");
  }
}

const uniforms = {
  uVideo: { value: videoTexture },
  uProject: { value: null },
  uTime: { value: 0 },
  uStage: { value: 0 },
  uPointer: { value: new THREE.Vector2(0.68, 0.5) },
  uFocus: { value: 0 },
  uPulse: { value: 0 },
  uSwap: { value: 0 },
};
const vertex = `uniform float uTime,uStage,uFocus,uPulse;uniform vec2 uPointer;varying vec2 vUv;varying float vDepth;void main(){vUv=uv;vec3 p=position;float edge=sin(uv.y*3.14159);p.z+=edge*uStage*.22;p.x+=(uv.y-.5)*(uv.y-.5)*uStage*.34;float d=distance(uv,uPointer);float wave=sin(d*44.-uTime*5.)*exp(-d*10.)*(uFocus*.11+uPulse*.24);p.z+=wave;p.xy+=(uv-uPointer)*wave*.14;vDepth=p.z;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
const fragment = `uniform sampler2D uVideo,uProject;uniform float uTime,uStage,uFocus,uPulse,uSwap;uniform vec2 uPointer;varying vec2 vUv;varying float vDepth;vec2 cover(vec2 uv,float sourceRatio){float target=1.6875;if(sourceRatio<target){float s=sourceRatio/target;uv.y=(uv.y-.5)*s+.5;}else{float s=target/sourceRatio;uv.x=(uv.x-.5)*s+.5;}return uv;}void main(){vec2 d=vUv-uPointer;float dist=length(d);float ring=sin(dist*72.-uTime*6.)*exp(-dist*14.)*(uFocus*.006+uPulse*.018);vec2 dir=normalize(d+vec2(.0001));vec2 uvV=vUv+dir*ring;vec2 uvP=cover(vUv+dir*ring,1.5);float split=exp(-dist*13.)*uFocus*.004;vec3 v;v.r=texture2D(uVideo,uvV+dir*split).r;v.g=texture2D(uVideo,uvV).g;v.b=texture2D(uVideo,uvV-dir*split).b;vec3 p=texture2D(uProject,uvP).rgb;float mode=smoothstep(.28,.72,uStage);vec3 color=mix(v,p,mode);color*=1.-uSwap*.55;color+=vDepth*.07;float vignette=smoothstep(.78,.25,length(vUv-.5));color*=.78+.22*vignette;gl_FragColor=vec4(color,1.);}`;
const planeMat = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment });
const plane = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 3.44, 72, 46), planeMat);
group.add(plane);
const edge = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.PlaneGeometry(5.8, 3.44)),
  new THREE.LineBasicMaterial({ color: 0xe8e5de, transparent: true, opacity: 0.38 })
);
edge.position.z = 0.012;
group.add(edge);

const COUNT = 12000,
  p = new Float32Array(COUNT * 3),
  uv = new Float32Array(COUNT * 2),
  rnd = new Float32Array(COUNT);
for (let i = 0; i < COUNT; i++) {
  const x = Math.random(),
    y = Math.random();
  p[i * 3] = (x - 0.5) * 5.8;
  p[i * 3 + 1] = (y - 0.5) * 3.44;
  p[i * 3 + 2] = 0.025;
  uv[i * 2] = x;
  uv[i * 2 + 1] = y;
  rnd[i] = Math.random();
}
const pointGeo = new THREE.BufferGeometry();
pointGeo.setAttribute("position", new THREE.BufferAttribute(p, 3));
pointGeo.setAttribute("aUv", new THREE.BufferAttribute(uv, 2));
pointGeo.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 1));
const pointMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: { ...uniforms, uDpr: { value: renderer.getPixelRatio() } },
  vertexShader: `attribute vec2 aUv;attribute float aRnd;uniform float uTime,uStage,uFocus,uPulse,uDpr;uniform vec2 uPointer;varying vec2 vUv;varying float vAlpha;void main(){vUv=aUv;vec3 p=position;float d=distance(aUv,uPointer);float local=exp(-d*10.);float lift=(sin(aRnd*31.+uTime*1.8)*.5+.5)*uFocus*local;p.z+=lift*(.18+aRnd*.36)+uPulse*local*.48;p.xy+=(aUv-uPointer)*(uFocus*local*.08+uPulse*local*.25);p.z+=sin(aUv.y*3.14159)*uStage*.22;p.x+=(aUv.y-.5)*(aUv.y-.5)*uStage*.34;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(.7+aRnd*1.25)*uDpr*(1.+uFocus*local*1.8);vAlpha=(.018+uFocus*local*.6+uPulse*local*.8)*(1.-uStage*.4);}`,
  fragmentShader: `uniform sampler2D uVideo,uProject;uniform float uStage;varying vec2 vUv;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.12,d)*vAlpha;vec3 v=texture2D(uVideo,vUv).rgb;vec3 p=texture2D(uProject,vUv).rgb;vec3 c=mix(v,p,smoothstep(.28,.72,uStage));float l=max(max(c.r,c.g),c.b);gl_FragColor=vec4(c*(1.1+l*.7),a);}`,
});
const points = new THREE.Points(pointGeo, pointMat);
group.add(points);

const raycaster = new THREE.Raycaster(),
  ndc = new THREE.Vector2(2, 2),
  smoothPointer = new THREE.Vector2(0.68, 0.5);
let targetStage = 0,
  stage = 0,
  focus = 0,
  focusTarget = 0,
  pulse = 0,
  swap = 0;
addEventListener("pointermove", (e) => {
  ndc.set((e.clientX / innerWidth) * 2 - 1, (-e.clientY / innerHeight) * 2 + 1);
  cursorEl.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObject(plane, false)[0];
  focusTarget = hit ? 1 : 0;
  if (hit) smoothPointer.lerp(hit.uv, 0.35);
  cursorEl.classList.toggle("hot", !!hit);
});
addEventListener("pointerdown", () => {
  if (focusTarget) {
    pulse = 1;
    video.playbackRate = 0.42;
    setTimeout(() => (video.playbackRate = 1), 420);
  }
});
document.querySelectorAll(".project").forEach((button) => {
  button.addEventListener("mouseenter", () => {
    const t = projects[button.dataset.texture];
    if (!t) return;
    planeMat.uniforms.uProject.value = t;
    pointMat.uniforms.uProject.value = t;
    swap = 1;
  });
  button.addEventListener("focus", () => button.dispatchEvent(new Event("mouseenter")));
});

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);
gsap.to(".intro", { autoAlpha: 0, y: -70, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 58%", scrub: true } });
gsap.to(".work-panel", {
  autoAlpha: 1,
  yPercent: -3,
  ease: "none",
  scrollTrigger: { trigger: ".work", start: "top 76%", end: "top 38%", scrub: true },
});
ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate: (self) => {
    targetStage = self.progress;
    document.querySelector(".counter").textContent = self.progress > 0.47 ? "02 / 02" : "01 / 02";
    document.querySelector(".scroll").textContent = self.progress > 0.47 ? "Hover a project · move over the viewport" : "Scroll to selected work";
  },
});

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight, false);
  pointMat.uniforms.uDpr.value = renderer.getPixelRatio();
});
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.04),
    time = clock.elapsedTime;
  stage = THREE.MathUtils.damp(stage, targetStage, 5, dt);
  focus = THREE.MathUtils.damp(focus, focusTarget, 8, dt);
  pulse = THREE.MathUtils.damp(pulse, 0, 4.5, dt);
  swap = THREE.MathUtils.damp(swap, 0, 9, dt);
  const mobile = innerWidth < 760;
  group.position.x = THREE.MathUtils.lerp(mobile ? 0.2 : 1.22, mobile ? 0.6 : 2.18, stage);
  group.position.y = THREE.MathUtils.lerp(0.18, mobile ? 1.25 : 0.05, stage);
  const s = THREE.MathUtils.lerp(mobile ? 0.72 : 1, mobile ? 0.54 : 0.72, stage);
  group.scale.setScalar(s);
  group.rotation.y = -stage * 0.11 + ndc.x * 0.018 * focus;
  group.rotation.x = ndc.y * 0.012 * focus;
  [planeMat, pointMat].forEach((m) => {
    m.uniforms.uTime.value = time;
    m.uniforms.uStage.value = stage;
    m.uniforms.uPointer.value.copy(smoothPointer);
    m.uniforms.uFocus.value = focus;
    m.uniforms.uPulse.value = pulse;
  });
  planeMat.uniforms.uSwap.value = swap;
  renderer.render(scene, camera);
}
animate();
