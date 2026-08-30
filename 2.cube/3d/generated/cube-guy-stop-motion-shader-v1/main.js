import * as THREE from "three";

const FRAME_COUNT = 8;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.querySelector("#gl");
const fallback = document.querySelector(".fallback");
const chapter = document.querySelector("#chapter");
const line = document.querySelector("#line");
const meter = document.querySelector("#meter");
const status = document.querySelector("#status");

const copy = [
  ["A mark", "At first, only one side."],
  ["A fold", "Curiosity bends the surface."],
  ["A body", "A thought learns its weight."],
  ["A stance", "Dimension becomes character."],
  ["A self", "Light finds another face."],
];

let renderer;
let material;
let plane;
let currentFrame = -1;
let textures = [];
let masks = [];
let pulse = 0;

const pointer = new THREE.Vector2(.72, .68);
const pointerTarget = pointer.clone();
const clock = new THREE.Clock();

function loadTexture(url, color = true) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, (texture) => {
      texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.flipY = true;
      resolve(texture);
    }, undefined, reject);
  });
}

async function loadFrames() {
  const jobs = [];
  for (let i = 1; i <= FRAME_COUNT; i += 1) {
    const id = String(i).padStart(2, "0");
    jobs.push(loadTexture(`assets/frames/frame-${id}.png`, true));
    jobs.push(loadTexture(`assets/masks/mask-${id}.png`, false));
  }
  const loaded = await Promise.all(jobs);
  textures = loaded.filter((_, index) => index % 2 === 0);
  masks = loaded.filter((_, index) => index % 2 === 1);
}

function makeScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 10);
  camera.position.z = 2;

  material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uFrame: { value: textures[0] },
      uMask: { value: masks[0] },
      uTime: { value: 0 },
      uPointer: { value: pointer.clone() },
      uPulse: { value: 0 },
      uMetal: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec3 p = position;
        float heldTime = floor(uTime * 8.0) / 8.0;
        p.x += sin(heldTime * 19.0 + uv.y * 5.0) * 0.0008;
        p.y += cos(heldTime * 17.0 + uv.x * 4.0) * 0.0007;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uFrame;
      uniform sampler2D uMask;
      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uPulse;
      uniform float uMetal;
      varying vec2 vUv;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        float heldTime = floor(uTime * 10.0) / 10.0;
        vec2 boil = vec2(
          hash(vec2(heldTime, 2.1)) - .5,
          hash(vec2(heldTime, 8.7)) - .5
        ) * .0011;
        vec2 sampleUv = clamp(vUv + boil, 0.001, 0.999);
        vec4 base = texture2D(uFrame, sampleUv);
        float mask = texture2D(uMask, vUv).r;

        vec2 delta = vUv - uPointer;
        float distanceGlow = exp(-dot(delta, delta) * 34.0);
        float brushed = .5 + .5 * sin((vUv.x * 19.0 + vUv.y * 7.0 - uTime * .45) * 6.2831);
        brushed = smoothstep(.35, .95, brushed);
        float paperBreak = hash(floor(vUv * vec2(408.0, 458.0) * .36));
        float sheen = mask * uMetal * distanceGlow * (.45 + .55 * brushed) * (.82 + paperBreak * .18);

        vec3 coolSilver = vec3(.54, .65, .72);
        vec3 warmEdge = vec3(.66, .28, .13);
        float edgeWarmth = smoothstep(.08, 0.0, length(delta)) * uPulse;
        vec3 reflected = mix(coolSilver, warmEdge, edgeWarmth);

        vec3 color = base.rgb;
        color = mix(color, color * vec3(.82, .91, 1.04), mask * uMetal * .12);
        color += reflected * sheen * (.38 + uPulse * .48);
        color += mask * uPulse * exp(-dot(delta, delta) * 90.0) * vec3(.22, .34, .44);

        float grain = hash(vUv * vec2(1319.0, 997.0) + heldTime);
        color += (grain - .5) * .016;
        gl_FragColor = vec4(color, base.a);
      }
    `,
  });

  plane = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 1.82, 12, 12), material);
  scene.add(plane);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -aspect;
    camera.right = aspect;
    camera.top = 1;
    camera.bottom = -1;
    camera.updateProjectionMatrix();

    const safeWidth = aspect < .78 ? aspect * 1.68 : Math.min(1.62, aspect * 1.05);
    plane.scale.set(safeWidth / 1.62, safeWidth / 1.62, 1);
    plane.position.y = aspect < .78 ? .08 : .01;
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  renderer.setAnimationLoop(() => {
    const elapsed = clock.getElapsedTime();
    pointer.lerp(pointerTarget, .075);
    pulse *= .925;
    material.uniforms.uTime.value = elapsed;
    material.uniforms.uPointer.value.copy(pointer);
    material.uniforms.uPulse.value = pulse;

    if (!reducedMotion) {
      plane.rotation.y += ((pointer.x - .5) * .055 - plane.rotation.y) * .045;
      plane.rotation.x += ((pointer.y - .5) * -.035 - plane.rotation.x) * .045;
    }
    renderer.render(scene, camera);
  });
}

function updateCopy(frame) {
  const copyIndex = Math.min(copy.length - 1, Math.floor(frame / 1.65));
  if (chapter.dataset.index === String(copyIndex)) return;
  chapter.dataset.index = String(copyIndex);
  const [nextChapter, nextLine] = copy[copyIndex];
  window.gsap.fromTo([chapter, line], { opacity: 0, y: 7 }, {
    opacity: 1,
    y: 0,
    duration: .28,
    stagger: .035,
    overwrite: true,
  });
  chapter.textContent = nextChapter;
  line.textContent = nextLine;
}

function setFrame(frame) {
  const next = Math.max(0, Math.min(FRAME_COUNT - 1, frame));
  if (next === currentFrame || !material) return;
  currentFrame = next;
  material.uniforms.uFrame.value = textures[next];
  material.uniforms.uMask.value = masks[next];
  material.uniforms.uMetal.value = THREE.MathUtils.smoothstep(next, 1.5, 6.5);
  fallback.src = `assets/frames/frame-${String(next + 1).padStart(2, "0")}.png`;
  updateCopy(next);
}

function bindInteraction() {
  const move = (event) => {
    pointerTarget.x = event.clientX / window.innerWidth;
    pointerTarget.y = 1 - event.clientY / window.innerHeight;
  };
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerdown", () => { pulse = 1; }, { passive: true });

  if (reducedMotion) {
    setFrame(FRAME_COUNT - 1);
    meter.style.transform = "scaleY(1)";
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);
  const playhead = { frame: 0 };
  window.gsap.to(playhead, {
    frame: FRAME_COUNT - 1,
    ease: "none",
    scrollTrigger: {
      trigger: "#story",
      start: "top top",
      end: "bottom bottom",
      scrub: .32,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        meter.style.transform = `scaleY(${self.progress})`;
      },
    },
    onUpdate: () => setFrame(Math.round(playhead.frame)),
  });
}

async function init() {
  try {
    await loadFrames();
    makeScene();
    setFrame(0);
    bindInteraction();
    fallback.style.opacity = "0";
    status.textContent = navigator.gpu ? "WebGPU available · GLSL study" : "GPU shader";
  } catch (error) {
    console.error(error);
    canvas.hidden = true;
    status.textContent = "Image fallback";
  }
}

init();
