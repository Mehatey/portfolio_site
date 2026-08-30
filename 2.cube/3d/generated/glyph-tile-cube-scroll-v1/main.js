import * as THREE from "three";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { AfterimagePass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/AfterimagePass.js";
import { RoomEnvironment } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/environments/RoomEnvironment.js";

const canvas=document.querySelector("#scene");
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.94;
renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x05080b);
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.08,80);
camera.position.set(0,0,9.2);
const root=new THREE.Group();
scene.add(root);

const pmrem=new THREE.PMREMGenerator(renderer);
const environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;
pmrem.dispose();
scene.environment=environment;
scene.add(new THREE.HemisphereLight(0xe6dfcf,0x07101c,1.35));
const key=new THREE.DirectionalLight(0xffeed0,2.55);key.position.set(-4,6,7);scene.add(key);
const blueRim=new THREE.PointLight(0x2d63ff,34,18,1.8);blueRim.position.set(4,-1,4);scene.add(blueRim);

const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const trail=new AfterimagePass();trail.uniforms.damp.value=.66;composer.addPass(trail);
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.2,.66,.78);composer.addPass(bloom);
const finish=new ShaderPass({
  uniforms:{tDiffuse:{value:null},uTime:{value:0},uVelocity:{value:0},uRes:{value:new THREE.Vector2()}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`
  precision highp float;uniform sampler2D tDiffuse;uniform float uTime,uVelocity;uniform vec2 uRes;varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){vec2 p=vUv-.5;float px=1./uRes.x;float d=(.35+uVelocity*1.6)*px;
    vec3 c=vec3(texture2D(tDiffuse,vUv+vec2(d,0)).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-vec2(d,0)).b);
    float grain=h(floor(vUv*uRes*.55)+floor(uTime*14.))-.5;c+=grain*.026;
    float dither=step(.5,h(floor(vUv*uRes/3.)))*.006;c+=dither;
    c*=.7+.3*smoothstep(.82,.16,length(p));gl_FragColor=vec4(c,1.);}`
});composer.addPass(finish);

function tileTexture(kind){
  const size=256,c=document.createElement("canvas");c.width=c.height=size;const x=c.getContext("2d");
  const cream="#d8c99e",blue="#0d4f94",ink="#25231f",sea="#6caaa3",white="#eee8d5";
  x.fillStyle=kind===1?blue:kind===3?ink:cream;x.fillRect(0,0,size,size);
  x.strokeStyle=kind===1?white:kind===3?cream:blue;x.fillStyle=x.strokeStyle;x.lineWidth=8;x.lineCap="round";x.lineJoin="round";
  x.translate(size/2,size/2);
  if(kind===0){
    for(let i=0;i<8;i++){x.rotate(Math.PI/4);x.beginPath();x.ellipse(0,-58,22,54,0,0,Math.PI*2);x.stroke();}
    x.beginPath();x.arc(0,0,28,0,Math.PI*2);x.fill();x.fillStyle=ink;x.beginPath();x.arc(0,0,10,0,Math.PI*2);x.fill();
  }else if(kind===1){
    for(let i=0;i<4;i++){x.rotate(Math.PI/2);x.beginPath();x.moveTo(0,-100);x.quadraticCurveTo(18,-48,64,-44);x.quadraticCurveTo(18,-25,0,0);x.stroke();}
    x.beginPath();x.arc(0,0,18,0,Math.PI*2);x.fill();
  }else if(kind===2){
    x.strokeStyle=ink;x.lineWidth=13;for(let i=0;i<8;i++){x.rotate(Math.PI/4);x.beginPath();x.moveTo(0,-108);x.lineTo(31,-31);x.lineTo(108,0);x.lineTo(31,31);x.closePath();x.stroke();}
    x.fillStyle=sea;x.beginPath();x.arc(0,0,25,0,Math.PI*2);x.fill();
  }else{
    x.strokeStyle=cream;x.lineWidth=16;for(let i=0;i<4;i++){x.rotate(Math.PI/2);x.beginPath();x.moveTo(-72,-72);x.lineTo(0,0);x.lineTo(72,-72);x.stroke();}
    x.fillStyle=sea;x.beginPath();x.arc(0,0,22,0,Math.PI*2);x.fill();
  }
  const image=x.getImageData(0,0,size,size);for(let i=0;i<image.data.length;i+=4){const n=(Math.random()-.5)*18;image.data[i]+=n;image.data[i+1]+=n;image.data[i+2]+=n;}x.putImageData(image,0,0);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}

const materials=[0,1,2,3].map((k)=>new THREE.MeshPhysicalMaterial({
  map:tileTexture(k),roughness:k===3?.16:.42,metalness:k===3?.55:.05,clearcoat:.72,clearcoatRoughness:.18,
  envMap:environment,envMapIntensity:1.75,transparent:true,opacity:1
}));

const GRID=14,SIZE=3.9,step=SIZE/GRID,tileSize=step*.91;
const geometry=new THREE.BoxGeometry(tileSize,tileSize,.055,1,1,1);
const sets=materials.map((material)=>({material,mesh:new THREE.InstancedMesh(geometry,material,GRID*GRID*6),items:[]}));
sets.forEach(s=>{s.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);s.mesh.frustumCulled=false;root.add(s.mesh);});
const tiles=[];
const basis=[
  {n:new THREE.Vector3(0,0,1),u:new THREE.Vector3(1,0,0),v:new THREE.Vector3(0,1,0),q:new THREE.Quaternion()},
  {n:new THREE.Vector3(0,0,-1),u:new THREE.Vector3(-1,0,0),v:new THREE.Vector3(0,1,0),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.PI,0))},
  {n:new THREE.Vector3(1,0,0),u:new THREE.Vector3(0,0,-1),v:new THREE.Vector3(0,1,0),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.PI/2,0))},
  {n:new THREE.Vector3(-1,0,0),u:new THREE.Vector3(0,0,1),v:new THREE.Vector3(0,1,0),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(0,-Math.PI/2,0))},
  {n:new THREE.Vector3(0,1,0),u:new THREE.Vector3(1,0,0),v:new THREE.Vector3(0,0,-1),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,0))},
  {n:new THREE.Vector3(0,-1,0),u:new THREE.Vector3(1,0,0),v:new THREE.Vector3(0,0,1),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0))}
];
let globalIndex=0;
for(let face=0;face<6;face++)for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){
  const nx=(x+.5)/GRID*2-1,ny=(y+.5)/GRID*2-1;
  const flower=Math.sin(Math.atan2(ny,nx)*8+Math.hypot(nx,ny)*15)>.35;
  const star=(Math.abs(nx)+Math.abs(ny)<.66)||(Math.abs(nx-ny)<.12)||(Math.abs(nx+ny)<.12);
  const motif=(face+x+y)%7===0?3:flower?1:star?2:0;
  const set=sets[motif],tile={face,x,y,nx,ny,motif,set,index:set.items.length,seed:((globalIndex*16807)%997)/997};
  set.items.push(tile);tiles.push(tile);globalIndex++;
}
sets.forEach(s=>s.mesh.count=s.items.length);

