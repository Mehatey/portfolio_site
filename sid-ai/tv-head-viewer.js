import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {UltraHDRLoader} from 'three/addons/loaders/UltraHDRLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';

const $=s=>document.querySelector(s),canvas=$('#stage'),loader=$('#loader'),captions=$('#captions'),voicePersona=$('#voice-persona');
let qualityScale=1,reflectionStride=4,dprCeiling=1;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.45));renderer.setSize(innerWidth,innerHeight,false);renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=null;scene.fog=new THREE.FogExp2(0x050a12,.030);
const camera=new THREE.PerspectiveCamera(36,innerWidth/innerHeight,.1,90);camera.position.set(7.15,2.55,10.1);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.055;controls.target.set(1.55,.55,0);controls.enablePan=false;controls.rotateSpeed=.62;
// The camera may circle the character freely, but never drop to or below the
// board plane. Losing the ground is what made the relics look like they fell
// through nothing.
controls.minPolarAngle=Math.PI*.20;controls.maxPolarAngle=Math.PI*.455;

// The composition is framed from the subject, not from a fixed camera position.
// Portrait viewports get a wider lens, a longer dolly and a lower look-at point,
// so the character sits in the upper band with the notes panel clear beneath it.
const FRAME={target:new THREE.Vector3(1.47,.52,0),dir:new THREE.Vector3(5.6,2.0,10.1).normalize()};
function frameCamera(){
 const aspect=innerWidth/innerHeight,portrait=aspect<1.05;
 camera.aspect=aspect;camera.fov=portrait?42:36;
 const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);
 const halfH=portrait?4.50:3.55,halfW=portrait?2.55:3.90,margin=portrait?1.15:1.06;
 const distance=Math.max(halfH/tan,halfW/(tan*aspect))*margin;
 const look=FRAME.target.clone();look.y-=portrait?.78:0;
 const heading=camera.position.clone().sub(controls.target);
 const direction=heading.lengthSq()>.01?heading.normalize():FRAME.dir.clone();
 controls.target.copy(look);camera.position.copy(look).addScaledVector(direction,distance);
 controls.minDistance=distance*.78;controls.maxDistance=distance*1.34;
 camera.updateProjectionMatrix();controls.update();
}
frameCamera();

const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.03).texture;
// The HDR is a bright daylight sky. At full strength it bleached every solid
// surface toward pale sage. The glass keeps its own reflection probe, so
// dialling the scene environment down only affects the matte materials.
scene.environmentIntensity=.34;
new UltraHDRLoader().load('./assets/royal_esplanade_2k.hdr.jpg',t=>{t.mapping=THREE.EquirectangularReflectionMapping;scene.environment=pmrem.fromEquirectangular(t).texture;t.dispose()});

