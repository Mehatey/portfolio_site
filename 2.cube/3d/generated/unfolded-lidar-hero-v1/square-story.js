import * as THREE from "three";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FontLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/geometries/TextGeometry.js";
import { RoundedBoxGeometry } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/geometries/RoundedBoxGeometry.js";

// One object, one continuous timeline. Previous experiments remain in main.js.
const canvas = document.querySelector("#scene");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
// Soft environmental lighting supports the reflective cube without turning it
// into a chrome product render.
scene.add(new THREE.HemisphereLight(0xdff8ff, 0x16333a, 2.2));
const cityKey = new THREE.DirectionalLight(0xf7fbff, 3.4);
cityKey.position.set(-4, 7, 8);
scene.add(cityKey);
const cityRim = new THREE.DirectionalLight(0x72b9ff, 2.1);
cityRim.position.set(6, 2, -4);
scene.add(cityRim);
const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.01, 100);
camera.position.z = 11;
const root = new THREE.Group();
scene.add(root);

// A single restrained rain chapter lives inside the cube. World-space streaks
// preserve parallax as the viewer looks around instead of reading as a screen
// overlay. One shared geometry keeps the effect inexpensive.
const rainCount = reduced ? 0 : 150;
const rainPositions = new Float32Array(rainCount * 6);
const rainColors = new Float32Array(rainCount * 6);
const rainBaseX = new Float32Array(rainCount);
const rainSpeed = new Float32Array(rainCount);
const rainPhase = new Float32Array(rainCount);
for (let i = 0; i < rainCount; i++) {
  const j = i * 6;
  const x = THREE.MathUtils.randFloatSpread(2.45);
  const y = THREE.MathUtils.randFloatSpread(2.65);
  const z = THREE.MathUtils.randFloatSpread(2.35);
  const length = THREE.MathUtils.randFloat(0.055, 0.16);
  const brightness = THREE.MathUtils.randFloat(0.42, 0.92);
  rainBaseX[i] = x;
  rainSpeed[i] = THREE.MathUtils.randFloat(0.34, 0.76);
  rainPhase[i] = Math.random() * Math.PI * 2;
  rainPositions.set([x, y, z, x + length * 0.11, y - length, z + length * 0.035], j);
  rainColors.set([brightness * 0.62, brightness * 0.82, brightness, brightness * 0.38, brightness * 0.62, brightness * 0.84], j);
}
const rainGeometry = new THREE.BufferGeometry();
rainGeometry.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
rainGeometry.setAttribute("color", new THREE.BufferAttribute(rainColors, 3));
const rainMaterial = new THREE.LineBasicMaterial({
  vertexColors: true,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  toneMapped: false,
});
const interiorRain = new THREE.LineSegments(rainGeometry, rainMaterial);
interiorRain.frustumCulled = false;
interiorRain.renderOrder = 5;
interiorRain.visible = false;
scene.add(interiorRain);
let rainAmount = 0;

