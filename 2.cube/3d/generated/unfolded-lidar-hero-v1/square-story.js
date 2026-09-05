import * as THREE from "three";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FontLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/geometries/TextGeometry.js";

// One object, one continuous timeline. Previous experiments remain in main.js.
const canvas = document.querySelector("#scene");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
// The authored cube uses unlit shaders, while the rebuilt city needs a real
// light rig so its watercolor voxels keep depth instead of collapsing to black.
scene.add(new THREE.HemisphereLight(0xdff8ff, 0x16333a, 2.2));
const cityKey = new THREE.DirectionalLight(0xf7fbff, 3.4);
cityKey.position.set(-4, 7, 8);
scene.add(cityKey);
const cityRim = new THREE.DirectionalLight(0x72b9ff, 2.1);
cityRim.position.set(6, 2, -4);
scene.add(cityRim);
const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 11;
const root = new THREE.Group();
scene.add(root);
const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
const ease = (a, b, p) => {
  const t = clamp((p - a) / (b - a), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const damp = (a, b, k, dt) => mix(a, b, 1 - Math.exp(-k * dt));
const waterTrail = Array.from({ length: 12 }, () => new THREE.Vector4(0, 0, -100, 0));
let trailIndex = 0,
  lastTrailTime = -1;
let scrollVelocity = 0;

const noise = `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;mat2 r=mat2(.8,-.6,.6,.8);for(int i=0;i<5;i++){s+=a*noise2(p);p=r*p*2.03+4.7;a*=.51;}return s;}
`;

// A moving wash, not a photograph or decorative particle backdrop.
const background = new THREE.ShaderMaterial({
  depthWrite: false,
  depthTest: false,
  uniforms: { time: { value: 0 }, progress: { value: 0 }, aspect: { value: 1 }, mouse: { value: new THREE.Vector2() }, trail: { value: waterTrail } },
  vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.,1.);}",
  fragmentShader: `${noise}
  varying vec2 vUv;uniform float time,progress,aspect;uniform vec2 mouse;uniform vec4 trail[12];
  vec3 washAt(vec2 uv,float phase){
    vec2 p=(uv-.5)*vec2(aspect,1.);vec2 q=p*1.7+vec2(time*.012,-time*.008);
    vec2 warp=vec2(fbm(q+3.),fbm(q-8.));float w=fbm(q+warp*2.4);float b=fbm(q*1.45-w+vec2(9.,time*.008));
    vec3 sky0=vec3(.018,.065,.16),sky1=vec3(.075,.25,.58),sky2=vec3(.22,.57,.56);
    vec3 dusk0=vec3(.08,.055,.19),dusk1=vec3(.36,.20,.49),dusk2=vec3(.77,.45,.48);
    vec3 forest0=vec3(.018,.095,.075),forest1=vec3(.08,.31,.20),forest2=vec3(.49,.57,.35);
    vec3 a=mix(sky0,sky1,smoothstep(.20,.72,w));a=mix(a,sky2,smoothstep(.34,.72,b)*.72);
    vec3 d=mix(dusk0,dusk1,smoothstep(.18,.70,w));d=mix(d,dusk2,smoothstep(.43,.78,b)*.45);
    vec3 f=mix(forest0,forest1,smoothstep(.18,.69,w));f=mix(f,forest2,smoothstep(.48,.80,b)*.38);
    float dusk=smoothstep(.18,.43,phase)*(1.-smoothstep(.43,.68,phase));
    float woods=smoothstep(.55,.78,phase)*(1.-smoothstep(.84,1.,phase));
    vec3 col=mix(a,d,dusk*.72);col=mix(col,f,woods*.78);
    col*=.94+.10*fbm(p*92.+warp*.15);return col;
  }
  void main(){vec2 p=(vUv-.5)*vec2(aspect,1.);
    float leak=0.;vec2 ripple=vec2(0.);
    for(int i=0;i<12;i++){
      float age=max(0.,time-trail[i].z);vec2 d=(vUv-trail[i].xy)*vec2(aspect,1.);
      float r=length(d);float alive=exp(-age*1.25)*trail[i].w;
      float wake=exp(-pow((r-age*.055)/.075,2.))*alive;
      ripple+=d/(r+.04)*sin(r*32.-age*3.)*wake*.004;
      leak+=exp(-dot(d,d)*22.)*alive*.014;
    }
    vec2 liveUv=vUv+ripple;vec3 col=washAt(liveUv,progress);
    vec2 mouseUv=mouse*.5+.5;vec2 md=(vUv-mouseUv)*vec2(aspect,1.);
    float cursor=exp(-dot(md,md)*18.)*step(length(mouse),1.8);
    float cells=mix(72.,118.,.5+.5*sin(time*.17));vec2 cellUv=(floor(vUv*cells)+.5)/cells;
    vec2 jitter=(vec2(hash(floor(vUv*cells)+floor(time*5.)),hash(floor(vUv*cells)+17.+floor(time*5.)))-.5)/cells*.42;
    vec3 pixelWash=washAt(cellUv+jitter,progress);
    float pixelMask=smoothstep(.08,.72,cursor)*(1.-smoothstep(.72,1.,cursor)*.22);
    col=mix(col,pixelWash,pixelMask*.92);
    col+=vec3(.65,.86,.79)*leak;
    float cloudChapter=smoothstep(.18,.27,progress)*(1.-smoothstep(.43,.52,progress));
    float cloud=smoothstep(.61,.82,fbm(vec2(vUv.x*2.1-time*.012,vUv.y*.9+6.)));
    col=mix(col,vec3(.74,.79,.79),cloud*cloudChapter*.10);
    gl_FragColor=vec4(col,1.);
  }`,
});
const wash = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), background);
wash.frustumCulled = false;
wash.renderOrder = -1000;
scene.add(wash);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.28, 0.58, 0.74);
composer.addPass(bloom);
const finish = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, velocity: { value: 0 }, resolution: { value: new THREE.Vector2() } },
  vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader: `varying vec2 vUv;uniform sampler2D tDiffuse;uniform float time,velocity;uniform vec2 resolution;
  ${noise}
  void main(){float speed=clamp(abs(velocity),0.,1.);vec2 dir=vec2(sign(velocity),-.18)*speed/resolution*5.;
  vec3 c=texture2D(tDiffuse,vUv).rgb;c=mix(c,(texture2D(tDiffuse,vUv-dir).rgb+texture2D(tDiffuse,vUv+dir).rgb)*.5,speed*.18);
  float split=(.35+speed*1.8)/max(resolution.x,1.);c.r=texture2D(tDiffuse,vUv+vec2(split,0.)).r;c.b=texture2D(tDiffuse,vUv-vec2(split,0.)).b;
  vec2 p=floor(vUv*resolution);
  vec3 grain=vec3(hash(p+floor(time*24.)),hash(p+23.+floor(time*24.)),hash(p-41.+floor(time*24.)))-.5;
  c+=grain*.023;
  // Sparse, soft film dust, not a decorative particle field.
  vec2 film=vUv*vec2(resolution.x/max(resolution.y,1.),1.)*44.+vec2(time*.021,-time*.043);
  vec2 cell=floor(film),f=fract(film);float seed=hash(cell+81.);
  vec2 center=vec2(hash(cell+12.),hash(cell-51.))*.7+.15;
  float dust=exp(-dot(f-center,f-center)*900.)*step(.987,seed);
  c+=vec3(.62,.75,.69)*dust*.09*(.5+.5*sin(time*.7+seed*80.));
  c=(c-.5)*1.075+.5;c*=1.-.25*dot(vUv-.5,vUv-.5);gl_FragColor=vec4(c,1.);}`,
});
composer.addPass(finish);