// A private animated light world, visible only to the head's reflection camera.
// It gives the glass a living surface without adding more objects to the composition.
const reflectionUniforms={uTime:{value:0},uPointer:{value:new THREE.Vector2()},uReveal:{value:0},uPulse:{value:0}};
const reflectionTarget=new THREE.WebGLCubeRenderTarget(256,{type:THREE.HalfFloatType,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
reflectionTarget.texture.colorSpace=THREE.LinearSRGBColorSpace;
const reflectionCamera=new THREE.CubeCamera(.1,40,reflectionTarget);reflectionCamera.position.set(1.62,2.25,0);reflectionCamera.layers.set(1);scene.add(reflectionCamera);
const reflectionWorld=new THREE.Mesh(new THREE.SphereGeometry(18,32,18),new THREE.ShaderMaterial({
 side:THREE.BackSide,toneMapped:false,depthWrite:false,uniforms:reflectionUniforms,
 vertexShader:`varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`precision highp float;varying vec3 vDir;uniform float uTime,uReveal,uPulse;uniform vec2 uPointer;
 float band(float x,float c,float w){return exp(-pow((x-c)/w,2.));}
 void main(){vec3 d=normalize(vDir);float t=uTime*.012;float yaw=atan(d.z,d.x)+t+uPointer.x*.12;float lift=d.y+uPointer.y*.035;
  float pearl=band(sin(yaw*1.35+lift*2.1),.12,.30);float cyan=band(sin(yaw*2.05-lift*3.4),-.18,.20);float ember=band(cos(yaw*.82+lift*4.2),.48,.15);
  float sweep=band(sin(yaw*3.1+t*2.7+lift),.72,.07)*(1.-abs(lift));
  vec3 c=vec3(.010,.017,.028);c+=pearl*vec3(.82,.80,.76);c+=cyan*vec3(.03,.34,.62);c+=ember*vec3(.58,.12,.03);c+=sweep*vec3(.09,.36,.56)*(1.+uReveal*.18);
  gl_FragColor=vec4(c,1.);}`
}));reflectionWorld.position.copy(reflectionCamera.position);reflectionWorld.layers.set(1);scene.add(reflectionWorld);

// The pigment field is the sky, not an overlay. It lives inside the scene on a
// far sphere, so the cube occludes it, it parallaxes when you orbit, and paint
// can never land on top of the character.
const paintCanvas=document.querySelector('#watercolour-bg');
const paintTexture=new THREE.CanvasTexture(paintCanvas);
paintTexture.wrapS=THREE.MirroredRepeatWrapping;paintTexture.wrapT=THREE.ClampToEdgeWrapping;
paintTexture.minFilter=THREE.LinearFilter;paintTexture.magFilter=THREE.LinearFilter;
paintTexture.generateMipmaps=false;paintTexture.colorSpace=THREE.SRGBColorSpace;
const SKY_REPEAT_X=2.2,SKY_REPEAT_Y=1.15;
// The sheet is nearly white paper. Dividing by the paper colour is what makes
// an untouched sky read as black instead of mid grey.
const skyUniforms={
 uPaint:{value:paintTexture},
 uPaper:{value:new THREE.Vector3(.973,.965,.948)},
 uWash:{value:1.05},uField:{value:1.15},uTime:{value:0},
 uTint:{value:new THREE.Color(0x0a1421)},uInvert:{value:0},uStorm:{value:0}
};
paintTexture.colorSpace=THREE.NoColorSpace;
const sky=new THREE.Mesh(new THREE.SphereGeometry(52,48,32),new THREE.ShaderMaterial({
 side:THREE.BackSide,depthWrite:false,toneMapped:false,fog:false,uniforms:skyUniforms,
 vertexShader:`varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`precision highp float;varying vec3 vDir;
 uniform sampler2D uPaint;uniform vec3 uPaper,uTint;uniform float uWash,uField,uTime,uInvert,uStorm;
 float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
 float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.07+3.1;a*=.5;}return s;}
 void main(){
  vec3 d=normalize(vDir);
  float yaw=atan(d.x,d.z),pitch=asin(clamp(d.y,-1.,1.));
  // A painted sky that is always there, slowly breathing, in world space.
  vec2 q=vec2(yaw*1.05,pitch*1.75);
  float drift=uTime*.006;
  float w1=fbm(q*1.15+vec2(drift,0.));
  float w2=fbm(q*2.4+vec2(w1*1.5,-drift*.7));
  float pool=smoothstep(.30,.86,fbm(q*.62+vec2(w2*.9,drift*.4)));
  vec3 teal=vec3(.05,.46,.66),plum=vec3(.40,.10,.42),ember=vec3(.92,.38,.09),ultra=vec3(.13,.16,.62);
  vec3 field=mix(mix(teal,ultra,smoothstep(.30,.78,w1)),mix(ember,plum,smoothstep(.24,.80,w2)),smoothstep(.18,.82,pool));
  field*=pool*(.30+w1*.55);
  // The live sheet on top: what the cursor and the clicks are actually painting.
  vec2 uv=vec2(yaw*0.15915494*${SKY_REPEAT_X.toFixed(3)},pitch*0.31830989*${SKY_REPEAT_Y.toFixed(3)}+.5);
  vec3 sheet=texture2D(uPaint,uv).rgb;
  vec3 wash=clamp(vec3(1.)-sheet/uPaper,0.,1.);
  wash=max(wash-.035,0.);
  // Keep the hue when several inks pile up, instead of blowing out to white.
  float amt=max(max(wash.r,wash.g),wash.b);
  wash=amt>.002?normalize(wash+vec3(.001))*pow(amt,1.15)*1.45:vec3(0.);
  float pole=1.-smoothstep(.55,.96,abs(d.y));
  float horizon=smoothstep(-.55,.70,d.y);
  // A dark band along the character's eyeline, so the cube always has contrast
  // behind it no matter which way you orbit.
  float band=1.-exp(-d.y*d.y*11.);
  float quiet=.18+.82*band;
  vec3 base=mix(uTint*.80,uTint*.14,horizon);
  vec3 c=base+field*uField*(.55+pole*.45)*quiet+min(wash,vec3(.9))*uWash*pole*quiet;
  c+=uStorm*vec3(.02,.05,.09)*(1.-horizon);
  c=mix(c,vec3(1.)-c,uInvert);
  gl_FragColor=vec4(c,1.);}`
}));
sky.renderOrder=-100;scene.add(sky);
// Sky coordinates for the cursor, so pigment lands where you are actually
// pointing in the world rather than where the pixel is on the screen.
const skyUv=new THREE.Vector2();
function pointerSkyUv(){
 ray.setFromCamera(pointer,camera);
 const d=ray.ray.direction;
 const yaw=Math.atan2(d.x,d.z),pitch=Math.asin(THREE.MathUtils.clamp(d.y,-1,1));
 let u=yaw/(Math.PI*2)*SKY_REPEAT_X;u-=Math.floor(u);
 const v=THREE.MathUtils.clamp(pitch/Math.PI*SKY_REPEAT_Y+.5,.03,.97);
 return skyUv.set(u,v);
}
const backdropUniforms={uTime:{value:0},uPointer:{value:new THREE.Vector2(.5,.5)},uReveal:{value:0},uPulse:{value:0},uAspect:{value:innerWidth/innerHeight},uGrade:{value:0},uKaleido:{value:0},uEcho:{value:0},uCosmicBurst:{value:0},uDropA:{value:new THREE.Vector4(0,0,0,0)},uDropB:{value:new THREE.Vector4(0,0,0,0)},uDropC:{value:new THREE.Vector4(0,0,0,0)},uDropD:{value:new THREE.Vector4(0,0,0,0)}};
const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(40,24),new THREE.ShaderMaterial({depthWrite:false,toneMapped:false,uniforms:backdropUniforms,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
precision highp float;varying vec2 vUv;uniform float uTime,uReveal,uPulse,uAspect,uGrade,uKaleido,uEcho,uCosmicBurst;uniform vec2 uPointer;uniform vec4 uDropA,uDropB,uDropC,uDropD;
float n21(vec2 p){return fract(sin(dot(p,vec2(41.31,289.17)))*45758.53);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(n21(i),n21(i+vec2(1.,0.)),f.x),mix(n21(i+vec2(0.,1.)),n21(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=mat2(1.62,1.21,-1.21,1.62)*p+17.1;a*=.48;}return v;}
vec3 ink(float h){vec3 cyan=vec3(.04,.48,.62),turquoise=vec3(.03,.68,.57),coral=vec3(.92,.28,.20),gold=vec3(.94,.63,.20);return h<.25?mix(cyan,turquoise,h*4.):h<.5?mix(turquoise,gold,(h-.25)*4.):h<.75?mix(gold,coral,(h-.5)*4.):mix(coral,cyan,(h-.75)*4.);}
vec3 dropLayer(vec3 base,vec4 drop,vec2 uv,float textureNoise){float d=length((uv-drop.xy)*vec2(uAspect,1.));float warped=d+(textureNoise-.5)*.09;float organicEdge=uv.x+(fbm(vec2(uv.y*2.4,uTime*.014))-.5)*.42;float gate=smoothstep(.08,.58,organicEdge);float body=smoothstep(.28,.035,warped)*drop.w*gate;float rim=exp(-abs(warped-(.16+.035*textureNoise))*38.)*drop.w*gate;return mix(base,ink(drop.z)*(1.02+rim*.22),body*.46);}
void main(){float t=uTime;vec2 raw=vUv-.5,p=raw;p.x*=uAspect;vec2 m=uPointer-.5;m.x*=uAspect;float md=length(p-m);vec2 flow=p;
 float pointerCurl=exp(-md*md*7.);flow+=vec2(-(p-m).y,(p-m).x)*pointerCurl*(.10+.055*sin(t*.7));
 float q=fbm(flow*1.55+vec2(t*.018,-t*.012));float r=fbm(flow*2.20+vec2(q*1.4,-q*.9)-vec2(t*.012,t*.008));float wash=smoothstep(.27,.83,fbm(flow*.92+vec2(r*1.7,t*.007)));
 float organicEdge=vUv.x+(fbm(vec2(vUv.y*2.15+t*.006,t*.012))-.5)*.48+.055*sin(vUv.y*8.+t*.035);float right=smoothstep(.04,.72,organicEdge);float quietCorner=1.-exp(-length((vUv-vec2(.10,.90))*vec2(1.35,1.))*5.2);right*=mix(.24,1.,quietCorner);float breathing=.86+.14*sin(t*.16+r*3.);float amount=right*wash*breathing;
 vec3 paper=vec3(.006,.009,.012);vec3 washA=mix(vec3(.018,.16,.20),vec3(.02,.38,.34),q);vec3 washB=mix(vec3(.82,.24,.15),vec3(.92,.58,.20),r);vec3 pigment=mix(washA,washB,smoothstep(.56,.78,r+uGrade*.08));pigment*=.94+.11*noise(flow*34.+q*5.);
 vec3 c=mix(paper,pigment,amount*.72);float wetEdge=smoothstep(.05,0.,abs(wash-.52))*right;c+=wetEdge*mix(vec3(.06,.62,.64),vec3(.98,.42,.22),r)*.16;c+=pointerCurl*right*vec3(.05,.24,.23)*(.12+uReveal*.22);
 c=dropLayer(c,uDropA,vUv,r);c=dropLayer(c,uDropB,vUv,q);c=dropLayer(c,uDropC,vUv,r);c=dropLayer(c,uDropD,vUv,q);
 float grain=n21(vUv*vec2(1700.,1100.)+t*.002)-.5;c+=grain*.008;gl_FragColor=vec4(c,1.);}
`}));backdrop.position.set(0,3,-9);backdrop.visible=false;scene.add(backdrop);

const floorMaterial=new THREE.MeshPhysicalMaterial({color:0x060c14,roughness:.26,metalness:.52,envMapIntensity:.65,transparent:true});
// The plane reads as ground, not as a slab: it fades out long before its own
// edge could enter frame at any aspect ratio.
const floorWet={value:0},floorTime={value:0};
floorMaterial.onBeforeCompile=s=>{s.uniforms.uWet=floorWet;s.uniforms.uWetTime=floorTime;s.vertexShader=`varying vec3 vFloorWorld;\n${s.vertexShader}`.replace('#include <begin_vertex>','#include <begin_vertex>\nvFloorWorld=(modelMatrix*vec4(transformed,1.)).xyz;');s.fragmentShader=`uniform float uWet,uWetTime;varying vec3 vFloorWorld;\n${s.fragmentShader}`.replace('#include <dithering_fragment>','float floorReach=length(vFloorWorld.xz-vec2(1.55,0.));gl_FragColor.a*=1.-smoothstep(13.,46.,floorReach);\nfloat ripple=sin(floorReach*3.6-uWetTime*2.1)*.5+.5;\nfloat ripple2=sin((vFloorWorld.x*1.7+vFloorWorld.z*2.3)-uWetTime*1.4)*.5+.5;\nfloat sheen=uWet*(ripple*.6+ripple2*.4)*(1.-smoothstep(2.,16.,floorReach));\ngl_FragColor.rgb+=sheen*vec3(.05,.13,.22)+uWet*.02*vec3(.1,.2,.3);\n#include <dithering_fragment>')};floorMaterial.customProgramCacheKey=()=>`ground-falloff-v2`;
const floor=new THREE.Mesh(new THREE.PlaneGeometry(150,150),floorMaterial);floor.rotation.x=-Math.PI/2;floor.position.y=-1.968;floor.receiveShadow=true;scene.add(floor);
// The board is a real surface. GROUND_Y is the one height every relic lands on,
// and BOARD_REACH is how far out a relic can rest without leaving the plate.
const GROUND_Y=-1.948,BOARD_CENTRE=new THREE.Vector2(1.55,0),BOARD_REACH=3.34,PLINTH_KEEPOUT=1.62;
const techBase=new THREE.Group(),basePulse=[];
const board=new THREE.Mesh(new THREE.CircleGeometry(4.45,6),new THREE.MeshPhysicalMaterial({color:0x07151b,metalness:.72,roughness:.21,clearcoat:.62,clearcoatRoughness:.20,transparent:true,opacity:.52,envMapIntensity:.95}));board.rotation.x=-Math.PI/2;board.position.set(1.55,-1.952,0);board.receiveShadow=true;techBase.add(board);
const boardEdge=new THREE.LineSegments(new THREE.EdgesGeometry(board.geometry),new THREE.LineBasicMaterial({color:0x4ac7c0,transparent:true,opacity:.30,blending:THREE.AdditiveBlending}));boardEdge.rotation.copy(board.rotation);boardEdge.position.copy(board.position);techBase.add(boardEdge);
const circuitUniforms={uTime:{value:0},uEnergy:{value:0}};
const circuitLayer=new THREE.Mesh(new THREE.CircleGeometry(4.36,6),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:circuitUniforms,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`precision highp float;varying vec2 vUv;uniform float uTime,uEnergy;float line(float v,float w){return 1.-smoothstep(w,w+fwidth(v),abs(v));}void main(){vec2 p=vUv-.5;float laneA=line(fract((p.x+.5)*7.)-.5,.035)*step(.06,abs(p.y));float laneB=line(fract((p.y+.5)*6.)-.5,.035)*step(.08,abs(p.x));float mask=step(.30,fract(floor((p.y+.5)*6.)*.37+floor((p.x+.5)*7.)*.61));float traces=(laneA+laneB)*mask*.12;float flow=pow(max(0.,sin((p.x*7.+p.y*4.)*6.-uTime*2.2)),26.)*(laneA+laneB);float node=pow(max(0.,1.-length(fract((p+.5)*vec2(7.,6.))-.5)*3.4),9.);vec3 c=traces*vec3(.07,.28,.27)+flow*mix(vec3(.13,.82,.70),vec3(.86,.21,.06),uEnergy)+node*.07*vec3(.10,.42,.40);gl_FragColor=vec4(c,clamp(traces+flow*.62+node*.05,0.,.46));}`}));circuitLayer.rotation.x=-Math.PI/2;circuitLayer.position.set(1.55,-1.944,0);techBase.add(circuitLayer);
const traceCyan=new THREE.MeshPhysicalMaterial({color:0x143f43,emissive:0x39d9cf,emissiveIntensity:.48,metalness:.62,roughness:.22}),traceAmber=new THREE.MeshPhysicalMaterial({color:0x4a2915,emissive:0xff7a35,emissiveIntensity:.32,metalness:.68,roughness:.23});
function applyRunningCurrent(m,offset=0){const current={value:0},phase={value:offset};m.userData.current=current;m.material.onBeforeCompile=s=>{s.uniforms.uCurrentTime=current;s.uniforms.uCurrentPhase=phase;s.vertexShader=`varying vec2 vTraceUv;\n${s.vertexShader}`.replace('#include <uv_vertex>','#include <uv_vertex>\nvTraceUv=uv;');s.fragmentShader=`uniform float uCurrentTime,uCurrentPhase;varying vec2 vTraceUv;\n${s.fragmentShader}`.replace('#include <dithering_fragment>','float currentHead=exp(-pow((fract(vTraceUv.x-uCurrentTime*.24+uCurrentPhase)-.5)/.075,2.));gl_FragColor.rgb+=currentHead*vec3(.40,.85,.88)*1.45;\n#include <dithering_fragment>')};m.material.customProgramCacheKey=()=>`running-current-${m.name}`;m.material.needsUpdate=true}
function baseTrace(name,points,material,radius=.018){const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');const m=new THREE.Mesh(new THREE.TubeGeometry(curve,48,radius,7,false),material.clone());m.name=name;m.castShadow=true;applyRunningCurrent(m,basePulse.length*.23);basePulse.push(m);techBase.add(m);return m}
const by=-1.945;
baseTrace('BASE_TRACE_A',[new THREE.Vector3(.25,by,.72),new THREE.Vector3(.78,by,.72),new THREE.Vector3(1.02,by,.28),new THREE.Vector3(1.55,by,.28)],traceCyan);
baseTrace('BASE_TRACE_B',[new THREE.Vector3(2.86,by,.68),new THREE.Vector3(2.34,by,.68),new THREE.Vector3(2.12,by,.24),new THREE.Vector3(1.55,by,.24)],traceCyan);
baseTrace('BASE_TRACE_C',[new THREE.Vector3(-.10,by,-.54),new THREE.Vector3(.58,by,-.54),new THREE.Vector3(.92,by,-.13),new THREE.Vector3(1.55,by,-.13)],traceAmber);
baseTrace('BASE_TRACE_D',[new THREE.Vector3(3.22,by,-.56),new THREE.Vector3(2.56,by,-.56),new THREE.Vector3(2.18,by,-.13),new THREE.Vector3(1.55,by,-.13)],traceAmber);
const padMaterial=new THREE.MeshPhysicalMaterial({color:0x16272b,emissive:0x67fff1,emissiveIntensity:.8,metalness:.78,roughness:.16});
for(const [x,z] of [[.02,1.02],[3.14,.96],[-.34,-.82],[3.48,-.86]]){const pad=new THREE.Mesh(new THREE.CylinderGeometry(.10,.13,.055,24),padMaterial.clone());pad.position.set(x,-1.92,z);pad.castShadow=true;techBase.add(pad);basePulse.push(pad)}
const cableMaterial=new THREE.MeshPhysicalMaterial({color:0x17191d,metalness:.74,roughness:.26,clearcoat:.45,clearcoatRoughness:.18});
baseTrace('GROUND_CABLE_L',[new THREE.Vector3(.72,-1.72,.52),new THREE.Vector3(.48,-1.80,.72),new THREE.Vector3(.22,-1.88,.90),new THREE.Vector3(.02,-1.91,1.02)],cableMaterial,.035);
baseTrace('GROUND_CABLE_R',[new THREE.Vector3(2.42,-1.72,.50),new THREE.Vector3(2.70,-1.80,.68),new THREE.Vector3(2.96,-1.88,.86),new THREE.Vector3(3.14,-1.91,.96)],cableMaterial,.035);
techBase.visible=false;scene.add(techBase);

// Sleeved arms complete the torso silhouette and physically terminate at the board.
const bodyAdditions=new THREE.Group();bodyAdditions.visible=false;scene.add(bodyAdditions);
const sleeveMaterial=new THREE.MeshPhysicalMaterial({color:0x11232c,metalness:.025,roughness:.80,sheen:.60,sheenColor:new THREE.Color(0x496d7c),sheenRoughness:.70,clearcoat:.03,clearcoatRoughness:.82,envMapIntensity:.44}),cuffMaterial=new THREE.MeshPhysicalMaterial({color:0x13282d,emissive:0x37c9bc,emissiveIntensity:.12,metalness:.64,roughness:.24});
function limbBetween(a,b,r,material){const d=b.clone().sub(a),mesh=new THREE.Mesh(new THREE.CapsuleGeometry(r,Math.max(.01,d.length()-r*2),8,20),material);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());mesh.castShadow=true;bodyAdditions.add(mesh);return mesh}
for(const side of [-1,1]){const shoulder=new THREE.Vector3(1.58+side*.71,-.68,.02),elbow=new THREE.Vector3(1.58+side*.84,-1.18,.14),wrist=new THREE.Vector3(1.58+side*.69,-1.72,.31);limbBetween(shoulder,elbow,.165,sleeveMaterial);limbBetween(elbow,wrist,.135,sleeveMaterial);const joint=new THREE.Mesh(new THREE.SphereGeometry(.165,24,16),sleeveMaterial);joint.position.copy(elbow);joint.castShadow=true;bodyAdditions.add(joint);const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.145,.13,.16,24),cuffMaterial.clone());cuff.position.copy(wrist);cuff.rotation.z=side*.08;cuff.castShadow=true;bodyAdditions.add(cuff)}

// A compact instrument plinth replaces the robot torso. Three controls are
// materially distinct and drive full-scene states: prism, echo, portal.
const plinth=new THREE.Group();plinth.position.set(3.05,-1.66,.52);scene.add(plinth);
const plinthBody=new THREE.Mesh(new THREE.CylinderGeometry(1.38,1.50,.25,64),new THREE.MeshPhysicalMaterial({color:0x05070b,metalness:.86,roughness:.15,clearcoat:1,clearcoatRoughness:.035,envMapIntensity:1.8}));plinthBody.scale.z=.58;plinthBody.castShadow=true;plinthBody.receiveShadow=true;plinthBody.visible=false;plinth.add(plinthBody);
const plinthHalo=new THREE.Mesh(new THREE.TorusGeometry(1.18,.018,12,96),new THREE.MeshBasicMaterial({color:0x9de9ff,transparent:true,opacity:.34,blending:THREE.AdditiveBlending,toneMapped:false}));plinthHalo.visible=false;plinth.add(plinthHalo);
const stem=new THREE.Mesh(new THREE.CylinderGeometry(.28,.34,.55,48),new THREE.MeshPhysicalMaterial({color:0x080a0f,metalness:.8,roughness:.16,clearcoat:1,envMapIntensity:1.9}));stem.position.y=.38;stem.castShadow=true;stem.visible=false;plinth.add(stem);
const controlRail=new THREE.Mesh(new THREE.CapsuleGeometry(.17,1.16,10,32),new THREE.MeshPhysicalMaterial({color:0x080b10,metalness:.86,roughness:.14,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1.8}));controlRail.rotation.z=Math.PI/2;controlRail.castShadow=true;plinth.add(controlRail);
const magicButtons=[],buttonGroup=new THREE.Group();buttonGroup.position.set(0,.02,.18);buttonGroup.scale.setScalar(1.12);plinth.add(buttonGroup);
const buttonColors=[0x9eeaff,0xffc17c,0xd9adff];
for(let i=0;i<3;i++){
 const g=new THREE.Group();g.position.x=(i-1)*.48;g.rotation.x=-.34;
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.16,.18,.075,40),new THREE.MeshPhysicalMaterial({color:0x080a10,metalness:.94,roughness:.09,clearcoat:1,clearcoatRoughness:.025,envMapIntensity:2.1}));base.rotation.x=Math.PI/2;
 const lens=new THREE.Mesh(new THREE.CylinderGeometry(.112,.112,.083,40),new THREE.MeshPhysicalMaterial({color:0x17222d,emissive:buttonColors[i],emissiveIntensity:.20,metalness:.52,roughness:.12,transmission:.42,thickness:.15,clearcoat:1}));lens.rotation.x=Math.PI/2;lens.position.z=.018;lens.name=`MAGIC_BUTTON_${i}`;lens.userData.index=i;
 const iconMaterial=new THREE.MeshBasicMaterial({color:buttonColors[i],transparent:true,opacity:.72,blending:THREE.AdditiveBlending,toneMapped:false});let icon;
 if(i===0)icon=new THREE.Mesh(new THREE.ConeGeometry(.065,.105,3),iconMaterial);
 if(i===1)icon=new THREE.Mesh(new THREE.TorusGeometry(.062,.012,8,32),iconMaterial);
 if(i===2)icon=new THREE.Mesh(new THREE.OctahedronGeometry(.065,0),iconMaterial);
 icon.rotation.x=Math.PI/2;icon.position.set(0,-.055,.09);g.add(base,lens,icon);buttonGroup.add(g);magicButtons.push(lens)
}
plinth.visible=false;

// Soft human bust: silhouette first, technology second. The lower edge falls
// through the floor, avoiding a cropped mannequin or floating robot torso.
const bustGroup=new THREE.Group();bustGroup.position.set(1.42,-1.26,0);bustGroup.rotation.y=.025;scene.add(bustGroup);
const garmentMaterial=new THREE.MeshPhysicalMaterial({color:0x12242f,roughness:.82,metalness:.01,sheen:.62,sheenColor:new THREE.Color(0x4d7488),sheenRoughness:.72,clearcoat:.02,clearcoatRoughness:.85,envMapIntensity:.42,transparent:false,opacity:1,emissive:0x050e14,emissiveIntensity:.12});
garmentMaterial.onBeforeCompile=s=>{s.vertexShader=`varying vec3 vGarmentWorld;\n${s.vertexShader}`.replace('#include <begin_vertex>','#include <begin_vertex>\nvGarmentWorld=(modelMatrix*vec4(transformed,1.)).xyz;');s.fragmentShader=`varying vec3 vGarmentWorld;\n${s.fragmentShader}`.replace('#include <dithering_fragment>','float weave=.965+.035*sin(vGarmentWorld.x*118.)*sin(vGarmentWorld.y*146.);gl_FragColor.rgb*=weave;\n#include <dithering_fragment>')};garmentMaterial.customProgramCacheKey=()=>`soft-garment-v1`;
const shoulders=new THREE.Mesh(new THREE.SphereGeometry(1,72,36,0,Math.PI*2,0,Math.PI*.72),garmentMaterial);shoulders.scale.set(1.58,.85,.66);shoulders.position.y=-.05;shoulders.castShadow=true;bustGroup.add(shoulders);
const torso=new THREE.Mesh(new THREE.CylinderGeometry(.98,.80,1.15,72,1,false),garmentMaterial);torso.scale.z=.62;torso.position.y=-.72;torso.castShadow=true;bustGroup.add(torso);
const collar=new THREE.Mesh(new THREE.CylinderGeometry(.34,.43,.42,56),new THREE.MeshPhysicalMaterial({color:0x090c12,roughness:.24,metalness:.15,sheen:.8,sheenColor:new THREE.Color(0x668db3),clearcoat:.38}));collar.position.y=.48;collar.castShadow=true;bustGroup.add(collar);
shoulders.visible=false;torso.visible=false;collar.visible=false;
const bustShape=new THREE.Shape();bustShape.moveTo(-.59,-1.16);bustShape.lineTo(-.72,-.22);bustShape.bezierCurveTo(-.79,.20,-.70,.51,-.48,.62);bustShape.bezierCurveTo(-.36,.69,-.29,.73,-.24,.79);bustShape.lineTo(-.22,.98);bustShape.quadraticCurveTo(0,.86,.22,.98);bustShape.lineTo(.24,.79);bustShape.bezierCurveTo(.29,.73,.36,.69,.48,.62);bustShape.bezierCurveTo(.70,.51,.79,.20,.72,-.22);bustShape.lineTo(.59,-1.16);bustShape.closePath();
const garmentShell=new THREE.Mesh(new THREE.ExtrudeGeometry(bustShape,{depth:.52,steps:1,bevelEnabled:true,bevelSegments:10,bevelSize:.105,bevelThickness:.105,curveSegments:36}),garmentMaterial);garmentShell.position.set(0,0,-.26);garmentShell.scale.set(1.28,1.04,1);garmentShell.castShadow=true;garmentShell.receiveShadow=true;bustGroup.add(garmentShell);
const seamMaterial=new THREE.MeshBasicMaterial({color:0xcde8f7,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,toneMapped:false,depthWrite:false});
const garmentOutline=new THREE.LineSegments(new THREE.EdgesGeometry(garmentShell.geometry,38),seamMaterial);garmentOutline.position.copy(garmentShell.position);garmentOutline.scale.copy(garmentShell.scale);bustGroup.add(garmentOutline);
garmentShell.visible=false;garmentOutline.visible=false;
const bodyProfile=[[-1.15,.60],[-.96,.72],[-.68,.82],[-.32,.90],[.02,1.02],[.24,1.11],[.42,.88],[.53,.48]].map(([y,r])=>new THREE.Vector2(r,y));
const bodyShell=new THREE.Mesh(new THREE.LatheGeometry(bodyProfile,72),garmentMaterial);bodyShell.scale.z=.58;bodyShell.position.z=.10;bodyShell.castShadow=true;bodyShell.receiveShadow=true;bodyShell.visible=false;bustGroup.add(bodyShell);
for(const side of [-1,1]){
 const shoulderCap=new THREE.Mesh(new THREE.SphereGeometry(.34,40,24),garmentMaterial);shoulderCap.scale.set(.82,1,.72);shoulderCap.position.set(side*1.02,.30,.20);shoulderCap.castShadow=true;shoulderCap.visible=false;bustGroup.add(shoulderCap);
 const sleeve=new THREE.Mesh(new THREE.CapsuleGeometry(.22,.82,12,32),garmentMaterial);sleeve.position.set(side*1.18,-.34,.24);sleeve.rotation.z=side*.18;sleeve.rotation.x=-.08;sleeve.castShadow=true;sleeve.visible=false;bustGroup.add(sleeve)
}
const collarBand=new THREE.Mesh(new THREE.TorusGeometry(.29,.055,18,64),new THREE.MeshPhysicalMaterial({color:0x172332,roughness:.28,metalness:.08,sheen:1,sheenColor:new THREE.Color(0x8fb8d4)}));collarBand.rotation.x=Math.PI/2;collarBand.position.set(0,.87,.28);collarBand.scale.y=.72;collarBand.castShadow=true;collarBand.visible=false;bustGroup.add(collarBand);

// Torso hardware is one quiet breathing core, with cables physically routed
// into the floor board. It replaces the detached toy controls.
const chestCore=new THREE.Mesh(new THREE.IcosahedronGeometry(.18,2),new THREE.MeshPhysicalMaterial({color:0x153239,emissive:0x42d8cb,emissiveIntensity:.34,metalness:.55,roughness:.18,transmission:.22,thickness:.25,clearcoat:1,clearcoatRoughness:.08}));
chestCore.position.set(0,.740,1.00);chestCore.scale.set(.50,.38,.30);
const umbilicals=[];
function addUmbilical(points,radius,color){const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,64,radius,8,false),new THREE.MeshPhysicalMaterial({color,metalness:.68,roughness:.22,clearcoat:.55,clearcoatRoughness:.2,envMapIntensity:1.2}));tube.castShadow=true;scene.add(tube);umbilicals.push(tube)}
// Three lines leave the plinth's rear channel and terminate on the board pads.
addUmbilical([new THREE.Vector3(1.24,-1.06,-.44),new THREE.Vector3(.86,-1.46,-.66),new THREE.Vector3(.20,-1.80,-.80),new THREE.Vector3(-.34,-1.91,-.82)],.042,0x17272c);
addUmbilical([new THREE.Vector3(1.55,-1.02,-.50),new THREE.Vector3(1.58,-1.52,-.92),new THREE.Vector3(1.58,-1.84,-1.24),new THREE.Vector3(1.56,-1.91,-1.46)],.034,0x4a2518);
addUmbilical([new THREE.Vector3(1.86,-1.06,-.44),new THREE.Vector3(2.26,-1.46,-.64),new THREE.Vector3(2.94,-1.80,-.80),new THREE.Vector3(3.48,-1.91,-.86)],.042,0x17272c);

// A milled instrument plinth carries the cube. No shoulders, no garment: the
// character is a head on a machine, and the machine is turned, so every orbit
// angle including the back is a finished view.
const machinePlinth=new THREE.Group();machinePlinth.position.set(1.44,GROUND_Y,0);machinePlinth.rotation.y=Math.PI/6;scene.add(machinePlinth);
const BADGE_MOUNT_Y=.455;
const milled=new THREE.MeshPhysicalMaterial({color:0x0a141d,metalness:.92,roughness:.40,clearcoat:.28,clearcoatRoughness:.34,envMapIntensity:1.05});
const milledDark=new THREE.MeshPhysicalMaterial({color:0x04080e,metalness:.86,roughness:.52,envMapIntensity:.70});
const anodised=new THREE.MeshPhysicalMaterial({color:0x0d2733,metalness:.88,roughness:.26,clearcoat:.55,clearcoatRoughness:.18,envMapIntensity:1.35});
// The waist is milled, not decorated: fine horizontal grooves cut all the way
// round, opening into a denser cooling bank across the back.
const waistMaterial=milled.clone();
waistMaterial.onBeforeCompile=sh=>{
 sh.vertexShader=`varying vec3 vMill;\n${sh.vertexShader}`.replace('#include <begin_vertex>','#include <begin_vertex>\nvMill=transformed;');
 sh.fragmentShader=`varying vec3 vMill;\n${sh.fragmentShader}`.replace('#include <dithering_fragment>',
  'float millAngle=atan(vMill.x,vMill.z);float rear=smoothstep(1.75,2.45,abs(millAngle));'+
  'float pitch=mix(34.,72.,rear);float groove=abs(fract(vMill.y*pitch)-.5)*2.;'+
  'float cut=1.-smoothstep(.52,.88,groove);float band=smoothstep(-.06,.02,vMill.y)*smoothstep(.34,.26,vMill.y);'+
  'gl_FragColor.rgb*=1.-cut*(.34+rear*.30)*mix(.35,1.,band+rear);'+
  'gl_FragColor.rgb+=cut*rear*vec3(.010,.030,.034);\n#include <dithering_fragment>');
};
waistMaterial.customProgramCacheKey=()=>`milled-waist-v1`;
function plinthPart(geometry,y,material){const m=new THREE.Mesh(geometry,material);m.position.y=y;m.castShadow=true;m.receiveShadow=true;machinePlinth.add(m);return m}
plinthPart(new THREE.CylinderGeometry(1.12,1.20,.10,6),.050,milledDark);
plinthPart(new THREE.CylinderGeometry(1.06,1.12,.07,6),.135,milled);
plinthPart(new THREE.CylinderGeometry(.92,1.06,.50,6),.420,waistMaterial);
plinthPart(new THREE.CylinderGeometry(1.04,.92,.14,6),.740,milled);
plinthPart(new THREE.CylinderGeometry(1.26,1.06,.26,6),.940,milled);
// A closed annulus, so the cradle is a seat and not a bowl you can see into.
const cradleSeat=new THREE.MeshPhysicalMaterial({color:0x03060a,metalness:.55,roughness:.82,envMapIntensity:.28});
const cradleTop=new THREE.Mesh(new THREE.RingGeometry(1.02,1.255,6,1),cradleSeat);cradleTop.rotation.x=-Math.PI/2;cradleTop.rotation.z=Math.PI/6;cradleTop.position.y=1.070;cradleTop.receiveShadow=true;machinePlinth.add(cradleTop);
const trimGlow=new THREE.MeshBasicMaterial({color:0x4fd8cf,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,toneMapped:false});
const plinthRing=new THREE.Mesh(new THREE.TorusGeometry(1.295,.024,10,60),trimGlow);plinthRing.rotation.x=Math.PI/2;plinthRing.position.y=1.074;machinePlinth.add(plinthRing);
const seatRing=new THREE.Mesh(new THREE.TorusGeometry(1.085,.013,8,48),trimGlow.clone());seatRing.material.opacity=.05;seatRing.rotation.x=Math.PI/2;seatRing.position.y=.185;machinePlinth.add(seatRing);
// Trunnion pins: the cradle could tilt the head, so it reads as a mount.
for(const side of [-1,1]){const pin=new THREE.Mesh(new THREE.CylinderGeometry(.085,.095,.20,18),milled);pin.rotation.z=Math.PI/2;pin.position.set(side*1.24,.975,0);pin.castShadow=true;machinePlinth.add(pin);
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(.052,.052,.045,14),anodised);cap.rotation.z=Math.PI/2;cap.position.set(side*1.35,.975,0);machinePlinth.add(cap)}
// Rear cable channel: a recessed spine with three ferrules the umbilicals leave from.
const spine=new THREE.Mesh(new THREE.BoxGeometry(.40,.60,.13),milledDark);spine.position.set(0,.50,-1.00);spine.castShadow=true;machinePlinth.add(spine);
for(const [fx,fy] of [[-.13,.36],[0,.54],[.13,.36]]){
 const ferrule=new THREE.Mesh(new THREE.CylinderGeometry(.046,.056,.09,14),anodised);
 ferrule.rotation.x=Math.PI/2;ferrule.position.set(fx,fy,-1.07);machinePlinth.add(ferrule);
}
const rearPlate=new THREE.Mesh(new THREE.BoxGeometry(.60,.17,.025),anodised);rearPlate.position.set(0,.155,-1.05);machinePlinth.add(rearPlate);
for(let i=0;i<3;i++){const etch=new THREE.Mesh(new THREE.BoxGeometry(.36-i*.07,.010,.005),trimGlow);etch.position.set(0,.190-i*.030,-1.066);machinePlinth.add(etch)}
// Feet, so the plinth stands on the board rather than intersecting it.
for(let i=0;i<6;i++){const angle=i*Math.PI/3+Math.PI/6;const foot=new THREE.Mesh(new THREE.CylinderGeometry(.10,.13,.05,14),milledDark);foot.position.set(Math.sin(angle)*1.04,.0,Math.cos(angle)*1.04);foot.castShadow=true;machinePlinth.add(foot)}
// The angled front plate that carries the awards.
const badgePlate=new THREE.Mesh(new THREE.BoxGeometry(1.26,.42,.06),milled);badgePlate.position.set(0,BADGE_MOUNT_Y,.985);badgePlate.rotation.x=-.15;badgePlate.castShadow=true;machinePlinth.add(badgePlate);
machinePlinth.add(chestCore);

// Exact award artwork, mounted as enamel hardware rather than floating labels.
const awardBadges=[],awardBadgeMeshes=[],textureLoader=new THREE.TextureLoader();
function addAwardBadge(url,x,accent){
 const group=new THREE.Group(),back=new THREE.Mesh(new THREE.BoxGeometry(.56,.31,.055,3,3,2),new THREE.MeshPhysicalMaterial({color:0x070a0f,metalness:.82,roughness:.12,clearcoat:1,clearcoatRoughness:.035,envMapIntensity:2.1}));
 const trim=new THREE.LineSegments(new THREE.EdgesGeometry(back.geometry),new THREE.LineBasicMaterial({color:accent,transparent:true,opacity:.62,blending:THREE.AdditiveBlending}));trim.scale.setScalar(1.012);
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.51,.26),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,toneMapped:false}));face.position.z=.0305;textureLoader.load(url,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());face.material.map=t;face.material.needsUpdate=true});
 const shineUniforms={uTime:{value:0},uHover:{value:0}},shine=new THREE.Mesh(new THREE.PlaneGeometry(.51,.26),new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending,uniforms:shineUniforms,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float uTime,uHover;void main(){float sweep=exp(-pow((vUv.x+vUv.y*.42-fract(uTime*.34)*1.62+.24)/.065,2.));gl_FragColor=vec4(vec3(.72,.92,1.15)*sweep,uHover*sweep*.82);}`}));shine.position.z=.033;
 const badge={group,back,trim,face,shine,shineUniforms};back.userData.award=badge;face.userData.award=badge;shine.userData.award=badge;awardBadgeMeshes.push(back,face,shine);group.position.set(x,BADGE_MOUNT_Y,1.035);group.rotation.x=-.15;group.add(back,trim,face,shine);machinePlinth.add(group);awardBadges.push(badge)
}
addAwardBadge('./assets/badges/webby.webp',-.31,0xd7ecff);addAwardBadge('./assets/badges/kyoorius.png',.31,0x628cff);

// The portfolio nav becomes a small physical alphabet on the circuit floor.
// One relic is released on each cube click. Five bodies are enough for tactile
// motion without adding a full rigid-body dependency to the page.
// The board is a real surface. GROUND_Y is the one height every relic lands on,
// and BOARD_REACH is how far out it can come to rest without leaving the plate.
const RELIC_REST_SCALE=.62,RELIC_HOVER_SCALE=.80,MAX_SETTLED_RELICS=4;
const floorRelics=[],floorRelicMeshes=[];let relicOrder=0;
const relicQuat=new THREE.Quaternion(),relicSpin=new THREE.Euler(),relicRest=new THREE.Quaternion(),relicMat=new THREE.Matrix4(),relicNdc=new THREE.Vector3();
function relicMaterial(color){return new THREE.MeshPhysicalMaterial({color,emissive:color,emissiveIntensity:.12,metalness:.54,roughness:.19,clearcoat:1,clearcoatRoughness:.065,envMapIntensity:1.6})}
function pixelBlock(group,x,y,w,h,material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,.14,2,2,1),material);mesh.position.set(x,y,0);mesh.castShadow=true;group.add(mesh);return mesh}
function registerRelic(group,target,name){
 group.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(group),size=box.getSize(new THREE.Vector3());
 const physics={group,name,
  home:new THREE.Vector2(target[0],target[1]),
  half:new THREE.Vector3(size.x*.5,size.y*.5,size.z*.5),
  radius:Math.max(size.x,size.y)*.5,
  velocity:new THREE.Vector3(),angular:new THREE.Vector3(),
  yaw:(Math.random()-.5)*1.1,seed:Math.random()*9,
  lift:0,calm:0,active:false,retiring:false,order:0};
 group.visible=false;group.scale.setScalar(RELIC_REST_SCALE);
 group.traverse(o=>{if(o.isMesh){o.userData.relic=physics;floorRelicMeshes.push(o)}});
 group.userData.physics=physics;scene.add(group);floorRelics.push(physics);
}
{
 const g=new THREE.Group(),m=relicMaterial(0x4ca7ff);for(const [x,y,r] of [[-.20,.13,-.35],[.08,.02,.42],[.28,-.16,-.22]]){const bar=new THREE.Mesh(new THREE.BoxGeometry(.48,.13,.15,3,2,2),m);bar.position.set(x,y,0);bar.rotation.z=r;bar.castShadow=true;g.add(bar)}registerRelic(g,[-1.32,1.58],'work stack')
}
{
 const g=new THREE.Group(),m=relicMaterial(0xff78b8);pixelBlock(g,0,-.20,.14,.68,m);for(const [x,y] of [[0,.18],[-.24,.02],[.24,.02],[0,-.02]])pixelBlock(g,x,y,.26,.26,m);pixelBlock(g,-.20,-.43,.34,.13,m);pixelBlock(g,.20,-.39,.34,.13,m);registerRelic(g,[4.36,1.48],'play flower')
}
{
 const g=new THREE.Group(),m=relicMaterial(0xffb14f);pixelBlock(g,-.04,0,.66,.34,m);pixelBlock(g,.31,.19,.34,.30,m);pixelBlock(g,.52,.20,.20,.11,m);pixelBlock(g,-.42,-.01,.23,.22,m);registerRelic(g,[-1.12,-1.72],'contact bird')
}
{
 const g=new THREE.Group(),m=relicMaterial(0x61e7d5),dark=relicMaterial(0x061018);pixelBlock(g,0,0,.72,.34,m);pixelBlock(g,0,0,.34,.72,m);pixelBlock(g,-.17,.03,.09,.18,dark);pixelBlock(g,.17,.03,.09,.18,dark);pixelBlock(g,0,-.18,.20,.055,dark);registerRelic(g,[4.28,-1.60],'about cube')
}
{
 const g=new THREE.Group(),m=relicMaterial(0xba91ff);for(const [x,y] of [[-.38,.32],[.38,.32],[-.38,-.32],[.38,-.32]])pixelBlock(g,x,y,.18,.18,m);pixelBlock(g,-.20,0,.12,.38,m);pixelBlock(g,0,0,.12,.70,m);pixelBlock(g,.20,0,.12,.48,m);registerRelic(g,[1.56,2.82],'voice portal')
}
// Exact support height of the relic's box under its current rotation, so a
// tumbling plate meets the board on whichever corner is actually lowest.
function relicSupport(body){
 relicMat.makeRotationFromQuaternion(body.group.quaternion);
 const m=relicMat.elements,s=body.group.scale.x;
 return (Math.abs(m[1])*body.half.x+Math.abs(m[5])*body.half.y+Math.abs(m[9])*body.half.z)*s;
}
function releaseNavRelic(index){
 const body=floorRelics[index%floorRelics.length];
 const settled=floorRelics.filter(item=>item.active&&!item.retiring&&item!==body).sort((a,b)=>a.order-b.order);
 while(settled.length>=MAX_SETTLED_RELICS)settled.shift().retiring=true;
 body.active=true;body.retiring=false;body.calm=0;body.lift=0;body.order=++relicOrder;
 body.group.visible=true;body.group.scale.setScalar(RELIC_REST_SCALE*.5);
 const away=new THREE.Vector2(body.home.x-BOARD_CENTRE.x,body.home.y-BOARD_CENTRE.y).normalize();
 const launchX=BOARD_CENTRE.x+away.x*(PLINTH_KEEPOUT+.05),launchZ=BOARD_CENTRE.y+away.y*(PLINTH_KEEPOUT+.05);
 body.group.position.set(launchX,GROUND_Y+1.02,launchZ);
 body.group.quaternion.setFromEuler(relicSpin.set(-.58,0,(index-2)*.18));
 // A low arc off the cradle rim that lands near its home square. The apex stays
 // well under the cube, so nothing ever flies through the head.
 const flight=.92;
 body.velocity.set((body.home.x-launchX)/flight,2.75,(body.home.y-launchZ)/flight);
 body.angular.set(2.4+(index%2)*.9,(index-2)*1.1,2.6-index*.3);
}
function kickRelic(body){
 body.calm=0;
 body.velocity.add(new THREE.Vector3((Math.random()-.5)*1.9,3.5+Math.random()*1.1,(Math.random()-.5)*1.8));
 body.angular.add(new THREE.Vector3(1.4,2.2,1.7));
}
function updateRelics(dt,t){
 ray.setFromCamera(pointer,camera);
 const pointed=ray.intersectObjects(floorRelicMeshes.filter(o=>o.visible),false)[0]?.object.userData.relic;
 const active=floorRelics.filter(body=>body.active&&!body.retiring);
 let hovered=null;
 for(const body of floorRelics){
  const g=body.group;
  if(!body.active){g.visible=false;continue}
  if(body.retiring){
   g.position.y-=dt*.34;g.scale.multiplyScalar(Math.exp(-dt*2.6));
   if(g.scale.x<.05){body.active=false;body.retiring=false;g.visible=false}
   continue;
  }
  // A forgiving field, not a pixel-exact raycast. The relic keeps floating while
  // the cursor is anywhere near it, and sinks back down over about a second.
  relicNdc.copy(g.position).project(camera);
  const reach=Math.hypot(pointer.x-relicNdc.x,(pointer.y-relicNdc.y)*.82);
  // A ceiling keeps the anti-gravity playful without letting pieces drift up
  // into the head, and the field stands down while the cube itself is hovered.
  const headroom=THREE.MathUtils.smoothstep(g.position.y,GROUND_Y+1.30,GROUND_Y+.45);
  const inField=pointer.x>-1.5?THREE.MathUtils.smoothstep(reach,.22,.055):0;
  const wanted=Math.max(inField,body===pointed?1:0)*headroom*(1-hoverTarget*.85);
  body.lift+=(wanted-body.lift)*(wanted>body.lift?1-Math.exp(-dt*7.5):1-Math.exp(-dt*1.15));
  if(body.lift>.45&&(!hovered||body.lift>hovered.lift))hovered=body;

  const support=relicSupport(body);
  const floor=GROUND_Y+support;
  // Anti-gravity is a field strength, not a switch.
  body.velocity.y-=8.6*(1-body.lift*.96)*dt;
  if(body.lift>.001){
   body.velocity.y+=body.lift*(2.6+Math.sin(t*1.6+body.seed)*1.5)*dt;
   body.velocity.x+=(Math.sin(t*.9+body.seed*2.1))*body.lift*.55*dt;
   body.velocity.z+=(Math.cos(t*.77+body.seed*1.7))*body.lift*.55*dt;
   body.angular.y+=body.lift*dt*1.35;
   body.angular.x+=Math.sin(t*.6+body.seed)*body.lift*dt*.6;
   body.calm=0;
  }
  const drag=Math.exp(-dt*(0.28+body.lift*1.85));
  body.velocity.multiplyScalar(drag);
  g.position.addScaledVector(body.velocity,dt);

  relicSpin.set(body.angular.x*dt,body.angular.y*dt,body.angular.z*dt);
  g.quaternion.multiply(relicQuat.setFromEuler(relicSpin));
  body.angular.multiplyScalar(Math.exp(-dt*(.42-body.lift*.24)));

  // Keep the pieces on the plate and out of the plinth.
  const dx=g.position.x-BOARD_CENTRE.x,dz=g.position.z-BOARD_CENTRE.y,radial=Math.hypot(dx,dz);
  if(radial>BOARD_REACH){const k=(radial-BOARD_REACH)*6.2*dt;g.position.x-=dx/radial*k*BOARD_REACH*.2;g.position.z-=dz/radial*k*BOARD_REACH*.2;body.velocity.x*=.82;body.velocity.z*=.82}
  // The plinth is solid. Nothing rests on it and nothing passes through it.
  if(radial<PLINTH_KEEPOUT&&g.position.y<GROUND_Y+1.40){
   const nx=radial>.001?dx/radial:1,nz=radial>.001?dz/radial:0;
   g.position.x=BOARD_CENTRE.x+nx*PLINTH_KEEPOUT*1.03;g.position.z=BOARD_CENTRE.y+nz*PLINTH_KEEPOUT*1.03;
   const outward=body.velocity.x*nx+body.velocity.z*nz;
   if(outward<0){body.velocity.x-=outward*nx*1.5;body.velocity.z-=outward*nz*1.5}
   body.velocity.x+=nx*.9*dt*60*dt;body.velocity.z+=nz*.9*dt*60*dt;
  }

  if(g.position.y<floor){
   g.position.y=floor;
   if(body.velocity.y<0){
    const impact=-body.velocity.y;
    body.velocity.y=impact*(impact>.45?.68:.30);
    body.velocity.x*=.86;body.velocity.z*=.86;
    body.angular.multiplyScalar(.74);
    body.angular.x+=body.velocity.z*1.5+(Math.random()-.5)*impact*1.2;body.angular.z-=body.velocity.x*1.5+(Math.random()-.5)*impact*1.2;
    body.angular.y+=(Math.random()-.5)*impact*1.6;
   }
  }
  // Settling: once it is slow and on the board it lies flat and drifts home.
  const grounded=g.position.y<=floor+.014;
  const still=grounded&&body.lift<.05&&body.velocity.lengthSq()<.10&&body.angular.lengthSq()<.42;
  body.calm=THREE.MathUtils.clamp(body.calm+(still?dt*.85:-dt*4.6),0,1);
  if(body.calm>.001){
   const k=Math.min(1,body.calm*dt*4.4);
   relicRest.setFromEuler(relicSpin.set(-Math.PI/2,0,body.yaw));
   g.quaternion.slerp(relicRest,k);
   g.position.x+=(body.home.x-g.position.x)*Math.min(1,k*.6);
   g.position.z+=(body.home.y-g.position.z)*Math.min(1,k*.6);
   body.velocity.multiplyScalar(1-body.calm*.55);
   body.angular.multiplyScalar(1-body.calm*.62);
   if(body.calm>.92)g.position.y+=(GROUND_Y+relicSupport(body)-g.position.y)*.35;
  }
  const targetScale=RELIC_REST_SCALE+body.lift*(RELIC_HOVER_SCALE-RELIC_REST_SCALE);
  g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x,targetScale,.10));
  const glow=.08+body.lift*.62;
  g.traverse(o=>{if(o.isMesh&&o.material?.emissive)o.material.emissiveIntensity+=(glow-o.material.emissiveIntensity)*.12});
 }
 for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){
  const a=active[i],b=active[j],ax=a.group.position,bx=b.group.position;
  const dx=ax.x-bx.x,dy=ax.y-bx.y,dz=ax.z-bx.z,d=Math.hypot(dx,dy,dz),min=(a.radius+b.radius)*.62;
  if(d>.0001&&d<min){const push=(min-d)*7.5*dt,nx=dx/d,ny=dy/d,nz=dz/d;
   a.velocity.x+=nx*push;a.velocity.y+=ny*push*.8;a.velocity.z+=nz*push;
   b.velocity.x-=nx*push;b.velocity.y-=ny*push*.8;b.velocity.z-=nz*push;
   a.angular.y+=push*.9;b.angular.y-=push*.9;a.calm=b.calm=0}
 }
 return hovered;
}