// Scroll-drawn lightning gives the final voxel break a visible cause. A bright
// core and translucent sleeve share each segment so bloom stays controlled.
const lightningGroup = new THREE.Group();
const lightningCoreMaterial = new THREE.MeshBasicMaterial({ color: 0xf8fdff, transparent: true, opacity: 0, toneMapped: false });
const lightningAuraMaterial = new THREE.MeshBasicMaterial({
  color: 0x72cfff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  toneMapped: false,
});
const lightningUnit = new THREE.CylinderGeometry(1, 1, 1, 5, 1, true);
const lightningSegments = [];
const lightningUp = new THREE.Vector3(0, 1, 0);
const addLightningSegment = (from, to, order) => {
  const direction = to.clone().sub(from);
  const length = direction.length();
  const midpoint = from.clone().add(to).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(lightningUp, direction.normalize());
  const core = new THREE.Mesh(lightningUnit, lightningCoreMaterial);
  const aura = new THREE.Mesh(lightningUnit, lightningAuraMaterial);
  core.position.copy(midpoint);
  aura.position.copy(midpoint);
  core.quaternion.copy(quaternion);
  aura.quaternion.copy(quaternion);
  core.scale.set(0.011, length, 0.011);
  aura.scale.set(0.038, length, 0.038);
  core.renderOrder = aura.renderOrder = 8;
  lightningGroup.add(aura, core);
  lightningSegments.push({ core, aura, length, order });
};
const lightningPoints = [];
for (let i = 0; i <= 18; i++) {
  const t = i / 18;
  const taper = Math.sin(t * Math.PI);
  lightningPoints.push(
    new THREE.Vector3(
      (Math.sin(i * 2.37) * 0.12 + Math.sin(i * 5.11) * 0.045) * taper,
      THREE.MathUtils.lerp(4.25, 1.28, t),
      0.38 + Math.sin(i * 1.71) * 0.055 * taper
    )
  );
}
for (let i = 0; i < lightningPoints.length - 1; i++) addLightningSegment(lightningPoints[i], lightningPoints[i + 1], i);
for (const index of [6, 10, 13]) {
  const origin = lightningPoints[index];
  const sign = index % 2 ? -1 : 1;
  const branchA = origin.clone().add(new THREE.Vector3(sign * 0.20, -0.18, 0.02));
  const branchB = branchA.clone().add(new THREE.Vector3(sign * 0.14, -0.22, -0.025));
  addLightningSegment(origin, branchA, 18 + index * 0.12);
  addLightningSegment(branchA, branchB, 19 + index * 0.12);
}
lightningGroup.visible = false;
scene.add(lightningGroup);
let lightningAmount = 0;
let lightningDraw = 0;
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
  uniforms: { time: { value: 0 }, progress: { value: 0 }, intro: { value: 0 }, aspect: { value: 1 }, mouse: { value: new THREE.Vector2() }, trail: { value: waterTrail } },
  vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.,1.);}",
  fragmentShader: `${noise}
  varying vec2 vUv;uniform float time,progress,intro,aspect;uniform vec2 mouse;uniform vec4 trail[12];
  vec3 washAt(vec2 uv,float phase){
    vec2 p=(uv-.5)*vec2(aspect,1.);vec2 q=p*1.7+vec2(time*.012,-time*.008);
    vec2 warp=vec2(fbm(q+3.),fbm(q-8.));float w=fbm(q+warp*2.4);float b=fbm(q*1.45-w+vec2(9.,time*.008));
    vec3 sky0=vec3(.018,.065,.16),sky1=vec3(.075,.25,.58),sky2=vec3(.22,.57,.56);
    vec3 mist0=vec3(.025,.085,.11),mist1=vec3(.16,.36,.39),mist2=vec3(.67,.73,.64);
    vec3 forest0=vec3(.018,.095,.075),forest1=vec3(.08,.31,.20),forest2=vec3(.49,.57,.35);
    vec3 a=mix(sky0,sky1,smoothstep(.20,.72,w));a=mix(a,sky2,smoothstep(.34,.72,b)*.72);
    vec3 d=mix(mist0,mist1,smoothstep(.18,.70,w));d=mix(d,mist2,smoothstep(.43,.78,b)*.32);
    vec3 f=mix(forest0,forest1,smoothstep(.18,.69,w));f=mix(f,forest2,smoothstep(.48,.80,b)*.38);
    float dusk=smoothstep(.18,.43,phase)*(1.-smoothstep(.43,.68,phase));
    float woods=smoothstep(.55,.78,phase)*(1.-smoothstep(.84,1.,phase));
    vec3 col=mix(a,d,dusk*.72);col=mix(col,f,woods*.72);
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
    vec2 liveUv=vUv+ripple;vec3 pigment=washAt(liveUv,progress);
    vec2 mouseUv=mouse*.5+.5;vec2 md=(vUv-mouseUv)*vec2(aspect,1.);
    float cursor=exp(-dot(md,md)*14.)*step(length(mouse),1.8);
    float mr=length(md);
    float build=smoothstep(.08,.78,intro);
    float dustSeed=hash(floor(vUv*vec2(310.,180.))+floor(time*.42));
    float dust=pow(dustSeed,34.)*(.035+.045*(1.-build));
    vec3 blackField=vec3(.0025,.0045,.0075)+vec3(.50,.66,.70)*dust;
    vec3 col=mix(blackField,pigment,build);
    // Before the full watercolor world arrives, the pointer gently wakes a
    // restrained patch of pigment. No lens warp, pixel blocks, or hard ring.
    float wake=cursor*(.72-.30*build);
    float wakeFlow=.5+.5*sin(mr*18.-time*.72+fbm(vUv*5.)*3.);
    // Hover behaves like light refracting through a shallow pond. Local color
    // separation, fluid displacement, and broken caustics create depth without
    // introducing a graphic ring or unrelated object.
    vec2 refraction=md/(mr+.035)*sin(mr*48.-time*1.35+fbm(vUv*8.)*4.)*cursor*.008;
    vec3 refracted=washAt(liveUv+refraction,progress);
    float caustic=pow(.5+.5*sin(mr*72.-time*1.7+fbm(vUv*13.)*5.),9.)*cursor;
    col=mix(col,refracted,wake*(.28+.23*wakeFlow));
    col.r=mix(col.r,washAt(liveUv+refraction*1.8+vec2(.003,0.),progress).r,cursor*.13);
    col.b=mix(col.b,washAt(liveUv-refraction*1.5-vec2(.003,0.),progress).b,cursor*.16);
    col+=vec3(.24,.70,.78)*caustic*.19;
    col-=vec3(.015,.035,.045)*cursor*(1.-wakeFlow)*.30;
    col+=vec3(.22,.42,.45)*(leak+cursor*.018*(.3+.7*wakeFlow));
    float cloudChapter=smoothstep(.18,.27,progress)*(1.-smoothstep(.43,.52,progress));
    float cloud=smoothstep(.61,.82,fbm(vec2(vUv.x*2.1-time*.012,vUv.y*.9+6.)));
    col=mix(col,vec3(.74,.79,.79),cloud*cloudChapter*.10);
    // Continuous water detail only. No decorative fish, flowers, or pixel props.
    float pondLife=smoothstep(.45,.74,intro)*(1.-smoothstep(.50,.60,progress));
    vec2 windUv=vUv+vec2(sin(vUv.y*8.+time*.16),cos(vUv.x*7.-time*.12))*.004;
    float causticA=pow(max(0.,sin((windUv.x+fbm(windUv*3.))*31.+time*.34)*sin(windUv.y*27.-time*.22)),4.);
    float causticB=pow(max(0.,sin((windUv.x-windUv.y)*43.-time*.19+fbm(windUv*5.)*3.)),6.);
    col+=vec3(.26,.50,.51)*(causticA*.052+causticB*.026)*pondLife;
    // Give the unfolding identity a calm pocket without adding a card, glow,
    // or artificial spotlight. The watercolor remains visible at the edges.
    vec2 stage=(vUv-.5)*vec2(aspect,1.);float quiet=exp(-dot(stage,stage)*1.75);
    float netChapter=smoothstep(.018,.07,progress)*(1.-smoothstep(.33,.44,progress));
    col=mix(col,vec3(.075,.20,.245),quiet*netChapter*.16);
    float eyeChapter=smoothstep(.12,.18,progress)*(1.-smoothstep(.31,.40,progress));
    float eyeWarmth=exp(-dot(stage-vec2(.42,0.),stage-vec2(.42,0.))*2.4);
    col=mix(col,col+vec3(.095,.040,.012),eyeWarmth*eyeChapter*.46);
    // Watercolor is the opening world. The voxel/logo ending moves onto a
    // quieter ink field so the identity transformation stays visually coherent.
    float endField=smoothstep(.79,.88,progress);
    vec3 inkField=mix(vec3(.012,.026,.041),vec3(.025,.072,.083),fbm(vUv*2.1+4.)*.34);
    col=mix(col,inkField,endField);
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
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, velocity: { value: 0 }, progress: { value: 0 }, lightning: { value: 0 }, resolution: { value: new THREE.Vector2() } },
  vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader: `varying vec2 vUv;uniform sampler2D tDiffuse;uniform float time,velocity,progress,lightning;uniform vec2 resolution;
  ${noise}
  void main(){float effects=smoothstep(.48,.56,progress)*(1.-smoothstep(.88,.96,progress));float speed=clamp(abs(velocity),0.,1.)*effects;vec2 dir=vec2(sign(velocity),-.18)*speed/resolution*5.;
  vec3 c=texture2D(tDiffuse,vUv).rgb;c=mix(c,(texture2D(tDiffuse,vUv-dir).rgb+texture2D(tDiffuse,vUv+dir).rgb)*.5,speed*.18);
  float split=effects*(.25+speed*1.45)/max(resolution.x,1.);c.r=texture2D(tDiffuse,vUv+vec2(split,0.)).r;c.b=texture2D(tDiffuse,vUv-vec2(split,0.)).b;
  float grain=(hash(vUv*resolution+floor(time*18.))-.5)*.012;
  c=mix(c,(c-.5)*1.055+.5,effects);c*=1.-effects*.19*dot(vUv-.5,vUv-.5);c+=grain;
  vec2 flashDelta=(vUv-vec2(.5,.52))*vec2(resolution.x/max(resolution.y,1.),1.);
  float impact=exp(-dot(flashDelta,flashDelta)*4.2);
  c+=vec3(.52,.76,1.)*lightning*(.08+impact*.34);
  c=mix(c,vec3(1.),lightning*lightning*.12);gl_FragColor=vec4(c,1.);}`,
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
    // Reversible burst: enough disorder to feel physical, then the same pieces
    // return and organize into the cube perimeter.
    float a=seed*6.28318+uIndex*.7;
    vec3 radial=normalize(vec3(cos(a),sin(a*.73)*.78,sin(seed*31.)*.72));
    vec3 velocity=radial*(2.1+seed*3.2)+vec3(0.,.35+seed*.65,0.);
    float coast=t*(1.15+.16*sin(uTime*.34+seed*21.));
    vec3 turbulence=vec3(sin(uTime*.47+seed*37.),cos(uTime*.39+seed*19.),sin(uTime*.43+seed*53.))*.18*t;
    world.xyz+=velocity*coast+turbulence+vec3(0.,-1.28*t*t,0.);
  }else{
    world=modelMatrix*vec4(p,1.);
    worldNormal=normalize(mat3(modelMatrix)*norm);
  }
  vWorld=world.xyz;vNormal=worldNormal;
  gl_Position=projectionMatrix*viewMatrix*world;
}`;
const fragmentShader = `${noise}
uniform vec3 uBase,uAccent;uniform float uTime,uHover,uHold,uPulse,uFace,uBlink,uAwake,uBreak,uSettle,uSheen,uFocus,uChip,uPanelFade,uMode,uGrid,uIndex,uOutline;
uniform vec2 uTouch,uGaze;varying vec2 vUv;varying vec3 vNormal,vWorld;varying float vFront,vDissolve;
float oval(vec2 p,vec2 size){float d=length(p/size);return 1.-smoothstep(.92,1.08,d);}
void main(){
  vec2 p=vUv;float touch=exp(-dot(p-uTouch,p-uTouch)*10.);
  vec2 drift=vec2(uTime*.004,-uTime*.003)*(.12+uHold*.35);
  vec2 delta=p-uTouch;float angle=touch*uHold*.16*sin(uTime*.25);
  mat2 curl=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
  vec2 painted=uTouch+curl*delta;
  float wetLight=exp(-dot(delta,delta)*7.)*uHover*(1.-uFace);
  painted+=delta*sin(length(delta)*19.-uTime*.8)*wetLight*.006;
  vec2 flow=vec2(fbm(painted*4.+drift),fbm(painted*4.-drift+13.));
  float wet=fbm(painted*5.4+flow*1.65);
  float gran=fbm(p*62.+flow*.25);
  float deposit=smoothstep(.27,.76,wet);
  float pigmentFlow=touch*uHold*.025;
  vec3 col=mix(uBase,uAccent,clamp(deposit*.38+pigmentFlow,0.,.85));
  // Hover behaves like wet pigment spreading through paper: a soft chromatic
  // tide and a moving edge, without mosaics, white flashes, or graphic rings.
  float hoverWash=exp(-dot(delta,delta)*8.5)*uHover*(1.-uFace);
  float tide=.5+.5*sin(length(delta)*22.-uTime*.65+wet*4.);
  vec3 hoverPigment=mix(uBase,uAccent,.40+.28*tide);
  col=mix(col,hoverPigment,hoverWash*(.16+.12*tide));
  col+=mix(uAccent,vec3(.32,.55,.55),.45)*hoverWash*.035;
  // A click changes the pigment family and sends that color through the face.
  // It is deliberately chromatic, never the old generic white flash.
  float clickWash=exp(-dot(p-uTouch,p-uTouch)*mix(16.,2.8,uPulse))*uPulse;
  col=mix(col,uAccent,clickWash*.42);
  col*=.91+.12*gran;
  // Voxel colors converge to neutral white as they organize into Sid's mark.
  // This prevents the former green/cyan edge residue during the final morph.
  col=mix(col,vec3(.96,.985,1.),smoothstep(.58,.98,uOutline)*.94);
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
  float glassMode=smoothstep(.55,.95,uMode)*(1.-smoothstep(1.28,1.7,uMode));
  float mirrorMode=smoothstep(1.45,1.9,uMode)*(1.-smoothstep(2.3,2.7,uMode));
  float pearlMode=smoothstep(2.45,2.9,uMode);
  float glassDepth=fbm(p*8.+flow*2.);
  vec3 glassCol=mix(uBase,uAccent,glassDepth*.45);
  col=mix(col,glassCol*.62+vec3(.11,.25,.28)*fres*1.55,glassMode*.82);
  float bands=.5+.5*sin((reflected.x+reflected.y*.65)*13.+uTime*.32+wet*4.);
  vec3 mirrorCol=mix(vec3(.035,.09,.14),vec3(.66,.82,.85),bands);
  col=mix(col,mirrorCol+vec3(.22,.38,.42)*softbox,mirrorMode*.9);
  vec3 pearl=.55+.45*cos(6.28318*(fres+vec3(.08,.31,.58))+uTime*.05);
  col=mix(col,mix(uBase,uAccent,.32)+pearl*.26,pearlMode*.82);
  float border=min(min(p.x,p.y),min(1.-p.x,1.-p.y));
  float rough=fbm(p*170.);
  col=mix(col,col*.36,(1.-smoothstep(.001,.007,border+rough*.0015))*.6*(1.-settle));
  col+=vec3(.09,.13,.14)*exp(-border*340.)*(1.-settle);
  // Ink is composited last, on the actual moving face, never a floating overlay.
  if(uFace>.5 && vFront>.5){
    vec2 gaze=uGaze*.012+vec2(sin(uTime*.23),cos(uTime*.19))*.0014;
    float eyeOpen=.5+.5*sin(uTime*.42+sin(uTime*.13)*1.7);
    float eyeH=mix(.088+.010*eyeOpen,.006,uBlink);
    float eyeW=.0125+.0065*smoothstep(.63,.98,eyeOpen)*(1.-uBlink);
    vec2 eyeL=p-vec2(.34,.58)-gaze;
    vec2 eyeR=p-vec2(.66,.58)-gaze;
    // Slightly imperfect ink shapes feel drawn and alive, while retaining the
    // original long, quiet slit-eye identity.
    eyeL.x+=eyeL.y*.055;
    eyeR.x-=eyeR.y*.038;
    float leftEye=oval(eyeL,vec2(eyeW,eyeH*.97));
    float rightEye=oval(eyeR,vec2(eyeW*1.055,eyeH*1.03));
    float eye=max(leftEye,rightEye);
    float eyeAura=max(
      oval(eyeL,vec2(eyeW*2.85,eyeH*1.22)),
      oval(eyeR,vec2(eyeW*2.85,eyeH*1.22))
    );
    float eyeRing=max(eyeAura-eye,0.);
    col*=1.-eyeRing*.075*uAwake;
    col+=vec3(.20,.48,.55)*eyeRing*.065*uAwake*(.72+.28*eyeOpen);
    float x=p.x-.5;
    float mood=sin(uTime*.46);
    float curve=(uHover*.006+uAwake*.007*mood)*(1.-pow(clamp(x/.055,-1.,1.),2.));
    float mouthLine=(1.-smoothstep(.0025,.006,abs(p.y-(.225-curve))))*(1.-smoothstep(.041,.052,abs(x)));
    float expression=max(eye,mouthLine)*uAwake;
    col=mix(col,vec3(.018,.031,.040),expression*.97*(1.-smoothstep(0.,.3,uBreak)));
    float glintL=oval(eyeL-vec2(-.0035,.019),vec2(.0044,max(.0075,eyeH*.115)));
    float glintR=oval(eyeR-vec2(-.0030,.020),vec2(.0041,max(.0072,eyeH*.108)));
    float glint=max(glintL,glintR)*(1.-uBlink)*uAwake;
    float sparkle=.86+.14*sin(uTime*2.1);
    col=mix(col,vec3(1.),glint*sparkle*(1.-smoothstep(0.,.3,uBreak)));
  }
  // The continuous panel hands off cell-by-cell to its matching voxel shell.
  if(uChip<.5){
    float cell=hash(floor(p*uGrid)+vec2(uIndex*19.3,7.1));
    if(cell<uPanelFade)discard;
  }
  // Screen-door dissolution avoids transparency sorting between thousands of chips.
  if(hash(floor(gl_FragCoord.xy))<vDissolve)discard;
  gl_FragColor=vec4(col,1.);
}`;

