const { chromium } = require("playwright");
(async()=>{const out=process.argv[2];
const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const c=await b.newContext({viewport:{width:1440,height:900}});
await c.addInitScript(()=>{try{localStorage.setItem("sid_loaded","1")}catch(e){}});
const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(String(e).slice(0,120)));
await p.goto("http://127.0.0.1:4123/",{waitUntil:"networkidle"}); await p.waitForTimeout(3500);
for (const [name,y] of [["00-hero",0],["01-mono",1400],["02-work",2600],["03-work2",3600],["04-cube",5100],["05-how",6100],["06-footer",9200],["07-figure",11000]]) {
  await p.evaluate(yy=>window.scrollTo(0,yy), y);
  await p.waitForTimeout(2600);
  await p.screenshot({path:`${out}/${name}.png`});
}
console.log("errors:", errs.length?errs:"none");
await b.close();})();