const echoGroup=new THREE.Group();scene.add(echoGroup);const echoShells=[];
for(let i=0;i<5;i++){const shell=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.42,2.42,2.42,1,1,1)),new THREE.LineBasicMaterial({color:i%2?0x9beaff:0xe4b8ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));shell.position.set(1.35,.50,0);echoGroup.add(shell);echoShells.push(shell)}

// A click paints only the cube face that was touched. The pane is reused rather
// than allocating new geometry on every gesture.
const faceWashUniforms={uTime:{value:0},uLife:{value:0},uColor:{value:new THREE.Color(0x83f4e5)}};
const faceWash=new THREE.Mesh(new THREE.PlaneGeometry(2.05,2.05),new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.NormalBlending,toneMapped:false,uniforms:faceWashUniforms,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`precision highp float;varying vec2 vUv;uniform float uTime,uLife;uniform vec3 uColor;
void main(){vec2 p=vUv-.5;float r=length(p),a=atan(p.y,p.x);
 float life=clamp(uLife,0.,1.);
 float warped=r+.030*sin(a*7.+uTime*.82)+.015*sin(a*13.-uTime*.46);
 float front=life*.46;
 float ring=exp(-pow((warped-front)/(.030+life*.055),2.));
 float wake=smoothstep(front,front-.22,warped)*(1.-life);
 float core=exp(-warped*warped*140.)*(1.-life*.75);
 float vein=.5+.5*sin(warped*34.-uTime*2.4+a*1.6);
 float fade=sin(life*3.14159);
 float vignette=1.-smoothstep(.34,.5,r);
 float alpha=fade*vignette*(ring*1.15+wake*(.16+vein*.14)+core*.62);
 gl_FragColor=vec4(uColor*(.70+ring*1.5+core*1.15),alpha);}`}));