const bases = ["#e5ddd0", "#c9d0cb", "#263f65", "#d8d9d1", "#334f98", "#9fb7ad"];
const accents = ["#99a8a4", "#8ea2a4", "#6580a0", "#7f9894", "#7489c5", "#587a76"];
const panels = [],
  chips = [],
  uniforms = [];
const imageFaces = [];
const grid = 18;
const panelGeometry = new RoundedBoxGeometry(2.5, 2.5, 0.055, 7, 0.14);
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
    uMode: { value: 0 },
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
  // Give every sampled panel cell real depth. These are pieces of the cube,
  // not cards: the breakup should read as a voxel volume from oblique angles.
  const voxelSize = 2.5 / grid;
  const geo = new THREE.BoxGeometry(voxelSize * 0.88, voxelSize * 0.88, voxelSize * 0.72, 1, 1, 1);
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

// Exact frames from the site's existing onboarding film. They stay documentary,
// while the supporting cube surfaces remain authored watercolor materials.
const textureLoader = new THREE.TextureLoader();
const addImageFace = (face, path, exposure = 1) => {
  const texture = textureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: true,
    depthTest: true,
    toneMapped: false,
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  // Neutral linear-light exposure only. RGB channels remain equal so source
  // hue and saturation are untouched, and photos never inherit panel effects.
  material.color.setRGB(exposure, exposure, exposure);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), material);
  // Sit above the rounded panel's 0.0275 front surface. The old 0.018 depth
  // buried photos inside the thicker geometry and made them appear dark/absent.
  mesh.position.z = 0.038;
  mesh.renderOrder = 3;
  mesh.userData.face = face;
  panels[face].add(mesh);
  imageFaces.push({ face, mesh, material });
};
addImageFace(2, "./assets/sid-eye-natural.png?v=2", 1.34);
// The scan is the final tile in the reading order, beyond the three practices.
addImageFace(1, "./assets/sid-brain-clean.png?v=2", 1.24);

