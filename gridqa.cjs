const { chromium } = require("playwright");
const S=(ms)=>new Promise(r=>setTimeout(r,ms));
const say=(s)=>{process.stdout.write(s+"\n")};
(async()=>{
 const b=await chromium.launch({headless:false, executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args:["--window-size=1440,940","--window-position=0,0","--autoplay-policy=no-user-gesture-required"]});
 const ctx=await b.newContext({viewport:{width:1400,height:880}, deviceScaleFactor:2});
 await ctx.addInitScript(()=>{try{history.scrollRestoration="manual";localStorage.setItem("sid_loaded","1")}catch(e){}});
 const p=await ctx.newPage();
 for (const r of process.argv.slice(2)){
  try{
   await p.goto("http://127.0.0.1:4000"+r,{waitUntil:"domcontentloaded",timeout:40000});
   await p.bringToFront();
   // force every lazy image to load without scrolling 29k pixels
   await p.evaluate(()=>{document.querySelectorAll("img[loading=lazy]").forEach(i=>i.loading="eager");
     document.querySelectorAll("img,video").forEach(m=>{m.style.contentVisibility="visible"});});
   await p.evaluate(()=>Promise.all([...document.images].filter(i=>!i.complete).slice(0,200).map(i=>new Promise(res=>{i.onload=i.onerror=res;setTimeout(res,2500)}))));
   await S(1200);
   const o=await p.evaluate(()=>{
    const bad=[];
    // ── grid rows: do siblings share a top and bottom edge?
    let rows=0, off=0, worst=0, ex="";
    document.querySelectorAll(".cs-grid, .cs-grid-3, .cs-pair").forEach(g=>{
      const kids=[...g.children].filter(k=>k.getBoundingClientRect().height>20);
      if(kids.length<2) return;
      rows++;
      const med=kids.map(k=>k.querySelector("img,video")).filter(Boolean);
      if(med.length<2) return;
      const tops=med.map(m=>m.getBoundingClientRect().top), bots=med.map(m=>m.getBoundingClientRect().bottom);
      const dt=Math.max(...tops)-Math.min(...tops), db=Math.max(...bots)-Math.min(...bots);
      const d=Math.max(dt,db);
      if(d>3){off++; if(d>worst){worst=d; ex=(med[0].currentSrc||med[0].src||"").split("/").pop()+" vs "+(med[1].currentSrc||med[1].src||"").split("/").pop()+" Δtop="+dt.toFixed(0)+" Δbot="+db.toFixed(0)}}
    });
    if(off) bad.push("GRID-MISALIGN "+off+"/"+rows+" worst "+worst.toFixed(0)+"px ("+ex+")");
    // ── rails: one height?
    document.querySelectorAll(".cs-rail").forEach((rl,i)=>{
      const m=[...rl.querySelectorAll("img,video")].filter(x=>x.getBoundingClientRect().height>20);
      if(m.length<2) return;
      const hs=m.map(x=>Math.round(x.getBoundingClientRect().height));
      if(Math.max(...hs)-Math.min(...hs)>2) bad.push("RAIL"+i+" heights "+[...new Set(hs)].join("/"));
    });
    // ── one left edge for the whole case study?
    const lefts=new Set();
    document.querySelectorAll(".cs-intro, .cs-section > h2, .cube-cap, .proj-highlights, .project-details").forEach(e=>{
      const x=e.getBoundingClientRect(); if(x.width>100) lefts.add(Math.round(x.left));
    });
    if(lefts.size>1) bad.push("LEFT-EDGES "+[...lefts].sort((a,b)=>a-b).join(","));
    // ── content media cropped or letterboxed
    let crop=0,let_=0;
    document.querySelectorAll(".case-story img, .case-story video, .cs-bleed img, .cs-bleed video").forEach(m=>{
      const rr=m.getBoundingClientRect(); if(rr.width<80||rr.height<80) return;
      const nw=m.naturalWidth||m.videoWidth, nh=m.naturalHeight||m.videoHeight; if(!nw||!nh) return;
      const f=getComputedStyle(m).objectFit, ba=rr.width/rr.height, na=nw/nh;
      if(Math.abs(ba-na)/na>0.09){ if(f==="cover")crop++; else if(f==="contain")let_++; }
    });
    if(crop) bad.push("CROPPED "+crop);
    if(let_) bad.push("LETTERBOX "+let_);
    if(document.documentElement.scrollWidth>innerWidth+2) bad.push("H-OVERFLOW");
    return bad;
   });
   say(r.padEnd(24)+(o.length?o.join("  |  "):"clean"));
  }catch(e){ say(r.padEnd(24)+"FAILED "+String(e).slice(0,60)); }
 }
 await b.close();})();