faceWash.visible=false;faceWash.renderOrder=24;scene.add(faceWash);

const confettiCount=120,confettiGeometry=new THREE.BufferGeometry(),confettiPositions=new Float32Array(confettiCount*3),confettiColors=new Float32Array(confettiCount*3),confettiVelocity=Array.from({length:confettiCount},()=>new THREE.Vector3());
for(let i=0;i<confettiCount;i++){confettiPositions[i*3]=999;confettiPositions[i*3+1]=999;confettiPositions[i*3+2]=999;const c=new THREE.Color(buttonColors[i%3]);confettiColors.set([c.r,c.g,c.b],i*3)}
confettiGeometry.setAttribute('position',new THREE.BufferAttribute(confettiPositions,3));confettiGeometry.setAttribute('color',new THREE.BufferAttribute(confettiColors,3));
const confetti=new THREE.Points(confettiGeometry,new THREE.PointsMaterial({size:.075,vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}));scene.add(confetti);let confettiLife=0;
function launchConfetti(){confettiLife=1;confetti.material.opacity=1;const a=confettiGeometry.attributes.position.array;for(let i=0;i<confettiCount;i++){const ang=i*2.399963+Math.random()*.24,r=.08+Math.random()*.38;a[i*3]=1.62+Math.cos(ang)*r;a[i*3+1]=-.55+Math.random()*.85;a[i*3+2]=.35+Math.sin(ang)*r;confettiVelocity[i].set(Math.cos(ang)*(1.1+Math.random()*1.7),(1.3+Math.random()*2.6),Math.sin(ang)*(1.0+Math.random()*1.4)+.5)}confettiGeometry.attributes.position.needsUpdate=true}

scene.add(new THREE.HemisphereLight(0x5f9dff,0x130a05,.26));
const key=new THREE.SpotLight(0xffc07a,118,26,.50,.70,1.35);key.position.set(-3.2,7.5,6);key.target.position.set(1.25,1.2,0);key.castShadow=true;key.shadow.mapSize.set(1536,1536);scene.add(key,key.target);
const rim=new THREE.SpotLight(0x2b9bff,104,22,.54,.76,1.45);rim.position.set(6.5,5,-2.8);rim.target.position.set(1.4,1.4,0);scene.add(rim,rim.target);
const pointerLight=new THREE.PointLight(0xffa45b,0,5.5,2);scene.add(pointerLight);

const dustGeometry=new THREE.BufferGeometry(),dustCount=190,dustPositions=new Float32Array(dustCount*3),dustSeeds=new Float32Array(dustCount);let dustSeed=1407;
const dustRandom=()=>{dustSeed=(1664525*dustSeed+1013904223)>>>0;return dustSeed/4294967296};
for(let i=0;i<dustCount;i++){dustPositions[i*3]=1.5+(dustRandom()-.5)*11;dustPositions[i*3+1]=-.35+dustRandom()*5.1;dustPositions[i*3+2]=(dustRandom()-.5)*7.5-.9;dustSeeds[i]=dustRandom()}
dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));dustGeometry.setAttribute('aSeed',new THREE.BufferAttribute(dustSeeds,1));
const dustUniforms={uTime:{value:0},uDpr:{value:Math.min(devicePixelRatio,1.45)}};
const dust=new THREE.Points(dustGeometry,new THREE.ShaderMaterial({uniforms:dustUniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:`attribute float aSeed;uniform float uTime,uDpr;varying float vAlpha;void main(){vec3 p=position;p.x+=sin(uTime*.11+aSeed*21.)*.075;p.y+=sin(uTime*.08+aSeed*37.)*.11;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((1.0+aSeed*1.5)*uDpr*7./-mv.z,1.,3.2);vAlpha=.028+aSeed*.070;}`,fragmentShader:`varying float vAlpha;void main(){float d=length(gl_PointCoord-.5)*2.;float a=(1.-smoothstep(.12,1.,d))*vAlpha;gl_FragColor=vec4(.58,.74,.82,a);}`}));scene.add(dust);