// Inside is a compact moving archive. Each clip is cropped to cover its wall,
// muted, and only exposed from within the cube.
const interiorFaces = [];
const interiorVideos = [];
const fitVideoTexture = (texture, aspect) => {
  texture.repeat.set(1, 1);
  texture.offset.set(0, 0);
  if (aspect > 1) {
    texture.repeat.x = 1 / aspect;
    texture.offset.x = (1 - texture.repeat.x) * 0.5;
  } else {
    texture.repeat.y = aspect;
    texture.offset.y = (1 - texture.repeat.y) * 0.5;
  }
};
const addInteriorVideo = (face, path, sourceAspect) => {
  const video = document.createElement("video");
  video.src = path;
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "auto";
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.disablePictureInPicture = true;
  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  fitVideoTexture(texture, sourceAspect);
  const material = new THREE.ShaderMaterial({
    uniforms: { map: { value: texture }, opacity: { value: 0 } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec2 vUv;uniform sampler2D map;uniform float opacity;void main(){gl_FragColor=vec4(texture2D(map,vUv).rgb,opacity);}",
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), material);
  // The rounded panel has an inner surface at -0.0275. Keep the video just
  // inside that surface so it remains visible from the cube interior.
  mesh.position.z = -0.038;
  mesh.renderOrder = 4;
  mesh.userData.face = face;
  panels[face].add(mesh);
  interiorFaces.push({ face, mesh, material, video });
  interiorVideos.push(video);
  video.addEventListener("canplay", () => {
    if (active) video.play().catch(() => {});
  });
  video.addEventListener("loadedmetadata", () => {
    fitVideoTexture(texture, video.videoWidth / Math.max(video.videoHeight, 1));
    video.currentTime = Math.min(0.08, video.duration || 0.08);
    if (active) video.play().catch(() => {});
  });
  video.load();
};
addInteriorVideo(1, "./assets/interior-space.mp4", 16 / 9);
addInteriorVideo(2, "./assets/interior-mesh.mp4", 3024 / 1526);
addInteriorVideo(3, "./assets/interior-vp.mp4", 16 / 9);
addInteriorVideo(4, "./assets/interior-sid.mp4", 16 / 9);
addInteriorVideo(5, "./assets/interior-o2.mp4", 610 / 1078);

// Continuous final identity mark. Its face is physical geometry, so the same
// expression survives the change from filled cube to portfolio logo.
const logoMark = new THREE.Group();
const logoInk = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false });
const roundedRectPath = (path, half, radius, clockwise) => {
  if (clockwise) {
    path.moveTo(-half, -half + radius);
    path.lineTo(-half, half - radius);
    path.quadraticCurveTo(-half, half, -half + radius, half);
    path.lineTo(half - radius, half);
    path.quadraticCurveTo(half, half, half, half - radius);
    path.lineTo(half, -half + radius);
    path.quadraticCurveTo(half, -half, half - radius, -half);
    path.lineTo(-half + radius, -half);
    path.quadraticCurveTo(-half, -half, -half, -half + radius);
  } else {
    path.moveTo(-half + radius, -half);
    path.lineTo(half - radius, -half);
    path.quadraticCurveTo(half, -half, half, -half + radius);
    path.lineTo(half, half - radius);
    path.quadraticCurveTo(half, half, half - radius, half);
    path.lineTo(-half + radius, half);
    path.quadraticCurveTo(-half, half, -half, half - radius);
    path.lineTo(-half, -half + radius);
    path.quadraticCurveTo(-half, -half, -half + radius, -half);
  }
};
const logoShape = new THREE.Shape();
roundedRectPath(logoShape, 1.25, 0.25, true);
const logoHole = new THREE.Path();
roundedRectPath(logoHole, 1.155, 0.17, false);
logoShape.holes.push(logoHole);
const logoEdges = new THREE.Mesh(
  new THREE.ShapeGeometry(logoShape, 8),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false, side: THREE.DoubleSide })
);
logoEdges.position.z = 1.286;
logoMark.add(logoEdges);
// Exact proportions from _includes/site_logo.html, scaled from its 21-unit
// front face to this 2.5-unit mark.
const eyeGeo = new RoundedBoxGeometry(0.155, 0.571, 0.045, 4, 0.055);
for (const x of [-0.419, 0.420]) {
  const eye = new THREE.Mesh(eyeGeo, logoInk);
  eye.position.set(x, 0.202, 1.29);
  logoMark.add(eye);
}
const logoMouth = new THREE.Mesh(new RoundedBoxGeometry(0.512, 0.107, 0.045, 4, 0.045), logoInk);
logoMouth.position.set(0, -0.518, 1.29);
logoMark.add(logoMouth);
const innerSignalMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false });
const innerSignal = new THREE.LineSegments(new THREE.EdgesGeometry(new RoundedBoxGeometry(1.34, 1.34, 1.34, 4, 0.12)), innerSignalMaterial);
innerSignal.position.z = 0.08;
logoMark.add(innerSignal);
root.add(logoMark);

