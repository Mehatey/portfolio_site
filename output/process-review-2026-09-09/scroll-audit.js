async page => {
 const slugs=['mool','m-health-fairview','marriott','encoded','bloom','mandalas','mind-your-feelings','ai-self','naavo','aananda','alpha-stockathon','cube-guy','b-plus-b','shot-on-iphone','illustrations','ai-prototypes'];const records=[];
 await page.setViewportSize({width:1280,height:850});
 for(const slug of slugs){await page.goto('http://127.0.0.1:4317/output/image-review-2026-09-07/round-5/audit/'+slug+'.html');await page.locator('img').evaluateAll(es=>es.forEach(e=>e.loading='eager'));const height=await page.evaluate(()=>document.body.scrollHeight);for(let y=0;y<height;y+=1400){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(35);}await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'output/process-review-2026-09-09/audit/'+slug+'.png',fullPage:true});records.push({slug,height,images:await page.locator('img').count()});}return records;
}
