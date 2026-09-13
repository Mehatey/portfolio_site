const fs = require("fs");
process.chdir(__dirname);
const P = require("./projects.json");
const priorities = {
  "m-health-fairview":
    "Replace the opening pitch-deck slides and the 3D impact poster with this six-part story. Keep the original comparison details as inspectable evidence. Report app-wide metrics without attributing all lift to this two-sprint contribution.",
  marriott:
    "Lead with the associate’s shift and complete enrolment flow. The source file 08-enrollmodal.mp4 is actually a membership carousel; 06-enroll.mp4 contains the modal and confirmation. Correct those captions when integrating.",
  mool: "Retain the Indian setting and existing visual identity. Keep dense UI available at full size. The low-data screen and foldout are new concepts; the original project supports a visual design contribution, not a claim to have built the whole financial service.",
  naavo:
    "Keep the original cover. Consolidate repeated packs into a product family, then show identity motion, travel packaging and a shelf guide. Retain Vata, Pitta and Kapha names and colors without adding efficacy claims.",
  aananda:
    "Connect source references, identity, app and book as one learning system. The new linen object is a proposed reader’s notebook, not a replacement for the actual book cover.",
  "alpha-stockathon":
    "Put the decision and consequence loop before the screen archive. The classroom cards extend the existing game; they are not evidence of a classroom deployment.",
  encoded:
    "Show the capture, localisation and activation sequence first. Credit the artists’ interpretations separately from Siddharth’s technical capture and deployment role. The maintenance cards are a proposed operational extension.",
  mandalas:
    "Separate installation documentation from EEG, pixel-game and other explorations. The signal diagram is conceptual, not measured telemetry. A slower arrival, stay and departure rhythm is a next iteration.",
  bloom:
    "Pair the person in the room with the view inside Vision Pro. Keep the two-metre spatial choice visible. The recovery states are proposed UI, not recorded functionality.",
  "mind-your-feelings":
    "Show the actual input-to-light recording beside the JavaScript, Python and WLED bridge. Preserve artist and collaborator credit. Take-home cards are reflective prompts, not diagnostic output.",
  "ai-self":
    "Distinguish image-perception research, Chaise concept footage and the VR build. Keep the proposed companion boundaries separate from existing functionality.",
  "b-plus-b":
    "Lead with the public question, then participation and shared reading. Retain original participant material without inventing responses. The pocket cards introduce no unverified QR destination.",
  "cube-guy":
    "Use a short character arc across drawing, film and play before the longer archive. Keep the character sheet as a proposed screening or exhibition handout.",
  "shot-on-iphone":
    "Lead with photograph → story → response, then show print applications. Keep original landscape ratios. Identify this as self-initiated work, not an Apple commission. QR destination behavior still needs a separate check.",
  illustrations:
    "Split the three series visually and name their roles. Use Apna Adda’s final menu identity, not the exploration marks. Food-wrap and menu scenes are illustrative applications.",
  "ai-prototypes":
    "Keep four representative interaction edits and one explanatory diagram near the top and link the rest of the experiments. Scope privacy and “no server/API” claims per prototype; a collection-wide claim can conflict with tools that use proxies.",
};
let audit =
  "# Project media audit\n\n16 main portfolio project pages were read and scrolled. The AI experiments collection is one portfolio page; its five selected demonstrations are not five newly audited standalone case studies. Original pages remain available in the local comparison tool.\n\n## First priorities\n\n1. Fairview: replace the pitch-deck opening and style-breaking impact slide with a single care-discovery narrative.\n2. Make each role and evidence type explicit before showing a long archive.\n3. Keep full-size originals accessible beside concise media edits. Device shots cannot carry small UI on mobile.\n4. Group independent series and distinguish final identities from explorations.\n5. Keep proposed applications visibly labeled until selected and integrated.\n\n";
for (const p of P)
  audit +=
    "## " +
    p.title +
    "\n\n" +
    p.problem +
    "\n\n" +
    p.change +
    "\n\n" +
    priorities[p.slug] +
    "\n\nNew media: " +
    p.pieces.map((a) => a.title).join(" · ") +
    "\n\n";