const vertexShader = `
uniform float uTime,uHover,uHold,uBreak,uChip,uGrid,uPulse,uFold,uOutline,uSettle,uIndex;
uniform vec3 uSheet;
uniform vec2 uTouch;
attribute vec3 aTile;
varying vec2 vUv;varying vec3 vNormal,vWorld;varying float vFront,vDissolve;
mat3 turn(vec3 a){vec3 c=cos(a),s=sin(a);return mat3(c.y*c.z,c.y*s.z,-s.y,s.x*s.y*c.z-c.x*s.z,s.x*s.y*s.z+c.x*c.z,s.x*c.y,c.x*s.y*c.z+s.x*s.z,c.x*s.y*s.z-s.x*c.z,c.x*c.y);}
void main(){vec3 p=position;vec3 norm=normal;
  vUv=uv;vFront=step(.5,normal.z);vDissolve=0.;
  if(uChip>.5){vUv=(aTile.xy+uv)/uGrid;}
  vec2 uvp=vUv-.5;
  float edge=sin(vUv.x*3.14159)*sin(vUv.y*3.14159);
  float field=exp(-dot(vUv-uTouch,vUv-uTouch)*12.);
  float lift=field*uHover*(.0025+uHold*.012)*edge*(1.-uFold*.7);
  lift+=sin(vUv.x*8.+uTime*.20)*sin(vUv.y*6.-uTime*.16)*edge*.003*(1.-uFold);
  p.z+=lift;
  vec4 world; vec3 worldNormal;
  if(uChip>.5){
    float seed=aTile.z;
    float borderTile=min(min(aTile.x,aTile.y),min(uGrid-1.-aTile.x,uGrid-1.-aTile.y));
    float interior=step(2.,borderTile);
    float withdraw=clamp((uOutline-seed*.13)/.87,0.,1.);
    withdraw=withdraw*withdraw*withdraw*(withdraw*(withdraw*6.-15.)+10.);
    float t=clamp((uBreak-seed*.12)/.88,0.,1.);t=t*t*(3.-2.*t);
    float settle=clamp((uSettle-seed*.10)/.90,0.,1.);
    settle=settle*settle*settle*(settle*(settle*6.-15.)+10.);
    vec3 angles=vec3(sin(seed*61.),cos(seed*34.),sin(seed*97.))*t*4.;
    mat3 rot=turn(angles);vec3 piece=rot*p;norm=rot*norm;
    vec3 origin=vec3((aTile.xy+.5)/uGrid*2.5-1.25,0.);
    // Every tile keeps its identity. Interior tiles glide toward the nearest edge.
    vec2 perimeter=origin.xy;
    if(abs(origin.x)>abs(origin.y)){perimeter.x=sign(origin.x)*1.16;}
    else{perimeter.y=sign(origin.y)*1.16;}
    origin.xy=mix(origin.xy,perimeter,withdraw*interior);
    origin.z-=withdraw*interior*(.045+borderTile*.012);
    piece*=mix(1.,.72,withdraw*interior);
    piece*=1.-settle;
    vDissolve=settle;
    world=modelMatrix*vec4(origin+piece,1.);
    worldNormal=normalize(mat3(modelMatrix)*norm);
    // Reversible gravity: fragments peel outward, fall, then yield to the skyline.
    float a=seed*6.28318+uIndex*.7;
    vec3 velocity=vec3(cos(a)*(1.8+seed*3.2),1.1+seed*2.6,sin(seed*31.)*1.7);
    world.xyz+=velocity*t+vec3(sin(a*1.7)*sin(t*3.)*.45,-7.8*t*t,cos(a)*sin(t*2.)*.42);
  }else{
    world=modelMatrix*vec4(p,1.);
    worldNormal=normalize(mat3(modelMatrix)*norm);
  }
  vWorld=world.xyz;vNormal=worldNormal;
  gl_Position=projectionMatrix*viewMatrix*world;
}`;
const fragmentShader = `${noise}
uniform vec3 uBase,uAccent;uniform float uTime,uHover,uHold,uPulse,uFace,uBlink,uAwake,uBreak,uSettle,uSheen,uFocus,uChip,uPanelFade;
uniform vec2 uTouch,uGaze;varying vec2 vUv;varying vec3 vNormal,vWorld;varying float vFront,vDissolve;
float oval(vec2 p,vec2 size){float d=length(p/size);return 1.-smoothstep(.92,1.08,d);}
void main(){
  vec2 p=vUv;float touch=exp(-dot(p-uTouch,p-uTouch)*10.);
  vec2 drift=vec2(uTime*.004,-uTime*.003)*(.12+uHold*.35);
  vec2 delta=p-uTouch;float angle=touch*uHold*.16*sin(uTime*.25);
  mat2 curl=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
  vec2 painted=uTouch+curl*delta;
  float wetLight=exp(-dot(delta,delta)*7.)*uHover;
  painted+=delta*sin(length(delta)*19.-uTime*.8)*wetLight*.006;
  vec2 flow=vec2(fbm(painted*4.+drift),fbm(painted*4.-drift+13.));
  float wet=fbm(painted*5.4+flow*1.65);
  float gran=fbm(p*62.+flow*.25);
  float deposit=smoothstep(.27,.76,wet);
  float pigmentFlow=touch*uHold*.025;
  vec3 col=mix(uBase,uAccent,clamp(deposit*.38+pigmentFlow,0.,.85));
  // Hover reveals a controlled mosaic sampled from this face's own pigment.
  float cells=42.;vec2 qp=(floor(p*cells)+.5)/cells;
  float pixelPigment=fbm(qp*5.7+vec2(uTime*.012,-uTime*.009));
  vec3 pixelCol=mix(uBase,uAccent,smoothstep(.25,.72,pixelPigment));
  float pixelReveal=smoothstep(.02,.82,touch)*uHover;
  col=mix(col,pixelCol,pixelReveal*.82);
  // A click changes the pigment family and sends that color through the face.
  // It is deliberately chromatic, never the old generic white flash.
  float clickWash=exp(-dot(p-uTouch,p-uTouch)*mix(16.,2.8,uPulse))*uPulse;
  col=mix(col,uAccent,clickWash*.42);
  col*=.91+.12*gran;
  float fibers=noise2(p*530.);col+=vec3(fibers-.5)*.035;
  float stain=abs(wet-.51);col*=1.-.08*exp(-stain*110.);
  vec3 N=normalize(vNormal),V=normalize(cameraPosition-vWorld);
  float diffuse=.77+.23*max(dot(N,normalize(vec3(-.4,.8,1.))),0.);
  col*=diffuse;
  float settle=0.;
  col*=.83+uFocus*.17;
  col=mix(col,mix(uBase,uAccent,.64),wetLight*.065);
  float fres=pow(1.-abs(dot(N,V)),3.);
  col+=vec3(.22,.32,.31)*fres*.35;
  vec3 halfV=normalize(V+normalize(vec3(-.5,.9,1.)));
  float gloss=pow(max(dot(N,halfV),0.),42.);
  col+=vec3(.18,.23,.23)*gloss*(.2+uSheen*.85+uHover*.12+settle*.7);
  vec3 reflected=reflect(-V,N);
  float softbox=exp(-pow(abs((reflected.x+.45)/.19),2.)-pow(abs((reflected.y-.65)/.65),4.));
  col+=vec3(.32,.39,.42)*softbox*(uSheen*.6+settle*.7);
  float border=min(min(p.x,p.y),min(1.-p.x,1.-p.y));
  float rough=fbm(p*170.);
  col=mix(col,col*.36,(1.-smoothstep(.001,.007,border+rough*.0015))*.6*(1.-settle));
  col+=vec3(.09,.13,.14)*exp(-border*340.)*(1.-settle);
  // Ink is composited last, on the actual moving face, never a floating overlay.
  if(uFace>.5 && vFront>.5){
    vec2 gaze=uGaze*.014;
    float eyeH=mix(.092,.006,uBlink);
    float eye=oval(p-vec2(.34,.58)-gaze,vec2(.013,eyeH));
    eye=max(eye,oval(p-vec2(.66,.58)-gaze,vec2(.013,eyeH)));
    float x=p.x-.5;float smile=(uHover*.016+uAwake*.006)*(1.-pow(clamp(x/.066,-1.,1.),2.));
    float mouth=(1.-smoothstep(.003,.007,abs(p.y-(.245-smile))))*(1.-smoothstep(.055,.068,abs(x)));
    col=mix(col,vec3(.018,.031,.040),max(eye,mouth)*.97*(1.-smoothstep(0.,.3,uBreak)));
  }
  // Filled paper is peeled away cell-by-cell while its structural tiles remain.
  // This makes the filled-to-hollow handoff legible and reversible on scroll.
  if(uChip<.5 && hash(floor(gl_FragCoord.xy*.72))<uPanelFade)discard;
  // Screen-door dissolution avoids transparency sorting between thousands of chips.
  if(hash(floor(gl_FragCoord.xy))<vDissolve)discard;
  gl_FragColor=vec4(col,1.);
}`;

