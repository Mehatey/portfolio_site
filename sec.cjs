const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const c=await b.newContext({viewport:{width:1440,height:900}});
await c.addInitScript(()=>{try{localStorage.setItem("sid_loaded","1")}catch(e){}});
const p=await c.newPage();
await p.goto("http://127.0.0.1:4123/",{waitUntil:"networkidle"}); await p.waitForTimeout(4000);
console.log(JSON.stringify(await p.evaluate(()=>{
 const total=document.documentElement.scrollHeight;
 const kids=[...document.querySelectorAll("section, footer")].map(e=>{
   const r=e.getBoundingClientRect();
   return {tag:e.tagName.toLowerCase(), id:e.id||"", cls:(e.className||"").toString().split(" ")[0],
     top:Math.round(r.top+scrollY), h:Math.round(r.height)};
 }).filter(x=>x.h>300);
 const seen=new Set(); const out=[];
 for(const k of kids){const key=k.id+k.cls+k.top; if(seen.has(key))continue; seen.add(key); out.push(k);}
 out.sort((a,b)=>a.top-b.top);
 return {total, screens:+(total/900).toFixed(1), out};
}),null,1));
await b.close();})();