const trailCount=26,trailPositions=new Float32Array(trailCount*3),trailLife=new Float32Array(trailCount),trailGeometry=new THREE.BufferGeometry();
for(let i=0;i<trailCount;i++){trailPositions[i*3]=999;trailPositions[i*3+1]=999;trailPositions[i*3+2]=999;trailLife[i]=1-i/trailCount}
trailGeometry.setAttribute('position',new THREE.BufferAttribute(trailPositions,3));trailGeometry.setAttribute('aLife',new THREE.BufferAttribute(trailLife,1));
const trailUniforms={uOpacity:{value:0},uDpr:{value:Math.min(devicePixelRatio,1.45)}};
const trail=new THREE.Points(trailGeometry,new THREE.ShaderMaterial({uniforms:trailUniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:`attribute float aLife;uniform float uOpacity,uDpr;varying float vAlpha;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(2.+aLife*8.)*uDpr*8./max(2.,-mv.z);vAlpha=uOpacity*aLife*aLife;}`,fragmentShader:`varying float vAlpha;void main(){float d=length(gl_PointCoord-.5)*2.;float core=1.-smoothstep(0.,.28,d);float halo=1.-smoothstep(.18,1.,d);gl_FragColor=vec4(mix(vec3(.22,.72,1.),vec3(1.,.78,.52),core),vAlpha*(core+halo*.28));}`}));scene.add(trail);
const trailPlane=new THREE.Plane(new THREE.Vector3(0,0,1),-1.2),trailWorld=new THREE.Vector3();let trailReady=false;

// Camera-facing emergence haze hides the torso's hard lower edge so the
// character grows from the environment instead of floating as a cropped bust.
const emergenceUniforms={uTime:{value:0},uReveal:{value:0}};
const emergence=new THREE.Mesh(new THREE.PlaneGeometry(4.4,2.35),new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,toneMapped:false,uniforms:emergenceUniforms,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`precision highp float;varying vec2 vUv;uniform float uTime,uReveal;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 p=vUv-.5;float body=exp(-p.x*p.x*15.);float rise=smoothstep(.88,.18,vUv.y);float drift=.88+.12*sin(p.x*8.+uTime*.06);float grain=h(floor(vUv*220.))-0.5;vec3 c=mix(vec3(.012,.024,.040),vec3(.028,.070,.098),uReveal);float veil=body*rise*drift;gl_FragColor=vec4(c,clamp(veil*.66+grain*.012,0.,.67));}`}));
emergence.position.set(1.58,-1.28,1.35);emergence.renderOrder=20;scene.add(emergence);
emergence.visible=false;

// Rain. Off until the sky decides otherwise.
const rainCount=520,rainGeometry=new THREE.BufferGeometry(),rainSeeds=new Float32Array(rainCount*3);
for(let i=0;i<rainCount;i++){rainSeeds[i*3]=Math.random();rainSeeds[i*3+1]=Math.random();rainSeeds[i*3+2]=Math.random()}
rainGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(rainCount*3),3));
rainGeometry.setAttribute('aSeed',new THREE.BufferAttribute(rainSeeds,3));
const rainUniforms={uTime:{value:0},uAmount:{value:0},uDpr:{value:1},uOrigin:{value:new THREE.Vector3(1.44,GROUND_Y,0)}};
const rain=new THREE.Points(rainGeometry,new THREE.ShaderMaterial({uniforms:rainUniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`attribute vec3 aSeed;uniform float uTime,uAmount,uDpr;uniform vec3 uOrigin;varying float vA;
  void main(){float speed=9.5+aSeed.z*7.;
   float fall=fract(aSeed.y+uTime*speed*.055);
   float ang=aSeed.x*6.2831853,rad=1.4+aSeed.z*9.5;
   vec3 p=uOrigin+vec3(cos(ang)*rad,7.6-fall*9.4,sin(ang)*rad);
   vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
   gl_PointSize=clamp((1.6+aSeed.z*2.2)*uDpr*11./-mv.z,1.,5.);
   vA=uAmount*(.25+aSeed.z*.6)*smoothstep(0.,.12,fall)*smoothstep(1.,.72,fall);}`,
 fragmentShader:`varying float vA;void main(){vec2 d=gl_PointCoord-.5;float s=1.-smoothstep(.05,.5,length(d*vec2(3.4,1.)));gl_FragColor=vec4(vec3(.62,.80,1.),s*vA);}`
}));rain.frustumCulled=false;rain.visible=false;scene.add(rain);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.18,.30,1.22);composer.addPass(bloom);composer.addPass(new OutputPass());
// One grade at the end. It is where the scene gets its saturation back, and it
// is the hook every secret effect reaches for.
const gradeUniforms={tDiffuse:{value:null},uSat:{value:1.22},uContrast:{value:1.07},uInvert:{value:0},uVignette:{value:.26},uAberration:{value:0},uPixel:{value:0},uRes:{value:new THREE.Vector2(1,1)}};
const gradePass=new ShaderPass({uniforms:gradeUniforms,
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`precision highp float;varying vec2 vUv;uniform sampler2D tDiffuse;
 uniform float uSat,uContrast,uInvert,uVignette,uAberration,uPixel;uniform vec2 uRes;
 void main(){
  vec2 uv=vUv;
  if(uPixel>.5){vec2 cell=uRes/uPixel;uv=(floor(uv*cell)+.5)/cell;}
  vec4 c;
  if(uAberration>.001){vec2 dir=uv-.5;
   c.r=texture2D(tDiffuse,uv+dir*uAberration*.010).r;
   c.g=texture2D(tDiffuse,uv).g;
   c.b=texture2D(tDiffuse,uv-dir*uAberration*.010).b;c.a=1.;}
  else c=texture2D(tDiffuse,uv);
  float l=dot(c.rgb,vec3(.2126,.7152,.0722));
  c.rgb=mix(vec3(l),c.rgb,uSat);
  c.rgb=clamp((c.rgb-.5)*uContrast+.5,0.,1.);
  c.rgb=mix(c.rgb,vec3(1.)-c.rgb,uInvert);
  float v=1.-smoothstep(.54,1.18,length((uv-.5)*vec2(1.06,1.)));
  c.rgb*=mix(1.,v,uVignette);
  gl_FragColor=c;}`});
composer.addPass(gradePass);
resize();

const pageParams=new URLSearchParams(location.search),forceReveal=pageParams.get('reveal')==='1';
// ?quality=fixed pins render quality so profiling and frame capture are not
// fighting the watchdog. Off by default; the watchdog runs for real visitors.
const qualityWatchdog=pageParams.get('quality')!=='fixed';
// ?stats=1 exposes a render budget readout for profiling. Off by default.
if(pageParams.get('stats')==='1')window.sidScene=()=>{const out=[];const box=new THREE.Box3(),size=new THREE.Vector3(),mid=new THREE.Vector3();
 scene.traverseVisible(o=>{if(!o.isMesh&&!o.isPoints&&!o.isLineSegments)return;let ok=true;let p=o;while(p){if(p.visible===false){ok=false;break}p=p.parent}if(!ok)return;
  try{box.setFromObject(o);if(!isFinite(box.min.y))return;box.getSize(size);box.getCenter(mid);
  if(size.length()>90)return;
  out.push({n:o.name||o.type,c:[+mid.x.toFixed(2),+mid.y.toFixed(2),+mid.z.toFixed(2)],s:[+size.x.toFixed(2),+size.y.toFixed(2),+size.z.toFixed(2)],col:o.material&&o.material.color?'#'+o.material.color.getHexString():''})}catch(e){}});
 return out};
if(pageParams.get('stats')==='1')window.sidVoice=()=>({src:voicePlayer.currentSrc.split('/').slice(-2).join('/'),time:+voicePlayer.currentTime.toFixed(2),duration:+(voicePlayer.duration||0).toFixed(2),paused:voicePlayer.paused,ended:voicePlayer.ended,node:activeLineNode,sentences:activeLine?activeLine.length:0});
if(pageParams.get('stats')==='1')window.sidStats=()=>({cubeBottom:glassMesh?+new THREE.Box3().setFromObject(glassMesh).min.y.toFixed(3):null,cubeTop:glassMesh?+new THREE.Box3().setFromObject(glassMesh).max.y.toFixed(3):null,cubeX:glassMesh?+new THREE.Box3().setFromObject(glassMesh).getCenter(new THREE.Vector3()).x.toFixed(3):null,cubeWidth:glassMesh?+new THREE.Box3().setFromObject(glassMesh).getSize(new THREE.Vector3()).x.toFixed(3):null,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,programs:renderer.info.programs.length,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,dpr:renderer.getPixelRatio(),reflectionStride});
const forcedMoodParam=pageParams.get('mood'),forcedMood=forcedMoodParam===null?null:Math.max(0,Math.min(3,Number(forcedMoodParam)|0));
const glassCool=new THREE.Color(0x9fe4ff),glassWarm=new THREE.Color(0xffb46a),keyCool=new THREE.Color(0xffc07a),keyWarm=new THREE.Color(0xff8a34),rimCool=new THREE.Color(0x2b9bff),rimWarm=new THREE.Color(0xff3a12);
let model,head,idPivot,glassMesh,glassInner,baseScale=1,baseY=0,reveal=0,hoverTarget=0,pulse=0,expression=.24,expressionGoal=.24,moodOffset=0,gradeTarget=0,kaleidoTarget=0,echoEnergy=0,cosmicBurst=0,humanLock=0,gravityTarget=0,gravity=0,hasSidFace=false,effectKind=0,effectStrength=0,faceWashLife=0,voiceEnergy=0;
// Where the cube is touched, that region of the glass answers: a damped ring
// spreads from the exact contact point and dies out. It is the only motion in
// the scene that is caused by a specific place rather than by time.
const impactUniforms={uImpactPoint:{value:new THREE.Vector3(0,0,99)},uImpactAge:{value:9}};
const impactGlance=new THREE.Vector2();let impactGlanceStrength=0;
const inkDrops=[backdropUniforms.uDropA,backdropUniforms.uDropB,backdropUniforms.uDropC,backdropUniforms.uDropD],inkHues=[.06,.32,.58,.82];let inkDropIndex=0;
function addInkDrop(){const slot=inkDropIndex%inkDrops.length,offsets=[[.07,.025],[.015,.09],[-.055,-.045],[.045,-.10]],drop=inkDrops[slot].value,offset=offsets[slot];drop.set(THREE.MathUtils.clamp(backdropUniforms.uPointer.value.x+offset[0],.45,.92),THREE.MathUtils.clamp(backdropUniforms.uPointer.value.y+offset[1],.10,.90),inkHues[slot],.82);inkDropIndex++}
const modelBasePosition=new THREE.Vector3();
const faceParts=[],sidFaceParts=[],robotParts=[],irises=[],eyeWhites=[],brows=[],robotEyes=[],awardParts=[];let robotMouth=null,faceMesh=null;const pointer=new THREE.Vector2(-2,-2),smoothPointer=new THREE.Vector2(-2,-2),ray=new THREE.Raycaster(),clock=new THREE.Clock(),headNdc=new THREE.Vector3();
const eyeVoyagers=[-1,1].map(side=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(.085,24,16),new THREE.MeshBasicMaterial({color:0xeafcff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));mesh.scale.set(.58,1.75,.42);mesh.visible=false;mesh.userData.side=side;scene.add(mesh);return mesh}),eyeStart=new THREE.Vector3(),eyeCenter=new THREE.Vector3(),eyeOrbit=new THREE.Vector3(),eyeTarget=new THREE.Vector3();
const headLook=new THREE.Vector3();
const mood={tilt:0,width:1,height:1,lift:0,asym:0,mouthWidth:1,mouthHeight:1,mouthLift:0,mouthTilt:0};
const moodPresets=[
 {tilt:0,width:1,height:1,lift:0,asym:0,mouthWidth:1,mouthHeight:1,mouthLift:0,mouthTilt:0},
 {tilt:.22,width:4.8,height:.28,lift:.045,asym:.10,mouthWidth:.62,mouthHeight:.72,mouthLift:-.025,mouthTilt:.14},
 {tilt:0,width:.72,height:1.42,lift:.055,asym:0,mouthWidth:.27,mouthHeight:2.65,mouthLift:-.015,mouthTilt:0},
 {tilt:-.25,width:3.5,height:.32,lift:.022,asym:.018,mouthWidth:1.72,mouthHeight:.54,mouthLift:.065,mouthTilt:0}
];

