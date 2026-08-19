const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();
 for(const host of ["http://127.0.0.1:4000","http://[::1]:4000"]){
  const p=await b.newPage({viewport:{width:1440,height:900}});
  const bad=[],errs=[];
  p.on("response",r=>{if(r.status()>=400)bad.push(r.status()+" "+r.url().replace(host,""));});
  p.on("pageerror",e=>errs.push(String(e.message).slice(0,100)));
  try{await p.goto(host+"/ai-prototypes/mirror/",{waitUntil:"load",timeout:30000});}
  catch(e){console.log(host,"nav fail");await p.close();continue;}
  await p.waitForTimeout(7000);
  console.log(host.padEnd(22),"hostname:",await p.evaluate(()=>location.hostname),
    "| 4xx:",bad.length?bad:"none","| err:",errs.length?errs:"none",
    "| text:",(await p.evaluate(()=>document.body.innerText.replace(/\s+/g," ").trim().slice(0,50))));
  await p.close();}
 await b.close();})();