const bases = ["#f3ecdb", "#173d83", "#377b76", "#dce9ef", "#7696b5", "#cdcbbb"];
const accents = ["#c2d2c8", "#4b79ae", "#79b2a5", "#abc6d7", "#355e8e", "#98a598"];
const panels = [],
  chips = [],
  uniforms = [];
const grid = innerWidth < 600 ? 22 : 30; // 5,400 thin fragments on desktop, six draw calls.
const panelGeometry = new THREE.BoxGeometry(2.5, 2.5, 0.036, 24, 24, 1);
panelGeometry.setAttribute("aTile", new THREE.Float32BufferAttribute(new Float32Array(panelGeometry.attributes.position.count * 3), 3));
for (let face = 0; face < 6; face++) {
  const u = {
    uTime: { value: 0 },
    uHover: { value: 0 },
    uHold: { value: 0 },
    uPulse: { value: 0 },
    uBreak: { value: 0 },
    uOutline: { value: 0 },
    uSettle: { value: 0 },
    uIndex: { value: face },
    uSheet: { value: new THREE.Vector3(8, 8, 74) },
    uSheen: { value: 0 },
    uFocus: { value: 1 },
    uChip: { value: 0 },
    uPanelFade: { value: 0 },
    uGrid: { value: grid },
    uFold: { value: 0 },
    uFace: { value: face === 0 ? 1 : 0 },
    uBlink: { value: 0 },
    uAwake: { value: 0 },
    uTouch: { value: new THREE.Vector2(0.5, 0.5) },
    uGaze: { value: new THREE.Vector2() },
    uBase: { value: new THREE.Color(bases[face]) },
    uAccent: { value: new THREE.Color(accents[face]) },
  };
  const material = new THREE.ShaderMaterial({ uniforms: u, vertexShader, fragmentShader, side: THREE.DoubleSide });
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(panelGeometry, material);
  mesh.userData.face = face;
  group.add(mesh);
  root.add(group);
  panels.push(group);
  uniforms.push(u);
  const geo = new THREE.BoxGeometry(2.5 / grid, 2.5 / grid, 0.036, 1, 1, 1);
  const tile = new Float32Array(grid * grid * 3);
  for (let y = 0; y < grid; y++)
    for (let x = 0; x < grid; x++) {
      let i = (y * grid + x) * 3;
      tile[i] = x;
      tile[i + 1] = y;
      tile[i + 2] = (((Math.sin(x * 127.1 + y * 311.7 + face * 19.3) * 43758.5453) % 1) + 1) % 1;
    }
  geo.setAttribute("aTile", new THREE.InstancedBufferAttribute(tile, 3));
  const cu = { ...u, uChip: { value: 1 } };
  const mat = new THREE.ShaderMaterial({ uniforms: cu, vertexShader, fragmentShader, side: THREE.DoubleSide });
  const cloud = new THREE.InstancedMesh(geo, mat, grid * grid);
  cloud.userData.face = face;
  const id = new THREE.Matrix4();
  for (let i = 0; i < grid * grid; i++) cloud.setMatrixAt(i, id);
  cloud.frustumCulled = false;
  cloud.visible = false;
  group.add(cloud);
  chips.push(cloud);
}

