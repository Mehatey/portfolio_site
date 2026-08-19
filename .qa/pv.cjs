const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
 await p.goto("http://127.0.0.1:4000/play/",{waitUntil:"load"});
 const H=await p.evaluate(()=>document.documentElement.scrollHeight);
 for(let y=0;y<H;y+=800){await p.evaluate(t=>window.scrollTo({top:t,behavior:"instant"}),t=y);await p.waitForTimeout(80);}
 await p.waitForTimeout(2500);
 console.log(await p.evaluate(()=>[...document.querySelectorAll("video")].map(v=>({
   src:(v.currentSrc||(v.querySelector("source")||{}).src||"NONE").split("/").pop(),
   rs:v.readyState, w:Math.round(v.getBoundingClientRect().width),
   par:String(v.parentElement.className).slice(0,30)})).filter(x=>x.rs===0)));
 await b.close();})();
