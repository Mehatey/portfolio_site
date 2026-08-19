const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
 await p.goto("http://127.0.0.1:4000/play/",{waitUntil:"load"});
 const H=await p.evaluate(()=>document.documentElement.scrollHeight);
 for(let y=0;y<H;y+=700){await p.evaluate(t=>window.scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(110);}
 await p.waitForTimeout(3000);
 console.log(await p.evaluate(()=>{
   const v=[...document.querySelectorAll(".play-grid video")];
   return {total:v.length,
     noSrcAttr:v.filter(x=>!x.src).length,
     hasClip:v.filter(x=>x.dataset.clip).length,
     notIn:v.filter(x=>!x.classList.contains("is-in")).length,
     playing:v.filter(x=>!x.paused).length,
     rs0:v.filter(x=>x.readyState===0).length,
     sample:v.slice(0,3).map(x=>({src:(x.src||"NONE").split("/").pop(),clip:(x.dataset.clip||"").split("/").pop(),
       rs:x.readyState,paused:x.paused,isIn:x.classList.contains("is-in"),
       h:Math.round(x.getBoundingClientRect().height),poster:!!x.poster}))};}));
 await b.close();})();