const dummy=new THREE.Object3D();
const pointer=new THREE.Vector2(),pointerTarget=new THREE.Vector2();
let scrollTarget=0,scrollNow=0,previous=0,dragging=false,lastX=0,lastY=0,dragX=0,dragY=0;
const lerp=THREE.MathUtils.lerp,clamp=THREE.MathUtils.clamp,smooth=t=>t*t*(3-2*t);
const chapter=p=>{const s=p*6,i=Math.min(5,Math.floor(s));return{i,t:smooth(s-i)};};
function cubePosition(tile){
  const b=basis[tile.face],h=SIZE*.5;
  return b.n.clone().multiplyScalar(h).addScaledVector(b.u,tile.nx*h).addScaledVector(b.v,tile.ny*h);
}
function sheetPosition(tile){
  const panelColumn=tile.face%3,panelRow=Math.floor(tile.face/3);
  return new THREE.Vector3((panelColumn-1)*SIZE+tile.nx*SIZE*.5,(.5-panelRow)*SIZE+tile.ny*SIZE*.5,0);
}
function updateTiles(time,p){
  const {i,t}=chapter(p),ease=smooth(t);
  sets.forEach(s=>s.material.opacity=1);
  sets.forEach(s=>s.items.forEach(tile=>{
    const cube=cubePosition(tile),sheet=sheetPosition(tile),b=basis[tile.face];
    let pos=cube.clone(),q=b.q.clone(),scale=1;
    if(i===0){pos.lerpVectors(sheet,cube,ease);q=new THREE.Quaternion().slerp(b.q,ease);root.scale.setScalar(lerp(.72,1,ease));}
    if(i===1){
      const radial=Math.hypot(tile.nx,tile.ny),pulse=Math.sin(radial*11-time*2.2+tile.face)*.5+.5;
      pos.addScaledVector(b.n,pulse*.15*ease);scale=.82+pulse*.22;root.scale.setScalar(1);
    }
    if(i===2){
      const petals=Math.sin(Math.atan2(tile.ny,tile.nx)*8+time*.7);pos.addScaledVector(b.n,petals*.24*ease);
      q.multiply(new THREE.Quaternion().setFromAxisAngle(b.v,petals*.08*ease));scale=.74+.24*(.5+.5*petals);
    }
    if(i===3){
      const hash=(Math.sin(tile.x*73.3+tile.y*19.7+tile.face*37.1)*43758.5)%1;
      const erode=clamp((ease*1.45)-(Math.abs(hash)*.9),0,1);
      pos.addScaledVector(b.n,erode*(.5+tile.seed*2.4));pos.y+=erode*Math.sin(tile.seed*31+time)*.4;
      q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(erode*tile.seed*4,erode*2,erode*3)));scale=1-erode*.55;
    }
    if(i===4){
      const shell=tile.seed>.66?1.7:tile.seed>.33?1.32:1;pos.multiplyScalar(lerp(1,shell,ease));scale=lerp(1,.72,ease);
      q.multiply(new THREE.Quaternion().setFromAxisAngle(b.n,time*.13*(tile.seed-.5)));
    }
    if(i===5){
      const order=smooth(ease);pos.multiplyScalar(lerp(tile.seed>.66?1.7:tile.seed>.33?1.32:1,1,order));
      const breathe=Math.sin(time*1.2+tile.x*.3+tile.y*.24)*.035;pos.addScaledVector(b.n,breathe*(1-order));scale=lerp(.72,1,order);
    }
    const dx=pointer.x*4-pos.x,dy=pointer.y*2.4-pos.y,near=Math.exp(-(dx*dx+dy*dy)*.7);
    pos.addScaledVector(b.n,near*.18);scale*=1+near*.12;
    dummy.position.copy(pos);dummy.quaternion.copy(q);dummy.scale.setScalar(scale);dummy.updateMatrix();tile.set.mesh.setMatrixAt(tile.index,dummy.matrix);
  }));
  sets.forEach(s=>s.mesh.instanceMatrix.needsUpdate=true);
}

