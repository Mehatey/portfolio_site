import * as THREE from "three";

const canvas = document.querySelector("#pigment");
const root = document.documentElement;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.Camera();

const texture = new THREE.TextureLoader().load("./assets/watercolor-atlas.png");
texture.colorSpace = THREE.SRGBColorSpace;
texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
texture.minFilter = THREE.LinearMipmapLinearFilter;

const uniforms = {
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(1, 1) },
  uPointer: { value: new THREE.Vector2(.72, .48) },
  uVelocity: { value: new THREE.Vector2() },
  uPulse: { value: 0 },
  uAtlas: { value: texture }
};

const material = new THREE.ShaderMaterial({
  uniforms,
  depthTest: false,
  depthWrite: false,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform vec2 uVelocity;
    uniform float uPulse;
    uniform sampler2D uAtlas;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amp = .5;
      for (int i = 0; i < 5; i++) {
        value += amp * noise(p);
        p = mat2(1.62, 1.18, -1.18, 1.62) * p + .13;
        amp *= .5;
      }
      return value;
    }

    vec3 swatch(vec2 uv, float col, float row) {
      // Mirror each repeat so opposite crop edges meet without visible grid seams.
      uv = 1.0 - abs(fract(uv * .5) * 2.0 - 1.0);
      vec2 pad = vec2(.008);
      vec2 lo = vec2(col / 3.0, row / 2.0) + pad;
      vec2 hi = vec2((col + 1.0) / 3.0, (row + 1.0) / 2.0) - pad;
      return texture2D(uAtlas, mix(lo, hi, uv)).rgb;
    }

    float pigmentEdge(float distanceField, float grain) {
      float edge = distanceField + (grain - .5) * .16;
      return smoothstep(.62, .10, edge);
    }

    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 p = (uv - .5) * vec2(aspect, 1.0);
      float t = uTime * .055;

      vec2 paperUv = uv * vec2(2.15 * aspect, 2.15) + vec2(t * .025, -t * .018);
      vec3 paper = swatch(paperUv, 0.0, 1.0);
      vec3 pale = swatch(paperUv * 1.08 + .23, 2.0, 0.0);
      vec3 cobalt = swatch(paperUv * .83 + vec2(t * .05, 0.0), 1.0, 1.0);
      vec3 teal = swatch(paperUv * .92 + vec2(.17, -t * .04), 2.0, 1.0);
      vec3 periwinkle = swatch(paperUv * .86 - .11, 0.0, 0.0);

      float n = fbm(p * 2.1 + vec2(t, -t * .7));
      vec2 warp = vec2(
        fbm(p * 1.55 + n + vec2(t, 2.7)),
        fbm(p * 1.7 - n + vec2(4.1, -t))
      ) - .5;
      vec2 q = p + warp * .22;

      float blueField = pigmentEdge(length(q - vec2(.48, .08)) * .78, n);
      float tealField = pigmentEdge(length(q - vec2(-.58, .30)) * .92, fbm(q * 3.0 + 8.0));
      float lowField = pigmentEdge(length(q - vec2(.05, -.72)) * .84, fbm(q * 2.4 - 5.0));

      vec3 color = mix(paper, pale, .12 + .12 * n);
      color = mix(color, teal, tealField * .28);
      color = mix(color, periwinkle, lowField * .28);
      color = mix(color, cobalt, blueField * .38);

      vec2 pointerP = (uPointer - .5) * vec2(aspect, 1.0);
      vec2 delta = p - pointerP;
      vec2 direction = normalize(uVelocity + vec2(.0001));
      float along = dot(delta, direction);
      float across = dot(delta, vec2(-direction.y, direction.x));
      float speed = min(length(uVelocity) * 18.0, 1.0);
      float hoverDistance = length(vec2(along / (1.0 + speed * 1.7), across));
      float hoverGrain = fbm(p * 6.0 + warp * 3.0 + t);
      float hover = smoothstep(.34 + speed * .12, .035, hoverDistance + (hoverGrain - .5) * .065);

      vec3 hoverPigment = mix(teal, cobalt, .46 + .30 * sin(n * 6.283));
      color = mix(color, hoverPigment * 1.11, hover * (.46 + speed * .19));

      float ringRadius = uPulse * .68;
      float ring = exp(-pow((length(delta) - ringRadius) * 17.0, 2.0)) * (1.0 - uPulse);
      vec3 lightInk = mix(vec3(.72, .93, 1.0), vec3(.34, .53, 1.0), smoothstep(0.0, .8, ringRadius));
      color += ring * lightInk * .55;

      float fiber = dot(paper, vec3(.333)) - .5;
      color += fiber * .055;
      color = pow(max(color, 0.0), vec3(.96));
      color *= 1.0 - .055 * smoothstep(.3, 1.1, length(p));

      gl_FragColor = vec4(color, 1.0);
    }
  `
});

scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

const target = new THREE.Vector2(.72, .48);
const pointer = uniforms.uPointer.value;
const previous = pointer.clone();
let pulse = 0;
let last = performance.now();

function setPointer(event) {
  target.set(event.clientX / innerWidth, 1 - event.clientY / innerHeight);
}

addEventListener("pointermove", setPointer, { passive: true });
addEventListener("pointerdown", event => {
  setPointer(event);
  pulse = .001;
}, { passive: true });

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
}

addEventListener("resize", resize, { passive: true });
resize();

function frame(now) {
  const dt = Math.min((now - last) / 1000, .05);
  last = now;

  previous.copy(pointer);
  pointer.lerp(target, reducedMotion ? 1 : 1 - Math.pow(.001, dt));
  const velocity = pointer.clone().sub(previous).divideScalar(Math.max(dt, .001));
  uniforms.uVelocity.value.lerp(velocity, .08);

  if (pulse > 0) {
    pulse += dt * .72;
    if (pulse >= 1) pulse = 0;
  }
  uniforms.uPulse.value = pulse;
  uniforms.uTime.value = reducedMotion ? 0 : now / 1000;

  root.style.setProperty("--pointer-x", ((pointer.x - .5) * 2).toFixed(3));
  root.style.setProperty("--pointer-y", ((pointer.y - .5) * 2).toFixed(3));

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
