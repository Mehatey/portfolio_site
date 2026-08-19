const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
 await p.goto("http://127.0.0.1:4000/play/",{waitUntil:"load"});
 await p.waitForTimeout(2500);
 // slow, human-like scroll
 for(let i=0;i<40;i++){await p.evaluate(()=>window.scrollBy({top:400,behavior:"instant"}));await p.waitForTimeout(320);}
 await p.waitForTimeout(2500);
 console.log(await p.evaluate(()=>{
   const v=[...document.querySelectorAll(".play-grid video")];
   const inView=v.filter(x=>{const q=x.getBoundingClientRect();return q.bottom>-2000&&q.top<window.innerHeight+2000;});
   return {total:v.length, gotSrc:v.filter(x=>x.src).length, isIn:v.filter(x=>x.classList.contains("is-in")).length,
     scrolledPast:v.filter(x=>x.getBoundingClientRect().top<window.innerHeight).length,
     imgsIsIn:[...document.querySelectorAll(".play-grid img")].filter(x=>x.classList.contains("is-in")).length,
     imgsTotal:document.querySelectorAll(".play-grid img").length,
     scrollY:Math.round(scrollY), H:document.documentElement.scrollHeight};}));
 await b.close();})();
