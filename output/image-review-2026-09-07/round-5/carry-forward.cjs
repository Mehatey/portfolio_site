const fs = require("fs");
process.chdir(__dirname);
let s = fs.readFileSync("gallery.cjs", "utf8");
const heroes = {
  "m-health-fairview": "round-4/fairview.webp",
  marriott: "round-2/marriott.webp",
  mool: "round-4/mool.webp",
  "alpha-stockathon": "round-4/alpha.webp",
};
const extras = {
  aananda: [["round-4/aananda.webp", "The original book, in a reading setting."]],
  illustrations: [["round-4/apna.webp", "The final menu, at the counter."]],
  "shot-on-iphone": [
    ["round-4/shot.webp", "A street poster with physical wear."],
    ["round-4/billboard.webp", "The same landscape artwork at billboard scale."],
  ],
};
s = s.replace(
  "const summaries=",
  "const carriedHeroes=" + JSON.stringify(heroes) + ";const carriedExtras=" + JSON.stringify(extras) + ";\nconst summaries="
);
s = s.replace(
  "if(p.slug==='ai-prototypes')hero='/assets/img/ai-proto-cover.jpg';",
  "if(p.slug==='ai-prototypes')hero='/assets/img/ai-proto-cover.jpg';if(carriedHeroes[p.slug])hero=R+carriedHeroes[p.slug];"
);
s = s.replace("${e(p.title)} existing cover", '${e(p.title)} ${carriedHeroes[p.slug]?"presentation study":"existing cover"}');
s = s.replace(
  'fetchpriority="high"></figure>',
  "fetchpriority=\"high\">${carriedHeroes[p.slug]?'<figcaption style=\"font-size:13px;opacity:.7;padding-top:12px\">Illustrative setting · original interface artwork</figcaption>':''}</figure>"
);
s = s.replace(
  "html+=`</main><section",
  'html+=`</main>${(carriedExtras[p.slug]||[]).map(([path,title])=>`<figure class="hero"><img src="${R+path}" alt="${e(title)}" loading="lazy"><figcaption style="font-size:16px;line-height:1.4;padding-top:15px">${e(title)}<span class="concept" style="margin-top:8px">Earlier presentation study · AI-assisted scene</span></figcaption></figure>`).join(\'\')}<section'
);
fs.writeFileSync("gallery.cjs", s);
fs.writeFileSync("carried-forward.json", JSON.stringify({ heroes, extras }, null, 2));