// Typography belongs to the geometry, so perspective and occlusion stay honest.
const disciplineLabels = [];
let identityLabel = null;
const patternField = new THREE.Group();
const patternCards = [];
root.add(patternField);

function makePatternCard(label, index) {
  const c = document.createElement("canvas");
  c.width = c.height = 384;
  const ctx = c.getContext("2d");
  const palette = [
    ["#eef2e8", "#8fb9b3", "#173d83"],
    ["#dce8ef", "#5e88ad", "#163d56"],
    ["#c7ddd6", "#2f7771", "#f3ecdb"],
    ["#eff0df", "#86a3bd", "#173d83"],
  ][index % 4];
  const g = ctx.createLinearGradient(0, 0, 384, 384);
  g.addColorStop(0, palette[0]);
  g.addColorStop(0.55, palette[1]);
  g.addColorStop(1, palette[0]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 384, 384);
  for (let i = 0; i < 1800; i++) {
    const a = Math.random() * 0.055;
    ctx.fillStyle = `rgba(18,48,70,${a})`;
    const s = 1 + Math.random() * 4;
    ctx.fillRect(Math.random() * 384, Math.random() * 384, s, s);
  }
  ctx.strokeStyle = "rgba(255,255,255,.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(9, 9, 366, 366);
  ctx.fillStyle = palette[2];
  ctx.font = "500 25px Space Grotesk, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const words = label.split(" ");
  if (words.length > 1) {
    ctx.fillText(words.slice(0, -1).join(" "), 192, 174);
    ctx.fillText(words[words.length - 1], 192, 210);
  } else ctx.fillText(label, 192, 192);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.22, 1.22, 0.055), material);
  mesh.userData.material = material;
  patternField.add(mesh);
  patternCards.push(mesh);
}
const disciplineNames = ["Product design", "Branding", "Agentic design", "UI / UX"];
for (let i = 0; i < 20; i++) makePatternCard(disciplineNames[i % 4], i);

new FontLoader().load(
  "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/optimer_regular.typeface.json",
  (font) => {
    const specs = [
      { face: 2, lines: ["Product", "design"], color: 0xf4efdf },
      { face: 3, lines: ["Branding"], color: 0xf4efdf },
      { face: 4, lines: ["Agentic", "design"], color: 0x163d56 },
      { face: 5, lines: ["UI / UX"], color: 0x163d56 },
    ];
    for (const spec of specs) {
      const label = new THREE.Group();
      const material = new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: 0 });
      const sideMaterial = new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: 0 });
      sideMaterial.color.multiplyScalar(0.65);
      const addLine = (text, size, y) => {
        const geometry = new TextGeometry(text, { font, size, depth: 0.008, curveSegments: 6, bevelEnabled: false });
        geometry.computeBoundingBox();
        const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        const mesh = new THREE.Mesh(geometry, [material, sideMaterial]);
        mesh.position.set(-width / 2, y, 0.024);
        label.add(mesh);
      };
      spec.lines.forEach((line, i) => addLine(line, 0.3, (spec.lines.length - 1) * 0.2 - i * 0.4 - 0.1));
      panels[spec.face].add(label);
      disciplineLabels.push({ group: label, material, sideMaterial, face: spec.face, ink: material.color.clone() });
    }
    const label = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: 0x163d56, transparent: true, opacity: 0 });
    const sideMaterial = new THREE.MeshBasicMaterial({ color: 0x0e2638, transparent: true, opacity: 0 });
    const addIdentityLine = (text, size, y) => {
      const geometry = new TextGeometry(text, { font, size, depth: 0.008, curveSegments: 8, bevelEnabled: false });
      geometry.computeBoundingBox();
      const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      const mesh = new THREE.Mesh(geometry, [material, sideMaterial]);
      mesh.position.set(-width / 2, y, 0.026);
      label.add(mesh);
    };
    addIdentityLine("Hey, I'm", 0.18, 0.91);
    addIdentityLine("Sid", 0.34, 0.55);
    panels[0].add(label);
    identityLabel = { group: label, material, sideMaterial };
  },
  undefined,
  () => {
    document.querySelector("#instructions").textContent += " Disciplines: Branding, Agentic design, UI / UX.";
  }
);

