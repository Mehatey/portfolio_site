const fs = require("fs"),
  r = require("child_process").execFileSync;
process.chdir(__dirname);
const P = require("./projects.json");
function frame(src, id, t = 1) {
  r("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(t), "-i", "../../../" + src, "-frames:v", "1", "assets/" + id + ".png"]);
  r("magick", ["assets/" + id + ".png", "-resize", "1500x1500>", "-quality", "94", "assets/" + id + ".webp"]);
  return "assets/" + id + ".webp";
}
const vis = frame("15.bloom-vp/visitor-1.mp4", "bodhi-visitor", 1),
  cap = frame("1.met/2.mp4", "encoded-capture", 1);
const cube = P.find((p) => p.slug === "cube-guy").pieces.find((a) => a.id === "mechanics");
const cubeRefs = ["2.cube/2d/1.mp4", "2.cube/2d/8.mp4", "2.cube/2d/11.mp4"];
cube.items.forEach((i, n) => {
  i.src = cubeRefs[n];
  i.asset = frame(i.src, "cube-mechanic-" + n, 1);
});
const enc = P.find((p) => p.slug === "encoded").pieces.find((a) => a.id === "pipeline");
enc.items[0].asset = cap;
enc.items[0].src = "1.met/2.mp4";
enc.items[1].asset = "assets/1.met_5.webp";
enc.items[1].src = "1.met/5.mp4";
enc.items[2].asset = "assets/1.met_8.webp";
enc.items[2].src = "1.met/8.mp4";
fs.writeFileSync("projects.json", JSON.stringify(P, null, 2));
let a = fs.readFileSync("applications.cjs", "utf8");
a = a.replace(
  "switch(key){",
  `switch(key){
case 'bloom/distance':return \`<div class="spatial-story"><div class="spatial-views"><figure><div class="visual">\${asset('assets/bodhi-visitor.webp')}</div><figcaption>The person in the room</figcaption></figure><figure><div class="visual">\${asset('assets/15.bloom-vp_tree.webp')}</div><figcaption>The presence inside the headset</figcaption></figure></div><div class="ruler"><span>≈ 2 metres</span></div><p class="ruler-note">Conversational distance, the stated design target</p></div>\`;
case 'mind-your-feelings/bridge':return \`<div class="wired-system"><figure><div class="visual">\${asset('assets/6.mindu_kiosk2.webp')}</div><figcaption>Touchscreen input</figcaption></figure><div class="connection"><div class="wire-label">JavaScript</div><span>↓</span><div class="wire-label">Python bridge</div><span>↓</span><div class="wire-label">WLED / Arduino</div></div><figure><div class="visual">\${asset('assets/6.mindu_1.webp')}</div><figcaption>A visible colour response</figcaption></figure></div>\`;
case 'mandalas/system':return \`<div class="slow-system"><div class="slow-input"><h2>Movement</h2><p>MediaPipe tracking</p><div class="signal-bars">\${[31,65,44,92,52,35,82,48,25,66,38,50].map(h=>'<i style="height:'+h+'%"></i>').join('')}</div><small>Conceptual input signal</small></div><div class="slow-transfer"><h2>A slow influence</h2><p>TouchDesigner changes the visual growth over seconds.</p><div class="time-track"><span></span></div><small>Responsiveness can be felt without becoming a mirror.</small></div><div class="slow-output"><div class="visual">\${asset('assets/4.mandala_ma34.webp')}</div><h2>Generative form</h2><p>Projection and sound in the room</p></div></div>\`;
`
);
a = a.replace(
  "exports.css=`",
  'exports.css=`.spatial-story{width:100%;display:flex;flex-direction:column}.spatial-views{display:flex;gap:65px;flex:1;min-height:0}.spatial-views figure{flex:1;min-width:0}.spatial-views figcaption{font-size:26px;margin-top:15px}.spatial-views .visual{height:310px;flex:1}.ruler{margin:35px 80px 10px;height:2px;background:var(--accent);position:relative;text-align:center}.ruler:before,.ruler:after{content:"";position:absolute;top:-13px;height:28px;width:2px;background:var(--accent)}.ruler:before{left:0}.ruler:after{right:0}.ruler span{display:inline-block;transform:translateY(-50%);padding:0 28px;background:var(--bg);font-size:43px;color:var(--accent)}.ruler-note{font-size:24px;text-align:center;margin:24px 0 0}.wired-system{display:flex;align-items:stretch;gap:35px;width:100%}.wired-system figure{flex:1;min-width:0}.wired-system figcaption{font-size:27px;margin-top:18px}.wired-system .visual{height:370px;flex:1}.connection{flex:.72;display:flex;flex-direction:column;justify-content:center;text-align:center;gap:14px}.wire-label{font-size:27px;padding:21px 12px;border:1px solid var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--bg))}.connection>span{font-size:30px;color:var(--accent)}.slow-system{display:flex;align-items:center;gap:48px;width:100%}.slow-system>div{flex:1;min-width:0}.slow-system h2{font-size:33px;margin:0 0 15px}.slow-system p{font-size:25px;line-height:1.3;margin:0 0 20px}.slow-system small{font-size:19px;line-height:1.3;display:block;opacity:.75}.signal-bars{height:180px;display:flex;align-items:center;gap:9px;margin:24px 0}.signal-bars i{background:var(--accent);flex:1;opacity:.8}.slow-output .visual{height:300px;margin-bottom:22px}.time-track{height:3px;background:#51415c;margin:38px 0;position:relative}.time-track span{position:absolute;left:0;top:0;width:65%;height:3px;background:var(--accent)}.time-track:after{content:"→";position:absolute;right:-9px;top:-23px;color:var(--accent);font-size:38px}@media(max-width:900px){.spatial-views{gap:22px;align-items:center}.spatial-views .visual{height:390px;flex:none}.spatial-views figcaption{font-size:27px}.ruler{margin:36px 25px 10px}.ruler-note{font-size:26px}.wired-system{display:grid;grid-template-columns:1fr 1fr;gap:24px}.wired-system figure{min-height:0}.wired-system .visual{height:370px;flex:none}.wired-system figcaption{font-size:27px}.connection{grid-row:2;grid-column:1/3;flex-direction:row;align-items:center;gap:12px}.wire-label{font-size:25px;flex:1;padding:23px 10px}.connection>span{transform:rotate(-90deg);font-size:27px}.slow-system{flex-direction:column;align-items:stretch;gap:30px}.slow-system>div{flex:1}.slow-input{display:grid;grid-template-columns:245px 1fr;column-gap:20px}.slow-input .signal-bars{grid-column:2;grid-row:1/4;height:150px;margin:0}.slow-system h2{font-size:32px}.slow-system p{font-size:26px}.slow-system small{font-size:23px}.slow-transfer .time-track{margin:25px 0}.slow-output{display:grid;grid-template-columns:245px 1fr;column-gap:20px}.slow-output .visual{grid-row:1/3;height:210px;margin:0}}'
);
a = a
  .replace(
    '<div class="response-card"><h2>Notice what you feel.',
    '<div class="response-card" style="background:#eee3f2;color:#39294a"><h2>Notice what you feel.'
  )
  .replace(
    '<div class="response-card"><h2>Come back to it.',
    '<div class="response-card" style="background:#d8edf0;color:#273e4c"><h2>Come back to it.'
  );
fs.writeFileSync("applications.cjs", a);
