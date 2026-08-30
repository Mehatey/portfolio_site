import * as THREE from "three";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { AfterimagePass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/AfterimagePass.js";
import { RoomEnvironment } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/environments/RoomEnvironment.js";

const canvas = document.querySelector("#scene");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, .08, 80);
camera.position.set(0, 0, 8.6);
const root = new THREE.Group();
scene.add(root);

const pmrem = new THREE.PMREMGenerator(renderer);
const environment = pmrem.fromScene(new RoomEnvironment(), .035).texture;
scene.environment = environment;
pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xdcebe7, 0x030814, 1.35));
const key = new THREE.DirectionalLight(0xf4f0df, 3.2);
key.position.set(-4, 6, 7);
scene.add(key);
const rim = new THREE.PointLight(0x3977ff, 34, 20, 1.7);
rim.position.set(4, -1, 4);
scene.add(rim);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const afterimage = new AfterimagePass();
afterimage.uniforms.damp.value = reducedMotion ? 0 : .72;
composer.addPass(afterimage);
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .34, .65, .62);
composer.addPass(bloom);
const finish = new ShaderPass({
  uniforms: { tDiffuse:{value:null}, uTime:{value:0}, uMotion:{value:0}, uResolution:{value:new THREE.Vector2()} },
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`
    precision highp float; uniform sampler2D tDiffuse; uniform float uTime,uMotion; uniform vec2 uResolution; varying vec2 vUv;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    void main(){vec2 p=vUv-.5;vec2 d=normalize(p+1e-5);float s=.00038+uMotion*.0011;
      vec3 c=vec3(texture2D(tDiffuse,vUv+d*s).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-d*s).b);
      float grain=h(floor(vUv*uResolution*.62)+floor(uTime*12.))-.5;c+=grain*(.018+uMotion*.012)*vec3(.42,.62,.78);
      c*=.73+.27*smoothstep(.78,.18,length(p));gl_FragColor=vec4(c,1.);}`
});
composer.addPass(finish);

const palette = {
  ink:new THREE.Color(0x020817), cobalt:new THREE.Color(0x1647bb), sea:new THREE.Color(0x3e9993),
  slate:new THREE.Color(0x38516a), paper:new THREE.Color(0xe3dfd0), moss:new THREE.Color(0x648875), glacier:new THREE.Color(0x9bc8c5), mist:new THREE.Color(0xdedbcf), deepSea:new THREE.Color(0x06263e)
};

// One authored Indian ceramic chapter. Continuous hand-painted surface, never a glyph grid.
function makeIndianBluePattern(){
  const c=document.createElement("canvas"),ctx=c.getContext("2d"),S=1024;
  c.width=c.height=S;ctx.fillStyle="#e8dfc6";ctx.fillRect(0,0,S,S);
  const indigo="#174f91",deep="#0b315f",sea="#5f9991",aged="#bcae86";
  ctx.lineCap="round";ctx.lineJoin="round";
  // One continuous hand-painted composition. Faces reveal different crops, never a repeated tile grid.
  ctx.strokeStyle=aged;ctx.lineWidth=8;ctx.strokeRect(28,28,S-56,S-56);
  ctx.strokeStyle=indigo;ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(-70,850);ctx.bezierCurveTo(210,670,158,305,470,260);ctx.bezierCurveTo(734,222,700,620,1100,472);ctx.stroke();
  ctx.strokeStyle=deep;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-30,906);ctx.bezierCurveTo(268,742,225,386,500,330);ctx.bezierCurveTo(790,270,760,696,1080,540);ctx.stroke();
  function lotus(x,y,r,rot=0){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.strokeStyle=indigo;ctx.fillStyle="rgba(95,153,145,.36)";ctx.lineWidth=9;for(let k=0;k<8;k++){ctx.save();ctx.rotate(k*Math.PI/4);ctx.beginPath();ctx.moveTo(0,-r*.18);ctx.bezierCurveTo(r*.28,-r*.48,r*.25,-r*.88,0,-r);ctx.bezierCurveTo(-r*.25,-r*.88,-r*.28,-r*.48,0,-r*.18);ctx.fill();ctx.stroke();ctx.restore();}ctx.fillStyle=deep;ctx.beginPath();ctx.arc(0,0,r*.12,0,Math.PI*2);ctx.fill();ctx.restore();}
  function paisley(x,y,s,rot=0){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);ctx.strokeStyle=indigo;ctx.lineWidth=10/s;ctx.beginPath();ctx.moveTo(0,110);ctx.bezierCurveTo(112,55,118,-64,36,-126);ctx.bezierCurveTo(65,-35,-30,-5,0,110);ctx.stroke();ctx.strokeStyle=sea;ctx.lineWidth=6/s;ctx.beginPath();ctx.moveTo(24,72);ctx.bezierCurveTo(68,34,72,-32,42,-71);ctx.stroke();ctx.restore();}
  lotus(250,735,138,-.18);lotus(785,205,105,.28);paisley(565,560,1.28,.4);paisley(875,805,.72,-.6);paisley(160,195,.62,-.2);
  ctx.globalAlpha=.2;ctx.fillStyle=indigo;for(let i=0;i<34;i++){const x=(i*193)%S,y=(i*i*71)%S,r=3+(i%4);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  const data=ctx.getImageData(0,0,S,S);for(let i=0;i<data.data.length;i+=4){const grain=(Math.random()-.5)*14;data.data[i]+=grain;data.data[i+1]+=grain;data.data[i+2]+=grain;}ctx.putImageData(data,0,0);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;return texture;
}
const indianBluePattern=makeIndianBluePattern();
indianBluePattern.colorSpace=THREE.SRGBColorSpace;
indianBluePattern.wrapS=indianBluePattern.wrapT=THREE.MirroredRepeatWrapping;
indianBluePattern.repeat.set(1,1);
indianBluePattern.anisotropy=8;