const pointer = new THREE.Vector2(),
  pointerTarget = new THREE.Vector2(5, 5),
  raycaster = new THREE.Raycaster();
let active = false,
  awake = 0,
  progress = 0,
  targetProgress = 0,
  hover = -1,
  held = false,
  dragging = false,
  travel = 0;
let lastX = 0,
  lastY = 0,
  downX = 0,
  downY = 0;
const pulses = new Float32Array(6),
  touches = uniforms.map(() => new THREE.Vector2(0.5, 0.5));
const surfaceLooks = [
  ["#2d6971", "#8ac9bc", 0.64],
  ["#315d99", "#7ba7d1", 0.82],
  ["#2b6759", "#95bea4", 0.52],
  ["#617a8e", "#d9e3df", 0.34],
];
const lookIndex = new Uint8Array(6);
const colorTargets = uniforms.map((u) => ({ base: u.uBase.value.clone(), accent: u.uAccent.value.clone(), sheen: 0 }));
const portfolioIntro = document.querySelector(".portfolio-intro");

// One restrained atmospheric beat. Birds only cross while the six sides learn depth.
const birdGroup = new THREE.Group();
scene.add(birdGroup);
const birdMaterial = new THREE.LineBasicMaterial({ color: 0xdbe8df, transparent: true, opacity: 0 });
for (let i = 0; i < 4; i++) {
  const span = 0.16 + i * 0.022;
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-span, 0, 0),
    new THREE.Vector3(0, -0.055 - i * 0.004, 0),
    new THREE.Vector3(span, 0, 0),
  ]);
  const bird = new THREE.Line(geometry, birdMaterial.clone());
  bird.userData.offset = i * 1.35;
  birdGroup.add(bird);
}

// Final fragments do not vanish into an abstract sheet. They land and rebuild
// as a restrained New York silhouette made from the cube's own material family.
const skylineData = [];
const skylineGeometry = new THREE.BoxGeometry(0.09, 0.098, 0.09);
const skylineMaterial = new THREE.MeshBasicMaterial({
  color: 0xd8ebe7,
  transparent: true,
  opacity: 0,
  vertexColors: false,
  toneMapped: false,
});
const skylineProfile = [4, 6, 8, 5, 10, 7, 14, 22, 16, 9, 26, 18, 12, 8, 15, 7, 10, 6, 4];
let skylineCount = 0;
for (let bx = 0; bx < skylineProfile.length; bx++) {
  const height = skylineProfile[bx];
  const width = bx === 10 ? 2 : bx === 7 ? 2 : 1 + (bx % 3 === 0 ? 1 : 0);
  for (let wx = 0; wx < width; wx++) {
    for (let y = 0; y < height; y++) {
      for (let z = 0; z < 2; z++) {
        skylineData.push({
          x: (bx - skylineProfile.length / 2) * 0.31 + wx * 0.11,
          y: -2.35 + y * 0.112,
          z: -1.1 + z * 0.12,
          delay: bx / skylineProfile.length * 0.18 + y / Math.max(height, 1) * 0.32,
          seed: (((bx * 47 + y * 83 + z * 19) % 101) / 101),
        });
        skylineCount++;
      }
    }
  }
}
// A stepped central spire makes the final silhouette read as Manhattan,
// rather than an arbitrary equal-height city grid.
for (let s = 0; s < 11; s++) {
  skylineData.push({
    x: 0.095,
    y: -2.35 + (26 + s) * 0.112,
    z: -1.04,
    delay: 0.58 + s * 0.017,
    seed: ((s * 37 + 11) % 101) / 101,
  });
  skylineCount++;
}
const skyline = new THREE.InstancedMesh(skylineGeometry, skylineMaterial, skylineCount);
skyline.frustumCulled = false;
skyline.visible = false;
const skylineMatrix = new THREE.Matrix4();
const skylineColor = new THREE.Color();
for (let i = 0; i < skylineCount; i++) {
  const d = skylineData[i];
  skylineMatrix.makeTranslation(d.x, d.y, d.z);
  skyline.setMatrixAt(i, skylineMatrix);
  skylineColor.set(["#dceee8", "#72b7ad", "#5b86bb", "#f0e8d5"][i % 4]);
  skyline.setColorAt(i, skylineColor);
}
skyline.instanceColor.needsUpdate = true;
scene.add(skyline);