addEventListener("pointermove",e=>{pointerTarget.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight*2-1));if(dragging){dragY+=(e.clientX-lastX)*.006;dragX+=(e.clientY-lastY)*.006;lastX=e.clientX;lastY=e.clientY;}});
addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;document.body.classList.add("dragging");});
addEventListener("pointerup",()=>{dragging=false;document.body.classList.remove("dragging");});
addEventListener("click",()=>{sets.unshift(sets.pop());sets.forEach((s,i)=>{s.material.map=tileTexture(i);s.material.needsUpdate=true;});});

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.create({trigger:"main",start:"top top",end:"bottom bottom",scrub:true,onUpdate:self=>scrollTarget=self.progress});
const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04),time=clock.elapsedTime;
  scrollNow=lerp(scrollNow,scrollTarget,1-Math.exp(-dt*3.8));pointer.lerp(pointerTarget,1-Math.exp(-dt*7));
  const velocity=Math.abs(scrollNow-previous)/Math.max(dt,.001);previous=scrollNow;
  updateTiles(time,scrollNow);
  const auto=.08+scrollNow*.22;root.rotation.y+=dt*auto+dragY*.018;root.rotation.x=lerp(root.rotation.x,dragX+pointer.y*.08,1-Math.exp(-dt*4));dragX*=.97;dragY*=.94;
  camera.position.z=lerp(camera.position.z,9.2-1.3*Math.sin(scrollNow*Math.PI),1-Math.exp(-dt*3));
  trail.uniforms.damp.value=clamp(.63+velocity*.003,.63,.79);bloom.strength=.18+clamp(velocity*.007,0,.18);
  finish.uniforms.uTime.value=time;finish.uniforms.uVelocity.value=clamp(velocity*.025,0,1);composer.render();
}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);composer.setSize(innerWidth,innerHeight);finish.uniforms.uRes.value.set(innerWidth*renderer.getPixelRatio(),innerHeight*renderer.getPixelRatio());}
addEventListener("resize",resize);resize();animate();
