const { chromium } = require("playwright");
const P=["revision","flatten","forecast","helpdesk","mirror","latent-atlas","amnesiac","captcha","feral","guise","mimic","watcher"];
(async()=>{const b=await chromium.launch({args:["--use-gl=swiftshader","--enable-unsafe-swiftshader"]});
for(const n of P){
 const ctx=await b.newContext({viewport:{width:1440,height:900}});
 const p=await ctx.newPage();
 const errs=[],bad=[];
 p.on("pageerror",e=>errs.push(String(e.message).slice(0,120)));
 p.on("response",r=>{if(r.status()>=400)bad.push(r.status()+" "+r.url().split("/").slice(-1)[0]);});
 let st=0;
 try{const r=await p.goto("http://127.0.0.1:4000/ai-prototypes/"+n+"/",{waitUntil:"load",timeout:40000});st=r?r.status():0;}
 catch(e){console.log(n.padEnd(14),"NAV FAIL",String(e.message).slice(0,60));await ctx.close();continue;}
 await p.waitForTimeout(6000);
 const d=await p.evaluate(()=>({
   canvas:document.querySelectorAll("canvas").length,
   canvasPainted:[...document.querySelectorAll("canvas")].some(c=>c.width>0&&c.height>0),
   bodyText:(document.body.innerText||"").replace(/\s+/g," ").trim().slice(0,70),
   nodes:document.body.querySelectorAll("*").length}));
 console.log(n.padEnd(14),"http="+st,"canvas="+d.canvas,"nodes="+d.nodes,
   "| 4xx:"+(bad.length?bad.slice(0,3).join(","):"none"),
   "| err:"+(errs.length?errs.slice(0,1).join(""):"none"));
 if(!errs.length&&!bad.length&&d.nodes>3) {} else console.log("      text:",d.bodyText);
 await ctx.close();}
await b.close();})();