function updateSkyline(amount) {
  skyline.visible = amount > 0.001;
  skylineMaterial.opacity = ease(0.02, 0.32, amount) * 0.94;
  const land = ease(0.0, 0.42, amount);
  for (let i = 0; i < skylineCount; i++) {
    const d = skylineData[i];
    const riseStart = 0.33 + d.delay * 0.42;
    const rise = ease(riseStart, Math.min(1, riseStart + 0.28), amount);
    const scatterX = d.x + Math.sin(d.seed * 77) * 3.8;
    const scatterY = 0.8 + Math.abs(Math.sin(d.seed * 41)) * 4.2;
    const scatterZ = d.z + Math.cos(d.seed * 53) * 2.5;
    const sx = mix(scatterX, d.x, land);
    const sy = mix(scatterY, -2.48, land) + (d.y + 2.48) * rise;
    const sz = mix(scatterZ, d.z, land);
    const chaos = 1 - Math.max(land, rise);
    skylineMatrix.compose(
      new THREE.Vector3(sx, sy, sz),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(chaos * d.seed * 4, chaos * d.seed * 6, chaos * d.seed * 3)),
      new THREE.Vector3(0.38 + Math.max(land, rise) * 0.62, 0.38 + Math.max(land, rise) * 0.62, 0.38 + Math.max(land, rise) * 0.62)
    );
    skyline.setMatrixAt(i, skylineMatrix);
  }
  skyline.instanceMatrix.needsUpdate = true;
}

// Empty clicks launch a small architectural echo of the cube. It arcs out, lands,
// and remains quiet in the composition before dissolving.
const echoGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.7, 0.7, 0.7));
const echoCubes = [];
const echoPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const echoTarget = new THREE.Vector3();
const echoOrigin = new THREE.Vector3();
function spawnEcho() {
  raycaster.setFromCamera(pointerTarget, camera);
  if (!raycaster.ray.intersectPlane(echoPlane, echoTarget)) return;
  echoTarget.x = clamp(echoTarget.x, -4.8, 4.8);
  echoTarget.y = clamp(echoTarget.y, -2.7, 2.7);
  root.getWorldPosition(echoOrigin);
  const material = new THREE.LineBasicMaterial({
    color: [0xdce9ef, 0x7fc3bd, 0x5f83ba][echoCubes.length % 3],
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
  });
  const cube = new THREE.LineSegments(echoGeometry, material);
  cube.position.copy(echoOrigin);
  cube.scale.setScalar(0.02);
  cube.userData = {
    age: 0,
    start: echoOrigin.clone(),
    end: echoTarget.clone(),
    arc: 0.55 + Math.random() * 0.7,
    spin: new THREE.Vector3(0.65 + Math.random(), 0.8 + Math.random(), 0.25 + Math.random() * 0.5),
  };
  scene.add(cube);
  echoCubes.push(cube);
  while (echoCubes.length > 5) {
    const old = echoCubes.shift();
    scene.remove(old);
    old.material.dispose();
  }
}
function changeSurface(i) {
  const look = surfaceLooks[lookIndex[i]++ % surfaceLooks.length];
  colorTargets[i].base.set(look[0]);
  colorTargets[i].accent.set(look[1]);
  colorTargets[i].sheen = look[2];
  pulses[i] = 1;
  const label = disciplineLabels.find((item) => item.face === i);
  if (label) label.ink.set(0x163d56);
}
history.scrollRestoration = "manual";
window.scrollTo(0, 0);
gsap.registerPlugin(ScrollTrigger);
const timeline = ScrollTrigger.create({
  trigger: "main",
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => {
    targetProgress = active ? self.progress : 0;
    scrollVelocity = active ? clamp(self.getVelocity() / 2200, -1, 1) : 0;
  },
});
function activate() {
  if (active) return;
  active = true;
  document.body.classList.add("awakened");
  document.querySelector("#instructions").textContent =
    "Scroll from Hey, I'm Sid into Product design, Branding, Agentic design and UI / UX. The tiles multiply, condense into a cube, then become New York. Click a face to change its material. Hold to move pigment.";
  canvas.setAttribute("aria-label", "Watercolor identity square. Scroll to reveal disciplines, form a cube, and build a New York skyline.");
  pulses[0] = 1;
  ScrollTrigger.refresh();
}
function locate(event) {
  const b = canvas.getBoundingClientRect();
  pointerTarget.set(((event.clientX - b.left) / b.width) * 2 - 1, 1 - ((event.clientY - b.top) / b.height) * 2);
  const now = clock.elapsedTime;
  if (!reduced && now - lastTrailTime > 0.075) {
    waterTrail[trailIndex].set(pointerTarget.x * 0.5 + 0.5, pointerTarget.y * 0.5 + 0.5, now, 1);
    trailIndex = (trailIndex + 1) % waterTrail.length;
    lastTrailTime = now;
  }
}
function pickFace() {
  if (progress > 0.78) {
    hover = -1;
    return;
  }
  raycaster.setFromCamera(pointerTarget, camera);
  const targets = [];
  for (const group of panels) {
    if (!group.visible) continue;
    for (const child of group.children) {
      if ((child.isMesh || child.isInstancedMesh) && child.visible) targets.push(child);
    }
  }
  const hits =
    pointerTarget.x < 2
      ? raycaster.intersectObjects(targets, false)
      : [];
  hover = hits.length ? hits[0].object.userData.face : -1;
  if (hover >= 0 && hits[0].uv) touches[hover].copy(hits[0].uv);
}
canvas.addEventListener("pointermove", (e) => {
  locate(e);
  if (held) {
    travel = Math.hypot(e.clientX - downX, e.clientY - downY);
    if (travel > 6 && active && progress < 0.85) dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  }
});
canvas.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  document.body.classList.add("pointer-input");
  locate(e);
  pickFace();
  held = true;
  dragging = false;
  travel = 0;
  downX = lastX = e.clientX;
  downY = lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointerup", (e) => {
  if (!held) return;
  if (!dragging && travel < 6) {
    if (hover === 0 && !active) {
      activate();
      changeSurface(0);
    } else if (active && hover >= 0) {
      changeSurface(hover);
    } else if (active) {
      spawnEcho();
    }
  }
  held = false;
  dragging = false;
  if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
});
function cancel() {
  held = false;
  dragging = false;
}
canvas.addEventListener("pointercancel", cancel);
window.addEventListener("blur", cancel);
canvas.addEventListener("pointerleave", () => {
  if (!held) pointerTarget.set(5, 5);
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Tab") document.body.classList.remove("pointer-input");
});
canvas.addEventListener("keydown", (e) => {
  document.body.classList.remove("pointer-input");
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    activate();
    changeSurface(hover >= 0 ? hover : 0);
  }
});

