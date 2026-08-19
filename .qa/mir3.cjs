const { chromium } = require("playwright");
const IP=process.argv[2];
(async()=>{const b=await chromium.launch();
 const hosts=["http://127.0.0.1:4000"]; if(IP) hosts.push("http://"+IP+":4111");
 for(const host of hosts){
  const p=await b.newPage({viewport:{width:1440,height:900}});
  const bad=[],errs=[];
  p.on("response",r=>{if(r.status()>=400)bad.push(r.status()+" "+r.url().replace(host,""));});
  p.on("pageerror",e=>errs.push(String(e.message).slice(0,100)));
  try{await p.goto(host+"/ai-prototypes/mirror/",{waitUntil:"load",timeout:30000});}
  catch(e){console.log(host,"nav fail",String(e.message).slice(0,50));await p.close();continue;}
  await p.waitForTimeout(8000);
  console.log(("host="+(await p.evaluate(()=>location.hostname))).padEnd(22),
    "4xx:",bad.length?bad:"none","| err:",errs.length?errs:"none");
  console.log("   text:",(await p.evaluate(()=>document.body.innerText.replace(/\s+/g," ").trim().slice(0,90))));
  await p.close();}
 await b.close();})();