// Typography belongs to the geometry, so perspective and occlusion stay honest.
// Each practice behaves like a quiet periodic-table specimen: index, symbol,
// and discipline only. Restraint keeps the three tiles readable in motion.
const disciplineLabels = [];
const mriLabels = [];
const interiorWallLabels = [];
new FontLoader().load(
  "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_regular.typeface.json",
  (font) => {
    const specs = [
      { face: 4, number: "01", symbol: "PD", lines: ["PRODUCT", "DESIGN"] },
      { face: 5, number: "02", symbol: "BD", lines: ["BRAND", "DESIGN"] },
      { face: 3, number: "03", symbol: "CT", lines: ["CREATIVE", "TECHNOLOGY"] },
    ];
    for (const spec of specs) {
      const label = new THREE.Group();
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false });
      const sideMaterial = new THREE.MeshBasicMaterial({ color: 0xbab7ae, transparent: true, opacity: 0, toneMapped: false });
      const addText = (text, size, x, y) => {
        const geometry = new TextGeometry(text, { font, size, depth: 0.008, curveSegments: 6, bevelEnabled: false });
        const mesh = new THREE.Mesh(geometry, [material, sideMaterial]);
        mesh.position.set(x, y, 0.06);
        label.add(mesh);
      };
      addText(spec.number, 0.115, -1.04, 0.96);
      addText(spec.symbol, 0.48, -1.06, 0.24);
      spec.lines.forEach((line, i) => addText(line, 0.16, -1.04, -0.58 - i * 0.23));
      panels[spec.face].add(label);
      disciplineLabels.push({ group: label, material, sideMaterial, materials: [material, sideMaterial], face: spec.face });
    }
    const mriMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false });
    const mriGeometry = new TextGeometry("SIDDHARTH MEHTA", { font, size: 0.105, depth: 0.006, curveSegments: 4, bevelEnabled: false });
    const mriName = new THREE.Mesh(mriGeometry, mriMaterial);
    mriName.position.set(-1.08, 0.96, 0.065);
    mriName.renderOrder = 4;
    panels[1].add(mriName);
    mriLabels.push({ mesh: mriName, material: mriMaterial });

    const wallSpecs = [
      [1, "01  CREATIVE TECHNOLOGY"],
      [2, "02  SPATIAL COMPUTING"],
      [3, "03  PRODUCT DESIGN"],
      [4, "04  BRAND DESIGN"],
      [5, "05  MOTION SYSTEMS"],
    ];
    for (const [face, title] of wallSpecs) {
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false, depthTest: false });
      const eyebrowGeometry = new TextGeometry("WHY HIRE SID", { font, size: 0.026, depth: 0.004, curveSegments: 3, bevelEnabled: false });
      const titleGeometry = new TextGeometry(title, { font, size: 0.043, depth: 0.004, curveSegments: 3, bevelEnabled: false });
      const label = new THREE.Group();
      const eyebrow = new THREE.Mesh(eyebrowGeometry, material);
      const titleMesh = new THREE.Mesh(titleGeometry, material);
      eyebrow.position.set(-1.08, -0.98, 0);
      titleMesh.position.set(-1.08, -1.09, 0);
      eyebrow.renderOrder = 6;
      titleMesh.renderOrder = 6;
      label.add(eyebrow, titleMesh);
      label.position.z = -0.07;
      label.rotation.y = Math.PI;
      label.renderOrder = 6;
      panels[face].add(label);
      interiorWallLabels.push({ group: label, material });
    }
  },
  undefined,
  () => {
    document.querySelector("#instructions").textContent += " Disciplines: Product Design, Brand Design, Creative Technology.";
  }
);

const pointer = new THREE.Vector2(),
  pointerTarget = new THREE.Vector2(5, 5),
  raycaster = new THREE.Raycaster();
let active = false,
  awake = 0,
  introProgress = 0,
  introTarget = 0,
  progress = 0,
  targetProgress = 0,
  hover = -1,
  held = false,
  dragging = false,
  travel = 0;
let dragPitch = 0,
  dragYaw = 0,
  dragPitchTarget = 0,
  dragYawTarget = 0;
let lastX = 0,
  lastY = 0,
  downX = 0,
  downY = 0;
const pulses = new Float32Array(6),
  touches = uniforms.map(() => new THREE.Vector2(0.5, 0.5));