// The cube net has real hinges. Back face is hinged to the right face's outer edge.
function pose(p) {
  // One authored progression. Timing intentionally includes readable holds.
  const growth = [1, ease(0.235, 0.325, p), ease(0.055, 0.115, p), ease(0.09, 0.15, p), ease(0.125, 0.185, p), ease(0.16, 0.22, p)];
  const fold = ease(0.315, 0.47, p),
    theta = (fold * Math.PI) / 2,
    phi = (ease(0.35, 0.47, p) * Math.PI) / 2;
  const frontZ = 1.25 * fold,
    L = 2.5,
    h = 1.25,
    c = Math.cos(theta),
    s = Math.sin(theta);
  for (let i = 0; i < 6; i++) {
    panels[i].rotation.set(0, 0, 0);
    panels[i].scale.set(1, 1, 1);
    panels[i].visible = growth[i] > 0.001;
    uniforms[i].uFold.value = fold;
  }
  panels[0].position.set(0, 0, frontZ);
  panels[2].position.set(h + h * c * growth[2], 0, frontZ - h * s);
  panels[2].rotation.y = theta;
  panels[2].scale.x = Math.max(growth[2], 0.001);
  panels[3].position.set(-h - h * c * growth[3], 0, frontZ - h * s);
  panels[3].rotation.y = -theta;
  panels[3].scale.x = Math.max(growth[3], 0.001);
  panels[4].position.set(0, h + h * c * growth[4], frontZ - h * s);
  panels[4].rotation.x = -theta;
  panels[4].scale.y = Math.max(growth[4], 0.001);
  panels[5].position.set(0, -h - h * c * growth[5], frontZ - h * s);
  panels[5].rotation.x = theta;
  panels[5].scale.y = Math.max(growth[5], 0.001);
  panels[1].position.set(h + L * c + h * Math.cos(theta + phi) * growth[1], 0, frontZ - L * s - h * Math.sin(theta + phi));
  panels[1].rotation.y = theta + phi;
  panels[1].scale.x = Math.max(growth[1], 0.001);
  // Four disciplines replicate into a designed field, then converge on the hinge.
  const patternIn = ease(0.145, 0.225, p);
  const patternOut = ease(0.285, 0.435, p);
  const patternPresence = patternIn * (1 - patternOut);
  for (let i = 0; i < patternCards.length; i++) {
    const card = patternCards[i];
    const col = i % 5;
    const row = Math.floor(i / 5);
    const tx = (col - 2) * 1.46;
    const ty = (1.5 - row) * 1.22;
    const tz = -1.15 + (i % 3) * 0.075;
    card.position.set(mix(tx, 0, patternOut), mix(ty, 0, patternOut), mix(tz, 0, patternOut));
    card.rotation.set((row - 1.5) * 0.018 * (1 - patternOut), (col - 2) * -0.028 * (1 - patternOut), Math.sin(i * 2.4) * 0.018);
    const cardScale = 0.54 * patternPresence * mix(1, 0.26, patternOut);
    card.scale.setScalar(Math.max(0.001, cardScale));
    card.userData.material.opacity = patternPresence * 0.88;
    card.visible = patternPresence > 0.002;
  }

  const cubeHold = ease(0.455, 0.53, p) * (1 - ease(0.625, 0.71, p));
  const hollowTurn = ease(0.59, 0.755, p);
  const breakup = ease(0.745, 0.905, p);
  const skylineBuild = ease(0.81, 1, p);
  const scale = mix(1.03, 0.73, ease(0.02, 0.2, p)) * (1 + fold * 0.55) * (1 + cubeHold * 0.1) * (1 - breakup * 0.12);
  const responsiveScale = scale * Math.min(1, camera.aspect / 0.98);
  root.scale.setScalar(responsiveScale);
  root.position.x = -1.25 * growth[1] * (1 - fold) * responsiveScale;
  root.position.y = (reduced ? 0 : Math.sin(clock.elapsedTime * 0.7) * 0.025) * (1 - fold * 0.6);
  root.rotation.set(
    fold * 0.12 + hollowTurn * 0.34 + pointer.y * 0.018 * cubeHold,
    -0.025 + fold * 0.24 + cubeHold * 0.78 + hollowTurn * 1.02 + pointer.x * 0.024 * cubeHold,
    Math.sin(ease(0.31, 0.76, p) * Math.PI) * 0.032
  );
  camera.position.z = mix(10.45, 11.85, skylineBuild);
  const sheetHeight = 2 * (camera.position.z + 2) * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * 1.12;
  const cols = Math.round(Math.sqrt(grid * grid * 6 * camera.aspect));
  for (let i = 0; i < 6; i++) {
    uniforms[i].uBreak.value = breakup;
    uniforms[i].uOutline.value = ease(0.575, 0.77, p);
    uniforms[i].uPanelFade.value = ease(0.59, 0.75, p);
    uniforms[i].uSettle.value = ease(0.885, 0.975, p);
    uniforms[i].uSheet.value.set(sheetHeight * camera.aspect, sheetHeight, cols);
    panels[i].children[0].visible = p < 0.755;
    chips[i].visible = p >= 0.55 && p < 0.972;
  }
  if (identityLabel) {
    const alpha = 1 - ease(0.055, 0.105, p);
    identityLabel.group.visible = alpha > 0.001;
    identityLabel.material.opacity = alpha;
    identityLabel.sideMaterial.opacity = alpha;
  }
  for (const label of disciplineLabels) {
    const alpha = ease(0.065, 0.11, p) * (1 - ease(0.285, 0.37, p));
    label.group.visible = alpha > 0.001;
    label.material.opacity = alpha;
    label.sideMaterial.opacity = alpha;
  }
  updateSkyline(skylineBuild);
  const intro = ease(0.965, 1, p);
  portfolioIntro.style.opacity = intro;
  portfolioIntro.style.transform = `translateY(${(1 - intro) * 22}px)`;
  portfolioIntro.setAttribute("aria-hidden", intro < 0.8 ? "true" : "false");
}
function resize() {
  const w = innerWidth,
    h = innerHeight;
  renderer.setSize(w, h);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  background.uniforms.aspect.value = w / h;
  finish.uniforms.resolution.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
}
window.addEventListener("resize", resize);
resize();
const clock = new THREE.Clock();
const centeredPointer = new THREE.Vector2();
const faceNormal = new THREE.Vector3(),
  facePosition = new THREE.Vector3(),
  toCamera = new THREE.Vector3();