const sky = new THREE.ShaderMaterial({
  side:THREE.BackSide,depthWrite:false,toneMapped:false,
  uniforms:{uTime:{value:0},uScroll:{value:0},uPointer:{value:new THREE.Vector2()},uA:{value:palette.ink.clone()},uB:{value:palette.cobalt.clone()},uC:{value:palette.sea.clone()}},
  vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`
    precision highp float;varying vec3 vP;uniform float uTime,uScroll;uniform vec2 uPointer;uniform vec3 uA,uB,uC;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    float f(vec2 p){float v=.5*n(p);p=p*2.03+7.;v+=.25*n(p);p=p*2.07-3.;v+=.125*n(p);return v;}
    void main(){vec3 d=normalize(vP);vec2 p=d.xz*1.36+uPointer*.06+vec2(uTime*.008,-uTime*.006);float a=f(p+f(p*1.55));float b=f(p*1.72-a*.8);
      float wash=smoothstep(.12,.9,a*.72+b*.42);vec3 c=mix(uA,uB,wash*.8);c=mix(c,uC,smoothstep(.52,.96,b)*.36);float bloomA=exp(-2.1*length(p-vec2(-.74,.28+sin(uTime*.06)*.12)));float bloomB=exp(-2.6*length(p-vec2(.72,-.35)));c=mix(c,uC,bloomA*.2);c=mix(c,uB,bloomB*.13);float glow=.018*sin(uScroll*4.+a*2.)+.024*exp(-7.*length(p-uPointer*.16));c=clamp(c+glow,0.,1.);gl_FragColor=vec4(c,1.);}`
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(30, 48, 32), sky));