const voiceVariants=[
 {name:'Friendly oracle',file:'./audio/sid-hello-friendly-gandalf.m4a',color:'#9ef2ea'},
 {name:'Sunlit guide',file:'./audio/sid-hello-02-sunlit-guide.m4a',color:'#ffd28f'},
 {name:'Glass oracle',file:'./audio/sid-hello-03-glass-oracle.m4a',color:'#8fcfff'},
 {name:'Cosmic mentor',file:'./audio/sid-hello-04-cosmic-mentor.m4a',color:'#c8a6ff'},
 {name:'Playful spark',file:'./audio/sid-hello-05-playful-spark.m4a',color:'#ff9eb8'},
 {name:'Intimate machine',file:'./audio/sid-hello-06-intimate-machine.m4a',color:'#b8ffd7'}
];
const captionPhrases=[{start:.04,end:2.06,words:[['This',.14,.22],['is',.22,.36],['what',.36,.52],['Siddharth',.52,.96],['sounds',.96,1.24],['like.',1.24,1.88]]}];
// A conversation, not a list. Each beat offers its own follow-ups, the cube
// remembers what has already been asked, and clicking the cube simply takes the
// next unasked thread. The answers are the ones Sid wrote; nothing here invents
// biography it was not given.
const cubeScript={
 who:{q:'Who’s Sid?',a:'Designer and technologist in New York. MFA from Parsons, with work spanning EyeJack, Deloitte, and Philips. The cube claims only partial credit.',next:['builds','best','why']},
 builds:{q:'What does he build?',a:'AR exhibitions, VR narratives, enterprise interfaces, spatial systems, and identities. Most alive where design meets emerging technology.',next:['best','tools','process']},
 best:{q:'Best work?',a:'ENCODED earned two Webbys at the Met. Mandala is a quiet AR and VR room for sitting with yourself. Cube of Creations is the seven-year character study that became a game.',next:['encoded','mandala','cubeof']},
 encoded:{q:'Tell me about ENCODED.',a:'An AR exhibition at the Met. Two Webbys. That is the short version the cube is cleared to give. Ask him for the long one.',next:['awards','mandala','reach']},
 mandala:{q:'What is Mandala?',a:'An AR and VR room you sit in rather than play. Quiet on purpose. People tend to stay longer than they planned.',next:['cubeof','process','builds']},
 cubeof:{q:'Cube of Creations?',a:'Seven years of drawing one character until it turned into a game. The cube you are talking to is a cousin.',next:['me','why','best']},
 tools:{q:'What does he use?',a:'Figma, Unity, TouchDesigner, Unreal, JavaScript, Python, Arduino, Premiere, and Three.js when the moment calls for it.',next:['process','builds','me']},
 process:{q:'How does he work?',a:'Prototype early, in whatever medium answers the question fastest. Paper, Unity, a browser tab. The considered version comes after the thing works.',next:['tools','builds','reach']},
 awards:{q:'Awards?',a:'Two Webbys for ENCODED, and a Kyoorius. Both are bolted to the front of this machine, so he cannot quietly forget them.',next:['best','available','reach']},
 why:{q:'Why a cube?',a:'A photograph would have been a claim. A cube is an invitation. It is also much easier to light.',next:['me','builds','cubeof']},
 me:{q:'What are you, exactly?',a:'A stand-in. Six recorded voices, a short list of answers, and no opinions of my own yet. The real conversation is one email away.',next:['reach','available','why']},
 available:{q:'Is he available?',a:'Open to full-time, freelance, and good collaborations from summer 2026.',next:['reach','builds','best']},
 reach:{q:'How do I reach him?',a:'Email is fastest: sidmehtadesign@gmail.com. LinkedIn, Instagram, and GitHub are close behind. Carrier pigeons are not recommended.',next:['available','best','me']}
};
const chipLabels={who:'About Sid',builds:'What he builds',best:'Best work',encoded:'ENCODED',mandala:'Mandala',cubeof:'Cube of Creations',tools:'Tools',process:'How he works',awards:'Awards',why:'Why a cube',me:'What are you',available:'Available?',reach:'Reach him'};
const scriptOrder=Object.keys(cubeScript);
const noteLabel=$('#cube-note-label'),noteQuestion=$('#cube-note-question'),noteAnswer=$('#cube-note-answer'),noteChips=$('#cube-note-chips');
const askedNodes=new Set();let currentNode='who',turnCount=0;
function unaskedFrom(list){return list.filter(id=>!askedNodes.has(id))}
function nextThread(){
 const node=cubeScript[currentNode],onward=unaskedFrom(node?node.next:[]);
 if(onward.length)return onward[0];
 const anywhere=unaskedFrom(scriptOrder);
 if(anywhere.length)return anywhere[0];
 return currentNode==='reach'?'best':'reach';
}
function renderChips(){
 if(!noteChips)return;
 const node=cubeScript[currentNode],picks=[];
 for(const id of node.next)if(!askedNodes.has(id)&&!picks.includes(id))picks.push(id);
 for(const id of scriptOrder){if(picks.length>=3)break;if(id!==currentNode&&!askedNodes.has(id)&&!picks.includes(id))picks.push(id)}
 for(const id of node.next){if(picks.length>=3)break;if(id!==currentNode&&!picks.includes(id))picks.push(id)}
 noteChips.replaceChildren(...picks.slice(0,3).map(id=>{
  const button=document.createElement('button');
  button.type='button';button.className=askedNodes.has(id)?'cube-note-chip is-asked':'cube-note-chip';
  button.dataset.cubeNote=id;button.textContent=chipLabels[id]||cubeScript[id].q;
  return button;
 }));
}
function setCubeNote(id){
 const node=cubeScript[id];if(!node)return;
 currentNode=id;askedNodes.add(id);turnCount++;
 if(noteQuestion)noteQuestion.textContent=node.q;
 if(noteAnswer)noteAnswer.textContent=node.a;
 if(noteLabel)noteLabel.textContent=askedNodes.size>=scriptOrder.length?'Still here':'The cube says';
 renderChips();
}
// One beat of the conversation: a voice, an answer, a released relic, and the
// scene state that goes with that voice.
function speakNode(id,hit){
 document.body.classList.add('ai-touched');
 restlessness=Math.min(3.2,restlessness+.85);
 const turn=(voiceIndex+1)%voiceVariants.length;
 startVoice(turn,id);setCubeNote(id);
 effectKind=turn;effectStrength=1;pulse=.001;echoEnergy=0;
 moodOffset=(moodOffset+1)%moodPresets.length;expressionGoal=.84;
 document.body.classList.add('ai-awake');
 paintClickedFace(hit,voiceVariants[turn].color);
 releaseNavRelic(Math.max(0,scriptOrder.indexOf(id)));
 addInkDrop();
 gradeTarget=[.08,.82,.16,.28,.58,.02][turn];kaleidoTarget=turn===3?.68:0;
 if(turn===4)launchConfetti();
 clearTimeout(effectResetTimer);
 effectResetTimer=setTimeout(()=>{gradeTarget=0;kaleidoTarget=0;expressionGoal=.24;document.body.classList.remove('ai-awake')},turn===3?2600:1850);
}
askedNodes.add('who');renderChips();
noteChips?.addEventListener('click',event=>{
 const button=event.target.closest('[data-cube-note]');if(!button)return;
 const id=button.dataset.cubeNote;if(!cubeScript[id])return;
 const index=Math.max(0,scriptOrder.indexOf(id));
 waterInk++;waterSwirl(((index*.17)+.12)%1,THREE.MathUtils.clamp(.3+(index*.19)%.44,.08,.92),.95,index%2?1:-1);
 speakNode(id,null);
});
const voicePlayer=new Audio();voicePlayer.preload='auto';
let voiceIndex=-1,audioContext,voiceAnalyser,voiceSamples,activeCaption=-1,effectResetTimer,captionHideTimer;
function ensureAudioGraph(){
 if(!audioContext){const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(AudioContextClass){audioContext=new AudioContextClass();voiceAnalyser=audioContext.createAnalyser();voiceAnalyser.fftSize=256;voiceAnalyser.smoothingTimeConstant=.72;voiceSamples=new Uint8Array(voiceAnalyser.frequencyBinCount);const source=audioContext.createMediaElementSource(voicePlayer);source.connect(voiceAnalyser);voiceAnalyser.connect(audioContext.destination)}}
 if(audioContext?.state==='suspended')audioContext.resume()
}
// Per-answer audio. Drop a file named after the thread id into web/audio/lines/
// and the cube speaks that answer in Sid's own voice, with captions timed to it.
// If the file is not there the cube falls back to the recorded voice colours, so
// the page works with none of them, some of them, or all of them.
const LINE_AUDIO={dir:'./audio/lines/',ext:'.mp3'};
const missingLines=new Set(),availableLines=new Set();let lineManifestLoaded=false;
// A one line manifest keeps the network quiet: the page never asks for a
// recording that does not exist yet. Put "*" in it once every thread is voiced.
fetch(`${LINE_AUDIO.dir}manifest.json`,{cache:'no-cache'})
 .then(response=>response.ok?response.json():[])
 .then(list=>{if(Array.isArray(list))for(const id of list)availableLines.add(String(id))})
 .catch(()=>{})
 .finally(()=>{lineManifestLoaded=true});
function hasLine(nodeId){return lineManifestLoaded&&!missingLines.has(nodeId)&&(availableLines.has('*')||availableLines.has(nodeId))}
let pendingLineNode=null,activeLine=null,activeLineNode=null,captionKey='';
function buildLineCaption(text,duration){
 if(!(duration>.3))return null;
 const sentences=(text.match(/[^.!?]+[.!?]*/g)||[text]).map(part=>part.trim()).filter(Boolean);
 const parsed=sentences.map(sentence=>{
  const words=sentence.split(/\s+/).filter(Boolean);
  const weights=words.map(word=>word.length+1);
  return {words,weights,sum:weights.reduce((a,b)=>a+b,0)};
 });
 const total=parsed.reduce((a,part)=>a+part.sum,0);
 if(!total)return null;
 const lead=Math.min(.16,duration*.05),span=Math.max(.4,duration-lead-duration*.05);
 let cursor=lead;
 return parsed.map(part=>{
  const start=cursor,timed=part.words.map((word,i)=>{
   const step=span*(part.weights[i]/total),entry=[word,cursor,cursor+step];cursor+=step;return entry;
  });
  return {words:timed,start,end:cursor};
 });
}
function renderCaption(key,words){
 if(key===captionKey)return;captionKey=key;
 if(!words){captions.classList.remove('is-visible');captions.textContent='';return}
 captions.replaceChildren(...words.flatMap(([word])=>{const span=document.createElement('span');span.textContent=word;return [span,document.createTextNode(' ')]}));
 captions.classList.add('is-visible');
}
function setCaptionPhrase(index){
 activeCaption=index;
 renderCaption(index<0?'':`phrase:${index}`,index<0?null:captionPhrases[index].words);
}
function updateCaptions(){
 if(voicePlayer.paused||voicePlayer.ended){if(!voicePlayer.ended)return;renderCaption('',null);activeCaption=-1;return}
 const time=voicePlayer.currentTime;
 if(activeLine){
  let index=-1;
  for(let i=0;i<activeLine.length;i++)if(time>=activeLine[i].start-.2&&time<activeLine[i].end+.25){index=i;break}
  if(index<0){renderCaption('',null);return}
  const sentence=activeLine[index];
  renderCaption(`line:${activeLineNode}:${index}`,sentence.words);
  captions.querySelectorAll('span').forEach((span,i)=>{
   const word=sentence.words[i];span.classList.toggle('is-current',!!word&&time>=word[1]&&time<word[2]);
  });
  return;
 }
 const index=captionPhrases.findIndex(p=>time>=p.start&&time<=p.end);setCaptionPhrase(index);
 if(index>=0){const phrase=captionPhrases[index];captions.querySelectorAll('span').forEach((span,i)=>span.classList.toggle('is-current',time>=phrase.words[i][1]&&time<phrase.words[i][2]))}
}
function playVoiceColour(index){
 const voice=voiceVariants[index];
 pendingLineNode=null;activeLine=null;activeLineNode=null;
 voicePlayer.src=voice.file;voicePlayer.currentTime=0;voicePlayer.play().catch(()=>{});
}
function startVoice(index,nodeId){
 ensureAudioGraph();voiceIndex=index;const voice=voiceVariants[index];
 voicePlayer.pause();
 activeLine=null;activeLineNode=null;renderCaption('',null);
 if(nodeId&&cubeScript[nodeId]&&hasLine(nodeId)){
  pendingLineNode=nodeId;
  voicePlayer.src=`${LINE_AUDIO.dir}${nodeId}${LINE_AUDIO.ext}`;
  voicePlayer.currentTime=0;voicePlayer.play().catch(()=>{});
 }else playVoiceColour(index);
 voicePersona.textContent=`${voice.name}`;
 document.documentElement.style.setProperty('--voice',voice.color);
 document.body.classList.add('is-speaking');clearTimeout(captionHideTimer);
}
voicePlayer.addEventListener('loadedmetadata',()=>{
 if(!pendingLineNode)return;
 const node=cubeScript[pendingLineNode];
 activeLine=buildLineCaption(node.a,voicePlayer.duration);
 activeLineNode=pendingLineNode;pendingLineNode=null;
});
voicePlayer.addEventListener('error',()=>{
 if(!pendingLineNode)return;
 // No recording for this thread yet. Remember that, and speak in a voice colour.
 missingLines.add(pendingLineNode);pendingLineNode=null;
 playVoiceColour(voiceIndex<0?0:voiceIndex);
});
voicePlayer.addEventListener('ended',()=>{document.body.classList.remove('is-speaking');captionHideTimer=setTimeout(()=>{renderCaption('',null);activeCaption=-1},420)});
function paintClickedFace(hit,color){
 if(!hit?.face){impactUniforms.uImpactAge.value=9;return}
 if(glassMesh){const local=glassMesh.worldToLocal(hit.point.clone());impactUniforms.uImpactPoint.value.copy(local);impactUniforms.uImpactAge.value=0;impactGlance.set(THREE.MathUtils.clamp(local.x/1.15,-1,1),THREE.MathUtils.clamp(local.y/1.15,-1,1));impactGlanceStrength=1}const normal=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);faceWash.position.copy(hit.point).addScaledVector(normal,.018);faceWash.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);faceWashUniforms.uColor.value.set(color);faceWashLife=.001;faceWash.visible=true
}
function triggerCubeInteraction(hit){
 document.body.classList.add('ai-touched');
 // A click throws new colour into the sky around the cube, in world space, so
 // it stays where it was thrown when you orbit away.
 waterInk++;
 const uv=pointerSkyUv(),ux=uv.x,uy=uv.y;
 waterSwirl(ux,uy,.95,1);
 setTimeout(()=>waterSwirl((ux+.14)%1,THREE.MathUtils.clamp(uy+.15,.05,.95),.8,-1),170);
 setTimeout(()=>waterSwirl((ux+.86)%1,THREE.MathUtils.clamp(uy-.17,.05,.95),.7,1),340);
 speakNode(nextThread(),hit);
}

