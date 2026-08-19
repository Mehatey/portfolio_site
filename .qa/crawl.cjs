const { chromium } = require("playwright");
const fs = require("fs");
const ROUTES = ["/","/about/","/works/","/contact/","/play/","/arcana/","/ai-prototypes/",
 "/mool/","/encoded/","/bloom/","/naavo/","/aananda/","/cube-guy/","/mandalas/","/marriott/",
 "/m-health-fairview/","/mind-your-feelings/","/alpha-stockathon/","/illustrations/",
 "/shot-on-iphone/","/ai-self/","/b-plus-b/"];
const VIEWS = [{n:"desk",w:1440,h:900},{n:"mob",w:390,h:844}];
(async()=>{
 const b=await chromium.launch();
 const report=[];
 for(const v of VIEWS){
  for(const r of ROUTES){
   const ctx=await b.newContext({viewport:{width:v.w,height:v.h},deviceScaleFactor:1});
   const p=await ctx.newPage();
   const errs=[],bad=[];
   p.on("pageerror",e=>errs.push(String(e.message).slice(0,160)));
   p.on("response",x=>{if(x.status()>=400)bad.push(x.status()+" "+x.url().replace("http://127.0.0.1:4000",""));});
   let status=0;
   try{const resp=await p.goto("http://127.0.0.1:4000"+r,{waitUntil:"load",timeout:45000});status=resp?resp.status():0;}
   catch(e){report.push({v:v.n,r,fatal:String(e.message).slice(0,120)});await ctx.close();continue;}
   const H=await p.evaluate(()=>document.documentElement.scrollHeight);
   for(let y=0;y<Math.min(H,40000);y+=v.h){await p.evaluate(t=>window.scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(70);}
   await p.evaluate(()=>window.scrollTo({top:0,behavior:"instant"}));
   await p.waitForTimeout(1200);
   const d=await p.evaluate(()=>{
     const broken=[...document.querySelectorAll("img")].filter(i=>i.complete&&i.naturalWidth===0&&(i.currentSrc||i.src))
       .map(i=>(i.currentSrc||i.src).split("/").slice(-2).join("/"));
     const vids=[...document.querySelectorAll("video")];
     const deadVid=vids.filter(x=>x.readyState===0&&x.getBoundingClientRect().width>0)
       .map(x=>((x.currentSrc||(x.querySelector("source")||{}).src||"?")).split("/").pop());
     // horizontal overflow
     const de=document.documentElement;
     const overflowX=de.scrollWidth-de.clientWidth;
     const wide=overflowX>2?[...document.querySelectorAll("body *")].filter(e=>{
        const q=e.getBoundingClientRect();
        return q.right>de.clientWidth+2 && q.width>0 && q.height>0 && getComputedStyle(e).position!=="fixed";
       }).slice(0,4).map(e=>(e.tagName+"."+String(e.className).split(" ")[0]).slice(0,40)):[];
     return {H:de.scrollHeight,broken:[...new Set(broken)],deadVid:[...new Set(deadVid)],overflowX,wide,
       imgs:document.querySelectorAll("img").length,vids:vids.length};
   });
   report.push({v:v.n,r,status,H:d.H,broken:d.broken,deadVid:d.deadVid,overflowX:d.overflowX,wide:d.wide,
     errs:[...new Set(errs)],bad:[...new Set(bad)].slice(0,6),imgs:d.imgs,vids:d.vids});
   await ctx.close();
  }
 }
 fs.writeFileSync(".qa/crawl.json",JSON.stringify(report,null,1));
 // print only problems
 let clean=0;
 for(const x of report){
  const probs=[];
  if(x.fatal) probs.push("FATAL "+x.fatal);
  if(x.status&&x.status>=400) probs.push("HTTP "+x.status);
  if(x.broken&&x.broken.length) probs.push("brokenImg:"+JSON.stringify(x.broken));
  if(x.deadVid&&x.deadVid.length) probs.push("deadVideo:"+JSON.stringify(x.deadVid));
  if(x.overflowX>2) probs.push("overflowX="+x.overflowX+" "+JSON.stringify(x.wide));
  if(x.errs&&x.errs.length) probs.push("JS:"+JSON.stringify(x.errs));
  if(x.bad&&x.bad.length) probs.push("4xx:"+JSON.stringify(x.bad));
  if(probs.length) console.log(("["+x.v+"] "+x.r).padEnd(34)+probs.join("  |  "));
  else clean++;
 }
 console.log("\nclean: "+clean+" / "+report.length);
 await b.close();
})();