fs.writeFileSync("audit.md", audit);
const types = {};
for (const p of P) for (const a of p.pieces) types[a.type] = (types[a.type] || 0) + 1;
const manifest = {
  createdAt: new Date().toISOString(),
  status: "local review, not published",
  projects: 16,
  pieces: P.reduce((n, p) => n + p.pieces.length, 0),
  types,
  scope: "Main portfolio pages from works data; AI prototype collection counts as one project.",
  files: P.map((p) => ({
    slug: p.slug,
    title: p.title,
    preview: "previews/" + p.slug + ".html",
    comparison: "comparisons/" + p.slug + ".html",
    pieces: p.pieces.map((a) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      concept: !!a.concept,
      sourceReferences: [...(a.items?.map((i) => i.src).filter(Boolean) || []), ...(a.clips?.map((i) => i.src) || []), a.source].filter(Boolean),
      artboard: "media/" + p.slug + "/" + a.id + ".html",
      desktop: "media/" + p.slug + "/" + a.id + ".webp",
      mobile: "media/" + p.slug + "/" + a.id + "-mobile.webp",
      ...(a.type === "generated" ? { composite: "generated/" + a.generated + ".webp" } : {}),
      ...(["film", "logo", "sequence"].includes(a.type) ? { video: "media/" + p.slug + "/" + a.id + ".mp4" } : {}),
      ...(a.type === "logo" ? { gif: "media/" + p.slug + "/" + a.id + ".gif" } : {}),
    })),
  })),
};
fs.writeFileSync("manifest.json", JSON.stringify(manifest, null, 2));
fs.writeFileSync(
  "decisions.md",
  `# Round 5 decisions

83 distinct pieces across 16 main project stories. Counts include edited source footage and newly composed explanatory graphics, not 83 AI-generated images. There are 20 source-footage edits, four identity animations, four editorial motion sequences, four AI-assisted physical application composites and 51 static explanation/application pieces. Desktop and mobile exports are variants of the same piece and are not double counted.

Original cover retained for Naavo. Earlier rejected Naavo variants remain excluded. Marriott’s hotel-desk treatment carries forward. Corrected Round 4 Mool, Fairview and Alpha device scenes appear as local preview heroes. Aananda, Apna and Shot on iPhone retain four earlier supporting scenes. These eight carried-forward images are not included in the 83 new pieces.

All original interface, logo, label and print artwork remains source-derived. Four generated environments use proportionate ImageMagick projective mapping and multiply lighting, with reference paths and geometry recorded in composite-provenance.json. No new client features, metrics, claims, installations or participant quotes were invented. New applications are labeled as proposals. Aananda’s linen notebook is a new notebook concept, not a purported original book cover.

## QA corrections made

- Replaced the wrong Marriott carousel edit with the complete original 06-enroll recording, including modal and confirmation.
- Trimmed Mimic before its black ending.
- Moved Chaise’s poster to an actual concept interface rather than a blank transition.
- Removed visible background rectangles from Naavo and Aananda identity animations and matched Mool’s blue to its source artwork.
- Replaced sequence fades through blank frames with continuous crossfades.
- Stacked Encoded maintenance cards vertically on mobile.
- Changed Mind Your Feelings takeaway colors to its purple and blue family.
- Added actual capture/installation images to generic process diagrams.
- Retained physical label margins and cream detail in Naavo’s original identity.
- Kept the Fairview impact attribution caveat in the same visual system as the process story.

All videos are silent because the selected original recordings contain no audio tracks. Some original source typography is resolution-limited. The films are editorial cuts of existing evidence; they are not newly filmed product deployments. QR behavior was not verified. The original case archive remains accessible for full process context.

No production page files were overwritten. No deployment, external API charges, reset redemption or external messages.
`
);
fs.writeFileSync(
  "RESUME.md",
  `# Resume Round 5

Open http://127.0.0.1:4317/output/image-review-2026-09-07/ and select a project. Each has 5 or 6 new media pieces and a local story preview. Comparisons provide original/proposed and desktop/390px phone views.

Authoritative plan: projects.json. Source page data: catalog.json and context.json. Reference copies: assets/, with provenance.json. Generated prompts, raw scenes and final composites: generated/. Projective coordinates and source selections: composite-provenance.json. Video edits: film-provenance.json. Inventory: manifest.json. Audit and decisions: audit.md and decisions.md.

## Rebuild sequence

1. Edit projects.json, applications.cjs or render.cjs. Do not rerun plan.cjs, prepare.cjs, copy-pass.cjs or carry-forward.cjs; those historical passes can overwrite later corrections.
2. Run node render.cjs. Capture affected artboards with Playwright at 1440×900 and 750×1100; applications also need .body element screenshots as -artifact files.
3. Run node export.cjs for responsive WebPs and contact sheets.
4. Motion sources: node motion.cjs. Render window.render(t) at 24fps after window.ready; preserve existing frame directories, then node encode-motion.cjs. GIFs are derived from logo MP4s.
5. Source edits: node films.cjs or node films.cjs project/id. It merges provenance for target edits.
6. Physical applications: node composite.cjs. Do not generate again without reviewing the existing prompt, scene and decision record.
7. Run node gallery.cjs and node compare.cjs. Review round-5/index.html before copying it to the parent index.html. Parent round-4.html preserves the previous gallery.
8. Run node document.cjs and node package.cjs after final exports. Download packages exclude frame intermediates.

Production integration remains pending visual selection. Keep project concepts labeled. Preserve original source files and review the repository instructions again before any production edits.
`
);
console.log(JSON.stringify({ projects: 16, pieces: manifest.pieces, types }));
