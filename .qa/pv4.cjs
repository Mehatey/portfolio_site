const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
 await p.goto("http://127.0.0.1:4000/play/",{waitUntil:"load"});
 await p.waitForTimeout(2500);
 await p.mouse.move(700,450);
 let last=-1;
 for(let i=0;i<160;i++){
   await p.mouse.wheel(0,600); await p.waitForTimeout(90);
   if(i%40===39){const s=await p.evaluate(()=>({y:Math.round(scrollY),
     v:[...document.querySelectorAll(".play-grid video")].filter(x=>x.src).length,
     im:[...document.querySelectorAll(".play-grid img")].filter(x=>x.classList.contains("is-in")).length}));
     console.log("step",i+1,JSON.stringify(s));}
 }
 await p.waitForTimeout(2500);
 console.log("FINAL:",await p.evaluate(()=>{
   const v=[...document.querySelectorAll(".play-grid video")];
   const im=[...document.querySelectorAll(".play-grid img")];
   return {y:Math.round(scrollY),H:document.documentElement.scrollHeight,
     vidsWithSrc:v.filter(x=>x.src).length+"/"+v.length,
     vidsPlaying:v.filter(x=>!x.paused).length,
     imgsIn:im.filter(x=>x.classList.contains("is-in")).length+"/"+im.length,
     imgsDecoded:im.filter(x=>x.naturalWidth>0).length+"/"+im.length};}));
 await b.close();})();
