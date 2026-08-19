const { chromium } = require("playwright");
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
 const bad=[];p.on("response",r=>{if(r.status()>=400)bad.push(r.status()+"  "+r.url());});
 await p.goto("http://127.0.0.1:4000/ai-prototypes/mirror/",{waitUntil:"load"});
 await p.waitForTimeout(7000);
 console.log(bad.length?bad:"none");
 await b.close();})();