const surfaceLooks = [
  { base: "#2d6971", accent: "#8ac9bc", sheen: 0.64, mode: 0 },
  { base: "#bdded8", accent: "#326f8d", sheen: 1.08, mode: 1 },
  { base: "#0b2634", accent: "#a6cfcc", sheen: 1.2, mode: 2 },
  { base: "#d9e4dc", accent: "#789ab8", sheen: 0.95, mode: 3 },
  { base: "#e2d8c3", accent: "#2d6590", sheen: 0.55, mode: 0 },
];
const lookIndex = new Uint8Array(6);
lookIndex.fill(1);
const colorTargets = uniforms.map((u) => ({ base: u.uBase.value.clone(), accent: u.uAccent.value.clone(), sheen: 0, mode: 0 }));
const portfolioIntro = document.querySelector(".portfolio-intro");
const squareCaption = document.querySelector(".square-caption");
const squareCaptionText = document.querySelector(".square-caption__text");
const squareCaptionCaret = document.querySelector(".square-caption__caret");
const sceneCursor = document.querySelector(".scene-cursor");
let captionScreenY = innerHeight * 0.52;
let captionVelocity = 0;
const captionCorner = new THREE.Vector3();
const cursorScreen = new THREE.Vector2(-40, -40);
const cursorScreenTarget = new THREE.Vector2(-40, -40);
const interiorContext = document.querySelector(".interior-context");
const interiorContextIndex = document.querySelector(".interior-context__index");
const interiorContextTitle = document.querySelector(".interior-context__title");
const interiorContextDetail = document.querySelector(".interior-context__detail");
const interiorChapters = [
  ["01 / 05", "Creative Technology", "Ideas become responsive systems, prototypes, and working code."],
  ["02 / 05", "Spatial Computing", "I design interactions that move beyond the rectangle and into space."],
  ["03 / 05", "Product Design", "Research, systems thinking, and careful execution turn ambiguity into useful products."],
  ["04 / 05", "Brand Design", "Identity gives complex products a clear voice, rhythm, and point of view."],
  ["05 / 05", "Experiments in Motion", "Motion helps people understand change, causality, and what to do next."],
];
function changeSurface(i) {
  const look = surfaceLooks[lookIndex[i]++ % surfaceLooks.length];
  colorTargets[i].base.set(look.base);
  colorTargets[i].accent.set(look.accent);
  colorTargets[i].sheen = look.sheen;
  colorTargets[i].mode = look.mode;
  pulses[i] = 1;
}
history.scrollRestoration = "manual";
window.scrollTo(0, 0);
gsap.registerPlugin(ScrollTrigger);
const timeline = ScrollTrigger.create({
  trigger: "main",
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => {
    const introShare = 7 / 55;
    introTarget = active ? 1 : self.progress;
    targetProgress = active ? clamp((self.progress - introShare) / (1 - introShare), 0, 1) : 0;
    scrollVelocity = active ? clamp(self.getVelocity() / 2200, -1, 1) : 0;
  },
});
function activate() {
  if (active || introProgress < 0.9) return;
  active = true;
  introTarget = 1;
  document.body.classList.add("awakened");
  document.querySelector("#instructions").textContent =
    "Scroll from Sid's face into his eye, Creative Technology, Product Design, Brand Design, and brain scan. Enter the cube and look across five moving chapters of work, then pull back as the shell becomes the portfolio logo.";
  canvas.setAttribute("aria-label", "Interactive identity square. Scroll to unfold Sid's visual story, enter a moving archive inside the cube, and transform it into the portfolio logo.");
  for (const video of interiorVideos) video.play().catch(() => {});
  pulses[0] = 1;
  ScrollTrigger.refresh();
}

const helloCopy = "Hey, I'm Sid.";
const promptCopy = "Click the square";
const revealCopy = (copy, amount) => copy.slice(0, Math.floor(clamp(amount, 0, 1) * (copy.length + 1)));
function projectedIntroSquareBottom() {
  let bottom = -Infinity;
  for (const x of [-1.25, 1.25]) {
    for (const y of [-1.25, 1.25]) {
      captionCorner.set(x, y, 0).applyMatrix4(panels[0].matrixWorld).project(camera);
      bottom = Math.max(bottom, (1 - captionCorner.y) * innerHeight * 0.5);
    }
  }
  return bottom;
}
function updateIntroCopy(t, storyProgress, dt) {
  let copy = "";
  if (t < 0.38) copy = revealCopy(helloCopy, ease(0.05, 0.34, t));
  else if (t < 0.73) copy = helloCopy;
  else if (t < 0.84) copy = helloCopy.slice(0, Math.ceil(helloCopy.length * (1 - ease(0.73, 0.84, t))));
  else copy = revealCopy(promptCopy, ease(0.84, 0.98, t));
  squareCaptionText.textContent = copy;
  // Treat the caption as a physical body. It stays at its original baseline
  // until the descending square's projected bottom edge reaches it. During
  // contact, a hard non-overlap constraint lets the square push the type;
  // when contact ends, a critically damped spring returns it without snapping.
  const baseY = innerHeight * (innerWidth < 700 ? 0.54 : 0.52);
  const halfCaption = Math.max(14, squareCaption.offsetHeight * 0.5);
  const contactY = projectedIntroSquareBottom() + (innerWidth < 700 ? 20 : 26) + halfCaption;
  const targetY = Math.max(baseY, contactY);
  const acceleration = (targetY - captionScreenY) * 92 - captionVelocity * 18;
  captionVelocity += acceleration * dt;
  captionScreenY += captionVelocity * dt;
  if (contactY > baseY && captionScreenY < contactY) {
    captionScreenY = contactY;
    captionVelocity = Math.max(0, captionVelocity);
  }
  squareCaption.style.top = `${captionScreenY}px`;
  squareCaption.style.opacity = active ? 1 - awake : t > 0.025 ? 1 : 0;
  squareCaption.style.transform = "translate(-50%, -50%)";
  squareCaption.style.visibility = t > 0.018 ? "visible" : "hidden";
  squareCaptionCaret.style.visibility = t > 0.018 && t < 0.34 ? "visible" : "hidden";
  squareCaption.setAttribute("aria-label", copy);
}
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && active) {
    for (const video of interiorVideos) video.play().catch(() => {});
  }
});
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
  if (progress > 0.5) {
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
  document.body.classList.add("pointer-input", "cursor-visible");
  cursorScreenTarget.set(e.clientX, e.clientY);
  locate(e);
  if (held) {
    travel = Math.hypot(e.clientX - downX, e.clientY - downY);
    if (travel > 6 && active && progress < 0.85) dragging = true;
    if (dragging) {
      dragYawTarget = clamp(dragYawTarget + (e.clientX - lastX) * 0.0042, -1.25, 1.25);
      dragPitchTarget = clamp(dragPitchTarget + (e.clientY - lastY) * 0.0032, -0.72, 0.72);
    }
    lastX = e.clientX;
    lastY = e.clientY;
  }
});
canvas.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  document.body.classList.add("pointer-input");
  document.body.classList.add("cursor-down");
  locate(e);
  pickFace();
  held = true;
  dragging = false;
  travel = 0;
  downX = lastX = e.clientX;
  downY = lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
  for (const video of interiorVideos) if (video.paused) video.play().catch(() => {});
});
canvas.addEventListener("pointerup", (e) => {
  if (!held) return;
  if (!dragging && travel < 6) {
    if (hover === 0 && !active) {
      activate();
    } else if (active && hover >= 0) {
      changeSurface(hover);
    } else if (active) {
      waterTrail[trailIndex].set(pointerTarget.x * 0.5 + 0.5, pointerTarget.y * 0.5 + 0.5, clock.elapsedTime, 2.2);
      trailIndex = (trailIndex + 1) % waterTrail.length;
    }
  }
  held = false;
  dragging = false;
  document.body.classList.remove("cursor-down");
  if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
});
function cancel() {
  held = false;
  dragging = false;
  document.body.classList.remove("cursor-down");
}
canvas.addEventListener("pointercancel", cancel);
window.addEventListener("blur", cancel);
canvas.addEventListener("pointerleave", () => {
  if (!held) pointerTarget.set(5, 5);
  if (!held) document.body.classList.remove("cursor-visible");
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Tab") document.body.classList.remove("pointer-input");
});
canvas.addEventListener("keydown", (e) => {
  document.body.classList.remove("pointer-input");
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    activate();
    if (active && hover > 0) changeSurface(hover);
  }
});