function cloneFadeMaterial(o,opacity){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=opacity;o.material.depthWrite=opacity>.5;o.userData.fullOpacity=opacity}
function makeRetroEyeMaterial(){const uniforms={uTime:{value:0},uOpacity:{value:1},uTint:{value:new THREE.Color(0xdff8ff)}};const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,vertexShader:`void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`precision highp float;uniform float uTime,uOpacity;uniform vec3 uTint;void main(){float scan=.91+.09*sin(gl_FragCoord.y*1.35+uTime*4.2);float flicker=.965+.035*sin(uTime*15.7+gl_FragCoord.x*.035);float fringe=.5+.5*sin(gl_FragCoord.x*.12+uTime*.7);vec3 phosphor=uTint*2.15+vec3(.20*fringe,.05,.26*(1.-fringe));gl_FragColor=vec4(phosphor*scan*flicker,uOpacity);}`});material.userData.eyeUniforms=uniforms;return material}
function addCrtScreen(){if(!head)return;const panel=new THREE.Mesh(new THREE.PlaneGeometry(1.72,.74),new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uOpacity:{value:1}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float uOpacity;float roundedBox(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}void main(){vec2 p=vUv-.5;float mask=1.-smoothstep(-.01,.025,roundedBox(p,vec2(.48,.45),.08));float vignette=1.-smoothstep(.18,.72,length(p));float scan=.018*sin(vUv.y*330.);gl_FragColor=vec4(vec3(.003,.008,.014)+scan,mask*(.58+.20*vignette)*uOpacity);}`}));panel.name='ROBOT_CRT_SCREEN';panel.rotation.x=Math.PI/2;panel.position.set(0,-1.145,.08);panel.renderOrder=-1;head.add(panel);panel.userData.basePosition=panel.position.clone();panel.userData.baseScale=panel.scale.clone();robotParts.unshift(panel)}
function applyEnvironmentFade(o){o.material=o.material.clone();o.material.transparent=true;o.material.depthWrite=false;o.material.onBeforeCompile=s=>{s.vertexShader=`varying float vEnvironmentY;\n${s.vertexShader}`.replace('#include <begin_vertex>','#include <begin_vertex>\nvEnvironmentY=(modelMatrix*vec4(transformed,1.)).y;');s.fragmentShader=`varying float vEnvironmentY;\n${s.fragmentShader}`.replace('#include <dithering_fragment>','gl_FragColor.a*=smoothstep(-1.82,-1.12,vEnvironmentY);\n#include <dithering_fragment>')};o.material.customProgramCacheKey=()=>`environment-fade-v1-${o.name}`;o.material.needsUpdate=true}
function applyBadgeShimmer(o){const shimmer={value:0};o.userData.shimmer=shimmer;o.material.onBeforeCompile=s=>{s.uniforms.uBadgeTime=shimmer;s.vertexShader=`varying vec2 vBadgeUv;\n${s.vertexShader}`.replace('#include <uv_vertex>','#include <uv_vertex>\nvBadgeUv=uv;');s.fragmentShader=`uniform float uBadgeTime;varying vec2 vBadgeUv;\n${s.fragmentShader}`.replace('#include <dithering_fragment>','float badgeSweep=exp(-pow((vBadgeUv.x+vBadgeUv.y*.28-fract(uBadgeTime*.055)*1.42)/.075,2.));gl_FragColor.rgb+=badgeSweep*vec3(.34,.42,.50);\n#include <dithering_fragment>')};o.material.customProgramCacheKey=()=>`slow-badge-shimmer-v2-${o.name}`;o.material.needsUpdate=true}
const gltfLoader=new GLTFLoader();
async function loadOptionalSidFace(){
 try{
  const faceModelUrl=document.querySelector('meta[name="sid-face-model"]')?.content;if(!faceModelUrl||!head||!faceMesh)return;
  const incoming=(await gltfLoader.loadAsync(faceModelUrl)).scene;
  incoming.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;o.material=o.material.clone();o.material.transparent=true;o.material.opacity=0;o.material.depthWrite=false;if('envMapIntensity'in o.material)o.material.envMapIntensity=1.15;sidFaceParts.push(o)});
  if(!sidFaceParts.length)return;
  const targetBox=new THREE.Box3().setFromObject(faceMesh),targetSize=targetBox.getSize(new THREE.Vector3()),targetCenter=targetBox.getCenter(new THREE.Vector3());scene.add(incoming);incoming.updateMatrixWorld(true);
  const sourceBox=new THREE.Box3().setFromObject(incoming),sourceSize=sourceBox.getSize(new THREE.Vector3());incoming.scale.multiplyScalar(targetSize.y/Math.max(.001,sourceSize.y));incoming.updateMatrixWorld(true);
  const fittedCenter=new THREE.Box3().setFromObject(incoming).getCenter(new THREE.Vector3());incoming.position.add(targetCenter.sub(fittedCenter));head.attach(incoming);incoming.name='SID_FACE_MODEL';faceMesh=sidFaceParts[0];hasSidFace=true
 }catch(error){console.info('Sid face GLB not installed yet')}
}
gltfLoader.load('./models/tv-head/sid-tv-character.glb?v=44',g=>{
 model=g.scene;scene.add(model);
 model.traverse(o=>{
  if(o.name==='Body_Root')o.visible=false;
  if(o.isMesh){
   o.castShadow=true;o.receiveShadow=true;
   if(/^(TURTLENECK_TORSO|CIRCUIT_|OPEN_WIRE_|NEW_SCHOOL_LABEL)/.test(o.name))applyEnvironmentFade(o);
   if(o.name.startsWith('FACE_')){cloneFadeMaterial(o,0);o.visible=false;faceParts.push(o);if(o.name==='FACE_HEAD_REAL')faceMesh=o}
   if(o.name.startsWith('FACE_IRIS_')){o.userData.basePosition=o.position.clone();o.userData.baseScale=o.scale.clone();irises.push(o)}
   if(o.name.startsWith('FACE_EYE_WHITE_')){o.userData.baseScale=o.scale.clone();eyeWhites.push(o)}
   if(o.name.startsWith('FACE_BROW_')){o.userData.basePosition=o.position.clone();o.userData.baseRotation=o.rotation.clone();brows.push(o)}
   if(o.name.startsWith('ROBOT_')){if(o.name.startsWith('ROBOT_EYE_')){o.geometry=new THREE.SphereGeometry(.12,32,20);o.material=makeRetroEyeMaterial();o.scale.set(.40,1.72,.30);o.userData.eyeUniforms=o.material.userData.eyeUniforms;robotEyes.push(o)}else cloneFadeMaterial(o,1);robotParts.push(o);o.userData.basePosition=o.position.clone();o.userData.baseScale=o.scale.clone();if(o.name==='ROBOT_MOUTH')robotMouth=o}
   if(/^(WEBBY|KYOORIUS)_BADGE/.test(o.name)){o.userData.baseRotation=o.rotation.clone();awardParts.push(o);if(o.material){o.material=o.material.clone();o.material.metalness=.46;o.material.roughness=.10;o.material.envMapIntensity=2.25;if(o.name==='WEBBY_BADGE'||o.name==='KYOORIUS_BADGE')applyBadgeShimmer(o)}}
   if(o.name.startsWith('CUBE_EDGE_')){o.material=new THREE.MeshPhysicalMaterial({color:0x1b232a,metalness:.86,roughness:.52,envMapIntensity:.55,clearcoat:.25,clearcoatRoughness:.4});o.castShadow=false;o.position.multiplyScalar(.80);o.scale.set(1,.70,1)}
   if(/^HUMAN_NECK/.test(o.name))o.material=new THREE.MeshPhysicalMaterial({color:0xb77f64,roughness:.62,sheen:.06});
   if(o.name==='CUBE_GLASS'){
    glassMesh=o;o.material=new THREE.MeshPhysicalMaterial({color:0xd8f6ff,roughness:.018,metalness:0,transmission:1,thickness:1.12,ior:1.58,dispersion:.075,attenuationColor:new THREE.Color(0x2fc3e6),attenuationDistance:1.9,specularIntensity:1,specularColor:new THREE.Color(0xffffff),transparent:true,opacity:.30,clearcoat:1,clearcoatRoughness:.018,envMap:reflectionTarget.texture,envMapIntensity:2.20,iridescence:.16,iridescenceIOR:1.28,iridescenceThicknessRange:[115,310],side:THREE.FrontSide,depthWrite:false});
    glassInner=new THREE.Mesh(o.geometry,new THREE.MeshPhysicalMaterial({color:0x9ee7ff,roughness:.04,metalness:0,transmission:.98,thickness:.24,ior:1.32,dispersion:.11,transparent:true,opacity:.07,clearcoat:1,clearcoatRoughness:.03,envMap:reflectionTarget.texture,envMapIntensity:1.35,side:THREE.BackSide,depthWrite:false}));glassInner.scale.setScalar(.972);glassInner.renderOrder=o.renderOrder-1;o.add(glassInner);
    for(const target of [o.material,glassInner.material]){target.onBeforeCompile=sh=>{sh.uniforms.uImpactPoint=impactUniforms.uImpactPoint;sh.uniforms.uImpactAge=impactUniforms.uImpactAge;sh.vertexShader=`uniform vec3 uImpactPoint;uniform float uImpactAge;\n${sh.vertexShader}`.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat impactReach=distance(position,uImpactPoint);\nfloat impactRing=sin(impactReach*5.1-uImpactAge*7.4)*exp(-impactReach*1.15)*exp(-uImpactAge*2.35);\ntransformed+=normal*impactRing*.235;')};target.customProgramCacheKey=()=>`glass-impact-v1-${target.side}`}
    void 0;
    void 0
   }
   if(o.name==='CUBE_INNER_SHADOW')o.material=new THREE.MeshPhysicalMaterial({color:0x07111d,roughness:.12,metalness:.22,transmission:.45,thickness:.12,transparent:true,opacity:.22,depthWrite:false});
  }
 if(o.name==='Head_Root')head=o;if(o.name==='Parsons_ID_Pivot')idPivot=o});
 addCrtScreen();const heroBox=new THREE.Box3().setFromObject(head),heroSize=heroBox.getSize(new THREE.Vector3()),heroCenter=heroBox.getCenter(new THREE.Vector3());baseScale=3.26/heroSize.y;model.scale.setScalar(baseScale);model.position.set(1.44-heroCenter.x*baseScale,.70-heroCenter.y*baseScale,-heroCenter.z*baseScale);modelBasePosition.copy(model.position);model.rotation.y=.035;techBase.visible=true;buttonGroup.visible=false;loadOptionalSidFace();loader.classList.add('done');
},undefined,e=>{loader.textContent='Model failed to load';console.error(e)});

// Every click pushes the next pigment onto the sheet, so the background keeps
// gaining colour as the conversation goes on rather than repeating one wash.
const WATER_INKS=[[.06,.66,.74],[.90,.36,.09],[.09,.46,.44],[.62,.22,.70],[.14,.32,.86],[.94,.64,.12],[.26,.74,.36],[.88,.20,.34]];
let waterInk=0,lastWake=0;
function waterSwirl(x,y,strength,spin){
 const wc=window.sidWatercolour;if(!wc)return;
 const ink=WATER_INKS[waterInk%WATER_INKS.length];
 wc.drop(x,y,ink,.030+.040*strength,.040+.115*strength);
 const arms=strength>.6?5:3,phase=performance.now()*.00055*spin;
 for(let i=0;i<arms;i++){
  const a=phase+i*Math.PI*2/arms,r=.035+.055*strength;
  wc.push(x+Math.cos(a)*r,y+Math.sin(a)*r,-Math.sin(a)*1.55*strength*spin,Math.cos(a)*1.55*strength*spin,.075+.05*strength,.30+.50*strength);
 }
}
// Pigment follows the pointer only in open space. Over the character the water
// stays still, so the cube is never competing with its own background.
addEventListener('pointermove',e=>{pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);const wx=e.clientX/innerWidth,wy=1-e.clientY/innerHeight;backdropUniforms.uPointer.value.set(wx,wy);
 if(reducedMotion)return;const now=performance.now();if(now-lastWake<150)return;lastWake=now;
 const uv=pointerSkyUv();waterSwirl(uv.x,uv.y,hoverTarget>.5?.22:.40,1)});
canvas.addEventListener('pointerdown',e=>{if(!model)return;pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);const waterX=e.clientX/innerWidth,waterY=1-e.clientY/innerHeight;{const uv=pointerSkyUv();window.sidWatercolour?.push(uv.x,uv.y,smoothPointer.x*.32,-smoothPointer.y*.32,.16,.42)}ray.setFromCamera(pointer,camera);const relicHit=ray.intersectObjects(floorRelicMeshes.filter(o=>o.visible),false)[0];if(relicHit){kickRelic(relicHit.object.userData.relic);addInkDrop();const uv=pointerSkyUv();waterSwirl(uv.x,uv.y,.6,-1);return}const glassHit=glassMesh?ray.intersectObject(glassMesh,false)[0]:null,modelHit=ray.intersectObject(model,true)[0];if(glassHit||modelHit)triggerCubeInteraction(glassHit||modelHit);else{addInkDrop();waterInk++;const uv=pointerSkyUv();waterSwirl(uv.x,uv.y,.95,1)}});
canvas.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&model){e.preventDefault();triggerCubeInteraction(null)}});
function currentDprCeiling(){return Math.min(devicePixelRatio,innerWidth<760?1.05:1.45)*qualityScale}
function resize(){frameCamera();dprCeiling=currentDprCeiling();renderer.setPixelRatio(dprCeiling);renderer.setSize(innerWidth,innerHeight,false);composer.setSize(innerWidth,innerHeight);bloom.setSize(innerWidth,innerHeight);gradeUniforms.uRes.value.set(innerWidth,innerHeight);dustUniforms.uDpr.value=dprCeiling;trailUniforms.uDpr.value=dprCeiling;backdropUniforms.uAspect.value=innerWidth/innerHeight}
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,90)});

