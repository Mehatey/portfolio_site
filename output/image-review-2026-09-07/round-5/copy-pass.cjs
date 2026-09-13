const fs = require("fs");
process.chdir(__dirname);
const P = require("./projects.json");
const edits = {
  "m-health-fairview/constraints": { deck: "A focused care-discovery redesign within a fixed delivery window." },
  "m-health-fairview/care-in-motion": { deck: "Choose the right starting point, then get help finding the next step." },
  "m-health-fairview/impact": {
    title: "Scheduling outcomes.",
    deck: "Reported outcomes for the broader scheduling experience. The contribution of this two-sprint redesign was not measured separately.",
  },
  "marriott/operations": { deck: "Occupancy, arrivals and open cases stay close to the day’s work." },
  "marriott/enrolment": { deck: "Membership benefits lead into enrolment without leaving the employee workspace." },
  "mool/goals": { deck: "Personal ambitions connect to a visible amount, progress and target date." },
  "mool/familiar": { deck: "Visible controls and explicit feedback support people learning a smartphone interface." },
  "naavo/family": { deck: "Oils, incense and creams carry a shared identity across different physical formats." },
  "aananda/learning-kit": { deck: "Proposed reader’s notebook, bookmark and an existing discussion card." },
  "encoded/pipeline": { title: "Capture. Localise. Activate." },
  "b-plus-b/making": { deck: "A public invitation takes shape through fabrication and placement." },
  "ai-self/three-arcs": { deck: "Three related research studies across machine perception, an AR concept and a VR world." },
  "shot-on-iphone/story-layer": { title: "After the scan, a conversation." },
  "illustrations/apna-identity": {
    title: "Apna Adda, in motion.",
    deck: "The Hindi identity and food-led tone of the final menu become a short reveal.",
  },
  "illustrations/food-wrap": { deck: "Proposed food wrap using the final menu identity." },
  "illustrations/series": { deck: "Music, narrative illustration and food branding retain their own visual identities." },
};
for (const p of P) for (const a of p.pieces) Object.assign(a, edits[p.slug + "/" + a.id] || {});
P[0].pieces.find((a) => a.id === "constraints").items[2].detail = "Heuristic evaluation and secondary research informed the design.";
fs.writeFileSync("projects.json", JSON.stringify(P, null, 2));