// The cube net has real hinges. Back face is hinged to the right face's outer edge.
function pose(p) {
  const introSquare = ease(0.39, 0.69, introProgress);
  // Biography arrives one side at a time: face, eye, three practices, then mind.
  const growth = [1, ease(0.26, 0.315, p), ease(0.20, 0.255, p), ease(0.14, 0.195, p), ease(0.04, 0.095, p), ease(0.09, 0.145, p)];
  const fold = ease(0.285, 0.43, p),
    theta = (fold * Math.PI) / 2,
    phi = (ease(0.345, 0.43, p) * Math.PI) / 2;
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
  const cubeHold = ease(0.42, 0.47, p) * (1 - ease(0.49, 0.54, p));
  const showcase = ease(0.42, 0.50, p);
  const enter = ease(0.485, 0.545, p);
  const exit = ease(0.705, 0.775, p);
  const inside = enter * (1 - exit);
  const interiorVisible = ease(0.515, 0.555, p) * (1 - ease(0.735, 0.79, p));
  // One readable weather beat, centered on the middle interior wall. Soft
  // overlap at both edges prevents rain from popping on scroll reversals.
  rainAmount = ease(0.603, 0.618, p) * (1 - ease(0.666, 0.686, p)) * interiorVisible;
  const door = ease(0.475, 0.54, p) * (1 - ease(0.715, 0.78, p));
  lightningDraw = ease(0.748, 0.774, p);
  const primaryFlash = ease(0.762, 0.769, p) * (1 - ease(0.776, 0.786, p));
  const afterFlash = ease(0.780, 0.785, p) * (1 - ease(0.791, 0.800, p));
  lightningAmount = Math.max(primaryFlash, afterFlash * 0.46);
  const voxelize = ease(0.790, 0.842, p);
  const chaos = ease(0.825, 0.88, p) * (1 - ease(0.89, 0.93, p));
  const edgeOrder = ease(0.875, 0.94, p);
  const settleVoxels = ease(0.92, 0.972, p);
  const simplifyMark = ease(0.915, 0.985, p);
  const dock = ease(0.925, 0.997, p);
  // Start intimate, then retain enough scale for the details to read once all
  // six sides are present. The former 0.58 endpoint felt like a thumbnail.
  const netScale = mix(1.11, 0.70, ease(0.02, 0.22, p));
  const baseScale = mix(netScale, 1.08, fold) * (1 + cubeHold * 0.12);
  const responsive = Math.min(1, camera.aspect / 0.98);
  const logoScale = (innerWidth < 700 ? 0.18 : 0.135) * responsive;
  const outsideScale = baseScale * responsive;
  const finalScale = mix(mix(outsideScale, 1, inside), logoScale, dock);
  root.visible = introSquare > 0.001;
  root.scale.setScalar(finalScale * mix(0.82, 1, introSquare));
  const viewH = 2 * 10.4 * Math.tan(THREE.MathUtils.degToRad(35 * 0.5));
  const viewW = viewH * camera.aspect;
  const dockX = -viewW * 0.5 + (innerWidth < 700 ? 0.62 : 0.72);
  const dockY = viewH * 0.5 - (innerWidth < 700 ? 0.62 : 0.72);
  const outsideX = -1.25 * growth[1] * (1 - fold) * baseScale;
  const outsideY = (reduced ? 0 : Math.sin(clock.elapsedTime * 0.7) * 0.025) * (1 - fold * 0.6);
  root.position.x = mix(mix(outsideX, 0, inside), dockX, dock);
  root.position.y = mix(mix(outsideY, 0, inside), dockY, dock) + mix(5.4, 0, introSquare);
  const outsideRX = fold * 0.12 + pointer.y * 0.018 * cubeHold + dragPitch * fold * (1 - inside);
  const outsideRY = -0.025 + fold * 0.24 + showcase * 0.45 + pointer.x * 0.024 * cubeHold + dragYaw * fold * (1 - inside);
  root.rotation.set(mix(outsideRX * (1 - inside), 0, dock), mix(outsideRY * (1 - inside), 0, dock), mix(Math.sin(ease(0.28, 0.50, p) * Math.PI) * 0.032 * (1 - inside), 0, dock));

  // One face becomes a door, then closes before the object voxelizes.
  panels[0].position.x += door * 2.85;

  // Scroll-authored camera choreography with long readable holds on each wall.
  const yaw = 1.06 * ease(0.555, 0.59, p) - 2.12 * ease(0.60, 0.645, p) + 1.06 * ease(0.655, 0.69, p);
  const pitch = 0.96 * ease(0.655, 0.68, p) - 1.92 * ease(0.685, 0.71, p) + 0.96 * ease(0.71, 0.735, p);
  camera.position.set(pointer.x * 0.025 * interiorVisible, pointer.y * 0.018 * interiorVisible, mix(mix(10.4, 0, enter), 10.4, exit));
  camera.rotation.order = "YXZ";
  camera.rotation.set(
    (pitch + dragPitch * 1.25 + pointer.y * 0.10) * interiorVisible,
    (yaw + dragYaw * 1.25 + pointer.x * 0.12) * interiorVisible,
    0
  );
  camera.fov = mix(mix(35, 76, enter), 35, exit);
  camera.updateProjectionMatrix();
  for (let i = 0; i < 6; i++) {
    const handoff = ease(0.790 + i * 0.002, 0.842 + i * 0.002, p);
    uniforms[i].uBreak.value = chaos * 0.92;
    uniforms[i].uOutline.value = edgeOrder * 1.12;
    uniforms[i].uPanelFade.value = handoff;
    uniforms[i].uSettle.value = settleVoxels;
    panels[i].children[0].visible = handoff < 0.999;
    chips[i].visible = voxelize > 0.001 && settleVoxels < 0.999;
  }
  for (const label of disciplineLabels) {
    const alpha = growth[label.face] * (1 - ease(0.73, 0.79, p));
    label.group.visible = alpha > 0.001;
    for (const material of label.materials) material.opacity = alpha;
  }
  for (const image of imageFaces) {
    // Eye remains source-opaque. MRI fades in only after its hinged panel has
    // meaningful width, preventing its black field from reading as an eye border.
    const sourceAlpha = image.face === 1 ? ease(0.68, 0.96, growth[image.face]) : growth[image.face] > 0.001 ? 1 : 0;
    const alpha = sourceAlpha * (1 - ease(0.48, 0.56, p));
    image.mesh.visible = alpha > 0.001;
    image.material.opacity = alpha;
  }
  for (const label of mriLabels) {
    const alpha = growth[1] * (1 - ease(0.48, 0.56, p));
    label.mesh.visible = alpha > 0.001;
    label.material.opacity = alpha;
  }
  for (const interior of interiorFaces) {
    const alpha = interiorVisible;
    interior.mesh.visible = alpha > 0.001;
    interior.material.uniforms.opacity.value = alpha;
    if (alpha > 0.08 && interior.video.paused && interior.video.readyState >= 2) interior.video.play().catch(() => {});
  }
  for (const label of interiorWallLabels) {
    label.group.visible = interiorVisible > 0.001;
    label.material.opacity = interiorVisible * 0.92;
  }
  const contextT = clamp((p - 0.535) / 0.205, 0, 0.999);
  const chapterIndex = Math.min(4, Math.floor(contextT * 5));
  if (interiorContext.dataset.chapter !== String(chapterIndex)) {
    interiorContext.dataset.chapter = String(chapterIndex);
    interiorContextIndex.textContent = interiorChapters[chapterIndex][0];
    interiorContextTitle.textContent = interiorChapters[chapterIndex][1];
    interiorContextDetail.textContent = interiorChapters[chapterIndex][2];
  }
  interiorContext.style.opacity = interiorVisible;
  interiorContext.style.transform = `translateY(${(1 - interiorVisible) * 8}px)`;
  interiorContext.setAttribute("aria-hidden", interiorVisible < 0.2 ? "true" : "false");

  const logoAlpha = ease(0.885, 0.94, p);
  const innerSignalAlpha = ease(0.89, 0.92, p) * (1 - ease(0.952, 0.982, p));
  logoMark.visible = logoAlpha > 0.001;
  logoMark.scale.set(1, 1, mix(1, 0.035, simplifyMark));
  logoEdges.material.opacity = logoAlpha;
  logoInk.opacity = logoAlpha;
  innerSignal.visible = innerSignalAlpha > 0.001;
  innerSignalMaterial.opacity = innerSignalAlpha * 0.72;
  const intro = ease(0.972, 1, p);
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
  introProgress = damp(introProgress, introTarget, 5.2, dt);
  awake = damp(awake, active ? 1 : 0, 4, dt);
  dragPitch = damp(dragPitch, dragPitchTarget, 7, dt);
  dragYaw = damp(dragYaw, dragYawTarget, 7, dt);
  const onCanvas = pointerTarget.x < 2;
  pointer.lerp(onCanvas ? pointerTarget : centeredPointer, 1 - Math.exp(-5 * dt));
  cursorScreen.lerp(cursorScreenTarget, 1 - Math.exp(-18 * dt));
  sceneCursor.style.transform = `translate3d(${cursorScreen.x}px, ${cursorScreen.y}px, 0) translate(-50%, -50%)`;
  pose(progress);
  scene.updateMatrixWorld(true);
  updateIntroCopy(introProgress, progress, dt);
  pickFace();
  document.body.classList.toggle("over-cube", hover >= 0);
  document.body.classList.toggle("dragging", dragging);
  document.body.classList.toggle("cursor-down", held && !dragging);
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
    u.uMode.value = damp(u.uMode.value, colorTargets[i].mode, 4, dt);
    u.uGaze.value.copy(pointer);
    pulses[i] *= Math.exp(-1.8 * dt);
    u.uPulse.value = pulses[i];
    u.uBlink.value = blink;
    u.uAwake.value = awake;
  }
  background.uniforms.time.value = reduced ? 0 : time;
  background.uniforms.intro.value = introProgress;
  background.uniforms.progress.value = progress;
  background.uniforms.mouse.value.copy(pointer);
  if (rainCount > 0) {
    interiorRain.visible = rainAmount > 0.002;
    rainMaterial.opacity = rainAmount * 0.42;
    if (interiorRain.visible) {
      for (let i = 0; i < rainCount; i++) {
        const j = i * 6;
        let y = rainPositions[j + 1] - rainSpeed[i] * dt;
        if (y < -1.34) y += 2.68;
        const length = rainPositions[j + 1] - rainPositions[j + 4];
        const wind = Math.sin(time * 0.42 + rainPhase[i]) * 0.025;
        const x = rainBaseX[i] + wind;
        rainPositions[j] = x;
        rainPositions[j + 1] = y;
        rainPositions[j + 3] = x + length * 0.11;
        rainPositions[j + 4] = y - length;
      }
      rainGeometry.attributes.position.needsUpdate = true;
    }
  }
  lightningGroup.visible = !reduced && lightningDraw > 0.002 && progress < 0.81;
  lightningCoreMaterial.opacity = lightningAmount > 0.01 ? 0.98 : lightningDraw * (1 - ease(0.792, 0.81, progress)) * 0.72;
  lightningAuraMaterial.opacity = lightningAmount * 0.28 + lightningCoreMaterial.opacity * 0.10;
  if (lightningGroup.visible) {
    const reveal = lightningDraw * lightningSegments.length;
    for (const segment of lightningSegments) {
      const segmentT = ease(segment.order, segment.order + 1, reveal);
      segment.core.visible = segment.aura.visible = segmentT > 0.002;
      segment.core.scale.y = segment.length * Math.max(0.001, segmentT);
      segment.aura.scale.y = segment.length * Math.max(0.001, segmentT);
    }
  }
  scrollVelocity *= Math.exp(-5 * dt);
  finish.uniforms.time.value = reduced ? 0 : time;
  finish.uniforms.velocity.value = reduced ? 0 : scrollVelocity;
  finish.uniforms.progress.value = progress;
  finish.uniforms.lightning.value = reduced ? 0 : lightningAmount;
  composer.render();
  requestAnimationFrame(animate);
}
animate();