const panelUniforms = [];
function makePanelMaterial(index){
  const bases=[palette.paper,palette.cobalt,palette.sea,palette.slate,palette.moss,palette.paper];
  const accents=[palette.sea,palette.paper,palette.cobalt,palette.paper,palette.cobalt,palette.slate];
  const uniforms={uTime:{value:0},uMode:{value:index},uHover:{value:0},uClick:{value:0},uOpacity:{value:1},uPatternAmount:{value:0},uPattern:{value:indianBluePattern},uBase:{value:bases[index].clone()},uAccent:{value:accents[index].clone()}};
  panelUniforms.push(uniforms);
  return new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,uniforms,
    vertexShader:`varying vec2 vUv;varying vec3 vN,vW;uniform float uTime,uHover,uClick;void main(){vUv=uv;vec3 p=position;float r=sin(uv.x*9.+uTime*.55)*sin(uv.y*8.-uTime*.42);p.z+=r*(.006+.018*uHover)+sin((uv.x+uv.y)*18.+uTime)*.01*uClick;vec4 w=modelMatrix*vec4(p,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`
      precision highp float;varying vec2 vUv;varying vec3 vN,vW;uniform float uTime,uMode,uHover,uClick,uOpacity,uPatternAmount;uniform sampler2D uPattern;uniform vec3 uBase,uAccent;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
      float fbm(vec2 p){float v=.5*n(p);p=p*2.1+4.;v+=.25*n(p);p=p*2.07-2.;v+=.125*n(p);return v;}
      void main(){vec2 p=vUv*3.4;float a=fbm(p+vec2(uTime*.045,-uTime*.03));float b=fbm(p*2.2+a*2.5-vec2(uTime*.06,0.));
        float bloomInk=smoothstep(.52,.78,a+b*.22+uHover*.18+uClick*.25);vec3 col=mix(uBase,uAccent,bloomInk*(.22+.55*mod(uMode,3.)));
        float fres=pow(1.-max(0.,dot(normalize(vN),normalize(cameraPosition-vW))),2.5);
        if(mod(uMode,6.)>2.5&&mod(uMode,6.)<4.5)col=mix(col,vec3(.74,.9,.93),fres*(.42+.35*uHover));
        if(mod(uMode,6.)>4.5)col=mix(col,vec3(.05,.12,.18),.42)+vec3(.18,.42,.55)*pow(fres,2.);
        float paper=(h(floor(vUv*420.))-.5)*.09;float edge=smoothstep(.035,.0,min(min(vUv.x,vUv.y),min(1.-vUv.x,1.-vUv.y)));
        float pa=(uMode-2.5)*.13;mat2 pr=mat2(cos(pa),-sin(pa),sin(pa),cos(pa));vec2 puv=pr*(vUv-.5)+.5+vec2(mod(uMode,2.)*.07,mod(uMode,3.)*.035);vec3 ceramic=texture2D(uPattern,puv).rgb;ceramic=mix(ceramic,ceramic*vec3(.82,.94,1.08),b*.18);col=mix(col,ceramic,uPatternAmount);
        col+=paper+edge*mix(vec3(.08,.18,.23),uAccent,.35)+fres*.11;gl_FragColor=vec4(col,uOpacity*(.82+.18*b));}`
  });
}

const panelGeo=new THREE.BoxGeometry(2.5,2.5,.085,24,24,2);
const panels=[];
const faceDefs=[
  {p:[0,0,1.292],r:[0,0,0]},{p:[0,0,-1.292],r:[0,Math.PI,0]},
  {p:[1.292,0,0],r:[0,Math.PI/2,0]},{p:[-1.292,0,0],r:[0,-Math.PI/2,0]},
  {p:[0,1.292,0],r:[-Math.PI/2,0,0]},{p:[0,-1.292,0],r:[Math.PI/2,0,0]}
];
faceDefs.forEach((d,i)=>{const g=new THREE.Group(),m=new THREE.Mesh(panelGeo,makePanelMaterial(i));m.userData.panel=i;g.add(m);g.position.fromArray(d.p);g.rotation.set(...d.r);root.add(g);panels.push(g);});

const inkMat=new THREE.MeshBasicMaterial({color:0x07111f,toneMapped:false});
function roundedMark(w,h,r){const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return new THREE.ShapeGeometry(s);}
const expression=new THREE.Group();expression.position.z=.055;panels[0].add(expression);
const leftEye=new THREE.Mesh(roundedMark(.105,.7,.052),inkMat);leftEye.position.set(-.42,.18,0);expression.add(leftEye);
const rightEye=leftEye.clone();rightEye.position.x=.42;expression.add(rightEye);
const mouth=new THREE.Mesh(roundedMark(.34,.045,.02),inkMat);mouth.position.set(0,-.38,0);expression.add(mouth);

const qFrom=r=>new THREE.Quaternion().setFromEuler(new THREE.Euler(...r));
const closed=faceDefs.map(d=>({p:new THREE.Vector3(...d.p),q:qFrom(d.r)}));
const netP=[[0,0,0],[5.08,0,0],[2.54,0,0],[-2.54,0,0],[0,2.54,0],[0,-2.54,0]];
const net=netP.map(p=>({p:new THREE.Vector3(...p),q:new THREE.Quaternion()}));
const orbit=faceDefs.map((d,i)=>{const a=i/6*Math.PI*2;return{p:new THREE.Vector3(Math.cos(a)*3.15,Math.sin(a)*2.2,Math.sin(a*2)*.9),q:qFrom([Math.sin(a)*.6,a+.45,Math.cos(a)*.35])};});

const nested=new THREE.Group();root.add(nested);
[[2.25,0x1c5bb5,.34,.72],[1.62,0x56a99f,.2,.86],[1.02,0xdfe4d9,.1,.92]].forEach(([size,color,metal,trans],i)=>{
  const mat=new THREE.MeshPhysicalMaterial({color,metalness:metal,roughness:.08,transmission:trans,thickness:1.15,ior:1.35,transparent:true,opacity:0,envMap:environment,envMapIntensity:2.2,clearcoat:1,iridescence:.45,depthWrite:false});
  const cube=new THREE.Mesh(new THREE.BoxGeometry(size,size,size,3,3,3),mat);cube.userData.index=i;nested.add(cube);
});

const slices=new THREE.Group();root.add(slices);
for(let i=0;i<15;i++){const mat=new THREE.MeshPhysicalMaterial({color:[0x163f8f,0x3c8d87,0xd9ddd1,0x354d62][i%4],metalness:i%4===3?.72:.08,roughness:.14,transmission:i%3===0?.55:0,transparent:true,opacity:0,envMap:environment,envMapIntensity:1.9,clearcoat:1});const cube=new THREE.Mesh(new THREE.BoxGeometry(2.45,.12,2.45),mat);cube.position.y=(i-7)*.18;slices.add(cube);}

const voxelN=11,voxelPositions=[];
for(let x=0;x<voxelN;x++)for(let y=0;y<voxelN;y++)for(let z=0;z<voxelN;z++)if(x===0||y===0||z===0||x===voxelN-1||y===voxelN-1||z===voxelN-1)voxelPositions.push(new THREE.Vector3(x-5,y-5,z-5).multiplyScalar(.225));
const voxelMat=new THREE.ShaderMaterial({uniforms:{uOpacity:{value:0}},transparent:true,depthWrite:false,toneMapped:false,vertexShader:`varying vec3 vColor;void main(){vColor=instanceColor;vec4 mv=modelViewMatrix*instanceMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform float uOpacity;varying vec3 vColor;void main(){vec3 glow=vColor*(1.05+.18*max(max(vColor.r,vColor.g),vColor.b));gl_FragColor=vec4(glow,uOpacity);}`});
const voxels=new THREE.InstancedMesh(new THREE.BoxGeometry(.18,.18,.18),voxelMat,voxelPositions.length);voxels.frustumCulled=false;root.add(voxels);
const dummy=new THREE.Object3D(),voxelColors=[new THREE.Color(0xf0ead7),new THREE.Color(0x2868da),new THREE.Color(0x56b8b0),new THREE.Color(0x87aec9),new THREE.Color(0xb9d8d3),new THREE.Color(0x17488f)];
const voxelMotion=voxelPositions.map((p,i)=>{const seed=((i*16807)%997)/997,dir=p.clone().normalize(),tangent=new THREE.Vector3(-dir.z,.28+seed*.3,dir.x).normalize();return{seed,dir,tangent};});
voxelPositions.forEach((p,i)=>{dummy.position.copy(p);dummy.updateMatrix();voxels.setMatrixAt(i,dummy.matrix);const axis=Math.abs(p.x)>Math.abs(p.y)&&Math.abs(p.x)>Math.abs(p.z)?1:Math.abs(p.y)>Math.abs(p.z)?2:3;const color=voxelColors[(axis+(p.x+p.y+p.z>0?2:0)+i%2)%voxelColors.length].clone().lerp(voxelColors[0],voxelMotion[i].seed*.12);voxels.setColorAt(i,color);});
voxels.instanceColor.needsUpdate=true;

const pointer=new THREE.Vector2(),pointerTarget=new THREE.Vector2(),raycaster=new THREE.Raycaster();
let hovered=-1,dragging=false,lastX=0,lastY=0,dragX=0,dragY=0,scrollTarget=0,scrollNow=0,scrollVelocity=0,manualYaw=0,manualPitch=0;
const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp,smooth=t=>t*t*t*(t*(t*6-15)+10);
function chapter(progress){const scaled=progress*7,idx=Math.min(6,Math.floor(scaled));return{idx,t:smooth(scaled-idx)};}
const posePosition=new THREE.Vector3(),poseQuaternion=new THREE.Quaternion();
function blendPose(a,b,t,dt){const ease=1-Math.exp(-dt*8.5);panels.forEach((g,i)=>{posePosition.lerpVectors(a[i].p,b[i].p,t);poseQuaternion.slerpQuaternions(a[i].q,b[i].q,t);g.position.lerp(posePosition,ease);g.quaternion.slerp(poseQuaternion,ease);});}

addEventListener("pointermove",e=>{pointerTarget.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight*2-1));if(dragging){dragY+=(e.clientX-lastX)*.005;dragX+=(e.clientY-lastY)*.005;lastX=e.clientX;lastY=e.clientY;}});
addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;document.body.classList.add("dragging");});
addEventListener("pointerup",()=>{dragging=false;document.body.classList.remove("dragging");if(hovered>=0){const u=panelUniforms[hovered];u.uMode.value=(u.uMode.value+1)%6;u.uClick.value=1;}});

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.create({trigger:"main",start:"top top",end:"bottom bottom",scrub:true,onUpdate:self=>scrollTarget=self.progress});

const clock=new THREE.Clock();let prevScroll=0;
function updatePanels(time,dt,p){
  const {idx,t}=chapter(p),poses=[closed,net,orbit,closed,closed,closed,closed,closed];blendPose(poses[idx],poses[idx+1],t,dt);
  const panelOpacity=(idx>=2&&idx<=5)?(idx===2?1-t:idx===5?t:0):1;
  const patternTarget=idx===1?t:idx===2?1-t:0;
  panelUniforms.forEach((u,i)=>{u.uTime.value=time;u.uOpacity.value=lerp(u.uOpacity.value,panelOpacity,1-Math.exp(-dt*7));u.uPatternAmount.value=lerp(u.uPatternAmount.value,patternTarget,1-Math.exp(-dt*6));u.uHover.value=lerp(u.uHover.value,i===hovered?1:0,1-Math.exp(-dt*9));u.uClick.value*=Math.exp(-dt*2.4);});
  if(idx===0)root.scale.setScalar(lerp(1,.78,t));
  if(idx===1)root.scale.setScalar(lerp(.78,.88,t));
  if(idx===2)root.scale.setScalar(lerp(.88,1,t));
  if(idx>=3)root.scale.setScalar(1);
  nested.visible=idx>=2&&idx<=4;
  nested.children.forEach((c,i)=>{const vis=idx===2?t:idx===3?1:idx===4?1-t:0;c.material.opacity=lerp(c.material.opacity,vis*(.27-i*.045),1-Math.exp(-dt*7));c.rotation.x=time*(.08+i*.045);c.rotation.y=-time*(.12+i*.07);c.scale.setScalar(1+.08*Math.sin(time*.8+i));});
  slices.visible=idx>=3&&idx<=5;
  slices.children.forEach((c,i)=>{const vis=idx===3?t:idx===4?1:idx===5?1-t:0;c.material.opacity=lerp(c.material.opacity,vis*.9,1-Math.exp(-dt*8));const spread=idx===4?lerp(1,2.8,t):idx===5?lerp(2.8,1,t):1;c.position.y=(i-7)*.18*spread;c.rotation.y=(i-7)*.018*Math.sin(time*.6);});
  const voxelVis=idx===4?smooth(t):idx===5?1:idx===6?1-smooth(t):0;voxelMat.opacity=lerp(voxelMat.opacity,voxelVis,1-Math.exp(-dt*8));voxelMat.uniforms.uOpacity.value=voxelMat.opacity;voxels.visible=voxelMat.opacity>.01;
  if(voxels.visible){const explode=idx===5?smooth(t):idx===6?1-smooth(t):0,energy=smooth(explode),arc=Math.sin(energy*Math.PI);voxelPositions.forEach((base,i)=>{const m=voxelMotion[i];dummy.position.copy(base).addScaledVector(m.dir,energy*(.65+m.seed*2.6)).addScaledVector(m.tangent,Math.sin(m.seed*19+energy*5.2)*arc*(.25+m.seed*.95));dummy.position.y+=arc*(.4+m.seed*1.25)-energy*energy*(.12+m.seed*.55);dummy.rotation.set(energy*m.seed*5.2,energy*(1-m.seed)*6.4,energy*m.seed*3.8);dummy.scale.setScalar(.96-energy*.32+arc*.08*Math.sin(m.seed*31));dummy.updateMatrix();voxels.setMatrixAt(i,dummy.matrix);});voxels.instanceMatrix.needsUpdate=true;voxels.rotation.y=lerp(voxels.rotation.y,(p-.62)*2.4,1-Math.exp(-dt*3.5));}
  if(idx===6){const glow=smooth(t);panelUniforms.forEach((u,i)=>{u.uMode.value=i===0?0:3+i%3;u.uOpacity.value=glow;});root.scale.setScalar(lerp(.82,1.05,t));}
}

function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04),time=clock.elapsedTime;
  scrollVelocity+=(scrollTarget-scrollNow)*dt*46;scrollVelocity*=Math.exp(-dt*9.2);scrollNow=clamp(scrollNow+scrollVelocity*dt,0,1);const velocity=Math.abs(scrollVelocity);prevScroll=scrollNow;
  pointer.lerp(pointerTarget,1-Math.exp(-dt*7));raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(panels.map(p=>p.children[0]),false);hovered=hits.length?hits[0].object.userData.panel:-1;document.body.classList.toggle("hovering",hovered>=0);
  manualYaw+=dragY*.018;manualPitch=clamp(manualPitch+dragX*.014,-.6,.6);dragX*=Math.exp(-dt*5.2);dragY*=Math.exp(-dt*5.2);
  const storyYaw=scrollNow*Math.PI*1.15+Math.sin(time*.18)*.08;
  root.rotation.x=lerp(root.rotation.x,manualPitch+pointer.y*.09,1-Math.exp(-dt*5));root.rotation.y=lerp(root.rotation.y,manualYaw+storyYaw+pointer.x*.07,1-Math.exp(-dt*5));
  camera.position.x=lerp(camera.position.x,pointer.x*.18+Math.sin(scrollNow*Math.PI*2)*.22,1-Math.exp(-dt*3.2));camera.position.y=lerp(camera.position.y,pointer.y*.1+Math.sin(scrollNow*Math.PI)*.12,1-Math.exp(-dt*3.2));camera.position.z=lerp(camera.position.z,8.6-.45*Math.sin(scrollNow*Math.PI),1-Math.exp(-dt*3.2));camera.lookAt(0,0,0);
  expression.position.x=pointer.x*.045;expression.position.y=pointer.y*.025;const blink=(Math.sin(time*.72)+Math.sin(time*1.13)>.98)?.08:1;leftEye.scale.y=lerp(leftEye.scale.y,blink,.3);rightEye.scale.y=leftEye.scale.y;mouth.rotation.z=Math.sin(time*.5)*.035;mouth.scale.x=.82+.18*Math.sin(time*.43);
  updatePanels(time,dt,scrollNow);
  const bgPhase=scrollNow*4.2;sky.uniforms.uA.value.lerpColors(palette.deepSea,palette.cobalt,.16+.18*Math.sin(bgPhase*.53));sky.uniforms.uB.value.lerpColors(palette.sea,palette.glacier,.48+.42*Math.sin(bgPhase*.71));sky.uniforms.uC.value.lerpColors(palette.mist,palette.paper,.5+.32*Math.cos(bgPhase*.47));sky.uniforms.uTime.value=time;sky.uniforms.uScroll.value=scrollNow;sky.uniforms.uPointer.value.copy(pointer);
  rim.color.lerpColors(palette.cobalt,palette.sea,.5+.5*Math.sin(time*.18));afterimage.uniforms.damp.value=reducedMotion?0:clamp(.68+velocity*.002,.68,.82);bloom.strength=.28+clamp(velocity*.008,0,.22);finish.uniforms.uTime.value=time;finish.uniforms.uMotion.value=clamp(velocity*.025,0,1);composer.render();
}

function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);composer.setSize(innerWidth,innerHeight);finish.uniforms.uResolution.value.set(innerWidth*renderer.getPixelRatio(),innerHeight*renderer.getPixelRatio());}
addEventListener("resize",resize);resize();animate();