let reflectionFrame=0;const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Secret weather. Nothing announces itself; things simply happen now and then,
// and more often once someone has started poking at the cube.
const SCENE_EVENTS=['rain','invert','tide','pixel','flare'];
let sceneEvent=null,eventAge=0,eventLife=0,eventsSeen=0,nextEventAt=26+Math.random()*26,restlessness=0;
function beginEvent(name){
 sceneEvent=name;eventAge=0;eventsSeen++;
 eventLife=name==='rain'?13+Math.random()*7:name==='tide'?11+Math.random()*6:name==='pixel'?2.6:name==='flare'?2.2:1.5;
 if(name==='rain'){rain.visible=true}
}
function endEvent(){
 if(sceneEvent==='rain')rain.visible=false;
 sceneEvent=null;
}
function updateWeather(dt,t){
 if(reducedMotion)return;
 restlessness=Math.max(0,restlessness-dt*.05);
 if(!sceneEvent){
  nextEventAt-=dt*(1+restlessness);
  if(nextEventAt<=0){beginEvent(SCENE_EVENTS[(Math.random()*SCENE_EVENTS.length)|0]);nextEventAt=34+Math.random()*40}
 }else{
  eventAge+=dt;
  if(eventAge>=eventLife)endEvent();
 }
 const phase=sceneEvent?Math.min(1,eventAge/eventLife):0;
 const envelope=sceneEvent?Math.sin(Math.min(1,eventAge/Math.min(1.6,eventLife*.35))*Math.PI*.5)*Math.sin((1-phase)*Math.PI*.5+.0001):0;
 const wet=sceneEvent==='rain'||sceneEvent==='tide'?envelope:0;
 floorWet.value+=(wet*(sceneEvent==='tide'?1:.55)-floorWet.value)*.06;
 floorTime.value=t;
 rainUniforms.uTime.value=t;rainUniforms.uDpr.value=dprCeiling;
 rainUniforms.uAmount.value+=((sceneEvent==='rain'?envelope:0)-rainUniforms.uAmount.value)*.08;
 if(rain.visible&&rainUniforms.uAmount.value<.004&&sceneEvent!=='rain')rain.visible=false;
 skyUniforms.uStorm.value+=((sceneEvent==='rain'?envelope:0)-skyUniforms.uStorm.value)*.05;
 const invert=sceneEvent==='invert'?(Math.sin(eventAge*9.2)>.0?envelope:0):0;
 gradeUniforms.uInvert.value+=(invert-gradeUniforms.uInvert.value)*.35;
 skyUniforms.uInvert.value=gradeUniforms.uInvert.value;
 gradeUniforms.uPixel.value+=((sceneEvent==='pixel'?4+envelope*6:0)-gradeUniforms.uPixel.value)*.12;
 const flare=sceneEvent==='flare'?envelope:0;
 gradeUniforms.uAberration.value+=(flare*1.2+(sceneEvent==='invert'?envelope*.6:0)-gradeUniforms.uAberration.value)*.15;
 gradeUniforms.uSat.value+=((1.22+flare*.5+(sceneEvent==='tide'?.12:0))-gradeUniforms.uSat.value)*.05;
}
let frameHandle=0,fpsWindow=0,fpsFrames=0,qualityFloorReached=false;
function stopFrames(){if(frameHandle){cancelAnimationFrame(frameHandle);frameHandle=0}}
function startFrames(){if(!frameHandle){clock.getDelta();frameHandle=requestAnimationFrame(frame)}}
// A page that stutters stops being cinematic, so quality is shed automatically
// before the visitor ever has to notice it.
function watchFrameRate(dt){if(reducedMotion||qualityFloorReached||!qualityWatchdog)return;fpsWindow+=dt;fpsFrames++;if(fpsWindow<2.5)return;const fps=fpsFrames/fpsWindow;fpsWindow=0;fpsFrames=0;if(fps<42){if(reflectionStride<8){reflectionStride=8;return}if(qualityScale>.74){qualityScale=.74;resize();return}qualityFloorReached=true;window.sidWatercolour?.set('ambient',0)}else if(fps>56&&reflectionStride>4&&qualityScale>=1)reflectionStride=4}
document.addEventListener('visibilitychange',()=>{document.hidden?stopFrames():startFrames()});
function frame(){frameHandle=requestAnimationFrame(frame);const dt=Math.min(.033,clock.getDelta()),t=clock.elapsedTime;watchFrameRate(dt);updateWeather(dt,t);smoothPointer.lerp(pointer,.055);controls.update();updateCaptions();if(voiceAnalyser&&!voicePlayer.paused){voiceAnalyser.getByteFrequencyData(voiceSamples);let energy=0;for(let i=2;i<24;i++)energy+=voiceSamples[i];voiceEnergy+=(energy/(22*255)-voiceEnergy)*.24}else voiceEnergy*=.88;if(effectStrength>0)effectStrength=Math.max(0,effectStrength-dt*.48);cosmicBurst*=Math.exp(-dt*1.35);if(impactUniforms.uImpactAge.value<9)impactUniforms.uImpactAge.value=Math.min(9,impactUniforms.uImpactAge.value+dt*1.9);
 impactGlanceStrength=Math.max(0,impactGlanceStrength-dt*.85);
 if(faceWashLife>0){faceWashLife+=dt*.52;faceWashUniforms.uTime.value=t;faceWashUniforms.uLife.value=faceWashLife;if(faceWashLife>=1){faceWashLife=0;faceWash.visible=false}}backdropUniforms.uTime.value=reducedMotion?0:t;backdropUniforms.uGrade.value+=(gradeTarget-backdropUniforms.uGrade.value)*.045;backdropUniforms.uKaleido.value+=(kaleidoTarget-backdropUniforms.uKaleido.value)*.055;backdropUniforms.uCosmicBurst.value=cosmicBurst;renderer.toneMappingExposure+=(1.06+gradeTarget*.16-renderer.toneMappingExposure)*.035;gravity+=(gravityTarget-gravity)*.055;
 if(pulse>0){pulse+=dt*.72;if(pulse>1)pulse=0}backdropUniforms.uPulse.value=pulse;
 if(echoEnergy>0){echoEnergy+=dt*.52;if(echoEnergy>1)echoEnergy=0}backdropUniforms.uEcho.value=echoEnergy;
 const hoveredRelic=updateRelics(dt,t),awardHit=ray.intersectObjects(awardBadgeMeshes,false)[0],hoveredAward=awardHit?.object.userData.award;
 if(model){ray.setFromCamera(pointer,camera);head.getWorldPosition(headNdc);headNdc.project(camera);const nearCube=Math.hypot(pointer.x-headNdc.x,pointer.y-headNdc.y)<.66&&pointer.y>headNdc.y-.46;hoverTarget=(forceReveal||humanLock)?1:(nearCube?1:0);reveal+=(hoverTarget-reveal)*.075;expressionGoal=hoverTarget?.72:.36;canvas.style.cursor=(hoverTarget||hoveredRelic||hoveredAward)?'pointer':'default';document.body.classList.toggle('cube-hover',hoverTarget>.5);backdropUniforms.uReveal.value=reveal;faceParts.forEach(o=>{o.visible=false;o.material.opacity=0});const humanFade=hasSidFace?THREE.MathUtils.smoothstep(reveal,.26,.86):0,robotFade=1-humanFade;sidFaceParts.forEach(o=>{o.visible=humanFade>.008;o.material.opacity=humanFade;o.material.depthWrite=humanFade>.68});robotParts.forEach(o=>{o.visible=robotFade>.008;if(o.userData.eyeUniforms)o.userData.eyeUniforms.uOpacity.value=robotFade;else if(o.material.uniforms?.uOpacity)o.material.uniforms.uOpacity.value=robotFade;else o.material.opacity=robotFade;o.scale.y=.82+reveal*.18});if(glassMesh){const refractionSurge=effectKind===2?effectStrength*.13:0;glassMesh.material.opacity=.28-reveal*.040;glassMesh.material.envMapIntensity=2.75+reveal*.70+voiceEnergy*.45;glassMesh.material.dispersion=.085+reveal*.050+refractionSurge;glassMesh.material.thickness=1.20+reveal*.22+refractionSurge*2.0;glassMesh.material.iridescence+=(.20+reveal*.22+(effectKind===1?effectStrength*.32:0)-glassMesh.material.iridescence)*.045;if(glassInner){glassInner.material.opacity=.050+reveal*.024+voiceEnergy*.018;glassInner.material.dispersion=.11+reveal*.045+refractionSurge*.55}}const effectPhase=1-effectStrength,easeKick=Math.sin(effectPhase*Math.PI)*effectStrength;model.position.copy(modelBasePosition);model.scale.setScalar(baseScale*(1+(effectKind===2?easeKick*.065:0)));model.position.y+=(effectKind===0?easeKick*.12:effectKind===4?Math.abs(Math.sin(effectPhase*Math.PI*2))*effectStrength*.28:0);model.position.z+=effectKind===5?easeKick*.20:0;model.rotation.y=.035+(effectKind===1?easeKick*.10:0);model.rotation.z=effectKind===3?easeKick*.065:0;pointerLight.intensity=4+reveal*24+echoEnergy*36+voiceEnergy*24;pointerLight.position.set(1.35+smoothPointer.x*1.7,1.35+smoothPointer.y*.9,2.4)}

 expression+=(expressionGoal-expression)*.045;const blinkPhase=(t+1.37)%5.2,blink=blinkPhase<.18?Math.sin(blinkPhase/.18*Math.PI):0;
 irises.forEach(o=>{o.position.x=o.userData.basePosition.x+smoothPointer.x*.027;o.position.z=o.userData.basePosition.z+smoothPointer.y*.020;o.scale.z=o.userData.baseScale.z*(1-blink*.86)});
 eyeWhites.forEach(o=>{o.scale.z=o.userData.baseScale.z*(1-blink*.86)});
 brows.forEach((o,i)=>{o.position.z=o.userData.basePosition.z+expression*.020+Math.sin(t*.38+i)*.004;o.rotation.y=o.userData.baseRotation.y+(i?1:-1)*expression*.06});
 const moodIndex=forcedMood??((Math.floor(t/7.4)+moodOffset)%moodPresets.length),moodTarget=moodPresets[moodIndex];for(const k in mood)mood[k]+=(moodTarget[k]-mood[k])*.075;
 if(faceMesh?.morphTargetDictionary){const d=faceMesh.morphTargetDictionary,mi=faceMesh.morphTargetInfluences;for(const [name,target] of [['Smile',moodIndex===3?.72:0],['BrowUp',moodIndex===1?.58:0],['JawOpen',moodIndex===2?.48:0]])if(d[name]!==undefined)mi[d[name]]+=(target-mi[d[name]])*.075}
 const glancePull=Math.sin(Math.min(1,impactGlanceStrength)*Math.PI)*.9;
 robotEyes.forEach((o,i)=>{const side=i?1:-1;o.position.x=o.userData.basePosition.x+smoothPointer.x*.060+impactGlance.x*glancePull*.085+side*(moodIndex===2?.026:0);o.position.z=o.userData.basePosition.z+smoothPointer.y*.042+impactGlance.y*glancePull*.055+mood.lift+side*mood.asym;o.scale.x=o.userData.baseScale.x*mood.width;o.scale.y=o.userData.baseScale.y*(1-blink*.94)*mood.height;o.rotation.y=side*mood.tilt;const eyeColors=[0xeefaff,0xaeefff,0xffe8c0,0xc8fbff],c=eyeColors[moodIndex];if(o.userData.eyeUniforms){o.userData.eyeUniforms.uTime.value=t;o.userData.eyeUniforms.uTint.value.setHex(c)}else if(o.material){o.material.color.setHex(c);if(o.material.emissive)o.material.emissive.setHex(c)}});
 const eyeCycle=t%26.0,eyeActive=!reducedMotion&&eyeCycle>24.1&&robotEyes.length>1,eyePhase=THREE.MathUtils.clamp((eyeCycle-24.1)/1.8,0,1);collarBand.getWorldPosition(eyeStart);head?.getWorldPosition(eyeCenter);eyeVoyagers.forEach((voyager,i)=>{if(!eyeActive){voyager.visible=false;return}const side=i?1:-1,angle=eyePhase*Math.PI*2.25+side*.72;eyeOrbit.set(eyeCenter.x+Math.cos(angle)*1.46,eyeCenter.y+Math.sin(angle)*.92,eyeCenter.z+.82+Math.sin(angle*.66)*.28);robotEyes[i].getWorldPosition(eyeTarget);const launch=eyeStart.clone().add(new THREE.Vector3(side*.14,.02,.18));if(eyePhase<.24)voyager.position.lerpVectors(launch,eyeOrbit,THREE.MathUtils.smoothstep(eyePhase,0,.24));else if(eyePhase<.78)voyager.position.copy(eyeOrbit);else voyager.position.lerpVectors(eyeOrbit,eyeTarget,THREE.MathUtils.smoothstep(eyePhase,.78,1));voyager.visible=true;voyager.material.opacity=Math.sin(eyePhase*Math.PI)*.92;voyager.rotation.z=angle;voyager.scale.set(.58,1.75,.42).multiplyScalar(.72+Math.sin(eyePhase*Math.PI)*.48)});if(eyeActive)robotEyes.forEach(o=>{if(o.userData.eyeUniforms)o.userData.eyeUniforms.uOpacity.value*=THREE.MathUtils.smoothstep(eyePhase,.78,1)});
 if(robotMouth){robotMouth.scale.x=robotMouth.userData.baseScale.x*mood.mouthWidth*(1+voiceEnergy*.42);robotMouth.scale.z=robotMouth.userData.baseScale.z*mood.mouthHeight*(1+voiceEnergy*2.5);robotMouth.rotation.y=mood.mouthTilt;robotMouth.position.z=robotMouth.userData.basePosition.z+mood.mouthLift}
 if(head){const breathe=reducedMotion?0:Math.sin(t*.34)*.006;
  // The face is a side of the cube, so the head swivels on its cradle to keep
  // that side pointed at the camera. Go overhead and it tips up to find you.
  head.rotation.order='YXZ';
  model.worldToLocal(headLook.copy(camera.position));
  headLook.sub(head.position);
  const flat=Math.hypot(headLook.x,headLook.z);
  const wantYaw=Math.atan2(headLook.x,headLook.z);
  const wantPitch=THREE.MathUtils.clamp(-Math.atan2(headLook.y,flat)*.92,-1.02,.22);
  let spin=wantYaw-head.rotation.y;while(spin>Math.PI)spin-=Math.PI*2;while(spin<-Math.PI)spin+=Math.PI*2;
  head.rotation.y+=spin*.055;
  head.rotation.x+=(wantPitch+smoothPointer.y*.055+breathe-head.rotation.x)*.055;
  head.rotation.z+=(-smoothPointer.x*.030-head.rotation.z)*.032;faceParts.forEach(o=>{if(o.name==='FACE_HEAD_REAL'){o.rotation.y+=(smoothPointer.x*.10-o.rotation.y)*.025;o.rotation.x+=(-smoothPointer.y*.055-o.rotation.x)*.025}})}
 awardParts.forEach((o,i)=>{o.rotation.y=o.userData.baseRotation.y+Math.sin(t*.12+i*1.5)*.018;o.rotation.z=o.userData.baseRotation.z+Math.sin(t*.09+i)*.005;if(o.material&&'emissiveIntensity'in o.material)o.material.emissiveIntensity=.16+Math.max(0,Math.sin(t*.16+i*2.4))*.10;if(o.userData.shimmer)o.userData.shimmer.value=t+i*7.4});awardBadges.forEach((badge,i)=>{const active=badge===hoveredAward?1:0,targetScale=active?1.08:1;badge.group.scale.setScalar(THREE.MathUtils.lerp(badge.group.scale.x,targetScale,.12));badge.group.rotation.y=Math.sin(t*.16+i*1.8)*.022+active*smoothPointer.x*.10;badge.group.position.y=BADGE_MOUNT_Y+Math.sin(t*.32+i*2.1)*.006;badge.trim.material.opacity+=(.38+active*.58-badge.trim.material.opacity)*.14;badge.shineUniforms.uTime.value=t+i*.8;badge.shineUniforms.uHover.value+=(active-badge.shineUniforms.uHover.value)*.14});
 emergence.quaternion.copy(camera.quaternion);emergenceUniforms.uTime.value=reducedMotion?0:t;emergenceUniforms.uReveal.value=reveal;
 trailUniforms.uOpacity.value+=(hoverTarget*.62-trailUniforms.uOpacity.value)*.12;if(!hoverTarget)trailReady=false;if(hoverTarget&&ray.ray.intersectPlane(trailPlane,trailWorld)){const a=trailGeometry.attributes.position.array;if(!trailReady){for(let i=0;i<trailCount;i++){a[i*3]=trailWorld.x;a[i*3+1]=trailWorld.y;a[i*3+2]=trailWorld.z}trailReady=true}else{for(let i=trailCount-1;i>0;i--){a[i*3]+=(a[(i-1)*3]-a[i*3])*.31;a[i*3+1]+=(a[(i-1)*3+1]-a[i*3+1])*.31;a[i*3+2]+=(a[(i-1)*3+2]-a[i*3+2])*.31}a[0]=trailWorld.x;a[1]=trailWorld.y;a[2]=trailWorld.z}trailGeometry.attributes.position.needsUpdate=true}
 reflectionUniforms.uTime.value=t;reflectionUniforms.uPointer.value.lerp(smoothPointer,.035);reflectionUniforms.uReveal.value=reveal;
 if((!reducedMotion&&reflectionFrame++%reflectionStride===0)||(reducedMotion&&reflectionFrame++===0)){reflectionWorld.rotation.y=t*.008+smoothPointer.x*.035;reflectionCamera.update(renderer,scene)}
 echoShells.forEach(shell=>{shell.visible=false;shell.material.opacity=0});chestCore.rotation.y=t*.08;plinthRing.material.opacity=.055+reveal*.085+voiceEnergy*.16;seatRing.material.opacity=.03+reveal*.05;chestCore.material.emissiveIntensity=.26+reveal*.45+Math.max(0,Math.sin(t*.75))*.08;circuitUniforms.uTime.value=t;circuitUniforms.uEnergy.value=reveal;basePulse.forEach((o,i)=>{if(o.userData.current)o.userData.current.value=t+i*.31;if(o.material&&'emissiveIntensity'in o.material)o.material.emissiveIntensity=.24+reveal*.48});umbilicals.forEach((o,i)=>o.rotation.z=Math.sin(t*.28+i)*.004);key.color.lerp(gradeTarget?keyWarm:keyCool,.04);rim.color.lerp(gradeTarget?rimWarm:rimCool,.04);key.intensity+=(118+gradeTarget*40-key.intensity)*.04;
 if(confettiLife>0){confettiLife=Math.max(0,confettiLife-dt*.38);confetti.material.opacity=Math.min(1,confettiLife*1.8);const a=confettiGeometry.attributes.position.array;for(let i=0;i<confettiCount;i++){const v=confettiVelocity[i];v.y-=dt*.72;v.multiplyScalar(1-dt*.16);a[i*3]+=v.x*dt;a[i*3+1]+=v.y*dt;a[i*3+2]+=v.z*dt}confettiGeometry.attributes.position.needsUpdate=true}
 paintTexture.needsUpdate=true;skyUniforms.uTime.value=reducedMotion?0:t;
 bloom.strength+=(.18+(effectKind===4?effectStrength*.24:0)+voiceEnergy*.08-bloom.strength)*.08;dustUniforms.uTime.value=t;dust.rotation.y=t*.003;composer.render()}
startFrames();