const faceQuaternion = new THREE.Quaternion();
function animate() {
  const dt = Math.min(clock.getDelta(), 0.05),
    time = clock.elapsedTime;
  progress = damp(progress, targetProgress, 5.5, dt);
  awake = damp(awake, active ? 1 : 0, 4, dt);
  const onCanvas = pointerTarget.x < 2;
  pointer.lerp(onCanvas ? pointerTarget : centeredPointer, 1 - Math.exp(-5 * dt));
  pose(progress);
  scene.updateMatrixWorld(true);
  pickFace();
  document.body.classList.toggle("over-cube", hover >= 0);
  document.body.classList.toggle("dragging", dragging);
  const cycle = time % 5.3;
  const blink = reduced ? 0 : ease(4.88, 4.94, cycle) * (1 - ease(4.97, 5.08, cycle));
  for (let i = 0; i < 6; i++) {
    const u = uniforms[i];
    panels[i].getWorldQuaternion(faceQuaternion);
    panels[i].getWorldPosition(facePosition);
    faceNormal.set(0, 0, 1).applyQuaternion(faceQuaternion);
    toCamera.copy(camera.position).sub(facePosition).normalize();
    const frontness = clamp(faceNormal.dot(toCamera), 0, 1);
    u.uFocus.value = damp(u.uFocus.value, ease(0.45, 0.96, frontness), 4, dt);
    u.uTime.value = reduced ? 0 : time;
    u.uHover.value = damp(u.uHover.value, hover === i ? 1 : 0, 1.35, dt);
    u.uHold.value = damp(u.uHold.value, held && !dragging && hover === i ? 1 : 0, 1.5, dt);
    u.uTouch.value.lerp(touches[i], 1 - Math.exp(-3 * dt));
    u.uBase.value.lerp(colorTargets[i].base, 1 - Math.exp(-4 * dt));
    u.uAccent.value.lerp(colorTargets[i].accent, 1 - Math.exp(-4 * dt));
    u.uSheen.value = damp(u.uSheen.value, colorTargets[i].sheen, 4, dt);
    u.uGaze.value.copy(pointer);
    pulses[i] *= Math.exp(-1.8 * dt);
    u.uPulse.value = pulses[i];
    u.uBlink.value = blink;
    u.uAwake.value = awake;
  }
  for (const label of disciplineLabels) {
    label.material.color.lerp(label.ink, 1 - Math.exp(-3 * dt));
    label.sideMaterial.color.copy(label.material.color).multiplyScalar(0.65);
  }
  const birdChapter = ease(0.2, 0.27, progress) * (1 - ease(0.42, 0.5, progress));
  birdGroup.visible = birdChapter > 0.002;
  for (let i = 0; i < birdGroup.children.length; i++) {
    const bird = birdGroup.children[i];
    const flight = (time * 0.055 + bird.userData.offset * 0.11) % 1;
    bird.position.set(mix(-7.5, 7.5, flight), 1.5 + i * 0.34 + Math.sin(time * 0.7 + i) * 0.12, -2.5 - i * 0.18);
    bird.rotation.z = Math.sin(time * 1.1 + i) * 0.05;
    bird.material.opacity = birdChapter * 0.3;
  }
  for (let i = echoCubes.length - 1; i >= 0; i--) {
    const echo = echoCubes[i];
    echo.userData.age += dt;
    const age = echo.userData.age;
    const travelT = ease(0, 0.82, Math.min(age, 1));
    echo.position.lerpVectors(echo.userData.start, echo.userData.end, travelT);
    echo.position.y += Math.sin(travelT * Math.PI) * 1.35;
    echo.rotation.set(age * 0.44, age * 0.72, age * 0.23);
    const arrival = ease(0.66, 0.94, Math.min(age, 1));
    echo.scale.setScalar(mix(0.15, 1, arrival));
    echo.material.opacity = 0.72 * (1 - ease(3.8, 5.5, age));
    if (age > 5.5) {
      scene.remove(echo);
      echo.material.dispose();
      echoCubes.splice(i, 1);
    }
  }
  background.uniforms.time.value = reduced ? 0 : time;
  background.uniforms.progress.value = progress;
  background.uniforms.mouse.value.copy(pointer);
  scrollVelocity *= Math.exp(-5 * dt);
  finish.uniforms.time.value = reduced ? 0 : time;
  finish.uniforms.velocity.value = reduced ? 0 : scrollVelocity;
  composer.render();
  requestAnimationFrame(animate);
}
animate();
