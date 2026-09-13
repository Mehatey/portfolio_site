const fs = require("fs");
process.chdir(__dirname);
const P = require("./projects.json");
const B = "/output/image-review-2026-09-07/round-5/";
for (const p of P)
  for (const a of p.pieces.filter((a) => ["logo", "sequence"].includes(a.type))) {
    const dir = "media/" + p.slug;
    fs.mkdirSync(dir + "/frames-" + a.id, { recursive: true });
    const assets =
      a.type === "logo"
        ? [p.slug === "naavo" || p.slug === "aananda" ? "assets/" + p.slug + "-motion.png" : a.logoAsset]
        : a.items.map((i) => i.asset);
    const data = { p, a, assets };
    const html = `<!doctype html><meta charset="utf-8"><style>*{margin:0}body{background:${p.bg}}canvas{display:block}</style><canvas width="1280" height="800"></canvas><script>
const D=${JSON.stringify(data)},B=${JSON.stringify(B)},C=document.querySelector('canvas'),x=C.getContext('2d');const images=[];const ease=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);const clamp=t=>Math.max(0,Math.min(1,t));const fill=c=>{x.fillStyle=c;x.fillRect(0,0,1280,800)};const fit=(im,w,h)=>{const s=Math.min(w/im.width,h/im.height);return [im.width*s,im.height*s]};const crop=(im,sx,sy,sw,sh,dx,dy,dw,dh,alpha=1)=>{if(sw<=0||sh<=0)return;x.save();x.globalAlpha=clamp(alpha);x.drawImage(im,sx,sy,sw,sh,dx,dy,dw,dh);x.restore()};
window.ready=Promise.all(D.assets.map(s=>new Promise(r=>{let i=new Image;i.onload=()=>r(i);i.src=B+s}))).then(a=>{images.push(...a);window.render(0)});
window.render=t=>{const im=images[0];if(!im)return;if(D.a.type==='logo'){
const bg=D.p.slug==='mool'?'#2b337c':D.p.slug==='illustrations'?'#ef1710':'#070806';fill(bg);const [w,h]=fit(im,D.p.slug==='illustrations'?970:780,600),ox=(1280-w)/2,oy=(800-h)/2,s=w/im.width;
if(D.p.slug==='mool'){let e=ease((t-.25)/1.4);crop(im,0,0,im.width,215,ox,oy,w,215*s,1);x.fillStyle=bg;x.fillRect(ox,oy,w,205*s*(1-e));let f=ease((t-1.15)/1.2);crop(im,0,215,im.width,im.height-215,ox,oy+215*s+20*(1-f),w,(im.height-215)*s,f)}
else if(D.p.slug==='naavo'){x.save();x.beginPath();x.arc(ox+246*s,oy+200*s,160*s*ease((t-.1)/1.5),0,Math.PI*2);x.clip();crop(im,0,0,im.width,357,ox,oy,w,357*s);x.restore();const f=ease((t-1.35)/1);crop(im,0,357,im.width,im.height-357,ox,oy+357*s+14*(1-f),w,(im.height-357)*s,f)}
else if(D.p.slug==='aananda'){const f=ease((t-.1)/1.2);x.save();x.beginPath();x.arc(ox+166*s,oy+87*s,40*s, -Math.PI/2,-Math.PI/2+Math.PI*2*f);x.lineTo(ox+166*s,oy+87*s);x.closePath();x.clip();crop(im,120,40,90,90,ox+120*s,oy+40*s,90*s,90*s);x.restore();const e=ease((t-.9)/1.6);crop(im,0,125,im.width*e,im.height-125,ox,oy+125*s,w*e,(im.height-125)*s)}
else {const f=ease((t-.1)/1.1);x.save();x.beginPath();x.arc(ox+w*.5,oy+h*.35,w*.52*f,0,Math.PI*2);x.clip();x.drawImage(im,ox,oy,w,h);x.restore()}
if(t>5.6){x.fillStyle=bg;x.globalAlpha=clamp((t-5.6)/.4);x.fillRect(0,0,1280,800);x.globalAlpha=1}
}else{fill(D.p.bg);const segment=3.5,n=Math.min(images.length-1,Math.floor(t/segment)),local=t-n*segment;const img=images[n];const [w,h]=fit(img,1160,610);if(n>0&&local<.3){const prev=images[n-1],[pw,ph]=fit(prev,1160,610);x.globalAlpha=1-clamp(local/.3);x.drawImage(prev,(1280-pw)/2,55+(610-ph)/2,pw,ph);x.fillStyle=D.p.ink;x.font='500 29px Arial';x.fillText(D.a.items[n-1].label,60,742);}const opacity=clamp(local/.3);x.globalAlpha=opacity;x.drawImage(img,(1280-w)/2,55+(610-h)/2,w,h);x.fillStyle=D.p.ink;x.font='500 29px Arial';x.fillText(D.a.items[n].label,60,742);x.globalAlpha=1;x.fillStyle=D.p.color;x.fillRect(60,777,1160*clamp(t/(images.length*segment)),3)}
};</script>`;
    fs.writeFileSync(dir + "/" + a.id + "-motion.html", html);
  }
